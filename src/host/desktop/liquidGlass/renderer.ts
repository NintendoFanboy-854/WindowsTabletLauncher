/**
 * Liquid Glass 渲染器（无 UI、无调试信息）。
 *
 * 三趟管线：
 *   ① 几何（低分辨率）—— 距离场 + 按接触角算出的球冠高度场
 *   ② 法线（同一分辨率）—— 对高度场做中心差分
 *   ③ 合成（全分辨率）—— 透镜成像 / 菲涅尔 / 低频环境 / 高光 + 主题底色
 *
 * 质量是自适应的：读 GPU 计时器，按 120fps 的预算定档，输出钉在 60fps。
 * 调用方用 `setImage()` / `setFill()` / `destroy()`。
 */
import { COMP_FRAG, FIELD_FRAG, GEO_FRAG, VERT } from './shaders';

/* ---- 观感常量 ---- */
const BLOB_COUNT = 5;
const BLOB_RADIUS = 0.155;

/** 接触角：80° 是"珠"的形态；50–60° 会更摊、更像屏幕上的水。 */
const CONTACT_DEG = 80;
const CONTACT_RAD = (CONTACT_DEG * Math.PI) / 180;
/** 球冠高度 H = R·tan(θ/2)，和 uRadius 同一单位（屏高） */
const BLOB_HEIGHT = BLOB_RADIUS * Math.tan(CONTACT_RAD / 2);

const MERGE_K = 0.08;

/** 水的折射率；色散相对差约 1%，不再用油膜的 35%。 */
const IOR = 1.333;
const DISPERSION = 0.01;
const FROST_LOD = 0.15;
const SPECULAR = 1.0;
const FILL_ALPHA = 0.3;
const SHADOW = 0.14;
const SPEED = 0.35;
const LOOP_SECONDS = 47;

/** 几何层固定占屏宽的比例：换档时不重建，形状才不会跳 */
const GLASS_SCALE = 0.18;

/** 输出倍率档位（相对 CSS 像素） */
const LEVEL_DPR = [0.7, 0.85, 1.0, 1.25, 1.5];

/** 预算按 120fps（8.3ms）定，留一倍余量，钉在 60 就不会掉 */
const BUDGET_HI = 9.0;
const BUDGET_LO = 6.0;

export interface LiquidGlassHandle {
  setImage(image: HTMLImageElement | null): void;
  /** Fluent 主题底色（sRGB，0..1）：深色偏烟灰、亮色偏乳白 */
  setFill(r: number, g: number, b: number): void;
  resize(): void;
  setPaused(paused: boolean): void;
  destroy(): void;
}

interface Target {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
  w: number;
  h: number;
}

export function createLiquidGlass(canvas: HTMLCanvasElement): LiquidGlassHandle | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });
  if (!gl) {
    return null;
  }

  /* ---------------- 着色器 ---------------- */
  function compile(type: number, src: string): WebGLShader {
    const shader = gl!.createShader(type);
    if (!shader) throw new Error('createShader failed');
    gl!.shaderSource(shader, src);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      throw new Error(String(gl!.getShaderInfoLog(shader)));
    }
    return shader;
  }

  function link(fragSrc: string): WebGLProgram {
    const program = gl!.createProgram();
    if (!program) throw new Error('createProgram failed');
    gl!.attachShader(program, compile(gl!.VERTEX_SHADER, VERT));
    gl!.attachShader(program, compile(gl!.FRAGMENT_SHADER, fragSrc));
    gl!.linkProgram(program);
    if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
      throw new Error(String(gl!.getProgramInfoLog(program)));
    }
    return program;
  }

  let progField: WebGLProgram;
  let progGeo: WebGLProgram;
  let progComp: WebGLProgram;
  try {
    progField = link(FIELD_FRAG);
    progGeo = link(GEO_FRAG);
    progComp = link(COMP_FRAG);
  } catch (error) {
    return null;
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  function uniforms(program: WebGLProgram, names: readonly string[]) {
    const out: Record<string, WebGLUniformLocation | null> = {};
    for (const name of names) out[name] = gl!.getUniformLocation(program, name);
    return out;
  }

  const UF = uniforms(progField, [
    'uRes', 'uNum', 'uMerge', 'uRadius', 'uSinCA', 'uCosCA', 'uPos',
  ]);
  const UG = uniforms(progGeo, ['uD', 'uRes', 'uHeight']);
  const UC = uniforms(progComp, [
    'uGlass', 'uBg', 'uRes', 'uUvScale', 'uUvOffset', 'uShadow', 'uOn',
    'uLod', 'uSpec', 'uFill', 'uFillAlpha', 'uPhase', 'uIOR', 'uDisp',
    'uHeight', 'uEnvTop', 'uEnvBottom', 'uEnvAvg',
  ]);

  /* ---------------- 缓冲 ---------------- */
  const floatOk = Boolean(gl.getExtension('EXT_color_buffer_float'));
  const COLOR_FMT = floatOk ? gl.RGBA16F : gl.RGBA8;
  const COLOR_TYPE = floatOk ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;

  function makeTarget(w: number, h: number, format: number, type: number): Target {
    const tex = gl!.createTexture();
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, format, w, h, 0, gl!.RGBA, type, null);
    const fbo = gl!.createFramebuffer();
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    return { tex, fbo, w, h };
  }

  function disposeTarget(t: Target | null) {
    if (!t) return;
    gl!.deleteTexture(t.tex);
    gl!.deleteFramebuffer(t.fbo);
  }

  const bgTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, bgTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  let bgAspect = 16 / 9;
  let hasImage = false;

  let fieldBuf: Target = makeTarget(2, 2, COLOR_FMT, COLOR_TYPE);
  let glassBuf: Target = makeTarget(2, 2, COLOR_FMT, COLOR_TYPE);

  let glassW = 2;
  let glassH = 2;
  let outW = 2;
  let outH = 2;

  let level = LEVEL_DPR.length - 1;

  function maxLevel(): number {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let best = 0;
    for (let i = 0; i < LEVEL_DPR.length; i += 1) if (LEVEL_DPR[i] <= dpr + 0.001) best = i;
    return best;
  }

  function resize() {
    const cssW = Math.max(1, canvas.clientWidth || window.innerWidth);
    const cssH = Math.max(1, canvas.clientHeight || window.innerHeight);

    const dpr = LEVEL_DPR[level] ?? 1;
    const w = Math.max(2, Math.round(cssW * dpr));
    const h = Math.max(2, Math.round(cssH * dpr));
    if (w !== outW || h !== outH) {
      outW = w;
      outH = h;
      canvas.width = w;
      canvas.height = h;
    }
    const gW = Math.max(2, Math.round(cssW * GLASS_SCALE));
    const gH = Math.max(2, Math.round(cssH * GLASS_SCALE));
    if (gW !== glassW || gH !== glassH) {
      glassW = gW;
      glassH = gH;
      disposeTarget(fieldBuf);
      disposeTarget(glassBuf);
      fieldBuf = makeTarget(gW, gH, COLOR_FMT, COLOR_TYPE);
      glassBuf = makeTarget(gW, gH, COLOR_FMT, COLOR_TYPE);
    }
  }

  /* ---------------- 液滴 ---------------- */
  const pos = new Float32Array(18);
  const vel = new Float32Array(18);
  const tgt = new Float32Array(18);
  let phase = 0;

  /**
   * 主题底色。外层按 Fluent 亮/暗主题传入；默认值只是深色兜底，
   * 纹理到达前或读取失败时用。
   */
  const fill = new Float32Array([0.12, 0.12, 0.12]);

  /**
   * 环境反射色：只保留壁纸的低频颜色，不要细节。
   * 上/下两色让珠子的曲面读得出方向，平均色负责整体色调。
   */
  const envTop = new Float32Array([0.55, 0.62, 0.72]);
  const envBottom = new Float32Array([0.18, 0.18, 0.22]);
  const envAvg = new Float32Array([0.36, 0.38, 0.44]);

  function computeEnvironment(image: HTMLImageElement) {
    try {
      const size = 24;
      const board = document.createElement('canvas');
      board.width = size;
      board.height = size;
      const ctx = board.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      let tr = 0, tg = 0, tb = 0, tn = 0;
      let br = 0, bg = 0, bb = 0, bn = 0;
      let ar = 0, ag = 0, ab = 0, an = 0;
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const i = (y * size + x) * 4;
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          ar += r; ag += g; ab += b; an += 1;
          if (y < size / 2) {
            tr += r; tg += g; tb += b; tn += 1;
          } else {
            br += r; bg += g; bb += b; bn += 1;
          }
        }
      }

      // 上方提亮、下方压暗：环境光本来就有方向，边缘才不会读成一层膜。
      envTop[0] = Math.min(1, (tr / tn) * 1.12 + 0.02);
      envTop[1] = Math.min(1, (tg / tn) * 1.12 + 0.02);
      envTop[2] = Math.min(1, (tb / tn) * 1.12 + 0.02);
      envBottom[0] = Math.max(0, (br / bn) * 0.78);
      envBottom[1] = Math.max(0, (bg / bn) * 0.78);
      envBottom[2] = Math.max(0, (bb / bn) * 0.78);
      envAvg[0] = ar / an;
      envAvg[1] = ag / an;
      envAvg[2] = ab / an;
    } catch {
      /* 跨源或读像素失败：保留深色兜底，不影响玻璃层 */
    }
  }

  function updateBlobs(dt: number) {
    const n = BLOB_COUNT;
    for (let i = 0; i < n; i += 1) {
      const a = i * 2.39996323;
      const w1 = 3 + (i % 3);
      const w2 = 4 + ((i * 2) % 3);
      tgt[i * 2] = 0.55 * Math.sin(phase * w1 + a);
      tgt[i * 2 + 1] = 0.3 * Math.cos(phase * w2 + a * 1.7);
    }
    // 表面张力：靠近的两滴互相拉
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const dx = tgt[j * 2] - tgt[i * 2];
        const dy = tgt[j * 2 + 1] - tgt[i * 2 + 1];
        const dist = Math.hypot(dx, dy) || 1e-6;
        const near = Math.max(0, 1 - dist / (2.6 * BLOB_RADIUS));
        const pull = near * near * 0.012;
        const ux = dx / dist;
        const uy = dy / dist;
        tgt[i * 2] += ux * pull;
        tgt[i * 2 + 1] += uy * pull;
        tgt[j * 2] -= ux * pull;
        tgt[j * 2 + 1] -= uy * pull;
      }
    }
    // 阻尼振子：运动带惯性
    const h = Math.min(dt, 0.05);
    for (let i = 0; i < n; i += 1) {
      const ix = i * 2;
      const iy = ix + 1;
      vel[ix] += ((tgt[ix] - pos[ix]) * 3.0 - vel[ix] * 1.6) * h;
      vel[iy] += ((tgt[iy] - pos[iy]) * 3.0 - vel[iy] * 1.6) * h;
      pos[ix] += vel[ix] * h;
      pos[iy] += vel[iy] * h;
    }
  }

  updateBlobs(0);
  for (let i = 0; i < 18; i += 1) pos[i] = tgt[i];

  /* ---------------- 计时 / 自适应 ---------------- */
  interface TimerExt {
    TIME_ELAPSED_EXT: number;
    GPU_DISJOINT_EXT: number;
  }
  const timerExt = gl.getExtension('EXT_disjoint_timer_query_webgl2') as TimerExt | null;
  let gpuQuery: WebGLQuery | null = null;
  const pending: WebGLQuery[] = [];
  let gpuMs = 8;
  let lastAdjust = 0;
  let justDown = false;

  /* ---------------- 循环 ---------------- */
  let raf = 0;
  let last = performance.now();
  let lastPresent = 0;
  let paused = false;
  let destroyed = false;

  function uvRect() {
    const view = outW / Math.max(1, outH);
    let sx = 1;
    let sy = 1;
    let ox = 0;
    let oy = 0;
    if (bgAspect > view) {
      sx = view / bgAspect;
      ox = (1 - sx) * 0.5;
    } else {
      sy = bgAspect / view;
      oy = (1 - sy) * 0.5;
    }
    return [sx, sy, ox, oy] as const;
  }

  function render(now: number) {
    if (destroyed) return;
    raf = requestAnimationFrame(render);

    if (now - lastPresent < 15.2) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    lastPresent = now;

    if (!paused && !document.hidden) {
      phase += dt * SPEED * ((Math.PI * 2) / LOOP_SECONDS);
      if (phase > Math.PI * 2 * 1000) phase -= Math.PI * 2 * 1000;
      updateBlobs(dt);
    }

    // 纹理没到就什么都不画，画布保持透明（alpha: true），底图照常显示
    if (!hasImage) return;

    const [sx, sy, ox, oy] = uvRect();

    if (timerExt && !gpuQuery) {
      gpuQuery = gl!.createQuery();
      if (gpuQuery) gl!.beginQuery(timerExt.TIME_ELAPSED_EXT, gpuQuery);
    }

    /* ① 几何 */
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fieldBuf.fbo);
    gl!.viewport(0, 0, glassW, glassH);
    gl!.useProgram(progField);
    gl!.uniform2f(UF.uRes, glassW, glassH);
    gl!.uniform1i(UF.uNum, BLOB_COUNT);
    gl!.uniform1f(UF.uMerge, MERGE_K);
    gl!.uniform1f(UF.uRadius, BLOB_RADIUS);
    gl!.uniform1f(UF.uSinCA, Math.sin(CONTACT_RAD));
    gl!.uniform1f(UF.uCosCA, Math.cos(CONTACT_RAD));
    gl!.uniform2fv(UF.uPos, pos);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    /* ② 法线 */
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, glassBuf.fbo);
    gl!.viewport(0, 0, glassW, glassH);
    gl!.useProgram(progGeo);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, fieldBuf.tex);
    gl!.uniform1i(UG.uD, 0);
    gl!.uniform2f(UG.uRes, glassW, glassH);
    gl!.uniform1f(UG.uHeight, BLOB_HEIGHT);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);

    /* ③ 合成 */
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.viewport(0, 0, outW, outH);
    gl!.useProgram(progComp);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, bgTex);
    gl!.uniform1i(UC.uBg, 1);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, glassBuf.tex);
    gl!.uniform1i(UC.uGlass, 0);
    gl!.uniform2f(UC.uRes, outW, outH);
    gl!.uniform2f(UC.uUvScale, sx, sy);
    gl!.uniform2f(UC.uUvOffset, ox, oy);
    gl!.uniform1f(UC.uShadow, SHADOW);
    gl!.uniform1f(UC.uOn, 1);
    gl!.uniform1f(UC.uLod, FROST_LOD);
    gl!.uniform1f(UC.uSpec, SPECULAR);
    gl!.uniform1f(UC.uFillAlpha, FILL_ALPHA);
    gl!.uniform1f(UC.uPhase, phase);
    gl!.uniform1f(UC.uIOR, IOR);
    gl!.uniform1f(UC.uDisp, DISPERSION);
    gl!.uniform1f(UC.uHeight, BLOB_HEIGHT);
    gl!.uniform3fv(UC.uFill, fill);
    gl!.uniform3fv(UC.uEnvTop, envTop);
    gl!.uniform3fv(UC.uEnvBottom, envBottom);
    gl!.uniform3fv(UC.uEnvAvg, envAvg);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);


    /* 计时结算 */
    if (timerExt && gpuQuery) {
      gl!.endQuery(timerExt.TIME_ELAPSED_EXT);
      pending.push(gpuQuery);
      gpuQuery = null;
    }
    if (timerExt) {
      while (pending.length) {
        const q = pending[0];
        if (!gl!.getQueryParameter(q, gl!.QUERY_RESULT_AVAILABLE)) break;
        if (!gl!.getParameter(timerExt.GPU_DISJOINT_EXT)) {
          const ns = gl!.getQueryParameter(q, gl!.QUERY_RESULT) as number;
          gpuMs = gpuMs * 0.88 + (ns / 1e6) * 0.12;
        }
        gl!.deleteQuery(q);
        pending.shift();
      }
      while (pending.length > 8) {
        const stale = pending.shift();
        if (stale) gl!.deleteQuery(stale);
      }
    } else {
      gpuMs = gpuMs * 0.95 + Math.min(dt * 1000, 33) * 0.05;
    }

    // 控制器：降档快、升档慢
    if (now - lastAdjust > (justDown ? 1500 : 6000) && now > 4000) {
      if (gpuMs > BUDGET_HI && level > 0) {
        level -= 1;
        resize();
        lastAdjust = now;
        justDown = true;
      } else if (gpuMs < BUDGET_LO && level < maxLevel()) {
        level += 1;
        resize();
        lastAdjust = now;
        justDown = false;
      }
    }
  }

  /* ---------------- 对外 ---------------- */
  function setImage(image: HTMLImageElement | null) {
    if (!image || !image.width || !image.height) {
      hasImage = false;
      return;
    }
    bgAspect = image.width / image.height;
    gl!.bindTexture(gl!.TEXTURE_2D, bgTex);
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA8, gl!.RGBA, gl!.UNSIGNED_BYTE, image);
    gl!.generateMipmap(gl!.TEXTURE_2D);
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false);
    computeEnvironment(image);
    hasImage = true;
  }

  level = maxLevel();
  resize();
  raf = requestAnimationFrame(render);

  return {
    setImage,
    setFill(r: number, g: number, b: number) {
      fill[0] = r;
      fill[1] = g;
      fill[2] = b;
    },
    resize,
    setPaused(next: boolean) {
      paused = next;
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      disposeTarget(fieldBuf);
      disposeTarget(glassBuf);
      gl!.deleteTexture(bgTex);
      gl!.deleteProgram(progField);
      gl!.deleteProgram(progGeo);
      gl!.deleteProgram(progComp);
      gl!.deleteBuffer(quad);
    },
  };
}

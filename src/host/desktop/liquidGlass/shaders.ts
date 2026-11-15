/**
 * Liquid Glass 的着色器源码。
 *
 * 与 `demo/liquid-glass/index.html` 同一套：几何层算距离场与法线，
 * 合成层在全分辨率上用清晰的底图做折射、菲涅尔、倒角高光。
 *
 * 为什么单独放一个文件：这几段是纯 GLSL，没有 React 依赖，
 * 和渲染器分开容易对照，也方便以后替换。
 */
export const VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

/**
 * 几何层：把液滴拼成一张距离场。
 *
 * 纯解析 —— 位置由 CPU 每帧算好传进来，这里只做并集和平滑最大厚度，
 * 不读背景、不做流场输运、没有历史状态。
 *
 *   r        smin 并集的距离场（轮廓）
 *   g        平滑最大的体厚（决定倒角落在哪里）
 */
export const FIELD_FRAG = `#version 300 es
precision highp float;

out vec4 outColor;

uniform vec2  uRes;
uniform int   uNum;
uniform float uMerge;
uniform float uRadius;
uniform vec2  uPos[9];

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  float d = 1e9;
  float inside = 0.0;

  for (int i = 0; i < 9; i++) {
    if (i >= uNum) break;
    float di = length(p - uPos[i]) - uRadius;
    d = smin(d, di, uMerge);

    // 平滑最大：融合处两滴都贡献厚度，倒角只出现在真正的轮廓上
    float v = uRadius - (di + uRadius);
    float h = max(0.10 - abs(inside - v), 0.0) / 0.10;
    inside = max(inside, v) + h * h * 0.10 * 0.25;
  }

  // 液丝：两滴快要分开时先拉出一根细颈，超过 2.7R 才断
  for (int i = 0; i < 9; i++) {
    if (i >= uNum) break;
    for (int j = i + 1; j < 9; j++) {
      if (j >= uNum) break;
      float dist = length(uPos[j] - uPos[i]);
      float w = smoothstep(2.7 * uRadius, 2.0 * uRadius, dist);
      if (w > 0.002) {
        d = min(d, sdSeg(p, uPos[i], uPos[j]) - uRadius * 0.13 * w);
      }
    }
  }

  outColor = vec4(d, inside, 0.0, 1.0);
}`;

export const GEO_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;

out vec4 outColor;

uniform sampler2D uD;
uniform vec2      uRes;

void main() {
  vec2  uv = gl_FragCoord.xy / uRes;
  vec2  tx = 1.0 / uRes;

  vec4  s  = texture(uD, uv);
  float d  = s.r;
  float dx = texture(uD, uv + vec2(tx.x, 0.0)).r - texture(uD, uv - vec2(tx.x, 0.0)).r;
  float dy = texture(uD, uv + vec2(0.0, tx.y)).r - texture(uD, uv - vec2(0.0, tx.y)).r;

  vec2  g  = vec2(dx, dy) * uRes.y * 0.5;
  float gl = length(g);
  vec2  n2 = g / sqrt(gl * gl + 0.012);

  // alpha 带出这一像素属于哪一滴的"深度"，给合成做景深
  outColor = vec4(n2 * 0.5 + 0.5, clamp(d / 0.25, -1.0, 1.0) * 0.5 + 0.5, s.g);
}`;

export const COMP_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;

out vec4 outColor;

uniform sampler2D uGlass;
uniform sampler2D uBg;
uniform vec2      uRes;
uniform vec2      uUvScale;
uniform vec2      uUvOffset;
uniform float     uShadow;
uniform float     uOn;
uniform float     uRadius;
uniform float     uRefract;
uniform float     uDisp;
uniform float     uLod;
uniform float     uSpec;
uniform float     uTint;
uniform float     uPhase;

// Liquid Glass 的材质模型：
// 平面玻璃板 + 一圈倒角。中间是平的（法线朝你，几乎不折射），
// 只在倒角上产生折射、菲涅尔和高光 —— 这就是它看起来像"厚玻璃边缘"的原因。
void main() {
  vec2 uv  = gl_FragCoord.xy / uRes;
  vec2 tUv = uv * uUvScale + uUvOffset;
  vec2 p   = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  vec4  gbuf = texture(uGlass, uv);
  vec2  n2   = gbuf.rg * 2.0 - 1.0;
  float d    = (gbuf.b * 2.0 - 1.0) * 0.25;

  float aa   = 1.5 / uRes.y;
  float mask = (1.0 - smoothstep(-aa, aa, d)) * uOn;

  vec3 bg = textureLod(uBg, tUv, 0.0).rgb;

  // 光源在一条固定仰角的圆轨道上匀速绕行。两个不同频率会得到"乱走"，
  // 那不是光源，是闪烁。
  const float ELEV = 0.72;
  vec3 L = normalize(vec3(cos(uPhase * 0.09) * 0.69,
                          sin(uPhase * 0.09) * 0.69,
                          ELEV));

  // 体积阴影：玻璃把身后的光吃掉一部分，厚的偏绿（钠钙玻璃）
  if (uShadow > 0.001 && mask < 0.999) {
    vec2  suv = uv - L.xy * 0.018;
    float ds  = (texture(uGlass, suv).b * 2.0 - 1.0) * 0.25;
    float sh  = (1.0 - smoothstep(-0.005, 0.085, ds)) * (1.0 - mask);
    bg *= exp(-vec3(0.55, 0.16, 0.40) * sh * uShadow * 2.2);
  }

  if (mask > 0.001) {
    // ---- 单层液体 ----------------------------------------------------
    // 所有液滴共面。融合之后不是"两颗叠在一起"，而是同一个体变厚了，
    // 光线只穿一次。厚度用平滑最大算，它决定倒角落在哪里：
    // 脖子处两滴都贡献厚度 → 依然是厚的 → 不出倒角 → 读起来是一体。
    // 体厚直接读几何缓冲（低分辨率算好、双线性放大），不用在全分辨率上重算
    float inside = gbuf.a;

    // ---- 倒角剖面 ----------------------------------------------------
    // dd: 0 在轮廓线上，1 在倒角内侧边缘。hh 是四分之一圆的高度。
    float b  = max(uRadius * 0.34, 0.010);
    float dd = clamp(inside / b, 0.0, 1.0);
    float t  = 1.0 - dd;
    float hh = sqrt(max(1.0 - t * t, 0.0));

    // 表面法线：平面处 (0,0,1)，倒角上向外倾斜
    vec3 N = normalize(vec3(n2 * (t / max(hh, 0.06)), 1.0));

    // ---- 折射 --------------------------------------------------------
    // 只有倒角会偏折光线；中间是平面，背景原样透过来。
    // 景深：越"远"的那一滴，内部越糊、越暗
    // 所有液滴共面，没有前后可言：一次折射，不叠后层
    vec2  off = N.xy * uRefract;
    float lod = uLod;

    float r  = textureLod(uBg, tUv + off * (1.0 + uDisp * 0.42), lod).r;
    float gg = textureLod(uBg, tUv + off, lod).g;
    float bb = textureLod(uBg, tUv + off * (1.0 - uDisp * 0.42), lod).b;
    vec3 trans = vec3(r, gg, bb);

    // 厚的地方吸得多一点（比尔-朗伯）
    trans *= exp(-vec3(0.22, 0.06, 0.18) * max(inside, 0.0) / max(uRadius, 1e-3) * 0.9);

    // ---- 自适应色调 --------------------------------------------------
    // 材质把周围环境的颜色吸一点进来，这正是指南里说的
    // "translucent elements that adapt to their environment"
    vec3 env = textureLod(uBg, tUv, 6.0).rgb;
    trans = mix(trans, trans * env * 1.7, uTint * 0.55);

    // ---- 菲涅尔 + 环境反射 -------------------------------------------
    // 平面处 F ≈ 0.04（几乎全透），倒角处 F → 1（像镜面）
    float F = 0.04 + 0.96 * pow(1.0 - clamp(N.z, 0.0, 1.0), 5.0);
    // 屏幕空间反射：采样上一帧的画面，所以倒角能照出旁边的另一滴玻璃
    vec3 refl = textureLod(uBg, tUv + N.xy * 0.09, lod + 1.5).rgb;

    // ---- 倒角高光 ----------------------------------------------------
    // 指数不能太高：倒角法线是绕着形状转的，太紧就只剩一个点，应该是一段弧。
    // 高光按 ndl 自己的菲涅尔加权 —— 掠射进来的光反射率更高，这是能量守恒。
    float ndl  = max(dot(N, L), 0.0);
    float Fspec = 0.04 + 0.96 * pow(1.0 - ndl, 5.0);
    float spec = pow(ndl, 48.0);

    vec3 col = mix(trans, refl, F);
    col += spec * Fspec * uSpec * 18.0;   // 18 是光源辐亮度，不是作弊

    bg = mix(bg, col, mask);
  }

  outColor = vec4(bg, 1.0);

  // 抖动，避免 8 位量化在暗部起条带
  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  outColor.rgb += (ign - 0.5) * (1.0 / 255.0);
}`;

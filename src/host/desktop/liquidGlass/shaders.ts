/**
 * Liquid Glass 的着色器源码。
 *
 * 与 `demo/liquid-glass/index.html` 的旧版不同：这里已经是球冠高度场 + 透镜成像，
 * 不再是"平面玻璃板 + 倒角"。三段纯 GLSL，没有 React 依赖。
 */
export const VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

/**
 * 几何层：距离场 → 球冠高度场。
 *
 *   r        smin 并集的距离场（轮廓，用于遮罩和接触阴影）
 *   g        球冠高度，归一化到 0..1（顶点 1，接触线 0）
 *
 * 高度不是距离场的线性映射，而是把"到接触线的归一化距离" u 过一个
 * 球冠剖面：h = cap(u)。这样接触线、遮罩、高度场三者严格一致，
 * 合并处的颈也自动是液体，而不是 SDF 的锥。
 */
export const FIELD_FRAG = `#version 300 es
precision highp float;

out vec4 outColor;

uniform vec2  uRes;
uniform int   uNum;
uniform float uMerge;
uniform float uRadius;
uniform float uSinCA;
uniform float uCosCA;
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

// u=1 顶点，u=0 接触线。斜率在接触线处正好是 tanθ。
float capFromU(float u) {
  float q = 1.0 - clamp(u, 0.0, 1.0);
  float s = uSinCA;
  return (sqrt(max(1.0 - q * q * s * s, 0.0)) - uCosCA) / (1.0 - uCosCA);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  float d = 1e9;

  for (int i = 0; i < 9; i++) {
    if (i >= uNum) break;
    float di = length(p - uPos[i]) - uRadius;
    d = smin(d, di, uMerge);
  }

  // 液丝：两滴快要分开时先拉出一根细颈。它同时也进入高度场，
  // 所以颈是低矮的液体桥，不是一张平的膜。
  for (int i = 0; i < 9; i++) {
    if (i >= uNum) break;
    for (int j = i + 1; j < 9; j++) {
      if (j >= uNum) break;
      float dist = length(uPos[j] - uPos[i]);
      float w = 1.0 - smoothstep(2.0 * uRadius, 2.7 * uRadius, dist);
      if (w > 0.002) {
        float ds = sdSeg(p, uPos[i], uPos[j]);
        d = min(d, ds - uRadius * 0.12 * w);
      }
    }
  }

  float u = clamp(-d / uRadius, 0.0, 1.0);
  outColor = vec4(d, capFromU(u), 0.0, 1.0);
}`;

/**
 * 法线层：对高度场做中心差分。
 *
 * p 的单位是屏高，所以梯度要乘绝对冠高 uHeight；法线朝外，
 * 因此是 normalize(vec3(-grad, 1))。
 */
export const GEO_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;

out vec4 outColor;

uniform sampler2D uD;
uniform vec2      uRes;
uniform float     uHeight;

void main() {
  vec2  uv = gl_FragCoord.xy / uRes;
  vec2  tx = 1.0 / uRes;

  vec4  s  = texture(uD, uv);
  float d  = s.r;
  float h  = s.g;
  float hx = texture(uD, uv + vec2(tx.x, 0.0)).g - texture(uD, uv - vec2(tx.x, 0.0)).g;
  float hy = texture(uD, uv + vec2(0.0, tx.y)).g - texture(uD, uv - vec2(0.0, tx.y)).g;

  vec2  g  = vec2(hx, hy) * uRes.y * 0.5 * uHeight;
  vec3  N  = normalize(vec3(-g, 1.0));

  outColor = vec4(N.xy * 0.5 + 0.5, clamp(d / 0.25, -1.0, 1.0) * 0.5 + 0.5, h);
}`;

/**
 * 合成层：液滴当成一块凸透镜。
 *
 * 视线竖直向下，在球冠表面折射后打到 z=0 的壁纸：
 *   Q = P + d1 * h / (-d1.z)
 * 接触线处 h=0，所以折射位移自然归零；中心 h 最大但法线竖直，位移也是 0。
 * 位移在 q≈0.7–0.8 最大，边缘被压缩成一条窄环——这就是"包边"。
 *
 * 反射只取壁纸的低频颜色 + 上下渐变，不采样平移的壁纸，避免第二层。
 */
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
uniform float     uLod;
uniform float     uSpec;
uniform float     uFillAlpha;
uniform float     uPhase;
uniform float     uIOR;
uniform float     uDisp;
uniform float     uHeight;
uniform vec3      uFill;
uniform vec3      uEnvTop;
uniform vec3      uEnvBottom;
uniform vec3      uEnvAvg;

void main() {
  vec2 uv  = gl_FragCoord.xy / uRes;
  vec2 tUv = uv * uUvScale + uUvOffset;

  vec4  gbuf = texture(uGlass, uv);
  vec2  nxy  = gbuf.rg * 2.0 - 1.0;
  float d    = (gbuf.b * 2.0 - 1.0) * 0.25;
  float hn   = gbuf.a;
  vec3  N    = vec3(nxy, sqrt(max(1.0 - dot(nxy, nxy), 0.0)));

  float aa   = 1.5 / uRes.y;
  float mask = (1.0 - smoothstep(-aa, aa, d)) * uOn;

  vec3 bg = textureLod(uBg, tUv, 0.0).rgb;

  // 光源在一条固定仰角的圆轨道上匀速绕行；两个频率会得到"乱走"。
  const float ELEV = 0.72;
  vec3 L = normalize(vec3(cos(uPhase * 0.09) * 0.69,
                          sin(uPhase * 0.09) * 0.69,
                          ELEV));

  // 接触阴影：用高度场，落在光的反方向。水珠的阴影是中性灰，不是绿色。
  if (uShadow > 0.001 && mask < 0.999) {
    vec2  suv = uv - L.xy * 0.012;
    float hs  = texture(uGlass, suv).a;
    float sh  = smoothstep(0.0, 0.45, hs) * (1.0 - mask);
    bg *= exp(-vec3(0.55, 0.55, 0.60) * sh * uShadow * 1.8);
  }

  if (mask > 0.001) {
    // ---- 透镜成像 ----------------------------------------------------
    // 从像素沿视线向下，在表面折射，打到衬底 z=0。
    // 所有液滴共面，所以只追一次；没有后层可叠。
    vec3  I      = vec3(0.0, 0.0, -1.0);
    vec3  T      = refract(I, N, 1.0 / uIOR);
    float hAbs   = hn * uHeight;
    float tHit   = hAbs / max(-T.z, 1e-4);
    vec2  dp     = T.xy * tHit;
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2  duv    = vec2(dp.x / aspect, dp.y) * uUvScale;

    // 边缘压缩得最厉害，LOD 拉高一点，既避免锯齿也像厚边的散焦。
    float lod = uLod + (1.0 - N.z) * 1.2;

    // 水的色散很小：n 从 1.331 到 1.344，相对差 ~1%。
    float disp = uDisp;
    vec3 trans;
    trans.r = textureLod(uBg, tUv + duv * (1.0 + disp), lod).r;
    trans.g = textureLod(uBg, tUv + duv, lod).g;
    trans.b = textureLod(uBg, tUv + duv * (1.0 - disp), lod).b;

    // 毫米级水珠在可见光下几乎不吸收；只留一丝冷色让体积读得出来。
    trans *= exp(-vec3(0.035, 0.012, 0.045) * hn);

    // ---- 主题底色 ----------------------------------------------------
    // 跟着 Fluent 的 --colorNeutralBackground1 走：暗色烟灰、亮色乳白。
    trans = mix(trans, uFill, clamp(hn, 0.0, 1.0) * uFillAlpha);

    // ---- 菲涅尔 ------------------------------------------------------
    // 水的 F0 = 0.02；接触线处 N.z 很小，反射率升到 ~0.40。
    float F = 0.02 + 0.98 * pow(1.0 - clamp(N.z, 0.0, 1.0), 5.0);

    // ---- 环境反射 ----------------------------------------------------
    // 只取低频：壁纸上下半球的平均色 + 5 级 mip 的局部色。
    // 不采样平移后的清晰壁纸，所以不会出现"第二层"。
    vec3  R   = 2.0 * N.z * N - vec3(0.0, 0.0, 1.0);
    float gy  = clamp(0.5 + 0.5 * R.z, 0.0, 1.0);
    vec3  env = mix(uEnvBottom, uEnvTop, gy);
    env = mix(env, uEnvAvg, 0.18);
    vec3  local = textureLod(uBg, tUv, 5.0).rgb;
    env = mix(env, local, 0.35);

    // ---- 高光 --------------------------------------------------------
    // 曲面把光聚成一个小点；指数要够高，否则又变成一圈亮边。
    float ndl  = max(dot(N, L), 0.0);
    float spec = pow(ndl, 256.0);

    vec3 col = trans * (1.0 - F) + env * F;
    col += spec * (0.02 + 0.98 * pow(1.0 - ndl, 5.0)) * uSpec * 12.0;

    // ---- 接触线 ------------------------------------------------------
    // 最后 ~1% 半径压暗一点，把珠子"按"在壁纸上。
    col *= mix(0.84, 1.0, smoothstep(0.0, 0.05, hn));

    bg = mix(bg, col, mask);
  }

  outColor = vec4(bg, 1.0);

  // 抖动，避免 8 位量化在暗部起条带
  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  outColor.rgb += (ign - 0.5) * (1.0 / 255.0);
}`;

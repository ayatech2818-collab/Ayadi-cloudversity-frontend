/*
 * The hero's shaders.
 *
 * Colours are written in display (sRGB) values and output as they are: no
 * material here includes three's colour-space or tone-mapping chunks, and the
 * liquid pass's render target is plain RGBA8, so what a shader writes is what
 * reaches the screen — through the post pass or not.
 *
 * Palette (from globals.css and the mark itself):
 *   page #f8faf9 · mark lime #8dc63f · brand green #16a34a · emerald #10b981
 *   teal #2dd4bf / #0d9488 · deep space #031210 → #0b3029
 */

const NOISE = /* glsl */ `
  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
`;

/* ---------- full-screen passes (backdrop, liquid) ---------- */

export const SCREEN_VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/* Three skies in one: the light page the hero opens on, deep green space,
   and the bright far side of the portal. The opening also carries the AYADI
   watermark — drawn here, in the background, so the 3D mark stands in front
   of it. Its box, tint and fade mirror .watermark in hero.module.css. */
export const BACKDROP_FRAGMENT = /* glsl */ `
  uniform float uDark;
  uniform float uWorld;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uGlow;
  uniform vec2 uPointer;
  uniform sampler2D uWatermark;
  uniform vec4 uWatermarkRect;
  uniform float uWatermarkAlpha;

  varying vec2 vUv;

  ${NOISE}

  void main() {
    vec2 ndc = vUv * 2.0 - 1.0;
    vec2 p = ndc * vec2(uAspect, 1.0);

    // The opening: the page colour, with a soft mint wash round the mark.
    vec3 page = vec3(0.973, 0.980, 0.976);
    vec3 mint = vec3(0.874, 0.950, 0.905);
    float wash = 1.0 - smoothstep(0.0, 1.1, length((ndc - uGlow) * vec2(uAspect, 1.0)));
    vec3 light = mix(page, mint, wash * 0.8);

    // The watermark: uWatermarkRect is its centre and half-size in NDC.
    vec2 wm = (ndc - uWatermarkRect.xy) / uWatermarkRect.zw * 0.5 + 0.5;
    float inside = step(0.0, wm.x) * step(wm.x, 1.0) * step(0.0, wm.y) * step(wm.y, 1.0);
    float ink = texture2D(uWatermark, clamp(wm, 0.0, 1.0)).a * inside;
    vec3 tint = mix(vec3(0.086, 0.639, 0.29), vec3(0.051, 0.58, 0.533), wm.x);
    float fade = mix(0.45, 1.0, smoothstep(0.15, 0.85, wm.y));
    light = mix(light, tint, ink * fade * uWatermarkAlpha * 0.075);

    // Deep space: brighter towards the middle, a slow nebula drifting through.
    vec2 c = p - uPointer * 0.06;
    float r = length(c);
    vec3 deep = mix(vec3(0.043, 0.188, 0.161), vec3(0.008, 0.043, 0.037), smoothstep(0.0, 1.4, r));
    float n = vnoise(c * 1.6 + vec2(uTime * 0.012, -uTime * 0.008)) * 0.65
            + vnoise(c * 3.8 - vec2(uTime * 0.02, 0.0)) * 0.35;
    deep += vec3(0.02, 0.1, 0.085) * smoothstep(0.45, 0.9, n) * (1.0 - smoothstep(0.1, 1.4, r));

    // The far side: an airy sky over a bright horizon.
    float h = vUv.y - 0.5;
    vec3 sky = mix(vec3(0.992, 1.0, 0.996), vec3(0.906, 0.961, 0.937), smoothstep(0.0, 0.55, h));
    sky = mix(sky, vec3(0.93, 0.967, 0.95), 1.0 - smoothstep(-0.5, 0.0, h));
    sky = mix(sky, vec3(0.84, 0.95, 0.9), (1.0 - smoothstep(0.0, 0.9, length(p - vec2(0.0, 0.05)))) * 0.22);

    vec3 col = mix(light, deep, uDark);
    col = mix(col, sky, uWorld);
    col += (hash21(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* The crossing. The scene arrives as a texture and leaves as liquid glass:
   flowing refraction, ripples round the centre, and the membrane's edge
   sweeping outwards past the lens. uDistortion is 0 everywhere else, and the
   pass is skipped entirely when it is. */
export const LIQUID_FRAGMENT = /* glsl */ `
  uniform sampler2D uScene;
  uniform float uDistortion;
  uniform float uCrossing;
  uniform float uTime;
  uniform float uAspect;

  varying vec2 vUv;

  ${NOISE}

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float r = length(p);
    vec2 dir = p / max(r, 0.0001);

    float n1 = vnoise(p * 2.6 + vec2(uTime * 0.35, -uTime * 0.22));
    float n2 = vnoise(p * 4.1 - vec2(uTime * 0.27, uTime * 0.31) + n1 * 1.7);
    vec2 flow = vec2(n1, n2) - 0.5;

    float waves = sin(r * 34.0 - uTime * 6.0) * exp(-r * 1.6);
    float membrane = exp(-pow((r - uCrossing * 1.9) * 5.5, 2.0));

    float d = uDistortion;
    vec2 offset = (flow * 0.16 + dir * waves * 0.018 + dir * membrane * 0.07) * d;
    offset.x /= uAspect;
    vec2 split = dir * 0.012 * d / vec2(uAspect, 1.0);

    vec3 col;
    col.r = texture2D(uScene, vUv + offset + split).r;
    col.g = texture2D(uScene, vUv + offset).g;
    col.b = texture2D(uScene, vUv + offset - split).b;

    float caustic = pow(1.0 - abs(n2 - 0.5) * 2.0, 8.0);
    col += vec3(0.75, 1.0, 0.9) * caustic * 0.35 * d;
    col += vec3(0.6, 1.0, 0.85) * membrane * 0.22 * d;
    col = mix(col, col * vec3(0.8, 1.0, 0.96) + vec3(0.02, 0.08, 0.07), 0.45 * d);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ---------- the mark ---------- */

export const LOGO_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vObjectNormal;
  varying vec3 vView;
  varying float vY;

  void main() {
    vObjectNormal = normal;
    vY = position.y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

/* Lit lime faces, deep green sides, a teal rim that strengthens in space. */
export const LOGO_FRAGMENT = /* glsl */ `
  uniform vec3 uKey;
  uniform float uGlow;
  uniform float uFade;
  uniform float uDark;

  varying vec3 vNormal;
  varying vec3 vObjectNormal;
  varying vec3 vView;
  varying float vY;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    vec3 L = normalize(uKey);

    float face = smoothstep(0.55, 0.92, abs(vObjectNormal.z));
    vec3 lime = vec3(0.553, 0.776, 0.247);
    vec3 faceColour = mix(vec3(0.34, 0.62, 0.15), lime, smoothstep(-1.0, 1.0, vY));
    vec3 base = mix(vec3(0.13, 0.36, 0.11), faceColour, face);

    float diffuse = max(dot(N, L), 0.0);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 48.0);
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);

    vec3 col = base * (0.45 + 0.7 * diffuse);
    col += vec3(1.0) * spec * 0.32;
    col += vec3(0.35, 0.95, 0.75) * rim * (0.2 + 0.45 * uDark);
    col += lime * uGlow * 0.5;

    gl_FragColor = vec4(col, uFade);
  }
`;

/* ---------- the wordmark ----------
   AYADI and CLOUDVERSITY, in the brand's own ink (#17221a). Seen head-on the
   face is that colour and nothing else; the depth lives in the bevels and
   sides — a soft satin highlight, a faint cool rim — so it reads as a
   machined plate rather than as a flat logo, and never as chrome.

   It dissolves into the mark: letters farthest from it go first, the edge
   travelling in toward it and catching a little of its green as it passes,
   so the lockup gathers into its symbol rather than simply fading. */

export const WORDMARK_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vObjectNormal;
  varying vec3 vView;
  varying vec2 vXY;

  void main() {
    vObjectNormal = normal;
    vXY = position.xy;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

export const WORDMARK_FRAGMENT = /* glsl */ `
  uniform vec3 uKey;
  uniform float uFade;
  uniform float uWord;
  uniform vec2 uCentre;
  uniform float uReach;

  varying vec3 vNormal;
  varying vec3 vObjectNormal;
  varying vec3 vView;
  varying vec2 vXY;

  const float SOFT = 0.9;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    vec3 L = normalize(uKey);

    vec3 ink = vec3(0.090, 0.133, 0.102);
    vec3 side = vec3(0.19, 0.25, 0.21);
    float face = smoothstep(0.55, 0.92, abs(vObjectNormal.z));
    vec3 base = mix(side, ink, face);

    float diffuse = max(dot(N, L), 0.0);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 26.0);
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.5);

    vec3 col = base * (0.74 + 0.36 * diffuse);
    col += vec3(0.86, 1.0, 0.92) * spec * 0.22 * (1.0 - 0.75 * face);
    col += vec3(0.55, 0.85, 0.62) * rim * 0.14;

    float d = distance(vXY, uCentre);
    float alpha = clamp((uWord * (uReach + SOFT) - d) / SOFT, 0.0, 1.0);
    float edge = alpha * (1.0 - alpha) * 4.0;
    col += vec3(0.553, 0.776, 0.247) * edge * 0.35 * (1.0 - uWord);

    gl_FragColor = vec4(col, alpha * uFade);
  }
`;

/* ---------- the globe ---------- */

export const SHELL_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

/* Dark glass: clear enough in the middle for the core to show, lit at the rim. */
export const BODY_FRAGMENT = /* glsl */ `
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.5);
    float lit = smoothstep(-0.2, 1.0, dot(N, normalize(vec3(-0.5, 0.6, 0.6))));

    vec3 col = vec3(0.02, 0.1, 0.085) + vec3(0.03, 0.15, 0.12) * lit + vec3(0.3, 0.9, 0.72) * fresnel * 0.9;
    gl_FragColor = vec4(col, (0.34 + 0.6 * fresnel) * uOpacity);
  }
`;

/* Back faces of a larger sphere, bright just outside the globe's edge. */
export const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform float uOpacity;

  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float g = -dot(normalize(vNormal), normalize(vView));
    float glow = smoothstep(0.0, 0.62, g) * (1.0 - smoothstep(0.62, 0.95, g));
    gl_FragColor = vec4(vec3(0.2, 0.85, 0.66), glow * glow * 0.55 * uOpacity);
  }
`;

/*
 * The lattice: the globe's rings and meridians, and the portal they become.
 *
 * Globe → portal is one continuous move per vertex:
 *   1. the whole globe tips 90° to face its pole at the camera, so the
 *      latitude rings stand upright one behind another and the meridians
 *      point into depth — a sphere seen down its axis already reads as a
 *      tunnel;
 *   2. each ring squares off into a rounded frame and each meridian
 *      straightens into a rail along the tunnel.
 * Loops start their move a little apart (aLoop.z) so it ripples outwards.
 */
export const LATTICE_VERTEX = /* glsl */ `
  attribute float aT;
  attribute vec2 aSide;
  attribute vec3 aLoop;

  uniform float uRadius;
  uniform float uGlobe;
  uniform float uMorph;
  uniform float uSpin;
  uniform float uTime;
  uniform float uWidth;
  uniform float uSurface;
  uniform vec2 uFrame;
  uniform float uExp;
  uniform float uDepth;

  varying float vAlpha;
  varying float vShade;
  varying float vSpark;

  const float TAU = 6.2831853;

  vec2 squircle(float a) {
    float c = cos(a);
    float s = sin(a);
    float e = 2.0 / uExp;
    return vec2(sign(c) * pow(abs(c), e), sign(s) * pow(abs(s), e)) * uFrame;
  }

  void main() {
    float kind = aLoop.x;
    float angle = aLoop.y;
    float stagger = aLoop.z;
    float t = aT * TAU;

    float m = smoothstep(stagger * 0.3, stagger * 0.3 + 0.7, uMorph);
    float tip = smoothstep(0.0, 0.65, m);
    float square = smoothstep(0.3, 1.0, m);

    vec3 globe;
    vec3 side;
    vec3 portal;
    float height;
    float railFade = 1.0;

    if (kind < 0.5) {
      // A latitude ring, turned with the globe.
      float th = t - uSpin;
      float r = uRadius * cos(angle);
      height = sin(angle);
      globe = vec3(r * cos(th), uRadius * height, r * sin(th));
      side = vec3(cos(th), 0.0, sin(th)) * aSide.x + vec3(0.0, aSide.y, 0.0);
      portal = vec3(squircle(th) * (1.0 - 0.24 * height), -uDepth * height);
    } else {
      // A meridian: a full great circle through both poles.
      float lon = angle - uSpin;
      height = sin(t);
      vec3 radial = vec3(cos(t) * cos(lon), height, cos(t) * sin(lon));
      globe = radial * uRadius;
      side = radial * aSide.x + vec3(-sin(lon), 0.0, cos(lon)) * aSide.y;
      float across = clamp(cos(t) * 6.0, -1.0, 1.0);
      portal = vec3(squircle(lon) * across * (1.0 - 0.24 * height), -uDepth * height);
      // Where a rail doubles back through the middle, hide it.
      railFade = smoothstep(0.12, 0.35, abs(cos(t)));
    }

    // 1. Tip the globe: (x, y, z) -> (x, z, -y), north pole away from camera.
    float a = -1.5707963 * tip;
    float ca = cos(a);
    float sa = sin(a);
    vec3 tipped = vec3(globe.x, globe.y * ca - globe.z * sa, globe.y * sa + globe.z * ca);
    vec3 sideTipped = vec3(side.x, side.y * ca - side.z * sa, side.y * sa + side.z * ca);

    // 2. Square off.
    vec3 centre = mix(tipped, portal, square);
    float front = 1.0 - abs(height);
    float width = uWidth * (1.0 + square * (kind < 0.5 ? 1.4 * front : 0.0));
    vec4 world = modelMatrix * vec4(centre + sideTipped * width, 1.0);

    // Drawing in, loop by loop.
    float draw = smoothstep(0.0, 0.06, uGlobe * 1.4 - stagger * 0.3 - aT);

    // On the globe, the far side shows faintly through the glass.
    vec3 toCamera = normalize(cameraPosition - world.xyz);
    float facing = dot(normalize(tipped), toCamera);
    float depthCue = mix(mix(0.18, 1.0, smoothstep(-0.3, 0.25, facing)), 1.0, square);

    // Behind the liquid surface (from wherever the camera is), dimmed.
    float behind = step(world.z * cameraPosition.z, 0.0);
    float glass = 1.0 - behind * uSurface * 0.7;

    // Never a thick bright bar across the lens on the way through.
    float clearance = smoothstep(0.1, 0.9, distance(cameraPosition, world.xyz));

    float emphasis = kind < 0.5 ? mix(0.75, 1.0, front) : 0.6;
    emphasis = mix(emphasis, kind < 0.5 ? mix(0.4, 1.0, front) : 0.45 * railFade, square);

    vAlpha = draw * depthCue * glass * clearance * emphasis;
    vShade = 0.5 + 0.5 * height;
    vSpark = pow(0.5 + 0.5 * sin(t * 3.0 - uTime * 1.2 + stagger * 12.0), 14.0);

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const LATTICE_FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  uniform float uBrightness;

  varying float vAlpha;
  varying float vShade;
  varying float vSpark;

  void main() {
    vec3 green = vec3(0.204, 0.827, 0.478);
    vec3 teal = vec3(0.176, 0.831, 0.749);
    vec3 col = mix(green, teal, vShade) * uBrightness + vec3(0.85, 1.0, 0.95) * vSpark * 0.6;
    gl_FragColor = vec4(col, vAlpha * uOpacity);
  }
`;

/* ---------- the network ---------- */

export const NODES_VERTEX = /* glsl */ `
  attribute float aSeed;

  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uNodes;

  varying float vAlpha;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 centre = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float facing = dot(normalize(world.xyz - centre), normalize(cameraPosition - world.xyz));
    vec4 mv = viewMatrix * world;

    float pulse = 0.75 + 0.25 * sin(uTime * 1.6 + aSeed * 30.0);
    gl_PointSize = uSize * uPixelRatio * pulse * (7.0 / max(-mv.z, 0.5));

    float appear = smoothstep(aSeed * 0.6, aSeed * 0.6 + 0.4, uNodes);
    vAlpha = appear * mix(0.15, 1.0, smoothstep(-0.2, 0.3, facing));
    gl_Position = projectionMatrix * mv;
  }
`;

export const NODES_FRAGMENT = /* glsl */ `
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float halo = 1.0 - smoothstep(0.0, 0.5, d);
    float core = 1.0 - smoothstep(0.0, 0.14, d);
    vec3 col = vec3(0.55, 1.0, 0.82) * halo * 0.6 + vec3(1.0) * core;
    gl_FragColor = vec4(col, (halo * 0.5 + core) * vAlpha);
  }
`;

/* Faint great-circle arcs, each with one pulse of light travelling along it. */
export const ARCS_VERTEX = /* glsl */ `
  attribute float aArc;

  uniform float uTime;
  uniform float uNodes;

  varying float vU;
  varying float vHead;
  varying float vAlpha;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 centre = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float facing = dot(normalize(world.xyz - centre), normalize(cameraPosition - world.xyz));

    vU = uv.x;
    vHead = fract(uTime * 0.22 + aArc * 0.377);
    float appear = smoothstep(0.0, 0.1, uNodes * 1.3 - aArc * 0.04 - uv.x * 0.3);
    vAlpha = appear * mix(0.12, 1.0, smoothstep(-0.25, 0.25, facing));

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const ARCS_FRAGMENT = /* glsl */ `
  varying float vU;
  varying float vHead;
  varying float vAlpha;

  void main() {
    float trail = smoothstep(vHead - 0.22, vHead, vU) * (1.0 - smoothstep(vHead, vHead + 0.015, vU));
    vec3 col = vec3(0.45, 0.95, 0.78) * (0.18 + trail * 1.4);
    gl_FragColor = vec4(col, (0.18 + trail) * vAlpha);
  }
`;

/* ---------- soft light: the core, and the far side's two glows ---------- */

export const SPRITE_VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const SPRITE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;

  varying vec2 vUv;

  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float glow = pow(1.0 - smoothstep(0.0, 1.0, d), 2.2);
    gl_FragColor = vec4(uColor, glow * uStrength);
  }
`;

/* ---------- the portal's liquid glass ---------- */

export const SURFACE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/* A height field of slow rings and drifting noise, lit as glass. Through it,
   the bright far side — bent by the ripples, which grow as the camera nears. */
export const SURFACE_FRAGMENT = /* glsl */ `
  uniform float uSurface;
  uniform float uRipple;
  uniform float uShine;
  uniform float uTime;
  uniform float uExp;
  uniform vec2 uFrame;

  varying vec2 vUv;
  varying vec3 vWorld;

  ${NOISE}

  float heightAt(vec2 p) {
    float r = length(p);
    float h = sin(r * 7.0 - uTime * 2.0) / (1.0 + r * 2.2);
    h += 0.35 * sin(p.x * 3.1 + p.y * 1.7 + uTime * 1.1);
    h += 0.5 * (vnoise(p * 1.8 + vec2(uTime * 0.18, -uTime * 0.12)) - 0.5);
    return h;
  }

  void main() {
    vec2 q = vUv * 2.0 - 1.0;
    float e = pow(abs(q.x), uExp) + pow(abs(q.y), uExp);
    float mask = 1.0 - smoothstep(0.9, 1.0, e);
    if (mask <= 0.001) discard;

    vec2 p = q * uFrame;
    float h0 = heightAt(p);
    float eps = 0.03;
    vec2 grad = vec2(heightAt(p + vec2(eps, 0.0)) - h0, heightAt(p + vec2(0.0, eps)) - h0) / eps;
    vec3 N = normalize(vec3(-grad * (0.03 + 0.2 * uRipple), 1.0));
    vec3 V = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);

    vec2 bend = q * 0.55 + N.xy * (0.25 + 0.9 * uRipple);
    float reach = length(bend * vec2(0.8, 1.0));
    vec3 beyond = mix(vec3(0.95, 1.0, 0.97), vec3(0.24, 0.66, 0.56), smoothstep(0.05, 1.05, reach));
    vec3 col = mix(vec3(0.03, 0.2, 0.17), beyond, 0.3 + 0.55 * uShine);

    float caustic = pow(1.0 - abs(sin((bend.x * 1.3 + bend.y) * 9.0 + h0 * 2.5)), 10.0);
    col += vec3(0.8, 1.0, 0.94) * caustic * (0.06 + 0.2 * uRipple);

    vec3 L = normalize(vec3(-0.45, 0.65, 0.6));
    float spec = pow(max(dot(reflect(-L, N), V), 0.0), 70.0);
    col += vec3(1.0) * spec * 0.6 + vec3(0.4, 0.95, 0.8) * fresnel * 0.35;

    float edge = smoothstep(0.55, 0.97, e);
    col += vec3(0.35, 0.95, 0.78) * edge * 0.3;

    gl_FragColor = vec4(col, mask * uSurface * (0.78 + 0.15 * fresnel + 0.07 * edge));
  }
`;

/* ---------- motes ---------- */

export const PARTICLES_VERTEX = /* glsl */ `
  attribute float aSeed;

  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.x += cos(uTime * 0.25 + aSeed * 4.0) * 0.12;
    p.y += sin(uTime * 0.3 + aSeed * 6.28) * 0.15;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;

    gl_PointSize = min(uSize * uPixelRatio * (8.0 / max(dist, 0.5)) * (0.6 + aSeed * 0.8), 22.0 * uPixelRatio);
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.8 + aSeed) + aSeed * 20.0);
    vAlpha = smoothstep(0.4, 2.2, dist) * (1.0 - smoothstep(16.0, 28.0, dist)) * twinkle;

    gl_Position = projectionMatrix * mv;
  }
`;

/* Pale glints in space, small green specks in daylight. */
export const PARTICLES_FRAGMENT = /* glsl */ `
  uniform float uNight;

  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = 1.0 - smoothstep(0.0, 0.5, d);
    a *= a;
    vec3 col = mix(vec3(0.09, 0.55, 0.36), vec3(0.62, 1.0, 0.86), uNight);
    gl_FragColor = vec4(col, a * vAlpha * mix(0.3, 0.85, uNight));
  }
`;

/* ---------- the far side ---------- */

export const FLOOR_VERTEX = /* glsl */ `
  varying vec3 vWorld;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/* A pale floor with a fine green grid, fading into the sky at the horizon. */
export const FLOOR_FRAGMENT = /* glsl */ `
  uniform float uArrive;

  varying vec3 vWorld;

  void main() {
    vec2 g = vWorld.xz * 0.8;
    vec2 w = max(fwidth(g), vec2(0.0001));
    vec2 grid = abs(fract(g - 0.5) - 0.5) / w;
    float line = 1.0 - min(min(grid.x, grid.y), 1.0);

    float dist = length(vWorld.xz - cameraPosition.xz);
    float lines = 1.0 - smoothstep(3.0, 18.0, dist);
    float body = 1.0 - smoothstep(8.0, 30.0, dist);

    vec3 col = mix(vec3(0.95, 0.978, 0.965), vec3(0.086, 0.639, 0.29), line * 0.32 * lines);
    gl_FragColor = vec4(col, uArrive * body * 0.92);
  }
`;

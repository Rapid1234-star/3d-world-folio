import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
export async function installPalette(S) {
S.SUN = new THREE.Color('#ffd7a3');          // a low, warm late-afternoon key
S.SKYFILL = new THREE.Color('#d3dfff');      // lilac-blue sky bounce
S.GROUNDFILL = new THREE.Color('#d5e6c4');   // lawn bounce, so the ground does not go peach
S.HAZE = new THREE.Color('#e4efe4');         // pale green haze, not sand
S.ZENITH = new THREE.Color('#a8cdf0');
S.C = {
  ink: '#2a1d38', inkSoft: '#6a5a86', cream: '#fbf3e6', concrete: '#efe7ea', coral: '#ff5b3a',
  mint: '#a9dcb6', mintDeep: '#86c99a', pink: '#f6b3c7', blossom: '#f9c3d2', butter: '#ffe08f', lilac: '#cdb8f0',
  peach: '#ffc4a3', sky: '#a9d4f2', trunk: '#c79f8e', tire: '#4b3d5e', wood: '#e9c79c', hedge: '#93cfa0', terracotta: '#f0a98a',
};
S.PAPER = new THREE.Color('#f7efe4');
S.DOTS = new THREE.Color('#d9c9cf');
S.RING_COL = new THREE.Color('#ffb547');
S.DUSK = new THREE.Color('#d9ccd6');
}
export async function installMaterials(S) {
S.VERT_HEAD = 'varying vec3 vKpW;\nuniform float uTime;\n';
S.VERT_WORLD = `
  vec4 kpw = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    kpw = instanceMatrix * kpw;
  #endif
  vKpW = (modelMatrix * kpw).xyz;`;
S.FRAG_HEAD = 'varying vec3 vKpW;\nuniform float uReveal; uniform vec2 uCenter; uniform float uTime; uniform float uRingOn; uniform vec3 uRingCol;\n';
S.FRAG_CLIP = `
  float kpD = distance(vKpW.xz, uCenter);
  if (kpD > uReveal) discard;`;
S.FRAG_GLOW = `
  gl_FragColor.rgb += uRingCol * uRingOn * smoothstep(uReveal - 0.9, uReveal, kpD) * 0.6;
  #include <dithering_fragment>`;

function patch(mat, o = {}) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, S.RU, o.uniforms || {});
    let v = sh.vertexShader.replace('#include <common>', '#include <common>\n' + S.VERT_HEAD + (o.hull ? 'uniform float uOutline;\n' : ''));
    if (o.hull) v = v.replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * uOutline;');
    if (o.sway) v = v.replace('#include <begin_vertex>', `#include <begin_vertex>
      { float sw = max(transformed.y - 1.5, 0.0);
        transformed.x += sin(uTime * 1.3 + transformed.z * 0.35) * 0.035 * sw;
        transformed.z += cos(uTime * 1.05 + transformed.x * 0.3) * 0.028 * sw; }`);
    v = v.replace('#include <project_vertex>', '#include <project_vertex>' + S.VERT_WORLD);
    let f = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + S.FRAG_HEAD + (o.fragHead || ''));
    f = f.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>' + (o.noClip ? '\nfloat kpD = distance(vKpW.xz, uCenter);' : S.FRAG_CLIP));
    if (o.frag) f = o.frag(f);
    if (o.ao) f = f.replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb *= mix(0.66, 1.0, smoothstep(0.0, 0.62, vKpW.y));\n#include <tonemapping_fragment>');
    if (!o.noGlow) f = f.replace('#include <dithering_fragment>', S.FRAG_GLOW);
    sh.vertexShader = v; sh.fragmentShader = f;
  };
  mat.customProgramCacheKey = () => 'kp' + (o.key || '') + (o.hull ? 'h' : '') + (o.sway ? 's' : '') + (o.ao ? 'a' : '');
  return mat;
}

S.gradientMap = (() => {
  const d = new Uint8Array([105, 168, 222, 255]);
  const t = new THREE.DataTexture(d, 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
S.matCache = new Map();
function toon(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (S.matCache.has(key)) return S.matCache.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap: S.gradientMap });
  if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei ?? 1; }
  if (o.opacity != null) { m.transparent = true; m.opacity = o.opacity; m.depthWrite = false; }
  patch(m, { sway: o.sway, ao: !o.noAO });
  S.matCache.set(key, m); return m;
}
S.OUTLINE_W = { value: 0.034 };
S.hullMats = new Map();
function bodyMat(sway) {
  const k = sway ? 's' : 'n';
  if (S.hullMats.has(k)) return S.hullMats.get(k);
  const m = new THREE.MeshBasicMaterial({ color: S.C.ink, side: THREE.BackSide });
  patch(m, { hull: true, sway, uniforms: { uOutline: S.OUTLINE_W }, noGlow: false });
  S.hullMats.set(k, m); return m;
}
S.hullCache = new WeakMap();
function bodyGeo(geo) {
  if (S.hullCache.has(geo)) return S.hullCache.get(geo);
  let g = geo.clone(); g.deleteAttribute('normal'); if (g.attributes.uv) g.deleteAttribute('uv');
  g = mergeVertices(g, 1e-3); g.computeVertexNormals(); g = g.toNonIndexed();
  S.hullCache.set(geo, g); return g;
}
function flat(geo) { let g = geo.index ? geo.toNonIndexed() : geo.clone(); if (g.attributes.uv) g.deleteAttribute('uv'); g.computeVertexNormals(); return g; }
function mesh(geo, color, o = {}) {
  const m = new THREE.Mesh(geo, o.mat || toon(color, o));
  m.castShadow = o.cast !== false; m.receiveShadow = true;
  if (o.outline !== false) { const h = new THREE.Mesh(bodyGeo(geo), bodyMat(false)); m.add(h); }
  return m;
}

S.batch = new Map();
S._m = new THREE.Matrix4(), S._q = new THREE.Quaternion(), S._e = new THREE.Euler(), S._v = new THREE.Vector3(), S._s = new THREE.Vector3();
function M(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3(sx, sy, sz));
}
function add(geo, matrix, color, o = {}) {
  const key = color + (o.sway ? '|s' : '') + (o.emissive ? '|e' + o.emissive : '') + (o.cast === false ? '|nc' : '');
  let b = S.batch.get(key);
  if (!b) { b = { color, o, geos: [], hulls: [] }; S.batch.set(key, b); }
  const g = flat(geo); g.applyMatrix4(matrix); b.geos.push(g);
  if (o.outline !== false) { const h = bodyGeo(geo).clone(); h.applyMatrix4(matrix); b.hulls.push(h); }
}
function bakeStatics() {
  const hullsBySway = { n: [], s: [] };
  for (const b of S.batch.values()) {
    const m = new THREE.Mesh(mergeGeometries(b.geos), toon(b.color, { sway: b.o.sway, emissive: b.o.emissive, ei: b.o.ei }));
    m.castShadow = b.o.cast !== false; m.receiveShadow = true; S.scene.add(m);
    hullsBySway[b.o.sway ? 's' : 'n'].push(...b.hulls);
  }
  for (const k of ['n', 's']) if (hullsBySway[k].length) {
    const h = new THREE.Mesh(mergeGeometries(hullsBySway[k]), bodyMat(k === 's'));
    S.scene.add(h);
  }
}

S.G = {
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  cyl: (rt, rb, h, s = 7) => new THREE.CylinderGeometry(rt, rb, h, s),
  ico: (r, d = 0) => new THREE.IcosahedronGeometry(r, d),
  dodo: r => new THREE.DodecahedronGeometry(r, 0),
  cone: (r, h, s = 6) => new THREE.ConeGeometry(r, h, s),
};
S.patch = patch;
S.toon = toon;
S.bodyMat = bodyMat;
S.bodyGeo = bodyGeo;
S.flat = flat;
S.mesh = mesh;
S.M = M;
S.add = add;
S.bakeStatics = bakeStatics;

}

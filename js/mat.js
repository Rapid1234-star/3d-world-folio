import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export async function installPalette(S) {
  const light = {
    key: '#ffdcae',
    sky: '#d3dfff',
    lawn: '#cfe0b8',
    haze: '#e4efe4',
    top: '#a8cdf0',
  };
  S.SUN = new THREE.Color(light.key);
  S.SKYFILL = new THREE.Color(light.sky);
  S.GROUNDFILL = new THREE.Color(light.lawn);
  S.HAZE = new THREE.Color(light.haze);
  S.ZENITH = new THREE.Color(light.top);

  S.C = {
    ink: '#2b2438',
    inkSoft: '#6a5a86',
    cream: '#fbf3e6',
    concrete: '#efe7ea',
    coral: '#d98a63',
    mint: '#a8dcb8',
    mintDeep: '#86c99a',
    pink: '#f4b6b8',
    blossom: '#f9c3d2',
    butter: '#ffd98a',
    lilac: '#cbb7ee',
    peach: '#f7c6a4',
    sky: '#bfe0f5',
    trunk: '#c79f8e',
    tire: '#4b3d5e',
    wood: '#e9c79c',
    hedge: '#9ccf9f',
    terracotta: '#d98a63',
  };

  S.PAPER = new THREE.Color('#f6efe3');
  S.DOTS = new THREE.Color('#d9c9cf');
  S.RING_COL = new THREE.Color('#eaa45f');
  S.DUSK = new THREE.Color('#d9ccd6');
}

export async function installMaterials(S) {
  const CHUNK = {
    vary: 'varying vec3 vKpW;\nuniform float uTime;\n',
    toWorld: `
      vec4 kpw = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        kpw = instanceMatrix * kpw;
      #endif
      vKpW = (modelMatrix * kpw).xyz;`,
    head: 'varying vec3 vKpW;\nuniform float uReveal; uniform vec2 uCenter; uniform float uTime; uniform float uRingOn; uniform vec3 uRingCol;\n',
    clip: `
      float kpD = distance(vKpW.xz, uCenter);
      if (kpD > uReveal) discard;`,
    rim: `
      gl_FragColor.rgb += uRingCol * uRingOn * smoothstep(uReveal - 0.9, uReveal, kpD) * 0.6;
      #include <dithering_fragment>`,
  };
  S.VERT_HEAD = CHUNK.vary;
  S.VERT_WORLD = CHUNK.toWorld;
  S.FRAG_HEAD = CHUNK.head;
  S.FRAG_CLIP = CHUNK.clip;
  S.FRAG_GLOW = CHUNK.rim;

  function decorate(mat, o = {}) {
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, S.RU, o.uniforms || {});
      let v = sh.vertexShader.replace('#include <common>', '#include <common>\n' + CHUNK.vary + (o.hull ? 'uniform float uOutline;\n' : ''));
      if (o.hull) v = v.replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * uOutline;');
      if (o.sway) v = v.replace('#include <begin_vertex>', `#include <begin_vertex>
        { float sw = max(transformed.y - 1.5, 0.0);
          transformed.x += sin(uTime * 1.3 + transformed.z * 0.35) * 0.035 * sw;
          transformed.z += cos(uTime * 1.05 + transformed.x * 0.3) * 0.028 * sw; }`);
      v = v.replace('#include <project_vertex>', '#include <project_vertex>' + CHUNK.toWorld);
      let f = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + CHUNK.head + (o.fragHead || ''));
      f = f.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>' + (o.noClip ? '\nfloat kpD = distance(vKpW.xz, uCenter);' : CHUNK.clip));
      if (o.frag) f = o.frag(f);
      if (o.ao) f = f.replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb *= mix(0.66, 1.0, smoothstep(0.0, 0.62, vKpW.y));\n#include <tonemapping_fragment>');
      if (!o.noGlow) f = f.replace('#include <dithering_fragment>', CHUNK.rim);
      sh.vertexShader = v; sh.fragmentShader = f;
    };
    mat.customProgramCacheKey = () => 'kp' + (o.key || '') + (o.hull ? 'h' : '') + (o.sway ? 's' : '') + (o.ao ? 'a' : '');
    return mat;
  }
  S.patch = decorate;

  const ramp = new Uint8Array([105, 168, 222, 255]);
  S.gradientMap = (() => {
    const t = new THREE.DataTexture(ramp, 4, 1, THREE.RedFormat);
    t.minFilter = t.magFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    return t;
  })();

  const toneCache = new Map();
  S.matCache = toneCache;
  function makeToon(color, o = {}) {
    const id = color + JSON.stringify(o);
    if (toneCache.has(id)) return toneCache.get(id);
    const m = new THREE.MeshToonMaterial({ color, gradientMap: S.gradientMap });
    if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei ?? 1; }
    if (o.opacity != null) { m.transparent = true; m.opacity = o.opacity; m.depthWrite = false; }
    decorate(m, { sway: o.sway, ao: !o.noAO });
    toneCache.set(id, m);
    return m;
  }
  S.toon = makeToon;

  S.OUTLINE_W = { value: 0.034 };
  const hullCacheBySway = new Map();
  S.hullMats = hullCacheBySway;
  function hullMaterial(sway) {
    const k = sway ? 's' : 'n';
    if (hullCacheBySway.has(k)) return hullCacheBySway.get(k);
    const m = new THREE.MeshBasicMaterial({ color: S.C.ink, side: THREE.BackSide });
    decorate(m, { hull: true, sway, uniforms: { uOutline: S.OUTLINE_W }, noGlow: false });
    hullCacheBySway.set(k, m);
    return m;
  }
  S.bodyMat = hullMaterial;

  const hullGeoCache = new WeakMap();
  S.hullCache = hullGeoCache;
  function hullGeometry(geo) {
    if (hullGeoCache.has(geo)) return hullGeoCache.get(geo);
    let g = geo.clone();
    g.deleteAttribute('normal');
    if (g.attributes.uv) g.deleteAttribute('uv');
    g = mergeVertices(g, 1e-3);
    g.computeVertexNormals();
    g = g.toNonIndexed();
    hullGeoCache.set(geo, g);
    return g;
  }
  S.bodyGeo = hullGeometry;

  function stripGeo(geo) {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (g.attributes.uv) g.deleteAttribute('uv');
    g.computeVertexNormals();
    return g;
  }
  S.flat = stripGeo;

  function buildMesh(geo, color, o = {}) {
    const m = new THREE.Mesh(geo, o.mat || makeToon(color, o));
    m.castShadow = o.cast !== false;
    m.receiveShadow = true;
    if (o.outline !== false) { const h = new THREE.Mesh(hullGeometry(geo), hullMaterial(false)); m.add(h); }
    return m;
  }
  S.mesh = buildMesh;

  S.batch = new Map();
  S._m = new THREE.Matrix4();
  S._q = new THREE.Quaternion();
  S._e = new THREE.Euler();
  S._v = new THREE.Vector3();
  S._s = new THREE.Vector3();
  function matrix(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
    return new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')),
      new THREE.Vector3(sx, sy, sz)
    );
  }
  S.M = matrix;

  function queuePiece(geo, mtx, color, o = {}) {
    const id = color + (o.sway ? '|s' : '') + (o.emissive ? '|e' + o.emissive : '') + (o.cast === false ? '|nc' : '');
    let slot = S.batch.get(id);
    if (!slot) { slot = { color, o, geos: [], hulls: [] }; S.batch.set(id, slot); }
    const g = stripGeo(geo); g.applyMatrix4(mtx); slot.geos.push(g);
    if (o.outline !== false) { const h = hullGeometry(geo).clone(); h.applyMatrix4(mtx); slot.hulls.push(h); }
  }
  S.add = queuePiece;

  function flushStatics() {
    const outlineBuckets = { n: [], s: [] };
    for (const slot of S.batch.values()) {
      const m = new THREE.Mesh(mergeGeometries(slot.geos), makeToon(slot.color, { sway: slot.o.sway, emissive: slot.o.emissive, ei: slot.o.ei }));
      m.castShadow = slot.o.cast !== false;
      m.receiveShadow = true;
      S.scene.add(m);
      outlineBuckets[slot.o.sway ? 's' : 'n'].push(...slot.hulls);
    }
    for (const k of ['n', 's']) if (outlineBuckets[k].length) {
      const h = new THREE.Mesh(mergeGeometries(outlineBuckets[k]), hullMaterial(k === 's'));
      S.scene.add(h);
    }
  }
  S.bakeStatics = flushStatics;

  S.G = {
    box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
    cyl: (rt, rb, h, s = 7) => new THREE.CylinderGeometry(rt, rb, h, s),
    ico: (r, d = 0) => new THREE.IcosahedronGeometry(r, d),
    dodo: r => new THREE.DodecahedronGeometry(r, 0),
    cone: (r, h, s = 6) => new THREE.ConeGeometry(r, h, s),
  };
}

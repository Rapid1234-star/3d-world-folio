import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
window.__booted = true; // tells the watchdog in index.html the park script arrived

/* =====================================================================
   content
   ===================================================================== */
// the no-WebGL list in index.html (#fallback) repeats this copy: keep the two in step
const LINKS = {
  github: 'https://github.com/Rapid1234-star',
  linkedin: 'https://www.linkedin.com/in/aayan-desai/',
  email: 'aayanirshad99@gmail.com',
  phone: '+971 56-123-5034',
  googleCert: 'https://www.coursera.org/account/accomplishments/professional-cert/BC7C1BZCZ780',
  metaCert: 'https://www.coursera.org/account/accomplishments/professional-cert/L9U93KKVJ6D4',
  microsoftCert: 'https://www.coursera.org/account/accomplishments/professional-cert/T20FSGC6EJ4T',
};
const SCAM = {
  SAFE: { line: '“Running late, same café as last week. No links, no codes.”', note: 'Known caller, no credential ask, no link. The classifier leaves it alone.' },
  SUSPICIOUS: { line: '“Your parcel is held. Open the link in the next two minutes or it returns.”', note: 'Time pressure plus an off-channel link. Not enough to call it a confirmed scam, enough to refuse.' },
  SCAM: { line: '“This is your bank. Read me the code we just texted or the account locks.”', note: 'Asks for a one-time code. Legitimate banks do not collect OTPs by phone.' },
};
const STANDS = [
  { id: 'about', kind: 'about', stamp: 'A', angle: -108, title: 'About', short: 'About', badge: 'ABOUT', kicker: 'Home', section: 'about', color: '#cdb8f0',
    h: 'Aayan Irshad Desai',
    lede: ['QA Automation Engineer | Full-Stack Developer.', 'Al Nahda, Sharjah, UAE.'],
    copy: ['Cybersecurity-focused Computer Science student and QA automation engineer. I build large Playwright suites, production web systems, and AI-driven automation pipelines.',
      'The work sits between secure application development and shipping: authentication workarounds, endpoint remediation at scale, and full-stack apps from React and Node to Python computer vision.'],
    meta: [['Focus', 'Cybersecurity · QA · Full-stack'], ['Based', 'Sharjah, UAE'], ['Now', 'BCS, University of Wollongong in Dubai'], ['Board', 'The greenhouse']],
    links: [['GitHub', LINKS.github], ['LinkedIn', LINKS.linkedin], ['Email', 'mailto:' + LINKS.email]],
    cta: ['GitHub', LINKS.github], line: 'QA · full-stack · cybersecurity' },
  { id: 'education', kind: 'education', stamp: 'E', angle: -72, title: 'Education', short: 'Education', badge: 'EDUCATION', kicker: 'University', section: 'uowd', color: '#ffe08f',
    h: 'University of Wollongong in Dubai',
    lede: ['Bachelor of Computer Science, Cybersecurity.', 'April 2025 – April 2028 · Dubai, UAE.'],
    copy: ['The degree is this stand. The three professional certificates are listed on the card, each with its Coursera credential.'],
    blocks: [
      { h: 'Degree', items: ['Bachelor of Computer Science, specializing in Cybersecurity.'] },
      { h: 'Certificates', items: ['Google Cybersecurity Professional Certificate', 'Meta Front-End Developer Professional Certificate', 'Microsoft Python Development Professional Certificate'] },
    ],
    links: [['Google certificate', LINKS.googleCert], ['Meta certificate', LINKS.metaCert], ['Microsoft certificate', LINKS.microsoftCert]],
    cta: ['Google certificate', LINKS.googleCert], line: 'BCS Cybersecurity · 2025–2028' },
  { id: 'skills', kind: 'skills', stamp: 'S', angle: -36, title: 'Skills', short: 'Skills', badge: 'SKILLS', kicker: 'The lab', section: 'skills', color: '#a9d4f2',
    h: 'Skills',
    lede: ['Four benches. One inventory.', 'Security is a skill group, not its own district.'],
    copy: ['Languages, frameworks, QA, and systems. The same list a recruiter would scan on the PDF.'],
    blocks: [
      { h: 'Languages', items: ['Python', 'JavaScript', 'TypeScript', 'C++', 'SQL'] },
      { h: 'Frameworks & tools', items: ['React', 'Next.js', 'Node.js', 'Tailwind CSS', 'Playwright', 'OpenCV', 'Git/GitHub', 'n8n', 'Azure Bastion', 'Wix'] },
      { h: 'QA & automation', items: ['Test case design', 'Test automation', 'Regression and production testing', 'Defect tracking', 'Test reporting'] },
      { h: 'Systems & security', items: ['Windows Registry and Services', 'Endpoint remediation', 'Cybersecurity fundamentals', 'Agile workflows'] },
    ],
    cta: ['GitHub', LINKS.github], line: 'Python · React · Playwright' },
  { id: 'patchifi', kind: 'experience', stamp: 'P', angle: 0, title: 'Patchifi', short: 'Patchifi', badge: 'EXPERIENCE', kicker: 'Company · Patchifi', section: 'experience', color: '#ffc4a3',
    h: 'Patchifi',
    lede: ['QA & Automation Intern.', 'Apr 2026 – Sept 2026 · Remote.'],
    copy: ['A cybersecurity and patch-management company. This shop is one door on the Experience row. The next company stands beside it.'],
    blocks: [
      { h: 'Test engineering', items: [
        'Built and maintained 840+ automated Playwright test cases across 8 core modules: Dashboard, Access Control, Patch Center, and the rest of the platform.',
        'Engineered an OTP-polling and session-reuse workflow so 800+ tests run under one authenticated session.',
      ] },
      { h: 'Automation and systems', items: [
        'Designed an n8n + AI pipeline that auto-publishes company blog content to LinkedIn, then pitched 10 more automation opportunities to the CEO.',
        'Validated 22 endpoint remediation scripts (14 disable-update, 8 update) for Chrome, Edge, Firefox, and Dropbox via Azure Bastion.',
        'Led a desktop and mobile QA audit of the production Wix site, logged defects, fixed UI issues, and configured email-gated download forms.',
      ] },
    ],
    meta: [['Tools', 'Playwright, JavaScript/TypeScript, n8n, Wix, Azure Bastion']],
    cta: ['LinkedIn', LINKS.linkedin], line: 'QA intern · Apr–Sept 2026' },
  { id: 'appify', kind: 'experience', stamp: 'B', angle: 36, title: 'Appify Brands', short: 'Appify', badge: 'EXPERIENCE', kicker: 'Company · Appify Brands', section: 'experience', color: '#ffc4a3',
    h: 'Appify Brands',
    lede: ['Web Developer · freelance.', 'Sept 2026 · Remote.'],
    copy: ['The second shop on the Experience row. Different work from Patchifi: shipping interfaces, not a test suite.'],
    blocks: [
      { h: 'Landing pages', items: [
        'Designed and developed 2 premium responsive landing pages with React, Next.js, and Three.js.',
        'Motion with Framer Motion and GSAP. Partnered with Appify Brands to refine, test, and publish both to production.',
      ] },
    ],
    meta: [['Tools', 'React, Next.js, TypeScript, Three.js, Framer Motion, GSAP, Tailwind']],
    cta: ['LinkedIn', LINKS.linkedin], line: 'Web developer · Sept 2026' },
  { id: 'projects', kind: 'project', stamp: 'R', angle: 72, title: 'Projects', short: 'Projects', badge: 'PROJECT', kicker: 'Five builds', section: 'projects', color: '#a9dcb6',
    h: 'Projects',
    lede: ['Five builds. Not company doors.', 'Experience stays on the two peach shops.'],
    copy: ['Each one is a project. Voice Scam Shield includes a short Safe / Suspicious / Scam demo. It does not use the microphone.'],
    blocks: [
      { h: '01 · Internship Management System', s: 'Node.js, HTML, CSS, JavaScript', href: 'https://github.com/Rapid1234-star/Internship-management-site', items: ['Full-stack portal with role-based access, secure authentication, and queries tuned for applications and placements.'] },
      { h: '02 · AI Resume Analyzer', s: 'TypeScript, JavaScript, AI', href: 'https://github.com/Rapid1234-star/ai-resume-analyser', items: ['Parses, evaluates, and scores resume content. The scoring pass landed about a 30% accuracy gain.'] },
      { h: '03 · Voice Scam Shield', s: 'TypeScript, JavaScript, AI', href: 'https://github.com/Rapid1234-star/Voice_Scam_Shield', items: ['A prototype that scores a call as Safe, Suspicious, or Scam. These three scripted lines show the decision.'], scam: true },
      { h: '04 · AI Face & Object Detection', s: 'Python, OpenCV, COCO-SSD', href: 'https://github.com/Rapid1234-star/AI-Object-Detection', items: ['Facial recognition with about a 20% accuracy improvement, plus a browser object detector on COCO-SSD.'] },
      { h: '05 · Hand Snake', s: 'React, TypeScript, MediaPipe, Python', href: 'https://github.com/Rapid1234-star/Gesture-Snake-game', items: ['A browser snake you steer with your hand. MediaPipe on the front, a Python reference engine beside it.'] },
    ],
    links: [['GitHub', LINKS.github]],
    cta: ['GitHub', LINKS.github], line: 'Five builds · one gallery' },
  { id: 'contact', kind: 'contact', stamp: 'C', angle: 108, title: 'Say hello', short: 'Contact', badge: 'CONTACT', kicker: 'Connect', section: 'contact', color: '#f6b3c7',
    h: 'Say hello',
    lede: ['GitHub, LinkedIn, or a straight email.', 'Al Nahda, Sharjah.'],
    copy: ['The sign and this card use the same three links.'],
    meta: [['Email', LINKS.email], ['Phone', LINKS.phone], ['GitHub', 'Rapid1234-star'], ['LinkedIn', 'aayan-desai']],
    links: [['Email', 'mailto:' + LINKS.email], ['GitHub', LINKS.github], ['LinkedIn', LINKS.linkedin]],
    email: LINKS.email, cta: ['Write an email', 'mailto:' + LINKS.email] },
];

/* =====================================================================
   environment + capability
   ===================================================================== */
const $ = id => document.getElementById(id);
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
if (isTouch) {
  document.documentElement.classList.add('touch');
  const st = document.querySelector('#start b .word'); if (st) st.textContent = 'Tap';
  const sm = document.querySelector('#start small'); if (sm) sm.textContent = 'then steer with the stick';
}
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = () => innerWidth < 641;
const DEG = Math.PI / 180;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const expoOut = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = mulberry32(20261009);
const R = (a, b) => a + rand() * (b - a);
const polar = (aDeg, r) => new THREE.Vector3(Math.sin(aDeg * DEG) * r, 0, -Math.cos(aDeg * DEG) * r);
// stands face a blend of the plaza and the camera, so every board reads from the default view
const faceY = (p, w = 1.1) => { const l = Math.hypot(p.x, p.z); const dx = -p.x / l + Math.sin(22 * DEG) * w, dz = -p.z / l + Math.cos(22 * DEG) * w; return Math.atan2(dx, dz); };

function buildListInto(ol, onPick) {
  ol.innerHTML = '';
  STANDS.forEach((s, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.style.setProperty('--c', s.color);
    const name = s.short || s.title;
    const sub = s.lede[0];
    b.innerHTML = `<span class="sw"></span><span><strong>${name}</strong><em>${sub}</em></span><span class="go mono">${onPick ? 'Open' : ''}</span>`;
    if (onPick) b.addEventListener('click', () => onPick(s)); else b.disabled = true;
    li.appendChild(b); ol.appendChild(li);
  });
}

// no WebGL (checked by the watchdog in index.html) or the watchdog already gave up: the static list is the page
function noPark() { document.documentElement.classList.add('nogl'); $('loader').classList.add('out'); }
if (document.documentElement.classList.contains('nogl')) { noPark(); await new Promise(() => {}); } // stop here quietly

/* =====================================================================
   palette — lights first, then everything from them
   ===================================================================== */
const SUN = new THREE.Color('#ffd7a3');          // a low, warm late-afternoon key
const SKYFILL = new THREE.Color('#d3dfff');      // lilac-blue sky bounce
const GROUNDFILL = new THREE.Color('#f6cdbd');   // warm peach ground bounce
const HAZE = new THREE.Color('#f8e7da');         // horizon haze: fog + sky foot
const ZENITH = new THREE.Color('#a8cdf0');
const C = {
  ink: '#2a1d38', inkSoft: '#6a5a86', cream: '#fbf3e6', concrete: '#efe7ea', coral: '#ff5b3a',
  mint: '#a9dcb6', mintDeep: '#86c99a', pink: '#f6b3c7', blossom: '#f9c3d2', butter: '#ffe08f', lilac: '#cdb8f0',
  peach: '#ffc4a3', sky: '#a9d4f2', trunk: '#c79f8e', tire: '#4b3d5e', wood: '#e9c79c', hedge: '#93cfa0', terracotta: '#f0a98a',
};
const PAPER = new THREE.Color('#f7efe4');
const DOTS = new THREE.Color('#d9c9cf');
const RING = new THREE.Color('#ffb547');
const DUSK = new THREE.Color('#d9ccd6');

/* =====================================================================
   renderer, scene, camera, post
   ===================================================================== */
const canvas = $('gl');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); }
catch (e) { noPark(); await new Promise(() => {}); } // a context that will not open goes to the list too
const DPR = Math.min(devicePixelRatio, phone() ? 1.6 : 1.5);
renderer.setPixelRatio(DPR);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.16;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // PCF honours shadow.radius → soft, long shadows

const scene = new THREE.Scene();
scene.background = HAZE.clone();
scene.fog = new THREE.Fog(HAZE, 30, 95);
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.5, 400);
const CAM_YAW = 22 * DEG; let CAM_PITCH = 49 * DEG;
const camRight = new THREE.Vector3(Math.cos(CAM_YAW), 0, -Math.sin(CAM_YAW));
const camUp = new THREE.Vector3(-Math.sin(CAM_YAW), 0, -Math.cos(CAM_YAW)); // "screen up" on the ground

const hemi = new THREE.HemisphereLight(SKYFILL, GROUNDFILL, 1.08);
scene.add(hemi);
const sun = new THREE.DirectionalLight(SUN, 3.7);
const SUN_DIR = new THREE.Vector3(-0.84, 0.56, 0.44).normalize(); // ~34° high: long shadows up-screen
sun.castShadow = true;
sun.shadow.mapSize.set(phone() ? 1024 : 2048, phone() ? 1024 : 2048);
const SH = phone() ? 34 : 30;
Object.assign(sun.shadow.camera, { left: -SH, right: SH, top: SH, bottom: -SH, near: 1, far: 130 });
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04; sun.shadow.radius = phone() ? 3 : 4.5;
scene.add(sun, sun.target);

// shared uniforms: the lit-circle reveal + time
const RU = {
  uReveal: { value: 0 }, uCenter: { value: new THREE.Vector2(0, 4.5) }, uTime: { value: 0 },
  uRingOn: { value: 1 }, uRingCol: { value: RING.clone().multiplyScalar(1.6) }, uDim: { value: 1 }, uKart: { value: new THREE.Vector2(0, 4.5) },
};

/* --- shader patching: every material reveals inside the lit circle --- */
const VERT_HEAD = 'varying vec3 vKpW;\nuniform float uTime;\n';
const VERT_WORLD = `
  vec4 kpw = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    kpw = instanceMatrix * kpw;
  #endif
  vKpW = (modelMatrix * kpw).xyz;`;
const FRAG_HEAD = 'varying vec3 vKpW;\nuniform float uReveal; uniform vec2 uCenter; uniform float uTime; uniform float uRingOn; uniform vec3 uRingCol;\n';
const FRAG_CLIP = `
  float kpD = distance(vKpW.xz, uCenter);
  if (kpD > uReveal) discard;`;
const FRAG_GLOW = `
  gl_FragColor.rgb += uRingCol * uRingOn * smoothstep(uReveal - 0.9, uReveal, kpD) * 0.6;
  #include <dithering_fragment>`;

function patch(mat, o = {}) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, RU, o.uniforms || {});
    let v = sh.vertexShader.replace('#include <common>', '#include <common>\n' + VERT_HEAD + (o.hull ? 'uniform float uOutline;\n' : ''));
    if (o.hull) v = v.replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * uOutline;');
    if (o.sway) v = v.replace('#include <begin_vertex>', `#include <begin_vertex>
      { float sw = max(transformed.y - 1.5, 0.0);
        transformed.x += sin(uTime * 1.3 + transformed.z * 0.35) * 0.035 * sw;
        transformed.z += cos(uTime * 1.05 + transformed.x * 0.3) * 0.028 * sw; }`);
    v = v.replace('#include <project_vertex>', '#include <project_vertex>' + VERT_WORLD);
    let f = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + FRAG_HEAD + (o.fragHead || ''));
    f = f.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>' + (o.noClip ? '\nfloat kpD = distance(vKpW.xz, uCenter);' : FRAG_CLIP));
    if (o.frag) f = o.frag(f);
    if (o.ao) f = f.replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb *= mix(0.66, 1.0, smoothstep(0.0, 0.62, vKpW.y));\n#include <tonemapping_fragment>');
    if (!o.noGlow) f = f.replace('#include <dithering_fragment>', FRAG_GLOW);
    sh.vertexShader = v; sh.fragmentShader = f;
  };
  mat.customProgramCacheKey = () => 'kp' + (o.key || '') + (o.hull ? 'h' : '') + (o.sway ? 's' : '') + (o.ao ? 'a' : '');
  return mat;
}

const gradientMap = (() => {
  const d = new Uint8Array([105, 168, 222, 255]);
  const t = new THREE.DataTexture(d, 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const matCache = new Map();
function toon(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap });
  if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei ?? 1; }
  if (o.opacity != null) { m.transparent = true; m.opacity = o.opacity; m.depthWrite = false; }
  patch(m, { sway: o.sway, ao: !o.noAO });
  matCache.set(key, m); return m;
}
const OUTLINE_W = { value: 0.034 };
const hullMats = new Map();
function hullMat(sway) {
  const k = sway ? 's' : 'n';
  if (hullMats.has(k)) return hullMats.get(k);
  const m = new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide });
  patch(m, { hull: true, sway, uniforms: { uOutline: OUTLINE_W }, noGlow: false });
  hullMats.set(k, m); return m;
}
const hullCache = new WeakMap();
function hullGeo(geo) {
  if (hullCache.has(geo)) return hullCache.get(geo);
  let g = geo.clone(); g.deleteAttribute('normal'); if (g.attributes.uv) g.deleteAttribute('uv');
  g = mergeVertices(g, 1e-3); g.computeVertexNormals(); g = g.toNonIndexed();
  hullCache.set(geo, g); return g;
}
function flat(geo) { let g = geo.index ? geo.toNonIndexed() : geo.clone(); if (g.attributes.uv) g.deleteAttribute('uv'); g.computeVertexNormals(); return g; }
function mesh(geo, color, o = {}) {
  const m = new THREE.Mesh(geo, o.mat || toon(color, o));
  m.castShadow = o.cast !== false; m.receiveShadow = true;
  if (o.outline !== false) { const h = new THREE.Mesh(hullGeo(geo), hullMat(false)); m.add(h); }
  return m;
}

/* --- static batcher: one draw call per colour --- */
const batch = new Map();
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
function M(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new THREE.Vector3(sx, sy, sz));
}
function add(geo, matrix, color, o = {}) {
  const key = color + (o.sway ? '|s' : '') + (o.emissive ? '|e' + o.emissive : '') + (o.cast === false ? '|nc' : '');
  let b = batch.get(key);
  if (!b) { b = { color, o, geos: [], hulls: [] }; batch.set(key, b); }
  const g = flat(geo); g.applyMatrix4(matrix); b.geos.push(g);
  if (o.outline !== false) { const h = hullGeo(geo).clone(); h.applyMatrix4(matrix); b.hulls.push(h); }
}
function buildBatch() {
  const hullsBySway = { n: [], s: [] };
  for (const b of batch.values()) {
    const m = new THREE.Mesh(mergeGeometries(b.geos), toon(b.color, { sway: b.o.sway, emissive: b.o.emissive, ei: b.o.ei }));
    m.castShadow = b.o.cast !== false; m.receiveShadow = true; scene.add(m);
    hullsBySway[b.o.sway ? 's' : 'n'].push(...b.hulls);
  }
  for (const k of ['n', 's']) if (hullsBySway[k].length) {
    const h = new THREE.Mesh(mergeGeometries(hullsBySway[k]), hullMat(k === 's'));
    scene.add(h);
  }
}

/* =====================================================================
   physics
   ===================================================================== */
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -22, 0) });
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.defaultContactMaterial.friction = 0.25;
world.defaultContactMaterial.restitution = 0.15;
const groundBody = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
groundBody.addShape(new CANNON.Plane());
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

function staticBox(x, y, z, hx, hy, hz, ry = 0, rx = 0) {
  const b = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
  b.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, hz)));
  b.position.set(x, y, z); b.quaternion.setFromEuler(rx, ry, 0, 'YXZ');
  world.addBody(b); return b;
}
function staticCyl(x, z, r, h) {
  const b = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
  b.addShape(new CANNON.Cylinder(r, r, h, 8)); b.position.set(x, h / 2, z);
  world.addBody(b); return b;
}

/* --- wedge: the same six vertices feed three.js and cannon --- */
function wedge(w, l, h) {
  const V = [[-w, 0, l], [w, 0, l], [w, 0, -l], [-w, 0, -l], [w, h, -l], [-w, h, -l]];
  const F = [[0, 3, 2, 1], [3, 5, 4, 2], [0, 1, 4, 5], [1, 2, 4], [0, 5, 3]];
  const pos = [];
  for (const f of F) for (let i = 1; i < f.length - 1; i++) pos.push(...V[f[0]], ...V[f[i]], ...V[f[i + 1]]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
  const shape = new CANNON.ConvexPolyhedron({ vertices: V.map(v => new CANNON.Vec3(...v)), faces: F });
  return { geo, shape };
}

/* =====================================================================
   the world layout (metres). north = −z. ring road r=22, plaza r=10
   ===================================================================== */
const RING_R = 22, RING_W = 5, PLAZA_R = 10, STAND_R = 29.2, SPAWN = new THREE.Vector3(0, 0, 4.5);
const SKATE = { x0: -12, x1: 12, z0: 28.5, z1: 42 };
const BEDS = [45, 135, 225, 315].map(a => ({ c: polar(a, 13.6), rx: 3.4, rz: 2.0, a }));
function onPaved(x, z, pad = 0) {
  const r = Math.hypot(x, z);
  if (Math.abs(r - RING_R) < RING_W / 2 + pad) return true;
  if (r < PLAZA_R + pad) return true;
  if ((Math.abs(x) < 2.3 + pad || Math.abs(z) < 2.3 + pad) && r < RING_R) return true;
  if (Math.abs(x) < 2.3 + pad && z > 0 && z < SKATE.z0 + 1) return true;
  if (x > SKATE.x0 - pad && x < SKATE.x1 + pad && z > SKATE.z0 - pad && z < SKATE.z1 + pad) return true;
  return false;
}
const occ = [];       // [x, z, r] footprints of set dressing, kept clear of trees and grass
const treePos = [];
const lampPos = [];
function blocked(x, z, pad = 0) {
  if (onPaved(x, z, pad)) return true;
  for (const o of occ) if (Math.hypot(x - o[0], z - o[1]) < o[2] + pad * 0.5) return true;
  for (const s of STANDS) { const p = polar(s.angle, STAND_R + (s.kind === 'about' ? 1 : 0)); if (Math.hypot(x - p.x, z - p.z) < 5.4 + pad) return true; }
  for (const s of STANDS) { const l = polar(s.angle, RING_R - RING_W / 2 - 2.6); if (Math.hypot(x - l.x, z - l.z) < 3.4 + pad * 0.3) return true; }
  for (const b of BEDS) { const dx = (x - b.c.x) / (b.rx + pad), dz = (z - b.c.z) / (b.rz + pad); if (dx * dx + dz * dz < 1.3) return true; }
  return false;
}

/* --- geometry kit --- */
const G = {
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  cyl: (rt, rb, h, s = 7) => new THREE.CylinderGeometry(rt, rb, h, s),
  ico: (r, d = 0) => new THREE.IcosahedronGeometry(r, d),
  dodo: r => new THREE.DodecahedronGeometry(r, 0),
  cone: (r, h, s = 6) => new THREE.ConeGeometry(r, h, s),
};
const aoSpots = []; // [x, z, radius, strength] painted into the ground as baked AO

function tree(x, z, kind, s = 1) {
  const ry = R(0, 6.28);
  const T = M(x, 0, z, 0, ry, 0, s);
  const trunkH = R(1.5, 2.1);
  add(G.cyl(0.11, 0.19, trunkH, 6), T.clone().multiply(M(0, trunkH / 2, 0)), C.trunk);
  const col = { blossom: C.blossom, mint: C.mint, butter: C.butter, lilac: C.lilac, deep: C.mintDeep }[kind];
  const n = 3 + (rand() * 2 | 0);
  for (let i = 0; i < n; i++) {
    const r = R(0.75, 1.15) * (i === 0 ? 1.2 : 1);
    const a = i / n * 6.28 + R(0, 1);
    const off = i === 0 ? 0 : R(0.55, 0.85);
    add(G.ico(r, 0), T.clone().multiply(M(Math.cos(a) * off, trunkH + R(0.3, 0.9) + (i === 0 ? 0.35 : 0), Math.sin(a) * off, R(0, 3), R(0, 3), 0)), col, { sway: true });
  }
  staticCyl(x, z, 0.28 * s, 2.4);
  aoSpots.push([x, z, 2.2 * s, 0.28]);
  treePos.push([x, z, kind]);
}
function palm(x, z, s = 1) {
  const T = M(x, 0, z, 0, R(0, 6.28), 0, s);
  let y = 0, lean = R(-0.12, 0.12);
  for (let i = 0; i < 6; i++) { add(G.cyl(0.13 - i * 0.008, 0.16 - i * 0.008, 0.62, 6), T.clone().multiply(M(lean * y, y + 0.31, 0, 0, 0, -lean)), C.trunk); y += 0.6; }
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * 6.28;
    const leaf = G.box(0.5, 0.06, 2.0);
    add(leaf, T.clone().multiply(M(lean * y, y + 0.05, 0, 0, a, 0)).multiply(M(0, 0, 0.9, 0.42, 0, 0)), C.mint, { sway: true });
  }
  staticCyl(x, z, 0.25 * s, 3);
  aoSpots.push([x, z, 1.8 * s, 0.22]);
}
function bush(x, z, s = 1, col = C.mintDeep) {
  for (let i = 0; i < 3; i++) add(G.ico(R(0.45, 0.7) * s, 0), M(x + R(-0.5, 0.5) * s, R(0.25, 0.45) * s, z + R(-0.5, 0.5) * s, R(0, 3), R(0, 3), 0, 1, 0.75, 1), col);
  aoSpots.push([x, z, 1.4 * s, 0.22]);
}
function monstera(x, z, s = 1) {
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * 6.28 + R(0, 0.6);
    add(G.cyl(0, 0.42, 0.06, 7), M(x + Math.cos(a) * 0.45 * s, R(0.35, 0.75) * s, z + Math.sin(a) * 0.45 * s, R(0.3, 0.7), -a + Math.PI / 2, 0, s * R(0.9, 1.3), s, s * 1.5), C.mintDeep);
  }
  aoSpots.push([x, z, 1.1 * s, 0.2]);
}
function lamp(x, z) {
  lampPos.push([x, z]);
  add(G.cyl(0.07, 0.1, 3.2, 6), M(x, 1.6, z), C.inkSoft);
  add(G.box(0.42, 0.08, 0.42), M(x, 3.25, z), C.inkSoft);
  add(G.box(0.32, 0.44, 0.32), M(x, 3.5, z), C.butter, { emissive: '#ffcc66', ei: 0.9, cast: false });
  add(G.cone(0.34, 0.3, 4), M(x, 3.86, z, 0, Math.PI / 4, 0), C.inkSoft);
  staticCyl(x, z, 0.14, 3.3);
  aoSpots.push([x, z, 0.8, 0.22]);
}
function bench(x, z, ry) {
  const T = M(x, 0, z, 0, ry, 0);
  add(G.box(2.0, 0.1, 0.62), T.clone().multiply(M(0, 0.48, 0)), C.wood);
  add(G.box(2.0, 0.5, 0.08), T.clone().multiply(M(0, 0.82, -0.3, -0.15)), C.wood);
  for (const sx of [-0.85, 0.85]) add(G.box(0.1, 0.48, 0.55), T.clone().multiply(M(sx, 0.24, 0)), C.inkSoft);
  staticBox(x, 0.5, z, 1.0, 0.5, 0.32, ry);
  aoSpots.push([x, z, 1.4, 0.2]);
}
function planter(x, z, s = 1) {
  add(G.cyl(0.55 * s, 0.42 * s, 0.6 * s, 8), M(x, 0.3 * s, z), C.terracotta);
  staticCyl(x, z, 0.55 * s, 0.6 * s);
}

/* =====================================================================
   build the park
   ===================================================================== */
const pads = [];      // { stand, pos, mesh, marker, on }
const tex = new THREE.TextureLoader();
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function basic(map, o = {}) { const m = new THREE.MeshBasicMaterial({ map, transparent: !!o.transparent, toneMapped: false, side: o.side || THREE.FrontSide }); return patch(m, { key: 'b' }); }

function posterTex(s) {
  return canvasTex(1024, 768, (x, w, h) => {
    x.fillStyle = '#fbf3e6'; x.fillRect(0, 0, w, h);
    x.fillStyle = s.color; x.fillRect(0, 0, w, 96);
    x.fillStyle = C.ink; x.font = '400 36px "Space Mono"'; x.textBaseline = 'middle';
    x.fillText((s.badge || s.kind).toUpperCase(), 48, 50);
    x.font = '800 108px Syne';
    const title = (s.title || '').toUpperCase();
    const fit = Math.min(1, 920 / Math.max(1, x.measureText(title).width));
    x.save(); x.translate(48, 280); x.scale(fit, fit); x.fillText(title, 0, 0); x.restore();
    x.font = '500 40px "General Sans", sans-serif';
    x.fillStyle = 'rgba(42,29,56,.72)';
    const line = s.line || '';
    const words = line.split(' ');
    let row = '', y = 420;
    for (const word of words) {
      const next = row ? row + ' ' + word : word;
      if (x.measureText(next).width > 900) { x.fillText(row, 48, y); row = word; y += 52; }
      else row = next;
    }
    if (row) x.fillText(row, 48, y);
  });
}

function buildStand(s, imgTex) {
  const p = polar(s.angle, STAND_R);
  const rotY = faceY(p), SC = 1.25;
  const T = M(p.x, 0, p.z, 0, rotY, 0, SC);
  const L = (...a) => T.clone().multiply(M(...a));
  add(G.box(6.4, 0.42, 4.2), L(0, 0.21, 0), s.color);
  add(G.box(6.9, 0.12, 4.7), L(0, 0.06, 0), C.cream);
  for (const sx of [-2.25, 2.25]) add(G.cyl(0.12, 0.12, 4.3, 6), L(sx, 2.55, -1.0), C.inkSoft);
  add(G.box(4.9, 3.75, 0.28), L(0, 2.95, -1.0, -0.08), C.cream);
  add(G.box(5.6, 0.16, 1.7), L(0, 4.95, -0.55, 0.2), s.color);
  for (let i = 0; i < 5; i++) add(G.box(0.55, 0.06, 1.72), L(-2.2 + i * 1.1, 5.04, -0.53, 0.2), C.cream, { outline: false });
  // little garden either side
  for (const sx of [-2.75, 2.75]) {
    add(G.cyl(0.42, 0.32, 0.55, 8), L(sx, 0.69, 1.25), C.terracotta);
    add(G.ico(0.55, 0), L(sx, 1.3, 1.25, 0.4, 0.2, 0, 1, 1.1, 1), C.mintDeep, { sway: false });
  }
  // the image board
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.45, 3.34), basic(imgTex || posterTex(s))); s._board = board;
  board.applyMatrix4(L(0, 2.95, -0.855, -0.08)); scene.add(board);
  // hanging name strip on the awning lip
  const strip = canvasTex(1024, 128, (x, w, h) => {
    x.fillStyle = '#fbf3e6'; x.fillRect(0, 0, w, h);
    x.fillStyle = C.ink; x.font = '800 74px Syne'; x.textBaseline = 'middle';
    const label = (s.n ? s.n + '  ' : '') + s.title.toUpperCase();
    const fit = Math.min(1, 700 / x.measureText(label).width);
    x.save(); x.translate(40, h / 2 + 4); x.scale(fit, fit); x.fillText(label, 0, 0); x.restore();
    x.font = '400 26px "Space Mono"'; x.textAlign = 'right'; x.fillStyle = 'rgba(42,29,56,.6)';
    x.fillText((s.section || s.kind).toUpperCase(), w - 40, h / 2 + 4);
  });
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.7), basic(strip));
  sm.applyMatrix4(L(0, 4.62, 0.33, -0.05)); scene.add(sm);
  staticBox(p.x, 0.5, p.z, 3.4 * SC, 0.5, 2.3 * SC, rotY);
  const bp = new THREE.Vector3(0, 0, -1.0).applyMatrix4(T); // board footprint
  staticBox(bp.x, 3, bp.z, 2.5 * SC, 3, 0.35, rotY);
  aoSpots.push([p.x, p.z, 3.2, 0.08]);
  return { group: [board, sm] };
}

function buildGreenhouse(s) {
  const p = polar(s.angle, STAND_R + 1);
  const rotY = faceY(p);
  const T = M(p.x, 0, p.z, 0, rotY, 0);
  const L = (...a) => T.clone().multiply(M(...a));
  const W = 3.6, D = 2.6, H = 2.7, RH = 1.5;
  add(G.box(W * 2 + 0.8, 0.3, D * 2 + 0.8), L(0, 0.15, 0), C.cream);
  // posts and rails
  for (let i = 0; i <= 6; i++) { const x = -W + i * (2 * W / 6); for (const z of [-D, D]) if (!(z === D && (i === 3))) add(G.box(0.12, H, 0.12), L(x, 0.3 + H / 2, z), C.cream); }
  for (let i = 1; i < 4; i++) { const z = -D + i * (2 * D / 4); for (const x of [-W, W]) add(G.box(0.12, H, 0.12), L(x, 0.3 + H / 2, z), C.cream); }
  for (const z of [-D, D]) add(G.box(2 * W + 0.12, 0.14, 0.14), L(0, 0.3 + H, z), C.cream);
  for (const x of [-W, W]) add(G.box(0.14, 0.14, 2 * D), L(x, 0.3 + H, 0), C.cream);
  // roof rafters (gable along x)
  const slope = Math.atan2(RH, D), rl = Math.hypot(RH, D);
  for (let i = 0; i <= 6; i++) { const x = -W + i * (2 * W / 6); for (const sz of [-1, 1]) add(G.box(0.1, 0.1, rl), L(x, 0.3 + H + RH / 2, sz * D / 2, sz * slope), C.cream); }
  add(G.box(2 * W + 0.3, 0.16, 0.16), L(0, 0.3 + H + RH, 0), C.cream);
  // door
  add(G.box(1.1, 2.1, 0.08), L(0, 1.35, D + 0.02), C.wood);
  // inside: desk, monitor, plants
  add(G.box(2.6, 0.1, 1.0), L(-1.2, 1.15, -1.4), C.wood);
  for (const sx of [-2.35, -0.05]) add(G.box(0.1, 0.85, 0.9), L(sx, 0.72, -1.4), C.inkSoft);
  add(G.box(1.1, 0.7, 0.07), L(-1.2, 1.7, -1.75), C.ink);
  add(G.box(0.98, 0.58, 0.02), L(-1.2, 1.7, -1.7), C.mint, { emissive: '#7fe6c4', ei: 0.9, outline: false, cast: false });
  for (const [x, z, sc] of [[2.4, -1.5, 1.2], [1.4, -1.8, 0.9], [2.6, 1.2, 1], [-3, 1.4, 0.8]]) { add(G.cyl(0.3, 0.24, 0.45, 8), L(x, 0.52, z), C.terracotta); monsteraLocal(L, x, z, sc); }
  // glass
  const glassMat = toon('#e9f3ff', { opacity: 0.32 });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2 * W, H, 2 * D), glassMat);
  glass.applyMatrix4(L(0, 0.3 + H / 2, 0)); glass.renderOrder = 2; scene.add(glass);
  for (const sz of [-1, 1]) {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, rl), glassMat);
    roof.material.side = THREE.DoubleSide;
    roof.applyMatrix4(L(0, 0.3 + H + RH / 2, sz * D / 2, -Math.PI / 2 + sz * slope)); roof.renderOrder = 2; scene.add(roof);
  }
  staticBox(p.x, 1.5, p.z, W + 0.3, 1.5, D + 0.3, rotY);
  aoSpots.push([p.x, p.z, 3.2, 0.08]);
}
function monsteraLocal(L, x, z, s) {
  for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; add(G.cyl(0, 0.36, 0.05, 7), L(x + Math.cos(a) * 0.3 * s, 0.85 + R(0, 0.35) * s, z + Math.sin(a) * 0.3 * s, R(0.3, 0.7), -a + Math.PI / 2, 0, s, s, s * 1.5), C.mintDeep, { sway: false }); }
}

function buildSign(s) {
  const p = polar(s.angle, STAND_R);
  const rotY = faceY(p, 3);
  const T = M(p.x, 0, p.z, 0, rotY, 0);
  const L = (...a) => T.clone().multiply(M(...a));
  for (const sx of [-2.6, 2.6]) add(G.box(0.3, 4.6, 0.3), L(sx, 2.3, 0), C.inkSoft);
  add(G.box(6.4, 3.0, 0.3), L(0, 3.2, 0), s.color);
  add(G.box(6.7, 0.18, 0.5), L(0, 4.8, 0), C.cream);
  const face = canvasTex(1280, 600, (x, w, h) => {
    x.fillStyle = '#fbf3e6'; x.fillRect(0, 0, w, h);
    x.fillStyle = C.ink; x.font = '800 210px Syne'; x.textBaseline = 'alphabetic';
    x.fillText('SAY', 60, 250); x.fillStyle = C.coral; x.fillText('HELLO', 60, 440);
    x.fillStyle = C.ink; x.font = '400 36px "Space Mono"'; x.fillText('AAYANIRSHAD99@GMAIL.COM', 66, 530);
    x.strokeStyle = C.ink; x.lineWidth = 6; x.beginPath(); x.arc(1110, 190, 90, 0, 6.29); x.stroke();
    x.font = '800 120px Syne'; x.textAlign = 'center'; x.fillText('↓', 1110, 232);
  });
  const fm = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 2.8), basic(face)); s._board = fm;
  fm.applyMatrix4(L(0, 3.2, 0.16)); scene.add(fm);
  // mailbox
  add(G.box(0.14, 1.1, 0.14), L(3.6, 0.55, 1.2), C.inkSoft);
  add(G.box(0.55, 0.45, 0.8), L(3.6, 1.32, 1.2), C.butter);
  add(G.box(0.05, 0.4, 0.12), L(3.9, 1.6, 1.0), C.coral);
  staticBox(p.x, 2, p.z, 3.3, 2, 0.4, rotY);
  aoSpots.push([p.x, p.z, 2.4, 0.08]);
}

/* pads: the place you drive onto */
const padMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, fog: true,
  uniforms: { ...RU, uCol: { value: new THREE.Color() }, uOn: { value: 0 } },
  vertexShader: `#include <fog_pars_vertex>
    varying vec2 vP; varying vec3 vKpW; void main(){ vP = position.xy; vec4 w = modelMatrix*vec4(position,1.); vKpW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform vec3 uCol; uniform float uOn; uniform float uTime; uniform float uReveal; uniform vec2 uCenter; varying vec2 vP; varying vec3 vKpW;
    void main(){ if (distance(vKpW.xz,uCenter) > uReveal) discard;
      float r = length(vP)/2.6; float a = atan(vP.y, vP.x)/6.2831853 + .5;
      float dash = step(.45, fract(a*28. - uTime*.35));
      float edge = smoothstep(.84,.86,r)*smoothstep(1.,.98,r)*mix(dash,1.,uOn);
      float inner = smoothstep(.8,.78,r)*(.28+.42*uOn);
      float pulse = smoothstep(.06,.0,abs(r - fract(uTime*.45)*.8))*.35*(1.-uOn);
      vec3 col = mix(uCol, vec3(.165,.114,.22), edge*.85);
      float al = max(edge, max(inner, pulse));
      gl_FragColor = vec4(col, al);
      #include <fog_fragment>
    }`,
});
function buildPad(s) {
  const pos = polar(s.angle, RING_R);
  const m = new THREE.Mesh(new THREE.CircleGeometry(2.6, 64), padMat.clone());
  m.material.uniforms = { ...RU, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uCol: { value: new THREE.Color(s.color).multiplyScalar(0.95) }, uOn: { value: 0 } };
  m.rotation.x = -Math.PI / 2; m.position.set(pos.x, 0.03, pos.z); m.renderOrder = 1; scene.add(m);
  // the marker: a faceted pin bobbing over the pad
  const pin = new THREE.Group();
  const cone = mesh(G.cone(0.42, 0.95, 4), s.color, { cast: true }); cone.rotation.x = Math.PI;
  const cap = mesh(G.ico(0.26, 0), C.cream); cap.position.y = 0.62;
  pin.add(cone, cap); pin.position.set(pos.x, 2.4, pos.z); scene.add(pin);
  pads.push({ stand: s, pos, mesh: m, pin, on: 0, inside: false });
}

/* knock-over props, all live in the physics world */
const props = [];
const propByBody = new Map();
const BURST_TAGS = new Set(['cone', 'can', 'crate', 'barrel', 'pot', 'aframe', 'name']);
function dynProp(shape, mass, meshObj, x, y, z, ry = 0, tag) {
  const b = new CANNON.Body({ mass, linearDamping: 0.15, angularDamping: 0.2 });
  b.addShape(shape); b.position.set(x, y, z); b.quaternion.setFromEuler(0, ry, 0);
  b.allowSleep = true; b.sleepSpeedLimit = 0.15; b.sleepTimeLimit = 0.6;
  world.addBody(b); scene.add(meshObj);
  const p = { body: b, mesh: meshObj, tag, home: new CANNON.Vec3(x, y, z), down: false, burst: false }; props.push(p); propByBody.set(b, p); return p;
}
function cone(x, z) {
  const g = new THREE.Group();
  const c = mesh(G.cone(0.24, 0.62, 8), C.coral); c.position.y = 0.06;
  const st = mesh(G.cyl(0.165, 0.19, 0.1, 8), C.cream, { outline: false }); st.position.y = 0.02;
  const base = mesh(G.box(0.5, 0.06, 0.5), C.coral); base.position.y = -0.28;
  g.add(c, st, base);
  dynProp(new CANNON.Cylinder(0.08, 0.26, 0.62, 8), 1.5, g, x, 0.31, z, 0, 'cone');
}
function can(x, y, z, col) {
  const g = new THREE.Group();
  const c = mesh(G.cyl(0.26, 0.26, 0.56, 9), col);
  const lid = mesh(G.cyl(0.24, 0.24, 0.04, 9), C.cream, { outline: false }); lid.position.y = 0.29;
  g.add(c, lid);
  dynProp(new CANNON.Cylinder(0.26, 0.26, 0.56, 9), 1.6, g, x, y, z, R(0, 3), 'can');
}
function crate(x, y, z, col, ry) {
  const g = mesh(G.box(0.8, 0.8, 0.8), col);
  const band = mesh(G.box(0.84, 0.16, 0.84), C.cream, { outline: false }); g.add(band);
  dynProp(new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 0.4)), 3, g, x, y, z, ry, 'crate');
}
function pot(x, z) {
  const g = new THREE.Group();
  const c = mesh(G.cyl(0.32, 0.24, 0.5, 8), C.terracotta);
  const pl = mesh(G.ico(0.38, 0), [C.blossom, C.butter, C.lilac][rand() * 3 | 0]); pl.position.y = 0.48; pl.scale.y = 0.9;
  g.add(c, pl);
  dynProp(new CANNON.Cylinder(0.32, 0.24, 0.5, 8), 2.2, g, x, 0.25, z, R(0, 3), 'pot');
}
function ball(x, z) {
  const g = mesh(G.ico(0.7, 1), C.butter);
  const stripe = mesh(new THREE.TorusGeometry(0.7, 0.07, 4, 16), C.coral, { outline: false }); g.add(stripe);
  const b = dynProp(new CANNON.Sphere(0.7), 1.2, g, x, 0.7, z, 0, 'ball');
  b.body.linearDamping = 0.25; b.body.angularDamping = 0.3;
}

function letterBrick(ch, x, z) {
  const w = 0.62, h = 0.96, d = 0.4;
  const tex = canvasTex(128, 160, (ctx, W, H) => {
    ctx.fillStyle = '#fbf3e6'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2a1d38'; ctx.font = '800 108px Syne';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ch, W / 2, H / 2 + 6);
  });
  const g = new THREE.Group();
  g.add(mesh(G.box(w, h, d), C.cream));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, h * 0.9), basic(tex));
  face.position.z = d / 2 + 0.012;
  const back = face.clone(); back.position.z = -(d / 2 + 0.012); back.rotation.y = Math.PI;
  g.add(face, back);
  dynProp(new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)), 2.2, g, x, h / 2, z, 0, 'name');
}
function buildNameBricks() {
  let x = -4.4;
  for (const word of ['AAYAN', 'DESAI']) {
    for (const ch of word) { letterBrick(ch, x, -7.4); x += 0.76; }
    x += 0.42;
  }
}
function buildBrickStack() {
  const w = 0.72, h = 0.26, d = 0.4;
  for (let row = 0; row < 4; row++) for (let i = 0; i < 3; i++) {
    const brick = mesh(G.box(w, h, d), row % 2 ? C.cream : '#f3e4d4');
    dynProp(new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)), 0.7, brick, -9.2 + (i - 1) * 0.76, h / 2 + row * 0.28, 35.4, 0, 'stack');
  }
}
function buildHoop() {
  add(G.cyl(0.08, 0.08, 1.7, 8), M(-1.35, 0.85, 38.6), C.cream);
  add(G.cyl(0.08, 0.08, 1.7, 8), M(1.35, 0.85, 38.6), C.cream);
  add(G.box(2.9, 0.12, 0.12), M(0, 1.64, 38.6), C.coral);
  add(G.box(0.22, 0.32, 0.22), M(-1.35, 1.82, 38.6), C.coral);
  add(G.box(0.22, 0.32, 0.22), M(1.35, 1.82, 38.6), C.coral);
  staticBox(-1.35, 0.85, 38.6, 0.1, 0.85, 0.1);
  staticBox(1.35, 0.85, 38.6, 0.1, 0.85, 0.1);
  staticBox(0, 1.64, 38.6, 1.45, 0.08, 0.08);
}
const projectCards = [];
const socialSigns = [];
function buildProjectEasels(F) {
  const faces = [
    { n: '01', name: 'Internship\nSystem', line: 'Node · HTML · CSS' },
    { n: '02', name: 'Resume AI', line: 'TypeScript · AI' },
    { n: '03', name: 'Scam Shield', line: 'TypeScript · AI' },
    { n: '04', name: 'Detection', line: 'Python · OpenCV' },
    { n: '05', name: 'Hand Snake', line: 'React · MediaPipe' },
  ];
  faces.forEach((card, i) => {
    const lx = (i - 2) * 2.4, lz = 5.4;
    const g = new THREE.Group();
    g.applyMatrix4(F.L(lx, 0, lz, -0.06));
    const postL = mesh(G.box(0.08, 1.2, 0.08), C.ink); postL.position.set(-0.72, 0.6, 0);
    const postR = mesh(G.box(0.08, 1.2, 0.08), C.ink); postR.position.set(0.72, 0.6, 0);
    const frame = mesh(G.box(1.7, 2.2, 0.08), C.cream); frame.position.set(0, 1.7, 0);
    const tex = canvasTex(512, 680, (ctx, w, h) => {
      ctx.fillStyle = '#a9dcb6'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2a1d38'; ctx.fillRect(22, 22, w - 44, h - 44);
      ctx.fillStyle = '#d7f3e2'; ctx.fillRect(40, 40, w - 80, h - 80);
      ctx.fillStyle = '#ff5b3a'; ctx.font = '700 42px "Space Mono"'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(card.n, 64, 130);
      ctx.fillStyle = '#2a1d38'; ctx.font = '800 58px Syne';
      const lines = card.name.split('\n');
      lines.forEach((ln, k) => ctx.fillText(ln, 64, 230 + k * 68));
      ctx.fillStyle = 'rgba(42,29,56,.66)'; ctx.font = '400 26px "Space Mono"';
      ctx.fillText(card.line, 64, 230 + lines.length * 68 + 36);
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 1.92), basic(tex));
    face.position.set(0, 1.7, 0.05);
    g.add(postL, postR, frame, face);
    g.userData.projectIndex = i;
    scene.add(g);
    projectCards.push(g);
  });
  const ground = canvasTex(640, 96, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(42,29,56,.72)';
    ctx.font = '800 42px Syne'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('PROJECTS', w / 2, h / 2);
  });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.48), basic(ground, { transparent: true }));
  label.applyMatrix4(F.L(0, 0.04, 3.15, -Math.PI / 2));
  scene.add(label);
}
function buildSocials(F) {
  const items = [['GITHUB', 'Rapid1234-star'], ['LINKEDIN', 'aayan-desai'], ['EMAIL', 'aayanirshad99']];
  items.forEach((it, i) => {
    const lx = (i - 1) * 2.15, lz = 4.4;
    const g = new THREE.Group();
    g.applyMatrix4(F.L(lx, 0, lz, -0.06));
    const postL = mesh(G.box(0.07, 1.05, 0.07), C.ink); postL.position.set(-0.55, 0.52, 0);
    const postR = mesh(G.box(0.07, 1.05, 0.07), C.ink); postR.position.set(0.55, 0.52, 0);
    const frame = mesh(G.box(1.35, 1.65, 0.08), C.cream); frame.position.set(0, 1.28, 0);
    const tex = canvasTex(420, 520, (ctx, w, h) => {
      ctx.fillStyle = '#f6b3c7'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2a1d38'; ctx.fillRect(18, 18, w - 36, h - 36);
      ctx.fillStyle = '#fbf3e6'; ctx.fillRect(34, 34, w - 68, h - 68);
      ctx.fillStyle = '#2a1d38'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = '800 48px Syne'; ctx.fillText(it[0], 52, 180);
      ctx.fillStyle = 'rgba(42,29,56,.66)'; ctx.font = '400 22px "Space Mono"';
      ctx.fillText(it[1], 52, 240);
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.4), basic(tex));
    face.position.set(0, 1.28, 0.05);
    g.add(postL, postR, frame, face);
    g.userData.contact = true;
    scene.add(g);
    socialSigns.push(g);
  });
}
const bumps = [];
function buildPark(images) {
  // plaza dressing inside the spawn circle
  lamp(-2.7, 2.4);
  bench(2.7, 1.9, -0.5);
  planter(-2.5, 6.9, 1); palm(-2.5, 6.9, 0.8);
  // around the plaza
  for (const a of [40, 140, 220, 320]) { const p = polar(a, PLAZA_R + 0.2); bench(p.x, p.z, Math.atan2(-p.x, -p.z)); }
  // lamps along the ring
  for (let a = 0; a < 360; a += 20) {
    if (STANDS.some(s => Math.abs(((a - s.angle + 540) % 360) - 180) < 14)) continue;
    if ([0, 90, 180, 270].includes(a)) continue;
    const p = polar(a, RING_R + RING_W / 2 + 0.7); lamp(p.x, p.z);
  }
  // stands
  STANDS.forEach((s, i) => {
    if (s.kind === 'about') buildGreenhouse(s);
    else if (s.kind === 'contact') buildSign(s);
    else buildStand(s, null);
    buildPad(s);
  });
  // flower beds
  for (const b of BEDS) {
    for (let i = 0; i < 4; i++) { const a = R(0, 6.28); bush(b.c.x + Math.cos(a) * b.rx * 0.55, b.c.z + Math.sin(a) * b.rz * 0.55, 0.6, [C.mintDeep, C.mint][i % 2]); }
  }
  // skate slab: kickers, a funbox, cans to bowl into
  const ramps = [
    { x: -6, z: 33.5, w: 1.6, l: 2.2, h: 0.95, ry: Math.PI, col: C.lilac },
    { x: 5.5, z: 31.5, w: 1.4, l: 1.8, h: 0.7, ry: Math.PI, col: C.peach },
  ];
  // a kicker on the plaza side of the south spoke so the first jump is close
  ramps.push({ x: 0, z: 15.2, w: 1.5, l: 2.0, h: 0.75, ry: Math.PI, col: C.butter });
  ramps.push({ x: -2.4, z: 40.4, w: 1.3, l: 1.5, h: 0.5, ry: Math.PI, col: C.sky });
  for (const r of ramps) {
    const { geo, shape } = wedge(r.w, r.l, r.h);
    add(geo, M(r.x, 0, r.z, 0, r.ry, 0), r.col);
    add(G.cyl(0.06, 0.06, r.w * 2 + 0.1, 6), M(r.x, r.h, r.z + (r.ry ? 1 : -1) * r.l, 0, 0, Math.PI / 2), C.inkSoft);
    add(G.box(r.w * 2, 0.02, 0.18), M(r.x, 0.01, r.z + (r.ry ? -1 : 1) * (r.l - 0.09)), C.cream, { outline: false, cast: false });
    const b = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC }); b.addShape(shape);
    b.position.set(r.x, 0, r.z); b.quaternion.setFromEuler(0, r.ry, 0); world.addBody(b);
    bumps.push({ x: r.x, z: r.z + (r.ry ? 1 : -1) * r.l, rad: 1.25, hot: false });
    aoSpots.push([r.x, r.z, 2.6, 0.18]);
  }
  { // funbox: up, flat, down
    const fx = 5.5, fz = 37.2, h = 0.7;
    const up = wedge(1.6, 1.4, h), dn = wedge(1.6, 1.4, h);
    add(up.geo, M(fx - 2.6, 0, fz, 0, -Math.PI / 2, 0), C.mint);
    add(dn.geo, M(fx + 2.6, 0, fz, 0, Math.PI / 2, 0), C.mint);
    add(G.box(2.4, h, 3.2), M(fx, h / 2, fz), C.mint);
    add(G.box(2.6, 0.08, 0.08), M(fx, h + 0.45, fz), C.inkSoft);
    for (const sx of [-1.1, 1.1]) add(G.box(0.08, 0.45, 0.08), M(fx + sx, h + 0.22, fz), C.inkSoft);
    for (const [w, x, ry] of [[up, fx - 2.6, -Math.PI / 2], [dn, fx + 2.6, Math.PI / 2]]) {
      const b = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC }); b.addShape(w.shape); b.position.set(x, 0, fz); b.quaternion.setFromEuler(0, ry, 0); world.addBody(b);
    }
    staticBox(fx, h / 2, fz, 1.2, h / 2, 1.6);
    bumps.push({ x: fx, z: fz, rad: 2.1, hot: false });
    aoSpots.push([fx, fz, 4, 0.18]);
  }
  buildNameBricks();
  buildBrickStack();
  buildHoop();
  // paint can pyramid, right where the lilac kicker lands
  const cols = [C.pink, C.butter, C.mint, C.lilac, C.peach, C.sky];
  let k = 0;
  for (let row = 0; row < 4; row++) for (let i = 0; i < 4 - row; i++) can(-6 + (i - (3 - row) / 2) * 0.56, 0.28 + row * 0.565, 39.2, cols[k++ % cols.length]);
  // cone slalom down the east spoke
  for (let i = 0; i < 6; i++) cone(11 + i * 1.6, (i % 2 ? 1 : -1) * 0.9);
  // crate stack by the sign
  { const p = polar(150, 27.5); let n = 0; for (let row = 0; row < 3; row++) for (let i = 0; i < 3 - row; i++) crate(p.x + (i - (2 - row) / 2) * 0.84, 0.4 + row * 0.81, p.z, [C.peach, C.sky, C.pink, C.butter, C.lilac, C.mint][n++ % 6], 0.3); }
  // flower pots along the west spoke
  for (let i = 0; i < 5; i++) pot(-12 - i * 1.5, (i % 2 ? 1.2 : -1.2));
  // a big beach ball in the plaza
  ball(5.5, -2.5);

  dressPark(images);

  // trees + shrubs, never on paving
  const kinds = ['blossom', 'blossom', 'mint', 'butter', 'lilac', 'deep'];
  let placed = 0, tries = 0;
  const trees = [];
  while (placed < 95 && tries < 6000) {
    tries++;
    const a = R(0, 6.28), r = Math.sqrt(R(0.04, 1)) * 45;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (blocked(x, z, 2.2)) continue;
    if (trees.some(t => Math.hypot(t[0] - x, t[1] - z) < 3.4)) continue;
    // keep the camera's foreground (south) lighter so the kart is never buried
    const nearSkate = z > 24 && Math.abs(x) < 20;
    if (nearSkate && rand() < 0.5) { palm(x, z, R(0.9, 1.2)); trees.push([x, z]); placed++; continue; }
    tree(x, z, kinds[rand() * kinds.length | 0], R(0.85, 1.25)); trees.push([x, z]); placed++;
  }
  for (let i = 0, n = 0; i < 2000 && n < 70; i++) {
    const a = R(0, 6.28), r = Math.sqrt(R(0.05, 1)) * 46;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (blocked(x, z, 1.0) || trees.some(t => Math.hypot(t[0] - x, t[1] - z) < 1.8)) continue;
    rand() < 0.5 ? monstera(x, z, R(0.8, 1.3)) : bush(x, z, R(0.7, 1.1), [C.mintDeep, C.mint, C.blossom][rand() * 3 | 0]); n++;
  }
  // the boundary: a hedge ring + invisible wall
  for (let a = 0; a < 360; a += 5.5) {
    const p = polar(a, 49);
    add(G.box(4.9, 1.3, 1.6), M(p.x, 0.65, p.z, 0, -a * DEG, 0), C.hedge);
    const w = polar(a, 49.2); staticBox(w.x, 1.5, w.z, 2.6, 1.5, 0.8, -a * DEG);
  }
  buildBatch();
}

/* =====================================================================
   set dressing: every zone gets its furniture, every stand its own set piece
   ===================================================================== */
function standFrame(s) {
  const r = s.kind === 'about' ? STAND_R + 1 : STAND_R;
  const p = polar(s.angle, r);
  const rotY = s.kind === 'contact' ? faceY(p, 3) : faceY(p);
  const T = M(p.x, 0, p.z, 0, rotY, 0);
  return { p, rotY, T, L: (...a) => T.clone().multiply(M(...a)), at: (lx, lz) => new THREE.Vector3(lx, 0, lz).applyMatrix4(T) };
}
function seg(a, b, y, color, thick = 0.05) { // a box spanning two ground points
  const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
  add(G.box(thick, thick, len), M((a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2, 0, Math.atan2(dx, dz), 0), color, { outline: false });
}
const wire = patch(new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.8 }), { key: 'wire', noGlow: true });
const bulbSpots = [];
function stringLights(a, b, ya, yb, sag, n = 9) {
  const pts = [];
  for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * u, ya + (yb - ya) * u - sag * 4 * u * (1 - u), a[1] + (b[1] - a[1]) * u)); }
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wire); scene.add(l);
  for (let i = 1; i < n; i++) { const u = i / n; bulbSpots.push([a[0] + (b[0] - a[0]) * u, ya + (yb - ya) * u - sag * 4 * u * (1 - u) - 0.09, a[1] + (b[1] - a[1]) * u]); }
}
function buildBulbs() {
  const cols = ['#ffe6a0', '#ffb7c8', '#b9f3dc', '#fff3df', '#ffcf9a'].map(c => new THREE.Color(c).multiplyScalar(1.35));
  const mat = patch(new THREE.MeshBasicMaterial({ color: 0xffffff }), { key: 'bulb', noGlow: true });
  const im = new THREE.InstancedMesh(G.ico(0.13, 1), mat, bulbSpots.length);
  bulbSpots.forEach((b, i) => { _m.compose(_v.set(...b), _q.identity(), _s.setScalar(1)); im.setMatrixAt(i, _m); im.setColorAt(i, cols[i % cols.length]); });
  scene.add(im);
}
function pole(x, z, h = 3.7) { add(G.cyl(0.05, 0.07, h, 6), M(x, h / 2, z), C.inkSoft); add(G.ico(0.09, 0), M(x, h, z), C.coral, { outline: false }); staticCyl(x, z, 0.1, h); occ.push([x, z, 0.6]); }
function flowersOn(x, y, z, n, spread, cols = [C.pink, C.butter, C.lilac, '#fff6ea', C.peach]) {
  for (let i = 0; i < n; i++) add(G.ico(R(0.09, 0.14), 0), M(x + R(-spread, spread), y + R(0, 0.12), z + R(-spread * 0.5, spread * 0.5), R(0, 3), R(0, 3), 0), cols[rand() * cols.length | 0], { outline: false, cast: false });
}
function planterBox(x, z, ry) {
  const T = M(x, 0, z, 0, ry, 0), L = (...a) => T.clone().multiply(M(...a));
  add(G.box(1.7, 0.55, 0.72), L(0, 0.275, 0), C.wood);
  add(G.box(1.5, 0.06, 0.55), L(0, 0.56, 0), '#c99b86', { outline: false, cast: false });
  for (let i = 0; i < 4; i++) add(G.ico(R(0.22, 0.3), 0), L(-0.6 + i * 0.4, R(0.72, 0.85), R(-0.1, 0.1), R(0, 3), R(0, 3), 0, 1, 0.8, 1), [C.mintDeep, C.mint][i % 2], { sway: false });
  const w = new THREE.Vector3(0, 0, 0).applyMatrix4(T);
  for (let i = 0; i < 5; i++) { const q = new THREE.Vector3(R(-0.7, 0.7), R(0.85, 1.05), R(-0.15, 0.15)).applyMatrix4(T); add(G.ico(R(0.1, 0.14), 0), M(q.x, q.y, q.z), [C.pink, C.butter, C.lilac, C.coral][i % 4], { outline: false, cast: false }); }
  staticBox(w.x, 0.4, w.z, 0.85, 0.4, 0.36, ry); occ.push([w.x, w.z, 1.3]); aoSpots.push([w.x, w.z, 1.3, 0.2]);
}
function signBoard(lines, w = 2.2) {
  return canvasTex(512, 116 * lines.length, (x, W, H) => {
    lines.forEach((l, i) => {
      const y0 = i * 116;
      x.fillStyle = l.bg || '#fbf3e6'; x.beginPath(); x.roundRect(6, y0 + 8, W - 12, 100, 18); x.fill();
      x.strokeStyle = C.ink; x.lineWidth = 5; x.stroke();
      x.fillStyle = l.ink || C.ink; x.font = '800 46px Syne'; x.textBaseline = 'middle';
      x.textAlign = l.right ? 'right' : 'left';
      const fit = Math.min(1, (W - 70) / x.measureText(l.t).width);
      x.save(); x.translate(l.right ? W - 34 : 34, y0 + 60); x.scale(fit, fit); x.fillText(l.t, 0, 0); x.restore();
    });
  });
}
function signpost(x, z, lines) {
  add(G.cyl(0.07, 0.09, 3.1, 6), M(x, 1.55, z), C.inkSoft);
  const t = signBoard(lines); const h = 0.5 * lines.length;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, h), basic(t)); m.position.set(x + Math.sin(CAM_YAW) * 0.16, 2.95 - h / 2, z + Math.cos(CAM_YAW) * 0.16); m.rotation.y = CAM_YAW; scene.add(m);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(2.2, h), toon(C.inkSoft)); back.position.copy(m.position).addScaledVector(new THREE.Vector3(Math.sin(CAM_YAW), 0, Math.cos(CAM_YAW)), -0.03); back.rotation.y = CAM_YAW + Math.PI; scene.add(back);
  staticCyl(x, z, 0.12, 3); occ.push([x, z, 1.2]); aoSpots.push([x, z, 0.8, 0.2]);
}
function fenceAround(b) {
  const ang = Math.atan2(b.c.z, b.c.x) + Math.PI / 2, toC = Math.atan2(-b.c.z, -b.c.x);
  const pts = [];
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2;
    const lx = Math.cos(a) * (b.rx + 0.55), lz = Math.sin(a) * (b.rz + 0.55);
    const x = b.c.x + lx * Math.cos(ang) - lz * Math.sin(ang), z = b.c.z + lx * Math.sin(ang) + lz * Math.cos(ang);
    const gap = Math.abs(((Math.atan2(z - b.c.z, x - b.c.x) - toC + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.45;
    pts.push([x, z, gap]);
  }
  pts.forEach((q, i) => {
    if (q[2]) return;
    add(G.box(0.09, 0.62, 0.09), M(q[0], 0.31, q[1]), C.cream);
    add(G.cone(0.075, 0.12, 4), M(q[0], 0.68, q[1], 0, Math.PI / 4, 0), C.cream, { outline: false });
    const n = pts[(i + 1) % pts.length]; if (n[2]) return;
    seg(q, n, 0.46, C.cream, 0.06); seg(q, n, 0.22, C.cream, 0.06);
    const mx = (q[0] + n[0]) / 2, mz = (q[1] + n[1]) / 2, len = Math.hypot(n[0] - q[0], n[1] - q[1]);
    staticBox(mx, 0.35, mz, 0.05, 0.35, len / 2, Math.atan2(n[0] - q[0], n[1] - q[1]));
  });
}

/* --- per-stand set pieces --- */
const standFx = []; // { s, pos, w } proximity glow targets
function badgeTotem(s, F, badgeTex) {
  const base = F.at(-5.0, 1.6);
  add(G.cyl(0.09, 0.12, 3.5, 6), M(base.x, 1.75, base.z), C.inkSoft);
  add(G.cyl(0.4, 0.5, 0.25, 8), M(base.x, 0.125, base.z), s.color);
  const g = new THREE.Group(); g.position.set(base.x, 3.95, base.z); g.rotation.y = F.rotY;
  const rim = mesh(new THREE.TorusGeometry(0.98, 0.08, 6, 28), s.color); g.add(rim);
  const backing = new THREE.Mesh(new THREE.CircleGeometry(0.98, 32), toon(C.cream)); backing.position.z = -0.01; backing.rotation.y = Math.PI; g.add(backing);
  if (badgeTex) { const face = new THREE.Mesh(new THREE.CircleGeometry(0.95, 40), basic(badgeTex)); face.position.z = 0.02; g.add(face); }
  scene.add(g); staticCyl(base.x, base.z, 0.16, 3.5); occ.push([base.x, base.z, 1.2]); aoSpots.push([base.x, base.z, 1.1, 0.22]);
  return g;
}
function aFrame(s, F) {
  const at = F.at(-3.2, 3.6);
  const g = new THREE.Group();
  const face = canvasTex(512, 384, (x, W, H) => {
    x.fillStyle = '#fbf3e6'; x.fillRect(0, 0, W, H);
    x.fillStyle = s.color; x.fillRect(0, 0, W, 84);
    x.fillStyle = C.ink; x.font = '400 34px "Space Mono"'; x.textBaseline = 'middle'; x.fillText(s.n ? `STAND ${s.n}` : s.kind.toUpperCase(), 30, 44);
    x.font = '800 74px Syne'; const t = (s.kind === 'project' ? s.title : s.short).toUpperCase();
    const fit = Math.min(1, (W - 60) / x.measureText(t).width); x.save(); x.translate(30, 190); x.scale(fit, fit); x.fillText(t, 0, 0); x.restore();
    x.font = '700 40px Syne'; x.fillStyle = C.coral; x.fillText('pull up on the pad →', 30, 300);
  });
  for (const sd of [-1, 1]) {
    const panel = new THREE.Group(); panel.rotation.x = sd * 0.24; panel.position.z = sd * 0.28;
    const bd = mesh(G.box(0.9, 1.15, 0.05), C.cream); bd.position.set(0, 0.575, 0); panel.add(bd);
    const fm = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.63), basic(face)); fm.position.set(0, 0.68, sd * 0.035); if (sd < 0) fm.rotation.y = Math.PI; panel.add(fm);
    g.add(panel);
  }
  g.children.forEach(c => c.position.y = -0.55);
  const p = dynProp(new CANNON.Box(new CANNON.Vec3(0.45, 0.55, 0.28)), 3, g, at.x, 0.56, at.z, F.rotY + Math.PI, 'aframe');
  return p;
}
function setTidePool(s, F) {
  const c = F.at(6.2, 0.6);
  for (let i = 0; i < 13; i++) { const a = i / 13 * 6.28 + R(0, 0.3); add(G.dodo(R(0.32, 0.55)), M(c.x + Math.cos(a) * 1.95, 0.14, c.z + Math.sin(a) * 1.95, R(0, 3), R(0, 3), 0, 1, 0.55, 1), ['#d9cfe2', '#e8dccb', '#cfc4dc'][i % 3]); }
  const water = new THREE.Mesh(new THREE.CircleGeometry(1.8, 48), new THREE.ShaderMaterial({
    transparent: true, fog: true,
    uniforms: { ...RU, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uDeep: { value: new THREE.Color('#5fc4c4') }, uShal: { value: new THREE.Color('#b8f0e2') } },
    vertexShader: `#include <fog_pars_vertex>
      varying vec2 vU; varying vec3 vKpW; void main(){ vU = uv; vec4 w = modelMatrix * vec4(position, 1.); vKpW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: `#include <fog_pars_fragment>
      uniform vec3 uDeep; uniform vec3 uShal; uniform float uTime; uniform float uReveal; uniform vec2 uCenter; varying vec2 vU; varying vec3 vKpW;
      void main(){ if (distance(vKpW.xz, uCenter) > uReveal) discard;
        float r = length(vU - .5) * 2.;
        float rip = sin(r * 26. - uTime * 2.6) * .5 + .5;
        float ca = sin(vKpW.x * 5.3 + uTime * 1.2) * sin(vKpW.z * 6.1 - uTime * 1.05) + sin((vKpW.x + vKpW.z) * 3.7 + uTime * .8) * .5;
        vec3 c = mix(uDeep, uShal, smoothstep(.15, 1., r) * .7 + ca * .1 + rip * .05);
        c += vec3(1.) * smoothstep(.55, 1.2, ca) * .16 + smoothstep(.9, 1., r) * .18;
        gl_FragColor = vec4(c, .9);
        #include <fog_fragment>
      }`,
  }));
  water.rotation.x = -Math.PI / 2; water.position.set(c.x, 0.13, c.z); scene.add(water);
  add(G.cyl(1.85, 1.85, 0.12, 24), M(c.x, 0.05, c.z), '#7fcfc8', { outline: false, cast: false });
  // starfish on the rocks
  const star = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283, rr = i % 2 ? 0.1 : 0.26; i ? star.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : star.moveTo(rr, 0); }
  const sg = new THREE.ExtrudeGeometry(star, { depth: 0.05, bevelEnabled: false }); sg.rotateX(-Math.PI / 2);
  add(sg, M(c.x + 1.7, 0.36, c.z + 0.9, 0, 0.4, 0), C.coral); add(sg, M(c.x - 1.5, 0.33, c.z - 1.2, 0, 1.4, 0, 0.8), C.butter);
  // fish circling under the surface
  const fish = [];
  for (let i = 0; i < 4; i++) { const f = mesh(G.cone(0.08, 0.32, 5), [C.coral, C.butter, C.peach, C.lilac][i], { outline: false, cast: false }); f.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.add(f); scene.add(g); fish.push(g); }
  updaters.push((dt, t) => fish.forEach((g, i) => { const a = t * (0.6 + i * 0.13) * (i % 2 ? 1 : -1) + i * 1.7, r = 0.6 + i * 0.25; g.position.set(c.x + Math.cos(a) * r, 0.1, c.z + Math.sin(a) * r); g.rotation.y = -a + (i % 2 ? Math.PI : 0); }));
  staticCyl(c.x, c.z, 2.3, 0.4); occ.push([c.x, c.z, 2.8]); aoSpots.push([c.x, c.z, 2.8, 0.18]);
}
function setBook(s, F) {
  const c = F.at(6.0, 0.6);
  const T = M(c.x, 0, c.z, 0, F.rotY - 0.3, 0), L = (...a) => T.clone().multiply(M(...a));
  add(G.box(3.4, 0.16, 2.3), L(0, 0.08, 0), C.peach);
  for (const sx of [-1, 1]) {
    add(G.box(1.55, 0.26, 2.1), L(sx * 0.82, 0.32, 0, 0, 0, sx * -0.09), C.cream);
    for (let i = 0; i < 3; i++) add(G.box(1.4, 0.012, 1.9), L(sx * 0.82, 0.47 + i * 0.001, 0, 0, 0, sx * -0.09), '#efe3d0', { outline: false, cast: false });
  }
  // the pressed flower
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; add(G.cyl(0.24, 0.24, 0.02, 10), L(0.85 + Math.cos(a) * 0.3, 0.5, Math.sin(a) * 0.3, 0, -a, 0, 1, 1, 0.55).multiply(M(0.15, 0, 0)), C.pink, { outline: false }); }
  add(G.cyl(0.14, 0.14, 0.04, 10), L(0.85, 0.52, 0), C.butter, { outline: false });
  add(G.box(0.04, 0.02, 0.9), L(0.85, 0.5, 0.65, 0, 0.3, 0), C.mintDeep, { outline: false });
  // a brass magnifier leaning on the spine
  add(new THREE.TorusGeometry(0.42, 0.06, 6, 20), L(-0.6, 1.05, -0.5, 0.2, 0.5, 0), '#e7c27a');
  add(G.cyl(0.05, 0.05, 0.8, 6), L(-0.95, 0.5, -0.25, 0.2, 0.5, 0.75), C.wood);
  // filed folders
  for (let i = 0; i < 4; i++) add(G.box(0.12, 0.9, 0.7), L(-2.2 + i * 0.14, 0.45, 0.9, 0, 0, 0.05 * i), [C.mint, C.lilac, C.butter, C.pink][i]);
  staticBox(c.x, 0.4, c.z, 1.8, 0.4, 1.3, F.rotY - 0.3); occ.push([c.x, c.z, 2.6]); aoSpots.push([c.x, c.z, 2.6, 0.2]);
}
function setBoombox(s, F) {
  const c = F.at(6.0, 0.4);
  const T = M(c.x, 0, c.z, 0, F.rotY, 0), L = (...a) => T.clone().multiply(M(...a));
  add(G.box(2.6, 1.45, 0.9), L(0, 0.73, 0), C.lilac);
  add(G.box(2.7, 0.12, 1.0), L(0, 0.06, 0), C.inkSoft);
  add(G.box(1.8, 0.08, 0.1), L(0, 1.75, 0), C.inkSoft); for (const sx of [-0.85, 0.85]) add(G.box(0.08, 0.36, 0.1), L(sx, 1.58, 0), C.inkSoft);
  add(G.box(0.8, 0.35, 0.05), L(0, 0.95, 0.46), C.cream);
  add(G.box(0.5, 0.12, 0.06), L(0, 0.95, 0.48), C.ink, { outline: false });
  for (let i = 0; i < 4; i++) add(G.cyl(0.05, 0.05, 0.06, 8), L(-0.3 + i * 0.2, 1.32, 0.46, Math.PI / 2, 0, 0), [C.coral, C.butter, C.mint, C.cream][i], { outline: false });
  const speakers = [];
  for (const sx of [-0.85, 0.85]) {
    const sp = new THREE.Group(); sp.applyMatrix4(L(sx, 0.7, 0.46));
    const outer = mesh(G.cyl(0.48, 0.48, 0.08, 16), C.ink); outer.rotation.x = Math.PI / 2;
    const cone = mesh(G.cone(0.38, 0.22, 16), C.cream, { outline: false }); cone.rotation.x = -Math.PI / 2; cone.position.z = 0.06;
    const cap = mesh(G.cyl(0.1, 0.1, 0.06, 10), C.coral, { outline: false }); cap.rotation.x = Math.PI / 2; cap.position.z = 0.16;
    sp.add(outer, cone, cap); scene.add(sp); speakers.push(sp);
  }
  // sound rings that rise and fade off the speakers
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 5, 30, Math.PI), patch(new THREE.MeshBasicMaterial({ color: C.lilac, transparent: true, depthWrite: false }), { key: 'ringfx', noGlow: true }));
    m.applyMatrix4(L(0, 1.9, 0.2)); scene.add(m); rings.push(m);
  }
  const base = rings.map(r => r.position.clone());
  updaters.push((dt, t) => {
    const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * 1.9)), 10);
    speakers.forEach(sp => sp.scale.setScalar(1 + beat * 0.12));
    rings.forEach((r, i) => { const k = (t * 0.45 + i / 3) % 1; r.scale.setScalar(0.6 + k * 1.8); r.position.copy(base[i]).y += k * 1.6; r.material.opacity = (1 - k) * 0.8; });
  });
  staticBox(c.x, 0.8, c.z, 1.35, 0.8, 0.5, F.rotY); occ.push([c.x, c.z, 2.2]); aoSpots.push([c.x, c.z, 2.2, 0.22]);
}
function setKites(s, F) {
  const c = F.at(6.0, 0.8);
  add(G.cone(1.25, 1.5, 8), M(c.x, 1.65, c.z), C.mint);
  add(G.cyl(1.25, 1.25, 0.9, 8), M(c.x, 0.45, c.z), C.cream);
  for (let i = 0; i < 8; i++) add(G.box(0.3, 0.88, 0.04), M(c.x + Math.cos(i / 8 * 6.28) * 1.26, 0.45, c.z + Math.sin(i / 8 * 6.28) * 1.26, 0, -i / 8 * 6.28 + Math.PI / 2, 0), i % 2 ? C.pink : C.butter, { outline: false });
  add(G.ico(0.15, 0), M(c.x, 2.45, c.z), C.coral, { outline: false });
  staticCyl(c.x, c.z, 1.3, 1.5); occ.push([c.x, c.z, 2.2]); aoSpots.push([c.x, c.z, 2, 0.2]);
  const kg = new THREE.BufferGeometry(); kg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.8, 0, -0.55, 0, 0, 0, -1, 0, 0, 0.8, 0, 0, -1, 0, 0.55, 0, 0], 3)); kg.computeVertexNormals();
  const kites = [];
  for (let i = 0; i < 3; i++) {
    const anchor = F.at(4.2 + i * 1.6, 3.0 - i * 0.7);
    add(G.cyl(0.05, 0.05, 0.6, 5), M(anchor.x, 0.3, anchor.z), C.wood);
    const km = new THREE.Mesh(kg, (() => { const m = new THREE.MeshToonMaterial({ color: [C.coral, C.lilac, C.butter][i], gradientMap, side: THREE.DoubleSide }); return patch(m, { key: 'kite' }); })());
    km.castShadow = true;
    const tail = []; for (let j = 0; j < 4; j++) { const b = mesh(G.box(0.18, 0.04, 0.08), [C.mint, C.pink][j % 2], { outline: false }); scene.add(b); tail.push(b); }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), wire); scene.add(line);
    scene.add(km); kites.push({ km, tail, line, anchor, h: 6.5 + i * 1.3, ph: i * 2.1 });
  }
  updaters.push((dt, t) => kites.forEach(k => {
    const x = k.anchor.x + Math.sin(t * 0.5 + k.ph) * 1.6 + camUp.x * 2.4, z = k.anchor.z + Math.cos(t * 0.37 + k.ph) * 1.1 + camUp.z * 2.4, y = k.h + Math.sin(t * 0.9 + k.ph) * 0.5;
    k.km.position.set(x, y, z); k.km.rotation.set(Math.sin(t * 1.3 + k.ph) * 0.25, CAM_YAW + Math.sin(t * 0.7 + k.ph) * 0.4, Math.sin(t * 1.1 + k.ph) * 0.3);
    const pa = k.line.geometry.attributes.position; pa.setXYZ(0, k.anchor.x, 0.6, k.anchor.z); pa.setXYZ(1, x, y - 0.9, z); pa.needsUpdate = true;
    k.tail.forEach((b, j) => b.position.set(x + Math.sin(t * 3 + j) * 0.15 * j, y - 1.25 - j * 0.32, z + Math.cos(t * 2.6 + j) * 0.1 * j));
  }));
}
function setDome(s, F) {
  const c = F.at(6.0, 0.6);
  add(G.cyl(1.55, 1.7, 0.45, 16), M(c.x, 0.225, c.z), C.wood);
  add(G.cyl(1.4, 1.4, 0.08, 16), M(c.x, 0.47, c.z), C.mint, { outline: false });
  add(G.ico(0.8, 1), M(c.x, 0.35, c.z, 0, 0, 0, 1.4, 0.45, 1.2), C.mintDeep);
  for (const [dx, dz, col] of [[-0.45, 0.2, C.peach], [0.35, -0.3, C.pink], [0.5, 0.45, C.cream]]) {
    add(G.box(0.34, 0.3, 0.34), M(c.x + dx, 0.8, c.z + dz), col);
    add(G.cone(0.3, 0.28, 4), M(c.x + dx, 1.09, c.z + dz, 0, Math.PI / 4, 0), C.coral);
  }
  const rainbow = [C.coral, C.butter, C.mint, C.lilac];
  rainbow.forEach((col, i) => add(new THREE.TorusGeometry(1.95 - i * 0.12, 0.06, 5, 24, Math.PI), M(c.x, 0.45, c.z, 0, F.rotY, 0).multiply(M(0, 0, -0.35)), col, { outline: false }));
  const glass = new THREE.Mesh(new THREE.SphereGeometry(1.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#eef6ff', { opacity: 0.28 }));
  glass.position.set(c.x, 0.48, c.z); glass.renderOrder = 2; scene.add(glass);
  const cloud = new THREE.Group(); cloud.position.set(c.x - 0.1, 1.45, c.z);
  for (const [dx, r] of [[-0.25, 0.22], [0, 0.3], [0.27, 0.2]]) { const m = mesh(G.ico(r, 0), '#ffffff', { outline: false }); m.position.x = dx; cloud.add(m); }
  scene.add(cloud);
  const sunb = mesh(G.ico(0.32, 1), C.butter, { emissive: '#ffcf55', ei: 0.7 }); sunb.position.set(c.x + 1.2, 2.5, c.z - 0.4); scene.add(sunb);
  const drops = [];
  for (let i = 0; i < 14; i++) { const d = mesh(G.box(0.025, 0.16, 0.025), '#8fd0ff', { outline: false, cast: false, noAO: true }); scene.add(d); drops.push({ d, o: R(0, 1), x: R(-0.35, 0.3), z: R(-0.2, 0.2) }); }
  updaters.push((dt, t) => {
    cloud.position.x = c.x - 0.1 + Math.sin(t * 0.6) * 0.25;
    sunb.rotation.y = t * 0.6; sunb.position.y = 2.5 + Math.sin(t * 1.2) * 0.12;
    drops.forEach(q => { const k = (t * 1.4 + q.o) % 1; q.d.position.set(cloud.position.x + q.x, 1.3 - k * 0.65, c.z + q.z); });
  });
  staticCyl(c.x, c.z, 1.7, 1.9); occ.push([c.x, c.z, 2.6]); aoSpots.push([c.x, c.z, 2.4, 0.2]);
}
function setGreenhouseYard(s, F) {
  for (let i = 0; i < 6; i++) {
    const q = F.at(-4.4 + i * 0.75, 4.2 + (i % 2) * 0.35);
    const h = R(1.1, 1.6);
    add(G.cyl(0.03, 0.04, h, 5), M(q.x, h / 2, q.z), C.mintDeep, { outline: false });
    add(G.cyl(0.26, 0.26, 0.06, 12), M(q.x, h, q.z, 1.1, F.rotY, 0), C.butter);
    add(G.cyl(0.12, 0.12, 0.08, 10), M(q.x, h, q.z, 1.1, F.rotY, 0).multiply(M(0, 0.02, 0)), '#a2715e', { outline: false });
  }
  const ch = F.at(5.6, 1.2);
  add(G.box(0.5, 1.4, 0.4), M(ch.x, 0.7, ch.z, 0, F.rotY, 0), C.cream);
  add(G.box(0.36, 0.3, 0.02), M(ch.x, 1.05, ch.z, 0, F.rotY, 0).multiply(M(0, 0, 0.21)), '#7fe6c4', { emissive: '#7fe6c4', ei: 1, outline: false, cast: false });
  add(new THREE.TorusGeometry(0.22, 0.04, 5, 12), M(ch.x, 0.5, ch.z, 0, F.rotY, 0).multiply(M(0.3, 0, 0)), C.ink, { outline: false });
  staticBox(ch.x, 0.7, ch.z, 0.3, 0.7, 0.25, F.rotY); occ.push([ch.x, ch.z, 1]);
  const a = F.at(-3.4, -2.4), b = F.at(3.4, -2.4); stringLights([a.x, a.z], [b.x, b.z], 2.9, 2.9, 0.25, 12);
}
function setPaperPlane(s, F) {
  const c = F.at(-7.0, 0.2);
  add(G.cyl(0.08, 0.1, 3.4, 6), M(c.x, 1.7, c.z), C.inkSoft);
  const pg = new THREE.BufferGeometry();
  const V = { n: [0, 0, -1.5], l: [-1.1, 0.05, 0.75], r: [1.1, 0.05, 0.75], c: [0, 0, 0.75], k: [0, -0.42, 0.75] };
  pg.setAttribute('position', new THREE.Float32BufferAttribute([...V.n, ...V.l, ...V.c, ...V.n, ...V.c, ...V.r, ...V.n, ...V.k, ...V.c].map(v => v * 1.2), 3)); pg.computeVertexNormals();
  const pm = new THREE.Mesh(pg, patch(new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap, side: THREE.DoubleSide }), { key: 'plane' })); pm.castShadow = true;
  const holder = new THREE.Group(); holder.position.set(c.x, 3.6, c.z); holder.add(pm); scene.add(holder);
  updaters.push((dt, t) => { holder.rotation.y = F.rotY + Math.PI * 0.5 + Math.sin(t * 0.5) * 0.5; holder.rotation.z = Math.sin(t * 0.9) * 0.15; holder.position.y = 3.6 + Math.sin(t * 1.3) * 0.15; });
  for (let i = 0; i < 9; i++) { const q = F.at(R(-4.8, -2.4), R(1.4, 3.4)); add(G.box(0.5, 0.02, 0.34), M(q.x, 0.02, q.z, 0, R(0, 3), 0), '#fffaf1', { outline: false, cast: false }); add(G.box(0.1, 0.022, 0.1), M(q.x, 0.03, q.z), C.coral, { outline: false, cast: false }); }
  staticCyl(c.x, c.z, 0.14, 3.4); occ.push([c.x, c.z, 1.2]); aoSpots.push([c.x, c.z, 1, 0.2]);
}

/* --- skate furniture --- */
function quarterPipe(x0, z0, ry, w = 5, R0 = 1.7) {
  const prof = new THREE.Shape(); prof.moveTo(0, 0);
  for (let i = 1; i <= 10; i++) { const a = i / 10 * Math.PI / 2; prof.lineTo(Math.sin(a) * R0, R0 - Math.cos(a) * R0); }
  prof.lineTo(R0, R0 + 0.05); prof.lineTo(R0 + 0.3, R0 + 0.05); prof.lineTo(R0 + 0.3, 0); prof.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(prof, { depth: w, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, -w / 2);
  add(g, M(x0, 0, z0, 0, ry, 0), C.lilac);
  add(G.cyl(0.07, 0.07, w + 0.1, 6), M(x0, R0 + 0.06, z0, 0, ry, 0).multiply(M(R0, 0, 0, Math.PI / 2)), C.inkSoft);
  // physics: the curve as a fan of thin tilted boxes
  for (let i = 0; i < 5; i++) {
    const a0 = i / 5 * Math.PI / 2, a1 = (i + 1) / 5 * Math.PI / 2, am = (a0 + a1) / 2;
    const px = Math.sin(am) * R0, py = R0 - Math.cos(am) * R0, len = R0 * (a1 - a0);
    const b = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC }); b.addShape(new CANNON.Box(new CANNON.Vec3(len / 2 + 0.02, 0.06, w / 2)));
    const local = new THREE.Vector3(px + Math.sin(am) * 0.06, py - Math.cos(am) * 0.06, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
    b.position.set(x0 + local.x, local.y, z0 + local.z);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, am, 'YXZ'));
    b.quaternion.set(q.x, q.y, q.z, q.w); world.addBody(b);
  }
  const back = new THREE.Vector3(R0 + 0.15, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
  staticBox(x0 + back.x, R0 / 2, z0 + back.z, 0.15, R0 / 2, w / 2, ry);
  aoSpots.push([x0 + back.x * 0.7, z0 + back.z * 0.7, 3, 0.2]);
}
function barrel(x, z) {
  const g = new THREE.Group();
  const b = mesh(G.cyl(0.32, 0.32, 0.9, 10), C.coral); g.add(b);
  for (const y of [-0.2, 0.15]) { const st = mesh(G.cyl(0.33, 0.33, 0.12, 10), C.cream, { outline: false }); st.position.y = y; g.add(st); }
  dynProp(new CANNON.Cylinder(0.32, 0.32, 0.9, 10), 2.5, g, x, 0.45, z, R(0, 3), 'barrel');
}
function tyre(x, y, z) {
  const g = mesh(new THREE.TorusGeometry(0.34, 0.15, 6, 12), C.tire); g.rotation.x = Math.PI / 2;
  const h = new THREE.Group(); h.add(g);
  dynProp(new CANNON.Cylinder(0.48, 0.48, 0.3, 10), 1.6, h, x, y, z, R(0, 3), 'tyre');
}
function bin(x, z) {
  const g = new THREE.Group();
  const b = mesh(G.cyl(0.3, 0.26, 0.8, 9), C.mint); g.add(b);
  const lid = mesh(G.cyl(0.33, 0.33, 0.08, 9), C.inkSoft, { outline: false }); lid.position.y = 0.43; g.add(lid);
  dynProp(new CANNON.Cylinder(0.3, 0.26, 0.8, 9), 2, g, x, 0.4, z, 0, 'bin');
}

/* --- life: leaves, birds, butterflies --- */
let leaves;
function buildLeaves(n) {
  const geo = new THREE.PlaneGeometry(0.2, 0.13); geo.rotateX(-Math.PI / 2);
  const mat = patch(new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap, side: THREE.DoubleSide }), { key: 'leaf', ao: false });
  const im = new THREE.InstancedMesh(geo, mat, n); im.receiveShadow = true;
  const cols = ['#f4b9c6', '#f7c9a6', '#f3d68a', '#eaa6b4', '#e8c09c'].map(c => new THREE.Color(c));
  const st = [];
  for (let i = 0; i < n; i++) {
    let x, z;
    let tries = 0;
    do { if (rand() < 0.88 && treePos.length) { const t = treePos[rand() * treePos.length | 0]; const a = R(0, 6.28), r = R(0.4, 3.4); x = t[0] + Math.cos(a) * r; z = t[1] + Math.sin(a) * r; }
    else { const a = R(0, 6.28), r = Math.sqrt(R(0.02, 1)) * 44; x = Math.cos(a) * r; z = Math.sin(a) * r; } } while (onPaved(x, z, -0.6) && rand() < 0.8 && ++tries < 6);
    st.push({ x, y: 0.03 + R(0, 0.01), z, vx: 0, vy: 0, vz: 0, ry: R(0, 6.28), rx: 0, spin: 0, air: false });
    im.setColorAt(i, cols[rand() * cols.length | 0]);
  }
  im.userData.st = st; leaves = im; scene.add(im);
  const write = i => { const q = st[i]; _m.compose(_v.set(q.x, q.y, q.z), _q.setFromEuler(_e.set(q.rx, q.ry, q.rx * 0.6)), _s.setScalar(1)); im.setMatrixAt(i, _m); };
  st.forEach((_, i) => write(i));
  updaters.push((dt, t, info) => {
    const kx = chassis.position.x, kz = chassis.position.z, sp = info.speed;
    let dirty = false;
    for (let i = 0; i < st.length; i++) {
      const q = st[i];
      if (!q.air) {
        if (sp > 3.5 && Math.abs(q.x - kx) < 1.9 && Math.abs(q.z - kz) < 1.9) {
          const dx = q.x - kx, dz = q.z - kz, d = Math.hypot(dx, dz) + 0.01;
          if (d < 1.9) { q.air = true; q.vx = dx / d * R(1, 2.5) + chassis.velocity.x * 0.35; q.vz = dz / d * R(1, 2.5) + chassis.velocity.z * 0.35; q.vy = R(1.8, 3.6) * Math.min(sp / 8, 1.4); q.spin = R(-9, 9); }
        }
        continue;
      }
      dirty = true;
      q.vy -= 5.5 * dt; q.vx *= 1 - 1.6 * dt; q.vz *= 1 - 1.6 * dt;
      q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; q.ry += q.spin * dt; q.rx = Math.sin(q.ry * 2) * 0.8;
      if (q.y <= 0.03) { q.y = 0.03; q.air = false; q.rx = 0; }
      write(i);
    }
    if (dirty) im.instanceMatrix.needsUpdate = true;
  });
}
function buildBirds() {
  const flocks = [{ c: [-6, -14], r: 22, h: 11, sp: 0.16 }, { c: [10, 10], r: 17, h: 13, sp: -0.12 }];
  const wingG = new THREE.BufferGeometry(); wingG.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.18, 0, 0, 0.18, 0.75, 0, 0.05], 3)); wingG.computeVertexNormals();
  const wingM = patch(new THREE.MeshToonMaterial({ color: '#fffaf2', gradientMap, side: THREE.DoubleSide }), { key: 'wing' });
  const birds = [];
  flocks.forEach((f, fi) => {
    for (let i = 0; i < 5; i++) {
      const g = new THREE.Group();
      const body = mesh(G.cone(0.13, 0.55, 5), '#fffaf2', { outline: false }); body.rotation.x = -Math.PI / 2; g.add(body);
      const beak = mesh(G.cone(0.05, 0.12, 4), C.coral, { outline: false }); beak.rotation.x = -Math.PI / 2; beak.position.z = -0.33; g.add(beak);
      const wl = new THREE.Mesh(wingG, wingM), wr = new THREE.Mesh(wingG, wingM); wr.scale.x = -1; wl.castShadow = wr.castShadow = true;
      g.add(wl, wr); g.scale.setScalar(1.2); scene.add(g);
      birds.push({ g, wl, wr, f, off: i * 0.32 + fi, dy: R(-0.6, 0.6), dr: R(-1.5, 1.5), ph: R(0, 6) });
    }
  });
  updaters.push((dt, t) => birds.forEach(b => {
    const a = t * b.f.sp + b.off * 0.35, r = b.f.r + b.dr;
    b.g.position.set(b.f.c[0] + Math.cos(a) * r, b.f.h + b.dy + Math.sin(t * 0.8 + b.ph) * 0.4, b.f.c[1] + Math.sin(a) * r);
    b.g.rotation.y = -a + (b.f.sp > 0 ? Math.PI : 0); b.g.rotation.z = (b.f.sp > 0 ? -0.25 : 0.25);
    const flap = Math.sin(t * 11 + b.ph) * 0.7 * (0.5 + 0.5 * Math.max(0, Math.sin(t * 0.7 + b.ph)));
    b.wl.rotation.z = flap; b.wr.rotation.z = -flap;
  }));
}
function buildButterflies() {
  const wg = new THREE.PlaneGeometry(0.16, 0.14); wg.translate(0.08, 0, 0);
  const list = [];
  for (let i = 0; i < 16; i++) {
    const b = BEDS[i % BEDS.length];
    const m = patch(new THREE.MeshBasicMaterial({ color: [C.coral, C.lilac, C.butter, '#ffffff'][i % 4], side: THREE.DoubleSide }), { key: 'bfly', noGlow: true });
    const g = new THREE.Group(); const l = new THREE.Mesh(wg, m), r = new THREE.Mesh(wg, m); r.scale.x = -1; g.add(l, r); scene.add(g);
    list.push({ g, l, r, b, ph: R(0, 6.28), sp: R(0.3, 0.7) });
  }
  updaters.push((dt, t) => list.forEach(q => {
    const a = t * q.sp + q.ph;
    q.g.position.set(q.b.c.x + Math.cos(a) * q.b.rx * 0.9 + Math.sin(t * 1.7 + q.ph) * 0.4, 0.7 + Math.sin(t * 2.3 + q.ph) * 0.35, q.b.c.z + Math.sin(a * 1.3) * q.b.rz * 0.9);
    q.g.rotation.y = -a; const f = Math.sin(t * 22 + q.ph) * 1.1; q.l.rotation.y = f; q.r.rotation.y = -f;
  }));
}

/* --- proximity glow: the nearest stand lights up as you roll in --- */
const standLight = new THREE.PointLight('#ffffff', 0, 18, 1.6);
scene.add(standLight);
function buildStandGlow() {
  updaters.push((dt, t) => {
    let best = null, bd = 1e9;
    for (const s of STANDS) {
      const F = s._frame; if (!F) continue;
      const d = Math.hypot(chassis.position.x - F.p.x, chassis.position.z - F.p.z);
      s._w = damp(s._w || 0, clamp((15 - d) / 8, 0, 1), 4, dt);
      if (s._board) { const v = 0.8 + s._w * 0.2; s._board.material.color.setRGB(v, v, v); }
      if (s._totem) { s._totem.rotation.y = s._frame.rotY + Math.sin(t * (0.8 + s._w * 2)) * (0.15 + s._w * 0.25); s._totem.position.y = 3.95 + s._w * Math.sin(t * 4) * 0.08; }
      if (d < bd) { bd = d; best = s; }
    }
    if (best && best._frame) {
      const F = best._frame; standLight.color.set(best.color);
      standLight.position.set(F.p.x + camRight.x * 0 - camUp.x * 3, 4.2, F.p.z - camUp.z * 3);
      standLight.intensity = damp(standLight.intensity, (best._w || 0) * 55, 5, dt);
    }
  });
}

function dressPark(images) {
  const badges = images.badges || {};
  // per stand: badge totem, A-frame board, its own set piece
  for (const s of STANDS) {
    const F = standFrame(s); s._frame = F;
    s._totem = badgeTotem(s, F, badges[s.id]);
    aFrame(s, F);
    if (s.id === 'projects') buildProjectEasels(F);
    if (s.id === 'contact') buildSocials(F);
    const piece = ({ about: setGreenhouseYard, contact: setPaperPlane })[s.id];
    if (piece) piece(s, F);
  }
  buildStandGlow();
  // fences round the flower beds
  for (const b of BEDS) fenceAround(b);
  // planters lining the spokes
  for (const [a, rs] of [[0, [12.8, 15.4]], [90, [12.6, 16.6]], [-90, [12.6, 16.6]], [180, [11.8, 15.0]]]) {
    for (const r of rs) for (const sd of [-1, 1]) {
      const p = polar(a, r), off = polar(a + 90, 3.35 * sd);
      planterBox(p.x + off.x, p.z + off.z, (90 - a) * DEG);
    }
  }
  // wayfinding at the road junctions
  signpost(3.6, -17.9, [{ t: '↑ EXPERIENCE' }, { t: '← SKILLS', bg: '#a9d4f2' }, { t: 'APPIFY →', bg: '#ffc4a3', right: true }]);
  signpost(17.9, 3.6, [{ t: '↑ PROJECTS' }, { t: '↓ SAY HELLO', bg: '#f6b3c7' }]);
  signpost(-17.9, 3.6, [{ t: '↑ EDUCATION' }, { t: '↓ ABOUT', bg: '#cdb8f0' }]);
  signpost(3.6, 18.4, [{ t: '↓ SKATE SLAB', bg: '#ffc4a3' }, { t: 'HOP: SPACE' }]);
  // string lights: along the ring between neighbouring lamps, and a square over the plaza
  const ring = lampPos.filter(l => Math.abs(Math.hypot(l[0], l[1]) - (RING_R + RING_W / 2 + 0.7)) < 0.5).map(l => [...l, Math.atan2(l[0], -l[1])]).sort((a, b) => a[2] - b[2]);
  for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; let da = Math.abs(b[2] - a[2]); if (da > Math.PI) da = 2 * Math.PI - da; if (da < 0.75) stringLights([a[0], a[1]], [b[0], b[1]], 3.3, 3.3, 0.55); }
  const pp = [25, 115, 205, 295].map(a => polar(a, PLAZA_R + 0.9));
  pp.forEach(p => pole(p.x, p.z));
  for (let i = 0; i < 4; i++) { const a = pp[i], b = pp[(i + 1) % 4]; stringLights([a.x, a.z], [b.x, b.z], 3.6, 3.6, 0.9, 12); }
  stringLights([pp[0].x, pp[0].z], [pp[2].x, pp[2].z], 3.6, 3.6, 1.3, 16);
  // skate slab furniture
  quarterPipe(9.9, 32.4, 0, 5, 1.7);
  add(G.box(2.6, 0.24, 1.3), M(-0.8, 0.12, 35.4), C.butter); staticBox(-0.8, 0.12, 35.4, 1.3, 0.12, 0.65);
  { // grind rail along the west edge
    add(G.cyl(0.06, 0.06, 7, 6), M(-10.4, 0.55, 34.5, Math.PI / 2, 0, 0), C.inkSoft);
    for (const z of [31.4, 34.5, 37.6]) add(G.box(0.08, 0.55, 0.08), M(-10.4, 0.27, z), C.inkSoft);
    staticBox(-10.4, 0.3, 34.5, 0.08, 0.3, 3.5);
  }
  for (const [x, z] of [[9.3, 39.6], [10.4, 40.4], [8.4, 40.7]]) barrel(x, z);
  for (const [x, z] of [[-10.3, 40.3], [-9.2, 40.9]]) for (let k = 0; k < 3; k++) tyre(x, 0.16 + k * 0.31, z);
  for (const [x, z] of [[-6.6, 1.9], [6.6, 1.0]]) bin(x, z);
  // a few more cones near the skate entrance
  for (const [x, z] of [[-2.6, 27.4], [2.6, 27.4], [-1.6, 29.6], [1.6, 29.6]]) cone(x, z);
}

/* =====================================================================
   the ground: a painted canvas, revealed out of paper
   ===================================================================== */
const GW = 120;
// lawn outside the ring, one wedge per section. The south gap stays the base green.
const LAWN_SECTIONS = [
  { a0: -126, a1: -90, color: '#cdb8f0' },
  { a0: -90, a1: -54, color: '#ffe08f' },
  { a0: -54, a1: -18, color: '#a9d4f2' },
  { a0: -18, a1: 54, color: '#ffc4a3' },
  { a0: 54, a1: 90, color: '#a9dcb6' },
  { a0: 90, a1: 126, color: '#f6b3c7' },
];
function paintGround(S) {
  const c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d');
  const s = S / GW;
  x.setTransform(s, 0, 0, s, S / 2, S / 2);
  const lawn = '#bfe3bf';
  x.fillStyle = lawn; x.fillRect(-60, -60, 120, 120);
  // mown variation only in the south gap, so it cannot bleed between two section colors
  const r2 = mulberry32(99);
  x.filter = `blur(${Math.round(S / 340)}px)`;
  for (let i = 0; i < 700; i++) {
    const px = -58 + r2() * 116, pz = -58 + r2() * 116;
    const ang = Math.atan2(px, -pz) / DEG;
    if (ang > -126 && ang < 126) continue;
    x.globalAlpha = 0.28; x.fillStyle = ['#cbe9c5', '#b1dab4', '#c6e6bd', '#acd6b2'][i % 4];
    x.beginPath(); x.arc(px, pz, 0.8 + r2() * 3.4, 0, 6.29); x.fill();
  }
  x.filter = 'none'; x.globalAlpha = 1;
  // solid section grass. Wedges overlap, then a short blend joins one color to the next. Green only at the south gap.
  const lawnInner = RING_R + RING_W / 2, lawnOuter = 46;
  const wedge = (a0, a1, fill) => {
    const c0 = (a0 - 90) * DEG, c1 = (a1 - 90) * DEG;
    x.fillStyle = fill; x.globalAlpha = 1;
    x.beginPath(); x.arc(0, 0, lawnOuter, c0, c1); x.arc(0, 0, lawnInner, c1, c0, true); x.fill();
  };
  LAWN_SECTIONS.forEach(sec => wedge(sec.a0, sec.a1, sec.color));
  const blendAt = (aDeg, colorA, colorB) => {
    const c0 = (aDeg - 0.8 - 90) * DEG, c1 = (aDeg + 0.8 - 90) * DEG;
    const span = (c1 - c0) / (Math.PI * 2);
    const g = x.createConicGradient(c0, 0, 0);
    g.addColorStop(0, colorA);
    g.addColorStop(Math.min(Math.max(span, 0.001), 0.999), colorB);
    g.addColorStop(1, colorB);
    x.fillStyle = g;
    x.beginPath();
    x.arc(0, 0, lawnOuter + 0.15, c0, c1);
    x.arc(0, 0, Math.max(lawnInner - 0.15, 0.2), c1, c0, true);
    x.fill();
  };
  blendAt(-126, lawn, LAWN_SECTIONS[0].color);
  for (let i = 0; i < LAWN_SECTIONS.length - 1; i++) blendAt(LAWN_SECTIONS[i].a1, LAWN_SECTIONS[i].color, LAWN_SECTIONS[i + 1].color);
  blendAt(126, LAWN_SECTIONS[LAWN_SECTIONS.length - 1].color, lawn);
  LAWN_SECTIONS.forEach(sec => wedge(sec.a0 + 1.2, sec.a1 - 1.2, sec.color));
  // solid color under each building, grass only, so the yard matches the section exactly
  x.save();
  x.beginPath();
  x.arc(0, 0, lawnOuter, 0, 6.29);
  x.arc(0, 0, lawnInner, 0, 6.29, true);
  x.clip();
  for (const s of STANDS) {
    const p = polar(s.angle, STAND_R + (s.kind === 'about' ? 1 : 0));
    x.globalAlpha = 1;
    x.fillStyle = s.color;
    x.beginPath();
    x.arc(p.x, p.z, 8.2, 0, 6.29);
    x.fill();
  }
  x.restore();
  // mower stripes inside the ring
  x.save(); x.beginPath(); x.arc(0, 0, RING_R - RING_W / 2, 0, 6.29); x.clip();
  x.rotate(-CAM_YAW); x.globalAlpha = 0.07; x.fillStyle = '#ffffff';
  for (let i = -30; i < 30; i += 2) x.fillRect(i * 1.6, -30, 1.6, 60);
  x.restore(); x.globalAlpha = 1;
  // soil beds
  for (const b of BEDS) {
    x.save(); x.translate(b.c.x, b.c.z); x.rotate(Math.atan2(b.c.z, b.c.x) + Math.PI / 2);
    x.fillStyle = '#f2d2c0'; x.beginPath(); x.ellipse(0, 0, b.rx + 0.35, b.rz + 0.35, 0, 0, 6.29); x.fill();
    x.fillStyle = '#ebc4ae'; x.beginPath(); x.ellipse(0, 0, b.rx, b.rz, 0, 0, 6.29); x.fill(); x.restore();
  }
  // paving
  const pave = '#ece4ec', curb = '#d2c2d2';
  const paved = () => {
    x.beginPath(); x.arc(0, 0, PLAZA_R, 0, 6.29); x.fill();
    x.beginPath(); x.arc(0, 0, RING_R + RING_W / 2, 0, 6.29); x.arc(0, 0, RING_R - RING_W / 2, 0, 6.29, true); x.fill();
    x.fillRect(-2.3, -RING_R, 4.6, 2 * RING_R); x.fillRect(-RING_R, -2.3, 2 * RING_R, 4.6);
    x.fillRect(-2.3, 0, 4.6, SKATE.z0 + 1);
    x.beginPath(); x.roundRect(SKATE.x0, SKATE.z0, SKATE.x1 - SKATE.x0, SKATE.z1 - SKATE.z0, 3); x.fill();
  };
  x.save(); x.fillStyle = curb; x.translate(0, 0); x.scale(1.0, 1.0);
  x.shadowColor = 'rgba(160,130,150,.0)'; x.filter = 'blur(0px)';
  x.lineJoin = 'round'; x.strokeStyle = curb; x.lineWidth = 0.5;
  x.fillStyle = curb; paved(); x.stroke();
  x.restore();
  x.save(); x.fillStyle = pave;
  x.beginPath(); x.arc(0, 0, PLAZA_R - 0.18, 0, 6.29); x.fill();
  x.beginPath(); x.arc(0, 0, RING_R + RING_W / 2 - 0.18, 0, 6.29); x.arc(0, 0, RING_R - RING_W / 2 + 0.18, 0, 6.29, true); x.fill();
  x.fillRect(-2.12, -RING_R, 4.24, 2 * RING_R); x.fillRect(-RING_R, -2.12, 2 * RING_R, 4.24);
  x.fillRect(-2.12, RING_R - 1, 4.24, SKATE.z0 - RING_R + 2);
  x.fillStyle = '#e3d8ef'; x.beginPath(); x.roundRect(SKATE.x0 + 0.18, SKATE.z0 + 0.18, SKATE.x1 - SKATE.x0 - 0.36, SKATE.z1 - SKATE.z0 - 0.36, 2.8); x.fill();
  x.restore();
  // ring lane dashes
  x.save(); x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 0.16; x.setLineDash([1.2, 1.4]);
  x.beginPath(); x.arc(0, 0, RING_R, 0, 6.29); x.stroke(); x.restore();
  // plaza rings + paving joints
  x.save(); x.strokeStyle = 'rgba(190,165,180,.45)'; x.lineWidth = 0.05;
  for (let r = 2; r < PLAZA_R; r += 2) { x.beginPath(); x.arc(0, 0, r, 0, 6.29); x.stroke(); }
  for (let a = 0; a < 6.28; a += 6.28 / 24) { x.beginPath(); x.moveTo(Math.cos(a) * 2, Math.sin(a) * 2); x.lineTo(Math.cos(a) * (PLAZA_R - .2), Math.sin(a) * (PLAZA_R - .2)); x.stroke(); }
  // skate slab joints
  for (let gx = SKATE.x0 + 4; gx < SKATE.x1; gx += 4) { x.beginPath(); x.moveTo(gx, SKATE.z0 + 0.3); x.lineTo(gx, SKATE.z1 - 0.3); x.stroke(); }
  for (let gz = SKATE.z0 + 4.5; gz < SKATE.z1; gz += 4.5) { x.beginPath(); x.moveTo(SKATE.x0 + 0.3, gz); x.lineTo(SKATE.x1 - 0.3, gz); x.stroke(); }
  x.restore();
  // spawn ring on the plaza
  x.save(); x.strokeStyle = 'rgba(42,29,56,.18)'; x.lineWidth = 0.08; x.setLineDash([0.4, 0.3]);
  x.beginPath(); x.arc(SPAWN.x, SPAWN.z, 3.3, 0, 6.29); x.stroke(); x.restore();
  // concrete speckle
  const r3 = mulberry32(5);
  for (let i = 0; i < 9000; i++) {
    const px = -50 + r3() * 100, pz = -50 + r3() * 100;
    if (!onPaved(px, pz, -0.3)) continue;
    x.fillStyle = r3() < 0.5 ? 'rgba(200,180,195,.35)' : 'rgba(255,255,255,.6)';
    x.fillRect(px, pz, 0.06, 0.06);
  }
  // painted words, set square to the camera
  const word = (str, px, pz, size, color, font = '800', ls = -0.04) => {
    x.save(); x.translate(px, pz); x.rotate(-CAM_YAW);
    x.font = `${font} ${size * 10}px ${font === '400' ? '"Space Mono"' : 'Syne'}`; x.scale(0.1, 0.1);
    x.letterSpacing = `${ls * size * 10}px`;
    x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(str, 0, 0); x.restore();
  };
  word('AAYAN', -0.45, -5.6, 2.1, 'rgba(42,29,56,.9)');
  word('DESAI', 0.35, -3.55, 2.1, 'rgba(42,29,56,.5)');
  word('QA AUTOMATION · DRIVE IN', 0.9, -2.1, 0.42, 'rgba(42,29,56,.6)', '400', 0.18);
  for (const s of STANDS) {
    const p = polar(s.angle, RING_R - RING_W / 2 - 2.6);
    word((s.n ? s.n + ' ' : '') + (s.kind === 'project' ? s.title : s.short).toUpperCase(), p.x, p.z, 0.62, 'rgba(42,29,56,.66)', '700', -0.02);
  }
  word('SKATE', -0.4, 40.4, 1.5, 'rgba(42,29,56,.16)');
  // skate slab coral arrows (the spark, painted on the ground)
  x.save(); x.fillStyle = 'rgba(255,91,58,.85)';
  for (const [px, pz] of [[-6, 30.6], [5.5, 28.95]]) { x.beginPath(); x.moveTo(px - 0.6, pz - 0.5); x.lineTo(px + 0.6, pz - 0.5); x.lineTo(px, pz + 0.4); x.fill(); }
  x.restore();
  // baked AO under everything that stands on the ground
  for (const [px, pz, r, a] of aoSpots) {
    const g = x.createRadialGradient(px, pz, 0, px, pz, r);
    g.addColorStop(0, `rgba(96,70,110,${a})`); g.addColorStop(0.55, `rgba(96,70,110,${a * 0.45})`); g.addColorStop(1, 'rgba(96,70,110,0)');
    x.fillStyle = g; x.beginPath(); x.arc(px, pz, r, 0, 6.29); x.fill();
  }
  // island edge: lawn fades back to paper
  x.globalCompositeOperation = 'destination-in';
  const fade = x.createRadialGradient(0, 0, 47, 0, 0, 57);
  fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = fade; x.fillRect(-60, -60, 120, 120);
  x.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.generateMipmaps = true;
  return t;
}

function buildGround(groundTex) {
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
  patch(m, {
    key: 'ground', noClip: true, noGlow: true,
    uniforms: { uGround: { value: groundTex }, uPaper: { value: PAPER }, uDots: { value: DOTS }, uDusk: { value: DUSK } },
    fragHead: `uniform sampler2D uGround; uniform vec3 uPaper; uniform vec3 uDots; uniform vec3 uDusk; uniform float uDim; float kpLawn;`,
    frag: f => f
      .replace('#include <map_fragment>', `
        vec2 cuv = vec2((vKpW.x + 60.0) / 120.0, 1.0 - (vKpW.z + 60.0) / 120.0);
        vec4 gc = texture2D(uGround, clamp(cuv, 0.001, 0.999));
        float insideC = step(0.0, cuv.x) * step(cuv.x, 1.0) * step(0.0, cuv.y) * step(cuv.y, 1.0);
        float rv = smoothstep(uReveal + 0.02, uReveal - 0.35, kpD);
        kpLawn = gc.a * insideC * rv;
        diffuseColor.rgb = gc.rgb * kpLawn;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        vec2 gp = vKpW.xz / 1.6; vec2 gf = fract(gp) - .5;
        float dotm = smoothstep(.075, .045, length(gf));
        vec3 paper = mix(mix(uPaper, uDusk, uDim * smoothstep(uReveal - .2, uReveal + 6., kpD)), uDots * mix(1., .8, uDim), dotm * .9);
        totalEmissiveRadiance += paper * (1.0 - kpLawn) * 0.42;
        totalEmissiveRadiance += uRingCol * uRingOn * (exp(-pow((kpD - uReveal) / .06, 2.)) * 1.1 + exp(-pow((kpD - uReveal) / .5, 2.)) * .22);`),
  });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), m);
  g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g);
}

/* --- grass tufts, with the kart parting them --- */
function buildGrass(n) {
  const blade = [];
  for (let b = 0; b < 3; b++) {
    const a = b / 3 * Math.PI + R(0, 0.5), h = R(0.32, 0.5), w = 0.07, ox = R(-0.08, 0.08), oz = R(-0.08, 0.08), lean = R(-0.08, 0.08);
    const ca = Math.cos(a), sa = Math.sin(a);
    blade.push(ox - ca * w, 0, oz - sa * w, ox + ca * w, 0, oz + sa * w, ox + lean, h, oz + lean);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(blade, 3));
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, fog: true,
    uniforms: { ...RU, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uBase: { value: new THREE.Color('#86c495') }, uTip: { value: new THREE.Color('#e3f4c4') }, uLawn: { value: LAWN_SECTIONS.map(s => new THREE.Color(s.color)) } },
    vertexShader: `#include <fog_pars_vertex>
      uniform float uTime; uniform vec2 uKart; varying float vH; varying vec3 vKpW;
      void main(){ vec3 p = position; vH = p.y / .5;
        vec4 w = modelMatrix * instanceMatrix * vec4(p, 1.);
        float sw = sin(uTime * 1.6 + w.x * .5 + w.z * .35) * .05 * vH;
        vec2 d = w.xz - uKart; float k = smoothstep(1.7, 0., length(d));
        w.xz += (normalize(d + 1e-4) * k * .38 + vec2(sw, sw * .6)) * vH;
        w.y -= k * .18 * vH;
        vKpW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `#include <fog_pars_fragment>
      uniform vec3 uBase; uniform vec3 uTip; uniform vec3 uLawn[6]; uniform float uReveal; uniform vec2 uCenter; varying float vH; varying vec3 vKpW;
      vec3 pickLawn(float a) {
        vec3 c = uLawn[0];
        c = mix(c, uLawn[1], step(-90.0, a));
        c = mix(c, uLawn[2], step(-54.0, a));
        c = mix(c, uLawn[3], step(-18.0, a));
        c = mix(c, uLawn[4], step(54.0, a));
        c = mix(c, uLawn[5], step(90.0, a));
        return c;
      }
      vec3 seam(vec3 c, float a, float e, vec3 ca, vec3 cb) {
        float w = 1.0 - smoothstep(0.0, 1.2, abs(a - e));
        return mix(c, mix(ca, cb, smoothstep(e - 1.2, e + 1.2, a)), w);
      }
      void main(){ if (distance(vKpW.xz, uCenter) > uReveal) discard;
        float ang = atan(vKpW.x, -vKpW.z) * 57.2957795;
        vec3 gFlat = mix(uBase, uTip, 0.35);
        float gap = step(126.0, abs(ang));
        vec3 base = mix(pickLawn(ang), gFlat, gap);
        base = seam(base, ang, -126.0, gFlat, uLawn[0]);
        base = seam(base, ang, -90.0, uLawn[0], uLawn[1]);
        base = seam(base, ang, -54.0, uLawn[1], uLawn[2]);
        base = seam(base, ang, -18.0, uLawn[2], uLawn[3]);
        base = seam(base, ang, 54.0, uLawn[3], uLawn[4]);
        base = seam(base, ang, 90.0, uLawn[4], uLawn[5]);
        base = seam(base, ang, 126.0, uLawn[5], gFlat);
        vec3 col = mix(base * 0.86, base, clamp(vH, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  const im = new THREE.InstancedMesh(geo, mat, n);
  let k = 0;
  const r2 = mulberry32(31);
  const cl = (x, z) => Math.sin(x * 0.21) * Math.cos(z * 0.17) + Math.sin(x * 0.07 + z * 0.11);
  for (let i = 0; i < n * 8 && k < n; i++) {
    const x = -46 + r2() * 92, z = -46 + r2() * 92;
    if (Math.hypot(x, z) > 46.5 || blocked(x, z, 0.4)) continue;
    if (cl(x, z) < 0.25 && r2() < 0.85) continue;
    _m.compose(_v.set(x, 0, z), _q.setFromEuler(_e.set(0, r2() * 6.28, 0)), _s.setScalar(0.8 + r2() * 0.6));
    im.setMatrixAt(k++, _m);
  }
  im.count = k; im.frustumCulled = false; scene.add(im);
}

/* --- flowers in the beds --- */
function buildFlowers() {
  const cols = ['#f6a9c0', '#ffe08f', '#cdb8f0', '#fff6ea', '#ffb79a'].map(c => new THREE.Color(c));
  const n = 260, im = new THREE.InstancedMesh(G.ico(0.11, 0), toon('#ffffff'), n);
  im.castShadow = false; let k = 0;
  for (const b of BEDS) {
    const ang = Math.atan2(b.c.z, b.c.x) + Math.PI / 2;
    for (let i = 0; i < n / 4; i++) {
      const a = R(0, 6.28), rr = Math.sqrt(R(0, 1));
      const lx = Math.cos(a) * b.rx * rr, lz = Math.sin(a) * b.rz * rr;
      const x = b.c.x + lx * Math.cos(ang) - lz * Math.sin(ang), z = b.c.z + lx * Math.sin(ang) + lz * Math.cos(ang);
      _m.compose(_v.set(x, R(0.18, 0.42), z), _q.setFromEuler(_e.set(R(0, 3), R(0, 3), 0)), _s.setScalar(R(0.8, 1.3)));
      im.setMatrixAt(k, _m); im.setColorAt(k, cols[rand() * cols.length | 0]); k++;
    }
  }
  im.count = k; scene.add(im);
}

/* --- petals drifting through the light --- */
let petals;
function buildPetals(n) {
  const geo = new THREE.PlaneGeometry(0.16, 0.11);
  const mat = new THREE.MeshBasicMaterial({ color: '#f7b9ca', side: THREE.DoubleSide });
  patch(mat, { key: 'petal', noGlow: true });
  petals = new THREE.InstancedMesh(geo, mat, n); petals.frustumCulled = false;
  petals.userData.p = Array.from({ length: n }, () => ({ x: R(-28, 28), y: R(0, 9), z: R(-28, 28), s: R(0.4, 1), r: R(0, 6.28), sp: R(0.6, 1.6) }));
  scene.add(petals);
}

/* =====================================================================
   the kart — a little electric go-kart, nose to −z
   ===================================================================== */
const kart = new THREE.Group();
const KS = 1.3; // the whole rig (visual + physics) at 1.3× so the kart reads on screen
const wheelMeshes = [];
const kartParts = {};
function buildKart() {
  const rig = new THREE.Group(); kart.add(rig); rig.scale.setScalar(KS);
  const body = new THREE.Group(); rig.add(body); kartParts.body = body;
  // low closed car. Chassis box and wheel mounts stay where they are.
  const hood = mesh(G.box(0.86, 0.22, 0.78), C.coral); hood.position.set(0, 0.26, -0.36); body.add(hood);
  const deck = mesh(G.box(0.8, 0.16, 0.36), C.coral); deck.position.set(0, 0.24, 0.6); body.add(deck);
  const cabin = mesh(G.box(0.74, 0.3, 0.5), C.butter); cabin.position.set(0, 0.46, 0.14); body.add(cabin);
  const glass = mesh(G.box(0.64, 0.26, 0.035), C.ink, { outline: false });
  glass.position.set(0, 0.5, -0.08); glass.rotation.x = -0.62; body.add(glass);
  for (const sx of [-1, 1]) {
    const skirt = mesh(G.box(0.05, 0.07, 1.42), C.ink, { outline: false });
    skirt.position.set(sx * 0.44, 0.14, 0.04); body.add(skirt);
  }
  for (const [x, z] of [[-0.48, -0.6], [0.48, -0.6], [-0.48, 0.52], [0.48, 0.52]]) {
    const arch = mesh(new THREE.TorusGeometry(0.3, 0.045, 5, 8, Math.PI), C.coral);
    arch.rotation.y = Math.PI / 2;
    arch.position.set(x, 0.32, z); body.add(arch);
  }
  const bumper = mesh(G.box(0.76, 0.07, 0.08), C.cream); bumper.position.set(0, 0.16, -0.76); body.add(bumper);
  for (let i = 0; i < 3; i++) {
    const bar = mesh(G.box(0.26, 0.012, 0.018), C.ink, { outline: false });
    bar.position.set(0, 0.21 + i * 0.026, -0.8); body.add(bar);
  }
  kartParts.brakes = [];
  for (const sx of [-1, 1]) {
    const hl = mesh(G.box(0.14, 0.07, 0.04), '#fff4c9', { emissive: '#ffe9a8', ei: 1.1, outline: false, noAO: true });
    hl.position.set(sx * 0.24, 0.28, -0.76); body.add(hl);
    const bl = mesh(G.box(0.07, 0.045, 0.03), '#ffb15a', { emissive: '#ff9a3a', ei: 0.15, outline: false, noAO: true });
    bl.material = bl.material.clone();
    bl.position.set(sx * 0.38, 0.26, -0.74); body.add(bl);
    if (sx < 0) kartParts.blinkL = bl; else kartParts.blinkR = bl;
    const tail = mesh(G.box(0.12, 0.055, 0.03), '#ff5b3a', { emissive: '#ff5b3a', ei: 0.3, outline: false, noAO: true });
    tail.material = tail.material.clone();
    tail.position.set(sx * 0.26, 0.3, 0.78); body.add(tail);
    kartParts.brakes.push(tail);
  }
  const strip = mesh(G.box(0.32, 0.03, 0.05), '#ffb15a', { emissive: '#ff9a3a', ei: 0.5, outline: false, noAO: true });
  strip.position.set(0, 0.64, 0.14); body.add(strip); kartParts.strip = strip;
  const wheelS = new THREE.Group(); wheelS.position.set(0, 0.42, 0.02); wheelS.rotation.x = 0.5;
  wheelS.add(mesh(new THREE.TorusGeometry(0.07, 0.012, 5, 8), C.ink, { outline: false }));
  body.add(wheelS); kartParts.wheel = wheelS;
  const drv = new THREE.Group(); drv.position.set(0, 0.42, 0.12); body.add(drv); kartParts.drv = drv;
  const head = new THREE.Group(); drv.add(head); kartParts.head = head;
  kartParts.scarf = [];
  const flag = new THREE.Group(); body.add(flag); kartParts.flag = flag;
  body.traverse(o => { if (o.isMesh) o.castShadow = true; });
  for (let i = 0; i < 4; i++) {
    const w = new THREE.Group(); w.scale.setScalar(KS);
    const tire = mesh(G.cyl(0.34, 0.34, 0.22, 18), C.tire); tire.rotation.z = Math.PI / 2;
    const wall = mesh(G.cyl(0.26, 0.26, 0.26, 16), C.cream, { outline: false }); wall.rotation.z = Math.PI / 2;
    const hub = mesh(G.cyl(0.1, 0.1, 0.28, 8), C.butter, { outline: false }); hub.rotation.z = Math.PI / 2;
    w.add(tire, wall, hub); scene.add(w); wheelMeshes.push(w);
  }
  // soft contact shadow that keeps the kart sat on the ground
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.4), patch(new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(70,45,80,.55)'); g.addColorStop(1, 'rgba(70,45,80,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  }), transparent: true, depthWrite: false }), { key: 'blob', noGlow: true }));
  blob.rotation.x = -Math.PI / 2; blob.renderOrder = 1; scene.add(blob); kartParts.blob = blob;
  scene.add(kart);
}

/* --- vehicle physics --- */
const chassis = new CANNON.Body({ mass: 170, angularDamping: 0.45, linearDamping: 0.06 });
chassis.addShape(new CANNON.Box(new CANNON.Vec3(0.5 * KS, 0.2 * KS, 0.95 * KS)), new CANNON.Vec3(0, 0.12 * KS, 0));
chassis.position.set(SPAWN.x, 2.2, SPAWN.z);
chassis.allowSleep = false;
const vehicle = new CANNON.RaycastVehicle({ chassisBody: chassis, indexRightAxis: 0, indexUpAxis: 1, indexForwardAxis: 2 });
const WO = {
  radius: 0.3 * KS, directionLocal: new CANNON.Vec3(0, -1, 0), suspensionStiffness: 38, suspensionRestLength: 0.22 * KS,
  frictionSlip: 2.6, dampingRelaxation: 2.3, dampingCompression: 4.0, maxSuspensionForce: 100000, rollInfluence: 0.04,
  axleLocal: new CANNON.Vec3(-1, 0, 0), chassisConnectionPointLocal: new CANNON.Vec3(), maxSuspensionTravel: 0.24 * KS,
  customSlidingRotationalSpeed: -30, useCustomSlidingRotationalSpeed: true,
};
for (const [x, z] of [[-0.6, -0.66], [0.6, -0.66], [-0.6, 0.62], [0.6, 0.62]]) { WO.chassisConnectionPointLocal.set(x * KS, 0.0, z * KS); vehicle.addWheel({ ...WO, chassisConnectionPointLocal: WO.chassisConnectionPointLocal.clone() }); }
vehicle.addToWorld(world);

/* =====================================================================
   post: tone map → tilt-shift (separable) → grade
   ===================================================================== */
const rt = new THREE.WebGLRenderTarget(innerWidth * DPR, innerHeight * DPR, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(DPR);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new OutputPass());
const TiltShader = {
  uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() }, uFocus: { value: 0.5 }, uAmt: { value: 1.7 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uDir; uniform float uFocus; uniform float uAmt; varying vec2 vUv;
    void main(){ vec2 q = (vUv - vec2(.5, uFocus)) * vec2(.55, 1.);
      float b = smoothstep(.26, .7, length(q)) * uAmt; vec2 o = uDir * b;
      vec4 s = texture2D(tDiffuse, vUv) * .227027;
      s += texture2D(tDiffuse, vUv + o * 1.3846) * .3162162; s += texture2D(tDiffuse, vUv - o * 1.3846) * .3162162;
      s += texture2D(tDiffuse, vUv + o * 3.2308) * .0702703; s += texture2D(tDiffuse, vUv - o * 3.2308) * .0702703;
      gl_FragColor = s; }`,
};
const tiltH = new ShaderPass(TiltShader), tiltV = new ShaderPass(TiltShader);
composer.addPass(tiltH); composer.addPass(tiltV);
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2() } },
  vertexShader: TiltShader.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(.2126, .7152, .0722));
      // split tone: lilac shadows, peach highlights
      c += mix(vec3(.01, -.008, .04), vec3(.034, .014, -.026), smoothstep(.22, .85, l)) * .9;
      c = (c - .5) * 1.1 + .5;
      c = mix(vec3(l), c, 1.16);
      // aerial perspective: the far (top) of the frame lifts into warm haze
      c = mix(c, vec3(.99, .91, .84), smoothstep(.66, 1.0, vUv.y) * .1);
      // rounded vignette toward plum, never black
      vec2 q = vUv - .5; float v = dot(q * vec2(1., .9), q * vec2(1., .9));
      c = mix(c, c * vec3(.88, .83, .92), smoothstep(.14, .5, v) * .42);
      c += (h(vUv * uRes + fract(uTime) * 91.7) - .5) * .028;
      gl_FragColor = vec4(c, 1.); }`,
});
composer.addPass(grade);

/* =====================================================================
   sound — synthesized, starts on the first click
   ===================================================================== */
const audio = { on: true, ctx: null };
function initAudio() {
  if (audio.ctx) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain(); master.gain.value = audio.on ? 0.5 : 0; master.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 3;
    const g = ctx.createGain(); g.gain.value = 0;
    const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; const o2 = ctx.createOscillator(); o2.type = 'triangle';
    o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(master); o1.start(); o2.start();
    Object.assign(audio, { ctx, master, lp, g, o1, o2 });
  } catch (e) { }
}
function tone(freq, dur, type = 'sine', vol = 0.2, when = 0) {
  if (!audio.ctx || !audio.on) return;
  const t = audio.ctx.currentTime + when, o = audio.ctx.createOscillator(), g = audio.ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(audio.master); o.start(t); o.stop(t + dur + 0.05);
}
function thud(v) {
  if (!audio.ctx || !audio.on) return;
  const ctx = audio.ctx, n = ctx.sampleRate * 0.12, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  const s = ctx.createBufferSource(); s.buffer = buf; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500 + v * 120;
  const g = ctx.createGain(); g.gain.value = Math.min(0.5, v * 0.06); s.connect(f); f.connect(g); g.connect(audio.master); s.start();
}

/* =====================================================================
   UI: toasts, stamps, sheet, list
   ===================================================================== */
let toastT;
function toast(t, s = '') {
  $('toastT').textContent = t; $('toastS').textContent = s;
  const el = $('toast'); el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2800);
}
const stamped = new Set();
STANDS.forEach((s, i) => { const d = document.createElement('span'); d.className = 'st'; d.style.setProperty('--c', s.color); d.textContent = s.stamp || s.short[0]; d.title = s.title; $('stampRow').appendChild(d); });
function stamp(s) {
  if (stamped.has(s.id)) return;
  stamped.add(s.id);
  const i = STANDS.indexOf(s); $('stampRow').children[i].classList.add('got');
  $('stampN').textContent = `${stamped.size} / ${STANDS.length}`; $('stampN2').textContent = `${stamped.size}/${STANDS.length}`;
  tone(880, 0.25, 'sine', 0.12); tone(1320, 0.4, 'sine', 0.1, 0.09);
  if (stamped.size === STANDS.length) setTimeout(() => toast('Park complete', 'every stand stamped · thanks for the drive'), 900);
  else toast(`Stamp ${stamped.size} of ${STANDS.length}`, s.short || s.title);
}

const panel = $('panel');
let openStand = null, openVia = null, projectFocus = null, focusPoint = null;
function wordsHTML(str, base = 0, step = 40) {
  return String(str || '').split(' ').filter(Boolean).map((w, i) => `<span class="blr" style="transition-delay:${base + i * step}ms">${w}</span>`).join(' ');
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function showSheet() {
  const body = $('pBody');
  panel.classList.remove('closing'); panel.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => { panel.classList.add('on'); requestAnimationFrame(() => body.classList.add('in')); });
  tone(660, 0.18, 'triangle', 0.08);
}
function openProject(i) {
  const stand = STANDS.find(s => s.id === 'projects');
  const blocks = stand.blocks;
  i = (i + blocks.length) % blocks.length;
  if (openVia === 'project' && projectFocus === i && panel.classList.contains('on')) return;
  projectFocus = i; openStand = stand; openVia = 'project';
  const b = blocks[i];
  panel.style.setProperty('--c', stand.color);
  const img = $('pImg');
  img.src = posterData({ title: b.h.replace(/^\d+\s·\s/, ''), badge: String(i + 1).padStart(2, '0'), color: stand.color });
  img.alt = b.h; img.parentElement.style.display = '';
  $('pIdx').textContent = String(i + 1).padStart(2, '0');
  let html = `<p class="mono" style="color:var(--ink-62)">Project ${i + 1} of ${blocks.length}</p>`;
  html += `<h2 id="pTitle">${wordsHTML(b.h, 80, 40)}</h2>`;
  if (b.s) html += `<p class="mono dim">${esc(b.s)}</p>`;
  if (b.items) html += `<ul class="bul">${b.items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  if (b.scam) html += `<div class="scam"><button type="button" data-r="SAFE">Safe</button><button type="button" data-r="SUSPICIOUS">Suspicious</button><button type="button" data-r="SCAM">Scam</button><p class="scam-out"></p></div>`;
  const body = $('pBody'); body.innerHTML = html; body.scrollTop = 0;
  const cta = $('pCta'); $('pCtaT').textContent = 'GitHub'; cta.href = b.href; cta.dataset.soon = ''; cta.target = '_blank'; cta.rel = 'noopener';
  focusPoint = projectCards[i] ? projectCards[i].position.clone() : null;
  showSheet();
}
function openPanel(s, via = 'pad') {
  if (openStand === s && openVia !== 'project' && panel.classList.contains('on')) return;
  projectFocus = null; focusPoint = null;
  openStand = s; openVia = via;
  panel.style.setProperty('--c', s.color);
  const img = $('pImg');
  img.src = posterData(s);
  img.alt = `${s.title}`;
  img.parentElement.style.display = '';
  $('pIdx').textContent = s.badge || s.kind.toUpperCase();
  const head = s.h || s.title;
  let html = `<p class="mono" style="color:var(--ink-62)">${esc(s.kicker || s.badge || '')}</p>`;
  html += `<h2 id="pTitle">${wordsHTML(head, 120, 70)}</h2>`;
  html += `<p class="lede">${wordsHTML(s.lede[0], 300, 22)} <span class="dim">${wordsHTML(s.lede[1] || '', 420, 22)}</span></p>`;
  if (s.chips) html += `<div class="chips">${s.chips.map(c => `<span class="mono">${esc(c)}</span>`).join('')}</div>`;
  if (s.links) html += `<div class="chips">${s.links.map(([label, href]) => `<a class="mono" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`).join('')}</div>`;
  if (s.email) html += `<div class="contact"><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></div>`;
  html += `<div class="copy">${(s.copy || []).map(p => `<p>${esc(p)}</p>`).join('')}</div>`;
  if (s.blocks) html += s.blocks.map(b => {
    let bit = `<h3 class="blockh">${esc(b.h)}</h3>`;
    if (b.s) bit += `<p class="mono dim">${esc(b.s)}</p>`;
    if (b.items) bit += `<ul class="bul">${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (b.href) bit += `<p class="mono"><a href="${esc(b.href)}" target="_blank" rel="noopener">GitHub</a></p>`;
    if (b.scam) bit += `<div class="scam"><button type="button" data-r="SAFE">Safe</button><button type="button" data-r="SUSPICIOUS">Suspicious</button><button type="button" data-r="SCAM">Scam</button><p class="scam-out"></p></div>`;
    return bit;
  }).join('');
  if (s.meta) html += `<dl class="meta">${s.meta.map(([k, v]) => `<div><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  const body = $('pBody'); body.innerHTML = html; body.scrollTop = 0;
  const cta = $('pCta');
  if (s.cta) { $('pCtaT').textContent = s.cta[0]; cta.href = s.cta[1]; cta.dataset.soon = ''; cta.target = '_blank'; cta.rel = 'noopener'; }
  else { $('pCtaT').textContent = 'GitHub'; cta.href = LINKS.github; cta.dataset.soon = ''; }
  panel.classList.remove('closing'); panel.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => { panel.classList.add('on'); requestAnimationFrame(() => body.classList.add('in')); });
  tone(660, 0.18, 'triangle', 0.08);
}
function posterData(s) {
  const title = esc(s.title || '');
  const badge = esc(s.badge || '');
  const fill = s.color || '#cdb8f0';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${fill}"/><rect x="28" y="28" width="344" height="244" rx="16" fill="#fbf3e6"/><text x="48" y="78" font-family="Space Mono, monospace" font-size="16" fill="#2a1d38">${badge}</text><text x="48" y="160" font-family="Syne, sans-serif" font-size="42" font-weight="800" fill="#2a1d38">${title}</text></svg>`);
}
function closePanel() {
  if (!openStand) return;
  openStand = null; openVia = null; projectFocus = null; focusPoint = null;
  panel.classList.remove('on'); panel.classList.add('closing'); $('pBody').classList.remove('in'); panel.setAttribute('aria-hidden', 'true');
  setTimeout(() => panel.classList.remove('closing'), 1000);
  $('pBar').style.transition = 'none'; $('pBar').style.transform = 'scaleX(0)';
}
$('pClose').addEventListener('click', () => { closePanel(); if (tour.on) stopTour('Tour stopped'); });
$('pBody').addEventListener('click', e => {
  const b = e.target.closest('[data-r]');
  if (!b) return;
  const sample = SCAM[b.dataset.r];
  const out = b.parentElement.querySelector('.scam-out');
  if (out && sample) out.innerHTML = `<strong>${esc(b.dataset.r)}</strong> ${esc(sample.line)} ${esc(sample.note)}`;
});
$('pCta').addEventListener('click', () => {});
const stepStand = d => {
  if (openVia === 'project' && projectFocus != null) { openProject(projectFocus + d); return; }
  const i = STANDS.indexOf(openStand); const s = STANDS[(i + d + STANDS.length) % STANDS.length]; closePanel(); setTimeout(() => { openPanel(s, 'list'); goTo(s); }, 60);
};
$('pPrev').addEventListener('click', () => stepStand(-1));
$('pNext').addEventListener('click', () => stepStand(1));

const list = $('list');
let lastFocus;
function openList() { lastFocus = document.activeElement; list.classList.add('on'); setTimeout(() => list.querySelector('li button')?.focus(), 50); }
function closeList() { list.classList.remove('on'); lastFocus?.focus?.(); }
buildListInto($('lItems'), s => { closeList(); openPanel(s, 'list'); goTo(s); });
$('btnList').addEventListener('click', openList);
$('lClose').addEventListener('click', closeList);
list.addEventListener('click', e => { if (e.target === list) closeList(); });
$('lTour').addEventListener('click', () => { closeList(); startTour(); });
$('btnTour').addEventListener('click', () => tour.on ? stopTour('Tour stopped') : startTour());
$('btnSound').addEventListener('click', () => {
  audio.on = !audio.on; $('btnSound').setAttribute('aria-pressed', audio.on); $('btnSound').querySelector('.wv').style.opacity = audio.on ? 1 : 0.15;
  if (audio.master) audio.master.gain.value = audio.on ? 0.5 : 0;
});

/* =====================================================================
   input
   ===================================================================== */
const keys = { f: 0, b: 0, l: 0, r: 0, boost: 0 };
const KEYMAP = { ArrowUp: 'f', KeyW: 'f', ArrowDown: 'b', KeyS: 'b', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ShiftLeft: 'boost', ShiftRight: 'boost' };
let state = 'loading'; // loading → intro → drive
addEventListener('keydown', e => {
  if (list.classList.contains('on')) { if (e.code === 'Escape') closeList(); return; }
  if (state === 'intro') { if (!['Tab'].includes(e.code)) beginDrive(); return; }
  if (state !== 'drive') return;
  const k = KEYMAP[e.code];
  if (k) { keys[k] = 1; e.preventDefault(); if (tour.on && k !== 'boost') stopTour('You have the wheel'); goal = null; }
  if (e.code === 'Space') { e.preventDefault(); hop(); }
  if (e.code === 'KeyR') resetKart(false);
  if (e.code === 'Escape') { closePanel(); if (tour.on) stopTour('Tour stopped'); }
  if (e.code === 'KeyT') tour.on ? stopTour('Tour stopped') : startTour();
});
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys[k] = 0; });
addEventListener('blur', () => { for (const k in keys) keys[k] = 0; });

const joy = { on: false, x: 0, y: 0, id: null };
{
  const el = $('joy'), nub = $('nub');
  const move = e => {
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, max = r.width * 0.36;
    let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy); if (d > max) { dx *= max / d; dy *= max / d; }
    joy.x = dx / max; joy.y = dy / max; nub.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  el.addEventListener('pointerdown', e => { if (state === 'intro') beginDrive(); joy.on = true; joy.id = e.pointerId; el.setPointerCapture(e.pointerId); move(e); if (tour.on) stopTour('You have the wheel'); goal = null; });
  el.addEventListener('pointermove', e => { if (joy.on && e.pointerId === joy.id) move(e); });
  const end = () => { joy.on = false; joy.x = joy.y = 0; nub.style.transform = ''; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  const hold = (id, on, off) => { const b = $(id); b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('on'); on(); }); const up = () => { b.classList.remove('on'); off && off(); }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up); };
  hold('tHop', () => hop());
  hold('tBoost', () => keys.boost = 1, () => keys.boost = 0);
}
$('btnJump').addEventListener('pointerdown', e => { e.preventDefault(); if (state === 'intro') beginDrive(); hop(); });

// click the world: start, or click a stand to open it
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let downAt = null;
canvas.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', e => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 8) return;
  if (state === 'intro') { beginDrive(); return; }
  if (state !== 'drive') return;
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const cardHits = ray.intersectObjects(projectCards.concat(socialSigns), true);
  if (cardHits.length) {
    let o = cardHits[0].object;
    while (o && o.userData.projectIndex == null && !o.userData.contact) o = o.parent;
    if (o && o.userData.projectIndex != null) { openProject(o.userData.projectIndex); return; }
    if (o && o.userData.contact) { openPanel(STANDS.find(s => s.id === 'contact'), 'click'); return; }
  }
  const hit = new THREE.Vector3();
  if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) {
    for (const p of pads) {
      const st = polar(p.stand.angle, STAND_R);
      if (hit.distanceTo(p.pos) < 3 || Math.hypot(hit.x - st.x, hit.z - st.z) < 4.5) { openPanel(p.stand, 'click'); goTo(p.stand); return; }
    }
  }
});
let camDist = null;
canvas.addEventListener('wheel', e => { if (state !== 'drive') return; e.preventDefault(); camDistTarget = clamp(camDistTarget + e.deltaY * 0.02, 16, 46); }, { passive: false });

/* =====================================================================
   driving
   ===================================================================== */
const ENGINE = 760, FWD = 1, STEER_MAX = 0.55;
let steerVal = 0, hopCool = 0, blastCool = 0, flipT = 0, recoverN = 0, recover = null, airT = 0, lastGround = 0, stuckT = 0, projectsHint = false;
const fwdV = new CANNON.Vec3(), upV = new CANNON.Vec3();
function speedFwd() { chassis.quaternion.vmult(new CANNON.Vec3(0, 0, -1), fwdV); return chassis.velocity.dot(fwdV); }
function grounded() { let n = 0; for (const w of vehicle.wheelInfos) if (w.isInContact) n++; return n; }
function hop() {
  if (state !== 'drive' || hopCool > 0 || list.classList.contains('on')) return;
  const near = chassis.position.y < 1.7 && Math.abs(chassis.velocity.y) < 3;
  if (grounded() < 1 && !near) return;
  chassis.velocity.y = Math.max(chassis.velocity.y, 10);
  chassis.quaternion.vmult(new CANNON.Vec3(0, 0, -1), fwdV);
  chassis.velocity.x += fwdV.x * 4;
  chassis.velocity.z += fwdV.z * 4;
  hopCool = 0.55; tone(220, 0.15, 'triangle', 0.1);
}
function resetKart(home) {
  const p = home ? SPAWN : chassis.position;
  const f = new THREE.Vector3(0, 0, -1).applyQuaternion(kart.quaternion); const yaw = Math.atan2(-f.x, -f.z);
  chassis.position.set(p.x, 1.4, p.z); chassis.velocity.setZero(); chassis.angularVelocity.setZero();
  chassis.quaternion.setFromEuler(0, home ? 0 : yaw, 0);
}
// steer the kart toward a world point; returns [throttle, steer]
const _loc = new CANNON.Vec3();
function steerToward(tx, tz, speedCap = 1) {
  const d = new CANNON.Vec3(tx - chassis.position.x, 0, tz - chassis.position.z);
  chassis.quaternion.conjugate().vmult(d, _loc);
  const ang = Math.atan2(_loc.x, -_loc.z); // + = target to the right
  return [speedCap, clamp(-ang * 1.8, -1, 1), ang];
}
// autopilot: a list of waypoints
let goal = null; // { pts: [[x,z]...], i, stand, onArrive }
const tour = { on: false, i: 0, wait: 0 };
const TOUR_ORDER = ['about', 'education', 'skills', 'patchifi', 'appify', 'projects', 'contact'].map(id => STANDS.find(s => s.id === id));
function angOf(x, z) { return Math.atan2(x, -z) / DEG; }
function routeTo(s) {
  const pts = [];
  const px = chassis.position.x, pz = chassis.position.z, r = Math.hypot(px, pz);
  const ta = s.angle;
  let a0;
  if (r < PLAZA_R + 1) {
    const spokes = [0, 90, 180, -90];
    const sp = spokes.reduce((b, a) => Math.abs(((ta - a + 540) % 360) - 180) < Math.abs(((ta - b + 540) % 360) - 180) ? a : b, 0);
    if (Math.hypot(px, pz) > 2.5) pts.push([0, 0]);
    pts.push([polar(sp, PLAZA_R - 2).x, polar(sp, PLAZA_R - 2).z], [polar(sp, RING_R - 3).x, polar(sp, RING_R - 3).z]);
    a0 = sp;
  } else {
    a0 = angOf(px, pz);
    if (Math.abs(r - RING_R) > 3) pts.push([polar(a0, RING_R).x, polar(a0, RING_R).z]);
  }
  let da = ((ta - a0 + 540) % 360) - 180;
  const steps = Math.max(1, Math.ceil(Math.abs(da) / 10));
  for (let i = 1; i <= steps; i++) { const a = a0 + da * i / steps; const p = polar(a, RING_R); pts.push([p.x, p.z]); }
  return pts;
}
function goTo(s, onArrive) { goal = { pts: routeTo(s), i: 0, stand: s, onArrive, stuck: 0, back: 0 }; }
function startTour() {
  if (state === 'intro') beginDrive();
  closePanel();
  tour.on = true;
  const here = angOf(chassis.position.x, chassis.position.z);
  tour.i = TOUR_ORDER.reduce((b, s, i) => Math.abs(((s.angle - here + 540) % 360) - 180) < Math.abs(((TOUR_ORDER[b].angle - here + 540) % 360) - 180) ? i : b, 0);
  $('btnTour').querySelector('.lbl').textContent = 'Stop tour';
  toast('Auto-tour', 'press any arrow to take the wheel');
  nextTourStop();
}
function nextTourStop() {
  const s = TOUR_ORDER[tour.i % TOUR_ORDER.length];
  goTo(s, () => {
    tour.wait = 6.5;
    const bar = $('pBar'); bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)';
    requestAnimationFrame(() => { bar.style.transition = 'transform 6.5s linear'; bar.style.transform = 'scaleX(1)'; });
  });
}
function stopTour(msg) {
  tour.on = false; goal = null; tour.wait = 0;
  $('btnTour').querySelector('.lbl').textContent = 'Auto-tour';
  $('pBar').style.transition = 'none'; $('pBar').style.transform = 'scaleX(0)';
  if (msg) toast(msg, 'arrows or WASD to drive');
}

function drive(dt) {
  let throttle = 0, steer = 0, boost = !!keys.boost, brake = 0;
  const vF = speedFwd();
  const speed = chassis.velocity.length();
  if (state !== 'drive') { brake = 2; }
  else if (goal) {
    const g = goal, last = g.i >= g.pts.length - 1;
    const [tx, tz] = g.pts[Math.min(g.i, g.pts.length - 1)];
    const dist = Math.hypot(tx - chassis.position.x, tz - chassis.position.z);
    if (!last && dist < 3.2) g.i++;
    let [th, st, ang] = steerToward(tx, tz);
    // speed target: slow into corners, roll gently onto the pad
    let vt = 10 * (1 - Math.min(Math.abs(ang), 1.2) / 1.7);
    if (last) vt = Math.min(vt, Math.max(1.5, dist * 0.9));
    th = vF < vt ? 0.9 : 0;
    if (vF > vt + 1) brake = (vF - vt) * 2.2;
    // stuck: back out with the wheel the other way
    if (g.back > 0) { g.back -= dt; th = -0.7; st = -st; }
    else if (th > 0.3 && speed < 0.5 && !(last && dist < 2)) { g.stuck += dt; if (g.stuck > 1.1) { g.back = 0.9; g.stuck = 0; } }
    else g.stuck = 0;
    throttle = th; steer = st;
    if (last && dist < 2.0) { throttle = 0; brake = 8; if (speed < 1.5) { const cb = g.onArrive; goal = null; cb && cb(); } }
  } else if (joy.on && (Math.abs(joy.x) + Math.abs(joy.y)) > 0.15) {
    const mag = Math.min(1, Math.hypot(joy.x, joy.y));
    const dx = camRight.x * joy.x - camUp.x * joy.y, dz = camRight.z * joy.x - camUp.z * joy.y;
    const [, st, ang] = steerToward(chassis.position.x + dx * 10, chassis.position.z + dz * 10);
    steer = st; throttle = mag * (Math.abs(ang) > 2.4 && speed < 2 ? 0.5 : 1);
  } else {
    throttle = keys.f - keys.b; steer = keys.l - keys.r;
  }
  const vmax = boost ? 18 : 12.5;
  let force = 0;
  if (throttle > 0) { if (vF < -1.5) brake = 7; else if (vF < vmax) force = ENGINE * throttle * (boost ? 1.45 : 1); }
  else if (throttle < 0) { if (vF > 1.5) brake = 7; else if (vF > -7) force = ENGINE * 0.7 * throttle; }
  else brake = Math.max(brake, 0.9);
  // steering softens with speed, eased so the wheel never snaps
  const maxS = STEER_MAX * (1 - clamp(Math.abs(vF) / 30, 0, 0.45));
  steerVal = damp(steerVal, steer * maxS, 10, dt);
  vehicle.setSteeringValue(steerVal, 0); vehicle.setSteeringValue(steerVal, 1);
  for (let i = 0; i < 4; i++) vehicle.setBrake(brake, i);
  vehicle.applyEngineForce(FWD * force, 2); vehicle.applyEngineForce(FWD * force, 3);
  if (state === 'drive' && throttle > 0.3 && speed < 0.45 && grounded() >= 1 && hopCool <= 0) stuckT += dt;
  else stuckT = 0;
  if (stuckT > 0.55) {
    chassis.quaternion.vmult(new CANNON.Vec3(0, 0, -1), fwdV);
    chassis.velocity.x += fwdV.x * 3.5; chassis.velocity.z += fwdV.z * 3.5;
    chassis.velocity.y = Math.max(chassis.velocity.y, 4);
    stuckT = 0;
  }
  // sound
  if (audio.ctx) {
    const t = audio.ctx.currentTime, sp = Math.abs(vF);
    audio.o1.frequency.setTargetAtTime(55 + sp * 11 + (force ? 18 : 0), t, 0.08);
    audio.o2.frequency.setTargetAtTime(110 + sp * 22, t, 0.08);
    audio.lp.frequency.setTargetAtTime(500 + sp * 80, t, 0.1);
    audio.g.gain.setTargetAtTime(state === 'drive' ? 0.035 + Math.min(sp, 15) * 0.004 + (force ? 0.02 : 0) : 0, t, 0.1);
  }
  return { throttle, force, vF, speed };
}

/* collisions → sound + small achievements */
chassis.addEventListener('collide', e => {
  const v = Math.abs(e.contact.getImpactVelocityAlongNormal());
  if (v > 2.2) thud(v);
  const p = propByBody.get(e.body);
  if (!p || p.burst || !BURST_TAGS.has(p.tag) || v < 3.2 || blastCool > 0) return;
  p.burst = true;
  p.body.wakeUp();
  p.body.velocity.y += 6;
  p.body.angularVelocity.set(R(-5, 5), R(-5, 5), R(-5, 5));
  blast(p.body.position);
});
const counts = { cone: 0, can: 0, crate: 0, pot: 0 };
let strikeDone = false;

/* =====================================================================
   dust puffs
   ===================================================================== */
const dust = [];
{
  const g = G.ico(0.22, 0);
  for (let i = 0; i < 36; i++) {
    const m = new THREE.Mesh(g, patch(new THREE.MeshBasicMaterial({ color: '#dcc3c2', transparent: true, opacity: 0, depthWrite: false }), { key: 'dust', noGlow: true }));
    m.visible = false; scene.add(m); dust.push({ m, t: 0, life: 0, v: new THREE.Vector3() });
  }
}
let dustI = 0;
function puff(p, s = 1) {
  const d = dust[dustI++ % dust.length];
  d.m.position.copy(p); d.m.position.y = 0.2; d.t = 0; d.life = R(0.5, 0.9); d.s = s; d.m.visible = true;
  d.v.set(R(-0.6, 0.6), R(0.6, 1.4), R(-0.6, 0.6));
}
const scraps = [];
{
  const cols = [C.coral, C.butter, C.cream, C.peach, C.ink];
  for (let i = 0; i < 28; i++) {
    const m = new THREE.Mesh(G.box(0.42, 0.08, 0.28), patch(new THREE.MeshBasicMaterial({ color: cols[i % cols.length], transparent: true, depthWrite: false }), { key: 'scrap', noGlow: true }));
    m.visible = false; scene.add(m);
    scraps.push({ m, t: 0, life: 0, v: new THREE.Vector3(), spin: new THREE.Vector3() });
  }
}
let scrapI = 0;
function burstAt(pos) {
  tone(150, 0.16, 'square', 0.07);
  for (let i = 0; i < 14; i++) {
    const s = scraps[scrapI++ % scraps.length];
    s.m.position.set(pos.x, pos.y + 0.4, pos.z);
    s.m.rotation.set(R(0, 6), R(0, 6), R(0, 6));
    s.m.scale.setScalar(R(0.7, 1.35));
    s.m.visible = true; s.t = 0; s.life = R(0.7, 1.05);
    const a = R(0, 6.28), sp = R(2.2, 5);
    s.v.set(Math.cos(a) * sp, R(4, 8), Math.sin(a) * sp);
    s.spin.set(R(-8, 8), R(-8, 8), R(-8, 8));
  }
}
const chunks = [];
const fires = [];
{
  const chunkGeo = G.box(0.22, 0.16, 0.22);
  const chunkCols = ['#1a1014', '#3a1816', '#6e2420', '#2a1d38'];
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(chunkGeo, patch(new THREE.MeshBasicMaterial({ color: chunkCols[i % chunkCols.length], transparent: true, depthWrite: false }), { key: 'chunk', noGlow: true }));
    m.visible = false; scene.add(m);
    chunks.push({ m, t: 0, life: 0, v: new THREE.Vector3(), spin: new THREE.Vector3() });
  }
  const fireGeo = new THREE.SphereGeometry(1, 16, 12);
  const fireVert = 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  const fireFrag = `varying vec3 vP; uniform float uProgress;
    float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
    float n(vec3 p){
      vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
      float n000 = hash(i);
      float n100 = hash(i + vec3(1.0, 0.0, 0.0));
      float n010 = hash(i + vec3(0.0, 1.0, 0.0));
      float n110 = hash(i + vec3(1.0, 1.0, 0.0));
      float n001 = hash(i + vec3(0.0, 0.0, 1.0));
      float n101 = hash(i + vec3(1.0, 0.0, 1.0));
      float n011 = hash(i + vec3(0.0, 1.0, 1.0));
      float n111 = hash(i + vec3(1.0, 1.0, 1.0));
      float x00 = mix(n000, n100, f.x); float x10 = mix(n010, n110, f.x);
      float x01 = mix(n001, n101, f.x); float x11 = mix(n011, n111, f.x);
      return mix(mix(x00, x10, f.y), mix(x01, x11, f.y), f.z);
    }
    void main(){
      float edge = n(normalize(vP) * 3.4) - uProgress;
      if (edge < 0.0) discard;
      vec3 col = mix(vec3(0.10, 0.06, 0.08), vec3(1.0, 0.353, 0.196), clamp(edge * 2.4, 0.0, 1.0));
      gl_FragColor = vec4(col, 1.0);
    }`;
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(fireGeo, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uProgress: { value: 0 } },
      vertexShader: fireVert, fragmentShader: fireFrag,
    }));
    m.visible = false; m.renderOrder = 3; scene.add(m);
    fires.push({ m, t: 0, life: 0.9 });
  }
}
let fireI = 0, chunkI = 0;
const blastKick = new CANNON.Vec3();
let camKick = 0;
function blast(pos) {
  if (blastCool > 0) return;
  blastCool = 1.2;
  const f = fires[fireI++ % fires.length];
  f.m.position.set(pos.x, Math.max(pos.y, 0.7), pos.z);
  f.m.scale.setScalar(0.45);
  f.m.rotation.set(R(0, 6), R(0, 6), 0);
  f.m.material.uniforms.uProgress.value = 0.05;
  f.m.visible = true; f.t = 0; f.life = 0.9;
  for (let i = 0; i < 8; i++) {
    const c = chunks[chunkI++ % chunks.length];
    c.m.position.set(pos.x, pos.y + 0.4, pos.z);
    c.m.rotation.set(R(0, 6), R(0, 6), R(0, 6));
    c.m.scale.setScalar(R(0.6, 1.3));
    c.m.visible = true; c.t = 0; c.life = R(0.55, 0.9);
    const a = R(0, 6.28), sp = R(3, 7);
    c.v.set(Math.cos(a) * sp, R(4, 8), Math.sin(a) * sp);
    c.spin.set(R(-8, 8), R(-8, 8), R(-8, 8));
  }
  burstAt(pos);
  const dx = chassis.position.x - pos.x, dz = chassis.position.z - pos.z;
  const d = Math.hypot(dx, dz) || 1;
  chassis.velocity.x += (dx / d) * 5;
  chassis.velocity.z += (dz / d) * 5;
  chassis.velocity.y = Math.max(chassis.velocity.y, 10);
  chassis.quaternion.vmult(new CANNON.Vec3(1, 0, 0), blastKick);
  chassis.angularVelocity.x += blastKick.x * 2.2;
  chassis.angularVelocity.y += blastKick.y * 2.2;
  chassis.angularVelocity.z += blastKick.z * 2.2;
  camKick = 0.16;
  tone(70, 0.22, 'sawtooth', 0.08);
}

/* =====================================================================
   tyre trails: fading marks wherever the kart slides
   ===================================================================== */
const TRAIL_N = 360;
const trail = (() => {
  const pos = new Float32Array(TRAIL_N * 6 * 3), birth = new Float32Array(TRAIL_N * 6).fill(-99);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('birth', new THREE.BufferAttribute(birth, 1).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uTime: RU.uTime, uCol: { value: new THREE.Color('#6b5378') } },
    vertexShader: 'attribute float birth; uniform float uTime; varying float vA; void main(){ vA = clamp(1. - (uTime - birth) / 7., 0., 1.); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform vec3 uCol; varying float vA; void main(){ if (vA <= 0.) discard; gl_FragColor = vec4(uCol, vA * .32); }',
  });
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = 1; scene.add(m);
  return { pos, birth, geo, i: 0, last: [null, null] };
})();
function trailPush(w, p, now) {
  const prev = trail.last[w];
  trail.last[w] = p.clone();
  if (!prev || prev.distanceTo(p) > 1.2) return;
  if (prev.distanceTo(p) < 0.05) { trail.last[w] = prev; return; }
  const d = new THREE.Vector3().subVectors(p, prev); const n = new THREE.Vector3(-d.z, 0, d.x).normalize().multiplyScalar(0.11);
  const q = [prev.clone().add(n), prev.clone().sub(n), p.clone().add(n), p.clone().sub(n)];
  const k = trail.i++ % TRAIL_N, o = k * 18;
  [q[0], q[1], q[2], q[1], q[3], q[2]].forEach((v, j) => { trail.pos[o + j * 3] = v.x; trail.pos[o + j * 3 + 1] = 0.035; trail.pos[o + j * 3 + 2] = v.z; trail.birth[k * 6 + j] = now; });
  trail.geo.attributes.position.needsUpdate = true; trail.geo.attributes.birth.needsUpdate = true;
}
const rightV = new CANNON.Vec3();

/* =====================================================================
   kart life: suspension bob, squat and dive, lean into turns, scarf, sparks
   ===================================================================== */
const kAnim = { vF: 0, pitch: 0, roll: 0, bob: 0, bobV: 0, vy: 0 };
const sparks = [];
{
  const g = new THREE.TetrahedronGeometry(0.07, 0);
  for (let i = 0; i < 48; i++) {
    const m = new THREE.Mesh(g, patch(new THREE.MeshBasicMaterial({ color: i % 3 ? '#9ff5d6' : '#fff2b0', transparent: true, depthWrite: false, fog: false }), { key: 'spark', noGlow: true }));
    m.visible = false; scene.add(m); sparks.push({ m, t: 0, life: 0, v: new THREE.Vector3() });
  }
}
let sparkI = 0, sparkAcc = 0;
function animateKart(dt, t, info) {
  const b = kartParts.body; if (!b) return;
  const accel = (info.vF - kAnim.vF) / Math.max(dt, 1e-3); kAnim.vF = info.vF;
  kAnim.pitch = damp(kAnim.pitch, clamp(accel * 0.0065, -0.09, 0.09), 6, dt);              // squat on throttle, dive on brake
  const lean = clamp(steerVal * Math.min(Math.abs(info.vF) / 9, 1.2) * 0.16, -0.16, 0.16);    // lean into the turn
  kAnim.roll = damp(kAnim.roll, lean * Math.sign(info.vF || 1), 7, dt);
  // a springy bob driven by the chassis' vertical kicks
  const vy = chassis.velocity.y; const kick = (vy - kAnim.vy); kAnim.vy = vy;
  kAnim.bobV += (-kAnim.bob * 260 - kAnim.bobV * 14) * dt - kick * 0.9; kAnim.bob += kAnim.bobV * dt;
  kAnim.bob = clamp(kAnim.bob, -0.06, 0.06);
  const idle = state === 'drive' ? Math.sin(t * 14) * 0.006 * Math.min(info.speed / 6, 1) + Math.sin(t * 3.1) * 0.004 : Math.sin(t * 2.2) * 0.006;
  b.position.y = kAnim.bob + idle; b.rotation.x = kAnim.pitch; b.rotation.z = kAnim.roll;
  kartParts.drv.rotation.z = kAnim.roll * 0.8;
  // scarf: trails back with speed, ripples with time
  const sp = Math.min(info.speed / 12, 1);
  kartParts.scarf.forEach((seg, i) => {
    seg.rotation.x = -0.9 + sp * 0.75 + Math.sin(t * (9 + sp * 8) - i * 0.9) * (0.12 + sp * 0.18);
    seg.rotation.y = Math.sin(t * 6 - i * 1.1) * (0.08 + sp * 0.2) - steerVal * 0.25;
  });
  // electric sparks off the battery when the motor is pulling
  const pull = info.force > 0 ? (keys.boost ? 60 : 22) : 0;
  sparkAcc += pull * dt;
  while (sparkAcc > 1) {
    sparkAcc -= 1;
    const s = sparks[sparkI++ % sparks.length];
    s.m.position.set(R(-0.25, 0.25), 0.3, 1.0).multiplyScalar(KS).applyMatrix4(kart.matrixWorld);
    s.v.set(R(-0.8, 0.8), R(0.6, 2.2), R(1.5, 3.2)).applyQuaternion(kart.quaternion).add(new THREE.Vector3(chassis.velocity.x, 0, chassis.velocity.z).multiplyScalar(0.6));
    s.t = 0; s.life = R(0.25, 0.5); s.m.visible = true; s.m.rotation.set(R(0, 6), R(0, 6), 0);
  }
  for (const s of sparks) if (s.m.visible) {
    s.t += dt; const k = s.t / s.life; if (k >= 1) { s.m.visible = false; continue; }
    s.v.y -= 9 * dt; s.m.position.addScaledVector(s.v, dt); s.m.material.opacity = 1 - k; s.m.scale.setScalar(1 - k * 0.6);
  }
  // contact shadow
  const bl = kartParts.blob; bl.position.set(chassis.position.x, 0.04, chassis.position.z);
  const f = new THREE.Vector3(0, 0, -1).applyQuaternion(kart.quaternion); bl.rotation.z = Math.atan2(f.x, -f.z) * -1;
  const air = clamp(chassis.position.y - 0.55, 0, 3); bl.material.opacity = 1 - air * 0.28; bl.scale.setScalar(1 + air * 0.15);
}

/* =====================================================================
   loop
   ===================================================================== */
const clock = new THREE.Clock();
const camTarget = new THREE.Vector3(SPAWN.x, 0, SPAWN.z);
let camDistTarget = 22, camDistNow = 13.5, camLook = new THREE.Vector3();
const tmp = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), camLead = new THREE.Vector3();
const updaters = [];
let revealAnim = null;
function baseDist() { const a = innerWidth / innerHeight; return a < 0.8 ? 31 : a < 1.2 ? 26 : 21.5; }

function frame() {
  const dt = Math.min(clock.getDelta(), 1 / 30);
  const t = clock.elapsedTime;
  RU.uTime.value = t; grade.uniforms.uTime.value = t;

  // reveal animation
  if (revealAnim) {
    const k = clamp((performance.now() - revealAnim.t0) / revealAnim.dur, 0, 1);
    const e = revealAnim.ease(k);
    RU.uReveal.value = revealAnim.from + (revealAnim.to - revealAnim.from) * e;
    if (revealAnim.ring) RU.uRingOn.value = revealAnim.ring(k);
    if (k >= 1) { const cb = revealAnim.done; revealAnim = null; cb && cb(); }
  }

  const info = drive(dt);
  world.step(1 / 60, dt, 4);
  hopCool -= dt;
  if (blastCool > 0) blastCool -= dt;
  for (const f of fires) if (f.m.visible) {
    f.t += dt; const k = f.t / f.life;
    if (k >= 1) { f.m.visible = false; continue; }
    f.m.scale.setScalar(0.45 + k * 2.7);
    f.m.material.uniforms.uProgress.value = 0.08 + k * 1.05;
    f.m.rotation.y += dt * 0.7;
  }
  for (const c of chunks) if (c.m.visible) {
    c.t += dt; const k = c.t / c.life; if (k >= 1) { c.m.visible = false; continue; }
    c.v.y -= 16 * dt; c.m.position.addScaledVector(c.v, dt);
    c.m.rotation.x += c.spin.x * dt; c.m.rotation.y += c.spin.y * dt;
    c.m.material.opacity = 1 - k;
  }

  if (state === 'drive') {
    const fast = Math.hypot(chassis.velocity.x, chassis.velocity.z) > 6;
    for (const b of bumps) {
      const near = chassis.position.y > 1 && Math.hypot(chassis.position.x - b.x, chassis.position.z - b.z) < b.rad;
      if (near && !b.hot && fast) chassis.velocity.y = Math.max(chassis.velocity.y, 8.2);
      b.hot = near;
    }
  }

  // sync kart
  kart.position.copy(chassis.position); kart.quaternion.copy(chassis.quaternion);
  for (let i = 0; i < 4; i++) {
    vehicle.updateWheelTransform(i);
    const wt = vehicle.wheelInfos[i].worldTransform;
    wheelMeshes[i].position.copy(wt.position); wheelMeshes[i].quaternion.copy(wt.quaternion);
  }
  kartParts.wheel.rotation.z = -steerVal * 2.2;
  kartParts.head.rotation.y = damp(kartParts.head.rotation.y, steerVal * 0.9, 6, dt);
  kartParts.flag.rotation.y = Math.sin(t * 9) * 0.25 - Math.min(info.speed, 14) * 0.02;
  animateKart(dt, t, info);
  kartParts.strip.material.emissiveIntensity = 0.45 + (info.force ? 0.7 : 0);
  const blinkOn = Math.sin(t * 7) > 0;
  if (kartParts.blinkL) kartParts.blinkL.material.emissiveIntensity = steerVal < -0.08 && blinkOn ? 2.4 : 0.12;
  if (kartParts.blinkR) kartParts.blinkR.material.emissiveIntensity = steerVal > 0.08 && blinkOn ? 2.4 : 0.12;
  const slowing = info.throttle < 0 || (keys.b && info.vF > 1);
  for (const tail of kartParts.brakes) tail.material.emissiveIntensity = slowing ? 2.6 : 0.28;
  RU.uKart.value.set(chassis.position.x, chassis.position.z);
  if (!projectsHint && state === 'drive') {
    for (const g of projectCards) if (chassis.position.distanceTo(g.position) < 9) { projectsHint = true; toast('Five builds', 'click a sign to read it'); break; }
  }

  // sideways or upside down: hop, then roll back onto the wheels over a short beat
  chassis.quaternion.vmult(new CANNON.Vec3(0, 1, 0), upV);
  if (recover) {
    recover.t += dt;
    const k = Math.min(recover.t / 0.45, 1);
    const ease = k * k * (3 - 2 * k);
    const target = new CANNON.Quaternion();
    target.setFromEuler(0, recover.yaw, 0);
    recover.from.slerp(target, ease, chassis.quaternion);
    chassis.angularVelocity.set(0, 0, 0);
    if (k >= 1) recover = null;
  } else if (upV.y < 0.55 && state === 'drive' && chassis.position.y < 1.6 && chassis.velocity.y < 2.5) {
    flipT += dt;
    if (flipT > 0.8) {
      flipT = 0; recoverN++;
      if (recoverN > 2) { recoverN = 0; resetKart(true); }
      else {
        chassis.velocity.y = Math.max(chassis.velocity.y, 6);
        chassis.quaternion.vmult(new CANNON.Vec3(0, 0, -1), fwdV);
        const yaw = Math.atan2(-fwdV.x, -fwdV.z);
        const axis = new CANNON.Vec3();
        chassis.quaternion.vmult(upV.y < 0 ? new CANNON.Vec3(1, 0, 0) : new CANNON.Vec3(0, 0, -1), axis);
        chassis.angularVelocity.set(axis.x * 4, axis.y * 4, axis.z * 4);
        recover = { t: 0, from: chassis.quaternion.clone(), yaw };
      }
    }
  } else { flipT = 0; if (upV.y > 0.85) recoverN = 0; }
  if (Math.hypot(chassis.position.x, chassis.position.z) > 54 || chassis.position.y < -5) resetKart(true);

  // airtime
  const gnd = grounded();
  if (gnd === 0 && state === 'drive') airT += dt; else { if (airT > 0.55) toast('Big air', `${airT.toFixed(2)} s off the ground`); airT = 0; }

  // dust
  if (state === 'drive' && gnd > 2 && info.speed > 2 && (info.force && info.speed < 9 || Math.abs(steerVal) > 0.35 && info.speed > 7) && Math.random() < 0.5) {
    const wi = vehicle.wheelInfos[2 + (Math.random() < 0.5 ? 0 : 1)]; puff(new THREE.Vector3().copy(wi.worldTransform.position));
  }
  chassis.quaternion.vmult(new CANNON.Vec3(1, 0, 0), rightV);
  const lat = Math.abs(chassis.velocity.dot(rightV));
  const skid = state === 'drive' && gnd > 2 && (lat > 2.2 || (info.speed > 4 && Math.abs(info.vF) > 2 && info.throttle !== 0 && Math.sign(info.throttle) !== Math.sign(info.vF)));
  for (let w = 0; w < 2; w++) {
    if (skid) { const wp = vehicle.wheelInfos[2 + w].worldTransform.position; trailPush(w, new THREE.Vector3(wp.x, 0, wp.z), t); if (Math.random() < 0.35) puff(new THREE.Vector3(wp.x, 0, wp.z), 1.3); }
    else trail.last[w] = null;
  }
  for (const d of dust) if (d.m.visible) {
    d.t += dt; const k = d.t / d.life; if (k >= 1) { d.m.visible = false; continue; }
    d.m.position.addScaledVector(d.v, dt); d.m.scale.setScalar(0.4 + k * 1.6); d.m.material.opacity = (1 - k) * 0.85;
  }
  for (const s of scraps) if (s.m.visible) {
    s.t += dt; const k = s.t / s.life; if (k >= 1) { s.m.visible = false; continue; }
    s.v.y -= 18 * dt;
    s.m.position.addScaledVector(s.v, dt);
    s.m.rotation.x += s.spin.x * dt; s.m.rotation.y += s.spin.y * dt; s.m.rotation.z += s.spin.z * dt;
    s.m.material.opacity = 1 - k;
  }

  // props
  for (const p of props) {
    p.mesh.position.copy(p.body.position); p.mesh.quaternion.copy(p.body.quaternion);
    if (!p.down && state === 'drive') {
      p.body.quaternion.vmult(new CANNON.Vec3(0, 1, 0), upV);
      const moved = p.body.position.distanceTo(p.home);
      if (upV.y < 0.6 || moved > 0.9) {
        p.down = true; if (counts[p.tag] != null) counts[p.tag]++;
        if (!p.burst && BURST_TAGS.has(p.tag)) { burstAt(p.body.position); p.body.velocity.y += 4; }
        if (p.tag === 'cone' && counts.cone === 1) toast('Cone down', 'the slalom is on the east road');
        if (p.tag === 'can' && counts.can >= 7 && !strikeDone) { strikeDone = true; toast('Strike', 'the paint cans had it coming'); }
        if (p.tag === 'crate' && counts.crate === 3) toast('Delivery refused', 'crates everywhere');
        if (p.tag === 'pot' && counts.pot === 1) toast('Sorry, ferns', 'they will grow back');
        if (p.tag === 'aframe' && !counts.af) { counts.af = 1; toast('Mind the signs', 'they are only cardboard'); }
        if (p.tag === 'barrel' && !counts.br) { counts.br = 1; toast('Barrel roll', 'the skate slab is yours'); }
      }
    }
  }

  // pads: drive on to open, drive away to close
  for (const p of pads) {
    const d = Math.hypot(chassis.position.x - p.pos.x, chassis.position.z - p.pos.z);
    const inside = d < 2.6 && state === 'drive';
    if (inside && !p.inside) { stamp(p.stand); if (!goal || goal.stand === p.stand) openPanel(p.stand, 'pad'); }   // a pad crossed on the way to another stand stamps but does not take the sheet
    if (!inside && p.inside && openStand === p.stand && openVia === 'pad' && !tour.on) { /* closes once far away */ }
    p.inside = inside;
    if (openStand === p.stand && openVia === 'pad' && d > 8 && !tour.on) closePanel();
    p.on = damp(p.on, inside ? 1 : 0, 6, dt);
    p.mesh.material.uniforms.uOn.value = p.on;
    p.pin.position.y = 2.4 + Math.sin(t * 2 + p.stand.angle) * 0.18 + p.on * 0.6;
    p.pin.rotation.y = t * 0.9 + p.stand.angle;
    p.pin.scale.setScalar(1 - p.on * 0.25);
  }

  // tour: hold at a stand, then roll on
  if (tour.on && !goal && tour.wait > 0) { tour.wait -= dt; if (tour.wait <= 0) { tour.i++; if (tour.i % TOUR_ORDER.length === 0 && stamped.size >= STANDS.length) { stopTour(null); closePanel(); toast('Tour done', 'the park is yours'); } else { closePanel(); nextTourStop(); } } }

  // petals
  if (petals) {
    const P = petals.userData.p;
    for (let i = 0; i < P.length; i++) {
      const q = P[i];
      q.y -= dt * 0.45 * q.sp; q.x += dt * (0.6 + Math.sin(t * 0.7 + i) * 0.4); q.z += dt * Math.cos(t * 0.5 + i) * 0.3; q.r += dt * q.sp * 1.5;
      if (q.y < 0.05) { q.y = R(6, 9); q.x = camTarget.x + R(-26, 22); q.z = camTarget.z + R(-24, 24); }
      if (q.x - camTarget.x > 28) q.x -= 54;
      _m.compose(_v.set(q.x, q.y, q.z), _q.setFromEuler(_e.set(q.r, q.r * 0.7, q.r * 0.3)), _s.setScalar(q.s));
      petals.setMatrixAt(i, _m);
    }
    petals.instanceMatrix.needsUpdate = true;
  }

  for (const u of updaters) u(dt, t, info);

  // camera: eases after the kart and looks ahead of it, makes room for the sheet
  tmp.set(chassis.velocity.x, 0, chassis.velocity.z).multiplyScalar(0.48);
  if (tmp.length() > 7) tmp.setLength(7);
  camLead.x = damp(camLead.x, tmp.x, 1.8, dt); camLead.z = damp(camLead.z, tmp.z, 1.8, dt);
  const desired = new THREE.Vector3(chassis.position.x, 0, chassis.position.z).add(camLead);
  if (state !== 'drive') desired.set(SPAWN.x, 0, SPAWN.z);
  if (openVia === 'project' && focusPoint) desired.lerp(focusPoint, 0.62);
  else if (openStand && openVia !== 'list') {
    // aim at where the board appears on screen: its base pushed up-screen by its height
    const sp = polar(openStand.angle, STAND_R).addScaledVector(camUp, 2.2);
    desired.lerp(sp, 0.34);
  }
  if (openStand) {
    if (phone()) desired.addScaledVector(camUp, -innerHeight * 0.3 / innerHeight * camDistNow * 0.55);
    else desired.addScaledVector(camRight, camDistNow * 0.24);
  }
  camTarget.x = damp(camTarget.x, desired.x, 2.8, dt); camTarget.z = damp(camTarget.z, desired.z, 2.8, dt);
  const fovT = (phone() && innerWidth < innerHeight ? 44 : 34) + (keys.boost && info.speed > 11 ? 4 : 0);
  if (Math.abs(camera.fov - fovT) > 0.01) { camera.fov = damp(camera.fov, fovT, 3, dt); camera.updateProjectionMatrix(); }
  camDistNow = damp(camDistNow, state === 'drive' ? camDistTarget : (state === 'intro' ? (innerWidth < innerHeight ? 24 : 15) : 14), 1.6, dt);
  const cp = Math.cos(CAM_PITCH), spch = Math.sin(CAM_PITCH);
  camera.position.set(camTarget.x + Math.sin(CAM_YAW) * cp * camDistNow, spch * camDistNow, camTarget.z + Math.cos(CAM_YAW) * cp * camDistNow);
  camera.lookAt(camTarget.x, 0.4, camTarget.z);
  camKick = damp(camKick, 0, 5, dt);
  if (Math.abs(camKick) > 0.001) camera.rotateZ(camKick);
  sun.position.copy(camTarget).addScaledVector(SUN_DIR, 60); sun.target.position.copy(camTarget);
  scene.fog.near = camDistNow * 1.35; scene.fog.far = camDistNow * 4.2;

  // the start tag follows the lit circle
  if (state === 'intro') {
    const tagP = new THREE.Vector3(SPAWN.x + 4.4 * camRight.x - 2.6 * camUp.x, 0, SPAWN.z + 4.4 * camRight.z - 2.6 * camUp.z).project(camera);
    const el = $('start');
    const sx = (tagP.x * 0.5 + 0.5) * innerWidth, sy = (-tagP.y * 0.5 + 0.5) * innerHeight;
    if (phone()) { el.style.transform = `translate(${Math.max(16, (innerWidth - el.offsetWidth) / 2)}px, ${innerHeight * 0.74}px)`; }
    else el.style.transform = `translate(${Math.min(sx + 10, innerWidth - el.offsetWidth - 28)}px, ${sy}px)`;
  }

  composer.render(dt);
  requestAnimationFrame(frame);
}

/* =====================================================================
   intro: the lit circle, then the world
   ===================================================================== */
function brandIn() {
  const w1 = $('brand').querySelector('.w1'), w2 = $('brand').querySelector('.w2');
  const letters = (el, str, base) => { el.innerHTML = [...str].map((c, i) => `<span class="l blr" style="transition-delay:${base + i * 30}ms">${c}</span>`).join(''); };
  letters(w1, 'Aayan', 0); letters(w2, 'Desai', 160);
  requestAnimationFrame(() => requestAnimationFrame(() => $('brand').querySelectorAll('.blr').forEach(e => e.classList.add('in'))));
}
function showStart() {
  state = 'intro';
  chassis.position.y += 1.4; // drop the kart onto its springs as the circle lights
  // the ring draws, the spawn island lights up inside it
  revealAnim = { from: 0, to: 4.6, dur: reduced ? 1 : 1500, t0: performance.now(), ease: expoOut, ring: () => 1, done: () => {
    $('start').classList.add('on');
  } };
  brandIn();
}
function beginDrive() {
  if (state !== 'intro') return;
  state = 'drive';
  document.documentElement.classList.add('driving');
  initAudio(); if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
  tone(523, 0.2, 'triangle', 0.1); tone(784, 0.35, 'triangle', 0.08, 0.1);
  $('start').classList.remove('on');
  camDistTarget = baseDist();
  revealAnim = { from: RU.uReveal.value, to: 80, dur: reduced ? 1 : 2700, t0: performance.now(), ease: k => 0.35 * k + 0.65 * Math.pow(k, 2.2), ring: k => { RU.uDim.value = 1 - clamp(k / 0.75, 0, 1); return 1 - clamp((k - 0.6) / 0.38, 0, 1); }, done: () => { RU.uReveal.value = 500; RU.uRingOn.value = 0; RU.uDim.value = 0; } };
  // HUD enters as one timeline, from different sides
  const seq = [['role', 250], ['nav', 450], ['hint', 700], ['stamps', 850]];
  for (const [id, ms] of seq) setTimeout(() => $(id).classList.add('in'), reduced ? 0 : ms);
  canvas.focus({ preventScroll: true });
}

/* =====================================================================
   loading: real milestones, a minimum, a hold, a failsafe
   ===================================================================== */
const prog = { v: 0, shown: 0, done: false };
const t0 = performance.now();
function setWhat(s) { const el = $('what'); if (el) el.textContent = s; }
(function tick() {
  const cap = prog.done ? 1 : Math.min(prog.v, 0.92);
  prog.shown = Math.min(cap, prog.shown + 0.018);
  $('pctn').textContent = Math.round(prog.shown * 100);
  const arc = document.querySelector('#loader .arc');
  if (arc && arc.style) arc.style.strokeDashoffset = 1 - prog.shown;
  if (prog.done && prog.shown >= 1 && performance.now() - t0 > 1500) {
    $('loader').classList.add('out'); window.__booted = true;
    setTimeout(showStart, reduced ? 0 : 350);
    return;
  }
  requestAnimationFrame(tick);
})();

async function boot() {
  setWhat('setting the type');
  try {
    await Promise.race([Promise.all([
      document.fonts.load('800 100px Syne'), document.fonts.load('700 100px Syne'), document.fonts.load('400 20px "Space Mono"'), document.fonts.load('400 16px "General Sans"'),
    ]), new Promise(r => setTimeout(r, 4000))]);
  } catch (e) { }
  prog.v = 0.4; setWhat('planting the garden');
  const images = { badges: {} };
  await new Promise(r => setTimeout(r, 16));
  buildKart();
  buildPark(images);
  buildFlowers();
  buildBulbs();
  buildLeaves(phone() ? 320 : 650);
  if (!reduced) { buildBirds(); buildButterflies(); }
  buildGrass(phone() ? 5000 : 11000);
  if (!reduced) buildPetals(phone() ? 70 : 140);
  prog.v = 0.55; setWhat('painting the paths');
  await new Promise(r => setTimeout(r, 16));
  buildGround(paintGround(phone() ? 2048 : 4096));
  prog.v = 0.68; setWhat('Aayan Desai');
  try { await renderer.compileAsync(scene, camera); } catch (e) { }
  prog.v = 0.9;
  // settle the physics so the kart sits on its springs before anyone sees it
  for (let i = 0; i < 90; i++) { drive(1 / 60); world.step(1 / 60); }
  requestAnimationFrame(frame);
  requestAnimationFrame(() => { prog.v = 1; prog.done = true; });
}
setTimeout(() => { if (!prog.done) { prog.done = true; } }, 15000);
boot();

addEventListener('resize', () => {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h); composer.setSize(w, h);
  camera.aspect = w / h; camera.fov = w / h < 0.8 ? 44 : 34; camera.updateProjectionMatrix();
  if (state === 'drive') camDistTarget = baseDist();
  tiltH.uniforms.uDir.value.set(1 / (w * DPR), 0); tiltV.uniforms.uDir.value.set(0, 1 / (h * DPR));
  grade.uniforms.uRes.value.set(w * DPR, h * DPR);
});
dispatchEvent(new Event('resize'));

// for the capture scripts
window.__kp = { revealProbe(k) { // capture hook: pose the intro→world reveal at progress k (0..1)
    if (state === 'intro') beginDrive(); revealAnim = null;
    const e = 0.35 * k + 0.65 * Math.pow(k, 2.2); RU.uReveal.value = 4.6 + (80 - 4.6) * e;
    RU.uDim.value = 1 - clamp(k / 0.75, 0, 1); RU.uRingOn.value = 1 - clamp((k - 0.6) / 0.38, 0, 1); }, renderer, pitch(d) { CAM_PITCH = d * DEG; }, get cam() { return [camDistTarget, camDistNow]; }, dist(d) { camDistTarget = d; }, teleport(x, z, yaw = 0) { chassis.position.set(x, 0.6, z); chassis.velocity.setZero(); chassis.angularVelocity.setZero(); chassis.quaternion.setFromEuler(0, yaw, 0); camTarget.set(x, 0, z); }, STANDS, chassis, vehicle, openPanel, closePanel, startTour, beginDrive, get state() { return state; }, keys, resetKart, camera, RU, toast, goTo, stamped };

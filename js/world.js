import * as THREE from 'three';
import * as CANNON from 'cannon-es';
export async function installWorld(S) {
S.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -22, 0) });
S.world.broadphase = new CANNON.SAPBroadphase(S.world);
S.world.allowSleep = true;
S.world.defaultContactMaterial.friction = 0.25;
S.world.defaultContactMaterial.restitution = 0.15;
S.groundBody = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
S.groundBody.addShape(new CANNON.Plane());
S.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
S.world.addBody(S.groundBody);

function staticBox(x, y, z, hx, hy, hz, ry = 0, rx = 0) {
  const b = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
  b.addShape(new CANNON.Box(new CANNON.Vec3(hx, hy, hz)));
  b.position.set(x, y, z); b.quaternion.setFromEuler(rx, ry, 0, 'YXZ');
  S.world.addBody(b); return b;
}
function staticCyl(x, z, r, h) {
  const b = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
  b.addShape(new CANNON.Cylinder(r, r, h, 8)); b.position.set(x, h / 2, z);
  S.world.addBody(b); return b;
}

/* --- wedge: the same six vertices feed three.js and cannon --- */
S.SLOPE = { x0: 13, x1: 24, z: -39, hz: 5.75 };
function onSlope(x, z) { return x > S.SLOPE.x0 && x < S.SLOPE.x1 && Math.abs(z - S.SLOPE.z) < S.SLOPE.hz; }
function buildCrest() {
  const X0 = 24, M = (x, ...a) => S.M(x + X0, ...a);
  const z = -39, h = 1.7, run = 11, half = S.SPEED_HW, tar = '#2c203b';
  const surf = (cx) => cx <= 0 ? (cx + run) / run * h : (run - cx) / run * h;
  const ja = Math.atan2(h, run);
  const up = wedge(half, run / 2, h);
  S.add(up.geo, M(-run / 2, 0, z, 0, -Math.PI / 2, 0), tar);
  const upB = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
  upB.addShape(up.shape); upB.position.set(-run / 2 + X0, 0, z); upB.quaternion.setFromEuler(0, -Math.PI / 2, 0); S.world.addBody(upB);
  const dn = wedge(half, run / 2, h);
  S.add(dn.geo, M(run / 2, 0, z, 0, Math.PI / 2, 0), tar);
  const dnB = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
  dnB.addShape(dn.shape); dnB.position.set(run / 2 + X0, 0, z); dnB.quaternion.setFromEuler(0, Math.PI / 2, 0); S.world.addBody(dnB);
  S.add(S.G.box(0.32, 0.08, half * 2), M(0, h + 0.04, z), '#ffd27a', { outline: false });
  for (const s of [-1, 1]) {
    const ez = z + s * (half - 0.1);
    S.add(S.G.box(run + 0.3, 0.07, 0.18), M(-run / 2, h * 0.52, ez, 0, 0, ja), '#ffd27a', { outline: false, cast: false });
    S.add(S.G.box(run + 0.3, 0.07, 0.18), M(run / 2, h * 0.52, ez, 0, 0, -ja), '#ffd27a', { outline: false, cast: false });
  }
  const jz = Math.atan2(h / 2, run);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const rx = -run + 0.95 + i * 1.7;
      S.add(S.G.box(1.7, 0.42, 0.06), M(rx, surf(rx) / 2, z + s * (half + 0.02), 0, 0, jz), i % 2 ? '#fbf3e6' : '#ff5b3a', { outline: false, cast: false });
      const dx = run - 0.95 - i * 1.7;
      S.add(S.G.box(1.7, 0.42, 0.06), M(dx, surf(dx) / 2, z + s * (half + 0.02), 0, 0, -jz), i % 2 ? '#ff5b3a' : '#fbf3e6', { outline: false, cast: false });
    }
  }
  for (const cx of [-8, -4, 0, 4, 8]) {
    const y = surf(cx) + 0.08, tilt = cx < 0 ? ja : cx > 0 ? -ja : 0;
    S.add(S.G.box(0.14, 0.04, 0.95), M(cx, y, z - 0.28, 0, -0.55, tilt), '#ffd27a', { outline: false, cast: false });
    S.add(S.G.box(0.14, 0.04, 0.95), M(cx, y, z + 0.28, 0, 0.55, tilt), '#ffd27a', { outline: false, cast: false });
  }
  const padX = -5.5;
  S.add(S.G.box(2.8, 0.05, 4.4), M(padX, surf(padX) + 0.06, z, 0, 0, ja), '#ff5b3a', { outline: false, cast: false });
  for (const cx of [-6.35, -5.5, -4.65]) {
    const y = surf(cx) + 0.12;
    S.add(S.G.box(0.12, 0.035, 0.8), M(cx, y, z - 0.22, 0, -0.55, ja), '#ffffff', { outline: false, cast: false });
    S.add(S.G.box(0.12, 0.035, 0.8), M(cx, y, z + 0.22, 0, 0.55, ja), '#ffffff', { outline: false, cast: false });
  }
  // close the ditch between the ramp's outer edge and the hedge, including the corners
  for (let cx = -run - 0.4; cx <= run + 0.4; cx += 1.8) {
    const top = Math.max(0.35, surf(Math.max(-run, Math.min(run, cx))) + 0.06);
    const cz = z - (half + 0.65);
    S.add(S.G.box(2.05, top, 2.4), M(cx, top / 2, cz), tar);
    staticBox(cx + X0, top / 2, cz, 1.02, top / 2, 1.2);
  }
  S.aoSpots.push([X0, z, 8, 0.12]);
}
function chevron(x, z, yaw, color, s = 1) {
  const g = new THREE.Group();
  const a = S.mesh(S.G.box(1.6 * s, 0.06, 0.45 * s), color); a.position.set(0.35 * s, 0.04, 0); a.rotation.y = 0.5; g.add(a);
  const b = S.mesh(S.G.box(1.6 * s, 0.06, 0.45 * s), color); b.position.set(0.35 * s, 0.04, 0); b.rotation.y = -0.5; g.add(b);
  g.position.set(x, 0.02, z); g.rotation.y = yaw; S.scene.add(g);
}
function wedge(w, l, h) {
  const V = [[-w, 0, l], [w, 0, l], [w, 0, -l], [-w, 0, -l], [w, h, -l], [-w, h, -l]];
  const F = [[0, 3, 2, 1], [3, 5, 4, 2], [0, 1, 4, 5], [1, 2, 4], [0, 5, 3]];
  const pos = [];
  for (const f of F) for (let i = 1; i < f.length - 1; i++) pos.push(...V[f[0]], ...V[f[i]], ...V[f[i + 1]]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
  const shape = new CANNON.ConvexPolyhedron({ vertices: V.map(v => new CANNON.Vec3(...v)), faces: F });
  return { geo, shape };
}

S.aoSpots = []; // [x, z, radius, strength] painted into the ground as baked AO

function tree(x, z, kind, s = 1) {
  const ry = S.R(0, 6.28);
  const T = S.M(x, 0, z, 0, ry, 0, s);
  const trunkH = S.R(1.5, 2.1);
  S.add(S.G.cyl(0.11, 0.19, trunkH, 6), T.clone().multiply(S.M(0, trunkH / 2, 0)), S.C.trunk);
  const col = { blossom: S.C.blossom, mint: S.C.mint, butter: S.C.butter, lilac: S.C.lilac, deep: S.C.mintDeep }[kind];
  const n = 3 + (S.rand() * 2 | 0);
  for (let i = 0; i < n; i++) {
    const r = S.R(0.75, 1.15) * (i === 0 ? 1.2 : 1);
    const a = i / n * 6.28 + S.R(0, 1);
    const off = i === 0 ? 0 : S.R(0.55, 0.85);
    S.add(S.G.ico(r, 0), T.clone().multiply(S.M(Math.cos(a) * off, trunkH + S.R(0.3, 0.9) + (i === 0 ? 0.35 : 0), Math.sin(a) * off, S.R(0, 3), S.R(0, 3), 0)), col, { sway: true });
  }
  staticCyl(x, z, 0.28 * s, 2.4);
  S.aoSpots.push([x, z, 2.2 * s, 0.28]);
  S.treePos.push([x, z, kind]);
}
function palm(x, z, s = 1) {
  const T = S.M(x, 0, z, 0, S.R(0, 6.28), 0, s);
  let y = 0, lean = S.R(-0.12, 0.12);
  for (let i = 0; i < 6; i++) { S.add(S.G.cyl(0.13 - i * 0.008, 0.16 - i * 0.008, 0.62, 6), T.clone().multiply(S.M(lean * y, y + 0.31, 0, 0, 0, -lean)), S.C.trunk); y += 0.6; }
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * 6.28;
    const leaf = S.G.box(0.5, 0.06, 2.0);
    S.add(leaf, T.clone().multiply(S.M(lean * y, y + 0.05, 0, 0, a, 0)).multiply(S.M(0, 0, 0.9, 0.42, 0, 0)), S.C.mint, { sway: true });
  }
  staticCyl(x, z, 0.25 * s, 3);
  S.aoSpots.push([x, z, 1.8 * s, 0.22]);
}
function bush(x, z, s = 1, col = S.C.mintDeep) {
  for (let i = 0; i < 3; i++) S.add(S.G.ico(S.R(0.45, 0.7) * s, 0), S.M(x + S.R(-0.5, 0.5) * s, S.R(0.25, 0.45) * s, z + S.R(-0.5, 0.5) * s, S.R(0, 3), S.R(0, 3), 0, 1, 0.75, 1), col);
  S.aoSpots.push([x, z, 1.4 * s, 0.22]);
}
function monstera(x, z, s = 1) {
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * 6.28 + S.R(0, 0.6);
    S.add(S.G.cyl(0, 0.42, 0.06, 7), S.M(x + Math.cos(a) * 0.45 * s, S.R(0.35, 0.75) * s, z + Math.sin(a) * 0.45 * s, S.R(0.3, 0.7), -a + Math.PI / 2, 0, s * S.R(0.9, 1.3), s, s * 1.5), S.C.mintDeep);
  }
  S.aoSpots.push([x, z, 1.1 * s, 0.2]);
}
function lamp(x, z) {
  S.lampPos.push([x, z]);
  S.add(S.G.cyl(0.07, 0.1, 3.2, 6), S.M(x, 1.6, z), S.C.inkSoft);
  S.add(S.G.box(0.42, 0.08, 0.42), S.M(x, 3.25, z), S.C.inkSoft);
  S.add(S.G.box(0.32, 0.44, 0.32), S.M(x, 3.5, z), S.C.butter, { emissive: '#ffcc66', ei: 0.9, cast: false });
  S.add(S.G.cone(0.34, 0.3, 4), S.M(x, 3.86, z, 0, Math.PI / 4, 0), S.C.inkSoft);
  staticCyl(x, z, 0.14, 3.3);
  S.aoSpots.push([x, z, 0.8, 0.22]);
}
function bench(x, z, ry) {
  const T = S.M(x, 0, z, 0, ry, 0);
  S.add(S.G.box(2.0, 0.1, 0.62), T.clone().multiply(S.M(0, 0.48, 0)), S.C.wood);
  S.add(S.G.box(2.0, 0.5, 0.08), T.clone().multiply(S.M(0, 0.82, -0.3, -0.15)), S.C.wood);
  for (const sx of [-0.85, 0.85]) S.add(S.G.box(0.1, 0.48, 0.55), T.clone().multiply(S.M(sx, 0.24, 0)), S.C.inkSoft);
  staticBox(x, 0.5, z, 1.0, 0.5, 0.32, ry);
  S.aoSpots.push([x, z, 1.4, 0.2]);
}
function planter(x, z, s = 1) {
  S.add(S.G.cyl(0.55 * s, 0.42 * s, 0.6 * s, 8), S.M(x, 0.3 * s, z), S.C.terracotta);
  staticCyl(x, z, 0.55 * s, 0.6 * s);
}

/* =====================================================================
   build the park
   ===================================================================== */
S.pads = [];      // { stand, pos, mesh, marker, on }
S.tex = new THREE.TextureLoader();
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function basic(map, o = {}) { const m = new THREE.MeshBasicMaterial({ map, transparent: !!o.transparent, toneMapped: false, side: o.side || THREE.FrontSide }); return S.patch(m, { key: 'b' }); }

function posterTex(s) {
  return canvasTex(1024, 768, (x, w, h) => {
    x.fillStyle = '#fbf3e6'; x.fillRect(0, 0, w, h);
    x.fillStyle = s.color; x.fillRect(0, 0, w, 96);
    x.fillStyle = S.C.ink; x.font = '400 36px "Space Mono"'; x.textBaseline = 'middle';
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
    if (s.boardLines) {
      x.font = '500 32px "Space Mono"';
      s.boardLines.forEach((ln, i) => {
        const fit = Math.min(1, 900 / Math.max(1, x.measureText(ln).width));
        x.save(); x.translate(48, 520 + i * 48); x.scale(fit, fit); x.fillText(ln, 0, 0); x.restore();
      });
    }
  });
}

function buildStand(s, imgTex) {
  const pose = S.standPose(s), p = pose.p, rotY = pose.rotY, SC = 1.25;
  const T = S.M(p.x, 0, p.z, 0, rotY, 0, SC);
  const L = (...a) => T.clone().multiply(S.M(...a));
  S.add(S.G.box(6.4, 0.42, 4.2), L(0, 0.21, 0), s.color);
  S.add(S.G.box(6.9, 0.12, 4.7), L(0, 0.06, 0), S.C.cream);
  for (const sx of [-2.25, 2.25]) S.add(S.G.cyl(0.12, 0.12, 4.3, 6), L(sx, 2.55, -1.0), S.C.inkSoft);
  S.add(S.G.box(4.9, 3.75, 0.28), L(0, 2.95, -1.0, -0.08), S.C.cream);
  S.add(S.G.box(5.6, 0.16, 1.7), L(0, 4.95, -0.55, 0.2), s.color);
  for (let i = 0; i < 5; i++) S.add(S.G.box(0.55, 0.06, 1.72), L(-2.2 + i * 1.1, 5.04, -0.53, 0.2), S.C.cream, { outline: false });
  // little garden either side
  for (const sx of [-2.75, 2.75]) {
    S.add(S.G.cyl(0.42, 0.32, 0.55, 8), L(sx, 0.69, 1.25), S.C.terracotta);
    S.add(S.G.ico(0.55, 0), L(sx, 1.3, 1.25, 0.4, 0.2, 0, 1, 1.1, 1), S.C.mintDeep, { sway: false });
  }
  // the image board
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.45, 3.34), basic(imgTex || posterTex(s))); s._board = board;
  board.applyMatrix4(L(0, 2.95, -0.855, -0.08)); S.scene.add(board);
  // hanging name strip on the awning lip
  const strip = canvasTex(1024, 128, (x, w, h) => {
    x.fillStyle = '#fbf3e6'; x.fillRect(0, 0, w, h);
    x.fillStyle = S.C.ink; x.font = '800 74px Syne'; x.textBaseline = 'middle';
    const label = (s.n ? s.n + '  ' : '') + s.title.toUpperCase();
    const fit = Math.min(1, 700 / x.measureText(label).width);
    x.save(); x.translate(40, h / 2 + 4); x.scale(fit, fit); x.fillText(label, 0, 0); x.restore();
    x.font = '400 26px "Space Mono"'; x.textAlign = 'right'; x.fillStyle = 'rgba(42,29,56,.6)';
    x.fillText((s.section || s.kind).toUpperCase(), w - 40, h / 2 + 4);
  });
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.7), basic(strip));
  sm.applyMatrix4(L(0, 4.62, 0.33, -0.05)); S.scene.add(sm);
  staticBox(p.x, 0.5, p.z, 3.4 * SC, 0.5, 2.3 * SC, rotY);
  const bp = new THREE.Vector3(0, 0, -1.0).applyMatrix4(T); // board footprint
  staticBox(bp.x, 3, bp.z, 2.5 * SC, 3, 0.35, rotY);
  S.aoSpots.push([p.x, p.z, 3.2, 0.08]);
  return { group: [board, sm] };
}

function buildGreenhouse(s) {
  const pose = S.standPose(s, 1), p = pose.p, rotY = pose.rotY;
  const T = S.M(p.x, 0, p.z, 0, rotY, 0);
  const L = (...a) => T.clone().multiply(S.M(...a));
  const W = 3.6, D = 2.6, H = 2.7, RH = 1.5;
  S.add(S.G.box(W * 2 + 0.8, 0.3, D * 2 + 0.8), L(0, 0.15, 0), S.C.cream);
  // posts and rails
  for (let i = 0; i <= 6; i++) { const x = -W + i * (2 * W / 6); for (const z of [-D, D]) if (!(z === D && (i === 3))) S.add(S.G.box(0.12, H, 0.12), L(x, 0.3 + H / 2, z), S.C.cream); }
  for (let i = 1; i < 4; i++) { const z = -D + i * (2 * D / 4); for (const x of [-W, W]) S.add(S.G.box(0.12, H, 0.12), L(x, 0.3 + H / 2, z), S.C.cream); }
  for (const z of [-D, D]) S.add(S.G.box(2 * W + 0.12, 0.14, 0.14), L(0, 0.3 + H, z), S.C.cream);
  for (const x of [-W, W]) S.add(S.G.box(0.14, 0.14, 2 * D), L(x, 0.3 + H, 0), S.C.cream);
  // roof rafters (gable along x)
  const slope = Math.atan2(RH, D), rl = Math.hypot(RH, D);
  for (let i = 0; i <= 6; i++) { const x = -W + i * (2 * W / 6); for (const sz of [-1, 1]) S.add(S.G.box(0.1, 0.1, rl), L(x, 0.3 + H + RH / 2, sz * D / 2, sz * slope), S.C.cream); }
  S.add(S.G.box(2 * W + 0.3, 0.16, 0.16), L(0, 0.3 + H + RH, 0), S.C.cream);
  // door
  S.add(S.G.box(1.1, 2.1, 0.08), L(0, 1.35, D + 0.02), S.C.wood);
  // inside: desk, monitor, plants
  S.add(S.G.box(2.6, 0.1, 1.0), L(-1.2, 1.15, -1.4), S.C.wood);
  for (const sx of [-2.35, -0.05]) S.add(S.G.box(0.1, 0.85, 0.9), L(sx, 0.72, -1.4), S.C.inkSoft);
  S.add(S.G.box(1.1, 0.7, 0.07), L(-1.2, 1.7, -1.75), S.C.ink);
  S.add(S.G.box(0.98, 0.58, 0.02), L(-1.2, 1.7, -1.7), S.C.mint, { emissive: '#7fe6c4', ei: 0.9, outline: false, cast: false });
  for (const [x, z, sc] of [[2.4, -1.5, 1.2], [1.4, -1.8, 0.9], [2.6, 1.2, 1], [-3, 1.4, 0.8]]) { S.add(S.G.cyl(0.3, 0.24, 0.45, 8), L(x, 0.52, z), S.C.terracotta); monsteraLocal(L, x, z, sc); }
  // glass
  const glassMat = S.toon('#e9f3ff', { opacity: 0.32 });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2 * W, H, 2 * D), glassMat);
  glass.applyMatrix4(L(0, 0.3 + H / 2, 0)); glass.renderOrder = 2; S.scene.add(glass);
  for (const sz of [-1, 1]) {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(2 * W, rl), glassMat);
    roof.material.side = THREE.DoubleSide;
    roof.applyMatrix4(L(0, 0.3 + H + RH / 2, sz * D / 2, -Math.PI / 2 + sz * slope)); roof.renderOrder = 2; S.scene.add(roof);
  }
  staticBox(p.x, 1.5, p.z, W + 0.3, 1.5, D + 0.3, rotY);
  S.aoSpots.push([p.x, p.z, 3.2, 0.08]);
}
function monsteraLocal(L, x, z, s) {
  for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; S.add(S.G.cyl(0, 0.36, 0.05, 7), L(x + Math.cos(a) * 0.3 * s, 0.85 + S.R(0, 0.35) * s, z + Math.sin(a) * 0.3 * s, S.R(0.3, 0.7), -a + Math.PI / 2, 0, s, s, s * 1.5), S.C.mintDeep, { sway: false }); }
}

function buildSign(s) {
  const pose = S.standPose(s), p = pose.p, rotY = pose.rotY;
  const T = S.M(p.x, 0, p.z, 0, rotY, 0);
  const L = (...a) => T.clone().multiply(S.M(...a));
  for (const sx of [-2.6, 2.6]) S.add(S.G.box(0.3, 4.6, 0.3), L(sx, 2.3, 0), S.C.inkSoft);
  S.add(S.G.box(6.4, 3.0, 0.3), L(0, 3.2, 0), s.color);
  S.add(S.G.box(6.7, 0.18, 0.5), L(0, 4.8, 0), S.C.cream);
  const face = canvasTex(1280, 600, (x, w, h) => {
    x.fillStyle = '#fbf3e6'; x.fillRect(0, 0, w, h);
    x.fillStyle = S.C.ink; x.font = '800 210px Syne'; x.textBaseline = 'alphabetic';
    x.fillText('SAY', 60, 250); x.fillStyle = S.C.coral; x.fillText('HELLO', 60, 440);
    x.fillStyle = S.C.ink; x.font = '400 36px "Space Mono"'; x.fillText('AAYANIRSHAD99@GMAIL.COM', 66, 530);
    x.strokeStyle = S.C.ink; x.lineWidth = 6; x.beginPath(); x.arc(1110, 190, 90, 0, 6.29); x.stroke();
    x.font = '800 120px Syne'; x.textAlign = 'center'; x.fillText('↓', 1110, 232);
  });
  const fm = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 2.8), basic(face)); s._board = fm;
  fm.applyMatrix4(L(0, 3.2, 0.16)); S.scene.add(fm);
  // mailbox
  S.add(S.G.box(0.14, 1.1, 0.14), L(3.6, 0.55, 1.2), S.C.inkSoft);
  S.add(S.G.box(0.55, 0.45, 0.8), L(3.6, 1.32, 1.2), S.C.butter);
  S.add(S.G.box(0.05, 0.4, 0.12), L(3.9, 1.6, 1.0), S.C.coral);
  staticBox(p.x, 2, p.z, 3.3, 2, 0.4, rotY);
  S.aoSpots.push([p.x, p.z, 2.4, 0.08]);
  const mail = S.mesh(S.G.box(0.7, 0.55, 0.85), S.C.butter);
  mail.position.set(p.x + 2.2, 1.15, p.z + 1.1);
  mail.userData.contact = true;
  S.scene.add(mail);
  S.socialSigns.push(mail);
}

/* pads: the place you drive onto */
S.padMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, fog: true,
  uniforms: { ...S.RU, uCol: { value: new THREE.Color() }, uOn: { value: 0 } },
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
  const pos = s.pad ? new THREE.Vector3(s.pad.x, 0, s.pad.z) : S.polar(s.angle, S.RING_R);
  const m = new THREE.Mesh(new THREE.CircleGeometry(2.6, 64), S.padMat.clone());
  m.material.uniforms = { ...S.RU, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uCol: { value: new THREE.Color(s.color).multiplyScalar(0.95) }, uOn: { value: 0 } };
  m.rotation.x = -Math.PI / 2; m.position.set(pos.x, 0.03, pos.z); m.renderOrder = 1; S.scene.add(m);
  // the marker: a faceted pin bobbing over the pad
  const pin = new THREE.Group();
  const cone = S.mesh(S.G.cone(0.42, 0.95, 4), s.color, { cast: true }); cone.rotation.x = Math.PI;
  const cap = S.mesh(S.G.ico(0.26, 0), S.C.cream); cap.position.y = 0.62;
  pin.add(cone, cap); pin.position.set(pos.x, 2.4, pos.z); S.scene.add(pin);
  S.pads.push({ stand: s, pos, mesh: m, pin, on: 0, inside: false });
}

/* knock-over props, all live in the physics world */
S.props = [];
S.propByBody = new Map();
S.BURST_TAGS = new Set(['cone', 'can', 'crate', 'barrel', 'pot', 'aframe', 'name']);
function dynProp(shape, mass, meshObj, x, y, z, ry = 0, tag) {
  const b = new CANNON.Body({ mass, linearDamping: 0.15, angularDamping: 0.2 });
  b.addShape(shape); b.position.set(x, y, z); b.quaternion.setFromEuler(0, ry, 0);
  b.allowSleep = true; b.sleepSpeedLimit = 0.15; b.sleepTimeLimit = 0.6;
  S.world.addBody(b); S.scene.add(meshObj);
  const p = { body: b, mesh: meshObj, tag, home: new CANNON.Vec3(x, y, z), down: false, burst: false }; S.props.push(p); S.propByBody.set(b, p); return p;
}
function cone(x, z) {
  const g = new THREE.Group();
  const c = S.mesh(S.G.cone(0.24, 0.62, 8), S.C.coral); c.position.y = 0.06;
  const st = S.mesh(S.G.cyl(0.165, 0.19, 0.1, 8), S.C.cream, { outline: false }); st.position.y = 0.02;
  const base = S.mesh(S.G.box(0.5, 0.06, 0.5), S.C.coral); base.position.y = -0.28;
  g.add(c, st, base);
  dynProp(new CANNON.Cylinder(0.08, 0.26, 0.62, 8), 1.5, g, x, 0.31, z, 0, 'cone');
}
function can(x, y, z, col) {
  const g = new THREE.Group();
  const c = S.mesh(S.G.cyl(0.26, 0.26, 0.56, 9), col);
  const lid = S.mesh(S.G.cyl(0.24, 0.24, 0.04, 9), S.C.cream, { outline: false }); lid.position.y = 0.29;
  g.add(c, lid);
  dynProp(new CANNON.Cylinder(0.26, 0.26, 0.56, 9), 1.6, g, x, y, z, S.R(0, 3), 'can');
}
function crate(x, y, z, col, ry) {
  const g = S.mesh(S.G.box(0.8, 0.8, 0.8), col);
  const band = S.mesh(S.G.box(0.84, 0.16, 0.84), S.C.cream, { outline: false }); g.add(band);
  dynProp(new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 0.4)), 3, g, x, y, z, ry, 'crate');
}
function pot(x, z) {
  const g = new THREE.Group();
  const c = S.mesh(S.G.cyl(0.32, 0.24, 0.5, 8), S.C.terracotta);
  const pl = S.mesh(S.G.ico(0.38, 0), [S.C.blossom, S.C.butter, S.C.lilac][S.rand() * 3 | 0]); pl.position.y = 0.48; pl.scale.y = 0.9;
  g.add(c, pl);
  dynProp(new CANNON.Cylinder(0.32, 0.24, 0.5, 8), 2.2, g, x, 0.25, z, S.R(0, 3), 'pot');
}
function ball(x, z) {
  const g = S.mesh(S.G.ico(0.7, 1), S.C.butter);
  const stripe = S.mesh(new THREE.TorusGeometry(0.7, 0.07, 4, 16), S.C.coral, { outline: false }); g.add(stripe);
  const b = dynProp(new CANNON.Sphere(0.7), 1.2, g, x, 0.7, z, 0, 'ball');
  b.body.linearDamping = 0.25; b.body.angularDamping = 0.3;
}

function letterBrick(ch, x, z, color = S.C.cream) {
  const w = 0.62, h = 0.96, d = 0.4;
  const tex = canvasTex(128, 160, (ctx, W, H) => {
    ctx.fillStyle = '#fbf3e6'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2a1d38'; ctx.font = '800 108px Syne';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ch, W / 2, H / 2 + 6);
  });
  const g = new THREE.Group();
  g.add(S.mesh(S.G.box(w, h, d), color));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, h * 0.9), basic(tex));
  face.position.z = d / 2 + 0.012;
  const back = face.clone(); back.position.z = -(d / 2 + 0.012); back.rotation.y = Math.PI;
  g.add(face, back);
  dynProp(new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)), 2.2, g, x, h / 2, z, 0, 'name');
}
function buildNameBricks() {
  let x = -3.6;
  const cols = ['#cdb8f0', '#ffe08f', '#a9d4f2', '#ffc4a3', '#a9dcb6', '#f6b3c7', '#ffc4a3', '#a9d4f2', '#ffe08f', '#cdb8f0'];
  let i = 0;
  for (const word of ['AAYAN', 'DESAI']) {
    for (const ch of word) { letterBrick(ch, x, -1.6, cols[i++ % cols.length]); x += 0.76; }
    x += 0.42;
  }
}
function buildBrickStack() {
  const w = 0.72, h = 0.26, d = 0.4;
  for (let row = 0; row < 4; row++) for (let i = 0; i < 3; i++) {
    const brick = S.mesh(S.G.box(w, h, d), row % 2 ? S.C.cream : '#f3e4d4');
    dynProp(new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)), 0.7, brick, -9.2 + (i - 1) * 0.76, h / 2 + row * 0.28, 27.2, 0, 'stack');
  }
}
function buildHoop() {
  S.add(S.G.cyl(0.08, 0.08, 1.7, 8), S.M(-1.35, 0.85, 30.5), S.C.cream);
  S.add(S.G.cyl(0.08, 0.08, 1.7, 8), S.M(1.35, 0.85, 30.5), S.C.cream);
  S.add(S.G.box(2.9, 0.12, 0.12), S.M(0, 1.64, 30.5), S.C.coral);
  S.add(S.G.box(0.22, 0.32, 0.22), S.M(-1.35, 1.82, 30.5), S.C.coral);
  S.add(S.G.box(0.22, 0.32, 0.22), S.M(1.35, 1.82, 30.5), S.C.coral);
  staticBox(-1.35, 0.85, 30.5, 0.1, 0.85, 0.1);
  staticBox(1.35, 0.85, 30.5, 0.1, 0.85, 0.1);
  staticBox(0, 1.64, 30.5, 1.45, 0.08, 0.08);
}
S.projectCards = [];
S.socialSigns = [];
function buildProjectEasels(F) {
  const faces = [
    { n: '01', name: 'Internship Management System', line: 'Node · HTML · CSS' },
    { n: '02', name: 'AI Resume Analyzer', line: 'TypeScript · AI' },
    { n: '03', name: 'Voice Scam Shield', line: 'TypeScript · AI' },
    { n: '04', name: 'AI Face & Object Detection', line: 'Python · OpenCV' },
    { n: '05', name: 'Hand Snake', line: 'React · MediaPipe' },
  ];
  faces.forEach((card, i) => {
    const lx = (i - 2) * 1.9, lz = -6.2;
    const g = new THREE.Group();
    g.applyMatrix4(F.L(lx, 0, lz, -0.06));
    const postL = S.mesh(S.G.box(0.08, 1.9, 0.08), S.C.ink); postL.position.set(-0.66, 0.95, 0);
    const postR = S.mesh(S.G.box(0.08, 1.9, 0.08), S.C.ink); postR.position.set(0.66, 0.95, 0);
    const frame = S.mesh(S.G.box(1.55, 2.15, 0.08), S.C.cream); frame.position.set(0, 1.55, 0);
    const tex = canvasTex(512, 680, (ctx, w, h) => {
      ctx.fillStyle = '#a9dcb6'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2a1d38'; ctx.fillRect(18, 18, w - 36, h - 36);
      ctx.fillStyle = '#d7f3e2'; ctx.fillRect(34, 34, w - 68, h - 68);
      ctx.fillStyle = '#ff5b3a'; ctx.font = '700 36px "Space Mono"'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(card.n, 52, 110);
      ctx.fillStyle = '#2a1d38'; ctx.font = '800 40px Syne';
      const words = card.name.split(' ');
      let line = '', y = 190;
      for (const word of words) {
        const next = line ? line + ' ' + word : word;
        if (ctx.measureText(next).width > w - 110 && line) { ctx.fillText(line, 52, y); line = word; y += 48; }
        else line = next;
      }
      if (line) ctx.fillText(line, 52, y);
      ctx.fillStyle = 'rgba(42,29,56,.66)'; ctx.font = '400 24px "Space Mono"';
      ctx.fillText(card.line, 52, y + 56);
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 1.86), basic(tex));
    face.position.set(0, 1.55, -0.05);
    face.rotation.y = Math.PI;
    g.add(postL, postR, frame, face);
    g.userData.projectIndex = i;
    S.scene.add(g);
    S.projectCards.push(g);
  });
  const ground = canvasTex(640, 96, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(42,29,56,.72)';
    ctx.font = '800 42px Syne'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('PROJECTS', w / 2, h / 2);
  });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.48), basic(ground, { transparent: true }));
  label.applyMatrix4(F.L(0, 0.04, -2.4, -Math.PI / 2));
  S.scene.add(label);
  const plinth = S.mesh(S.G.box(10.2, 0.1, 2.6), S.C.mint);
  plinth.applyMatrix4(F.L(0, 0.05, -6.2));
  S.scene.add(plinth);
  const beam = S.mesh(S.G.box(9.2, 0.12, 0.12), S.C.cream);
  beam.applyMatrix4(F.L(0, 2.85, -6.2));
  S.scene.add(beam);
  for (const x of [-4.4, 4.4]) {
    const post = S.mesh(S.G.box(0.1, 2.85, 0.1), S.C.ink);
    post.applyMatrix4(F.L(x, 1.42, -6.2));
    S.scene.add(post);
  }
}
function buildSocials(F) {
  const items = [['GITHUB', 'Rapid1234-star'], ['LINKEDIN', 'aayan-desai'], ['EMAIL', 'aayanirshad99']];
  items.forEach((it, i) => {
    const lx = (i - 1) * 1.85, lz = -3.6;
    const g = new THREE.Group();
    g.applyMatrix4(F.L(lx, 0, lz, -0.06));
    const postL = S.mesh(S.G.box(0.07, 1.05, 0.07), S.C.ink); postL.position.set(-0.55, 0.52, 0);
    const postR = S.mesh(S.G.box(0.07, 1.05, 0.07), S.C.ink); postR.position.set(0.55, 0.52, 0);
    const frame = S.mesh(S.G.box(1.35, 1.65, 0.08), S.C.cream); frame.position.set(0, 1.28, 0);
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
    face.position.set(0, 1.28, -0.05);
    face.rotation.y = Math.PI;
    g.add(postL, postR, frame, face);
    g.userData.contact = true;
    S.scene.add(g);
    S.socialSigns.push(g);
  });
}
S.bumps = [];
function buildPark(images) {
  // plaza dressing inside the spawn circle
  lamp(-2.7, 2.4);
  bench(2.7, 1.9, -0.5);
  planter(-5.5, 6.9, 1); palm(-5.5, 6.9, 0.8);
  // around the plaza
  for (const a of [40, 132, 228, 320]) { const p = S.polar(a, 6.2); bench(p.x, p.z, Math.atan2(-p.x, -p.z)); }
  for (let a = 0; a < 360; a += 22) {
    const deg = a > 180 ? a - 360 : a;
    if (S.STANDS.some(s => s.ringDeg != null && Math.abs(((deg - s.ringDeg + 540) % 360) - 180) < 16)) continue;
    const [px, pz] = S.mapPt(a);
    const t = a * S.DEG;
    let nx = Math.cos(t) / S.RING.rx, nz = -Math.sin(t) / S.RING.ry;
    const l = Math.hypot(nx, nz) || 1;
    const lx = px + nx / l * 4.2, lz = pz + nz / l * 4.2;
    if (S.onPaved(lx, lz, 0.3)) continue;
    lamp(lx, lz);
  }
  // stands
  S.STANDS.forEach((s, i) => {
    if (s.kind === 'about') buildGreenhouse(s);
    else if (s.kind === 'contact') buildSign(s);
    else buildStand(s, null);
    buildPad(s);
  });
  // flower beds
  for (const b of S.BEDS) {
    for (let i = 0; i < 4; i++) { const a = S.R(0, 6.28); bush(b.c.x + Math.cos(a) * b.rx * 0.55, b.c.z + Math.sin(a) * b.rz * 0.55, 0.6, [S.C.mintDeep, S.C.mint][i % 2]); }
  }
  // skate slab: kickers, a funbox, cans to bowl into
  const ramps = [
    { x: -6, z: 24, w: 1.6, l: 2.2, h: 0.95, ry: Math.PI, col: S.C.lilac },
    { x: 6, z: 23, w: 1.4, l: 1.8, h: 0.7, ry: Math.PI, col: S.C.peach },
  ];
  ramps.push({ x: -8, z: 28, w: 1.3, l: 1.5, h: 0.5, ry: Math.PI, col: S.C.sky });
  for (const r of ramps) {
    const { geo, shape } = wedge(r.w, r.l, r.h);
    S.add(geo, S.M(r.x, 0, r.z, 0, r.ry, 0), r.col);
    S.add(S.G.cyl(0.06, 0.06, r.w * 2 + 0.1, 6), S.M(r.x, r.h, r.z + (r.ry ? 1 : -1) * r.l, 0, 0, Math.PI / 2), S.C.inkSoft);
    S.add(S.G.box(r.w * 2, 0.02, 0.18), S.M(r.x, 0.01, r.z + (r.ry ? -1 : 1) * (r.l - 0.09)), S.C.cream, { outline: false, cast: false });
    const b = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC }); b.addShape(shape);
    b.position.set(r.x, 0, r.z); b.quaternion.setFromEuler(0, r.ry, 0); S.world.addBody(b);
    S.bumps.push({ x: r.x, z: r.z + (r.ry ? 1 : -1) * r.l, rad: 1.25, hot: false });
    S.aoSpots.push([r.x, r.z, 2.6, 0.18]);
  }
  buildCrest();
  { // funbox: up, flat, down
    const fx = 4, fz = 26, h = 0.7;
    const up = wedge(1.6, 1.4, h), dn = wedge(1.6, 1.4, h);
    S.add(up.geo, S.M(fx - 2.6, 0, fz, 0, -Math.PI / 2, 0), S.C.mint);
    S.add(dn.geo, S.M(fx + 2.6, 0, fz, 0, Math.PI / 2, 0), S.C.mint);
    S.add(S.G.box(2.4, h, 3.2), S.M(fx, h / 2, fz), S.C.mint);
    S.add(S.G.box(2.6, 0.08, 0.08), S.M(fx, h + 0.45, fz), S.C.inkSoft);
    for (const sx of [-1.1, 1.1]) S.add(S.G.box(0.08, 0.45, 0.08), S.M(fx + sx, h + 0.22, fz), S.C.inkSoft);
    for (const [w, x, ry] of [[up, fx - 2.6, -Math.PI / 2], [dn, fx + 2.6, Math.PI / 2]]) {
      const b = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC }); b.addShape(w.shape); b.position.set(x, 0, fz); b.quaternion.setFromEuler(0, ry, 0); S.world.addBody(b);
    }
    staticBox(fx, h / 2, fz, 1.2, h / 2, 1.6);
    S.bumps.push({ x: fx, z: fz, rad: 2.1, hot: false });
    S.aoSpots.push([fx, fz, 4, 0.18]);
  }
  buildNameBricks();
  buildBrickStack();
  buildHoop();
  // paint can pyramid, right where the lilac kicker lands
  const cols = [S.C.pink, S.C.butter, S.C.mint, S.C.lilac, S.C.peach, S.C.sky];
  let k = 0;
  for (let row = 0; row < 4; row++) for (let i = 0; i < 4 - row; i++) can(-6 + (i - (3 - row) / 2) * 0.56, 0.28 + row * 0.565, 29, cols[k++ % cols.length]);
  // cone slalom down the east spoke (weaves the grass verge, never the paint)
  { const el = Math.hypot(34.5, -5), ux = 34.5 / el, uz = -5 / el;
    for (let i = 0; i < 6; i++) { const t = 11.1 + i * 2.4, s = i % 2 ? 1 : -1; cone(ux * t - uz * 3.7 * s, uz * t + ux * 3.7 * s); } }
  // crate stack by the sign
  { const p = S.polar(150, 27.5); let n = 0; for (let row = 0; row < 3; row++) for (let i = 0; i < 3 - row; i++) crate(p.x + (i - (2 - row) / 2) * 0.84, 0.4 + row * 0.81, p.z, [S.C.peach, S.C.sky, S.C.pink, S.C.butter, S.C.lilac, S.C.mint][n++ % 6], 0.3); }
  // flower pots along the west spoke (verge weave)
  { const el = Math.hypot(-34.5, -5), ux = -34.5 / el, uz = -5 / el;
    for (let i = 0; i < 5; i++) { const t = 11.1 + i * 2.4, s = i % 2 ? -1 : 1; pot(ux * t - uz * 3.75 * s, uz * t + ux * 3.75 * s); } }
  // a big beach ball in the plaza
  ball(5.5, -2.5);

  dressPark(images);

  // trees + shrubs, never on paving
  const kinds = ['blossom', 'blossom', 'mint', 'butter', 'lilac', 'deep'];
  let placed = 0, tries = 0;
  const trees = [];
  while (placed < 95 && tries < 6000) {
    tries++;
    const x = -64 + S.R(0, 1) * 128, z = -46 + S.R(0, 1) * 92;
    if (Math.hypot(x / 70, (z + 2) / 52) > 1) continue;
    if (S.blocked(x, z, 2.2) || S.onSpeed(x, z, 3.2) || onSlope(x, z) || Math.hypot(x, z) > 60) continue;
    if (trees.some(t => Math.hypot(t[0] - x, t[1] - z) < 3.4)) continue;
    // keep the camera's foreground (south) lighter so the kart is never buried
    const nearSkate = z > 24 && Math.abs(x) < 20;
    if (nearSkate && S.rand() < 0.5) { palm(x, z, S.R(0.9, 1.2)); trees.push([x, z]); placed++; continue; }
    tree(x, z, kinds[S.rand() * kinds.length | 0], S.R(0.85, 1.25)); trees.push([x, z]); placed++;
  }
  for (let i = 0, n = 0; i < 2000 && n < 70; i++) {
    const x = -60 + S.R(0, 1) * 120, z = -44 + S.R(0, 1) * 88;
    if (Math.hypot(x / 68, (z + 2) / 50) > 1) continue;
    if (S.blocked(x, z, 1.0) || S.onSpeed(x, z, 3.2) || onSlope(x, z) || Math.hypot(x, z) > 60 || trees.some(t => Math.hypot(t[0] - x, t[1] - z) < 1.8)) continue;
    S.rand() < 0.5 ? monstera(x, z, S.R(0.8, 1.3)) : bush(x, z, S.R(0.7, 1.1), [S.C.mintDeep, S.C.mint, S.C.blossom][S.rand() * 3 | 0]); n++;
  }
  // one hedge outside the speedway. Long axis is local X, so yaw is atan2(-dz, dx).
  const hedgeH = 4.8;
  for (let i = 0; i < S.SPEED_PTS.length; i++) {
    const p = S.SPEED_PTS[i];
    const n = S.SPEED_PTS[(i + 1) % S.SPEED_PTS.length];
    let dx = n[0] - p[0], dz = n[1] - p[1];
    const len = Math.hypot(dx, dz);
    if (len < 0.2) continue; // a repeated corner point has no direction and would plant a pillar on the lane
    dx /= len; dz /= len;
    let nx = -dz, nz = dx;
    if (nx * p[0] + nz * p[1] < 0) { nx = -nx; nz = -nz; }
    const hx = p[0] + nx * (S.SPEED_HW + 1.7), hz = p[1] + nz * (S.SPEED_HW + 1.7);
    const yaw = Math.atan2(-dz, dx);
    const span = len + 0.55;
    S.add(S.G.box(span, hedgeH, 0.85), S.M(hx, hedgeH / 2, hz, 0, yaw, 0), S.C.hedge);
    staticBox(hx, hedgeH / 2, hz, span / 2, hedgeH / 2, 0.48, yaw);
  }
  const start = S.speedSample(0.6781);
  const startN = S.SPEED_PTS[(Math.round(0.6781 * (S.SPEED_PTS.length - 1)) + 1) % S.SPEED_PTS.length];
  let gx = startN[0] - start[0], gz = startN[1] - start[1];
  const gl = Math.hypot(gx, gz) || 1; gx /= gl; gz /= gl;
  const px = -gz, pz = gx;
  const gantryYaw = Math.atan2(-pz, px);
  S.add(S.G.box(0.28, 3.2, 0.28), S.M(start[0] + px * 5.4, 1.6, start[1] + pz * 5.4), S.C.ink);
  S.add(S.G.box(0.28, 3.2, 0.28), S.M(start[0] - px * 5.4, 1.6, start[1] - pz * 5.4), S.C.ink);
  S.add(S.G.box(11.4, 0.22, 0.28), S.M(start[0], 3.15, start[1], 0, gantryYaw, 0), S.C.cream);
  for (let k = 0; k < 8; k++) S.add(S.G.box(1.15, 0.16, 0.3), S.M(start[0] + px * (k - 3.5) * 1.2, 3.15, start[1] + pz * (k - 3.5) * 1.2), k % 2 ? S.C.ink : S.C.cream);
  S.buildBatch();
}

/* =====================================================================
   set dressing: every zone gets its furniture, every stand its own set piece
   ===================================================================== */
function standFrame(s) {
  const pose = S.standPose(s, s.kind === 'about' ? 1 : 0);
  const p = pose.p, rotY = pose.rotY;
  const T = S.M(p.x, 0, p.z, 0, rotY, 0);
  return { p, rotY, T, L: (...a) => T.clone().multiply(S.M(...a)), at: (lx, lz) => new THREE.Vector3(lx, 0, lz).applyMatrix4(T) };
}
function seg(a, b, y, color, thick = 0.05) { // a box spanning two ground points
  const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
  S.add(S.G.box(thick, thick, len), S.M((a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2, 0, Math.atan2(dx, dz), 0), color, { outline: false });
}
S.wire = S.patch(new THREE.LineBasicMaterial({ color: S.C.ink, transparent: true, opacity: 0.8 }), { key: 'wire', noGlow: true });
S.bulbSpots = [];
function stringLights(a, b, ya, yb, sag, n = 9) {
  const pts = [];
  for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * u, ya + (yb - ya) * u - sag * 4 * u * (1 - u), a[1] + (b[1] - a[1]) * u)); }
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), S.wire); S.scene.add(l);
  for (let i = 1; i < n; i++) { const u = i / n; S.bulbSpots.push([a[0] + (b[0] - a[0]) * u, ya + (yb - ya) * u - sag * 4 * u * (1 - u) - 0.09, a[1] + (b[1] - a[1]) * u]); }
}
function buildBulbs() {
  const cols = ['#ffe6a0', '#ffb7c8', '#b9f3dc', '#fff3df', '#ffcf9a'].map(c => new THREE.Color(c).multiplyScalar(1.35));
  const mat = S.patch(new THREE.MeshBasicMaterial({ color: 0xffffff }), { key: 'bulb', noGlow: true });
  const im = new THREE.InstancedMesh(S.G.ico(0.13, 1), mat, S.bulbSpots.length);
  S.bulbSpots.forEach((b, i) => { S._m.compose(S._v.set(...b), S._q.identity(), S._s.setScalar(1)); im.setMatrixAt(i, S._m); im.setColorAt(i, cols[i % cols.length]); });
  S.scene.add(im);
}
function pole(x, z, h = 3.7) { S.add(S.G.cyl(0.05, 0.07, h, 6), S.M(x, h / 2, z), S.C.inkSoft); S.add(S.G.ico(0.09, 0), S.M(x, h, z), S.C.coral, { outline: false }); staticCyl(x, z, 0.1, h); S.occ.push([x, z, 0.6]); }
function flowersOn(x, y, z, n, spread, cols = [S.C.pink, S.C.butter, S.C.lilac, '#fff6ea', S.C.peach]) {
  for (let i = 0; i < n; i++) S.add(S.G.ico(S.R(0.09, 0.14), 0), S.M(x + S.R(-spread, spread), y + S.R(0, 0.12), z + S.R(-spread * 0.5, spread * 0.5), S.R(0, 3), S.R(0, 3), 0), cols[S.rand() * cols.length | 0], { outline: false, cast: false });
}
function planterBox(x, z, ry) {
  const T = S.M(x, 0, z, 0, ry, 0), L = (...a) => T.clone().multiply(S.M(...a));
  S.add(S.G.box(1.7, 0.55, 0.72), L(0, 0.275, 0), S.C.wood);
  S.add(S.G.box(1.5, 0.06, 0.55), L(0, 0.56, 0), '#c99b86', { outline: false, cast: false });
  for (let i = 0; i < 4; i++) S.add(S.G.ico(S.R(0.22, 0.3), 0), L(-0.6 + i * 0.4, S.R(0.72, 0.85), S.R(-0.1, 0.1), S.R(0, 3), S.R(0, 3), 0, 1, 0.8, 1), [S.C.mintDeep, S.C.mint][i % 2], { sway: false });
  const w = new THREE.Vector3(0, 0, 0).applyMatrix4(T);
  for (let i = 0; i < 5; i++) { const q = new THREE.Vector3(S.R(-0.7, 0.7), S.R(0.85, 1.05), S.R(-0.15, 0.15)).applyMatrix4(T); S.add(S.G.ico(S.R(0.1, 0.14), 0), S.M(q.x, q.y, q.z), [S.C.pink, S.C.butter, S.C.lilac, S.C.coral][i % 4], { outline: false, cast: false }); }
  staticBox(w.x, 0.4, w.z, 0.85, 0.4, 0.36, ry); S.occ.push([w.x, w.z, 1.3]); S.aoSpots.push([w.x, w.z, 1.3, 0.2]);
}
function signBoard(lines, w = 2.2) {
  return canvasTex(512, 116 * lines.length, (x, W, H) => {
    lines.forEach((l, i) => {
      const y0 = i * 116;
      x.fillStyle = l.bg || '#fbf3e6'; x.beginPath(); x.roundRect(6, y0 + 8, W - 12, 100, 18); x.fill();
      x.strokeStyle = S.C.ink; x.lineWidth = 5; x.stroke();
      x.fillStyle = l.ink || S.C.ink; x.font = '800 46px Syne'; x.textBaseline = 'middle';
      x.textAlign = l.right ? 'right' : 'left';
      const fit = Math.min(1, (W - 70) / x.measureText(l.t).width);
      x.save(); x.translate(l.right ? W - 34 : 34, y0 + 60); x.scale(fit, fit); x.fillText(l.t, 0, 0); x.restore();
    });
  });
}
function signpost(x, z, lines) {
  S.add(S.G.cyl(0.07, 0.09, 3.1, 6), S.M(x, 1.55, z), S.C.inkSoft);
  const t = signBoard(lines); const h = 0.5 * lines.length;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, h), basic(t)); m.position.set(x + Math.sin(S.CAM_YAW) * 0.16, 2.95 - h / 2, z + Math.cos(S.CAM_YAW) * 0.16); m.rotation.y = S.CAM_YAW; S.scene.add(m);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(2.2, h), S.toon(S.C.inkSoft)); back.position.copy(m.position).addScaledVector(new THREE.Vector3(Math.sin(S.CAM_YAW), 0, Math.cos(S.CAM_YAW)), -0.03); back.rotation.y = S.CAM_YAW + Math.PI; S.scene.add(back);
  staticCyl(x, z, 0.12, 3); S.occ.push([x, z, 1.2]); S.aoSpots.push([x, z, 0.8, 0.2]);
}
function fenceAround(b) {
  const ang = Math.atan2(b.c.z, b.c.x) + Math.PI / 2, toC = Math.atan2(-b.c.z, -b.c.x);
  const pts = [];
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2;
    const lx = Math.cos(a) * (b.rx + 0.1), lz = Math.sin(a) * (b.rz + 0.1);
    const x = b.c.x + lx * Math.cos(ang) - lz * Math.sin(ang), z = b.c.z + lx * Math.sin(ang) + lz * Math.cos(ang);
    const gap = Math.abs(((Math.atan2(z - b.c.z, x - b.c.x) - toC + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.45;
    pts.push([x, z, gap]);
  }
  pts.forEach((q, i) => {
    if (q[2]) return;
    S.add(S.G.box(0.09, 0.62, 0.09), S.M(q[0], 0.31, q[1]), S.C.cream);
    S.add(S.G.cone(0.075, 0.12, 4), S.M(q[0], 0.68, q[1], 0, Math.PI / 4, 0), S.C.cream, { outline: false });
    const n = pts[(i + 1) % pts.length]; if (n[2]) return;
    seg(q, n, 0.46, S.C.cream, 0.06); seg(q, n, 0.22, S.C.cream, 0.06);
    const mx = (q[0] + n[0]) / 2, mz = (q[1] + n[1]) / 2, len = Math.hypot(n[0] - q[0], n[1] - q[1]);
    staticBox(mx, 0.35, mz, 0.05, 0.35, len / 2, Math.atan2(n[0] - q[0], n[1] - q[1]));
  });
}

/* --- per-stand set pieces --- */
S.standFx = []; // { s, pos, w } proximity glow targets
function badgeTotem(s, F, badgeTex) {
  const base = F.at(-5.0, 1.6);
  S.add(S.G.cyl(0.09, 0.12, 3.5, 6), S.M(base.x, 1.75, base.z), S.C.inkSoft);
  S.add(S.G.cyl(0.4, 0.5, 0.25, 8), S.M(base.x, 0.125, base.z), s.color);
  const g = new THREE.Group(); g.position.set(base.x, 3.95, base.z); g.rotation.y = F.rotY;
  const rim = S.mesh(new THREE.TorusGeometry(0.98, 0.08, 6, 28), s.color); g.add(rim);
  const backing = new THREE.Mesh(new THREE.CircleGeometry(0.98, 32), S.toon(S.C.cream)); backing.position.z = -0.01; backing.rotation.y = Math.PI; g.add(backing);
  if (badgeTex) { const face = new THREE.Mesh(new THREE.CircleGeometry(0.95, 40), basic(badgeTex)); face.position.z = 0.02; g.add(face); }
  S.scene.add(g); staticCyl(base.x, base.z, 0.16, 3.5); S.occ.push([base.x, base.z, 1.2]); S.aoSpots.push([base.x, base.z, 1.1, 0.22]);
  return g;
}
function aFrame(s, F) {
  const at = F.at(-3.2, 3.6);
  const g = new THREE.Group();
  const face = canvasTex(512, 384, (x, W, H) => {
    x.fillStyle = '#fbf3e6'; x.fillRect(0, 0, W, H);
    x.fillStyle = s.color; x.fillRect(0, 0, W, 84);
    x.fillStyle = S.C.ink; x.font = '400 34px "Space Mono"'; x.textBaseline = 'middle'; x.fillText(s.n ? `STAND ${s.n}` : s.kind.toUpperCase(), 30, 44);
    x.font = '800 74px Syne'; const t = (s.id === 'projects' ? 'FIVE SIGNS' : s.short).toUpperCase();
    const fit = Math.min(1, (W - 60) / x.measureText(t).width); x.save(); x.translate(30, 190); x.scale(fit, fit); x.fillText(t, 0, 0); x.restore();
    x.font = '700 36px Syne'; x.fillStyle = S.C.coral; x.fillText(s.id === 'projects' ? 'signs behind the stand' : 'pull up on the pad →', 30, 300);
  });
  for (const sd of [-1, 1]) {
    const panel = new THREE.Group(); panel.rotation.x = sd * 0.24; panel.position.z = sd * 0.28;
    const bd = S.mesh(S.G.box(0.9, 1.15, 0.05), S.C.cream); bd.position.set(0, 0.575, 0); panel.add(bd);
    const fm = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.63), basic(face)); fm.position.set(0, 0.68, sd * 0.035); if (sd < 0) fm.rotation.y = Math.PI; panel.add(fm);
    g.add(panel);
  }
  g.children.forEach(c => c.position.y = -0.55);
  const p = dynProp(new CANNON.Box(new CANNON.Vec3(0.45, 0.55, 0.28)), 3, g, at.x, 0.56, at.z, F.rotY + Math.PI, 'aframe');
  return p;
}
function setTidePool(s, F) {
  const c = F.at(6.2, 0.6);
  for (let i = 0; i < 13; i++) { const a = i / 13 * 6.28 + S.R(0, 0.3); S.add(S.G.dodo(S.R(0.32, 0.55)), S.M(c.x + Math.cos(a) * 1.95, 0.14, c.z + Math.sin(a) * 1.95, S.R(0, 3), S.R(0, 3), 0, 1, 0.55, 1), ['#d9cfe2', '#e8dccb', '#cfc4dc'][i % 3]); }
  const water = new THREE.Mesh(new THREE.CircleGeometry(1.8, 48), new THREE.ShaderMaterial({
    transparent: true, fog: true,
    uniforms: { ...S.RU, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uDeep: { value: new THREE.Color('#5fc4c4') }, uShal: { value: new THREE.Color('#b8f0e2') } },
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
  water.rotation.x = -Math.PI / 2; water.position.set(c.x, 0.13, c.z); S.scene.add(water);
  S.add(S.G.cyl(1.85, 1.85, 0.12, 24), S.M(c.x, 0.05, c.z), '#7fcfc8', { outline: false, cast: false });
  // starfish on the rocks
  const star = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283, rr = i % 2 ? 0.1 : 0.26; i ? star.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : star.moveTo(rr, 0); }
  const sg = new THREE.ExtrudeGeometry(star, { depth: 0.05, bevelEnabled: false }); sg.rotateX(-Math.PI / 2);
  S.add(sg, S.M(c.x + 1.7, 0.36, c.z + 0.9, 0, 0.4, 0), S.C.coral); S.add(sg, S.M(c.x - 1.5, 0.33, c.z - 1.2, 0, 1.4, 0, 0.8), S.C.butter);
  // fish circling under the surface
  const fish = [];
  for (let i = 0; i < 4; i++) { const f = S.mesh(S.G.cone(0.08, 0.32, 5), [S.C.coral, S.C.butter, S.C.peach, S.C.lilac][i], { outline: false, cast: false }); f.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.add(f); S.scene.add(g); fish.push(g); }
  S.updaters.push((dt, t) => fish.forEach((g, i) => { const a = t * (0.6 + i * 0.13) * (i % 2 ? 1 : -1) + i * 1.7, r = 0.6 + i * 0.25; g.position.set(c.x + Math.cos(a) * r, 0.1, c.z + Math.sin(a) * r); g.rotation.y = -a + (i % 2 ? Math.PI : 0); }));
  staticCyl(c.x, c.z, 2.3, 0.4); S.occ.push([c.x, c.z, 2.8]); S.aoSpots.push([c.x, c.z, 2.8, 0.18]);
}
function setBook(s, F) {
  const c = F.at(6.0, 0.6);
  const T = S.M(c.x, 0, c.z, 0, F.rotY - 0.3, 0), L = (...a) => T.clone().multiply(S.M(...a));
  S.add(S.G.box(3.4, 0.16, 2.3), L(0, 0.08, 0), S.C.peach);
  for (const sx of [-1, 1]) {
    S.add(S.G.box(1.55, 0.26, 2.1), L(sx * 0.82, 0.32, 0, 0, 0, sx * -0.09), S.C.cream);
    for (let i = 0; i < 3; i++) S.add(S.G.box(1.4, 0.012, 1.9), L(sx * 0.82, 0.47 + i * 0.001, 0, 0, 0, sx * -0.09), '#efe3d0', { outline: false, cast: false });
  }
  // the pressed flower
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; S.add(S.G.cyl(0.24, 0.24, 0.02, 10), L(0.85 + Math.cos(a) * 0.3, 0.5, Math.sin(a) * 0.3, 0, -a, 0, 1, 1, 0.55).multiply(S.M(0.15, 0, 0)), S.C.pink, { outline: false }); }
  S.add(S.G.cyl(0.14, 0.14, 0.04, 10), L(0.85, 0.52, 0), S.C.butter, { outline: false });
  S.add(S.G.box(0.04, 0.02, 0.9), L(0.85, 0.5, 0.65, 0, 0.3, 0), S.C.mintDeep, { outline: false });
  // a brass magnifier leaning on the spine
  S.add(new THREE.TorusGeometry(0.42, 0.06, 6, 20), L(-0.6, 1.05, -0.5, 0.2, 0.5, 0), '#e7c27a');
  S.add(S.G.cyl(0.05, 0.05, 0.8, 6), L(-0.95, 0.5, -0.25, 0.2, 0.5, 0.75), S.C.wood);
  // filed folders
  for (let i = 0; i < 4; i++) S.add(S.G.box(0.12, 0.9, 0.7), L(-2.2 + i * 0.14, 0.45, 0.9, 0, 0, 0.05 * i), [S.C.mint, S.C.lilac, S.C.butter, S.C.pink][i]);
  staticBox(c.x, 0.4, c.z, 1.8, 0.4, 1.3, F.rotY - 0.3); S.occ.push([c.x, c.z, 2.6]); S.aoSpots.push([c.x, c.z, 2.6, 0.2]);
}
function setBoombox(s, F) {
  const c = F.at(6.0, 0.4);
  const T = S.M(c.x, 0, c.z, 0, F.rotY, 0), L = (...a) => T.clone().multiply(S.M(...a));
  S.add(S.G.box(2.6, 1.45, 0.9), L(0, 0.73, 0), S.C.lilac);
  S.add(S.G.box(2.7, 0.12, 1.0), L(0, 0.06, 0), S.C.inkSoft);
  S.add(S.G.box(1.8, 0.08, 0.1), L(0, 1.75, 0), S.C.inkSoft); for (const sx of [-0.85, 0.85]) S.add(S.G.box(0.08, 0.36, 0.1), L(sx, 1.58, 0), S.C.inkSoft);
  S.add(S.G.box(0.8, 0.35, 0.05), L(0, 0.95, 0.46), S.C.cream);
  S.add(S.G.box(0.5, 0.12, 0.06), L(0, 0.95, 0.48), S.C.ink, { outline: false });
  for (let i = 0; i < 4; i++) S.add(S.G.cyl(0.05, 0.05, 0.06, 8), L(-0.3 + i * 0.2, 1.32, 0.46, Math.PI / 2, 0, 0), [S.C.coral, S.C.butter, S.C.mint, S.C.cream][i], { outline: false });
  const speakers = [];
  for (const sx of [-0.85, 0.85]) {
    const sp = new THREE.Group(); sp.applyMatrix4(L(sx, 0.7, 0.46));
    const outer = S.mesh(S.G.cyl(0.48, 0.48, 0.08, 16), S.C.ink); outer.rotation.x = Math.PI / 2;
    const cone = S.mesh(S.G.cone(0.38, 0.22, 16), S.C.cream, { outline: false }); cone.rotation.x = -Math.PI / 2; cone.position.z = 0.06;
    const cap = S.mesh(S.G.cyl(0.1, 0.1, 0.06, 10), S.C.coral, { outline: false }); cap.rotation.x = Math.PI / 2; cap.position.z = 0.16;
    sp.add(outer, cone, cap); S.scene.add(sp); speakers.push(sp);
  }
  // sound rings that rise and fade off the speakers
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 5, 30, Math.PI), S.patch(new THREE.MeshBasicMaterial({ color: S.C.lilac, transparent: true, depthWrite: false }), { key: 'ringfx', noGlow: true }));
    m.applyMatrix4(L(0, 1.9, 0.2)); S.scene.add(m); rings.push(m);
  }
  const base = rings.map(r => r.position.clone());
  S.updaters.push((dt, t) => {
    const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * 1.9)), 10);
    speakers.forEach(sp => sp.scale.setScalar(1 + beat * 0.12));
    rings.forEach((r, i) => { const k = (t * 0.45 + i / 3) % 1; r.scale.setScalar(0.6 + k * 1.8); r.position.copy(base[i]).y += k * 1.6; r.material.opacity = (1 - k) * 0.8; });
  });
  staticBox(c.x, 0.8, c.z, 1.35, 0.8, 0.5, F.rotY); S.occ.push([c.x, c.z, 2.2]); S.aoSpots.push([c.x, c.z, 2.2, 0.22]);
}
function setKites(s, F) {
  const c = F.at(6.0, 0.8);
  S.add(S.G.cone(1.25, 1.5, 8), S.M(c.x, 1.65, c.z), S.C.mint);
  S.add(S.G.cyl(1.25, 1.25, 0.9, 8), S.M(c.x, 0.45, c.z), S.C.cream);
  for (let i = 0; i < 8; i++) S.add(S.G.box(0.3, 0.88, 0.04), S.M(c.x + Math.cos(i / 8 * 6.28) * 1.26, 0.45, c.z + Math.sin(i / 8 * 6.28) * 1.26, 0, -i / 8 * 6.28 + Math.PI / 2, 0), i % 2 ? S.C.pink : S.C.butter, { outline: false });
  S.add(S.G.ico(0.15, 0), S.M(c.x, 2.45, c.z), S.C.coral, { outline: false });
  staticCyl(c.x, c.z, 1.3, 1.5); S.occ.push([c.x, c.z, 2.2]); S.aoSpots.push([c.x, c.z, 2, 0.2]);
  const kg = new THREE.BufferGeometry(); kg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.8, 0, -0.55, 0, 0, 0, -1, 0, 0, 0.8, 0, 0, -1, 0, 0.55, 0, 0], 3)); kg.computeVertexNormals();
  const kites = [];
  for (let i = 0; i < 3; i++) {
    const anchor = F.at(4.2 + i * 1.6, 3.0 - i * 0.7);
    S.add(S.G.cyl(0.05, 0.05, 0.6, 5), S.M(anchor.x, 0.3, anchor.z), S.C.wood);
    const km = new THREE.Mesh(kg, (() => { const m = new THREE.MeshToonMaterial({ color: [S.C.coral, S.C.lilac, S.C.butter][i], gradientMap: S.gradientMap, side: THREE.DoubleSide }); return S.patch(m, { key: 'kite' }); })());
    km.castShadow = true;
    const tail = []; for (let j = 0; j < 4; j++) { const b = S.mesh(S.G.box(0.18, 0.04, 0.08), [S.C.mint, S.C.pink][j % 2], { outline: false }); S.scene.add(b); tail.push(b); }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), S.wire); S.scene.add(line);
    S.scene.add(km); kites.push({ km, tail, line, anchor, h: 6.5 + i * 1.3, ph: i * 2.1 });
  }
  S.updaters.push((dt, t) => kites.forEach(k => {
    const x = k.anchor.x + Math.sin(t * 0.5 + k.ph) * 1.6 + S.camUp.x * 2.4, z = k.anchor.z + Math.cos(t * 0.37 + k.ph) * 1.1 + S.camUp.z * 2.4, y = k.h + Math.sin(t * 0.9 + k.ph) * 0.5;
    k.km.position.set(x, y, z); k.km.rotation.set(Math.sin(t * 1.3 + k.ph) * 0.25, S.CAM_YAW + Math.sin(t * 0.7 + k.ph) * 0.4, Math.sin(t * 1.1 + k.ph) * 0.3);
    const pa = k.line.geometry.attributes.position; pa.setXYZ(0, k.anchor.x, 0.6, k.anchor.z); pa.setXYZ(1, x, y - 0.9, z); pa.needsUpdate = true;
    k.tail.forEach((b, j) => b.position.set(x + Math.sin(t * 3 + j) * 0.15 * j, y - 1.25 - j * 0.32, z + Math.cos(t * 2.6 + j) * 0.1 * j));
  }));
}
function setDome(s, F) {
  const c = F.at(6.0, 0.6);
  S.add(S.G.cyl(1.55, 1.7, 0.45, 16), S.M(c.x, 0.225, c.z), S.C.wood);
  S.add(S.G.cyl(1.4, 1.4, 0.08, 16), S.M(c.x, 0.47, c.z), S.C.mint, { outline: false });
  S.add(S.G.ico(0.8, 1), S.M(c.x, 0.35, c.z, 0, 0, 0, 1.4, 0.45, 1.2), S.C.mintDeep);
  for (const [dx, dz, col] of [[-0.45, 0.2, S.C.peach], [0.35, -0.3, S.C.pink], [0.5, 0.45, S.C.cream]]) {
    S.add(S.G.box(0.34, 0.3, 0.34), S.M(c.x + dx, 0.8, c.z + dz), col);
    S.add(S.G.cone(0.3, 0.28, 4), S.M(c.x + dx, 1.09, c.z + dz, 0, Math.PI / 4, 0), S.C.coral);
  }
  const rainbow = [S.C.coral, S.C.butter, S.C.mint, S.C.lilac];
  rainbow.forEach((col, i) => S.add(new THREE.TorusGeometry(1.95 - i * 0.12, 0.06, 5, 24, Math.PI), S.M(c.x, 0.45, c.z, 0, F.rotY, 0).multiply(S.M(0, 0, -0.35)), col, { outline: false }));
  const glass = new THREE.Mesh(new THREE.SphereGeometry(1.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), S.toon('#eef6ff', { opacity: 0.28 }));
  glass.position.set(c.x, 0.48, c.z); glass.renderOrder = 2; S.scene.add(glass);
  const cloud = new THREE.Group(); cloud.position.set(c.x - 0.1, 1.45, c.z);
  for (const [dx, r] of [[-0.25, 0.22], [0, 0.3], [0.27, 0.2]]) { const m = S.mesh(S.G.ico(r, 0), '#ffffff', { outline: false }); m.position.x = dx; cloud.add(m); }
  S.scene.add(cloud);
  const sunb = S.mesh(S.G.ico(0.32, 1), S.C.butter, { emissive: '#ffcf55', ei: 0.7 }); sunb.position.set(c.x + 1.2, 2.5, c.z - 0.4); S.scene.add(sunb);
  const drops = [];
  for (let i = 0; i < 14; i++) { const d = S.mesh(S.G.box(0.025, 0.16, 0.025), '#8fd0ff', { outline: false, cast: false, noAO: true }); S.scene.add(d); drops.push({ d, o: S.R(0, 1), x: S.R(-0.35, 0.3), z: S.R(-0.2, 0.2) }); }
  S.updaters.push((dt, t) => {
    cloud.position.x = c.x - 0.1 + Math.sin(t * 0.6) * 0.25;
    sunb.rotation.y = t * 0.6; sunb.position.y = 2.5 + Math.sin(t * 1.2) * 0.12;
    drops.forEach(q => { const k = (t * 1.4 + q.o) % 1; q.d.position.set(cloud.position.x + q.x, 1.3 - k * 0.65, c.z + q.z); });
  });
  staticCyl(c.x, c.z, 1.7, 1.9); S.occ.push([c.x, c.z, 2.6]); S.aoSpots.push([c.x, c.z, 2.4, 0.2]);
}
function setGreenhouseYard(s, F) {
  for (let i = 0; i < 6; i++) {
    const q = F.at(-4.4 + i * 0.75, 4.2 + (i % 2) * 0.35);
    const h = S.R(1.1, 1.6);
    S.add(S.G.cyl(0.03, 0.04, h, 5), S.M(q.x, h / 2, q.z), S.C.mintDeep, { outline: false });
    S.add(S.G.cyl(0.26, 0.26, 0.06, 12), S.M(q.x, h, q.z, 1.1, F.rotY, 0), S.C.butter);
    S.add(S.G.cyl(0.12, 0.12, 0.08, 10), S.M(q.x, h, q.z, 1.1, F.rotY, 0).multiply(S.M(0, 0.02, 0)), '#a2715e', { outline: false });
  }
  const ch = F.at(5.6, 1.2);
  S.add(S.G.box(0.5, 1.4, 0.4), S.M(ch.x, 0.7, ch.z, 0, F.rotY, 0), S.C.cream);
  S.add(S.G.box(0.36, 0.3, 0.02), S.M(ch.x, 1.05, ch.z, 0, F.rotY, 0).multiply(S.M(0, 0, 0.21)), '#7fe6c4', { emissive: '#7fe6c4', ei: 1, outline: false, cast: false });
  S.add(new THREE.TorusGeometry(0.22, 0.04, 5, 12), S.M(ch.x, 0.5, ch.z, 0, F.rotY, 0).multiply(S.M(0.3, 0, 0)), S.C.ink, { outline: false });
  staticBox(ch.x, 0.7, ch.z, 0.3, 0.7, 0.25, F.rotY); S.occ.push([ch.x, ch.z, 1]);
  const a = F.at(-3.4, -2.4), b = F.at(3.4, -2.4); stringLights([a.x, a.z], [b.x, b.z], 2.9, 2.9, 0.25, 12);
}
function setPaperPlane(s, F) {
  const c = F.at(-7.0, 0.2);
  S.add(S.G.cyl(0.08, 0.1, 3.4, 6), S.M(c.x, 1.7, c.z), S.C.inkSoft);
  const pg = new THREE.BufferGeometry();
  const V = { n: [0, 0, -1.5], l: [-1.1, 0.05, 0.75], r: [1.1, 0.05, 0.75], c: [0, 0, 0.75], k: [0, -0.42, 0.75] };
  pg.setAttribute('position', new THREE.Float32BufferAttribute([...V.n, ...V.l, ...V.c, ...V.n, ...V.c, ...V.r, ...V.n, ...V.k, ...V.c].map(v => v * 1.2), 3)); pg.computeVertexNormals();
  const pm = new THREE.Mesh(pg, S.patch(new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: S.gradientMap, side: THREE.DoubleSide }), { key: 'plane' })); pm.castShadow = true;
  const holder = new THREE.Group(); holder.position.set(c.x, 3.6, c.z); holder.add(pm); S.scene.add(holder);
  S.updaters.push((dt, t) => { holder.rotation.y = F.rotY + Math.PI * 0.5 + Math.sin(t * 0.5) * 0.5; holder.rotation.z = Math.sin(t * 0.9) * 0.15; holder.position.y = 3.6 + Math.sin(t * 1.3) * 0.15; });
  for (let i = 0; i < 9; i++) { const q = F.at(S.R(-4.8, -2.4), S.R(1.4, 3.4)); S.add(S.G.box(0.5, 0.02, 0.34), S.M(q.x, 0.02, q.z, 0, S.R(0, 3), 0), '#fffaf1', { outline: false, cast: false }); S.add(S.G.box(0.1, 0.022, 0.1), S.M(q.x, 0.03, q.z), S.C.coral, { outline: false, cast: false }); }
  staticCyl(c.x, c.z, 0.14, 3.4); S.occ.push([c.x, c.z, 1.2]); S.aoSpots.push([c.x, c.z, 1, 0.2]);
}

/* --- skate furniture --- */
function quarterPipe(x0, z0, ry, w = 5, R0 = 1.7) {
  const prof = new THREE.Shape(); prof.moveTo(0, 0);
  for (let i = 1; i <= 10; i++) { const a = i / 10 * Math.PI / 2; prof.lineTo(Math.sin(a) * R0, R0 - Math.cos(a) * R0); }
  prof.lineTo(R0, R0 + 0.05); prof.lineTo(R0 + 0.3, R0 + 0.05); prof.lineTo(R0 + 0.3, 0); prof.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(prof, { depth: w, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, -w / 2);
  S.add(g, S.M(x0, 0, z0, 0, ry, 0), S.C.lilac);
  S.add(S.G.cyl(0.07, 0.07, w + 0.1, 6), S.M(x0, R0 + 0.06, z0, 0, ry, 0).multiply(S.M(R0, 0, 0, Math.PI / 2)), S.C.inkSoft);
  // physics: the curve as a fan of thin tilted boxes
  for (let i = 0; i < 5; i++) {
    const a0 = i / 5 * Math.PI / 2, a1 = (i + 1) / 5 * Math.PI / 2, am = (a0 + a1) / 2;
    const px = Math.sin(am) * R0, py = R0 - Math.cos(am) * R0, len = R0 * (a1 - a0);
    const b = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC }); b.addShape(new CANNON.Box(new CANNON.Vec3(len / 2 + 0.02, 0.06, w / 2)));
    const local = new THREE.Vector3(px + Math.sin(am) * 0.06, py - Math.cos(am) * 0.06, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
    b.position.set(x0 + local.x, local.y, z0 + local.z);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, am, 'YXZ'));
    b.quaternion.set(q.x, q.y, q.z, q.w); S.world.addBody(b);
  }
  const back = new THREE.Vector3(R0 + 0.15, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry);
  staticBox(x0 + back.x, R0 / 2, z0 + back.z, 0.15, R0 / 2, w / 2, ry);
  S.aoSpots.push([x0 + back.x * 0.7, z0 + back.z * 0.7, 3, 0.2]);
}
function barrel(x, z) {
  const g = new THREE.Group();
  const b = S.mesh(S.G.cyl(0.32, 0.32, 0.9, 10), S.C.coral); g.add(b);
  for (const y of [-0.2, 0.15]) { const st = S.mesh(S.G.cyl(0.33, 0.33, 0.12, 10), S.C.cream, { outline: false }); st.position.y = y; g.add(st); }
  dynProp(new CANNON.Cylinder(0.32, 0.32, 0.9, 10), 2.5, g, x, 0.45, z, S.R(0, 3), 'barrel');
}
function tyre(x, y, z) {
  const g = S.mesh(new THREE.TorusGeometry(0.34, 0.15, 6, 12), S.C.tire); g.rotation.x = Math.PI / 2;
  const h = new THREE.Group(); h.add(g);
  dynProp(new CANNON.Cylinder(0.48, 0.48, 0.3, 10), 1.6, h, x, y, z, S.R(0, 3), 'tyre');
}
function bin(x, z) {
  const g = new THREE.Group();
  const b = S.mesh(S.G.cyl(0.3, 0.26, 0.8, 9), S.C.mint); g.add(b);
  const lid = S.mesh(S.G.cyl(0.33, 0.33, 0.08, 9), S.C.inkSoft, { outline: false }); lid.position.y = 0.43; g.add(lid);
  dynProp(new CANNON.Cylinder(0.3, 0.26, 0.8, 9), 2, g, x, 0.4, z, 0, 'bin');
}

/* --- life: leaves, birds, butterflies --- */
S.leaves = undefined;
function buildLeaves(n) {
  const geo = new THREE.PlaneGeometry(0.2, 0.13); geo.rotateX(-Math.PI / 2);
  const mat = S.patch(new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: S.gradientMap, side: THREE.DoubleSide }), { key: 'leaf', ao: false });
  const im = new THREE.InstancedMesh(geo, mat, n); im.receiveShadow = true;
  const cols = ['#f4b9c6', '#f7c9a6', '#f3d68a', '#eaa6b4', '#e8c09c'].map(c => new THREE.Color(c));
  const st = [];
  for (let i = 0; i < n; i++) {
    let x, z;
    let tries = 0;
    do { if (S.rand() < 0.88 && S.treePos.length) { const t = S.treePos[S.rand() * S.treePos.length | 0]; const a = S.R(0, 6.28), r = S.R(0.4, 3.4); x = t[0] + Math.cos(a) * r; z = t[1] + Math.sin(a) * r; }
    else { const a = S.R(0, 6.28), r = Math.sqrt(S.R(0.02, 1)) * 44; x = Math.cos(a) * r; z = Math.sin(a) * r; } } while (S.onPaved(x, z, -0.6) && S.rand() < 0.8 && ++tries < 6);
    st.push({ x, y: 0.03 + S.R(0, 0.01), z, vx: 0, vy: 0, vz: 0, ry: S.R(0, 6.28), rx: 0, spin: 0, air: false });
    im.setColorAt(i, cols[S.rand() * cols.length | 0]);
  }
  im.userData.st = st; S.leaves = im; S.scene.add(im);
  const write = i => { const q = st[i]; S._m.compose(S._v.set(q.x, q.y, q.z), S._q.setFromEuler(S._e.set(q.rx, q.ry, q.rx * 0.6)), S._s.setScalar(1)); im.setMatrixAt(i, S._m); };
  st.forEach((_, i) => write(i));
  S.updaters.push((dt, t, info) => {
    const kx = S.chassis.position.x, kz = S.chassis.position.z, sp = info.speed;
    let dirty = false;
    for (let i = 0; i < st.length; i++) {
      const q = st[i];
      if (!q.air) {
        if (sp > 3.5 && Math.abs(q.x - kx) < 1.9 && Math.abs(q.z - kz) < 1.9) {
          const dx = q.x - kx, dz = q.z - kz, d = Math.hypot(dx, dz) + 0.01;
          if (d < 1.9) { q.air = true; q.vx = dx / d * S.R(1, 2.5) + S.chassis.velocity.x * 0.35; q.vz = dz / d * S.R(1, 2.5) + S.chassis.velocity.z * 0.35; q.vy = S.R(1.8, 3.6) * Math.min(sp / 8, 1.4); q.spin = S.R(-9, 9); }
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
  const wingM = S.patch(new THREE.MeshToonMaterial({ color: '#fffaf2', gradientMap: S.gradientMap, side: THREE.DoubleSide }), { key: 'wing' });
  const birds = [];
  flocks.forEach((f, fi) => {
    for (let i = 0; i < 5; i++) {
      const g = new THREE.Group();
      const body = S.mesh(S.G.cone(0.13, 0.55, 5), '#fffaf2', { outline: false }); body.rotation.x = -Math.PI / 2; g.add(body);
      const beak = S.mesh(S.G.cone(0.05, 0.12, 4), S.C.coral, { outline: false }); beak.rotation.x = -Math.PI / 2; beak.position.z = -0.33; g.add(beak);
      const wl = new THREE.Mesh(wingG, wingM), wr = new THREE.Mesh(wingG, wingM); wr.scale.x = -1; wl.castShadow = wr.castShadow = true;
      g.add(wl, wr); g.scale.setScalar(1.2); S.scene.add(g);
      birds.push({ g, wl, wr, f, off: i * 0.32 + fi, dy: S.R(-0.6, 0.6), dr: S.R(-1.5, 1.5), ph: S.R(0, 6) });
    }
  });
  S.updaters.push((dt, t) => birds.forEach(b => {
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
    const b = S.BEDS[i % S.BEDS.length];
    const m = S.patch(new THREE.MeshBasicMaterial({ color: [S.C.coral, S.C.lilac, S.C.butter, '#ffffff'][i % 4], side: THREE.DoubleSide }), { key: 'bfly', noGlow: true });
    const g = new THREE.Group(); const l = new THREE.Mesh(wg, m), r = new THREE.Mesh(wg, m); r.scale.x = -1; g.add(l, r); S.scene.add(g);
    list.push({ g, l, r, b, ph: S.R(0, 6.28), sp: S.R(0.3, 0.7) });
  }
  S.updaters.push((dt, t) => list.forEach(q => {
    const a = t * q.sp + q.ph;
    q.g.position.set(q.b.c.x + Math.cos(a) * q.b.rx * 0.9 + Math.sin(t * 1.7 + q.ph) * 0.4, 0.7 + Math.sin(t * 2.3 + q.ph) * 0.35, q.b.c.z + Math.sin(a * 1.3) * q.b.rz * 0.9);
    q.g.rotation.y = -a; const f = Math.sin(t * 22 + q.ph) * 1.1; q.l.rotation.y = f; q.r.rotation.y = -f;
  }));
}

/* --- proximity glow: the nearest stand lights up as you roll in --- */
S.standLight = new THREE.PointLight('#ffffff', 0, 18, 1.6);
S.scene.add(S.standLight);
function buildStandGlow() {
  S.updaters.push((dt, t) => {
    let best = null, bd = 1e9;
    for (const s of S.STANDS) {
      const F = s._frame; if (!F) continue;
      const d = Math.hypot(S.chassis.position.x - F.p.x, S.chassis.position.z - F.p.z);
      s._w = S.damp(s._w || 0, S.clamp((15 - d) / 8, 0, 1), 4, dt);
      if (s._board) { const v = 0.8 + s._w * 0.2; s._board.material.color.setRGB(v, v, v); }
      if (s._rise) s._rise.position.y = 0.4 + s._w * 1.15;
      if (s._totem) { s._totem.rotation.y = s._frame.rotY + Math.sin(t * (0.8 + s._w * 2)) * (0.15 + s._w * 0.25); s._totem.position.y = 3.95 + s._w * Math.sin(t * 4) * 0.08; }
      if (d < bd) { bd = d; best = s; }
    }
    if (best && best._frame) {
      const F = best._frame; S.standLight.color.set(best.color);
      S.standLight.position.set(F.p.x + S.camRight.x * 0 - S.camUp.x * 3, 4.2, F.p.z - S.camUp.z * 3);
      S.standLight.intensity = S.damp(S.standLight.intensity, (best._w || 0) * 55, 5, dt);
    }
  });
}

function skillPlinths(F) {
  const labels = [['Languages', 'Python · JS'], ['Frameworks', 'React · Node'], ['QA', 'Playwright'], ['Systems', 'Azure · n8n']];
  labels.forEach((lb, i) => {
    const at = F.at(-4.2 + i * 1.5, -3.4);
    S.add(S.G.box(1.2, 0.45, 0.7), S.M(at.x, 0.22, at.z), S.C.sky);
    const tex = canvasTex(256, 128, (ctx, w, h) => {
      ctx.fillStyle = '#fbf3e6'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2a1d38'; ctx.textAlign = 'center';
      ctx.font = '800 36px Syne'; ctx.fillText(lb[0], w / 2, 52);
      ctx.font = '400 22px "Space Mono"'; ctx.fillText(lb[1], w / 2, 92);
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.52), basic(tex));
    face.position.set(at.x, 0.52, at.z); face.rotation.x = -0.4; S.scene.add(face);
  });
}
function shopFace(s, F) {
  const at = F.at(0, -1.15);
  if (s.id === 'patchifi') {
    S.add(S.G.box(1.6, 0.9, 0.08), S.M(at.x, 2.2, at.z, 0, F.rotY, 0), S.C.ink);
    const tex = canvasTex(320, 180, (ctx, w, h) => {
      ctx.fillStyle = '#1c1326'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#7fe6c4'; ctx.font = '700 28px "Space Mono"'; ctx.fillText('840+ TESTS', 24, 78);
      ctx.fillStyle = '#fbf3e6'; ctx.font = '400 18px "Space Mono"'; ctx.fillText('Playwright · 8 modules', 24, 118);
    });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.72), basic(tex));
    scr.position.set(at.x, 2.2, at.z); scr.rotation.y = F.rotY; S.scene.add(scr);
  } else {
    for (const sx of [-0.55, 0.55]) S.add(S.G.box(0.7, 0.95, 0.06), S.M(at.x, 2.1, at.z, 0, F.rotY, 0).multiply(S.M(sx, 0, 0.2)), S.C.cream);
  }
  const rise = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.36), basic(canvasTex(480, 80, (ctx, w, h) => {
    ctx.fillStyle = '#fbf3e6'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2a1d38'; ctx.font = '800 36px Syne'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s.short.toUpperCase(), w / 2, h / 2);
  })));
  rise.position.set(at.x, 0.2, at.z); rise.rotation.y = F.rotY; S.scene.add(rise); s._rise = rise;
}
function dressPark(images) {
  const badges = images.badges || {};
  // per stand: badge totem, A-frame board, its own set piece
  for (const s of S.STANDS) {
    const F = standFrame(s); s._frame = F;
    s._totem = badgeTotem(s, F, badges[s.id]);
    aFrame(s, F);
    if (s.id === 'projects') buildProjectEasels(F);
    if (s.id === 'contact') buildSocials(F);
    const piece = ({ about: setGreenhouseYard, contact: setPaperPlane, education: setBook, skills: setDome, appify: setKites, patchifi: setBoombox })[s.id];
    if (piece) piece(s, F);
    if (s.id === 'skills') skillPlinths(F);
    if (s.id === 'patchifi' || s.id === 'appify') shopFace(s, F);
    if (s.id === 'patchifi') {
      const other = S.STANDS.find(st => st.id === 'appify');
      const mx = (s.pos.x + other.pos.x) / 2, mz = (s.pos.z + other.pos.z) / 2;
      const lab = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.42), basic(canvasTex(640, 96, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(42,29,56,.72)';
        ctx.font = '800 42px Syne'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('EXPERIENCE', w / 2, h / 2);
      }), { transparent: true }));
      lab.rotation.x = -Math.PI / 2; lab.position.set(mx, 0.05, mz); S.scene.add(lab);
    }
  }
  buildStandGlow();
  // fences round the flower beds
  for (const b of S.BEDS) fenceAround(b);
  // planters lining the spokes
  for (const [dx, dz, runs] of [[0, -39, { 1: [11.5, 14.5], '-1': [11.5, 14.5] }],
    [0, 19.5, { 1: [18], '-1': [18] }],
    [-34.5, -5, { 1: [11, 24], '-1': [12.5, 15.5] }],
    [34.5, -5, { '-1': [11, 24], 1: [12.5, 15.5] }]]) {
    const l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l, nx = -uz, nz = ux, ry = Math.atan2(-uz, ux);
    for (const sd of [1, -1]) for (const t of runs[sd] || []) planterBox(ux * t + nx * 7.6 * sd, uz * t + nz * 7.6 * sd, ry);
  }
  // wayfinding at the road junctions
  signpost(5.0, -16, [{ t: '↑ NORTH CREST' }, { t: 'SPEEDWAY', bg: '#2c203b' }]);
  signpost(23.09, -7.99, [{ t: '→ PROJECTS' }, { t: 'PIAZZA', bg: '#a9dcb6' }]);
  signpost(-23.09, -7.99, [{ t: '← ABOUT' }, { t: 'EDUCATION', bg: '#ffe08f' }]);
  signpost(5.0, 17, [{ t: '↓ SKATE SLAB' }, { t: 'HOP: SPACE' }]);
  signpost(28.2, 9.5, [{ t: '→ CONTACT GARDEN', bg: '#f6b3c7' }]);
  // string lights: along the ring between neighbouring lamps, and a square over the plaza
  const ring = S.lampPos.map(l => [...l, Math.atan2(l[0], -(l[1] - S.RING.cz))]).sort((a, b) => a[2] - b[2]);
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 16) stringLights([a[0], a[1]], [b[0], b[1]], 3.3, 3.3, 0.55);
  }
  const pp = [45, 135, 225, 315].map(a => S.polar(a, S.PLAZA_R + 0.9));
  pp.forEach(p => pole(p.x, p.z));
  for (let i = 0; i < 4; i++) { const a = pp[i], b = pp[(i + 1) % 4]; stringLights([a.x, a.z], [b.x, b.z], 3.6, 3.6, 0.9, 12); }
  stringLights([pp[0].x, pp[0].z], [pp[2].x, pp[2].z], 3.6, 3.6, 1.3, 16);
  // skate slab furniture
  quarterPipe(9.9, 30.2, 0, 5, 1.7);
  S.add(S.G.box(2.6, 0.24, 1.3), S.M(-0.8, 0.12, 28.4), S.C.butter); staticBox(-0.8, 0.12, 28.4, 1.3, 0.12, 0.65);
  { // grind rail along the west edge of the slab
    S.add(S.G.cyl(0.06, 0.06, 7, 6), S.M(-12.4, 0.55, 26, Math.PI / 2, 0, 0), S.C.inkSoft);
    for (const z of [23, 26, 29]) S.add(S.G.box(0.08, 0.55, 0.08), S.M(-12.4, 0.27, z), S.C.inkSoft);
    staticBox(-12.4, 0.3, 26, 0.08, 0.3, 3.5);
  }
  for (const [x, z] of [[12.2, 24.6], [13.2, 25.4], [11.4, 25.8]]) barrel(x, z);
  for (const [x, z] of [[-13.2, 30.2], [-12.4, 30.8]]) for (let k = 0; k < 3; k++) tyre(x, 0.16 + k * 0.31, z);
  for (const [x, z] of [[-6.6, 3.0], [6.6, 2.6]]) bin(x, z);
  // a few more cones near the skate entrance
  for (const [x, z] of [[-2.6, 27.4], [2.6, 27.4], [-1.6, 29.6], [1.6, 29.6]]) cone(x, z);
}
S.staticBox = staticBox;
S.staticCyl = staticCyl;
S.onSlope = onSlope;
S.buildCrest = buildCrest;
S.chevron = chevron;
S.wedge = wedge;
S.tree = tree;
S.palm = palm;
S.bush = bush;
S.monstera = monstera;
S.lamp = lamp;
S.bench = bench;
S.planter = planter;
S.canvasTex = canvasTex;
S.basic = basic;
S.posterTex = posterTex;
S.buildStand = buildStand;
S.buildGreenhouse = buildGreenhouse;
S.monsteraLocal = monsteraLocal;
S.buildSign = buildSign;
S.buildPad = buildPad;
S.dynProp = dynProp;
S.cone = cone;
S.can = can;
S.crate = crate;
S.pot = pot;
S.ball = ball;
S.letterBrick = letterBrick;
S.buildNameBricks = buildNameBricks;
S.buildBrickStack = buildBrickStack;
S.buildHoop = buildHoop;
S.buildProjectEasels = buildProjectEasels;
S.buildSocials = buildSocials;
S.buildPark = buildPark;
S.standFrame = standFrame;
S.seg = seg;
S.stringLights = stringLights;
S.buildBulbs = buildBulbs;
S.pole = pole;
S.flowersOn = flowersOn;
S.planterBox = planterBox;
S.signBoard = signBoard;
S.signpost = signpost;
S.fenceAround = fenceAround;
S.badgeTotem = badgeTotem;
S.aFrame = aFrame;
S.setTidePool = setTidePool;
S.setBook = setBook;
S.setBoombox = setBoombox;
S.setKites = setKites;
S.setDome = setDome;
S.setGreenhouseYard = setGreenhouseYard;
S.setPaperPlane = setPaperPlane;
S.quarterPipe = quarterPipe;
S.barrel = barrel;
S.tyre = tyre;
S.bin = bin;
S.buildLeaves = buildLeaves;
S.buildBirds = buildBirds;
S.buildButterflies = buildButterflies;
S.buildStandGlow = buildStandGlow;
S.skillPlinths = skillPlinths;
S.shopFace = shopFace;
S.dressPark = dressPark;

}

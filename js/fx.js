import * as THREE from 'three';
import * as CANNON from 'cannon-es';
export async function installFx(S) {
S.audio = { on: true, ctx: null };
function initAudio() {
  if (S.audio.ctx) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain(); master.gain.value = S.audio.on ? 0.5 : 0; master.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 3;
    const g = ctx.createGain(); g.gain.value = 0;
    const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; const o2 = ctx.createOscillator(); o2.type = 'triangle';
    o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(master); o1.start(); o2.start();
    Object.assign(S.audio, { ctx, master, lp, g, o1, o2 });
  } catch (e) { }
}
function tone(freq, dur, type = 'sine', vol = 0.2, when = 0) {
  if (!S.audio.ctx || !S.audio.on) return;
  const t = S.audio.ctx.currentTime + when, o = S.audio.ctx.createOscillator(), g = S.audio.ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(S.audio.master); o.start(t); o.stop(t + dur + 0.05);
}
function thud(v) {
  if (!S.audio.ctx || !S.audio.on) return;
  const ctx = S.audio.ctx, n = ctx.sampleRate * 0.12, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  const s = ctx.createBufferSource(); s.buffer = buf; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500 + v * 120;
  const g = ctx.createGain(); g.gain.value = Math.min(0.5, v * 0.06); s.connect(f); f.connect(g); g.connect(S.audio.master); s.start();
}

S.dust = [];
{
  const g = S.G.ico(0.22, 0);
  for (let i = 0; i < 36; i++) {
    const m = new THREE.Mesh(g, S.patch(new THREE.MeshBasicMaterial({ color: '#dcc3c2', transparent: true, opacity: 0, depthWrite: false }), { key: 'dust', noGlow: true }));
    m.visible = false; S.scene.add(m); S.dust.push({ m, t: 0, life: 0, v: new THREE.Vector3() });
  }
}
S.dustI = 0;
function puff(p, s = 1) {
  const d = S.dust[S.dustI++ % S.dust.length];
  d.m.position.copy(p); d.m.position.y = 0.2; d.t = 0; d.life = S.R(0.5, 0.9); d.s = s; d.m.visible = true;
  d.v.set(S.R(-0.6, 0.6), S.R(0.6, 1.4), S.R(-0.6, 0.6));
}
S.scraps = [];
{
  const cols = [S.C.coral, S.C.butter, S.C.cream, S.C.peach, S.C.ink];
  for (let i = 0; i < 28; i++) {
    const m = new THREE.Mesh(S.G.box(0.42, 0.08, 0.28), S.patch(new THREE.MeshBasicMaterial({ color: cols[i % cols.length], transparent: true, depthWrite: false }), { key: 'scrap', noGlow: true }));
    m.visible = false; S.scene.add(m);
    S.scraps.push({ m, t: 0, life: 0, v: new THREE.Vector3(), spin: new THREE.Vector3() });
  }
}
S.scrapI = 0;
function burstAt(pos) {
  tone(150, 0.16, 'square', 0.07);
  for (let i = 0; i < 14; i++) {
    const s = S.scraps[S.scrapI++ % S.scraps.length];
    s.m.position.set(pos.x, pos.y + 0.4, pos.z);
    s.m.rotation.set(S.R(0, 6), S.R(0, 6), S.R(0, 6));
    s.m.scale.setScalar(S.R(0.7, 1.35));
    s.m.visible = true; s.t = 0; s.life = S.R(0.7, 1.05);
    const a = S.R(0, 6.28), sp = S.R(2.2, 5);
    s.v.set(Math.cos(a) * sp, S.R(4, 8), Math.sin(a) * sp);
    s.spin.set(S.R(-8, 8), S.R(-8, 8), S.R(-8, 8));
  }
}
S.chunks = [];
S.fires = [];
{
  const chunkGeo = S.G.box(0.22, 0.16, 0.22);
  const chunkCols = ['#ffb199', '#ff5a32', '#6e2420', '#3a1816'];
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(chunkGeo, S.patch(new THREE.MeshBasicMaterial({ color: chunkCols[i % chunkCols.length], transparent: true, depthWrite: false }), { key: 'chunk', noGlow: true }));
    m.visible = false; S.scene.add(m);
    S.chunks.push({ m, t: 0, life: 0, v: new THREE.Vector3(), spin: new THREE.Vector3() });
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
      float ground = smoothstep(-0.45, 0.2, vP.y);
      vec3 col = mix(vec3(0.06, 0.02, 0.03), vec3(1.0, 0.32, 0.12), clamp(edge * 3.2, 0.0, 1.0));
      gl_FragColor = vec4(col * mix(0.2, 1.15, ground), 1.0);
    }`;
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(fireGeo, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uProgress: { value: 0 } },
      vertexShader: fireVert, fragmentShader: fireFrag,
    }));
    m.visible = false; m.renderOrder = 3; S.scene.add(m);
    S.fires.push({ m, t: 0, life: 0.9 });
  }
}
S.fireI = 0, S.chunkI = 0;
S.fireLight = new THREE.PointLight('#ff5a32', 0, 9, 2);
S.scene.add(S.fireLight);
S.smokes = [];
{
  const smokeGeo = new THREE.SphereGeometry(0.22, 8, 6);
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(smokeGeo, new THREE.MeshBasicMaterial({ color: '#e4dce8', transparent: true, depthWrite: false, opacity: 0.4 }));
    m.visible = false; S.scene.add(m);
    S.smokes.push({ m, t: 0, life: 0.5, v: new THREE.Vector3() });
  }
}
S.smokeI = 0;
S.blastKick = new CANNON.Vec3();
  S.camKick = 0, S.boostHum = 0;
/* boost trails: two pooled ribbons (a wide amber one and a thin white core, per rear corner).
   Points are dropped in the world and left there, drift back a little, and fade. The head is
   the live lamp while Shift is held and the car is moving forward. Nothing is created per frame. */
S.boostTrails = [];
{
  const N = 48, LIFE = 1.25, STEP = 0.022;
  const make = (side, wScale, tint) => {
    const V = (N + 1) * 2;
    const pos = new Float32Array(V * 3), col = new Float32Array(V * 3), idx = [];
    for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setIndex(idx);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    mesh.frustumCulled = false; mesh.renderOrder = 3; mesh.visible = false; S.scene.add(mesh);
    return {
      side, wScale, tint, mesh, geo, n: 0, head: 0, acc: 0, live: false, hx: 0, hy: 0, hz: 0,
      px: new Float32Array(N), py: new Float32Array(N), pz: new Float32Array(N), age: new Float32Array(N),
      vx: new Float32Array(N), vz: new Float32Array(N),
    };
  };
  S.boostTrails.push(make(-1, 1, null), make(1, 1, null), make(-1, 0.3, null), make(1, 0.3, null));
  S.boostTrails.N = N; S.boostTrails.LIFE = LIFE; S.boostTrails.STEP = STEP;
}
S.tmpBack = new THREE.Vector3(); S.tmpLamp = new THREE.Vector3();
function updateBoostTrails(dt, emitting) {
  const T = S.boostTrails, N = T.N, LIFE = T.LIFE, STEP = T.STEP;
  let back = null;
  if (emitting) { back = S.tmpBack.set(0, 0, 1).applyQuaternion(S.kart.quaternion); }
  for (const r of T) {
    r.live = emitting;
    if (emitting) {
      S.tmpLamp.set(r.side * 0.42 * S.KS, 0.04 * S.KS, 1.08 * S.KS).applyQuaternion(S.kart.quaternion).add(S.kart.position);
      r.hx = S.tmpLamp.x; r.hy = S.tmpLamp.y; r.hz = S.tmpLamp.z;
      r.acc += dt;
      if (r.acc >= STEP) {
        r.acc = 0; r.head = (r.head + 1) % N; const i = r.head;
        r.px[i] = r.hx; r.py[i] = r.hy; r.pz[i] = r.hz; r.age[i] = 0; r.vx[i] = back.x * 1.5; r.vz[i] = back.z * 1.5;
        r.n = Math.min(r.n + 1, N);
      }
    } else r.acc = STEP;
    // age every point, and age them three times faster once the trail is cut so nothing lingers
    const rate = emitting ? 1 : 3.2;
    let alive = 0;
    for (let k = 0; k < r.n; k++) {
      const i = (r.head - k + N) % N;
      r.age[i] += dt * rate;
      r.px[i] += r.vx[i] * dt; r.pz[i] += r.vz[i] * dt;
      if (r.age[i] < LIFE) alive = k + 1;
    }
    r.n = alive;
    if (!alive && !emitting) { r.mesh.visible = false; continue; }
    r.mesh.visible = true;
    const pos = r.geo.attributes.position.array, col = r.geo.attributes.color.array;
    // vertex 0..1 is the live lamp (or the newest point when cut), then the pooled points
    let m = 0;
    const put = (x, y, z, dx, dz, u, w) => {
      const l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
      const f = Math.pow(Math.max(1 - u, 0), 1.6) * 1.15;
      for (let s = -1; s <= 1; s += 2) {
        const o = m * 3;
        pos[o] = x + nx * w * s; pos[o + 1] = y; pos[o + 2] = z + nz * w * s;
        // cool palette: ice-white head, electric blue body, violet tail; the thin core stays white-cyan
        let cr, cg, cb;
        if (r.wScale < 0.5) { cr = 1 - u * 0.45; cg = 1 - u * 0.1; cb = 1; }
        else if (u < 0.35) { const k = u / 0.35; cr = 0.55 - 0.4 * k; cg = 0.95 - 0.4 * k; cb = 1; }
        else { const k = (u - 0.35) / 0.65; cr = 0.15 + 0.4 * k; cg = 0.55 - 0.35 * k; cb = 1; }
        col[o] = cr * f; col[o + 1] = cg * f; col[o + 2] = cb * f;
        m++;
      }
    };
    const total = alive + (emitting ? 1 : 0);
    const pts = [];
    if (emitting) pts.push(null);
    for (let k = 0; k < alive; k++) pts.push((r.head - k + N) % N);
    for (let j = 0; j < total; j++) {
      let x, y, z, u;
      if (pts[j] === null) { x = r.hx; y = r.hy; z = r.hz; u = 0; } else { const i = pts[j]; x = r.px[i]; y = r.py[i]; z = r.pz[i]; u = r.age[i] / LIFE; }
      const a = j > 0 ? pts[j - 1] : pts[j], b = j < total - 1 ? pts[j + 1] : pts[j];
      const ax = a === null ? r.hx : r.px[a], az = a === null ? r.hz : r.pz[a];
      const bx = b === null ? r.hx : r.px[b], bz = b === null ? r.hz : r.pz[b];
      const w = (0.07 * Math.pow(1 - u, 1.1) + 0.004) * r.wScale;
      put(x, y, z, ax - bx, az - bz, u, w);
    }
    // collapse the unused tail
    const lx = pos[(m - 2) * 3], ly = pos[(m - 2) * 3 + 1], lz = pos[(m - 2) * 3 + 2];
    for (; m < (N + 1) * 2; m++) { const o = m * 3; pos[o] = lx; pos[o + 1] = ly; pos[o + 2] = lz; col[o] = col[o + 1] = col[o + 2] = 0; }
    r.geo.attributes.position.needsUpdate = true; r.geo.attributes.color.needsUpdate = true;
  }
}
S.updateBoostTrails = updateBoostTrails;
function blast(pos) {
  if (S.blastCool > 0) return;
  S.blastCool = 1.2;
  const f = S.fires[S.fireI++ % S.fires.length];
  f.m.position.set(pos.x, Math.max(pos.y, 0.7), pos.z);
  f.m.scale.setScalar(0.45);
  f.m.rotation.set(S.R(0, 6), S.R(0, 6), 0);
  f.m.material.uniforms.uProgress.value = 0.05;
  f.m.visible = true; f.t = 0; f.life = 1.3; f.born = performance.now();
  for (let i = 0; i < 8; i++) {
    const c = S.chunks[S.chunkI++ % S.chunks.length];
    c.m.position.set(pos.x, pos.y + 0.4, pos.z);
    c.m.rotation.set(S.R(0, 6), S.R(0, 6), S.R(0, 6));
    c.m.scale.setScalar(S.R(0.6, 1.3));
    c.m.visible = true; c.t = 0; c.life = S.R(0.55, 0.9);
    const a = S.R(0, 6.28), sp = S.R(3, 7);
    c.v.set(Math.cos(a) * sp, S.R(4, 8), Math.sin(a) * sp);
    c.spin.set(S.R(-8, 8), S.R(-8, 8), S.R(-8, 8));
  }
  burstAt(pos);
  const dx = S.chassis.position.x - pos.x, dz = S.chassis.position.z - pos.z;
  const d = Math.hypot(dx, dz) || 1;
  S.chassis.velocity.x += (dx / d) * 6;
  S.chassis.velocity.z += (dz / d) * 6;
  S.chassis.velocity.y = Math.max(S.chassis.velocity.y, 12);
  S.chassis.quaternion.vmult(new CANNON.Vec3(1, 0, 0), S.blastKick);
  S.chassis.angularVelocity.x += S.blastKick.x * 2.2;
  S.chassis.angularVelocity.y += S.blastKick.y * 2.2;
  S.chassis.angularVelocity.z += S.blastKick.z * 2.2;
  S.camKick = 0.22;
  S.boomAt = performance.now();
  tone(46, 0.42, 'sawtooth', 0.1);
  const lines = ['The ferns saw that.', 'That one had it coming.', 'Physics, but rude.', 'The lawn will write to you.', 'Ten out of ten. The cone disagrees.'];
  S.toast(lines[(Math.random() * lines.length) | 0], 'boom');
}

/* =====================================================================
   tyre trails: fading marks wherever the kart slides
   ===================================================================== */
S.TRAIL_N = 1000;
S.trail = (() => {
  const pos = new Float32Array(S.TRAIL_N * 6 * 3), birth = new Float32Array(S.TRAIL_N * 6).fill(-99);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('birth', new THREE.BufferAttribute(birth, 1).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uTime: S.RU.uTime, uCol: { value: new THREE.Color('#0c070f') } },
    vertexShader: 'attribute float birth; uniform float uTime; varying float vA; varying vec2 vP; void main(){ vA = clamp(1. - (uTime - birth) / 7., 0., 1.); vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform vec3 uCol; varying float vA; varying vec2 vP; float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); } void main(){ if (vA <= 0.) discard; float n = .72 + .28 * h(floor(vP * 26.)); gl_FragColor = vec4(uCol, smoothstep(0., .75, vA) * .78 * n); }',
  });
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = 1; S.scene.add(m);
  return { pos, birth, geo, i: 0, last: [null, null] };
})();
function trailPush(w, p, now) {
  const prev = S.trail.last[w];
  S.trail.last[w] = p.clone();
  if (!prev || prev.distanceTo(p) > 1.2) return;
  if (prev.distanceTo(p) < 0.05) { S.trail.last[w] = prev; return; }
  const d = new THREE.Vector3().subVectors(p, prev); const n = new THREE.Vector3(-d.z, 0, d.x).normalize().multiplyScalar(0.055);
  const q = [prev.clone().add(n), prev.clone().sub(n), p.clone().add(n), p.clone().sub(n)];
  const k = S.trail.i++ % S.TRAIL_N, o = k * 18;
  [q[0], q[1], q[2], q[1], q[3], q[2]].forEach((v, j) => { S.trail.pos[o + j * 3] = v.x; S.trail.pos[o + j * 3 + 1] = 0.14; S.trail.pos[o + j * 3 + 2] = v.z; S.trail.birth[k * 6 + j] = now; });
  S.trail.geo.attributes.position.needsUpdate = true; S.trail.geo.attributes.birth.needsUpdate = true;
}
S.rightV = new CANNON.Vec3();
S.initAudio = initAudio;
S.tone = tone;
S.thud = thud;
S.puff = puff;
S.burstAt = burstAt;
S.blast = blast;
S.trailPush = trailPush;

}

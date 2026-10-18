import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { S, installContent } from './content.js';
import { installPalette, installMaterials } from './mat.js';
import { installLayout } from './layout.js';
import { installWorld } from './world.js';
import { installGround } from './ground.js';
import { installCar } from './car.js';
import { installFx } from './fx.js';
import { installPanel } from './panel.js';
import { installTour } from './tour.js';

await installContent(S);
await installPalette(S);
S.canvas = S.$('gl');
S.renderer = undefined;
try { S.renderer = new THREE.WebGLRenderer({ canvas: S.canvas, antialias: false, powerPreference: 'high-performance' }); }
catch (e) { S.parkFallback(); await new Promise(() => {}); } // a context that will not open goes to the list too
S.DPR = Math.min(devicePixelRatio, S.phone() ? 1.6 : 1.5);
window.__booted = true;
S.renderer.setPixelRatio(S.DPR);
S.renderer.setSize(innerWidth, innerHeight);
S.renderer.toneMapping = THREE.NeutralToneMapping;
S.renderer.toneMappingExposure = 1.16;
S.renderer.shadowMap.enabled = true;
S.renderer.shadowMap.type = THREE.PCFShadowMap; // PCF honours shadow.radius → soft, long shadows

S.scene = new THREE.Scene();
S.scene.background = S.HAZE.clone();
S.scene.fog = new THREE.Fog(S.HAZE, 30, 95);
S.camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.5, 400);
S.CAM_YAW = 22 * S.DEG; S.CAM_PITCH = 40 * S.DEG;
S.camRight = new THREE.Vector3(Math.cos(S.CAM_YAW), 0, -Math.sin(S.CAM_YAW));
S.camUp = new THREE.Vector3(-Math.sin(S.CAM_YAW), 0, -Math.cos(S.CAM_YAW)); // "screen up" on the ground

S.hemi = new THREE.HemisphereLight(S.SKYFILL, S.GROUNDFILL, 1.08);
S.scene.add(S.hemi);
S.sun = new THREE.DirectionalLight(S.SUN, 3.7);
S.SUN_DIR = new THREE.Vector3(-0.84, 0.56, 0.44).normalize(); // ~34° high: long shadows up-screen
S.sun.castShadow = true;
S.sun.shadow.mapSize.set(S.phone() ? 1024 : 2048, S.phone() ? 1024 : 2048);
S.SH = S.phone() ? 34 : 30;
Object.assign(S.sun.shadow.camera, { left: -S.SH, right: S.SH, top: S.SH, bottom: -S.SH, near: 1, far: 130 });
S.sun.shadow.bias = -0.0005; S.sun.shadow.normalBias = 0.04; S.sun.shadow.radius = S.phone() ? 3 : 4.5;
S.scene.add(S.sun, S.sun.target);

S.RU = {
  uReveal: { value: 0 }, uCenter: { value: new THREE.Vector2(0, 4.5) }, uTime: { value: 0 },
  uRingOn: { value: 1 }, uRingCol: { value: S.RING_COL.clone().multiplyScalar(1.6) }, uDim: { value: 1 }, uKart: { value: new THREE.Vector2(0, 4.5) },
};

await installMaterials(S);
await installLayout(S);
await installWorld(S);
await installGround(S);
await installCar(S);
S.rt = new THREE.WebGLRenderTarget(innerWidth * S.DPR, innerHeight * S.DPR, { type: THREE.HalfFloatType, samples: 4 });
S.composer = new EffectComposer(S.renderer, S.rt);
S.composer.setPixelRatio(S.DPR);
S.composer.addPass(new RenderPass(S.scene, S.camera));
S.composer.addPass(new OutputPass());
S.TiltShader = {
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
S.tiltH = new ShaderPass(S.TiltShader), S.tiltV = new ShaderPass(S.TiltShader);
S.composer.addPass(S.tiltH); S.composer.addPass(S.tiltV);
S.grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2() } },
  vertexShader: S.TiltShader.vertexShader,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(.2126, .7152, .0722));
      // split tone: lilac shadows, peach highlights
      c += mix(vec3(.01, -.008, .04), vec3(.012, .02, -.01), smoothstep(.22, .85, l)) * .45;
      c = (c - .5) * 1.06 + .5;
      c = mix(vec3(l), c, 1.08);
      c = mix(c, vec3(.86, .93, .84), smoothstep(.86, 1.0, vUv.y) * .035);
      // rounded vignette toward plum, never black
      vec2 q = vUv - .5; float v = dot(q * vec2(1., .9), q * vec2(1., .9));
      c = mix(c, c * vec3(.88, .83, .92), smoothstep(.14, .5, v) * .42);
      c += (h(vUv * uRes + fract(uTime) * 91.7) - .5) * .028;
      gl_FragColor = vec4(c, 1.); }`,
});
S.composer.addPass(S.grade);
await installFx(S);
await installPanel(S);
await installTour(S);
S.keys = { f: 0, b: 0, l: 0, r: 0, boost: 0 };
S.lap = { n: 0, t: 0, armed: true, cool: 0, best: null };
S.KEYMAP = { ArrowUp: 'f', KeyW: 'f', ArrowDown: 'b', KeyS: 'b', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ShiftLeft: 'boost', ShiftRight: 'boost' };
S.state = 'loading'; // loading → intro → drive
addEventListener('keydown', e => {
  if (S.list.classList.contains('on')) { if (e.code === 'Escape') S.hideList(); return; }
  if (S.state === 'intro') { if (!['Tab'].includes(e.code)) S.startDrive(); return; }
  if (S.state !== 'drive') return;
  const k = S.KEYMAP[e.code];
  if (k) { S.keys[k] = 1; e.preventDefault(); if (S.tour.on && k !== 'boost') S.haltTour('You have the wheel'); S.goal = null; }
  if (e.code === 'Space') { e.preventDefault(); S.hop(); }
  if (e.code === 'KeyR') S.resetRig(false);
  if (e.code === 'Escape') { S.hidePanel(); if (S.tour.on) S.haltTour('Tour stopped'); }
  if (e.code === 'KeyT') S.tour.on ? S.haltTour('Tour stopped') : S.runTour();
});
addEventListener('keyup', e => { const k = S.KEYMAP[e.code]; if (k) S.keys[k] = 0; });
addEventListener('blur', () => { for (const k in S.keys) S.keys[k] = 0; });

S.joy = { on: false, x: 0, y: 0, id: null };
{
  const el = S.$('joy'), nub = S.$('nub');
  const move = e => {
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, max = r.width * 0.36;
    let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy); if (d > max) { dx *= max / d; dy *= max / d; }
    S.joy.x = dx / max; S.joy.y = dy / max; nub.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  el.addEventListener('pointerdown', e => { if (S.state === 'intro') S.startDrive(); S.joy.on = true; S.joy.id = e.pointerId; el.setPointerCapture(e.pointerId); move(e); if (S.tour.on) S.haltTour('You have the wheel'); S.goal = null; });
  el.addEventListener('pointermove', e => { if (S.joy.on && e.pointerId === S.joy.id) move(e); });
  const end = () => { S.joy.on = false; S.joy.x = S.joy.y = 0; nub.style.transform = ''; };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  const hold = (id, on, off) => { const b = S.$(id); b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('on'); on(); }); const up = () => { b.classList.remove('on'); off && off(); }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up); };
  hold('tHop', () => S.hop());
  hold('tBoost', () => S.keys.boost = 1, () => S.keys.boost = 0);
}
S.$('btnJump').addEventListener('pointerdown', e => { e.preventDefault(); if (S.state === 'intro') S.startDrive(); S.hop(); });

S.ray = new THREE.Raycaster(), S.ndc = new THREE.Vector2();
S.downAt = null;
S.canvas.addEventListener('pointerdown', e => { S.downAt = [e.clientX, e.clientY]; });
S.canvas.addEventListener('pointerup', e => {
  if (!S.downAt || Math.hypot(e.clientX - S.downAt[0], e.clientY - S.downAt[1]) > 8) return;
  if (S.state === 'intro') { S.startDrive(); return; }
  if (S.state !== 'drive') return;
  S.ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  S.ray.setFromCamera(S.ndc, S.camera);
  const cardHits = S.ray.intersectObjects(S.projectCards.concat(S.socialSigns), true);
  if (cardHits.length) {
    let o = cardHits[0].object;
    while (o && o.userData.projectIndex == null && !o.userData.contact) o = o.parent;
    if (o && o.userData.projectIndex != null) { S.openProject(o.userData.projectIndex); return; }
    if (o && o.userData.contact) { S.showPanel(S.STANDS.find(s => s.id === 'contact'), 'click'); return; }
  }
  const hit = new THREE.Vector3();
  if (S.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) {
    for (const p of S.pads) {
      const st = p.stand.pos || p.stand.pad;
      if (hit.distanceTo(p.pos) < 4 || (st && Math.hypot(hit.x - st.x, hit.z - st.z) < 7)) { S.showPanel(p.stand, 'click'); S.seekTo(p.stand); return; }
    }
  }
});
S.camDist = null;
S.clock = new THREE.Clock();
S.camTarget = new THREE.Vector3(S.SPAWN.x, 0, S.SPAWN.z);
S.camDistTarget = 22, S.camDistNow = 13.5, S.camLook = new THREE.Vector3();
S.qSteer = new THREE.Quaternion(), S.yAxis = new THREE.Vector3(0, 1, 0);
S.tmp = new THREE.Vector3(), S.tmpQ = new THREE.Quaternion(), S.camLead = new THREE.Vector3();
S.updaters = [];
S.revealAnim = null;
function distToBase() { const a = innerWidth / innerHeight; return a < 0.8 ? 28.5 : a < 1.2 ? 22.5 : 19; }

function pastWall(x, z) {
  let best = 1e9, bx = 0, bz = 0;
  for (const p of S.SPEED_PTS) {
    const d = (x - p[0]) * (x - p[0]) + (z - p[1]) * (z - p[1]);
    if (d < best) { best = d; bx = p[0]; bz = p[1]; }
  }
  if (Math.hypot(x, z) < Math.hypot(bx, bz) - 4) return false;
  return Math.sqrt(best) > S.SPEED_HW + 2.5 || Math.hypot(x, z) > 72;
}

function makeFrame() {
  try {
  const dt = Math.min(S.clock.getDelta(), 1 / 30);
  const t = S.clock.elapsedTime;
  S.RU.uTime.value = t; S.grade.uniforms.uTime.value = t;

  if (S.revealAnim) {
    const k = S.clamp((performance.now() - S.revealAnim.t0) / S.revealAnim.dur, 0, 1);
    const e = S.revealAnim.ease(k);
    S.RU.uReveal.value = S.revealAnim.from + (S.revealAnim.to - S.revealAnim.from) * e;
    if (S.revealAnim.ring) S.RU.uRingOn.value = S.revealAnim.ring(k);
    if (k >= 1) { const cb = S.revealAnim.done; S.revealAnim = null; cb && cb(); }
  }

  const info = S.drive(dt);
  S.world.step(1 / 60, dt, 4);
  S.hopCool -= dt;
  if (S.blastCool > 0) S.blastCool -= dt;
  let anyFire = false, oldest = null;
  const nowMs = performance.now();
  for (const f of S.fires) if (f.m.visible) {
    if (nowMs - (f.born || 0) > 1600) { f.m.visible = false; continue; }
    f.t += dt; const k = f.t / f.life;
    if (k >= 1) { f.m.visible = false; continue; }
    if (!oldest || (f.born || 0) >= (oldest.born || 0)) {
      if (oldest) oldest.m.visible = false;
      oldest = f;
    } else f.m.visible = false;
    if (!f.m.visible) continue;
    anyFire = true;
    f.m.scale.setScalar(0.7 + k * 1.5);
    f.m.material.uniforms.uProgress.value = 0.06 + k * 0.9;
    S.fireLight.position.copy(f.m.position); S.fireLight.intensity = (1 - k) * 6;
    f.m.rotation.y += dt * 0.7;
  }
  if (!anyFire) S.fireLight.intensity = 0;
  for (const c of S.chunks) if (c.m.visible) {
    c.t += dt; const k = c.t / c.life; if (k >= 1) { c.m.visible = false; continue; }
    c.v.y -= 16 * dt; c.m.position.addScaledVector(c.v, dt);
    c.m.rotation.x += c.spin.x * dt; c.m.rotation.y += c.spin.y * dt;
    c.m.material.opacity = 1 - k;
  }

  if (S.state === 'drive') {
    const fast = Math.hypot(S.chassis.velocity.x, S.chassis.velocity.z) > 6;
    for (const b of S.bumps) {
      const near = Math.hypot(S.chassis.position.x - b.x, S.chassis.position.z - b.z) < b.rad;
      if (near && !b.hot && fast && !b.crest) S.chassis.velocity.y = Math.max(S.chassis.velocity.y, 8.2);
      b.hot = near;
    }
  }

  S.kart.position.copy(S.chassis.position); S.kart.quaternion.copy(S.chassis.quaternion);
  for (let i = 0; i < 4; i++) {
    S.vehicle.updateWheelTransform(i);
    const wi = S.vehicle.wheelInfos[i], wm = S.wheelMeshes[i];
    wm.position.copy(wi.worldTransform.position);
    wm.quaternion.copy(S.kart.quaternion);
    if (i < 2) wm.quaternion.multiply(S.qSteer.setFromAxisAngle(S.yAxis, wi.steering));
    let w = info.vF / (0.3 * S.KS);                                  // rolling speed, rad/s
    if (info.force > 0 && Math.abs(info.vF) < 7) w += Math.sign(info.throttle || 1) * (S.keys.boost ? 16 : 10) * (1 - Math.abs(info.vF) / 7); // wheelspin off the line
    if (info.drifting && i >= 2) w += Math.sign(info.vF || 1) * 14;
    S.wheelAngle[i] -= w * dt;
    wm.userData.spin.rotation.x = S.wheelAngle[i];
  }
  S.updateBoostTrails(dt, S.state === 'drive' && info.boosting && info.vF > 8);
  if (info.drifting && Math.random() < dt * 16) {
    const s = S.smokes[S.smokeI++ % S.smokes.length];
    const wheel = S.wheelMeshes[Math.random() < 0.5 ? 2 : 3];
    s.m.position.copy(wheel.position); s.m.position.y += 0.12;
    s.m.visible = true; s.t = 0; s.life = 0.55; s.m.scale.setScalar(1);
    s.v.set((Math.random() - 0.5) * 0.8, 1.1, (Math.random() - 0.5) * 0.8);
  }
  for (const s of S.smokes) if (s.m.visible) {
    s.t += dt; if (s.t >= s.life) { s.m.visible = false; continue; }
    s.m.position.addScaledVector(s.v, dt);
    s.m.material.opacity = 0.42 * (1 - s.t / s.life);
    s.m.scale.setScalar(1 + s.t * 2.2);
  }
  S.kartParts.wheel.rotation.z = -S.steerVal * 2.2;
  S.kartParts.head.rotation.y = S.damp(S.kartParts.head.rotation.y, S.steerVal * 0.9, 6, dt);
  S.kartParts.flag.rotation.y = Math.sin(t * 9) * 0.25 - Math.min(info.speed, 14) * 0.02;
  S.animateRig(dt, t, info);
  const lampOn = !!S.keys.boost;
  for (const streetLamp of S.kartParts.lamps || []) streetLamp.material.emissiveIntensity = lampOn ? 0.45 : 0.12;
  S.kartParts.strip.material.emissiveIntensity = lampOn ? 1.6 : 0.35;
  for (const h of S.kartParts.halos) h.material.opacity = S.damp(h.material.opacity, lampOn ? 0.05 : 0, 9, dt);
  for (const h of S.kartParts.brakeHalos) h.material.opacity = S.damp(h.material.opacity, (info.throttle < 0 || (S.keys.b && info.vF > 1)) ? 0.9 : (lampOn && info.vF > 8 ? 0.35 : 0.0), 12, dt);
  for (const g of S.kartParts.glow) g.material.emissiveIntensity = lampOn ? (info.boosting && info.vF > 8 ? 3.2 : 1.6) : 0.4;
  { const pool = S.kartParts.pool, want = lampOn && S.state === 'drive' ? 0.04 : 0;
    pool.material.opacity = S.damp(pool.material.opacity, want, 8, dt); pool.visible = pool.material.opacity > 0.01; }
  const hud = S.$('boostState'); if (hud) hud.textContent = info.mode || 'cruise';
  if (S.state === 'drive') {
    const start = S.speedSample(0.6781);
    const dS = Math.hypot(S.chassis.position.x - start[0], S.chassis.position.z - start[1]);
    if (dS < 2.6) {
      if (S.lap.armed && S.lap.cool <= 0 && S.lap.t > 2) {
        S.lap.armed = false; S.lap.cool = 4; S.lap.n++;
        const sec = S.lap.t;
        let sub = `${sec.toFixed(1)} s`;
        if (S.lap.best == null || sec < S.lap.best) { S.lap.best = sec; sub += ' · best'; }
        S.toast(`Lap ${S.lap.n}`, sub); S.tone(880, 0.12, 'square', 0.08);
        S.lap.t = 0;
      }
    } else if (dS > 6) S.lap.armed = true;
    if (S.lap.cool > 0) S.lap.cool -= dt;
    S.lap.t += dt;
  }
  const lapEl = S.$('lapTime');
  if (lapEl) { const s = S.lap.t, m = Math.floor(s / 60), r = s - m * 60; lapEl.textContent = `LAP ${m}:${r.toFixed(1).padStart(4, '0')}`; }
  if (lampOn && info.vF > 8) { S.boostHum -= dt; if (S.boostHum <= 0) { S.tone(68, 0.18, 'sawtooth', 0.035); S.boostHum = 0.42; } }
  const blinkOn = Math.sin(t * 7) > 0;
  if (S.kartParts.blinkL) S.kartParts.blinkL.material.emissiveIntensity = S.steerVal < -0.08 && blinkOn ? 2.4 : 0.12;
  if (S.kartParts.blinkR) S.kartParts.blinkR.material.emissiveIntensity = S.steerVal > 0.08 && blinkOn ? 2.4 : 0.12;
  const slowing = info.throttle < 0 || (S.keys.b && info.vF > 1);
  for (const tail of S.kartParts.brakes) tail.material.emissiveIntensity = slowing ? 2.6 : 0.28;
  S.RU.uKart.value.set(S.chassis.position.x, S.chassis.position.z);
  if (!S.projectsHint && S.state === 'drive') {
    for (const g of S.projectCards) if (S.chassis.position.distanceTo(g.position) < 9) { S.projectsHint = true; S.toast('Five builds', 'click a sign to read it'); break; }
  }

  S.chassis.quaternion.vmult(new CANNON.Vec3(0, 1, 0), S.upV);
  if (S.recover) {
    S.recover.t += dt;
    const k = Math.min(S.recover.t / 0.45, 1);
    const ease = k * k * (3 - 2 * k);
    const target = new CANNON.Quaternion();
    target.setFromEuler(0, S.recover.yaw, 0);
    S.recover.from.slerp(target, ease, S.chassis.quaternion);
    S.chassis.angularVelocity.set(0, 0, 0);
    if (k >= 1) S.recover = null;
  } else if (S.upV.y < 0.55 && S.state === 'drive' && S.chassis.position.y < 1.6 && S.chassis.velocity.y < 2.5) {
    S.flipT += dt;
    if (S.flipT > 0.8) {
      S.flipT = 0; S.recoverN++;
      if (S.recoverN > 2) { S.recoverN = 0; S.resetRig(true); }
      else {
        S.chassis.velocity.y = Math.max(S.chassis.velocity.y, 6);
        S.chassis.quaternion.vmult(new CANNON.Vec3(0, 0, -1), S.fwdV);
        const yaw = Math.atan2(-S.fwdV.x, -S.fwdV.z);
        const axis = new CANNON.Vec3();
        S.chassis.quaternion.vmult(S.upV.y < 0 ? new CANNON.Vec3(1, 0, 0) : new CANNON.Vec3(0, 0, -1), axis);
        S.chassis.angularVelocity.set(axis.x * 4, axis.y * 4, axis.z * 4);
        S.recover = { t: 0, from: S.chassis.quaternion.clone(), yaw };
      }
    }
  } else { S.flipT = 0; if (S.upV.y > 0.85) S.recoverN = 0; }
  if (pastWall(S.chassis.position.x, S.chassis.position.z) || S.chassis.position.y < -5) S.resetRig(true);

  const gnd = S.onGround();
  if (gnd === 0 && S.state === 'drive') S.airT += dt; else { if (S.airT > 0.55) S.toast('Big air', `${S.airT.toFixed(2)} s off the ground`); S.airT = 0; }

  if (S.state === 'drive' && gnd > 2 && info.speed > 2 && (info.force && info.speed < 9 || Math.abs(S.steerVal) > 0.35 && info.speed > 7) && Math.random() < 0.5) {
    const wi = S.vehicle.wheelInfos[2 + (Math.random() < 0.5 ? 0 : 1)]; S.emitPuff(new THREE.Vector3().copy(wi.worldTransform.position));
  }
  S.chassis.quaternion.vmult(new CANNON.Vec3(1, 0, 0), S.rightV);
  const lat = Math.abs(S.chassis.velocity.dot(S.rightV));
  const skid = S.state === 'drive' && gnd > 2 && (info.drifting || lat > 1.8 || (info.speed > 4 && Math.abs(info.vF) > 2 && info.throttle !== 0 && Math.sign(info.throttle) !== Math.sign(info.vF)));
  for (let w = 0; w < 2; w++) {
    if (skid) { const wp = S.vehicle.wheelInfos[2 + w].worldTransform.position; S.pushTrail(w, new THREE.Vector3(wp.x, 0, wp.z), t); if (Math.random() < 0.35) S.emitPuff(new THREE.Vector3(wp.x, 0, wp.z), 1.3); }
    else S.trail.last[w] = null;
  }
  for (const d of S.dust) if (d.m.visible) {
    d.t += dt; const k = d.t / d.life; if (k >= 1) { d.m.visible = false; continue; }
    d.m.position.addScaledVector(d.v, dt); d.m.scale.setScalar(0.4 + k * 1.6); d.m.material.opacity = (1 - k) * 0.85;
  }
  for (const s of S.scraps) if (s.m.visible) {
    s.t += dt; const k = s.t / s.life; if (k >= 1) { s.m.visible = false; continue; }
    s.v.y -= 18 * dt;
    s.m.position.addScaledVector(s.v, dt);
    s.m.rotation.x += s.spin.x * dt; s.m.rotation.y += s.spin.y * dt; s.m.rotation.z += s.spin.z * dt;
    s.m.material.opacity = 1 - k;
  }

  for (const p of S.props) {
    p.mesh.position.copy(p.body.position); p.mesh.quaternion.copy(p.body.quaternion);
    if (!p.down && S.state === 'drive') {
      p.body.quaternion.vmult(new CANNON.Vec3(0, 1, 0), S.upV);
      const moved = p.body.position.distanceTo(p.home);
      if (S.upV.y < 0.6 || moved > 0.9) {
        p.down = true; if (S.counts[p.tag] != null) S.counts[p.tag]++;
        if (!p.burst && S.BURST_TAGS.has(p.tag)) { S.burstAt(p.body.position); p.body.velocity.y += 4; }
        if (performance.now() - (S.boomAt || 0) > 1600) {
          if (p.tag === 'cone' && S.counts.cone === 1) S.toast('Cone down', 'the slalom is on the east road');
          if (p.tag === 'can' && S.counts.can >= 7 && !S.strikeDone) { S.strikeDone = true; S.toast('Strike', 'the paint cans had it coming'); }
          if (p.tag === 'crate' && S.counts.crate === 3) S.toast('Delivery refused', 'crates everywhere');
          if (p.tag === 'pot' && S.counts.pot === 1) S.toast('Sorry, ferns', 'they will grow back');
          if (p.tag === 'aframe' && !S.counts.af) { S.counts.af = 1; S.toast('Mind the signs', 'they are only cardboard'); }
          if (p.tag === 'oilBarrel' && !S.counts.br) { S.counts.br = 1; S.toast('Barrel roll', 'the skate slab is yours'); }
        }
      }
    }
  }

  for (const p of S.pads) {
    const d = Math.hypot(S.chassis.position.x - p.pos.x, S.chassis.position.z - p.pos.z);
    const inside = d < 2.6 && S.state === 'drive';
    if (inside && !p.inside) { S.stamp(p.stand); if (!S.goal || S.goal.stand === p.stand) S.showPanel(p.stand, 'pad'); }   // a pad crossed on the way to another stand stamps but does not take the sheet
    if (!inside && p.inside && S.openStand === p.stand && S.openVia === 'pad' && !S.tour.on) { /* closes once far away */ }
    p.inside = inside;
    if (S.openStand === p.stand && S.openVia === 'pad' && d > 8 && !S.tour.on) S.hidePanel();
    p.on = S.damp(p.on, inside ? 1 : 0, 6, dt);
    p.mesh.material.uniforms.uOn.value = p.on;
    p.pin.position.y = 2.4 + Math.sin(t * 2 + p.stand.angle) * 0.18 + p.on * 0.6;
    p.pin.rotation.y = t * 0.9 + p.stand.angle;
    p.pin.scale.setScalar(1 - p.on * 0.25);
  }

  if (S.tour.on && !S.goal && S.tour.wait > 0) { S.tour.wait -= dt; if (S.tour.wait <= 0) { S.tour.i++; if (S.tour.i % S.TOUR_ORDER.length === 0 && S.stamped.size >= S.STANDS.length) { S.haltTour(null); S.hidePanel(); S.toast('Tour done', 'the park is yours'); } else { S.hidePanel(); S.nextStop(); } } }

  if (S.petals) {
    const P = S.petals.userData.p;
    for (let i = 0; i < P.length; i++) {
      const q = P[i];
      q.y -= dt * 0.45 * q.sp; q.x += dt * (0.6 + Math.sin(t * 0.7 + i) * 0.4); q.z += dt * Math.cos(t * 0.5 + i) * 0.3; q.r += dt * q.sp * 1.5;
      if (q.y < 0.05) { q.y = S.R(6, 9); q.x = S.camTarget.x + S.R(-26, 22); q.z = S.camTarget.z + S.R(-24, 24); }
      if (q.x - S.camTarget.x > 28) q.x -= 54;
      S._m.compose(S._v.set(q.x, q.y, q.z), S._q.setFromEuler(S._e.set(q.r, q.r * 0.7, q.r * 0.3)), S._s.setScalar(q.s));
      S.petals.setMatrixAt(i, S._m);
    }
    S.petals.instanceMatrix.needsUpdate = true;
  }

  for (const u of S.updaters) u(dt, t, info);

  S.tmp.set(S.chassis.velocity.x, 0, S.chassis.velocity.z).multiplyScalar(0.48);
  if (S.tmp.length() > 7) S.tmp.setLength(7);
  S.camLead.x = S.damp(S.camLead.x, S.tmp.x, 1.8, dt); S.camLead.z = S.damp(S.camLead.z, S.tmp.z, 1.8, dt);
  const desired = new THREE.Vector3(S.chassis.position.x, 0, S.chassis.position.z).add(S.camLead);
  if (S.state !== 'drive') desired.set(S.SPAWN.x, 0, S.SPAWN.z);
  if (S.openVia === 'project' && S.focusPoint) desired.lerp(S.focusPoint, 0.62);
  else if (S.openStand && S.openVia !== 'list') {
    const sp = new THREE.Vector3(S.openStand.pos.x, 0, S.openStand.pos.z).addScaledVector(S.camUp, 2.2);
    desired.lerp(sp, 0.34);
  }
  if (S.openStand) {
    if (S.phone()) desired.addScaledVector(S.camUp, -innerHeight * 0.3 / innerHeight * S.camDistNow * 0.55);
    else desired.addScaledVector(S.camRight, S.camDistNow * 0.24);
  }
  S.camTarget.x = S.damp(S.camTarget.x, desired.x, 2.8, dt); S.camTarget.z = S.damp(S.camTarget.z, desired.z, 2.8, dt);
  const fovT = (S.phone() && innerWidth < innerHeight ? 44 : 34) + (S.keys.boost && info.speed > 11 ? 4 : 0);
  if (Math.abs(S.camera.fov - fovT) > 0.01) { S.camera.fov = S.damp(S.camera.fov, fovT, 3, dt); S.camera.updateProjectionMatrix(); }
  S.camDistNow = S.damp(S.camDistNow, S.state === 'drive' ? S.camDistTarget : (S.state === 'intro' ? (innerWidth < innerHeight ? 24 : 15) : 14), 1.6, dt);
  const cp = Math.cos(S.CAM_PITCH), spch = Math.sin(S.CAM_PITCH);
  S.camera.position.set(S.camTarget.x + Math.sin(S.CAM_YAW) * cp * S.camDistNow, spch * S.camDistNow, S.camTarget.z + Math.cos(S.CAM_YAW) * cp * S.camDistNow);
  S.camera.lookAt(S.camTarget.x, 0.4, S.camTarget.z);
  S.camKick = S.damp(S.camKick, 0, 5, dt);
  if (Math.abs(S.camKick) > 0.001) S.camera.rotateZ(S.camKick);
  S.sun.position.copy(S.camTarget).addScaledVector(S.SUN_DIR, 60); S.sun.target.position.copy(S.camTarget);
  S.scene.fog.near = S.camDistNow * 2.6; S.scene.fog.far = S.camDistNow * 8.5;

  if (S.state === 'intro') {
    const tagP = new THREE.Vector3(S.SPAWN.x + 2.1 * S.camRight.x, 0, S.SPAWN.z + 2.1 * S.camRight.z).project(S.camera);
    const el = S.$('start');
    const sx = (tagP.x * 0.5 + 0.5) * innerWidth, sy = (-tagP.y * 0.5 + 0.5) * innerHeight;
    const w = el.offsetWidth || 280, h = el.offsetHeight || 72, pad = 28;
    const x = Math.min(Math.max(sx + 8, pad), innerWidth - w - pad);
    const y = Math.min(Math.max(sy, h * 0.55 + pad), innerHeight - h * 0.55 - pad);
    if (S.phone()) el.style.transform = `translate(${Math.max(pad, (innerWidth - w) / 2)}px, ${innerHeight * 0.74}px)`;
    else el.style.transform = `translate(${x}px, ${y}px)`;
  }

  S.composer.render(dt);
  } catch (e) { window.__frameErr = (e && e.stack) || String(e); }
  requestAnimationFrame(makeFrame);
}

function introBrand() {
  const w1 = S.$('brand').querySelector('.w1'), w2 = S.$('brand').querySelector('.w2');
  const letters = (el, str, base) => { el.innerHTML = [...str].map((c, i) => `<span class="l blr" style="transition-delay:${base + i * 30}ms">${c}</span>`).join(''); };
  letters(w1, 'Aayan', 0); letters(w2, 'Desai', 160);
  requestAnimationFrame(() => requestAnimationFrame(() => S.$('brand').querySelectorAll('.blr').forEach(e => e.classList.add('in'))));
}
function showCurtain() {
  S.state = 'intro';
  S.resetRig(true);
  S.chassis.position.y += 1.4; // drop the kart onto its springs as the circle lights
  S.revealAnim = { from: 0, to: 10.5, dur: S.reduced ? 1 : 1500, t0: performance.now(), ease: S.expoOut, ring: () => 1, done: () => {
    S.$('start').classList.add('on');
  } };
  introBrand();
}
function startDrive() {
  if (S.state !== 'intro') return;
  S.state = 'drive';
  document.documentElement.classList.add('driving');
  S.setupAudio(); if (S.audio.ctx && S.audio.ctx.state === 'suspended') S.audio.ctx.resume();
  S.tone(523, 0.2, 'triangle', 0.1); S.tone(784, 0.35, 'triangle', 0.08, 0.1);
  S.$('start').classList.remove('on');
  S.camDistTarget = distToBase();
  S.revealAnim = { from: S.RU.uReveal.value, to: 80, dur: S.reduced ? 1 : 2700, t0: performance.now(), ease: k => 0.35 * k + 0.65 * Math.pow(k, 2.2), ring: k => { S.RU.uDim.value = 1 - S.clamp(k / 0.75, 0, 1); return 1 - S.clamp((k - 0.6) / 0.38, 0, 1); }, done: () => { S.RU.uReveal.value = 500; S.RU.uRingOn.value = 0; S.RU.uDim.value = 0; } };
  const seq = [['role', 250], ['nav', 450], ['hint', 700], ['stamps', 850]];
  for (const [id, ms] of seq) setTimeout(() => S.$(id).classList.add('in'), S.reduced ? 0 : ms);
  S.canvas.focus({ preventScroll: true });
}

S.prog = { v: 0, shown: 0, done: false };
S.t0 = performance.now();
function genericPiece(s) { const el = S.$('what'); if (el) el.textContent = s; }
(function tick() {
  const cap = S.prog.done ? 1 : Math.min(S.prog.v, 0.92);
  S.prog.shown = Math.min(cap, S.prog.shown + 0.018);
  const pct = Math.round(S.prog.shown * 100);
  S.$('pctn').textContent = pct;
  S.$('loader').style.setProperty('--p', pct + '%');
  if (S.prog.done && S.prog.shown >= 1 && performance.now() - S.t0 > 1500) {
    S.$('loader').classList.add('out'); window.__booted = true;
    setTimeout(showCurtain, S.reduced ? 0 : 350);
    return;
  }
  requestAnimationFrame(tick);
})();

async function boot() {
  try {
  window.__stage = 'fonts';
  genericPiece('setting the type');
  try {
    await Promise.race([Promise.all([
      document.fonts.load('800 100px Syne'), document.fonts.load('700 100px Syne'), document.fonts.load('400 20px "Space Mono"'), document.fonts.load('400 16px "General Sans"'),
    ]), new Promise(r => setTimeout(r, 4000))]);
  } catch (e) { }
  window.__stage = 'park';
  S.prog.v = 0.4; genericPiece('planting the garden');
  const images = { badges: {} };
  await new Promise(r => setTimeout(r, 16));
  S.constructRig();
  S.assemblePark(images);
  S.sowFlowers();
  S.hangBulbs();
  S.driftLeaves(S.phone() ? 320 : 650);
  if (!S.reduced) { S.scatterBirds(); S.releaseButterflies(); }
  S.seedTurf(S.phone() ? 5000 : 11000);
  if (!S.reduced) S.driftPetals(S.phone() ? 70 : 140);
  window.__stage = 'ground';
  S.prog.v = 0.55; genericPiece('painting the paths');
  await new Promise(r => setTimeout(r, 16));
  S.formTerrain(S.paintTerrain(S.phone() ? 2048 : 4096));
  S.prog.v = 0.68; genericPiece('Aayan Desai');
  try { await S.renderer.compileAsync(S.scene, S.camera); } catch (e) { }
  window.__stage = 'settle';
  S.prog.v = 0.9;
  for (let i = 0; i < 90; i++) { S.drive(1 / 60); S.world.step(1 / 60); }
  window.__stage = 'makeFrame';
  makeFrame();
  window.__stage = 'done';
  requestAnimationFrame(() => { S.prog.v = 1; S.prog.done = true; });
  } catch (e) { window.__bootErr = (window.__stage || '') + '\n' + ((e && e.stack) || String(e)); S.prog.done = true; }
}
setTimeout(() => { if (!S.prog.done) { S.prog.done = true; } }, 15000);
boot();

addEventListener('resize', () => {
  const w = innerWidth, h = innerHeight;
  S.renderer.setSize(w, h); S.composer.setSize(w, h);
  S.camera.aspect = w / h; S.camera.fov = w / h < 0.8 ? 44 : 34; S.camera.updateProjectionMatrix();
  if (S.state === 'drive') S.camDistTarget = distToBase();
  S.tiltH.uniforms.uDir.value.set(1 / (w * S.DPR), 0); S.tiltV.uniforms.uDir.value.set(0, 1 / (h * S.DPR));
  S.grade.uniforms.uRes.value.set(w * S.DPR, h * S.DPR);
});
dispatchEvent(new Event('resize'));

window.__kp = { revealProbe(k) { // capture hook: pose the intro→world reveal at progress k (0..1)
    if (S.state === 'intro') startDrive(); S.revealAnim = null;
    const e = 0.35 * k + 0.65 * Math.pow(k, 2.2); S.RU.uReveal.value = 4.6 + (80 - 4.6) * e;
    S.RU.uDim.value = 1 - S.clamp(k / 0.75, 0, 1); S.RU.uRingOn.value = 1 - S.clamp((k - 0.6) / 0.38, 0, 1); }, renderer: S.renderer, pitch(d) { S.CAM_PITCH = d * S.DEG; }, get cam() { return [S.camDistTarget, S.camDistNow]; }, dist(d) { S.camDistTarget = d; }, teleport(x, z, yaw = 0) { S.chassis.position.set(x, 0.6, z); S.chassis.velocity.setZero(); S.chassis.angularVelocity.setZero(); S.chassis.quaternion.setFromEuler(0, yaw, 0); S.camTarget.set(x, 0, z); }, STANDS: S.STANDS, chassis: S.chassis, vehicle: S.vehicle, showPanel: S.showPanel, hidePanel: S.hidePanel, runTour: S.runTour, startDrive, get state() { return S.state; }, keys: S.keys, resetRig: S.resetRig, camera: S.camera, RU: S.RU, toast: S.toast, seekTo: S.seekTo, stamped: S.stamped };
S.distToBase = distToBase;
S.makeFrame = makeFrame;
S.introBrand = introBrand;
S.showCurtain = showCurtain;
S.startDrive = startDrive;
S.genericPiece = genericPiece;
S.boot = boot;


import * as THREE from 'three';
import * as CANNON from 'cannon-es';
export async function installLayout(S) {
S.RING_R = 22, S.RING_W = 5, S.PLAZA_R = 10, S.STAND_R = 29.2, S.SPAWN = new THREE.Vector3(0, 0, 0);
// master map, 1 m = 10 px. SVG y-down becomes world +z.
S.RING = { cx: 0, cz: -5, rx: 34.5, ry: 17.5, hw: 2.8 };
S.HUB_R = 8.4;
S.SKATE = { x0: -16, x1: 16, z0: 19.5, z1: 32 };
S.CONTACT = { x: 42, z: 20.5, r: 7.6 };
S.SPEED_HW = 5.75;
S.SPOKE_HW = 2.6;
function mapPt(deg) {
  const t = deg * S.DEG;
  return [S.RING.rx * Math.cos(t), S.RING.cz - S.RING.ry * Math.sin(t)];
}
function mapDeg(x, z) { return Math.atan2(-(z - S.RING.cz) / S.RING.ry, x / S.RING.rx) / S.DEG; }
function segDist(x, z, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
  const u = S.clamp(((x - ax) * dx + (z - az) * dz) / l2, 0, 1);
  return Math.hypot(x - (ax + u * dx), z - (az + u * dz));
}
S.SPEED_PTS = (() => {
  const pts = [];
  const corner = (cx, cz, a0, a1) => { for (let a = a0; a <= a1 + 0.001; a += 0.12) pts.push([cx + 20 * Math.cos(a), cz + 20 * Math.sin(a)]); };
  for (let x = -38; x <= 38; x += 2) pts.push([x, -39]);
  corner(38, -19, -Math.PI / 2, 0);
  for (let z = -19; z <= 19; z += 2) pts.push([58, z]);
  corner(38, 19, 0, Math.PI / 2);
  for (let x = 38; x >= -38; x -= 2) pts.push([x, 39]);
  corner(-38, 19, Math.PI / 2, Math.PI);
  for (let z = 19; z >= -19; z -= 2) pts.push([-58, z]);
  corner(-38, -19, Math.PI, Math.PI * 1.5);
  return pts;
})();
S.BOOST_FRAC = [0.012, 0.1725, 0.3235, 0.5368, 0.8263];
function speedSample(frac) {
  return S.SPEED_PTS[Math.min(S.SPEED_PTS.length - 1, Math.round(frac * (S.SPEED_PTS.length - 1)))];
}
S.BOOST_PTS = S.BOOST_FRAC.map(speedSample);
S.SPOKES = [
  [0, 0, 0, -39],
  [0, 0, 0, 19.5],
  [0, 0, -34.5, -5],
  [0, 0, 34.5, -5],
  [30, 4.6, 42, 22.7],
  [-31, 1.5, -42.3, 34.7],
];
function onSpeed(x, z, pad = 0) {
  let best = 99;
  for (let i = 0; i < S.SPEED_PTS.length; i++) {
    const a = S.SPEED_PTS[i], b = S.SPEED_PTS[(i + 1) % S.SPEED_PTS.length];
    best = Math.min(best, segDist(x, z, a[0], a[1], b[0], b[1]));
    if (best < S.SPEED_HW + pad) return true;
  }
  return false;
}
function onRing(x, z, pad = 0) {
  const ux = x / S.RING.rx, uz = (z - S.RING.cz) / S.RING.ry, len = Math.hypot(ux, uz) || 1;
  const px = S.RING.rx * ux / len, pz = S.RING.cz + S.RING.ry * uz / len;
  return Math.hypot(x - px, z - pz) < S.RING.hw + pad;
}
function onPaved(x, z, pad = 0) {
  if (Math.hypot(x, z) < S.HUB_R + pad) return true;
  if (onRing(x, z, pad)) return true;
  if (onSpeed(x, z, pad)) return true;
  for (const [ax, az, bx, bz] of S.SPOKES) if (segDist(x, z, ax, az, bx, bz) < S.SPOKE_HW + pad) return true;
  if (x > S.SKATE.x0 - pad && x < S.SKATE.x1 + pad && z > S.SKATE.z0 - pad && z < S.SKATE.z1 + pad) return true;
  if (Math.hypot(x - S.CONTACT.x, z - S.CONTACT.z) < S.CONTACT.r + pad) return true;
  return false;
}
S.STAND_DEG = { about: 185, education: 147, skills: 109, patchifi: 71, appify: 33, projects: -5 };
function placeStands() {
  for (const s of S.STANDS) {
    if (s.id === 'contact') {
      s.pos = { x: S.CONTACT.x, z: S.CONTACT.z + 2.2 };
      s.pad = { x: 36, z: 12 };
      s.nx = 0.72; s.nz = 0.69;
      s.yaw = Math.atan2(-s.nx, -s.nz);
      s.ringDeg = -28;
      continue;
    }
    const deg = S.STAND_DEG[s.id];
    if (deg == null) continue;
    const t = deg * S.DEG;
    const px = S.RING.rx * Math.cos(t), pz = S.RING.cz - S.RING.ry * Math.sin(t);
    let nx = Math.cos(t) / S.RING.rx, nz = -Math.sin(t) / S.RING.ry;
    const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
    const off = s.id === 'skills' || s.id === 'patchifi' ? 7.6 : 8.8;
    s.pad = { x: px, z: pz };
    s.pos = { x: px + nx * off, z: pz + nz * off };
    s.nx = nx; s.nz = nz;
    s.yaw = Math.atan2(-nx, -nz);
    s.ringDeg = deg > 180 ? deg - 360 : deg;
  }
}
placeStands();
function standPose(s, out = 0) {
  if (s.pos) return { p: new THREE.Vector3(s.pos.x + (s.nx || 0) * out, 0, s.pos.z + (s.nz || 0) * out), rotY: s.yaw };
  const p = S.polar(s.angle, S.STAND_R + out);
  return { p, rotY: s.kind === 'contact' ? S.faceY(p, 3) : S.faceY(p) };
}
S.BEDS = [[-15, -11.5], [15, -11.5]].map(([x, z]) => ({ c: new THREE.Vector3(x, 0, z), rx: 6.4, rz: 3.6, a: 0 }));
S.occ = [];       // [x, z, r] footprints of set dressing, kept clear of trees and grass
S.treePos = [];
S.lampPos = [];
function blocked(x, z, pad = 0) {
  if (onPaved(x, z, pad)) return true;
  if (typeof S.onSlope === 'function' && S.onSlope(x, z)) return true;
  for (const o of S.occ) if (Math.hypot(x - o[0], z - o[1]) < o[2] + pad * 0.5) return true;
  for (const s of S.STANDS) {
    const p = s.pos || S.polar(s.angle, S.STAND_R);
    if (Math.hypot(x - p.x, z - p.z) < 7 + pad) return true;
    if (s.pad && Math.hypot(x - s.pad.x, z - s.pad.z) < 4.2 + pad) return true;
  }
  for (const b of S.BEDS) { const dx = (x - b.c.x) / (b.rx + pad), dz = (z - b.c.z) / (b.rz + pad); if (dx * dx + dz * dz < 1.3) return true; }
  return false;
}
S.mapPt = mapPt;
S.mapDeg = mapDeg;
S.segDist = segDist;
S.speedSample = speedSample;
S.onSpeed = onSpeed;
S.onRing = onRing;
S.onPaved = onPaved;
S.placeStands = placeStands;
S.standPose = standPose;
S.blocked = blocked;

}

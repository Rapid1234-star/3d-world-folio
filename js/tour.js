import * as THREE from 'three';
import * as CANNON from 'cannon-es';
export async function installTour(S) {
S.goal = null; // { pts: [[x,z]...], i, stand, onArrive }
S.tour = { on: false, i: 0, wait: 0 };
S.TOUR_ORDER = ['about', 'education', 'skills', 'patchifi', 'appify', 'projects', 'contact'].map(id => S.STANDS.find(s => s.id === id));
function angleOf(x, z) { return Math.atan2(x, -z) / S.DEG; }
function pathTo(s) {
  const pts = [];
  const px = S.chassis.position.x, pz = S.chassis.position.z;
  if (Math.hypot(px, pz) > 4) pts.push([0, 0]);
  const a0 = S.mapDeg(px, pz);
  const a1 = s.ringDeg != null ? s.ringDeg : S.mapDeg(s.pad.x, s.pad.z);
  let da = ((a1 - a0 + 540) % 360) - 180;
  const steps = Math.max(2, Math.ceil(Math.abs(da) / 14));
  for (let i = 1; i <= steps; i++) pts.push(S.mapPt(a0 + da * i / steps));
  if (s.pad) pts.push([s.pad.x, s.pad.z]);
  return pts;
}
function seekTo(s, onArrive) { S.goal = { pts: pathTo(s), i: 0, stand: s, onArrive, stuck: 0, back: 0 }; }
function runTour() {
  if (S.state === 'intro') S.startDrive();
  S.hidePanel();
  S.tour.on = true;
  const hx = S.chassis.position.x, hz = S.chassis.position.z;
  S.tour.i = S.TOUR_ORDER.reduce((b, s, i) => {
    const p = s.pad || s.pos;
    const q = S.TOUR_ORDER[b].pad || S.TOUR_ORDER[b].pos;
    return Math.hypot(p.x - hx, p.z - hz) < Math.hypot(q.x - hx, q.z - hz) ? i : b;
  }, 0);
  S.$('btnTour').querySelector('.lbl').textContent = 'Stop tour';
  S.toast('Auto-tour', 'press any arrow to take the wheel');
  nextStop();
}
function nextStop() {
  const s = S.TOUR_ORDER[S.tour.i % S.TOUR_ORDER.length];
  seekTo(s, () => {
    S.tour.wait = 6.5;
    const bar = S.$('pBar'); bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)';
    requestAnimationFrame(() => { bar.style.transition = 'transform 6.5s linear'; bar.style.transform = 'scaleX(1)'; });
  });
}
function haltTour(msg) {
  S.tour.on = false; S.goal = null; S.tour.wait = 0;
  S.$('btnTour').querySelector('.lbl').textContent = 'Auto-tour';
  S.$('pBar').style.transition = 'none'; S.$('pBar').style.transform = 'scaleX(0)';
  if (msg) S.toast(msg, 'arrows or WASD to drive');
}
S.angleOf = angleOf;
S.pathTo = pathTo;
S.seekTo = seekTo;
S.runTour = runTour;
S.nextStop = nextStop;
S.haltTour = haltTour;

}

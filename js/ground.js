import * as THREE from 'three';
import * as CANNON from 'cannon-es';
export async function installGround(S) {
S.GW = 160;
S.LAWN_SECTIONS = [
  { a0: -126, a1: -90, color: '#cdb8f0' },
  { a0: -90, a1: -54, color: '#ffe08f' },
  { a0: -54, a1: -18, color: '#a9d4f2' },
  { a0: -18, a1: 54, color: '#ffc4a3' },
  { a0: 54, a1: 90, color: '#a9dcb6' },
  { a0: 90, a1: 126, color: '#f6b3c7' },
];
function paintTerrain(res) {
  const c = document.createElement('canvas'); c.width = c.height = res;
  const x = c.getContext('2d');
  const s = res / S.GW;
  x.setTransform(s, 0, 0, s, res / 2, res / 2);
  const lawn = '#bfe3bf';
  x.fillStyle = lawn; x.fillRect(-80, -80, 160, 160);
  const r2 = S.rngFromSeed(99);
  x.filter = `blur(${Math.round(res / 340)}px)`;
  for (let i = 0; i < 700; i++) {
    const px = -58 + r2() * 116, pz = -58 + r2() * 116;
    const ang = Math.atan2(px, -pz) / S.DEG;
    if (ang > -126 && ang < 126) continue;
    x.globalAlpha = 0.28; x.fillStyle = ['#cbe9c5', '#b1dab4', '#c6e6bd', '#acd6b2'][i % 4];
    x.beginPath(); x.arc(px, pz, 0.8 + r2() * 3.4, 0, 6.29); x.fill();
  }
  x.filter = 'none'; x.globalAlpha = 1;
  const sectorOf = (px, pz) => {
    const ang = S.mapDeg(px, pz);
    const ell = Math.hypot(px / S.RING.rx, (pz - S.RING.cz) / S.RING.ry);
    if (ell < 1.05) return null;
    if (px > 28 && pz > 7) return '#f6b3c7';
    if (Math.abs(ang) > 166) return '#cdb8f0';
    if (ang > 128) return '#ffe08f';
    if (ang > 90) return '#a9d4f2';
    if (ang > 14) return '#ffc4a3';
    if (ang > -35) return '#a9dcb6';
    return null;
  };
  for (let iz = -72; iz <= 52; iz += 0.55) for (let ix = -68; ix <= 68; ix += 0.55) {
    const col = sectorOf(ix, iz); if (!col) continue;
    x.fillStyle = col; x.fillRect(ix, iz, 0.6, 0.6);
  }
  for (const s of S.STANDS) {
    const p = s.pos; if (!p) continue;
    x.fillStyle = s.color; x.beginPath(); x.arc(p.x, p.z, 7.2, 0, 6.29); x.fill();
  }
  x.save(); x.beginPath(); x.ellipse(0, S.RING.cz, S.RING.rx * 0.82, S.RING.ry * 0.82, 0, 0, 6.29); x.clip();
  x.rotate(-S.CAM_YAW); x.globalAlpha = 0.07; x.fillStyle = '#ffffff';
  for (let i = -30; i < 30; i += 2) x.fillRect(i * 1.6, -30, 1.6, 60);
  x.restore(); x.globalAlpha = 1;
  for (const b of S.BEDS) {
    x.save(); x.translate(b.c.x, b.c.z); x.rotate(Math.atan2(b.c.z, b.c.x) + Math.PI / 2);
    x.fillStyle = '#f2d2c0'; x.beginPath(); x.ellipse(0, 0, b.rx + 0.35, b.rz + 0.35, 0, 0, 6.29); x.fill();
    x.fillStyle = '#ebc4ae'; x.beginPath(); x.ellipse(0, 0, b.rx, b.rz, 0, 0, 6.29); x.fill(); x.restore();
  }
  const pave = '#e7deea', curb = '#cbbccf', tarmac = '#2c203b';
  const fillBand = (pts, half, color, closed) => {
    const n = pts.length; if (n < 2) return;
    const left = [], right = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], c = pts[Math.min(n - 1, i + 1)];
      const prev = closed && i === 0 ? pts[n - 1] : a;
      const next = closed && i === n - 1 ? pts[0] : c;
      let dx = next[0] - prev[0], dz = next[1] - prev[1];
      const len = Math.hypot(dx, dz) || 1; dx /= len; dz /= len;
      left.push([pts[i][0] - dz * half, pts[i][1] + dx * half]);
      right.push([pts[i][0] + dz * half, pts[i][1] - dx * half]);
    }
    x.fillStyle = color; x.beginPath();
    left.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]));
    for (let i = right.length - 1; i >= 0; i--) x.lineTo(right[i][0], right[i][1]);
    x.closePath(); x.fill();
  };

  const segHitsSpeed = (ax, az, bx, bz) => {
    const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
    if (L < 1e-4) return null;
    const ux = dx / L, uz = dz / L;
    const STEP = 0.05, MARGIN = 0.32, HALF = 3.3;
    const sx = -uz * HALF, sz = ux * HALF;
    const clear = (px, pz) => !(
      S.onSpeed(px, pz, MARGIN) ||
      S.onSpeed(px + sx, pz + sz, MARGIN) ||
      S.onSpeed(px - sx, pz - sz, MARGIN)
    );
    let last = null;
    for (let d = 0; d <= L + 1e-6; d += STEP) {
      const px = ax + ux * d, pz = az + uz * d;
      if (!clear(px, pz)) {
        if (last !== null) break;
      } else {
        last = d;
      }
    }
    if (last === null || last >= L - 0.05) return null;
    return { x: ax + ux * last, z: az + uz * last, ux, uz };
  };

  const fillSpoke = (ax, az, bx, bz, half, color) => {
    const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
    if (L < 1e-4) return;
    const ux = dx / L, uz = dz / L, sx = -uz, sz = ux;
    const endAt = (t) => {
      let last = null;
      for (let d = 0; d <= L + 1e-6; d += 0.05) {
        if (S.onSpeed(ax + ux * d + sx * t, az + uz * d + sz * t, 0.32)) {
          if (last !== null) break;
        } else {
          last = d;
        }
      }
      const d = last === null ? L : last;
      return [ax + ux * d + sx * t, az + uz * d + sz * t];
    };
    x.fillStyle = color; x.beginPath();
    x.moveTo(ax + sx * half, az + sz * half);
    x.lineTo(ax - sx * half, az - sz * half);
    for (let i = 0; i <= 8; i++) {
      const p = endAt(-half + (2 * half * i) / 8);
      x.lineTo(p[0], p[1]);
    }
    x.closePath(); x.fill();
  };

  const HW = S.SPEED_HW;
  fillBand(S.SPEED_PTS, HW + 0.32, '#ff5b3a', true);
  const edgeLine = (half, color, width, dash) => {
    x.save(); x.strokeStyle = color; x.lineWidth = width; x.lineJoin = 'round'; x.lineCap = 'round';
    if (dash) x.setLineDash(dash);
    for (const sign of [-1, 1]) {
      x.beginPath();
      S.SPEED_PTS.forEach((p, i) => {
        const n = S.SPEED_PTS[(i + 1) % S.SPEED_PTS.length];
        const prev = S.SPEED_PTS[(i - 1 + S.SPEED_PTS.length) % S.SPEED_PTS.length];
        let dx = n[0] - prev[0], dz = n[1] - prev[1];
        const len = Math.hypot(dx, dz) || 1; dx /= len; dz /= len;
        const ox = p[0] + -dz * half * sign, oz = p[1] + dx * half * sign;
        i ? x.lineTo(ox, oz) : x.moveTo(ox, oz);
      });
      x.closePath(); x.stroke();
    }
    x.restore();
  };
  edgeLine(HW + 0.22, '#ffffff', 0.16, [0.7, 0.7]);
  fillBand(S.SPEED_PTS, HW, tarmac, true);
  fillBand(S.SPEED_PTS, HW - 0.5, '#38294c', true);
  x.save(); x.strokeStyle = '#ffd27a'; x.lineWidth = 0.28; x.setLineDash([2.2, 1.6]);
  x.beginPath(); S.SPEED_PTS.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.stroke(); x.restore();
  const segLen = S.SPEED_PTS.map((p, i) => { const n = S.SPEED_PTS[(i + 1) % S.SPEED_PTS.length]; return Math.hypot(n[0] - p[0], n[1] - p[1]); });
  const trackLen = segLen.reduce((a, b) => a + b, 0);
  const atDist = (d) => {
    let left = ((d % trackLen) + trackLen) % trackLen;
    for (let i = 0; i < S.SPEED_PTS.length; i++) {
      if (left <= segLen[i] || i === S.SPEED_PTS.length - 1) {
        const u = segLen[i] ? Math.min(1, left / segLen[i]) : 0;
        const p = S.SPEED_PTS[i], n = S.SPEED_PTS[(i + 1) % S.SPEED_PTS.length];
        let dx = n[0] - p[0], dz = n[1] - p[1];
        const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
        return { x: p[0] + dx * segLen[i] * u, z: p[1] + dz * segLen[i] * u, dx, dz };
      }
      left -= segLen[i];
    }
  };
  const startPt = S.speedSample(0.6781);
  const nearMark = (px, pz) => Math.hypot(px - startPt[0], pz - startPt[1]) < 4.2 || S.BOOST_PTS.some(p => Math.hypot(px - p[0], pz - p[1]) < 5.5);
  x.save(); x.strokeStyle = '#ffd27a'; x.lineWidth = 0.22; x.globalAlpha = 0.5; x.lineCap = 'round'; x.lineJoin = 'round';
  for (let d = 6.4; d < trackLen - 6.4; d += 6.4) {
    const q = atDist(d);
    for (const off of [-3.15, 3.15]) {
      const gx = q.x + -q.dz * off, gz = q.z + q.dx * off;
      if (nearMark(gx, gz)) continue;
      x.save(); x.translate(gx, gz); x.rotate(Math.atan2(q.dz, q.dx));
      x.beginPath(); x.moveTo(-0.55, -0.85); x.lineTo(0.4, 0); x.lineTo(-0.55, 0.85); x.stroke();
      x.restore();
    }
  }
  x.restore();
  const ringPts = [];
  for (let a = 0; a < 360; a += 4) ringPts.push(S.mapPt(a));
  fillBand(ringPts, 3.3, curb, true);
  const spokeSegs = [];
  for (const [sax, saz, bx0, bz0] of S.SPOKES) {
    const [ax, az] = Math.hypot(sax, saz) > S.HUB_R ? S.mapPt(S.mapDeg(sax, saz)) : [sax, saz];
    const hit = segHitsSpeed(ax, az, bx0, bz0);
    spokeSegs.push([ax, az, bx0, bz0, hit]);
    if (hit) fillSpoke(ax, az, bx0, bz0, 3.3, curb);
    else fillBand([[ax, az], [bx0, bz0]], 3.3, curb, false);
  }
  fillBand(ringPts, 2.8, pave, true);
  for (const [ax, az, bx0, bz0, hit] of spokeSegs) {
    if (hit) fillSpoke(ax, az, bx0, bz0, 2.8, pave);
    else fillBand([[ax, az], [bx0, bz0]], 2.8, pave, false);
  }
  x.fillStyle = curb; x.beginPath(); x.arc(0, 0, S.HUB_R + 0.5, 0, 6.29); x.fill();
  x.fillStyle = pave; x.beginPath(); x.arc(0, 0, S.HUB_R, 0, 6.29); x.fill();
  x.fillStyle = '#fbfaf5'; x.beginPath(); x.arc(0, 0, S.HUB_R - 1.8, 0, 6.29); x.fill();
  x.strokeStyle = 'rgba(190,165,180,.5)'; x.lineWidth = 0.08;
  for (const r of [2.4, 4.6, 6.6]) { x.beginPath(); x.arc(0, 0, r, 0, 6.29); x.stroke(); }
  x.fillStyle = '#e3d8ef'; x.beginPath(); x.roundRect(S.SKATE.x0, S.SKATE.z0, S.SKATE.x1 - S.SKATE.x0, S.SKATE.z1 - S.SKATE.z0, 2.4); x.fill();
  x.fillStyle = pave; x.beginPath(); x.arc(S.CONTACT.x, S.CONTACT.z, S.CONTACT.r, 0, 6.29); x.fill();
  for (const s of S.STANDS) if (s.pad) {
    x.fillStyle = s.color; x.globalAlpha = 0.45;
    x.beginPath(); x.arc(s.pad.x, s.pad.z, 2.6, 0, 6.29); x.fill();
    x.globalAlpha = 1;
  }
  const laneYaw = (p) => {
    let best = 0, bd = 1e9;
    S.SPEED_PTS.forEach((q, i) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < bd) { bd = d; best = i; } });
    const n = S.SPEED_PTS[(best + 1) % S.SPEED_PTS.length];
    const prev = S.SPEED_PTS[(best - 1 + S.SPEED_PTS.length) % S.SPEED_PTS.length];
    return Math.atan2(n[1] - prev[1], n[0] - prev[0]);
  };
  for (const p of S.BOOST_PTS) {
    x.save(); x.translate(p[0], p[1]); x.rotate(laneYaw(p));
    x.fillStyle = '#ff5b3a'; x.strokeStyle = '#2a1d38'; x.lineWidth = 0.14;
    x.beginPath(); x.roundRect(-3.2, -2.5, 6.4, 5.0, 0.7); x.fill(); x.stroke();
    x.strokeStyle = '#fff'; x.lineWidth = 0.32; x.lineCap = 'round'; x.lineJoin = 'round';
    for (const k of [-1.45, 0, 1.45]) {
      x.beginPath(); x.moveTo(k - 0.5, -1.05); x.lineTo(k + 0.35, 0); x.lineTo(k - 0.5, 1.05); x.stroke();
    }
    x.restore();
  }
  {
    const sf = startPt;
    x.save(); x.translate(sf[0], sf[1]); x.rotate(laneYaw(sf));
    x.save(); x.beginPath(); x.rect(-1.4, -HW, 2.8, HW * 2); x.clip();
    x.fillStyle = '#fff'; x.fillRect(-1.4, -HW, 2.8, HW * 2);
    x.fillStyle = '#1c1326';
    const cell = 0.7;
    for (let i = -3; i <= 4; i++) for (let j = -10; j <= 10; j++) {
      if (((i + j) & 1) === 0) x.fillRect(i * cell, j * cell, cell + 0.02, cell + 0.02);
    }
    x.restore();
    x.fillStyle = '#ff5b3a';
    x.beginPath(); x.roundRect(-1.4, -HW - 0.12, 2.8, 0.38, 0.1); x.fill();
    x.beginPath(); x.roundRect(-1.4, HW - 0.26, 2.8, 0.38, 0.1); x.fill();
    x.restore();
  }
  x.save(); x.strokeStyle = 'rgba(42,29,56,.18)'; x.lineWidth = 0.08; x.setLineDash([0.4, 0.3]);
  x.beginPath(); x.arc(S.SPAWN.x, S.SPAWN.z, 3.3, 0, 6.29); x.stroke(); x.restore();
  const r3 = S.rngFromSeed(5);
  for (let i = 0; i < 9000; i++) {
    const px = -50 + r3() * 100, pz = -50 + r3() * 100;
    if (!S.onPaved(px, pz, -0.3)) continue;
    x.fillStyle = r3() < 0.5 ? 'rgba(200,180,195,.35)' : 'rgba(255,255,255,.6)';
    x.fillRect(px, pz, 0.06, 0.06);
  }
  const word = (str, px, pz, size, color, font = '800', ls = -0.04) => {
    x.save(); x.translate(px, pz); x.rotate(-S.CAM_YAW);
    x.font = `${font} ${size * 10}px ${font === '400' ? '"Space Mono"' : 'Syne'}`; x.scale(0.1, 0.1);
    x.letterSpacing = `${ls * size * 10}px`;
    x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(str, 0, 0); x.restore();
  };
  word('AAYAN', 0, -4.2, 1.5, 'rgba(42,29,56,.9)');
  word('DESAI', 0, -2.6, 1.5, 'rgba(42,29,56,.5)');
  word('QA AUTOMATION · DRIVE IN', 0, -1.2, 0.36, 'rgba(42,29,56,.6)', '400', 0.18);
  for (const s of S.STANDS) {
    const p = s.pad || S.polar(s.angle, S.RING_R);
    word((s.short || s.title).toUpperCase(), p.x, p.z, 0.55, 'rgba(42,29,56,.7)', '700', -0.02);
    const t = (s.ringDeg || 0) * S.DEG;
    const tx = -Math.sin(t), tz = -Math.cos(t);
    word('P', p.x + tx * 2.1, p.z + tz * 2.1, 0.62, 'rgba(42,29,56,.55)', '700', 0);
    word('P', p.x - tx * 2.1, p.z - tz * 2.1, 0.62, 'rgba(42,29,56,.55)', '700', 0);
  }
  word('SKATE', 0, 26, 1.4, 'rgba(42,29,56,.2)');
  x.save(); x.fillStyle = 'rgba(255,91,58,.85)';
  for (const [px, pz] of [[-6, 30.6], [5.5, 28.95]]) { x.beginPath(); x.moveTo(px - 0.6, pz - 0.5); x.lineTo(px + 0.6, pz - 0.5); x.lineTo(px, pz + 0.4); x.fill(); }
  x.restore();
  for (const [px, pz, r, a] of S.aoSpots) {
    const g = x.createRadialGradient(px, pz, 0, px, pz, r);
    g.addColorStop(0, `rgba(96,70,110,${a})`); g.addColorStop(0.55, `rgba(96,70,110,${a * 0.45})`); g.addColorStop(1, 'rgba(96,70,110,0)');
    x.fillStyle = g; x.beginPath(); x.arc(px, pz, r, 0, 6.29); x.fill();
  }
  x.globalCompositeOperation = 'destination-in';
  const fade = x.createRadialGradient(0, 0, 62, 0, 0, 78);
  fade.addColorStop(0, 'rgba(0,0,0,1)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = fade; x.fillRect(-80, -80, 160, 160);
  x.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = S.renderer.capabilities.getMaxAnisotropy(); t.generateMipmaps = true;
  return t;
}

function formTerrain(groundTex) {
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
  S.patch(m, {
    key: 'ground', noClip: true, noGlow: true,
    uniforms: { uGround: { value: groundTex }, uPaper: { value: S.PAPER }, uDots: { value: S.DOTS }, uDusk: { value: S.DUSK } },
    fragHead: `uniform sampler2D uGround; uniform vec3 uPaper; uniform vec3 uDots; uniform vec3 uDusk; uniform float uDim; float kpLawn;`,
    frag: f => f
      .replace('#include <map_fragment>', `
        vec2 cuv = vec2((vKpW.x + 80.0) / 160.0, 1.0 - (vKpW.z + 80.0) / 160.0);
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
  g.rotation.x = -Math.PI / 2; g.receiveShadow = true; S.scene.add(g);
}

function seedTurf(n) {
  const blade = [];
  for (let b = 0; b < 3; b++) {
    const a = b / 3 * Math.PI + S.R(0, 0.5), h = S.R(0.32, 0.5), w = 0.07, ox = S.R(-0.08, 0.08), oz = S.R(-0.08, 0.08), lean = S.R(-0.08, 0.08);
    const ca = Math.cos(a), sa = Math.sin(a);
    blade.push(ox - ca * w, 0, oz - sa * w, ox + ca * w, 0, oz + sa * w, ox + lean, h, oz + lean);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(blade, 3));
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, fog: true,
    uniforms: { ...S.RU, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uBase: { value: new THREE.Color('#86c495') }, uTip: { value: new THREE.Color('#e3f4c4') }, uLawn: { value: S.LAWN_SECTIONS.map(s => new THREE.Color(s.color)) } },
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
        float ang = atan(-(vKpW.z + 5.0) / 17.5, vKpW.x / 34.5) * 57.2957795;
        float ell = length(vec2(vKpW.x / 34.5, (vKpW.z + 5.0) / 17.5));
        vec3 gFlat = mix(uBase, uTip, 0.35);
        vec3 base = gFlat;
        if (ell > 1.05) {
          if (vKpW.x > 28.0 && vKpW.z > 7.0) base = uLawn[5];
          else if (abs(ang) > 166.0) base = uLawn[0];
          else if (ang > 128.0) base = uLawn[1];
          else if (ang > 90.0) base = uLawn[2];
          else if (ang > 14.0) base = uLawn[3];
          else if (ang > -35.0) base = uLawn[4];
        }
        vec3 col = mix(base * 0.86, base, clamp(vH, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  const im = new THREE.InstancedMesh(geo, mat, n);
  let k = 0;
  const r2 = S.rngFromSeed(31);
  const cl = (x, z) => Math.sin(x * 0.21) * Math.cos(z * 0.17) + Math.sin(x * 0.07 + z * 0.11);
  for (let i = 0; i < n * 8 && k < n; i++) {
    const x = -66 + r2() * 132, z = -48 + r2() * 96;
    if (Math.hypot(x / 70.0, (z + 2.0) / 52.0) > 1.0 || S.blocked(x, z, 0.8)) continue;
    if (cl(x, z) < 0.25 && r2() < 0.85) continue;
    S._m.compose(S._v.set(x, 0, z), S._q.setFromEuler(S._e.set(0, r2() * 6.28, 0)), S._s.setScalar(0.8 + r2() * 0.6));
    im.setMatrixAt(k++, S._m);
  }
  im.count = k; im.frustumCulled = false; S.scene.add(im);
}

function sowFlowers() {
  const cols = ['#f6a9c0', '#ffe08f', '#cdb8f0', '#fff6ea', '#ffb79a'].map(c => new THREE.Color(c));
  const n = 260, im = new THREE.InstancedMesh(S.G.ico(0.11, 0), S.toon('#ffffff'), n);
  im.castShadow = false; let k = 0;
  for (const b of S.BEDS) {
    const ang = Math.atan2(b.c.z, b.c.x) + Math.PI / 2;
    for (let i = 0; i < n / 4; i++) {
      const a = S.R(0, 6.28), rr = Math.sqrt(S.R(0, 1));
      const lx = Math.cos(a) * b.rx * rr, lz = Math.sin(a) * b.rz * rr;
      const x = b.c.x + lx * Math.cos(ang) - lz * Math.sin(ang), z = b.c.z + lx * Math.sin(ang) + lz * Math.cos(ang);
      S._m.compose(S._v.set(x, S.R(0.18, 0.42), z), S._q.setFromEuler(S._e.set(S.R(0, 3), S.R(0, 3), 0)), S._s.setScalar(S.R(0.8, 1.3)));
      im.setMatrixAt(k, S._m); im.setColorAt(k, cols[S.rand() * cols.length | 0]); k++;
    }
  }
  im.count = k; S.scene.add(im);
}

S.petals = undefined;
function driftPetals(n) {
  const geo = new THREE.PlaneGeometry(0.16, 0.11);
  const mat = new THREE.MeshBasicMaterial({ color: '#f7b9ca', side: THREE.DoubleSide });
  S.patch(mat, { key: 'petal', noGlow: true });
  S.petals = new THREE.InstancedMesh(geo, mat, n); S.petals.frustumCulled = false;
  S.petals.userData.p = Array.from({ length: n }, () => ({ x: S.R(-28, 28), y: S.R(0, 9), z: S.R(-28, 28), s: S.R(0.4, 1), r: S.R(0, 6.28), sp: S.R(0.6, 1.6) }));
  S.scene.add(S.petals);
}
S.paintTerrain = paintTerrain;
S.formTerrain = formTerrain;
S.seedTurf = seedTurf;
S.sowFlowers = sowFlowers;
S.driftPetals = driftPetals;

}

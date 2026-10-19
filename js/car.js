import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export async function installCar(S) {
S.kart = new THREE.Group();
S.KS = 0.98; 
S.wheelMeshes = [];
S.kartParts = {};
function constructRig() {
  const rig = new THREE.Group(); S.kart.add(rig); rig.scale.setScalar(S.KS);
  const body = new THREE.Group(); rig.add(body); S.kartParts.body = body;
  const INK = S.C.ink, INKS = S.C.inkSoft, CORAL = S.C.coral, DEEP = '#d94528', CREAM = '#fbf3e6', BUTTER = S.C.butter;
  const GLASS = '#1f1a36', SHINE = '#8f86c9', ALLOY = '#a79cc2', RUBBER = '#2a2140';
  const PI = Math.PI;

  const collector = () => {
    const geos = [], hulls = [], tmp = new THREE.Color();
    return {
      add(geo, x, y, z, rx, ry, rz, color, outline = true) {
        const m = S.M(x, y, z, rx, ry, rz);
        const g = S.flat(geo); g.applyMatrix4(m);
        tmp.set(color); const n = g.attributes.position.count, arr = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { arr[i * 3] = tmp.r; arr[i * 3 + 1] = tmp.g; arr[i * 3 + 2] = tmp.b; }
        g.setAttribute('color', new THREE.BufferAttribute(arr, 3)); geos.push(g);
        if (outline) { const h = S.bodyGeo(geo).clone(); h.applyMatrix4(m); hulls.push(h); }
      },
      geometry() { return mergeGeometries(geos); },
      hull() { return hulls.length ? mergeGeometries(hulls) : null; },
    };
  };
  const bakeMat = S.patch(new THREE.MeshToonMaterial({ color: 0xffffff, vertexColors: true, gradientMap: S.gradientMap }), { ao: true, key: 'kartbake' });
  const attachBake = (b, parent) => {
    const m = new THREE.Mesh(b.geometry(), bakeMat); m.castShadow = true; m.receiveShadow = true; parent.add(m);
    const h = b.hull(); if (h) parent.add(new THREE.Mesh(h, S.bodyMat(false)));
    return m;
  };

  const B = collector();
  const bx = (w, h, d, x, y, z, color, rx = 0, ry = 0, rz = 0, outline = true) => B.add(S.G.box(w, h, d), x, y, z, rx, ry, rz, color, outline);
  const cy = (r, h, x, y, z, color, rx = 0, ry = 0, rz = 0, knot = 12, outline = true) => B.add(S.G.cyl(r, r, h, knot), x, y, z, rx, ry, rz, color, outline);

  bx(0.72, 0.07, 1.8, 0, -0.02, 0, INK);
  bx(0.62, 0.035, 0.42, 0, -0.07, -0.74, INKS, 0, 0, 0, false);
  bx(0.6, 0.035, 0.34, 0, -0.07, 0.72, INKS, 0, 0, 0, false);
  bx(0.9, 0.22, 1.7, 0, 0.12, 0, DEEP);
  bx(0.9, 0.14, 1.7, 0, 0.3, 0, CORAL);
  bx(0.84, 0.05, 0.7, 0, 0.395, -0.57, CORAL, -0.06);
  bx(0.5, 0.05, 0.46, 0, 0.43, -0.5, DEEP, -0.06);
  for (let i = 0; i < 4; i++) bx(0.36, 0.012, 0.03, 0, 0.462 - i * 0.004, -0.62 + i * 0.075, INK, -0.06, 0, 0, false);
  bx(0.84, 0.012, 0.02, 0, 0.405, -0.915, CREAM, -0.06, 0, 0, false);
  bx(0.84, 0.035, 0.12, 0, 0.405, -0.2, INK, 0, 0, 0, false);
  for (const sx of [-1, 1]) bx(0.2, 0.01, 0.02, sx * 0.2, 0.41, -0.185, INKS, 0, sx * 0.55, 0, false);   
  for (const sx of [-1, 1]) {
    bx(0.06, 0.28, 0.98, sx * 0.4, 0.51, 0.31, CORAL);
    bx(0.07, 0.04, 0.98, sx * 0.4, 0.665, 0.31, CREAM, 0, 0, 0, false);       
    bx(0.05, 0.36, 0.05, sx * 0.4, 0.55, -0.17, INK, 0.42);                     
    bx(0.06, 0.4, 0.06, sx * 0.4, 0.57, 0.32, INK);                             
  }
  bx(0.74, 0.02, 0.96, 0, 0.378, 0.31, INK, 0, 0, 0, false);
  bx(0.7, 0.09, 0.14, 0, 0.43, -0.12, INKS);                                    
  bx(0.34, 0.06, 0.3, 0, 0.405, 0.2, INK);                                      
  bx(0.32, 0.36, 0.07, 0, 0.54, 0.37, INK);                                     
  bx(0.2, 0.08, 0.06, 0, 0.74, 0.37, INKS);                                     
  bx(0.1, 0.12, 0.22, 0, 0.42, 0.1, INKS, 0, 0, 0, false);                      
  bx(0.8, 0.3, 0.05, 0, 0.52, 0.8, CORAL);
  bx(0.62, 0.17, 0.012, 0, 0.55, 0.832, GLASS, 0, 0, 0, false);                 
  bx(0.76, 0.3, 0.025, 0, 0.53, -0.2, GLASS, 0.45, 0, 0, false);                 
  bx(0.7, 0.05, 0.012, 0, 0.5, -0.215, SHINE, 0.45, 0, 0.0, false);
  bx(0.8, 0.045, 0.05, 0, 0.675, -0.12, INK, 0.0);                                
  bx(0.88, 0.05, 0.52, 0, 0.715, 0.6, CREAM);
  bx(0.1, 0.012, 0.52, -0.14, 0.743, 0.6, CORAL, 0, 0, 0, false);
  bx(0.1, 0.012, 0.52, 0.14, 0.743, 0.6, CORAL, 0, 0, 0, false);
  for (const sx of [-1, 1]) {
    bx(0.03, 0.025, 0.5, sx * 0.37, 0.785, 0.6, INK, 0, 0, 0, false);
    for (const z of [0.4, 0.8]) bx(0.03, 0.06, 0.03, sx * 0.37, 0.75, z, INK, 0, 0, 0, false);
  }
  for (const z of [0.44, 0.6, 0.76]) bx(0.76, 0.022, 0.025, 0, 0.795, z, INK, 0, 0, 0, false);
  bx(0.3, 0.1, 0.2, 0.07, 0.86, 0.62, BUTTER);
  bx(0.31, 0.02, 0.04, 0.07, 0.862, 0.62, INK, 0, 0, 0, false);
  bx(0.1, 0.17, 0.07, -0.22, 0.88, 0.52, S.C.mintDeep);
  bx(0.05, 0.03, 0.05, -0.22, 0.98, 0.52, INK, 0, 0, 0, false);
  bx(0.52, 0.18, 0.03, 0, 0.245, -0.865, INK);
  for (let i = 0; i < 4; i++) bx(0.46, 0.014, 0.012, 0, 0.19 + i * 0.035, -0.884, INKS, 0, 0, 0, false);
  bx(0.09, 0.045, 0.012, 0, 0.31, -0.89, BUTTER, 0, 0, 0, false);
  bx(0.96, 0.12, 0.17, 0, 0.1, -0.95, INK);
  bx(0.7, 0.06, 0.1, 0, 0.035, -0.99, INKS, 0, 0, 0, false);
  bx(0.34, 0.05, 0.02, 0, 0.12, -1.04, BUTTER, 0, 0, 0, false);                   
  cy(0.045, 0.3, 0, 0.1, -1.03, INKS, 0, 0, PI / 2, 8, false);                    
  for (const sx of [-1, 1]) {
    bx(0.045, 0.3, 0.045, sx * 0.34, 0.25, -1.0, INK);
    bx(0.07, 0.05, 0.07, sx * 0.4, 0.075, -1.0, CORAL, 0, 0, 0, false);           
  }
  bx(0.76, 0.045, 0.045, 0, 0.4, -1.0, INK);
  bx(0.96, 0.12, 0.17, 0, 0.1, 0.94, INK);
  bx(0.54, 0.02, 0.12, 0, 0.165, 0.94, INKS, 0, 0, 0, false);
  bx(0.12, 0.06, 0.16, 0, 0.04, 1.06, INKS, 0, 0, 0, false);
  cy(0.27, 0.13, 0, 0.42, 0.935, RUBBER, PI / 2, 0, 0, 18);
  cy(0.17, 0.14, 0, 0.42, 0.94, ALLOY, PI / 2, 0, 0, 12, false);
  cy(0.07, 0.15, 0, 0.42, 0.94, BUTTER, PI / 2, 0, 0, 8, false);
  bx(0.06, 0.06, 0.07, 0, 0.42, 0.86, INK, 0, 0, 0, false);
  for (const sx of [-1, 1]) bx(0.13, 0.26, 0.05, sx * 0.38, 0.34, 0.86, INK);
  for (const sx of [-1, 1]) {
    for (const z of [-0.66, 0.62]) {
      bx(0.3, 0.045, 0.74, sx * 0.59, 0.335, z, INK);
      bx(0.3, 0.1, 0.06, sx * 0.59, 0.285, z - 0.36, INK, 0, 0, 0, false);
      bx(0.3, 0.1, 0.06, sx * 0.59, 0.285, z + 0.36, INK, 0, 0, 0, false);
      for (const dz of [-0.28, 0, 0.28]) bx(0.03, 0.03, 0.03, sx * 0.745, 0.335, z + dz, CREAM, 0, 0, 0, false);
    }
    bx(0.1, 0.04, 0.56, sx * 0.5, 0.03, -0.02, INK);
    bx(0.07, 0.015, 0.5, sx * 0.5, 0.055, -0.02, INKS, 0, 0, 0, false);
    bx(0.1, 0.16, 0.02, sx * 0.58, 0.02, 1.0, INKS, 0, 0, 0, false);               
    bx(0.1, 0.14, 0.02, sx * 0.58, 0.04, -0.98, INKS, 0, 0, 0, false);
    bx(0.1, 0.02, 0.02, sx * 0.5, 0.5, -0.14, INK, 0, 0, 0, false);                
    bx(0.05, 0.07, 0.1, sx * 0.55, 0.5, -0.14, CORAL);
    bx(0.012, 0.3, 0.012, sx * 0.452, 0.3, -0.17, INK, 0, 0, 0, false);            
    bx(0.012, 0.3, 0.012, sx * 0.452, 0.3, 0.3, INK, 0, 0, 0, false);
    bx(0.012, 0.3, 0.012, sx * 0.452, 0.3, 0.77, INK, 0, 0, 0, false);
    bx(0.016, 0.02, 0.09, sx * 0.456, 0.34, 0.17, CREAM, 0, 0, 0, false);          
    bx(0.016, 0.02, 0.09, sx * 0.456, 0.34, 0.64, CREAM, 0, 0, 0, false);
    bx(0.012, 0.012, 1.5, sx * 0.452, 0.37, 0.0, CREAM, 0, 0, 0, false);           
    bx(0.012, 0.04, 1.3, sx * 0.452, 0.17, 0.0, BUTTER, 0, 0, 0, false);           
    bx(0.012, 0.17, 0.4, sx * 0.405, 0.555, 0.0, GLASS, 0, 0, 0, false);           
    bx(0.012, 0.17, 0.3, sx * 0.405, 0.555, 0.62, GLASS, 0, 0, 0, false);
    bx(0.008, 0.02, 0.2, sx * 0.409, 0.6, 0.0, SHINE, 0, 0, 0.0, false);
  }
  bx(0.012, 0.05, 0.07, -0.456, 0.3, 0.74, S.C.mint, 0, 0, 0, false);              
  bx(0.05, 0.5, 0.05, 0.43, 0.55, -0.12, INK);                                      
  bx(0.05, 0.06, 0.1, 0.43, 0.82, -0.14, INKS, 0.0);
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 3; i++) bx(0.012, 0.012, 0.16, sx * 0.452, 0.27 + i * 0.03, -0.45, INK, 0, 0, 0, false);   
    bx(0.04, 0.04, 0.04, sx * 0.3, 0.435, -0.84, CREAM, 0, 0, 0, false);            
    bx(0.014, 0.012, 0.5, sx * 0.452, 0.22, 0.0, INKS, 0, 0, 0, false);             
    bx(0.03, 0.06, 0.03, sx * 0.49, 0.075, -0.28, INKS, 0, 0, 0, false);            
    bx(0.03, 0.06, 0.03, sx * 0.49, 0.075, 0.24, INKS, 0, 0, 0, false);
  }
  for (const sx of [-1, 1]) {                                                       
    cy(0.065, 0.14, sx * 0.42, 0.04, 1.02, INK, PI / 2, 0, 0, 10);
    cy(0.085, 0.03, sx * 0.42, 0.04, 0.95, INKS, PI / 2, 0, 0, 10, false);
    bx(0.03, 0.03, 0.03, sx * 0.42, 0.1, 0.96, INKS, 0, 0, 0, false);
  }
  bx(0.2, 0.09, 0.012, 0.0, 0.2, 1.027, CREAM, 0, 0, 0, false);                     
  bx(0.16, 0.012, 0.014, 0.0, 0.2, 1.036, INK, 0, 0, 0, false);
  bx(0.028, 0.34, 0.07, 0.456, 0.33, 0.45, INKS, 0, 0, 0.0, false);                 
  bx(0.02, 0.1, 0.12, 0.456, 0.18, 0.45, INKS, 0, 0, 0, false);                     
  bx(0.04, 0.04, 0.12, 0, 0.2, -1.08, CORAL, 0, 0, 0, false);                       
  bx(0.02, 0.1, 0.34, 0.456, 0.55, 0.0, SHINE, 0, 0, 0.0, false);                    
  for (const z of [-0.2, 0.0, 0.2]) bx(0.04, 0.012, 0.012, 0.0, 0.795, 0.4 + z + 0.2, CREAM, 0, 0, 0, false);
  const bodyMesh = attachBake(B, body);

  const badgeTex = S.canvasTexture(128, 128, (x, w, h) => {
    x.fillStyle = '#fbf3e6'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#d98a63'; x.lineWidth = 9;
    x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 7, 0, 6.3); x.stroke();
    x.fillStyle = '#d98a63'; x.font = 'bold 66px "DM Mono", monospace';
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('07', w / 2, h / 2 + 3);
  });
  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.145, 20),
    S.patch(new THREE.MeshBasicMaterial({ map: badgeTex }), { key: 'badge', noGlow: true }));
  badge.rotation.x = -Math.PI / 2 - 0.06; badge.position.set(0, 0.468, -0.55); body.add(badge);

  S.kartParts.lamps = [];
  S.kartParts.brakes = [];
  S.kartParts.glow = [];
  const put = (geo, color, x, y, z, o) => {
    const m = S.mesh(geo, color, o); m.position.set(x, y, z); body.add(m); return m;
  };
  const glowMat = (color, ei) => ({ emissive: color, ei, outline: false, noAO: true });
  const glowBox = (w, h, d, color, emis, ei, x, y, z, list, rx = 0) => {
    const m = put(S.G.box(w, h, d), color, x, y, z, glowMat(emis, ei)); m.rotation.x = rx;
    m.material = m.material.clone(); m.castShadow = false; if (list) list.push(m); return m;
  };
  glowBox(0.38, 0.035, 0.03, '#fff1c9', '#ffe9a8', 0.35, 0, 0.335, -0.88, S.kartParts.lamps);
  for (const sx of [-1, 1]) {
    glowBox(0.16, 0.075, 0.03, '#fff6d8', '#ffe9a8', 0.35, sx * 0.3, 0.31, -0.885, S.kartParts.lamps);
    glowBox(0.1, 0.035, 0.02, '#fff6d8', '#ffe9a8', 0.3, sx * 0.27, 0.1, -1.04, S.kartParts.lamps);
    glowBox(0.04, 0.012, 0.3, '#fff6d8', '#ffe9a8', 0.3, sx * 0.43, 0.345, -0.72, S.kartParts.lamps);
  }
  for (const sx of [-0.27, -0.09, 0.09, 0.27]) glowBox(0.09, 0.05, 0.05, '#fff6d8', '#ffe9a8', 0.2, sx, 0.715, -0.15, S.kartParts.lamps);
  for (const sx of [-1, 1]) {
    const bl = glowBox(0.04, 0.045, 0.07, '#ffb15a', '#ff9a3a', 0.15, sx * 0.456, 0.255, -0.9);
    if (sx < 0) S.kartParts.blinkL = bl; else S.kartParts.blinkR = bl;
    glowBox(0.1, 0.22, 0.03, '#d98a63', '#d98a63', 0.35, sx * 0.38, 0.34, 0.89, S.kartParts.brakes);
    glowBox(0.09, 0.09, 0.02, '#aef0ff', '#52d8ff', 0.5, sx * 0.42, 0.04, 1.09, S.kartParts.glow);   
    glowBox(0.03, 0.018, 0.5, '#9fe8ff', '#52d8ff', 0.5, sx * 0.53, 0.0, -0.02, S.kartParts.glow);   
  }
  glowBox(0.4, 0.028, 0.028, '#d98a63', '#d98a63', 0.35, 0, 0.7, 0.868, S.kartParts.brakes);
  S.kartParts.strip = glowBox(0.3, 0.024, 0.03, '#ffb15a', '#ff9a3a', 0.45, 0, 0.745, 0.866);

  const steerRing = new THREE.Group(); steerRing.position.set(0, 0.47, -0.03); steerRing.rotation.x = 0.5;
  steerRing.add(S.mesh(new THREE.TorusGeometry(0.075, 0.015, 6, 12), INK, { outline: false }));
  steerRing.add(S.mesh(S.G.box(0.15, 0.014, 0.014), INKS, { outline: false }));
  body.add(steerRing); S.kartParts.wheel = steerRing;
  const shaft = S.mesh(S.G.box(0.04, 0.04, 0.12), INKS, { outline: false }); shaft.position.set(0, 0.43, -0.07); body.add(shaft);

  const pilot = new THREE.Group(); pilot.position.set(0, 0.34, 0.18); body.add(pilot); S.kartParts.drv = pilot;
  const torso = (geo, color, x, y, z, rx = 0, ry = 0, rz = 0, o) => { const m = S.mesh(geo, color, o); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); pilot.add(m); return m; };
  torso(S.G.box(0.26, 0.26, 0.15), BUTTER, 0, 0.17, 0.0);                       
  torso(S.G.box(0.28, 0.05, 0.16), CORAL, 0, 0.3, 0.0, 0, 0, 0, { outline: false }); 
  for (const sx of [-1, 1]) {
    torso(S.G.box(0.065, 0.065, 0.26), BUTTER, sx * 0.15, 0.2, -0.11, 0.55, sx * -0.28, 0);
    torso(S.G.box(0.07, 0.07, 0.07), INK, sx * 0.08, 0.1, -0.23, 0, 0, 0, { outline: false }); 
    torso(S.G.box(0.08, 0.2, 0.2), INKS, sx * 0.07, 0.05, -0.08, -0.3, 0, 0, { outline: false }); 
  }
  const head = new THREE.Group(); head.position.set(0, 0.37, 0); pilot.add(head); S.kartParts.head = head;
  const headPart = (geo, color, x, y, z, o) => { const m = S.mesh(geo, color, o); m.position.set(x, y, z); head.add(m); return m; };
  headPart(new THREE.SphereGeometry(0.095, 10, 8), '#f2c6a8', 0, -0.01, 0, { outline: false });
  headPart(new THREE.SphereGeometry(0.128, 12, 9, 0, PI * 2, 0, PI * 0.62), CREAM, 0, 0.0, 0.0);
  headPart(S.G.box(0.05, 0.02, 0.22), CORAL, 0, 0.125, 0, { outline: false });
  headPart(S.G.box(0.15, 0.055, 0.05), INK, 0, 0.01, -0.105, { outline: false });          
  headPart(S.G.box(0.12, 0.012, 0.012), '#9ff5d6', 0, 0.012, -0.132, { outline: false });
  S.kartParts.scarf = [];
  const SC = [[-0.05, CORAL, 0.12], [0, BUTTER, 0.19], [0.05, CORAL, 0.14]];
  for (const [sx, col, len] of SC) {
    const knot = new THREE.Group(); knot.position.set(sx, 0.3, 0.05); pilot.add(knot);
    const m = S.mesh(S.G.box(0.05, 0.02, len), col, { outline: false }); m.position.z = len / 2; knot.add(m);
    S.kartParts.scarf.push(knot);
  }
  const flagPole = S.mesh(S.G.cyl(0.008, 0.012, 0.5, 5), INKS, { outline: false }); flagPole.position.set(-0.37, 1.04, 0.84); body.add(flagPole);
  const flag = new THREE.Group(); flag.position.set(-0.37, 1.26, 0.84); body.add(flag); S.kartParts.flag = flag;
  const pen = S.mesh(S.G.box(0.012, 0.09, 0.2), CORAL, { outline: false }); pen.position.z = 0.1; flag.add(pen);
  const tip = S.mesh(S.G.box(0.012, 0.05, 0.07), BUTTER, { outline: false }); tip.position.z = 0.23; flag.add(tip);

  const W = collector();
  W.add(S.G.cyl(0.34, 0.34, 0.22, 22), 0, 0, 0, 0, 0, PI / 2, RUBBER, true);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * PI * 2;
    W.add(S.G.box(0.23, 0.05, 0.12), 0, Math.cos(a) * 0.35, Math.sin(a) * 0.35, a, 0, 0, '#3b2f52', false);
  }
  const GUN = '#4c4660', GUNL = '#6c6684', STEEL = '#b9b4c8';
  for (const sx of [-1, 1]) {
    W.add(new THREE.TorusGeometry(0.215, 0.018, 5, 18), sx * 0.118, 0, 0, 0, PI / 2, 0, GUNL, false);       
    W.add(new THREE.TorusGeometry(0.29, 0.008, 4, 22), sx * 0.112, 0, 0, 0, PI / 2, 0, '#3a3350', false);    
    for (let k = 0; k < 6; k++) W.add(S.G.box(0.03, 0.4, 0.07), sx * 0.115, 0, 0, (k / 6) * PI, 0, 0, GUN, false);
    W.add(S.G.cyl(0.095, 0.095, 0.04, 10), sx * 0.125, 0, 0, 0, 0, PI / 2, GUNL, false);                      
    for (let k = 0; k < 6; k++) { const a = (k / 6) * PI * 2 + 0.2; W.add(S.G.cyl(0.013, 0.013, 0.03, 5), sx * 0.14, Math.cos(a) * 0.063, Math.sin(a) * 0.063, 0, 0, PI / 2, STEEL, false); }
  }
  W.add(S.G.cyl(0.2, 0.2, 0.235, 16), 0, 0, 0, 0, 0, PI / 2, '#2f2a42', false);
  W.add(S.G.cyl(0.17, 0.17, 0.2, 14), 0, 0, 0, 0, 0, PI / 2, STEEL, false);                                  
  W.add(S.G.cyl(0.07, 0.07, 0.27, 10), 0, 0, 0, 0, 0, PI / 2, '#3a3350', false);
  const wheelGeo = W.geometry(), wheelHull = W.hull();
  for (let i = 0; i < 4; i++) {
    const w = new THREE.Group(); w.scale.setScalar(S.KS);
    const spin = new THREE.Group(); w.add(spin); w.userData.spin = spin;
    const m = new THREE.Mesh(wheelGeo, bakeMat); m.castShadow = true; m.receiveShadow = true; spin.add(m);
    if (wheelHull) spin.add(new THREE.Mesh(wheelHull, S.bodyMat(false)));
    S.scene.add(w); S.wheelMeshes.push(w);
  }
  S.wheelAngle = [0, 0, 0, 0];

  const bloom = S.canvasTexture(64, 64, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  const bloomMesh = (color, size, x, y, z) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bloom, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: 0 }));
    s.scale.set(size, size, 1); s.position.set(x, y, z); s.renderOrder = 4; body.add(s); return s;
  };
  S.kartParts.halos = [bloomMesh('#ffe9a8', 0.62, -0.3, 0.31, -0.93), bloomMesh('#ffe9a8', 0.62, 0.3, 0.31, -0.93), bloomMesh('#fff1c9', 0.5, 0, 0.335, -0.93)];
  S.kartParts.brakeHalos = [bloomMesh('#ff4a2a', 0.46, -0.38, 0.34, 0.92), bloomMesh('#ff4a2a', 0.46, 0.38, 0.34, 0.92), bloomMesh('#ff4a2a', 0.5, 0, 0.7, 0.9)];

  const shade = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.4), S.patch(new THREE.MeshBasicMaterial({ map: S.canvasTexture(128, 128, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(70,45,80,.55)'); g.addColorStop(1, 'rgba(70,45,80,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  }), transparent: true, depthWrite: false }), { key: 'shade', noGlow: true }));
  shade.rotation.x = -Math.PI / 2; shade.renderOrder = 1; S.scene.add(shade); S.kartParts.blob = shade;
  const wash = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.6), S.patch(new THREE.MeshBasicMaterial({ map: S.canvasTexture(128, 192, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h * 0.72, 4, w / 2, h * 0.5, h * 0.5);
    g.addColorStop(0, 'rgba(255,236,170,.95)'); g.addColorStop(0.5, 'rgba(255,214,130,.38)'); g.addColorStop(1, 'rgba(255,200,110,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false }), { key: 'wash', noGlow: true }));
  wash.rotation.x = -Math.PI / 2; wash.position.set(0, -0.5, -2.7); wash.renderOrder = 2; wash.visible = false;
  S.kart.add(wash); S.kartParts.pool = wash;
  S.scene.add(S.kart);
}

S.chassis = new CANNON.Body({ mass: 170, angularDamping: 0.45, linearDamping: 0.06 });
S.chassis.addShape(new CANNON.Box(new CANNON.Vec3(0.5 * S.KS, 0.2 * S.KS, 0.95 * S.KS)), new CANNON.Vec3(0, 0.12 * S.KS, 0));
  S.chassis.position.set(S.SPAWN.x, 2.2, S.SPAWN.z); S.chassis.quaternion.setFromEuler(0, 0, 0);
S.chassis.allowSleep = false;
S.vehicle = new CANNON.RaycastVehicle({ chassisBody: S.chassis, indexRightAxis: 0, indexUpAxis: 1, indexForwardAxis: 2 });
S.WO = {
  radius: 0.3 * S.KS, directionLocal: new CANNON.Vec3(0, -1, 0), suspensionStiffness: 38, suspensionRestLength: 0.22 * S.KS,
  frictionSlip: 2.6, dampingRelaxation: 2.3, dampingCompression: 4.0, maxSuspensionForce: 100000, rollInfluence: 0.04,
  axleLocal: new CANNON.Vec3(-1, 0, 0), chassisConnectionPointLocal: new CANNON.Vec3(), maxSuspensionTravel: 0.24 * S.KS,
  customSlidingRotationalSpeed: -30, useCustomSlidingRotationalSpeed: true,
};
for (const [x, z] of [[-0.6, -0.66], [0.6, -0.66], [-0.6, 0.62], [0.6, 0.62]]) { S.WO.chassisConnectionPointLocal.set(x * S.KS, 0.0, z * S.KS); S.vehicle.addWheel({ ...S.WO, chassisConnectionPointLocal: S.WO.chassisConnectionPointLocal.clone() }); }
S.vehicle.addToWorld(S.world);

S.ENGINE = 760, S.FWD = 1, S.STEER_MAX = 0.55;
S.steerVal = 0, S.hopCool = 0, S.blastCool = 0, S.flipT = 0, S.recoverN = 0, S.recover = null, S.airT = 0, S.lastGround = 0, S.stuckT = 0, S.projectsHint = false;
S.fwdV = new CANNON.Vec3(), S.upV = new CANNON.Vec3();
function fwdSpeed() { S.chassis.quaternion.vmult(new CANNON.Vec3(0, 0, -1), S.fwdV); return S.chassis.velocity.dot(S.fwdV); }
function onGround() { let n = 0; for (const w of S.vehicle.wheelInfos) if (w.isInContact || (w.raycastResult && w.raycastResult.body && w.raycastResult.distance < w.suspensionRestLength + w.maxSuspensionTravel + w.radius)) n++; return n; }
function hop() {
  if (S.state !== 'drive' || S.hopCool > 0 || S.list.classList.contains('on')) return;
  const near = S.chassis.position.y < 1.7 && Math.abs(S.chassis.velocity.y) < 3;
  if (onGround() < 1 && !near) return;
  S.chassis.velocity.y = Math.max(S.chassis.velocity.y, 10);
  S.chassis.quaternion.vmult(new CANNON.Vec3(0, 0, -1), S.fwdV);
  S.chassis.velocity.x += S.fwdV.x * 4;
  S.chassis.velocity.z += S.fwdV.z * 4;
  S.hopCool = 0.55; S.tone(220, 0.15, 'triangle', 0.1);
}
function resetRig(home) {
  const p = home ? S.SPAWN : S.chassis.position;
  const f = new THREE.Vector3(0, 0, -1).applyQuaternion(S.kart.quaternion); const yaw = Math.atan2(-f.x, -f.z);
  S.chassis.position.set(p.x, 1.4, p.z); S.chassis.velocity.setZero(); S.chassis.angularVelocity.setZero();
  S.chassis.quaternion.setFromEuler(0, home ? 0 : yaw, 0);
  for (const fire of S.fires) fire.m.visible = false;
  for (const c of S.chunks) c.m.visible = false;
  for (const s of S.scraps) s.m.visible = false;
  if (S.fireLight) S.fireLight.intensity = 0;
  for (const r of S.boostTrails) { r.n = 0; r.mesh.visible = false; }
  S.padBoostT = 0; S.slopeBoostT = 0; S.driftBoostT = 0; S.driftHold = 0; S.lastMult = 1;
}
S._loc = new CANNON.Vec3();
function steerWorld(tx, tz, speedCap = 1) {
  const d = new CANNON.Vec3(tx - S.chassis.position.x, 0, tz - S.chassis.position.z);
  S.chassis.quaternion.conjugate().vmult(d, S._loc);
  const ang = Math.atan2(S._loc.x, -S._loc.z); 
  return [speedCap, S.clamp(-ang * 1.8, -1, 1), ang];
}

S.padBoostT = 0; S.slopeBoostT = 0; S.driftBoostT = 0; S.driftHold = 0; S.lastMult = 1;
function drive(dt) {
  let throttle = 0, steer = 0, boost = !!S.keys.boost, brake = 0;
  const vF = fwdSpeed();
  const speed = S.chassis.velocity.length();
  if (S.state !== 'drive') { brake = 2; }
  else if (S.goal) {
    const g = S.goal, last = g.i >= g.pts.length - 1;
    const [tx, tz] = g.pts[Math.min(g.i, g.pts.length - 1)];
    const dist = Math.hypot(tx - S.chassis.position.x, tz - S.chassis.position.z);
    if (!last && dist < 3.2) g.i++;
    let [th, st, ang] = steerWorld(tx, tz);
    let vt = 10 * (1 - Math.min(Math.abs(ang), 1.2) / 1.7);
    if (last) vt = Math.min(vt, Math.max(1.5, dist * 0.9));
    th = vF < vt ? 0.9 : 0;
    if (vF > vt + 1) brake = (vF - vt) * 2.2;
    if (g.back > 0) { g.back -= dt; th = -0.7; st = -st; }
    else if (th > 0.3 && speed < 0.5 && !(last && dist < 2)) { g.stuck += dt; if (g.stuck > 1.1) { g.back = 0.9; g.stuck = 0; } }
    else g.stuck = 0;
    throttle = th; steer = st;
    if (last && dist < 2.0) { throttle = 0; brake = 8; if (speed < 1.5) { const cb = g.onArrive; S.goal = null; cb && cb(); } }
  } else if (S.joy.on && (Math.abs(S.joy.x) + Math.abs(S.joy.y)) > 0.15) {
    const mag = Math.min(1, Math.hypot(S.joy.x, S.joy.y));
    const dx = S.camRight.x * S.joy.x - S.camUp.x * S.joy.y, dz = S.camRight.z * S.joy.x - S.camUp.z * S.joy.y;
    const [, st, ang] = steerWorld(S.chassis.position.x + dx * 10, S.chassis.position.z + dz * 10);
    steer = st; throttle = mag * (Math.abs(ang) > 2.4 && speed < 2 ? 0.5 : 1);
  } else {
    throttle = S.keys.f - S.keys.b; steer = S.keys.l - S.keys.r;
  }
  if (S.padBoostT > 0) S.padBoostT -= dt;
  if (S.slopeBoostT > 0) S.slopeBoostT -= dt;
  if (S.driftBoostT > 0) S.driftBoostT -= dt;
  if (S.state === 'drive') {
    const px = S.chassis.position.x, pz = S.chassis.position.z;
    if (S.padBoostT <= 0) for (const p of S.BOOST_PTS) if (Math.hypot(px - p[0], pz - p[1]) < 3.4) {
      S.padBoostT = 1.8; S.tone(660, 0.18, 'triangle', 0.12); S.toast('Boost pad', '1.6× turbo — 1.8 s'); break;
    }
    if (S.slopeBoostT <= 0 && S.chassis.position.y > 0.7 && S.onSlope(px, pz)) {
      S.slopeBoostT = 2.2; S.tone(990, 0.2, 'triangle', 0.13); S.toast('Ramp turbo', '1.9× — launched off the slope');
    }
  }
  const shiftOn = !!S.keys.boost;
  const padB = S.padBoostT > 0, rampB = S.slopeBoostT > 0, driftB = S.driftBoostT > 0;
  const mul = (shiftOn ? 1.45 : 1) * (padB ? 1.6 : 1) * (rampB ? 1.9 : 1) * (driftB ? 1.4 : 1);
  const vmax = Math.min(28, 12.5 + (shiftOn ? 5.5 : 0) + (padB ? 4.5 : 0) + (rampB ? 6.5 : 0) + (driftB ? 2 : 0));
  const bits = [];
  if (shiftOn) bits.push('shift');
  if (padB) bits.push('pad');
  if (rampB) bits.push('turbo');
  if (driftB) bits.push('drift');
  const mode = bits.length > 1 ? `×${mul.toFixed(2)}` : (bits[0] || 'cruise');
  if (mul > 1.99 && S.lastMult <= 1.99 && S.state === 'drive') S.toast(`×${mul.toFixed(2)} stack`, 'shift + turbo stacking');
  S.lastMult = mul;
  boost = mode !== 'cruise';
  let force = 0;
  if (throttle > 0) { if (vF < -1.5) brake = 7; else if (vF < vmax) force = S.ENGINE * throttle * mul; }
  else if (throttle < 0) { if (vF > 1.5) brake = 7; else if (vF > -7) force = S.ENGINE * 0.7 * throttle; }
  else brake = Math.max(brake, 0.9);
  const maxS = S.STEER_MAX * (1 - S.clamp(Math.abs(vF) / 30, 0, 0.45));
  S.steerVal = S.damp(S.steerVal, steer * maxS, 10, dt);
  S.vehicle.setSteeringValue(S.steerVal, 0); S.vehicle.setSteeringValue(S.steerVal, 1);
  const drifting = S.state === 'drive' && !S.goal && S.keys.b && Math.abs(steer) > 0.2 && Math.abs(vF) > 7;
  if (drifting) S.driftHold += dt;
  else if (S.driftHold > 0) {
    if (S.driftHold >= 1.1) { S.driftBoostT = 1.4; S.toast('Drift boost', 'mini turbo — 1.4× for 1.4 s'); S.tone(760, 0.12, 'triangle', 0.09); }
    S.driftHold = 0;
  }
  S.vehicle.wheelInfos[2].frictionSlip = drifting ? 0.45 : 2.6;
  S.vehicle.wheelInfos[3].frictionSlip = drifting ? 0.45 : 2.6;
  if (drifting) S.chassis.angularVelocity.y += (steer > 0 ? -1 : 1) * 2.4 * dt;
  for (let i = 0; i < 4; i++) S.vehicle.setBrake(drifting ? brake * 0.35 : brake, i);
  S.vehicle.applyEngineForce(S.FWD * force, 2); S.vehicle.applyEngineForce(S.FWD * force, 3);
  if (S.state === 'drive' && throttle > 0.3 && speed < 0.45 && onGround() >= 1 && S.hopCool <= 0) S.stuckT += dt;
  else S.stuckT = 0;
  if (S.stuckT > 0.55) {
    S.chassis.quaternion.vmult(new CANNON.Vec3(0, 0, -1), S.fwdV);
    S.chassis.velocity.x += S.fwdV.x * 3.5; S.chassis.velocity.z += S.fwdV.z * 3.5;
    S.chassis.velocity.y = Math.max(S.chassis.velocity.y, 4);
    S.stuckT = 0;
  }
  if (S.audio.ctx) {
    const t = S.audio.ctx.currentTime, sp = Math.abs(vF);
    S.audio.o1.frequency.setTargetAtTime(55 + sp * 11 + (force ? 18 : 0), t, 0.08);
    S.audio.o2.frequency.setTargetAtTime(110 + sp * 22, t, 0.08);
    S.audio.lp.frequency.setTargetAtTime(500 + sp * 80, t, 0.1);
    S.audio.g.gain.setTargetAtTime(S.state === 'drive' ? 0.035 + Math.min(sp, 15) * 0.004 + (force ? 0.02 : 0) : 0, t, 0.1);
  }
  return { throttle, force, vF, speed, drifting, mode, boosting: shiftOn };
}

S.chassis.addEventListener('collide', e => {
  const along = Math.abs(e.contact.getImpactVelocityAlongNormal());
  const n = e.contact.ni || { y: 1 };
  const side = S.chassis.velocity.length() * (1 - Math.min(1, Math.abs(n.y)));
  const v = Math.max(along, side);
  if (v > 2.2) S.thudSfx(v);
  const p = S.propByBody.get(e.body);
  if (!p || p.burst || !S.BURST_TAGS.has(p.tag) || v < 3.2 || S.blastCool > 0) return;
  p.burst = true;
  p.body.wakeUp();
  p.body.velocity.y += 6;
  p.body.angularVelocity.set(S.R(-5, 5), S.R(-5, 5), S.R(-5, 5));
  S.blast(p.body.position);
});
S.counts = { cone: 0, can: 0, crate: 0, pot: 0 };
S.strikeDone = false;

S.kAnim = { vF: 0, pitch: 0, roll: 0, bob: 0, bobV: 0, vy: 0 };
S.sparks = [];
{
  const g = new THREE.TetrahedronGeometry(0.07, 0);
  for (let i = 0; i < 48; i++) {
    const m = new THREE.Mesh(g, S.patch(new THREE.MeshBasicMaterial({ color: i % 3 ? '#9ff5d6' : '#fff2b0', transparent: true, depthWrite: false, fog: false }), { key: 'spark', noGlow: true }));
    m.visible = false; S.scene.add(m); S.sparks.push({ m, t: 0, life: 0, v: new THREE.Vector3() });
  }
}
S.sparkI = 0, S.sparkAcc = 0;
function animateRig(dt, t, info) {
  const b = S.kartParts.body; if (!b) return;
  const accel = (info.vF - S.kAnim.vF) / Math.max(dt, 1e-3); S.kAnim.vF = info.vF;
  const hold = info.mode === 'stacked' ? -0.09 : info.force > 0 ? -0.05 : (info.throttle < 0 ? 0.045 : 0);
  S.kAnim.pitch = S.damp(S.kAnim.pitch, S.clamp(accel * 0.0065 + hold, -0.1, 0.1), 6, dt);
  const lean = S.clamp(S.steerVal * Math.min(Math.abs(info.vF) / 9, 1.2) * 0.16, -0.16, 0.16);    
  S.kAnim.roll = S.damp(S.kAnim.roll, lean * Math.sign(info.vF || 1), 7, dt);
  const vy = S.chassis.velocity.y; const kick = (vy - S.kAnim.vy); S.kAnim.vy = vy;
  S.kAnim.bobV += (-S.kAnim.bob * 260 - S.kAnim.bobV * 14) * dt - kick * 0.9; S.kAnim.bob += S.kAnim.bobV * dt;
  S.kAnim.bob = S.clamp(S.kAnim.bob, -0.06, 0.06);
  const idle = S.state === 'drive' ? Math.sin(t * 14) * 0.006 * Math.min(info.speed / 6, 1) + Math.sin(t * 3.1) * 0.004 : Math.sin(t * 2.2) * 0.006;
  b.position.y = S.kAnim.bob + idle; b.rotation.x = S.kAnim.pitch; b.rotation.z = S.kAnim.roll;
  S.kartParts.drv.rotation.z = S.kAnim.roll * 0.8;
  const sp = Math.min(info.speed / 12, 1);
  S.kartParts.scarf.forEach((knot, i) => {
    knot.rotation.x = -0.9 + sp * 0.75 + Math.sin(t * (9 + sp * 8) - i * 0.9) * (0.12 + sp * 0.18);
    knot.rotation.y = Math.sin(t * 6 - i * 1.1) * (0.08 + sp * 0.2) - S.steerVal * 0.25;
  });
  const pull = info.force > 0 ? (S.keys.boost ? 60 : 22) : 0;
  S.sparkAcc += pull * dt;
  while (S.sparkAcc > 1) {
    S.sparkAcc -= 1;
    const s = S.sparks[S.sparkI++ % S.sparks.length];
    s.m.position.set(S.R(-0.25, 0.25), 0.3, 1.0).multiplyScalar(S.KS).applyMatrix4(S.kart.matrixWorld);
    s.v.set(S.R(-0.8, 0.8), S.R(0.6, 2.2), S.R(1.5, 3.2)).applyQuaternion(S.kart.quaternion).add(new THREE.Vector3(S.chassis.velocity.x, 0, S.chassis.velocity.z).multiplyScalar(0.6));
    s.t = 0; s.life = S.R(0.25, 0.5); s.m.visible = true; s.m.rotation.set(S.R(0, 6), S.R(0, 6), 0);
  }
  for (const s of S.sparks) if (s.m.visible) {
    s.t += dt; const k = s.t / s.life; if (k >= 1) { s.m.visible = false; continue; }
    s.v.y -= 9 * dt; s.m.position.addScaledVector(s.v, dt); s.m.material.opacity = 1 - k; s.m.scale.setScalar(1 - k * 0.6);
  }
  const bl = S.kartParts.blob; bl.position.set(S.chassis.position.x, 0.04, S.chassis.position.z);
  const f = new THREE.Vector3(0, 0, -1).applyQuaternion(S.kart.quaternion); bl.rotation.z = Math.atan2(f.x, -f.z) * -1;
  const air = S.clamp(S.chassis.position.y - 0.55, 0, 3); bl.material.opacity = 1 - air * 0.28; bl.scale.setScalar(1 + air * 0.15);
}
S.constructRig = constructRig;
S.fwdSpeed = fwdSpeed;
S.onGround = onGround;
S.hop = hop;
S.resetRig = resetRig;
S.steerWorld = steerWorld;
S.drive = drive;
S.animateRig = animateRig;

}

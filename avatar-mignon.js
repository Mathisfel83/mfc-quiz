/* MFC Quiz — avatar « mignon » entièrement codé (aucun modèle externe, aucune licence tierce).
   Personnage stylisé construit avec des formes arrondies three.js.
   API : window.MFCAvatarToon = { mount(el, cfg, opts), update(cfg), anim(name), TIERS, tierFor(level) } */
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const C = { navy: '#1E2F66', navyD: '#121C42', gold: '#D4AF37', goldL: '#F6DC8C', white: '#F2F4F8', silver: '#C9D1DE', black: '#1B1E27', red: '#C8463D' };

/* ---------- paliers de tenues (niveau minimum) ---------- */
const TIERS = [
  { lv: 1, id: 'mfc', name: 'Tenue MFC', top: 'tee', topC: C.navy, bottom: 'shorts', botC: C.black, stripe: C.gold, shoe: C.white, sole: C.navy, sock: C.white, logo: C.gold },
  { lv: 5, id: 'echauffe', name: 'Échauffé', top: 'tee', topC: C.navy, bottom: 'shorts', botC: C.black, stripe: C.gold, shoe: C.white, sole: C.gold, sock: C.white, logo: C.gold, headband: C.gold, wrist: C.gold },
  { lv: 20, id: 'competiteur', name: 'Compétiteur', top: 'jacket', topC: C.navy, sleeveStripe: C.gold, zip: C.white, bottom: 'pants', botC: C.navyD, stripe: C.gold, shoe: C.navy, sole: C.gold, logo: C.gold },
  { lv: 30, id: 'elite', name: 'Élite', top: 'compress', topC: C.black, sleeveStripe: C.gold, bottom: 'shorts', botC: C.navy, stripe: C.gold, shoe: C.gold, sole: C.black, sock: C.black, logo: C.gold, headband: C.black, gloves: C.black },
  { lv: 50, id: 'champion', name: 'Champion', top: 'tee', topC: C.white, bottom: 'shorts', botC: C.navy, stripe: C.gold, shoe: C.gold, sole: C.navy, sock: C.white, logo: C.gold, gloves: C.white, medal: true, belt: 'champ', pads: 'silver' },
  { lv: 70, id: 'legende', name: 'Légende', top: 'compress', topC: C.navy, bottom: 'pants', botC: C.navyD, stripe: C.gold, shoe: C.silver, sole: C.navyD, logo: C.gold, armor: 'silver', pads: 'gold', gaunt: 'silver', boots: 'silver', belt: 'gold', cape: C.navy, capeIn: C.gold },
  { lv: 100, id: 'mythique', name: 'Mythique', top: 'compress', topC: C.navyD, bottom: 'pants', botC: C.navyD, stripe: C.gold, shoe: C.gold, sole: C.goldL, logo: C.goldL, armor: 'gold', pads: 'gold2', gaunt: 'gold', boots: 'gold', belt: 'gold', cape: '#2A3C8F', capeIn: C.goldL, wings: true, halo: true, aura: true, glow: true },
];
function tierFor(level) { let t = TIERS[0]; TIERS.forEach((x) => { if (level >= x.lv) t = x; }); return t; }

const DEFAULT = { style: 'doux', sex: 'h', skin: '#E2AE84', hair: 'court', hairColor: '#3B2416', eyes: '#5A3A22', level: 1 };

/* ---------- matériaux ---------- */
let STYLE = 'doux', MATS = {}, RAMP = null, ENV = null;
function ramp() {
  if (RAMP) return RAMP;
  const d = new Uint8Array([90, 90, 90, 255, 165, 165, 165, 255, 225, 225, 225, 255, 255, 255, 255, 255]);
  RAMP = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); RAMP.minFilter = RAMP.magFilter = THREE.NearestFilter; RAMP.needsUpdate = true; return RAMP;
}
function M(color, kind = 'cloth') {
  const k = kind + '|' + color; if (MATS[k]) return MATS[k];
  let m; const col = new THREE.Color(color);
  if (kind === 'basic') m = new THREE.MeshBasicMaterial({ color: col });
  else if (kind === 'glow') m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  else if (STYLE === 'cartoon') {
    const metal = kind === 'metal' || kind === 'gold';
    m = new THREE.MeshToonMaterial({ color: metal ? col.clone().offsetHSL(0, 0.05, 0.08) : col, gradientMap: ramp() });
    if (kind === 'gold') m.emissive = new THREE.Color('#3A2A05');
    if (kind === 'shine') m.emissive = col.clone().multiplyScalar(0.6);
  } else {
    const o = { color: col, roughness: 0.78, metalness: 0, envMapIntensity: 0.5 };
    if (kind === 'skin') { o.roughness = 0.6; o.envMapIntensity = 0.35; }
    if (kind === 'hair') { o.roughness = 0.5; o.envMapIntensity = 0.6; }
    if (kind === 'shoe') { o.roughness = 0.45; o.envMapIntensity = 0.7; }
    if (kind === 'eye') { o.roughness = 0.12; o.envMapIntensity = 1.2; }
    if (kind === 'metal') { o.metalness = 0.85; o.roughness = 0.3; o.envMapIntensity = 1.1; }
    if (kind === 'gold') { o.metalness = 0.9; o.roughness = 0.25; o.envMapIntensity = 1.25; }
    if (kind === 'shine') { o.metalness = 0.9; o.roughness = 0.2; o.envMapIntensity = 1.2; o.emissive = col.clone().multiplyScalar(0.45); }
    m = new THREE.MeshStandardMaterial(o);
  }
  MATS[k] = m; return m;
}
function clearMats() { Object.values(MATS).forEach((m) => m.dispose()); MATS = {}; }
const OUTLINE = new THREE.ShaderMaterial({
  uniforms: { color: { value: new THREE.Color('#0A0F22') }, thick: { value: 0.014 } }, side: THREE.BackSide,
  vertexShader: 'uniform float thick; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vec3 n = normalize(normalMatrix * normal); mv.xyz += n * thick; gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform vec3 color; void main(){ gl_FragColor = vec4(color,1.0); }',
});
const metalKind = (v) => (/gold/.test(v) ? 'gold' : 'metal');
const metalCol = (v) => (/gold/.test(v) ? C.gold : C.silver);
function shade(hex, f) { const c = new THREE.Color(hex); c.multiplyScalar(f); return '#' + c.getHexString(); }

/* ---------- géométries utilitaires ---------- */
const V2 = (x, y) => new THREE.Vector2(x, y);
function mesh(geo, mat, opts = {}) { const m = new THREE.Mesh(geo, mat); if (opts.p) m.position.set(...opts.p); if (opts.s) m.scale.set(...opts.s); if (opts.r) m.rotation.set(...opts.r); if (opts.ol === false) m.userData.ol = false; return m; }
const sph = (r, w = 32, h = 24) => new THREE.SphereGeometry(r, w, h);
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 8, 20);
function profile(sx) {
  const f = sx === 'f';
  const pts = f
    ? [V2(0.001, 0), V2(0.2, 0.02), V2(0.19, 0.13), V2(0.215, 0.24), V2(0.235, 0.33), V2(0.235, 0.41), V2(0.19, 0.48), V2(0.09, 0.525), V2(0.001, 0.535)]
    : [V2(0.001, 0), V2(0.215, 0.02), V2(0.225, 0.12), V2(0.245, 0.24), V2(0.272, 0.34), V2(0.272, 0.42), V2(0.21, 0.49), V2(0.1, 0.53), V2(0.001, 0.54)];
  return new THREE.SplineCurve(pts).getPoints(40);
}
function band(pr, y0, y1, k, phiS = 0, phiL = Math.PI * 2, seg = 40) {
  const rAt = (y) => { for (let i = 1; i < pr.length; i++) { const a = pr[i - 1], b = pr[i]; if ((y - a.y) * (y - b.y) <= 0 && a.y !== b.y) return a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y); } return pr[0].x; };
  const n = Math.max(2, Math.ceil((y1 - y0) / 0.012) + 1), pts = [];
  for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * i / (n - 1); pts.push(V2(rAt(y) * k, y)); }
  return new THREE.LatheGeometry(pts, seg, phiS, phiL);
}
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
let LOGO = {};
function logoTex(col) {
  if (LOGO[col]) return LOGO[col];
  return (LOGO[col] = canvasTex(256, 96, (x, w, h) => { x.fillStyle = col; x.font = '900 70px Inter, Arial Black, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('MFC', w / 2, h / 2 + 4); }));
}

/* ---------- construction du personnage ---------- */
function build(cfg) {
  const c = Object.assign({}, DEFAULT, cfg), sx = c.sex === 'f' ? 'f' : 'h', T = tierFor(c.level);
  STYLE = c.style === 'cartoon' ? 'cartoon' : 'doux';
  const skin = M(c.skin, 'skin'), skinD = M(shade(c.skin, 0.88), 'skin'), hairM = M(c.hairColor, 'hair');
  const topM = M(T.topC), botM = M(T.botC), stripeM = M(T.stripe);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const J = {}; // articulations animées
  const pr = profile(sx), K = sx === 'f' ? 0.93 : 1;

  /* --- bassin + torse --- */
  const pelvis = mesh(sph(1), botM, { p: [0, 0.715, 0], s: [sx === 'f' ? 0.255 : 0.245, 0.17, 0.185] }); body.add(pelvis);
  const spine = new THREE.Group(); spine.position.y = 0.74; body.add(spine); J.spine = spine;
  const torsoG = new THREE.Group(); torsoG.scale.z = 0.74; spine.add(torsoG);
  torsoG.add(mesh(new THREE.LatheGeometry(pr, 48), topM));
  if (T.logo && !T.medal) {
    const lm = new THREE.MeshBasicMaterial({ map: logoTex(T.logo), transparent: true, depthWrite: false });
    if (STYLE === 'doux') { lm.color = new THREE.Color(1.15, 1.15, 1.15); }
    torsoG.add(mesh(band(pr, 0.25, 0.37, 1.012, -0.5, 1.0, 16), lm, { ol: false }));
  }
  if (T.top === 'jacket') {
    torsoG.add(mesh(band(pr, 0.03, 0.49, 1.008, -0.025, 0.05, 4), M(T.zip), { ol: false }));
    torsoG.add(mesh(band(pr, 0.44, 0.5, 1.02), M(T.sleeveStripe), { ol: false }));
  }
  if (T.top === 'compress' && !T.armor) torsoG.add(mesh(band(pr, 0.4, 0.47, 1.01, 0.9, 1.4), M(T.sleeveStripe || C.gold), { ol: false }));
  if (T.armor) {
    const am = M(metalCol(T.armor), metalKind(T.armor)), trim = M(T.armor === 'gold' ? C.goldL : C.gold, T.glow ? 'shine' : 'gold');
    torsoG.add(mesh(band(pr, 0.12, 0.47, 1.075), am, { ol: false }));
    torsoG.add(mesh(band(pr, 0.11, 0.135, 1.09), trim, { ol: false }));
    torsoG.add(mesh(band(pr, 0.455, 0.475, 1.085), trim, { ol: false }));
    torsoG.add(mesh(band(pr, 0.17, 0.43, 1.088, -0.03, 0.06, 4), trim, { ol: false }));
    // emblème
    const em = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 6), trim, { p: [0, 0.33, 0.29], r: [Math.PI / 2, 0, 0] }); em.scale.z = 1.3; torsoG.add(em);
  }
  if (T.belt) {
    const bm = M(T.belt === 'champ' ? C.gold : C.gold, 'gold');
    torsoG.add(mesh(band(pr, 0.0, 0.075, 1.07), T.belt === 'champ' ? M(C.black) : M(C.navyD), { ol: false }));
    const plate = T.belt === 'champ' ? [0.17, 0.12] : [0.08, 0.06];
    const bk = mesh(new THREE.BoxGeometry(plate[0], plate[1], 0.04), bm, { p: [0, 0.04, 0.245] }); bk.scale.z = 1 / 0.74; torsoG.add(bk);
  }
  // cou
  spine.add(mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.14, 20), skin, { p: [0, 0.57, 0] }));
  if (T.medal) {
    const rib = mesh(new THREE.TorusGeometry(0.14, 0.012, 8, 40), M(C.red), { p: [0, 0.47, 0.05], r: [1.15, 0, 0], ol: false }); rib.scale.set(0.9, 1.6, 1); rib.position.y = 0.4; spine.add(rib);
    spine.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.018, 28), M(C.gold, 'gold'), { p: [0, 0.22, 0.2], r: [Math.PI / 2 - 0.12, 0, 0] }));
  }
  if (T.cape) {
    const cg = new THREE.Group(); cg.position.set(0, 0.47, -0.08); spine.add(cg); J.cape = cg;
    const g = new THREE.CylinderGeometry(0.24, 0.48, 1.12, 32, 6, true, Math.PI - 1.25, 2.5);
    const outer = mesh(g, M(T.cape), { p: [0, -0.56, 0], ol: false }); outer.material = M(T.cape).clone(); outer.material.side = THREE.FrontSide; outer.scale.z = 0.7; cg.add(outer);
    const inner = mesh(g, M(T.capeIn, T.glow ? 'shine' : 'cloth').clone(), { p: [0, -0.56, 0], ol: false }); inner.material.side = THREE.BackSide; inner.scale.z = 0.7; cg.add(inner);
    cg.add(mesh(new THREE.TorusGeometry(0.2, 0.03, 10, 32, Math.PI * 1.4), M(C.gold, 'gold'), { p: [0, 0.0, 0.06], r: [Math.PI / 2, 0, Math.PI * 0.8 + 0.0] }));
  }
  if (T.wings) {
    const shape = new THREE.Shape(); shape.moveTo(0, 0);
    shape.bezierCurveTo(0.25, 0.35, 0.75, 0.62, 1.05, 0.55); shape.bezierCurveTo(0.9, 0.42, 0.95, 0.32, 0.86, 0.26);
    shape.bezierCurveTo(0.8, 0.16, 0.86, 0.06, 0.74, 0.02); shape.bezierCurveTo(0.66, -0.08, 0.68, -0.2, 0.55, -0.22);
    shape.bezierCurveTo(0.4, -0.3, 0.2, -0.2, 0, 0);
    const wg = new THREE.ShapeGeometry(shape, 24);
    const tex = canvasTex(64, 64, (x) => { const gr = x.createLinearGradient(0, 64, 64, 0); gr.addColorStop(0, 'rgba(255,214,110,0.95)'); gr.addColorStop(1, 'rgba(255,248,220,0.35)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); });
    const wm = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    J.wings = [];
    [1, -1].forEach((s) => { const w = new THREE.Group(); w.position.set(0.06 * s, 0.38, -0.2); w.scale.set(s * 0.95, 0.95, 1); const m = mesh(wg, wm, { ol: false }); w.add(m); spine.add(w); J.wings.push(w); });
  }

  /* --- bras --- */
  J.sh = []; J.el = [];
  [1, -1].forEach((s) => {
    const sh = new THREE.Group(); sh.position.set(0.275 * s * K, 0.415, 0); spine.add(sh); J.sh.push(sh);
    const longSleeve = T.top === 'jacket' || T.top === 'compress';
    sh.add(mesh(sph(0.098 * K), topM, { s: [1, 0.95, 0.9] }));
    sh.add(mesh(cap(0.07 * K, 0.14), longSleeve ? topM : skin, { p: [0, -0.13, 0] }));
    if (!longSleeve) sh.add(mesh(cap(0.088 * K, 0.05), topM, { p: [0, -0.065, 0] }));
    if (longSleeve && T.sleeveStripe) sh.add(mesh(new THREE.CylinderGeometry(0.073 * K, 0.073 * K, 0.04, 20), M(T.sleeveStripe), { p: [0, -0.1, 0], ol: false }));
    if (T.pads) {
      const pk = T.pads === 'silver' ? 'metal' : 'gold', pc = T.pads === 'silver' ? C.silver : C.gold;
      const pad = mesh(new THREE.SphereGeometry(0.135, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), M(pc, pk), { p: [0.02 * s, 0.01, 0], r: [0, 0, -0.35 * s] }); pad.scale.set(1, 0.75, 1); sh.add(pad);
      if (T.pads === 'gold2') { const p2 = mesh(new THREE.SphereGeometry(0.15, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), M(C.goldL, 'shine'), { p: [0.05 * s, -0.04, 0], r: [0, 0, -0.6 * s] }); p2.scale.set(1, 0.55, 1); sh.add(p2); }
    }
    const el = new THREE.Group(); el.position.y = -0.27; sh.add(el); J.el.push(el);
    el.add(mesh(sph(0.066 * K), longSleeve ? topM : skin));
    el.add(mesh(cap(0.064 * K, 0.12), longSleeve ? topM : skin, { p: [0, -0.115, 0] }));
    if (T.wrist) el.add(mesh(new THREE.CylinderGeometry(0.076 * K, 0.076 * K, 0.065, 20), M(T.wrist), { p: [0, -0.2, 0] }));
    if (T.gaunt) {
      el.add(mesh(new THREE.CylinderGeometry(0.083, 0.074, 0.15, 20), M(metalCol(T.gaunt), metalKind(T.gaunt)), { p: [0, -0.15, 0] }));
      el.add(mesh(new THREE.TorusGeometry(0.083, 0.012, 8, 24), M(T.glow ? C.goldL : C.gold, T.glow ? 'shine' : 'gold'), { p: [0, -0.08, 0], r: [Math.PI / 2, 0, 0], ol: false }));
    }
    const hm = T.gloves ? M(T.gloves) : T.gaunt ? M(metalCol(T.gaunt), metalKind(T.gaunt)) : skin;
    el.add(mesh(sph(0.082 * K), hm, { p: [0, -0.27, 0.005], s: [0.95, 1.05, 0.85] }));
    el.add(mesh(sph(0.033 * K), hm, { p: [-0.045 * s, -0.245, 0.055] }));
  });

  /* --- jambes --- */
  J.hip = []; J.knee = [];
  [1, -1].forEach((s) => {
    const hip = new THREE.Group(); hip.position.set(0.12 * s * (sx === 'f' ? 1.05 : 1), 0.68, 0); body.add(hip); J.hip.push(hip);
    const pants = T.bottom === 'pants';
    hip.add(mesh(cap(0.1, 0.16), pants ? botM : skin, { p: [0, -0.17, 0] }));
    if (!pants) {
      hip.add(mesh(cap(0.122, 0.06), botM, { p: [0, -0.09, 0] }));
      hip.add(mesh(new THREE.CylinderGeometry(0.1235, 0.1235, 0.17, 12, 1, true, Math.PI / 2 * s - 0.12, 0.24), stripeM, { p: [0, -0.09, 0], ol: false }));
    } else {
      hip.add(mesh(cap(0.112, 0.17), botM, { p: [0, -0.16, 0] }));
      hip.add(mesh(new THREE.CylinderGeometry(0.113, 0.1, 0.56, 12, 1, true, Math.PI / 2 * s - 0.1, 0.2), stripeM, { p: [0, -0.33, 0], ol: false }));
    }
    const knee = new THREE.Group(); knee.position.y = -0.33; hip.add(knee); J.knee.push(knee);
    knee.add(mesh(sph(0.087), pants ? botM : skin));
    knee.add(mesh(cap(0.085, 0.13), pants ? botM : skin, { p: [0, -0.13, 0] }));
    if (pants) knee.add(mesh(cap(0.096, 0.12), botM, { p: [0, -0.11, 0] }));
    if (T.sock && !pants) knee.add(mesh(new THREE.CylinderGeometry(0.086, 0.08, 0.1, 20), M(T.sock), { p: [0, -0.2, 0] }));
    if (T.boots) {
      const bm = M(metalCol(T.boots), metalKind(T.boots));
      knee.add(mesh(new THREE.CylinderGeometry(0.105, 0.098, 0.2, 22), bm, { p: [0, -0.16, 0.0] }));
      knee.add(mesh(new THREE.SphereGeometry(0.11, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), bm, { p: [0, -0.02, 0.03], s: [1, 0.6, 0.9] }));
    }
    const shoeM = M(T.boots ? metalCol(T.boots) : T.shoe, T.boots ? metalKind(T.boots) : /D4AF37/i.test(T.shoe) ? 'gold' : 'shoe');
    knee.add(mesh(sph(1), shoeM, { p: [0, -0.265, 0.05], s: [0.12, 0.085, 0.19] }));
    knee.add(mesh(sph(1), M(T.sole, 'shoe'), { p: [0, -0.315, 0.05], s: [0.126, 0.036, 0.196] }));
  });

  /* --- tête --- */
  const headG = new THREE.Group(); headG.position.y = 0.6; spine.add(headG); J.head = headG;
  const R = 0.44, HS = [1.04, 0.98, 0.96], HC = new THREE.Vector3(0, 0.38, 0);
  const face = new THREE.Group(); face.position.copy(HC); headG.add(face);
  face.add(mesh(sph(R, 48, 36), skin, { s: HS }));
  const onHead = (x, y, lift = 0) => {
    const ex = x / (HS[0] * R), ey = y / (HS[1] * R), z = HS[2] * R * Math.sqrt(Math.max(0, 1 - ex * ex - ey * ey));
    const n = new THREE.Vector3(x / (HS[0] * HS[0]), y / (HS[1] * HS[1]), z / (HS[2] * HS[2])).normalize();
    const g = new THREE.Group(); g.position.set(x, y, z).addScaledVector(n, lift); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); face.add(g); return g;
  };
  // yeux
  J.eyes = [];
  [1, -1].forEach((s) => {
    const e = onHead(0.155 * s, -0.03, -0.012); J.eyes.push(e);
    e.add(mesh(sph(0.088), M('#FFFFFF', STYLE === 'cartoon' ? 'basic' : 'eye'), { s: [0.85, 1.05, 0.42], ol: false }));
    e.add(mesh(sph(0.064), M(c.eyes, 'eye'), { p: [0, -0.008, 0.022], s: [0.9, 1.05, 0.42], ol: false }));
    e.add(mesh(sph(0.036), M('#0C0E14', 'basic'), { p: [0, -0.008, 0.035], s: [0.95, 1.05, 0.35], ol: false }));
    e.add(mesh(sph(0.019), M('#FFFFFF', 'basic'), { p: [0.022, 0.024, 0.045], ol: false }));
    e.add(mesh(sph(0.009), M('#FFFFFF', 'basic'), { p: [-0.02, -0.03, 0.045], ol: false }));
    if (sx === 'f') {
      const l = mesh(cap(0.011, 0.05), M('#141018', 'basic'), { p: [0.075 * s, 0.055, 0.02], r: [0, 0, 0.9 * s], ol: false }); e.add(l);
      e.add(mesh(new THREE.TorusGeometry(0.075, 0.009, 6, 20, Math.PI * 0.75), M('#141018', 'basic'), { p: [0, -0.005, 0.03], r: [0, 0, Math.PI * 0.12], ol: false }));
    }
    const brow = onHead(0.16 * s, 0.135, 0.005);
    brow.add(mesh(cap(0.017, 0.085), M(shade(c.hairColor, 0.85), 'hair'), { r: [0, 0, Math.PI / 2 + 0.1 * s], ol: false })); (J.brows = J.brows || []).push(brow);
    // joues + oreilles
    const ch = onHead(0.25 * s, -0.13, 0.002);
    const blush = new THREE.MeshBasicMaterial({ color: '#FF7F86', transparent: true, opacity: STYLE === 'cartoon' ? 0.4 : 0.28, depthWrite: false });
    ch.add(mesh(new THREE.CircleGeometry(0.05, 24), blush, { s: [1.2, 0.8, 1], ol: false }));
    face.add(mesh(sph(0.085), skin, { p: [R * HS[0] * 0.97 * s, -0.04, -0.02], s: [0.45, 1, 0.75] }));
  });
  onHead(0, -0.09, -0.01).add(mesh(sph(0.036), skinD, { s: [1.1, 0.85, 0.9], ol: false }));
  const mouth = onHead(0, -0.2, 0.0); J.mouth = mouth;
  const lip = M(sx === 'f' ? '#8E2F3A' : '#5A2422', 'basic');
  J.smile = mesh(new THREE.TorusGeometry(0.058, 0.012, 8, 24, Math.PI), lip, { r: [0, 0, Math.PI], ol: false }); mouth.add(J.smile);
  J.grin = new THREE.Group(); mouth.add(J.grin); J.grin.visible = false;
  J.grin.add(mesh(new THREE.CircleGeometry(0.075, 28, Math.PI, Math.PI), M('#5A1E24', 'basic'), { ol: false }));
  J.grin.add(mesh(new THREE.CircleGeometry(0.05, 28, Math.PI, Math.PI), M('#E86A78', 'basic'), { p: [0, -0.02, 0.001], s: [1, 0.6, 1], ol: false }));
  J.sad = mesh(new THREE.TorusGeometry(0.05, 0.011, 8, 24, Math.PI), lip, { p: [0, -0.04, 0], ol: false }); mouth.add(J.sad); J.sad.visible = false;

  /* --- cheveux --- */
  hair(face, c.hair, hairM, R, HS);
  if (T.headband) { const hy = 0.16, hr = Math.sqrt((R * 1.075) ** 2 - hy * hy); const hb = mesh(new THREE.TorusGeometry(hr, 0.032, 12, 48), M(T.headband), { p: [0, hy * HS[1], -0.01], r: [Math.PI / 2 - 0.12, 0, 0] }); hb.scale.set(HS[0], HS[2], 1); face.add(hb); }
  if (T.halo) { const h = mesh(new THREE.TorusGeometry(0.27, 0.022, 12, 48), M(C.goldL, 'shine'), { p: [0, R + 0.12, -0.05], r: [Math.PI / 2 - 0.25, 0, 0], ol: false }); face.add(h); J.halo = h; }

  /* --- contours (style cartoon) --- */
  if (STYLE === 'cartoon') {
    const list = []; root.traverse((m) => { if (m.isMesh && m.userData.ol !== false && !m.material.transparent) list.push(m); });
    list.forEach((m) => { const o = new THREE.Mesh(m.geometry, OUTLINE); o.userData.ol = false; m.add(o); });
  }
  root.userData = { J, tier: T };
  return root;
}

function hair(face, style, hm, R, HS) {
  const hg = new THREE.Group(); hg.scale.set(HS[0], HS[1], HS[2]); face.add(hg);
  const add = (m) => { hg.add(m); return m; };
  // calotte : dessus complet jusqu'à la ligne du front (tf), puis côtés/arrière jusqu'à tb, avec une ouverture pour le visage (w)
  const skull = (k, w, tf, tb) => {
    add(mesh(new THREE.SphereGeometry(R * k, 48, 20, 0, Math.PI * 2, 0, tf), hm));
    add(mesh(new THREE.SphereGeometry(R * k, 48, 20, Math.PI / 2 + w / 2, Math.PI * 2 - w, tf - 0.01, tb - tf + 0.01), hm));
  };
  const dir = (x, y, z) => new THREE.Vector3(x, y, z).normalize();
  const on = (d, k, r, s = [1, 1, 1]) => { const m = mesh(sph(r, 24, 16), hm, { s }); m.position.copy(d).multiplyScalar(R * k); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d); return add(m); };
  const hm2 = hm.clone(); hm2.side = THREE.DoubleSide;
  const shell = (k, w, t0, t1, sy = 1, py = 0) => add(mesh(new THREE.SphereGeometry(R * k, 48, 24, Math.PI / 2 + w / 2, Math.PI * 2 - w, t0, t1 - t0), hm2, { p: [0, py, 0], s: [1, sy, 1], ol: false }));
  switch (style) {
    case 'rase':
      skull(1.018, 2.3, 1.02, 1.6);
      break;
    case 'pique': {
      skull(1.05, 2.3, 1.0, 1.5);
      [[0, 0.95, 0.15], [0.3, 0.85, 0.25], [-0.3, 0.85, 0.25], [0.18, 0.9, -0.3], [-0.18, 0.9, -0.3], [0.5, 0.7, -0.1], [-0.5, 0.7, -0.1], [0, 0.7, 0.6], [0.28, 0.6, 0.6], [-0.28, 0.6, 0.6], [0, 0.6, -0.7]].forEach(([x, y, z]) => {
        const n = dir(x, y, z); const c = mesh(new THREE.ConeGeometry(0.08, 0.22, 16), hm);
        c.position.copy(n).multiplyScalar(R * 1.02); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n.clone().add(new THREE.Vector3(0, 0.35, -0.3)).normalize()); add(c);
      });
      break;
    }
    case 'boucles': {
      skull(1.04, 2.3, 1.0, 1.65);
      const N = 80; for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 1.3, r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.39996;
        const p = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r); if (p.z > 0.2 && p.y < 0.5) continue; if (p.y < 0 && p.z > -0.35) continue;
        on(p.normalize(), 1.08, 0.09);
      }
      break;
    }
    case 'queue': {
      skull(1.05, 2.2, 0.98, 1.75);
      on(dir(-0.25, 0.62, 0.75), 1.04, 0.14, [1.9, 0.75, 0.55]);
      on(dir(0.3, 0.55, 0.78), 1.04, 0.11, [1.4, 0.7, 0.55]);
      add(mesh(new THREE.TorusGeometry(0.08, 0.028, 10, 24), M(C.gold, 'gold'), { p: [0, 0.2, -R * 1.05], r: [0.35, 0, 0] }));
      for (let i = 0; i < 7; i++) add(mesh(sph(0.115 - i * 0.008, 24, 16), hm, { p: [0, 0.16 - i * 0.095, -R * 1.08 - 0.06 - Math.sin(i * 0.55) * 0.07], s: [1, 1.2, 1] }));
      break;
    }
    case 'long': {
      skull(1.05, 2.2, 0.98, 1.75);
      shell(1.1, 2.1, 0.7, 2.45, 1.32, -0.12);
      on(dir(-0.25, 0.62, 0.75), 1.04, 0.14, [1.9, 0.75, 0.55]);
      on(dir(0.3, 0.55, 0.78), 1.04, 0.11, [1.4, 0.7, 0.55]);
      [1, -1].forEach((s) => add(mesh(cap(0.075, 0.42), hm, { p: [0.4 * s, -0.22, 0.1], r: [0.12, 0, 0.06 * s] })));
      break;
    }
    case 'carre': {
      skull(1.05, 2.2, 0.98, 1.75);
      shell(1.12, 2.15, 0.75, 2.05, 1.02, -0.02);
      on(dir(0, 0.6, 0.8), 1.04, 0.14, [2.6, 0.7, 0.5]);
      break;
    }
    case 'chignon': {
      skull(1.04, 2.2, 0.98, 1.7);
      add(mesh(sph(0.17, 28, 20), hm, { p: [0, R * 0.95, -R * 0.45] }));
      add(mesh(new THREE.TorusGeometry(0.13, 0.024, 10, 28), M(C.gold, 'gold'), { p: [0, R * 0.86, -R * 0.37], r: [0.95, 0, 0] }));
      on(dir(-0.2, 0.62, 0.76), 1.04, 0.13, [1.8, 0.7, 0.55]);
      break;
    }
    default: { // court
      skull(1.06, 2.35, 1.0, 1.5);
      on(dir(-0.12, 0.66, 0.74), 1.05, 0.15, [1.9, 0.85, 0.6]);
      on(dir(0.28, 0.72, 0.62), 1.06, 0.12, [1.3, 0.8, 0.6]);
    }
  }
}

/* ---------- scène ---------- */
let S = null; const R_HEAD = 0.44;
function scene() {
  if (S) return S;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2.5, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  const hemi = new THREE.HemisphereLight('#E4ECFF', '#2A2440', 1.0); sc.add(hemi);
  const key = new THREE.DirectionalLight('#FFF0DE', 2.3); key.position.set(1.8, 3.4, 3.2); sc.add(key);
  const fill = new THREE.DirectionalLight('#C9D6FF', 0.7); fill.position.set(-2.5, 1.5, 2.5); sc.add(fill);
  const rimG = new THREE.DirectionalLight('#FFC861', 2.2); rimG.position.set(-2.6, 2.2, -2.4); sc.add(rimG);
  const rimB = new THREE.DirectionalLight('#6A96FF', 1.8); rimB.position.set(2.6, 1.6, -2.2); sc.add(rimB);
  const stage = new THREE.Group(); sc.add(stage);
  stage.add(mesh(new THREE.CylinderGeometry(0.82, 0.88, 0.08, 64), new THREE.MeshStandardMaterial({ color: '#16224A', roughness: 0.8, envMapIntensity: 0.2 }), { p: [0, -0.04, 0] }));
  const ring = mesh(new THREE.TorusGeometry(0.84, 0.014, 8, 128), new THREE.MeshBasicMaterial({ color: '#FFD36B' }), { r: [Math.PI / 2, 0, 0], p: [0, 0.002, 0] }); stage.add(ring);
  const glowTex = canvasTex(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 6, 64, 64, 64); g.addColorStop(0, 'rgba(255,210,100,.6)'); g.addColorStop(0.6, 'rgba(212,175,55,.16)'); g.addColorStop(1, 'rgba(212,175,55,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
  const floorGlow = mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), { r: [-Math.PI / 2, 0, 0], p: [0, 0.004, 0] }); stage.add(floorGlow);
  const shTex = canvasTex(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(0.5, 'rgba(0,0,0,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
  const shadow = mesh(new THREE.PlaneGeometry(0.85, 0.7), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false }), { r: [-Math.PI / 2, 0, 0], p: [0, 0.008, 0.02] }); stage.add(shadow);
  // aura (palier 100)
  const aura = new THREE.Group(); sc.add(aura);
  const backGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 })); backGlow.scale.set(3.2, 3.6, 1); backGlow.position.set(0, 1.15, -0.6); aura.add(backGlow);
  const dotTex = canvasTex(32, 32, (x) => { const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,240,190,1)'); g.addColorStop(1, 'rgba(255,200,80,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); });
  const N = 90, pos = new Float32Array(N * 3), seed = [];
  for (let i = 0; i < N; i++) { seed.push([Math.random() * Math.PI * 2, 0.45 + Math.random() * 0.5, Math.random() * 2.4, 0.25 + Math.random() * 0.5]); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ map: dotTex, size: 0.07, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); aura.add(pts);
  const ring2 = mesh(new THREE.TorusGeometry(0.62, 0.02, 8, 96), new THREE.MeshBasicMaterial({ color: '#FFE9A8', transparent: true, blending: THREE.AdditiveBlending }), { r: [Math.PI / 2, 0, 0], p: [0, 0.01, 0] }); aura.add(ring2);
  S = { renderer, sc, cam, hemi, key, fill, rimG, rimB, stage, ring, floorGlow, aura, pts, seed, ring2, backGlow, host: null, av: null, yaw: 0.3, vyaw: 0, drag: null, clock: new THREE.Clock(), act: null, blinkAt: 2, cfg: null };
  return S;
}

/* ---------- animation ---------- */
const ACTS = {
  salut: { dur: 2.2, pose: (p, t) => ({ sh1z: -2.65, sh1x: 0, el1z: -0.35 + Math.sin(t * 11) * 0.45, headZ: 0.12, mouth: 'grin' }) },
  biceps: { dur: 2.2, pose: () => ({ sh0z: 1.45, sh1z: -1.45, el0z: 1.75, el1z: -1.75, sh0x: 0, sh1x: 0, mouth: 'grin', squash: 1 }) },
  victoire: { dur: 1.8, pose: (p) => ({ sh0z: 2.75, sh1z: -2.75, el0z: 0.2, el1z: -0.2, jump: Math.max(0, Math.sin(Math.min(1, p * 1.6) * Math.PI)) * 0.32, mouth: 'grin', knee: -Math.max(0, Math.sin(Math.min(1, p * 1.6) * Math.PI)) * 0.6 }) },
  triste: { dur: 2.2, pose: () => ({ headX: 0.32, sh0z: 0.04, sh1z: -0.04, sh0x: 0.15, sh1x: 0.15, spineX: 0.12, mouth: 'sad', brow: 1 }) },
};
function tick() {
  const s = S; if (!s.host) return; s.raf = requestAnimationFrame(tick);
  const dt = Math.min(0.05, s.clock.getDelta()), t = s.clock.elapsedTime;
  if (!s.drag) { s.yaw += s.vyaw; s.vyaw *= 0.93; if (Math.abs(s.vyaw) < 0.0005) s.yaw += (0.3 - s.yaw) * 0.01; }
  const av = s.av;
  if (av) {
    av.rotation.y = s.yaw; const J = av.userData.J;
    // pose de repos
    const P = { sh0z: 0.12 + Math.sin(t * 1.7) * 0.025, sh1z: -0.12 - Math.sin(t * 1.7) * 0.025, sh0x: Math.sin(t * 1.1) * 0.05, sh1x: -Math.sin(t * 1.1) * 0.05, el0z: 0.08, el1z: -0.08, headX: Math.sin(t * 0.9) * 0.03, headZ: Math.sin(t * 0.7) * 0.04, spineX: 0, jump: 0, knee: 0 };
    let mouth = 'smile', brow = 0, e = 0;
    if (s.act) {
      const a = ACTS[s.act.n], p = (t - s.act.t0) / a.dur;
      if (p >= 1) s.act = null; else {
        e = Math.min(1, p * 5, (1 - p) * 5); e = e * e * (3 - 2 * e);
        const q = a.pose(p, t); Object.keys(q).forEach((k) => { if (typeof q[k] === 'number') P[k] = (P[k] || 0) * (1 - e) + q[k] * e; });
        if (e > 0.3) { mouth = q.mouth || mouth; brow = q.brow || 0; }
      }
    }
    J.sh[0].rotation.set(P.sh0x, 0, P.sh0z); J.sh[1].rotation.set(P.sh1x, 0, P.sh1z);
    J.el[0].rotation.set(0, 0, P.el0z); J.el[1].rotation.set(0, 0, P.el1z);
    J.head.rotation.set(P.headX, 0, P.headZ); J.spine.rotation.x = P.spineX;
    const breath = Math.sin(t * 2.2);
    J.spine.scale.set(1 + breath * 0.008, 1 + breath * 0.012, 1 + breath * 0.008);
    av.children[0].position.y = P.jump + Math.max(0, breath) * 0.004;
    J.knee.forEach((k) => (k.rotation.x = -P.knee)); J.hip.forEach((h) => (h.rotation.x = P.knee * 0.5));
    J.smile.visible = mouth === 'smile'; J.grin.visible = mouth === 'grin'; J.sad.visible = mouth === 'sad';
    J.brows.forEach((b, i) => (b.children[0].rotation.z = Math.PI / 2 + (i ? -1 : 1) * (0.1 - brow * 0.4)));
    // clignement
    if (t > s.blinkAt) { const k = (t - s.blinkAt) / 0.14; const sy = k < 1 ? Math.abs(1 - 2 * k) * 0.9 + 0.1 : 1; J.eyes.forEach((g) => (g.scale.y = sy)); if (k >= 1) s.blinkAt = t + 2.2 + Math.random() * 2.8; }
    if (J.cape) J.cape.rotation.x = 0.1 + Math.sin(t * 1.6) * 0.035 + P.jump * 0.8;
    if (J.wings) J.wings.forEach((w, i) => { w.rotation.y = (i ? -1 : 1) * (0.55 + Math.sin(t * 2.2) * 0.12); w.rotation.z = (i ? -1 : 1) * 0.15; });
    if (J.halo) { J.halo.rotation.z = t * 0.8; J.halo.position.y = R_HEAD + 0.12 + Math.sin(t * 2) * 0.015; }
    // aura
    if (s.aura.visible) {
      const a = s.pts.geometry.attributes.position;
      s.seed.forEach(([ang, rad, h0, sp], i) => { const h = (h0 + t * sp) % 2.4; a.setXYZ(i, Math.cos(ang + t * 0.3) * rad, h, Math.sin(ang + t * 0.3) * rad); });
      a.needsUpdate = true; s.ring2.scale.setScalar(1 + (t * 0.5 % 1) * 0.5); s.ring2.material.opacity = 1 - (t * 0.5 % 1);
      s.backGlow.material.opacity = 0.75 + Math.sin(t * 2) * 0.15;
    }
  }
  s.renderer.render(s.sc, s.cam);
}
function resize() { const s = S; if (!s || !s.host) return; const w = s.host.clientWidth || 300, h = s.host.clientHeight || 400; s.renderer.setSize(w, h, false); s.cam.aspect = w / h; const d = w / h < 0.7 ? 6.6 : 5.8; s.cam.position.set(0, 1.32, d); s.cam.lookAt(0, 1.08, 0); s.cam.updateProjectionMatrix(); }
function bindTouch(el) {
  const s = S; el.style.touchAction = 'pan-y';
  el.addEventListener('pointerdown', (e) => { s.drag = { x: e.clientX, last: e.clientX }; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', (e) => { if (!s.drag) return; const dx = e.clientX - s.drag.last; s.drag.last = e.clientX; s.yaw += dx * 0.012; s.vyaw = dx * 0.012; });
  const up = () => { s.drag = null; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
}
function dispose(o) { o.traverse((m) => { if (m.isMesh && m.geometry) m.geometry.dispose(); }); }

const API = {
  TIERS, tierFor,
  mount(host, cfg, opts = {}) {
    const s = scene(); s.host = host; host.appendChild(s.renderer.domElement); s.renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
    bindTouch(s.renderer.domElement); s.ro = new ResizeObserver(resize); s.ro.observe(host); resize();
    API.update(cfg); tick(); if (opts.onReady) opts.onReady();
  },
  update(cfg) {
    const s = scene(); s.cfg = Object.assign({}, DEFAULT, s.cfg, cfg);
    const st = s.cfg.style === 'cartoon' ? 'cartoon' : 'doux'; if (st !== STYLE || !s.av) clearMats(); STYLE = st;
    if (st === 'doux') { if (!ENV) { const pm = new THREE.PMREMGenerator(s.renderer); ENV = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); } s.sc.environment = ENV; s.sc.environmentIntensity = 0.6; s.hemi.intensity = 0.95; s.key.intensity = 2.3; }
    else { s.sc.environment = null; s.hemi.intensity = 1.35; s.key.intensity = 2.0; }
    if (s.av) { s.sc.remove(s.av); dispose(s.av); }
    s.av = build(s.cfg); s.sc.add(s.av);
    const T = s.av.userData.tier; s.aura.visible = !!T.aura; s.ring.material.color.set(T.glow ? '#FFF1B8' : '#FFD36B');
    return T;
  },
  yaw(v) { const s = scene(); s.yaw = v; s.vyaw = 0; },
  anim(n) { const s = S; if (s && ACTS[n]) s.act = { n, t0: s.clock.elapsedTime }; },
};
window.MFCAvatarToon = API;
export default API;

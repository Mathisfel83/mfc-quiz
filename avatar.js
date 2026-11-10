/* MFC Quiz — avatar 3D (three.js r170). Expose window.MFCAvatar. */
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const V2 = (x, y) => new THREE.Vector2(Math.max(0, x), y);

export const DEFAULT = {
  sex: 'h', frame: 1, cm: 178, kg: 74, mus: 45,
  skin: '#E2AE84', eyes: '#5B3A1E', hair: 'court', hairColor: '#2A1A10', beard: 'non',
  top: 'tshirt', topColor: '#14233F', bottom: 'short', bottomColor: '#0B0F18', shoes: '#F2F2F2',
  outfit: 'base', diploma: 0
};
export const OUTFITS = [
  { id: 'base', n: 'Ma tenue', r: 0, d: 'Ta tenue personnalisée' },
  { id: 'casquette', n: 'Casquette MFC', r: 1, d: 'Ta tenue + la casquette bleu nuit et or' },
  { id: 'or', n: 'Survêtement Or', r: 2, d: 'Noir intégral, bandes dorées' },
  { id: 'labo', n: 'Blouse de labo', r: 3, d: 'Le look du scientifique du sport' },
  { id: 'toge', n: 'Toge de diplômé', r: 4, d: 'Toge, étole dorée et mortier' },
  { id: 'legende', n: 'Armure de Légende', r: 5, d: 'Or massif, cape et couronne de laurier' }
];
export const DIPLOMAS = [null,
  { n: 'Curieux', c: '#4F8BFF' }, { n: 'Initié', c: '#3CC48A' }, { n: 'Analyste', c: '#A06BFF' },
  { n: 'Expert', c: '#D4AF37' }, { n: 'Légende', c: '#FF5A4E' }];

/* ---------- géométrie ---------- */
function taper(r1, r2, len, seg = 22) {
  const p = [], n = 8;
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (Math.PI / 2) * i / n; p.push(V2(Math.cos(a) * r2, -len + Math.sin(a) * r2)); }
  for (let i = 0; i <= n; i++) { const a = (Math.PI / 2) * i / n; p.push(V2(Math.cos(a) * r1, Math.sin(a) * r1)); }
  return new THREE.LatheGeometry(p, seg);
}
function profileLathe(ctrl, from, to, seg = 40) {
  const pts = new THREE.SplineCurve(ctrl.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(70).map((p) => V2(p.x, p.y));
  const sel = pts.filter((p) => p.y >= from && p.y <= to);
  return new THREE.LatheGeometry(sel, seg);
}
function paperTexture(rank) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 360;
  const g = c.getContext('2d'), d = DIPLOMAS[rank] || DIPLOMAS[4];
  const grd = g.createLinearGradient(0, 0, 0, 360); grd.addColorStop(0, '#FBF5E4'); grd.addColorStop(1, '#EFE3C2');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 360);
  g.strokeStyle = '#C9A53A'; g.lineWidth = 10; g.strokeRect(18, 18, 476, 324);
  g.lineWidth = 2; g.strokeRect(32, 32, 448, 296);
  g.fillStyle = '#0B1530'; g.textAlign = 'center';
  g.font = '700 26px Georgia, serif'; g.fillText('MFC QUIZ', 256, 84);
  g.font = '700 52px Georgia, serif'; g.fillText('DIPLÔME', 256, 150);
  g.fillStyle = '#7A5B12'; g.font = 'italic 24px Georgia, serif'; g.fillText('Rang', 256, 192);
  g.fillStyle = d.c; g.font = '700 40px Georgia, serif'; g.fillText(d.n, 256, 238);
  g.fillStyle = d.c; g.beginPath(); g.arc(256, 292, 26, 0, TAU); g.fill();
  g.fillStyle = '#FFF6D6'; g.font = '700 20px Georgia, serif'; g.fillText('★', 256, 299);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
let shadowTex = null;
function getShadowTex() {
  if (shadowTex) return shadowTex;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  r.addColorStop(0, 'rgba(0,0,0,.75)'); r.addColorStop(.55, 'rgba(0,0,0,.35)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  shadowTex = new THREE.CanvasTexture(c); return shadowTex;
}

/* ---------- construction du personnage ---------- */
function build(cfg) {
  const c = Object.assign({}, DEFAULT, cfg || {});
  const mats = [], geos = [];
  const mat = (color, o = {}) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .62, metalness: 0 }, o)); mats.push(m); return m; };
  const mesh = (geo, m) => { geos.push(geo); const x = new THREE.Mesh(geo, m); return x; };

  const fem = c.sex === 'f';
  const H = clamp(c.cm, 140, 210) / 100, m = clamp(c.mus, 0, 100) / 100, bmi = clamp(c.kg, 35, 160) / (H * H);
  const thin = bmi < 21 ? Math.sqrt(bmi / 21) : 1;
  const fat = clamp((bmi - 21) / 13, 0, 1.25) * (1 - 0.55 * m);
  const fatA = fat * 0.075, k = c.frame || 1;
  const s = H / 1.75, ws = Math.pow(s, 0.7) * k * thin;

  // look selon la tenue
  const O = c.outfit || 'base';
  const L = { top: c.top, topColor: c.topColor, bottom: c.bottom, bottomColor: c.bottomColor, shoes: c.shoes, sole: '#FFFFFF', topMetal: 0 };
  if (O === 'or') Object.assign(L, { top: 'sweat', topColor: '#0E0F14', bottom: 'jogging', bottomColor: '#0E0F14', shoes: '#111216', sole: '#D4AF37' });
  if (O === 'labo') Object.assign(L, { top: 'sweat', topColor: '#F3F5F8', bottom: 'jogging', bottomColor: '#1B2A47', shoes: '#F2F2F2' });
  if (O === 'toge') Object.assign(L, { top: 'sweat', topColor: '#121318', bottom: 'jogging', bottomColor: '#121318', shoes: '#111111', sole: '#2A2A2A' });
  if (O === 'legende') Object.assign(L, { top: 'sweat', topColor: '#D4AF37', bottom: 'legging', bottomColor: '#B8902A', shoes: '#E8E8EC', sole: '#D4AF37', topMetal: 1 });

  const skin = mat(c.skin, { roughness: .58 });
  const skinD = mat(new THREE.Color(c.skin).multiplyScalar(.9), { roughness: .6 });
  const metal = L.topMetal ? { metalness: .95, roughness: .28 } : { roughness: .82 };
  const topM = mat(L.topColor, metal);
  const botM = mat(L.bottomColor, L.topMetal ? { metalness: .95, roughness: .32 } : { roughness: L.bottom === 'legging' ? .45 : .85 });
  const hairM = mat(c.hairColor, { roughness: .72 });
  const gold = mat('#D4AF37', { metalness: 1, roughness: .28 });
  const shoeM = mat(L.shoes, { roughness: .45, metalness: L.topMetal ? .9 : 0 });
  const soleM = mat(L.sole, { roughness: .5, metalness: L.sole === '#D4AF37' ? 1 : 0 });

  // repères verticaux
  const hr = 0.142 * Math.pow(s, 0.35);
  const headC = H - hr * 1.08, neckTop = headC - hr * 0.72, shY = neckTop - 0.055 * s;
  const B = shY, hipY = 0.53 * B, waistY = 0.66 * B, chestY = 0.84 * B;
  const bandY = hipY + 0.62 * (waistY - hipY);
  const legLen = hipY, thighL = 0.48 * legLen, shinL = 0.44 * legLen;
  const upL = 0.23 * B, foreL = 0.2 * B;

  // largeurs
  const hipR = ws * (fem ? 0.168 : 0.148) + fatA * 0.9;
  const waistR = ws * (fem ? 0.118 : 0.134) + fatA * 1.25 - m * 0.004 + m * m * 0.012;
  const chestR = ws * (fem ? 0.14 : 0.152) + m * m * 0.05 + m * 0.012 + fatA * 0.55;
  const upR = ws * (fem ? 0.148 : 0.168) + m * m * 0.07 + m * 0.02 + fatA * 0.35;
  const neckR = ws * (fem ? 0.043 : 0.05) + m * m * 0.026 + fatA * 0.2;
  const dz = 0.6 + m * 0.06 + fat * 0.12;
  const armR1 = ws * (fem ? 0.04 : 0.045) + m * m * 0.032 + m * 0.01 + fatA * 0.3, armR2 = ws * 0.035 + m * m * 0.016 + m * 0.004 + fatA * 0.18;
  const foreR1 = ws * 0.036 + m * m * 0.022 + m * 0.006 + fatA * 0.18, foreR2 = ws * 0.026 + m * 0.004 + fatA * 0.05;
  const thR1 = ws * (fem ? 0.088 : 0.08) + m * m * 0.04 + m * 0.01 + fatA * 0.5, thR2 = ws * 0.052 + m * 0.01 + fatA * 0.14;
  const shR1 = ws * 0.05 + m * m * 0.022 + m * 0.006 + fatA * 0.15, shR2 = ws * 0.03 + fatA * 0.04;
  const shX = upR * 0.86 + armR1 * 0.25, legX = hipR * 0.5;

  const root = new THREE.Group();
  const J = {};

  /* torse */
  const torso = new THREE.Group(); torso.scale.z = dz; root.add(torso); J.torso = torso;
  const ctrl = [
    [0, hipY - 0.045], [hipR * 0.72, hipY - 0.035], [hipR, hipY + 0.04], [Math.max(waistR, hipR * 0.93), (hipY + waistY) / 2],
    [waistR, waistY], [lerp(waistR, chestR, .62), (waistY + chestY) / 2], [chestR, chestY], [upR, shY - 0.035],
    [upR * 0.72, shY + 0.008], [neckR * 1.35, shY + 0.028], [0, shY + 0.034]];
  torso.add(mesh(profileLathe(ctrl, -1, bandY + 0.004), botM));
  torso.add(mesh(profileLathe(ctrl, bandY - 0.004, 9), topM));
  // ceinture
  const bandR = (() => { const g = new THREE.SplineCurve(ctrl.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(200); let b = g[0]; g.forEach((p) => { if (Math.abs(p.y - bandY) < Math.abs(b.y - bandY)) b = p; }); return b.x; })();
  const band = mesh(new THREE.TorusGeometry(bandR * 1.005, 0.007, 8, 48), O === 'or' ? gold : botM); band.rotation.x = Math.PI / 2; band.position.y = bandY; torso.add(band);
  // pecs / poitrine / ventre
  if (fem) {
    const br = chestR * (0.44 + fat * 0.12);
    [-1, 1].forEach((sg) => { const b = mesh(new THREE.SphereGeometry(br, 28, 18), topM); b.position.set(sg * chestR * 0.4, chestY - 0.005, chestR * 0.5); b.scale.set(1, .9, .6); torso.add(b); });
  } else if (m > 0.4) {
    const pr = chestR * (0.38 + m * 0.08);
    [-1, 1].forEach((sg) => { const b = mesh(new THREE.SphereGeometry(pr, 28, 18), topM); b.position.set(sg * chestR * 0.34, chestY + 0.02, chestR * 0.56); b.scale.set(1.1, .66, .4); torso.add(b); });
  }
  if (fat > 0.15) {
    const b = mesh(new THREE.SphereGeometry(waistR * 0.82, 28, 20), topM); b.position.set(0, (waistY + bandY) / 2 + 0.01, waistR * (0.02 + 0.2 * fat)); b.scale.set(1, .95, .75); torso.add(b);
  }
  // fermeture éclair / poche / étole
  if (O === 'or' || O === 'legende') { const z = mesh(new THREE.BoxGeometry(0.008, shY - bandY - 0.03, 0.01), O === 'or' ? gold : mat('#8A6B1E', { metalness: 1, roughness: .3 })); z.position.set(0, (shY + bandY) / 2 - 0.01, chestR * 1.0); torso.add(z); }
  if (L.top === 'sweat' && O === 'base') { const p = mesh(new THREE.CapsuleGeometry(0.035 * s, waistR * 1.1, 6, 16), mat(new THREE.Color(L.topColor).multiplyScalar(.82), { roughness: .9 })); p.rotation.z = Math.PI / 2; p.scale.set(1, 1, .22); p.position.set(0, bandY + 0.06, waistR * 0.98 + fatA * .5); torso.add(p); }

  /* cou */
  const neck = mesh(taper(neckR, neckR * 1.08, neckTop - shY), skin); neck.position.y = neckTop + 0.01; root.add(neck);
  if (L.top === 'sweat' && O === 'base') { const hood = mesh(new THREE.TorusGeometry(neckR * 1.9, neckR * 0.55, 12, 32), topM); hood.rotation.x = Math.PI / 2 - 0.25; hood.position.set(0, shY + 0.03, -neckR * 0.5); hood.scale.set(1, 1, .8); root.add(hood); }
  if (O === 'or') { const col = mesh(new THREE.CylinderGeometry(neckR * 1.25, neckR * 1.45, 0.05, 28, 1, true), topM); col.position.y = shY + 0.04; root.add(col); }

  /* bras */
  const sleeveFull = L.top === 'sweat', sleeveShort = L.top === 'tshirt';
  [-1, 1].forEach((sg) => {
    const sh = new THREE.Group(); sh.position.set(sg * shX, shY - 0.03, 0); root.add(sh);
    const del = mesh(new THREE.SphereGeometry(armR1 * (0.98 + 0.22 * m), 24, 16), L.top === 'debardeur' ? skin : topM); del.scale.set(1, 1.05, .95); del.position.set(-sg * armR1 * 0.18, 0.004, 0); sh.add(del);
    const up = mesh(taper(armR1, armR2, upL), sleeveFull ? topM : skin); sh.add(up);
    if (m > 0.3) { const bi = mesh(new THREE.SphereGeometry(armR1 * (0.62 + 0.3 * m), 20, 14), sleeveFull ? topM : skin); bi.position.set(0, -upL * 0.5, armR1 * 0.22); bi.scale.set(.92, 1.45, .92); sh.add(bi); }
    if (sleeveShort) { const sl = mesh(taper(armR1 * 1.14, armR1 * 1.05, upL * 0.42), topM); sh.add(sl); }
    const el = new THREE.Group(); el.position.y = -upL; sh.add(el);
    const bell = O === 'toge' ? 1.45 : 1;
    const fo = mesh(taper(foreR1, foreR2 * bell, foreL), sleeveFull ? topM : skin); el.add(fo);
    if (sleeveFull) { const cuff = mesh(new THREE.TorusGeometry(foreR2 * bell * 1.02, 0.008, 8, 24), O === 'or' ? gold : topM); cuff.rotation.x = Math.PI / 2; cuff.position.y = -foreL + 0.012; el.add(cuff); }
    const hand = new THREE.Group(); hand.position.y = -foreL - 0.035 * s; el.add(hand);
    const palm = mesh(new THREE.SphereGeometry(0.043 * Math.pow(s, .6), 20, 14), skin); palm.scale.set(.82, 1.12, .52); hand.add(palm);
    const th = mesh(new THREE.CapsuleGeometry(0.012 * s, 0.03 * s, 4, 10), skin); th.position.set(-sg * 0.028 * s, 0.008, 0.015); th.rotation.z = sg * 0.6; hand.add(th);
    if (O === 'or') { [up, fo].forEach((g, i) => { const len = i ? foreL : upL, r = i ? (foreR1 + foreR2) / 2 : (armR1 + armR2) / 2; const st = mesh(new THREE.CylinderGeometry(0.005, 0.005, len * 0.95, 6), gold); st.position.set(sg * r * 0.98, -len / 2, 0); (i ? el : sh).add(st); }); }
    J[sg > 0 ? 'lSh' : 'rSh'] = sh; J[sg > 0 ? 'lEl' : 'rEl'] = el; J[sg > 0 ? 'lHand' : 'rHand'] = hand;
  });

  /* jambes */
  const longLeg = L.bottom !== 'short';
  [-1, 1].forEach((sg) => {
    const hp = new THREE.Group(); hp.position.set(sg * legX, hipY + 0.02, 0); root.add(hp);
    const th = mesh(taper(thR1, thR2, thighL), longLeg ? botM : skin); hp.add(th);
    if (m > 0.35) { const q = mesh(new THREE.SphereGeometry(thR1 * (0.55 + 0.3 * m), 20, 14), (longLeg || thighL > 0) ? botM : skin); q.position.set(sg * 0.005, -thighL * 0.4, thR1 * 0.3); q.scale.set(.9, 1.5, .8); hp.add(q); }
    if (!longLeg) { const sh = mesh(taper(thR1 * 1.05 + m * 0.012, thR1 * 0.96 + m * 0.012, thighL * 0.5), botM); hp.add(sh); }
    const kn = new THREE.Group(); kn.position.y = -thighL; hp.add(kn);
    const shin = mesh(taper(shR1, shR2, shinL), longLeg ? botM : skin); shin.position.z = -0.004; kn.add(shin);
    const calf = mesh(new THREE.SphereGeometry(shR1 * 0.95, 18, 12), longLeg ? botM : skin); calf.position.set(0, -shinL * 0.28, -shR1 * 0.25); calf.scale.set(.95, 1.6, .9); kn.add(calf);
    if (L.bottom === 'jogging') { const cf = mesh(new THREE.TorusGeometry(shR2 * 1.05, 0.009, 8, 22), O === 'or' ? gold : botM); cf.rotation.x = Math.PI / 2; cf.position.y = -shinL + 0.02; kn.add(cf); }
    if (O === 'or') { [[th, thighL, hp, (thR1 + thR2) / 2], [shin, shinL, kn, (shR1 + shR2) / 2]].forEach(([, len, g, r]) => { const st = mesh(new THREE.CylinderGeometry(0.006, 0.006, len * 0.95, 6), gold); st.position.set(sg * r * 0.98, -len / 2, 0); g.add(st); }); }
    const shoe = mesh(new THREE.CapsuleGeometry(0.045 * ws, 0.12 * s, 6, 18), shoeM); shoe.rotation.x = Math.PI / 2; shoe.scale.set(1, 1, .72); shoe.position.set(0, -shinL - 0.02 * s, 0.05 * s); kn.add(shoe);
    const sole = mesh(new THREE.CapsuleGeometry(0.048 * ws, 0.12 * s, 6, 18), soleM); sole.rotation.x = Math.PI / 2; sole.scale.set(1, 1, .3); sole.position.set(0, -shinL - 0.043 * s, 0.05 * s); kn.add(sole);
    J[sg > 0 ? 'lHip' : 'rHip'] = hp; J[sg > 0 ? 'lKn' : 'rKn'] = kn;
  });

  /* longs vêtements (blouse, toge, cape) */
  if (O === 'labo' || O === 'toge') {
    const bot = O === 'toge' ? hipY - thighL - shinL * 0.55 : hipY - thighL * 0.78;
    const fl = O === 'toge' ? 1.5 : 1.28;
    const coat = new THREE.LatheGeometry([V2(hipR * fl, bot), V2(hipR * 1.08, hipY), V2(waistR * 1.04 + fatA * .3, bandY), V2(waistR * 1.03, bandY + 0.03)], 40, O === 'labo' ? 0.35 : 0, O === 'labo' ? TAU - 0.7 : TAU);
    const cm = mesh(coat, mat(O === 'toge' ? '#121318' : '#F3F5F8', { roughness: .85, side: THREE.DoubleSide }));
    cm.scale.z = dz * 1.12; root.add(cm);
  }
  if (O === 'toge') {
    [-1, 1].forEach((sg) => { const st = mesh(new THREE.BoxGeometry(0.06 * s, shY - hipY + 0.05, 0.012), gold); st.position.set(sg * chestR * 0.42, (shY + hipY) / 2, 0); st.rotation.z = -sg * 0.08; const g = new THREE.Group(); g.add(st); g.scale.z = 1; st.position.z = (chestR + 0.02) * dz + 0.01; root.add(g); });
  }
  if (O === 'legende') {
    const cape = mesh(new THREE.CylinderGeometry(upR * 1.05, hipR * 1.9, shY - 0.3 * s, 36, 1, true, Math.PI - 1.15, 2.3), mat('#8E1020', { roughness: .7, side: THREE.DoubleSide }));
    cape.position.set(0, (shY + 0.3 * s) / 2, -0.02); cape.scale.z = 0.75; root.add(cape);
    const clasp = mesh(new THREE.TorusGeometry(upR * 1.02, 0.012, 8, 40, Math.PI), gold); clasp.rotation.x = Math.PI / 2; clasp.rotation.z = Math.PI; clasp.position.y = shY - 0.005; clasp.scale.y = .7; root.add(clasp);
  }

  /* tête */
  const head = new THREE.Group(); head.position.y = headC; root.add(head); J.head = head;
  const ea = 0.9 * hr, eb = 1.06 * hr, ec = 0.97 * hr;
  const skull = mesh(new THREE.SphereGeometry(hr, 48, 32), skin); skull.scale.set(.9, 1.06, .97); head.add(skull);
  const surf = (x, y, out = 0) => {
    const z = ec * Math.sqrt(Math.max(0.02, 1 - (x / ea) ** 2 - (y / eb) ** 2));
    const n = new THREE.Vector3(x / (ea * ea), y / (eb * eb), z / (ec * ec)).normalize();
    return { p: new THREE.Vector3(x, y, z).addScaledVector(n, out), n };
  };
  const place = (obj, x, y, out = 0) => { const { p, n } = surf(x, y, out); obj.position.copy(p); obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); head.add(obj); return obj; };
  // yeux
  const white = mat('#FFFFFF', { roughness: .25 }), irisM = mat(c.eyes, { roughness: .3 }), pupM = mat('#0A0A0A', { roughness: .2 }), hiM = new THREE.MeshBasicMaterial({ color: '#FFFFFF' }); mats.push(hiM);
  J.eyes = [];
  [-1, 1].forEach((sg) => {
    const g = new THREE.Group();
    const w = mesh(new THREE.SphereGeometry(hr * 0.15, 24, 16), white); w.scale.set(1, 1.05, .42); g.add(w);
    const ir = mesh(new THREE.CircleGeometry(hr * 0.112, 28), irisM); ir.position.set(0, -hr * 0.008, hr * 0.064); g.add(ir);
    const pu = mesh(new THREE.CircleGeometry(hr * 0.056, 20), pupM); pu.position.set(0, -hr * 0.008, hr * 0.065); g.add(pu);
    const hi = mesh(new THREE.CircleGeometry(hr * 0.026, 12), hiM); hi.position.set(hr * 0.035, hr * 0.03, hr * 0.066); g.add(hi);
    const lid = mesh(new THREE.SphereGeometry(hr * 0.158, 24, 12, 0, TAU, 0, Math.PI * 0.36), skin); lid.scale.set(1, 1.05, .5); lid.rotation.x = 0.35; g.add(lid);
    place(g, sg * hr * 0.33, hr * 0.03, -hr * 0.035); J.eyes.push(g);
    const brow = mesh(new THREE.CapsuleGeometry(hr * (fem ? 0.018 : 0.026), hr * 0.17, 4, 10), hairM); brow.rotation.z = Math.PI / 2;
    const bg = new THREE.Group(); bg.add(brow); place(bg, sg * hr * 0.34, hr * 0.27, hr * 0.004); bg.rotateZ(sg * -0.12);
    const ear = mesh(new THREE.SphereGeometry(hr * 0.19, 18, 12), skin); ear.scale.set(.42, 1, .72); ear.position.set(sg * ea * 0.98, -hr * 0.02, -hr * 0.06); head.add(ear);
    const cheek = mesh(new THREE.CircleGeometry(hr * 0.1, 20), new THREE.MeshBasicMaterial({ color: '#FF7A70', transparent: true, opacity: .16, depthWrite: false })); mats.push(cheek.material);
    place(cheek, sg * hr * 0.5, -hr * 0.22, hr * 0.004);
  });
  const nose = mesh(new THREE.SphereGeometry(hr * 0.09, 18, 12), skinD); nose.scale.set(.85, .95, .8); place(nose, 0, -hr * 0.15, -hr * 0.03);
  // barbe
  const bearded = !fem && c.beard !== 'non';
  if (bearded) {
    const full = c.beard === 'complete';
    const bg = mesh(new THREE.SphereGeometry(hr * (full ? 1.05 : 1.02), 40, 20, Math.PI / 2 - 1.25, 2.5, Math.PI * (full ? 0.6 : 0.64), Math.PI * (full ? 0.32 : 0.26)), hairM);
    bg.scale.set(.92, 1.06, 1.0); head.add(bg);
    const jb = mesh(new THREE.SphereGeometry(hr * 0.8, 28, 16, Math.PI / 2 - 1.4, 2.8, Math.PI * 0.52, Math.PI * 0.42), hairM); jb.position.set(0, -hr * 0.38, hr * 0.12); jb.scale.set(1.03, .8, .99); head.add(jb);
    const mu = mesh(new THREE.CapsuleGeometry(hr * 0.045, hr * 0.2, 4, 10), hairM); mu.rotation.z = Math.PI / 2; const mg = new THREE.Group(); mg.add(mu); place(mg, 0, -hr * 0.29, hr * 0.03);
  }
  const mouth = mesh(new THREE.TorusGeometry(hr * 0.13, hr * 0.024, 8, 20, Math.PI * 0.72), mat('#7A2E2A', { roughness: .5 }));
  mouth.rotation.z = -Math.PI / 2 - Math.PI * 0.36; const mgp = new THREE.Group(); mgp.add(mouth); place(mgp, 0, -hr * 0.38, bearded ? hr * 0.06 : hr * 0.002);
  // cheveux
  const hairShell = (r, cut = 0.56, tilt = -0.42) => { const g = new THREE.SphereGeometry(hr * r, 48, 28, 0, TAU, 0, Math.PI * cut); g.rotateX(tilt); const x = mesh(g, hairM); x.scale.set(.9, 1.06, .97); head.add(x); return x; };
  const st = c.hair;
  if (st === 'rase') { const rm = mat(new THREE.Color(c.hairColor).lerp(new THREE.Color(c.skin), .38), { roughness: 1 }); const g = new THREE.SphereGeometry(hr * 1.012, 48, 28, 0, TAU, 0, Math.PI * 0.55); g.rotateX(-0.45); const x = mesh(g, rm); x.scale.set(.9, 1.06, .97); head.add(x); }
  if (['court', 'long', 'queue', 'chignon', 'boucles', 'afro'].includes(st)) hairShell(st === 'court' ? 1.05 : 1.045);
  if (st === 'court' && O !== 'casquette' && O !== 'toge') { const q = mesh(new THREE.SphereGeometry(hr * 0.5, 28, 18), hairM); q.position.set(hr * 0.12, hr * 0.66, hr * 0.42); q.scale.set(1.35, .42, .75); q.rotation.set(-0.5, 0, -0.18); head.add(q); }
  if (st === 'long') {
    const b = mesh(new THREE.SphereGeometry(hr, 40, 28), hairM); b.position.set(0, -hr * 0.45, -hr * 0.3); b.scale.set(1.08, 1.55, .78); head.add(b);
    [-1, 1].forEach((sg) => { const l = mesh(taper(hr * 0.2, hr * 0.14, hr * 1.25), hairM); l.position.set(sg * hr * 0.8, hr * 0.35, hr * 0.12); l.rotation.z = sg * 0.06; head.add(l); });
  }
  if (st === 'queue') { const t = mesh(taper(hr * 0.24, hr * 0.08, hr * 1.35), hairM); t.position.set(0, hr * 0.45, -hr * 0.92); t.rotation.x = 0.55; head.add(t); const bd = mesh(new THREE.TorusGeometry(hr * 0.2, hr * 0.05, 8, 20), mat('#D4AF37', { metalness: .6, roughness: .4 })); bd.position.set(0, hr * 0.42, -hr * 0.95); bd.rotation.x = Math.PI / 2 + 0.55; head.add(bd); }
  if (st === 'chignon') { const b = mesh(new THREE.SphereGeometry(hr * 0.42, 28, 20), hairM); b.position.set(0, hr * 0.98, -hr * 0.35); head.add(b); }
  if (st === 'boucles' || st === 'afro') {
    const R = st === 'afro' ? 1.22 : 1.04, n = st === 'afro' ? 70 : 46, rr = st === 'afro' ? 0.36 : 0.26;
    for (let i = 0; i < n; i++) {
      const yy = 1 - (i + .5) / n * 1.25, rad = Math.sqrt(Math.max(0, 1 - yy * yy)), th = i * 2.39996;
      const dir = new THREE.Vector3(Math.cos(th) * rad, yy, Math.sin(th) * rad);
      if (dir.z > 0.45 && dir.y < 0.5) continue;
      if (dir.y < -0.15 && dir.z > -0.2) continue;
      const b = mesh(new THREE.SphereGeometry(hr * rr, 14, 10), hairM); b.position.set(dir.x * ea * R, dir.y * eb * R, dir.z * ec * R); head.add(b);
    }
  }
  // accessoires
  if (O === 'casquette') {
    const navy = mat('#13213F', { roughness: .7 });
    const g = new THREE.SphereGeometry(hr * 1.09, 40, 20, 0, TAU, 0, Math.PI * 0.47); g.rotateX(-0.2); const cr = mesh(g, navy); cr.scale.set(.9, 1.0, .97); head.add(cr);
    const vis = mesh(new THREE.CylinderGeometry(hr * 0.78, hr * 0.78, hr * 0.05, 40, 1, false, -1.15, 2.3), navy); vis.position.set(0, hr * 0.42, hr * 0.52); vis.rotation.x = 0.12; head.add(vis);
    const bt = mesh(new THREE.SphereGeometry(hr * 0.08, 12, 8), gold); bt.position.set(0, hr * 1.12, -hr * 0.12); head.add(bt);
    const logo = mesh(new THREE.CircleGeometry(hr * 0.16, 24), gold); place(logo, 0, hr * 0.62, hr * 0.12);
  }
  if (O === 'labo') {
    const gm = mat('#111111', { roughness: .3, metalness: .4 });
    [-1, 1].forEach((sg) => { const r = mesh(new THREE.TorusGeometry(hr * 0.19, hr * 0.02, 8, 28), gm); place(r, sg * hr * 0.33, hr * 0.03, hr * 0.08); });
    const br = mesh(new THREE.CapsuleGeometry(hr * 0.016, hr * 0.15, 4, 8), gm); br.rotation.z = Math.PI / 2; const bg = new THREE.Group(); bg.add(br); place(bg, 0, hr * 0.06, hr * 0.06);
  }
  if (O === 'toge') {
    const blk = mat('#121318', { roughness: .8 });
    const cr = mesh(new THREE.CylinderGeometry(hr * 0.86, hr * 0.92, hr * 0.32, 32), blk); cr.position.y = hr * 0.78; head.add(cr);
    const bd = mesh(new THREE.BoxGeometry(hr * 2.1, hr * 0.06, hr * 2.1), blk); bd.position.y = hr * 0.96; bd.rotation.y = Math.PI / 4; head.add(bd);
    const bt = mesh(new THREE.SphereGeometry(hr * 0.07, 10, 8), gold); bt.position.y = hr * 1.0; head.add(bt);
    const ts = mesh(new THREE.CylinderGeometry(hr * 0.012, hr * 0.012, hr * 0.62, 6), gold); ts.position.set(hr * 0.72, hr * 0.68, hr * 0.2); head.add(ts);
    const tt = mesh(new THREE.ConeGeometry(hr * 0.07, hr * 0.22, 10), gold); tt.position.set(hr * 0.72, hr * 0.32, hr * 0.2); head.add(tt);
  }
  if (O === 'legende') {
    const lr = mesh(new THREE.TorusGeometry(hr * 0.99, hr * 0.03, 8, 48), gold); lr.rotation.x = Math.PI / 2 - 0.25; lr.position.y = hr * 0.42; lr.scale.set(.92, .98, 1); head.add(lr);
    for (let i = 0; i < 22; i++) { const a = i / 22 * TAU; if (Math.abs(Math.sin(a)) > 0.93 && Math.cos(a) < 0) continue; const lf = mesh(new THREE.SphereGeometry(hr * 0.09, 10, 8), gold); lf.scale.set(.45, 1, .3); const x = Math.cos(a) * hr * 0.92, z = Math.sin(a) * hr * 0.96; lf.position.set(x, hr * 0.42 + z * Math.sin(0.25) * -1 + hr * 0.06, z * Math.cos(0.25)); lf.rotation.z = (i % 2 ? 0.5 : -0.5); head.add(lf); }
  }

  /* diplôme */
  let diploma = null;
  if (c.diploma) {
    diploma = new THREE.Group();
    const w = 0.34 * s, h = 0.24 * s;
    const paper = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: paperTexture(c.diploma), roughness: .8, side: THREE.DoubleSide }));
    mats.push(paper.material); diploma.add(paper);
    const rollM = mat('#EFE3C2', { roughness: .7 }), endM = mat(DIPLOMAS[c.diploma].c, { roughness: .4, metalness: .3 });
    [-1, 1].forEach((sg) => {
      const r = mesh(new THREE.CylinderGeometry(0.018 * s, 0.018 * s, h * 1.05, 18), rollM); r.position.x = sg * w / 2; diploma.add(r);
      [-1, 1].forEach((sv) => { const e = mesh(new THREE.CylinderGeometry(0.022 * s, 0.022 * s, 0.012, 18), endM); e.position.set(sg * w / 2, sv * h * 0.53, 0); diploma.add(e); });
    });
    diploma.userData.w = w;
    root.add(diploma);
  }

  return { root, J, diploma, mats, geos, dims: { H, headC, shY, hr } };
}

/* ---------- poses ---------- */
const POSES = {
  idle: { lSh: [0.02, 0, 0.13], rSh: [0.02, 0, -0.13], lEl: [-0.14, 0, 0.02], rEl: [-0.14, 0, -0.02], lHip: [0, 0, 0.035], rHip: [0, 0, -0.035] },
  diploma: { lSh: [-0.62, 0, -0.06], rSh: [-0.62, 0, 0.06], lEl: [-1.25, 0, -0.05], rEl: [-1.25, 0, 0.05], lHip: [0, 0, 0.035], rHip: [0, 0, -0.035] },
  flex: { lSh: [0, 0, 1.42], rSh: [0, 0, -1.42], lEl: [0, 0, 1.75], rEl: [0, 0, -1.75], lHip: [0, 0, 0.09], rHip: [0, 0, -0.09] },
  wave: { lSh: [0.02, 0, 0.13], rSh: [0, 0, -2.55], lEl: [-0.14, 0, 0.02], rEl: [0, 0, -0.5], lHip: [0, 0, 0.035], rHip: [0, 0, -0.035] },
  cheer: { lSh: [0, 0, 2.7], rSh: [0, 0, -2.7], lEl: [0, 0, 0.2], rEl: [0, 0, -0.2], lHip: [0, 0, 0.06], rHip: [0, 0, -0.06] }
};

/* ---------- scène ---------- */
let R = null;
function ensure() {
  if (R) return R;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.38;
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1a2140, 0.55));
  const key = new THREE.DirectionalLight(0xfff1e0, 2.3); key.position.set(2.5, 4, 3.5); scene.add(key);
  const fill = new THREE.DirectionalLight(0x9db8ff, 0.6); fill.position.set(-3, 2, 2.5); scene.add(fill);
  const rimG = new THREE.DirectionalLight(0xffcf6a, 2.4); rimG.position.set(-2.5, 3, -3); scene.add(rimG);
  const rimB = new THREE.DirectionalLight(0x6ea0ff, 1.8); rimB.position.set(2.5, 2, -3); scene.add(rimB);
  // socle
  const stage = new THREE.Group(); scene.add(stage);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.06, 72), new THREE.MeshStandardMaterial({ color: 0x0c1428, metalness: .7, roughness: .3 })); disc.position.y = -0.031; stage.add(disc);
  const ringM = new THREE.MeshBasicMaterial({ color: 0xf3d98a });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.645, 0.007, 8, 96), ringM); ring.rotation.x = Math.PI / 2; ring.position.y = -0.002; stage.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.003, 6, 96), new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: .55 })); ring2.rotation.x = Math.PI / 2; ring2.position.y = 0.001; stage.add(ring2);
  const glow = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.95, 72), new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide })); glow.rotation.x = -Math.PI / 2; glow.position.y = -0.06; stage.add(glow);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: getShadowTex(), transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002; stage.add(sh);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 50);
  R = { renderer, scene, camera, stage, glow, ring2, av: null, cfg: null, spin: 0.35, vel: 0, auto: true, pose: 'idle', poseUntil: 0, basePose: 'idle', host: null, raf: 0, t0: performance.now(), mode: 'full', dirty: false, blinkAt: 0 };
  // interactions
  const el = renderer.domElement; el.style.touchAction = 'pan-y'; el.style.display = 'block'; el.style.width = '100%'; el.style.height = '100%';
  let down = null;
  el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, last: e.clientX }; R.auto = false; try { el.setPointerCapture(e.pointerId); } catch (_) {} });
  el.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - down.last; down.last = e.clientX; if (Math.abs(e.clientX - down.x) > 6) down.moved = true; R.spin += dx * 0.012; R.vel = dx * 0.012; });
  const up = () => { if (!down) return; if (!down.moved && performance.now() - down.t < 350) api.anim(['wave', 'cheer', 'flex'][Math.floor(Math.random() * 3)], 1600); down = null; setTimeout(() => { R.auto = true; }, 2500); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  return R;
}
function disposeAv(av) { if (!av) return; av.geos.forEach((g) => g.dispose()); av.mats.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); }
function setAvatar(cfg) {
  const r = ensure();
  if (r.av) { r.scene.remove(r.av.root); disposeAv(r.av); }
  r.cfg = Object.assign({}, DEFAULT, cfg || {});
  r.av = build(r.cfg); r.scene.add(r.av.root);
  r.basePose = r.cfg.diploma ? 'diploma' : 'idle';
  applyPose(1, performance.now(), true);
}
function applyPose(alpha, now, snap) {
  const r = R, av = r.av; if (!av) return;
  const name = now < r.poseUntil ? r.pose : r.basePose, P = POSES[name];
  Object.keys(P).forEach((k) => { const j = av.J[k]; if (!j) return; const t = P[k]; let tz = t[2];
    if (name === 'wave' && k === 'rEl') tz = -0.35 + Math.sin(now / 110) * 0.45;
    if (snap) j.rotation.set(t[0], t[1], tz); else { j.rotation.x = lerp(j.rotation.x, t[0], alpha); j.rotation.y = lerp(j.rotation.y, t[1], alpha); j.rotation.z = lerp(j.rotation.z, tz, alpha); } });
  // diplôme entre les mains
  if (av.diploma) {
    const show = name === 'diploma'; av.diploma.visible = show;
    if (show) {
      av.root.updateMatrixWorld(true);
      const a = new THREE.Vector3(), b = new THREE.Vector3(); av.J.lHand.getWorldPosition(a); av.J.rHand.getWorldPosition(b);
      av.root.worldToLocal(a); av.root.worldToLocal(b);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      av.diploma.position.set(mid.x, mid.y + 0.02, mid.z + 0.035);
      const dist = a.distanceTo(b), w = av.diploma.userData.w; av.diploma.scale.x = clamp(dist / w, 0.6, 1.6);
    }
  }
}
function frame(now) {
  const r = R; if (!r.host) return; r.raf = requestAnimationFrame(frame);
  if (r.dirty) { r.dirty = false; setAvatar(r.pendingCfg); }
  const dt = Math.min(0.05, (now - (r.last || now)) / 1000); r.last = now;
  if (r.auto) { r.vel *= 0.92; r.spin += 0.35 * dt + r.vel; } else { r.vel *= 0.9; r.spin += r.vel * 0.0; }
  const av = r.av;
  if (av) {
    av.root.rotation.y = r.spin;
    applyPose(1 - Math.pow(0.0015, dt), now, false);
    const br = Math.sin(now / 900); av.J.torso.scale.y = 1 + br * 0.006; av.J.head.position.y = av.dims.headC + br * 0.003;
    av.J.head.rotation.z = Math.sin(now / 2300) * 0.03;
    if (now > r.blinkAt) { r.blinkAt = now + 2600 + Math.random() * 2600; r.blinkEnd = now + 130; }
    const bl = now < r.blinkEnd ? 0.1 : 1; av.J.eyes.forEach((e) => { e.scale.y = lerp(e.scale.y, bl, 0.6); });
  }
  r.glow.material.opacity = 0.12 + Math.sin(now / 700) * 0.05; r.ring2.rotation.z = now / 4000;
  r.renderer.render(r.scene, r.camera);
}
function frameCamera(mode, aspect) {
  const r = R, cam = r.camera; cam.aspect = aspect;
  if (mode === 'portrait') { const d = r.av ? r.av.dims : { headC: 1.6, hr: .13 }; cam.fov = 26; cam.position.set(0, d.headC + 0.04, 1.55); cam.lookAt(0, d.headC - 0.1, 0); }
  else { const fit = aspect < 0.7 ? 4.9 : aspect < 1.05 ? 4.1 : 4.4; cam.fov = 28; cam.position.set(0, 1.2, fit); cam.lookAt(0, 0.98, 0); }
  cam.updateProjectionMatrix();
}
function resize() { const r = R; if (!r || !r.host) return; const w = r.host.clientWidth || 300, h = r.host.clientHeight || 300; r.renderer.setSize(w, h, false); frameCamera(r.mode, w / h); }

const api = {
  DEFAULT, OUTFITS, DIPLOMAS,
  mount(host, cfg, opts = {}) {
    const r = ensure(); api.unmount();
    r.host = host; r.mode = opts.mode || 'full'; host.appendChild(r.renderer.domElement);
    setAvatar(cfg); resize(); r.last = 0; r.raf = requestAnimationFrame(frame);
    r.ro = new ResizeObserver(resize); r.ro.observe(host);
    return api;
  },
  update(cfg) { const r = ensure(); r.pendingCfg = cfg; r.dirty = true; if (!r.host) setAvatar(cfg); },
  anim(name, ms = 1500) { const r = ensure(); r.pose = name; r.poseUntil = performance.now() + ms; },
  unmount() { const r = R; if (!r || !r.host) return; cancelAnimationFrame(r.raf); if (r.ro) r.ro.disconnect(); if (r.renderer.domElement.parentNode) r.renderer.domElement.parentNode.removeChild(r.renderer.domElement); r.host = null; },
  snapshot(cfg, mode = 'full', size = 360) {
    const r = ensure(), wasHost = r.host; if (wasHost) cancelAnimationFrame(r.raf);
    const keep = r.cfg; setAvatar(cfg);
    const spin = r.spin; r.av.root.rotation.y = mode === 'portrait' ? 0.28 : 0.42;
    r.stage.visible = mode !== 'portrait';
    const w = size, h = mode === 'portrait' ? size : Math.round(size * 1.25);
    r.renderer.setSize(w, h, false); frameCamera(mode, w / h);
    r.renderer.render(r.scene, r.camera);
    const url = r.renderer.domElement.toDataURL('image/png');
    r.stage.visible = true; r.spin = spin;
    if (wasHost) { setAvatar(keep); resize(); r.raf = requestAnimationFrame(frame); }
    return url;
  }
};
window.MFCAvatar = api;
window.dispatchEvent(new Event('mfc-avatar'));

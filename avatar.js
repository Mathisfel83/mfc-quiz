/* MFC Quiz — avatar 3D réaliste (corps MakeHuman CC0 + three.js). Expose window.MFCAvatar. */
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { loadHuman, makeHuman, makeClipped, inflate, smoothMesh } from './human.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

export const DEFAULT = {
  sex: 'h', frame: 1, cm: 178, kg: 74, mus: 45,
  skin: '#D9A98A', eyes: '#5B3A1E', hair: 'court', hairColor: '#2A1A10', beard: 'non',
  top: 'tshirt', topColor: '#14233F', bottom: 'short', bottomColor: '#0B0F18', shoes: '#F2F2F2',
  outfit: 'base', diploma: 0
};
export const DIPLOMAS = [null,
  { n: 'Curieux', c: '#4F8BFF' }, { n: 'Initié', c: '#3CC48A' }, { n: 'Analyste', c: '#A06BFF' },
  { n: 'Expert', c: '#D4AF37' }, { n: 'Légende', c: '#FF5A4E' }];

let D = null, GJ = null, EYEIMG = null, loading = null;
function load() {
  if (loading) return loading;
  loading = Promise.all([
    loadHuman('./human/'),
    fetch('./human/garments.json').then((r) => r.json()),
    new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = './human/eye.png'; })
  ]).then(([d, g, img]) => {
    D = d; GJ = g; EYEIMG = img;
    let top = 0; for (let i = 0; i < D.N; i++) if (D.pos0[i * 3 + 1] > D.pos0[top * 3 + 1]) top = i; D.top = top;
    D.feet = { L: [], R: [] }; D.headV = [];
    for (let i = 0; i < D.N; i++) { if (GJ.fam[i] === 6) D.feet[D.pos0[i * 3] > 0 ? 'L' : 'R'].push(i); if (GJ.fam[i] === 0) D.headV.push(i); }
  });
  return loading;
}

/* ---------- textures ---------- */
const eyeCache = {};
function eyeTexture(color) {
  if (eyeCache[color]) return eyeCache[color];
  const c = document.createElement('canvas'); c.width = c.height = EYEIMG.width; const g = c.getContext('2d'); g.drawImage(EYEIMG, 0, 0);
  const im = g.getImageData(0, 0, c.width, c.height), p = im.data, t = new THREE.Color(color);
  const tr = Math.pow(t.r, 1 / 2.2) * 255, tg = Math.pow(t.g, 1 / 2.2) * 255, tb = Math.pow(t.b, 1 / 2.2) * 255;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], gg = p[i + 1], b = p[i + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    const sat = mx ? (mx - mn) / mx : 0;
    if (p[i + 3] > 30 && sat > 0.22 && mx < 235) { const l = (0.3 * r + 0.59 * gg + 0.11 * b) / 255, k = Math.min(1.6, 0.35 + l * 2.2); p[i] = Math.min(255, tr * k); p[i + 1] = Math.min(255, tg * k); p[i + 2] = Math.min(255, tb * k); }
  }
  g.putImageData(im, 0, 0);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  eyeCache[color] = tex; return tex;
}
function paperTexture(rank) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 360;
  const g = c.getContext('2d'), d = DIPLOMAS[rank] || DIPLOMAS[4];
  const grd = g.createLinearGradient(0, 0, 0, 360); grd.addColorStop(0, '#FBF5E4'); grd.addColorStop(1, '#EFE3C2');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 360);
  g.strokeStyle = '#C9A53A'; g.lineWidth = 10; g.strokeRect(18, 18, 476, 324); g.lineWidth = 2; g.strokeRect(32, 32, 448, 296);
  g.fillStyle = '#0B1530'; g.textAlign = 'center';
  g.font = '700 26px Georgia, serif'; g.fillText('MFC QUIZ', 256, 84);
  g.font = '700 52px Georgia, serif'; g.fillText('DIPLÔME', 256, 150);
  g.fillStyle = '#7A5B12'; g.font = 'italic 24px Georgia, serif'; g.fillText('Rang', 256, 192);
  g.fillStyle = d.c; g.font = '700 40px Georgia, serif'; g.fillText(d.n, 256, 238);
  g.beginPath(); g.arc(256, 292, 26, 0, TAU); g.fill();
  g.fillStyle = '#FFF6D6'; g.font = '700 20px Georgia, serif'; g.fillText('★', 256, 299);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
let shadowTex = null;
function getShadowTex() {
  if (shadowTex) return shadowTex;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  r.addColorStop(0, 'rgba(0,0,0,.7)'); r.addColorStop(.55, 'rgba(0,0,0,.3)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); shadowTex = new THREE.CanvasTexture(c); return shadowTex;
}

/* ---------- construction ---------- */
function shapeParams(c) {
  const H = clamp(c.cm, 140, 210) / 100, bmi = clamp(c.kg, 35, 170) / (H * H), m = clamp(c.mus, 0, 100) / 100;
  let w = bmi <= 22 ? (bmi - 16) / 12 : 0.5 + (bmi - 22) / 20;
  w = clamp(w - 0.18 * (m - 0.5), 0, 1);
  return { g: c.sex === 'f' ? 0 : 1, m, w, H };
}
function lookOf(c) {
  const O = c.outfit || 'base';
  const L = { top: c.top, topColor: c.topColor, bottom: c.bottom, bottomColor: c.bottomColor, shoes: c.shoes, sole: '#FFFFFF', metal: false };
  if (O === 'or') Object.assign(L, { top: 'sweat', topColor: '#0E0F14', bottom: 'jogging', bottomColor: '#0E0F14', shoes: '#111216', sole: '#D4AF37' });
  if (O === 'labo') Object.assign(L, { top: 'sweat', topColor: '#F3F5F8', bottom: 'jogging', bottomColor: '#1B2A47', shoes: '#F2F2F2' });
  if (O === 'toge') Object.assign(L, { top: 'sweat', topColor: '#121318', bottom: 'jogging', bottomColor: '#121318', shoes: '#111111', sole: '#2A2A2A' });
  if (O === 'legende') Object.assign(L, { top: 'sweat', topColor: '#D4AF37', bottom: 'legging', bottomColor: '#B8902A', shoes: '#E8E8EC', sole: '#D4AF37', metal: true });
  return L;
}
const edgeOnes = (g) => { g.setAttribute('edge', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(1), 1)); return g; };

function build(cfg) {
  const c = Object.assign({}, DEFAULT, cfg || {});
  const sp = shapeParams(c), L = lookOf(c), O = c.outfit || 'base';
  const mats = [], geos = [];
  const M = (o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ roughness: .8 }, o)); mats.push(m); return m; };
  const skin = new THREE.MeshPhysicalMaterial({ color: c.skin, roughness: .5, sheen: .35, sheenColor: new THREE.Color('#ff9a80'), sheenRoughness: .55 }); mats.push(skin);
  const eye = new THREE.MeshPhysicalMaterial({ map: eyeTexture(c.eyes), alphaTest: .5, roughness: .12, clearcoat: 1 }); mats.push(eye);
  const lash = M({ visible: false });
  const h = makeHuman(D, { skin, eye, lash });
  h.setShape(sp.g, sp.m, sp.w);
  const root = new THREE.Group(); root.add(h.group);
  const top = h.morphPos(D.top).y, sc = sp.H / top, fr = { 0.92: 0.95, 1: 1, 1.1: 1.06 }[c.frame] || 1;
  h.group.scale.set(sc * fr, sc, sc * fr);
  const cloth = (key, color, thick, o = {}) => {
    const G = GJ.g[key]; if (!G) return null;
    const metal = L.metal && o.metal !== false;
    const mat = inflate(M(Object.assign({ color, roughness: metal ? .28 : .82, metalness: metal ? .95 : 0 }, o.mat || {})), thick, o.fade || 0, o.noise || 0, o.bump || 0, o.taper || 0);
    if (o.transparent) { mat.transparent = true; mat.depthWrite = !!o.depthWrite; }
    const mesh = makeClipped(h, G, mat); if (o.order) mesh.renderOrder = o.order; if (o.smooth) smoothMesh(mesh, o.smooth, 0.5); return mesh;
  };
  // visage
  cloth('brows', c.hairColor, 0.0007, { fade: .0012, noise: .5, transparent: true, metal: false, order: 2 });
  cloth('lash', '#120A06', 0.0004, { fade: .0005, transparent: true, metal: false, order: 2 });
  cloth('lips', '#' + new THREE.Color(c.skin).lerp(new THREE.Color('#A8484A'), c.sex === 'f' ? .5 : .3).getHexString(), 0.0003, { fade: .0025, transparent: true, metal: false, order: 2, mat: { roughness: .45 } });
  if (c.sex !== 'f' && c.beard === 'courte') cloth('stubble', c.hairColor, 0.0006, { fade: .004, noise: .85, transparent: true, metal: false, order: 3 });
  if (c.sex !== 'f' && c.beard === 'complete') cloth('beard', c.hairColor, 0.005, { fade: .006, noise: .45, taper: .008, transparent: true, depthWrite: true, metal: false, order: 3 });
  // vêtements
  if (L.bottom) cloth(L.bottom === 'short' ? 'short' : L.bottom === 'legging' ? 'legging' : 'jogging', L.bottomColor, L.bottom === 'legging' ? .004 : L.bottom === 'short' ? .009 : .011);
  if (L.top) cloth(L.top, L.topColor, L.top === 'sweat' ? .015 : L.top === 'brassiere' ? .009 : .01, { smooth: c.sex === 'f' ? 6 : 3 });
  if (O === 'or') cloth('stripe', '#D4AF37', .016, { mat: { metalness: 1, roughness: .3 } });
  if (O === 'toge') cloth('stole', '#D4AF37', .02, { mat: { metalness: .9, roughness: .35 } });
  // cheveux
  const st = c.hair, covered = O === 'casquette' || O === 'toge';
  if (st === 'rase') cloth('scalp', '#' + new THREE.Color(c.hairColor).lerp(new THREE.Color(c.skin), .25).getHexString(), .0012, { fade: .004, noise: .75, transparent: true, metal: false, order: 2 });
  if (['court', 'long', 'queue', 'chignon'].includes(st)) cloth('scalp', c.hairColor, .009, { fade: .003, noise: .25, taper: .02, transparent: true, depthWrite: true, metal: false });
  if (st === 'boucles') cloth('scalp', c.hairColor, .016, { fade: .004, noise: .2, bump: .012, taper: .02, transparent: true, depthWrite: true, metal: false });
  if (st === 'afro') cloth('scalp', c.hairColor, .034, { fade: .004, noise: .15, bump: .022, taper: .03, transparent: true, depthWrite: true, metal: false });
  if (covered) cloth('cap', O === 'toge' ? '#121318' : '#13213F', O === 'toge' ? .012 : .011, { metal: false, mat: { roughness: .75 } });

  // repères (pose de repos, coordonnées avant échelle)
  const B = h.bones;
  const restW = (b) => { const v = new THREE.Vector3(); let n = b; while (n && n.isBone) { v.add(n.position); n = n.parent; } return v; };
  const hb = B['head'], hp = restW(hb);
  const hv = D.headV.map((i) => h.morphPos(i)).filter((p) => p.y > hp.y - 0.02), hbx = new THREE.Box3().setFromPoints(hv);
  const hc = hbx.getCenter(new THREE.Vector3()), hs = hbx.getSize(new THREE.Vector3()), rx = hs.x / 2, ry = hs.y / 2, rz = hs.z / 2;
  const onHead = (mesh, x, y, z) => { mesh.position.set(x - hp.x, y - hp.y, z - hp.z); hb.add(mesh); return mesh; };
  const gm = (geo, mat) => { geos.push(geo); return new THREE.Mesh(geo, mat); };
  const strand = inflate(M({ color: c.hairColor, roughness: .62 }), 0, 0, .25);
  if (st === 'long') {
    const g = edgeOnes(new THREE.SphereGeometry(1, 48, 32)); const m = gm(g, strand); m.scale.set(rx * 1.16, ry * 1.75, rz * 0.98);
    onHead(m, hc.x, hc.y - ry * 0.62, hc.z - rz * 0.3);
  }
  if (st === 'queue' && !covered) {
    const prof = []; for (let i = 0; i <= 16; i++) { const t = i / 16; prof.push(new THREE.Vector2(Math.sin(Math.PI * Math.min(1, t * 1.6 + 0.08)) * 0.03 * (1 - t * 0.55) + 0.004, -t * 0.26)); }
    const m = gm(edgeOnes(new THREE.LatheGeometry(prof, 24)), strand); m.rotation.x = 0.5; onHead(m, hc.x, hc.y + ry * 0.15, hc.z - rz * 0.98);
    const band = gm(new THREE.TorusGeometry(0.02, 0.006, 8, 20), M({ color: '#D4AF37', metalness: .6, roughness: .4 })); band.rotation.x = Math.PI / 2 + 0.5; onHead(band, hc.x, hc.y + ry * 0.13, hc.z - rz * 1.0);
  }
  if (st === 'chignon' && !covered) onHead(gm(edgeOnes(new THREE.SphereGeometry(rx * 0.48, 32, 24)), strand), hc.x, hc.y + ry * 0.92, hc.z - rz * 0.42);
  // accessoires de rang
  const gold = M({ color: '#D4AF37', metalness: 1, roughness: .28 });
  if (O === 'casquette') {
    const navy = M({ color: '#13213F', roughness: .7 });
    const vis = gm(new THREE.CylinderGeometry(rx * 0.95, rx * 0.95, 0.008, 40, 1, false, -1.05, 2.1), navy); vis.rotation.x = 0.1; onHead(vis, hc.x, hc.y + ry * 0.38, hc.z + rz * 0.62);
    const rim = gm(new THREE.CylinderGeometry(rx * 0.955, rx * 0.955, 0.009, 40, 1, true, -1.05, 2.1), gold); rim.rotation.x = 0.1; onHead(rim, hc.x, hc.y + ry * 0.38, hc.z + rz * 0.62);
    onHead(gm(new THREE.SphereGeometry(0.008, 12, 8), gold), hc.x, hc.y + ry * 1.12, hc.z - rz * 0.05);
    const logo = gm(new THREE.CircleGeometry(0.018, 24), gold); logo.rotation.x = -0.35; onHead(logo, hc.x, hc.y + ry * 0.78, hc.z + rz * 0.86);
  }
  if (O === 'labo') {
    const gmM = M({ color: '#111111', roughness: .3, metalness: .5 });
    const el = restW(B['eye.L']), er = restW(B['eye.R']);
    [el, er].forEach((e) => onHead(gm(new THREE.TorusGeometry(0.019, 0.0016, 8, 32), gmM), e.x, e.y, e.z + 0.022));
    const br = gm(new THREE.CylinderGeometry(0.0015, 0.0015, Math.max(0.005, el.x - er.x - 0.036), 6), gmM); br.rotation.z = Math.PI / 2; onHead(br, (el.x + er.x) / 2, el.y + 0.004, el.z + 0.024);
    [el, er].forEach((e, i) => { const s = i ? -1 : 1; const t = gm(new THREE.CylinderGeometry(0.0013, 0.0013, rz * 1.5, 6), gmM); t.rotation.x = Math.PI / 2; onHead(t, e.x + s * 0.019, e.y + 0.002, e.z + 0.022 - rz * 0.75); });
  }
  if (O === 'toge') {
    const blk = M({ color: '#121318', roughness: .8 });
    onHead(gm(new THREE.BoxGeometry(rx * 2.5, 0.008, rx * 2.5), blk), hc.x, hc.y + ry * 1.02, hc.z).rotation.y = Math.PI / 4;
    onHead(gm(new THREE.SphereGeometry(0.007, 10, 8), gold), hc.x, hc.y + ry * 1.05, hc.z);
    onHead(gm(new THREE.CylinderGeometry(0.0015, 0.0015, 0.09, 6), gold), hc.x + rx * 1.2, hc.y + ry * 0.62, hc.z + rz * 0.3);
    onHead(gm(new THREE.ConeGeometry(0.008, 0.03, 10), gold), hc.x + rx * 1.2, hc.y + ry * 0.2, hc.z + rz * 0.3);
  }
  if (O === 'legende') {
    const lr = gm(new THREE.TorusGeometry(1, 0.03, 8, 64), gold); lr.scale.set(rx * 1.06, rz * 1.06, rx); lr.rotation.x = Math.PI / 2 - 0.2; onHead(lr, hc.x, hc.y + ry * 0.38, hc.z);
    for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; if (Math.sin(a) > 0.82) continue; const lf = gm(new THREE.SphereGeometry(0.011, 10, 8), gold); lf.scale.set(.45, 1, .3); lf.rotation.z = i % 2 ? .6 : -.6; onHead(lf, hc.x + Math.cos(a) * rx * 1.06, hc.y + ry * 0.4 - Math.sin(a) * rz * 0.2, hc.z + Math.sin(a) * rz * 1.06); }
  }
  const rootB = B['root'], rp = restW(rootB);
  const band = (y0, y1) => { let xm = 0, zmin = 9, zmax = -9; for (let i = 0; i < D.N; i += 2) { const f = GJ.fam[i]; if (f !== 7 && f !== 8 && f !== 4) continue; const p = h.morphPos(i); if (p.y < y0 || p.y > y1) continue; xm = Math.max(xm, Math.abs(p.x)); zmin = Math.min(zmin, p.z); zmax = Math.max(zmax, p.z); } return { rx: xm, rz: (zmax - zmin) / 2, cz: (zmax + zmin) / 2 }; };
  const hipY = restW(B['upperleg01.L']).y, knY = restW(B['lowerleg01.L']).y, anY = restW(B['foot.L']).y;
  if (O === 'labo' || O === 'toge') {
    const w = band(hipY - 0.02, hipY + 0.12), bot = O === 'toge' ? anY + 0.12 : knY + 0.05, fl = O === 'toge' ? 1.45 : 1.25;
    const prof = [new THREE.Vector2(fl, bot), new THREE.Vector2(1.08, hipY - 0.05), new THREE.Vector2(1.04, hipY + 0.1)];
    const m = gm(new THREE.LatheGeometry(prof, 48, O === 'labo' ? 0.35 : 0, O === 'labo' ? TAU - 0.7 : TAU), M({ color: O === 'toge' ? '#121318' : '#F3F5F8', roughness: .85, side: THREE.DoubleSide }));
    m.scale.set(w.rx * 1.18, 1, w.rz * 1.3); m.position.set(-rp.x, -rp.y, w.cz - rp.z); rootB.add(m);
  }
  if (O === 'legende') {
    const sh = restW(B['upperarm01.L']), w = band(sh.y - 0.15, sh.y - 0.05);
    const m = gm(new THREE.CylinderGeometry(sh.x * 1.05, sh.x * 1.9, sh.y - knY + 0.05, 40, 1, true, Math.PI - 1.2, 2.4), M({ color: '#8E1020', roughness: .7, side: THREE.DoubleSide }));
    m.scale.z = 0.6; m.position.set(-rp.x, (sh.y + knY - 0.05) / 2 - rp.y, w.cz - 0.03 - rp.z); rootB.add(m);
  }
  // baskets
  ['L', 'R'].forEach((s) => {
    const pts = D.feet[s].map((i) => h.morphPos(i)); const bb = new THREE.Box3().setFromPoints(pts);
    const cn = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3());
    const g = new THREE.SphereGeometry(1, 48, 32), P = g.attributes.position, col = new Float32Array(P.count * 3);
    const upC = new THREE.Color(L.shoes), soC = new THREE.Color(L.sole);
    for (let i = 0; i < P.count; i++) {
      let x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      const front = clamp((z + 0.2) / 1.2, 0, 1); if (y > 0) y *= 1 - 0.42 * front;
      if (y < -0.62) y = -0.62 - (y + 0.62) * 0.08;
      x *= 1 - 0.18 * clamp(-z, 0, 1);
      P.setXYZ(i, x * sz.x * 0.58, (y + 0.62) * sz.y * 0.5, z * sz.z * 0.56);
      const k = P.getY(i) < sz.y * 0.13 ? soC : upC; col[i * 3] = k.r; col[i * 3 + 1] = k.g; col[i * 3 + 2] = k.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = gm(g, M({ vertexColors: true, roughness: .5, metalness: L.metal ? .5 : 0 }));
    const fb = B['foot.' + s], fp = restW(fb);
    m.position.set(cn.x - fp.x, bb.min.y - 0.004 - fp.y, cn.z + sz.z * 0.015 - fp.z); fb.add(m);
  });
  // diplôme
  let diploma = null;
  if (c.diploma) {
    diploma = new THREE.Group();
    const w = 0.3, ht = 0.21;
    diploma.add(gm(new THREE.PlaneGeometry(w, ht), M({ map: paperTexture(c.diploma), roughness: .8, side: THREE.DoubleSide })));
    const rollM = M({ color: '#EFE3C2', roughness: .7 }), endM = M({ color: DIPLOMAS[c.diploma].c, roughness: .4, metalness: .3 });
    [-1, 1].forEach((sg) => { const r = gm(new THREE.CylinderGeometry(0.014, 0.014, ht * 1.05, 18), rollM); r.position.x = sg * w / 2; diploma.add(r);
      [-1, 1].forEach((sv) => { const e = gm(new THREE.CylinderGeometry(0.017, 0.017, 0.01, 18), endM); e.position.set(sg * w / 2, sv * ht * 0.53, 0); diploma.add(e); }); });
    diploma.userData.w = w; root.add(diploma);
  }
  return { root, h, diploma, mats, geos, height: sp.H, headY: (hc.y) * sc };
}

/* ---------- poses ---------- */
const LA = { idle: [[0.083, -0.105, -0.59], [0.663, 0.279, -0.091]], diploma: [[-0.094, 0.418, -0.691], [0.222, -0.308, -0.348]],
  flex: [[-0.937, 0.361, 0.676], [0.053, -0.232, 1.709]], cheer: [[-0.23, -0.51, 1.986], [0.57, 0.365, -0.006]], wave: [[-0.522, -0.341, 1.261], [-0.342, 0.508, 0.106]] };
const mir = (r) => [r[0], -r[1], -r[2]];
const pose = (l, rr) => ({ 'upperarm01.L': LA[l][0], 'lowerarm01.L': LA[l][1], 'upperarm01.R': mir(LA[rr][0]), 'lowerarm01.R': mir(LA[rr][1]) });
const POSES = { idle: pose('idle', 'idle'), diploma: pose('diploma', 'diploma'), flex: pose('flex', 'flex'), cheer: pose('cheer', 'cheer'), wave: pose('idle', 'wave') };

/* ---------- scène ---------- */
let R = null;
function ensure() {
  if (R) return R;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.42;
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1a2140, 0.5));
  const key = new THREE.DirectionalLight(0xfff1e0, 2.2); key.position.set(2, 3.5, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0x9db8ff, 0.55); fill.position.set(-3, 2, 2.5); scene.add(fill);
  const rimG = new THREE.DirectionalLight(0xffcf6a, 2.3); rimG.position.set(-2.5, 3, -3); scene.add(rimG);
  const rimB = new THREE.DirectionalLight(0x6ea0ff, 1.7); rimB.position.set(2.5, 2, -3); scene.add(rimB);
  const stage = new THREE.Group(); scene.add(stage);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.06, 72), new THREE.MeshStandardMaterial({ color: 0x0c1428, metalness: .7, roughness: .3 })); disc.position.y = -0.031; stage.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.645, 0.007, 8, 96), new THREE.MeshBasicMaterial({ color: 0xf3d98a })); ring.rotation.x = Math.PI / 2; stage.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.003, 6, 96), new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: .55 })); ring2.rotation.x = Math.PI / 2; ring2.position.y = 0.001; stage.add(ring2);
  const glow = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.95, 72), new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide })); glow.rotation.x = -Math.PI / 2; glow.position.y = -0.06; stage.add(glow);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: getShadowTex(), transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002; stage.add(sh);
  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 50);
  R = { renderer, scene, camera, stage, glow, ring2, av: null, cfg: null, spin: 0.3, vel: 0, auto: true, pose: 'idle', poseUntil: 0, basePose: 'idle', host: null, raf: 0, mode: 'full', dirty: false };
  const el = renderer.domElement; el.style.touchAction = 'pan-y'; el.style.display = 'block'; el.style.width = '100%'; el.style.height = '100%';
  let down = null;
  el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, t: performance.now(), moved: false, last: e.clientX }; R.auto = false; try { el.setPointerCapture(e.pointerId); } catch (_) {} });
  el.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - down.last; down.last = e.clientX; if (Math.abs(e.clientX - down.x) > 6) down.moved = true; R.spin += dx * 0.012; R.vel = dx * 0.012; });
  const up = () => { if (!down) return; if (!down.moved && performance.now() - down.t < 350) api.anim(['wave', 'cheer', 'flex'][Math.floor(Math.random() * 3)], 1800); down = null; setTimeout(() => { R.auto = true; }, 2500); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  return R;
}
function disposeAv(av) {
  if (!av) return;
  const shared = av.h.body.geometry;
  av.h.meshes.forEach((m) => { if (m.geometry !== shared && m.geometry !== av.h.lashes.geometry) m.geometry.dispose(); });
  shared.dispose(); av.h.lashes.geometry.dispose(); av.geos.forEach((g) => g.dispose());
  const keep = new Set(Object.values(eyeCache));
  av.mats.forEach((m) => { if (m.map && !keep.has(m.map)) m.map.dispose(); m.dispose(); });
}
function setAvatar(cfg) {
  const r = ensure();
  if (r.av) { r.scene.remove(r.av.root); disposeAv(r.av); }
  r.cfg = Object.assign({}, DEFAULT, cfg || {});
  r.av = build(r.cfg); r.scene.add(r.av.root);
  r.basePose = r.cfg.diploma ? 'diploma' : 'idle';
  applyPose(1, performance.now(), true);
}
const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), V4 = new THREE.Vector3();
function applyPose(alpha, now, snap) {
  const r = R, av = r.av; if (!av) return;
  const name = now < r.poseUntil ? r.pose : r.basePose, P = POSES[name], B = av.h.bones;
  Object.keys(POSES.idle).forEach((k) => { const t = P[k] || POSES.idle[k], j = B[k]; if (!j) return; let tz = t[2];
    if (name === 'wave' && k === 'lowerarm01.R') tz = -0.106 + Math.sin(now / 120) * 0.4;
    if (snap) j.rotation.set(t[0], t[1], tz); else { j.rotation.x = lerp(j.rotation.x, t[0], alpha); j.rotation.y = lerp(j.rotation.y, t[1], alpha); j.rotation.z = lerp(j.rotation.z, tz, alpha); } });
  if (av.diploma) {
    const show = name === 'diploma'; av.diploma.visible = show;
    if (show) {
      av.root.updateMatrixWorld(true);
      B['finger3-1.L'].getWorldPosition(V1); B['wrist.L'].getWorldPosition(V3); B['finger3-1.R'].getWorldPosition(V2); B['wrist.R'].getWorldPosition(V4);
      V1.add(V3).multiplyScalar(0.5); V2.add(V4).multiplyScalar(0.5); av.root.worldToLocal(V1); av.root.worldToLocal(V2);
      const mid = V1.clone().add(V2).multiplyScalar(0.5);
      av.diploma.position.set(mid.x, mid.y + 0.03, mid.z + 0.03);
      av.diploma.scale.x = clamp(V1.distanceTo(V2) / av.diploma.userData.w, 0.6, 1.6);
    }
  }
}
function frame(now) {
  const r = R; if (!r.host) return; r.raf = requestAnimationFrame(frame);
  if (r.dirty && D) { r.dirty = false; setAvatar(r.pendingCfg); frameCamera(r.mode, r.camera.aspect); }
  const dt = Math.min(0.05, (now - (r.last || now)) / 1000); r.last = now;
  if (r.auto) { r.vel *= 0.92; r.spin += 0.35 * dt + r.vel; } else r.vel *= 0.9;
  const av = r.av;
  if (av) {
    av.root.rotation.y = r.spin;
    applyPose(1 - Math.pow(0.0015, dt), now, false);
    const B = av.h.bones, br = Math.sin(now / 900);
    if (B['spine03']) B['spine03'].rotation.x = br * 0.012;
    if (B['head']) { B['head'].rotation.y = Math.sin(now / 2600) * 0.08; B['head'].rotation.z = Math.sin(now / 2300) * 0.03; }
  }
  r.glow.material.opacity = 0.12 + Math.sin(now / 700) * 0.05; r.ring2.rotation.z = now / 4000;
  r.renderer.render(r.scene, r.camera);
}
function frameCamera(mode, aspect) {
  const r = R, cam = r.camera; cam.aspect = aspect;
  const hy = r.av ? r.av.headY : 1.62, H = r.av ? r.av.height : 1.78;
  if (mode === 'portrait') { cam.fov = 24; cam.position.set(0, hy + 0.03, 1.05); cam.lookAt(0, hy - 0.05, 0); }
  else { const span = Math.max(H, 1.75) + 0.3, fov = 26, d = (span / 2) / Math.tan(fov * Math.PI / 360) / Math.min(1, aspect * 1.15); cam.fov = fov; cam.position.set(0, span / 2 + 0.05, d); cam.lookAt(0, span / 2 - 0.12, 0); }
  cam.updateProjectionMatrix();
}
function resize() { const r = R; if (!r || !r.host) return; const w = r.host.clientWidth || 300, h = r.host.clientHeight || 300; r.renderer.setSize(w, h, false); frameCamera(r.mode, w / h); }

const api = {
  DEFAULT, DIPLOMAS, ready: () => load(),
  mount(host, cfg, opts = {}) {
    const r = ensure(); api.unmount();
    r.host = host; r.mode = opts.mode || 'full'; host.appendChild(r.renderer.domElement);
    r.pendingCfg = cfg;
    load().then(() => { if (r.host !== host) return; setAvatar(r.pendingCfg); resize(); if (opts.onReady) opts.onReady(); });
    resize(); r.last = 0; r.raf = requestAnimationFrame(frame);
    r.ro = new ResizeObserver(resize); r.ro.observe(host);
    return api;
  },
  update(cfg, fast) {
    const r = ensure(); r.pendingCfg = cfg;
    if (fast && r.av && D) { const c = Object.assign({}, DEFAULT, cfg), sp = shapeParams(c), h = r.av.h; h.setShape(sp.g, sp.m, sp.w);
      const top = h.morphPos(D.top).y, sc = sp.H / top, fr = { 0.92: 0.95, 1: 1, 1.1: 1.06 }[c.frame] || 1; h.group.scale.set(sc * fr, sc, sc * fr); r.av.height = sp.H; return; }
    r.dirty = true;
  },
  anim(name, ms = 1500) { const r = ensure(); r.pose = name; r.poseUntil = performance.now() + ms; },
  unmount() { const r = R; if (!r || !r.host) return; cancelAnimationFrame(r.raf); if (r.ro) r.ro.disconnect(); if (r.renderer.domElement.parentNode) r.renderer.domElement.parentNode.removeChild(r.renderer.domElement); r.host = null; },
  async snapshot(cfg, mode = 'full', size = 360) {
    await load();
    const r = ensure(), wasHost = r.host; if (wasHost) cancelAnimationFrame(r.raf);
    const keep = r.cfg; setAvatar(cfg);
    r.av.root.rotation.y = mode === 'portrait' ? 0.25 : 0.35;
    r.stage.visible = mode !== 'portrait';
    const w = size, hh = mode === 'portrait' ? size : Math.round(size * 1.25);
    r.renderer.setSize(w, hh, false); frameCamera(mode, w / hh);
    r.renderer.render(r.scene, r.camera);
    const url = r.renderer.domElement.toDataURL('image/png');
    r.stage.visible = true;
    if (wasHost) { setAvatar(keep); resize(); r.raf = requestAnimationFrame(frame); }
    return url;
  }
};
window.MFCAvatar = api;
window.dispatchEvent(new Event('mfc-avatar'));
load();

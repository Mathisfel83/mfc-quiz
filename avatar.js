/* MFC Quiz — avatar 3D cartoon (buste modélisé par champs de distance). Expose window.MFCAvatar. */
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const BASE = './toon/';

export const DEFAULT = {
  sex: 'h', frame: 1, kg: 74, cm: 178, mus: 45,
  skin: '#F2C4A2', eyes: '#3B7BC8', hair: 'court', hairColor: '#6B3E22', beard: 'non',
  top: 'hoodie', topColor: '#3E6FA8', outfit: 'base', diploma: 0
};
export const DIPLOMAS = [null,
  { n: 'Curieux', c: '#4F8BFF' }, { n: 'Initié', c: '#3CC48A' }, { n: 'Analyste', c: '#A06BFF' },
  { n: 'Expert', c: '#D4AF37' }, { n: 'Légende', c: '#FF5A4E' }];

/* ---------- chargement des pièces (à la demande) ---------- */
let MAN = null; const RAW = {}, GEO = {};
const manifest = () => MAN ? Promise.resolve(MAN) : fetch(BASE + 'manifest.json').then((r) => r.json()).then((m) => (MAN = m));
function loadPart(k) {
  if (RAW[k]) return RAW[k];
  RAW[k] = manifest().then((M) => { const m = M[k]; if (!m) return null; return fetch(BASE + k + '.bin').then((r) => r.arrayBuffer()).then((buf) => {
    const nv = m.nv, q = new Uint16Array(buf, 0, nv * 3), nq = new Int8Array(buf, nv * 6, nv * 3), aq = new Uint8Array(buf, nv * 9, nv);
    let o = nv * 10; o += (4 - o % 4) % 4;
    const I = m.i32 ? new Uint32Array(buf, o, m.nf * 3) : new Uint16Array(buf, o, m.nf * 3);
    const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), A = new Float32Array(nv);
    for (let i = 0; i < nv; i++) { for (let c = 0; c < 3; c++) { P[i * 3 + c] = m.mn[c] + q[i * 3 + c] * m.sc[c]; N[i * 3 + c] = nq[i * 3 + c] / 127; } A[i] = aq[i] / 255; }
    GEO[k] = { P, N, A, I }; return GEO[k];
  }); }).catch(() => { delete RAW[k]; return null; });
  return RAW[k];
}

/* ---------- configuration -> pièces ---------- */
function look(c) {
  const O = c.outfit || 'base', fem = c.sex === 'f';
  const L = { top: c.top || 'hoodie', topColor: c.topColor, inner: null, metal: false, cover: false };
  if (L.top === 'brassiere' && !fem) L.top = 'debardeur';
  if (O === 'or') Object.assign(L, { top: 'tracksuit', topColor: '#121316', gold: 'zip' });
  if (O === 'labo') Object.assign(L, { top: 'coat', topColor: '#F3F5F8', inner: ['shirt_in', '#5B8FE0'] });
  if (O === 'toge') Object.assign(L, { top: 'gown', topColor: '#141519', inner: ['stole', '#D4AF37'], cover: true });
  if (O === 'legende') Object.assign(L, { top: 'armor', topColor: '#D4AF37', metal: true, inner: ['cape', '#8E1020'] });
  if (O === 'casquette') L.cap = true;
  return L;
}
function partsFor(c) {
  const fem = c.sex === 'f', L = look(c), list = [];
  list.push(['head', fem ? 'head_f' : 'head'], ['lids', 'lids'], ['brows', 'brows'], ['lashes', fem ? 'lashes_f' : 'lashes']);
  const hs = c.hair || 'court';
  if (hs !== 'chauve' && (!L.cover || hs === 'long')) list.push(['hair', L.cap && !['long', 'queue'].includes(hs) ? 'hair_rase' : 'hair_' + hs]);
  if (!fem && c.beard === 'complete') list.push(['beard', 'beard']);
  if (L.cap) list.push(['cap', 'cap']);
  if (['debardeur', 'brassiere', 'tshirt'].includes(L.top)) list.push(['body', 'body']);
  list.push(['top', L.top]);
  if (L.top === 'hoodie') list.push(['tee', 'tee_in']);
  if (L.inner) list.push(['inner', L.inner[0]]);
  if (c.diploma) list.push(['hands', 'hands'], ['sleeves', 'sleeves']);
  return { list, L };
}

/* ---------- morphologie : déformation douce, la même pour toutes les pièces ---------- */
function deformer(c) {
  const H = clamp(c.cm || 178, 140, 210) / 100, bmi = clamp(c.kg, 35, 170) / (H * H), m = clamp(c.mus, 0, 100) / 100;
  const wf = clamp((bmi - 22) / 14, -0.4, 0.6), mf = m - 0.45, fr = ({ 0.92: -0.06, 1: 0, 1.1: 0.07 })[c.frame] || 0, fem = c.sex === 'f' ? 1 : 0;
  return (x, y, z, out) => {
    const torso = 1 - sstep(0.05, 0.45, y);
    const neck = sstep(-0.1, 0.25, y) * (1 - sstep(0.45, 0.95, y));
    const jaw = sstep(0.3, 0.55, y) * (1 - sstep(0.85, 1.1, y));
    const sh = sstep(-0.9, -0.3, y);
    const sx = 1 + torso * (0.16 * wf + 0.16 * mf * sh + fr - 0.07 * fem) + neck * (0.12 * mf + 0.1 * wf) + jaw * 0.13 * wf;
    const sz = 1 + torso * (0.26 * wf + 0.08 * mf) + neck * (0.1 * mf + 0.1 * wf) + jaw * 0.1 * wf;
    out[0] = x * sx; out[1] = y - 0.04 * mf * torso * sh; out[2] = z * sz;
    return out;
  };
}

/* ---------- textures ---------- */
const texCache = {};
function irisTex(color) {
  if (texCache[color]) return texCache[color];
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#fbfbfb'; g.fillRect(0, 0, 256, 256);
  const col = new THREE.Color(color), dark = col.clone().multiplyScalar(0.55);
  const gr = g.createRadialGradient(128, 128, 10, 128, 128, 76);
  gr.addColorStop(0, '#000'); gr.addColorStop(0.3, '#000'); gr.addColorStop(0.35, '#' + col.clone().lerp(new THREE.Color('#fff'), 0.15).getHexString()); gr.addColorStop(0.82, '#' + dark.getHexString()); gr.addColorStop(1, '#141010');
  g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 76, 0, TAU); g.fill();
  g.globalAlpha = 0.22; g.strokeStyle = '#fff'; g.lineWidth = 1.5;
  for (let i = 0; i < 70; i++) { const a = i / 70 * TAU; g.beginPath(); g.moveTo(128 + Math.cos(a) * 28, 128 + Math.sin(a) * 28); g.lineTo(128 + Math.cos(a) * 70, 128 + Math.sin(a) * 70); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return (texCache[color] = t);
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
  r.addColorStop(0, 'rgba(0,0,0,.6)'); r.addColorStop(.6, 'rgba(0,0,0,.25)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); shadowTex = new THREE.CanvasTexture(c); return shadowTex;
}

/* ---------- construction ---------- */
function build(cfg) {
  const c = Object.assign({}, DEFAULT, cfg || {});
  const { list, L } = partsFor(c), fem = c.sex === 'f';
  const root = new THREE.Group(), mats = [], geos = [], deformable = [];
  const M = (o, phys = true) => { const m = phys ? new THREE.MeshPhysicalMaterial(o) : new THREE.MeshStandardMaterial(o); mats.push(m); return m; };
  const skinC = new THREE.Color(c.skin), hairC = new THREE.Color(c.hairColor), topC = new THREE.Color(L.topColor), gold = new THREE.Color('#D4AF37');
  const skin = M({ color: '#ffffff', roughness: .48, sheen: .5, sheenColor: new THREE.Color('#ff8a70'), sheenRoughness: .5, vertexColors: true });
  const cloth = (col, metal) => M(metal ? { color: '#ffffff', metalness: 1, roughness: .3, vertexColors: true }
    : { color: '#ffffff', roughness: .86, sheen: .45, sheenColor: new THREE.Color(col).lerp(new THREE.Color('#ffffff'), .25), sheenRoughness: .8, vertexColors: true });
  const hairMat = M({ color: '#ffffff', roughness: .42, clearcoat: .2, clearcoatRoughness: .4, vertexColors: true });
  const colorFn = {
    head: (x, y, z) => {
      let b = 0; for (const s of [-1, 1]) { const d = Math.hypot(x - s * 0.52, y - 0.78, z - 0.6); b = Math.max(b, Math.exp(-d * d / 0.05)); }
      const dn = Math.hypot(x, y - 0.84, z - 1.0); b = Math.max(b, 0.7 * Math.exp(-dn * dn / 0.012));
      const col = skinC.clone(); col.g *= 1 - 0.28 * b; col.b *= 1 - 0.3 * b;
      if (!fem && c.beard === 'courte' && z > -0.05) {
        const top = 0.72 + Math.max(0, Math.abs(x) - 0.66) * 1.4, lip = ((x / 0.22) ** 2 + ((y - 0.585) / 0.06) ** 2) < 1;
        const k = (1 - sstep(top - 0.06, top + 0.02, y)) * sstep(0.02, 0.12, y) * (lip ? 0 : 1) * 0.55; col.lerp(hairC, k);
      }
      return col;
    },
    lids: () => skinC, body: () => skinC, hands: () => skinC,
    brows: () => hairC, hair: () => hairC, beard: () => hairC, lashes: () => new THREE.Color('#1A1210'),
    cap: (x, y) => (y > 2.16 ? gold : new THREE.Color('#13213F')),
    top: (x, y, z) => {
      if (L.gold === 'zip' && Math.abs(x) < 0.03 && z > 0.2) return gold;
      if (L.gold === 'zip' && Math.abs(Math.abs(x) - 1.36) < 0.05 && y < -0.2) return gold;
      return topC;
    },
    tee: () => new THREE.Color('#EEF0F3'),
    inner: () => new THREE.Color(L.inner ? L.inner[1] : '#fff'),
    sleeves: () => (L.metal ? gold : topC)
  };
  const matFor = {
    head: skin, lids: skin, body: skin, hands: skin, brows: hairMat, hair: hairMat, beard: hairMat,
    lashes: M({ color: '#ffffff', roughness: .5, vertexColors: true }, false),
    cap: cloth('#13213F'), top: cloth(L.topColor, L.metal), tee: cloth('#EEF0F3'),
    inner: L.inner && L.inner[0] === 'stole' ? M({ color: '#ffffff', metalness: .9, roughness: .35, vertexColors: true }) : cloth(L.inner ? L.inner[1] : '#fff'),
    sleeves: cloth(L.topColor, L.metal)
  };
  for (const [role, k] of list) {
    const G = GEO[k]; if (!G) continue;
    const g = new THREE.BufferGeometry(), n = G.A.length, col = new Float32Array(n * 3), fn = colorFn[role] || (() => new THREE.Color('#fff'));
    for (let i = 0; i < n; i++) { const cc = fn(G.P[i * 3], G.P[i * 3 + 1], G.P[i * 3 + 2]), a = G.A[i]; col[i * 3] = cc.r * a; col[i * 3 + 1] = cc.g * a; col[i * 3 + 2] = cc.b * a; }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(G.P.length), 3)); g.setAttribute('normal', new THREE.BufferAttribute(G.N, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(new THREE.BufferAttribute(G.I, 1));
    geos.push(g); root.add(new THREE.Mesh(g, matFor[role] || skin)); deformable.push({ g, src: G.P });
  }
  const add = (geo, mat, x, y, z) => { geos.push(geo); const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); root.add(m); return m; };
  // yeux
  const E = MAN._eye, eyeG = new THREE.SphereGeometry(E.r, 48, 32); eyeG.rotateX(Math.PI / 2);
  const uv = eyeG.attributes.uv, pos = eyeG.attributes.position; for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 + pos.getX(i) / E.r * 0.5, 0.5 + pos.getY(i) / E.r * 0.5);
  geos.push(eyeG);
  const eyeM = M({ map: irisTex(c.eyes), roughness: .08, clearcoat: 1, clearcoatRoughness: .02 }), hlM = M({ color: '#ffffff' }, false); hlM.emissive = new THREE.Color('#ffffff');
  const hlG = new THREE.SphereGeometry(0.034, 16, 12); geos.push(hlG);
  const eyes = [];
  for (const s of [-1, 1]) {
    const grp = new THREE.Group(); grp.position.set(s * E.p[0], E.p[1], E.p[2]);
    const e = new THREE.Mesh(eyeG, eyeM); e.rotation.y = s * -0.12; e.rotation.x = -0.06; grp.add(e);
    const hl = new THREE.Mesh(hlG, hlM); hl.position.set(0.07, 0.08, 0.215); grp.add(hl);
    root.add(grp); eyes.push(grp);
  }
  // bouche
  const mouthC = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.19, 0.605, 0.865), new THREE.Vector3(0, 0.555, 0.925), new THREE.Vector3(0.19, 0.605, 0.865)]);
  add(new THREE.TubeGeometry(mouthC, 24, fem ? 0.026 : 0.018, 8), M({ color: fem ? '#B0464A' : '#7A3A32', roughness: .5 }, false));
  // cordons du sweat à capuche
  if (L.top === 'hoodie') {
    const cordM = M({ color: '#F2F2F2', roughness: .7 }, false), agM = M({ color: '#BBBBBB', metalness: 1, roughness: .3 }, false);
    for (const s of [-1, 1]) {
      const cur = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.3, 0.02, 0.42), new THREE.Vector3(s * 0.33, -0.25, 0.62), new THREE.Vector3(s * 0.34, -0.6, 0.72)]);
      add(new THREE.TubeGeometry(cur, 24, 0.022, 10), cordM);
      add(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12), agM, s * 0.34, -0.66, 0.72);
    }
  }
  // accessoires de rang
  const goldM = M({ color: '#D4AF37', metalness: 1, roughness: .28 });
  if (c.outfit === 'labo') {
    const gm = M({ color: '#151515', metalness: .5, roughness: .3 }, false);
    for (const s of [-1, 1]) {
      add(new THREE.TorusGeometry(0.27, 0.025, 10, 40), gm, s * E.p[0], E.p[1], E.p[2] + 0.2);
      add(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 8), gm, s * 0.64, E.p[1] + 0.03, 0.2).rotation.x = Math.PI / 2;
    }
    add(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), gm, 0, E.p[1] + 0.05, E.p[2] + 0.22).rotation.z = Math.PI / 2;
    add(new THREE.CapsuleGeometry(0.025, 0.25, 4, 10), M({ color: '#2B5BD7', roughness: .4 }, false), 0.62, -0.55, 0.7).rotation.z = 0.1;
  }
  if (c.outfit === 'toge') {
    const blk = M({ color: '#151619', roughness: .8 }, false);
    add(new THREE.CylinderGeometry(0.88, 0.95, 0.4, 40), blk, 0, 1.98, -0.06);
    const b = add(new THREE.BoxGeometry(2.1, 0.07, 2.1), blk, 0, 2.2, -0.06); b.rotation.y = Math.PI / 4;
    add(new THREE.SphereGeometry(0.07, 12, 10), goldM, 0, 2.25, -0.06);
    add(new THREE.CylinderGeometry(0.014, 0.014, 0.6, 6), goldM, 1.0, 2.0, 0.25);
    add(new THREE.ConeGeometry(0.07, 0.25, 12), goldM, 1.0, 1.66, 0.25);
  }
  if (c.outfit === 'legende') {
    add(new THREE.TorusGeometry(1.0, 0.05, 10, 64), goldM, 0, 1.5, -0.06).rotation.x = Math.PI / 2 - 0.3;
    const lg = new THREE.SphereGeometry(0.09, 12, 8); geos.push(lg);
    for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; if (Math.sin(a) > 0.85) continue; const lf = new THREE.Mesh(lg, goldM); lf.scale.set(.45, 1, .3); lf.rotation.z = i % 2 ? .7 : -.7; lf.position.set(Math.cos(a) * 1.0, 1.56 - Math.sin(a) * 0.29, Math.sin(a) * 0.96 - 0.06); root.add(lf); }
  }
  // diplôme tenu à deux mains
  if (c.diploma) {
    const dg = new THREE.Group(), w = 1.0, ht = 0.7;
    const pg = new THREE.PlaneGeometry(w, ht); geos.push(pg); dg.add(new THREE.Mesh(pg, M({ map: paperTexture(c.diploma), roughness: .8, side: THREE.DoubleSide }, false)));
    const rollM = M({ color: '#EFE3C2', roughness: .7 }, false), endM = M({ color: DIPLOMAS[c.diploma].c, roughness: .4, metalness: .3 }, false);
    const rg = new THREE.CylinderGeometry(0.05, 0.05, ht * 1.05, 18), eg = new THREE.CylinderGeometry(0.062, 0.062, 0.03, 18); geos.push(rg, eg);
    for (const s of [-1, 1]) { const r = new THREE.Mesh(rg, rollM); r.position.x = s * w / 2; dg.add(r);
      for (const v of [-1, 1]) { const e = new THREE.Mesh(eg, endM); e.position.set(s * w / 2, v * ht * 0.53, 0); dg.add(e); } }
    dg.position.set(0, -0.32, 1.02); dg.rotation.x = -0.12; root.add(dg);
  }
  const av = { root, mats, geos, deformable, eyes, cfg: c };
  applyDeform(av, c);
  return av;
}
function applyDeform(av, c) {
  const def = deformer(c), out = [0, 0, 0];
  for (const d of av.deformable) {
    const P = d.g.attributes.position.array, S = d.src;
    for (let i = 0; i < S.length; i += 3) { def(S[i], S[i + 1], S[i + 2], out); P[i] = out[0]; P[i + 1] = out[1]; P[i + 2] = out[2]; }
    d.g.attributes.position.needsUpdate = true; d.g.computeBoundingSphere();
  }
}

/* ---------- scène ---------- */
let R = null;
function ensure() {
  if (R) return R;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const key = new THREE.DirectionalLight(0xfff0e0, 2.4); key.position.set(2.5, 3, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xbcd0ff, 0.8); fill.position.set(-4, 1, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffd27a, 2.2); rim.position.set(-3, 3, -4); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0x7aa8ff, 1.6); rim2.position.set(3, 2, -4); scene.add(rim2);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223355, 0.35));
  const stage = new THREE.Group(); scene.add(stage);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.85, 0.12, 72), new THREE.MeshStandardMaterial({ color: 0x0c1428, metalness: .7, roughness: .3 })); disc.position.y = -1.26; stage.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.018, 8, 120), new THREE.MeshBasicMaterial({ color: 0xf3d98a })); ring.rotation.x = Math.PI / 2; ring.position.y = -1.2; stage.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.008, 6, 120), new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: .55 })); ring2.rotation.x = Math.PI / 2; ring2.position.y = -1.195; stage.add(ring2);
  const glow = new THREE.Mesh(new THREE.RingGeometry(1.7, 2.6, 72), new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide })); glow.rotation.x = -Math.PI / 2; glow.position.y = -1.33; stage.add(glow);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: getShadowTex(), transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = -1.195; stage.add(sh);
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  R = { renderer, scene, camera, stage, glow, ring2, av: null, spin: 0.35, vel: 0, auto: true, pose: null, poseT0: 0, poseUntil: 0, host: null, raf: 0, mode: 'full', ver: 0 };
  const el = renderer.domElement; el.style.touchAction = 'pan-y'; el.style.display = 'block'; el.style.width = '100%'; el.style.height = '100%';
  let down = null;
  el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, t: performance.now(), moved: false, last: e.clientX }; R.auto = false; try { el.setPointerCapture(e.pointerId); } catch (_) {} });
  el.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - down.last; down.last = e.clientX; if (Math.abs(e.clientX - down.x) > 6) down.moved = true; R.spin += dx * 0.012; R.vel = dx * 0.012; });
  const up = () => { if (!down) return; if (!down.moved && performance.now() - down.t < 350) api.anim(['wave', 'cheer', 'flex'][Math.floor(Math.random() * 3)], 1400); down = null; setTimeout(() => { R.auto = true; }, 2500); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  return R;
}
function disposeAv(av) { if (!av) return; const keep = new Set(Object.values(texCache)); av.geos.forEach((g) => g.dispose()); av.mats.forEach((m) => { if (m.map && !keep.has(m.map)) m.map.dispose(); m.dispose(); }); }
async function prepare(cfg) {
  await manifest();
  const { list } = partsFor(Object.assign({}, DEFAULT, cfg));
  await Promise.all(list.map(([, k]) => loadPart(k)));
}
async function setAvatar(cfg) {
  const r = ensure(), v = ++r.ver;
  await prepare(cfg);
  if (v !== r.ver) return;
  if (r.av) { r.scene.remove(r.av.root); disposeAv(r.av); }
  r.av = build(cfg); r.scene.add(r.av.root);
}
function frame(now) {
  const r = R; if (!r.host) return; r.raf = requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - (r.last || now)) / 1000); r.last = now;
  if (r.auto) { r.vel *= 0.92; r.spin += 0.35 * dt + r.vel; } else r.vel *= 0.9;
  const av = r.av;
  if (av) {
    const root = av.root; root.rotation.y = r.spin;
    const br = Math.sin(now / 900); root.scale.set(1, 1 + br * 0.006, 1);
    let jump = 0, tilt = Math.sin(now / 2300) * 0.03, nod = 0;
    if (now < r.poseUntil) {
      const t = (now - r.poseT0) / (r.poseUntil - r.poseT0), e = Math.sin(t * Math.PI);
      if (r.pose === 'cheer') jump = Math.abs(Math.sin(t * Math.PI * 3)) * 0.25 * (1 - t);
      if (r.pose === 'wave') tilt += Math.sin(t * Math.PI * 4) * 0.12 * e;
      if (r.pose === 'flex') { nod = Math.sin(t * Math.PI * 3) * 0.08 * e; jump = e * 0.08; }
    }
    root.position.y = jump; root.rotation.z = tilt; root.rotation.x = nod;
    if (!r.blinkAt || now > r.blinkAt) { r.blinkAt = now + 2600 + Math.random() * 2400; r.blinkEnd = now + 140; }
    const bl = now < r.blinkEnd ? 0.12 : 1; av.eyes.forEach((e) => { e.scale.y = lerp(e.scale.y, bl, 0.55); });
  }
  r.glow.material.opacity = 0.12 + Math.sin(now / 700) * 0.05; r.ring2.rotation.z = now / 4000;
  r.renderer.render(r.scene, r.camera);
}
function frameCamera(mode, aspect) {
  const cam = R.camera; cam.aspect = aspect;
  if (mode === 'portrait') { cam.fov = 24; cam.position.set(0, 1.25, 7.0); cam.lookAt(0, 1.02, 0); }
  else { const d = 10.2 / Math.min(1, aspect * 1.1); cam.fov = 24; cam.position.set(0, 1.0, d); cam.lookAt(0, 0.42, 0); }
  cam.updateProjectionMatrix();
}
function resize() { const r = R; if (!r || !r.host) return; const w = r.host.clientWidth || 300, h = r.host.clientHeight || 300; r.renderer.setSize(w, h, false); frameCamera(r.mode, w / h); }

const api = {
  DEFAULT, DIPLOMAS, ready: () => manifest(),
  mount(host, cfg, opts = {}) {
    const r = ensure(); api.unmount();
    r.host = host; r.mode = opts.mode || 'full'; host.appendChild(r.renderer.domElement);
    resize(); r.last = 0; r.raf = requestAnimationFrame(frame);
    r.ro = new ResizeObserver(resize); r.ro.observe(host);
    setAvatar(cfg).then(() => { if (opts.onReady) opts.onReady(); });
    return api;
  },
  update(cfg, fast) {
    const r = ensure();
    if (fast && r.av) { const c = Object.assign({}, DEFAULT, cfg); r.av.cfg = c; applyDeform(r.av, c); return; }
    setAvatar(cfg);
  },
  anim(name, ms = 1400) { const r = ensure(); r.pose = name; r.poseT0 = performance.now(); r.poseUntil = r.poseT0 + ms; },
  unmount() { const r = R; if (!r || !r.host) return; cancelAnimationFrame(r.raf); if (r.ro) r.ro.disconnect(); if (r.renderer.domElement.parentNode) r.renderer.domElement.parentNode.removeChild(r.renderer.domElement); r.host = null; },
  async snapshot(cfg, mode = 'full', size = 360) {
    const r = ensure(); await prepare(cfg);
    const wasHost = r.host; if (wasHost) cancelAnimationFrame(r.raf);
    const av = build(cfg); r.scene.add(av.root); if (r.av) r.av.root.visible = false;
    av.root.rotation.y = mode === 'portrait' ? 0.2 : 0.3;
    r.stage.visible = mode !== 'portrait';
    const w = size, hh = mode === 'portrait' ? size : Math.round(size * 1.1);
    r.renderer.setSize(w, hh, false); frameCamera(mode, w / hh);
    r.renderer.render(r.scene, r.camera);
    const url = r.renderer.domElement.toDataURL('image/png');
    r.scene.remove(av.root); disposeAv(av); if (r.av) r.av.root.visible = true; r.stage.visible = true;
    if (wasHost) { resize(); r.raf = requestAnimationFrame(frame); }
    return url;
  }
};
window.MFCAvatar = api;
window.dispatchEvent(new Event('mfc-avatar'));
manifest();

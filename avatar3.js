/* MFC Quiz — avatar 3D « athlète » (v3)
   Personnages : Quaternius « Ultimate Modular Men / Women » (CC0, domaine public), recolorés et sculptés par le code.
   API : window.MFCAvatar3 = { mount, update, anim, unmount, snapshot, ready } */
import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const BASE = (window.MFC_AV3_BASE || './av3/');
const PAL = { navy: '#22346E', navy2: '#18254F', gold: '#D4AF37', goldL: '#F3D98A', white: '#EEF1F6', silver: '#B9C2D0', blue: '#2F7BFF', sole: '#E9ECF2' };
const DEFAULT = { sex: 'h', skin: '#D9A07A', hair: 'court', hairColor: '#4A2C1A', level: 1, mus: 0.75 };

/* ---------- composition des tenues (palier niveau 1 pour le prototype) ---------- */
const HEADS = {
  h: { court: 'M_Casual_Hoodie_Head', mi: 'M_Casual_2_Head', pique: 'M_Beach_Head', long: 'M_Suit_Head' },
  f: { queue: 'F_Soldier_Head', court: 'F_Adventurer_Head', carre: 'F_Casual_Head', long: 'F_Suit_Head' }
};
const OUTFIT1 = {
  h: { body: 'M_Casual_2_Body', legs: 'M_Casual_Hoodie_Legs', feet: 'M_Casual_Hoodie_Feet' },
  f: { body: 'F_Punk_Body', legs: 'F_Adventurer_Legs', legs2: 'F_Formal_Legs', feet: 'F_Formal_Feet' }
};
/* rôle de chaque matériau d'origine → couleur MFC */
const ROLE = {
  M_Casual_2_Body: { LightBrown: 'navy' },
  M_Casual_Hoodie_Legs: { LightBlue: 'navy2' },
  M_Casual_Hoodie_Feet: { Purple: 'navy', White: 'sole' },
  F_Punk_Body: { Pink: 'navy', Black: 'navy2' },
  F_Adventurer_Legs: { Skin: 'hide', White: 'hide', Brown_02: 'navy2', Brown2: 'navy', LightGreen: 'navy2', Gold: 'gold' },
  F_Formal_Legs: { LimeGreen: 'hide' },
  F_Formal_Feet: { Red: 'navy' }
};

const loader = new GLTFLoader();
const cache = {};
function get(name) { return cache[name] || (cache[name] = loader.loadAsync(BASE + name + '.glb')); }

/* ---------- sculpture athlétique : on gonfle les muscles dans l'espace de chaque os ---------- */
const MUS = { // os : [gonflement max, position du ventre musculaire 0..1, largeur]
  'UpperArm.L': [0.62, 0.45, 0.30], 'UpperArm.R': [0.62, 0.45, 0.30],
  'LowerArm.L': [0.40, 0.22, 0.28], 'LowerArm.R': [0.40, 0.22, 0.28],
  'UpperLeg.L': [0.30, 0.32, 0.38], 'UpperLeg.R': [0.30, 0.32, 0.38],
  'LowerLeg.L': [0.42, 0.26, 0.22], 'LowerLeg.R': [0.42, 0.26, 0.22],
  'Chest': [0.22, 0.45, 0.55], 'Shoulder.L': [0.50, 0.85, 0.35], 'Shoulder.R': [0.50, 0.85, 0.35]
};
function sculpt(mesh, mus) {
  const g = mesh.geometry, P = g.attributes.position, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight;
  const bones = mesh.skeleton.bones, inv = mesh.skeleton.boneInverses, bm = mesh.bindMatrix, bmi = mesh.bindMatrixInverse;
  const len = bones.map((b) => { const c = b.children.find((x) => !x.isMesh && x.position.length() > 0.001); return c ? c.position.length() : 0.1; });
  const v = new THREE.Vector3(), l = new THREE.Vector3(), acc = new THREE.Vector3(), w4 = [0, 0, 0, 0], i4 = [0, 0, 0, 0];
  const toBone = bones.map((b, i) => new THREE.Matrix4().multiplyMatrices(inv[i], bm));
  const fromBone = toBone.map((m) => m.clone().invert());
  for (let k = 0; k < P.count; k++) {
    v.fromBufferAttribute(P, k); acc.set(0, 0, 0);
    i4[0] = SI.getX(k); i4[1] = SI.getY(k); i4[2] = SI.getZ(k); i4[3] = SI.getW(k);
    w4[0] = SW.getX(k); w4[1] = SW.getY(k); w4[2] = SW.getZ(k); w4[3] = SW.getW(k);
    for (let j = 0; j < 4; j++) {
      if (w4[j] < 0.01) continue; const b = bones[i4[j]], m = MUS[b.name]; if (!m) continue;
      l.copy(v).applyMatrix4(toBone[i4[j]]);
      const t = l.y / Math.max(0.05, len[i4[j]]), prof = Math.exp(-Math.pow((t - m[1]) / m[2], 2));
      let s = 1 + m[0] * mus * prof;
      if (b.name === 'Chest') { l.z *= 1 + (s - 1) * 1.2; l.x *= 1 + (s - 1) * 0.9; }
      else { l.x *= s; l.z *= s; }
      l.applyMatrix4(fromBone[i4[j]]); acc.addScaledVector(l.sub(v), w4[j]);
    }
    // V : épaules et dorsaux plus larges, taille plus fine (en espace monde de pose de liaison)
    const wy = v.y + acc.y, wx = v.x + acc.x;
    const ty = Math.max(0, Math.min(1, (wy - 1.12) / 0.32)), ww = 1 + mus * (0.10 * ty - 0.05 * (1 - ty) * (wy > 0.95 ? 1 : 0));
    const tor = Math.abs(wx) < 0.26 ? ww : 1 + (ww - 1) * 0.6;
    P.setXYZ(k, wx * tor, wy, v.z + acc.z);
  }
  P.needsUpdate = true;
}

/* ---------- couleurs : un matériau « flat » par rôle (rendu low-poly à facettes) ---------- */
const MATS = {};
const HIDE = new THREE.MeshBasicMaterial({ visible: false });
function mat(color, opt = {}) {
  const k = color + JSON.stringify(opt);
  return MATS[k] || (MATS[k] = new THREE.MeshStandardMaterial(Object.assign({ color, flatShading: true, roughness: 0.62, metalness: 0.05 }, opt)));
}
function colorFor(part, matName, cfg) {
  if (/^Skin/.test(matName)) return mat(cfg.skin);
  if (/^Hair|Eyebrows|Moustache/.test(matName)) return mat(cfg.hairColor, { roughness: 0.8 });
  if (/^Eye$/.test(matName)) return mat('#1A1410', { roughness: 0.3 });
  const r = (ROLE[part] || {})[matName];
  if (r === 'hide') return HIDE;
  if (r === 'gold') return mat(PAL.gold, { metalness: 0.55, roughness: 0.32 });
  if (r) return cloth(PAL[r]);
  if (part.endsWith('_Head')) return mat(matName === 'Brown' ? '#2A1A12' : cfg.hairColor); // détails du visage
  return cloth(PAL.navy);
}
function cloth(c) { const m = mat(c); m.userData.cloth = true; return m; }

/* ---------- liserés dorés (niveau 5 et plus) : on repeint des facettes selon leur position ---------- */
const ACCENT = {
  M_Casual_2_Body: (x, y, z) => (y > 1.47 && Math.abs(x) > 0.1 && Math.abs(x) < 0.26) || (Math.abs(x) > 0.13 && Math.abs(x) < 0.2 && y > 1.06 && y < 1.36 && z > -0.03 && z < 0.1),
  M_Casual_Hoodie_Legs: (x, y, z) => Math.abs(x) > 0.168 && y > 0.68 && z > 0.0 && z < 0.07,
  F_Punk_Body: (x, y, z) => y > 1.27 && y < 1.33 && Math.abs(x) < 0.2,
  F_Adventurer_Legs: (x, y, z) => Math.abs(x) > 0.17 && y > 0.82 && z > -0.03 && z < 0.1
};
function accent(mesh, rule, goldMat) {
  let g = mesh.geometry; if (g.index) g = g.toNonIndexed();
  const P = g.attributes.position, mats = Array.isArray(mesh.material) ? mesh.material.slice() : [mesh.material];
  const gi = mats.length; mats.push(goldMat);
  const groups = g.groups.length ? g.groups : [{ start: 0, count: P.count, materialIndex: 0 }];
  // on réordonne les triangles : d'abord ceux d'origine, puis les dorés
  const attrs = Object.keys(g.attributes), out = {}, order = [], ng = [];
  groups.forEach((gr) => {
    const base = [], gold = [];
    for (let t = gr.start; t < gr.start + gr.count; t += 3) {
      const cx = (P.getX(t) + P.getX(t + 1) + P.getX(t + 2)) / 3, cy = (P.getY(t) + P.getY(t + 1) + P.getY(t + 2)) / 3, cz = (P.getZ(t) + P.getZ(t + 1) + P.getZ(t + 2)) / 3;
      const w = new THREE.Vector3(cx, cy, cz).applyMatrix4(mesh.bindMatrix);
      (mats[gr.materialIndex] !== HIDE && mats[gr.materialIndex].userData.cloth && rule(w.x, w.y, w.z) ? gold : base).push(t);
    }
    if (base.length) { ng.push({ start: order.length * 3, count: base.length * 3, materialIndex: gr.materialIndex }); order.push(...base); }
    if (gold.length) { ng.push({ start: order.length * 3, count: gold.length * 3, materialIndex: gi }); order.push(...gold); }
  });
  const ng2 = new THREE.BufferGeometry();
  attrs.forEach((a) => {
    const src = g.attributes[a], n = src.itemSize, arr = new src.array.constructor(order.length * 3 * n);
    order.forEach((t, i) => { for (let k = 0; k < 3 * n; k++) arr[i * 3 * n + k] = src.array[t * n + k]; });
    ng2.setAttribute(a, new THREE.BufferAttribute(arr, n, src.normalized));
  });
  ng.forEach((x) => ng2.addGroup(x.start, x.count, x.materialIndex));
  mesh.geometry = ng2; mesh.material = mats;
}

/* ---------- logo MFC (petit « M » doré en relief) ---------- */
function logo(size) {
  const s = new THREE.Shape(), w = size, h = size * 0.62;
  s.moveTo(-w / 2, -h / 2); s.lineTo(-w * 0.28, h / 2); s.lineTo(0, -h * 0.05); s.lineTo(w * 0.28, h / 2); s.lineTo(w / 2, -h / 2);
  s.lineTo(w * 0.33, -h / 2); s.lineTo(w * 0.22, h * 0.12); s.lineTo(0, -h * 0.42); s.lineTo(-w * 0.22, h * 0.12); s.lineTo(-w * 0.33, -h / 2); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: size * 0.08, bevelEnabled: false });
  return new THREE.Mesh(g, mat(PAL.gold, { metalness: 0.6, roughness: 0.3, emissive: '#3A2A05' }));
}

/* ---------- scène ---------- */
let R = null;
function ensure() {
  if (R) return R;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(26, 1, 0.05, 50);
  scene.add(new THREE.HemisphereLight('#C8D6FF', '#1A1530', 1.15));
  const key = new THREE.DirectionalLight('#FFF1DC', 2.6); key.position.set(1.6, 3.2, 2.6); scene.add(key);
  const rimG = new THREE.DirectionalLight('#FFC861', 2.4); rimG.position.set(-2.4, 2.0, -2.2); scene.add(rimG);
  const rimB = new THREE.DirectionalLight('#5B8CFF', 1.8); rimB.position.set(2.6, 1.4, -2.0); scene.add(rimB);
  // socle
  const stage = new THREE.Group(); scene.add(stage);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.09, 48), mat('#141E40', { metalness: 0.0, roughness: 0.85 }));
  disc.position.y = -0.045; stage.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.645, 0.012, 8, 96), new THREE.MeshBasicMaterial({ color: '#FFD36B' }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.002; stage.add(ring);
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 10, 64, 64, 64); gr.addColorStop(0, 'rgba(255,205,90,.55)'); gr.addColorStop(.6, 'rgba(212,175,55,.18)'); gr.addColorStop(1, 'rgba(212,175,55,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = 0.004; stage.add(glow);
  // montagnes low-poly (identité MFC)
  const mts = new THREE.Group(); scene.add(mts);
  [[-1.7, -4.2, 1.1, 1.1], [1.8, -4.4, 0.95, 0.95], [-0.2, -5.6, 1.5, 1.4], [3.2, -5.2, 0.8, 1.2], [-3.3, -5.0, 0.85, 1.2]].forEach(([x, z, h, r]) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h * 1.6, 5, 1), mat('#16245A', { roughness: 0.95 })); m.position.set(x, h * 0.8 - 0.05, z); m.rotation.y = x; mts.add(m);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.28, h * 0.45, 5, 1), mat('#C9A447', { emissive: '#2A1E06', roughness: 0.7 })); cap.position.set(x, h * 1.6 - 0.05 - h * 0.22 + 0.0, z); cap.rotation.y = x; mts.add(cap);
  });
  R = { renderer, scene, cam, stage, ring, glow, mts, host: null, av: null, raf: 0, yaw: 0.35, vyaw: 0, drag: null, lastTouch: 0, clock: new THREE.Clock(), mixer: null, actions: {}, pose: null };
  return R;
}

async function build(cfg) {
  const c = Object.assign({}, DEFAULT, cfg); const sx = c.sex === 'f' ? 'f' : 'h', G = sx === 'f' ? 'F' : 'M';
  const o = OUTFIT1[sx], head = HEADS[sx][c.hair] || Object.values(HEADS[sx])[0];
  const names = [o.body, o.legs, o.legs2, o.feet, head].filter(Boolean);
  const [base, ...parts] = await Promise.all([get(G + '_anims'), ...names.map(get)]);
  const root = new THREE.Group();
  // squelette partagé : on clone la scène d'animations (nœuds + os)
  const sk = base.scene.clone(true);
  const boneByName = {}; sk.traverse((n) => { if (n.name && !boneByName[n.name]) boneByName[n.name] = n; });
  root.add(sk);
  parts.forEach((gl, idx) => {
    const name = names[idx];
    gl.scene.traverse((m) => {
      if (!m.isSkinnedMesh) return;
      const mesh = new THREE.SkinnedMesh(m.geometry.clone(), m.material);
      const bones = m.skeleton.bones.map((b) => boneByName[b.name]);
      mesh.bind(new THREE.Skeleton(bones, m.skeleton.boneInverses.map((x) => x.clone())), m.bindMatrix.clone());
      // matériaux : un par groupe (primitive) d'origine
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      mesh.material = mats.map((mm) => colorFor(name, mm.name, c));
      if (!Array.isArray(m.material)) mesh.material = mesh.material[0];
      if (!/_Head$/.test(name)) sculpt(mesh, c.mus);
      if (c.level >= 5 && ACCENT[name]) accent(mesh, ACCENT[name], mat(PAL.gold, { metalness: 0.5, roughness: 0.35 }));
      mesh.frustumCulled = false; mesh.castShadow = false;
      sk.add(mesh);
    });
  });
  // logo MFC sur la poitrine et le short
  const chest = boneByName['Chest'];
  if (chest) { const L = logo(0.055); L.position.set(sx === 'f' ? 0.045 : 0.05, 0.10, 0.11); chest.add(L); }
  const thigh = boneByName['UpperLeg.L'];
  if (thigh) { const L2 = logo(0.04); L2.position.set(0.03, 0.12, 0.085); L2.rotation.set(Math.PI, 0, 0); thigh.add(L2); }
  // mise à l'échelle : 1,8 unité de haut environ
  const box = new THREE.Box3().setFromObject(root); const h = box.max.y - box.min.y || 1.8;
  root.userData.h = h;
  const mixer = new THREE.AnimationMixer(sk); const actions = {};
  base.animations.forEach((a) => { actions[a.name] = mixer.clipAction(a); });
  return { root, sk, bones: boneByName, mixer, actions, cfg: c };
}

function frame() {
  const r = R; if (!r || !r.host) return; r.raf = requestAnimationFrame(frame);
  const dt = Math.min(0.05, r.clock.getDelta()), now = performance.now();
  if (r.av) {
    r.av.mixer.update(dt);
    // respiration + léger transfert d'appui (par-dessus l'animation Idle)
    const b = r.av.bones, t = now / 1000;
    if (b.Chest) { const s = 1 + Math.sin(t * 1.6) * 0.012; b.Chest.scale.set(s, 1 + Math.sin(t * 1.6) * 0.008, s); }
    if (b.Head) b.Head.rotation.y += Math.sin(t * 0.45) * 0.08;
    if (!r.drag) { r.yaw += r.vyaw; r.vyaw *= 0.92; if (now - r.lastTouch > 4000) r.yaw += (0.35 - r.yaw) * 0.02; }
    r.av.root.rotation.y = r.yaw;
  }
  r.ring.material.color.setHSL(0.12, 1, 0.62 + Math.sin(now / 600) * 0.06);
  r.glow.material.opacity = 0.85 + Math.sin(now / 700) * 0.15;
  r.renderer.render(r.scene, r.cam);
}
function frameCam(aspect) {
  const r = R, h = (r.av && r.av.root.userData.h) || 1.8; r.cam.aspect = aspect;
  const d = (h * 1.22) / Math.tan((r.cam.fov * Math.PI) / 360) / 2 / Math.min(1, aspect * 1.25);
  r.cam.position.set(0, h * 0.55, d); r.cam.lookAt(0, h * 0.48, 0); r.cam.updateProjectionMatrix();
}
function resize() { const r = R; if (!r || !r.host) return; const w = r.host.clientWidth || 300, h = r.host.clientHeight || 400; r.renderer.setSize(w, h, false); frameCam(w / h); }
function bindTouch(el) {
  const r = R;
  const down = (x) => { r.drag = { x, yaw: r.yaw }; r.vyaw = 0; r.lastTouch = performance.now(); };
  const move = (x) => { if (!r.drag) return; const ny = r.drag.yaw + (x - r.drag.x) * 0.012; r.vyaw = ny - r.yaw; r.yaw = ny; r.lastTouch = performance.now(); };
  const up = () => { r.drag = null; r.lastTouch = performance.now(); };
  el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); down(e.clientX); });
  el.addEventListener('pointermove', (e) => move(e.clientX));
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.style.touchAction = 'pan-y';
}

const api = {
  DEFAULT,
  async mount(host, cfg, opts = {}) {
    const r = ensure(); api.unmount(); r.host = host;
    host.appendChild(r.renderer.domElement); r.renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
    bindTouch(r.renderer.domElement);
    resize(); r.ro = new ResizeObserver(resize); r.ro.observe(host);
    r.clock.getDelta(); r.raf = requestAnimationFrame(frame);
    await api.update(cfg); if (opts.onReady) opts.onReady();
  },
  async update(cfg) {
    const r = ensure(); const av = await build(cfg);
    if (r.av) r.scene.remove(r.av.root);
    r.av = av; r.scene.add(av.root);
    const idle = av.actions.Idle || Object.values(av.actions)[0]; if (idle) idle.reset().play();
    resize();
  },
  anim(name) {
    const r = R; if (!r || !r.av) return; const a = r.av.actions[name]; if (!a) return;
    const idle = r.av.actions.Idle; a.reset(); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = false; a.fadeIn(0.15).play();
    if (idle) idle.fadeOut(0.15);
    setTimeout(() => { a.fadeOut(0.3); if (idle) idle.reset().fadeIn(0.3).play(); }, a.getClip().duration * 1000 - 250);
  },
  unmount() { const r = R; if (!r || !r.host) return; cancelAnimationFrame(r.raf); if (r.ro) r.ro.disconnect(); const el = r.renderer.domElement; if (el.parentNode) el.parentNode.removeChild(el); r.host = null; }
};
window.MFCAvatar3 = api;
window.dispatchEvent(new Event('mfc-avatar3'));

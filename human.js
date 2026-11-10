/* MFC Quiz — humain réaliste (modèle de base MakeHuman, CC0) */
import * as THREE from './vendor/three.module.min.js';

let DATA = null;
export async function loadHuman(base = './human/') {
  if (DATA) return DATA;
  const [meta, buf] = await Promise.all([fetch(base + 'human.json').then((r) => r.json()), fetch(base + 'human.bin').then((r) => r.arrayBuffer())]);
  const T = { float32: Float32Array, int16: Int16Array, uint16: Uint16Array, uint8: Uint8Array };
  const get = (k) => new T[meta[k].t](buf, meta[k].o, meta[k].n);
  const N = meta.N, NE = meta.NE, K = meta.grid.length;
  const pos0 = get('pos0'), sv = get('sv'), ib = get('ib');
  const deltas = [];
  for (let k = 1; k < K; k++) { const q = get('d' + k), s = meta.dscale[k - 1], f = new Float32Array(q.length); for (let i = 0; i < q.length; i++) f[i] = q[i] * s; deltas.push(f); }
  // normales lissées par sommet d'origine (pas de couture UV visible)
  const nV = sv.reduce((a, b) => Math.max(a, b), 0) + 1;
  const normalsFor = (P) => {
    const acc = new Float32Array(nV * 3), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
    for (let t = 0; t < ib.length; t += 3) {
      const i0 = ib[t], i1 = ib[t + 1], i2 = ib[t + 2];
      a.fromArray(P, i0 * 3); b.fromArray(P, i1 * 3); c.fromArray(P, i2 * 3);
      n.subVectors(c, b).cross(a.clone().sub(b));
      for (const i of [i0, i1, i2]) { const o = sv[i] * 3; acc[o] += n.x; acc[o + 1] += n.y; acc[o + 2] += n.z; }
    }
    const out = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const o = sv[i] * 3; n.set(acc[o], acc[o + 1], acc[o + 2]).normalize(); out[i * 3] = n.x; out[i * 3 + 1] = n.y; out[i * 3 + 2] = n.z; }
    return out;
  };
  const n0 = normalsFor(pos0);
  const ndel = deltas.map((d) => { const P = new Float32Array(pos0.length); for (let i = 0; i < P.length; i++) P[i] = pos0[i] + d[i]; const n = normalsFor(P); for (let i = 0; i < n.length; i++) n[i] -= n0[i]; return n; });
  const epos0 = get('epos0'), edel = [];
  for (let k = 1; k < K; k++) { const q = get('ed' + k), s = meta.edscale[k - 1], f = new Float32Array(q.length); for (let i = 0; i < q.length; i++) f[i] = q[i] * s; edel.push(f); }
  DATA = { meta, N, NE, K, pos0, n0, deltas, ndel, uv: get('uv'), ib, il: get('il'), si: get('si'), sw: get('sw'), sv, heads: get('heads'), tails: get('tails'), epos0, edel, euv: get('euv'), ei: get('ei'), eside: get('eside') };
  return DATA;
}

/* poids multilinéaires sur la grille (sexe × muscle × poids) */
function lv(x) { x = Math.min(1, Math.max(0, x)); return x <= 0.5 ? [1 - 2 * x, 2 * x, 0] : [0, 2 - 2 * x, 2 * x - 1]; }
export function gridWeights(g, m, w) {
  const G = [1 - g, g], Mw = lv(m), Ww = lv(w), out = [];
  for (let a = 0; a < 2; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) out.push(G[a] * Mw[b] * Ww[c]);
  return out;
}

export function makeHuman(D, mats) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(D.pos0.slice(), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(D.n0.slice(), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(D.uv, 2));
  g.setAttribute('skinIndex', new THREE.BufferAttribute(new Uint16Array(D.si), 4));
  g.setAttribute('skinWeight', new THREE.BufferAttribute(D.sw, 4, true));
  g.morphAttributes.position = D.deltas.map((d) => new THREE.BufferAttribute(d, 3));
  g.morphAttributes.normal = D.ndel.map((d) => new THREE.BufferAttribute(d, 3));
  g.morphTargetsRelative = true;
  g.setIndex(new THREE.BufferAttribute(D.ib, 1));
  const bones = D.meta.bones.map((n) => { const b = new THREE.Bone(); b.name = n; return b; });
  D.meta.parents.forEach((p, i) => { if (p >= 0) bones[p].add(bones[i]); });
  const rootBone = bones[D.meta.parents.indexOf(-1)];
  const skeleton = new THREE.Skeleton(bones);
  const group = new THREE.Group();
  const body = new THREE.SkinnedMesh(g, mats.skin); body.add(rootBone); body.frustumCulled = false; group.add(body);
  // cils
  const lg = new THREE.BufferGeometry();
  ['position', 'normal', 'uv', 'skinIndex', 'skinWeight'].forEach((k) => lg.setAttribute(k, g.getAttribute(k)));
  lg.morphAttributes = g.morphAttributes; lg.morphTargetsRelative = true; lg.setIndex(new THREE.BufferAttribute(D.il, 1));
  const lashes = new THREE.SkinnedMesh(lg, mats.lash); lashes.frustumCulled = false; group.add(lashes);
  // yeux
  const eg = new THREE.BufferGeometry();
  eg.setAttribute('position', new THREE.BufferAttribute(D.epos0.slice(), 3));
  eg.setAttribute('uv', new THREE.BufferAttribute(D.euv, 2));
  const eL = D.meta.bones.indexOf('eye.L'), eR = D.meta.bones.indexOf('eye.R');
  const esi = new Uint16Array(D.NE * 4), esw = new Float32Array(D.NE * 4);
  for (let i = 0; i < D.NE; i++) { esi[i * 4] = D.eside[i] ? eL : eR; esw[i * 4] = 1; }
  eg.setAttribute('skinIndex', new THREE.BufferAttribute(esi, 4)); eg.setAttribute('skinWeight', new THREE.BufferAttribute(esw, 4));
  eg.morphAttributes.position = D.edel.map((d) => new THREE.BufferAttribute(d, 3)); eg.morphTargetsRelative = true;
  eg.setIndex(new THREE.BufferAttribute(D.ei, 1)); eg.computeVertexNormals();
  const eyes = new THREE.SkinnedMesh(eg, mats.eye); eyes.frustumCulled = false; group.add(eyes);
  const meshes = [body, lashes, eyes];
  meshes.forEach((m) => m.bind(skeleton));
  const B = {}; bones.forEach((b) => { B[b.name] = b; });
  const H = new Float32Array(bones.length * 3);
  const human = { group, body, lashes, eyes, skeleton, bones: B, list: bones, meshes, H, W: null,
    extra: [],
    addSkinned(geo, mat) { const m = new THREE.SkinnedMesh(geo, mat); m.frustumCulled = false; group.add(m); m.bind(skeleton); meshes.push(m); return m; },
    setShape(gw, mw, ww) {
      const W = gridWeights(gw, mw, ww); human.W = W;
      meshes.forEach((m) => { if (m.morphTargetInfluences) for (let k = 1; k < W.length; k++) m.morphTargetInfluences[k - 1] = W[k]; });
      H.fill(0);
      const nb = bones.length;
      for (let k = 0; k < W.length; k++) { if (!W[k]) continue; const o = k * nb * 3; for (let i = 0; i < nb * 3; i++) H[i] += W[k] * D.heads[o + i]; }
      const saved = bones.map((b) => b.quaternion.clone()), rot = group.quaternion.clone(), gp = group.position.clone(), gs = group.scale.clone();
      group.quaternion.identity(); group.position.set(0, 0, 0); group.scale.set(1, 1, 1);
      bones.forEach((b, i) => { b.quaternion.identity(); const p = D.meta.parents[i]; b.position.set(H[i * 3], H[i * 3 + 1], H[i * 3 + 2]); if (p >= 0) b.position.sub(new THREE.Vector3(H[p * 3], H[p * 3 + 1], H[p * 3 + 2])); });
      group.updateMatrixWorld(true);
      skeleton.calculateInverses();
      meshes.forEach((m) => m.bind(skeleton, m.matrixWorld));
      bones.forEach((b, i) => b.quaternion.copy(saved[i]));
      group.quaternion.copy(rot); group.position.copy(gp); group.scale.copy(gs);
    },
    morphPos(i) { // position d'un sommet du corps (forme courante, repos)
      const W = human.W, P = D.pos0; let x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
      for (let k = 1; k < W.length; k++) { if (!W[k]) continue; const d = D.deltas[k - 1]; x += W[k] * d[i * 3]; y += W[k] * d[i * 3 + 1]; z += W[k] * d[i * 3 + 2]; }
      return new THREE.Vector3(x, y, z);
    }
  };
  return human;
}

/* vêtement = sous-ensemble de la peau, gonflé le long de la normale (suit forme + squelette) */
export function inflate(mat, thick, fade = 0, noise = 0, bump = 0, taper = 0) {
  mat.userData.u = { uThick: { value: thick }, uFade: { value: fade }, uNoise: { value: noise }, uBump: { value: bump }, uTaper: { value: taper } };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, mat.userData.u);
    sh.vertexShader = 'uniform float uThick;\nuniform float uBump;\nuniform float uTaper;\nattribute float edge;\nvarying float vEdge;\nvarying vec3 vObj;\nfloat hv(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }\n' + sh.vertexShader
      .replace('#include <skinning_vertex>', '#include <skinning_vertex>\n float tk = uThick; if (uTaper > 0.0) tk *= smoothstep(0.0, uTaper, edge);\n if (uBump > 0.0) { vec3 q = position * 160.0; vec3 i = floor(q); vec3 f = fract(q); f = f*f*(3.0-2.0*f); float n = mix(mix(mix(hv(i),hv(i+vec3(1,0,0)),f.x),mix(hv(i+vec3(0,1,0)),hv(i+vec3(1,1,0)),f.x),f.y),mix(mix(hv(i+vec3(0,0,1)),hv(i+vec3(1,0,1)),f.x),mix(hv(i+vec3(0,1,1)),hv(i+vec3(1,1,1)),f.x),f.y),f.z); tk += uBump * n * (uTaper > 0.0 ? smoothstep(0.0, uTaper, edge) : 1.0); }\n transformed += normalize(objectNormal) * tk;\n vEdge = edge; vObj = position;');
    sh.fragmentShader = 'uniform float uFade;\nuniform float uNoise;\nvarying float vEdge;\nvarying vec3 vObj;\nfloat hh(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }\n' + sh.fragmentShader
      .replace('#include <alphamap_fragment>', '#include <alphamap_fragment>\n if (uFade > 0.0) diffuseColor.a *= smoothstep(0.0, uFade, vEdge);\n if (uNoise > 0.0) { float n = hh(floor(vObj * vec3(2200.0, 900.0, 2200.0))); diffuseColor.a *= mix(1.0, smoothstep(0.1, 0.8, n), uNoise); diffuseColor.rgb *= mix(1.0, 0.72 + 0.56 * n, uNoise * 0.7); }');
  };
  mat.customProgramCacheKey = () => 'inflate2' + (fade > 0) + (noise > 0) + (bump > 0) + (taper > 0);
  return mat;
}
export function makeGarment(human, index, mat) {
  const src = human.body.geometry, g = new THREE.BufferGeometry();
  ['position', 'normal', 'uv', 'skinIndex', 'skinWeight'].forEach((k) => g.setAttribute(k, src.getAttribute(k)));
  g.morphAttributes = src.morphAttributes; g.morphTargetsRelative = true;
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(index), 1));
  const m = human.addSkinned(g, mat);
  if (human.W) m.morphTargetInfluences && human.W.forEach((w, k) => { if (k) m.morphTargetInfluences[k - 1] = w; });
  return m;
}

/* vêtement découpé : sommets du corps + sommets interpolés sur les lignes de coupe */
export function makeClipped(human, G, mat) {
  const src = human.body.geometry, N = src.getAttribute('position').count;
  const used = new Map(), list = [];
  const id = (i) => { if (!used.has(i)) { used.set(i, list.length); list.push(i); } return used.get(i); };
  const idx = G.t.map(id);
  const M = list.length;
  const gather = (arr, item) => {
    const out = new arr.constructor(M * item);
    for (let k = 0; k < M; k++) { const i = list[k];
      if (i < N) for (let c = 0; c < item; c++) out[k * item + c] = arr[i * item + c];
      else { const [a, b, t] = G.n[i - N]; for (let c = 0; c < item; c++) out[k * item + c] = arr[a * item + c] * (1 - t) + arr[b * item + c] * t; }
    }
    return out;
  };
  const gatherNear = (arr, item) => {
    const out = new arr.constructor(M * item);
    for (let k = 0; k < M; k++) { let i = list[k]; if (i >= N) { const [a, b, t] = G.n[i - N]; i = t < 0.5 ? a : b; } for (let c = 0; c < item; c++) out[k * item + c] = arr[i * item + c]; }
    return out;
  };
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(gather(src.attributes.position.array, 3), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(gather(src.attributes.normal.array, 3), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(gather(src.attributes.uv.array, 2), 2));
  g.setAttribute('skinIndex', new THREE.BufferAttribute(gatherNear(src.attributes.skinIndex.array, 4), 4));
  g.setAttribute('skinWeight', new THREE.BufferAttribute(gatherNear(src.attributes.skinWeight.array, 4), 4, true));
  g.morphAttributes.position = src.morphAttributes.position.map((a) => new THREE.BufferAttribute(gather(a.array, 3), 3));
  g.morphAttributes.normal = src.morphAttributes.normal.map((a) => new THREE.BufferAttribute(gather(a.array, 3), 3));
  g.morphTargetsRelative = true;
  g.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
  g.setAttribute('edge', new THREE.BufferAttribute(new Float32Array(G.e || new Array(M).fill(1)), 1));
  g.userData.src = list;
  const m = human.addSkinned(g, mat);
  if (human.W) human.W.forEach((w, k) => { if (k) m.morphTargetInfluences[k - 1] = w; });
  return m;
}

/* texture de peau peinte : lèvres, sourcils, cils */
export function paintSkin(paint, o, canvas) {
  const S = 1024, c = canvas || document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = o.skin; g.fillRect(0, 0, S, S);
  const sk = new THREE.Color(o.skin), lip = sk.clone().lerp(new THREE.Color(o.lip || '#B0524E'), o.lipMix || 0.55);
  paint.lips.forEach(([u, v, r, a]) => { const x = u * S, y = (1 - v) * S, R = Math.max(2, r * S * 1.25);
    const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, 'rgba(' + [lip.r, lip.g, lip.b].map((q) => Math.round(Math.pow(q, 1 / 2.2) * 255)).join(',') + ',' + (0.55 * a).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill(); });
  const stroke = (line, color, alpha, mult, jitter) => {
    for (let pass = 0; pass < (jitter ? 6 : 1); pass++) {
      g.strokeStyle = color; g.globalAlpha = alpha; g.lineCap = 'round'; g.lineJoin = 'round';
      for (let i = 1; i < line.length; i++) {
        const [u0, v0, w0] = line[i - 1], [u1, v1, w1] = line[i];
        const j = jitter ? (Math.random() - 0.5) * w1 * S * 0.9 : 0;
        g.lineWidth = Math.max(1, (w0 + w1) / 2 * S * mult * (jitter ? 0.45 : 1));
        g.beginPath(); g.moveTo(u0 * S, (1 - v0) * S + j); g.lineTo(u1 * S, (1 - v1) * S + j); g.stroke();
      }
    }
    g.globalAlpha = 1;
  };
  paint.brows.forEach((l) => stroke(l, o.brow, 0.35, 1, true));
  paint.lash.forEach((l) => stroke(l, '#1a0f0a', 0.85, 1, false));
  return c;
}

/* lissage (chaussures : on efface les orteils) — appliqué à la forme de base et à chaque morphose */
export function smoothMesh(mesh, iters = 10, lambda = 0.6, inflateBy = 0) {
  const g = mesh.geometry, idx = g.index.array, P = g.attributes.position.array, n = P.length / 3;
  const nb = Array.from({ length: n }, () => new Set());
  for (let i = 0; i < idx.length; i += 3) { const a = idx[i], b = idx[i + 1], c = idx[i + 2]; nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
  // fusion des sommets confondus (coutures UV) pour un lissage continu
  const key = (i, A) => Math.round(A[i * 3] * 2000) + ',' + Math.round(A[i * 3 + 1] * 2000) + ',' + Math.round(A[i * 3 + 2] * 2000);
  const groups = new Map(); for (let i = 0; i < n; i++) { const k = key(i, P); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(i); }
  groups.forEach((l) => { if (l.length > 1) { const u = new Set(); l.forEach((i) => nb[i].forEach((j) => u.add(j))); l.forEach((i) => { nb[i] = u; }); } });
  const NB = nb.map((s) => [...s]);
  const smooth = (A) => {
    let cur = A.slice(), nxt = new Float32Array(A.length);
    for (let it = 0; it < iters; it++) {
      for (let i = 0; i < n; i++) { const l = NB[i]; if (!l.length) { nxt[i * 3] = cur[i * 3]; nxt[i * 3 + 1] = cur[i * 3 + 1]; nxt[i * 3 + 2] = cur[i * 3 + 2]; continue; }
        let x = 0, y = 0, z = 0; for (const j of l) { x += cur[j * 3]; y += cur[j * 3 + 1]; z += cur[j * 3 + 2]; }
        const k = 1 / l.length; nxt[i * 3] = cur[i * 3] + lambda * (x * k - cur[i * 3]); nxt[i * 3 + 1] = cur[i * 3 + 1] + lambda * (y * k - cur[i * 3 + 1]); nxt[i * 3 + 2] = cur[i * 3 + 2] + lambda * (z * k - cur[i * 3 + 2]); }
      [cur, nxt] = [nxt, cur];
    }
    return cur;
  };
  const base = smooth(P);
  const tmp = new THREE.BufferGeometry(); tmp.setIndex(g.index);
  const normalsOf = (A) => { tmp.setAttribute('position', new THREE.BufferAttribute(A, 3)); tmp.deleteAttribute('normal'); tmp.computeVertexNormals(); const N = tmp.attributes.normal.array; 
    const acc = new Map(); for (let i = 0; i < n; i++) { const k = key(i, A); const v = acc.get(k) || [0, 0, 0]; v[0] += N[i * 3]; v[1] += N[i * 3 + 1]; v[2] += N[i * 3 + 2]; acc.set(k, v); }
    const out = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const v = acc.get(key(i, A)), l = Math.hypot(v[0], v[1], v[2]) || 1; out[i * 3] = v[0] / l; out[i * 3 + 1] = v[1] / l; out[i * 3 + 2] = v[2] / l; } return out; };
  const n0 = normalsOf(base);
  if (inflateBy) for (let i = 0; i < base.length; i++) base[i] += n0[i] * inflateBy;
  const mp = g.morphAttributes.position, mn = g.morphAttributes.normal;
  mp.forEach((attr, k) => {
    const D = attr.array, S = new Float32Array(P.length); for (let i = 0; i < S.length; i++) S[i] = P[i] + D[i];
    const sm = smooth(S), nn = normalsOf(sm);
    if (inflateBy) for (let i = 0; i < sm.length; i++) sm[i] += nn[i] * inflateBy;
    const nd = new Float32Array(D.length), dd = new Float32Array(D.length);
    for (let i = 0; i < D.length; i++) { dd[i] = sm[i] - base[i]; nd[i] = nn[i] - n0[i]; }
    mp[k] = new THREE.BufferAttribute(dd, 3); mn[k] = new THREE.BufferAttribute(nd, 3);
  });
  g.setAttribute('position', new THREE.BufferAttribute(base, 3)); g.setAttribute('normal', new THREE.BufferAttribute(n0, 3));
  return mesh;
}

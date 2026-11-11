/* MFC Quiz — Carte d'athlète futuriste (style « carte de joueur » à collectionner).
   Aucun service externe : HTML + CSS + SVG.
   API : window.MFCCard = { TIERS, MODS, POS, levelOf(xp), xpFor(level), tierOf(level), stats(st, Q, goal), html(data, opts), tilt(el) }
   data = { name, level, ovr, pos, stats:{muscle,cardio,nutrition,sommeil,recup,sante}, photo, locked, tier? } */
(function () {
  'use strict';
  var TIERS = [
    { id: 'bronze',  n: 'Bronze',    from: 1,   bg: ['#0E0703', '#3A1F0E', '#9A5C2B'], ink: '#FFE6CC', ink2: '#E7B88C', neon: '#FF9A55', frame: ['#FFD2A6', '#8A5226', '#F7D7B0', '#5A3012'] },
    { id: 'argent',  n: 'Argent',    from: 10,  bg: ['#05080F', '#1A2433', '#617089'], ink: '#F5F9FF', ink2: '#B9C7DA', neon: '#BFE0FF', frame: ['#FFFFFF', '#8E99AA', '#EEF2F7', '#59616F'] },
    { id: 'or',      n: 'Or',        from: 25,  bg: ['#0B0702', '#3A2905', '#A07818'], ink: '#FFF4D2', ink2: '#F3D98A', neon: '#FFD15A', frame: ['#FFF0B8', '#B8892A', '#FFE7A0', '#7A5A10'] },
    { id: 'elite',   n: 'Élite',     from: 45,  bg: ['#030820', '#0E1F5E', '#2752C8'], ink: '#FFFFFF', ink2: '#F6DC8C', neon: '#58B6FF', frame: ['#F6DC8C', '#B8932A', '#FFF1C2', '#7A5A10'], holo: 0.3, hc: '#2752C8,#9AD4FF,#F6DC8C,#2752C8' },
    { id: 'heros',   n: 'Héros',     from: 65,  bg: ['#08031C', '#2A0D5E', '#7232D8'], ink: '#FFFFFF', ink2: '#DCCBFF', neon: '#6FF0FF', frame: ['#F1EBFF', '#9C86D6', '#FFFFFF', '#4E3A92'], holo: 0.45, hc: '#7232D8,#6FF0FF,#FF9BEA,#7232D8,#B3FFF6,#7232D8' },
    { id: 'legende', n: 'Légende',   from: 85,  bg: ['#010102', '#100C03', '#3C2C07'], ink: '#FFE7A0', ink2: '#FFF7DE', neon: '#FFC23D', frame: ['#FFF1C2', '#D4AF37', '#FFFBEA', '#7A5A10'], holo: 0.5, hc: '#3C2C07,#FFD86B,#3C2C07,#FFF6D0,#3C2C07,#D4AF37', glow: 1 },
    { id: 'icone',   n: 'Icône MFC', from: 100, bg: ['#FFFDF7', '#F4E3B4', '#D4AF37'], ink: '#0B1640', ink2: '#2A3A70', neon: '#C9971E', frame: ['#FFFFFF', '#D4AF37', '#FFF6D8', '#A67C1A'], holo: 0.6, hc: '#FFB3D9,#B3E0FF,#C8FFE0,#FFF3B0,#FFC9A8,#FFB3D9', glow: 2, stars: 1, light: 1 }
  ];
  var MODS = [['muscle', 'MUS'], ['cardio', 'CAR'], ['nutrition', 'NUT'], ['sommeil', 'SOM'], ['recup', 'RÉC'], ['sante', 'SAN']];
  var POS = { perte: 'SÈC', muscle: 'HYP', endu: 'END', physio: 'SCI', sante: 'VIT' };

  /* XP cumulés pour atteindre un niveau : rapide jusqu'au niveau 25, puis bien plus exigeant (cartes Héros, Légende, Icône rares) */
  function xpFor(L) { L = Math.max(1, Math.min(100, L)); var l = L - 1, k = Math.max(0, L - 25); return 3 * l * l + 20 * l + Math.round(0.24 * k * k * k); }
  function xpForV1(L) { L = Math.max(1, Math.min(100, L)); var l = L - 1; return 3 * l * l + 20 * l; }
  function levelOfV1(xp) { var l = 1; while (l < 100 && xp >= xpForV1(l + 1)) l++; return l; }
  function levelOf(xp) { var l = 1; while (l < 100 && xp >= xpFor(l + 1)) l++; return l; }
  function tierOf(level) { var t = TIERS[0]; TIERS.forEach(function (x) { if (level >= x.from) t = x; }); return t; }
  /* note par thème : 40 au départ, 99 quand toutes les questions du thème sont maîtrisées */
  function stats(st, Q, goal) {
    var out = {}, sum = 0, wsum = 0, W = (goal && goal.w) || {};
    MODS.forEach(function (m) {
      var qs = Q.filter(function (q) { return q.m === m[0]; }), k = qs.filter(function (q) { return st.mastered && st.mastered[q.id]; }).length;
      var v = qs.length ? Math.round(40 + 59 * Math.sqrt(k / qs.length)) : 40; out[m[0]] = Math.min(99, v);
      var w = W[m[0]] || 1; sum += out[m[0]] * w; wsum += w;
    });
    return { s: out, ovr: Math.round(sum / wsum) };
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function initials(n) { n = String(n || 'MFC').trim().split(/\s+/); return ((n[0] || '')[0] || 'M').toUpperCase() + ((n[1] || '')[0] || '').toUpperCase(); }

  /* forme de la carte (en %) — coins coupés, encoche en haut, base en écusson */
  var SHAPE = [[0, 6], [6, 0], [37, 0], [41, 2.4], [59, 2.4], [63, 0], [94, 0], [100, 6], [100, 84], [65, 100], [35, 100], [0, 84]];
  var CLIP = 'polygon(' + SHAPE.map(function (p) { return p[0] + '% ' + p[1] + '%'; }).join(',') + ')';
  function inset(kx, ky) { return SHAPE.map(function (p) { return (50 + (p[0] - 50) * kx).toFixed(2) + ',' + (50 + (p[1] - 50) * ky).toFixed(2); }).join(' '); }
  var IN1 = inset(0.955, 0.968), IN2 = inset(0.93, 0.952);
  var HEXT = {};
  function hexTile(col) {
    if (HEXT[col]) return HEXT[col];
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='41.57' viewBox='0 0 24 41.57'><path d='M0 6.93L12 0l12 6.93v13.86L12 27.71 0 20.78zM12 27.71v13.86' fill='none' stroke='" + col + "' stroke-width='.7'/></svg>";
    return (HEXT[col] = "url('data:image/svg+xml," + encodeURIComponent(svg).replace(/'/g, '%27') + "')");
  }

  function html(d, o) {
    o = o || {}; var lv = d.level || 1, T = d.tier ? TIERS.filter(function (x) { return x.id === d.tier; })[0] : tierOf(lv), s = d.stats || {};
    var w = o.w || 260, mini = w < 150, sw = Math.max(0.8, w / 210).toFixed(2);
    var style = '--w:' + w + 'px;--b0:' + T.bg[0] + ';--b1:' + T.bg[1] + ';--b2:' + T.bg[2] + ';--ink:' + T.ink + ';--ink2:' + T.ink2 + ';--neon:' + T.neon +
      ';--f0:' + T.frame[0] + ';--f1:' + T.frame[1] + ';--f2:' + T.frame[2] + ';--f3:' + T.frame[3] + ';--holo:' + (T.holo || 0) + ';--hc:' + (T.hc || '#fff,#fff') + ';--hex:' + hexTile(T.neon);
    var h = '<div class="mc-card mc-' + T.id + (mini ? ' mc-mini' : '') + (d.locked ? ' mc-locked' : '') + (T.glow ? ' mc-glow' + T.glow : '') + (T.light ? ' mc-light' : '') + '" style="' + style + '">';
    h += '<div class="mc-in"><div class="mc-bg"></div><div class="mc-hex"></div><div class="mc-rays"></div>' + (T.holo ? '<div class="mc-holo"></div>' : '') + (T.stars ? '<div class="mc-stars"></div>' : '');
    // circuits décoratifs
    h += '<svg class="mc-circ" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="var(--neon)" stroke-width="' + (sw * 0.6) + '">' +
      '<path vector-effect="non-scaling-stroke" d="M4 50 H9 L12 47 V40"/><path vector-effect="non-scaling-stroke" d="M96 30 H90 L86 34 V46"/><path vector-effect="non-scaling-stroke" d="M10 88 H24 L28 92 H34"/><path vector-effect="non-scaling-stroke" d="M90 88 H76 L72 92 H66"/></g></svg>';
    // portrait / emblème
    h += '<div class="mc-face"><div class="mc-aura"></div><svg class="mc-rings" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="var(--neon)">' +
      '<circle class="r1" cx="50" cy="50" r="46" stroke-width=".6" stroke-dasharray="14 7 3 7" opacity=".75"/><circle class="r2" cx="50" cy="50" r="40" stroke-width=".35" stroke-dasharray="1.2 2.4" opacity=".7"/>' +
      '<circle cx="50" cy="50" r="34" stroke-width=".25" opacity=".35"/></g></svg>';
    if (d.photo) h += '<div class="mc-photo"><img src="' + esc(d.photo) + '" alt=""></div>';
    else h += '<svg class="mc-emb" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="mcg-' + T.id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + T.neon + '" stop-opacity=".38"/><stop offset="1" stop-color="' + T.neon + '" stop-opacity=".06"/></linearGradient></defs>' +
      '<polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="url(#mcg-' + T.id + ')" stroke="var(--neon)" stroke-width="1"/><polygon points="50,24 73,37 73,63 50,76 27,63 27,37" fill="none" stroke="var(--neon)" stroke-width=".35" opacity=".6"/></svg><span class="mc-ini">' + esc(initials(d.name)) + '</span>';
    h += '</div>';
    // note générale
    h += '<div class="mc-top"><div class="mc-ovr"><svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,3 93,27 93,73 50,97 7,73 7,27" fill="' + T.neon + '" fill-opacity=".14" stroke="var(--neon)" stroke-width="2.5"/></svg><b>' + (d.ovr || 40) + '</b></div>' +
      '<div class="mc-pos">' + esc(d.pos || 'MFC') + '</div><img class="mc-logo" src="' + (o.logo || 'assets/logo-mark.png') + '" alt="MFC"><div class="mc-lv"><span>NIV</span><b>' + lv + '</b></div></div>';
    h += '<div class="mc-name"><span>' + esc(d.name || 'Athlète') + '</span></div>';
    if (!mini) {
      h += '<div class="mc-stats">';
      MODS.forEach(function (m) { var v = s[m[0]] || 40; h += '<div><b>' + v + '</b><span>' + m[1] + '</span><i><u style="width:' + Math.round((v - 30) / 69 * 100) + '%"></u></i></div>'; });
      h += '</div>';
    }
    h += '<div class="mc-foot"><i></i><span>' + esc(T.n.toUpperCase()) + '</span><i></i></div>';
    h += '<div class="mc-scan"></div><div class="mc-shine"></div><div class="mc-glare"></div></div>';
    h += '<svg class="mc-edge" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="' + IN1 + '" fill="none" stroke="var(--neon)" stroke-width="' + sw + '" vector-effect="non-scaling-stroke"/><polygon points="' + IN2 + '" fill="none" stroke="var(--neon)" stroke-width="' + (sw * 0.45).toFixed(2) + '" stroke-dasharray="' + Math.round(w / 18) + ' ' + Math.round(w / 40) + '" vector-effect="non-scaling-stroke" opacity=".45"/></svg>';
    if (d.locked) h += '<div class="mc-lock"><span>🔒</span><small>Niv. ' + T.from + '</small></div>';
    return h + '</div>';
  }

  var CSS = '' +
    '.mc-card{position:relative;width:var(--w);aspect-ratio:.7;font-size:calc(var(--w)/26);clip-path:' + CLIP + ';background:linear-gradient(135deg,var(--f0),var(--f1) 28%,var(--f2) 52%,var(--f3) 78%,var(--f0));padding:.28em;box-sizing:border-box;flex-shrink:0;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
    '.mc-glow1{filter:drop-shadow(0 0 .7em rgba(255,194,61,.45))}.mc-glow2{filter:drop-shadow(0 0 1em rgba(255,214,110,.7))}' +
    '.mc-in{position:relative;width:100%;height:100%;clip-path:' + CLIP + ';overflow:hidden;color:var(--ink);background:var(--b0)}' +
    '.mc-bg{position:absolute;inset:0;background:radial-gradient(90% 55% at 62% 26%,var(--b2),transparent 70%),radial-gradient(70% 40% at 50% 100%,color-mix(in srgb,var(--neon) 22%,transparent),transparent 70%),linear-gradient(170deg,var(--b1),var(--b0) 70%)}' +
    '.mc-hex{position:absolute;inset:0;background-image:var(--hex);background-size:1.6em auto;opacity:.22;-webkit-mask-image:radial-gradient(85% 70% at 50% 40%,transparent 25%,#000 85%);mask-image:radial-gradient(85% 70% at 50% 40%,transparent 25%,#000 85%)}' +
    '.mc-rays{position:absolute;left:24%;top:-4%;width:76%;height:66%;background:repeating-conic-gradient(from 0deg at 50% 50%,color-mix(in srgb,var(--neon) 16%,transparent) 0 4deg,transparent 4deg 14deg);-webkit-mask-image:radial-gradient(circle,#000 10%,transparent 68%);mask-image:radial-gradient(circle,#000 10%,transparent 68%);animation:mcSpin 40s linear infinite}' +
    '.mc-holo{position:absolute;inset:-25%;opacity:var(--holo);mix-blend-mode:overlay;background:conic-gradient(from calc(var(--hx,0) * 1deg),var(--hc));filter:blur(1.4em);animation:mcSpin 12s linear infinite}' +
    '.mc-stars{position:absolute;inset:0;background-image:radial-gradient(circle,#fff 0 .08em,transparent .12em),radial-gradient(circle,#FFE7A0 0 .06em,transparent .1em);background-size:3.1em 3.3em,2.3em 2.1em;background-position:0 0,1.1em 1.4em;opacity:.8;animation:mcTw 2.6s ease-in-out infinite alternate}' +
    '.mc-light .mc-stars{background-image:radial-gradient(circle,#D4AF37 0 .08em,transparent .12em),radial-gradient(circle,#fff 0 .07em,transparent .11em)}' +
    '.mc-circ{position:absolute;inset:0;width:100%;height:100%;opacity:.55}' +
    '.mc-face{position:absolute;left:30%;top:6.5%;width:62%;height:47%;display:flex;align-items:center;justify-content:center}' +
    '.mc-aura{position:absolute;width:80%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--neon) 45%,transparent),transparent 65%);filter:blur(.4em)}' +
    '.mc-rings{position:absolute;width:100%;max-height:100%;aspect-ratio:1}.mc-rings .r1{transform-origin:50% 50%;animation:mcSpin 18s linear infinite}.mc-rings .r2{transform-origin:50% 50%;animation:mcSpin 26s linear infinite reverse}' +
    '.mc-emb{position:absolute;width:92%;max-height:100%;aspect-ratio:1;filter:drop-shadow(0 0 .35em var(--neon))}' +
    '.mc-ini{position:relative;font:700 3.6em/1 Unbounded,system-ui,sans-serif;letter-spacing:-.05em;color:var(--ink);text-shadow:0 0 .35em var(--neon),0 0 .08em var(--neon)}' +
    '.mc-photo{position:absolute;width:74%;aspect-ratio:1;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);background:var(--neon);padding:.2em;box-sizing:border-box}' +
    '.mc-photo img{width:100%;height:100%;object-fit:cover;object-position:50% 25%;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);display:block}' +
    '.mc-photo:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.07) 0 .06em,transparent .06em .22em),linear-gradient(180deg,transparent 55%,color-mix(in srgb,var(--neon) 35%,transparent))}' +
    '.mc-top{position:absolute;left:7%;top:8.5%;width:23%;display:flex;flex-direction:column;align-items:center;z-index:3}' +
    '.mc-ovr{position:relative;width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center}.mc-ovr svg{position:absolute;inset:0;filter:drop-shadow(0 0 .3em var(--neon))}' +
    '.mc-ovr b{position:relative;font:700 2.55em/1 Unbounded,system-ui,sans-serif;letter-spacing:-.05em;text-shadow:0 0 .3em color-mix(in srgb,var(--neon) 70%,transparent)}' +
    '.mc-pos{font:700 .95em/1 Unbounded,system-ui,sans-serif;margin-top:.45em;color:var(--neon);letter-spacing:.06em;text-shadow:0 0 .4em var(--neon)}' +
    '.mc-logo{width:88%;margin-top:.7em;filter:drop-shadow(0 0 .25em color-mix(in srgb,var(--neon) 60%,transparent))}' +
    '.mc-light .mc-logo{filter:brightness(.2) sepia(.5) hue-rotate(190deg) saturate(3)}.mc-light .mc-pos{text-shadow:none}.mc-light .mc-ini{text-shadow:0 0 .2em #fff}' +
    '.mc-lv{margin-top:.6em;text-align:center;line-height:1}.mc-lv span{display:block;font:700 .6em JetBrains Mono,ui-monospace,monospace;letter-spacing:.25em;color:var(--ink2)}.mc-lv b{font:700 1.5em/1.1 Unbounded,system-ui,sans-serif}' +
    '.mc-name{position:absolute;left:8%;right:8%;top:56.5%;height:7.2%;display:flex;align-items:center;justify-content:center;z-index:3;clip-path:polygon(4% 0,96% 0,100% 50%,96% 100%,4% 100%,0 50%);background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--neon) 30%,transparent) 20%,color-mix(in srgb,var(--neon) 30%,transparent) 80%,transparent)}' +
    '.mc-name:before,.mc-name:after{content:"";position:absolute;left:6%;right:6%;height:.06em;background:linear-gradient(90deg,transparent,var(--neon),transparent)}.mc-name:before{top:0}.mc-name:after{bottom:0}' +
    '.mc-name span{font:700 1.45em/1 Unbounded,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:92%;text-shadow:0 0 .4em color-mix(in srgb,var(--neon) 70%,transparent)}' +
    '.mc-stats{position:absolute;left:11%;right:11%;top:66.5%;display:grid;grid-template-columns:1fr 1fr;column-gap:1.6em;row-gap:.55em;z-index:3}' +
    '.mc-stats div{display:grid;grid-template-columns:auto 1fr;align-items:baseline;column-gap:.45em}' +
    '.mc-stats b{font:700 1.3em/1 Unbounded,system-ui,sans-serif;letter-spacing:-.03em}.mc-stats span{font:700 .72em JetBrains Mono,ui-monospace,monospace;color:var(--ink2);letter-spacing:.14em}' +
    '.mc-stats i{grid-column:1/3;height:.22em;margin-top:.3em;background:color-mix(in srgb,var(--ink) 14%,transparent);clip-path:polygon(0 0,100% 0,97% 100%,0 100%)}' +
    '.mc-stats u{display:block;height:100%;background:linear-gradient(90deg,color-mix(in srgb,var(--neon) 55%,transparent),var(--neon));box-shadow:0 0 .4em var(--neon)}' +
    '.mc-foot{position:absolute;left:30%;right:30%;bottom:4.2%;display:flex;align-items:center;justify-content:center;gap:.5em;z-index:3}' +
    '.mc-foot span{font:700 .62em/1 JetBrains Mono,ui-monospace,monospace;letter-spacing:.3em;color:var(--neon);text-shadow:0 0 .5em var(--neon);white-space:nowrap}' +
    '.mc-foot i{flex:1;height:.07em;background:linear-gradient(90deg,transparent,var(--neon))}.mc-foot i:last-child{transform:scaleX(-1)}' +
    '.mc-scan{position:absolute;left:0;right:0;top:-20%;height:18%;background:linear-gradient(180deg,transparent,color-mix(in srgb,var(--neon) 18%,transparent) 50%,transparent);animation:mcScan 5s cubic-bezier(.5,0,.5,1) infinite;pointer-events:none;mix-blend-mode:screen}' +
    '.mc-light .mc-scan{mix-blend-mode:multiply;opacity:.5}' +
    '.mc-shine{position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.4) 47%,rgba(255,255,255,.06) 53%,transparent 62%);background-size:250% 100%;mix-blend-mode:soft-light;animation:mcShine 6s ease-in-out infinite;pointer-events:none}' +
    '.mc-glare{position:absolute;inset:0;opacity:0;transition:opacity .3s;background:radial-gradient(circle at var(--mx,50%) var(--my,30%),rgba(255,255,255,.35),transparent 45%);mix-blend-mode:overlay;pointer-events:none}' +
    '.mc-card.mc-tilting .mc-glare{opacity:1}' +
    '.mc-edge{position:absolute;left:.28em;top:.28em;width:calc(100% - .56em);height:calc(100% - .56em);pointer-events:none;filter:drop-shadow(0 0 .25em var(--neon))}' +
    '.mc-mini .mc-name{top:58%;height:10%}.mc-mini .mc-name span{font-size:2em}.mc-mini .mc-face{top:10%;height:46%}.mc-mini .mc-foot{bottom:7%;left:22%;right:22%}.mc-mini .mc-foot span{font-size:1em;letter-spacing:.15em}' +
    '.mc-mini .mc-lv,.mc-mini .mc-logo,.mc-mini .mc-circ,.mc-mini .mc-scan,.mc-mini .mc-rays{display:none}.mc-mini .mc-top{width:30%;top:10%;left:5%}.mc-mini .mc-pos{font-size:1.3em}.mc-mini .mc-ovr b{font-size:3.2em}' +
    '.mc-locked .mc-in,.mc-locked .mc-edge{filter:grayscale(.9) brightness(.4)}' +
    '.mc-lock{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3em;color:#fff;z-index:5}.mc-lock span{font-size:3em}.mc-lock small{font:700 1.4em Inter,system-ui;text-shadow:0 1px 4px #000}' +
    '@keyframes mcShine{0%,55%{background-position:130% 0}100%{background-position:-60% 0}}' +
    '@keyframes mcScan{0%{transform:translateY(0)}70%,100%{transform:translateY(680%)}}' +
    '@keyframes mcSpin{to{transform:rotate(360deg)}}@keyframes mcTw{from{opacity:.35}to{opacity:.9}}' +
    '@media (prefers-reduced-motion:reduce){.mc-shine,.mc-holo,.mc-stars,.mc-scan,.mc-rays,.mc-rings circle{animation:none}}';
  if (!document.getElementById('mc-css')) { var el = document.createElement('style'); el.id = 'mc-css'; el.textContent = CSS; document.head.appendChild(el); }

  /* inclinaison au doigt (effet carte holographique) */
  function tilt(card) {
    function mv(e) {
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add('mc-tilting'); card.style.transition = 'transform .08s';
      card.style.transform = 'perspective(900px) rotateY(' + (x * 22) + 'deg) rotateX(' + (-y * 18) + 'deg) scale(1.02)';
      card.style.setProperty('--hx', Math.round(x * 180)); card.style.setProperty('--mx', Math.round((x + 0.5) * 100) + '%'); card.style.setProperty('--my', Math.round((y + 0.5) * 100) + '%');
    }
    function end() { card.classList.remove('mc-tilting'); card.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)'; card.style.transform = ''; }
    card.addEventListener('pointermove', mv); card.addEventListener('pointerdown', mv); card.addEventListener('pointerleave', end); card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
  }

  /* ---------- dessin de la carte sur un canvas (pour l'image story) ----------
     draw(ctx, d, X, Y, w, im) : im = { logo: Image, photo: Image } (facultatifs, déjà chargés) */
  function rgba(hex, a) { hex = hex.replace('#', ''); return 'rgba(' + parseInt(hex.substr(0, 2), 16) + ',' + parseInt(hex.substr(2, 2), 16) + ',' + parseInt(hex.substr(4, 2), 16) + ',' + a + ')'; }
  function poly(x, pts) { x.beginPath(); pts.forEach(function (p, i) { if (i) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); }); x.closePath(); }
  function hexPts(cx, cy, r) { var p = []; for (var i = 0; i < 6; i++) { var a = Math.PI / 3 * i - Math.PI / 2; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; }
  function draw(x, d, X, Y, w, im) {
    im = im || {}; var lv = d.level || 1, T = d.tier ? TIERS.filter(function (t) { return t.id === d.tier; })[0] : tierOf(lv), s = d.stats || {};
    var H = w / 0.7, em = w / 26, pad = 0.28 * em, F = 'Unbounded, system-ui, sans-serif', MONO = '"JetBrains Mono", ui-monospace, monospace';
    function shape(ox, oy, ww, hh) { return SHAPE.map(function (p) { return [ox + p[0] / 100 * ww, oy + p[1] / 100 * hh]; }); }
    x.save();
    // halo extérieur
    x.shadowColor = rgba(T.neon, T.glow ? 0.8 : 0.5); x.shadowBlur = w * (T.glow ? 0.14 : 0.08);
    // cadre métallique
    var fg = x.createLinearGradient(X, Y, X + w, Y + H);
    fg.addColorStop(0, T.frame[0]); fg.addColorStop(0.28, T.frame[1]); fg.addColorStop(0.52, T.frame[2]); fg.addColorStop(0.78, T.frame[3]); fg.addColorStop(1, T.frame[0]);
    poly(x, shape(X, Y, w, H)); x.fillStyle = fg; x.fill(); x.shadowBlur = 0;
    // intérieur
    var IX = X + pad, IY = Y + pad, IW = w - 2 * pad, IH = H - 2 * pad;
    x.save(); poly(x, shape(IX, IY, IW, IH)); x.clip();
    var g = x.createLinearGradient(IX, IY, IX + IW * 0.35, IY + IH); g.addColorStop(0, T.bg[1]); g.addColorStop(0.7, T.bg[0]); g.addColorStop(1, T.bg[0]);
    x.fillStyle = g; x.fillRect(IX, IY, IW, IH);
    var rg = x.createRadialGradient(IX + IW * 0.62, IY + IH * 0.26, 0, IX + IW * 0.62, IY + IH * 0.26, IW * 0.75);
    rg.addColorStop(0, T.bg[2]); rg.addColorStop(1, rgba(T.bg[2].length === 7 ? T.bg[2] : '#000000', 0)); x.fillStyle = rg; x.fillRect(IX, IY, IW, IH);
    var rb = x.createRadialGradient(IX + IW / 2, IY + IH, 0, IX + IW / 2, IY + IH, IW * 0.6);
    rb.addColorStop(0, rgba(T.neon, 0.22)); rb.addColorStop(1, rgba(T.neon, 0)); x.fillStyle = rb; x.fillRect(IX, IY, IW, IH);
    // rayons
    var rx = IX + IW * 0.62, ry = IY + IH * 0.29, rr = IW * 0.45;
    x.save(); x.globalAlpha = 0.16; x.fillStyle = T.neon;
    for (var a = 0; a < 360; a += 14) { x.beginPath(); x.moveTo(rx, ry); x.arc(rx, ry, rr, (a - 90) * Math.PI / 180, (a - 86) * Math.PI / 180); x.closePath(); x.fill(); }
    x.restore();
    // nid d'abeille sur les bords
    x.save(); x.strokeStyle = rgba(T.neon, 0.16); x.lineWidth = Math.max(1, w / 400); var hs = 0.8 * em;
    for (var hy = 0, row = 0; hy < IH + hs * 2; hy += hs * 1.5, row++) for (var hx = (row % 2) * hs * 0.866; hx < IW + hs * 2; hx += hs * 1.732) {
      var px = IX + hx, py = IY + hy, dx = (px - IX - IW / 2) / (IW * 0.85), dy = (py - IY - IH * 0.4) / (IH * 0.7);
      if (dx * dx + dy * dy < 0.18) continue; poly(x, hexPts(px, py, hs)); x.stroke();
    }
    x.restore();
    // reflet holographique
    if (T.holo && x.createConicGradient) {
      var cg = x.createConicGradient(0.6, IX + IW / 2, IY + IH / 2), cs = T.hc.split(',');
      cs.forEach(function (c, i) { cg.addColorStop(i / (cs.length - 1), c); });
      x.save(); x.globalAlpha = T.holo * 0.45; x.globalCompositeOperation = 'overlay'; x.fillStyle = cg; x.fillRect(IX, IY, IW, IH); x.restore();
    }
    if (T.stars) { x.save(); for (var k = 0; k < 70; k++) { var sx = IX + ((k * 97) % 100) / 100 * IW, sy = IY + ((k * 61 + 13) % 100) / 100 * IH; x.fillStyle = k % 2 ? '#D4AF37' : '#FFFFFF'; x.globalAlpha = 0.35 + (k % 5) / 10; x.beginPath(); x.arc(sx, sy, em * (0.05 + (k % 3) * 0.025), 0, Math.PI * 2); x.fill(); } x.restore(); }
    // portrait / emblème
    var fw = IW * 0.62, fh = IH * 0.47, side = Math.min(fw, fh), fx = IX + IW * 0.30 + fw / 2, fy = IY + IH * 0.065 + fh / 2;
    var au = x.createRadialGradient(fx, fy, 0, fx, fy, side * 0.4); au.addColorStop(0, rgba(T.neon, 0.45)); au.addColorStop(1, rgba(T.neon, 0)); x.fillStyle = au; x.fillRect(fx - side / 2, fy - side / 2, side, side);
    x.strokeStyle = T.neon; x.save(); x.globalAlpha = 0.75; x.lineWidth = side * 0.006; x.setLineDash([side * 0.14, side * 0.07, side * 0.03, side * 0.07]); x.beginPath(); x.arc(fx, fy, side * 0.46, 0, Math.PI * 2); x.stroke();
    x.globalAlpha = 0.7; x.lineWidth = side * 0.0035; x.setLineDash([side * 0.012, side * 0.024]); x.beginPath(); x.arc(fx, fy, side * 0.40, 0, Math.PI * 2); x.stroke();
    x.setLineDash([]); x.globalAlpha = 0.35; x.lineWidth = side * 0.0025; x.beginPath(); x.arc(fx, fy, side * 0.34, 0, Math.PI * 2); x.stroke(); x.restore();
    if (im.photo) {
      var pr = side * 0.37; poly(x, hexPts(fx, fy, pr)); x.fillStyle = T.neon; x.fill();
      x.save(); poly(x, hexPts(fx, fy, pr - side * 0.02)); x.clip();
      var iw = im.photo.width, ih = im.photo.height, sc = Math.max(2 * pr / iw, 2 * pr / ih);
      x.drawImage(im.photo, fx - iw * sc / 2, fy - pr - Math.max(0, ih * sc - 2 * pr) * 0.25, iw * sc, ih * sc);
      var pg = x.createLinearGradient(0, fy, 0, fy + pr); pg.addColorStop(0, rgba(T.neon, 0)); pg.addColorStop(1, rgba(T.neon, 0.35)); x.fillStyle = pg; x.fillRect(fx - pr, fy, 2 * pr, pr);
      x.restore();
    } else {
      var eg = x.createLinearGradient(0, fy - side * 0.3, 0, fy + side * 0.3); eg.addColorStop(0, rgba(T.neon, 0.38)); eg.addColorStop(1, rgba(T.neon, 0.06));
      poly(x, hexPts(fx, fy, side * 0.92 * 0.32)); x.fillStyle = eg; x.fill(); x.lineWidth = side * 0.009; x.strokeStyle = T.neon; x.shadowColor = T.neon; x.shadowBlur = em * 0.35; x.stroke(); x.shadowBlur = 0;
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = T.ink; x.shadowColor = T.neon; x.shadowBlur = em * 0.35;
      x.font = '700 ' + (3.6 * em) + 'px ' + F; x.fillText(initials(d.name), fx, fy); x.shadowBlur = 0;
    }
    // colonne de gauche : note, poste, logo, niveau
    var cx = IX + IW * (0.07 + 0.115), ow = IW * 0.23, oy = IY + IH * 0.085;
    poly(x, hexPts(cx, oy + ow / 2, ow * 0.47)); x.fillStyle = rgba(T.neon, 0.14); x.fill(); x.lineWidth = ow * 0.025; x.strokeStyle = T.neon; x.shadowColor = T.neon; x.shadowBlur = em * 0.3; x.stroke(); x.shadowBlur = 0;
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = T.ink; x.shadowColor = rgba(T.neon, 0.7); x.shadowBlur = em * 0.3;
    x.font = '700 ' + (2.55 * em) + 'px ' + F; x.fillText(String(d.ovr || 40), cx, oy + ow / 2 + em * 0.1); x.shadowBlur = 0;
    var cy2 = oy + ow + 0.45 * em + 0.5 * em; x.fillStyle = T.neon; x.font = '700 ' + (0.95 * em) + 'px ' + F; x.fillText(d.pos || 'MFC', cx, cy2);
    cy2 += 0.5 * em + 0.7 * em;
    if (im.logo) {
      var lw = ow * 0.88, lh = lw * im.logo.height / im.logo.width;
      if (T.light) { var oc = document.createElement('canvas'); oc.width = Math.ceil(lw * 2); oc.height = Math.ceil(lh * 2); var ox = oc.getContext('2d'); ox.drawImage(im.logo, 0, 0, oc.width, oc.height); ox.globalCompositeOperation = 'source-atop'; ox.fillStyle = T.ink; ox.fillRect(0, 0, oc.width, oc.height); x.drawImage(oc, cx - lw / 2, cy2, lw, lh); }
      else x.drawImage(im.logo, cx - lw / 2, cy2, lw, lh);
      cy2 += lh;
    }
    cy2 += 0.6 * em; x.textBaseline = 'top'; x.fillStyle = T.ink2; x.font = '700 ' + (0.6 * em) + 'px ' + MONO; x.fillText('N I V', cx, cy2);
    x.fillStyle = T.ink; x.font = '700 ' + (1.5 * em) + 'px ' + F; x.fillText(String(lv), cx, cy2 + 0.75 * em);
    // bandeau du nom
    var nx = IX + IW * 0.08, nw = IW * 0.84, ny = IY + IH * 0.565, nh = IH * 0.072;
    var ng = x.createLinearGradient(nx, 0, nx + nw, 0); ng.addColorStop(0, rgba(T.neon, 0)); ng.addColorStop(0.2, rgba(T.neon, 0.3)); ng.addColorStop(0.8, rgba(T.neon, 0.3)); ng.addColorStop(1, rgba(T.neon, 0));
    poly(x, [[nx + nw * 0.04, ny], [nx + nw * 0.96, ny], [nx + nw, ny + nh / 2], [nx + nw * 0.96, ny + nh], [nx + nw * 0.04, ny + nh], [nx, ny + nh / 2]]); x.fillStyle = ng; x.fill();
    var lg = x.createLinearGradient(nx, 0, nx + nw, 0); lg.addColorStop(0, rgba(T.neon, 0)); lg.addColorStop(0.5, T.neon); lg.addColorStop(1, rgba(T.neon, 0));
    x.fillStyle = lg; x.fillRect(nx + nw * 0.06, ny, nw * 0.88, Math.max(1, em * 0.06)); x.fillRect(nx + nw * 0.06, ny + nh - Math.max(1, em * 0.06), nw * 0.88, Math.max(1, em * 0.06));
    var nm = String(d.name || 'Athlète').toUpperCase(); x.font = '700 ' + (1.45 * em) + 'px ' + F;
    while (x.measureText(nm).width > nw * 0.88 && nm.length > 2) nm = nm.slice(0, -2) + '…';
    x.textBaseline = 'middle'; x.fillStyle = T.ink; x.shadowColor = rgba(T.neon, 0.7); x.shadowBlur = em * 0.4; x.fillText(nm, nx + nw / 2, ny + nh / 2 + em * 0.05); x.shadowBlur = 0;
    // 6 notes
    var gx = IX + IW * 0.11, gw = IW * 0.78, colw = (gw - 1.6 * em) / 2, gy = IY + IH * 0.665, rowh = 1.3 * em + 0.52 * em + 0.55 * em;
    MODS.forEach(function (m, i) {
      var v = s[m[0]] || 40, c = i % 2, r = Math.floor(i / 2), bx = gx + c * (colw + 1.6 * em), by = gy + r * rowh;
      x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillStyle = T.ink; x.font = '700 ' + (1.3 * em) + 'px ' + F; x.fillText(String(v), bx, by + 1.1 * em);
      var vw = x.measureText(String(v)).width; x.fillStyle = T.ink2; x.font = '700 ' + (0.72 * em) + 'px ' + MONO; x.fillText(m[1], bx + vw + 0.45 * em, by + 1.1 * em);
      var yb = by + 1.3 * em + 0.3 * em, hb = 0.22 * em; x.fillStyle = rgba(T.ink, 0.14); x.fillRect(bx, yb, colw, hb);
      var bw = colw * Math.max(0, Math.min(1, (v - 30) / 69)), bg2 = x.createLinearGradient(bx, 0, bx + bw, 0); bg2.addColorStop(0, rgba(T.neon, 0.55)); bg2.addColorStop(1, T.neon);
      x.fillStyle = bg2; x.shadowColor = T.neon; x.shadowBlur = em * 0.4; x.fillRect(bx, yb, bw, hb); x.shadowBlur = 0;
    });
    // pied : nom de la carte
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '700 ' + (0.62 * em) + 'px ' + MONO; x.fillStyle = T.neon; x.shadowColor = T.neon; x.shadowBlur = em * 0.5;
    var ft = T.n.toUpperCase().split('').join(' '), fy2 = IY + IH * (1 - 0.042) - 0.31 * em; x.fillText(ft, IX + IW / 2, fy2); x.shadowBlur = 0;
    var tw = x.measureText(ft).width, half = IW * 0.2 - tw / 2 - em * 0.5;
    if (half > 0) { x.fillStyle = rgba(T.neon, 0.8); x.fillRect(IX + IW / 2 - tw / 2 - em * 0.5 - half, fy2, half, Math.max(1, em * 0.07)); x.fillRect(IX + IW / 2 + tw / 2 + em * 0.5, fy2, half, Math.max(1, em * 0.07)); }
    // reflet diagonal
    var sh = x.createLinearGradient(IX, IY, IX + IW, IY + IH * 0.6); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(0.47, 'rgba(255,255,255,.16)'); sh.addColorStop(0.55, 'rgba(255,255,255,.03)'); sh.addColorStop(0.62, 'rgba(255,255,255,0)');
    x.fillStyle = sh; x.fillRect(IX, IY, IW, IH);
    x.restore();
    // liserés néon
    x.save(); x.strokeStyle = T.neon; x.shadowColor = T.neon; x.shadowBlur = em * 0.25;
    function insetPts(kx, ky) { return SHAPE.map(function (p) { return [X + (50 + (p[0] - 50) * kx) / 100 * w, Y + (50 + (p[1] - 50) * ky) / 100 * H]; }); }
    x.lineWidth = Math.max(1.5, w / 210); poly(x, insetPts(0.955, 0.968)); x.stroke();
    x.globalAlpha = 0.45; x.lineWidth = Math.max(1, w / 470); x.setLineDash([w / 18, w / 40]); poly(x, insetPts(0.93, 0.952)); x.stroke();
    x.restore(); x.restore();
    return H;
  }

  window.MFCCard = { TIERS: TIERS, MODS: MODS, POS: POS, xpFor: xpFor, levelOf: levelOf, levelOfV1: levelOfV1, tierOf: tierOf, stats: stats, html: html, tilt: tilt, draw: draw };
})();

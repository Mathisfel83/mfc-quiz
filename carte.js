/* MFC Quiz — Carte d'athlète (style « carte de joueur » à collectionner).
   Aucun service externe : HTML + CSS + SVG.
   API : window.MFCCard = { TIERS, levelOf(xp), xpFor(level), tierOf(level), stats(st, Q, modules), html(data, opts) }
   data = { name, level, ovr, pos, stats:{muscle,cardio,nutrition,sommeil,recup,sante}, photo, locked } */
(function () {
  'use strict';
  var TIERS = [
    { id: 'bronze',  n: 'Bronze',    from: 1,   bg: ['#5A3418', '#B87A45', '#E3AE79'], ink: '#2A1406', ink2: '#4A2A12', frame: ['#F2C796', '#8A5226', '#F7D7B0', '#6B3C18'], accent: '#3B1E0A' },
    { id: 'argent',  n: 'Argent',    from: 10,  bg: ['#7D8797', '#D4DAE3', '#F4F6F9'], ink: '#18202E', ink2: '#3A4558', frame: ['#FFFFFF', '#8E99AA', '#EEF2F7', '#6D7787'], accent: '#1E2A40' },
    { id: 'or',      n: 'Or',        from: 25,  bg: ['#9C7212', '#E2B946', '#FBE8A6'], ink: '#2A1D02', ink2: '#5A410A', frame: ['#FFF0B8', '#B8892A', '#FFE7A0', '#8A6512'], accent: '#3A2803' },
    { id: 'elite',   n: 'Élite',     from: 45,  bg: ['#0B163A', '#1C3480', '#2F55C0'], ink: '#F6DC8C', ink2: '#E8EDF6', frame: ['#F6DC8C', '#B8932A', '#FFF1C2', '#8A6512'], accent: '#F6DC8C', holo: 0.35, hc: '#2F55C0,#9AB8FF,#F6DC8C,#2F55C0,#7FA0FF,#2F55C0' },
    { id: 'heros',   n: 'Héros',     from: 65,  bg: ['#170A36', '#45208A', '#8A4BE0'], ink: '#FFFFFF', ink2: '#E4D8FF', frame: ['#E9E2FF', '#9C86D6', '#FFFFFF', '#5B45A0'], accent: '#F6DC8C', holo: 0.45, hc: '#8A4BE0,#7FD6FF,#FFB3F0,#8A4BE0,#A0F0FF,#8A4BE0' },
    { id: 'legende', n: 'Légende',   from: 85,  bg: ['#040406', '#121008', '#2A2008'], ink: '#F6DC8C', ink2: '#FFF4D2', frame: ['#FFF1C2', '#D4AF37', '#FFFBEA', '#8A6512'], accent: '#FFD86B', holo: 0.5, glow: 1, hc: '#2A2008,#FFD86B,#2A2008,#FFF1C2,#2A2008,#D4AF37,#2A2008' },
    { id: 'icone',   n: 'Icône MFC', from: 100, bg: ['#FFF9EC', '#F6E2A6', '#E9C46A'], ink: '#0E1A44', ink2: '#2A3A70', frame: ['#FFFFFF', '#D4AF37', '#FFF6D8', '#B8932A'], accent: '#0E1A44', holo: 0.55, glow: 2, stars: 1, hc: '#FFB3D9,#B3E0FF,#C8FFE0,#FFF3B0,#FFC9A8,#FFB3D9' }
  ];
  var MODS = [['muscle', 'MUS'], ['cardio', 'CAR'], ['nutrition', 'NUT'], ['sommeil', 'SOM'], ['recup', 'RÉC'], ['sante', 'SAN']];
  var POS = { perte: 'SÈC', muscle: 'HYP', endu: 'END', physio: 'SCI', sante: 'VIT' };

  function xpFor(l) { l = Math.max(1, Math.min(100, l)) - 1; return 3 * l * l + 20 * l; }
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

  var SIL = '<svg viewBox="0 0 100 100" class="mc-sil" aria-hidden="true"><defs><linearGradient id="mcsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".55"/><stop offset="1" stop-color="currentColor" stop-opacity=".12"/></linearGradient></defs>' +
    '<path fill="url(#mcsg)" d="M50 12c10 0 17 8 17 19 0 8-3 14-8 18 2 2 6 3 10 4 13 3 23 10 26 24l2 12H3l2-12c3-14 13-21 26-24 4-1 8-2 10-4-5-4-8-10-8-18 0-11 7-19 17-19z"/></svg>';
  var MTN = '<svg viewBox="0 0 200 60" preserveAspectRatio="none" class="mc-mtn" aria-hidden="true"><path d="M0 60 L38 22 L58 40 L92 6 L128 44 L148 28 L200 60Z" fill="currentColor"/></svg>';

  function html(d, o) {
    o = o || {}; var lv = d.level || 1, T = d.tier ? TIERS.filter(function (x) { return x.id === d.tier; })[0] : tierOf(lv), s = d.stats || {};
    var w = o.w || 260, mini = w < 150;
    var style = '--w:' + w + 'px;--b0:' + T.bg[0] + ';--b1:' + T.bg[1] + ';--b2:' + T.bg[2] + ';--ink:' + T.ink + ';--ink2:' + T.ink2 + ';--f0:' + T.frame[0] + ';--f1:' + T.frame[1] + ';--f2:' + T.frame[2] + ';--f3:' + T.frame[3] + ';--ac:' + T.accent + ';--holo:' + (T.holo || 0) + ';--hc:' + (T.hc || '#fff,#fff');
    var h = '<div class="mc-card mc-' + T.id + (mini ? ' mc-mini' : '') + (d.locked ? ' mc-locked' : '') + (T.glow ? ' mc-glow' + T.glow : '') + '" style="' + style + '">';
    h += '<div class="mc-in"><div class="mc-bg"></div>' + '<div class="mc-pat"></div>' + MTN + (T.holo ? '<div class="mc-holo"></div>' : '') + (T.stars ? '<div class="mc-stars"></div>' : '');
    h += '<div class="mc-top"><div class="mc-ovr">' + (d.ovr || 40) + '</div><div class="mc-pos">' + esc(d.pos || 'MFC') + '</div><div class="mc-sep"></div><img class="mc-logo" src="' + (o.logo || 'assets/logo-mark.png') + '" alt="MFC"><div class="mc-lv">NIV.<b>' + lv + '</b></div></div>';
    h += '<div class="mc-face">' + (d.photo ? '<img src="' + esc(d.photo) + '" alt="">' : SIL + '<span class="mc-ini">' + esc(initials(d.name)) + '</span>') + '</div>';
    h += '<div class="mc-name">' + esc(d.name || 'Athlète') + '</div>';
    if (!mini) {
      h += '<div class="mc-stats">';
      MODS.forEach(function (m) { h += '<div><b>' + (s[m[0]] || 40) + '</b><span>' + m[1] + '</span></div>'; });
      h += '</div>';
    }
    h += '<div class="mc-tier">' + esc(T.n.toUpperCase()) + '</div>';
    h += '<div class="mc-shine"></div></div>' + (d.locked ? '<div class="mc-lock"><span>🔒</span><small>Niv. ' + T.from + '</small></div>' : '') + '</div>';
    return h;
  }

  var CLIP = 'polygon(9% 0,91% 0,100% 5.5%,100% 86%,50% 100%,0 86%,0 5.5%)';
  var CSS = '' +
    '.mc-card{position:relative;width:var(--w);aspect-ratio:.7;font-size:calc(var(--w)/26);clip-path:' + CLIP + ';background:linear-gradient(135deg,var(--f0),var(--f1) 30%,var(--f2) 55%,var(--f3) 80%,var(--f0));padding:.32em;box-sizing:border-box;flex-shrink:0;transform-style:preserve-3d;-webkit-user-select:none;user-select:none}' +
    '.mc-glow1{filter:drop-shadow(0 0 .8em rgba(255,200,80,.45))}.mc-glow2{filter:drop-shadow(0 0 1.1em rgba(255,215,120,.75))}' +
    '.mc-in{position:relative;width:100%;height:100%;clip-path:' + CLIP + ';overflow:hidden;color:var(--ink)}' +
    '.mc-bg{position:absolute;inset:0;background:radial-gradient(120% 70% at 70% 20%,var(--b2),transparent 60%),linear-gradient(160deg,var(--b1),var(--b0) 75%)}' +
    '.mc-pat{position:absolute;inset:0;opacity:.13;background:repeating-linear-gradient(115deg,transparent 0 .9em,var(--ink) .9em 1em),radial-gradient(circle at 50% 38%,transparent 30%,rgba(0,0,0,.25))}' +
    '.mc-mtn{position:absolute;left:0;right:0;bottom:12%;width:100%;height:22%;color:var(--ink);opacity:.09}' +
    '.mc-holo{position:absolute;inset:-20%;opacity:var(--holo);mix-blend-mode:overlay;background:conic-gradient(from calc(var(--hx,0) * 1deg),var(--hc));filter:blur(1.5em);animation:mcHolo 9s linear infinite}' +
    '.mc-stars{position:absolute;inset:0;background-image:radial-gradient(circle,#fff 0 .08em,transparent .12em),radial-gradient(circle,#FFE7A0 0 .06em,transparent .1em);background-size:3.1em 3.3em,2.3em 2.1em;background-position:0 0,1.1em 1.4em;opacity:.7;animation:mcTw 3s ease-in-out infinite alternate}' +
    '.mc-shine{position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.55) 47%,rgba(255,255,255,.08) 53%,transparent 62%);background-size:250% 100%;background-position:var(--sx,120%) 0;mix-blend-mode:soft-light;animation:mcShine 5.5s ease-in-out infinite;pointer-events:none}' +
    '.mc-top{position:absolute;left:7%;top:8%;width:22%;display:flex;flex-direction:column;align-items:center;z-index:3}' +
    '.mc-ovr{font:700 3.4em/1 Unbounded,system-ui,sans-serif;letter-spacing:-.04em}' +
    '.mc-pos{font:700 1.05em/1.2 Unbounded,system-ui,sans-serif;margin-top:.15em;color:var(--ink2)}' +
    '.mc-sep{width:70%;height:.07em;background:currentColor;opacity:.35;margin:.5em 0}' +
    '.mc-logo{width:100%;filter:drop-shadow(0 .05em .1em rgba(0,0,0,.35))}' +
    '.mc-bronze .mc-logo,.mc-argent .mc-logo,.mc-or .mc-logo,.mc-icone .mc-logo{filter:brightness(.25) sepia(.3) drop-shadow(0 .05em 0 rgba(255,255,255,.4))}' +
    '.mc-lv{font:700 .72em/1 JetBrains Mono,ui-monospace,monospace;margin-top:.7em;color:var(--ink2);letter-spacing:.05em;text-align:center}.mc-lv b{display:block;font:700 1.9em/1.05 Unbounded,system-ui,sans-serif;color:var(--ink)}' +
    '.mc-face{position:absolute;right:4%;top:6%;width:66%;height:50%;display:flex;align-items:flex-end;justify-content:center;z-index:2;color:var(--ink)}' +
    '.mc-face img{width:100%;height:100%;object-fit:cover;object-position:50% 25%;-webkit-mask-image:linear-gradient(#000 70%,transparent);mask-image:linear-gradient(#000 70%,transparent);border-radius:.6em .6em 0 0}' +
    '.mc-sil{position:absolute;bottom:0;width:92%;height:auto}' +
    '.mc-ini{position:relative;font:700 4.6em/1 Unbounded,system-ui,sans-serif;margin-bottom:.3em;letter-spacing:-.04em;background:linear-gradient(180deg,var(--ink),var(--ink2));-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 .06em .08em rgba(0,0,0,.25))}' +
    '.mc-name{position:absolute;left:6%;right:6%;top:57.5%;text-align:center;font:700 1.55em/1.1 Unbounded,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;z-index:3;padding-bottom:.25em;border-bottom:.06em solid color-mix(in srgb,var(--ink) 35%,transparent)}' +
    '.mc-stats{position:absolute;left:12%;right:12%;top:66.5%;display:grid;grid-template-columns:1fr 1fr;column-gap:1.4em;row-gap:.15em;z-index:3}' +
    '.mc-stats div{display:flex;align-items:baseline;gap:.45em;font-size:1.15em}.mc-stats b{font:700 1.15em/1.2 Unbounded,system-ui,sans-serif;min-width:1.5em;text-align:right}.mc-stats span{font:600 .8em Inter,system-ui,sans-serif;color:var(--ink2);letter-spacing:.06em}' +
    '.mc-stats div:nth-child(odd){border-right:.06em solid color-mix(in srgb,var(--ink) 25%,transparent);padding-right:.6em}' +
    '.mc-tier{position:absolute;left:0;right:0;bottom:6.2%;text-align:center;font:700 .62em/1 JetBrains Mono,ui-monospace,monospace;letter-spacing:.25em;color:var(--ink2);z-index:3}' +
    '.mc-icone .mc-sil{color:#B8932A}.mc-bronze .mc-sil,.mc-or .mc-sil{color:#3A2408}' +
    '.mc-mini .mc-name{top:63%;font-size:1.9em}.mc-mini .mc-face{height:56%}.mc-mini .mc-tier{bottom:9%;font-size:.95em}.mc-mini .mc-lv,.mc-mini .mc-sep,.mc-mini .mc-logo{display:none}.mc-mini .mc-ovr{font-size:4.2em}.mc-mini .mc-pos{font-size:1.4em}' +
    '.mc-locked .mc-in{filter:grayscale(.85) brightness(.45)}' +
    '.mc-lock{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3em;color:#fff;z-index:5}.mc-lock span{font-size:3em}.mc-lock small{font:700 1.4em Inter,system-ui;text-shadow:0 1px 4px #000}' +
    '@keyframes mcShine{0%,55%{background-position:130% 0}100%{background-position:-60% 0}}' +
    '@keyframes mcHolo{to{transform:rotate(360deg)}}@keyframes mcTw{from{opacity:.35}to{opacity:.85}}' +
    '@media (prefers-reduced-motion:reduce){.mc-shine,.mc-holo,.mc-stars{animation:none}}';
  if (!document.getElementById('mc-css')) { var el = document.createElement('style'); el.id = 'mc-css'; el.textContent = CSS; document.head.appendChild(el); }

  /* inclinaison au doigt (effet carte holographique) */
  function tilt(card) {
    var inner = card; card.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)';
    function mv(e) { var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; card.style.transition = 'transform .08s'; card.style.transform = 'perspective(900px) rotateY(' + (x * 22) + 'deg) rotateX(' + (-y * 18) + 'deg) scale(1.02)'; card.style.setProperty('--hx', Math.round(x * 180)); var sh = card.querySelector('.mc-shine'); if (sh) { sh.style.animation = 'none'; sh.style.backgroundPosition = (60 - x * 120) + '% 0'; } }
    function end() { card.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)'; card.style.transform = ''; var sh = card.querySelector('.mc-shine'); if (sh) { sh.style.animation = ''; sh.style.backgroundPosition = ''; } }
    inner.addEventListener('pointermove', mv); inner.addEventListener('pointerdown', mv); inner.addEventListener('pointerleave', end); inner.addEventListener('pointerup', end); inner.addEventListener('pointercancel', end);
  }

  window.MFCCard = { TIERS: TIERS, MODS: MODS, POS: POS, xpFor: xpFor, levelOf: levelOf, tierOf: tierOf, stats: stats, html: html, tilt: tilt };
})();

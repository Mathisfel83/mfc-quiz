/* ==SOCIAL== (bloc inséré dans index.html par serveur-social/build.py) */
/* ---------- Défis : classements, amis, duels, Course au sommet ---------- */
var SB_URL='https://eodjnceukxokexwwocxm.supabase.co', SB_KEY='sb_publishable_FfpXSXENiQUmQY3hYIcplQ_TVtj_3I7';
try{ var _sbo=localStorage.getItem('mfcq_sburl'); if(_sbo) SB_URL=_sbo; }catch(e){}
var NATIVE=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
function plug(n){ return NATIVE&&window.Capacitor.Plugins?window.Capacitor.Plugins[n]:null; }
var WEB_URL='https://mathisfel83.github.io/mfc-quiz/';
var APP_URL=NATIVE?WEB_URL:location.origin+location.pathname;
var sbP=null;
function sbSess(){ try{ return JSON.parse(localStorage.getItem('mfcq_sb')||'null'); }catch(e){ return null; } }
function sbSave(s){ try{ if(s) localStorage.setItem('mfcq_sb',JSON.stringify(s)); else localStorage.removeItem('mfcq_sb'); }catch(e){} }
function netErr(){ return new Error('Connexion au serveur impossible. Vérifie ton internet.'); }
function sbAuth(){
  var s=sbSess();
  if(s&&s.at&&s.exp>Date.now()+60000) return Promise.resolve(s);
  if(sbP) return sbP;
  var ref=s&&s.rt;
  sbP=fetch(SB_URL+(ref?'/auth/v1/token?grant_type=refresh_token':'/auth/v1/signup'),{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify(ref?{refresh_token:s.rt}:{data:{}})})
  .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){
    if(!r.ok){
      var m=String(j.msg||j.error_description||j.message||j.error||'');
      if(ref && r.status>=400 && r.status<500 && /refresh|token|not found/i.test(m)){ sbSave(null); sbP=null; return sbAuth(); }
      if(/anonymous/i.test(m)) throw new Error('Les défis ne sont pas encore activés sur le serveur.');
      throw new Error('Connexion au serveur impossible ('+r.status+').');
    }
    var ns={at:j.access_token,rt:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000,uid:(j.user&&j.user.id)||(s&&s.uid)};
    sbSave(ns); return ns;
  }); },function(){ throw netErr(); })
  .then(function(x){ sbP=null; return x; },function(e){ sbP=null; throw e; });
  return sbP;
}
function rpc(fn,args,retry){
  return sbAuth().then(function(s){
    return fetch(SB_URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+s.at,'Content-Type':'application/json'},body:JSON.stringify(args||{})}).catch(function(){ throw netErr(); });
  }).then(function(r){ return r.text().then(function(t){
    var j=null; try{ j=t?JSON.parse(t):null; }catch(e){}
    if(r.status===401&&!retry){ var s=sbSess(); if(s){ s.exp=0; sbSave(s); } return rpc(fn,args,1); }
    if(r.status===404) throw new Error('Le serveur des défis n’est pas encore prêt.');
    if(!r.ok) throw new Error((j&&j.message)||('Erreur du serveur ('+r.status+')'));
    return j;
  }); });
}

/* --- profil public + synchro des XP --- */
function faceThumb(cb){
  var src=avImg('face'); if(!src) return cb(null);
  var im=new Image();
  im.onload=function(){ try{ var c=document.createElement('canvas'); c.width=c.height=84; var x=c.getContext('2d'); x.fillStyle='#13203D'; x.fillRect(0,0,84,84); var s=Math.min(im.width,im.height); x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,84,84); cb(c.toDataURL('image/jpeg',.82)); }catch(e){ cb(null); } };
  im.onerror=function(){ cb(null); }; im.src=src;
}
var syncT=null;
function sbSync(){
  if(!st.pseudo) return Promise.resolve(null);
  return new Promise(function(res){ faceThumb(res); }).then(function(f){
    var h=f?(f.length+':'+f.slice(-48)):'';
    var a={p_pseudo:st.pseudo,p_xp:st.xp,p_goal:st.goal||null};
    if(f&&h!==st.faceH) a.p_face=f;
    return rpc('mfc_me',a).then(function(j){ if(a.p_face) st.faceH=h; st.soc=j; save(); return j; });
  });
}
function syncSoon(){ if(!st.pseudo||!navigator.onLine) return; clearTimeout(syncT); syncT=setTimeout(function(){ sbSync().catch(function(){}); },1500); }
function gainXP(n){ if(n<=0) return; st.xp+=n; recordDay(); save(); syncSoon(); }

/* --- petits éléments d'interface --- */
var PCOL=['#D4AF37','#4F8BFF','#6EC896','#E05A9C','#F08C5A','#9A7BFF'];
function faceH(p,sz,col){
  sz=sz||40;
  if(p&&p.face) return '<img class="sxf" src="'+esc(p.face)+'" alt="" style="width:'+sz+'px;height:'+sz+'px'+(col?';box-shadow:0 0 0 2px '+col:'')+'">';
  var n=(p&&p.pseudo||'?').charAt(0).toUpperCase();
  return '<span class="sxf" style="width:'+sz+'px;height:'+sz+'px;font-size:'+Math.round(sz*.42)+'px'+(col?';box-shadow:0 0 0 2px '+col:'')+'">'+esc(n)+'</span>';
}
function medal(i){ return i===0?'🥇':i===1?'🥈':i===2?'🥉':'<span class="mono" style="color:var(--muted);font-size:12px">'+(i+1)+'</span>'; }
function sxErr(e){ toast('⚠️',esc(e&&e.message||'Erreur'),3200); }
function weekLabel(w){
  if(!w) return ''; var p=w.split('-'), mon=new Date(+p[0],+p[1]-1,+p[2]), sun=new Date(+p[0],+p[1]-1,+p[2]+6);
  var mo=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  return 'du '+mon.getDate()+(mon.getMonth()!==sun.getMonth()?' '+mo[mon.getMonth()]:'')+' au '+sun.getDate()+' '+mo[sun.getMonth()];
}
function untilFreeze(){
  var n=new Date(), t=new Date(n.getFullYear(),n.getMonth(),n.getDate()+((7-n.getDay())%7),20,0,0);
  if(t<=n) t.setDate(t.getDate()+7);
  var m=Math.round((t-n)/60000), d=Math.floor(m/1440), h=Math.floor(m%1440/60);
  return d?d+' j '+h+' h':h?h+' h '+(m%60)+' min':(m%60)+' min';
}
function shareLink(url,text){
  var SH=plug('Share'); if(SH) return SH.share({title:'MFC Quiz',text:text,url:url}).catch(function(){});
  if(navigator.share) return navigator.share({title:'MFC Quiz',text:text,url:url}).catch(function(){});
  try{ navigator.clipboard.writeText(text+' '+url); toast('📋','Lien copié !',2000); }catch(e){ toast('🔗',esc(url),5000); }
}
document.head.insertAdjacentHTML('beforeend','<style>'+
'.sxf{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;object-fit:cover;background:#13203D;color:var(--gold);font-family:var(--head);font-weight:700;flex-shrink:0}'+
'.sxrow{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:16px}'+
'.sxrow.me{background:rgba(212,175,55,.12);box-shadow:inset 0 0 0 1px rgba(212,175,55,.45)}'+
'.sxrow .n{flex:1;min-width:0;font-weight:600;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.sxrow .v{font-family:var(--mono);font-size:13px;font-weight:700;color:var(--gold)}'+
'.sxmed{width:26px;text-align:center;font-size:20px}'+
'.sxgame{display:flex;gap:14px;align-items:center;padding:16px;text-align:left;width:100%}'+
'.sxgame .e{font-size:34px;line-height:1}'+
'.sxtime{height:6px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;margin:12px 0 4px}'+
'.sxtime i{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width .3s linear}'+
'.sxdiff{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}'+
'.sxdiff button{padding:14px 6px;border-radius:18px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);font-weight:700;font-size:14px;display:flex;flex-direction:column;align-items:center;gap:4px}'+
'.sxdiff button small{font-family:var(--mono);font-size:10px;color:var(--gold);font-weight:700}'+
'.sxcode{font-family:var(--head);font-size:44px;letter-spacing:10px;color:var(--gold);text-align:center;margin:8px 0}'+
'.sxinput{display:block;width:100%;height:52px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--ink);font:inherit;font-size:17px;padding:0 16px;box-sizing:border-box}'+
'.sxboard{width:100%;height:auto;display:block;border-radius:22px;background:linear-gradient(180deg,#0E1D3E,#0A1530)}'+
'</style>');

/* --- difficulté des questions (place dans le parcours + précision chiffrée) --- */
var DIFF={};
(function(){
  var pos={}, sc=[];
  M.forEach(function(m){ var ls=lessonsOf(m.id); ls.forEach(function(l,i){ (l.qs||[]).forEach(function(q){ pos[q.id]=ls.length>1?i/(ls.length-1):.5; }); }); });
  Q.forEach(function(q){ sc.push([q.id,(pos[q.id]===undefined?.5:pos[q.id])*2+(/\d/.test(q.q+' '+q.o.join(' '))?1:0)+(q.q.length>110?.5:0)]); });
  sc.sort(function(a,b){ return a[1]-b[1]; });
  sc.forEach(function(x,i){ DIFF[x[0]]=i<sc.length/3?1:i<sc.length*2/3?2:3; });
})();
var DN={1:['Facile',1,5],2:['Moyen',2,10],3:['Difficile',3,15]};

/* ---------- écran Défis ---------- */
var ar={kind:'week',fr:false,b:null,fl:null,du:null,load:0};
function arena(){
  if(!st.pseudo){
    var h='<div class="screen"><div class="wrap"><div class="up"><div class="mono" style="color:var(--muted)">JOUE AVEC LES AUTRES</div><h1 class="h1" style="margin-top:4px">Défis</h1></div>';
    h+='<div class="goldcard up d1" style="margin-top:16px;padding:20px;display:flex;flex-direction:column;gap:14px">';
    [['🏆','Podium de la semaine','Les 10 meilleurs XP de la semaine, figé chaque dimanche à 20 h et partagé par Mathis en story.'],['🌍','Classement général','Ta place parmi tous les joueurs.'],['⚔️','Duels','Défie un ami sur 5 questions, chacun joue quand il veut.'],['🏔️','Course au sommet','Le jeu de plateau en direct, de 2 à 6 joueurs.']].forEach(function(x){ h+='<div style="display:flex;gap:12px;align-items:flex-start"><span style="font-size:26px">'+x[0]+'</span><div><b>'+x[1]+'</b><div style="font-size:13px;color:var(--muted);line-height:1.45;margin-top:2px">'+x[2]+'</div></div></div>'; });
    h+='</div><button class="btn gold up d2" data-sx="activate" style="margin-top:16px">Choisir mon pseudo '+IC.arrow+'</button></div></div>';
    view.innerHTML=h; return;
  }
  drawArena(); loadArena();
}
function loadArena(){
  ar.load=1; drawArena();
  Promise.all([sbSync(),rpc('mfc_board',{p_kind:ar.kind,p_friends:ar.fr,p_limit:10}),rpc('mfc_friends',{}),rpc('mfc_duels',{})])
  .then(function(r){ ar.b=r[1]; ar.fl=r[2]; ar.du=r[3]; ar.load=0; ar.err=''; duelRewards(); if(tab==='arena') drawArena(); pendingLinks(); })
  .catch(function(e){ ar.load=0; ar.err=e.message; if(tab==='arena') drawArena(); });
}
function reloadBoard(){ ar.b=null; drawArena(); rpc('mfc_board',{p_kind:ar.kind,p_friends:ar.fr,p_limit:10}).then(function(b){ ar.b=b; if(tab==='arena') drawArena(); }).catch(sxErr); }
function boardRows(b,meId){
  if(!b) return '<div style="padding:18px;text-align:center;color:var(--muted);font-size:13px">Chargement…</div>';
  if(!b.rows.length) return '<div style="padding:18px;text-align:center;color:var(--muted);font-size:13px;line-height:1.5">'+(b.kind==='all'?'Personne pour l’instant.':'Personne n’a encore gagné d’XP cette semaine.<br>Fais un quiz pour prendre la tête !')+'</div>';
  var wk=b.kind!=='all', h='', inTop=false;
  b.rows.forEach(function(p,i){ var me=p.id===meId; if(me) inTop=true; ppl[p.id]=p; h+='<div class="sxrow'+(me?' me':'')+'"'+(me?'':' data-sx="player" data-id="'+p.id+'" style="cursor:pointer"')+'><span class="sxmed">'+medal(i)+'</span>'+faceH(p,38)+'<span class="n">'+esc(p.pseudo)+(me?' <span class="mono" style="color:var(--gold);font-size:10px">· TOI</span>':'')+'</span><span class="v">'+fmt(wk?p.wxp:p.xp)+' XP</span></div>'; });
  if(!inTop&&b.pos) h+='<div class="sxrow me"><span class="sxmed mono" style="font-size:12px;color:var(--gold)">'+b.pos+'</span>'+faceH(st.soc,38)+'<span class="n">'+esc(st.pseudo)+' <span class="mono" style="color:var(--gold);font-size:10px">· TOI</span></span><span class="v">'+fmt(b.me)+' XP</span></div>';
  return h;
}
function drawArena(){
  if(tab!=='arena') return;
  var so=st.soc||{}, meId=so.id, h='<div class="screen"><div class="wrap">';
  h+='<div class="row" style="justify-content:space-between"><div><div class="mono" style="color:var(--muted)">JOUE AVEC LES AUTRES</div><h1 class="h1" style="margin-top:4px">Défis</h1></div><button class="chip" data-sx="pseudo" style="color:var(--gold);max-width:48%;overflow:hidden">'+faceH(so,22)+' '+esc(st.pseudo)+'</button></div>';
  if(ar.err) h+='<div class="glass" style="margin-top:14px;padding:14px 16px;border-color:rgba(240,140,90,.5);font-size:13.5px;line-height:1.5"><b style="color:var(--bad)">Hors ligne</b><br>'+esc(ar.err)+'<br><button class="chip" data-sx="retry" style="margin-top:10px">Réessayer</button></div>';
  // semaine
  h+='<div class="goldcard" style="margin-top:14px;padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><div class="mono" style="color:var(--gold);font-size:10px">MES XP CETTE SEMAINE</div><div style="font-family:var(--head);font-size:24px;font-weight:700">'+fmt(so.wxp||0)+'</div></div><div style="text-align:right"><div class="mono" style="color:var(--muted);font-size:10px">PODIUM FIGÉ DANS</div><div style="font-family:var(--head);font-size:17px;font-weight:600;margin-top:4px">'+untilFreeze()+'</div></div>';
  h+='<div style="grid-column:1/3;font-size:12.5px;color:var(--silver)">Classement général : <b style="color:var(--ink)">'+(so.rank?so.rank+'<sup>e</sup> sur '+fmt(so.total):'…')+'</b> · '+fmt(st.xp)+' XP au total</div></div>';
  // classements
  h+='<div class="glass" style="margin-top:14px;padding:12px">';
  h+='<div class="seg2"><button data-sx="kind" data-v="week" class="'+(ar.kind==='week'?'on':'')+'">🏆 Semaine</button><button data-sx="kind" data-v="all" class="'+(ar.kind==='all'?'on':'')+'">🌍 Général</button></div>';
  h+='<div class="row" style="justify-content:space-between;margin:10px 4px 4px"><span class="mono" style="color:var(--muted);font-size:10px">'+(ar.kind==='week'?'TOP 10 · SEMAINE '+esc(weekLabel(ar.b&&ar.b.week)).toUpperCase():'TOP 10 · TOUS LES XP')+'</span><button class="chip" data-sx="fr" style="font-size:11px;padding:5px 10px;white-space:nowrap;'+(ar.fr?'color:var(--gold)':'')+'">'+(ar.fr?'👥 Amis':'🌍 Tous')+'</button></div>';
  h+='<div style="display:flex;flex-direction:column;gap:4px">'+boardRows(ar.b,meId)+'</div>';
  if(ar.kind==='week') h+='<button class="btn ghost" data-sx="last" style="margin-top:10px">🏁 Podium de la semaine dernière</button>';
  h+='</div>';
  // jeux
  h+='<div class="mono" style="color:var(--muted);margin:22px 0 10px">JOUER</div><div style="display:flex;flex-direction:column;gap:12px">';
  h+='<button class="glass sxgame" data-sx="duelnew"><span class="e">⚔️</span><span style="flex:1"><b style="font-size:16px">Duel</b><br><span style="font-size:13px;color:var(--muted)">5 questions contre un ami · 24 h pour répondre</span></span>'+IC.arrow+'</button>';
  h+='<div class="glass sxgame" style="flex-wrap:wrap"><span class="e">🏔️</span><span style="flex:1"><b style="font-size:16px">Course au sommet</b><br><span style="font-size:13px;color:var(--muted)">Plateau en direct · 2 à 6 joueurs</span></span><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%"><button class="btn gold" data-sx="roomnew" style="height:46px;font-size:14px">Créer un salon</button><button class="btn ghost" data-sx="roomjoin" style="height:46px;font-size:14px">Rejoindre</button></div></div>';
  h+='</div>';
  // duels
  var du=ar.du||[];
  if(du.length){ h+='<div class="mono" style="color:var(--muted);margin:22px 0 10px">MES DUELS</div><div class="glass" style="padding:6px">';
    du.slice(0,12).forEach(function(d){ var s=duelStatus(d); h+='<button class="sxrow" data-sx="duel" data-id="'+d.id+'" style="width:100%;text-align:left">'+faceH(d.op,38)+'<span class="n">'+esc(d.op.pseudo)+'<br><span style="font-size:12px;font-weight:500;color:var(--muted)">'+esc(themeName(d.theme))+'</span></span><span class="mono" style="font-size:11px;font-weight:700;color:'+s[1]+'">'+s[0]+'</span></button>'; });
    h+='</div>'; }
  // amis
  h+='<div class="row" style="justify-content:space-between;margin:22px 0 10px"><span class="mono" style="color:var(--muted)">MES AMIS'+(ar.fl?' · '+ar.fl.length:'')+'</span><button class="chip" data-sx="addfr" style="color:var(--gold);font-size:12px">+ Ajouter</button></div>';
  h+='<div class="glass" style="padding:14px 16px;display:flex;align-items:center;gap:12px"><div style="flex:1"><div class="mono" style="color:var(--muted);font-size:10px">MON CODE AMI</div><div style="font-family:var(--head);font-size:22px;letter-spacing:4px;color:var(--gold)">'+esc(so.code||'······')+'</div></div><button class="btn gold" data-sx="sharecode" style="width:auto;height:44px;padding:0 16px;font-size:14px">Partager</button></div>';
  if(ar.fl&&ar.fl.length){ h+='<div class="glass" style="margin-top:10px;padding:6px">';
    ar.fl.forEach(function(f){ ppl[f.id]=f; h+='<div class="sxrow" data-sx="player" data-id="'+f.id+'">'+faceH(f,38)+'<span class="n">'+esc(f.pseudo)+'<br><span style="font-size:12px;font-weight:500;color:var(--muted)">'+fmt(f.wxp)+' XP cette semaine · '+rankOf(f.xp).r.n+'</span></span><button class="chip" data-sx="duelnew" data-id="'+f.id+'" style="font-size:12px">⚔️ Défier</button></div>'; });
    h+='</div>'; }
  else if(ar.fl) h+='<div style="font-size:13px;color:var(--muted);margin-top:10px;line-height:1.5;text-align:center">Envoie ton code à tes proches : ils t’ajoutent en un geste avec le lien.</div>';
  h+='<button class="glass row" data-sx="ranks" style="width:100%;margin-top:22px;padding:14px 16px;justify-content:space-between;font-size:15px"><span>🎖️ Rangs et récompenses</span><span style="color:var(--muted)">›</span></button>';
  h+='</div></div>';
  var sc=view.querySelector('.screen'), top=sc?sc.scrollTop:0;
  view.innerHTML=h;
  if(top) view.querySelector('.screen').scrollTop=top;
}
function themeName(t){ if(t==='mix') return 'Mélange de thèmes'; var m=M.filter(function(x){ return x.id===t; })[0]; return m?m.name:t; }

/* --- pseudo + liens d'invitation --- */
function pseudoSheet(){
  sheet('<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 class="h1" style="font-size:18px">Ton pseudo de joueur</h2><button class="iconbtn" data-close aria-label="Fermer">'+IC.x+'</button></div><form id="psf"><input id="psi" class="sxinput" maxlength="20" value="'+esc(st.pseudo||st.name||'')+'" placeholder="Ex. Mathis_83" autocomplete="nickname"><div style="font-size:12.5px;color:var(--muted);line-height:1.5;margin:10px 2px 16px">Ton pseudo et ton jeton de carte (ta note et sa couleur) s’affichent dans les classements. Le podium de la semaine peut être partagé par Mathis en story Instagram : évite ton nom complet si tu préfères rester discret.</div><button class="btn gold" type="submit">Valider</button></form>');
  var f=document.getElementById('psf'), i=document.getElementById('psi');
  f.addEventListener('submit',function(e){ e.preventDefault(); var v=i.value.trim().slice(0,20); if(v.length<2){ toast('✏️','Au moins 2 caractères',2000); return; }
    var prev=st.pseudo; st.pseudo=v; save(); f.querySelector('button').textContent='Connexion…';
    sbSync().then(function(){ f.closest('.sheet').remove(); tab='arena'; render(); if(!prev) toast('🎉','Bienvenue dans les défis, '+esc(v)+' !',2600); })
    .catch(function(err){ st.pseudo=prev; save(); f.querySelector('button').textContent='Valider'; sxErr(err); });
  });
}
function pendingLinks(){
  var p=st.pend; if(!p||!st.pseudo||!st.soc) return;
  st.pend=null; save();
  if(p.ami) rpc('mfc_add_friend',{p_code:p.ami}).then(function(o){ toast('🤝','<b>'+esc(o.pseudo)+'</b> est maintenant ton ami !',2800); ar.fl=null; if(tab==='arena') loadArena(); }).catch(function(e){ if(!/propre code/.test(e.message)) sxErr(e); });
  if(p.salon) roomJoin(p.salon);
}
function addFriendSheet(){
  sheet('<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 class="h1" style="font-size:18px">Ajouter un ami</h2><button class="iconbtn" data-close aria-label="Fermer">'+IC.x+'</button></div><form id="afs"><input id="afi" class="sxinput" maxlength="6" placeholder="CODE À 6 CARACTÈRES" autocapitalize="characters" autocomplete="off" style="text-transform:uppercase;letter-spacing:4px;text-align:center;font-family:var(--head)"><div style="font-size:12.5px;color:var(--muted);line-height:1.5;margin:10px 2px 16px">Ton ami trouve son code dans l’onglet Défis. Il peut aussi t’envoyer son lien : en l’ouvrant, vous devenez amis automatiquement.</div><button class="btn gold" type="submit">Ajouter</button></form>');
  var f=document.getElementById('afs'), i=document.getElementById('afi'); setTimeout(function(){ i.focus(); },300);
  f.addEventListener('submit',function(e){ e.preventDefault();
    rpc('mfc_add_friend',{p_code:i.value}).then(function(o){ f.closest('.sheet').remove(); toast('🤝','<b>'+esc(o.pseudo)+'</b> est maintenant ton ami !',2600); loadArena(); }).catch(sxErr);
  });
}

/* --- podium figé + image story --- */
function lastSheet(){
  sheet('<div class="row" style="justify-content:space-between;margin-bottom:6px"><h2 class="h1" style="font-size:18px">🏁 Podium de la semaine dernière</h2><button class="iconbtn" data-close aria-label="Fermer">'+IC.x+'</button></div><div id="lsb" style="color:var(--muted);font-size:13px;padding:14px 0">Chargement…</div>');
  rpc('mfc_board',{p_kind:'last',p_friends:false,p_limit:10}).then(function(b){
    var el=document.getElementById('lsb'); if(!el) return;
    el.innerHTML='<div class="mono" style="color:var(--gold);font-size:10px;margin-bottom:8px">SEMAINE '+esc(weekLabel(b.week)).toUpperCase()+' · FIGÉ DIMANCHE 20 H</div><div style="display:flex;flex-direction:column;gap:4px">'+boardRows(b,(st.soc||{}).id)+'</div>'+(b.rows.length?'<button class="btn gold" id="lsimg" style="margin-top:14px">📸 Image pour la story</button>':'');
    var bt=document.getElementById('lsimg'); if(bt) bt.addEventListener('click',function(){ bt.textContent='Création…'; storyImg(b).then(function(u){ document.querySelector('.sheet').remove(); storySheet(u); }); });
  }).catch(function(e){ var el=document.getElementById('lsb'); if(el) el.textContent=e.message; });
}
function loadImg(u){ return new Promise(function(res){ if(!u) return res(null); var i=new Image(); i.onload=function(){ res(i); }; i.onerror=function(){ res(null); }; i.src=u; }); }
function rrect(x,X,Y,W,H,R){ x.beginPath(); x.moveTo(X+R,Y); x.arcTo(X+W,Y,X+W,Y+H,R); x.arcTo(X+W,Y+H,X,Y+H,R); x.arcTo(X,Y+H,X,Y,R); x.arcTo(X,Y,X+W,Y,R); x.closePath(); }
function storyImg(b){
  var rows=b.rows.slice(0,10);
  return Promise.all([loadImg('assets/logo-full.png'),(document.fonts&&document.fonts.ready)||Promise.resolve()].concat(rows.map(function(p){ return loadImg(p.face); }))).then(function(im){
    var W=1080,H=1920,c=document.createElement('canvas'); c.width=W; c.height=H; var x=c.getContext('2d');
    var g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#071230'); g.addColorStop(.55,'#050A16'); g.addColorStop(1,'#0B1A3A'); x.fillStyle=g; x.fillRect(0,0,W,H);
    var rg=x.createRadialGradient(W/2,330,10,W/2,330,700); rg.addColorStop(0,'rgba(212,175,55,.28)'); rg.addColorStop(1,'rgba(212,175,55,0)'); x.fillStyle=rg; x.fillRect(0,0,W,H);
    var logo=im[0]; if(logo){ var lw=360, lh=lw*logo.height/logo.width; x.drawImage(logo,(W-lw)/2,110,lw,lh); }
    x.textAlign='center'; x.fillStyle='#D4AF37'; x.font='700 70px Unbounded, system-ui, sans-serif'; x.fillText('PODIUM',W/2,400);
    x.fillStyle='#F2F4F7'; x.font='600 44px Unbounded, system-ui, sans-serif'; x.fillText('DE LA SEMAINE',W/2,462);
    x.fillStyle='#C9CED6'; x.font='500 34px Inter, system-ui, sans-serif'; x.fillText('Semaine '+weekLabel(b.week),W/2,520);
    var rh=112, y0=600+Math.round((10-rows.length)*rh/2);
    rows.forEach(function(p,i){
      var y=y0+i*rh, top3=i<3;
      rrect(x,70,y,W-140,rh-16,30); x.fillStyle=top3?'rgba(212,175,55,'+(.24-i*.06)+')':'rgba(255,255,255,.05)'; x.fill();
      x.lineWidth=2; x.strokeStyle=top3?'rgba(212,175,55,.7)':'rgba(201,206,214,.18)'; x.stroke();
      var cy=y+(rh-16)/2;
      x.textAlign='center'; x.fillStyle=i===0?'#F3D98A':i===1?'#E3E6EB':i===2?'#E0A96D':'#9AA4B5'; x.font='700 40px Unbounded, system-ui, sans-serif'; x.fillText(String(i+1),130,cy+14);
      var fi=im[i+2]; x.save(); x.beginPath(); x.arc(222,cy,38,0,Math.PI*2); x.closePath(); x.fillStyle='#13203D'; x.fill(); x.clip();
      if(fi) x.drawImage(fi,184,cy-38,76,76); else { x.fillStyle='#D4AF37'; x.font='700 34px Unbounded, system-ui, sans-serif'; x.fillText((p.pseudo||'?').charAt(0).toUpperCase(),222,cy+12); }
      x.restore(); x.beginPath(); x.arc(222,cy,38,0,Math.PI*2); x.strokeStyle=top3?'#D4AF37':'rgba(201,206,214,.4)'; x.lineWidth=3; x.stroke();
      x.textAlign='left'; x.fillStyle='#F2F4F7'; x.font='700 40px Inter, system-ui, sans-serif';
      var nm=p.pseudo; while(x.measureText(nm).width>470&&nm.length>3) nm=nm.slice(0,-2)+'…'; x.fillText(nm,282,cy+14);
      x.textAlign='right'; x.fillStyle='#D4AF37'; x.font='700 36px "JetBrains Mono", ui-monospace, monospace'; x.fillText(fmt(p.wxp)+' XP',W-110,cy+13);
    });
    x.textAlign='center'; x.fillStyle='#F2F4F7'; x.font='600 38px Unbounded, system-ui, sans-serif'; x.fillText('Et toi, tu te places où ?',W/2,1790);
    x.fillStyle='#D4AF37'; x.font='500 30px Inter, system-ui, sans-serif'; x.fillText('MFC Quiz · la science du sport en 2 minutes par jour',W/2,1846);
    return c.toDataURL('image/png');
  });
}
function storySheet(u){
  sheet('<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 class="h1" style="font-size:18px">Ton image story</h2><button class="iconbtn" data-close aria-label="Fermer">'+IC.x+'</button></div><img src="'+u+'" alt="Podium de la semaine" style="width:62%;display:block;margin:0 auto;border-radius:18px;border:1px solid var(--line)"><div style="font-size:12.5px;color:var(--muted);text-align:center;margin:10px 0 14px">Si le bouton ne marche pas : appuie longuement sur l’image, puis « Enregistrer dans Photos ».</div><button class="btn gold" id="stsh">Partager / enregistrer '+IC.arrow+'</button>');
  document.getElementById('stsh').addEventListener('click',function(){
    var FS=plug('Filesystem'), SH=plug('Share');
    if(FS&&SH){ FS.writeFile({path:'podium-mfc-quiz.png',data:u.split(',')[1],directory:'CACHE'}).then(function(r){ return SH.share({files:[r.uri]}); }).catch(function(){}); return; }
    fetch(u).then(function(r){ return r.blob(); }).then(function(bl){
      var f=new File([bl],'podium-mfc-quiz.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})) return navigator.share({files:[f]}).catch(function(){});
      var a=document.createElement('a'); a.href=u; a.download='podium-mfc-quiz.png'; document.body.appendChild(a); a.click(); a.remove();
    });
  });
}

/* ---------- mini-quiz chronométré (duels) ---------- */
var rq=null, RQT=20000;
function runQs(ids,o){
  avUnmount(); setNav(false);
  rq={qs:ids.map(function(id){ return QBY[id]; }).filter(Boolean).map(function(q){ return {q:q,order:q.vf?[0,1]:shuffle(q.o.map(function(_,i){ return i; }))}; }),i:0,picked:null,score:0,ms:0,t0:Date.now(),o:o,tm:null,T:o.timer===undefined?RQT:o.timer};
  drawRq();
}
function drawRq(){
  var it=rq.qs[rq.i], q=it.q, n=rq.qs.length, ans=rq.picked!==null, L=q.vf?['V','F']:['A','B','C','D','E','F'];
  var h='<div class="screen noNav"><div class="wrap"><div class="top"><button class="iconbtn" data-sx="rqquit" aria-label="Abandonner">'+IC.x+'</button><div class="segs" style="grid-template-columns:repeat('+n+',1fr)">';
  for(var s=0;s<n;s++) h+='<div class="seg'+(s<rq.i||(s===rq.i&&ans)?' done':'')+'"></div>';
  h+='</div><span class="chip" style="color:var(--gold)">'+rq.score+'/'+n+'</span></div>';
  h+='<div class="mono" style="color:var(--gold);margin-top:18px">'+esc(rq.o.title)+' · '+(rq.i+1)+'/'+n+(q.vf?' · <span style="color:var(--ink)">VRAI OU FAUX</span>':q.multi?' · <span style="color:var(--ink)">PLUSIEURS RÉPONSES</span>':'')+'</div>';
  if(!ans&&rq.T) h+='<div class="sxtime"><i id="rqbar" style="width:100%"></i></div>';
  h+='<h1 class="h1" style="margin:12px 0 18px">'+esc(q.q)+'</h1>';
  var M=!!q.multi, sel=rq.sel||[], isA=function(oi){ return M?q.a.indexOf(oi)>=0:oi===q.a; }, wasP=function(oi){ return M?sel.indexOf(oi)>=0:oi===rq.picked; };
  if(M&&!ans) h+='<div style="font-size:13px;color:var(--muted);margin:-8px 0 14px">Coche <b style="color:var(--ink)">toutes</b> les bonnes réponses, puis valide.</div>';
  it.order.forEach(function(oi,pos){ var cls='opt', on=M&&!ans&&sel.indexOf(oi)>=0; if(ans){ cls=isA(oi)?'opt good':wasP(oi)?'opt bad':'opt dim'; }
    h+='<button class="'+cls+'" '+(ans?'disabled':'data-sx="'+(M?'rqtog':'rqpick')+'" data-i="'+oi+'"')+(on?' style="border-color:var(--gold);background:rgba(212,175,55,.12)"':'')+'><span class="l"'+(on?' style="background:var(--gold);color:#070D1C;border-color:var(--gold)"':'')+'>'+(ans&&isA(oi)?IC.check:ans&&wasP(oi)?'✕':on?'✓':L[pos])+'</span><span>'+esc(q.o[oi])+'</span></button>'; });
  if(M&&!ans) h+='<button class="btn gold" data-sx="rqval" style="width:100%;margin-top:6px'+(sel.length?'':';opacity:.45')+'"'+(sel.length?'':' disabled')+'>Valider ('+sel.length+')</button>';
  if(ans){ var right=rq.ok, src=S[q.s];
    h+='<div class="glass fb"><span style="font-family:var(--head);font-weight:600;font-size:15px;color:'+(right?'var(--good)':'var(--bad)')+'">'+(right?'Bien joué !':rq.picked===-1?'Temps écoulé !':M?'Raté… il fallait cocher toutes les bonnes réponses, et seulement elles.':'Raté…')+'</span><div style="font-size:14px;line-height:1.55;color:var(--ink2);margin-top:8px">'+esc(q.e)+'</div>'+(src?'<span class="src">Source : '+esc(src.t)+'<br><a href="'+src.u+'" target="_blank" rel="noopener">Voir l’étude '+IC.ext+'</a></span>':'')+'</div><div style="height:14px"></div><button class="btn gold" data-sx="rqnext">'+(rq.i<n-1?'Question suivante':'Voir le résultat')+IC.arrow+'</button>'; }
  h+='</div></div>'; view.innerHTML=h;
  clearInterval(rq.tm);
  if(!ans){ rq.t0=Date.now(); if(rq.T) rq.tm=setInterval(function(){ if(!rq){ return; } var el=Date.now()-rq.t0, b=document.getElementById('rqbar'); if(b) b.style.width=Math.max(0,100-el/rq.T*100)+'%'; if(el>=rq.T) rqPick(-1); },200); }
  else { var sc=view.querySelector('.screen'); setTimeout(function(){ sc.scrollTo({top:sc.scrollHeight,behavior:'smooth'}); },120); }
}
function rqPick(oi){
  if(!rq||rq.picked!==null) return; clearInterval(rq.tm);
  var q=rq.qs[rq.i].q, sel=rq.sel||[]; rq.picked=oi;
  var ok=q.multi?(oi!==-1&&sel.length===q.a.length&&q.a.every(function(x){ return sel.indexOf(x)>=0; })):oi===q.a;
  rq.ok=ok; buzz(ok); rq.ms+=Math.min(rq.T||9e9,Date.now()-rq.t0);
  st.answered++; var pp=q.id.indexOf('pp-')===0;
  if(ok){ rq.score++; st.correct++; if(pp){ ppSt().m[q.id]=1; } else { st.mastered[q.id]=1; delete st.wrong[q.id]; } } else if(!pp) st.wrong[q.id]=1;
  save(); drawRq();
}
function rqEnd(){ var r=rq; clearInterval(r.tm); rq=null; gainXP(r.score*XP_RIGHT); r.o.done(r.score,r.ms); }

/* ---------- duels ---------- */
function duelStatus(d){
  if(d.my===null&&!d.expired) return ['À TOI ⚔️','var(--gold)'];
  if(d.my===null) return ['EXPIRÉ','var(--muted)'];
  if(d.his===null) return d.expired?['EXPIRÉ','var(--muted)']:['EN ATTENTE','var(--silver)'];
  var w=duelWin(d); return w>0?['GAGNÉ 🏆','var(--good)']:w<0?['PERDU','var(--bad)']:['ÉGALITÉ','var(--silver)'];
}
function duelWin(d){ if(d.my===null||d.his===null) return 0; if(d.my!==d.his) return d.my>d.his?1:-1; if(d.my_ms!==d.his_ms) return d.my_ms<d.his_ms?1:-1; return 0; }
function duelRewards(){
  st.duelSeen=st.duelSeen||{};
  (ar.du||[]).forEach(function(d){ if(d.my!==null&&d.his!==null&&!st.duelSeen[d.id]){ st.duelSeen[d.id]=1; if(duelWin(d)>0){ gainXP(20); toast('🏆','Duel gagné contre <b>'+esc(d.op.pseudo)+'</b> : +20 XP',2800); } } });
  save();
}
function duelNew(fid){
  var fl=ar.fl||[];
  if(!fl.length){ sheet('<h2 class="h1" style="font-size:18px">Pas encore d’amis</h2><p style="color:var(--muted);font-size:14px;line-height:1.5">Pour lancer un duel, ajoute d’abord un ami avec son code, ou envoie-lui ton lien.</p><div style="display:flex;flex-direction:column;gap:10px"><button class="btn gold" data-close data-sx="sharecode">Partager mon lien</button><button class="btn ghost" data-close data-sx="addfr">Entrer un code</button></div>'); return; }
  var sel={f:fid||(fl.length===1?fl[0].id:null),t:'mix'};
  function draw(){
    var h='<div class="row" style="justify-content:space-between;margin-bottom:10px"><h2 class="h1" style="font-size:18px">⚔️ Nouveau duel</h2><button class="iconbtn" data-close aria-label="Fermer">'+IC.x+'</button></div><div class="mono" style="color:var(--muted);margin-bottom:8px">ADVERSAIRE</div><div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px">';
    fl.forEach(function(f){ h+='<button data-df="'+f.id+'" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px;border-radius:16px;min-width:76px;'+(sel.f===f.id?'background:rgba(212,175,55,.15);box-shadow:inset 0 0 0 1px var(--gold)':'background:rgba(255,255,255,.04)')+'">'+faceH(f,44)+'<span style="font-size:12px;font-weight:600;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(f.pseudo)+'</span></button>'; });
    h+='</div><div class="mono" style="color:var(--muted);margin:14px 0 8px">THÈME</div><div style="display:flex;flex-wrap:wrap;gap:8px">';
    [['mix','🎲 Mélange']].concat(M.map(function(m){ return [m.id,m.name]; })).forEach(function(t){ h+='<button class="chip" data-dt="'+t[0]+'" style="font-family:inherit;font-weight:600;'+(sel.t===t[0]?'color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold)':'')+'">'+esc(t[1])+'</button>'; });
    h+='</div><div style="font-size:12.5px;color:var(--muted);line-height:1.5;margin:14px 2px">Vous aurez les mêmes 5 questions, 20 secondes chacune. Le plus de bonnes réponses gagne, puis le plus rapide. Victoire : +20 XP.</div><button class="btn gold" id="dgo" '+(sel.f?'':'disabled style="opacity:.5"')+'>Lancer le duel '+IC.arrow+'</button>';
    box.innerHTML=h;
  }
  sheet(''); var sh=document.querySelector('.sheet'), box=sh.firstChild; draw();
  box.addEventListener('click',function(e){
    var f=e.target.closest('[data-df]'), t=e.target.closest('[data-dt]');
    if(f){ sel.f=f.dataset.df; draw(); } else if(t){ sel.t=t.dataset.dt; draw(); }
    else if(e.target.closest('#dgo')&&sel.f){
      var pool=Q.filter(function(q){ return sel.t==='mix'||q.m===sel.t; }), ids=shuffle(pool).slice(0,5).map(function(q){ return q.id; });
      var op=fl.filter(function(x){ return x.id===sel.f; })[0];
      e.target.closest('#dgo').textContent='Création…';
      rpc('mfc_duel_create',{p_friend:sel.f,p_theme:sel.t,p_qs:ids}).then(function(j){ sh.remove(); duelPlay({id:j.id,qs:ids,op:op,theme:sel.t}); }).catch(sxErr);
    }
  });
}
function duelPlay(d){
  runQs(d.qs,{title:'DUEL CONTRE '+String(d.op.pseudo).toUpperCase(),done:function(score,ms){
    rpc('mfc_duel_play',{p_id:d.id,p_score:score,p_ms:ms}).then(function(){ return rpc('mfc_duels',{}); }).then(function(l){ ar.du=l; duelRewards(); var x=l.filter(function(y){ return y.id===d.id; })[0]; duelView(x||d,score); }).catch(function(e){ sxErr(e); tab='arena'; render(); });
  }});
}
function duelView(d,justScore){
  setNav(false); avUnmount();
  var me=st.soc||{pseudo:st.pseudo}, w=duelWin(d), done=d.my!==null&&d.his!==null;
  var h='<div class="screen noNav"><div class="wrap" style="text-align:center;padding-top:20px"><div class="mono" style="color:var(--gold);letter-spacing:2px">DUEL · '+esc(themeName(d.theme)).toUpperCase()+'</div>';
  h+='<div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;margin-top:26px">';
  h+='<div>'+faceH(me,84,done&&w>0?'var(--gold)':'')+'<div style="font-weight:700;margin-top:8px">'+esc(st.pseudo)+'</div><div style="font-family:var(--head);font-size:30px;font-weight:700;color:var(--gold)">'+(d.my===null?'–':d.my+'/5')+'</div><div class="mono" style="color:var(--muted);font-size:10px">'+(d.my_ms?(d.my_ms/1000).toFixed(1)+' s':'')+'</div></div>';
  h+='<div style="font-family:var(--head);font-size:20px;color:var(--muted)">VS</div>';
  h+='<div>'+faceH(d.op,84,done&&w<0?'var(--gold)':'')+'<div style="font-weight:700;margin-top:8px">'+esc(d.op.pseudo)+'</div><div style="font-family:var(--head);font-size:30px;font-weight:700;color:var(--gold)">'+(d.his===null?'?':d.his+'/5')+'</div><div class="mono" style="color:var(--muted);font-size:10px">'+(d.his_ms?(d.his_ms/1000).toFixed(1)+' s':'')+'</div></div></div>';
  var t=done?(w>0?'🏆 Victoire ! +20 XP':w<0?'Défaite… revanche ?':'Égalité parfaite !'):d.my===null?'À toi de jouer !':d.expired?'Ce duel a expiré.':'En attente de '+esc(d.op.pseudo)+'…';
  h+='<h1 class="h1" style="margin:24px 0 8px">'+t+'</h1>';
  if(!done&&d.my!==null&&!d.expired) h+='<div style="font-size:13.5px;color:var(--muted);line-height:1.5">'+esc(d.op.pseudo)+' a 24 h pour jouer. Son score s’affichera ici et dans l’onglet Défis.</div>';
  if(justScore!==undefined) h+='<div class="glass" style="margin-top:16px;padding:12px;font-size:13.5px">+'+justScore*XP_RIGHT+' XP pour tes bonnes réponses</div>';
  h+='<div style="display:flex;flex-direction:column;gap:10px;margin-top:24px">';
  if(d.my===null&&!d.expired) h+='<button class="btn gold" data-sx="duelgo" data-id="'+d.id+'">Jouer maintenant '+IC.arrow+'</button>';
  if(done) h+='<button class="btn gold" data-sx="duelnew" data-id="'+d.op.id+'">⚔️ Revanche</button>';
  h+='<button class="btn ghost" data-sx="toarena">Retour aux défis</button></div></div></div>';
  view.innerHTML=h; if(done&&w>0&&justScore!==undefined) confetti();
}
function duelById(id){ return (ar.du||[]).filter(function(d){ return d.id===id; })[0]; }

/* ---------- Course au sommet (plateau en direct) ---------- */
var rm=null, TOP=20, LIM={choose:20000,answer:25000,reveal:6000};
var SPEC={4:{e:'🚡',n:'Télécabine',to:7},9:{e:'❄️',n:'Avalanche',to:6},12:{e:'🧗',n:'Raccourci',to:15},17:{e:'🕳️',n:'Crevasse',to:14}};
function roomCreate(){
  rpc('mfc_room_create',{p_state:{status:'lobby',players:[],turn:0,phase:'choose',used:[],round:1}}).then(roomOpen).catch(sxErr);
}
function roomJoin(code){ rpc('mfc_room_join',{p_code:code}).then(roomOpen).catch(sxErr); }
function roomJoinSheet(){
  sheet('<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 class="h1" style="font-size:18px">🏔️ Rejoindre un salon</h2><button class="iconbtn" data-close aria-label="Fermer">'+IC.x+'</button></div><form id="rjf"><input id="rji" class="sxinput" maxlength="4" placeholder="CODE" autocapitalize="characters" autocomplete="off" style="text-transform:uppercase;letter-spacing:10px;text-align:center;font-family:var(--head);font-size:24px"><div style="height:14px"></div><button class="btn gold" type="submit">Entrer dans le salon</button></form>');
  var f=document.getElementById('rjf'), i=document.getElementById('rji'); setTimeout(function(){ i.focus(); },300);
  f.addEventListener('submit',function(e){ e.preventDefault(); if(i.value.trim().length!==4) return; f.closest('.sheet').remove(); roomJoin(i.value); });
}
function roomOpen(j){
  roomClose(true);
  rm={code:j.code,v:j.version,s:j.state,me:j.me||(sbSess()||{}).uid,recv:Date.now(),busy:0};
  setNav(false); avUnmount(); drawRoom();
  rm.poll=setInterval(function(){ if(!rm||rm.busy) return; var c=rm.code; rpc('mfc_room_get',{p_code:c,p_version:rm.v}).then(function(x){ if(rm&&rm.code===c) roomApply(x); }).catch(function(){}); },1200);
  rm.tick=setInterval(roomTick,300);
}
function roomClose(silent){ if(!rm) return; clearInterval(rm.poll); clearInterval(rm.tick); rm=null; if(!silent){ tab='arena'; render(); } }
function roomApply(j){ if(!rm||!j||j.same||!j.state) return; if(j.version>rm.v){ rm.v=j.version; rm.s=j.state; rm.recv=Date.now(); drawRoom(); } }
function roomPush(ns){
  if(!rm||rm.busy) return; rm.busy=1; var c=rm.code;
  rpc('mfc_room_act',{p_code:c,p_version:rm.v,p_state:ns}).then(function(j){ if(rm&&rm.code===c){ rm.busy=0; roomApply(j); } },function(e){ if(rm){ rm.busy=0; } sxErr(e); });
}
function cl(o){ return JSON.parse(JSON.stringify(o)); }
function active(s){ return s.players.filter(function(p){ return !p.gone; }); }
function nextTurn(s){
  s.phase='choose'; s.diff=null; s.qid=null; s.pick=null; s.ok=null; s.ev=null; s.tout=0;
  if(active(s).length<2){ s.status='end'; s.winner=(active(s)[0]||{}).id||null; return s; }
  var n=s.players.length, t=s.turn;
  for(var k=1;k<=n;k++){ var c=(t+k)%n; if(!s.players[c].gone){ if(c<=t) s.round=(s.round||1)+1; s.turn=c; break; } }
  return s;
}
function advance(s){ s=cl(s); if(s.winner){ s.status='end'; return s; } return nextTurn(s); }
function pickQ(s,d){
  var pool=Q.filter(function(q){ return DIFF[q.id]===d&&s.used.indexOf(q.id)<0; });
  if(!pool.length){ s.used=[]; pool=Q.filter(function(q){ return DIFF[q.id]===d; }); }
  return pool[Math.floor(Math.random()*pool.length)].id;
}
function resolve(s,oi){
  s=cl(s); var p=s.players[s.turn], q=s.qid?QBY[s.qid]:null;
  s.pick=oi; s.ok=!!(q&&oi===q.a); s.from=p.pos; s.ev=null; s.tout=oi<0?1:0;
  if(s.ok){ var to=Math.min(TOP,p.pos+DN[s.diff][1]); if(SPEC[to]){ s.ev={c:to,to:SPEC[to].to}; to=SPEC[to].to; } p.pos=to; p.miss=0; }
  else if(s.tout){ p.miss=(p.miss||0)+1; if(p.miss>=2) p.gone=true; }
  s.to=p.pos; s.phase='reveal'; if(p.pos>=TOP) s.winner=p.id;
  return s;
}
function roomTick(){
  if(!rm) return;
  var s=rm.s, el=Date.now()-rm.recv, lim=LIM[s.phase]||0, b=document.getElementById('rmbar');
  if(b) b.style.width=Math.max(0,100-el/lim*100)+'%';
  if(s.status!=='play'||rm.busy) return;
  var c=s.players[s.turn], mine=c&&c.id===rm.me;
  if(s.phase==='reveal'){ if((mine&&el>lim)||el>lim+5000) roomPush(advance(s)); }
  else if((mine&&el>lim)||el>lim+5000) roomPush(resolve(s,-1));
}
function roomAct(a,v){
  if(!rm) return; var s=rm.s, c=s.players[s.turn], mine=c&&c.id===rm.me;
  if(a==='start'){ if(s.players.length<2) return; var ns=cl(s); ns.status='play'; ns.players=shuffle(ns.players).map(function(p){ p.pos=0; p.miss=0; p.gone=false; return p; }); ns.turn=0; ns.round=1; ns.used=[]; ns.winner=null; nextTurn(ns); ns.turn=0; ns.round=1; roomPush(ns); }
  else if(a==='diff'&&mine&&s.phase==='choose'){ var n2=cl(s), d=+v; n2.diff=d; n2.qid=pickQ(n2,d); n2.used.push(n2.qid); n2.order=shuffle([0,1,2]); n2.phase='answer'; roomPush(n2); }
  else if(a==='ans'&&mine&&s.phase==='answer'){ var r=resolve(s,+v); buzz(r.ok); if(r.ok) gainXP(DN[r.diff][2]); st.answered++; if(r.ok) st.correct++; save(); roomPush(r); }
}
function roomQuit(){
  if(!rm) return;
  var s=rm.s, inGame=s.status!=='end';
  if(inGame&&!confirm(s.status==='lobby'?'Quitter le salon ?':'Quitter la partie ? Tu seras retiré de la course.')) return;
  if(s.status==='lobby'){ var ns=cl(s); ns.players=ns.players.filter(function(p){ return p.id!==rm.me; }); roomPush(ns); }
  else if(s.status==='play'){ var n2=cl(s), me=n2.players.filter(function(p){ return p.id===rm.me; })[0]; if(me){ me.gone=true; if(n2.players[n2.turn].id===rm.me) n2=advance(n2); else if(active(n2).length<2){ n2.status='end'; n2.winner=(active(n2)[0]||{}).id; } roomPush(n2); } }
  setTimeout(function(){ roomClose(); },300);
}
function cellXY(i){
  if(i>=TOP) return [170,34];
  if(i<=6) return [34+i*(272/6),268];
  if(i<=13) return [306-(i-7)*(272/6),180];
  return [60+(i-14)*(220/5),98];
}
function boardSVG(s){
  var h='<svg class="sxboard" viewBox="0 0 340 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A3F6E"/><stop offset="1" stop-color="#14254A"/></linearGradient></defs>';
  h+='<path d="M0 300 L95 120 L130 160 L170 22 L215 140 L250 105 L340 300 Z" fill="url(#mt)" opacity=".8"/><path d="M152 75 L170 22 L190 82 L178 72 L168 86 L160 72 Z" fill="#E8EEF7" opacity=".85"/>';
  var pts=[]; for(var i=0;i<=TOP;i++) pts.push(cellXY(i).join(','));
  h+='<polyline points="'+pts.join(' ')+'" fill="none" stroke="rgba(212,175,55,.55)" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>';
  for(var j=0;j<=TOP;j++){ var p=cellXY(j), sp=SPEC[j];
    if(j===TOP){ h+='<text x="170" y="40" text-anchor="middle" font-size="26">🚩</text>'; continue; }
    h+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="12" fill="'+(sp?(sp.to>j?'#1F5C45':'#5C2430'):j===0?'#3A2E10':'#0B1428')+'" stroke="'+(sp?(sp.to>j?'#6EC896':'#F08C5A'):'rgba(212,175,55,.6)')+'" stroke-width="1.5"/>';
    h+=sp?'<text x="'+p[0]+'" y="'+(p[1]+5)+'" text-anchor="middle" font-size="13">'+sp.e+'</text>':'<text x="'+p[0]+'" y="'+(p[1]+4)+'" text-anchor="middle" font-size="10" font-weight="700" fill="#C9CED6" font-family="Inter,system-ui">'+(j===0?'🏕':j)+'</text>';
  }
  var at={};
  s.players.forEach(function(pl,k){ if(pl.gone) return; var c=cellXY(pl.pos), n=at[pl.pos]=(at[pl.pos]||0)+1, ox=c[0]+(n-1)%3*12-8, oy=c[1]-22-Math.floor((n-1)/3)*12, col=PCOL[k%6], cur=s.status==='play'&&k===s.turn;
    h+='<g><circle cx="'+ox+'" cy="'+oy+'" r="'+(cur?12:10.5)+'" fill="#0B1428" stroke="'+col+'" stroke-width="'+(cur?3:2)+'"/>';
    if(pl.face) h+='<clipPath id="cp'+k+'"><circle cx="'+ox+'" cy="'+oy+'" r="'+(cur?10.5:9)+'"/></clipPath><image href="'+esc(pl.face)+'" x="'+(ox-11)+'" y="'+(oy-11)+'" width="22" height="22" clip-path="url(#cp'+k+')"/>';
    else h+='<text x="'+ox+'" y="'+(oy+4)+'" text-anchor="middle" font-size="11" font-weight="700" fill="'+col+'" font-family="Inter,system-ui">'+esc((pl.pseudo||'?').charAt(0).toUpperCase())+'</text>';
    h+='</g>'; });
  return h+'</svg>';
}
function drawRoom(){
  if(!rm) return;
  var s=rm.s, me=rm.me, c=s.players[s.turn]||{}, mine=c.id===me, ci=s.players.indexOf(c), L=['A','B','C'];
  var h='<div class="screen noNav"><div class="wrap"><div class="top"><button class="iconbtn" data-sx="rmquit" aria-label="Quitter">'+IC.x+'</button><div style="flex:1;text-align:center" class="mono"><span style="color:var(--gold)">COURSE AU SOMMET</span> · '+esc(rm.code)+'</div><span class="chip">👥 '+active(s).length+'</span></div>';
  if(s.status==='lobby'){
    var host=s.players[0]||{};
    h+='<div class="glass" style="margin-top:18px;padding:18px;text-align:center"><div class="mono" style="color:var(--muted)">CODE DU SALON</div><div class="sxcode">'+esc(rm.code)+'</div><button class="btn ghost" data-sx="rmshare" style="height:44px">Inviter des joueurs</button></div>';
    h+='<div class="mono" style="color:var(--muted);margin:20px 0 10px">JOUEURS · '+s.players.length+'/6</div><div class="glass" style="padding:6px">';
    s.players.forEach(function(p,k){ h+='<div class="sxrow">'+faceH(p,40,PCOL[k%6])+'<span class="n">'+esc(p.pseudo)+(p.id===me?' <span class="mono" style="color:var(--gold);font-size:10px">· TOI</span>':'')+'</span>'+(k===0?'<span class="mono" style="font-size:10px;color:var(--gold)">HÔTE</span>':'')+'</div>'; });
    h+='</div><div class="glass" style="margin-top:14px;padding:14px 16px;font-size:13px;line-height:1.55;color:var(--ink2)"><b>Règles :</b> à ton tour, choisis ta difficulté. Bonne réponse : facile +1 case, moyen +2, difficile +3. Mauvaise réponse : tu restes sur place. Attention aux cases spéciales 🚡🧗 (raccourcis) et ❄️🕳️ (on redescend). Le premier au sommet 🚩 gagne !</div>';
    h+=host.id===me?'<button class="btn gold" data-sx="rmstart" style="margin-top:16px'+(s.players.length<2?';opacity:.5':'')+'" '+(s.players.length<2?'disabled':'')+'>'+(s.players.length<2?'En attente d’un 2<sup>e</sup> joueur…':'Lancer la partie '+IC.arrow)+'</button>':'<div style="text-align:center;color:var(--muted);font-size:13.5px;margin-top:18px">En attente que '+esc(host.pseudo)+' lance la partie…</div>';
  } else if(s.status==='play'){
    h+='<div style="margin-top:12px">'+boardSVG(s)+'</div>';
    h+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">'; s.players.forEach(function(p,k){ h+='<span class="chip" style="font-size:11px;padding:4px 9px 4px 4px;'+(k===s.turn?'box-shadow:inset 0 0 0 1px '+PCOL[k%6]:'')+(p.gone?';opacity:.4':'')+'">'+faceH(p,20,PCOL[k%6])+' '+esc(p.pseudo)+' · '+p.pos+'</span>'; }); h+='</div>';
    h+='<div class="glass" style="padding:16px">';
    h+='<div class="row" style="gap:10px">'+faceH(c,34,PCOL[ci%6])+'<div style="flex:1"><div style="font-weight:700">'+(mine?'À toi de jouer !':esc(c.pseudo))+'</div><div class="mono" style="color:var(--muted);font-size:10px">TOUR '+(s.round||1)+(s.diff?' · '+DN[s.diff][0].toUpperCase()+' (+'+DN[s.diff][1]+')':'')+'</div></div></div>';
    if(s.phase!=='reveal') h+='<div class="sxtime"><i id="rmbar" style="width:100%"></i></div>';
    if(s.phase==='choose'){
      h+=mine?'<div style="font-size:14px;margin-top:8px">Choisis la difficulté de ta question :</div><div class="sxdiff">'+[1,2,3].map(function(d){ return '<button data-sx="rmdiff" data-v="'+d+'">'+DN[d][0]+'<small>+'+DN[d][1]+' CASE'+(d>1?'S':'')+'</small></button>'; }).join('')+'</div>':'<div style="color:var(--muted);font-size:14px;margin-top:10px">'+esc(c.pseudo)+' choisit sa difficulté…</div>';
    } else {
      var q=QBY[s.qid], rev=s.phase==='reveal';
      if(q){ h+='<div style="font-family:var(--head);font-weight:600;font-size:16px;line-height:1.35;margin:12px 0">'+esc(q.q)+'</div>';
        (s.order||[0,1,2]).forEach(function(oi,pos){ var cls='opt'; if(rev) cls=oi===q.a?'opt good':oi===s.pick?'opt bad':'opt dim'; else if(!mine) cls='opt dim';
          h+='<button class="'+cls+'" '+(mine&&!rev?'data-sx="rmans" data-i="'+oi+'"':'disabled')+' style="margin-top:8px"><span class="l">'+(rev&&oi===q.a?IC.check:rev&&oi===s.pick?'✕':L[pos])+'</span><span>'+esc(q.o[oi])+'</span></button>'; });
      }
      if(!rev&&!mine) h+='<div style="color:var(--muted);font-size:13px;margin-top:10px;text-align:center">'+esc(c.pseudo)+' réfléchit…</div>';
      if(rev){
        var msg=s.tout?'⏱️ Temps écoulé : '+esc(c.pseudo)+' reste sur place'+(c.gone?' et quitte la course':''):s.ok?'✅ '+esc(c.pseudo)+' monte à la case '+(s.ev?s.ev.c:s.to):'❌ '+esc(c.pseudo)+' reste sur place';
        if(s.ev){ var sp=SPEC[s.ev.c]; msg+='<br>'+sp.e+' <b>'+sp.n+' !</b> '+(s.ev.to>s.ev.c?'Direct case ':'Retour case ')+s.ev.to; }
        if(s.winner) msg+='<br>🚩 <b>Sommet atteint !</b>';
        h+='<div style="margin-top:12px;font-size:14.5px;line-height:1.5;font-weight:600">'+msg+'</div>';
        if(q){ var src=S[q.s]; h+='<div style="font-size:13px;line-height:1.5;color:var(--ink2);margin-top:8px">'+esc(q.e)+'</div>'+(src?'<span class="src">Source : '+esc(src.t)+'</span>':''); }
      }
    }
    h+='</div>';
  } else {
    var rk=s.players.slice().sort(function(a,b){ return (b.id===s.winner)-(a.id===s.winner)||b.pos-a.pos; }), win=s.players.filter(function(p){ return p.id===s.winner; })[0];
    h+='<div style="text-align:center;margin-top:24px">'+(win?faceH(win,96,'var(--gold)'):'')+'<h1 class="h1" style="margin:16px 0 4px">'+(win?(win.id===me?'🏆 Tu as gagné !':'🏆 '+esc(win.pseudo)+' gagne !'):'Partie terminée')+'</h1><div style="color:var(--muted);font-size:13.5px">'+(win&&win.id===me?'+50 XP bonus':'+15 XP de participation')+'</div></div>';
    h+='<div class="glass" style="margin-top:18px;padding:6px">'; rk.forEach(function(p,i){ h+='<div class="sxrow'+(p.id===me?' me':'')+'"><span class="sxmed">'+medal(i)+'</span>'+faceH(p,36)+'<span class="n">'+esc(p.pseudo)+'</span><span class="v">case '+p.pos+'</span></div>'; }); h+='</div>';
    h+='<div style="display:flex;flex-direction:column;gap:10px;margin-top:20px"><button class="btn gold" data-sx="roomnew">Nouvelle partie '+IC.arrow+'</button><button class="btn ghost" data-sx="rmleave">Retour aux défis</button></div>';
    roomReward(s);
  }
  h+='</div></div>';
  view.innerHTML=h;
}
function roomReward(s){
  st.roomSeen=st.roomSeen||{}; var k=rm.code+':'+s.players.map(function(p){ return p.id.slice(0,4); }).join('');
  if(st.roomSeen[k]||!s.players.some(function(p){ return p.id===rm.me; })) return;
  st.roomSeen[k]=1; var won=s.winner===rm.me; gainXP(won?50:15); if(won) confetti();
}

/* ---------- fiche joueur : signaler, bloquer ---------- */
var ppl={};
function isFriend(id){ return (ar.fl||[]).some(function(f){ return f.id===id; }); }
function playerSheet(id){
  var p=ppl[id]; if(!p) return; var fr=isFriend(id);
  sheet('<div class="row" style="justify-content:flex-end"><button class="iconbtn" data-close aria-label="Fermer">'+IC.x+'</button></div><div style="text-align:center;margin-top:-10px">'+faceH(p,84)+'<h2 class="h1" style="font-size:20px;margin-top:10px">'+esc(p.pseudo)+'</h2><div class="mono" style="color:var(--muted);margin-top:4px">'+rankOf(p.xp||0).r.n.toUpperCase()+' · '+fmt(p.xp||0)+' XP</div></div><div style="display:flex;flex-direction:column;gap:10px;margin-top:18px">'+
    (fr?'<button class="btn gold" data-close data-sx="duelnew" data-id="'+id+'">⚔️ Défier en duel</button><button class="btn ghost" data-sx="unfriend" data-id="'+id+'">Retirer de mes amis</button>':'')+
    '<button class="btn ghost" data-sx="report" data-id="'+id+'">🚩 Signaler</button><button class="btn ghost" data-sx="block" data-id="'+id+'" style="color:var(--bad)">🚫 Bloquer</button></div><div style="font-size:12px;color:var(--muted);text-align:center;margin-top:12px;line-height:1.5">Un joueur bloqué disparaît de tes classements et ne peut plus t’ajouter ni te défier.</div>');
}
function reportSheet(id){
  var p=ppl[id]||{pseudo:'ce joueur'};
  sheet('<div class="row" style="justify-content:space-between;margin-bottom:10px"><h2 class="h1" style="font-size:18px">Signaler '+esc(p.pseudo)+'</h2><button class="iconbtn" data-close aria-label="Fermer">'+IC.x+'</button></div><div style="display:flex;flex-direction:column;gap:8px">'+
    [['pseudo','Pseudo choquant ou insultant'],['avatar','Image de profil inappropriée'],['triche','Triche aux classements'],['autre','Autre comportement']].map(function(r){ return '<button class="btn ghost" data-sx="reportgo" data-id="'+id+'" data-v="'+r[0]+'" style="justify-content:flex-start;padding:0 16px">'+r[1]+'</button>'; }).join('')+
    '</div><div style="font-size:12px;color:var(--muted);margin-top:12px;line-height:1.5">Ton signalement est anonyme pour l’autre joueur. Mathis l’examine et peut suspendre le compte.</div>');
}
function blockedSheet(){
  sheet('<div class="row" style="justify-content:space-between;margin-bottom:10px"><h2 class="h1" style="font-size:18px">Joueurs bloqués</h2><button class="iconbtn" data-close aria-label="Fermer">'+IC.x+'</button></div><div id="blk" style="color:var(--muted);font-size:13px">Chargement…</div>');
  rpc('mfc_blocked',{}).then(function(l){ var el=document.getElementById('blk'); if(!el) return;
    el.innerHTML=l.length?l.map(function(p){ return '<div class="sxrow"><span class="n">'+esc(p.pseudo)+'</span><button class="chip" data-sx="unblock" data-id="'+p.id+'">Débloquer</button></div>'; }).join(''):'Aucun joueur bloqué.';
  }).catch(function(e){ var el=document.getElementById('blk'); if(el) el.textContent=e.message; });
}
function deleteSheet(){
  sheet('<h2 class="h1" style="font-size:18px">Supprimer ton compte de joueur ?</h2><p style="color:var(--muted);font-size:14px;line-height:1.55">Ton pseudo, ton jeton de carte, tes amis, tes duels et ta place dans les classements seront <b style="color:var(--ink)">définitivement supprimés</b> de nos serveurs. Impossible d’annuler.</p><p style="color:var(--muted);font-size:13px;line-height:1.5">Tes leçons et ta progression restent sur ce téléphone. Pour les effacer aussi, utilise « Effacer ma progression ».</p><div style="display:flex;flex-direction:column;gap:10px;margin-top:8px"><button class="btn" data-sx="deletego" style="background:rgba(240,140,90,.15);border:1px solid var(--bad);color:var(--bad)">Oui, supprimer mon compte</button><button class="btn ghost" data-close>Annuler</button></div>');
}
function deleteAccount(btn){
  btn.textContent='Suppression…';
  var done=function(){ sbSave(null); st.pseudo=''; st.soc=null; st.faceH=''; st.duelSeen={}; st.roomSeen={}; save(); ar={kind:'week',fr:false,b:null,fl:null,du:null,load:0}; var s=document.querySelector('.sheet'); if(s) s.remove(); render(); toast('🗑️','Ton compte de joueur a été supprimé.',3000); };
  if(!sbSess()) return done();
  rpc('mfc_delete_me',{}).then(done).catch(function(e){ btn.textContent='Oui, supprimer mon compte'; sxErr(e); });
}

/* ---------- natif : rappels locaux, vibrations ---------- */
var NMSG=[['☀️ Tes 2 minutes de science','Démarre la journée un peu plus cultivé : 5 questions, c’est parti.'],['🧠 Le quiz du jour t’attend','2 minutes pour comprendre un peu mieux ton corps.'],['🔥 Ta série compte sur toi','Un défi de 5 questions et ta série continue.'],['💪 Petit entraînement… de cerveau','Tes 2 minutes de quiz avant le café ?'],['✅ Nouvelle mission du jour','Une action simple, prouvée par la science. Viens la découvrir.'],['⚡ 2 minutes, 50 XP à prendre','Ton défi du jour est prêt.']];
function nativeSchedule(){
  var LN=plug('LocalNotifications'); if(!LN) return Promise.resolve();
  return LN.getPending().then(function(r){ var ids=(r.notifications||[]).map(function(n){ return {id:n.id}; }); return ids.length?LN.cancel({notifications:ids}):null; }).then(function(){
    if(!st.notif.on) return;
    var p=st.notif.time.split(':'), now=new Date(), list=[];
    for(var d=0;d<30;d++){
      var t=new Date(now.getFullYear(),now.getMonth(),now.getDate()+d,+p[0],+p[1],0);
      if(t<=now) continue; if(d===0&&st.lastDaily===today()) continue;
      var m=NMSG[(t.getDate()+d)%NMSG.length]; list.push({id:100+d,title:m[0],body:m[1],schedule:{at:t,allowWhileIdle:true}});
    }
    return LN.schedule({notifications:list});
  }).catch(function(){});
}
function nativeEnable(time,cb){
  var LN=plug('LocalNotifications'); st.notif.time=time; save();
  LN.requestPermissions().then(function(r){
    if(r.display!=='granted'){ st.notif.on=0; save(); cb('denied'); return; }
    st.notif.on=1; save(); nativeSchedule(); cb('ok');
  }).catch(function(){ cb('denied'); });
}
function buzz(ok){ var H=plug('Haptics'); if(!H) return; try{ if(ok) H.impact({style:'MEDIUM'}); else H.notification({type:'ERROR'}); }catch(e){} }

/* ---------- Prépa STAPS & BPJEPS ---------- */
var PP=window.MFC_PREPA||{tracks:[]}, ppNav={t:'staps',s:null,c:null};
(function(){ var PS=window.MFC_PREPA_SOURCES||{}; for(var k in PS) S[k]=PS[k];
  PP.tracks.forEach(function(t){ t.subjects.forEach(function(sb){ (sb.chapters||[]).forEach(function(c){ c.qs.forEach(function(q){ QBY[q.id]=q; }); }); }); }); })();
function ppSt(){ if(!st.pp) st.pp={m:{},best:{},ex:{}}; return st.pp; }
function ppTrack(id){ return PP.tracks.filter(function(t){ return t.id===id; })[0]; }
function ppSubj(tid,sid){ var t=ppTrack(tid), sb=t&&t.subjects.filter(function(x){ return x.id===sid; })[0]; if(sb&&sb.ref){ var r=ppTrack(sb.ref).subjects.filter(function(x){ return x.id===sb.id; })[0]; return Object.assign({},r,{name:sb.name}); } return sb; }
function ppIds(sb){ var a=[]; (sb.chapters||[]).forEach(function(c){ c.qs.forEach(function(q){ a.push(q.id); }); }); return a; }
function ppProg(ids){ var m=ppSt().m, n=ids.filter(function(i){ return m[i]; }).length; return {n:n,t:ids.length,p:ids.length?Math.round(n/ids.length*100):0}; }
function ppHead(kicker,title,back){ return '<div class="top"><button class="iconbtn" data-sx="'+back+'" aria-label="Retour">'+IC.back+'</button><span></span>'+(isPrem()?'<span class="chip" style="color:var(--gold);font-size:11px">👑 Premium</span>':'<button class="chip" data-sx="premium" style="color:var(--gold);font-size:11px">👑 Débloquer</button>')+'</div><div class="mono" style="color:var(--gold);margin-top:14px">'+kicker+'</div><h1 class="h1" style="margin-top:4px">'+title+'</h1>'; }
function prepaView(){
  setNav(false); avUnmount(); ppNav.s=null; ppNav.c=null;
  var h='<div class="screen noNav"><div class="wrap">'+ppHead('PRÉPA EXAMENS','Prépa STAPS & BPJEPS','ppclose');
  h+='<div style="font-size:13.5px;color:var(--muted);line-height:1.5;margin-top:6px">Des quiz par matière et un examen blanc noté sur 20, construits à partir de manuels de référence. Chaque bonne réponse rapporte de l’XP.</div>';
  h+='<div class="seg2" style="margin-top:16px">'+PP.tracks.map(function(t){ return '<button data-sx="pptrack" data-v="'+t.id+'" class="'+(ppNav.t===t.id?'on':'')+'">'+t.e+' '+t.name+'</button>'; }).join('')+'</div>';
  var t=ppTrack(ppNav.t); h+='<div style="font-size:12.5px;color:var(--silver);margin:10px 2px 4px">'+esc(t.desc)+'</div><div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">';
  t.subjects.forEach(function(x){ var sb=ppSubj(t.id,x.id);
    if(!sb||sb.soon){ h+='<div class="glass" style="padding:14px 16px;display:flex;gap:12px;align-items:center;opacity:.6"><span style="font-size:28px">'+x.e+'</span><div style="flex:1"><b>'+esc(x.name)+'</b><div style="font-size:12px;color:var(--muted)">'+esc(x.desc)+'</div></div><span class="chip" style="font-size:10.5px">Bientôt</span></div>'; return; }
    var pr=ppProg(ppIds(sb)), best=ppSt().best[sb.id];
    h+='<button class="goldcard" data-sx="ppsub" data-id="'+x.id+'" style="padding:14px 16px;display:flex;gap:12px;align-items:center;width:100%;text-align:left"><span style="font-size:30px">'+x.e+'</span><div style="flex:1"><b style="font-size:16px">'+esc(x.name)+'</b><div style="font-size:12px;color:var(--muted)">'+esc(x.desc)+' · '+sb.chapters.length+' chapitres</div><div class="bar" style="height:6px;margin-top:8px"><i style="width:'+pr.p+'%"></i></div><div class="mono" style="font-size:10px;color:var(--gold);margin-top:5px">'+pr.n+'/'+pr.t+' MAÎTRISÉES'+(best!==undefined?' · EXAMEN BLANC : '+String(best).replace('.',',')+'/20':'')+'</div></div>'+IC.arrow+'</button>';
  });
  h+='</div><div style="font-size:11.5px;color:var(--muted);text-align:center;margin-top:16px;line-height:1.5">Contenu basé sur le socle commun des programmes. Les programmes varient selon les universités et les organismes de formation : vérifie toujours avec tes cours.</div><div style="height:24px"></div></div></div>';
  view.innerHTML=h;
}
function ppSubView(){
  var sb=ppSubj(ppNav.t,ppNav.s), pr=ppProg(ppIds(sb)), best=ppSt().best[sb.id];
  var h='<div class="screen noNav"><div class="wrap">'+ppHead(ppTrack(ppNav.t).name.toUpperCase()+' · '+pr.p+' %',sb.e+' '+esc(sb.name),'ppback');
  h+='<div style="display:flex;flex-direction:column;gap:10px;margin-top:16px">';
  sb.chapters.forEach(function(c,i){ var cp=ppProg(c.qs.map(function(q){ return q.id; })), open=isPrem()||c.free;
    h+='<button class="glass" data-sx="ppch" data-id="'+c.id+'" style="padding:14px 16px;display:flex;gap:12px;align-items:center;width:100%;text-align:left"><span class="mono" style="width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:'+(cp.p===100?'var(--gold);color:#070D1C':'rgba(255,255,255,.06)')+';font-size:12px;flex-shrink:0">'+(cp.p===100?'✓':i+1)+'</span><div style="flex:1"><b style="font-size:14.5px">'+esc(c.t)+'</b><div class="mono" style="font-size:10px;color:var(--muted);margin-top:3px">'+c.qs.length+' QUESTIONS · '+cp.n+'/'+cp.t+' MAÎTRISÉES'+(c.free&&!isPrem()?' · <span style="color:var(--good)">GRATUIT</span>':'')+'</div></div>'+(open?IC.arrow:'🔒')+'</button>'; });
  h+='</div>';
  h+='<div class="goldcard" style="margin-top:18px;padding:16px"><div class="row" style="justify-content:space-between"><div><div class="mono" style="color:var(--gold);font-size:10px">EXAMEN BLANC</div><div style="font-size:16px;font-weight:700;margin-top:4px">20 questions · 30 s chacune</div><div style="font-size:12.5px;color:var(--muted);margin-top:2px">Note sur 20 · +50 XP la 1re fois que tu as la moyenne</div></div><div style="text-align:right"><div class="mono" style="color:var(--muted);font-size:10px">RECORD</div><div style="font-family:var(--head);font-size:22px;font-weight:700;color:var(--gold)">'+(best!==undefined?String(best).replace('.',','):'–')+'<span style="font-size:12px;color:var(--muted)">/20</span></div></div></div><button class="btn gold" data-sx="ppexam" style="margin-top:12px">'+(isPrem()?'Passer l’examen blanc '+IC.arrow:'🔒 Réservé à Premium')+'</button></div>';
  h+='<div style="height:24px"></div></div></div>'; view.innerHTML=h;
}
function ppChView(){
  var sb=ppSubj(ppNav.t,ppNav.s), c=sb.chapters.filter(function(x){ return x.id===ppNav.c; })[0];
  var h='<div class="screen noNav"><div class="wrap">'+ppHead(esc(sb.name).toUpperCase()+' · FICHE',esc(c.t),'ppsubback');
  h+='<div class="glass" style="margin-top:16px;padding:16px;display:flex;flex-direction:column;gap:12px">'+c.k.map(function(k){ return '<div style="display:flex;gap:10px;font-size:14.5px;line-height:1.55"><span style="color:var(--gold)">◆</span><span>'+esc(k)+'</span></div>'; }).join('')+'</div>';
  var src=S[c.qs[0].s]; if(src) h+='<span class="src" style="display:block;margin-top:12px;font-size:12px;line-height:1.5;color:var(--muted)">Source : '+esc(src.t)+'<br><a href="'+src.u+'" target="_blank" rel="noopener">Ouvrir le chapitre '+IC.ext+'</a></span>';
  h+='<button class="btn gold" data-sx="ppquiz" style="margin-top:18px">Quiz du chapitre · '+c.qs.length+' questions '+IC.arrow+'</button><div style="height:24px"></div></div></div>';
  view.innerHTML=h;
}
function ppOpenCh(id){
  var sb=ppSubj(ppNav.t,ppNav.s), c=sb.chapters.filter(function(x){ return x.id===id; })[0];
  if(!isPrem()&&!c.free){ paywall('prepa'); return; }
  ppNav.c=id; ppChView();
}
function ppQuiz(){
  var sb=ppSubj(ppNav.t,ppNav.s), c=sb.chapters.filter(function(x){ return x.id===ppNav.c; })[0];
  runQs(shuffle(c.qs.map(function(q){ return q.id; })),{title:esc(sb.name).toUpperCase(),timer:0,done:function(sc){ ppResult(sc,c.qs.length,false); }});
}
function ppExam(){
  if(!isPrem()){ paywall('prepa'); return; }
  var sb=ppSubj(ppNav.t,ppNav.s), ids=shuffle(ppIds(sb)).slice(0,20);
  runQs(ids,{title:'EXAMEN BLANC · '+esc(sb.name).toUpperCase(),timer:30000,done:function(sc){ ppResult(sc,ids.length,true); }});
}
function ppResult(sc,n,exam){
  var sb=ppSubj(ppNav.t,ppNav.s), P=ppSt(), note=Math.round(sc/n*40)/2, bonus=0, rec=false;
  if(exam){ var b=P.best[sb.id]; if(b===undefined||note>b){ P.best[sb.id]=note; rec=b!==undefined; } if(note>=10&&!P.ex[sb.id]){ P.ex[sb.id]=1; bonus=50; gainXP(50); } save(); }
  var ment=note>=16?'Très bien':note>=14?'Bien':note>=12?'Assez bien':note>=10?'Passable':'Insuffisant';
  var h='<div class="screen noNav"><div class="wrap" style="text-align:center;padding-top:24px"><div class="mono" style="color:var(--gold)">'+(exam?'EXAMEN BLANC · '+esc(sb.name).toUpperCase():'QUIZ DU CHAPITRE')+'</div>';
  h+=exam?'<div style="font-family:var(--head);font-size:64px;font-weight:700;margin-top:18px;color:'+(note>=10?'var(--gold)':'var(--bad)')+'">'+String(note).replace('.',',')+'<span style="font-size:24px;color:var(--muted)">/20</span></div><div style="font-size:18px;font-weight:700">'+ment+(rec?' · nouveau record !':'')+'</div>':'<div style="font-family:var(--head);font-size:56px;font-weight:700;margin-top:18px">'+sc+'/'+n+'</div><div style="font-size:16px;color:var(--muted)">bonnes réponses</div>';
  h+='<div class="glass" style="margin-top:20px;padding:14px;font-size:14px">+'+(sc*XP_RIGHT+bonus)+' XP'+(bonus?' (dont +50 : première moyenne à l’examen)':'')+'</div>';
  h+='<div style="display:flex;flex-direction:column;gap:10px;margin-top:22px">'+(exam?'<button class="btn gold" data-sx="ppexam">Repasser l’examen '+IC.arrow+'</button>':'<button class="btn gold" data-sx="ppquiz">Refaire le quiz '+IC.arrow+'</button>')+'<button class="btn ghost" data-sx="ppsubback">Retour à la matière</button></div></div></div>';
  view.innerHTML=h; if(exam&&note>=10) confetti();
}

/* ---------- formule gratuite / Premium ---------- */
var TESTER_CODES=['MFC-TESTEUR'];
function isPrem(){ return !!(st.prem&&st.prem.on); }
function fq(){ var t=today(); if(!st.fq||st.fq.d!==t){ st.fq={d:t,les:null,quiz:0,rev:0}; } return st.fq; }
function canLesson(id){
  if(isPrem()||lDone(id)) return true;
  var f=fq(); if(!f.les||f.les===id){ f.les=id; save(); return true; }
  paywall('lesson'); return false;
}
function canQuiz(kind,mod){
  if(isPrem()) return true;
  var f=fq();
  if(kind==='lesson'&&(f.les===mod||(!f.les&&!lDone(mod)))){ f.les=mod; save(); return true; }
  if(kind==='rev'){ if(f.rev<1){ f.rev++; save(); return true; } paywall('rev'); return false; }
  if(f.quiz<1){ f.quiz++; save(); return true; }
  paywall('quiz'); return false;
}
function paywall(why){
  var t={prepa:'La Prépa STAPS & BPJEPS complète est réservée à Premium.',lesson:'Tu as déjà commencé ta leçon du jour.',quiz:'Tu as utilisé ton quiz gratuit du jour.',rev:'Tu as utilisé ta révision gratuite du jour.'}[why]||'';
  sheet('<div style="text-align:center"><div style="font-size:44px">👑</div><h2 class="h1" style="font-size:20px;margin-top:6px">'+t+'</h2><p style="color:var(--muted);font-size:14px;line-height:1.55">En version gratuite, tu as <b style="color:var(--ink)">1 leçon, 1 quiz et 1 révision par jour</b>. Les duels et la Course au sommet restent illimités.<br>Reviens demain, ou passe à <b style="color:var(--gold)">MFC Premium</b> pour tout débloquer.</p></div><div style="display:flex;flex-direction:column;gap:10px;margin-top:10px"><button class="btn gold" data-close data-sx="premium">Découvrir Premium '+IC.arrow+'</button><button class="btn ghost" data-close data-sx="toarena">Jouer aux Défis</button><button class="btn ghost" data-close>Revenir demain</button></div>');
}
function premiumView(){
  setNav(false); avUnmount();
  var on=isPrem(), h='<div class="screen noNav"><div class="wrap"><div class="top"><button class="iconbtn" data-sx="premclose" aria-label="Fermer">'+IC.x+'</button><span></span><span></span></div>';
  h+='<div style="text-align:center;margin-top:6px"><div style="font-size:48px">👑</div><div class="mono" style="color:var(--gold)">MFC PREMIUM</div><h1 class="h1" style="font-size:26px;margin-top:6px">Apprends sans limite.<br>Gagne de vraies récompenses.</h1></div>';
  if(on) h+='<div class="goldcard" style="margin-top:18px;padding:14px 16px;text-align:center;font-weight:700">✅ Premium actif sur ce téléphone'+(st.prem.code?'<div style="font-size:12px;font-weight:500;color:var(--muted);margin-top:4px">Accès testeur offert par Mathis</div>':'')+'</div>';
  // offres
  if(!on){
    h+='<div style="display:flex;flex-direction:column;gap:10px;margin-top:20px">';
    h+='<button class="goldcard" data-sx="premwant" data-v="annuel" style="padding:16px;text-align:left;position:relative;width:100%"><span class="pill" style="position:absolute;top:-9px;right:14px">–40 %</span><div class="row" style="justify-content:space-between"><b style="font-size:17px">Annuel</b><b style="font-size:17px;color:var(--gold)">34,99 €<span style="font-size:12px;color:var(--muted);font-weight:500"> / an</span></b></div><div style="font-size:12.5px;color:var(--muted);margin-top:4px">Soit 2,92 € par mois · 7 jours d’essai gratuit</div></button>';
    h+='<button class="glass" data-sx="premwant" data-v="mensuel" style="padding:16px;text-align:left;width:100%"><div class="row" style="justify-content:space-between"><b style="font-size:17px">Mensuel</b><b style="font-size:17px">4,99 €<span style="font-size:12px;color:var(--muted);font-weight:500"> / mois</span></b></div><div style="font-size:12.5px;color:var(--muted);margin-top:4px">Sans engagement</div></button>';
    h+='</div><div style="text-align:center;font-size:12.5px;color:var(--muted);margin-top:10px;line-height:1.5">L’abonnement arrive bientôt. Touche l’offre qui t’intéresse pour être prévenu(e) en priorité.</div>';
  }
  // comparatif
  h+='<div class="glass" style="margin-top:22px;padding:6px 16px"><div class="row" style="justify-content:space-between;padding:10px 0;font-size:11px" ><span class="mono" style="color:var(--muted)">CE QUI EST INCLUS</span><span class="mono" style="display:flex;gap:16px"><span style="color:var(--muted);width:52px;text-align:center">GRATUIT</span><span style="color:var(--gold);width:58px;text-align:center">PREMIUM</span></span></div>';
  [['Leçons','1 / jour','Illimitées'],['Quiz','1 / jour','Illimités'],['Révisions','1 / jour','Illimitées'],['Duels & Course au sommet','Illimités','Illimités'],['Podium & classements','✓','✓'],['Carte d’athlète & ses 7 éditions','✓','✓'],['Prépa STAPS L1 & BPJEPS','1 chapitre','✓ + examens blancs'],['Examens & certificats','–','✓ bientôt'],['Récompenses réelles','–','✓ bientôt']].forEach(function(r){ h+='<div class="row" style="justify-content:space-between;padding:10px 0;border-top:1px solid var(--line);font-size:13.5px"><span style="flex:1">'+r[0]+'</span><span style="display:flex;gap:16px;font-size:12px;text-align:center"><span style="width:52px;color:var(--muted)">'+r[1]+'</span><span style="width:58px;color:var(--gold);font-weight:700">'+r[2]+'</span></span></div>'; });
  h+='</div>';
  // récompenses
  h+='<div class="mono" style="color:var(--muted);margin:24px 0 10px">LES RÉCOMPENSES</div><div style="display:flex;flex-direction:column;gap:10px">';
  [['🎖️','Dès aujourd’hui','Une nouvelle carte d’athlète à chaque palier, de Bronze à Icône MFC, et le podium de la semaine partagé en story par Mathis.',0],
   ['🎬','Carte Élite (niveau 45)','Ta question traitée par Mathis dans un Reel, avec mention de ton pseudo.',1],
   ['💊','Bientôt : compléments alimentaires','Des produits et codes de réduction de marques partenaires pour les meilleurs joueurs Premium.',1],
   ['👕','Bientôt : vêtements MFC','Tee-shirts et sweats MFC à gagner avec les cartes les plus rares et lors des événements.',1],
   ['🏆','Bientôt : lots du podium','Chaque semaine, un lot pour le n° 1 du podium Premium.',1],
   ['🧠','Bientôt : coaching avec Mathis','Une séance de coaching offerte aux cartes Légende.',1]].forEach(function(r){ h+='<div class="glass" style="padding:14px 16px;display:flex;gap:12px;align-items:flex-start"><span style="font-size:28px;line-height:1">'+r[0]+'</span><div><b style="font-size:14.5px">'+r[1]+'</b><div style="font-size:12.5px;color:var(--muted);line-height:1.5;margin-top:2px">'+r[2]+'</div></div></div>'; });
  h+='</div><div style="font-size:11.5px;color:var(--muted);line-height:1.5;margin-top:12px;text-align:center">Les récompenses « bientôt » arrivent progressivement, selon les partenariats. Leur règlement sera publié avant leur lancement.</div>';
  // code testeur
  if(!on) h+='<form id="tcf" style="margin-top:22px;display:flex;gap:8px"><input id="tci" class="sxinput" placeholder="Code testeur" autocapitalize="characters" autocomplete="off" style="height:46px;font-size:15px;text-transform:uppercase"><button class="btn ghost" type="submit" style="width:auto;height:46px;padding:0 16px">OK</button></form>';
  h+='<div style="height:30px"></div></div></div>';
  view.innerHTML=h;
  var f=document.getElementById('tcf');
  if(f) f.addEventListener('submit',function(e){ e.preventDefault(); var v=document.getElementById('tci').value.trim().toUpperCase();
    if(TESTER_CODES.indexOf(v)>=0){ st.prem={on:1,code:v,d:today()}; save(); confetti(); toast('👑','Premium activé, merci de tester MFC Quiz !',2800); premiumView(); }
    else toast('❌','Code invalide',2000); });
}
function premWant(plan){
  st.premWant=plan; save();
  rpc('mfc_interest',{p_plan:plan}).catch(function(){});
  toast('🔔','C’est noté ! Tu seras prévenu(e) dès que Premium sera disponible.',3000);
}

/* ---------- actions ---------- */
document.getElementById('app').addEventListener('click',function(e){
  var b=e.target.closest('[data-sx]'); if(!b) return;
  var a=b.dataset.sx, id=b.dataset.id;
  if(b.hasAttribute('data-close')){ var shx=b.closest('.sheet'); if(shx) shx.remove(); }
  if(a==='activate'||a==='pseudo') pseudoSheet();
  else if(a==='retry') loadArena();
  else if(a==='kind'){ ar.kind=b.dataset.v; reloadBoard(); }
  else if(a==='fr'){ ar.fr=!ar.fr; reloadBoard(); }
  else if(a==='last') lastSheet();
  else if(a==='addfr') addFriendSheet();
  else if(a==='sharecode'){ var cd=(st.soc||{}).code; if(cd) shareLink(APP_URL+'?ami='+cd,'Ajoute-moi sur MFC Quiz et viens me défier ! Mon code : '+cd); }
  else if(a==='ranks'){ tab='rank'; render(); }
  else if(a==='duelnew') duelNew(id);
  else if(a==='duel'){ var d=duelById(id); if(!d) return; if(d.my===null&&!d.expired) duelPlay(d); else duelView(d); }
  else if(a==='duelgo'){ var d2=duelById(id); if(d2) duelPlay(d2); }
  else if(a==='toarena'){ tab='arena'; render(); }
  else if(a==='rqpick') rqPick(+b.dataset.i);
  else if(a==='rqtog'){ if(!rq||rq.picked!==null) return; rq.sel=rq.sel||[]; var ti=+b.dataset.i, k=rq.sel.indexOf(ti); if(k<0) rq.sel.push(ti); else rq.sel.splice(k,1); var keep=Date.now()-rq.t0; drawRq(); rq.t0=Date.now()-keep; }
  else if(a==='rqval'){ if(rq&&(rq.sel||[]).length) rqPick(-2); }
  else if(a==='rqnext'){ if(rq.i<rq.qs.length-1){ rq.i++; rq.picked=null; rq.sel=[]; drawRq(); } else rqEnd(); }
  else if(a==='rqquit'){ if(confirm('Abandonner ? Tes réponses actuelles seront comptées.')) rqEnd(); }
  else if(a==='roomnew'){ if(rm) roomClose(true); roomCreate(); }
  else if(a==='roomjoin') roomJoinSheet();
  else if(a==='rmshare') shareLink(APP_URL+'?salon='+rm.code,'Rejoins ma Course au sommet sur MFC Quiz ! Code du salon : '+rm.code);
  else if(a==='rmstart') roomAct('start');
  else if(a==='rmdiff') roomAct('diff',b.dataset.v);
  else if(a==='rmans') roomAct('ans',b.dataset.i);
  else if(a==='rmquit') roomQuit();
  else if(a==='rmleave') roomClose();
  else if(a==='player') playerSheet(id);
  else if(a==='report'){ var s1=b.closest('.sheet'); if(s1) s1.remove(); reportSheet(id); }
  else if(a==='reportgo'){ rpc('mfc_report',{p_id:id,p_reason:b.dataset.v}).then(function(){ var s2=b.closest('.sheet'); if(s2) s2.remove(); toast('🚩','Merci, ton signalement a été envoyé.',2600); }).catch(sxErr); }
  else if(a==='block'){ if(!confirm('Bloquer ce joueur ?')) return; rpc('mfc_block',{p_id:id}).then(function(){ var s3=b.closest('.sheet'); if(s3) s3.remove(); toast('🚫','Joueur bloqué.',2200); if(tab==='arena') loadArena(); }).catch(sxErr); }
  else if(a==='unblock'){ rpc('mfc_unblock',{p_id:id}).then(function(){ var s4=b.closest('.sheet'); if(s4) s4.remove(); blockedSheet(); }).catch(sxErr); }
  else if(a==='unfriend'){ if(!confirm('Retirer ce joueur de tes amis ?')) return; rpc('mfc_remove_friend',{p_id:id}).then(function(){ var s5=b.closest('.sheet'); if(s5) s5.remove(); loadArena(); }).catch(sxErr); }
  else if(a==='blocked') blockedSheet();
  else if(a==='premium') premiumView();
  else if(a==='prepa') prepaView();
  else if(a==='ppclose'){ tab='home'; render(); }
  else if(a==='pptrack'){ ppNav.t=b.dataset.v; prepaView(); }
  else if(a==='ppsub'){ ppNav.s=id; ppSubView(); }
  else if(a==='ppback') prepaView();
  else if(a==='ppsubback') ppSubView();
  else if(a==='ppch') ppOpenCh(id);
  else if(a==='ppquiz') ppQuiz();
  else if(a==='ppexam') ppExam();
  else if(a==='premclose'){ tab=tab==='arena'?'arena':(tab||'home'); render(); }
  else if(a==='premwant') premWant(b.dataset.v);
  else if(a==='delacc') deleteSheet();
  else if(a==='deletego') deleteAccount(b);
});
(function(){
  try{ var u=new URLSearchParams(location.search), am=u.get('ami'), sa=u.get('salon');
    if(am||sa){ st.pend={ami:am?am.toUpperCase().slice(0,6):null,salon:sa?sa.toUpperCase().slice(0,4):null}; save(); history.replaceState(null,'',APP_URL); }
  }catch(e){}
})();
function bootSocial(){
  if(st.pend&&st.onboarded){ tab='arena'; }
  if(NATIVE){ nativeSchedule(); document.addEventListener('visibilitychange',function(){ if(!document.hidden) nativeSchedule(); }); }
  if(st.pseudo&&navigator.onLine) sbSync().then(function(){ pendingLinks(); }).catch(function(){});
}
/* ==/SOCIAL== */

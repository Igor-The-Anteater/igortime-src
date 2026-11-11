/* Igor Time — messages from the admins (every signed-in player) and the admins' panel (admins only).
   Loaded by chat.js after sign-in:  import('/staff.js').then(M=>M.init(user))  with user = {uid, nick, admin}.
   Firestore: inbox/<uid>/m/<id> {t, by, byNick, at, rd}; accts/<uid> {nick, email, prov, made, seen}; pres/<device>; susp/<uid>.
   See the Firestore rules "Amministrazione". */
import{initializeApp,getApps,getApp}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import{getFirestore,collection,query,where,orderBy,limit,getDocs,getDoc,doc,setDoc,updateDoc,deleteDoc,onSnapshot,serverTimestamp,Timestamp}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
const CFG={apiKey:"AIzaSyBcUoKJT0s_kHpydzjr5qIsxh5AXTurw-0",authDomain:"igortime-f69b3.firebaseapp.com",projectId:"igortime-f69b3",storageBucket:"igortime-f69b3.firebasestorage.app",messagingSenderId:"191774217559",appId:"1:191774217559:web:1604f911cbb70652321a12"};
const app=getApps().length?getApp():initializeApp(CFG),db=getFirestore(app);
let LANG='en';try{LANG=localStorage.getItem('igortime_lang')||((navigator.language||'').toLowerCase().startsWith('it')?'it':'en')}catch(e){}
const tt=(en,it)=>LANG==='it'?it:en;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ms=t=>t&&t.toMillis?t.toMillis():(typeof t==='number'?t:0);
const $=id=>document.getElementById(id);
const sfx=n=>{if(window.IgorSound)try{window.IgorSound.sfx(n)}catch(e){}};
const EVOPT=[['storm','⛈',['Storm','Temporale']],['hail','🧊',['Hail','Grandine']],['frost','❄',['Frost','Gelata']],['heat','☀',['Heatwave','Ondata di caldo']],['birds','🐦',['Sparrows','Passeri']],['tune','🌧',['Out-of-tune rain','Pioggia scordatrice']],['wind','🌪',['Piece-snatching tempest','Tempesta ruba-pezzi']],['surge','🌊',['Storm surge','Mareggiata']],['drizzle','🌦',['Drizzle','Pioggerella']],['stray','👋',['Stray Igorlet','Igorlet randagio']],['ufo:m','🛸',['Aliengor UFO · melody','UFO dell’Aliengor · melodia']],['ufo:d','🛸',['Aliengor UFO · drums','UFO dell’Aliengor · batteria']]];
const LEADS=[[0,['now','subito']],[5,['in 5 min','tra 5 min']],[30,['in 30 min','tra 30 min']],[120,['in 2 h','tra 2 h']]];
const evNm=k=>{const o=EVOPT.find(x=>x[0]===k);return o?o[1]+' '+tt(o[2][0],o[2][1]):String(k)};
const leadNm=m=>{const o=LEADS.find(x=>x[0]===m);return o?tt(o[1][0],o[1][1]):tt(`in ${m} min`,`tra ${m} min`)};
const evForm=id=>`<div class="gift"><select id="${id}K">${EVOPT.map(([k,i,n])=>`<option value="${k}">${i} ${esc(tt(n[0],n[1]))}</option>`).join('')}</select><select id="${id}L">${LEADS.map(([m,n])=>`<option value="${m}">${tt(n[0],n[1])}</option>`).join('')}</select></div>`;
const evGift=(k,lead)=>({k:'veh',n:lead+1,v:'ev:'+k,msg:'',by:ME.uid,byNick:ME.nick||'',at:serverTimestamp(),st:'new',tk:0});
let GEV=null;
async function loadGev(){try{const s=await getDocs(query(collection(db,'gev'),orderBy('at','desc'),limit(10)));GEV=s.docs.map(d=>({id:d.id,...d.data(),at:ms(d.data().at)}))}catch(e){console.warn('gev',e);GEV=false}}
function eventsV(b){b.innerHTML=`<h4>⚡ ${tt('Force an event','Forza un evento')}</h4>${evForm('admE')}<div class="acts"><button class="go" data-a="gev">🌍 ${tt('For everyone','Per tutti')}</button><button data-a="evme">🙋 ${tt('Only on me','Solo su di me')}</button></div>
 <p class="mute">${tt('It starts as soon as each player is on the island (right away for who is there), at any hour. “For everyone” stays valid for 3 days: who comes later still gets it. For a single player, open their account.','Parte appena ogni giocatore è sull’isola (subito per chi c’è), a qualunque ora. “Per tutti” vale 3 giorni: chi arriva dopo lo riceve lo stesso. Per un solo giocatore, apri il suo account.')}</p>
 <h4>${tt('Sent to everyone','Mandati a tutti')}</h4><div id="admGev"><p class="mute">${tt('Loading…','Carico…')}</p></div>`;loadGev().then(drawGev)}
function drawGev(){const e=$('admGev');if(!e)return;if(GEV===false){e.innerHTML=`<p>${tt('Cannot read the events: the Firestore rule “gev” is missing.','Non riesco a leggere gli eventi: manca la regola Firestore “gev”.')}</p>`;return}if(!GEV||!GEV.length){e.innerHTML=`<p class="mute">${tt('None yet.','Ancora nessuno.')}</p>`;return}
 e.innerHTML=GEV.map(g=>{const live=g.st!=='cancel'&&Date.now()-g.at<3*864e5;return`<div class="sent"><b>${esc(evNm(g.k))}</b> · ${esc(leadNm(g.lead|0))}<small>${esc(fmtTime(g.at))}${g.byNick?' · '+esc(g.byNick):''} · ${g.st==='cancel'?tt('stopped','fermato'):live?tt('active','attivo'):tt('expired','scaduto')}</small>${live?`<div style="margin-top:5px"><button class="no" data-a="ungev" data-id="${esc(g.id)}">${tt('Stop it for who hasn’t got it yet','Fermalo per chi non l’ha ancora ricevuto')}</button></div>`:''}</div>`}).join('')}
const BOARDS=['abyss',...['kitchen','window','bedroom','drums','pitch','cadences'].flatMap(g=>['easy','medium','extreme'].map(l=>`b_${g}_${l}`)),'b_island_all'];

const st=document.createElement('style');st.textContent=`
.igs{font:500 15px/1.35 'Fredoka','Trebuchet MS',system-ui,sans-serif;color:#2b2018}.igs *{box-sizing:border-box}
.igs button{font:inherit;color:#2b2018;background:#fff8e8;border:2px solid #2b2018;border-radius:999px;padding:6px 12px;cursor:pointer;box-shadow:0 2px 0 #2b2018;letter-spacing:0;text-transform:none;-webkit-tap-highlight-color:transparent}
.igs button:active{transform:translateY(1px);box-shadow:0 1px 0 #2b2018}.igs button:disabled{opacity:.45;cursor:default}.igs button.go{background:#9be38a}.igs button.no{background:#ffd2c8}
#igNote{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(20,14,8,.45)}#igNote[hidden]{display:none}
#igNote .card{width:min(420px,100%);max-height:85vh;overflow:auto;background:#fbf3e1;border:3px solid #2b2018;border-radius:22px;box-shadow:0 6px 0 #2b2018;padding:16px 16px 14px;animation:igsIn .22s ease-out}
#igNote h3{margin:0 0 4px;font:600 21px/1.15 'Fredoka',system-ui,sans-serif}#igNote .from{color:#7a6650;font-size:13px;margin-bottom:10px}
#igNote .txt{background:#fff;border:2.5px solid #2b2018;border-radius:16px;padding:10px 13px;white-space:pre-wrap;word-wrap:break-word;margin-bottom:12px}
#igNote .ft{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}#igNote small{color:#7a6650;font-size:12.5px}
@keyframes igsIn{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}
#admB{display:flex;align-items:center;justify-content:center;padding:6px 9px;position:relative}#admB svg{width:21px;height:21px;display:block}@media (max-width:480px){#admB{padding:5px 6px!important}#admB svg{width:18px;height:18px}}
#adm{position:fixed;z-index:61;left:50%;top:calc(var(--hh,62px) + 10px);transform:translateX(-50%);width:min(560px,calc(100vw - 20px));bottom:calc(14px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;overflow:hidden;background:#fbf3e1;border:3px solid #2b2018;border-radius:22px;box-shadow:0 6px 0 #2b2018,0 18px 40px rgba(0,0,0,.35);-webkit-user-select:text;user-select:text}
#adm[hidden]{display:none}
#adm .top{display:flex;align-items:center;gap:8px;padding:9px 10px 9px 14px;background:#2b2018;color:#f7ecd4}#adm .top h3{margin:0;flex:1;font:600 20px/1.1 'Fredoka',system-ui,sans-serif}
#adm .top button{width:34px;height:34px;padding:0;flex:none;background:#f7ecd4}
#adm .tabs{display:flex;gap:6px;padding:8px 10px;border-bottom:2px dashed rgba(43,32,24,.25);background:#f3e6c8;flex-wrap:wrap}#adm .tabs button{padding:4px 11px;font-size:13.5px}#adm .tabs button[aria-pressed=true]{background:#f1b46e}
#adm .body{flex:1;overflow:auto;padding:12px;-webkit-overflow-scrolling:touch}
#adm .big{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}#adm .big div{background:#fff8e8;border:2px solid #2b2018;border-radius:16px;padding:8px 6px;text-align:center}
#adm .big b{display:block;font:600 30px/1.05 'Fredoka',system-ui,sans-serif}#adm .big span{font-size:12.5px;color:#7a6650}
#adm h4{margin:14px 0 6px;font:600 15px 'Fredoka',system-ui,sans-serif}#adm h4:first-child{margin-top:0}
#adm .mute{color:#7a6650;font-size:13px}#adm p{margin:0 0 8px}
#adm .pl{display:flex;justify-content:space-between;gap:8px;padding:5px 9px;border-radius:10px;background:#fff8e8;margin-bottom:4px;font-size:14px}#adm .pl i{font-style:normal;color:#7a6650;font-variant-numeric:tabular-nums}
#adm .row{display:flex;align-items:center;gap:10px;padding:8px 9px;border-radius:14px;margin-bottom:6px;background:#fff8e8;border:2px solid rgba(43,32,24,.15);cursor:pointer}#adm .row:hover{border-color:#2b2018}
#adm .row .nm{flex:1;min-width:0}#adm .row .nm b{display:block;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#adm .row .nm small{display:block;color:#7a6650;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#adm .ini{width:38px;height:38px;flex:none;border-radius:50%;border:2px solid #2b2018;background:#bfe3a6;display:flex;align-items:center;justify-content:center;font-weight:600;position:relative}
#adm .ini.on::after{content:'';position:absolute;right:-3px;bottom:-2px;width:12px;height:12px;border-radius:50%;background:#3cb34a;border:2px solid #fff8e8}
#adm .tag{font-size:11.5px;padding:1px 7px;border-radius:999px;border:1.5px solid #2b2018;background:#fff;white-space:nowrap}#adm .tag.bl{background:#e0463c;color:#fff;border-color:#e0463c}#adm .tag.ad{background:#f1b46e}
#adm input[type=search],#adm textarea{font:inherit;width:100%;padding:8px 12px;border-radius:14px;border:2px solid #2b2018;background:#fff;color:#2b2018;outline:none}#adm textarea{min-height:96px;resize:vertical}
#adm .flt{display:flex;gap:6px;margin:8px 0 10px;flex-wrap:wrap}#adm .flt button{padding:3px 10px;font-size:13px}#adm .flt button[aria-pressed=true]{background:#2b2018;color:#f7ecd4}
#adm .card{background:#fff8e8;border:2px solid #2b2018;border-radius:16px;padding:12px}#adm dl{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:8px 0 12px;font-size:14px}#adm dt{color:#7a6650}#adm dd{margin:0;word-break:break-all}
#adm .acts{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
#adm .sent{background:#fff;border:2px solid rgba(43,32,24,.2);border-radius:12px;padding:7px 10px;margin-bottom:6px;font-size:14px;white-space:pre-wrap;word-wrap:break-word}#adm .sent small{display:block;color:#7a6650;font-size:12px;margin-top:3px}
#adm .toast{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);background:#2b2018;color:#f7ecd4;padding:8px 14px;border-radius:12px;font-size:14px;max-width:90%;text-align:center;pointer-events:none;opacity:0;transition:opacity .25s}#adm .toast.on{opacity:1}
#adm .back{margin-bottom:10px}
#adm .gift{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}#adm .gift select,#adm .gift input{font:inherit;padding:7px 10px;border-radius:12px;border:2px solid #2b2018;background:#fff;color:#2b2018}#adm .gift input[type=number]{width:96px}#adm .gift input[type=text]{flex:1;min-width:160px}#adm .gift [hidden]{display:none}#adm #admInv{margin:4px 0 6px}#adm #admInv b{color:#2b2018}`;
document.head.appendChild(st);

const fmtDate=t=>t?new Date(t).toLocaleDateString(LANG==='it'?'it-IT':'en-GB',{day:'numeric',month:'short',year:'numeric'}):'—';
const fmtTime=t=>t?new Date(t).toLocaleString(LANG==='it'?'it-IT':'en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'—';
function ago(t){if(!t)return'—';const s=(Date.now()-t)/1000;if(s<180)return tt('online now','online ora');if(s<3600)return tt(`${Math.round(s/60)} min ago`,`${Math.round(s/60)} min fa`);
 if(s<86400)return tt(`${Math.round(s/3600)} h ago`,`${Math.round(s/3600)} h fa`);const d=Math.round(s/86400);return tt(`${d} d ago`,`${d} g fa`)}

/* ================= messages from the admins (every player) ================= */
let ME=null,unIn=null,queue=[];
const note=document.createElement('div');note.id='igNote';note.className='igs';note.hidden=true;note.setAttribute('role','dialog');note.setAttribute('aria-modal','true');document.body.appendChild(note);
['keydown','keyup','keypress'].forEach(k=>note.addEventListener(k,e=>e.stopPropagation()));
['pointerdown','wheel','touchstart'].forEach(k=>note.addEventListener(k,e=>e.stopPropagation(),{passive:true}));
function showNote(){const m=queue[0];if(!m){note.hidden=true;return}
 note.innerHTML=`<div class="card"><h3>✉️ ${tt('A message from Igor Time','Un messaggio da Igor Time')}</h3><div class="from">${tt('From the admins','Dagli amministratori')}${m.byNick?' · '+esc(m.byNick):''} · ${esc(fmtTime(m.at))}</div>
 <div class="txt">${esc(m.t)}</div><div class="ft"><small>${tt('Questions? Write to','Domande? Scrivi a')} theigortime@gmail.com</small><button class="go" data-a="ok">${tt('Got it','Ho letto')}${queue.length>1?` (${queue.length})`:''}</button></div></div>`;
 if(note.hidden){note.hidden=false;sfx('open')}}
note.addEventListener('click',async e=>{const b=e.target.closest('[data-a=ok]');if(!b)return;const m=queue.shift();b.disabled=true;
 try{await updateDoc(doc(db,'inbox',ME.uid,'m',m.id),{rd:serverTimestamp()})}catch(err){console.warn('inbox read',err)}showNote()});
function inbox(){if(unIn)unIn(),unIn=null;queue=[];note.hidden=true;if(!ME)return;
 unIn=onSnapshot(query(collection(db,'inbox',ME.uid,'m'),where('rd','==',null)),s=>{
  queue=s.docs.map(d=>{const x=d.data();return{id:d.id,t:x.t,byNick:x.byNick||'',at:ms(x.at)||Date.now()}}).sort((a,b)=>a.at-b.at);showNote()},e=>console.warn('inbox',e))}

/* ================= gifts from the admins (every player, only on the island) =================
   gifts/<uid>/g/<id> {k: seeds|ants|veh, n, v, msg, by, byNick, at, st: new|got|back|gone|cancel, tk}
   new → the island applies it (IgorGift.apply) → got;  admin: got → back → the island takes it back (only what was given, never below zero) → gone with tk = how much was taken */
let unG=null,onReady=null;
async function handleGift(g){if(!ME||window.__igFrozen)return;const ref=doc(db,'gifts',ME.uid,'g',g.id);
 try{if(g.st==='new'){window.IgorGift.apply(g);await updateDoc(ref,{st:'got'})}
  else if(g.st==='back'){const tk=window.IgorGift.has(g.id)?window.IgorGift.take(g):0;await updateDoc(ref,{st:'gone',tk})}
  else if((g.st==='gone'||g.st==='cancel')&&window.IgorGift.has(g.id))window.IgorGift.take(g,true)}catch(e){console.warn('gift',e)}}
function gifts(){if(unG)unG(),unG=null;if(onReady)removeEventListener('igor-ready',onReady),onReady=null;if(!ME)return;
 const go=()=>{const C=window.IgorCloud;if(!window.IgorGift||!C||!C.ready||!C.user||C.user.uid!==ME.uid)return false;
  unG=onSnapshot(collection(db,'gifts',ME.uid,'g'),s=>s.docs.forEach(d=>handleGift({id:d.id,...d.data()})),e=>console.warn('gifts',e));return true};
 if(!go()){onReady=()=>{if(go()){removeEventListener('igor-ready',onReady);onReady=null}};addEventListener('igor-ready',onReady)}}

/* ================= 11 Nov 2026: an admin is looking at this island live (every player, only on the island) =================
   watch/<uid> {until, by, at} written by an admin (inspect.js) → while until is in the future, live/<uid> every ~1.5 s with what window.IgorLive.snap() gives
   (only when something changed, or every 6 s), plus a save every 20 s so the admin also sees fields and purchases change. Stops by itself at "until". */
let unW=null,wT=0,wUntil=0,wLast='',wLastAt=0,wTouch=0;
function liveSend(extra){const L=window.IgorLive,s=L&&L.snap&&L.snap();if(!ME||!s)return Promise.resolve();
 return setDoc(doc(db,'live',ME.uid),{...s,go:'',...(extra||{}),t:Date.now(),at:serverTimestamp()}).catch(e=>console.warn('live',e&&e.code||e))}
function liveTick(){if(!ME||Date.now()>wUntil)return liveStop();const L=window.IgorLive,s=L&&L.snap&&L.snap();if(!s)return;const j=JSON.stringify(s),now=Date.now();
 if(j===wLast&&now-wLastAt<6000)return;wLast=j;wLastAt=now;liveSend();
 if(now-wTouch>20000){wTouch=now;try{window.IgorSave&&window.IgorSave.touch&&window.IgorSave.touch()}catch(e){}}}
function liveStart(){if(wT)return;wLast='';wTouch=Date.now();liveTick();wT=setInterval(liveTick,1500);if(window.IgorLive)window.IgorLive.leave=u=>{liveSend({go:String(u||'').slice(0,40)})}}
function liveStop(){if(wT){clearInterval(wT);wT=0}if(window.IgorLive)window.IgorLive.leave=null}
function watchMe(){if(unW)unW(),unW=null;liveStop();if(!ME||window.__igInspect||!window.IgorLive||(window.IgorSave&&window.IgorSave.visiting))return;
 unW=onSnapshot(doc(db,'watch',ME.uid),s=>{const d=s.exists()?s.data():null;wUntil=d&&typeof d.until==='number'?d.until:0;if(wUntil>Date.now())liveStart();else liveStop()},e=>{if(e&&e.code!=='permission-denied')console.warn('watch',e&&e.code||e)})}

/* ================= the admins' panel ================= */
const PLACE={island:['Island · outside','Isola · fuori'],'island:house':['Island · Igor’s house','Isola · casa di Igor'],'island:school':['Island · music school','Isola · scuola di musica'],'island:prizes':['Island · prize shop','Isola · negozio dei premi'],
 games:['Games page','Pagina dei giochi'],kitchen:['Kitchen (duration)','Cucina (durata)'],window:['Window (volume)','Finestra (volume)'],bedroom:['Bedroom (timbre)','Camera (timbro)'],drums:['Drums','Batteria'],pitch:['Pitch Stairs','Pitch Stairs'],cadences:['Cadences','Cadenze'],abyss:['The abyss','L’abisso'],other:['Other page','Altra pagina']};
const placeName=g=>{const p=PLACE[g]||(g&&g.startsWith('island:')?[`Island · ${g.slice(7)}`,`Isola · ${g.slice(7)}`]:PLACE.other);return tt(p[0],p[1])};
const nG=n=>n+' '+(n===1?tt('guest','ospite'):tt('guests','ospiti'));
const isGame=g=>['kitchen','window','bedroom','drums','pitch','cadences','abyss'].includes(g);
let panel=null,view='online',PRES=[],ACC=[],SUSP={},OLD=null,sel=null,filt='all',q='',presT=0,loaded=false;
function adminButton(){if($('admB'))return;const ref=$('chatB')||$('me');if(!ref||!ref.parentNode)return;const b=document.createElement('button');b.id='admB';b.type='button';b.title=tt('Admin','Amministrazione');b.setAttribute('aria-label',b.title);
 b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l7.5 3v5.6c0 4.7-3.1 8.7-7.5 10.4-4.4-1.7-7.5-5.7-7.5-10.4V5.5z" fill="#f3ead2"/><path d="M8.3 12.2l2.6 2.6 4.9-5.2" stroke="#2b2018" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 ref.parentNode.insertBefore(b,ref);b.addEventListener('click',e=>{e.preventDefault();panel&&!panel.hidden?close():open()})}
function makePanel(){panel=document.createElement('aside');panel.id='adm';panel.className='igs';panel.hidden=true;panel.setAttribute('aria-label',tt('Admin','Amministrazione'));document.body.appendChild(panel);
 ['keydown','keyup','keypress'].forEach(k=>panel.addEventListener(k,e=>e.stopPropagation()));
 ['pointerdown','wheel','touchstart'].forEach(k=>panel.addEventListener(k,e=>e.stopPropagation(),{passive:true}));
 panel.addEventListener('click',onClick);panel.addEventListener('change',e=>{if(e.target.id==='admGk'){const k=e.target.value;$('admGn').hidden=k==='veh'||k==='deco';$('admGv').hidden=k!=='veh';$('admGd').hidden=k!=='deco';$('admGh').hidden=k!=='house';$('admGi').hidden=k!=='isle';$('admGn').hidden=k!=='seeds'&&k!=='ants'&&k!=='fuel'}});
 panel.addEventListener('input',e=>{if(e.target.id==='admQ'){q=e.target.value.trim().toLowerCase();drawList()}})}
function toast(t){const e=panel.querySelector('.toast');if(!e)return;e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2600)}
function shell(){panel.innerHTML=`<div class="top"><h3>🛡 ${tt('Admin','Amministrazione')}</h3><button data-a="reload" title="${tt('Refresh','Aggiorna')}" aria-label="${tt('Refresh','Aggiorna')}">↻</button><button data-a="close" aria-label="${tt('Close','Chiudi')}">×</button></div>
 <div class="tabs">${[['online',tt('Online now','Online ora')],['users',tt('Accounts','Account')],['events','⚡ '+tt('Events','Eventi')]].map(([k,l])=>`<button data-tab="${k}" aria-pressed="${view===k}">${l}</button>`).join('')}<button data-a="reports">${tt('Chat reports','Segnalazioni chat')} ↗</button></div><div class="body"></div><div class="toast" role="status"></div>`;return panel.querySelector('.body')}

async function loadPres(){const cut=Timestamp.fromMillis(Date.now()-180000);
 try{const s=await getDocs(query(collection(db,'pres'),where('at','>',cut)));PRES=s.docs.map(d=>{const x=d.data();return{id:d.id,g:x.g||'other',u:x.u||'',n:x.n||'',l:x.l||'',m:!!x.m,at:ms(x.at)}})}catch(e){console.warn('pres',e);PRES=null}}
async function loadAcc(){try{const s=await getDocs(collection(db,'accts'));ACC=s.docs.map(d=>{const x=d.data();return{uid:d.id,nick:x.nick||'',email:x.email||'',prov:x.prov||'',made:ms(x.made),seen:ms(x.seen)}})}catch(e){console.warn('accts',e);ACC=null}
 try{const s=await getDocs(collection(db,'susp'));SUSP={};s.docs.forEach(d=>SUSP[d.id]=d.data().nick||'')}catch(e){console.warn('susp',e)}}
async function loadOld(){try{const s=await getDocs(collection(db,'users'));OLD=s.docs.map(d=>{const x=d.data();return{uid:d.id,nick:x.nick||x.name||'',seen:ms(x.updated)}})}catch(e){console.warn('users',e);OLD=[];toast(tt('Could not read the old accounts.','Non riesco a leggere i vecchi account.'))}}
async function reload(){await Promise.all([loadPres(),loadAcc()]);loaded=true;render()}

function onlineSet(){const s=new Set();(PRES||[]).forEach(p=>{if(p.u)s.add(p.u)});return s}
function allAccounts(){const m=new Map();(ACC||[]).forEach(a=>m.set(a.uid,{...a}));
 if(OLD)OLD.forEach(o=>{const a=m.get(o.uid);if(a){if(!a.seen||o.seen>a.seen)a.seen=o.seen}else m.set(o.uid,{uid:o.uid,nick:o.nick,email:'',prov:'',made:0,seen:o.seen,old:true})});
 (PRES||[]).forEach(p=>{if(p.u&&!m.has(p.u))m.set(p.u,{uid:p.u,nick:p.n,email:'',prov:'',made:0,seen:p.at,old:true})});
 return[...m.values()]}

function render(){if(!panel||panel.hidden)return;if(sel)return userV();const b=shell();if(!loaded){b.innerHTML=`<p class="mute">${tt('Loading…','Carico…')}</p>`;return}
 if(view==='online')return onlineV(b);if(view==='events')return eventsV(b);return usersV(b)}
function onlineV(b){if(PRES===null){b.innerHTML=`<p>${tt('Cannot read who is online: check the Firestore rules (pres).','Non riesco a leggere chi è online: controlla le regole Firestore (pres).')}</p>`;return}
 const acc=PRES.filter(p=>p.u),gu=PRES.filter(p=>!p.u),play=PRES.filter(p=>isGame(p.g));
 let h=`<div class="big"><div><b>${PRES.length}</b><span>${tt('online','online')}</span></div><div><b>${acc.length}</b><span>${tt('with an account','con account')}</span></div><div><b>${gu.length}</b><span>${tt('guests','ospiti')}</span></div></div>
 <p class="mute">${tt(`${play.length} playing a game right now (${nG(play.filter(p=>!p.u).length)}). Pages open in the last 3 minutes; it refreshes every 30 s.`,`${play.length} stanno giocando adesso a un gioco (${nG(play.filter(p=>!p.u).length)}). Pagine aperte negli ultimi 3 minuti; si aggiorna ogni 30 s.`)}</p>`;
 if(PRES.length){const by={};PRES.forEach(p=>{const o=by[p.g]=by[p.g]||{a:0,g:0};p.u?o.a++:o.g++});
  h+=`<h4>${tt('Where they are','Dove sono')}</h4>`+Object.entries(by).sort((x,y)=>(y[1].a+y[1].g)-(x[1].a+x[1].g)).map(([g,o])=>`<div class="pl"><span>${isGame(g)?'🎮 ':''}${esc(placeName(g))}</span><i>${o.a?o.a+' '+tt('acc.','acc.'):''}${o.a&&o.g?' · ':''}${o.g?nG(o.g):''}</i></div>`).join('');
  const dev={m:PRES.filter(p=>p.m).length};h+=`<p class="mute" style="margin-top:6px">📱 ${dev.m} · 💻 ${PRES.length-dev.m} · 🇮🇹 ${PRES.filter(p=>p.l==='it').length} · 🇬🇧 ${PRES.filter(p=>p.l!=='it').length}</p>`}
 else h+=`<p class="mute">${tt('Nobody is on the site right now.','Adesso non c’è nessuno sul sito.')}</p>`;
 b.innerHTML=h;
 if(acc.length){const h4=document.createElement('h4');h4.textContent=tt('Accounts online','Account online');b.appendChild(h4);
  const seen=new Set(),A=allAccounts();acc.forEach(p=>{if(seen.has(p.u))return;seen.add(p.u);const a=A.find(x=>x.uid===p.u)||{uid:p.u,nick:p.n};b.appendChild(row(a,placeName(p.g)+(p.m?' · 📱':' · 💻'),true))})}}
function row(a,sub,on){const r=document.createElement('div');r.className='row';r.dataset.uid=a.uid;
 r.innerHTML=`<div class="ini${on?' on':''}">${esc((a.nick||'?').slice(0,1).toUpperCase())}</div><div class="nm"><b>${esc(a.nick||tt('(no nickname)','(senza nickname)'))}</b><small>${esc(sub)}</small></div>${a.uid in SUSP?`<span class="tag bl">${tt('blocked','bloccato')}</span>`:''}${ADMINS.includes(a.uid)?'<span class="tag ad">admin</span>':''}`;return r}
function usersV(b){if(ACC===null){b.innerHTML=`<p>${tt('Cannot read the accounts: check the Firestore rules (accts).','Non riesco a leggere gli account: controlla le regole Firestore (accts).')}</p>`;return}
 b.innerHTML=`<input type="search" id="admQ" placeholder="${tt('Search nickname or email','Cerca nickname o email')}" value="${esc(q)}" autocomplete="off">
 <div class="flt">${[['all',tt('All','Tutti')],['on',tt('Online','Online')],['bl',tt('Blocked','Bloccati')],['new',tt('Newest','Più recenti')]].map(([k,l])=>`<button data-f="${k}" aria-pressed="${filt===k}">${l}</button>`).join('')}</div><div id="admL"></div>
 ${OLD?'':`<p class="mute" style="margin-top:10px">${tt('Accounts appear here with their email the next time they open the island. ','Gli account compaiono qui con l’email la prossima volta che aprono l’isola. ')}<button data-a="old">${tt('Show also the older accounts','Mostra anche gli account vecchi')}</button></p>`}`;drawList()}
function drawList(){const e=$('admL');if(!e)return;const on=onlineSet();let L=allAccounts();
 if(q)L=L.filter(a=>(a.nick||'').toLowerCase().includes(q)||(a.email||'').toLowerCase().includes(q)||a.uid.toLowerCase()===q);
 if(filt==='on')L=L.filter(a=>on.has(a.uid));if(filt==='bl')L=L.filter(a=>a.uid in SUSP);
 L.sort(filt==='new'?(a,b)=>(b.made||0)-(a.made||0):(a,b)=>(on.has(b.uid)-on.has(a.uid))||((b.seen||0)-(a.seen||0)));
 e.innerHTML=`<p class="mute">${L.length} ${tt('accounts','account')}</p>`;
 L.slice(0,400).forEach(a=>e.appendChild(row(a,(a.email||(a.old?tt('email not known yet','email non ancora nota'):''))+' · '+(on.has(a.uid)?tt('online now','online ora'):ago(a.seen)),on.has(a.uid))))}

let SENT=[];
async function loadSent(uid){try{const s=await getDocs(query(collection(db,'inbox',uid,'m'),orderBy('at','desc'),limit(30)));SENT=s.docs.map(d=>{const x=d.data();return{id:d.id,t:x.t,byNick:x.byNick||'',at:ms(x.at),rd:ms(x.rd)}})}catch(e){console.warn('sent',e);SENT=[]}}
function userV(){const b=shell(),a=allAccounts().find(x=>x.uid===sel)||{uid:sel,nick:'?'},on=onlineSet().has(sel),bl=sel in SUSP,me=sel===ME.uid;
 const where=(PRES||[]).filter(p=>p.u===sel).map(p=>placeName(p.g)+(p.m?' 📱':' 💻')).join(', ');
 const prov={google:'Google',password:tt('email and password','email e password')}[a.prov]||'—';
 b.innerHTML=`<button class="back" data-a="back">← ${tt('Back','Indietro')}</button><div class="card">
 <div class="row" style="cursor:default;margin:0;border:0;background:none;padding:0"><div class="ini${on?' on':''}">${esc((a.nick||'?').slice(0,1).toUpperCase())}</div><div class="nm"><b style="font-size:19px">${esc(a.nick||tt('(no nickname)','(senza nickname)'))}</b><small>${on?tt('online now','online ora')+(where?' · '+esc(where):''):tt('last seen ','visto ')+ago(a.seen)}</small></div>${bl?`<span class="tag bl">${tt('blocked','bloccato')}</span>`:''}</div>
 <dl><dt>Email</dt><dd>${a.email?esc(a.email):`<span class="mute">${tt('not known yet (comes with the next visit)','non ancora nota (arriva con la prossima visita)')}</span>`}</dd>
 <dt>${tt('Sign-in','Accesso')}</dt><dd>${esc(prov)}</dd><dt>${tt('Joined','Iscritto')}</dt><dd>${esc(fmtDate(a.made))}</dd><dt>${tt('Last visit','Ultima visita')}</dt><dd>${esc(fmtTime(a.seen))}</dd><dt>uid</dt><dd style="font-size:12px">${esc(a.uid)}</dd></dl>
 <div class="acts"><button class="go" data-a="inspect">🔍 ${tt('Look at the island','Guarda l’isola')}</button></div><div class="acts">${me?`<span class="mute">${tt('This is you.','Sei tu.')}</span>`:bl?`<button class="go" data-a="unblock">✓ ${tt('Unblock','Sblocca')}</button>`:`<button class="no" data-a="block">🚫 ${tt('Block','Blocca')}</button>`}${a.email?`<button data-a="copy">${tt('Copy email','Copia email')}</button>`:''}</div>
 <p class="mute">${tt('Blocking closes the chat for this account, removes them from all the leaderboards and stops new records. They can still play.','Bloccare chiude la chat a questo account, lo toglie da tutte le classifiche e non gli fa registrare nuovi record. Può comunque giocare.')}</p></div>
 <h4>✉️ ${tt('Send a message','Manda un messaggio')}</h4><textarea id="admMsg" maxlength="1000" placeholder="${tt('It appears on the island the next time they open it (or right away if they are there).','Compare sull’isola la prossima volta che la aprono (o subito, se ci sono).')}"></textarea>
 <div style="display:flex;justify-content:flex-end;margin:8px 0 4px"><button class="go" data-a="send">${tt('Send','Manda')}</button></div>
 <h4>${tt('Messages sent','Messaggi mandati')}</h4><div id="admSent"><p class="mute">${tt('Loading…','Carico…')}</p></div>
 <h4>⚡ ${tt('An event only for this player','Un evento solo per questo giocatore')}</h4>${evForm('admU')}<div class="acts"><button class="go" data-a="evone">⚡ ${tt('Force it','Forzalo')}</button></div><p class="mute">${tt('It starts as soon as they are on the island (right away if they are there). It appears in the gifts list below.','Parte appena è sull’isola (subito, se c’è). Compare nell’elenco dei regali qui sotto.')}</p>
 <h4>🎁 ${tt('Gifts','Regali')}</h4><div id="admInv" class="mute">${tt('Loading…','Carico…')}</div><div id="admBk" class="mute"></div>
 <div class="gift"><select id="admGk"><option value="seeds">🌱 ${tt('Seeds','Semi')}</option><option value="ants">🧊 ${tt('Tofu ants','Formiche di tofu')}</option><option value="veh">🏆 ${tt('A prize (vehicle)','Un premio (mezzo)')}</option><option value="fuel">⛽ Tofuel</option><option value="deco">🧸 ${tt('A toy-store decoration','Una decorazione (negozio dei giocattoli)')}</option><option value="house">🏡 ${tt('Something for Igor’s house','Una personalizzazione della casa')}</option><option value="isle">🏝️ ${tt('An island (or its Igorlet)','Un isolotto (o il suo Igorlet)')}</option></select>
 <input id="admGn" type="number" min="1" max="100000" value="10" inputmode="numeric"><select id="admGv" hidden>${Object.keys(VEHS).map(k=>`<option value="${k}">${esc(vName(k))}</option>`).join('')}</select><select id="admGd" hidden>${Object.keys(DECOS).map(k=>`<option value="d:${k}">${esc(dName(k))}</option>`).join('')}</select><select id="admGh" hidden>${hOpts()}</select><select id="admGi" hidden>${Object.keys(ISLS).map(k=>`<option value="${k}">${esc(vName(k))}</option>`).join('')}</select>
 <input id="admGm" type="text" maxlength="200" placeholder="${tt('Note for the player (optional)','Biglietto per il giocatore (facoltativo)')}"><button class="go" data-a="gift">${tt('Give','Regala')}</button></div>
 <p class="mute">${tt('It arrives on the island (right away if they are there). You can take back only what you gave, never what they earned, and never below zero.','Arriva sull’isola (subito, se ci sono). Si può ritirare solo quello che hai regalato, mai quello che hanno guadagnato, e mai sotto zero.')}</p>
 <div id="admGifts"></div>`;
 loadSent(sel).then(drawSent);loadGifts(sel).then(drawGifts);loadInv(sel).then(drawInv);loadBk(sel).then(drawBk)}
let GIFTS=[],INV=null,BKS=[];
const BKW={day:['daily copy','copia del giorno'],unsynced:['changes not yet online, replaced','modifiche non ancora online, sostituite'],'cloud-replaced':['island that was behind, replaced by the one with more progress','isola più indietro, sostituita da quella più avanti'],'device-replaced':['device island replaced by the online one','isola di un dispositivo sostituita da quella online'],'restored-over':['replaced by a restore','sostituita da un ripristino'],'pre-restore':['before a restore','prima di un ripristino']};
async function bkText(b){if(!b.z)return b.d;const bin=Uint8Array.from(atob(b.d),c=>c.charCodeAt(0));return new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).text()}
async function loadBk(uid){try{const s=await getDocs(query(collection(db,'users',uid,'bk'),orderBy('t','desc'),limit(40)));BKS=s.docs.map(d=>({id:d.id,...d.data()}));for(const b of BKS){try{b.j=await bkText(b)}catch(e){b.j=''}}}catch(e){console.warn('bk',e);BKS=null}}
function bkSum(b){let I=null;try{I=JSON.parse(b.j)}catch(e){}if(!I)return'';const F=I.farm||{},v=Object.keys(F.veh||{}),h=Object.keys(F.pos||{}).length;
 return`🌱 ${I.seeds|0} · 🧊 ${(F.ants&&F.ants.t)|0} · ${tt('collected','raccolte')} ${F.total|0}${v.length?' · '+v.map(k=>esc(vName(k))+((F.veh[k].n|0)>1?' ×'+F.veh[k].n:'')).join(', '):''} · ${h} ${tt('places on the island','posti sull’isola')}`}
function drawBk(){const e=$('admBk');if(!e)return;if(BKS===null){e.textContent=tt('Backups: I cannot read them.','Copie di sicurezza: non riesco a leggerle.');return}
 if(!BKS.length){e.innerHTML=`<b>${tt('Backups','Copie di sicurezza')}</b>: ${tt('none yet (one is made every day they play).','ancora nessuna (se ne fa una ogni giorno in cui gioca).')}`;return}
 e.innerHTML=`<b>${tt('Backups','Copie di sicurezza')}</b>`+BKS.map(b=>`<div style="margin:6px 0;padding:6px 0;border-top:1px solid rgba(0,0,0,.12)">${esc(fmtTime(b.t))} · ${esc(BKW[b.why]?tt(...BKW[b.why]):b.why)}<br><small>${bkSum(b)}</small><br><button data-a="restore" data-bk="${esc(b.id)}">${tt('Restore this one','Ripristina questa')}</button></div>`).join('')}
async function restoreBk(uid,b){const ref=doc(db,'users',uid),cur=await getDoc(ref),now=Date.now(),c=cur.exists()?cur.data():null;
 if(c){const k={...c};delete k.updated;await setDoc(doc(db,'users',uid,'bk','pre-restore-'+now),{why:'pre-restore',t:now,at:c.at||0,lv:(c.farm&&c.farm.total)|0,igv:c.igv||'',d:JSON.stringify(k),made:serverTimestamp()})}
 const d=JSON.parse(b.j);delete d.updated;d.at=now;d.base=c&&c.at||0;d.rst=now;d.uid=uid;
 await setDoc(ref,{...(window.IgorFS?window.IgorFS.enc(d):d),name:c&&c.name||d.name||'',nick:c&&c.nick||d.nick||'',updated:serverTimestamp()})}
async function loadGifts(uid){try{const s=await getDocs(query(collection(db,'gifts',uid,'g'),orderBy('at','desc'),limit(50)));GIFTS=s.docs.map(d=>({id:d.id,...d.data(),at:ms(d.data().at)}))}catch(e){console.warn('gifts',e);GIFTS=[]}}
async function loadInv(uid){try{const d=await getDoc(doc(db,'users',uid));INV=d.exists()?d.data():false}catch(e){console.warn('inv',e);INV=null}}
function drawInv(){const e=$('admInv');if(!e)return;if(INV===null){e.textContent=tt('Cannot read their island.','Non riesco a leggere la sua isola.');return}if(INV===false){e.textContent=tt('No saved island yet.','Ancora nessuna isola salvata.');return}
 const F=INV.farm||{},v=Object.keys(F.veh||{});e.innerHTML=`${tt('Now on the island','Adesso sull’isola')}: 🌱 <b>${INV.seeds|0}</b> · 🧊 <b>${(F.ants&&F.ants.t)|0}</b> ${tt('in the pocket','in tasca')} · ⛽ <b>${Math.floor((F.fuel&&F.fuel.n)||0)}</b> tofuel · ${tt('collected','raccolte')} ${F.total|0}${v.length?' · '+v.map(k=>esc(vName(k))+((F.veh[k].n|0)>1?' ×'+F.veh[k].n:'')).join(', '):''}${Object.keys(F.deco||{}).filter(k=>DECOS[k]).length?' · '+Object.keys(F.deco).filter(k=>DECOS[k]).map(k=>esc(dName(k))+(F.deco[k].x==null?' ('+tt('not placed','da piazzare')+')':'')).join(', '):''}${invIsles(F)}<br><small>${tt('(as of their last save)','(al loro ultimo salvataggio)')}</small><br><small>🛠 ${invDiag(INV)}</small>`}
function invDiag(I){const F=I.farm||{},a=[];a.push(I.igv?tt('island version ','versione dell’isola ')+esc(I.igv):tt('old island version (before 23:10): they must reload the page','versione vecchia dell’isola (prima delle 23:10): deve ricaricare la pagina'));
 if(I.at)a.push(tt('saved ','salvata ')+esc(fmtTime(typeof I.at==='number'?I.at:ms(I.at))));
 if(F.fq&&F.fq.length)a.push(tt('waiting: ','in attesa: ')+F.fq.map(q=>esc(evNm(q.k))).join(', ')+tt(' (starts when they move Igor)',' (parte quando muove Igor)'));
 if(F.ev){const E=F.ev,now=Date.now();a.push(tt('event: ','evento: ')+esc(evNm(E.k))+' — '+(now<E.at?tt('at ','alle ')+new Date(E.at).toLocaleTimeString().slice(0,5):now<E.end?tt('happening','in corso'):tt('over','finito')))}
 if(F.ufo)a.push('Aliengor: '+esc({pending:tt('waiting for them','aspetta che arrivi'),gone:tt('Igorlets taken','Igorlets rapiti'),met:tt('talked to the Igor in Black','ha parlato con l’Igor in Black')}[F.ufo.st]||F.ufo.st));
 const ge=Object.values(F.gifts||{}).filter(g=>g&&g.ev).length;if(ge)a.push(tt('forced events received: ','eventi forzati ricevuti: ')+ge);
 return a.join(' · ')}
function giftLabel(g){if(g.k==='veh'&&/^ev:/.test(g.v||''))return`⚡ ${esc(evNm(g.v.slice(3)))} · ${esc(leadNm(Math.max(0,(g.n|0)-1)))}`;if(g.k==='veh'&&g.v==='fuel')return`⛽ ${g.n} tofuel`;return g.k==='seeds'?`🌱 ${g.n} ${tt('seeds','semi')}`:g.k==='ants'?`🧊 ${g.n} ${tt('tofu ants','formiche di tofu')}`:esc(vName(g.v))}
function giftNote(g){if(g.st!=='gone'||/^ev:/.test(g.v||''))return'';if(g.k==='veh'&&ISLS[g.v])return g.tk?'':` (${g.v==='o:4'?tt('it already lived with them: kept','abitava già con lui: resta'):tt('they had reached it on their own: kept','ci era già arrivato da solo: resta')})`;if(g.k==='veh'&&g.v!=='fuel')return g.tk?'':` (${tt('they had bought it: kept','l’aveva comprato: resta')})`;return(g.tk|0)<g.n?` (${tt('taken','tolti')} ${g.tk|0} ${tt('of','su')} ${g.n})`:''}
function drawGifts(){const e=$('admGifts');if(!e)return;if(!GIFTS.length){e.innerHTML=`<p class="mute">${tt('No gifts yet.','Ancora nessun regalo.')}</p>`;return}
 const ST={new:tt('waiting: arrives at their next visit','in attesa: arriva alla prossima visita'),got:tt('received','ricevuto'),back:tt('being taken back at their next visit','in ritiro alla prossima visita'),gone:tt('taken back','ritirato'),cancel:tt('cancelled before it arrived','annullato prima che arrivasse')};
 e.innerHTML=GIFTS.map(g=>`<div class="sent"><b>${giftLabel(g)}</b>${g.msg?' · '+esc(g.msg):''}<small>${esc(fmtTime(g.at))}${g.byNick?' · '+esc(g.byNick):''} · ${ST[g.st]||esc(g.st)}${giftNote(g)}</small>${g.st==='new'||g.st==='got'&&!/^ev:/.test(g.v||'')?`<div style="margin-top:5px"><button class="no" data-a="ungift" data-id="${esc(g.id)}">${g.st==='new'?tt('Cancel','Annulla'):tt('Take back','Ritira')}</button></div>`:''}</div>`).join('')}
function drawSent(){const e=$('admSent');if(!e)return;e.innerHTML=SENT.length?SENT.map(m=>`<div class="sent">${esc(m.t)}<small>${esc(fmtTime(m.at))}${m.byNick?' · '+esc(m.byNick):''} · ${m.rd?tt('read ','letto ')+esc(fmtTime(m.rd)):tt('not read yet','non ancora letto')}</small></div>`).join(''):`<p class="mute">${tt('None yet.','Ancora nessuno.')}</p>`}

async function block(uid,nick){await setDoc(doc(db,'susp',uid),{at:serverTimestamp(),nick:nick||''});SUSP[uid]=nick||'';
 await Promise.all(BOARDS.map(c=>deleteDoc(doc(db,c,uid)).catch(()=>{})))}
async function unblock(uid){await deleteDoc(doc(db,'susp',uid));delete SUSP[uid]}
async function onClick(e){const t=e.target.closest('[data-a],[data-tab],[data-f],.row[data-uid]');if(!t)return;
 if(t.dataset.tab){view=t.dataset.tab;sel=null;return render()}
 if(t.dataset.f){filt=t.dataset.f;panel.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-pressed',x===t));return drawList()}
 if(t.classList.contains('row')&&t.dataset.uid&&!t.dataset.a){sel=t.dataset.uid;return render()}
 const a=t.dataset.a;try{
 if(a==='close')return close();
 if(a==='inspect'){const w=window.open('/?inspect='+encodeURIComponent(sel),'_blank');if(!w)location.href='/?inspect='+encodeURIComponent(sel);return}
 if(a==='reload'){t.disabled=true;return reload()}
 if(a==='back'){sel=null;return render()}
 if(a==='reports'){close();if(window.IgorChat){window.IgorChat.open();if(window.IgorChat.show)window.IgorChat.show('reports')}return}
 if(a==='old'){t.disabled=true;await loadOld();return render()}
 if(a==='copy'){const x=allAccounts().find(v=>v.uid===sel);try{await navigator.clipboard.writeText(x.email);toast(tt('Copied','Copiata'))}catch(err){toast(x.email)}return}
 if(a==='block'){if(!t.dataset.sure){t.dataset.sure=1;t.textContent=tt('Tap again to block','Tocca ancora per bloccare');return}t.disabled=true;const x=allAccounts().find(v=>v.uid===sel)||{};await block(sel,x.nick);toast(tt('Blocked','Bloccato'));return render()}
 if(a==='restore'){if(!t.dataset.sure){t.dataset.sure=1;t.textContent=tt('Tap again: their island goes back to this copy','Tocca ancora: la sua isola torna a questa copia');return}t.disabled=true;const b=(BKS||[]).find(x=>x.id===t.dataset.bk);if(!b)return;const u0=sel;await restoreBk(u0,b);toast(tt('Island restored','Isola ripristinata'));await loadInv(u0);drawInv();await loadBk(u0);drawBk();return}
 if(a==='unblock'){t.disabled=true;await unblock(sel);toast(tt('Unblocked','Sbloccato'));return render()}
 if(a==='gift'){const k0=$('admGk').value,k=k0==='deco'||k0==='house'||k0==='fuel'||k0==='isle'?'veh':k0,n=k==='veh'&&k0!=='fuel'?1:Math.floor(+$('admGn').value||0),v=k0==='fuel'?'fuel':k0==='deco'?$('admGd').value:k0==='house'?$('admGh').value:k0==='isle'?$('admGi').value:k==='veh'?$('admGv').value:'',m=($('admGm').value||'').trim().slice(0,200);
  if(n<1||n>100000)return toast(tt('Choose a number from 1 to 100000.','Scegli un numero da 1 a 100000.'));t.disabled=true;
  await setDoc(doc(collection(db,'gifts',sel,'g')),{k,n,v,msg:m,by:ME.uid,byNick:ME.nick||'',at:serverTimestamp(),st:'new',tk:0});$('admGm').value='';toast(tt('Gift sent! 🎁','Regalo mandato! 🎁'));t.disabled=false;await loadGifts(sel);return drawGifts()}
 if(a==='gev'||a==='evme'||a==='evone'){const id=a==='evone'?'admU':'admE',k=$(id+'K').value,lead=+$(id+'L').value|0;t.disabled=true;
  if(a==='gev'){await setDoc(doc(collection(db,'gev')),{k,lead,at:serverTimestamp(),by:ME.uid,byNick:ME.nick||'',st:'new'});toast(tt('Sent to everyone! ⚡ It starts on your island too.','Mandato a tutti! ⚡ Parte anche sulla tua isola.'));t.disabled=false;close();return}
  const uid=a==='evme'?ME.uid:sel;await setDoc(doc(collection(db,'gifts',uid,'g')),evGift(k,lead));toast(a==='evme'?tt('On its way to your island ⚡','In arrivo sulla tua isola ⚡'):tt('On its way to their island ⚡','In arrivo sulla sua isola ⚡'));t.disabled=false;if(a==='evme'){close();return}if(a==='evone'){await loadGifts(sel);drawGifts()}return}
 if(a==='ungev'){if(!t.dataset.sure){t.dataset.sure=1;t.textContent=tt('Tap again','Tocca ancora');return}t.disabled=true;await updateDoc(doc(db,'gev',t.dataset.id),{st:'cancel'});toast(tt('Stopped','Fermato'));await loadGev();return drawGev()}
 if(a==='ungift'){const g=GIFTS.find(x=>x.id===t.dataset.id);if(!g)return;if(!t.dataset.sure){t.dataset.sure=1;t.textContent=tt('Tap again','Tocca ancora');return}t.disabled=true;
  await updateDoc(doc(db,'gifts',sel,'g',g.id),{st:g.st==='new'?'cancel':'back'});toast(g.st==='new'?tt('Cancelled','Annullato'):tt('It will be taken back at their next visit (or right away).','Verrà ritirato alla prossima visita (o subito).'));await loadGifts(sel);return drawGifts()}
 if(a==='send'){const ta=$('admMsg'),v=(ta.value||'').trim().slice(0,1000);if(!v)return toast(tt('Write something first.','Scrivi prima qualcosa.'));t.disabled=true;
  await setDoc(doc(collection(db,'inbox',sel,'m')),{t:v,by:ME.uid,byNick:ME.nick||'',at:serverTimestamp(),rd:null});ta.value='';toast(tt('Sent!','Mandato!'));t.disabled=false;await loadSent(sel);return drawSent()}
 }catch(err){console.warn('admin',a,err);toast(tt('Something went wrong (rules?).','Qualcosa non ha funzionato (regole?).'));t.disabled=false}}
function open(){if(!panel)makePanel();panel.hidden=false;sfx('open');render();reload();clearInterval(presT);presT=setInterval(async()=>{if(panel.hidden)return;await loadPres();if(!sel&&view==='online')render()},30000)}
function close(){if(panel)panel.hidden=true;clearInterval(presT)}
const VEHS={scooter:['🛴','Scooter','Monopattino'],bike:['🚲','Bike','Bici'],moto:['🏍','Motorbike','Moto'],tractor:['🚜','Tractor','Trattore'],car:['🚗','Car','Auto'],boat:['⛵','Boat','Barchetta'],heli:['🚁','Helicopter','Elicottero'],plane:['✈','Plane','Aeroplano']};
const DECOS={fire:['🔥','Campfire','Falò'],lights:['💡','Lights and flowerbeds','Lucine e aiuole'],totem:['🗿','Igor totem','Totem di Igor'],beach:['⛱️','Beach kit','Kit da spiaggia'],tele:['🔭','Telescope','Telescopio'],fount:['⛲','Fountain','Fontana'],stage:['🎤','Music stage','Palco della musica'],treeh:['🛖','Tree house','Casetta sull’albero'],wheel:['🎡','Ferris wheel','Ruota panoramica'],caro:['🎠','Carousel','Giostra']};
const dName=k=>DECOS[k]?DECOS[k][0]+' '+tt(DECOS[k][1],DECOS[k][2]):k;
/* house customisations: v = 'h<part>.<index>' (same order as HSTY / HPART / HCOL in index.html) */
const HG=[['st',['🏡','House style','Stile della casa'],[['🏡 Cottage','🏡 Cottage'],['🪵 Log cabin','🪵 Baita'],['🧱 Brick house','🧱 Casa di mattoni'],['🔲 Modern','🔲 Moderna'],['🎩 Victorian','🎩 Vittoriana'],['🦇 Gothic','🦇 Gotica'],['🍄 Mushroom house','🍄 Casa fungo'],['🗼 Lighthouse','🗼 Casa faro']]],
 ['wall',['🧱','Walls','Muri'],[['Plaster','Intonaco'],['Bricks','Mattoni'],['Wood','Legno'],['Stone','Pietra'],['Smooth','Liscio']]],
 ['roof',['🏠','Roof','Tetto'],[['Tiles','Tegole'],['Slate','Ardesia'],['Wood shingles','Scandole'],['Thatch','Paglia'],['Flat','Piatto'],['Steep','Aguzzo']]],
 ['win',['🪟','Windows','Finestre'],[['Shutters','Con le persiane'],['Round','Tonde'],['Arched','Ad arco'],['Gothic','Gotiche'],['Bay','Bovindo'],['Big panes','Vetrate']]],
 ['door',['🚪','Door','Porta'],[['Round top','Tonda'],['Square','Squadrata'],['Pointed','A sesto acuto'],['Double','Doppia']]],
 ['chim',['🏭','Chimney','Comignolo'],[['Stone','Pietra'],['Bricks','Mattoni'],['Crooked','Storto'],['Metal pipe','Tubo'],['None','Nessuno']]]];
const HGC=[['wcol',['Walls colour','Colore dei muri'],['#e8dcc2','#f2f2ee','#f6d38c','#f4c2d6','#b9d6ea','#bfe3ad','#b9a3d6','#a8513c','#8a5a3a','#8a8590']],['rcol',['Roof colour','Colore del tetto'],['#b4553f','#7c3528','#d8402f','#4a4a5a','#3a3442','#6b4a2e','#3d6b8a','#4f7f46','#c98a2a','#e9e2d0']],['dcol',['Door colour','Colore della porta'],['#5e8a6a','#2f4f6a','#7a2e3e','#2b2b2e','#6a4630','#8a5a3a','#e0a800','#e88fb0','#4fb7a0','#ffffff']]];
const hName=v=>{const m=String(v).match(/^h(\w+)\.(\d+)$/);if(!m)return v;const i=+m[2],P=HG.find(x=>x[0]===m[1]);if(P)return m[1]==='st'?tt(P[2][i][0],P[2][i][1]):`${P[1][0]} ${tt(P[1][1],P[1][2])}: ${tt(P[2][i][0],P[2][i][1])}`;const C=HGC.find(x=>x[0]===m[1]);return C?`🎨 ${tt(C[1][0],C[1][1])} ${C[2][i]}`:v};
const hOpts=()=>HG.map(([p,n,L])=>`<optgroup label="${n[0]} ${esc(tt(n[1],n[2]))}">${L.map((o,i)=>(p==='st'&&!i)||(p!=='st'&&!i)?'':`<option value="h${p}.${i}">${esc(tt(o[0],o[1]))}</option>`).join('')}</optgroup>`).join('')+HGC.map(([p,n,L])=>`<optgroup label="🎨 ${esc(tt(n[0],n[1]))}">${L.map((c,i)=>i?`<option value="h${p}.${i}" style="background:${c}">■ ${c}</option>`:'').join('')}</optgroup>`).join('');
/* islands travel as a prize with v = 'i:<4|8|12|16>' (the level key of the island), the sand island's Igorlet with v = 'o:4' */
const ISLS={'i:4':['🏝️ Sand island (lv. 3)','🏝️ Isola di sabbia (liv. 3)'],'o:4':['🐾 The sand island’s Igorlet','🐾 L’Igorlet dell’isola di sabbia'],'i:8':['🪷 Lake island (lv. 8)','🪷 Isola del lago (liv. 8)'],'i:12':['🍄 Firefly forest (lv. 12)','🍄 Bosco delle lucciole (liv. 12)'],'i:16':['🧊 Ice island (lv. 16)','🧊 Isola di ghiaccio (liv. 16)']};
const LVX=[0,20,60,150,300,500,800,1200,1700,2300,3000,3800,4700,5700,6800,8000],ISLV=[[3,'4','🏝️'],[8,'8','🪷'],[12,'12','🍄'],[16,'16','🧊']];
function invIsles(F){const lv=LVX.filter(x=>(F.total|0)>=x).length,g=F.ig||{},L=ISLV.filter(([l,k])=>lv>=l||g[k]).map(([l,k,ic])=>ic+(lv<l?' 🎁':''));
 return` · ${tt('level','livello')} ${lv}`+(L.length?` · ${tt('islands','isole')} ${L.join(' ')}`:'')+(F.orphan?' · 🐾':'')}
/* a toy-store decoration travels as a prize with v = 'd:<key>' (same Firestore rule as the vehicles) */
const vName=k=>ISLS[k]?tt(ISLS[k][0],ISLS[k][1]):/^h\w+\.\d+$/.test(k)?hName(k):/^d:/.test(k)?dName(k.slice(2)):VEHS[k]?VEHS[k][0]+' '+tt(VEHS[k][1],VEHS[k][2]):k;
const ADMINS=['suJRvYnJ8TZsrtggf88oxTCgKI42','vKhCdacBFoOn8al4qCMz9VioWle2'];

export function init(u){ME=u&&u.uid?u:null;if(!window.__igInspect){inbox();gifts();watchMe()}
 if(ME&&ME.admin)window.IgorStaff={openUser:(uid,nick)=>{if(!panel)makePanel();sel=uid;if(nick&&!allAccounts().some(x=>x.uid===uid))(ACC=ACC||[]).push({uid,nick,email:'',prov:'',made:0,seen:0});open()}};
 const b=$('admB');if(ME&&ME.admin){adminButton()}else{if(b)b.remove();close()}}
export{open as openAdmin};

/* Igor Time — personal statistics (21 Nov 2026).
   Seen only by the player (Index → "My stats", and the games page) and by the admins (staff panel → 📊).
   How it works:
   - every game, when a round set / lesson / melody ends, calls IgorStats.game(), .answer() or .daily();
     these leave small events in igortime_pending.st (like the seeds and the scores);
   - the island folds the events into S.stats (applyPending) and saves it with the rest of the island,
     so the stats follow the player between phone and computer;
   - between two versions of the same island (two devices) IgorStats.merge keeps, game by game, the one with more plays:
     nothing done on one device is lost if that device is the one that played more.
   The panel (IgorStats.open) reads S.stats plus the events not yet collected by the island. */
(()=>{
if(window.IgorStats)return;
const PEND='igortime_pending',MAXEV=1500,HIST=20;
const J=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const lang=()=>{try{return localStorage.getItem('igortime_lang')||((navigator.language||'').toLowerCase().startsWith('it')?'it':'en')}catch(e){return'en'}};
const tt=(e,i)=>lang()==='it'?i:e;
const L2=v=>Array.isArray(v)?tt(v[0],v[1]):String(v==null?'':v);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp01=v=>Math.max(0,Math.min(1,+v||0));

/* ---------- recording (called by the games) ---------- */
function push(ev){ev.t=Date.now();let p=J(PEND)||{};const a=p.st=Array.isArray(p.st)?p.st:[];a.push(ev);if(a.length>MAXEV)a.splice(0,a.length-MAXEV);
 try{localStorage.setItem(PEND,JSON.stringify(p))}catch(e){}}
/* a finished game: key, level, pct (0..1, null when the game has no maximum), raw score, rounds (each 0..1), perfect rounds, extras */
function game(g,l,o){o=o||{};try{const ev={k:'g',g,l:l||'all'};if(o.pct!=null)ev.p=Math.round(clamp01(o.pct)*1000)/1000;if(o.score!=null)ev.sc=+o.score||0;
  if(Array.isArray(o.rounds))ev.r=o.rounds.map(v=>Math.round(clamp01(v)*100)/100);if(o.perfect!=null)ev.pf=o.perfect|0;
  if(o.x)ev.x=o.x;if(o.err)ev.e=o.err;push(ev)}catch(e){}}
/* one answer in a course: game, category (e.g. the interval), its label [en,it], right at the first try or not */
function answer(g,c,ok,label){try{const ev={k:'a',g,ok:ok?1:0};if(c!=null)ev.c=String(c);if(label)ev.lb=label;push(ev)}catch(e){}}
/* the melody of the day, once per day */
function daily(o){try{push({k:'d',...o})}catch(e){}}

/* ---------- folding and merging ---------- */
const fresh=()=>({v:1,since:Date.now(),g:{},a:{},e:{},lb:{},d:null});
function fold(st,evs){st=st&&st.v?st:fresh();for(const ev of evs||[])try{one(st,ev)}catch(e){}return st}
function one(st,ev){
 if(ev.k==='g'){const G=st.g[ev.g]=st.g[ev.g]||{},L=G[ev.l]=G[ev.l]||{n:0,s:0,b:0,h:[],r:0,pf:0,sc:0,bs:0};L.n++;
  if(ev.p!=null){L.s+=ev.p;if(ev.p>L.b)L.b=ev.p;L.h.push(Math.round(ev.p*100));if(L.h.length>HIST)L.h.splice(0,L.h.length-HIST)}
  if(ev.sc!=null){L.sc+=ev.sc;if(ev.sc>L.bs)L.bs=ev.sc;if(ev.p==null){L.h.push(ev.sc);if(L.h.length>HIST)L.h.splice(0,L.h.length-HIST)}}
  if(ev.r){L.r+=ev.r.length;L.pf+=ev.pf!=null?ev.pf:ev.r.filter(v=>v>=.9).length}
  if(ev.x){L.x=L.x||{};for(const[k,v]of Object.entries(ev.x))if(isFinite(v)){const a=L.x[k]=L.x[k]||[0,0];a[0]+=+v;a[1]++}}
  if(ev.e){const E=st.e[ev.g]=st.e[ev.g]||{};for(const[k,v]of Object.entries(ev.e))E[k]=(E[k]|0)+(v|0)}
  if(!st.last||ev.t>st.last)st.last=ev.t;return}
 if(ev.k==='a'){const A=st.a[ev.g]=st.a[ev.g]||{n:0,ok:0,c:{}};A.n++;if(ev.ok)A.ok++;
  if(ev.c!=null){const C=A.c[ev.c]=A.c[ev.c]||[0,0];C[0]++;if(ev.ok)C[1]++;if(ev.lb){const B=st.lb[ev.g]=st.lb[ev.g]||{};B[ev.c]=ev.lb}}return}
 if(ev.k==='d'){const D=st.d=st.d||{n:0,w:0,t:[0,0,0,0,0,0],fg:0,fn:0,wn:[0,0,0,0,0,0,0],ww:[0,0,0,0,0,0,0],last:'',st:0,best:0};
  if(ev.day&&ev.day===D.last)return;D.last=ev.day||'';D.n++;const wd=Math.max(0,Math.min(6,ev.wd|0));D.wn[wd]++;
  if(ev.won){D.w++;D.t[Math.max(0,Math.min(5,(ev.n|0)-1))]++;D.ww[wd]++}
  D.fg+=ev.fg|0;D.fn+=ev.len|0;D.st=ev.st|0;D.best=Math.max(D.best|0,ev.best|0,D.st);
  if(!st.last||ev.t>st.last)st.last=ev.t}}
const nOf=o=>{let n=0;for(const L of Object.values(o||{}))n+=L&&L.n|0;return n};
function merge(a,b){if(!a||!a.v)return b&&b.v?b:a;if(!b||!b.v)return a;const o=fresh();o.since=Math.min(a.since||Date.now(),b.since||Date.now());o.last=Math.max(a.last||0,b.last||0);
 for(const k of new Set([...Object.keys(a.g||{}),...Object.keys(b.g||{})])){const x=(a.g||{})[k],y=(b.g||{})[k];o.g[k]=!x?y:!y?x:(nOf(y)>nOf(x)?y:x)}
 for(const k of new Set([...Object.keys(a.a||{}),...Object.keys(b.a||{})])){const x=(a.a||{})[k],y=(b.a||{})[k];o.a[k]=!x?y:!y?x:((y.n|0)>(x.n|0)?y:x)}
 for(const k of new Set([...Object.keys(a.e||{}),...Object.keys(b.e||{})])){const x=(a.e||{})[k]||{},y=(b.e||{})[k]||{},s=O=>Object.values(O).reduce((p,v)=>p+(v|0),0);o.e[k]=s(y)>s(x)?y:x}
 o.lb={...(b.lb||{}),...(a.lb||{})};
 o.d=!a.d?b.d:!b.d?a.d:((b.d.n|0)>(a.d.n|0)?b.d:a.d);if(o.d&&a.d&&b.d)o.d={...o.d,best:Math.max(a.d.best|0,b.d.best|0)};
 return o}

/* ---------- names ---------- */
const GN={daily:['Melody of the day','Melodia del giorno'],pitchStairs:['Pitch Stairs','Pitch Stairs'],pitchduo:['Pitch Stairs · two notes','Pitch Stairs · due note'],
 kitchen:['The kitchen','La cucina'],bedroom:['The bedroom','La camera'],window:['The window','La finestra'],bath:['The bathtub','La vasca'],drums:['The drums','La batteria'],
 abyss:['The abyss','L’abisso'],cadences:['Cadences','Cadenze'],intervals:['The maestros’ lessons · intervals','Le lezioni dei maestri · intervalli'],
 notes:['Reading music','Leggere le note'],harmony:['Harmony','Armonia'],drumschool:['Drum school','Scuola di batteria'],flipper:['Island pinball','Flipper dell’isola']};
const ORDER=['pitchStairs','pitchduo','kitchen','bedroom','window','bath','drums','abyss','cadences','intervals','notes','harmony','drumschool','flipper'];
const COURSES={intervals:1,notes:1,harmony:1,drumschool:1};
const LV={easy:['Easy','Facile'],medium:['Medium','Medio'],extreme:['Extreme','Extreme'],all:['Lessons','Lezioni']};
const ERR={p5:['Parallel fifths','Quinte parallele'],p8:['Parallel octaves/unisons','Ottave o unisoni paralleli'],hid:['Hidden fifths/octaves','Quinte o ottave nascoste'],
 cross:['Crossing/overlapping voices','Voci incrociate o sovrapposte'],range:['Voice out of range','Voce fuori estensione'],leap:['Awkward leaps','Salti difficili'],
 dbl:['Doublings','Raddoppi'],inc:['Incomplete chords','Accordi incompleti'],res:['Resolutions (7th, 9th, ♭6, ♯4…)','Risoluzioni (settima, nona, ♭6, ♯4…)'],
 chord:['Notes that make no chord','Note che non fanno un accordo'],spell:['Spelling','Grafia delle note'],cad:['Wrong or weak cadence','Cadenza sbagliata o debole'],
 req:['Chord asked for missing','Accordo richiesto mancante'],c64:['Cadential six-four','Quarta e sesta di cadenza'],space:['Too much space between voices','Troppo spazio tra le voci'],lt:['Leading tone that doesn’t rise','Sensibile che non sale'],other:['Other','Altro']};

/* ---------- the panel ---------- */
const pc=v=>Math.round(v*100)+'%';
function spark(h,max){if(!h||h.length<2)return'';const W=96,H=26,m=max||Math.max(...h,1),pts=h.map((v,i)=>`${(i/(h.length-1)*W).toFixed(1)},${(H-2-(v/m)*(H-4)).toFixed(1)}`).join(' ');
 return`<svg class="sp" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="#5b8f2a" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>`}
function trend(h){if(!h||h.length<4)return'';const k=Math.min(5,Math.floor(h.length/2)),a=h.slice(-k),b=h.slice(-2*k,-k),m=x=>x.reduce((p,v)=>p+v,0)/x.length,d=m(a)-m(b);
 const r=Math.abs(d)<Math.max(2,m(b)*.03)?['→',tt('steady','stabile'),'tr0']:d>0?['↗',tt('going up','in salita'),'tr1']:['↘',tt('a dip','in calo'),'tr2'];
 return`<span class="tr ${r[2]}" title="${tt('last','ultime')} ${k} ${tt('vs the','contro le')} ${k} ${tt('before','prima')}">${r[0]} ${r[1]}</span>`}
function bar(v,lab){return`<div class="br"><i style="width:${Math.round(v*100)}%"></i><b>${lab}</b></div>`}
const CSS=`#igStats{position:fixed;inset:0;z-index:9999;background:rgba(20,14,10,.55);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:max(14px,env(safe-area-inset-top)) 10px 30px;font-family:Fredoka,system-ui,sans-serif;color:#2b2018}
#igStats .cd{background:#fbf3e4;border:3px solid #2b2018;border-radius:20px;box-shadow:0 5px 0 #2b2018;max-width:620px;width:100%;padding:16px 16px 20px;position:relative}
#igStats h2{font:700 22px/1.15 Fredoka,system-ui,sans-serif;margin:2px 40px 2px 0}#igStats .who{font:500 13px/1.3 system-ui,sans-serif;color:#7a6450;margin:0 0 8px}
#igStats .x{position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:50%;border:2.5px solid #2b2018;background:#fff;color:#2b2018;font:700 22px/1 system-ui;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 0 #2b2018}
#igStats .say{background:#fff;border:2px solid #2b2018;border-radius:14px;padding:8px 12px;margin:6px 0 12px;font:500 15px/1.35 Fredoka,system-ui,sans-serif}
#igStats .tot{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 12px}#igStats .tot div{background:#fff;border:2px solid #2b2018;border-radius:12px;padding:7px 6px;text-align:center}
#igStats .tot b{display:block;font:700 22px/1.1 Fredoka,system-ui}#igStats .tot span{font:500 11.5px/1.2 system-ui;color:#6b5340}
#igStats section{background:#fff;border:2px solid #2b2018;border-radius:14px;padding:10px 12px 11px;margin:0 0 10px}#igStats section.off{opacity:.55}
#igStats h3{font:700 16.5px/1.2 Fredoka,system-ui;margin:0 0 6px}#igStats h3 small{font:500 12px system-ui;color:#7a6450;margin-left:6px}
#igStats table{width:100%;border-collapse:collapse;font:500 13px/1.25 system-ui,sans-serif}#igStats th{font-weight:600;color:#7a6450;text-align:left;padding:3px 4px;font-size:11.5px}#igStats td{padding:4px;border-top:1px solid #eadcc6;vertical-align:middle}
#igStats .n{text-align:right;font-variant-numeric:tabular-nums}#igStats .tr{font-size:12px;white-space:nowrap}#igStats .tr1{color:#3c7a1c}#igStats .tr2{color:#b5651d}#igStats .tr0{color:#7a6450}
#igStats .kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px 10px;margin:2px 0 8px}#igStats .kv div{font:500 12.5px/1.25 system-ui}#igStats .kv b{display:block;font:700 18px/1.15 Fredoka,system-ui}
#igStats .br{position:relative;height:20px;background:#f1e6d3;border-radius:6px;margin:3px 0;overflow:hidden}#igStats .br i{position:absolute;inset:0 auto 0 0;background:#bfe39a}#igStats .br b{position:relative;font:600 12px/20px system-ui;padding-left:7px}
#igStats .dist{display:grid;grid-template-columns:22px 1fr;gap:2px 6px;align-items:center;font:600 12px system-ui;margin:4px 0 8px}
#igStats .wk{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font:500 11px system-ui;margin:4px 0 6px}#igStats .wk div{background:#f6efe2;border-radius:8px;padding:4px 0}#igStats .wk b{display:block;font:700 14px Fredoka,system-ui}
#igStats p.m{font:500 12.5px/1.35 system-ui;margin:6px 0 0;color:#4a3a2c}#igStats .sp{vertical-align:middle}#igStats .priv{font:500 11.5px/1.3 system-ui;color:#7a6450;text-align:center;margin:10px 0 0}
@media (max-width:520px){#igStats .hs{display:none}#igStats table{font-size:12.5px}}`;
function sayLine(st,tot){const L=[];
 if(!tot)return tt('No games yet! Play any game and here you’ll see how your ears grow. Only you can see this page.','Ancora nessuna partita! Gioca a un gioco qualsiasi e qui vedrai crescere le tue orecchie. Questa pagina la vedi solo tu.');
 let up=0,all=0;for(const G of Object.values(st.g||{}))for(const L0 of Object.values(G)){if(!L0.h||L0.h.length<4)continue;all++;const k=Math.min(5,Math.floor(L0.h.length/2)),m=x=>x.reduce((p,v)=>p+v,0)/x.length;if(m(L0.h.slice(-k))>m(L0.h.slice(-2*k,-k)))up++}
 if(all&&up/all>=.5)L.push(tt('You’re getting better: my ears are clapping!','Stai migliorando: le mie orecchie applaudono!'),tt('Look at those arrows going up. Tofu ants for everyone!','Guarda quelle frecce che salgono. Formiche di tofu per tutti!'));
 L.push(tt('Every game trains your ears. I’ll eat an ant to celebrate.','Ogni partita allena l’orecchio. Io intanto festeggio con una formica.'),tt('Mistakes are just notes looking for the right place.','Gli errori sono solo note che cercano il posto giusto.'),tt('Numbers are nice, but the music is in your ears.','I numeri sono belli, ma la musica sta nelle tue orecchie.'));
 return L[Math.floor(Math.random()*L.length)]}
function dailyHTML(D){const T=GN.daily;if(!D||!D.n)return`<section class="off"><h3>🎵 ${L2(T)}</h3><p class="m">${tt('Not played yet. A new tiny melody every day!','Non ancora giocata. Ogni giorno una melodia nuova!')}</p></section>`;
 const mx=Math.max(1,...D.t),wdN=tt('Mon Tue Wed Thu Fri Sat Sun','Lun Mar Mer Gio Ven Sab Dom').split(' ');
 return`<section><h3>🎵 ${L2(T)}</h3><div class="kv">
 <div><b>${D.n}</b>${tt('days played','giorni giocati')}</div><div><b>${pc(D.w/D.n)}</b>${tt('melodies found','melodie trovate')}</div>
 <div><b>${pc(D.t[0]/D.n)}</b>${tt('found at the first try','trovate al primo colpo')}</div><div><b>${D.fn?pc(D.fg/D.fn):'—'}</b>${tt('green notes at the first try','note verdi al primo tentativo')}</div>
 <div><b>${D.st|0}</b>${tt('days in a row now','giorni di fila adesso')}</div><div><b>${D.best|0}</b>${tt('best streak','serie migliore')}</div></div>
 <div class="m" style="font:600 12px system-ui;margin:2px 0">${tt('Tries needed','Tentativi che ti sono serviti')}</div>
 <div class="dist">${D.t.map((v,i)=>`<span>${i+1}</span>${bar(v/mx,v)}`).join('')}<span>✗</span>${bar((D.n-D.w)/mx,D.n-D.w)}</div>
 <div class="m" style="font:600 12px system-ui;margin:2px 0">${tt('Found, day by day (Monday easy … Sunday hard)','Trovate, giorno per giorno (lunedì facile … domenica difficile)')}</div>
 <div class="wk">${D.wn.map((n,i)=>`<div>${wdN[i]}<b>${n?pc(D.ww[i]/n):'—'}</b></div>`).join('')}</div></section>`}
function gameHTML(k,st){const G=(st.g||{})[k],A=(st.a||{})[k],E=(st.e||{})[k],nm=L2(GN[k]||[k,k]),isC=COURSES[k];
 const n=nOf(G)+(G?0:0);if(!G&&!A)return`<section class="off"><h3>${esc(nm)}</h3><p class="m">${tt('Not played yet.','Non ancora giocato.')}</p></section>`;
 let h=`<section><h3>${esc(nm)}<small>${n} ${n===1?tt('game','partita'):(isC?tt('lessons','lezioni'):tt('games','partite'))}</small></h3>`;
 if(G){const rows=Object.entries(G).sort((a,b)=>['easy','medium','extreme','all'].indexOf(a[0])-['easy','medium','extreme','all'].indexOf(b[0]));const raw=k==='abyss'||k==='flipper';
  h+=`<table><tr><th>${isC?'':tt('Level','Livello')}</th><th class="n">${isC?tt('Lessons','Lezioni'):tt('Games','Partite')}</th><th class="n">${raw?tt('Average','Media'):tt('Average','Media')}</th><th class="n">${tt('Best','Record')}</th>${raw?'':`<th class="n hs">${isC?tt('Perfect','Perfette'):tt('Perfect rounds','Turni perfetti')}</th>`}<th>${tt('Lately','Ultimamente')}</th></tr>`;
  for(const[l,L]of rows){const avg=raw?Math.round(L.sc/Math.max(1,L.n)):(L.s/Math.max(1,L.n)),best=raw?L.bs:L.b;
   const perf=raw?'':(L.r?pc(L.pf/L.r):(isC&&L.h.length?pc(L.h.filter(v=>v>=100).length/L.h.length):'—'));
   h+=`<tr><td>${l==='all'?(raw?tt('points','punti'):''):esc(L2(LV[l]||[l,l]))}</td><td class="n">${L.n}</td><td class="n">${raw?avg:pc(avg)}</td><td class="n">${raw?best:pc(best)}</td>${raw?'':`<td class="n hs">${perf}</td>`}<td>${spark(L.h,raw?0:100)} ${trend(L.h)}</td></tr>`}
  h+='</table>';
  /* extras */
  const xs=[];for(const[l,L]of rows){if(!L.x)continue;
   if(L.x.cents&&L.x.cents[1])xs.push(`${L2(LV[l]||[l,l])}: ${tt('on average','in media')} <b>${Math.round(L.x.cents[0]/L.x.cents[1])} cent</b> ${tt('away from the note','di distanza dalla nota')}`);
   if(L.x.tm&&L.x.tm[1]){const ms=Math.round(L.x.tm[0]/L.x.tm[1]*1000);xs.push(Math.abs(ms)<12?tt('Your timing is right in the middle of the beat. Bravo!','Il tuo tempo è proprio al centro del battito. Bravo!'):ms>0?tt(`You tend to play a little <b>late</b> (${ms} ms on average).`,`Tendi a suonare un pochino <b>in ritardo</b> (${ms} ms in media).`):tt(`You tend to play a little <b>early</b> (${-ms} ms on average).`,`Tendi a suonare un pochino <b>in anticipo</b> (${-ms} ms in media).`))}
   if(L.x.lis&&L.x.lis[1])xs.push(`${L2(LV[l]||[l,l])}: ${tt('you listen','ascolti')} <b>${(L.x.lis[0]/L.x.lis[1]).toFixed(1)}</b> ${tt('times per round','volte per turno')}`)}
  if(xs.length)h+=xs.map(x=>`<p class="m">${x}</p>`).join('')}
 if(A&&A.n){h+=`<p class="m">${tt('Right at the first try','Giuste al primo colpo')}: <b>${pc(A.ok/A.n)}</b> (${A.ok}/${A.n})</p>`;
  const lb=(st.lb||{})[k]||{},cs=Object.entries(A.c||{}).filter(([,v])=>v[0]>=3).map(([c,v])=>({c,r:v[1]/v[0],n:v[0],l:lb[c]?L2(lb[c]):c}));
  const weak=cs.filter(o=>o.r<.8).sort((a,b)=>a.r-b.r).slice(0,3),strong=cs.filter(o=>o.r>=.9).sort((a,b)=>b.r-a.r||b.n-a.n).slice(0,3);
  if(strong.length)h+=`<p class="m">💪 ${tt('Your strong points','I tuoi punti forti')}: ${strong.map(o=>`${esc(o.l)} <b>${pc(o.r)}</b>`).join(', ')}</p>`;
  if(weak.length)h+=`<p class="m">🎯 ${tt('To practise','Da allenare')}: ${weak.map(o=>`${esc(o.l)} <b>${pc(o.r)}</b>`).join(', ')}</p>`}
 if(E){const es=Object.entries(E).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,3);
  if(es.length)h+=`<p class="m">🎯 ${tt('The voice-leading slips that come back most often','Gli errori di condotta che ritornano più spesso')}: ${es.map(([c,v])=>`${esc(L2(ERR[c]||[c,c]))} <b>×${v}</b>`).join(', ')}</p>`}
 return h+'</section>'}
function open(o){o=o||{};close();const s=o.s||J('igortime_v1')||{};let st=s.stats&&s.stats.v?JSON.parse(JSON.stringify(s.stats)):fresh();
 if(o.pend!==false){const p=J(PEND);if(p&&Array.isArray(p.st)&&p.st.length)st=fold(st,p.st)}
 let tot=0,rr=0,pf=0;for(const G of Object.values(st.g||{}))for(const L of Object.values(G)){tot+=L.n|0;rr+=L.r|0;pf+=L.pf|0}if(st.d)tot+=st.d.n|0;
 let an=0,ao=0;for(const A of Object.values(st.a||{})){an+=A.n|0;ao+=A.ok|0}
 if(!document.getElementById('igStatsCss')){const c=document.createElement('style');c.id='igStatsCss';c.textContent=CSS;document.head.appendChild(c)}
 const W=document.createElement('div');W.id='igStats';W.setAttribute('role','dialog');W.setAttribute('aria-label',tt('My stats','Le mie statistiche'));
 const since=st.since?new Date(st.since).toLocaleDateString(lang()==='it'?'it-IT':'en-GB',{day:'numeric',month:'long',year:'numeric'}):'';
 W.innerHTML=`<div class="cd"><button class="x" type="button" aria-label="${tt('Close','Chiudi')}">×</button>
 <h2>📊 ${o.who?esc(tt('Stats of ','Statistiche di ')+o.who):tt('My stats','Le mie statistiche')}</h2>
 <p class="who">${o.who?tt('Admin view: the player can’t see that you are looking.','Vista admin: il giocatore non vede che stai guardando.'):tt('Only you can see these numbers.','Questi numeri li vedi solo tu.')}${since?' '+tt('Counting since ','Contate dal ')+since+'.':''}</p>
 ${o.who?'':`<div class="say">🐜 ${esc(sayLine(st,tot))}</div>`}
 <div class="tot"><div><b>${tot}</b><span>${tt('games and melodies','partite e melodie')}</span></div><div><b>${rr?pc(pf/rr):'—'}</b><span>${tt('perfect rounds','turni perfetti')}</span></div><div><b>${an?pc(ao/an):'—'}</b><span>${tt('lesson answers right at the first try','risposte delle lezioni giuste al primo colpo')}</span></div></div>
 ${dailyHTML(st.d)}${ORDER.map(k=>gameHTML(k,st)).join('')}
 <p class="priv">${tt('Perfect round = 90% or more. “Lately” compares your last games with the ones before.','Turno perfetto = 90% o più. “Ultimamente” confronta le tue ultime partite con quelle di prima.')}</p></div>`;
 document.body.appendChild(W);W.querySelector('.x').onclick=close;W.addEventListener('click',e=>{if(e.target===W)close()});
 addEventListener('keydown',esc_,true);return W}
function esc_(e){if(e.key==='Escape'&&document.getElementById('igStats')){e.stopPropagation();close()}}
function close(){const W=document.getElementById('igStats');if(W)W.remove();removeEventListener('keydown',esc_,true)}

window.IgorStats={game,answer,daily,fold,merge,open,close,fresh};
})();

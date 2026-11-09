/* Igor Time — who is on the site right now (for the admins' panel).
   Every open page writes pres/<device id> = {g: where, u: uid or '', n: nickname, l: language, m: phone?, at: server time}
   every 90 s while visible, with a light REST call (no Firebase SDK, so the games stay light).
   Only the admins can read the collection (Firestore rules "pres"). Accounts are read from localStorage igortime_acct. */
(()=>{if(window.IgorPres)return;
const P='igortime-f69b3',K='AIzaSyBcUoKJT0s_kHpydzjr5qIsxh5AXTurw-0',EVERY=90000;
const A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let id='';try{id=localStorage.getItem('igortime_pid')||''}catch(e){}
if(!/^[A-Za-z0-9]{16}$/.test(id)){id='';const r=new Uint32Array(16);crypto.getRandomValues(r);for(const v of r)id+=A[v%62];try{localStorage.setItem('igortime_pid',id)}catch(e){}}
const PAGES={'':'island','island':'island','games':'games','kitchen':'kitchen','window':'window','bedroom':'bedroom','drums':'drums','pitch-stairs':'pitch','cadences':'cadences','abyss':'abyss'};
function place(){const seg=(location.pathname.split('/').filter(Boolean)[0]||'');let g=PAGES[seg]||('other');
 if(g==='island'&&typeof window.__where==='function'){try{const w=window.__where();if(w&&w!=='out')g='island:'+String(w).slice(0,16)}catch(e){}}return g}
let last=0,lastG='',busy=false;
async function beat(force){if(document.visibilityState!=='visible')return;const g=place(),now=Date.now();
 if(busy||(!force&&g===lastG&&now-last<EVERY-2000)||now-last<20500)return;busy=true;
 let a=null;try{a=JSON.parse(localStorage.getItem('igortime_acct')||'null')}catch(e){}
 let l='en';try{l=(localStorage.getItem('igortime_lang')||navigator.language||'en').slice(0,2).toLowerCase()}catch(e){}
 const m=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
 const f={g:{stringValue:g},u:{stringValue:a&&a.uid?String(a.uid).slice(0,40):''},n:{stringValue:a&&a.name?String(a.name).slice(0,16):''},l:{stringValue:l==='it'?'it':'en'},m:{booleanValue:m}};
 const body={writes:[{update:{name:`projects/${P}/databases/(default)/documents/pres/${id}`,fields:f},updateTransforms:[{fieldPath:'at',setToServerValue:'REQUEST_TIME'}]}]};
 try{const r=await fetch(`https://firestore.googleapis.com/v1/projects/${P}/databases/(default)/documents:commit?key=${K}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),keepalive:true});if(r.ok){last=now;lastG=g}}catch(e){}
 busy=false}
setInterval(()=>beat(false),5000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')beat(true)});
setTimeout(()=>beat(true),1500);
window.IgorPres={id,beat:()=>beat(true)};
})();

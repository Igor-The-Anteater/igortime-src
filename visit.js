/* Igor Time — visits between friends (Nov 2026).
   islands/{uid}: a copy of each player's island that only their friends (from the chat) can read.
   visits/{host}/in/{visitor_day_kind}: the kind things a friend did while visiting (one of each kind per day), collected by the host.
   trades/{id}: shell trades between friends; the offered shell is set aside until the other one answers.
   Loaded by the island (index.html) with import('/visit.js'). */
const V='10.12.2',G='https://www.gstatic.com/firebasejs/'+V+'/';
const[{getApps,getApp},{getAuth},F]=await Promise.all([import(G+'firebase-app.js'),import(G+'firebase-auth.js'),import(G+'firebase-firestore.js')]);
const{getFirestore,doc,getDoc,setDoc,updateDoc,deleteDoc,collection,query,where,getDocs,serverTimestamp}=F;
const app=getApp(),auth=getAuth(app),db=getFirestore(app);
const me=()=>auth.currentUser&&auth.currentUser.uid;
const day=()=>Math.floor(Date.now()/864e5);
let pubT=0,pubLast='',pubBusy=false;
/* what friends see of my island: the farm without the private bits */
function compact(S){const f=JSON.parse(JSON.stringify(S.farm||{}));for(const k of['log','gifts','gp','evDone','msgs'])delete f[k];
 if(f.fun){for(const k of['beach','ft','hun','wish','wnext','fr','msgs','bottles'])delete f.fun[k]}return JSON.stringify({farm:f})}
export function publish(S,nick,av){const uid=me();if(!uid||!S||!S.farm)return;const j=compact(S);if(j===pubLast)return;clearTimeout(pubT);
 pubT=setTimeout(async()=>{if(pubBusy)return;pubBusy=true;try{if(j.length<480000){await setDoc(doc(db,'islands',uid),{nick:String(nick||'').slice(0,16)||'?',av:av||{},j,at:serverTimestamp()});pubLast=j}}catch(e){console.warn('island copy',e&&e.code||e)}finally{pubBusy=false}},4000)}
export async function fetchIsland(uid){const s=await getDoc(doc(db,'islands',uid));if(!s.exists())throw new Error('none');const d=s.data();return{nick:d.nick,av:d.av,data:JSON.parse(d.j)}}
export async function friends(){const uid=me();if(!uid)return[];const s=await getDocs(query(collection(db,'friends'),where('u','array-contains',uid)));const out=[];
 let bl=new Set();try{const b=await getDocs(query(collection(db,'blocks'),where('by','==',uid)));b.forEach(d=>bl.add(d.data().who))}catch(e){}
 for(const d of s.docs){const o=d.data().u.find(x=>x!==uid);if(bl.has(o))continue;let p=null;try{const q=await getDoc(doc(db,'profiles',o));if(q.exists())p=q.data()}catch(e){}
  let isl=false;try{isl=(await getDoc(doc(db,'islands',o))).exists()}catch(e){}out.push({uid:o,nick:p?p.nick:'?',av:p?p.av:{},island:isl})}
 return out.sort((a,b)=>a.nick.localeCompare(b.nick))}
/* a kind gesture on a friend's island: false if already done today */
export async function send(host,k,d,nick){const uid=me();if(!uid)throw new Error('auth');const dd=day(),id=`${uid}_${dd}_${k}`;
 try{await setDoc(doc(db,'visits',host,'in',id),{by:uid,nick:String(nick||'').slice(0,16)||'?',k,day:dd,at:serverTimestamp(),d:d||{}});return true}
 catch(e){if(e&&e.code==='permission-denied'){try{const s=await getDoc(doc(db,'visits',host,'in',id));if(s.exists())return false}catch(_){return false}}throw e}}
export async function inbox(){const uid=me();if(!uid)return[];const s=await getDocs(collection(db,'visits',uid,'in'));return s.docs.map(d=>({id:d.id,...d.data()}))}
export async function ack(ids){const uid=me();if(!uid)return;for(const id of ids)try{await deleteDoc(doc(db,'visits',uid,'in',id))}catch(e){console.warn('ack',e&&e.code||e)}}
/* shell trades */
export async function propose(to,toNick,give,want,nick){const uid=me();if(!uid)throw new Error('auth');const ref=doc(collection(db,'trades'));
 await setDoc(ref,{from:uid,to,fromNick:String(nick||'').slice(0,16)||'?',toNick:String(toNick||'').slice(0,16)||'?',give,want,st:'open',at:serverTimestamp()});return ref.id}
export async function trades(){const uid=me();if(!uid)return{forMe:[],mine:[]};
 const a=await getDocs(query(collection(db,'trades'),where('to','==',uid),where('st','==','open')));
 const b=await getDocs(query(collection(db,'trades'),where('from','==',uid)));
 return{forMe:a.docs.map(d=>({id:d.id,...d.data()})),mine:b.docs.map(d=>({id:d.id,...d.data()})).filter(t=>t.st==='acc'||t.st==='rej'||t.st==='open')}}
export const answer=(id,ok)=>updateDoc(doc(db,'trades',id),{st:ok?'acc':'rej'});
export const close=id=>updateDoc(doc(db,'trades',id),{st:'done'});
export const cancel=id=>updateDoc(doc(db,'trades',id),{st:'cancel'});
export const uid=me;

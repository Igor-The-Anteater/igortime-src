/* Igor Time — the admins look at a player's island (11 Nov 2026).
   Opened by the island with ?inspect=<uid> (only for the admins): the player's own save (users/<uid>, admins may read it), followed live.
   watch/<uid> {until, by, at}: an admin is looking (for at most 10 minutes at a time, renewed while the page is open);
     the player's island (staff.js) then writes live/<uid> every ~1.5 s: where Igor is, the vehicle, the Igorlets, the game they go to.
   Nothing is ever written to the player's save. Loaded by index.html with import('/inspect.js'). */
const V='10.12.2',G='https://www.gstatic.com/firebasejs/'+V+'/';
const[{getApp},{getAuth},F]=await Promise.all([import(G+'firebase-app.js'),import(G+'firebase-auth.js'),import(G+'firebase-firestore.js')]);
const{getFirestore,doc,getDoc,setDoc,onSnapshot,collection,query,where,getDocs,Timestamp,serverTimestamp}=F;
const app=getApp(),auth=getAuth(app),db=getFirestore(app);
const ADMINS=['suJRvYnJ8TZsrtggf88oxTCgKI42','vKhCdacBFoOn8al4qCMz9VioWle2'];
const me=()=>auth.currentUser&&auth.currentUser.uid;
export const isAdmin=()=>ADMINS.includes(me());
const ms=t=>t&&t.toMillis?t.toMillis():(typeof t==='number'?t:0);
export async function load(uid){const s=await getDoc(doc(db,'users',uid));if(!s.exists())throw new Error('none');const d=s.data();let nick=d.nick||d.name||'';
 if(!nick)try{const a=await getDoc(doc(db,'accts',uid));if(a.exists())nick=a.data().nick||''}catch(e){}
 d.savedAt=ms(d.updated)||d.at||0;delete d.updated;return{...d,nick:nick||'?'}}
export function onSave(uid,cb){return onSnapshot(doc(db,'users',uid),s=>{if(!s.exists())return;const d=s.data();d.savedAt=ms(d.updated)||d.at||0;delete d.updated;cb(d)},e=>console.warn('inspect save',e&&e.code||e))}
export function onLive(uid,cb){return onSnapshot(doc(db,'live',uid),s=>cb(s.exists()?s.data():null),e=>{console.warn('inspect live',e&&e.code||e);cb({err:e&&e.code||'err'})})}
/* min = 0 stops watching */
export async function watch(uid,min){if(!isAdmin())return;try{await setDoc(doc(db,'watch',uid),{until:min>0?Date.now()+min*60000:0,by:me(),at:serverTimestamp()})}catch(e){console.warn('watch',e&&e.code||e);throw e}}
export async function pres(uid){const cut=Timestamp.fromMillis(Date.now()-180000);try{const s=await getDocs(query(collection(db,'pres'),where('at','>',cut)));
 return s.docs.map(d=>d.data()).filter(x=>x.u===uid).map(x=>({g:x.g||'other',m:!!x.m,at:ms(x.at)})).sort((a,b)=>b.at-a.at)}catch(e){console.warn('pres',e&&e.code||e);return[]}}

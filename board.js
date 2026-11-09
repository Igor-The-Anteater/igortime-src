/* Igor Time — leaderboards for every game and for the island.
   Firestore: one collection per board, b_<game>_<level> (b_island_all for the island), one document per player
   {nick, score, avatar, at}; each player writes only their own best. The abyss keeps its own collection "abyss".
   Used by the games (end screen) and by the island's notice board:  import('/board.js').then(B=>B.show(el,game,level,score))
   Needs the Firestore rules that allow b_* collections (see the project notes). */
import{initializeApp,getApps,getApp}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import{getAuth,onAuthStateChanged}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import{getFirestore,collection,query,orderBy,limit,getDocs,doc,getDoc,setDoc,serverTimestamp}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
const CFG={apiKey:"AIzaSyBcUoKJT0s_kHpydzjr5qIsxh5AXTurw-0",authDomain:"igortime-f69b3.firebaseapp.com",projectId:"igortime-f69b3",storageBucket:"igortime-f69b3.firebasestorage.app",messagingSenderId:"191774217559",appId:"1:191774217559:web:1604f911cbb70652321a12"};
const app=getApps().length?getApp():initializeApp(CFG),auth=getAuth(app),db=getFirestore(app);
let user=null,authed;const authReady=new Promise(r=>authed=r);onAuthStateChanged(auth,u=>{user=u;authed()});
const IT=(()=>{try{return(localStorage.getItem('igortime_lang')||navigator.language||'').toLowerCase().startsWith('it')}catch(e){return false}})();
const tt=(en,it)=>IT?it:en;
const col=(g,l)=>g==='abyss'?'abyss':`b_${g}_${l||'all'}`;
let nickC=null;
async function nick(){if(!user)return'';if(nickC!==null)return nickC;try{const u=await getDoc(doc(db,'users',user.uid));nickC=u.exists()&&u.data().nick||''}catch(e){nickC=''}return nickC}
export async function me(){await authReady;return user?user.uid:null}
export async function top(g,l,n=10){const q=await getDocs(query(collection(db,col(g,l)),orderBy('score','desc'),limit(n)));return q.docs.map(d=>({uid:d.id,n:d.data().nick,s:d.data().score}))}
export async function submit(g,l,score,avatar){await authReady;if(!user)return'guest';const nk=await nick();if(!nk)return'nonick';score=Math.floor(+score||0);if(score<=0)return'zero';
 const ref=doc(db,col(g,l),user.uid);let cur=null;try{cur=await getDoc(ref)}catch(e){}
 if(cur&&cur.exists()&&cur.data().score>=score){if(cur.data().nick!==nk)try{await setDoc(ref,{nick:nk},{merge:true})}catch(e){}return'lower'}
 await setDoc(ref,{nick:nk,score,avatar:String(avatar||'igor'),at:serverTimestamp()});return'ok'}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
if(!document.getElementById('ibdCss')){const st=document.createElement('style');st.id='ibdCss';st.textContent=`.ibd{margin:12px auto 4px;max-width:24rem;text-align:left;border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:10px 12px;background:rgba(255,255,255,.06);font-size:14px;line-height:1.35}
.ibd h4{margin:0 0 6px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;opacity:.8;font-weight:600}.ibd ol{margin:0;padding:0;list-style:none}.ibd li{display:flex;gap:8px;padding:3px 4px;border-radius:8px}
.ibd li b{width:1.6em;text-align:right;opacity:.7;font-weight:600}.ibd li span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ibd li i{font-style:normal;font-variant-numeric:tabular-nums;font-weight:600}
.ibd li.me{background:rgba(246,211,74,.22)}.ibd p{margin:6px 0 0;font-size:12.5px;opacity:.8}`;document.head.appendChild(st)}
function list(rows,mine){if(!rows.length)return`<p>${tt('Nobody yet: be the first!','Ancora nessuno: sii il primo!')}</p>`;
 return'<ol>'+rows.map((r,k)=>`<li class="${r.uid===mine?'me':''}"><b>${k+1}</b><span>${esc(r.n||'?')}</span><i>${r.s}</i></li>`).join('')+'</ol>'}
/* a little board inside an element: sends the score (if signed in), then shows the top 10 */
export async function show(el,g,l,score,avatar,title){if(!el)return;let box=el.querySelector('.ibd');if(!box){box=document.createElement('div');box.className='ibd';el.appendChild(box)}
 box.innerHTML=`<h4>${esc(title||tt('Leaderboard · everyone','Classifica · tutti'))}</h4><p>${tt('Loading…','Carico…')}</p>`;
 let res='';try{if(score!=null)res=await submit(g,l,score,avatar)}catch(e){res='err'}
 const mine=await me();let rows=null;try{rows=await top(g,l)}catch(e){rows=null}
 const note=res==='guest'?tt('Sign in on the island to enter the leaderboard.','Accedi sull’isola per entrare in classifica.'):res==='nonick'?tt('Choose a nickname on the island to enter the leaderboard.','Scegli un nickname sull’isola per entrare in classifica.'):res==='err'?tt('Could not save your score right now.','Non riesco a salvare il punteggio adesso.'):'';
 box.innerHTML=`<h4>${esc(title||tt('Leaderboard · everyone','Classifica · tutti'))}</h4>`+(rows?list(rows,mine):`<p>${tt('The leaderboard is not reachable right now.','La classifica adesso non si raggiunge.')}</p>`)+(note?`<p>${note}</p>`:'')}
window.IgorBoard={me,top,submit,show};

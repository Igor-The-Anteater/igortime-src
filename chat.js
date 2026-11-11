/* ---------- Firestore backend (the preview replaces it with window.IgorChatFake) ---------- */
async function firestoreBackend(){
 const V='10.12.2',G='https://www.gstatic.com/firebasejs/'+V+'/';
 const[{initializeApp,getApps,getApp},{getAuth,onAuthStateChanged},F]=await Promise.all([import(G+'firebase-app.js'),import(G+'firebase-auth.js'),import(G+'firebase-firestore.js')]);
 const{getFirestore,doc,getDoc,setDoc,updateDoc,deleteDoc,collection,query,where,orderBy,limit,startAt,endAt,getDocs,onSnapshot,writeBatch,serverTimestamp,increment,Timestamp}=F;
 const CFG={apiKey:"AIzaSyBcUoKJT0s_kHpydzjr5qIsxh5AXTurw-0",authDomain:"igortime-f69b3.firebaseapp.com",projectId:"igortime-f69b3",storageBucket:"igortime-f69b3.firebasestorage.app",messagingSenderId:"191774217559",appId:"1:191774217559:web:1604f911cbb70652321a12"};
 const app=getApps().length?getApp():initializeApp(CFG),auth=getAuth(app),db=getFirestore(app);
 const ADMINS=['suJRvYnJ8TZsrtggf88oxTCgKI42','vKhCdacBFoOn8al4qCMz9VioWle2'];
 let U=null;
 const D=(...p)=>doc(db,...p),pair=(a,b)=>a<b?a+'_'+b:b+'_'+a;
 const ms=t=>t&&t.toMillis?t.toMillis():(typeof t==='number'?t:0);
 const days=n=>Timestamp.fromMillis(Date.now()+n*864e5);
 const todayUTC=()=>{const d=new Date();return Timestamp.fromMillis(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()))};
 const CODE='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 return{
  onAuth(cb){return onAuthStateChanged(auth,async u=>{if(!u){U=null;cb(null);return}let nick='';
   for(let k=0;k<4&&!nick;k++){if(k)await new Promise(r=>setTimeout(r,700*k));
    try{const s=await getDoc(D('users',u.uid));if(s.exists())nick=s.data().nick||''}catch(e){console.warn('chat nick',e&&e.code||e)}
    if(!nick){try{const p=await getDoc(D('profiles',u.uid));if(p.exists())nick=p.data().nick||''}catch(e){}}
    if(!nick&&window.IgorCloud&&window.IgorCloud.user)nick=window.IgorCloud.user.nick||''}
   U={uid:u.uid,nick:String(nick).slice(0,16),admin:ADMINS.includes(u.uid)};cb(U)})},
  user:()=>U,
  async profile(){let err;for(let k=0;k<3;k++){try{const s=await getDoc(D('profiles',U.uid));return s.exists()?s.data():null}catch(e){err=e;console.warn('chat profile',e&&e.code||e);await new Promise(r=>setTimeout(r,800*(k+1)))}}throw err},
  async suspended(){try{return(await getDoc(D('susp',U.uid))).exists()}catch(e){return false}},
  async join(req,av){await setDoc(D('profiles',U.uid),{nick:U.nick,av,seen:serverTimestamp(),req,age14:serverTimestamp()});
   const b=writeBatch(db);if(req==='all')b.set(D('dir',U.uid),{nick:U.nick,nickL:U.nick.toLowerCase(),av});await b.commit();await this.myCode()},
  async syncMe(p,av){const ch=p.nick!==U.nick||JSON.stringify(p.av)!==JSON.stringify(av);if(!ch)return;
   await updateDoc(D('profiles',U.uid),{nick:U.nick,av});if(p.req==='all')await setDoc(D('dir',U.uid),{nick:U.nick,nickL:U.nick.toLowerCase(),av})},
  async setReq(req,av){await updateDoc(D('profiles',U.uid),{req});if(req==='all')await setDoc(D('dir',U.uid),{nick:U.nick,nickL:U.nick.toLowerCase(),av});else await deleteDoc(D('dir',U.uid))},
  ping(){return updateDoc(D('profiles',U.uid),{seen:serverTimestamp()})},
  async myCode(){const p=await getDoc(D('priv',U.uid));if(p.exists()&&p.data().code)return p.data().code;
   for(let k=0;k<6;k++){let c='';for(let i=0;i<6;i++)c+=CODE[Math.floor(Math.random()*CODE.length)];
    try{const ex=await getDoc(D('codes',c));if(ex.exists())continue;await setDoc(D('codes',c),{uid:U.uid});await setDoc(D('priv',U.uid),{code:c});return c}catch(e){console.warn('code',e)}}
   return''},
  async leave(friendPairs){const p=await getDoc(D('priv',U.uid));const code=p.exists()&&p.data().code;
   for(const f of friendPairs)try{await deleteDoc(D('friends',f))}catch(e){}
   try{await deleteDoc(D('dir',U.uid))}catch(e){}if(code)try{await deleteDoc(D('codes',code))}catch(e){}
   try{await deleteDoc(D('priv',U.uid))}catch(e){}await deleteDoc(D('profiles',U.uid))},
  async search(q){q=q.toLowerCase();const s=await getDocs(query(collection(db,'dir'),orderBy('nickL'),startAt(q),endAt(q+''),limit(20)));
   return s.docs.map(d=>({uid:d.id,nick:d.data().nick,av:d.data().av}))},
  async byCode(c){const s=await getDoc(D('codes',c.toUpperCase()));if(!s.exists())return null;const uid=s.data().uid;
   return{uid,nick:'',av:null}},
  async request(to,via,toNick,toAv,myAv){const id=U.uid+'_'+to,rlRef=D('rl',U.uid),day=todayUTC();let n=1;
   try{const r=await getDoc(rlRef);if(r.exists()&&ms(r.data().d)===ms(day))n=(r.data().n||0)+1}catch(e){}
   if(n>10)throw new Error('limit');
   const b=writeBatch(db);b.set(rlRef,{d:day,n,last:id});
   b.set(D('reqs',id),{from:U.uid,to,fromNick:U.nick,fromAv:myAv,toNick:toNick||'',toAv:toAv||{},via,at:serverTimestamp()});await b.commit()},
  onReqs(cb){let a=[],b=[];const out=()=>cb(a,b);
   const m=d=>({id:d.id,...d.data(),at:ms(d.data().at)});
   const u1=onSnapshot(query(collection(db,'reqs'),where('to','==',U.uid)),s=>{a=s.docs.map(m);out()},e=>console.warn('reqs in',e));
   const u2=onSnapshot(query(collection(db,'reqs'),where('from','==',U.uid)),s=>{b=s.docs.map(m);out()},e=>console.warn('reqs out',e));
   return()=>{u1();u2()}},
  async accept(r){const u=[r.from,U.uid].sort(),p=u.join('_'),b=writeBatch(db);
   b.set(D('friends',p),{u,at:serverTimestamp(),un:{[u[0]]:0,[u[1]]:0},last:{}});b.delete(D('reqs',r.id));await b.commit()},
  decline:r=>deleteDoc(D('reqs',r.id)),
  onFriends(cb){return onSnapshot(query(collection(db,'friends'),where('u','array-contains',U.uid)),s=>cb(s.docs.map(d=>{const x=d.data();
   return{pair:d.id,other:x.u.find(v=>v!==U.uid),un:(x.un&&x.un[U.uid])||0,last:x.last&&x.last.at?ms(x.last.at):ms(x.at)}})),e=>console.warn('friends',e))},
  async getProfile(uid){try{const s=await getDoc(D('profiles',uid));if(!s.exists())return null;const x=s.data();return{nick:x.nick,av:x.av,seen:ms(x.seen)}}catch(e){return null}},
  onProfile(uid,cb){return onSnapshot(D('profiles',uid),s=>{if(!s.exists())return cb(null);const x=s.data();cb({nick:x.nick,av:x.av,seen:ms(x.seen)})},()=>cb(null))},
  onMsgs(p,cb){return onSnapshot(query(collection(db,'friends',p,'msgs'),orderBy('at','desc'),limit(60)),s=>cb(s.docs.map(d=>{const x=d.data();
   return{id:d.id,f:x.f,to:x.to,t:x.t,at:ms(x.at)||Date.now(),rd:ms(x.rd),hold:!!x.hold}}).reverse()),e=>console.warn('msgs',e))},
  async send(p,to,t){const b=writeBatch(db),r=doc(collection(db,'friends',p,'msgs'));
   b.set(r,{f:U.uid,to,t,at:serverTimestamp(),exp:days(365),rd:null,hold:false});
   b.update(D('friends',p),{['un.'+to]:increment(1),last:{f:U.uid,at:serverTimestamp()}});await b.commit()},
  async markRead(p,list){const mine=list.filter(m=>m.to===U.uid&&!m.rd);
   try{await updateDoc(D('friends',p),{['un.'+U.uid]:0})}catch(e){}
   for(let i=0;i<mine.length;i+=200){const b=writeBatch(db);for(const m of mine.slice(i,i+200))b.update(D('friends',p,'msgs',m.id),{rd:serverTimestamp(),exp:m.hold?null:days(90)});try{await b.commit()}catch(e){console.warn('read',e)}}},
  unfriend:p=>deleteDoc(D('friends',p)),
  block:(uid,nick)=>setDoc(D('blocks',U.uid+'_'+uid),{by:U.uid,who:uid,nick:nick||'',at:serverTimestamp()}),
  unblock:uid=>deleteDoc(D('blocks',U.uid+'_'+uid)),
  onBlocks(cb){return onSnapshot(query(collection(db,'blocks'),where('by','==',U.uid)),s=>cb(s.docs.map(d=>({uid:d.data().who,nick:d.data().nick}))),e=>console.warn('blocks',e))},
  async report(o){const held=[];
   if(o.pair&&o.msgs.length){const b=writeBatch(db);for(const m of o.msgs){b.update(D('friends',o.pair,'msgs',m.id),{hold:true,exp:null});held.push(m.id)}try{await b.commit()}catch(e){console.warn('hold',e)}}
   const r=doc(collection(db,'reports'));
   await setDoc(r,{by:U.uid,byNick:U.nick,who:o.who,whoNick:o.whoNick||'',pair:o.pair||'',why:o.why,note:o.note||'',
    msgs:o.msgs.map(m=>({id:m.id,f:m.f,t:String(m.t).slice(0,500),at:Timestamp.fromMillis(m.at||Date.now())})),at:serverTimestamp(),st:'open'});
   try{fetch('/api/report',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:r.id,token:await auth.currentUser.getIdToken()})}).catch(()=>{})}catch(e){}},
  onReports(cb){return onSnapshot(query(collection(db,'reports'),orderBy('at','desc'),limit(100)),s=>cb(s.docs.map(d=>{const x=d.data();
   return{id:d.id,...x,at:ms(x.at),msgs:(x.msgs||[]).map(m=>({...m,at:ms(m.at)}))}})),e=>console.warn('reports',e))},
  async archive(r,open){await updateDoc(D('reports',r.id),{st:open?'open':'archived'});
   if(!open&&r.pair){for(const m of r.msgs){if(!m.id)continue;try{const s=await getDoc(D('friends',r.pair,'msgs',m.id));if(!s.exists())continue;
    await updateDoc(s.ref,{hold:false,exp:days(s.data().rd?90:365)})}catch(e){console.warn('unhold',e)}}}},
  async isSusp(uid){try{return(await getDoc(D('susp',uid))).exists()}catch(e){return false}},
  setSusp:(uid,on,nick)=>on?setDoc(D('susp',uid),{at:serverTimestamp(),nick:nick||''}):deleteDoc(D('susp',uid))
 }}

/* Igor Time — the chat between friends.
   Opens from the 💬 button on the island (#chatB) or with window.IgorChat.open().
   Rules: 14+ declared, friends only (request + accept), block and report, reports read by the admins in the game.
   Data: Firestore (see the Firestore rules "Chat di Igor Time"). Messages: unread up to 1 year, read 90 days, reported kept until review. */
(()=>{if(window.IgorChat)return;
let LANG='en';try{LANG=localStorage.getItem('igortime_lang')||((navigator.language||'').toLowerCase().startsWith('it')?'it':'en')}catch(e){}
const tt=(en,it)=>LANG==='it'?it:en;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);

/* ---------- Igor's drawing (copied from /house/kit.js at build time) ---------- */
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=u=>u*u*(3-2*u);
const AVN={igor:'Igor',she:'Shigor',queer:'Queegor'};
const SW=420,SH=462,SC=SW/663;
const EYES=[{x:465,y:233,rx:41,ry:45},{x:538.5,y:225,rx:34.5,ry:41}];
const SKIN='#a8d621';
const igorImg=new Image();let igorOK=false;
function lid(c,e,k){k=k*k*(3-2*k);const top=e.y-e.ry-3,bot=e.y+e.ry+3,m=e.y+e.ry*.3,Lu=top+(m-top)*k,Ll=bot-(bot-m)*k,bend=9*k,Lx=e.x-e.rx-4,Rx=e.x+e.rx+4;
 c.save();c.beginPath();c.ellipse(e.x,e.y,e.rx+1,e.ry+1,0,0,TAU);c.clip();c.fillStyle=SKIN;
 c.beginPath();c.moveTo(Lx,top);c.lineTo(Rx,top);c.lineTo(Rx,Lu);c.quadraticCurveTo(e.x,Lu+bend*2,Lx,Lu);c.closePath();c.fill();
 c.beginPath();c.moveTo(Lx,bot);c.lineTo(Rx,bot);c.lineTo(Rx,Ll);c.quadraticCurveTo(e.x,Ll+bend*2,Lx,Ll);c.closePath();c.fill();
 if(k>.02){c.strokeStyle='#111';c.lineCap='round';c.lineWidth=4.5;c.beginPath();c.moveTo(Lx,Lu);c.quadraticCurveTo(e.x,Lu+bend*2,Rx,Lu);c.stroke()}
 c.restore();return Lu-top}
function lashes(c,e,dy,n){c.save();c.strokeStyle='#111';c.lineCap='round';c.lineWidth=5.5;
 for(let i=0;i<n;i++){const a=(-120+i*(60/(Math.max(n,2)-1)))*Math.PI/180;c.beginPath();c.moveTo(e.x+e.rx*1.02*Math.cos(a),e.y+e.ry*1.02*Math.sin(a)+dy);c.lineTo(e.x+(e.rx+18)*Math.cos(a-.12),e.y+(e.ry+18)*Math.sin(a-.12)+dy*1.2);c.stroke()}c.restore()}
function bowAt(c,x,y,s,col){c.save();c.fillStyle=col;c.strokeStyle='#141414';c.lineWidth=4;c.lineJoin='round';
 for(const d of[-1,1]){c.beginPath();c.moveTo(x,y);c.lineTo(x+d*s,y-s*.7);c.lineTo(x+d*s,y+s*.7);c.closePath();c.fill();c.stroke()}
 c.beginPath();c.arc(x,y,s*.3,0,TAU);c.fill();c.stroke();c.restore()}
function starAt(c,x,y,r,cols){c.save();c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;c.lineTo(x+q*Math.cos(a),y+q*Math.sin(a))}c.closePath();
 c.save();c.clip();const h=2*r/cols.length;cols.forEach((col,i)=>{c.fillStyle=col;c.fillRect(x-r,y-r+i*h,2*r,h+.6)});c.restore();c.strokeStyle='#141414';c.lineWidth=4;c.lineJoin='round';c.stroke();c.restore()}
/* Igor's accessories: the same code as the island (head, glasses, earrings; igorAcc). */
const ACC_REF=[{x:465,y:233,rx:41,ry:45},{x:538.5,y:225,rx:34.5,ry:41}];
const ACC_HEADS=[['','None'],['cap','Cap'],['bow','Bow'],['flower','Flower'],['star','Star'],['beanie','Winter hat']];
const ACC_HCOL=['#e0463c','#ff8ab6','#f1b46e','#f6d34a','#9be38a','#7fe3ef','#2f6fd6','#b48ce6','#ffffff','#2b2b2b'];
const ACC_GLASS=['#141414','#8a5a2b','#e0463c','#2f6fd6','#f1b46e','#ff8ab6','#ffffff'];
const ACC_EARS=[['','None'],['r','Right'],['l','Left'],['both','Both']];
const ACC_ECOL=['#f1c84b','#d9dde3','#ff8ab6','#7fe3ef','#e0463c','#9be38a','#2b2b2b'];
const ACC_NB=['#fcf434','#ffffff','#9c59d1','#2c2c2c'];
const ACC_HDEF={cap:'#e0463c',bow:'#ff8ab6',flower:'#f1b46e',star:'nb',beanie:'#2f6fd6'};
function accOf(o){o=o||{};const r={glasses:o.glasses||null,gcol:o.gcol||'#141414',ears:o.ears||null,ecol:o.ecol||'#f1c84b'};
 if(o.head!=null){r.head=o.head||null;r.hcol=o.hcol}else if(o.avatar==='she'){r.head='bow';r.hcol=o.ball}else if(o.avatar==='queer'){r.head='star';r.hcol='nb'}else if(o.ball){r.head='cap';r.hcol=o.ball}else r.head=null;
 if(r.head&&!r.hcol)r.hcol=ACC_HDEF[r.head];return r}
function accShade(col,k){if(col==='nb')col='#9c59d1';const n=parseInt(col.slice(1),16),f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`}
function accMap(c,eyes){const a=ACC_REF,b=eyes,dxa=a[1].x-a[0].x,dya=a[1].y-a[0].y,dxb=b[1].x-b[0].x,dyb=b[1].y-b[0].y;
 const s=Math.hypot(dxb,dyb)/Math.hypot(dxa,dya),r=Math.atan2(dyb,dxb)-Math.atan2(dya,dxa),cs=s*Math.cos(r),sn=s*Math.sin(r);
 c.transform(cs,sn,-sn,cs,b[0].x-(cs*a[0].x-sn*a[0].y),b[0].y-(sn*a[0].x+cs*a[0].y))}
const ACC_INK='#141414';
function accCap(c,col){const w=86,h=72;c.save();c.translate(384,128);c.rotate(.42);c.lineJoin='round';c.lineCap='round';c.strokeStyle=ACC_INK;c.lineWidth=6;
 c.fillStyle=accShade(col,.78);c.beginPath();c.moveTo(w*.35,-4);c.quadraticCurveTo(w*1.55,-14,w*2.05,10);c.quadraticCurveTo(w*1.45,22,w*.3,12);c.closePath();c.fill();c.stroke();
 c.fillStyle=col;c.beginPath();c.moveTo(-w,4);c.bezierCurveTo(-w,-h*1.25,w,-h*1.25,w,4);c.quadraticCurveTo(0,14,-w,4);c.closePath();c.fill();c.stroke();
 c.lineWidth=3.5;c.globalAlpha=.55;c.beginPath();c.moveTo(-6,-h*.93);c.quadraticCurveTo(14,-h*.4,8,9);c.stroke();
 c.beginPath();c.moveTo(-w*.92,-12);c.quadraticCurveTo(0,-2,w*.92,-12);c.stroke();c.globalAlpha=1;
 c.fillStyle=accShade(col,.8);c.lineWidth=4.5;c.beginPath();c.arc(-6,-h*.93-3,9,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(-w*.42,-h*.55,13,22,-.6,0,Math.PI*2);c.fill();c.restore()}
function accBeanie(c,col){const w=92,h=92;c.save();c.translate(380,126);c.rotate(.4);c.lineJoin='round';c.lineCap='round';c.strokeStyle=ACC_INK;c.lineWidth=6;
 c.fillStyle=col==='#ffffff'?'#e9e4da':'#ffffff';c.beginPath();for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=27+(i%2?5:0);c.lineTo(Math.cos(a)*r,-h-12+Math.sin(a)*r)}c.closePath();c.fill();c.stroke();
 c.fillStyle=col;c.beginPath();c.moveTo(-w,-14);c.bezierCurveTo(-w*.95,-h*1.3,w*.95,-h*1.3,w,-14);c.closePath();c.fill();c.stroke();
 c.save();c.clip();c.strokeStyle=accShade(col,.72);c.lineWidth=4;for(let x=-w;x<=w;x+=20){c.beginPath();c.moveTo(x,-14);c.quadraticCurveTo(x*.75,-h*.6,x*.4,-h*1.05);c.stroke()}c.restore();
 c.fillStyle=accShade(col,.86);c.beginPath();c.moveTo(-w-6,-22);c.quadraticCurveTo(0,-36,w+6,-22);c.lineTo(w+4,12);c.quadraticCurveTo(0,0,-w-4,12);c.closePath();c.fill();c.stroke();
 c.save();c.clip();c.strokeStyle=accShade(col,.66);c.lineWidth=4;for(let x=-w;x<=w;x+=13){c.beginPath();c.moveTo(x,-34);c.lineTo(x,14);c.stroke()}c.restore();
 c.fillStyle='rgba(255,255,255,.28)';c.beginPath();c.ellipse(-w*.45,-h*.68,12,20,-.6,0,Math.PI*2);c.fill();c.restore()}
function accBow(c,col){const x=262,y=92,s=30;c.save();c.fillStyle=col;c.strokeStyle=ACC_INK;c.lineWidth=4;c.lineJoin='round';
 for(const d of[-1,1]){c.beginPath();c.moveTo(x,y);c.lineTo(x+d*s,y-s*.7);c.lineTo(x+d*s,y+s*.7);c.closePath();c.fill();c.stroke()}
 c.beginPath();c.arc(x,y,s*.3,0,Math.PI*2);c.fill();c.stroke();c.restore()}
function accStar(c,col){const x=262,y=90,r=30,cols=col==='nb'?ACC_NB:[col];c.save();c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;c.lineTo(x+q*Math.cos(a),y+q*Math.sin(a))}c.closePath();
 c.save();c.clip();const h=2*r/cols.length;cols.forEach((cc,i)=>{c.fillStyle=cc;c.fillRect(x-r,y-r+i*h,2*r,h+.6)});c.restore();c.strokeStyle=ACC_INK;c.lineWidth=4;c.lineJoin='round';c.stroke();c.restore()}
function accFlower(c,col){const x=262,y=92,r=26;c.save();c.fillStyle=col;c.strokeStyle=ACC_INK;c.lineWidth=3.5;for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;c.beginPath();c.arc(x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62,r*.48,0,Math.PI*2);c.fill();c.stroke()}
 c.fillStyle=col==='#f6d34a'?'#e0463c':'#f6d34a';c.beginPath();c.arc(x,y,r*.38,0,Math.PI*2);c.fill();c.stroke();c.restore()}
function accGlasses(c,kind,col){const E=ACC_REF,sun=kind==='sun';c.save();c.lineJoin='round';c.lineCap='round';
 const L=E.map(e=>({x:e.x+(sun?2:0),y:e.y+(sun?6:2),rx:e.rx*(sun?1.3:1.2),ry:e.ry*(sun?1.08:1.16)}));
 c.strokeStyle=col==='#ffffff'?'#d9d9d9':col;c.lineWidth=sun?9:7;c.beginPath();c.moveTo(L[0].x-L[0].rx+4,L[0].y-L[0].ry*.35);c.quadraticCurveTo(L[0].x-L[0].rx-60,L[0].y-L[0].ry*.75,L[0].x-L[0].rx-118,L[0].y-L[0].ry*.2);c.stroke();
 c.strokeStyle=ACC_INK;c.lineWidth=2.5;c.stroke();
 for(const i of[1,0]){const l=L[i];c.beginPath();if(sun){c.moveTo(l.x-l.rx,l.y-l.ry*.55);c.quadraticCurveTo(l.x,l.y-l.ry*1.05,l.x+l.rx,l.y-l.ry*.55);c.bezierCurveTo(l.x+l.rx*1.05,l.y+l.ry*.9,l.x-l.rx*1.05,l.y+l.ry*1.05,l.x-l.rx,l.y-l.ry*.55)}else c.ellipse(l.x,l.y,l.rx,l.ry,0,0,Math.PI*2);c.closePath();
  c.fillStyle=sun?'rgba(16,20,30,.9)':'rgba(205,232,255,.2)';c.fill();
  c.strokeStyle=ACC_INK;c.lineWidth=sun?13:11;c.stroke();c.strokeStyle=col;c.lineWidth=sun?8:6;c.stroke();
  c.save();c.clip();c.strokeStyle='rgba(255,255,255,'+(sun?.55:.6)+')';c.lineWidth=5;c.beginPath();c.arc(l.x-l.rx*.2,l.y-l.ry*.1,l.rx*.62,Math.PI*1.08,Math.PI*1.42);c.stroke();c.restore()}
 c.restore()}
function accEar(c,x,y,s,col,ox,oy){c.save();c.lineCap='round';c.strokeStyle=ACC_INK;const hx=x+ox*s,hy=y+oy*s,a0=Math.atan2(y-hy,x-hx);
 c.lineWidth=8*s;c.beginPath();c.arc(hx,hy,13*s,a0+.35,a0+Math.PI*2-.35);c.stroke();c.strokeStyle=col;c.lineWidth=4.5*s;c.stroke();
 c.fillStyle=col;c.strokeStyle=ACC_INK;c.lineWidth=3*s;c.beginPath();c.arc(x,y,4.5*s,0,Math.PI*2);c.fill();c.stroke();
 const bx=hx+(hx-x)*.95,by=hy+(hy-y)*.95;c.beginPath();c.moveTo(bx,by-6*s);c.lineTo(bx-6*s,by+2*s);c.lineTo(bx,by+10*s);c.lineTo(bx+6*s,by+2*s);c.closePath();c.fill();c.stroke();c.restore()}
function accEars(c,kind,col,side){if(side==='l'&&(kind==='l'||kind==='both'))accEar(c,404,80,1.3,col,10,8);if(side==='r'&&(kind==='r'||kind==='both'))accEar(c,222,223,1.4,col,1,13)}
function igorAcc0(c,eyes,o){const a=accOf(o);if(!a.head&&!a.glasses&&!a.ears)return;c.save();accMap(c,eyes);
 if(a.ears)accEars(c,a.ears,a.ecol,'l');
 const H={cap:accCap,beanie:accBeanie,bow:accBow,star:accStar,flower:accFlower}[a.head];if(H)H(c,a.hcol);
 if(a.ears)accEars(c,a.ears,a.ecol,'r');
 if(a.glasses==='eye'||a.glasses==='sun')accGlasses(c,a.glasses,a.gcol);c.restore()}
/* the cook's outfit for the kitchen: a chef's hat and a little apron (island picture coordinates) */
function chefHat(c){c.save();c.translate(360,118);c.rotate(.34);c.scale(1.4,1.4);c.lineJoin='round';c.strokeStyle='#141414';c.lineWidth=6;c.fillStyle='#ffffff';
 c.beginPath();c.arc(-58,-58,46,0,TAU);c.arc(0,-92,58,0,TAU);c.arc(58,-58,46,0,TAU);c.fill();
 for(const[x,y,r]of[[-58,-58,46],[0,-92,58],[58,-58,46]]){c.beginPath();c.arc(x,y,r,Math.PI*.75,Math.PI*2.25);c.stroke()}
 c.fillStyle='#ffffff';c.beginPath();c.moveTo(-78,-40);c.lineTo(78,-40);c.lineTo(72,22);c.quadraticCurveTo(0,34,-72,22);c.closePath();c.fill();c.stroke();
 c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=3;for(const x of[-36,0,36]){c.beginPath();c.moveTo(x,-34);c.lineTo(x*.95,22);c.stroke()}c.restore()}
function apron(c){c.save();c.translate(304,388);c.rotate(.5);c.scale(1.2,1.2);c.lineJoin='round';c.lineCap='round';
 c.strokeStyle='#e0463c';c.lineWidth=7;c.beginPath();c.moveTo(-96,-6);c.quadraticCurveTo(0,8,96,-6);c.stroke(); // the string, tied round Igor
 c.strokeStyle='#141414';c.lineWidth=5;c.fillStyle='#ffffff';c.beginPath();c.moveTo(-62,0);c.lineTo(62,0);c.lineTo(58,104);c.quadraticCurveTo(0,122,-58,104);c.closePath();c.fill();c.stroke();
 c.strokeStyle='#e0463c';c.lineWidth=5;c.beginPath();c.moveTo(-60,16);c.lineTo(60,16);c.stroke();
 c.strokeStyle='#141414';c.lineWidth=4;c.fillStyle='#f3f3f3';c.beginPath();c.rect(-30,48,60,34);c.fill();c.stroke();c.restore()}
function igorAcc(c,eyes,o){if(o&&o.outfit==='chef'){const a=accOf(o);c.save();accMap(c,eyes);apron(c);if(a.ears)accEars(c,a.ears,a.ecol,'l');chefHat(c);if(a.ears)accEars(c,a.ears,a.ecol,'r');
  if(a.glasses==='eye'||a.glasses==='sun')accGlasses(c,a.glasses,a.gcol);c.restore();return}
 igorAcc0(c,eyes,o)}
const PAD=.24; // room above the head for hats
function paintAvatar(c,o,k0=0,k1=0,w=SW,h=SH*(1+PAD)){c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);if(!igorOK)return;const sc=Math.min(w/663,h/(730*(1+PAD)));c.setTransform(sc,0,0,sc,(w-663*sc)/2,PAD*730*sc);c.drawImage(igorImg,0,0,663,730);
 const d0=lid(c,EYES[0],k0),d1=lid(c,EYES[1],k1);
 if(o.avatar==='she'){lashes(c,EYES[0],d0,2);lashes(c,EYES[1],d1,2)}
 else if(o.avatar==='queer'){lashes(c,EYES[0],d0,1);lashes(c,EYES[1],d1,1)}
 igorAcc(c,EYES,o);c.setTransform(1,0,0,1,0,0)}
igorImg.onload=()=>{igorOK=true;document.querySelectorAll('canvas.igcAv').forEach(c=>c._av&&drawAv(c,c._av))};igorImg.src=window.IGOR_SRC||'/igor.webp';
const AVS=document.createElement('canvas');AVS.width=SW;AVS.height=Math.round(SH*(1+PAD));const AVX=AVS.getContext('2d');
function drawAv(c,av){c._av=av||{avatar:'igor'};const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);if(!igorOK)return;paintAvatar(AVX,c._av,0,0,AVS.width,AVS.height);g.drawImage(AVS,62,48,360,360,0,0,c.width,c.height)}
const avC=(av,cls='')=>{const c=document.createElement('canvas');c.width=c.height=96;c.className='igcAv '+cls;drawAv(c,av);return c};
function myAv(){let S={};try{S=JSON.parse(localStorage.getItem('igortime_v1'))||{}}catch(e){}const o={avatar:AVN[S.avatar]?S.avatar:'igor'};
 for(const k of['head','hcol','glasses','gcol','ears','ecol','ball'])if(S[k]!==undefined&&S[k]!==null)o[k]=S[k];return o}

/* ---------- words: kind and safe ---------- */
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[0]/g,'o').replace(/[1!|]/g,'i').replace(/3/g,'e').replace(/4|@/g,'a').replace(/5|\$/g,'s').replace(/7/g,'t').replace(/(.)\1+/g,'$1');
const PRE=['caz','minchi','merd','stronz','putan','troi','vafancul','fancul','coglion','pompin','scopar','scopat','froci','richion','mongoloid','ritardat','bastard','zocol','cornut','puzon',
 'fuck','fuk','shit','bitch','cunt','pusy','ashole','slut','whore','retard','porn','suicid','uccidit','horny'];
const EXACT=['sega','seghe','figa','fighe','tete','culo','negro','negri','negra','nudo','nuda','nudi','nude','nudes','sex','sexy','sesso','tits','boobs','dick','dicks','niga','niger','fag','fagot','kys','muori','nake','naked'];
const FLAT=['porcodio','porcadio','diocan','diomerd','diopor','diobestia','porcamadon','madonaputan','madonatroi','diostronz'];
const PERSONAL=[/\b(insta(gram)?|snap(chat)?|tik ?tok|whats ?app|telegram|discord|face ?book|twitch|youtube|threads|skype|kik)\b/i,
 /\b(cellulare|telefono|phone|numero di (tel|cell)|il mio numero|tuo numero|your number|my number|indirizzo|address|dove (vivi|abiti|stai di casa)|vivo a|abito a|where do you live|which school|what school|che scuola|quale scuola|la mia scuola|my school)\b/i,
 /\b(foto|photo|photos|pic|pics|selfie|video ?call|videochiamata|webcam)\b/i,/https?:|www\.|\.(com|it|net|org|io|me|gg|ly)\b/i,/@\w/,/\d(?:[ .\-/]?\d){6}/];
function check(t){const n=norm(t).replace(/[^a-z\s]/g,' '),W=n.split(/\s+/).filter(Boolean),flat=W.join('');
 for(const w of W){if(EXACT.includes(w))return'bad';for(const p of PRE)if(w.startsWith(p))return'bad'}
 for(const f of FLAT)if(flat.includes(f))return'bad';
 for(const r of PERSONAL)if(r.test(t))return'personal';return''}

/* ---------- style ---------- */
const st=document.createElement('style');st.textContent=`
#chatB{position:relative}#chatB i{position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;padding:0 4px;box-sizing:border-box;border-radius:9px;background:#e0463c;color:#fff;font:600 10.5px/17px system-ui,sans-serif;font-style:normal;text-align:center;border:2px solid #2b2018}#chatB i:empty{display:none}
#igc{position:fixed;z-index:60;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));width:min(480px,calc(100vw - 24px));height:min(680px,calc(100vh - var(--hh,62px) - 40px));display:flex;flex-direction:column;overflow:hidden;background:#fbf3e1;color:#2b2018;border:3px solid #2b2018;border-radius:22px;box-shadow:0 6px 0 #2b2018,0 18px 40px rgba(0,0,0,.35);animation:igcIn .22s ease-out;font:500 15px/1.35 'Fredoka','Trebuchet MS',system-ui,sans-serif;-webkit-user-select:text;user-select:text}
#igc[hidden]{display:none}#igc *{box-sizing:border-box}
#igc button{font:inherit;color:#2b2018;background:#fff8e8;border:2px solid #2b2018;border-radius:999px;padding:7px 13px;cursor:pointer;box-shadow:0 2px 0 #2b2018;letter-spacing:0;text-transform:none;-webkit-tap-highlight-color:transparent}
#igc button:active{transform:translateY(1px);box-shadow:0 1px 0 #2b2018}#igc button:disabled{opacity:.45;cursor:default}
#igc button.go{background:#9be38a}#igc button.no{background:#ffd2c8}#igc button.ghost{background:transparent;box-shadow:none;border-color:transparent;text-decoration:underline;padding:4px 6px}
@keyframes igcIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
#igc .top{display:flex;align-items:center;gap:8px;padding:9px 10px 9px 14px;background:#a8d621;border-bottom:3px solid #2b2018}
#igc .top h3{margin:0;flex:1;font:600 21px/1.1 'Fredoka',system-ui,sans-serif;display:flex;align-items:center;gap:8px;min-width:0}#igc .top h3 span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#igc .top .x,#igc .top .bk,#igc .top .mn{width:34px;height:34px;padding:0;flex:none;font-size:16px;background:#f7ecd4}#igc .top .mute{color:#2b4a12!important}#igc .top .dot{border-color:#a8d621}
#igc .tabs{display:flex;gap:6px;padding:8px 10px;flex-wrap:wrap;border-bottom:2px dashed rgba(43,32,24,.25);background:#f3e6c8}#igc .tabs button{padding:4px 10px;font-size:13.5px}#igc .tabs button[aria-pressed=true]{background:#f1b46e}
#igc .tabs b{display:inline-block;min-width:18px;margin-left:4px;padding:0 5px;border-radius:9px;background:#e0463c;color:#fff;font-size:11.5px;line-height:18px}
#igc .body{flex:1;min-height:0;overflow:auto;padding:12px;-webkit-overflow-scrolling:touch}#igc .top,#igc .tabs,#igc .bar,#igc .tip,#igc .emo{flex:none}
#igc .row{display:flex;align-items:center;gap:10px;padding:8px;border-radius:14px;margin-bottom:6px;background:#fff8e8;border:2px solid rgba(43,32,24,.15)}
#igc .row.tap{cursor:pointer}#igc .row.tap:hover{border-color:#2b2018}
#igc .row .nm{flex:1;min-width:0}#igc .row .nm b{display:block;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#igc .row .nm small{color:#7a6650;font-size:12.5px}
#igc .row .un{min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:#e0463c;color:#fff;font-size:12.5px;line-height:22px;text-align:center;font-weight:600}
#igc .row .bt{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}#igc .row .bt button{padding:5px 10px;font-size:13.5px}
#igc canvas.igcAv{width:46px;height:46px;flex:none;border-radius:50%;background:radial-gradient(circle at 50% 40%,#e6f6d8,#bfe3a6);border:2px solid #2b2018}#igc canvas.igcAv.big{width:76px;height:76px}#igc canvas.igcAv.sm{width:38px;height:38px;background:#f7ecd4}
#igc .av{position:relative;flex:none;display:flex}#igc .dot{position:absolute;right:-2px;bottom:-1px;width:12px;height:12px;border-radius:50%;background:#bdb3a3;border:2px solid #fff8e8}#igc .dot.on{background:#3cb34a}
#igc h4{margin:14px 0 6px;font:600 15px 'Fredoka',system-ui,sans-serif}#igc h4:first-child{margin-top:0}
#igc p{margin:0 0 10px}#igc .mute{color:#7a6650;font-size:13.5px}#igc .center{text-align:center;padding:22px 8px}
#igc input[type=text],#igc input[type=search],#igc textarea{font:inherit;width:100%;padding:9px 12px;border-radius:14px;border:2px solid #2b2018;background:#fff;color:#2b2018;outline:none}
#igc input:focus,#igc textarea:focus{box-shadow:0 0 0 3px rgba(241,180,110,.6)}
#igc .gate ul{padding-left:0;list-style:none;margin:0 0 12px}#igc .gate li{display:flex;gap:9px;margin-bottom:8px}#igc .gate li span{flex:none;width:22px;text-align:center}
#igc label.ck{display:flex;gap:10px;align-items:center;padding:10px 12px;border:2px solid #2b2018;border-radius:14px;background:#fff8e8;margin:8px 0 12px;cursor:pointer;font-weight:600}
#igc label.ck input{width:22px;height:22px;accent-color:#3cb34a}#igc label.rd{display:flex;gap:8px;align-items:flex-start;margin:6px 0;cursor:pointer}#igc label.rd input{margin-top:3px;accent-color:#3cb34a}
#igc .say{display:flex;gap:8px;align-items:flex-end;margin:0 0 12px}#igc .say div{flex:1;background:#fff;border:2px solid #2b2018;border-radius:14px 14px 14px 4px;padding:8px 11px}
#igc .msgs{display:flex;flex-direction:column;gap:9px;padding:14px 12px 8px}#igc .m{position:relative;max-width:80%;padding:7px 12px 6px;border-radius:16px;background:#d9eefa;border:2.5px solid #2b2018;box-shadow:0 2px 0 #2b2018;word-wrap:break-word;white-space:pre-wrap;align-self:flex-start;margin-left:6px}
#igc .m::after{content:'';position:absolute;left:-8px;bottom:7px;width:11px;height:11px;background:inherit;border:2.5px solid #2b2018;border-top:0;border-right:0;transform:rotate(45deg);border-radius:0 0 0 3px}
#igc .m.me{align-self:flex-end;background:#ffd7a3;margin:0 6px 0 0}#igc .m.me::after{left:auto;right:-8px;transform:rotate(-135deg)}#igc .m small{display:block;font-size:11px;color:#6d5a44;margin-top:2px;text-align:right}
#igc .day{align-self:center;font-size:12px;color:#6d5a44;margin:6px 0;padding:2px 10px;border:1.5px dashed rgba(43,32,24,.35);border-radius:999px}
#igc .bar{display:flex;gap:6px;padding:8px 10px;border-top:3px solid #2b2018;background:#f3e6c8;align-items:center;height:auto;min-height:64px;overflow:visible;margin:0;border-radius:0;box-sizing:border-box}#igc .bar button.go{background:#f1b46e}
#igc .bar input{flex:1;min-width:0;height:46px;font-size:16px;padding:10px 14px}#igc .bar button{width:46px;height:46px;padding:0;flex:none;font-size:20px}
#igc .emo{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;padding:6px 10px;border-top:2px solid rgba(43,32,24,.12)}#igc .emo[hidden]{display:none}
#igc .emo button{background:transparent;border:0;box-shadow:none;font-size:23px;padding:4px 0;border-radius:10px}#igc .emo button:hover{background:#fff8e8}
#igc .tip{margin:0 12px 6px;padding:8px 11px;border-radius:14px;background:#fff3b0;border:2px solid #2b2018;font-size:14px}#igc .tip[hidden]{display:none}
#igc .menu{position:absolute;right:12px;top:56px;z-index:2;display:flex;flex-direction:column;gap:6px;padding:8px;background:#fff8e8;border:2px solid #2b2018;border-radius:14px;box-shadow:0 3px 0 #2b2018}
#igc .toast{position:absolute;left:50%;bottom:76px;transform:translateX(-50%);z-index:3;background:#2b2018;color:#f7ecd4;padding:8px 14px;border-radius:12px;font-size:14px;max-width:90%;text-align:center;pointer-events:none;opacity:0;transition:opacity .25s}#igc .toast.on{opacity:1}
#igc .code{font:600 24px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.18em;background:#fff;border:2px dashed #2b2018;border-radius:12px;padding:8px 12px;display:inline-block}
#igc .rep{background:#fff8e8;border:2px solid rgba(43,32,24,.25);border-radius:14px;padding:10px;margin-bottom:10px}#igc .rep.open{border-color:#e0463c}
#igc .rep .q{font-size:13.5px;background:#fff;border-radius:10px;padding:6px 8px;margin:6px 0;max-height:240px;overflow:auto}#igc .rep .q div{margin:2px 0}#igc .rep .q .w{color:#b3261e}
#igc .linkish{color:#2f6fd6;text-decoration:underline;cursor:pointer}
@media (max-width:480px){#igc{left:8px;right:8px;width:auto;top:calc(var(--hh,62px) + 4px);bottom:calc(8px + env(safe-area-inset-bottom,0px));height:auto}#igc .row{flex-wrap:wrap}#igc .row .bt{width:100%;justify-content:flex-start;padding-left:56px}}`;
document.head.appendChild(st);

/* ---------- state ---------- */
let B=null,ME=null,PROF=null,SUSP=false,started=false,NETERR=false;let staffOn=false;
let FR=[],RIN=[],ROUT=[],BL=[],REP=[],PCACHE={};
const subs=[];let view='friends',chatWith=null,unMsgs=null,unProf=null,MS=[],pingT=0,prevUnread=-1;
const panel=document.createElement('aside');panel.id='igc';panel.hidden=true;panel.setAttribute('aria-label','Chat');document.body.appendChild(panel);
const online=p=>p&&p.seen&&Date.now()-p.seen<150000;
function ago(t){if(!t)return'';const s=(Date.now()-t)/1000;if(s<150)return tt('online','online');if(s<3600)return tt(`seen ${Math.round(s/60)} min ago`,`visto ${Math.round(s/60)} min fa`);
 if(s<86400)return tt(`seen ${Math.round(s/3600)} h ago`,`visto ${Math.round(s/3600)} h fa`);const d=Math.round(s/86400);return tt(`seen ${d} ${d==1?'day':'days'} ago`,`visto ${d} ${d==1?'giorno':'giorni'} fa`)}
const hm=t=>{const d=new Date(t);return d.toLocaleTimeString(LANG==='it'?'it-IT':'en-GB',{hour:'2-digit',minute:'2-digit'})};
const dayOf=t=>{const d=new Date(t),n=new Date();if(d.toDateString()===n.toDateString())return tt('Today','Oggi');const y=new Date(n-864e5);if(d.toDateString()===y.toDateString())return tt('Yesterday','Ieri');
 return d.toLocaleDateString(LANG==='it'?'it-IT':'en-GB',{day:'numeric',month:'long'})};
function toast(t){let e=panel.querySelector('.toast');if(!e)return;e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2600)}
const blocked=uid=>BL.some(b=>b.uid===uid);
function prof(uid){if(PCACHE[uid])return PCACHE[uid];PCACHE[uid]={nick:'…',av:{avatar:'igor'},seen:0,_l:1};
 B.getProfile(uid).then(p=>{if(p){PCACHE[uid]=p;if(!panel.hidden&&!chatWith)render()}});return PCACHE[uid]}
function unread(){let n=FR.filter(f=>!blocked(f.other)).reduce((a,f)=>a+f.un,0)+RIN.filter(r=>!blocked(r.from)).length;if(ME&&ME.admin)n+=REP.filter(r=>r.st==='open').length;return n}
function badge(){const n=unread(),b=$('chatB');if(b){let i=b.querySelector('i');if(!i){i=document.createElement('i');b.appendChild(i)}i.textContent=n?String(n>99?'99+':n):''}
 if(prevUnread>=0&&n>prevUnread&&panel.hidden&&window.IgorSound)try{window.IgorSound.sfx('say')}catch(e){}prevUnread=n}

/* ---------- start ---------- */
async function start(){if(started)return;started=true;
 B=window.IgorChatFake?window.IgorChatFake:await firestoreBackend();
 B.onAuth(async u=>{subs.splice(0).forEach(f=>{try{f()}catch(e){}});clearInterval(pingT);ME=u;PROF=null;FR=[];RIN=[];ROUT=[];BL=[];REP=[];PCACHE={};chatWith=null;
  NETERR=false;if(u){if(!u.nick&&window.IgorCloud&&window.IgorCloud.user&&window.IgorCloud.user.nick)u.nick=window.IgorCloud.user.nick.slice(0,16);try{PROF=await B.profile()}catch(e){PROF=null;NETERR=true}if(PROF){SUSP=await B.suspended();live()}}
  if(!window.IgorChatFake&&(u||staffOn)){staffOn=true;import('/staff.js?v=10').then(M=>M.init(u?{uid:u.uid,nick:u.nick,admin:!!u.admin}:null)).catch(e=>console.warn('staff',e))}
  badge();if(!panel.hidden)render()})}
function live(){const av=myAv();B.syncMe(PROF,av).catch(e=>console.warn('sync',e));PROF.av=av;PROF.nick=ME.nick;
 const ping=()=>{if(document.visibilityState==='visible')B.ping().catch(()=>{})};ping();pingT=setInterval(ping,60000);
 subs.push(B.onFriends(l=>{FR=l.sort((a,b)=>b.last-a.last);badge();if(!panel.hidden&&!chatWith)render()}));
 subs.push(B.onReqs((a,b)=>{RIN=a;ROUT=b;badge();if(!panel.hidden&&!chatWith)render()}));
 subs.push(B.onBlocks(l=>{BL=l;badge();if(!panel.hidden&&!chatWith)render()}));
 if(ME.admin)subs.push(B.onReports(l=>{REP=l;badge();if(!panel.hidden&&!chatWith&&view==='reports')render()}))}

/* ---------- screens ---------- */
function shell(title,{back=false,menu=false,tabs=true}={}){
 const nIn=RIN.filter(r=>!blocked(r.from)).length,nFr=FR.filter(f=>!blocked(f.other)).reduce((a,f)=>a+f.un,0),nRep=REP.filter(r=>r.st==='open').length;
 const T=[['friends',tt('Friends','Amici'),nFr],['reqs',tt('Requests','Richieste'),nIn],['find',tt('Find','Cerca'),0],['set','⚙',0]];if(ME&&ME.admin)T.push(['reports','🛡 '+tt('Reports','Segnalazioni'),nRep]);
 panel.innerHTML=`<div class="top">${back?`<button class="bk" data-a="back" aria-label="${tt('Back','Indietro')}">←</button>`:''}<h3>${title}</h3>${menu?`<button class="mn" data-a="menu" aria-label="${tt('More','Altro')}">⋯</button>`:''}<button class="x" data-a="close" aria-label="${tt('Close','Chiudi')}">×</button></div>`+
 (tabs?`<div class="tabs">${T.map(([k,l,n])=>`<button data-tab="${k}" aria-pressed="${view===k}">${l}${n?`<b>${n}</b>`:''}</button>`).join('')}</div>`:'')+`<div class="body"></div><div class="toast" role="status"></div>`;
 return panel.querySelector('.body')}
function render(){if(!B)return;
 if(!ME){const b=shell(tt('Chat','Chat'),{tabs:false});b.innerHTML=`<div class="center"></div>`;const c=b.firstChild;c.appendChild(avC(myAv(),'big'));
  c.insertAdjacentHTML('beforeend',`<p>${tt('Sign in to chat with your friends.','Accedi per chattare con i tuoi amici.')}</p><button class="go" data-a="signin">${tt('Sign in / register','Accedi / registrati')}</button>`);return}
 if(!ME.nick&&window.IgorCloud&&window.IgorCloud.user&&window.IgorCloud.user.nick)ME.nick=window.IgorCloud.user.nick.slice(0,16);
 if(NETERR){const b=shell('Chat',{tabs:false});b.innerHTML=`<div class="center"><p>${tt('I can’t reach the chat right now.','Adesso non riesco a raggiungere la chat.')}</p><button class="go" data-a="retry">${tt('Try again','Riprova')}</button></div>`;return}
 if(!ME.nick){const b=shell('Chat',{tabs:false});b.innerHTML=`<div class="center"><p>${tt('First choose a nickname: tap your name at the top of the island.','Prima scegli un nickname: tocca il tuo nome in alto sull’isola.')}</p><button data-a="signin">${tt('Choose a nickname','Scegli il nickname')}</button></div>`;return}
 if(!PROF)return gate();
 if(SUSP){const b=shell('Chat',{tabs:false});b.innerHTML=`<div class="center"><p><b>${tt('Your chat is suspended.','La tua chat è sospesa.')}</b></p><p class="mute">${tt('For any questions write to','Per chiarimenti scrivi a')} theigortime@gmail.com</p></div>`;return}
 if(chatWith)return convo();
 ({friends:friendsV,reqs:reqsV,find:findV,set:setV,reports:reportsV}[view]||friendsV)()}

function gate(){const b=shell(tt('Igor’s chat','La chat di Igor'),{tabs:false});b.className='body gate';
 b.innerHTML=`<div class="say"></div><label class="ck"><input type="checkbox" id="igc14"> ${tt('I am at least 14 years old','Ho almeno 14 anni')}</label>
 <h4>${tt('Before you come in','Prima di entrare')}</h4><ul>
 <li><span>👋</span>${tt('Chat only with friends and people you know.','Chatta solo con amici e persone che conosci.')}</li>
 <li><span>🌱</span>${tt('Please use kind and positive words and descriptions.','Usa per favore parole e descrizioni gentili e positive.')}</li>
 <li><span>🔒</span>${tt('Never write your address, your school, your phone number or your social accounts, and don’t send photos.','Non scrivere mai il tuo indirizzo, la tua scuola, il numero di telefono o i tuoi social, e non mandare foto.')}</li>
 <li><span>🛡</span>${tt('If someone makes you feel uncomfortable: Block and Report. We read every report.','Se qualcuno ti mette a disagio: Blocca e Segnala. Leggiamo ogni segnalazione.')}</li></ul>
 <h4>${tt('Who can send you friend requests?','Chi può mandarti richieste di amicizia?')}</h4>
 <label class="rd"><input type="radio" name="igcReq" value="all" checked> ${tt('Anyone who searches for my nickname','Chi cerca il mio nickname')}</label>
 <label class="rd"><input type="radio" name="igcReq" value="code"> ${tt('Only people who have my friend code','Solo chi ha il mio codice amico')}</label>
 <p style="margin-top:14px"><button class="go" data-a="join" id="igcJoin" disabled>${tt('Enter the chat','Entra nella chat')}</button></p>
 <p class="mute"><span class="linkish" data-a="privacy">${tt('Chat privacy','Privacy della chat')}</span></p>`;
 const s=b.querySelector('.say');s.appendChild(avC(myAv()));s.insertAdjacentHTML('beforeend',`<div>${tt('Here you can write to your friends of Igor Time!','Qui puoi scrivere ai tuoi amici di Igor Time!')}</div>`);
 const ck=$('igc14');ck.onchange=()=>{$('igcJoin').disabled=!ck.checked}}

function personRow(uid,p,extra='',tap=''){const r=document.createElement('div');r.className='row'+(tap?' tap':'');if(tap)r.dataset.a=tap,r.dataset.uid=uid;
 const a=document.createElement('div');a.className='av';a.appendChild(avC(p.av));r.appendChild(a);r.insertAdjacentHTML('beforeend',`<div class="nm"><b>${esc(p.nick)}</b>${extra}</div>`);return r}
function friendsV(){const b=shell('💬 Chat');const L=FR.filter(f=>!blocked(f.other));
 if(!L.length){b.innerHTML=`<div class="center"><p>${tt('No friends yet.','Ancora nessun amico.')}</p><p class="mute">${tt('Find your friends by nickname or with their friend code.','Trova i tuoi amici col nickname o col loro codice amico.')}</p><button class="go" data-tab="find">${tt('Find friends','Cerca amici')}</button></div>`;return}
 for(const f of L){const p=prof(f.other),r=personRow(f.other,p,`<small>${p._l?'':esc(ago(p.seen))}</small>`,'open');r.dataset.pair=f.pair;
  if(online(p))r.querySelector('.av').insertAdjacentHTML('beforeend','<i class="dot on"></i>');else r.querySelector('.av').insertAdjacentHTML('beforeend','<i class="dot"></i>');
  if(f.un)r.insertAdjacentHTML('beforeend',`<span class="un">${f.un}</span>`);b.appendChild(r)}}
function reqsV(){const b=shell('💬 Chat');const I=RIN.filter(r=>!blocked(r.from)),O=ROUT;
 b.insertAdjacentHTML('beforeend',`<h4>${tt('For you','Per te')}</h4>`);
 if(!I.length)b.insertAdjacentHTML('beforeend',`<p class="mute">${tt('No requests right now.','Nessuna richiesta per ora.')}</p>`);
 for(const r of I){const row=personRow(r.from,{nick:r.fromNick,av:r.fromAv},`<small>${tt('wants to be your friend','vuole essere tuo amico')}</small>`);
  row.insertAdjacentHTML('beforeend',`<div class="bt"><button class="go" data-a="accept" data-id="${esc(r.id)}">${tt('Accept','Accetta')}</button><button class="no" data-a="decline" data-id="${esc(r.id)}">${tt('Decline','Rifiuta')}</button><button class="ghost" data-a="blockreq" data-id="${esc(r.id)}">${tt('Block','Blocca')}</button></div>`);b.appendChild(row)}
 if(O.length){b.insertAdjacentHTML('beforeend',`<h4>${tt('Sent by you','Mandate da te')}</h4>`);
  for(const r of O){const row=personRow(r.to,{nick:r.toNick||tt('a friend','un amico'),av:r.toAv},`<small>${tt('waiting…','in attesa…')}</small>`);
   row.insertAdjacentHTML('beforeend',`<div class="bt"><button data-a="cancel" data-id="${esc(r.id)}">${tt('Cancel','Annulla')}</button></div>`);b.appendChild(row)}}}
let lastQ='',lastRes=[],codeRes=null;
function relation(uid){if(uid===ME.uid)return'me';if(FR.some(f=>f.other===uid))return'friend';if(ROUT.some(r=>r.to===uid))return'sent';if(RIN.some(r=>r.from===uid))return'got';if(blocked(uid))return'blocked';return''}
function findV(){const b=shell('💬 Chat');
 b.innerHTML=`<h4>${tt('Search by nickname','Cerca per nickname')}</h4><input type="search" id="igcQ" maxlength="16" placeholder="${tt('Nickname…','Nickname…')}" value="${esc(lastQ)}" autocomplete="off"><div id="igcRes" style="margin-top:8px"></div>
 <h4>${tt('Add with a friend code','Aggiungi con un codice amico')}</h4><div style="display:flex;gap:8px"><input type="text" id="igcCode" maxlength="6" placeholder="ABC234" style="text-transform:uppercase;letter-spacing:.15em"><button data-a="code">${tt('Find','Cerca')}</button></div><div id="igcCodeRes" style="margin-top:8px"></div>
 <h4>${tt('Your friend code','Il tuo codice amico')}</h4><p><span class="code" id="igcMy">······</span></p><p class="mute">${tt('Give it only to friends you know.','Dallo solo agli amici che conosci.')}</p>`;
 B.myCode().then(c=>{const e=$('igcMy');if(e)e.textContent=c||'—'});
 const q=$('igcQ');let t=0;q.oninput=()=>{clearTimeout(t);t=setTimeout(()=>doSearch(q.value),300)};drawRes();drawCode();
 if(!lastQ)setTimeout(()=>q.focus({preventScroll:true}),50)}
async function doSearch(v){lastQ=v=v.trim();if(v.length<2){lastRes=[];return drawRes()}try{lastRes=(await B.search(v)).filter(p=>p.uid!==ME.uid)}catch(e){lastRes=[];console.warn(e)}if(lastQ===v)drawRes()}
function drawRes(){const e=$('igcRes');if(!e)return;e.innerHTML='';if(lastQ.length<2){e.innerHTML=`<p class="mute">${tt('Type at least 2 letters.','Scrivi almeno 2 lettere.')}</p>`;return}
 if(!lastRes.length){e.innerHTML=`<p class="mute">${tt('Nobody with this nickname.','Nessuno con questo nickname.')}</p>`;return}
 for(const p of lastRes)e.appendChild(resRow(p,'all'))}
function resRow(p,via){const rel=relation(p.uid),row=personRow(p.uid,{nick:p.nick||tt('Player','Giocatore'),av:p.av||{avatar:'igor'}});
 const lab={friend:tt('already friends','già amici'),sent:tt('request sent','richiesta mandata'),got:tt('wants to be your friend: see Requests','vuole essere tuo amico: vedi Richieste'),blocked:tt('blocked','bloccato')}[rel];
 row.insertAdjacentHTML('beforeend',lab?`<small class="mute">${lab}</small>`:`<div class="bt"><button class="go" data-a="ask" data-uid="${esc(p.uid)}" data-via="${via}">${tt('Add friend','Chiedi amicizia')}</button></div>`);row._p=p;return row}
function drawCode(){const e=$('igcCodeRes');if(!e)return;e.innerHTML='';if(codeRes===false)e.innerHTML=`<p class="mute">${tt('No player with this code.','Nessun giocatore con questo codice.')}</p>`;else if(codeRes)e.appendChild(resRow(codeRes,'code'))}
function setV(){const b=shell('💬 Chat');
 b.innerHTML=`<h4>${tt('Who can send you friend requests?','Chi può mandarti richieste di amicizia?')}</h4>
 <label class="rd"><input type="radio" name="igcReq2" value="all" ${PROF.req==='all'?'checked':''}> ${tt('Anyone who searches for my nickname','Chi cerca il mio nickname')}</label>
 <label class="rd"><input type="radio" name="igcReq2" value="code" ${PROF.req!=='all'?'checked':''}> ${tt('Only people who have my friend code','Solo chi ha il mio codice amico')}</label>
 <h4>${tt('Blocked','Bloccati')}</h4><div id="igcBl"></div>
 <h4>${tt('Remember','Ricorda')}</h4><p class="mute">${tt('Kind words only 🌱 No addresses, schools, phone numbers, social accounts or photos. If something feels wrong: Block and Report.','Solo parole gentili 🌱 Niente indirizzi, scuole, numeri di telefono, social o foto. Se qualcosa non va: Blocca e Segnala.')}</p>
 <p><span class="linkish" data-a="privacy">${tt('Chat privacy','Privacy della chat')}</span></p>
 <h4>${tt('Leave the chat','Esci dalla chat')}</h4><p class="mute">${tt('Deletes your chat profile, your friends list and your friend code.','Cancella il tuo profilo della chat, la lista degli amici e il codice amico.')}</p><p><button class="no" data-a="leave">${tt('Leave the chat','Esci dalla chat')}</button></p>`;
 const bl=$('igcBl');if(!BL.length)bl.innerHTML=`<p class="mute">${tt('Nobody.','Nessuno.')}</p>`;
 for(const x of BL){const r=document.createElement('div');r.className='row';r.innerHTML=`<div class="nm"><b>${esc(x.nick||'?')}</b></div><div class="bt"><button data-a="unblock" data-uid="${esc(x.uid)}">${tt('Unblock','Sblocca')}</button></div>`;bl.appendChild(r)}
 b.querySelectorAll('input[name=igcReq2]').forEach(i=>i.onchange=async()=>{try{await B.setReq(i.value,PROF.av);PROF.req=i.value;toast(tt('Saved','Salvato'))}catch(e){toast(tt('Could not save, try again.','Non riesco a salvare, riprova.'))}})}
function privacyV(){const b=shell(tt('Chat privacy','Privacy della chat'),{back:true,tabs:false});
 b.innerHTML=LANG==='it'?`<h4>Cosa salviamo</h4><p>Il tuo nickname, l’aspetto del tuo Igor, quando sei stato online l’ultima volta (lo vedono solo i tuoi amici), i tuoi amici, le richieste di amicizia, le persone che blocchi e i messaggi.</p>
 <h4>Per quanto tempo</h4><p>I messaggi non letti restano finché non vengono letti, al massimo un anno. I messaggi letti si cancellano 90 giorni dopo la lettura. Le conversazioni segnalate restano finché non le controlliamo.</p>
 <h4>Chi legge i messaggi</h4><p>Solo tu e il tuo amico. Gli amministratori di Igor Time leggono solo i messaggi segnalati, per decidere cosa fare.</p>
 <h4>Dove</h4><p>I dati sono su Google Firebase, in Europa. Non li vendiamo e non li usiamo per la pubblicità.</p>
 <h4>Uscire</h4><p>In ⚙ puoi uscire dalla chat: il tuo profilo della chat, gli amici e il codice si cancellano. Per tutto il resto scrivi a theigortime@gmail.com.</p>`
 :`<h4>What we keep</h4><p>Your nickname, your Igor’s look, when you were last online (only your friends see it), your friends, friend requests, the people you block and your messages.</p>
 <h4>For how long</h4><p>Unread messages stay until they are read, one year at most. Read messages are deleted 90 days after they were read. Reported conversations stay until we have checked them.</p>
 <h4>Who reads the messages</h4><p>Only you and your friend. The Igor Time admins read only reported messages, to decide what to do.</p>
 <h4>Where</h4><p>The data is on Google Firebase, in Europe. We don’t sell it and we don’t use it for ads.</p>
 <h4>Leaving</h4><p>In ⚙ you can leave the chat: your chat profile, friends and code are deleted. For anything else write to theigortime@gmail.com.</p>`}

/* ---------- a conversation ---------- */
function convo(){const f=chatWith,p=prof(f.other);const b=shell(`<span>${esc(p.nick)}</span>`,{back:true,menu:true,tabs:false});
 const h=panel.querySelector('.top h3'),a=document.createElement('div');a.className='av';a.appendChild(avC(p.av,'sm'));a.insertAdjacentHTML('beforeend',`<i class="dot ${online(p)?'on':''}"></i>`);h.prepend(a);
 const sp=h.querySelector('span');const w=document.createElement('div');w.style.cssText='display:flex;flex-direction:column;min-width:0;line-height:1.05';sp.replaceWith(w);w.appendChild(sp);
 w.insertAdjacentHTML('beforeend',`<small class="mute" style="font-size:12px;font-weight:500;white-space:nowrap" id="igcSeen">${esc(ago(p.seen))}</small>`);
 b.className='body';b.style.padding='0';b.innerHTML='<div class="msgs" id="igcMs"></div>';
 panel.insertAdjacentHTML('beforeend',`<div class="tip" id="igcTip" hidden></div><div class="emo" id="igcEmo" hidden>${EMO.map(e=>`<button data-emo="${e}" aria-label="${e}">${e}</button>`).join('')}</div>
 <div class="bar"><button data-a="emo" aria-label="Emoji">😊</button><input type="text" id="igcIn" maxlength="500" autocomplete="off" enterkeyhint="send" placeholder="${tt('Write something kind…','Scrivi qualcosa di gentile…')}"><button class="go" data-a="send" aria-label="${tt('Send','Invia')}">➤</button></div>`);
 drawMsgs();const i=$('igcIn');i.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}};
 if(matchMedia('(pointer:fine)').matches)setTimeout(()=>i.focus({preventScroll:true}),40)}
const EMO=['😀','😄','😂','😊','🥰','😍','😎','🤩','😮','🤔','😴','🥳','👍','👏','🙌','👋','❤️','💚','✨','⭐','🌈','☀️','🌙','🎉','🌱','🐜','🍅','🥕','🍓','🐚','🎵','🥁'];
function drawMsgs(){const e=$('igcMs');if(!e)return;const atEnd=e.parentNode.scrollHeight-e.parentNode.scrollTop-e.parentNode.clientHeight<80;e.innerHTML='';let d='';
 if(!MS.length)e.innerHTML=`<div class="day">${tt('Say hello! 👋','Saluta! 👋')}</div>`;
 for(const m of MS){const dd=dayOf(m.at);if(dd!==d){d=dd;e.insertAdjacentHTML('beforeend',`<div class="day">${esc(dd)}</div>`)}
  e.insertAdjacentHTML('beforeend',`<div class="m ${m.f===ME.uid?'me':''}">${esc(m.t)}<small>${hm(m.at)}${m.f===ME.uid&&m.rd?' · '+tt('read','letto'):''}</small></div>`)}
 if(atEnd||!e._once){e.parentNode.scrollTop=e.parentNode.scrollHeight;e._once=1}}
function tip(t){const e=$('igcTip');if(!e)return;e.textContent=t;e.hidden=false;clearTimeout(e._t);e._t=setTimeout(()=>{e.hidden=true},6000)}
async function send(){const i=$('igcIn');if(!i)return;const t=i.value.trim().slice(0,500);if(!t)return;
 const c=check(t);if(c==='bad')return tip(tt('Let’s try kinder words 🌱','Proviamo con parole più gentili 🌱'));
 if(c==='personal')return tip(tt('Better not to share numbers, addresses, schools, social accounts or photos here 🌱','Meglio non condividere numeri, indirizzi, scuole, social o foto qui 🌱'));
 i.value='';const tp=$('igcTip');if(tp)tp.hidden=true;try{await B.send(chatWith.pair,chatWith.other,t);if(window.IgorSound)try{window.IgorSound.sfx('tap')}catch(e){}}catch(e){console.warn(e);i.value=t;toast(tt('Not sent, try again.','Non inviato, riprova.'))}}
function openChat(f){chatWith=f;MS=[];if(unMsgs)unMsgs();if(unProf)unProf();
 unMsgs=B.onMsgs(f.pair,l=>{MS=l;drawMsgs();const fr=FR.find(x=>x.pair===f.pair);if(!panel.hidden&&document.visibilityState==='visible'&&(l.some(m=>m.to===ME.uid&&!m.rd)||(fr&&fr.un)))B.markRead(f.pair,l).catch(()=>{})});
 unProf=B.onProfile(f.other,p=>{if(p){PCACHE[f.other]=p;const s=$('igcSeen');if(s)s.textContent=ago(p.seen);const d=panel.querySelector('.top .dot');if(d)d.classList.toggle('on',online(p))}});render()}
function closeChat(){chatWith=null;MS=[];if(unMsgs)unMsgs(),unMsgs=null;if(unProf)unProf(),unProf=null;render()}
function menuV(){let m=panel.querySelector('.menu');if(m){m.remove();return}panel.insertAdjacentHTML('beforeend',`<div class="menu"><button data-a="visit">🏝 ${tt('Visit their island','Visita la sua isola')}</button><button data-a="report">🛡 ${tt('Report','Segnala')}</button><button data-a="block">🚫 ${tt('Block','Blocca')}</button><button data-a="unfriend">${tt('Remove friend','Rimuovi dagli amici')}</button></div>`)}
function reportV(who,whoNick,pair){const b=shell(tt('Report','Segnala'),{back:true,tabs:false});
 const R=[['bad',tt('Offensive or mean words','Parole offensive o cattive')],['unc',tt('Makes me feel uncomfortable','Mi mette a disagio')],['pers',tt('Asks for personal information or photos','Chiede dati personali o foto')],['spam',tt('Spam or too many messages','Spam o troppi messaggi')],['other',tt('Something else','Altro')]];
 b.innerHTML=`<p>${tt('Tell us what happened with','Dicci cosa è successo con')} <b>${esc(whoNick)}</b>. ${tt('They won’t know you reported them.','Non saprà che l’hai segnalato.')}</p>
 ${R.map(([k,l],j)=>`<label class="rd"><input type="radio" name="igcWhy" value="${k}" ${j?'':'checked'}> ${l}</label>`).join('')}
 <h4>${tt('Anything to add? (optional)','Vuoi aggiungere qualcosa? (facoltativo)')}</h4><textarea id="igcNote" rows="3" maxlength="500"></textarea>
 <p class="mute">${tt('The last messages of the conversation are attached to the report.','Alla segnalazione vengono allegati gli ultimi messaggi della conversazione.')}</p>
 <label class="rd"><input type="checkbox" id="igcAlsoBl" checked> ${tt('Also block','Blocca anche')} ${esc(whoNick)}</label>
 <p style="margin-top:12px"><button class="no" data-a="sendrep">${tt('Send the report','Manda la segnalazione')}</button></p>`;
 panel._rep={who,whoNick,pair}}
async function sendRep(){const o=panel._rep;if(!o)return;const why=(panel.querySelector('input[name=igcWhy]:checked')||{}).value||'other',note=($('igcNote').value||'').slice(0,500),bl=$('igcAlsoBl').checked;
 const msgs=o.pair&&chatWith&&chatWith.pair===o.pair?MS.slice(-20):[];
 try{await B.report({who:o.who,whoNick:o.whoNick,pair:o.pair,why,note,msgs});if(bl)await B.block(o.who,o.whoNick)}catch(e){console.warn(e);return toast(tt('Could not send, try again.','Non riesco a mandarla, riprova.'))}
 panel._rep=null;if(bl)closeChat();else render();
 const b=shell('💬 Chat',{tabs:false});b.innerHTML=`<div class="center"><p><b>${tt('Thank you.','Grazie.')}</b></p><p>${tt('We’ll look at it soon.','La guarderemo presto.')} ${bl?tt('You won’t receive anything from this person any more.','Non riceverai più niente da questa persona.'):''}</p><button class="go" data-a="home">OK</button></div>`}

/* ---------- admin: reports ---------- */
let showArch=false;
function reportsV(){const b=shell('💬 Chat');const why={bad:tt('offensive words','parole offensive'),unc:tt('uncomfortable','mette a disagio'),pers:tt('personal info / photos','dati personali / foto'),spam:'spam',other:tt('other','altro')};
 const L=REP.filter(r=>showArch?true:r.st==='open');
 b.innerHTML=`<p class="mute">${tt('Only admins see this page.','Questa pagina la vedono solo gli amministratori.')} <span class="linkish" data-a="arch">${showArch?tt('Hide archived','Nascondi archiviate'):tt('Show archived','Mostra archiviate')}</span></p>`;
 if(!L.length)b.insertAdjacentHTML('beforeend',`<p class="center">${tt('No open reports. 🌱','Nessuna segnalazione aperta. 🌱')}</p>`);
 for(const r of L){const d=document.createElement('div');d.className='rep'+(r.st==='open'?' open':'');
  d.innerHTML=`<div><b>${esc(r.byNick||'?')}</b> → <b>${esc(r.whoNick||'?')}</b> · ${esc(why[r.why]||r.why)}</div><div class="mute">${new Date(r.at||Date.now()).toLocaleString(LANG==='it'?'it-IT':'en-GB')} · ${r.st==='open'?tt('open','aperta'):tt('archived','archiviata')}</div>
  ${r.note?`<p style="margin:6px 0">“${esc(r.note)}”</p>`:''}<div class="q">${r.msgs.length?r.msgs.map(m=>`<div class="${m.f===r.who?'w':''}"><b>${esc(m.f===r.who?r.whoNick:m.f===r.by?r.byNick:'?')}</b> <span class="mute">${hm(m.at)}</span>: ${esc(m.t)}</div>`).join(''):tt('(no messages attached)','(nessun messaggio allegato)')}</div>
  <div class="bt" style="display:flex;gap:6px;flex-wrap:wrap"><button data-a="archive" data-id="${esc(r.id)}">${r.st==='open'?tt('Archive','Archivia'):tt('Reopen','Riapri')}</button><button class="no" data-a="susp" data-uid="${esc(r.who)}" data-nick="${esc(r.whoNick)}">…</button></div>`;
  b.appendChild(d);const sb=d.querySelector('[data-a=susp]');B.isSusp(r.who).then(s=>{sb.textContent=s?tt('Reactivate ','Riattiva ')+r.whoNick:tt('Suspend ','Sospendi ')+r.whoNick;sb.dataset.on=s?'1':''})}}

/* ---------- clicks ---------- */
panel.addEventListener('click',async e=>{const t=e.target.closest('[data-a],[data-tab],[data-emo]');if(!t)return;
 if(t.dataset.emo){const i=$('igcIn');if(i){const s=i.selectionStart??i.value.length;i.value=(i.value.slice(0,s)+t.dataset.emo+i.value.slice(i.selectionEnd??s)).slice(0,500);i.focus({preventScroll:true});i.selectionStart=i.selectionEnd=s+t.dataset.emo.length}return}
 if(t.dataset.tab){view=t.dataset.tab;chatWith=null;return render()}
 const a=t.dataset.a,id=t.dataset.id,uid=t.dataset.uid;
 try{
 if(a==='close')return close();
 if(a==='signin'){close();if(window.IgorUI&&window.IgorUI.openAccount)window.IgorUI.openAccount();else location.href='/?signin';return}
 if(a==='back'){if(panel._rep){panel._rep=null;return render()}if(chatWith)return closeChat();return render()}
 if(a==='home'){return render()}
 if(a==='retry'){t.disabled=true;try{PROF=await B.profile();NETERR=false;if(PROF){SUSP=await B.suspended();live()}}catch(e){NETERR=true;toast(tt('Still not reachable, try again in a moment.','Ancora niente, riprova tra poco.'))}return render()}
 if(a==='privacy')return privacyV();
 if(a==='join'){t.disabled=true;const req=(panel.querySelector('input[name=igcReq]:checked')||{}).value||'all';await B.join(req,myAv());PROF=await B.profile();SUSP=await B.suspended();live();view='find';return render()}
 if(a==='open'){const f=FR.find(x=>x.pair===t.dataset.pair);if(f)openChat(f);return}
 if(a==='accept'){const r=RIN.find(x=>x.id===id);if(r){t.disabled=true;await B.accept(r);toast(tt('You are friends now! 🎉','Ora siete amici! 🎉'))}return}
 if(a==='decline'){const r=RIN.find(x=>x.id===id);if(r)await B.decline(r);return}
 if(a==='blockreq'){const r=RIN.find(x=>x.id===id);if(r){await B.block(r.from,r.fromNick);await B.decline(r);toast(tt('Blocked','Bloccato'))}return}
 if(a==='cancel'){const r=ROUT.find(x=>x.id===id);if(r)await B.decline(r);return}
 if(a==='ask'){const row=t.closest('.row'),p=row&&row._p;if(!p)return;t.disabled=true;
  try{await B.request(p.uid,t.dataset.via,p.nick,p.av,PROF.av);toast(tt('Request sent!','Richiesta mandata!'));setTimeout(()=>{drawRes();drawCode()},300)}
  catch(err){t.disabled=false;toast(String(err&&err.message)==='limit'?tt('You sent many requests today: try again tomorrow.','Hai mandato tante richieste oggi: riprova domani.'):tt('Could not send the request.','Non riesco a mandare la richiesta.'))}return}
 if(a==='code'){const v=($('igcCode').value||'').trim().toUpperCase();if(v.length!==6)return toast(tt('The code has 6 characters.','Il codice ha 6 caratteri.'));
  const r=await B.byCode(v);codeRes=r&&r.uid!==ME.uid?r:false;if(r&&r.uid===ME.uid)toast(tt('That’s your own code!','È il tuo codice!'));return drawCode()}
 if(a==='unblock'){await B.unblock(uid);toast(tt('Unblocked','Sbloccato'));return}
 if(a==='leave'){if(!t.dataset.sure){t.dataset.sure=1;t.textContent=tt('Tap again to leave','Tocca ancora per uscire');return}
  subs.splice(0).forEach(f=>f());clearInterval(pingT);await B.leave(FR.map(f=>f.pair));PROF=null;FR=[];RIN=[];ROUT=[];badge();return render()}
 if(a==='menu')return menuV();
 if(a==='visit'){const p=prof(chatWith.other),u=chatWith.other;if(window.IgorVisit)return IgorVisit.go(u,p.nick);location.href='/?visit='+encodeURIComponent(u);return}
 if(a==='emo'){const e2=$('igcEmo');e2.hidden=!e2.hidden;return}
 if(a==='send')return send();
 if(a==='report'){const p=prof(chatWith.other);return reportV(chatWith.other,p.nick,chatWith.pair)}
 if(a==='sendrep'){t.disabled=true;await sendRep();return}
 if(a==='block'){if(!t.dataset.sure){t.dataset.sure=1;t.textContent=tt('Tap again to block','Tocca ancora per bloccare');return}const p=prof(chatWith.other);await B.block(chatWith.other,p.nick);toast(tt('Blocked','Bloccato'));return closeChat()}
 if(a==='unfriend'){if(!t.dataset.sure){t.dataset.sure=1;t.textContent=tt('Tap again to remove','Tocca ancora per rimuovere');return}await B.unfriend(chatWith.pair);return closeChat()}
 if(a==='arch'){showArch=!showArch;return render()}
 if(a==='archive'){const r=REP.find(x=>x.id===id);if(r){t.disabled=true;await B.archive(r,r.st!=='open')}return}
 if(a==='susp'){const on=!t.dataset.on;if(on&&!t.dataset.sure){t.dataset.sure=1;t.textContent=tt('Tap again to suspend','Tocca ancora per sospendere');return}await B.setSusp(uid,on,t.dataset.nick);toast(on?tt('Suspended','Sospeso'):tt('Reactivated','Riattivato'));return render()}
 }catch(err){console.warn('chat',a,err);toast(tt('Something went wrong, try again.','Qualcosa non ha funzionato, riprova.'));t.disabled=false}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.stopPropagation();close()}},true);
['keydown','keyup','keypress'].forEach(k=>panel.addEventListener(k,e=>e.stopPropagation()));
['pointerdown','wheel','touchstart'].forEach(k=>panel.addEventListener(k,e=>e.stopPropagation(),{passive:true}));

function open(){start();panel.hidden=false;if(window.IgorSound)try{window.IgorSound.sfx('open')}catch(e){}render()}
function close(){panel.hidden=true;if(chatWith){if(unMsgs)unMsgs(),unMsgs=null;if(unProf)unProf(),unProf=null;chatWith=null}const m=panel.querySelector('.menu');if(m)m.remove();badge()}
window.IgorChat={open,close,start,unread,show(v){view=v;chatWith=null;if(panel.hidden)open();else render()}};
const cb=$('chatB');if(cb)cb.addEventListener('click',e=>{e.preventDefault();panel.hidden?open():close()});
start();
})();

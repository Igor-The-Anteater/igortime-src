/* Igor time · the house games kit.
   Shared by the kitchen (duration), the window (volume) and the bedroom (timbre):
   Igor's drawing with avatar and accessories, the curtain, the room, rounds, score, seeds. */
(()=>{
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=u=>u*u*(3-2*u);
const $=id=>document.getElementById(id);
const IGOR_SRC=window.IGOR_SRC||'/igor.webp';

/* ================= Igor (island drawing, 663×730 coordinates) ================= */
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
/* Igor's accessories: a cap (Igor only) and glasses (everyone). Same code as the island (igorAcc). */
const ACC_REF=[{x:465,y:233,rx:41,ry:45},{x:538.5,y:225,rx:34.5,ry:41}];
function accShade(col,k){const n=parseInt(col.slice(1),16),f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`}
function accMap(c,eyes){const a=ACC_REF,b=eyes,dxa=a[1].x-a[0].x,dya=a[1].y-a[0].y,dxb=b[1].x-b[0].x,dyb=b[1].y-b[0].y;
 const s=Math.hypot(dxb,dyb)/Math.hypot(dxa,dya),r=Math.atan2(dyb,dxb)-Math.atan2(dya,dxa),cs=s*Math.cos(r),sn=s*Math.sin(r);
 c.transform(cs,sn,-sn,cs,b[0].x-(cs*a[0].x-sn*a[0].y),b[0].y-(sn*a[0].x+cs*a[0].y))}
function accCap(c,col){const w=86,h=72;c.save();c.translate(384,128);c.rotate(.42);c.lineJoin='round';c.lineCap='round';c.strokeStyle='#141414';c.lineWidth=6;
 c.fillStyle=accShade(col,.78);c.beginPath();c.moveTo(w*.35,-4);c.quadraticCurveTo(w*1.55,-14,w*2.05,10);c.quadraticCurveTo(w*1.45,22,w*.3,12);c.closePath();c.fill();c.stroke();
 c.fillStyle=col;c.beginPath();c.moveTo(-w,4);c.bezierCurveTo(-w,-h*1.25,w,-h*1.25,w,4);c.quadraticCurveTo(0,14,-w,4);c.closePath();c.fill();c.stroke();
 c.lineWidth=3.5;c.globalAlpha=.55;c.beginPath();c.moveTo(-6,-h*.93);c.quadraticCurveTo(14,-h*.4,8,9);c.stroke();
 c.beginPath();c.moveTo(-w*.92,-12);c.quadraticCurveTo(0,-2,w*.92,-12);c.stroke();c.globalAlpha=1;
 c.fillStyle=accShade(col,.8);c.lineWidth=4.5;c.beginPath();c.arc(-6,-h*.93-3,9,0,Math.PI*2);c.fill();c.stroke();
 c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(-w*.42,-h*.55,13,22,-.6,0,Math.PI*2);c.fill();c.restore()}
function accGlasses(c,kind,col){const E=ACC_REF,sun=kind==='sun';c.save();c.lineJoin='round';c.lineCap='round';
 const L=E.map(e=>({x:e.x+(sun?2:0),y:e.y+(sun?6:2),rx:e.rx*(sun?1.3:1.2),ry:e.ry*(sun?1.08:1.16)}));
 c.strokeStyle=col==='#ffffff'?'#d9d9d9':col;c.lineWidth=sun?9:7;c.beginPath();c.moveTo(L[0].x-L[0].rx+4,L[0].y-L[0].ry*.35);c.quadraticCurveTo(L[0].x-L[0].rx-60,L[0].y-L[0].ry*.75,L[0].x-L[0].rx-118,L[0].y-L[0].ry*.2);c.stroke();
 c.strokeStyle='#141414';c.lineWidth=2.5;c.stroke();
 for(const i of[1,0]){const l=L[i];c.beginPath();if(sun){c.moveTo(l.x-l.rx,l.y-l.ry*.55);c.quadraticCurveTo(l.x,l.y-l.ry*1.05,l.x+l.rx,l.y-l.ry*.55);c.bezierCurveTo(l.x+l.rx*1.05,l.y+l.ry*.9,l.x-l.rx*1.05,l.y+l.ry*1.05,l.x-l.rx,l.y-l.ry*.55)}else c.ellipse(l.x,l.y,l.rx,l.ry,0,0,Math.PI*2);c.closePath();
  c.fillStyle=sun?'rgba(16,20,30,.9)':'rgba(205,232,255,.2)';c.fill();
  c.strokeStyle='#141414';c.lineWidth=sun?13:11;c.stroke();c.strokeStyle=col;c.lineWidth=sun?8:6;c.stroke();
  c.save();c.clip();c.strokeStyle='rgba(255,255,255,'+(sun?.55:.6)+')';c.lineWidth=5;c.beginPath();c.arc(l.x-l.rx*.2,l.y-l.ry*.1,l.rx*.62,Math.PI*1.08,Math.PI*1.42);c.stroke();c.restore()}
 c.restore()}
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
function igorAcc(c,eyes,o){if(o&&o.outfit==='chef'){c.save();accMap(c,eyes);apron(c);chefHat(c);c.restore()}
 if(!o)return;const cap=o.avatar==='igor'&&o.ball&&o.outfit!=='chef',gl=o.glasses==='eye'||o.glasses==='sun';if(!cap&&!gl)return;
 c.save();accMap(c,eyes);if(cap)accCap(c,o.ball);if(gl)accGlasses(c,o.glasses,o.gcol||'#141414');c.restore()}
const PAD=.24; // room above the head for hats
function paintAvatar(c,o,k0=0,k1=0,w=SW,h=SH*(1+PAD)){c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);if(!igorOK)return;const sc=Math.min(w/663,h/(730*(1+PAD)));c.setTransform(sc,0,0,sc,(w-663*sc)/2,PAD*730*sc);c.drawImage(igorImg,0,0,663,730);
 const d0=lid(c,EYES[0],k0),d1=lid(c,EYES[1],k1);
 if(o.avatar==='she'){lashes(c,EYES[0],d0,2);lashes(c,EYES[1],d1,2);bowAt(c,262,92,30,o.ball||'#ff8ab6')}
 else if(o.avatar==='queer'){lashes(c,EYES[0],d0,1);lashes(c,EYES[1],d1,1);starAt(c,262,90,30,['#fcf434','#ffffff','#9c59d1','#2c2c2c'])}
 igorAcc(c,EYES,o);c.setTransform(1,0,0,1,0,0)}

/* who is playing: registered players use the Igor of their account */
let ACCT=null,HOME=null;try{ACCT=JSON.parse(localStorage.getItem('igortime_acct'));HOME=JSON.parse(localStorage.getItem('igortime_v1'))}catch(e){}
const ME={avatar:'igor',ball:null,glasses:null,gcol:'#141414'};
if(ACCT&&HOME&&AVN[HOME.avatar])Object.assign(ME,{avatar:HOME.avatar,ball:HOME.ball||null,glasses:HOME.glasses||null,gcol:HOME.gcol||'#141414'});
else{try{const v=localStorage.getItem('igortime_houseAvatar');if(AVN[v])ME.avatar=v}catch(e){}}

const spr=document.createElement('canvas');spr.width=SW;spr.height=Math.round(SH*(1+PAD));const sx=spr.getContext('2d');let sprKey='';
const BL={next:2,start:-9,lag:[0,.08]};
function blink(t){if(t>BL.next){BL.start=t;const lag=.06+Math.random()*.05;BL.lag=Math.random()<.5?[0,lag]:[lag,0];BL.next=t+(Math.random()<.2?.45:2.5+Math.random()*4)}
 const cc=BL.lag.map(l=>{const u=t-BL.start-l;if(u<0||u>.26)return 0;return u<.07?u/.07:u<.12?1:1-(u-.12)/.14});
 const k=[ME.avatar,ME.outfit,cc[0].toFixed(2),cc[1].toFixed(2),igorOK].join('|');if(k===sprKey)return;sprKey=k;paintAvatar(sx,ME,cc[0],cc[1])}

/* ================= little drawings shared by the rooms ================= */
function rr(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath()}
/* a tofu ant made of little white cubes; col/glow change it (e.g. cooked) */
function drawAnt(g,x,y,k,ang,t,o={}){const alpha=o.alpha??1,col=o.col||'#f8f5ec',walk=o.walk??1;g.save();g.globalAlpha=alpha;g.translate(x,y);g.rotate(ang);g.scale(k,k);const lw=Math.sin(t*9)*walk;
 g.strokeStyle=o.leg||'rgba(70,52,40,.85)';g.lineWidth=.9;g.lineCap='round';
 for(let i=0;i<3;i++)for(const s of[-1,1]){const bx=-1+i*1.6,w=(i%2?1:-1)*lw*1.4*s;g.beginPath();g.moveTo(bx,0);g.lineTo(bx+(i-1)*1.8+w,s*3.8);g.lineTo(bx+(i-1)*3+w*1.4,s*6.2);g.stroke()}
 g.beginPath();g.moveTo(7.2,-1.2);g.quadraticCurveTo(9.6,-4.6+lw*.6,12,-4.2);g.moveTo(7.2,1.2);g.quadraticCurveTo(9.6,4.6-lw*.6,12,4.2);g.stroke();
 if(o.glow){g.shadowColor=o.glow;g.shadowBlur=9}g.fillStyle=col;g.strokeStyle='rgba(60,40,25,.55)';g.lineWidth=.6;
 for(const b of[[-11,-3.9,8.6,7.8,1.7],[-2.4,-2.3,4.8,4.6,1.1],[2.9,-2.8,5.4,5.6,1.3]]){rr(g,...b);g.fill();g.stroke()}
 g.shadowBlur=0;g.fillStyle='#2b2b2b';g.beginPath();g.arc(6.9,-1.1,.62,0,TAU);g.fill();g.restore()}
/* the red curtain: open 0..1, light 0..1 (a warm light behind it while the reference plays) */
function drawCurtain(g,x0,x1,y0,y1,open,light,t,lightCol='241,180,110'){const w=(x1-x0)/2;
 if(light>0){const gr=g.createRadialGradient((x0+x1)/2,(y0+y1)/2,10,(x0+x1)/2,(y0+y1)/2,(y1-y0)*.7);gr.addColorStop(0,`rgba(${lightCol},${.4*light})`);gr.addColorStop(1,`rgba(${lightCol},0)`);g.fillStyle=gr;g.fillRect(x0-30,y0-30,x1-x0+60,y1-y0+60)}
 const dw=w*(1-.86*ease(open))+4*(1-open); // the two halves overlap a little when closed: nothing peeks through
 for(const side of[0,1]){const xa=side?x1-dw:x0;const gr=g.createLinearGradient(xa,0,xa+dw,0);const L=.25+.5*light;
  for(let i=0;i<=7;i++){const s=i/7,v=.55+.45*Math.cos(s*Math.PI*2*3.5+(side?1:0));gr.addColorStop(s,`rgb(${Math.round(110+120*L*v)},${Math.round(26+50*L*v)},${Math.round(44+40*L*v)})`)}
  g.fillStyle=gr;g.beginPath();const sway=Math.sin(t*.9+side)*3*(1-open);
  if(side){g.moveTo(x1,y0);g.lineTo(x1-dw,y0);g.quadraticCurveTo(x1-dw-sway,(y0+y1)/2,x1-dw+(open>0?dw*.25*open:0),y1);g.lineTo(x1,y1)}
  else{g.moveTo(x0,y0);g.lineTo(x0+dw,y0);g.quadraticCurveTo(x0+dw+sway,(y0+y1)/2,x0+dw-(open>0?dw*.25*open:0),y1);g.lineTo(x0,y1)}
  g.closePath();g.fill()}
 g.fillStyle='#4a2a1a';rr(g,x0-8,y0-12,x1-x0+16,16,7);g.fill();
 g.fillStyle=`rgba(255,226,170,${.3+.65*light})`;g.beginPath();g.arc((x0+x1)/2,y0-18,4+3*light,0,TAU);g.fill()}
/* a cosy wall and wooden floor for a panel */
function drawRoom(g,x0,w,H,o={}){const y0=o.y0||0,floorY=o.floorY??y0+H*.74,wall=o.wall||['#f0dcb4','#e2c494'];H=y0+H;
 const gr=g.createLinearGradient(0,y0,0,floorY);gr.addColorStop(0,wall[0]);gr.addColorStop(1,wall[1]);g.fillStyle=gr;g.fillRect(x0,y0,w,floorY-y0);
 g.fillStyle=o.stripe||'rgba(160,110,60,.07)';for(let x=x0+12;x<x0+w;x+=34)g.fillRect(x,y0,12,floorY-y0);
 const wh=(H-y0)*.09;g.fillStyle=o.wains||'#b98a5a';g.fillRect(x0,floorY-wh,w,wh);g.fillStyle='rgba(60,35,15,.25)';g.fillRect(x0,floorY-wh,w,3);
 const fg=g.createLinearGradient(0,floorY,0,H);fg.addColorStop(0,o.floor?.[0]||'#9a6a40');fg.addColorStop(1,o.floor?.[1]||'#6e4527');g.fillStyle=fg;g.fillRect(x0,floorY,w,H-floorY);
 g.strokeStyle='rgba(40,20,8,.25)';g.lineWidth=1.5;for(let y=floorY+14,i=0;y<H;y+=18+i*3,i++){g.beginPath();g.moveTo(x0,y);g.lineTo(x0+w,y);g.stroke()}
 g.fillStyle='rgba(40,20,8,.35)';g.fillRect(x0,floorY,w,4);return floorY}

/* ================= the game shell ================= */
const CSS=`:root{--night:#140d09;--ink:#f3e7d3;--dim:#b49f86;--warm:#f1b46e;--bone:#efe4cf;--glow:#ffd38a;
 --display:'Instrument Serif',Georgia,serif;--toon:'Fredoka','Trebuchet MS',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace;color-scheme:dark}
html,body{height:100%;margin:0;background:var(--night);color:var(--ink);overflow:hidden;font-family:var(--mono);-webkit-user-select:none;user-select:none}
#c{position:fixed;inset:0;width:100%;height:100%;display:block;touch-action:none}
header{position:fixed;z-index:2;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;gap:12px;pointer-events:none;background:linear-gradient(rgba(20,13,9,.85) 30%,rgba(20,13,9,0));
 padding:calc(12px + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) 18px max(16px,env(safe-area-inset-left,0px))}
.igback{pointer-events:auto;font:500 11px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--ink);text-decoration:none;border:1px solid rgba(243,231,211,.35);border-radius:999px;padding:9px 13px;white-space:nowrap;background:rgba(20,13,9,.6)}.igback:hover{border-color:var(--glow);color:var(--glow)}
h1{margin:0;font:400 clamp(20px,3.2vw,32px)/1 var(--display);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}h1 em{color:var(--warm)}h1 a{color:inherit;text-decoration:none;pointer-events:auto}
#stat{font:500 10.5px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--dim);text-align:right;white-space:nowrap}#stat b{color:var(--bone);font-weight:500}
@media (max-width:560px){.igback{padding:8px 10px;font-size:10px}h1 .gm{display:none}#bar{gap:7px;padding-left:8px;padding-right:8px}#bar button{padding:12px 12px;letter-spacing:.08em;font-size:10.5px}#bar button.hold{padding:13px 18px}}
#bar{position:fixed;z-index:2;left:0;right:0;bottom:0;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;padding:0 16px calc(16px + env(safe-area-inset-bottom,0px))}
button{font:500 11px var(--mono);letter-spacing:.14em;text-transform:uppercase;padding:13px 18px;border-radius:999px;cursor:pointer;background:rgba(20,13,9,.55);color:var(--ink);border:1px solid rgba(243,231,211,.4);-webkit-tap-highlight-color:transparent;touch-action:manipulation}
button.main{background:var(--warm);color:#2b1a0e;border-color:var(--warm)}
button.hold{background:#2f6fd6;border-color:#8fb8ff;color:#fff;padding:15px 24px}button.hold.on{background:#5b93ff;box-shadow:0 0 22px rgba(120,170,255,.8)}
button:disabled{opacity:.35;cursor:default}button:focus-visible{outline:2px solid var(--bone);outline-offset:3px}
@keyframes okglow{0%{box-shadow:0 0 0 0 rgba(241,180,110,0);transform:scale(1)}14%{box-shadow:0 0 26px 8px rgba(241,180,110,.9),0 0 0 3px rgba(239,228,207,.85);transform:scale(1.07)}30%{box-shadow:0 0 8px 2px rgba(241,180,110,.35);transform:scale(1)}46%{box-shadow:0 0 22px 6px rgba(241,180,110,.7);transform:scale(1.05)}62%{box-shadow:0 0 6px 1px rgba(241,180,110,.25);transform:scale(1)}78%{box-shadow:0 0 16px 4px rgba(241,180,110,.45);transform:scale(1.03)}100%{box-shadow:0 0 0 0 rgba(241,180,110,0);transform:scale(1)}}
.nudge{animation:okglow 3s ease-in-out 1}
#bubble{position:fixed;left:0;top:0;z-index:3;pointer-events:none;font:500 18px/1.2 var(--toon);color:#2b2018;background:#f7ecd4;border:3px solid #2b2018;
 padding:8px 14px 9px;border-radius:16px;box-shadow:0 4px 0 #2b2018;max-width:min(260px,46vw);opacity:0;transition:opacity .3s;will-change:transform}
#bubble::after{content:'';position:absolute;left:calc(var(--tx,40px) - 8px);bottom:-11px;width:14px;height:14px;background:#f7ecd4;border:3px solid #2b2018;border-top:0;border-left:0;transform:rotate(45deg);border-radius:0 0 4px 0}
#bubble.below::after{bottom:auto;top:-11px;transform:rotate(225deg)}
@media (max-width:560px){#bubble{font-size:15px}}
.ov{position:fixed;inset:0;z-index:5;display:grid;place-items:center;background:radial-gradient(ellipse at 50% 55%,rgba(20,13,9,.78),rgba(20,13,9,.97) 75%);padding:16px;box-sizing:border-box;overflow:auto}
.ov[hidden]{display:none}.card{max-width:31rem;width:100%}
.card h2{margin:0;font:400 clamp(40px,8vw,72px)/.95 var(--display);letter-spacing:-.02em}.card h2 em{color:var(--warm)}
.card p{font-size:12px;line-height:1.7;color:var(--dim);margin:1em 0}.card p b{color:var(--ink);font-weight:500}
.card .row{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 10px}
.card .av button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 12px 10px;border-radius:18px}.card .av canvas{width:58px;height:64px}
.card .av button[aria-pressed="true"],.card .lv button[aria-pressed="true"]{border-color:var(--warm);color:var(--warm)}
.card .big{font:400 clamp(56px,12vw,96px)/1 var(--display);color:var(--bone)}
.card .small{font-size:10.5px;letter-spacing:.08em;color:var(--dim)}.card a{color:var(--warm)}
.card .warn{color:var(--bone);border:1px solid rgba(241,180,110,.45);border-radius:14px;padding:9px 12px}`;

/* two panels: side by side on wide screens, one above the other on tall ones (phones) */
function panels(W,H){const tall=H>W*1.15;if(!tall)return{tall,P:[{x:0,y:0,w:W/2,h:H},{x:W/2,y:0,w:W/2,h:H}]};
 const y0=58,y1=H-74,h=(y1-y0)/2;return{tall,P:[{x:0,y:y0,w:W,h},{x:0,y:y0+h,w:W,h}]}}
window.IgorHouse={panels,paintAvatar,igorImg,igorReady:()=>igorOK,TAU,clamp,lerp,ease,rr,drawAnt,drawCurtain,drawRoom,ME,AVN};

window.IgorGame=function(cfg){
 const N=cfg.rounds||8,MAXR=cfg.maxRound||125,MULT={easy:1,medium:2,extreme:3};if(cfg.outfit){ME.outfit=cfg.outfit;sprKey=''}
 const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
 const avBtns=Object.entries(AVN).map(([k,n])=>`<button type="button" data-av="${k}" aria-pressed="false"><canvas width="116" height="128"></canvas>${n}</button>`).join('');
 const lvBtns=Object.entries(cfg.levels).map(([k,l])=>`<button type="button" data-lv="${k}" aria-pressed="false">${l.name}</button>`).join('');
 document.body.insertAdjacentHTML('afterbegin',`<canvas id="c" aria-label="${cfg.aria}"></canvas>
<header><a class="igback" href="/">← Island</a><h1><a href="/"><em>Igor</em> time</a><span class="gm"> · ${cfg.name}</span></h1><div id="stat">round <b id="rd">1/${N}</b><br>score <b id="sc">0</b></div></header>
<div id="bubble"></div><div id="bar">${cfg.bar}</div>
<div class="ov" id="start"><div class="card"><h2>${cfg.title}</h2>${cfg.intro}<p class="small" id="acctline"></p>
<div class="row av" role="group" aria-label="Choose your anteater">${avBtns}</div>
${cfg.phones?'<p class="warn">🎧 Use headphones, and keep your volume fixed for the whole game.</p>':''}
<p class="small">${N} rounds · ${cfg.keys}</p><div class="row lv" role="group" aria-label="Difficulty">${lvBtns}</div><p class="small" id="lvinfo"></p>
<div class="row"><button class="main" id="go" type="button">Start</button></div></div></div>
<div class="ov" id="end" hidden><div class="card"><p class="small" id="endlv"></p><div class="big" id="endsc">0</div><p class="small">out of ${N*MAXR}</p>
<p id="endmsg"></p><p class="small" id="endbest"></p><p id="endseeds" style="color:var(--warm)"></p>
<div class="row"><button class="main" id="again" type="button">Play again</button><button id="menu" type="button">Change level</button></div><p class="small"><a href="/">← back to the island</a></p></div></div>`);
 try{const h=localStorage.getItem('igortime_home');if(h)document.querySelectorAll('a[href="/"]').forEach(a=>a.href=h)}catch(e){}

 const cv=$('c'),g=cv.getContext('2d');
 const K={g,cv,W:0,H:0,DPR:1,T:0,phase:'menu',round:0,total:0,R:null,LV:null,lv:'easy',refOn:false,refT0:0,refDur:0,revT:0,AC:null,OUT:null,ME,
  name:()=>AVN[ME.avatar],igor:null,eats:[],
  now:()=>performance.now()/1000};
 /* ---- audio: one fixed master gain, no compressor (levels matter in these games) ---- */
 K.audio=()=>{if(K.AC)return K.AC;const AC=K.AC=new (window.AudioContext||window.webkitAudioContext)();K.OUT=AC.createGain();K.OUT.gain.value=.8;K.OUT.connect(AC.destination);
  const n=AC.sampleRate*4,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;K.NOISE=b;return AC};
 /* ---- Igor ---- */
 igorImg.onload=()=>{igorOK=true;sprKey='';drawAvButtons()};igorImg.src=IGOR_SRC;
 K.drawIgor=(x,y,h,face=1,o={})=>{const w=h*SW/SH,t=K.T,gulp=K.gulp(),by=y+Math.sin(t*1.6)*h*.015;K.igor={x,y,h,face};
  g.save();g.globalAlpha=o.alpha??1;
  if(o.shadow!==false){g.fillStyle='rgba(40,20,8,.25)';g.beginPath();g.ellipse(x,y+h*.5,w*.36,h*.06,0,0,TAU);g.fill()}
  g.translate(x,by);g.rotate(Math.sin(t*.8)*.03);g.scale(face*(1+gulp*.07),1-gulp*.05);
  if(igorOK)g.drawImage(spr,-w/2,-h/2-h*PAD,w,h*(1+PAD));else{g.fillStyle=SKIN;g.beginPath();g.arc(0,0,h*.3,0,TAU);g.fill()}g.restore()};
 K.mouth=()=>{const I=K.igor;return I?[I.x+I.face*I.h*.32,I.y+I.h*.42]:[0,0]};
 /* an ant jumps into Igor's mouth: gnam! */
 K.eat=(x,y,k,col)=>K.eats.push({x,y,k,col,t:0,crumbs:null});
 K.gulp=()=>{let v=0;for(const e of K.eats){const a=e.t-.7;if(a>0&&a<.7)v=Math.max(v,Math.abs(Math.sin(a/.7*TAU))*(1-a/.7*.5))}return v};
 function drawEats(dt){for(const e of K.eats){e.t+=dt;const[mx,my]=K.mouth();
   if(e.t<.7){const q=ease(e.t/.7),x=lerp(e.x,mx,q),y=lerp(e.y,my,q)-Math.sin(q*Math.PI)*K.H*.12;drawAnt(g,x,y,e.k*(1-.5*q),q*9,K.T,{col:e.col,walk:2})}
   else{const a=e.t-.7;if(!e.crumbs){e.crumbs=[];for(let i=0;i<9;i++){const an=-Math.PI/2+(Math.random()-.5)*2.4,v=40+Math.random()*70;e.crumbs.push({vx:Math.cos(an)*v,vy:Math.sin(an)*v,s:2+Math.random()*2.5,r:Math.random()*6})}e.mx=mx;e.my=my}
    for(const c of e.crumbs){g.save();g.globalAlpha=clamp(1-a/1.1,0,1);g.translate(e.mx+c.vx*a,e.my+c.vy*a+60*a*a);g.rotate(c.r+a*5);g.fillStyle=e.col;g.fillRect(-c.s/2,-c.s/2,c.s,c.s);g.restore()}
    const ga=clamp(1-(a-.5)/.8,0,1)*clamp(a/.12,0,1);if(ga>0){g.save();g.globalAlpha=ga;g.fillStyle='#fff3d6';g.strokeStyle='#2b2018';g.lineWidth=4;g.font='700 '+Math.round(20+K.igor.h*.06)+'px Fredoka,sans-serif';g.textAlign='center';g.strokeText('gnam!',e.mx+K.igor.face*30,e.my-K.igor.h*.25-a*34);g.fillText('gnam!',e.mx+K.igor.face*30,e.my-K.igor.h*.25-a*34);g.restore()}}}
  K.eats=K.eats.filter(e=>e.t<2.2)}
 /* ---- speech bubble, tail on Igor ---- */
 const bubble=$('bubble');let bubT=0,bubS=0;const bubQ=[];
 K.say=(t,s=2.4)=>{s=Math.max(s,1.6+t.split(/\s+/).length*.42)*(cfg.bubble||1);if(bubT>0&&bubble.textContent===t)return;if(bubT>0&&bubS<1.8){if(!bubQ.some(q=>q[0]===t)){bubQ.push([t,s]);if(bubQ.length>3)bubQ.shift()}return}bubble.textContent=t;bubT=s;bubS=0};
 function placeBubble(dt){if(bubT<=0&&bubQ.length){const[q,s]=bubQ.shift();bubble.textContent=q;bubT=s;bubS=0}if(bubT<=0||!K.igor){bubble.style.opacity=0;return}bubT-=dt;bubS+=dt;bubble.style.opacity=bubT>0?1:0;
  const I=K.igor,bw=bubble.offsetWidth,bh=bubble.offsetHeight,ix=I.x+I.face*I.h*.12;let x=clamp(ix-bw*.55,10,Math.max(10,K.W-bw-10)),y=I.y-I.h*(ME.outfit?.7:.5)-bh-12,below=false;if(y<64){y=I.y+I.h*.52+14;below=true}
  bubble.classList.toggle('below',below);bubble.style.setProperty('--tx',clamp(ix-x,22,bw-22)+'px');bubble.style.transform=`translate(${x}px,${y}px)`}
 /* ---- rounds ---- */
 let nudgeIv=0;const okB=$('ok');
 function nudge(){if(!okB)return;okB.classList.remove('nudge');void okB.offsetWidth;if(K.phase==='guess')okB.classList.add('nudge')}
 K.moved=()=>{if(K.phase!=='guess'||!K.R||K.R.moved)return;K.R.moved=true;nudge();clearInterval(nudgeIv);nudgeIv=setInterval(nudge,6500)};
 K.canListen=()=>K.phase==='guess'&&!K.refOn&&!(K.R&&K.R.played&&K.R.left<=0)&&!(cfg.busy&&cfg.busy(K));
 K.listen=()=>{if(!K.AC||!K.canListen())return;const R=K.R;if(R.played)R.left--;R.played=true;
  const d=cfg.playRef(R,K.LV,K);K.refOn=true;K.refT0=K.now();K.refDur=d;K.update();
  clearTimeout(K._rt);K._rt=setTimeout(()=>{K.refOn=false;cfg.refEnd&&cfg.refEnd(R,K);K.update()},d*1000+60)};
 function newRound(){K.round++;clearInterval(nudgeIv);K.R={left:K.LV.replays,played:false,moved:false};cfg.newRound(K.R,K.LV,K);K.phase='guess';K.revT=0;
  $('rd').textContent=K.round+'/'+N;K.update();
  const L=cfg.lines||{};K.say(cfg.roundLine?cfg.roundLine(K.R,K):K.round===1?(L.first||'Listen…'):K.round===N?(L.last||'Last one. Concentrate.'):(L.again||['Again! Listen…'])[(K.round-2)%(L.again||[1]).length],2.4);
  setTimeout(()=>{if(K.phase==='guess'&&!K.R.played)K.listen()},800)}
 K.confirm=()=>{if(K.phase!=='guess')return;clearInterval(nudgeIv);okB&&okB.classList.remove('nudge');clearTimeout(K._rt);if(K.refOn){K.refOn=false;cfg.stopRef&&cfg.stopRef(K)}
  const res=cfg.judge(K.R,K.LV,K);K.R.pts=clamp(Math.round(res.pts*MAXR/125),0,MAXR);K.R.good=res.good;K.total+=K.R.pts;K.phase='reveal';K.revT=0;$('sc').textContent=K.total;K.update();
  setTimeout(()=>K.say(res.msg,3.4),cfg.msgDelay??900);
  setTimeout(()=>{if(K.round>=N)finish();else newRound()},(cfg.revealMs||4200)+(res.good?600:0))};
 function finish(){K.phase='end';const key='igortime_'+cfg.key+'_best_'+K.lv;let best=0;try{best=+localStorage.getItem(key)||0;if(K.total>best)localStorage.setItem(key,K.total)}catch(e){}
  const tot=K.total,M=N*MAXR,nm=K.name();$('endlv').textContent=K.LV.name+' · your score';$('endsc').textContent=tot;
  $('endmsg').textContent=tot>=M*.9?(cfg.endTop||'Golden ears. '+nm+' is full and very grateful.'):tot>=M*.7?'Great ears! '+nm+' had a lovely meal.':tot>=M*.4?'Nice ears! '+nm+' had a tasty snack.':nm+' loved it! One more round and lunch is yours.';
  $('endbest').textContent=tot>best?'New personal best on '+K.LV.name+'!':'Your best on '+K.LV.name+': '+best;
  const n=Math.round(tot/100*MULT[K.lv]);let p={};try{p=JSON.parse(localStorage.getItem('igortime_pending'))||{}}catch(e){}
  p.seeds=(p.seeds|0)+n;p.scores=p.scores||{};const sc=p.scores[cfg.key]=p.scores[cfg.key]||{};if(!(sc[K.lv]>=tot))sc[K.lv]=tot;try{localStorage.setItem('igortime_pending',JSON.stringify(p))}catch(e){}
  $('endseeds').textContent=n?'+'+n+' tofu seed'+(n>1?'s':'')+' for '+nm+'’s field'+(MULT[K.lv]>1?' (×'+MULT[K.lv]+' on '+K.LV.name+')':'')+'. Collect them back on the island.':'';
  $('end').hidden=false;K.update()}
 K.update=()=>{const L=$('listen');if(L){L.disabled=!K.canListen();const R=K.R;L.textContent=R&&R.played&&isFinite(R.left)?`▶ Listen (${Math.max(0,R.left)})`:'▶ Listen'}
  if(okB)okB.disabled=K.phase!=='guess';cfg.update&&cfg.update(K)};
 $('listen')&&($('listen').onclick=K.listen);okB&&(okB.onclick=K.confirm);
 addEventListener('keydown',e=>{if(K.phase!=='guess'||e.repeat&&e.key!=='ArrowUp'&&e.key!=='ArrowDown'&&e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
  if(e.key==='l'||e.key==='L'){K.listen();return}if(e.key==='Enter'&&okB){e.preventDefault();K.confirm();return}cfg.key_down&&cfg.key_down(e,K)});
 addEventListener('keyup',e=>{cfg.key_up&&cfg.key_up(e,K)});
 /* ---- menus ---- */
 let lvKey=Object.keys(cfg.levels)[0];try{const s=localStorage.getItem('igortime_'+cfg.key+'_level');if(cfg.levels[s])lvKey=s}catch(e){}
 function setLevel(k){K.lv=k;K.LV=cfg.levels[k];document.querySelectorAll('.lv button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lv===k));$('lvinfo').textContent=K.LV.info;try{localStorage.setItem('igortime_'+cfg.key+'_level',k)}catch(e){}}
 document.querySelectorAll('.lv button').forEach(b=>b.onclick=()=>setLevel(b.dataset.lv));setLevel(lvKey);
 function drawAvButtons(){if(!igorOK)return;document.querySelectorAll('.av button').forEach(b=>paintAvatar(b.querySelector('canvas').getContext('2d'),{...ME,avatar:b.dataset.av},0,0,116,128))}
 function setAv(k){ME.avatar=k;sprKey='';document.querySelectorAll('.av button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.av===k));document.querySelectorAll('.nm').forEach(n=>n.textContent=AVN[k]);try{localStorage.setItem('igortime_houseAvatar',k)}catch(e){}}
 document.querySelectorAll('.av button').forEach(b=>b.onclick=()=>setAv(b.dataset.av));
 const al=$('acctline');
 if(ACCT){document.querySelector('.av').style.display='none';document.querySelectorAll('.nm').forEach(n=>n.textContent=AVN[ME.avatar]);al.textContent='Playing as '+(ACCT.name||'you')+' with your '+AVN[ME.avatar]+' · easy ×1, medium ×2, extreme ×3 tofu seeds'}
 else{setAv(ME.avatar);al.textContent='Tofu seeds won: easy ×1, medium ×2, extreme ×3'}
 function begin(){K.audio();if(K.AC.state==='suspended')K.AC.resume();cfg.onAudio&&!K._aud&&(cfg.onAudio(K),K._aud=1);
  K.round=0;K.total=0;$('sc').textContent=0;$('start').hidden=true;$('end').hidden=true;newRound()}
 $('go').onclick=begin;$('again').onclick=begin;$('menu').onclick=()=>{$('end').hidden=true;$('start').hidden=false;K.phase='menu';K.update()};
 /* ---- loop ---- */
 function resize(){K.DPR=Math.min(devicePixelRatio||1,2);K.W=innerWidth;K.H=innerHeight;cv.width=K.W*K.DPR;cv.height=K.H*K.DPR;cfg.resize&&cfg.resize(K)}
 let last=performance.now()/1000;
 function frame(now){now/=1000;const dt=Math.min(.05,now-last);last=now;K.T+=dt;if(K.phase==='reveal'||K.phase==='end')K.revT+=dt;
  g.setTransform(K.DPR,0,0,K.DPR,0,0);blink(K.T);cfg.draw(K,dt);drawEats(dt);placeBubble(dt);requestAnimationFrame(frame)}
 addEventListener('resize',resize);resize();K.update();requestAnimationFrame(frame);
 return K};
})();

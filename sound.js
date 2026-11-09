/* Igor Time — the sound of the island.
   Everything is synthesised with Web Audio, nothing to download.
   - Nature: the sea breaking on the shore (louder near the coast, from the side of the coast), wind with gusts,
     rain and hail when the sky says so, thunder after each lightning, birds by day, crickets on summer nights.
   - Little sounds in the style of "The Abyss · Fabio Machiavelli": soft sine and triangle glides,
     filtered noise sniffs and whooshes, a gentle boing when Igor jumps.
   - The Igorlets have tiny voices, a little different for each one and for each personality.
   The island calls IgorSound.frame(state) every frame and IgorSound.sfx(name, arg) on events.
   The choice on/off is kept in localStorage igortime_sound ('off' = silent). */
(()=>{
const KEY='igortime_sound';
let wanted=true;try{wanted=localStorage.getItem(KEY)!=='off'}catch(e){}
let VOL=.8;try{const v=parseFloat(localStorage.getItem('igortime_volume'));if(v>=0&&v<=1)VOL=v}catch(e){}
const gainNow=()=>wanted?VOL*VOL*1.25:0;
let ac=null,out,sfxIn,ambIn,ambLP,WHITE,PINK,BROWN,A=null,T=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),R=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- plumbing ---------- */
const G=v=>{const g=ac.createGain();g.gain.value=v;return g};
const F=(type,f,Q)=>{const b=ac.createBiquadFilter();b.type=type;b.frequency.value=f;if(Q!=null)b.Q.value=Q;return b};
const P=p=>{if(!ac.createStereoPanner)return G(1);const s=ac.createStereoPanner();s.pan.value=clamp(p||0,-1,1);return s};
function noiseBuf(sec,kind){const n=Math.ceil(ac.sampleRate*sec),f=Math.min(Math.round(ac.sampleRate*.25),n>>2),m=n+f,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0),x=new Float32Array(m);let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,br=0;
 for(let i=0;i<m;i++){const w=Math.random()*2-1;
  if(kind==='white')x[i]=w;
  else if(kind==='pink'){b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;x[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926}
  else{br=(br+.02*w)/1.02;x[i]=br*3.5}}
 // seamless loop: the extra tail is cross-faded (equal power) into the head, so the end flows into the start
 // without a click and without any dip in level (before, the ends faded to silence: shhh… pause… shhh)
 for(let i=0;i<n;i++)d[i]=x[i];
 for(let i=0;i<f;i++){const k=i/f*Math.PI/2;d[i]=x[i]*Math.sin(k)+x[n+i]*Math.cos(k)}
 return b}
function loop(buf){const s=ac.createBufferSource();s.buffer=buf;s.loop=true;s.start(ac.currentTime,R(0,buf.duration));return s}
const set=(p,v,tc=.35)=>p.setTargetAtTime(v,ac.currentTime,tc);

function init(ctx){if(ac)return;try{ac=ctx||new (window.AudioContext||window.webkitAudioContext)()}catch(e){ac=null;return}
 out=G(gainNow());const comp=ac.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=3.5;out.connect(comp);comp.connect(ac.destination);
 // the little sounds go through a soft lowpass, like in the Abyss
 sfxIn=G(.17);const slp=F('lowpass',3400,.7);sfxIn.connect(slp);slp.connect(out);
 ambIn=G(1);ambLP=F('lowpass',16000,.5);const ambHP=F('highpass',55,.6);ambIn.connect(ambHP);ambHP.connect(ambLP);ambLP.connect(out);
 WHITE=noiseBuf(7,'white');PINK=noiseBuf(6,'pink');BROWN=noiseBuf(6,'brown');
 A={wave:{ph:.6,per:7},drops:0,hail:0,bird:R(3,8),crick:1,crk:[R(0,1),R(0,1),R(0,1)],gust:R(0,100)};
 // the sea: a low bed, and the breaking of each wave, panned towards the closest shore
 A.seaPan=P(0);A.seaPan.connect(ambIn);
 const s1=loop(PINK);A.seaLP=F('lowpass',450,.6);A.seaG=G(0);s1.connect(A.seaLP);A.seaLP.connect(A.seaG);A.seaG.connect(A.seaPan);
 const s2=loop(WHITE);A.surfBP=F('bandpass',1400,.7);A.surfLP=F('lowpass',5000,.5);A.surfG=G(0);s2.connect(A.surfBP);A.surfBP.connect(A.surfLP);A.surfLP.connect(A.surfG);A.surfG.connect(A.seaPan);
 // the wind, and a thin whistle in storms and snow
 const w1=loop(PINK);A.windBP=F('bandpass',500,1.1);A.windG=G(0);w1.connect(A.windBP);A.windBP.connect(A.windG);A.windG.connect(ambIn);
 const w2=loop(WHITE);A.whBP=F('bandpass',1100,16);A.whG=G(0);w2.connect(A.whBP);A.whBP.connect(A.whG);A.whG.connect(ambIn);
 // the rain
 const r1=loop(WHITE);A.rainHP=F('highpass',900,.5);A.rainLP=F('lowpass',7000,.5);A.rainG=G(0);r1.connect(A.rainHP);A.rainHP.connect(A.rainLP);A.rainLP.connect(A.rainG);A.rainG.connect(ambIn);
 if(!ctx){document.addEventListener('visibilitychange',()=>{if(!ac)return;if(document.hidden)ac.suspend();else if(wanted)ac.resume()})}}

/* ---------- building blocks for the little sounds ---------- */
function tone(f0,f1,d,o={}){const t=ac.currentTime+(o.delay||0),bus=o.bus||sfxIn,g=G(0),p=P(o.pan),osc=ac.createOscillator();osc.type=o.type||'sine';
 osc.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)osc.frequency.exponentialRampToValueAtTime(f1,t+d*(o.glide||1));
 if(o.vib){const l=ac.createOscillator(),lg=G(o.vib);l.frequency.value=o.vibF||5;l.connect(lg);lg.connect(osc.frequency);l.start(t);l.stop(t+d+.05)}
 const a=o.at!=null?o.at:Math.min(.02,d*.2),pk=(o.g!=null?o.g:1);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 let src=osc;if(o.lp){const f=F('lowpass',o.lp,.8);osc.connect(f);src=f}
 src.connect(g);g.connect(p);p.connect(bus);osc.start(t);osc.stop(t+d+.05)}
function nz(d,o={}){const t=ac.currentTime+(o.delay||0),bus=o.bus||sfxIn,s=ac.createBufferSource();s.buffer=o.buf||WHITE;
 const f=F(o.type||'bandpass',o.f0||1000,o.Q!=null?o.Q:1);if(o.f1)f.frequency.exponentialRampToValueAtTime(o.f1,t+d);
 const g=G(0),p=P(o.pan),pk=o.g!=null?o.g:1,a=o.at!=null?o.at:Math.min(.01,d*.2);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 s.connect(f);f.connect(g);g.connect(p);p.connect(bus);s.start(t,R(0,s.buffer.duration-d-.05>0?s.buffer.duration-d-.05:0));s.stop(t+d+.05)}
// the Abyss whoosh: band of noise rising and falling, with a slow watery wobble; a soft boing at the start
function whoosh(d,g=.5,boing=true){const t=ac.currentTime,s=ac.createBufferSource();s.buffer=WHITE;const f=F('bandpass',300,3);
 f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(1800,t+d*.5);f.frequency.exponentialRampToValueAtTime(350,t+d);
 const e=G(0);e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.6*g,t+Math.min(.2,d*.2));e.gain.linearRampToValueAtTime(.9*g,t+d*.5);e.gain.exponentialRampToValueAtTime(.001,t+d);
 const w=G(1),l=ac.createOscillator(),lg=G(.35);l.frequency.value=3.5;l.connect(lg);lg.connect(w.gain);l.start(t);l.stop(t+d);
 s.connect(f);f.connect(w);w.connect(e);e.connect(sfxIn);s.start(t);s.stop(t+d);if(boing)tone(260,620,.18,{g:.7,glide:.66})}
const PENTA=[0,2,4,7,9,12,14,16,19,21,24];const st=(f,n)=>f*Math.pow(2,n/12);
function arp(base,steps,gap,o={}){steps.forEach((n,i)=>tone(st(base,n),st(base,n),o.d||.3,{g:o.g||.6,delay:i*gap,type:o.type||'sine',pan:o.pan}))}

/* ---------- the Igorlets' little voices ---------- */
// every Igorlet has its own pitch; the personality changes how it talks
function igVoice(kind,o={}){const trait=o.trait||'shy',id=o.id||0,dist=o.g!=null?o.g:1;if(dist<.02)return;
 let base=520*Math.pow(2,((id*5)%9)/12),n=1,d=.08,type='triangle',vol=.55,shape='hop';
 if(kind==='move'){n=Math.random()<.6?1:2;d=.07;shape='flat'}
 else if(kind==='hop'){n=1;d=.1;shape='up'}
 else if(kind==='happy'){n=3;d=.09;shape='rise'}
 else if(kind==='tap'){n=3;d=.1;shape='talk'}
 if(trait==='music'&&kind!=='move'&&kind!=='hop'){shape='song';n=kind==='tap'?5:3}
 if(trait==='sport'){d*=.75;if(kind==='tap')n=4;base*=1.05}
 if(trait==='sleepy'){base*=.74;d*=1.7;type='sine';if(kind==='tap'){n=2;shape='yawn'}}
 if(trait==='greedy'){base*=.82;type='square';if(kind==='tap'){n=3;shape='nom'}}
 if(trait==='curious'&&kind==='tap')shape='ask';
 if(trait==='shy'){base*=1.14;vol*=.6;type='sine';if(kind==='tap')n=2}
 const t0=ac.currentTime+(o.delay||0),osc=ac.createOscillator();osc.type=type;const env=G(0),p=P(o.pan);
 const dry=G(.45),fm=F('bandpass',2200,3),fmG=G(1.4),lp=F('lowpass',type==='square'?1400:4200,.7);
 osc.connect(dry);osc.connect(fm);fm.connect(fmG);dry.connect(lp);fmG.connect(lp);lp.connect(env);env.connect(p);p.connect(sfxIn);
 let t=t0;const song=PENTA.slice(0,7).sort(()=>Math.random()-.5);
 for(let i=0;i<n;i++){let a=base,b=base;const last=i===n-1;
  switch(shape){case'up':a=base*.9;b=base*1.8;break;case'flat':a=base*R(.95,1.1);b=a*R(.9,1.15);break;
   case'rise':a=st(base,i*4);b=a*1.12;break;case'talk':a=base*R(.9,1.2);b=a*R(.85,1.2);break;
   case'song':a=b=st(base,song[i%song.length]);break;case'yawn':a=base*(i?1:1.3);b=base*(i?.7:1);break;
   case'nom':a=base*1.1;b=base*.75;break;case'ask':a=base*R(.95,1.1);b=last?a*1.5:a*R(.9,1.1);break}
  const dd=shape==='yawn'&&i===0?d*2.2:d;osc.frequency.setValueAtTime(a,t);osc.frequency.exponentialRampToValueAtTime(b,t+dd*.9);
  fm.frequency.setValueAtTime(i%2?900:R(2000,2800),t); // "i" and "u" in turn
  env.gain.setValueAtTime(0,t);env.gain.linearRampToValueAtTime(vol*dist,t+.012);env.gain.setValueAtTime(vol*dist,t+dd*.7);env.gain.linearRampToValueAtTime(0,t+dd);
  t+=dd+(shape==='song'?.03:R(.03,.07))}
 osc.start(t0);osc.stop(t+.05)}
// tools of a working Igorlet, a snore from a little house
function igWork(o={}){const g=o.g!=null?o.g:1;if(g<.02)return;tone(R(180,240),140,.07,{g:.5*g,pan:o.pan});nz(.025,{f0:R(1500,2400),Q:1.5,g:.25*g,pan:o.pan})}
function snore(o={}){const g=(o.g!=null?o.g:1)*.5;if(g<.02)return;const t=ac.currentTime;
 const s=ac.createBufferSource();s.buffer=PINK;const f=F('bandpass',320,2.2),e=G(0),p=P(o.pan);s.connect(f);f.connect(e);e.connect(p);p.connect(sfxIn);
 e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(g,t+1.1);e.gain.linearRampToValueAtTime(g*.2,t+1.4);e.gain.linearRampToValueAtTime(g*.5,t+1.9);e.gain.exponentialRampToValueAtTime(.001,t+2.6);
 s.start(t,R(0,3));s.stop(t+2.7);tone(85,80,1.3,{g:g*.4,at:.6,pan:o.pan});tone(900,600,.25,{g:g*.15,delay:2.1,pan:o.pan})}

/* ---------- nature, one-shot ---------- */
function drop(outside){if(outside){const f=R(1800,5200);tone(f,f*R(.45,.7),R(.012,.03),{g:R(.03,.1),pan:R(-.9,.9),bus:ambIn,at:.002})}
 else nz(.05,{f0:R(350,700),Q:1.2,g:R(.05,.12),pan:R(-.8,.8),bus:ambIn,at:.002})} // on the roof
function hailTick(outside){nz(R(.008,.02),{type:'highpass',f0:outside?R(2500,5000):1200,Q:.7,g:R(.04,.13),pan:R(-.9,.9),bus:ambIn,at:.001})}
function bird(){const pan=R(-.8,.8),sp=Math.random();let t=0;
 if(sp<.35){const f=R(3200,4200);for(let i=0;i<R(6,11);i++){tone(f,f*.92,.035,{g:.09,delay:t,pan,bus:ambIn,at:.004});t+=.055}} // trill
 else{const f=R(2300,3600);for(let i=0;i<R(2,6);i++){const a=f*R(.85,1.2),b=a*pick([.7,.8,1.25,1.4]);tone(a,b,R(.06,.13),{g:.08,delay:t,pan,bus:ambIn,at:.008});t+=R(.1,.2)}}}
function cricket(i){const f=[4300,4550,4150][i],pan=[-.6,.5,.1][i];for(let k=0;k<3;k++)tone(f,f,.022,{g:.035,delay:k*.045,pan,bus:ambIn,at:.003})}
function thunder(near){const t=ac.currentTime+R(.25,near?.6:2.4),d=R(4,6.5),g=near?.6:R(.3,.5);
 const s=ac.createBufferSource();s.buffer=BROWN;const lp=F('lowpass',R(130,200),.7),e=G(0);s.connect(lp);lp.connect(e);e.connect(ambIn);
 e.gain.setValueAtTime(0,t);let k=t+.08;e.gain.linearRampToValueAtTime(g*.9,k);
 while(k<t+d-.6){k+=R(.25,.8);e.gain.linearRampToValueAtTime(g*R(.25,.95)*(1-(k-t)/d*.7),k)}e.gain.exponentialRampToValueAtTime(.001,t+d);
 lp.frequency.setValueAtTime(lp.frequency.value,t);lp.frequency.exponentialRampToValueAtTime(70,t+d);s.start(t,R(0,.5));s.stop(t+d+.1);
 const c=ac.createBufferSource();c.buffer=WHITE;const ch=F('highpass',900,.7),ce=G(0);c.connect(ch);ch.connect(ce);ce.connect(ambIn);ce.gain.setValueAtTime(0,t);ce.gain.linearRampToValueAtTime(g*.22,t+.01);ce.gain.exponentialRampToValueAtTime(.001,t+.35);c.start(t);c.stop(t+.4)}

/* ---------- the island's state, every frame ---------- */
function frame(S){if(!ac||!A)return;const dt=Math.min(.1,S.dt||.016);T+=dt;const W=S.W||{},out=S.out!==false,rain=W.rain||0,storm=W.storm||0,snow=W.snow||0,hail=W.hail||0,cloud=W.cloud||0,fog=W.fog||0;
 const quiet=S.quiet?.35:1,inK=out?1:.32;
 set(ambLP.frequency,out?16000:700,.3);
 // the sea: louder near the coast and in storms, softer under snow
 const near=clamp(1-((S.coast!=null?S.coast:8)-.5)/16,.22,1),rough=1+storm*.6+rain*.15,hush=1-snow*.35;
 const Wv=A.wave;Wv.ph+=dt/Wv.per;const swell=.5-.5*Math.cos(Wv.ph*Math.PI*2);
 if(Wv.ph>=1){Wv.ph=0;Wv.per=R(5.5,9.5)*(1-storm*.35);const t=ac.currentTime,pk=.2*near*inK*rough*hush*quiet*R(.7,1.15);
  A.surfG.gain.cancelScheduledValues(t);A.surfG.gain.setTargetAtTime(pk,t,.35);A.surfG.gain.setTargetAtTime(pk*.12,t+.9,.9);
  A.surfBP.frequency.cancelScheduledValues(t);A.surfBP.frequency.setTargetAtTime(2600,t,.2);A.surfBP.frequency.setTargetAtTime(650,t+.7,.8)}
 set(A.seaG.gain,.13*near*inK*rough*hush*quiet*(.65+.35*swell),.5);set(A.seaLP.frequency,320+420*swell*(1+storm*.5),.4);
 if(A.seaPan.pan)set(A.seaPan.pan,clamp(S.pan||0,-.85,.85),.6);
 // the wind, in gusts
 const gs=A.gust+=dt,gust=clamp(.5+.5*(Math.sin(gs*.11)+Math.sin(gs*.27+1.3)+Math.sin(gs*.053+2.1))/2.2,.05,1);
 const wind=(.035+.05*cloud+.15*storm+.05*rain+.08*snow+.03*fog)*(out?1:.4);
 set(A.windG.gain,wind*(.35+.65*gust)*quiet,.5);set(A.windBP.frequency,240+680*gust*(1+storm*.6),.6);
 set(A.whG.gain,(.025*storm+.02*snow)*gust*gust*(out?1:.3)*quiet,.6);set(A.whBP.frequency,650+1100*gust,.8);
 // rain and hail
 const wet=clamp(rain+hail*.4,0,1);set(A.rainG.gain,.075*wet*(out?1:.6)*quiet,.6);set(A.rainLP.frequency,out?7000:1100,.4);
 A.drops+=dt*rain*(out?22:9);let nd=0;while(A.drops>=1&&nd<6){A.drops-=1;nd++;drop(out)}if(A.drops>3)A.drops=0;
 A.hail+=dt*hail*32;let nh=0;while(A.hail>=1&&nh<8){A.hail-=1;nh++;hailTick(out)}if(A.hail>4)A.hail=0;
 // birds by day, crickets on warm nights
 const night=S.night||0;
 if(out&&night<.35&&rain<.15&&snow<.4&&storm<.1){A.bird-=dt;if(A.bird<=0){A.bird=R(4,13);bird()}}
 if(out&&night>.6&&S.season!=='Winter'&&rain<.15&&snow<.2){A.crick-=dt;if(A.crick<=0){A.crick=R(.18,.35);const i=Math.floor(Math.random()*3);if(Math.random()<.85)cricket(i)}}}

/* ---------- named sounds ---------- */
const SFX={
 tap:()=>tone(740,990,.09,{g:.45}),
 tapMain:()=>{tone(660,660,.12,{g:.5});tone(990,990,.16,{g:.35,delay:.05})},
 open:()=>{tone(523,523,.12,{g:.45});tone(784,784,.2,{g:.4,delay:.07})},
 close:()=>tone(784,523,.14,{g:.35}),
 say:()=>tone(420,640,.08,{g:.28,type:'triangle'}),
 wake:i=>{const f=660+((i||0)%8)*55;tone(f,f,.32,{g:.5});tone(f*2,f*2,.22,{g:.12,delay:.02})},
 orb:()=>tone(1240,1180,1.6,{type:'triangle',g:.28,at:.2}),
 jump:()=>{tone(260,620,.18,{g:.7,glide:.66});nz(.2,{f0:600,f1:1500,Q:2,g:.12})},
 land:()=>nz(.07,{f0:380,Q:1,g:.35}),
 step:k=>{if(k==='wood'){tone(R(150,190),110,.07,{g:.3});nz(.02,{f0:2200,Q:1,g:.07})}
  else if(k==='snow')nz(.1,{f0:R(1900,2600),f1:1500,Q:.9,g:.22,at:.02});
  else if(k==='sand')nz(.07,{type:'highpass',f0:1400,Q:.6,g:.1,at:.012});
  else nz(.06,{f0:R(550,800),f1:450,Q:1.2,g:.22,at:.008})},
 door:()=>whoosh(.6,.45,false),
 launch:()=>{whoosh(.9,.5);arp(523,[0,4,7,12],.07,{g:.35,d:.25})},
 dive:()=>{whoosh(1.1,.5,false);for(let i=0;i<9;i++){const f=R(300,700);tone(f,f*2.6,.06,{g:.3,delay:.1+i*R(.05,.11),pan:R(-.5,.5)})}},
 seeds:n=>arp(523,PENTA.slice(0,clamp(n||3,3,9)),.075,{g:.5,d:.28}),
 warn:()=>tone(310,150,2.4,{g:.55,at:.5,vib:6,vibF:5}),
 level:()=>{arp(523,[0,4,7,12,16,19,24],.08,{g:.5,d:.35});tone(2093,2093,1.2,{type:'triangle',g:.15,delay:.6,at:.2})},
 buy:()=>{tone(1568,1568,.18,{g:.4});tone(2093,2093,.3,{g:.35,delay:.08})},
 mount:()=>{tone(1760,1760,.9,{g:.3,at:.004});tone(2637,2637,.6,{g:.15,at:.004})},
 // the farm
 harvest:n=>{tone(660,660,.1,{g:.45});tone(990,990,.18,{g:.45,delay:.09});for(let i=0;i<clamp(n||4,2,8);i++){const f=st(1047,pick(PENTA.slice(0,6)));tone(f,f,.12,{g:.25,delay:.25+i*.07,pan:R(-.4,.4)})}},
 build:()=>{for(let i=0;i<3;i++)tone(110,90,.13,{type:'square',g:.3,delay:i*.16});tone(1047,1047,.5,{g:.35,delay:.5})},
 sow:()=>{for(let i=0;i<6;i++)nz(.03,{type:'highpass',f0:3000,g:.18,delay:i*R(.05,.09),pan:R(-.4,.4)})},
 water:()=>{nz(.45,{f0:2600,f1:600,Q:.7,g:.35});for(let i=0;i<3;i++){const f=R(500,900);tone(f,f*2.2,.05,{g:.2,delay:.15+i*.09})}},
 weed:()=>{for(let i=0;i<4;i++)nz(.09,{f0:R(2500,3800),Q:.8,g:.2,delay:i*.08})},
 plow:()=>{tone(95,60,.18,{g:.6});nz(.16,{f0:500,Q:1,g:.3})},
 tarp:()=>{for(let i=0;i<3;i++)nz(.12,{f0:R(700,1300),Q:.9,g:.25,delay:i*.09})},
 scare:()=>{whoosh(.5,.35,false);for(let i=0;i<6;i++)nz(.04,{f0:R(1800,2800),Q:2,g:.15,delay:i*.05,pan:R(-.7,.7)})},
 // little things to do on the island
 pop:k=>{const f=st(784,PENTA[(k||0)%8]);tone(f*.7,f,.1,{g:.5,type:'triangle',glide:.35});nz(.03,{f0:2600,Q:1.5,g:.12})},
 bell:f=>{f=f||880;tone(f,f,1.5,{g:.5,at:.003});tone(f*2,f*2,.9,{g:.12,at:.003});tone(f*2.76,f*2.76,.5,{g:.1,at:.002});tone(f*5.4,f*5.4,.25,{g:.04,at:.002})},
 whistle:o=>{const f=(o&&o.f)||880;tone(f,f,.66,{g:.34,at:.035,vib:f*.005,vibF:5.5,bus:out});tone(f*2,f*2,.4,{g:.025,at:.035,bus:out});nz(.45,{f0:f*2,Q:8,g:.025,at:.05})},
 shake:k=>{for(let i=0;i<6;i++)nz(.13,{f0:R(1800,3400),Q:.8,g:.2,delay:i*.07,pan:R(-.5,.5)});const f=170+((k||0)%5)*22;tone(f,f*.8,.12,{type:'triangle',g:.45});tone(f*1.5,f*1.2,.1,{type:'triangle',g:.3,delay:.12})},
 thud:()=>{tone(R(140,190),90,.09,{g:.3});nz(.05,{f0:600,Q:1,g:.12})},
 shell:()=>{tone(1568,1568,.6,{g:.3,at:.003});tone(2349,2349,.45,{g:.2,delay:.08,at:.003});tone(3136,3136,.3,{g:.1,delay:.16,at:.003})},
 bottle:()=>{tone(300,1100,.1,{g:.45,type:'triangle'});nz(.07,{f0:3000,Q:2,g:.2});arp(784,[0,7,12],.1,{g:.3,d:.5,type:'triangle'})},
 munch:()=>{for(let i=0;i<3;i++){nz(.06,{f0:R(700,1100),Q:1.2,g:.3,delay:i*.15});tone(300,220,.07,{g:.25,delay:i*.15,type:'triangle'})}},
 star:()=>{tone(2637,2093,1.2,{g:.1,type:'triangle',at:.25});tone(3136,3136,.8,{g:.05,delay:.3,at:.2})},
 sing:()=>{const m=[0,4,7,9,12,9,7,12,16,14,12];m.forEach((n,i)=>{const f=st(784,n);tone(f*.97,f,.42,{g:.4,delay:i*.2,at:.04,glide:.2,vib:f*.01,vibF:5.5,type:'sine'})});for(let i=0;i<10;i++){const f=st(2093,PENTA[i%8]);tone(f,f,.4,{g:.08,delay:2.3+i*.05,at:.003,pan:R(-.6,.6)})}},
 glock:f=>{f=f||784;tone(f,f,1.7,{g:.42,at:.002});tone(f*2.76,f*2.76,.35,{g:.07,at:.002});tone(f*5.4,f*5.4,.12,{g:.03,at:.001});nz(.012,{f0:4200,Q:1,g:.06})},
 kalimba:f=>{f=f||392;tone(f,f,1.3,{g:.55,at:.002});tone(f*2,f*2,.25,{g:.07,at:.002});tone(f*6.3,f*6.3,.07,{g:.07,at:.001});nz(.015,{f0:2400,Q:1.2,g:.1})},
 harp:f=>{f=f||294;tone(f,f,2,{g:.42,at:.004,type:'triangle',lp:f*5});tone(f*2,f*2,1.1,{g:.12,at:.004});tone(f*3,f*3,.6,{g:.05,at:.004});nz(.02,{f0:f*6,Q:2,g:.05})},
 tubes:f=>{f=f||523;for(const[m,d,g]of[[1,3.2,.4],[2.01,2.2,.16],[2.76,1.6,.12],[4.1,1,.07],[5.4,.6,.04]])tone(f*m,f*m,d,{g,at:.002});nz(.03,{f0:3000,Q:1,g:.12})},
 steel:f=>{f=f||349;tone(f*1.012,f,1.3,{g:.45,at:.004,glide:.05});tone(f*2,f*2,.9,{g:.22,at:.004});tone(f*3,f*3,.45,{g:.1,at:.003});tone(f*4.02,f*4.02,.2,{g:.05,at:.003})},
 flute:f=>{f=f||587;tone(f,f,1,{g:.42,at:.07,vib:f*.007,vibF:5});tone(f*2,f*2,.8,{g:.05,at:.08});nz(.85,{f0:f*2,Q:5,g:.06,at:.06})},
 glass:f=>{f=f||698;tone(f,f,2.2,{g:.38,at:.003});tone(f*2.32,f*2.32,1,{g:.06,at:.003});tone(f*4.1,f*4.1,.3,{g:.03,at:.002});nz(.01,{f0:5000,Q:1,g:.05})},
 marimba:f=>{f=f||523;tone(f,f,1.1,{g:.6,at:.003});tone(f*3.9,f*3.9,.18,{g:.16,at:.002});tone(f*9.2,f*9.2,.05,{g:.05,at:.001});nz(.02,{f0:1800,Q:1,g:.1})},
 wish:()=>{for(let i=0;i<8;i++){const f=st(1047,PENTA[i]);tone(f,f,.6,{g:.22,delay:i*.06,at:.003,pan:R(-.6,.6)})}tone(523,523,1.8,{g:.18,at:.3,type:'triangle'})},
};
SFX.clear=SFX.weed;

/* ---------- unlock on the first gesture, the on/off switch ---------- */
function unlock(){if(!wanted)return;if(!ac)init();if(ac&&ac.state==='suspended')ac.resume()}
['pointerdown','keydown','touchend'].forEach(ev=>addEventListener(ev,unlock,{capture:true,passive:true}));
document.addEventListener('click',e=>{if(!ac||!wanted)return;const b=e.target.closest('button,a,.lbl');if(!b||b.dataset.snd==='0')return;try{(b.classList.contains('main')||b.classList.contains('m')?SFX.tapMain:SFX.tap)()}catch(_){}},true);
window.IgorSound={
 get on(){return wanted},
 set(v){wanted=!!v;try{localStorage.setItem(KEY,wanted?'on':'off')}catch(e){}if(wanted){if(!ac)init();if(ac&&ac.state==='suspended')ac.resume()}if(ac)out.gain.setTargetAtTime(gainNow(),ac.currentTime,.08)},
 get vol(){return VOL},
 setVol(v){VOL=Math.max(0,Math.min(1,+v||0));try{localStorage.setItem('igortime_volume',String(VOL))}catch(e){}if(ac)out.gain.setTargetAtTime(gainNow(),ac.currentTime,.05)},
 toggle(){this.set(!wanted);return wanted},
 frame,
 sfx(name,arg){if(!ac||!wanted)return;const f=SFX[name];if(f)try{f(arg)}catch(e){}},
 ig(kind,o){if(!ac||!wanted)return;try{if(kind==='work')igWork(o);else if(kind==='snore')snore(o);else igVoice(kind,o)}catch(e){}},
 thunder(near){if(!ac||!wanted)return;try{thunder(near)}catch(e){}},
 _init:init // for rendering a demo offline
};
})();

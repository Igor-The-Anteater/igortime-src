const fs=require('fs');const OUT='/home/claude/pinexp/snd/';
module.exports=async(pg)=>{
 const list=await pg.evaluate(async()=>{const X=window.__X,S=X.SND,o=X.osc,nz=X.nz,mt=X.mtof,G=X.GS;const L=[];
  const add=(n,d,fn)=>L.push([n,d,fn]);
  add('flip',.3,()=>S.flip(0));add('kick',.5,()=>S.kick(.4));add('snare',.4,()=>S.snare(.4));add('cymbal',1.3,()=>S.cymbal(.4));
  for(let i=0;i<7;i++){add('sling_'+i,.3,()=>{G.mi=i;S.sling(.4)});add('ramp_'+i,.95,()=>{G.mi=i;S.ramp()});add('jackpot_'+i,1.6,()=>{G.mi=i;S.jackpot()});add('drain_'+i,1.0,()=>{G.mi=i;S.drain()});add('fan_m'+i,2.6,()=>S.fanfare(X.MIS[i].n))}
  add('fan_0246',2.6,()=>S.fanfare([0,2,4,6]));add('fan_024',2.6,()=>S.fanfare([0,2,4]));
  add('wall',.06,()=>S.wall(14));
  for(let k=0;k<7;k++){add(`note_${k}_0`,1,()=>S.note(k,false));add(`note_${k}_1`,1,()=>S.note(k,true));add('nbrass_'+k,.8,()=>S.noteBrass(k))}
  add('ant',.45,()=>S.ant());add('target',.3,()=>S.target(.4));add('drop',.3,()=>S.drop(.4));add('roll',.15,()=>S.roll());add('spin',.03,()=>S.spin());add('launch',.3,()=>S.launch());
  add('warp',1.15,()=>S.warp());add('eject',.4,()=>S.eject());add('rock',.25,()=>S.rock(.4));
  add('ffhit',.25,()=>{o({f:110,f2:50,v:.42,d:.2});nz({f:900,v:.33,d:.12})});add('amiss',.2,()=>o({f:300,f2:200,v:.06,d:.15}));add('amiss2',.15,()=>o({f:180,f2:120,v:.05,d:.1}));
  add('tick_hi',.06,()=>o({f:2200,v:.06,d:.04}));add('tick_lo',.06,()=>o({f:1500,v:.06,d:.04}));
  add('click',.05,()=>o({f:1900,v:.03,d:.03}));add('thump',.2,()=>o({f:90,f2:40,v:.2,d:.15}));add('mkick',.25,()=>X.kick(0));add('msnr',.15,()=>X.snr(0));add('mhat',.05,()=>X.hat(0,.03));
  const P={pluck:[72,107,.4,m=>{o({f:mt(m),v:.05,d:.35});o({f:mt(m+12),v:.012,d:.15})}],
   pad:[60,83,2.2,m=>o({f:mt(m),type:'triangle',lp:900,v:.016,a:.3,hold:1,d:.8})],
   bass:[36,71,.65,m=>o({f:mt(m),v:.09,d:.6})],bassS:[36,71,.3,m=>o({f:mt(m),v:.1,d:.25})],bassT:[36,71,.5,m=>o({f:mt(m),type:'triangle',v:.1,d:.45})],
   steel:[72,95,.5,m=>X.steel(m,0)],accord:[60,83,.4,m=>X.accord(m,0)],arpT:[84,107,.22,m=>o({f:mt(m),type:'triangle',v:.025,d:.18})],
   drone:[36,59,2.9,m=>o({f:mt(m),v:.07,a:.4,hold:1.4,d:1})],prep:[72,107,.65,m=>X.prep(m,0)],
   tone:[69,87,.65,m=>o({f:mt(m),v:.15,d:.6})],tri:[69,99,.4,m=>o({f:mt(m),type:'triangle',v:.12,d:.35})],triL:[69,87,.85,m=>o({f:mt(m),type:'triangle',v:.1,d:.8})]};
  for(const k in P){const[a,b,d,fn]=P[k];for(let m=a;m<=b+2;m+=3)add(`${k}_${m}`,d,()=>fn(m))}
  const R=[];for(const[n,d,fn]of L){const f=await X.renderSound(fn,d+.02);const i16=new Int16Array(f.length);let pk=0;for(let i=0;i<f.length;i++){const v=Math.max(-1,Math.min(1,f[i]));i16[i]=v*32767;pk=Math.max(pk,Math.abs(v))}
   let end=i16.length;while(end>1&&Math.abs(i16[end-1])<4)end--;const u8=new Uint8Array(i16.buffer,0,end*2);let s='';for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));R.push([n,btoa(s),pk])}
  return R});
 let tot=0;for(const[n,b64,pk]of list){const pcm=Buffer.from(b64,'base64');const h=Buffer.alloc(44);h.write('RIFF',0);h.writeUInt32LE(36+pcm.length,4);h.write('WAVE',8);h.write('fmt ',12);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22);h.writeUInt32LE(32000,24);h.writeUInt32LE(64000,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(pcm.length,40);
  fs.writeFileSync(OUT+n+'.wav',Buffer.concat([h,pcm]));tot+=pcm.length;if(pk>.99)console.log('clip',n,pk)}
 console.log('sounds',list.length,'bytes',tot)};

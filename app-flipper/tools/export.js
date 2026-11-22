const fs=require('fs');const OUT='/home/claude/pinexp/out/';
const save=(name,dataUrl)=>fs.writeFileSync(OUT+name,Buffer.from(dataUrl.split(',')[1],'base64'));
module.exports=async(pg,lang)=>{
 // 1. images
 const imgs=await pg.evaluate(async(lang)=>{const X=window.__X,P=window.__pin,R={};
  for(const k of['home','carib','lake','shroom']){X.setTheme(k,true);R[`pf_${k}_${lang}.png`]=X.pfc.toDataURL('image/png')}
  X.setTheme('home',true);
  if(lang==='it'){
   for(const k in X.CHAR){if(k==='igor')continue;R[`ch_${k}.png`]=X.CHAR[k].c.toDataURL()}
   for(const [i,kk] of [[0,0],[1,.5],[2,1]]){const c=document.createElement('canvas');c.width=X.CW;c.height=X.CH;X.IH.paintAvatar(c.getContext('2d'),X.IH.ME,kk,kk,X.CW,X.CH);R[`ch_igor${i}.png`]=c.toDataURL()}
   const em=['🎹','🥁','💥','👂','♯','⏱','🎶','🌴','🛶','🍄','🚩','🛡️','🔊','🔇','⏸','★','☆','✓','♭','●','🎵','📲'];
   em.forEach((e,i)=>{const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');g.font='76px "Noto Color Emoji",Fredoka,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#ffffff';g.fillText(e,48,52);R[`em_${i}.png`]=c.toDataURL()});
   R['dot.png']=X.dotTex.image.toDataURL();R['shadow.png']=X.shadowTex.image.toDataURL();
   R['clef.png']=X.glyphTex('𝄞','#ffd84a').image.toDataURL();
   for(let d=-1;d<=5;d++){X.ffBar(d);R[`ff_${d+1}.png`]=X.FFBAR.c.toDataURL()}
  }
  for(let i=0;i<7;i++)for(const rd of[0,1]){X.GS.sel=i;X.GS.ready=!!rd;X.flagTex();R[`flag_${i}_${rd}_${lang}.png`]=X.FLAGM.c.toDataURL()}
  X.GS.sel=0;X.GS.ready=false;X.flagTex();
  return R},lang);
 for(const k in imgs)save(k,imgs[k]);console.log('images',Object.keys(imgs).length);
 // 2. GLB + data
 const res=await pg.evaluate(async(lang)=>{const X=window.__X,P=window.__pin,T=X.THREE;
  for(const b of[...P.BALLS])P.removeBall(b);if(P.ANT){X.table.remove(P.ANT.m)}
  const nm=(o,n)=>{o.name=n};
  nm(X.table,'table');
  X.table.children.forEach(o=>{if(o.isMesh&&o.material&&o.material.map&&o.material.map.image===X.pfc)nm(o,'pf')});
  X.FMESH.forEach((g,i)=>nm(g,'flip'+i));
  X.SNOUTS.forEach((s,i)=>{nm(s.G,'snout'+i);s.eyes.forEach((l,j)=>nm(l,`lid${i}_${j}`))});
  X.BMESH.forEach((b,i)=>{nm(b.G,'drum'+i);nm(b.hit,'drumhit'+i);if(b.ring!==b.hit)nm(b.ring,'drumring'+i)});
  X.SLING.forEach((s,i)=>nm(s.band,'band'+i));X.DMESH.forEach((d,i)=>nm(d.m,'drop'+i));X.IMESH.forEach((d,i)=>nm(d.m,'igt'+i));X.GATEM.forEach((d,i)=>nm(d.m,'gate'+i));
  nm(X.SAU.G,'saucer');nm(X.SAU.sw,'sauSw');nm(X.SPIN.G,'spin');nm(X.PLG,'plunger');X.PLG.userData.spring.forEach((s,i)=>nm(s,'spring'+i));
  nm(X.RAMPV.strip,'rampStrip');nm(X.WANDM,'wand');nm(X.FLAGM.G,'flag');nm(X.FLAGM.rot,'flagRot');nm(X.FLAGM.fl,'flagCloth');nm(X.FFM.G,'ffStatue');nm(X.FFM.st,'ffBlock');
  X.INS.forEach((o,i)=>{nm(o.m,'ins'+i);nm(o.halo,'halo'+i)});X.BULBS.forEach((b,i)=>nm(b,'bulb'+i));
  X.table.traverse(o=>{if(o.isMesh&&Array.isArray(o.material)&&o.material.some(m=>m.map&&m.map.image&&m.map.image.width===1024&&m.map.image.height===256))nm(o,'apron')});
  // remove sprites and lights
  const rm=[];X.table.traverse(o=>{if(o.isSprite||o.isLight||o.isPoints)rm.push(o)});rm.forEach(o=>o.parent.remove(o));
  const root=new T.Group();root.name='root';root.add(X.table);
  for(const k in X.SCEN){const g=X.SCEN[k];g.visible=true;g.name='scen_'+k;root.add(g)}
  const toks={carib:X.mkPalm(.75),shroom:X.mkShroom(.9),lake:X.mkGondola(.55)};for(const k in toks){toks[k].name='tok_'+k;root.add(toks[k])}
  const ant=X.antMesh();ant.name='ant';ant.userData.legs.forEach((l,i)=>nm(l,'leg'+i));nm(ant.userData.halo,'antHalo');ant.scale.setScalar(1);root.add(ant);
  root.traverse(o=>{o.visible=true});
  const glb=await new Promise(r=>new T.GLTFExporter().parse(root,r,{binary:true,maxTextureSize:2048}));
  const u8=new Uint8Array(glb);let s='';for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));
  // data
  const insIdx={};for(const k in X.I){const v=X.I[k];insIdx[k]=Array.isArray(v)?v.map(o=>X.INS.indexOf(o)):X.INS.indexOf(v)}
  const ins=X.INS.map(o=>({col:'#'+o.cOn.getHexString(),base:o.base}));
  const segs=P.SEGS.map(s=>({ax:s.ax,ay:s.ay,bx:s.bx,by:s.by,rad:s.rad,e:s.e,kick:s.kick,tag:s.tag,on:s.on,one:s.one,k:s.k,i:s.i,cx:s.cx,cy:s.cy}));
  const ramp=X.RAMP.getSpacedPoints(600).map(p=>[+p.x.toFixed(4),+p.y.toFixed(4),+p.z.toFixed(4)]);
  const data={segs,ramp,rampLen:X.RAMP.getLength(),ins,insIdx};
  return {glb:btoa(s),data}},lang);
 fs.writeFileSync(OUT+`table_${lang}.glb`,Buffer.from(res.glb,'base64'));
 fs.writeFileSync(OUT+`data_${lang}.json`,JSON.stringify(res.data));
 console.log('glb',Buffer.from(res.glb,'base64').length);
};

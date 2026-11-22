const fs=require('fs');
module.exports=async(pg)=>{const r=await pg.evaluate(()=>{const X=window.__X;return X.CIRCS.map(c=>({x:c.x,y:c.y,R:c.R,e:c.e,kick:c.kick,tag:c.tag,on:c.on,i:c.i}))});
 const d=JSON.parse(fs.readFileSync('/home/claude/pinexp/out/data_it.json'));d.circs=r;fs.writeFileSync('/home/claude/pinexp/out/data_it.json',JSON.stringify(d));console.log(r.length,JSON.stringify(r.filter(c=>c.tag!=='post')))};

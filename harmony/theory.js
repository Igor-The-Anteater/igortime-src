/* Igor Time · the harmony course: music theory toolkit (pitches, intervals, keys, chords, voicings).
   A pitch is {l, a, o}: letter 0..6 (C..B), accidental -2..2, octave (C4 = middle C). */
(function(root){
const PCS=[0,2,4,5,7,9,11];
const mod=(n,m)=>((n%m)+m)%m;
const P=(l,a,o)=>({l:mod(l,7),a:a||0,o:o+Math.floor(l/7)});
const midi=p=>12*(p.o+1)+PCS[p.l]+p.a;
const pc=p=>mod(PCS[p.l]+p.a,12);
const dia=p=>(p.o-4)*7+p.l; /* steps from middle C */
function parse(s){const m=/^([A-G])(##|bb|#|b|x)?(-?\d)?$/.exec(s.trim());if(!m)throw new Error('pitch '+s);
 const l='CDEFGAB'.indexOf(m[1]),a={'#':1,'##':2,x:2,b:-1,bb:-2}[m[2]]||0;return P(l,a,m[3]!=null?+m[3]:4)}
const key=p=>p.l+':'+p.a;
const eq=(p,q)=>p.l===q.l&&p.a===q.a;
/* names */
const NM={en:['C','D','E','F','G','A','B'],it:['Do','Re','Mi','Fa','Sol','La','Si']};
const ACC={'-2':'𝄫','-1':'♭','0':'','1':'♯','2':'𝄪'};
const ACCT={'-2':'bb','-1':'♭','0':'','1':'♯','2':'x'};
const nm=(p,lg)=>NM[lg][p.l]+(p.a===2?'♯♯':p.a===-2?'♭♭':ACC[p.a]);
/* intervals: from p up to q */
const SIMPLE=[0,2,4,5,7,9,11];
function ival(p,q){const n=dia(q)-dia(p)+1,s=midi(q)-midi(p),k=n-1,base=SIMPLE[mod(k,7)]+12*Math.floor(k/7),d=s-base,perf=[0,3,4].includes(mod(k,7));
 let qu;if(perf)qu=d===0?'P':d===1?'A':d===-1?'d':d>1?'AA':'dd';else qu=d===0?'M':d===-1?'m':d===1?'A':d===-2?'d':d>1?'AA':'dd';return{n,q:qu,s}}
function up(p,n,qu){const k=n-1,l=p.l+k,q=P(l,0,p.o),base=SIMPLE[mod(k,7)]+12*Math.floor(k/7),perf=[0,3,4].includes(mod(k,7));
 const d=perf?{P:0,A:1,d:-1}[qu]:{M:0,m:-1,A:1,d:-2}[qu];const want=midi(p)+base+d;q.a=want-midi({...q,a:0});return q}
function down(p,n,qu){const k=n-1,q=P(p.l-k,0,p.o);q.a=0;const t=up(q,n,qu);/* adjust accidental so that q→p is the interval */
 q.a=midi(p)-(midi(t)-midi(q))-midi({...q,a:0});return q}
const IVN={en:{1:'unison',2:'second',3:'third',4:'fourth',5:'fifth',6:'sixth',7:'seventh',8:'octave'},it:{1:'unisono',2:'seconda',3:'terza',4:'quarta',5:'quinta',6:'sesta',7:'settima',8:'ottava'}};
const IVQ={en:{P:'perfect',M:'major',m:'minor',A:'augmented',d:'diminished'},it:{P:'giusta',M:'maggiore',m:'minore',A:'eccedente',d:'diminuita'}};
function ivName(iv,lg){if(lg==='it'){const N={1:'unisono',2:'seconda',3:'terza',4:'quarta',5:'quinta',6:'sesta',7:'settima',8:'ottava'}[iv.n]||iv.n;
  const Q={P:iv.n===1?'giusto':'giusta',M:'maggiore',m:'minore',A:'eccedente',d:iv.n===1?'diminuito':'diminuita'}[iv.q]||iv.q;return N+' '+Q}
 return(IVQ.en[iv.q]||iv.q)+' '+(IVN.en[iv.n]||iv.n)}
/* keys: fifths -4..4 (negative = flats); major and minor */
const MAJ={'-4':'Ab','-3':'Eb','-2':'Bb','-1':'F','0':'C','1':'G','2':'D','3':'A','4':'E','5':'B','-5':'Db','6':'F#','-6':'Gb','7':'C#','-7':'Cb'};
const MIN={'-4':'F','-3':'C','-2':'G','-1':'D','0':'A','1':'E','2':'B','3':'F#','4':'C#','5':'G#','-5':'Bb','6':'D#','-6':'Eb','7':'A#','-7':'Ab'};
const tonicOf=(f,minor)=>parse((minor?MIN:MAJ)[f]+'4');
const SHARPS=[3,0,4,1,5,2,6],FLATS=[6,2,5,1,4,0,3]; /* F C G D A E B / B E A D G C F */
function sigAcc(f,l){if(f>0)return SHARPS.slice(0,f).includes(l)?1:0;if(f<0)return FLATS.slice(0,-f).includes(l)?-1:0;return 0}
/* a scale of 7 pitches from the tonic, octave 4 */
function scale(f,minor,form){const t=tonicOf(f,minor);const out=[];for(let i=0;i<7;i++){const p=P(t.l+i,0,t.o);p.a=sigAcc(f,p.l);out.push(p)}
 if(minor&&(form==='harm'||form==='mel')){out[6]={...out[6],a:out[6].a+1};if(form==='mel')out[5]={...out[5],a:out[5].a+1}}return out}
const fifthsOfMaj=t=>{for(const f in MAJ)if(eq(parse(MAJ[f]+'4'),t))return+f;return null};
/* chords */
function triadOn(f,minor,deg,form){const sc=scale(f,minor,form||(minor?'harm':''));const r=sc[deg],t=sc[(deg+2)%7],fi=sc[(deg+4)%7];
 const R={...r},T={...t,o:r.o+(t.l<r.l?1:0)},F={...fi,o:r.o+(fi.l<r.l?1:0)};return[R,T,F]}
function seventhOn(f,minor,deg,form){const tr=triadOn(f,minor,deg,form),sc=scale(f,minor,form||(minor?'harm':'')),s=sc[(deg+6)%7];return[...tr,{...s,o:tr[0].o+(s.l<tr[0].l?1:0)}]}
function triad(root,qual){const t=up(root,3,qual==='M'||qual==='A'?'M':'m'),f=up(root,5,qual==='A'?'A':qual==='d'?'d':'P');return[root,t,f]}
function quality(ch){/* ch = root, third, fifth (any octave) */const a=mod(midi(ch[1])-midi(ch[0]),12),b=mod(midi(ch[2])-midi(ch[0]),12);
 if(a===4&&b===7)return'M';if(a===3&&b===7)return'm';if(a===3&&b===6)return'd';if(a===4&&b===8)return'A';return'?'}
const QN={en:{M:'major',m:'minor',d:'diminished',A:'augmented'},it:{M:'maggiore',m:'minore',d:'diminuita',A:'eccedente'}};
function symbol(root,qual,bass,lg,sev){const r=nm(root,lg),s=qual==='M'?'':qual==='m'?(lg==='it'?'m':'m'):qual==='d'?'°':'+';return r+s+(sev||'')+(bass&&!eq(bass,root)?'/'+nm(bass,lg):'')}
const ROMAN=['I','II','III','IV','V','VI','VII'];
function roman(deg,qual,sev){let r=ROMAN[deg];if(qual==='m'||qual==='d')r=r.toLowerCase();return r+(qual==='d'?'°':qual==='A'?'+':'')+(sev||'')}
const FUNC=['T','S','T','S','D','T','D']; /* I ii iii IV V vi vii */
/* transposition by a major-key move: same letters shifted, accidentals from semitones */
function tr(p,dl,ds){const q=P(p.l+dl,0,p.o);q.a=midi(p)+ds-midi({...q,a:0});return q}
function transposeTo(ps,fromTonic,toTonic){let dl=toTonic.l-fromTonic.l,ds=midi(toTonic)-midi(fromTonic);
 /* keep it within a comfortable range: move down an octave if the shift goes up more than a fifth */
 if(ds>6){ds-=12;dl-=7}if(ds<-6){ds+=12;dl+=7}return ps.map(p=>tr(p,dl,ds))}
/* four-part voicing, B T A S: ch = root, third, fifth (, seventh); inv = which member is in the bass;
   pos = which chord member the tenor starts from (changes the spacing); the upper three voices are in close position */
function voice(ch,inv,pos){inv=inv||0;pos=pos||0;const m=ch.map(p=>({l:p.l,a:p.a}));const b={...m[inv]};b.o=2;while(midi(b)<40)b.o++;
 let upper;if(m.length===4)upper=m.filter((x,i)=>i!==inv);else upper=inv===0?[m[0],m[1],m[2]]:inv===1?[m[0],m[2],m[0]]:[m[0],m[1],m[2]];
 /* the upper notes are a set of chord members: sort them into a stack starting from the member at index pos */
 const order=[];const pool=upper.slice();const cyc=m.length===4?[0,1,2,3]:[0,1,2];
 let start=cyc[pos%cyc.length];/* walk the chord in thirds from start, taking members still in the pool */
 for(let k=0;order.length<3&&k<12;k++){const idx=(start+k)%m.length,j=pool.findIndex(x=>x.l===m[idx].l&&x.a===m[idx].a);if(j>=0){order.push(pool.splice(j,1)[0]);if(k<m.length-1)continue}}
 while(pool.length)order.push(pool.shift());
 const out=[b];let prev=null;for(const t of order){let p={...t,o:3};const lo=prev?midi(prev)+1:Math.max(midi(b)+3,55);while(midi(p)<lo)p.o++;out.push(p);prev=p}
 return out}
const api={PCS,P,parse,midi,pc,dia,key,eq,nm,NM,ACC,ival,up,down,ivName,IVN,IVQ,MAJ,MIN,tonicOf,sigAcc,scale,fifthsOfMaj,triadOn,seventhOn,triad,quality,QN,symbol,roman,ROMAN,FUNC,tr,transposeTo,voice,mod};
if(typeof module!=='undefined')module.exports=api;else root.HT=api;
})(this);

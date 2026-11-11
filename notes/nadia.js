/* Nadia Boulangigor, the teacher of reading music: a Shigor with grey hair in a bun, round glasses,
   a dark dress with a white collar and a string of pearls. Drawn in the 663×730 coordinates of Igor's picture.
   Also: the treble and the bass clef, drawn with curves (no special font needed). */
(function(){
const INK='#141414',TAU=Math.PI*2;
function hair(c){c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.lineWidth=6;
 // the bun on top of the head, then the hair pulled back
 c.fillStyle='#b9b4ad';c.beginPath();c.ellipse(150,40,64,48,-.3,0,TAU);c.fill();c.stroke();
 c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=4;c.beginPath();c.arc(150,40,34,-2.6,.4);c.stroke();c.beginPath();c.arc(150,40,18,-2,1.4);c.stroke();
 c.strokeStyle=INK;c.lineWidth=6;c.fillStyle='#c9c4bc';
 c.beginPath();c.moveTo(14,120);c.bezierCurveTo(30,70,150,52,262,58);c.bezierCurveTo(330,62,372,86,384,112);c.bezierCurveTo(330,100,250,96,190,106);c.bezierCurveTo(120,118,70,140,40,176);c.bezierCurveTo(24,170,10,150,14,120);c.closePath();c.fill();c.stroke();
 c.strokeStyle='rgba(120,112,104,.6)';c.lineWidth=4;for(let k=0;k<4;k++){c.beginPath();c.moveTo(60+k*70,96-k*6);c.quadraticCurveTo(120+k*70,72-k*3,190+k*60,74);c.stroke()}
 // a hairpin
 c.strokeStyle='#3a3530';c.lineWidth=5;c.beginPath();c.moveTo(118,14);c.lineTo(196,62);c.stroke();
 c.restore()}
function dress(c){c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.lineWidth=6;
 c.translate(300,424);c.rotate(.3);
 // a white lace collar with a cameo brooch, and a string of pearls
 c.fillStyle='#fbf7ee';for(const d of[-1,1]){c.beginPath();c.moveTo(0,-6);c.quadraticCurveTo(d*60,-30,d*112,-14);c.quadraticCurveTo(d*104,30,d*52,40);c.quadraticCurveTo(d*16,36,0,-6);c.closePath();c.fill();c.stroke();
  c.lineWidth=3;c.strokeStyle='rgba(120,110,95,.6)';for(let k=0;k<4;k++){c.beginPath();c.arc(d*(26+k*22),18+Math.sin(k)*6,6,0,Math.PI);c.stroke()}c.strokeStyle=INK;c.lineWidth=6}
 c.fillStyle='#3d5a8a';c.beginPath();c.ellipse(0,8,17,21,0,0,TAU);c.fill();c.stroke();c.fillStyle='#f3e7d3';c.beginPath();c.ellipse(1,6,8,11,0,0,TAU);c.fill();
 c.restore()}
/* the clefs: x = left edge, y0 = the bottom line of the staff, s = space between two lines */
function treble(g,x,y0,s,col){const yG=y0-s,P=(a,b)=>[x+a*s+s*.9,yG+b*s];g.save();g.strokeStyle=col;g.fillStyle=col;g.lineCap='round';g.lineJoin='round';g.lineWidth=Math.max(2,s*.2);
 g.beginPath();const m=(a,b)=>g.moveTo(...P(a,b)),bz=(a,b,c,d,e,f)=>g.bezierCurveTo(...P(a,b),...P(c,d),...P(e,f));
 m(.3,.12);bz(-.12,.15,-.12,-.5,.3,-.58);bz(1.0,-.64,1.06,.78,.18,.86);bz(-.95,.96,-1.05,-.42,-.25,-1.22);bz(.45,-1.92,.85,-2.6,.6,-3.4);bz(.45,-4.05,-.08,-3.95,-.06,-3.1);
 bz(.0,-1.6,.42,1.2,.34,2.25);bz(.28,2.95,-.62,2.92,-.56,2.3);g.stroke();
 g.beginPath();g.arc(...P(-.36,2.28),s*.3,0,TAU);g.fill();g.restore()}
function bass(g,x,y0,s,col){const yF=y0-3*s,P=(a,b)=>[x+a*s+s*.45,yF+b*s];g.save();g.strokeStyle=col;g.fillStyle=col;g.lineCap='round';g.lineWidth=Math.max(2,s*.26);
 g.beginPath();g.arc(...P(.1,.05),s*.34,0,TAU);g.fill();
 g.beginPath();g.moveTo(...P(-.1,-.05));g.bezierCurveTo(...P(.0,-.9),...P(1.2,-1.15),...P(1.55,-.35));g.bezierCurveTo(...P(1.85,.7),...P(.9,1.9),...P(-.2,2.4));g.stroke();
 for(const b of[-.5,.5]){g.beginPath();g.arc(...P(2.05,b),s*.17,0,TAU);g.fill()}g.restore()}
window.IgorNadia={hair,dress,treble,bass,LOOK:{avatar:'she',glasses:'eye',gcol:'#141414'}};
})();

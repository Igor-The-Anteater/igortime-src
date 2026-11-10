/* Wolfgang Amadigor: powdered wig with side curls, a queue with a black bow, and a conductor's baton.
   Drawn in the 663×730 coordinates of Igor's picture. */
(function(){
const INK='#141414',TAU=Math.PI*2;
function puff(c,x,y,r){c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.stroke()}
function roll(c,x,y,w,h,a){c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.fill();c.stroke();
 c.lineWidth=3.5;c.strokeStyle='rgba(120,110,95,.55)';c.beginPath();c.ellipse(-w*.25,0,w*.45,h*.55,0,-1.2,1.9);c.stroke();c.restore()}
function wig(c){c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.lineWidth=6;
 // the queue at the back of the head, with its black bow
 c.fillStyle='#ecebe6';c.beginPath();c.moveTo(70,140);c.bezierCurveTo(30,170,20,230,44,290);c.bezierCurveTo(58,300,74,296,78,286);c.bezierCurveTo(64,236,70,190,104,156);c.closePath();c.fill();c.stroke();
 c.fillStyle='#1d1d1d';c.beginPath();c.moveTo(68,176);c.lineTo(20,150);c.lineTo(26,206);c.closePath();c.fill();c.stroke();
 c.beginPath();c.moveTo(68,176);c.lineTo(112,152);c.lineTo(110,206);c.closePath();c.fill();c.stroke();puff(c,68,178,13);
 // the powdered cap: a little cloud of curls along the top of the head
 const P=[[66,128,30],[104,96,34],[150,72,36],[200,56,38],[252,48,38],[302,50,36],[346,62,34],[388,86,32],[422,116,30],[446,148,26]];
 const base=()=>{c.beginPath();c.moveTo(60,132);for(const[x,y]of P)c.lineTo(x,y);c.lineTo(452,160);c.bezierCurveTo(400,150,360,160,340,168);c.bezierCurveTo(260,128,150,126,60,132);c.closePath()};
 c.lineWidth=12;base();c.stroke();for(const[x,y,r]of P){c.beginPath();c.arc(x,y,r,0,TAU);c.stroke()}
 c.fillStyle='#f4f3ee';base();c.fill();for(const[x,y,r]of P){c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
 c.lineWidth=4;c.strokeStyle='rgba(150,140,120,.55)';for(const[x,y,r]of P.slice(1,-1)){c.beginPath();c.arc(x+4,y+6,r*.55,.5,2.5);c.stroke()}
 // two rolled curls over the temple, Mozart style
 c.strokeStyle=INK;c.lineWidth=6;c.fillStyle='#f4f3ee';roll(c,398,178,48,24,.3);roll(c,388,228,46,23,.3);
 c.restore()}
// the baton, held by the tip of the snout; a: angle (0 = resting), tip glints a little
function baton(c,a){a=a||0;c.save();c.translate(560,655);c.rotate(-.9+a);c.lineCap='round';
 c.strokeStyle=INK;c.lineWidth=13;c.beginPath();c.moveTo(0,0);c.lineTo(0,-210);c.stroke();
 c.strokeStyle='#fbfaf4';c.lineWidth=6;c.beginPath();c.moveTo(0,-6);c.lineTo(0,-206);c.stroke();
 c.fillStyle='#7a4a2a';c.strokeStyle=INK;c.lineWidth=5;c.beginPath();c.ellipse(0,-4,13,26,0,0,TAU);c.fill();c.stroke();c.restore()}

// Sofia Gubaigorina (a Shigor): a dark bob with a fringe, and a warm patterned shawl under the chin
function sofia(c){c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.lineWidth=6;
 c.fillStyle='#2e2420';
 c.beginPath();c.moveTo(40,150);c.bezierCurveTo(40,70,170,20,300,26);c.bezierCurveTo(390,30,450,80,468,150);
 c.bezierCurveTo(452,170,432,170,418,160);c.bezierCurveTo(400,128,380,118,350,116);
 c.bezierCurveTo(260,104,150,120,96,170);c.bezierCurveTo(90,210,86,240,70,262);c.bezierCurveTo(50,250,38,200,40,150);c.closePath();c.fill();c.stroke();
 c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=5;for(let k=0;k<4;k++){c.beginPath();c.moveTo(110+k*70,60+k*4);c.quadraticCurveTo(160+k*70,48,210+k*66,58+k*6);c.stroke()}
 // the shawl
 c.translate(296,420);c.rotate(.3);c.strokeStyle=INK;c.lineWidth=6;
 c.fillStyle='#b8322a';c.beginPath();c.moveTo(-110,-26);c.quadraticCurveTo(0,10,110,-26);c.lineTo(70,40);c.quadraticCurveTo(0,96,-70,40);c.closePath();c.fill();c.stroke();
 c.fillStyle='#f1b46e';for(const[x,y]of[[-60,8],[-20,28],[20,28],[60,8],[0,58]]){c.beginPath();c.arc(x,y,7,0,TAU);c.fill()}
 c.strokeStyle='#f1b46e';c.lineWidth=3;c.beginPath();c.moveTo(-100,-14);c.quadraticCurveTo(0,20,100,-14);c.stroke();
 c.restore()}
window.IgorWig={wig,baton,sofia};
})();

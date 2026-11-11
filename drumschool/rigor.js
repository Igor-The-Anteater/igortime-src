/* Rigor Star, the drum teacher: a rock Igorlet with long hair, a bandana with a star and two drumsticks.
   Drawn in the 663×730 coordinates of Igor's picture (the same as the maestros' wig in /intervals/wig.js). */
(function(){
const INK='#141414',TAU=Math.PI*2;
function hair(c){c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.lineWidth=6;
 // long black hair: a cap on top of the head that falls down the back, with wavy ends
 c.fillStyle='#231c1a';c.beginPath();c.moveTo(322,102);
 c.bezierCurveTo(300,58,200,34,110,48);c.bezierCurveTo(40,58,8,90,4,130);
 c.bezierCurveTo(-2,200,8,300,20,380);c.quadraticCurveTo(30,420,22,452);c.quadraticCurveTo(48,430,56,446);c.quadraticCurveTo(66,420,86,440);c.quadraticCurveTo(92,408,112,424);
 c.bezierCurveTo(104,360,96,300,98,240);c.bezierCurveTo(100,170,150,118,230,104);c.bezierCurveTo(270,98,300,100,322,102);c.closePath();c.fill();c.stroke();
 // a few shiny strands
 c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=5;
 for(const[x0,y0,x1,y1,x2,y2]of[[40,120,30,240,44,360],[66,110,58,220,70,340],[150,70,110,90,80,150],[240,62,190,64,150,84]]){c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(x1,y1,x2,y2);c.stroke()}
 // the bandana, with a white star
 c.strokeStyle=INK;c.lineWidth=6;c.fillStyle='#d6322b';
 c.beginPath();c.moveTo(18,112);c.bezierCurveTo(90,62,220,52,318,92);c.lineTo(326,118);c.bezierCurveTo(230,84,110,96,30,140);c.closePath();c.fill();c.stroke();
 c.beginPath();c.moveTo(24,124);c.quadraticCurveTo(-10,150,-6,190);c.quadraticCurveTo(14,170,30,168);c.quadraticCurveTo(22,150,40,134);c.closePath();c.fill();c.stroke();
 c.fillStyle='#ffffff';star(c,168,82,18);c.fillStyle='#ffffff';for(const[x,y]of[[80,104],[256,80],[300,96]]){c.beginPath();c.arc(x,y,5,0,TAU);c.fill()}
 c.restore()}
function star(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;c.lineTo(x+q*Math.cos(a),y+q*Math.sin(a))}c.closePath();c.fill();c.lineWidth=3;c.stroke()}
/* two drumsticks held in front of the snout; a = how much they swing (radians) */
function sticks(c,a,b){c.save();c.lineCap='round';
 for(const[x,y,r0,sw]of[[430,560,-.9,a],[520,600,-.6,b==null?-a:b]]){c.save();c.translate(x,y);c.rotate(r0+sw);
  c.strokeStyle=INK;c.lineWidth=20;c.beginPath();c.moveTo(0,0);c.lineTo(0,-230);c.stroke();
  c.strokeStyle='#e2b878';c.lineWidth=12;c.stroke();c.fillStyle='#f3d9a8';c.strokeStyle=INK;c.lineWidth=4;c.beginPath();c.ellipse(0,-236,9,13,0,0,TAU);c.fill();c.stroke();
  c.strokeStyle='#b07a45';c.lineWidth=12;c.beginPath();c.moveTo(0,0);c.lineTo(0,-40);c.stroke();c.restore()}
 c.restore()}
window.IgorRigor={hair,sticks,LOOK:{avatar:'igor',glasses:'sun',gcol:'#7a3cff',ears:'both',ecol:'#d9dde3'}};
})();

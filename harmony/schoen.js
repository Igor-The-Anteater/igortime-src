/* Arnold Schönbigor, the harmony teacher: an Igorlet after Arnold Schönberg — a shiny bald dome, dark hair only at the back,
   thick serious eyebrows, a dark jacket with a white collar and a bow tie, and a stick of chalk.
   Drawn in the 663×730 coordinates of Igor's picture (as Nadia and Rigor Star). */
(function(){
const INK='#141414',TAU=Math.PI*2;
function head(c){c.save();c.lineJoin='round';c.lineCap='round';
 /* the bald dome shines */
 c.fillStyle='rgba(255,255,255,.45)';c.beginPath();c.ellipse(250,118,92,20,-.08,0,TAU);c.fill();
 c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.ellipse(212,112,30,7,-.1,0,TAU);c.fill();
 /* dark hair, only at the back of the head, short and a bit wild */
 c.strokeStyle=INK;c.lineWidth=5;c.fillStyle='#3a2e28';
 c.beginPath();c.moveTo(20,128);c.bezierCurveTo(40,170,90,215,150,236);c.bezierCurveTo(120,250,70,236,46,214);c.bezierCurveTo(30,200,14,172,20,128);c.closePath();c.fill();c.stroke();
 c.strokeStyle='#5a4a40';c.lineWidth=3;for(let k=0;k<5;k++){c.beginPath();c.moveTo(34+k*16,160+k*12);c.quadraticCurveTo(50+k*18,186+k*10,62+k*20,212+k*4);c.stroke()}
 /* thick, serious eyebrows */
 c.strokeStyle=INK;c.lineWidth=13;c.beginPath();c.moveTo(420,174);c.quadraticCurveTo(452,160,492,170);c.stroke();c.beginPath();c.moveTo(512,166);c.quadraticCurveTo(540,152,566,164);c.stroke();
 c.restore()}
function suit(c){c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=INK;c.lineWidth=6;
 c.translate(300,424);c.rotate(.3);
 /* dark jacket lapels */
 c.fillStyle='#2e3340';for(const d of[-1,1]){c.beginPath();c.moveTo(d*6,-4);c.lineTo(d*120,-26);c.lineTo(d*128,30);c.lineTo(d*30,62);c.closePath();c.fill();c.stroke()}
 /* white collar */
 c.fillStyle='#fbf7ee';for(const d of[-1,1]){c.beginPath();c.moveTo(0,-6);c.lineTo(d*52,-24);c.lineTo(d*40,10);c.closePath();c.fill();c.stroke()}
 /* bow tie */
 c.fillStyle='#1b1b22';c.beginPath();c.moveTo(0,4);c.lineTo(-40,-14);c.lineTo(-40,26);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(0,4);c.lineTo(40,-14);c.lineTo(40,26);c.closePath();c.fill();c.stroke();
 c.beginPath();c.ellipse(0,5,10,12,0,0,TAU);c.fill();c.stroke();
 c.restore()}
function chalk(c,a){c.save();c.translate(612,560);c.rotate(-.6+(a||0));c.fillStyle='#f6f2e6';c.strokeStyle=INK;c.lineWidth=5;c.beginPath();c.rect(-10,-46,20,72);c.fill();c.stroke();c.fillStyle='rgba(0,0,0,.08)';c.fillRect(-10,10,20,16);c.restore()}
window.IgorSchoen={head,suit,chalk,LOOK:{avatar:'igor'}};
})();

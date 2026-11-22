const puppeteer=require('puppeteer-core');
(async()=>{
 const lang=process.argv[2]||'it', script=process.argv[3];
 const br=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 const pg=await br.newPage();await pg.setViewport({width:540,height:960});
 pg.on('console',m=>{const t=m.text();if(!/GPU stall|WebGL/.test(t))console.log('[page]',t)});pg.on('pageerror',e=>console.log('[err]',e.message));
 await pg.evaluateOnNewDocument(l=>{localStorage.setItem('igortime_lang',l)},lang);
 await pg.goto('http://localhost:8765/exp/index.html',{waitUntil:'load'});
 await pg.waitForFunction(()=>window.__X&&window.__X.igReady(),{timeout:20000}).catch(()=>console.log('igor not ready'));
 await new Promise(r=>setTimeout(r,1500));
 const fn=require(script);await fn(pg,lang);
 await br.close()})();

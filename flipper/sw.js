/* Igor's pinball: offline cache. The page itself is network-first (always the newest version when online);
   scripts, fonts and pictures are cache-first, so the app opens fast and works without network. */
const C='igor-flipper-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==C).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.hostname.includes('firebase')||u.hostname.includes('googleapis.com')&&u.pathname.includes('identitytoolkit'))return;
 const page=r.mode==='navigate'||u.pathname.endsWith('/flipper/')||u.pathname.endsWith('.html')||u.pathname.endsWith('ver.txt');
 if(page){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r)));return}
 e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})))});

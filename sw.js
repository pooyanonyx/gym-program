/* sw.js — کش آفلاین */
const V='wk-v6';
const FILES=['./','index.html','css/style.css','js/util.js','js/data.js','js/engine.js','js/exercises.js','js/app.js','manifest.json','icons/icon.svg','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{
    if(new URL(e.request.url).origin===location.origin){const c=n.clone();caches.open(V).then(x=>x.put(e.request,c))}
    return n;
  }).catch(()=>caches.match('index.html'))));
});

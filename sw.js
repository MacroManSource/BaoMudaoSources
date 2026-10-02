// BaoMudao service worker: офлайн-оболочка + web push
const V='bm-v1',SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin||u.pathname.endsWith('config.js')||u.pathname.endsWith('sw.js'))return;
 e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))))});
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(_){d={title:'BaoMudao',body:e.data?e.data.text():''}}
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
  if(cs.some(c=>c.visibilityState==='visible'))return; // сайт открыт — покажется внутреннее всплывающее окно
  return self.registration.showNotification(d.title||'BaoMudao',{body:d.body||'',icon:'icons/icon-192.png',badge:'icons/badge-96.png',tag:(d.kind||'n')+':'+(d.id||''),data:{link:d.link||null}})}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const link=(e.notification.data||{}).link;
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{const c=cs.find(x=>'focus' in x);
  if(c){c.postMessage({type:'open',link});return c.focus()}
  return self.clients.openWindow('./'+(link?'?n='+encodeURIComponent(link):''))}))});

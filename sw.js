const CACHE = 'securegate-v4';
const MAIN = '/SECUREGATE/SECUREGATE_2.0.html';

self.addEventListener('install', function(e){
  e.waitUntil(
    fetch(MAIN).then(function(r){
      return caches.open(CACHE).then(function(c){ return c.put(MAIN, r); });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // Para navegaciones (HTML), siempre devolver la app cacheada
  if(e.request.mode === 'navigate'){
    e.respondWith(
      caches.match(MAIN).then(function(cached){
        return cached || fetch(e.request);
      })
    );
    return;
  }
  // Para otros assets: red primero, luego cache
  e.respondWith(
    fetch(e.request).then(function(r){
      if(r && r.status===200){
        var clone=r.clone();
        caches.open(CACHE).then(function(c){c.put(e.request,clone);});
      }
      return r;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});

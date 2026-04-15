// SECUREGATE 2.0 — Service Worker v13
const CACHE='securegate-v13';
const ASSETS=[
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap'
];

// Instalación — cachear recursos esenciales
self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

// Activación — limpiar caches viejos
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch',e=>{
  // No interceptar Firebase ni API de Anthropic
  if(e.request.url.includes('firebaseio.com')||
     e.request.url.includes('firebase.google.com')||
     e.request.url.includes('anthropic.com')){
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(resp=>{
        // Cachear respuesta fresca
        if(resp&&resp.status===200){
          const clone=resp.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return resp;
      })
      .catch(()=>caches.match(e.request))
  );
});

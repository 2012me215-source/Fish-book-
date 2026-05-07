const CACHE_NAME = 'kashif-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './icon-512.svg',
    'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.mjs',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/lucide@0.412.0/+esm',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

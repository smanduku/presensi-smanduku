const CACHE_NAME = 'presensi-smanduku-v9'; // Silakan naikkan angkanya setiap kali ada perubahan HTML

// Daftar file utama yang wajib disimpan di memori HP guru agar aplikasi kebal offline
const urlsToCache = [
  './',
  './index.html',
  './icon.png',
  // --- TAMBAHAN WAJIB: Cache Desain & Ikon agar tidak berantakan saat offline ---
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// 1. Tahap Install: Ambil file di atas dari internet dan simpan di memori HP
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Menyimpan aset utama ke dalam cache HP...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Paksa service worker langsung aktif
  );
});

// 2. Tahap Aktivasi: Bersihkan cache lama jika nanti Anda melakukan update besar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache lama...');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Tahap Fetch (Mencegat Jaringan): Jika offline, langsung ambil halaman dari memori HP
self.addEventListener('fetch', event => {
  // Hanya cegat permintaan dokumen halaman utama/aset lokal, jangan cegat request data POST
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Jika file ada di memori HP (Cache), langsung tampilkan (cepat & kebal offline)
          if (cachedResponse) {
            return cachedResponse;
          }
          // Jika tidak ada di memori, baru ambil dari internet
          return fetch(event.request);
        })
    );
  }
});
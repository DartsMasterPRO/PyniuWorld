/* Service worker Krainy Gier Pyniu – generowany przez build_vercel.py */
const VERSION = 'aa030d723686';
const CACHE = 'gry-pyniu-' + VERSION;
const ASSETS = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-192.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];
const LAZY = ["assets/0b0ce6cf00a9.webp", "assets/a2f0c68bbed8.webp", "assets/5826d2077724.webp", "assets/f97b222367c6.webp", "assets/973b8b2d45d0.webp", "assets/943aa6adbfc6.webp", "assets/b8851cdf2355.webp", "assets/fbebaf5ce86e.webp", "assets/93bcb485f670.webp", "assets/1c4733a52a0e.webp", "assets/05ad9e7145c3.webp", "assets/f893392e6196.webp", "assets/1caa43ac7e70.webp", "assets/84b303f416fc.webp", "assets/b3364f7ded72.webp", "assets/5612577708c4.webp", "assets/eee4f7587049.webp", "assets/3c128325900b.webp", "assets/c83d6a6fc455.webp", "assets/97821f97949c.webp", "assets/2874ec4d3560.webp", "assets/d63d78691d90.webp", "assets/4a5505cd40b3.webp", "assets/1f379a71b211.webp", "assets/0ee98a927af5.webp", "assets/97ecc8b8b399.webp", "assets/2f569952165b.webp", "assets/171d97f71667.webp", "assets/a5d27ccf9ba9.webp", "assets/ccf582363196.webp", "assets/b7b6576c173b.webp", "assets/2f36fef674a4.webp", "assets/b254dd2fc937.webp", "assets/8f82fc1cea91.webp", "assets/6f86a7afa168.webp", "assets/aef2a5a4a335.webp", "assets/37de3907ec7d.webp", "assets/8cc7fb6e09fd.webp", "assets/da5b7c670961.webp", "assets/17e023aa2577.webp", "assets/e980adce5627.webp", "assets/ef747ae50536.webp", "assets/ccac2bcfc41c.webp", "assets/e30805c0d86a.webp", "assets/17aed6eca0c0.webp", "assets/2b133209d682.webp", "assets/59bb2b7dc841.webp", "assets/c14dc2be157f.mp3", "assets/t_fb2a147048ff.webp", "assets/t_d17428f524e2.webp", "assets/t_4abd97db8a14.webp", "assets/t_1304eb6d32e2.webp", "assets/t_eb2e2be76ecc.webp", "assets/t_c2d0a3479f8d.webp", "assets/t_6862781d5ae9.webp", "assets/t_0d8b7532819a.webp", "assets/t_2365012cd61c.webp", "assets/t_c0e09322617a.webp", "assets/t_1cfebe108470.webp", "assets/t_1384fd2e1d5a.webp", "assets/t_1f2d59223b0e.webp", "assets/t_ae084e29a67c.webp", "assets/t_67533ddd8953.webp", "assets/t_44763ce26fd8.webp", "assets/t_58ecfb17b697.webp", "assets/t_e861e50006ed.webp", "assets/t_eb4c8179ae00.webp", "assets/t_10990c50ac64.webp", "assets/t_448643f0fc08.webp", "assets/t_ffc0cda46d47.webp", "assets/t_e3b4f586907a.webp", "assets/t_17600515296e.webp"];   // grafiki, muzyka – dociągane w tle po instalacji (offline)

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    // stare pliki z poprzedniej wersji (nazwy = hash treści) kopiujemy bez pobierania
    for (const k of await caches.keys()) { if (k === CACHE || !k.startsWith('gry-pyniu-')) continue;
      const old = await caches.open(k);
      for (const u of LAZY) { const r = await old.match(u); if (r) await c.put(u, r); } }
    await c.addAll(ASSETS.map(u => new Request(u, {cache: 'reload'})));
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('gry-pyniu-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
    .then(() => caches.open(CACHE)).then(async c => { for (const u of LAZY) { if (!(await c.match(u))) { try { await c.add(u); } catch (e) {} } } }));
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
/* cache-first: aplikacja działa offline; nowa wersja przychodzi z nowym sw.js (inny VERSION) */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('index.html').then(r => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req).then(res => {
    if (res && res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  })));
});

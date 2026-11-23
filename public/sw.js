/* Service worker Krainy Gier Pyniu – generowany przez build_vercel.py */
const VERSION = 'a592fc397f23';
const CACHE = 'gry-pyniu-' + VERSION;
const ASSETS = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-192.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/badge-72.png"];
const LAZY = ["assets/0b0ce6cf00a9.webp", "assets/a2f0c68bbed8.webp", "assets/5826d2077724.webp", "assets/f97b222367c6.webp", "assets/973b8b2d45d0.webp", "assets/943aa6adbfc6.webp", "assets/b8851cdf2355.webp", "assets/fbebaf5ce86e.webp", "assets/93bcb485f670.webp", "assets/1c4733a52a0e.webp", "assets/05ad9e7145c3.webp", "assets/f893392e6196.webp", "assets/1caa43ac7e70.webp", "assets/84b303f416fc.webp", "assets/b3364f7ded72.webp", "assets/5612577708c4.webp", "assets/eee4f7587049.webp", "assets/3c128325900b.webp", "assets/c83d6a6fc455.webp", "assets/97821f97949c.webp", "assets/2874ec4d3560.webp", "assets/d63d78691d90.webp", "assets/4a5505cd40b3.webp", "assets/1f379a71b211.webp", "assets/0ee98a927af5.webp", "assets/97ecc8b8b399.webp", "assets/2f569952165b.webp", "assets/171d97f71667.webp", "assets/a5d27ccf9ba9.webp", "assets/ccf582363196.webp", "assets/b7b6576c173b.webp", "assets/2f36fef674a4.webp", "assets/b254dd2fc937.webp", "assets/8f82fc1cea91.webp", "assets/6f86a7afa168.webp", "assets/aef2a5a4a335.webp", "assets/37de3907ec7d.webp", "assets/8cc7fb6e09fd.webp", "assets/da5b7c670961.webp", "assets/17e023aa2577.webp", "assets/e980adce5627.webp", "assets/ef747ae50536.webp", "assets/ccac2bcfc41c.webp", "assets/e30805c0d86a.webp", "assets/17aed6eca0c0.webp", "assets/2b133209d682.webp", "assets/59bb2b7dc841.webp", "assets/b7c77cd2d4b2.webp", "assets/6183c64396cb.webp", "assets/c67d9317772c.webp", "assets/18c3b00441b2.webp", "assets/e12b74b899ab.webp", "assets/7c8c3a0887ca.webp", "assets/37123f156952.webp", "assets/5a04f87f5be1.webp", "assets/1ae9845384f9.webp", "assets/9413f0291064.webp", "assets/e11fbf835885.webp", "assets/5fe71947a20e.webp", "assets/c60e3d347a3f.webp", "assets/fbea4d1ad22f.webp", "assets/22c55ab9347e.webp", "assets/eb0b0ebc7fa8.webp", "assets/68e2c07b7f88.webp", "assets/328634a954e4.webp", "assets/a3570e7e947a.webp", "assets/4dcab7754cce.webp", "assets/d1ce43cb8455.webp", "assets/d4a4ff300e33.webp", "assets/04e18ebb25a5.webp", "assets/553362875ea3.webp", "assets/542ea3cdff9f.webp", "assets/08a4e17f8c55.webp", "assets/4d56fa0ccf61.webp", "assets/4a083891e185.webp", "assets/9997865d7a5b.webp", "assets/3d28abd78849.webp", "assets/e02b95ce8abf.webp", "assets/18cc899a873b.webp", "assets/49b9c70183a3.webp", "assets/ecc09d20e897.webp", "assets/d8d4bf817d19.webp", "assets/95132cc18ccb.webp", "assets/b32c734b8520.webp", "assets/b33513d6ed2e.webp", "assets/c14dc2be157f.mp3", "assets/f91297dffb21.webp", "assets/06315e2ad334.webp", "assets/07235428c6f5.webp", "assets/e42b90e900b3.webp", "assets/85fde8d33255.webp", "assets/05c0569058b4.webp", "assets/eca20d621a31.webp", "assets/2169ca4bf4a4.webp", "assets/45016c01f487.webp", "assets/186efaf4c36c.webp", "assets/6b34b02e4d38.webp", "assets/b50460b582cd.webp", "assets/303bd12cb1c6.webp", "assets/407cd159055a.webp", "assets/852d1c14dc51.webp", "assets/7e9d9037e776.webp", "assets/986ff8c12477.webp", "assets/369a3b805a8c.webp", "assets/0858441d0940.webp", "assets/90310670d105.webp", "assets/d3ee0518b2b6.webp", "assets/bb06b7adf77f.webp", "assets/d050621d71fc.webp", "assets/18349b31dd33.webp", "assets/b04a13625239.webp", "assets/99596ed030d4.webp", "assets/t_fb2a147048ff.webp", "assets/t_d17428f524e2.webp", "assets/t_4abd97db8a14.webp", "assets/t_1304eb6d32e2.webp", "assets/t_eb2e2be76ecc.webp", "assets/t_c2d0a3479f8d.webp", "assets/t_6862781d5ae9.webp", "assets/t_0d8b7532819a.webp", "assets/t_2365012cd61c.webp", "assets/t_c0e09322617a.webp", "assets/t_1cfebe108470.webp", "assets/t_1384fd2e1d5a.webp", "assets/t_1f2d59223b0e.webp", "assets/t_ae084e29a67c.webp", "assets/t_67533ddd8953.webp", "assets/t_44763ce26fd8.webp", "assets/t_58ecfb17b697.webp", "assets/t_e861e50006ed.webp", "assets/t_eb4c8179ae00.webp", "assets/t_10990c50ac64.webp", "assets/t_448643f0fc08.webp", "assets/t_ffc0cda46d47.webp", "assets/t_e3b4f586907a.webp", "assets/t_17600515296e.webp", "assets/t_17086f0278fe.webp", "assets/t_8a637dc17ed7.webp", "assets/t_e9abd2151458.webp", "assets/t_1d9ac4946066.webp"];   // grafiki, muzyka – dociągane w tle po instalacji (offline)
const OUTV = ["assets/v_02afcd7a5907.webp", "assets/v_aa98e6413eba.webp", "assets/v_0ece69d4d474.webp", "assets/v_00875d9b442f.webp", "assets/v_dcdfeaafa7b4.webp", "assets/v_20868ebda995.webp", "assets/v_2f97cea95ea4.webp", "assets/v_031522f4ee1e.webp", "assets/v_cf4a65a7ca51.webp", "assets/v_2a65dfeba380.webp", "assets/v_6a5f1ef8445f.webp", "assets/v_1672fce32bfd.webp", "assets/v_2b338f966a80.webp", "assets/v_20f838578e00.webp", "assets/v_27495b4e477d.webp", "assets/v_bf629afc740d.webp", "assets/v_495f73097c8e.webp", "assets/v_6b0aec9492f7.webp", "assets/v_21a269d80257.webp", "assets/v_f391f2df4eb1.webp", "assets/v_1187c46531f0.webp", "assets/v_21fab5d4a976.webp", "assets/v_7f83f444fd10.webp", "assets/v_42313afd1e39.webp", "assets/v_a14495e3abca.webp", "assets/v_1a3221589f8b.webp", "assets/v_7f514b669151.webp", "assets/v_1b2aa9a55ad5.webp", "assets/v_7e5d948e8c94.webp", "assets/v_88276bb6c87e.webp", "assets/v_c6ebc45b5ed1.webp"];   // animacje strojów – pobierane dopiero gdy potrzebne, ale przenoszone między wersjami

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    // stare pliki z poprzedniej wersji (nazwy = hash treści) kopiujemy bez pobierania
    for (const k of await caches.keys()) { if (k === CACHE || !k.startsWith('gry-pyniu-')) continue;
      const old = await caches.open(k);
      for (const u of LAZY.concat(OUTV)) { const r = await old.match(u); if (r) await c.put(u, r); } }
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
  if (url.pathname.startsWith('/api/')) return;   // funkcje serwera – zawsze z sieci, nigdy z cache
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('index.html').then(r => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req).then(res => {
    if (res && res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  })));
});

/* ================= powiadomienia push ================= */
const ICON = 'icons/icon-192.png', BADGE = 'icons/badge-72.png';
const abs = u => new URL(u || './', self.registration.scope).href;
self.addEventListener('push', e => {
  let m = {};
  try { m = e.data ? e.data.json() : {}; } catch (_) { m = {body: e.data ? e.data.text() : ''}; }
  const title = m.title || 'Kraina Gier Pyniu';
  e.waitUntil(self.registration.showNotification(title, {
    body: m.body || '', icon: m.icon || ICON, badge: BADGE, lang: 'pl', tag: m.tag || 'kgp',
    renotify: !!m.renotify, requireInteraction: !!m.requireInteraction,
    vibrate: [120, 60, 120, 60, 240], timestamp: Date.now(), data: {url: abs(m.url)},
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || abs('./');
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    const scope = self.registration.scope;
    const c = all.find(w => w.url.startsWith(scope) && 'focus' in w);
    if (c) {   // aplikacja już otwarta → pokaż ją i przejdź do właściwej gry (obsługa w 06_push.js)
      try { await c.focus(); } catch (_) {}
      c.postMessage({type: 'kgp-open', url});
      return;
    }
    if (self.clients.openWindow) return self.clients.openWindow(url);
  })());
});
/* przeglądarka wymieniła subskrypcję → zapisz nową na serwerze */
self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil((async () => {
    const old = e.oldSubscription;
    const opts = old && old.options ? old.options : null;
    if (!opts || !opts.applicationServerKey) return;
    const sub = e.newSubscription || await self.registration.pushManager.subscribe(opts);
    await fetch('api/subscribe', {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({resub: true, oldEndpoint: old.endpoint, sub: sub.toJSON()})});
  })().catch(() => {}));
});
/* lokalne przypomnienie bez serwera (Periodic Background Sync – Chrome, zainstalowana aplikacja) */
const META = 'kgp-meta';
async function metaGet(k) { const r = await (await caches.open(META)).match(k); return r ? r.json() : null; }
async function metaSet(k, v) { await (await caches.open(META)).put(k, new Response(JSON.stringify(v), {headers: {'Content-Type': 'application/json'}})); }
const dkey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
async function localReminder(now = new Date()) {
  const m = await metaGet('meta.json');
  if (!m || !m.local) return false;
  const k = dkey(now), shown = (await metaGet('shown.json')) || {};
  if (shown.k === k || now.getHours() < (m.hour || 18)) return false;
  const done = m.done || {}, c = (m.days || {})[k];
  let title, body, url;
  if (m.rem && m.rem.daily !== false && done.daily !== k && c) { title = '⭐ Nowe wyzwanie dnia' + (c.g ? ': ' + c.g : ''); body = c.t + ' · 🎁 +100 XP'; url = './?n=daily'; }
  else if (m.rem && m.rem.word !== false && done.word !== k) { title = '📅 Słowo dnia czeka!'; body = 'Jedna szansa dziennie – zgadniesz w 4 próbach? 🟩🟨'; url = './?n=word#g-wordle'; }
  else return false;
  await metaSet('shown.json', {k});
  await self.registration.showNotification(title, {body, icon: ICON, badge: BADGE, lang: 'pl', tag: 'local', vibrate: [120, 60, 120], data: {url: abs(url)}});
  return true;
}
self.addEventListener('periodicsync', e => { if (e.tag === 'kgp-daily') e.waitUntil(localReminder().catch(() => {})); });
self.KGP_LOCAL_REMINDER = localReminder;   // do testów

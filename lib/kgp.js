/* Wspólny kod funkcji /api (Vercel, Node) – Kraina Gier Pyniu: powiadomienia push.
   Baza: Upstash Redis (REST). Zmienne: UPSTASH_REDIS_REST_URL/_TOKEN albo KV_REST_API_URL/_TOKEN.
   Klucze VAPID: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...).
   Tylko do testów lokalnych: KGP_LOCAL_MEMSTORE=1 → baza w pamięci, KGP_FAKE_PUSH=1 → push nie jest wysyłany. */
'use strict';
const crypto = require('crypto');

/* ---------------- baza ---------------- */
let _db = null;
function memStore() {
  const m = global.__kgpMem || (global.__kgpMem = new Map());
  const clone = v => v == null ? null : JSON.parse(JSON.stringify(v));
  return {
    async get(k) { return m.has(k) ? clone(m.get(k)) : null; },
    async set(k, v) { m.set(k, clone(v)); return 'OK'; },
    async del(k) { return m.delete(k) ? 1 : 0; },
    async sadd(k, v) { const s = m.get(k) || []; if (!s.includes(v)) s.push(v); m.set(k, s); return 1; },
    async srem(k, v) { const s = m.get(k) || []; m.set(k, s.filter(x => x !== v)); return 1; },
    async smembers(k) { return (m.get(k) || []).slice(); },
    async incr(k) { const v = (+m.get(k) || 0) + 1; m.set(k, v); return v; },
    async expire() { return 1; },
    async rpush(k, ...v) { const s = m.get(k) || []; s.push(...v); m.set(k, s); return s.length; },
    async lrange(k, a, b) { const s = m.get(k) || []; return s.slice(a, b === -1 ? undefined : b + 1); },
  };
}
function db() {
  if (_db) return _db;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) { const { Redis } = require('@upstash/redis'); _db = new Redis({ url, token }); return _db; }
  if (process.env.KGP_LOCAL_MEMSTORE === '1') { _db = memStore(); return _db; }
  const e = new Error('Brak bazy danych: dodaj w Vercelu integrację „Upstash for Redis”.'); e.status = 503; throw e;
}
const K = { dev: id => 'kgp:dev:' + id, code: c => 'kgp:pc:' + c, ep: h => 'kgp:ep:' + h, all: 'kgp:devs', rate: (id, w) => 'kgp:rl:' + w + ':' + id };
const epHash = ep => crypto.createHash('sha256').update(String(ep)).digest('hex').slice(0, 32);

/* ---------------- HTTP ---------------- */
function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}
async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; } }
  const chunks = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > 64 * 1024) break; chunks.push(c); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch (e) { return {}; }
}
/* opakowanie handlera: metoda, błędy → JSON */
function api(methods, fn) {
  return async (req, res) => {
    try {
      if (!methods.includes(req.method)) return send(res, 405, { error: 'Metoda niedozwolona' });
      const b = req.method === 'POST' ? await body(req) : {};
      await fn(req, res, b);
    } catch (e) {
      if (!e.status) console.error(e);
      send(res, e.status || 500, { error: e.status ? e.message : 'Błąd serwera' });
    }
  };
}
function bad(msg, status = 400) { const e = new Error(msg); e.status = status; return e; }

/* ---------------- walidacja ---------------- */
const isId = s => typeof s === 'string' && /^[A-Za-z0-9_-]{16,64}$/.test(s);
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // bez O/0/I/1
function newCode() { const b = crypto.randomBytes(6); let s = ''; for (const x of b) s += CODE_ABC[x % CODE_ABC.length]; return s; }
function validSub(s) {
  return s && typeof s === 'object' && typeof s.endpoint === 'string' && /^https:\/\//.test(s.endpoint) && s.endpoint.length < 1200 &&
    s.keys && typeof s.keys.p256dh === 'string' && typeof s.keys.auth === 'string' ? { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } } : null;
}
function validTz(tz) { try { if (typeof tz === 'string' && tz.length < 64) { new Intl.DateTimeFormat('en', { timeZone: tz }); return tz; } } catch (e) {} return 'Europe/Warsaw'; }

/* ---------------- urządzenia ---------------- */
async function getDev(id) { return isId(id) ? await db().get(K.dev(id)) : null; }
async function saveDev(d) { d.upd = Date.now(); await db().set(K.dev(d.id), d); return d; }
async function delDev(d) {
  const r = db();
  if (d.pair) { const p = await getDev(d.pair); if (p && p.pair === d.id) { p.pair = null; await saveDev(p); } }
  if (d.code) await r.del(K.code(d.code));
  if (d.sub) await r.del(K.ep(epHash(d.sub.endpoint)));
  await r.srem(K.all, d.id); await r.del(K.dev(d.id));
}
/* publiczny widok urządzenia dla klienta */
async function view(d) {
  let partner = null;
  if (d.pair) { const p = await getDev(d.pair); if (p && p.pair === d.id) partner = { name: p.name || 'Partner', push: !!p.sub && p.rem.invite !== false }; }
  return { ok: true, code: d.code, push: !!d.sub, rem: d.rem, hour: d.hour, tz: d.tz, name: d.name, partner, hourly: hourly() };
}
const hourly = () => process.env.KGP_CRON_HOURLY === '1';

/* ---------------- czas ---------------- */
function localParts(tz, now = new Date()) {
  const p = {}; for (const x of new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(now)) p[x.type] = x.value;
  const y = +p.year, m = +p.month, d = +p.day;
  return { key: `${p.year}-${p.month}-${p.day}`, hour: +p.hour % 24, no: Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2025, 0, 1)) / 864e5) };
}

/* ---------------- Wyzwanie dnia (kopia algorytmu z 05_profile.js – zapasowo, gdy telefon nie przysłał listy) ---------------- */
const DAILY = [
  ['familiada', 'Zdobądź co najmniej 300 pkt w Familiadzie solo'], ['milionerzy', 'Wygraj co najmniej 40 000 zł w Milionerach'],
  ['jedenz10', 'Zdobądź 60 pkt w „1 z 10” solo'], ['kolo', 'Uzbieraj 2 500 zł w Kole fortuny solo'],
  ['postaw', 'Obroń co najmniej 100 000 zł w „Postaw na milion”'], ['vabanque', 'Zdobądź 1 500 zł w Va banque solo'],
  ['wyzej', 'Traf 10 razy w „Wyżej czy niżej” solo'], ['wordle', 'Ułóż Słowo dnia w maks. 4 próbach'],
  ['wordle', 'Zbierz 12 pkt w serii słów w Wordle'], ['wisielec', 'Zdobądź 40 pkt w Wisielcu solo'],
  ['czolko', 'Zdobądź 8 pkt w Czółku solo'], ['taboo', 'Zdobądź 8 pkt w Odwróconym Tabu'],
  ['panstwa', 'Zdobądź 40 pkt w Państwach-miastach solo'], ['czworki', 'Wygraj w Czwórki z komputerem na średnim poziomie'],
  ['kolko', 'Pokonaj komputer w Kółko i krzyżyk na średnim poziomie'], ['warcaby', 'Wygraj partię warcabów z komputerem'],
  ['statki', 'Zatop flotę komputera na średnim poziomie'], ['kropki', 'Pokonaj komputer w Kropkach i kreskach na średnim'],
  ['memory', 'Wygraj Memory z komputerem na średnim poziomie'], ['general', 'Zdobądź 180 pkt w Generale solo'],
  ['farkle', 'Zdobądź 3 000 pkt w Farkle solo'], ['refleks', 'Uzyskaj średnią poniżej 350 ms w Pojedynku refleksu'],
  ['mastermind', 'Złam szyfr w Mastermind w maks. 6 próbach'], ['liczenie', 'Daj 20 dobrych odpowiedzi w Szybkim liczeniu'],
  ['znasz', 'Zagrajcie we dwoje w „Jak dobrze mnie znasz?”'], ['nigdy', 'Zagrajcie we dwoje w „Nigdy przenigdy”'],
  ['prawda', 'Zagrajcie razem w „Prawdę czy wyzwanie”'], ['wolisz', 'Sprawdźcie się we dwoje w „Wolisz…?”'],
  ['tajniacy', 'Rozpracujcie razem planszę w Tajniakach'], ['*', 'Rozegraj dziś 3 dowolne gry'],
];
function pfRng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function dailyFor(n) {
  const L = DAILY.length, cyc = Math.floor(n / L), r = pfRng(cyc * 7919 + 13), o = DAILY.map((_, i) => i);
  for (let i = L - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
  const c = DAILY[o[((n % L) + L) % L]]; return { gid: c[0] === '*' ? '' : c[0], t: c[1] };
}

/* ---------------- web push ---------------- */
let _wp = null;
function vapidOk() { return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY); }
function wp() {
  if (_wp) return _wp;
  if (!vapidOk()) throw bad('Brak kluczy VAPID w ustawieniach Vercela.', 503);
  _wp = global.__kgpWebPush || require('web-push');   // __kgpWebPush – atrapa w testach
  _wp.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:kraina@example.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  return _wp;
}
/* wysyła powiadomienie; martwą subskrypcję (404/410) usuwa z bazy. Zwraca true/false */
async function push(d, msg, opt = {}) {
  if (!d || !d.sub) return false;
  if (process.env.KGP_FAKE_PUSH === '1') { (global.__kgpSent = global.__kgpSent || []).push({ id: d.id, msg }); return true; }
  try {
    await wp().sendNotification(d.sub, JSON.stringify(msg), { TTL: opt.ttl || 6 * 3600, urgency: opt.urgency || 'normal', topic: (msg.tag || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) || undefined });
    return true;
  } catch (e) {
    if (e && (e.statusCode === 404 || e.statusCode === 410)) {
      await db().del(K.ep(epHash(d.sub.endpoint))); d.sub = null; await saveDev(d);
    } else console.warn('push', d.id.slice(0, 6), e && (e.statusCode || e.message));
    return false;
  }
}
/* prosty limit: max n zdarzeń w oknie sek. */
async function limit(id, what, n, sec) {
  const r = db(), k = K.rate(id, what + ':' + Math.floor(Date.now() / 1000 / sec));
  const c = await r.incr(k); if (c === 1) await r.expire(k, sec + 5);
  if (c > n) throw bad('Za dużo prób – spróbuj za chwilę.', 429);
}

module.exports = { db, K, epHash, send, api, bad, isId, clean, newCode, validSub, validTz, getDev, saveDev, delDev, view, hourly, localParts, dailyFor, DAILY, vapidOk, push, limit };

/* /api/relay – zapasowe połączenie „Gra przez internet”, gdy telefony nie mogą połączyć się bezpośrednio (WebRTC).
   POST {r:KOD, to:'h'|'g', m:[...]}  → dopisuje wiadomości do skrzynki odbiorcy
   POST {r:KOD, op:'reset'}           → czyści skrzynki pokoju (host tworzy pokój)
   GET  ?r=KOD&me=h|g&i=N             → wiadomości od pozycji N  ·  GET ?ping=1 → czy relay działa */
const { api, send, db } = require('../lib/kgp');
const KEY = (r, who) => 'kgp:relay:' + r + ':' + who;
const okRoom = r => /^[A-Z0-9]{4,6}$/.test(String(r || ''));
const okWho = w => w === 'h' || w === 'g';
module.exports = api(['GET', 'POST'], async (req, res, b) => {
  const R = db();
  if (req.method === 'GET') {
    const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
    if (q.ping) return send(res, 200, { ok: true });
    if (!okRoom(q.r) || !okWho(q.me)) return send(res, 400, { error: 'Zły pokój' });
    const i = Math.max(0, parseInt(q.i, 10) || 0);
    const arr = await R.lrange(KEY(q.r, q.me), i, -1) || [];
    const m = arr.map(x => { if (typeof x !== 'string') return x; try { return JSON.parse(x); } catch (e) { return null; } }).filter(Boolean);
    return send(res, 200, { m, n: i + arr.length });
  }
  if (!okRoom(b.r)) return send(res, 400, { error: 'Zły pokój' });
  if (b.op === 'reset') { await R.del(KEY(b.r, 'h')); await R.del(KEY(b.r, 'g')); return send(res, 200, { ok: true }); }
  if (!okWho(b.to) || !Array.isArray(b.m) || !b.m.length) return send(res, 400, { error: 'Brak wiadomości' });
  const msgs = b.m.slice(0, 200).map(x => JSON.stringify(x));
  const len = await R.rpush(KEY(b.r, b.to), ...msgs);
  await R.expire(KEY(b.r, b.to), 6 * 3600);
  send(res, 200, { ok: true, n: len });
});

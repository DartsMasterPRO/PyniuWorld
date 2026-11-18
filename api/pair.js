/* POST /api/pair {id, code} – łączy dwa telefony (kod partnera z jego ustawień); {id, unpair:true} – rozłącza */
const { api, send, bad, db, K, isId, getDev, saveDev, view, limit } = require('../lib/kgp');
async function unlink(d) {
  if (!d.pair) return;
  const p = await getDev(d.pair);
  if (p && p.pair === d.id) { p.pair = null; await saveDev(p); }
  d.pair = null;
}
module.exports = api(['POST'], async (req, res, b) => {
  if (!isId(b.id)) throw bad('Nieprawidłowy identyfikator urządzenia.');
  const d = await getDev(b.id);
  if (!d) throw bad('Najpierw włącz przypomnienia na tym telefonie.', 404);
  if (b.unpair) { await unlink(d); await saveDev(d); return send(res, 200, await view(d)); }
  await limit(b.id, 'pair', 12, 600);
  const code = String(b.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 6) throw bad('Kod ma 6 znaków.');
  if (code === d.code) throw bad('To kod tego telefonu 🙂 Wpisz kod z telefonu partnera.');
  const pid = await db().get(K.code(code));
  const p = pid && await getDev(pid);
  if (!p) throw bad('Nie znam takiego kodu 🤔 Sprawdź go w ustawieniach drugiego telefonu.', 404);
  if (d.pair !== p.id) { await unlink(d); await unlink(p); }
  d.pair = p.id; p.pair = d.id;
  await saveDev(p); await saveDev(d);
  send(res, 200, await view(d));
});

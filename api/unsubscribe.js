/* POST /api/unsubscribe {id, forget?} – wyłącza powiadomienia na tym urządzeniu.
   forget:true → usuwa urządzenie całkiem (także połączenie z partnerem i kod). */
const { api, send, bad, db, K, epHash, isId, getDev, saveDev, delDev } = require('../lib/kgp');
module.exports = api(['POST'], async (req, res, b) => {
  if (!isId(b.id)) throw bad('Nieprawidłowy identyfikator urządzenia.');
  const d = await getDev(b.id);
  if (!d) return send(res, 200, { ok: true, gone: true });
  if (b.forget) { await delDev(d); return send(res, 200, { ok: true, gone: true }); }
  if (d.sub) { await db().del(K.ep(epHash(d.sub.endpoint))); d.sub = null; await saveDev(d); }
  send(res, 200, { ok: true });
});

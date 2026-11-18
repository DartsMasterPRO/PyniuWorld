/* GET /api/vapid → publiczny klucz VAPID + czy serwer jest gotowy */
const { api, send, db, vapidOk, hourly } = require('../lib/kgp');
module.exports = api(['GET'], async (req, res) => {
  if (!vapidOk()) return send(res, 503, { error: 'Brak kluczy VAPID w ustawieniach Vercela.' });
  db();   // rzuca 503, gdy nie ma bazy
  send(res, 200, { ok: true, key: process.env.VAPID_PUBLIC_KEY, hourly: hourly() });
});

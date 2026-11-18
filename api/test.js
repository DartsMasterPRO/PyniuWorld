/* POST /api/test {id} – powiadomienie próbne na to samo urządzenie */
const { api, send, bad, isId, getDev, push, limit } = require('../lib/kgp');
module.exports = api(['POST'], async (req, res, b) => {
  if (!isId(b.id)) throw bad('Nieprawidłowy identyfikator urządzenia.');
  const d = await getDev(b.id);
  if (!d || !d.sub) throw bad('Na tym telefonie powiadomienia nie są włączone.', 404);
  await limit(b.id, 'test', 5, 60);
  const ok = await push(d, { title: '🔔 Działa!', body: 'Tak będą wyglądać przypomnienia z Krainy Gier Pyniu 💖', url: './', tag: 'test' }, { ttl: 600, urgency: 'high' });
  if (!ok) throw bad('Nie udało się wysłać – wyłącz i włącz przypomnienia ponownie.', 502);
  send(res, 200, { ok: true });
});

/* POST /api/invite {id, gid, game, code} – powiadomienie dla połączonego partnera:
   „{imię} zaprasza Cię do gry: {gra}! Kod pokoju: XXXX” → klik otwiera #g-<gid>?room=KOD */
const { api, send, bad, isId, clean, getDev, push, limit } = require('../lib/kgp');
module.exports = api(['POST'], async (req, res, b) => {
  if (!isId(b.id)) throw bad('Nieprawidłowy identyfikator urządzenia.');
  const code = String(b.code || '').toUpperCase();
  if (!/^[A-Z0-9]{4,6}$/.test(code)) throw bad('Nieprawidłowy kod pokoju.');
  if (!/^[\w-]{1,30}$/.test(b.gid || '')) throw bad('Nieprawidłowa gra.');
  const d = await getDev(b.id);
  if (!d) throw bad('Najpierw włącz przypomnienia na tym telefonie.', 404);
  await limit(b.id, 'inv', 4, 60); await limit(b.id, 'invd', 60, 86400);
  const p = d.pair && await getDev(d.pair);
  if (!p || p.pair !== d.id) throw bad('Telefony nie są połączone – połącz je w ustawieniach.', 409);
  if (!p.sub || p.rem.invite === false) throw bad('Partner nie ma włączonych powiadomień o zaproszeniach.', 409);
  const name = clean(d.name, 30) || 'Partner', game = clean(b.game, 60) || 'Kraina Gier';
  const ok = await push(p, {
    title: '💌 Zaproszenie do gry', body: `${name} zaprasza Cię do gry: ${game}! Kod pokoju: ${code}`,
    url: `./#g-${b.gid}?room=${code}`, tag: 'invite', renotify: true, requireInteraction: true,
  }, { ttl: 15 * 60, urgency: 'high' });
  if (!ok) throw bad('Nie udało się dostarczyć powiadomienia – partner musi ponownie włączyć przypomnienia.', 502);
  send(res, 200, { ok: true, to: p.name || 'Partner' });
});

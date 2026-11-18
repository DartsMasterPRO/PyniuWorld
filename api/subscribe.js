/* POST /api/subscribe – zapis/aktualizacja urządzenia: subskrypcja push, imię, przypomnienia, godzina, strefa,
   lista wyzwań na najbliższe dni (z telefonu) i to, co dziś już zrobione.
   Body: {id, sub?, name?, rem?:{daily,word,invite}, hour?, tz?, days?:{'2026-11-18':{t,g,gid}}, done?:{daily,word}}
   albo (z service workera po zmianie subskrypcji): {resub:true, oldEndpoint, sub} */
const { api, send, bad, db, K, epHash, isId, clean, newCode, validSub, validTz, getDev, saveDev, view, limit, localParts } = require('../lib/kgp');
const DK = /^\d{4}-\d\d-\d\d$/;
module.exports = api(['POST'], async (req, res, b) => {
  const r = db();
  let id = b.id;
  if (b.resub && typeof b.oldEndpoint === 'string') id = await r.get(K.ep(epHash(b.oldEndpoint)));
  if (!isId(id)) throw bad('Nieprawidłowy identyfikator urządzenia.');
  await limit(id, 'sub', 40, 60);
  let d = await getDev(id);
  if (!d) {
    if (b.resub) throw bad('Nie znam tego urządzenia.', 404);
    let code; for (let i = 0; i < 8; i++) { code = newCode(); if (!(await r.get(K.code(code)))) break; }
    d = { id, code, created: Date.now(), sub: null, pair: null, name: '', rem: { daily: true, word: true, invite: true }, hour: 18, tz: 'Europe/Warsaw', days: {}, done: {}, sent: {} };
    await r.set(K.code(code), id); await r.sadd(K.all, id);
  }
  if ('sub' in b) {
    const s = b.sub ? validSub(b.sub) : null;
    if (b.sub && !s) throw bad('Nieprawidłowa subskrypcja push.');
    if (d.sub && (!s || s.endpoint !== d.sub.endpoint)) await r.del(K.ep(epHash(d.sub.endpoint)));
    d.sub = s; if (s) await r.set(K.ep(epHash(s.endpoint)), id);
  }
  if (b.name != null) d.name = clean(b.name, 30);
  if (b.rem && typeof b.rem === 'object') for (const k of ['daily', 'word', 'invite']) if (typeof b.rem[k] === 'boolean') d.rem[k] = b.rem[k];
  if (Number.isInteger(b.hour) && b.hour >= 6 && b.hour <= 22) d.hour = b.hour;
  if (b.tz) d.tz = validTz(b.tz);
  const today = localParts(d.tz).key;
  if (b.days && typeof b.days === 'object') {
    for (const [k, v] of Object.entries(b.days).slice(0, 31)) if (DK.test(k) && v && typeof v.t === 'string')
      d.days[k] = { t: clean(v.t, 140), g: clean(v.g, 60), gid: /^[\w-]{1,30}$/.test(v.gid || '') ? v.gid : '' };
  }
  for (const k of Object.keys(d.days)) if (k < today && Object.keys(d.days).length > 3) delete d.days[k];   // stare dni precz
  if (b.done && typeof b.done === 'object') for (const k of ['daily', 'word']) if (DK.test(b.done[k] || '')) d.done[k] = b.done[k];
  await saveDev(d);
  send(res, 200, await view(d));
});

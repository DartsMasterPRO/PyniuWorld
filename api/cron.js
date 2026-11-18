/* GET /api/cron – codzienne przypomnienia (Vercel Cron, patrz vercel.json → "crons").
   Vercel wysyła nagłówek Authorization: Bearer $CRON_SECRET.
   Plan Hobby: cron max raz dziennie → wysyłamy wszystkim o tej porze (KGP_CRON_HOURLY nieustawione).
   Przy zewnętrznym cronie co godzinę ustaw KGP_CRON_HOURLY=1 – wtedy liczy się godzina wybrana w aplikacji. */
const { api, send, db, K, getDev, saveDev, push, hourly, localParts, dailyFor } = require('../lib/kgp');
module.exports = api(['GET', 'POST'], async (req, res) => {
  const sec = process.env.CRON_SECRET;
  if (sec && req.headers.authorization !== 'Bearer ' + sec) return send(res, 401, { error: 'Brak dostępu' });
  const ids = await db().smembers(K.all);
  const st = { devices: ids.length, daily: 0, word: 0, skipped: 0, failed: 0 };
  const H = hourly();
  async function one(id) {
    const d = await getDev(id);
    if (!d) { await db().srem(K.all, id); return; }
    if (!d.sub) { st.skipped++; return; }
    const lp = localParts(d.tz || 'Europe/Warsaw');
    if (H && lp.hour < (d.hour || 18)) { st.skipped++; return; }
    d.sent = d.sent || {}; d.done = d.done || {}; let ch = false;
    if (d.rem.daily && d.sent.daily !== lp.key && d.done.daily !== lp.key) {
      const c = (d.days && d.days[lp.key]) || dailyFor(lp.no);
      const ok = await push(d, { title: '⭐ Nowe wyzwanie dnia' + (c.g ? ': ' + c.g : ''), body: c.t + ' · 🎁 +100 XP', url: './?n=daily', tag: 'daily' });
      d.sent.daily = lp.key; ch = true; ok ? st.daily++ : st.failed++;
      if (!d.sub) return;   // subskrypcja wygasła (usunięta w push)
    }
    if (d.rem.word && d.sent.word !== lp.key && d.done.word !== lp.key) {
      const ok = await push(d, { title: '📅 Słowo dnia czeka!', body: `Słowo dnia #${lp.no} – jedna szansa dziennie. Zgadniesz w 4 próbach? 🟩🟨`, url: './?n=word#g-wordle', tag: 'word' });
      d.sent.word = lp.key; ch = true; ok ? st.word++ : st.failed++;
    }
    if (ch && d.sub) await saveDev(d);
  }
  for (let i = 0; i < ids.length; i += 10) await Promise.all(ids.slice(i, i + 10).map(id => one(id).catch(e => { st.failed++; console.warn('cron', e && e.message); })));
  send(res, 200, { ok: true, ...st });
});

/* MFC Quiz — serveur de rappels (Cloudflare Worker, offre gratuite).
   - POST /subscribe   {sub, time:"08:00", tz:"Europe/Paris"}  → enregistre l’abonné
   - POST /unsubscribe {endpoint}                              → le retire
   - Toutes les 15 min (cron), envoie un « push » vide aux abonnés dont c’est l’heure.
   Secrets à définir : VAPID_PUBLIC (clé publique base64url), VAPID_PRIVATE_JWK (JSON), VAPID_SUBJECT (mailto:...).
   KV à lier sous le nom SUBS. */
const CORS = { 'Access-Control-Allow-Origin': 'https://mathisfel83.github.io', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });

async function keyOf(endpoint) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
function localNow(tz) {
  const f = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, mins: (+p.hour % 24) * 60 + +p.minute };
}
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function vapidAuth(env, endpoint) {
  const aud = new URL(endpoint).origin;
  const enc = (o) => b64u(new TextEncoder().encode(JSON.stringify(o)));
  const unsigned = enc({ typ: 'JWT', alg: 'ES256' }) + '.' + enc({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT });
  const key = await crypto.subtle.importKey('jwk', JSON.parse(env.VAPID_PRIVATE_JWK), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned));
  return `vapid t=${unsigned}.${b64u(sig)}, k=${env.VAPID_PUBLIC}`;
}
async function sendPush(env, sub) {
  return fetch(sub.endpoint, { method: 'POST', headers: { Authorization: await vapidAuth(env, sub.endpoint), TTL: '14400', Urgency: 'normal', 'Content-Length': '0' } });
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    if (req.method !== 'POST') return json({ ok: true, service: 'MFC Quiz rappels' });
    let body; try { body = await req.json(); } catch { return json({ error: 'json' }, 400); }
    if (url.pathname === '/subscribe') {
      const sub = body.sub; if (!sub || !sub.endpoint || !/^https:\/\//.test(sub.endpoint)) return json({ error: 'sub' }, 400);
      const time = /^\d{2}:\d{2}$/.test(body.time) ? body.time : '08:00';
      let tz = 'Europe/Paris'; try { new Intl.DateTimeFormat('fr', { timeZone: body.tz }); tz = body.tz || tz; } catch {}
      const k = await keyOf(sub.endpoint), old = await env.SUBS.getWithMetadata(k);
      await env.SUBS.put(k, JSON.stringify(sub), { metadata: { time, tz, last: (old.metadata && old.metadata.last) || '' } });
      return json({ ok: true });
    }
    if (url.pathname === '/unsubscribe' && body.endpoint) { await env.SUBS.delete(await keyOf(body.endpoint)); return json({ ok: true }); }
    return json({ error: 'route' }, 404);
  },
  async scheduled(evt, env, ctx) {
    let cursor;
    do {
      const page = await env.SUBS.list({ cursor });
      for (const k of page.keys) {
        const m = k.metadata || {}; if (!m.time) continue;
        const now = localNow(m.tz || 'Europe/Paris'), [hh, mm] = m.time.split(':').map(Number), t = hh * 60 + mm;
        if (m.last === now.date || now.mins < t || now.mins >= t + 15) continue;
        const sub = JSON.parse(await env.SUBS.get(k.name) || 'null'); if (!sub) continue;
        const r = await sendPush(env, sub);
        if (r.status === 404 || r.status === 410) await env.SUBS.delete(k.name);
        else await env.SUBS.put(k.name, JSON.stringify(sub), { metadata: { ...m, last: now.date } });
      }
      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);
  }
};

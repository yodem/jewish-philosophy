// A stand-in for the Shalom bridge, so e2e runs never reach the real one (and never spend a model turn).
// Started by playwright.config.ts; the site server is pointed at it with SADIK_BRIDGE_URL / SADIK_BRIDGE_TOKEN.
// GET /__last?path=/chat returns the last request seen on that path (headers + JSON body) for assertions.
import { createServer } from 'node:http';
import { FINAL, QUESTION, SHARE_ID } from './fixtures/sadik-answer.mjs';

const PORT = Number(process.env.MOCK_BRIDGE_PORT || 4610);
const TOKEN = 'e2e-bridge-token';
const last = new Map();

const json = (res, status, body) => res.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body));
const sse = (events) => events.map((e) => `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`).join('');

createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/__last') return json(res, 200, last.get(url.searchParams.get('path')) ?? null);
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    let body = null;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      body = { unparsed: raw.slice(0, 200) };
    }
    const path = url.pathname.startsWith('/share/') ? '/share/:id' : url.pathname;
    last.set(path, { method: req.method, path: url.pathname, headers: req.headers, body });
    if (req.headers.authorization !== `Bearer ${TOKEN}`) return json(res, 401, { detail: 'unauthorized' });

    if (req.method === 'POST' && url.pathname === '/chat') {
      if (String(body?.message).includes('QUOTA')) return json(res, 429, { reason: 'anon_daily_quota' });
      if (String(body?.message).includes('RATE')) return json(res, 429, { detail: 'יותר מדי הודעות בדקה. נסו שוב בעוד רגע.' });
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      return res.end(sse([{ event: 'delta', data: { text: 'טיוטה' } }, { event: 'final', data: FINAL }]));
    }
    if (req.method === 'POST' && url.pathname === '/feedback') return json(res, 200, { ok: true });
    if (req.method === 'POST' && url.pathname === '/share') {
      return body?.turn_id === FINAL.turn_id ? json(res, 200, { share_id: SHARE_ID }) : json(res, 404, { detail: 'not found' });
    }
    if (req.method === 'GET' && url.pathname.startsWith('/share/')) {
      if (url.pathname !== `/share/${SHARE_ID}`) return json(res, 404, { detail: 'not found' });
      return json(res, 200, {
        question: QUESTION,
        text: FINAL.text,
        citations: FINAL.citations,
        further_reading: FINAL.further_reading,
        ts: '2026-10-24T10:00:00.000Z',
      });
    }
    if (req.method === 'POST' && url.pathname === '/history/conversations') {
      return json(res, 200, [
        { conversation_id: 'a'.repeat(32), title: QUESTION, last_ts: '2026-10-24T10:00:00.000Z', n_turns: 1 },
        { conversation_id: 'b'.repeat(32), title: 'האם מותר לשנות את ההלכה כשהמציאות משתנה?', last_ts: '2026-10-23T10:00:00.000Z', n_turns: 2 },
      ]);
    }
    if (req.method === 'POST' && url.pathname === '/history/conversation') {
      if (body?.conversation_id !== 'a'.repeat(32)) return json(res, 404, { detail: 'not found' });
      return json(res, 200, [{ turn_id: FINAL.turn_id, ts: '2026-10-24T10:00:00.000Z', question: QUESTION, final: FINAL }]);
    }
    return json(res, 404, { detail: 'not found' });
  });
}).listen(PORT, '127.0.0.1');

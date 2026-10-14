/*
 * dmb-timers – A website for posting demob timers
 * Copyright (C) 2026 Usevalad Buben usevaladbuben@gmail.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// Demobilization timers: zero-dependency Node.js server (multiple persons on one page)
// Month arithmetic uses the server time zone (set TZ in .env, default Europe/Minsk).
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PASS = process.env.ADMIN_PASSWORD;
const DATA_DIR = process.env.DATA_DIR || '/data';
const CFG_FILE = path.join(DATA_DIR, 'config.json');
const SESSION_HOURS = +process.env.SESSION_HOURS || 12;
const MAX_TIMERS = 100;
const MONTHS = { year: 12, half: 6 }; // duration modes; anything else is 'custom'
if (!PASS) { console.error('ADMIN_PASSWORD is not set (see .env)'); process.exit(1); }
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const now = () => new Date();
const rid = () => crypto.randomBytes(4).toString('hex');
function addMonths(d, n) { // calendar months; day is clamped (31 Aug + 6 months = 28/29 Feb)
  const r = new Date(d), day = r.getDate();
  r.setDate(1); r.setMonth(r.getMonth() + n);
  r.setDate(Math.min(day, new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate()));
  return r;
}
const newTimer = (o = {}) => {
  const s = now();
  return { id: rid(), name: '', label: 'Until demobilization', mode: 'year', start: s.toISOString(),
    end: addMonths(s, 12).toISOString(), doneMessage: 'Demobilized. Welcome home!', accent: '#b23a1e', ...o };
};
const defaults = () => ({ pageTitle: 'Demobilization timers', showSeconds: true, showProgress: true, showStatuses: true, timers: [], history: [] });

let cfg = defaults();
try {
  const raw = JSON.parse(fs.readFileSync(CFG_FILE, 'utf8'));
  if (!raw.timers && raw.start) { // migrate single-timer config from the first version
    raw.timers = [{ name: raw.name || 'Timer', label: raw.title, start: raw.start, end: raw.end, doneMessage: raw.doneMessage, accent: raw.accent }];
    for (const k of ['name', 'title', 'start', 'end', 'doneMessage', 'accent']) delete raw[k];
  }
  cfg = { ...cfg, ...raw };
  cfg.timers = cfg.timers.map(t => ({ id: rid(), mode: 'custom', ...t })); // old timers keep their exact end date
} catch {}
const save = () => { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(CFG_FILE, JSON.stringify(cfg, null, 2)); };
save();

const pub = () => ({ page: { pageTitle: cfg.pageTitle, showSeconds: cfg.showSeconds, showProgress: cfg.showProgress, showStatuses: cfg.showStatuses },
  timers: cfg.timers, serverTime: now().toISOString() });
const full = () => ({ ...pub(), history: cfg.history });
const log = msg => { cfg.history = [{ at: now().toISOString(), msg }, ...cfg.history].slice(0, 30); };

const hash = s => crypto.createHash('sha256').update(String(s)).digest();
const sign = v => crypto.createHmac('sha256', SECRET).update(v).digest('hex');
const makeToken = () => { const exp = Date.now() + SESSION_HOURS * 36e5; return exp + '.' + sign('' + exp); };
const validToken = t => {
  const [exp, sig] = String(t || '').split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const cookie = req => Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(c => c[0]));
const authed = req => validToken(cookie(req).session);

const fails = new Map(); // 5 wrong passwords => 1 minute lock per IP
const locked = ip => (fails.get(ip)?.until || 0) > Date.now();
const fail = ip => { const f = fails.get(ip) || { n: 0 }; f.n++; if (f.n >= 5) { f.until = Date.now() + 6e4; f.n = 0; } fails.set(ip, f); };

const json = (res, code, obj, headers = {}) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers }); res.end(JSON.stringify(obj)); };
const body = req => new Promise(r => { let d = ''; req.on('data', c => { d += c; if (d.length > 1e5) req.destroy(); }); req.on('end', () => { try { r(JSON.parse(d || '{}')); } catch { r({}); } }); });
const page = (res, f) => { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(fs.readFileSync(path.join(__dirname, 'public', f))); };

function parseTimer(b, base) {
  const o = { id: base.id };
  for (const k of ['name', 'label', 'doneMessage']) o[k] = typeof b[k] === 'string' ? b[k].trim().slice(0, 200) : base[k];
  if (!o.name) return 'Name is required';
  o.accent = /^#[0-9a-f]{6}$/i.test(b.accent) ? b.accent : base.accent;
  o.mode = ['year', 'half', 'custom'].includes(b.mode) ? b.mode : base.mode;
  const s = new Date(b.start ?? base.start);
  if (isNaN(s)) return 'Invalid start date';
  const e = o.mode === 'custom' ? new Date(b.end ?? base.end) : addMonths(s, MONTHS[o.mode]); // end = start + duration
  if (isNaN(e)) return 'Invalid end date';
  if (e <= s) return 'End date must be after start date';
  o.start = s.toISOString(); o.end = e.toISOString();
  return o;
}

http.createServer(async (req, res) => {
  const url = req.url.split('?')[0], ip = req.socket.remoteAddress, M = req.method;
  try {
    if (M === 'GET' && url === '/') return page(res, 'index.html');
    if (M === 'GET' && url === '/admin') return page(res, 'admin.html');
    if (M === 'GET' && url === '/api/config') return json(res, 200, pub());
    if (M === 'GET' && url === '/healthz') return json(res, 200, { ok: true });

    if (M === 'POST' && url === '/api/login') {
      if (locked(ip)) return json(res, 429, { error: 'Too many attempts. Try again in a minute.' });
      const b = await body(req);
      if (!crypto.timingSafeEqual(hash(b.password), hash(PASS))) { fail(ip); return json(res, 401, { error: 'Wrong password' }); }
      fails.delete(ip);
      return json(res, 200, { ok: true }, { 'Set-Cookie': `session=${makeToken()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}` });
    }
    if (M === 'POST' && url === '/api/logout')
      return json(res, 200, { ok: true }, { 'Set-Cookie': 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });

    if (url.startsWith('/api/admin/')) {
      if (!authed(req)) return json(res, 401, { error: 'Not logged in' });
      if (M === 'GET' && url === '/api/admin/config') return json(res, 200, full());

      if (M === 'PUT' && url === '/api/admin/settings') {
        const b = await body(req);
        if (typeof b.pageTitle === 'string') cfg.pageTitle = b.pageTitle.trim().slice(0, 200);
        for (const k of ['showSeconds', 'showProgress', 'showStatuses']) if (typeof b[k] === 'boolean') cfg[k] = b[k];
        log('Page settings saved'); save(); return json(res, 200, full());
      }
      if (M === 'POST' && url === '/api/admin/timers') {
        if (cfg.timers.length >= MAX_TIMERS) return json(res, 400, { error: 'Timer limit reached' });
        const t = newTimer(), r = parseTimer({ ...t, ...(await body(req)) }, t);
        if (typeof r === 'string') return json(res, 400, { error: r });
        cfg.timers.push(r); log(`Added "${r.name}"`); save(); return json(res, 200, full());
      }
      const m = url.match(/^\/api\/admin\/timers\/(\w+)(\/reset)?$/);
      if (m) {
        const i = cfg.timers.findIndex(t => t.id === m[1]);
        if (i < 0) return json(res, 404, { error: 'Timer not found' });
        const t = cfg.timers[i];
        if (M === 'PUT' && !m[2]) {
          const r = parseTimer(await body(req), t);
          if (typeof r === 'string') return json(res, 400, { error: r });
          cfg.timers[i] = r; log(`Saved "${r.name}"`); save(); return json(res, 200, full());
        }
        if (M === 'DELETE' && !m[2]) { cfg.timers.splice(i, 1); log(`Deleted "${t.name}"`); save(); return json(res, 200, full()); }
        if (M === 'POST' && m[2]) {
          const b = await body(req), dur = new Date(t.end) - new Date(t.start), s = now();
          t.start = s.toISOString();
          if (t.mode !== 'custom') t.end = addMonths(s, MONTHS[t.mode]).toISOString();
          else if (b.keepDuration || new Date(t.end) <= s) t.end = new Date(+s + dur).toISOString();
          log(`Restarted "${t.name}"`); save(); return json(res, 200, full());
        }
      }
    }
    json(res, 404, { error: 'Not found' });
  } catch (e) { console.error(e); json(res, 500, { error: 'Server error' }); }
}).listen(PORT, () => console.log('Listening on :' + PORT));

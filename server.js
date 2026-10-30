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
// Empty label / doneMessage / pageTitle mean "use the localized default" on the client
const newTimer = (o = {}) => {
  const s = now();
  return { id: rid(), name: '', label: '', mode: 'year', start: s.toISOString(),
    end: addMonths(s, 12).toISOString(), doneMessage: '', accent: '#b23a1e', ...o };
};
const defaults = () => ({ pageTitle: '', showBackground: true, showClock: false, showSeconds: true, showProgress: true, showStatuses: true, timers: [], history: [] });
const OLD_DEFAULTS = { label: 'Until demobilization', doneMessage: 'Demobilized. Welcome home!', pageTitle: 'Demobilization timers' };
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

let cfg = defaults();
try {
  const raw = JSON.parse(fs.readFileSync(CFG_FILE, 'utf8'));
  if (!raw.timers && raw.start) { // migrate single-timer config from the first version
    raw.timers = [{ name: raw.name || 'Timer', label: raw.title, start: raw.start, end: raw.end, doneMessage: raw.doneMessage, accent: raw.accent }];
    for (const k of ['name', 'title', 'start', 'end', 'doneMessage', 'accent']) delete raw[k];
  }
  cfg = { ...cfg, ...raw };
  cfg.timers = cfg.timers.map(t => ({ id: rid(), mode: 'custom', ...t })); // old timers keep their exact end date
  // English defaults from older versions become empty, so every visitor sees them in their own language
  if (cfg.pageTitle === OLD_DEFAULTS.pageTitle) cfg.pageTitle = '';
  for (const t of cfg.timers) for (const k of ['label', 'doneMessage']) if (t[k] === OLD_DEFAULTS[k]) t[k] = '';
} catch {}
const save = () => { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(CFG_FILE, JSON.stringify(cfg, null, 2)); };
save();

const pub = () => ({ page: { pageTitle: cfg.pageTitle, showBackground: cfg.showBackground, showClock: cfg.showClock, showSeconds: cfg.showSeconds, showProgress: cfg.showProgress, showStatuses: cfg.showStatuses },
  timers: cfg.timers, serverTime: now().toISOString(), tz: TZ });
const full = () => ({ ...pub(), history: cfg.history });
// History keeps an action code + name, so the admin page can show it in any language
const log = (act, name) => { cfg.history = [{ at: now().toISOString(), act, ...(name !== undefined && { name }) }, ...cfg.history].slice(0, 30); };

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

const fails = new Map(); // 5 wrong passwords => 1 minute lock per IP; kept in memory only
const locked = ip => (fails.get(ip)?.until || 0) > Date.now();
const fail = ip => { const f = fails.get(ip) || { n: 0 }; f.n++; f.at = Date.now(); if (f.n >= 5) { f.until = f.at + 6e4; f.n = 0; } fails.set(ip, f); };
setInterval(() => { // forget IPs a minute after their last failure or lock (see the privacy notice)
  const old = Date.now() - 6e4;
  for (const [ip, f] of fails) if (Math.max(f.at, f.until || 0) < old) fails.delete(ip);
}, 6e4).unref();

const ERRORS = { too_many: 'Too many attempts. Try again in a minute.', wrong_password: 'Wrong password', not_logged_in: 'Not logged in',
  limit: 'Timer limit reached', name_required: 'Name is required', bad_start: 'Invalid start date', bad_end: 'Invalid end date',
  end_before_start: 'End date must be after start date', not_found: 'Not found', timer_not_found: 'Timer not found', server: 'Server error' };
const json = (res, code, obj, headers = {}) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers }); res.end(JSON.stringify(obj)); };
const body = req => new Promise(r => { let d = ''; req.on('data', c => { d += c; if (d.length > 1e5) req.destroy(); }); req.on('end', () => { try { r(JSON.parse(d || '{}')); } catch { r({}); } }); });
const err = (res, status, code) => json(res, status, { code, error: ERRORS[code] });
const FILES = { '/': 'index.html', '/admin': 'admin.html', '/privacy': 'privacy.html', '/i18n.js': 'i18n.js', '/statuses.js': 'statuses.js', '/camo.js': 'camo.js' };
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const read = f => fs.readFileSync(path.join(__dirname, 'public', f), 'utf8');
// Scripts are linked as /i18n.js?v=<hash of their contents>, so a browser holding an old copy fetches the new one after an update
const SCRIPTS = Object.values(FILES).filter(f => f.endsWith('.js'));
const VERSION = crypto.createHash('sha1').update(SCRIPTS.map(read).join('')).digest('hex').slice(0, 10);
const page = (res, f) => {
  let out = read(f);
  if (f.endsWith('.html')) out = out.replace(/src="\/([\w-]+)\.js"/g, `src="/$1.js?v=${VERSION}"`);
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)], 'Cache-Control': 'no-cache' }); res.end(out);
};

function parseTimer(b, base) {
  const o = { id: base.id };
  for (const k of ['name', 'label', 'doneMessage']) o[k] = typeof b[k] === 'string' ? b[k].trim().slice(0, 200) : base[k];
  if (!o.name) return 'name_required';
  o.accent = /^#[0-9a-f]{6}$/i.test(b.accent) ? b.accent : base.accent;
  o.mode = ['year', 'half', 'custom'].includes(b.mode) ? b.mode : base.mode;
  const s = new Date(b.start ?? base.start);
  if (isNaN(s)) return 'bad_start';
  const e = o.mode === 'custom' ? new Date(b.end ?? base.end) : addMonths(s, MONTHS[o.mode]); // end = start + duration
  if (isNaN(e)) return 'bad_end';
  if (e <= s) return 'end_before_start';
  o.start = s.toISOString(); o.end = e.toISOString();
  return o;
}

http.createServer(async (req, res) => {
  const url = req.url.split('?')[0], ip = req.socket.remoteAddress, M = req.method;
  try {
    if (M === 'GET' && FILES[url]) return page(res, FILES[url]);
    if (M === 'GET' && url === '/api/config') return json(res, 200, pub());
    if (M === 'GET' && url === '/healthz') return json(res, 200, { ok: true });

    if (M === 'POST' && url === '/api/login') {
      if (locked(ip)) return err(res, 429, 'too_many');
      const b = await body(req);
      if (!crypto.timingSafeEqual(hash(b.password), hash(PASS))) { fail(ip); return err(res, 401, 'wrong_password'); }
      fails.delete(ip);
      return json(res, 200, { ok: true }, { 'Set-Cookie': `session=${makeToken()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}` });
    }
    if (M === 'POST' && url === '/api/logout')
      return json(res, 200, { ok: true }, { 'Set-Cookie': 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });

    if (url.startsWith('/api/admin/')) {
      if (!authed(req)) return err(res, 401, 'not_logged_in');
      if (M === 'GET' && url === '/api/admin/config') return json(res, 200, full());

      if (M === 'PUT' && url === '/api/admin/settings') {
        const b = await body(req);
        if (typeof b.pageTitle === 'string') cfg.pageTitle = b.pageTitle.trim().slice(0, 200);
        for (const k of ['showBackground', 'showClock', 'showSeconds', 'showProgress', 'showStatuses']) if (typeof b[k] === 'boolean') cfg[k] = b[k];
        log('settings'); save(); return json(res, 200, full());
      }
      if (M === 'POST' && url === '/api/admin/timers') {
        if (cfg.timers.length >= MAX_TIMERS) return err(res, 400, 'limit');
        const t = newTimer(), r = parseTimer({ ...t, ...(await body(req)) }, t);
        if (typeof r === 'string') return err(res, 400, r);
        cfg.timers.push(r); log('added', r.name); save(); return json(res, 200, full());
      }
      const m = url.match(/^\/api\/admin\/timers\/(\w+)(\/reset)?$/);
      if (m) {
        const i = cfg.timers.findIndex(t => t.id === m[1]);
        if (i < 0) return err(res, 404, 'timer_not_found');
        const t = cfg.timers[i];
        if (M === 'PUT' && !m[2]) {
          const r = parseTimer(await body(req), t);
          if (typeof r === 'string') return err(res, 400, r);
          cfg.timers[i] = r; log('saved', r.name); save(); return json(res, 200, full());
        }
        if (M === 'DELETE' && !m[2]) { cfg.timers.splice(i, 1); log('deleted', t.name); save(); return json(res, 200, full()); }
        if (M === 'POST' && m[2]) {
          const b = await body(req), dur = new Date(t.end) - new Date(t.start), s = now();
          t.start = s.toISOString();
          if (t.mode !== 'custom') t.end = addMonths(s, MONTHS[t.mode]).toISOString();
          else if (b.keepDuration || new Date(t.end) <= s) t.end = new Date(+s + dur).toISOString();
          log('restarted', t.name); save(); return json(res, 200, full());
        }
      }
    }
    err(res, 404, 'not_found');
  } catch (e) { console.error(e); err(res, 500, 'server'); }
}).listen(PORT, () => console.log('Listening on :' + PORT));

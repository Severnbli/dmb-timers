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
const http = require('http'), https = require('https'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PASS = process.env.ADMIN_PASSWORD;
const DATA_DIR = process.env.DATA_DIR || '/data';
const CFG_FILE = path.join(DATA_DIR, 'config.json');
const SESSION_HOURS = +process.env.SESSION_HOURS || 12;
const MAX_TIMERS = 100;
const MONTHS = { year: 12, half: 6 }, DAY = 864e5; // duration modes; anything else is 'custom'
if (!PASS) { console.error('ADMIN_PASSWORD is not set (see .env)'); process.exit(1); }
if (PASS.length < 12 || PASS === 'admin_pass') console.warn('Warning: ADMIN_PASSWORD is short or the example one; use 12+ random characters');
// HTTPS: with TLS_CERT and TLS_KEY (PEM file paths) the server speaks HTTPS itself and HTTP_PORT, if set, only redirects to it.
// Without them it speaks plain HTTP and expects a reverse proxy in front to add HTTPS (see the Caddy setup in docker-compose.yml)
const TLS_CERT = process.env.TLS_CERT, TLS_KEY = process.env.TLS_KEY, HTTP_PORT = process.env.HTTP_PORT;
// Behind a reverse proxy every visitor has the proxy's address; TRUST_PROXY=1 takes the client's from X-Forwarded-For
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (SECRET === 'session_secret') console.warn('Warning: SESSION_SECRET is the example one; set a long random string');

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
    end: addMonths(s, 12).toISOString(), doneMessage: '', accent: '#b23a1e', pending: false, ...o };
};
// The fire button: a visitor adds one log per sparkHours (the browser keeps the wait); the count starts over every sparkDays.
// The fire dust grows from dustMin to dustMax sparks (per 1440x900 screen) as the logs reach dustFull
const defaults = () => ({ pageTitle: '', showBackground: true, showClock: false, showSeconds: true, showProgress: true, showStatuses: true,
  phoneCols: 1, counterOn: true, counterMode: 'served', sparkOn: true, sparkHours: 12, sparkDays: 45, dustOn: true, dustMin: 15, dustMax: 120, dustFull: 100,
  sparks: 0, sparksRecord: 0, sparksSince: now().toISOString(), timers: [], history: [] });
const NUMS = { sparkHours: [1, 720], sparkDays: [1, 365], dustMin: [0, 300], dustMax: [0, 300], dustFull: [1, 100000] }; // allowed ranges
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
  for (const k of Object.keys(cfg)) if (k.startsWith('words')) delete cfg[k]; // words of support are gone
  cfg.history = cfg.history.filter(h => h.act !== 'wordsCleared');
  cfg.timers = cfg.timers.map(t => ({ id: rid(), mode: 'custom', ...t })); // old timers keep their exact end date
  // English defaults from older versions become empty, so every visitor sees them in their own language
  cfg.sparksRecord = Math.max(cfg.sparksRecord || 0, cfg.sparks || 0); // the most logs the fire ever had; it outlives the count starting over
  if (cfg.pageTitle === OLD_DEFAULTS.pageTitle) cfg.pageTitle = '';
  for (const t of cfg.timers) for (const k of ['label', 'doneMessage']) if (t[k] === OLD_DEFAULTS[k]) t[k] = '';
} catch {}
const save = () => { // write a copy, then swap it in, so a crash mid-write never leaves a broken file; only the server's user can read it
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CFG_FILE + '.tmp', JSON.stringify(cfg, null, 2), { mode: 0o600 }); fs.renameSync(CFG_FILE + '.tmp', CFG_FILE);
};

const BOOLS = ['showBackground', 'showClock', 'showSeconds', 'showProgress', 'showStatuses', 'counterOn', 'sparkOn', 'dustOn'];
const COUNTER_MODES = ['served', 'left']; // the shared counter: time served by everyone together, or time left for everyone
const PAGE_KEYS = ['pageTitle', ...BOOLS, 'phoneCols', 'counterMode', 'sparkHours', 'dustMin', 'dustMax', 'dustFull'];
// The logs burn out together: every sparkDays since sparksSince the count goes back to zero
const rollover = () => {
  const since = +new Date(cfg.sparksSince), period = cfg.sparkDays * DAY;
  if (isNaN(since) || since > Date.now()) { cfg.sparksSince = now().toISOString(); return true; }
  const n = Math.floor((Date.now() - since) / period);
  if (n < 1) return false;
  cfg.sparks = 0; cfg.sparksSince = new Date(since + n * period).toISOString(); return true;
};
rollover(); save();
setInterval(() => rollover() && save(), 36e5).unref();
// Failed logins are keyed by a salted hash of the IP address, so the address itself is never kept
const SALT = crypto.randomBytes(16);
const ipKey = ip => crypto.createHmac('sha256', SALT).update(String(ip)).digest('base64');
const resetAt = () => new Date(+new Date(cfg.sparksSince) + cfg.sparkDays * DAY).toISOString(); // when the fire burns out and the count starts over
const pub = () => ({ page: Object.fromEntries(PAGE_KEYS.map(k => [k, cfg[k]])), timers: cfg.timers,
  sparks: { count: cfg.sparks, record: cfg.sparksRecord, resetAt: resetAt() }, serverTime: now().toISOString(), tz: TZ });
const full = () => ({ ...pub(), page: { ...pub().page, sparkDays: cfg.sparkDays }, sparks: { count: cfg.sparks, record: cfg.sparksRecord, since: cfg.sparksSince,
  resetAt: resetAt() }, history: cfg.history });
// History keeps an action code + name, so the admin page can show it in any language
const log = (act, name) => { cfg.history = [{ at: now().toISOString(), act, ...(name !== undefined && { name }) }, ...cfg.history].slice(0, 30); };

const hash = s => crypto.createHash('sha256').update(String(s)).digest();
const sign = v => crypto.createHmac('sha256', SECRET).update(v).digest('hex');
// A session is "expiry.id.signature". Logging out puts its id on a revoked list (in memory, until it would expire anyway)
const revoked = new Map(); // session id => expiry
const makeToken = () => { const v = (Date.now() + SESSION_HOURS * 36e5) + '.' + crypto.randomBytes(12).toString('hex'); return v + '.' + sign(v); };
const parseToken = t => {
  const [exp, id, sig] = String(t || '').split('.');
  if (!exp || !id || !sig || +exp < Date.now() || revoked.has(id)) return null;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp + '.' + id));
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? { exp: +exp, id } : null;
};
const validToken = t => !!parseToken(t);
const cookie = req => Object.fromEntries((req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(c => c[0]));
const authed = req => validToken(cookie(req).session);

const fails = new Map(); // 5 wrong passwords => 1 minute lock per IP; keyed by the salted IP hash, kept in memory only
const locked = ip => (fails.get(ipKey(ip))?.until || 0) > Date.now();
const fail = ip => { const k = ipKey(ip), f = fails.get(k) || { n: 0 }; f.n++; f.at = Date.now(); if (f.n >= 5) { f.until = f.at + 6e4; f.n = 0; } fails.set(k, f); };
setInterval(() => { // forget IPs a minute after their last failure or lock (see the privacy notice)
  const old = Date.now() - 6e4;
  for (const [ip, f] of fails) if (Math.max(f.at, f.until || 0) < old) fails.delete(ip);
  for (const [id, exp] of revoked) if (exp < Date.now()) revoked.delete(id);
}, 6e4).unref();

const ERRORS = { too_many: 'Too many attempts. Try again in a minute.', wrong_password: 'Wrong password', not_logged_in: 'Not logged in',
  limit: 'Timer limit reached', name_required: 'Name is required', bad_start: 'Invalid start date', bad_end: 'Invalid end date',
  end_before_start: 'End date must be after start date', not_found: 'Not found', timer_not_found: 'Timer not found', server: 'Server error',
  spark_off: 'The fire is out for now', forbidden: 'Request refused', bad_type: 'Expected JSON' };
const json = (res, code, obj, headers = {}) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers }); res.end(JSON.stringify(obj)); };
const body = req => new Promise(r => { let d = ''; req.on('data', c => { d += c; if (d.length > 1e5) req.destroy(); }); req.on('end', () => { try { r(JSON.parse(d || '{}')); } catch { r({}); } }); });
const err = (res, status, code) => json(res, status, { code, error: ERRORS[code] });
const FILES = { '/': 'index.html', '/admin': 'admin.html', '/privacy': 'privacy.html', '/i18n.js': 'i18n.js', '/statuses.js': 'statuses.js', '/backdrop.js': 'backdrop.js', '/fire.js': 'fire.js', '/share.js': 'share.js' };
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const read = f => fs.readFileSync(path.join(__dirname, 'public', f), 'utf8');
// Scripts are linked as /i18n.js?v=<hash of their contents>, so a browser holding an old copy fetches the new one after an update
const SCRIPTS = Object.values(FILES).filter(f => f.endsWith('.js'));
const VERSION = crypto.createHash('sha1').update(SCRIPTS.map(read).join('')).digest('hex').slice(0, 10);
// Pages get a Content-Security-Policy: scripts only from this server, plus the page's own inline scripts by a one-time nonce
const page = (res, f, req) => {
  let out = read(f);
  const h = { 'Content-Type': TYPES[path.extname(f)], 'Cache-Control': 'no-cache' };
  if (f.endsWith('.html')) {
    const nonce = crypto.randomBytes(16).toString('base64');
    out = out.replace(/src="\/([\w-]+)\.js"/g, `src="/$1.js?v=${VERSION}"`).replace(/<script>/g, `<script nonce="${nonce}">`);
    h['Content-Security-Policy'] = `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; ` +
      `connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'${secure(req) ? '; upgrade-insecure-requests' : ''}`;
  }
  res.writeHead(200, h); res.end(out);
};
// The connection is HTTPS: directly, or at a trusted reverse proxy that says so
const secure = req => !!req.socket.encrypted || (TRUST_PROXY && String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https');
const SAFE_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' };

function parseTimer(b, base) {
  const o = { id: base.id };
  for (const k of ['name', 'label', 'doneMessage']) o[k] = typeof b[k] === 'string' ? b[k].trim().slice(0, 200) : base[k];
  if (!o.name) return 'name_required';
  o.accent = /^#[0-9a-f]{6}$/i.test(b.accent) ? b.accent : base.accent;
  o.pending = typeof b.pending === 'boolean' ? b.pending : !!base.pending; // the start is a call-up notice date, departure not confirmed yet
  o.mode = ['year', 'half', 'custom'].includes(b.mode) ? b.mode : base.mode;
  const s = new Date(b.start ?? base.start);
  if (isNaN(s)) return 'bad_start';
  const e = o.mode === 'custom' ? new Date(b.end ?? base.end) : addMonths(s, MONTHS[o.mode]); // end = start + duration
  if (isNaN(e)) return 'bad_end';
  if (e <= s) return 'end_before_start';
  o.start = s.toISOString(); o.end = e.toISOString();
  return o;
}

async function handle(req, res) {
  const url = req.url.split('?')[0], M = req.method;
  // The last X-Forwarded-For entry is the one our own proxy added; earlier ones come from the client and can be faked
  const ip = (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',').pop().trim()) || req.socket.remoteAddress;
  for (const [k, v] of Object.entries(SAFE_HEADERS)) res.setHeader(k, v);
  if (secure(req)) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  try {
    if ((M === 'GET' || M === 'HEAD') && FILES[url]) return page(res, FILES[url], req);
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    if (M !== 'GET' && M !== 'HEAD') { // other sites must not be able to make changes through a visitor's or admin's browser
      const site = req.headers['sec-fetch-site'];
      if (site && site !== 'same-origin' && site !== 'none') return err(res, 403, 'forbidden');
      if ((url === '/api/login' || url === '/api/logout' || url.startsWith('/api/admin/')) && !/^application\/json\b/i.test(req.headers['content-type'] || ''))
        return err(res, 415, 'bad_type');
    }
    if (M === 'GET' && url === '/api/config') { if (rollover()) save(); return json(res, 200, pub()); }
    if (M === 'GET' && url === '/api/sparks') { if (rollover()) save(); return json(res, 200, pub().sparks); } // polled often, so other visitors' logs show up quickly
    if (M === 'POST' && url === '/api/spark') { // a visitor adds a log to the fire
      if (!cfg.sparkOn) return err(res, 403, 'spark_off');
      if (rollover()) save();
      cfg.sparks++;
      const newRecord = cfg.sparks > cfg.sparksRecord; if (newRecord) cfg.sparksRecord = cfg.sparks;
      save(); return json(res, 200, { count: cfg.sparks, record: cfg.sparksRecord, newRecord });
    }
    if (M === 'GET' && url === '/healthz') return json(res, 200, { ok: true });

    if (M === 'POST' && url === '/api/login') {
      if (locked(ip)) return err(res, 429, 'too_many');
      const b = await body(req);
      if (!crypto.timingSafeEqual(hash(b.password), hash(PASS))) { fail(ip); return err(res, 401, 'wrong_password'); }
      fails.delete(ip);
      return json(res, 200, { ok: true }, { 'Set-Cookie': `session=${makeToken()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}${secure(req) ? '; Secure' : ''}` });
    }
    if (M === 'POST' && url === '/api/logout') {
      const s = parseToken(cookie(req).session); if (s) revoked.set(s.id, s.exp);
      return json(res, 200, { ok: true }, { 'Set-Cookie': `session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure(req) ? '; Secure' : ''}` });
    }

    if (url.startsWith('/api/admin/')) {
      if (!authed(req)) return err(res, 401, 'not_logged_in');
      if (M === 'GET' && url === '/api/admin/config') { if (rollover()) save(); return json(res, 200, full()); }

      if (M === 'PUT' && url === '/api/admin/settings') {
        const b = await body(req);
        if (typeof b.pageTitle === 'string') cfg.pageTitle = b.pageTitle.trim().slice(0, 200);
        for (const k of BOOLS) if (typeof b[k] === 'boolean') cfg[k] = b[k];
        if (COUNTER_MODES.includes(b.counterMode)) cfg.counterMode = b.counterMode;
        if (b.phoneCols === 1 || b.phoneCols === 2) cfg.phoneCols = b.phoneCols; // cards per row on phones
        for (const [k, [lo, hi]] of Object.entries(NUMS)) if (Number.isInteger(b[k]) && b[k] >= lo && b[k] <= hi) cfg[k] = b[k];
        rollover();
        log('settings'); save(); return json(res, 200, full());
      }
      if (M === 'POST' && url === '/api/admin/sparks/reset') { cfg.sparks = 0; cfg.sparksSince = now().toISOString(); log('sparksReset'); save(); return json(res, 200, full()); }
      if (M === 'POST' && url === '/api/admin/timers') {
        if (cfg.timers.length >= MAX_TIMERS) return err(res, 400, 'limit');
        const t = newTimer(), r = parseTimer({ ...t, ...(await body(req)) }, t);
        if (typeof r === 'string') return err(res, 400, r);
        cfg.timers.push(r); log('added', r.name); save(); return json(res, 200, full());
      }
      const m = url.match(/^\/api\/admin\/timers\/(\w+)(\/reset|\/confirm)?$/);
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
        if (M === 'POST' && m[2] === '/confirm') { t.pending = false; log('confirmed', t.name); save(); return json(res, 200, full()); }
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
}

const tls = () => ({ cert: fs.readFileSync(TLS_CERT), key: fs.readFileSync(TLS_KEY) });
const server = TLS_CERT && TLS_KEY ? https.createServer(tls(), handle) : http.createServer(handle);
server.headersTimeout = 1e4; server.requestTimeout = 2e4; // slow clients cannot hold connections open forever
server.listen(PORT, () => console.log(`Listening on :${PORT}${TLS_CERT && TLS_KEY ? ' (HTTPS)' : ''}`));
if (TLS_CERT && TLS_KEY) {
  setInterval(() => { try { server.setSecureContext(tls()); } catch (e) { console.error('TLS reload failed:', e.message); } }, 12 * 36e5).unref(); // picks up renewed certificates
  if (HTTP_PORT) http.createServer((req, res) => { // plain HTTP only sends visitors to the HTTPS address
    const host = String(req.headers.host || '').replace(/:\d+$/, ''); // to the standard HTTPS port 443
    if (!/^[\w.-]+$/.test(host)) { res.writeHead(400); return res.end(); }
    res.writeHead(301, { Location: `https://${host}${req.url}` }); res.end();
  }).listen(HTTP_PORT);
}

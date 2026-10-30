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
const MAX_WORDS = 200, WORD_LEN = 160, AUTHOR_LEN = 40; // words of support kept on disk, the length of one and of its signature
const MONTHS = { year: 12, half: 6 }, DAY = 864e5; // duration modes; anything else is 'custom'
if (!PASS) { console.error('ADMIN_PASSWORD is not set (see .env)'); process.exit(1); }
// Behind a reverse proxy every visitor has the proxy's address; TRUST_PROXY=1 takes the client's from X-Forwarded-For
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
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
    end: addMonths(s, 12).toISOString(), doneMessage: '', accent: '#b23a1e', pending: false, ...o };
};
const defaults = () => ({ pageTitle: '', showBackground: true, showClock: false, showSeconds: true, showProgress: true, showStatuses: true,
  wordsAccept: true, wordsShow: true, wordsPerIp: 3, wordsPerHour: 21, wordsDays: 7, wordsGap: 6, wordsCycle: 2, timers: [], history: [], words: [] });
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

const PAGE_KEYS = ['pageTitle', 'showBackground', 'showClock', 'showSeconds', 'showProgress', 'showStatuses', 'wordsAccept', 'wordsShow', 'wordsPerIp', 'wordsPerHour', 'wordsDays', 'wordsGap', 'wordsCycle'];
// Words older than wordsDays are deleted (0 keeps them forever); checked on every change and once an hour
const expire = () => {
  if (!cfg.wordsDays) return false;
  const from = Date.now() - cfg.wordsDays * DAY, n = cfg.words.length;
  cfg.words = cfg.words.filter(w => +new Date(w.at) > from);
  return cfg.words.length !== n;
};
expire(); save();
setInterval(() => expire() && save(), 36e5).unref();
const pub = () => ({ page: Object.fromEntries(PAGE_KEYS.map(k => [k, cfg[k]])), timers: cfg.timers,
  words: cfg.wordsShow ? cfg.words.map(w => ({ id: w.id, text: w.text, author: w.author || '' })) : [], serverTime: now().toISOString(), tz: TZ });
const full = () => ({ ...pub(), words: cfg.words, history: cfg.history });
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
const sent = new Map(); // IP => times of words of support sent within the last hour; kept in memory only
const recent = list => list.filter(at => at > Date.now() - 36e5);
setInterval(() => { // forget IPs a minute after their last failure or lock, and an hour after their last word (see the privacy notice)
  const old = Date.now() - 6e4;
  for (const [ip, f] of fails) if (Math.max(f.at, f.until || 0) < old) fails.delete(ip);
  for (const [ip, list] of sent) { const r = recent(list); r.length ? sent.set(ip, r) : sent.delete(ip); }
}, 6e4).unref();

const ERRORS = { too_many: 'Too many attempts. Try again in a minute.', wrong_password: 'Wrong password', not_logged_in: 'Not logged in',
  limit: 'Timer limit reached', name_required: 'Name is required', bad_start: 'Invalid start date', bad_end: 'Invalid end date',
  end_before_start: 'End date must be after start date', not_found: 'Not found', timer_not_found: 'Timer not found', server: 'Server error',
  words_off: 'Words of support are closed', words_empty: 'Write something first', words_ip: 'You have sent enough for this hour',
  words_busy: 'Too many words this hour. Try later.' };
const json = (res, code, obj, headers = {}) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers }); res.end(JSON.stringify(obj)); };
const body = req => new Promise(r => { let d = ''; req.on('data', c => { d += c; if (d.length > 1e5) req.destroy(); }); req.on('end', () => { try { r(JSON.parse(d || '{}')); } catch { r({}); } }); });
const err = (res, status, code) => json(res, status, { code, error: ERRORS[code] });
const FILES = { '/': 'index.html', '/admin': 'admin.html', '/privacy': 'privacy.html', '/i18n.js': 'i18n.js', '/statuses.js': 'statuses.js', '/backdrop.js': 'backdrop.js', '/words.js': 'words.js' };
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

http.createServer(async (req, res) => {
  const url = req.url.split('?')[0], M = req.method;
  const ip = (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress;
  try {
    if (M === 'GET' && FILES[url]) return page(res, FILES[url]);
    if (M === 'GET' && url === '/api/config') return json(res, 200, pub());
    if (M === 'GET' && url === '/healthz') return json(res, 200, { ok: true });

    if (M === 'POST' && url === '/api/words') { // a visitor's word of support; limited per IP and for the whole site per hour
      if (!cfg.wordsAccept) return err(res, 403, 'words_off');
      const b = await body(req), text = String(b.text ?? '').replace(/\s+/g, ' ').trim().slice(0, WORD_LEN);
      if (!text) return err(res, 400, 'words_empty');
      const author = String(b.author ?? '').replace(/\s+/g, ' ').trim().slice(0, AUTHOR_LEN);
      const mine = recent(sent.get(ip) || []);
      if (mine.length >= cfg.wordsPerIp) return err(res, 429, 'words_ip');
      if (recent(cfg.words.map(w => +new Date(w.at))).length >= cfg.wordsPerHour) return err(res, 429, 'words_busy');
      sent.set(ip, [...mine, Date.now()]);
      const w = { id: rid(), text, author, at: now().toISOString() };
      cfg.words = [w, ...cfg.words].slice(0, MAX_WORDS); expire(); save();
      return json(res, 200, { id: w.id, text, author });
    }
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
        for (const k of ['showBackground', 'showClock', 'showSeconds', 'showProgress', 'showStatuses', 'wordsAccept', 'wordsShow']) if (typeof b[k] === 'boolean') cfg[k] = b[k];
        for (const k of ['wordsPerIp', 'wordsPerHour', 'wordsDays', 'wordsGap', 'wordsCycle']) if (Number.isInteger(b[k]) && b[k] >= 0 && b[k] <= 1000) cfg[k] = b[k];
        expire();
        log('settings'); save(); return json(res, 200, full());
      }
      if (M === 'POST' && url === '/api/admin/timers') {
        if (cfg.timers.length >= MAX_TIMERS) return err(res, 400, 'limit');
        const t = newTimer(), r = parseTimer({ ...t, ...(await body(req)) }, t);
        if (typeof r === 'string') return err(res, 400, r);
        cfg.timers.push(r); log('added', r.name); save(); return json(res, 200, full());
      }
      if (M === 'DELETE' && url === '/api/admin/words') { cfg.words = []; log('wordsCleared'); save(); return json(res, 200, full()); }
      const w = url.match(/^\/api\/admin\/words\/(\w+)$/);
      if (M === 'DELETE' && w) { cfg.words = cfg.words.filter(x => x.id !== w[1]); save(); return json(res, 200, full()); }
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
}).listen(PORT, () => console.log('Listening on :' + PORT));

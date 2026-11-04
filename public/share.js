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

// A card as a picture to share: everything is drawn on a canvas in the browser, nothing is sent anywhere.
// It copies what the card shows at the moment it is opened (name, number, progress, status, stamp, dates) or its back
// (funny status, time left, comparisons), and the visitor picks the side, the language of the picture, a light or dark look,
// a post (4:5) or story (9:16) size, whether to hide the dates, and whether to show the status and the stats. The picture can be shared, copied or saved.
(() => {
const { t } = I18N;
const PAL = { // the site's own colors, per theme; state accents follow the theme too
  light: { bg: ['#ece8da', '#dcd7c2'], line: 'rgba(74,84,52,.16)', surface: 'rgba(250,248,240,.74)', edge: 'rgba(255,255,255,.75)', ink: '#23261c', mute: '#6a6e5b',
    track: '#dcd7c4', dash: '#cbc6b2', glow: 'rgba(222,170,92,.30)', paper: 'rgba(250,248,240,.6)', solid: '#f8f6ef', hi: 'rgba(255,255,255,.75)', wait: '#4f8a3a', soon: '#c86a14', summons: '#a5761a' },
  dark: { bg: ['#171a12', '#1f2418'], line: 'rgba(196,206,160,.08)', surface: 'rgba(36,40,30,.74)', edge: 'rgba(255,255,255,.09)', ink: '#e9e6d7', mute: '#9b9e88',
    track: '#2a2f23', dash: '#30352a', glow: 'rgba(224,140,64,.12)', paper: 'rgba(36,40,30,.6)', solid: '#1d2117', hi: 'rgba(255,255,255,.08)', wait: '#8fc27a', soon: '#f0a050', summons: '#dcae55' },
};
const SANS = 'system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans",sans-serif';
const STATE = { 'is-wait': 'wait', 'is-soon': 'soon', 'is-summons': 'summons', 'is-notice': 'summons' };

// What the card shows right now, read from the card itself, so the picture always matches the page
function read(c, accent) {
  const q = s => c.querySelector(s), txt = s => q(s)?.textContent.trim() || '', bk = c.querySelector('.back');
  const bq = s => bk?.querySelector(s)?.textContent.replace(/\s+/g, ' ').trim() || '';
  const chip = q('.chip'), unit = q('.unit'), bar = q('.bar'), dates = q('.dates');
  let units = [];
  if (unit) units = q('.count.bare') ? [...unit.children].map(e => e.textContent) : [unit.firstChild?.textContent || '', txt('.unit .clock')].filter(Boolean);
  return { name: txt('h2'), label: txt('.label'), chip: chip.textContent.trim(), state: STATE[[...chip.classList].find(k => STATE[k])] || null,
    accent: accent || getComputedStyle(c).getPropertyValue('--accent').trim() || '#b23a1e',
    big: txt('.count .days'), units, done: txt('.done'), sub: txt('.sub'),
    bar: bar && { pct: +bar.getAttribute('aria-valuenow'), l: txt('.meta span:first-child'), r: txt('.meta span:last-child') },
    dashed: c.matches('.is-summons,.is-notice'), status: c.dataset.status || '', stamp: txt('.stamp'), bigStamp: !!q('.stamp.big'),
    dates: dates && (dates.querySelector('span')?.textContent || dates.textContent).trim(),
    back: bk && { status: bq('.bk-q'), labels: [...bk.querySelectorAll('.bk-l')].map(e => e.textContent.trim()), time: bq('.bk-t'), alt: bq('.bk-alt'),
      items: [...bk.querySelectorAll('.bk-c li')].map(li => { const b = li.querySelector('b')?.textContent || ''; return [b, li.textContent.slice(b.length).trim()]; }) } };
}

function draw(cv, d, o) {
  const W = 1080, H = o.fmt === 'story' ? 1920 : 1350, P = PAL[o.theme], A = d.state ? P[d.state] : d.accent;
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  const rr = (X, Y, w, h, r) => { x.beginPath(); x.roundRect(X, Y, w, h, r); };
  const font = (w, px, f = SANS) => { x.font = `${w} ${px}px ${f}`; };
  const wrap = (text, maxW) => { const lines = []; let l = ''; for (const w of text.split(' ')) { const s = l ? l + ' ' + w : w; if (x.measureText(s).width > maxW && l) { lines.push(l); l = w; } else l = s; } if (l) lines.push(l); return lines; };
  const fit = (text, maxW) => { if (x.measureText(text).width <= maxW) return text; while (text && x.measureText(text + '…').width > maxW) text = text.slice(0, -1); return text + '…'; };
  const alpha = (c, a) => /^#[0-9a-f]{6}$/i.test(c) ? c + Math.round(a * 255).toString(16).padStart(2, '0') : c;
  // background: gradient, a warm glow, contour lines like the site's map, a few sparks
  let g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, P.bg[0]); g.addColorStop(1, P.bg[1]); x.fillStyle = g; x.fillRect(0, 0, W, H);
  g = x.createRadialGradient(W * .88, H * .06, 0, W * .88, H * .06, W * .9); g.addColorStop(0, P.glow); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = P.line; x.lineWidth = 2;
  for (let k = 0; k < 26; k++) { x.beginPath(); for (let i = 0; i <= 60; i++) { const px = i / 60 * W * 1.2 - W * .1, py = k * 1350 / 18 - 135 + Math.sin(i / 9 + k * .7) * 40 + Math.sin(i / 4 + k) * 12 + i * 2.2; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const sparks = (n, big, a) => { for (let i = 0; i < n; i++) { const sx = rnd() * W, sy = rnd() * H, r = (1.5 + rnd() * 3.5) * big;
    g = x.createRadialGradient(sx, sy, 0, sx, sy, r * 3); g.addColorStop(0, 'rgba(255,230,170,.95)'); g.addColorStop(.35, 'rgba(255,140,40,.7)'); g.addColorStop(1, 'rgba(255,90,20,0)');
    x.globalAlpha = a * (.55 + rnd() * .45); x.fillStyle = g; x.beginPath(); x.arc(sx, sy, r * 3, 0, 7); x.fill(); } x.globalAlpha = 1; };
  sparks(46 * H / 1350, 1, 1);
  // page title
  const M = 60, T0 = o.fmt === 'story' ? 365 : 80;
  x.fillStyle = P.ink; x.save(); x.translate(M + 12, T0 + 2); x.rotate(Math.PI / 4); x.fillRect(-11, -11, 22, 22); x.restore();
  x.textBaseline = 'middle'; font(700, 40); x.fillText(fit(o.title, W - 2 * M - 42), M + 42, T0 + 2);
  // the card, laid out like the one on the page: the state chip sits in the middle of its top edge, half above it
  const cx = M, cy = T0 + 100, cw = W - 2 * M, ch = 1060, ix = cx + 56, iw = cw - 112;
  x.save(); x.shadowColor = 'rgba(0,0,0,.22)'; x.shadowBlur = 60; x.shadowOffsetY = 24; rr(cx, cy, cw, ch, 56); x.fillStyle = P.surface; x.fill(); x.restore();
  x.save(); rr(cx, cy, cw, ch, 56); x.clip(); // a soft glow of the state color behind the number, and a sheen along the top
  g = x.createRadialGradient(cx + cw * .3, cy + 380, 0, cx + cw * .3, cy + 380, cw * .75); g.addColorStop(0, A); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.globalAlpha = o.theme === 'dark' ? .1 : .08; x.fillStyle = g; x.fillRect(cx, cy, cw, ch); x.globalAlpha = 1;
  g = x.createLinearGradient(0, cy, 0, cy + 160); g.addColorStop(0, P.hi); g.addColorStop(1, 'rgba(255,255,255,0)'); x.strokeStyle = g; x.lineWidth = 3; rr(cx + 1.5, cy + 1.5, cw - 3, ch - 3, 55); x.stroke(); x.restore();
  rr(cx, cy, cw, ch, 56);
  if (d.bigStamp) { x.strokeStyle = '#e2a93b'; x.lineWidth = 6; } else if (d.dashed) { x.strokeStyle = A; x.lineWidth = 4; x.setLineDash([18, 12]); } else { x.strokeStyle = P.edge; x.lineWidth = 3; }
  x.stroke(); x.setLineDash([]);
  x.textBaseline = 'middle'; font(700, 32); x.letterSpacing = '2px';
  const chip = d.chip.toUpperCase(), chipW = Math.min(cw - 120, x.measureText(chip).width + 72), chipX = W / 2 - chipW / 2;
  x.save(); x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 20; x.shadowOffsetY = 6; rr(chipX, cy - 34, chipW, 68, 34); x.fillStyle = P.solid; x.fill(); x.restore();
  x.fillStyle = A; x.globalAlpha = .14; x.fill(); x.globalAlpha = .3; x.strokeStyle = A; x.lineWidth = 3; x.stroke(); x.globalAlpha = 1;
  x.textAlign = 'center'; x.fillText(fit(chip, chipW - 72), W / 2, cy + 2); x.textAlign = 'left'; x.letterSpacing = '0px';
  const dy = cy + ch - 90; // the dates line
  if (o.side === 'back' && d.back) drawBack(); else drawFront();
  function drawBack() { // the back: name, the funny status as a quote, the time left, and what it compares to
    const b = d.back; let y = cy + 104;
    let ns = 64; font(700, ns); while (ns > 44 && x.measureText(d.name).width > iw) font(700, --ns);
    x.fillStyle = P.ink; x.fillText(fit(d.name, iw), ix, y); y += 60;
    font('italic 500', 48); const sl = b.status && o.status ? wrap(b.status, iw - 40).slice(0, 4) : [];
    const big = o.stats ? 130 : 170; // without the stats the time gets their room, and the rest sits in the middle of the card
    if (!o.stats) { const h = (sl.length ? sl.length * 62 + 60 : 30) + 30 + big * .85, room = dy - 80 - y; y += Math.max(0, (room - h) / 2); }
    if (sl.length) {
      font('italic 500', 48); const lines = sl;
      x.fillStyle = A; rr(ix, y, 8, lines.length * 62 + 10, 4); x.fill();
      x.fillStyle = P.ink; lines.forEach((l, i) => x.fillText(fit(l, iw - 40), ix + 36, y + 36 + i * 62)); y += lines.length * 62 + 60;
    } else y += 30;
    const label = (s) => { x.fillStyle = P.mute; font(700, 32); x.letterSpacing = '3px'; x.fillText(fit(s.toUpperCase(), iw), ix, y); x.letterSpacing = '0px'; };
    label(b.labels[0] || ''); y += 30; x.textBaseline = 'alphabetic';
    let ts = big; font(800, ts); while (ts > 60 && x.measureText(b.time).width > iw) font(800, ts -= 4);
    x.fillStyle = A; x.fillText(b.time, ix, y + ts * .85); y += ts * .85 + 54;
    if (o.stats) { x.fillStyle = P.mute; font(500, 40); x.fillText(fit(b.alt, iw), ix, y); } y += 40; x.textBaseline = 'middle';
    if (b.items.length && o.stats) {
      y += 44; label(b.labels[1] || ''); y += 64;
      for (const [n, s] of b.items) { font(800, 46); const nw = x.measureText(n).width; x.fillStyle = A; x.fillText(n, ix, y);
        font(500, 44); x.fillStyle = P.ink; x.fillText(fit(s, iw - nw - 18), ix + nw + 18, y); y += 64; }
    }
  }
  function drawFront() {
  // name and label, as on the card: the name on one line, the label under it
  let y = cy + 104;
  let ns = 72; font(700, ns); while (ns > 48 && x.measureText(d.name).width > iw) font(700, --ns);
  x.fillStyle = P.ink; x.fillText(fit(d.name, iw), ix, y); y += 64;
  if (d.label) { x.fillStyle = P.mute; font(500, 36); x.fillText(fit(d.label, iw), ix, y); }
  y += 50; x.textBaseline = 'alphabetic';
  if (d.big) { // the number and its unit share the width: the unit is sized to fit, the number shrinks only if the unit would get too small
    let bs = 360, us = 84, bw = 0; const ls = s => { x.letterSpacing = `${-s / 26}px`; };
    for (;;) {
      font(800, bs); ls(bs); bw = x.measureText(d.big).width; x.letterSpacing = '0px';
      font(500, 100); const uw = Math.max(1, ...d.units.map(u => x.measureText(u).width));
      us = Math.min(84, 100 * (iw - bw - 24) / uw); if (us >= 52 || bs <= 140) break; bs -= 20;
    }
    x.fillStyle = A; font(800, bs); ls(bs); x.fillText(d.big, ix - bs / 30, y + bs * .8); x.letterSpacing = '0px';
    x.fillStyle = P.mute; font(500, Math.max(30, us));
    const [u1, u2] = d.units; if (u2) { x.fillText(u1, ix + bw + 24, y + bs * .3); x.fillText(u2, ix + bw + 24, y + bs * .8); } else if (u1) x.fillText(u1, ix + bw + 24, y + bs * .8);
    y += bs * .8 + 30;
  } else if (d.done) { // "Welcome home" or "Not clear yet": as big as three lines allow
    let fs = 150, lines; for (;;) { font(800, fs); lines = wrap(d.done, iw); if ((lines.length <= 3 && lines.every(l => x.measureText(l).width <= iw)) || fs <= 70) break; fs -= 8; }
    x.fillStyle = A; lines.slice(0, 3).forEach((l, i) => x.fillText(l, ix, y + fs * .95 + i * fs * 1.05)); y += fs * .95 + (Math.min(3, lines.length) - 1) * fs * 1.05 + 30;
  }
  if (d.sub) { x.fillStyle = P.mute; font(500, 38); wrap(d.sub, iw).slice(0, 2).forEach(l => { y += 46; x.fillText(l, ix, y); }); y += 16; }
  if (d.bar) { // progress with the halfway mark
    y += 20; rr(ix, y, iw, 26, 13); x.fillStyle = P.track; x.fill();
    const w = Math.max(26, iw * d.bar.pct / 100); g = x.createLinearGradient(ix, 0, ix + w, 0); g.addColorStop(0, alpha(A, .7)); g.addColorStop(1, A); rr(ix, y, w, 26, 13); x.fillStyle = g; x.fill();
    x.fillStyle = P.mute; x.globalAlpha = .5; rr(ix + iw / 2 - 3, y - 8, 6, 42, 3); x.fill(); x.globalAlpha = 1;
    y += 74; font(500, 34); x.fillText(d.bar.l, ix, y); x.textAlign = 'right'; x.fillText(d.bar.r, ix + iw, y); x.textAlign = 'left'; y += 10;
  }
  if (d.status && o.status) { // the funny status as a quote, as long as there is room above the dates
    font(500, 42); let lines = wrap(d.status, iw - 110); const room = Math.floor((dy - 80 - (y + 40) - 50) / 56); lines = lines.slice(0, Math.max(1, Math.min(4, room)));
    y += 40; const sh = lines.length * 56 + 50; rr(ix, y, iw, sh, 22); x.fillStyle = alpha(A, .09); x.fill();
    x.fillStyle = A; font(700, 80, 'Georgia,serif'); x.fillText('“', ix + 22, y + 78);
    x.fillStyle = P.ink; font(500, 42); lines.forEach((l, i) => x.fillText(l, ix + 82, y + 66 + i * 56));
  }
  }
  if (d.dates && !o.hideDates) {
    x.strokeStyle = P.dash; x.lineWidth = 3; x.setLineDash([10, 8]); x.beginPath(); x.moveTo(ix, dy - 40); x.lineTo(ix + iw, dy - 40); x.stroke(); x.setLineDash([]);
    x.fillStyle = P.mute; font(500, 36); x.fillText(d.dates, ix, dy + 8);
  }
  if (d.stamp && o.side !== 'back') { // the milestone stamp, bottom right above the dates
    let fs = d.bigStamp ? 96 : 64; const st = d.stamp.toUpperCase(); x.letterSpacing = '4px';
    for (; fs > 34; fs -= 2) { font(800, fs); if (x.measureText(st).width + 60 <= iw * .68) break; } // long stamps shrink to stay on the card
    const sw = x.measureText(st).width + 60, sh = fs * 1.55;
    x.save(); x.translate(ix + iw - sw / 2 + 6, cy + ch - (d.bigStamp ? 230 : 185)); x.rotate(-12 * Math.PI / 180);
    rr(-sw / 2, -sh / 2, sw, sh, 18); x.fillStyle = P.paper; x.fill(); x.strokeStyle = A; x.lineWidth = 8; x.stroke();
    rr(-sw / 2 + 10, -sh / 2 + 10, sw - 20, sh - 20, 12); x.strokeStyle = alpha(A, .33); x.lineWidth = 3; x.stroke();
    x.fillStyle = A; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(st, 0, 4); x.restore(); x.letterSpacing = '0px';
  }
  // fire dust in front of the card too, as on the page: fewer, a little smaller and fainter, so the text stays readable
  sparks(14 * H / 1350, .8, .8);
  // footer: when the picture was taken
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = P.mute; font(500, 32); x.fillText(o.when, W / 2, cy + ch + 70); x.textAlign = 'left';
}

// The dialog: preview, options, share / copy / save
let dlg, card = null, data = null, name = 'card';
const opts = { theme: null, fmt: 'post', side: 'front', lang: null, hideDates: false, status: true, stats: true };
const canShare = () => { try { return !!navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] }); } catch { return false; } };
const canCopy = () => !!(window.ClipboardItem && navigator.clipboard?.write);
const seg = (k, vs) => `<div class="seg" data-k="${k}">${vs.map(([v, l]) => `<button type="button" data-v="${v}"${l.startsWith('share.') ? ` data-i18n="${l}"` : ` lang="${v.slice(0, 2)}"`}>${l.startsWith('share.') ? '' : l}</button>`).join('')}</div>`;
function build() {
  dlg = document.createElement('dialog'); dlg.className = 'share-dlg';
  dlg.innerHTML = `<div class="sh-head"><b data-i18n="share.title"></b><button type="button" class="theme" data-close>×</button></div>
    <canvas></canvas>
    <div class="sh-opts">${seg('side', [['front', 'share.front'], ['back', 'share.back']])}${seg('lang', Object.entries(I18N.LANGS))}
    ${seg('theme', [['light', 'share.light'], ['dark', 'share.dark']])}${seg('fmt', [['post', 'share.post'], ['story', 'share.story']])}
    <label class="sh-chk" data-c="hideDates"><input type="checkbox"> <span data-i18n="share.hideDates"></span></label>
    <label class="sh-chk" data-c="status"><input type="checkbox" checked> <span data-i18n="share.status"></span></label>
    <label class="sh-chk" data-c="stats"><input type="checkbox" checked> <span data-i18n="share.stats"></span></label></div>
    <div class="sh-act"><button type="button" class="pri" data-act="share" data-i18n="share.share"></button><button type="button" data-act="copy" data-i18n="share.copy"></button><button type="button" data-act="save" data-i18n="share.save"></button></div>`;
  document.body.append(dlg);
  dlg.addEventListener('click', e => {
    if (e.target === dlg || e.target.closest('[data-close]')) return dlg.close();
    const b = e.target.closest('.seg button'); if (b) { opts[b.parentNode.dataset.k] = b.dataset.v; return redraw(); }
    const a = e.target.closest('[data-act]'); if (a) out(a.dataset.act, a);
  });
  dlg.addEventListener('change', e => { const c = e.target.closest('[data-c]'); if (c) { opts[c.dataset.c] = e.target.checked; redraw(); } });
}
function redraw() {
  const l = opts.lang || I18N.lang, live = card.isConnected ? card : document.querySelector(`.card[data-id="${card.dataset.id}"]`) || card;
  card = live;
  // the card in the picture's language: the page draws it again in that language, with the same status and comparisons
  let el = live;
  if (l !== I18N.lang && window.CARDS) { const tpl = document.createElement('template'); tpl.innerHTML = CARDS.html(live.dataset.id, l); el = tpl.content.firstElementChild || live; }
  data = read(el, getComputedStyle(live).getPropertyValue('--accent').trim());
  if (!data.back) opts.side = 'front';
  dlg.querySelector('[data-k="side"]').hidden = !data.back;
  dlg.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', opts[b.parentNode.dataset.k] === b.dataset.v || (b.parentNode.dataset.k === 'lang' && !opts.lang && b.dataset.v === l)));
  dlg.querySelector('[data-c="hideDates"]').hidden = !data.dates;
  dlg.querySelector('[data-c="status"]').hidden = !(opts.side === 'back' ? data.back?.status : data.status);
  dlg.querySelector('[data-c="stats"]').hidden = opts.side !== 'back' || !data.back;
  const title = window.CARDS ? CARDS.title(l) : document.title;
  draw(dlg.querySelector('canvas'), data, { ...opts, title, when: new Date(Date.now() + (window.SHARE_OFFSET || 0)).toLocaleDateString(l, { day: 'numeric', month: 'long', year: 'numeric' }) });
}
function flash(btn, key) { // the button says how it went for a moment
  clearTimeout(btn._t); btn.textContent = t(key); btn._t = setTimeout(() => { btn.textContent = t(btn.dataset.i18n); }, 1800);
}
function out(act, btn) {
  const cv = dlg.querySelector('canvas'), blob = new Promise(ok => cv.toBlob(ok, 'image/png'));
  if (act === 'copy') { // the item is made right away, inside the tap, with the picture still on its way: Safari needs it so
    navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => flash(btn, 'share.copied'), () => flash(btn, 'share.copyFail'));
    return;
  }
  blob.then(b => {
    if (!b) return;
    const file = name + '.png';
    if (act === 'share' && canShare()) return navigator.share({ files: [new File([b], file, { type: 'image/png' })] }).catch(() => {});
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = file; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4e3);
  });
}
function open(c, side = 'front') {
  if (!dlg) build();
  card = c; opts.side = side;
  const n = c.querySelector('h2')?.textContent.trim() || '';
  name = (n.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'card') + '-dmb';
  opts.theme ??= (document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  I18N.apply(dlg); dlg.querySelector('[data-close]').setAttribute('aria-label', t('btn.close'));
  dlg.querySelector('[data-act="share"]').hidden = !canShare();
  dlg.querySelector('[data-act="copy"]').hidden = !canCopy();
  redraw(); dlg.showModal();
}
window.SHARE = { open, draw, read };
})();

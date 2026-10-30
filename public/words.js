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

// Words of support: visitors send them from the header button, and they arrive over the cards the army way:
// with an explosion, a burst of fire, on a tank, by parachute, under a helicopter, after a signal flare or as a radiogram. Particles live on one canvas, words and tanks are elements.
(() => {
const { t } = I18N;
const MAX_ON_SCREEN = 3, HOLD = 6.5, still = matchMedia('(prefers-reduced-motion: reduce)');
let words = [], acts = [], parts = [], holes = [], raf = 0, last = 0, next = 0, layer, cv, ctx, bag = [], by = '', dpr = 1;
// Each word lives in its own box pinned to the page where the screen was when it arrived, so it scrolls away with the page;
// particles and bullet holes remember that spot too. stage and org are the box and spot of the word being drawn right now
let stage, org = { x: 0, y: 0 };
// A cycle shows every word once; the admin sets the pause between words and the shortest cycle, so one word alone still waits the whole cycle
let gap = 6, cycle = 120, cycleAt = -Infinity, cycleEnd = 0, shown = new Set(), lastId = '', lastKind = '';
// Everything scales with the screen: 1 on a 1280×800 laptop, smaller on phones, larger on big monitors
let S = 1;
const scale = () => { S = Math.max(.75, Math.min(1.8, Math.min(innerWidth / 1280, innerHeight / 800) ** .7)); layer?.style.setProperty('--s', S.toFixed(3)); };
const rnd = (a, b) => a + Math.random() * (b - a);
const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const TANK = `<svg viewBox="0 0 160 70" aria-hidden="true"><g class="gun"><rect x="88" y="17" width="64" height="6" rx="2" fill="#3b4428"/><rect x="146" y="15.5" width="9" height="9" rx="2" fill="#2e3520"/></g>
<path d="M52 12h40l10 14H44z" fill="#56633a"/><rect x="58" y="6" width="22" height="7" rx="3" fill="#4a5632"/><path d="M10 28h138l-8 14H18z" fill="#4f5b37"/>
<rect x="6" y="40" width="148" height="22" rx="11" fill="#2b3120"/>${[22, 44, 66, 88, 110, 132].map(x => `<circle class="wh" cx="${x + 2}" cy="51" r="8" fill="#646f4c" stroke="#2b3120" stroke-width="2"/>`).join('')}</svg>`;

function setup() {
  if (layer) return;
  layer = document.createElement('div'); layer.className = 'leaves'; layer.setAttribute('aria-hidden', 'true');
  cv = document.createElement('canvas'); ctx = cv.getContext('2d'); layer.append(cv); document.body.append(layer);
  const size = () => { dpr = devicePixelRatio || 1; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
  size(); scale(); addEventListener('resize', () => { size(); scale(); });
}
const PARA = `<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M4 30C10 6 110 6 116 30c-8-5-16-5-22 0-6-5-16-5-22 0-6-5-18-5-24 0-6-5-16-5-22 0-6-5-14-5-22 0z" fill="#6b7a48" stroke="#4a5632" stroke-width="1.5"/>
<path d="M6 30L48 70M28 30L54 70M50 30L58 70M72 30L64 70M94 30L68 70M114 30L74 70" stroke="#4a5632" stroke-width="1" fill="none"/></svg>`;
const HELI = `<svg viewBox="0 0 170 60" aria-hidden="true"><rect class="rotor" x="10" y="2" width="130" height="4" rx="2" fill="#2b3120" opacity=".8"/><rect x="72" y="5" width="6" height="9" fill="#2b3120"/>
<path d="M40 22c0-6 8-10 20-10h34c16 0 28 8 30 20l-2 8H52c-8 0-12-6-12-12z" fill="#4f5b37"/><path d="M100 16c10 1 18 7 21 15h-21z" fill="#a9c4c9" opacity=".75"/>
<path d="M42 24H8l-4-8h-4l4 14h40z" fill="#4f5b37"/><rect class="tail" x="0" y="10" width="3" height="16" rx="1.5" fill="#2b3120"/>
<path d="M56 46h60M64 40v6M108 40v6" stroke="#2b3120" stroke-width="3" stroke-linecap="round"/></svg>`;
const sign = () => { const b = document.createElement('small'); b.className = 'by'; b.textContent = '– ' + by; return b; };
function plate(text, cls = '') { // the word itself, on a glass plate, signed when the sender gave a name
  const el = document.createElement('span'); el.className = 'leaf ' + cls; el.textContent = text; if (by && text) el.append(sign()); stage.append(el);
  return { el, w: el.offsetWidth, h: el.offsetHeight };
}
const spot = p => [rnd(16, Math.max(16, innerWidth - p.w - 16)), rnd(innerHeight * .15, Math.max(innerHeight * .15, innerHeight * .75 - p.h))];
function shake(power) { // the page jumps a little under a blast
  const m = document.querySelector('main'); if (!m || still.matches) return;
  let n = 0; const go = () => { m.style.transform = n++ < 8 ? `translate(${rnd(-power, power)}px,${rnd(-power, power)}px)` : ''; if (n <= 8) setTimeout(go, 30); }; go();
}
function boom(x, y, k = 1) { // fireball, sparks and smoke
  parts.push({ type: 'ring', x, y, r: 4, life: 1, k });
  parts.push({ type: 'flash', x, y, life: 1, k });
  for (let i = 0; i < 34 * k; i++) { const a = rnd(0, 6.28), v = rnd(120, 420) * k;
    parts.push({ type: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: rnd(.5, 1), r: rnd(1.2, 2.6) }); }
  for (let i = 0; i < 14 * k; i++) { const a = rnd(0, 6.28), v = rnd(20, 90) * k;
    parts.push({ type: 'smoke', x: x + rnd(-10, 10), y: y + rnd(-10, 10), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, life: 1, r: rnd(10, 22) * k, fade: rnd(.35, .6) }); }
}
function dust(x, y) { parts.push({ type: 'smoke', x, y, vx: rnd(-30, -10), vy: rnd(-25, -8), life: 1, r: rnd(5, 10), fade: rnd(.9, 1.4), dust: 1 }); }

// Each act is a little timeline; update() places its elements and returns true when it is over
const ACTS = {
  blast(text) {
    const p = plate(text), [x, y] = spot(p), cx = x + p.w / 2, cy = y + p.h / 2;
    p.el.style.opacity = 0; let fired = false;
    return s => {
      if (!fired && s > .25) { fired = true; boom(cx, cy, 1.2 * S); shake(5 * S); }
      const a = s - .3, pop = a < 0 ? 0 : a < .18 ? ease(a / .18) * 1.15 : 1 + .15 * Math.max(0, 1 - (a - .18) / .2);
      p.el.style.transform = `translate(${x}px,${y}px) scale(${pop.toFixed(3)}) rotate(${(Math.sin(a * 9) * 4 * Math.max(0, 1 - a)).toFixed(2)}deg)`;
      p.el.style.opacity = a < 0 ? 0 : Math.min(1, (HOLD - a) / .6);
      return a > HOLD && (p.el.remove(), true);
    };
  },
  burst(text) { // three shots from the edge of the screen; the word is pinned where they hit
    const p = plate(text), [x, y] = spot(p), left = Math.random() < .5, fromX = left ? -20 : innerWidth + 20, fromY = y + rnd(-120, 120);
    const hits = [0, 1, 2].map(i => [x + p.w * (.2 + .3 * i) + rnd(-8, 8), y + p.h / 2 + rnd(-10, 10)]); let shot = 0;
    p.el.style.opacity = 0;
    return s => {
      while (shot < 3 && s > .2 + shot * .16) {
        const [hx, hy] = hits[shot++];
        parts.push({ type: 'tracer', x0: fromX, y0: fromY + rnd(-6, 6), x1: hx, y1: hy, life: 1 });
        const o = org;
        setTimeout(() => { org = o; for (let i = 0; i < 10; i++) { const a = rnd(0, 6.28), v = rnd(80, 220); parts.push({ type: 'spark', x: hx, y: hy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(.25, .5), r: rnd(1, 2) }); }
          holes.push({ x: hx, y: hy, r: rnd(3, 4.5), until: performance.now() + (HOLD + .6) * 1000, cracks: Array.from({ length: 5 }, () => [rnd(0, 6.28), rnd(6, 13)]) }); tag(); shake(2); }, 70);
      }
      const a = s - .75, k = a < 0 ? 0 : ease(a / .12);
      p.el.style.transform = `translate(${x + (1 - k) * (left ? -30 : 30)}px,${y}px) rotate(${left ? -2 : 2}deg)`;
      p.el.style.opacity = a < 0 ? 0 : Math.min(k, (HOLD - a) / .6);
      return a > HOLD && (p.el.remove(), true);
    };
  },
  tank(text) { // a tank rolls in with the word on board, fires once, waits, and rolls on
    const p = plate(text), el = document.createElement('div'); el.className = 'tank'; el.innerHTML = TANK; stage.append(el);
    const W = Math.min(190 * S, innerWidth * .38), H = W * 70 / 160, gun = el.querySelector('.gun'), wheels = [...el.querySelectorAll('.wh')];
    el.style.width = W + 'px';
    const y = rnd(innerHeight * .45, innerHeight - H - 24), stopX = rnd(16, Math.max(16, innerWidth - Math.max(W, p.w) - 16)), from = -W - p.w, to = innerWidth + 40;
    const IN = Math.max(1.6, (stopX - from) / 380), OUT = Math.max(1.6, (to - stopX) / 380); let fired = false, dustAt = 0;
    return s => {
      let x, moving = true;
      if (s < IN) x = from + (stopX - from) * (1 - Math.pow(1 - s / IN, 2));
      else if (s < IN + HOLD) { x = stopX; moving = false; }
      else x = stopX + (to - stopX) * Math.pow((s - IN - HOLD) / OUT, 2);
      if (!fired && s > IN + .5) { fired = true; boom(x + W * .97, y + H * .28, .55 * S); shake(3 * S); }
      const recoil = fired && s < IN + 1.1 ? Math.max(0, 1 - (s - IN - .5) / .6) * 10 : 0;
      gun.style.transform = `translateX(${-recoil}px)`;
      const bob = moving ? Math.sin(s * 22) * .8 : 0;
      el.style.transform = `translate(${x}px,${y + bob}px)`;
      wheels.forEach(w => w.style.transform = moving ? `rotate(${(x * 3) % 360}deg)` : '');
      if (moving && s - dustAt > .07) { dustAt = s; dust(x + 6, y + H * .9); }
      p.el.style.transform = `translate(${x + W * .3 - p.w / 2 + 20}px,${y - p.h - 6 + bob}px) rotate(-2deg)`;
      p.el.style.opacity = 1;
      return x >= to && (p.el.remove(), el.remove(), true);
    };
  },
  para(text) { // drifts down under a canopy, lands, and the canopy folds away
    const p = plate(text), c = document.createElement('div'); c.className = 'chute'; c.innerHTML = PARA; stage.append(c);
    const W = Math.max(110 * S, Math.min(170 * S, p.w * .9)), H = W * 70 / 120, [x, y] = spot(p), y0 = -p.h - H - 20, FALL = 4.2;
    c.style.width = W + 'px';
    return s => {
      const k = Math.min(1, s / FALL), yy = y0 + (y - y0) * (1 - Math.pow(1 - k, 1.6)), sw = k < 1 ? Math.sin(s * 1.8) * (1 - k * .7) : 0;
      const dx = x + sw * 30, ang = sw * 8, land = Math.max(0, s - FALL);
      p.el.style.transform = `translate(${dx}px,${yy}px) rotate(${ang * .4}deg)`;
      p.el.style.opacity = Math.min(1, (HOLD + FALL - s) / .6);
      c.style.transform = `translate(${dx + p.w / 2 - W / 2}px,${yy - H + 4}px) rotate(${ang}deg) scale(${1 - Math.min(1, land / .8) * .5},${1 - Math.min(1, land / .8) * .9})`;
      c.style.transformOrigin = '50% 100%'; c.style.opacity = Math.max(0, 1 - land / .9);
      return s > FALL + HOLD && (p.el.remove(), c.remove(), true);
    };
  },
  heli(text) { // a helicopter brings the word on a sling, hovers, lowers it a little and flies on
    const p = plate(text), h = document.createElement('div'); h.className = 'heli'; h.innerHTML = HELI; stage.append(h);
    const rope = document.createElement('i'); rope.className = 'rope'; stage.append(rope);
    const W = Math.min(200 * S, innerWidth * .4), H = W * 60 / 170, rotor = h.querySelector('.rotor'), tail = h.querySelector('.tail');
    h.style.width = W + 'px';
    const y = rnd(innerHeight * .08, innerHeight * .3), stopX = rnd(16, Math.max(16, innerWidth - W - 16)), from = innerWidth + 30, to = -W - p.w - 40;
    const IN = Math.max(1.6, (from - stopX) / 420), OUT = Math.max(1.6, (stopX - to) / 420);
    return s => {
      let x, tilt;
      if (s < IN) { const k = s / IN; x = from + (stopX - from) * (1 - Math.pow(1 - k, 2)); tilt = -8 * (1 - k); }
      else if (s < IN + HOLD) { x = stopX + Math.sin((s - IN) * 1.3) * 6; tilt = Math.sin((s - IN) * 1.3) * 1.5; }
      else { const k = (s - IN - HOLD) / OUT; x = stopX + (to - stopX) * k * k; tilt = -10 * Math.min(1, k * 4); }
      const hy = y + Math.sin(s * 2.2) * 4, len = 40 + (s > IN ? Math.min(1, (s - IN) / 1) * 35 : 0) - (s > IN + HOLD ? Math.min(1, (s - IN - HOLD) / .8) * 35 : 0);
      rotor.style.transform = `scaleX(${Math.abs(Math.sin(s * 40)) * .9 + .1})`; tail.style.transform = `scaleY(${Math.abs(Math.cos(s * 50))})`;
      h.style.transform = `translate(${x}px,${hy}px) rotate(${tilt}deg)`;
      const ax = x + W * .5, ay = hy + H * .78, sway = Math.sin(s * 1.6) * 6;
      rope.style.transform = `translate(${ax}px,${ay}px) rotate(${-sway * .6}deg)`; rope.style.height = len + 'px';
      p.el.style.transform = `translate(${ax - p.w / 2 + sway}px,${ay + len}px) rotate(${sway * .3}deg)`;
      p.el.style.opacity = 1;
      return x <= to && (p.el.remove(), h.remove(), rope.remove(), true);
    };
  },
  flare(text) { // a signal flare goes up with a smoke trail, bursts into a green star, and the word glows under it
    const p = plate(text, 'glow'), [x, y] = spot(p), cx = x + p.w / 2, x0 = cx + rnd(-80, 80), y0 = innerHeight + 10, UP = 1.1;
    const col = ['#7dff8a', '#ff5a4a', '#fff27a'][Math.floor(Math.random() * 3)]; let burst = false, trailAt = 0;
    p.el.style.setProperty('--glow', col); p.el.style.opacity = 0;
    return s => {
      if (s < UP) {
        const k = ease(s / UP), fx = x0 + (cx - x0) * k, fy = y0 + (y - 40 - y0) * k;
        if (s - trailAt > .02) { trailAt = s; parts.push({ type: 'smoke', x: fx, y: fy, vx: rnd(-8, 8), vy: rnd(5, 15), life: 1, r: rnd(3, 5), fade: .7 });
          parts.push({ type: 'spark', x: fx, y: fy, vx: rnd(-30, 30), vy: rnd(40, 90), life: .4, r: 1.6 }); }
      } else if (!burst) {
        burst = true; parts.push({ type: 'star', x: cx, y: y - 40, life: 1, col });
        for (let i = 0; i < 26; i++) { const a = rnd(0, 6.28), v = rnd(60, 200); parts.push({ type: 'spark', x: cx, y: y - 40, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(.6, 1), r: rnd(1.2, 2.2), col }); }
      }
      const a = s - UP;
      p.el.style.transform = `translate(${x}px,${y}px) scale(${a < 0 ? .6 : .9 + .1 * ease(a / .3)})`;
      p.el.style.opacity = a < 0 ? 0 : Math.min(1, a / .3, (HOLD - a) / .6);
      return a > HOLD && (p.el.remove(), true);
    };
  },
  radio(text) { // a radiogram types itself out letter by letter, with a blinking cursor
    const p = plate('', 'radio'), [x, y] = spot({ w: Math.min(300 * S, innerWidth * .7), h: 80 * S });
    p.el.innerHTML = `<b>${t('words.radio')}</b><div><span></span><i>▌</i></div>`; if (by) p.el.append(sign());
    const body = p.el.querySelector('span'), cur = p.el.querySelector('i'), TYPE = Math.min(3.5, text.length * .06);
    p.el.style.transform = `translate(${x}px,${y}px) rotate(${rnd(-2, 2)}deg)`;
    return s => {
      body.textContent = text.slice(0, Math.floor(text.length * Math.min(1, Math.max(0, s - .4) / TYPE)));
      cur.style.opacity = Math.floor(s * 2.5) % 2;
      p.el.style.opacity = Math.min(1, s / .3, (HOLD + TYPE - s) / .6);
      return s > HOLD + TYPE && (p.el.remove(), true);
    };
  },
  calm(text) { // reduced motion: the word fades in at a random place and fades out
    const p = plate(text), [x, y] = spot(p); p.el.style.transform = `translate(${x}px,${y}px)`;
    return s => { p.el.style.opacity = Math.max(0, Math.min(1, s / .8, (HOLD - s) / .8)); return s > HOLD && (p.el.remove(), true); };
  },
};
const KINDS = ['blast', 'burst', 'tank', 'para', 'heli', 'flare', 'radio'];
function spawn(text, now, kind, author = '') {
  setup(); by = author;
  if (still.matches) kind = 'calm';
  else if (!ACTS[kind]) { const k = KINDS.filter(x => x !== lastKind); kind = k[Math.floor(Math.random() * k.length)]; } // never the same entrance twice in a row
  lastKind = kind;
  const box = document.createElement('div'), el = document.documentElement; box.className = 'act';
  org = { x: scrollX, y: scrollY }; stage = box; layer.append(box);
  Object.assign(box.style, { left: org.x + 'px', top: org.y + 'px', width: el.clientWidth + 'px', height: el.clientHeight + 'px' });
  acts.push({ born: now, box, org, update: ACTS[kind](text) }); tag();
}
const tag = () => { for (const q of parts) q.org ??= org; for (const h of holes) h.org ??= org; }; // new particles belong to the current word
const at = q => ctx.setTransform(dpr, 0, 0, dpr, (q.org.x - scrollX) * dpr, (q.org.y - scrollY) * dpr);
function draw(dt, now) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
  holes = holes.filter(h => h.until > now);
  for (const h of holes) { // bullet holes with a few cracks
    at(h);
    ctx.strokeStyle = 'rgb(30 30 25/.55)'; ctx.lineWidth = 1; ctx.beginPath();
    for (const [a, l] of h.cracks) { ctx.moveTo(h.x, h.y); ctx.lineTo(h.x + Math.cos(a) * l, h.y + Math.sin(a) * l); } ctx.stroke();
    ctx.fillStyle = '#1b1d16'; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgb(255 255 255/.35)'; ctx.beginPath(); ctx.arc(h.x, h.y, h.r + 1.5, 0, 7); ctx.stroke();
  }
  for (const q of parts) {
    at(q);
    if (q.type === 'spark') { q.vy += (q.col ? 120 : 500) * dt; q.vx *= .98; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt * (q.col ? .8 : 1.4);
      ctx.globalAlpha = Math.max(0, q.life); ctx.fillStyle = q.col || (q.life > .5 ? '#ffd27a' : '#ff7a2a'); ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.fill(); }
    else if (q.type === 'smoke') { q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= .97; q.vy *= .97; q.r += 14 * dt; q.life -= dt * q.fade;
      ctx.globalAlpha = Math.max(0, q.life) * (q.dust ? .25 : .35); ctx.fillStyle = q.dust ? '#9a8a66' : '#4a4a40'; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.fill(); }
    else if (q.type === 'ring') { q.r += 520 * q.k * dt; q.life -= dt * 2.2;
      ctx.globalAlpha = Math.max(0, q.life) * .6; ctx.strokeStyle = '#fff3d6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.stroke(); }
    else if (q.type === 'flash') { q.life -= dt * 3; const r = 70 * q.k * (1.3 - q.life * .3), g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r);
      g.addColorStop(0, 'rgb(255 250 220/1)'); g.addColorStop(.35, 'rgb(255 190 80/.9)'); g.addColorStop(1, 'rgb(255 90 20/0)');
      ctx.globalAlpha = Math.max(0, q.life); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 7); ctx.fill(); }
    else if (q.type === 'star') { q.life -= dt * .35; q.y += 18 * dt; const r = 90 * (.6 + .4 * q.life), g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r);
      g.addColorStop(0, '#ffffff'); g.addColorStop(.12, q.col); g.addColorStop(1, 'rgb(0 0 0/0)');
      ctx.globalAlpha = Math.max(0, q.life) * .85; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 7); ctx.fill(); }
    else if (q.type === 'tracer') { q.life -= dt * 7; const k = 1 - Math.max(0, q.life), hx = q.x0 + (q.x1 - q.x0) * k, hy = q.y0 + (q.y1 - q.y0) * k;
      const tx = q.x0 + (q.x1 - q.x0) * Math.max(0, k - .35), ty = q.y0 + (q.y1 - q.y0) * Math.max(0, k - .35);
      ctx.globalAlpha = .9; ctx.strokeStyle = '#ffcf6a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke(); }
  }
  ctx.globalAlpha = 1;
  parts = parts.filter(q => q.life > 0);
}
const key = w => w.text.toLowerCase();
// Shuffled bag of ids: within one cycle no text shows twice, and the next cycle waits until this one has lasted long enough
function refill(now) {
  const byId = new Map(words.map(w => [w.id, w]));
  bag = bag.filter(id => byId.has(id) && !shown.has(key(byId.get(id))));
  if (!bag.length && now >= cycleEnd) {
    const seen = new Set();
    bag = words.filter(w => !seen.has(key(w)) && seen.add(key(w))).map(w => w.id).sort(() => Math.random() - .5);
    if (bag.length > 1 && bag.at(-1) === lastId) bag.unshift(bag.pop()); // the last word of a cycle does not open the next one
    shown.clear(); cycleAt = now; cycleEnd = now + cycle * 1000 * rnd(1, 1.3); // the cycle lasts at least the set time, sometimes a little longer
  }
  return byId;
}
function pick(now) {
  const byId = refill(now); if (!bag.length) return null;
  const w = byId.get(bag.pop()); shown.add(key(w)); lastId = w.id; next = now + pause(); return w;
}
const pause = () => Math.max(gap, cycle / words.length) * rnd(500, 1600); // spread over the cycle, unevenly
function tick(now) {
  raf = 0;
  const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
  if (words.length && now > next && acts.length < MAX_ON_SCREEN && !document.hidden) {
    const w = pick(now);
    if (w) spawn(w.text, now, null, w.author); else next = cycleEnd;
  }
  acts = acts.filter(a => { stage = a.box; org = a.org; const done = a.update((now - a.born) / 1000); tag(); return !(done && (a.box.remove(), true)); });
  if (cv) draw(dt, now);
  if (words.length || acts.length || parts.length) raf = requestAnimationFrame(tick);
}
const run = () => { if (!raf) raf = requestAnimationFrame(tick); };

function set(list, page = {}) { // the current list and timing from /api/config; new words join the bag without restarting the show
  const known = new Set(words.map(w => w.id)), fresh = list.filter(w => !known.has(w.id)).map(w => w.id);
  if (known.size) bag = bag.concat(fresh);
  gap = Math.max(1, page.wordsGap ?? gap); cycle = (page.wordsCycle ?? cycle / 60) * 60;
  words = list; run();
}

// The header button and its form; the button is hidden while the admin has closed the words
function button(el, open) {
  el.hidden = !open;
  if (el.dataset.ready) return; el.dataset.ready = 1;
  const dlg = document.createElement('dialog');
  dlg.className = 'words';
  dlg.innerHTML = `<form method="dialog"><h2 data-i18n="words.title"></h2><p class="hint" data-i18n="words.hint"></p>
    <textarea name="text" rows="3" maxlength="160" required data-i18n-ph="words.ph"></textarea>
    <input name="author" maxlength="40" autocomplete="nickname" data-i18n-ph="words.author" data-i18n-label="words.author">
    <div class="wrow"><small class="cnt">0 / 160</small><small class="err" role="alert"></small></div>
    <div class="wrow"><button type="button" class="alt" value="cancel" data-i18n="words.cancel"></button><button data-i18n="words.send"></button></div></form>`;
  document.body.append(dlg); I18N.apply(dlg);
  const f = dlg.querySelector('form'), ta = f.elements.text, au = f.elements.author, errEl = dlg.querySelector('.err');
  ta.oninput = () => { dlg.querySelector('.cnt').textContent = `${ta.value.length} / 160`; errEl.textContent = ''; };
  f.querySelector('.alt').onclick = () => dlg.close();
  dlg.onclick = e => { if (e.target === dlg) dlg.close(); }; // a tap outside the form closes it
  f.onsubmit = async e => {
    e.preventDefault();
    if (!ta.value.trim()) { errEl.textContent = t('err.words_empty'); return; }
    try {
      const r = await fetch('/api/words', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: ta.value, author: au.value }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { errEl.textContent = d.code ? t('err.' + d.code) : t('err.request'); return; }
      ta.value = ''; ta.oninput(); dlg.close();
      // your own word arrives right away and takes the next turn: it counts for this cycle (or opens a new one) and the next word waits a full pause
      const now = performance.now(); words = [d, ...words]; refill(now); shown.add(key(d)); lastId = d.id; next = now + pause();
      spawn(d.text, now, null, d.author); run();
    } catch { errEl.textContent = t('err.request'); }
  };
  el.onclick = () => { dlg.showModal(); ta.focus(); };
}

// play() shows one word with a chosen effect, handy for trying them out from the console
window.WORDS = { set, button, play: (text, kind, author) => { spawn(text, performance.now(), kind, author); run(); } };
})();

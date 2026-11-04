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

// Fire dust in front of the cards. Small sparks live all over the page all the time: each one lights up somewhere,
// rides the shared wind (it gusts and eases) with a little sway and flicker, goes out after a few seconds, and a new
// one lights up elsewhere. The sparks belong to the page, not the screen: they scroll with it. They light up around the
// part of the page in view, so a long page (one card per row on a phone) does not get more of them than a short one.
// The fire level (0..1, from the logs visitors add) sets how many there are, how big and hot they burn and how strong the wind is.
// A burst throws a handful of sparks out of one point, as when a log lands in the fire. With reduced motion nothing moves.
(() => {
const still = matchMedia('(prefers-reduced-motion: reduce)'), touch = matchMedia('(pointer: coarse)');
const CSS = `.fire{position:absolute;left:0;top:0;width:100%;pointer-events:none;z-index:3;overflow:hidden;contain:strict}
.fire i{position:absolute;left:0;top:0;width:3px;height:3px;margin:-1.5px;border-radius:50%;will-change:transform,opacity;
 background:radial-gradient(circle,#fff4c8 0,#ffb547 38%,#ff5a1a 68%,transparent 72%);box-shadow:0 0 5px 1px rgb(255 128 40/.55)}
.fire i.hot{width:5px;height:5px;margin:-2.5px;background:radial-gradient(circle,#fff 0,#ffe08a 30%,#ff8a2a 62%,transparent 72%);box-shadow:0 0 10px 2px rgb(255 140 50/.6)}
.fire i.birch{background:radial-gradient(circle,#fff 0,#eaf2ff 34%,#9cc2ff 64%,transparent 72%);box-shadow:0 0 6px 1px rgb(190 215 255/.65)}
.fire i.pine{background:radial-gradient(circle,#ffe2b8 0,#ff7a26 40%,#d4320c 68%,transparent 72%);box-shadow:0 0 7px 1px rgb(255 90 30/.6)}
.fire.lite i{box-shadow:none} /* phones: no glow halo to repaint on every frame of a scroll */
.fire i.gold{background:radial-gradient(circle,#fff 0,#fff1a6 32%,#ffc21a 62%,transparent 72%);box-shadow:0 0 10px 2px rgb(255 200 40/.75)}
`;
const BASE = 1440 * 900; // the admin's spark counts are for a screen this size
const SPAN = 2.2; // screens of page around the one in view where sparks light up
let layer, on = false, level = 0, min = 15, max = 120, target = 0, alive = 0, VW = innerWidth, VH = innerHeight, PH = innerHeight; // PH: page height
const rnd = (a, b) => a + Math.random() * (b - a);
const wind = () => { const t = performance.now() / 1000, k = 1 + level * .6; // px per second
  return [(30 + 26 * Math.sin(t / 9) + 14 * Math.sin(t / 3.1)) * k, -10 + 8 * Math.sin(t / 5.3) - level * 14]; };

function mount() {
  if (layer) return;
  if (!document.getElementById('fire-style')) document.head.insertAdjacentHTML('beforeend', `<style id="fire-style">${CSS}</style>`);
  layer = document.createElement('div'); layer.className = 'fire' + (touch.matches ? ' lite' : ''); layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  // the layer is as tall as the page (absolutely placed, so it does not stretch the page itself)
  new ResizeObserver(() => { const h = Math.max(innerHeight, document.body.offsetHeight); if (h !== PH) { PH = h; retarget(); fill(); } layer.style.height = PH + 'px'; }).observe(document.body);
  PH = Math.max(innerHeight, document.body.offsetHeight); layer.style.height = PH + 'px';
}
function ember(frames, life, delay, hot, done, kind = '') {
  const e = document.createElement('i'); e.className = (hot ? 'hot ' : '') + kind; layer.append(e);
  e.animate(frames, { duration: life, delay, fill: 'both' }).onfinish = () => { e.remove(); done?.(); };
}
function drift(delay) { // one spark of the everyday dust
  alive++;
  const top = Math.max(0, Math.min(PH - SPAN * VH, scrollY - (SPAN - 1) / 2 * VH)); // around the screen in view
  const life = rnd(3.5, 9), [wx, wy] = wind(), x = rnd(-30, VW), y = top + rnd(0, Math.min(PH, SPAN * VH)), sway = rnd(6, 22), up = rnd(5, 30) * (1 + level), ph = rnd(0, 6.3);
  const hot = Math.random() < level * .3, s = rnd(.4, 1) * (1 + level * .7);
  const frames = Array.from({ length: 8 }, (_, i) => { const t = i / 7;
    return { transform: `translate(${(x + wx * life * t + Math.sin(ph + t * 7) * sway).toFixed(1)}px,${(y + (wy - up) * life * t + Math.cos(ph + t * 5) * sway * .6).toFixed(1)}px) scale(${(s * (1 - .45 * t)).toFixed(2)})`,
      opacity: i === 0 || i === 7 ? 0 : +rnd(.35 + level * .3, 1).toFixed(2) }; });
  ember(frames, life * 1000, delay, hot, () => { alive--; fill(); });
}
function fill(spread = 3e3) { // tops the dust up to the target; extra sparks simply burn out without a replacement
  if (!layer || !on || still.matches) return;
  while (alive < target) drift(Math.random() * spread);
}
function retarget() {
  const area = Math.max(.35, Math.min(1.6, VW * VH / BASE)), screens = Math.max(1, Math.min(SPAN, PH / VH)); // as many per screen on any page
  target = on && !still.matches ? Math.min(touch.matches ? 200 : 500, Math.round((min + (max - min) * level) * area * screens)) : 0;
}
// Throws n sparks out of (x, y) in screen pixels, mostly upward, then lets the wind take them; kind colors them (birch, pine, gold)
function burst(x, y, n = 40, power = 1, kind = '') {
  if (still.matches) return;
  mount(); y += scrollY; // into page pixels
  const aim = -Math.PI / 2 + Math.max(-.7, Math.min(.7, (VW / 2 - x) / VW * 1.6)); // up, leaning toward the middle of the screen
  for (let i = 0; i < n; i++) {
    const a = aim + rnd(-1, 1), v = rnd(140, 520) * power, life = rnd(1.2, 2.8), [wx] = wind();
    const vx = Math.cos(a) * v, vy = Math.sin(a) * v, s = rnd(.6, 1.5);
    const frames = Array.from({ length: 10 }, (_, k) => { const t = k / 9 * life, slow = (1 - Math.exp(-2.4 * t)) / 2.4; // drag slows them down
      return { transform: `translate(${(x + vx * slow + wx * .4 * t * t).toFixed(1)}px,${(y + vy * slow - 18 * t * t).toFixed(1)}px) scale(${(s * (1 - .6 * k / 9)).toFixed(2)})`,
        opacity: k === 9 ? 0 : k === 0 ? 1 : +rnd(.5, 1).toFixed(2) }; });
    ember(frames, life * 1000, rnd(0, 120), Math.random() < .5, null, kind);
  }
}
// on: dust shown at all; logs / full: the fire level; lo / hi: sparks per 1440x900 screen with no logs and at full fire
function set({ on: o, logs = 0, full = 100, lo = 15, hi = 120 }) {
  const first = !layer;
  on = !!o; min = lo; max = Math.max(lo, hi);
  level = Math.sqrt(Math.min(1, logs / Math.max(1, full))); // the first logs make the biggest difference
  if (on) mount();
  retarget(); fill(first ? 9e3 : 3e3);
}
let resizing;
addEventListener('resize', () => { clearTimeout(resizing); resizing = setTimeout(() => { VW = innerWidth; VH = innerHeight; retarget(); fill(); }, 150); });
still.addEventListener('change', () => { retarget(); fill(); });

window.FIRE = { set, burst, get level() { return level; } };
})();

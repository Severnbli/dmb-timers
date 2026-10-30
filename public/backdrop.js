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

// A topographic map behind the glass cards: contour lines of made-up hills, every fifth one heavier as on a real map,
// a faint grid of map crosses and a warm glow in one corner, drawn once on a canvas. Over it an SVG layer marks
// trig points on the hilltops with their heights, softly glowing, and planned routes between them: dashes that flow
// along the way and a unit that creeps along it. Now and then a gust lifts a few sparks of fire dust. The terrain is laid out once per page load on a field larger than
// most screens, so resizing only shows more or less of it. Colors follow the current theme; with reduced motion nothing moves.
(() => {
const PAL = {
  light: { bg: ['#ece8da', '#dcd7c2'], line: 'rgb(74 84 52/.2)', index: 'rgb(74 84 52/.36)', grid: 'rgb(74 84 52/.22)', glow: 'rgb(222 170 92/.28)',
    mark: '#4f5a36', text: 'rgb(74 84 52/.75)', shine: '#e2a23c', route: '#b23a1e' },
  dark: { bg: ['#171a12', '#1f2418'], line: 'rgb(196 206 160/.08)', index: 'rgb(196 206 160/.16)', grid: 'rgb(196 206 160/.14)', glow: 'rgb(224 140 64/.09)',
    mark: '#c9d3a6', text: 'rgb(201 211 166/.6)', shine: '#f0b552', route: '#e0663f' },
};
const STEP = 10, LEVEL = .06, GRID = 160; // sampling step and grid spacing in CSS pixels, height between contour lines
const theme = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
let wrap, cv, ctx, svg, hills = [], spots = [], FW = 0, FH = 0, VW = 0, VH = 0;
const still = matchMedia('(prefers-reduced-motion: reduce)');
const CSS = `.backdrop>canvas,.backdrop>svg{position:absolute;left:0;top:0;width:100%;height:100%}
.backdrop .ember{position:absolute;left:0;top:0;width:4px;height:4px;margin:-2px;border-radius:50%;will-change:transform,opacity;
 background:radial-gradient(circle,#fff4c8 0,#ffb547 38%,#ff5a1a 68%,transparent 72%);box-shadow:0 0 6px 2px rgb(255 128 40/.5)}
.backdrop .halo{animation:bd-pulse 4.5s ease-in-out infinite}
.backdrop .route{fill:none;stroke-width:1.6;stroke-linecap:round;stroke-dasharray:7 7;animation:bd-flow 1.8s linear infinite}
@keyframes bd-pulse{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes bd-flow{to{stroke-dashoffset:-14}}
@media (prefers-reduced-motion:reduce){.backdrop *{animation:none!important}}`;
// The canvas is as tall as the screen with the browser bars hidden (100lvh in the CSS), so on phones it does not
// change size, and the picture does not move, when the address bar slides away while scrolling
const box = () => [wrap.clientWidth || innerWidth, wrap.clientHeight || innerHeight];

function layout() { // soft hills and hollows scattered over the whole field
  FW = Math.max(2560, VW); FH = Math.max(1600, VH);
  hills = Array.from({ length: Math.round(FW * FH / 9e4) }, () => ({
    x: Math.random() * FW, y: Math.random() * FH, s: 90 + Math.random() * 260, a: (Math.random() - .35) * 1.4,
  }));
  // places for trig points: the hilltops and a scatter of other spots, highest first
  spots = [...hills.map(h => ({ x: h.x, y: h.y })), ...Array.from({ length: Math.round(FW * FH / 12e3) }, () => ({ x: Math.random() * FW, y: Math.random() * FH }))]
    .map(p => ({ ...p, z: height(p.x, p.y) })).sort((a, b) => b.z - a.z);
}
const height = (x, y) => { let h = 0; for (const p of hills) { const dx = x - p.x, dy = y - p.y; h += p.a * Math.exp(-(dx * dx + dy * dy) / (2 * p.s * p.s)); } return h; };

function contours(ox, oy) { // marching squares over the visible part of the field; returns [thin path, index path]
  const cols = Math.ceil(VW / STEP) + 2, rows = Math.ceil(VH / STEP) + 2, v = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) v[j * cols + i] = height(ox + (i - 1) * STEP, oy + (j - 1) * STEP);
  const thin = new Path2D(), heavy = new Path2D();
  for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
    const a = v[j * cols + i], b = v[j * cols + i + 1], c = v[(j + 1) * cols + i + 1], d = v[(j + 1) * cols + i];
    const lo = Math.ceil(Math.min(a, b, c, d) / LEVEL), hi = Math.floor(Math.max(a, b, c, d) / LEVEL);
    const x = (i - 1) * STEP, y = (j - 1) * STEP;
    for (let k = lo; k <= hi; k++) {
      const L = k * LEVEL, at = (p, q) => (L - p) / (q - p), pts = [];
      if ((a > L) !== (b > L)) pts.push([x + at(a, b) * STEP, y]); // top
      if ((b > L) !== (c > L)) pts.push([x + STEP, y + at(b, c) * STEP]); // right
      if ((d > L) !== (c > L)) pts.push([x + at(d, c) * STEP, y + STEP]); // bottom
      if ((a > L) !== (d > L)) pts.push([x, y + at(a, d) * STEP]); // left
      if (pts.length < 2) continue;
      const path = k % 5 ? thin : heavy;
      // a saddle crosses all four edges; the middle of the cell says which corners belong together
      const pairs = pts.length === 4 ? ((a + b + c + d) / 4 > L) === (a > L) ? [[0, 1], [2, 3]] : [[0, 3], [1, 2]] : [[0, 1]];
      for (const [m, n] of pairs) { path.moveTo(...pts[m]); path.lineTo(...pts[n]); }
    }
  }
  return [thin, heavy];
}
function marks(ox, oy, P) { // trig points on the highest visible hilltops, and routes through them
  const n = Math.max(4, Math.min(7, Math.round(VW * VH / 14e4))), gap = Math.min(170, Math.max(VW, VH) / 4.5), pts = [];
  // the screen is split into about n areas and each gets its highest spot, so the points spread over the whole map
  const cols = Math.max(1, Math.round(Math.sqrt(n * VW / VH))), rows = Math.ceil(n / cols), cw = VW / cols, ch = VH / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const s = spots.find(s => { const x = s.x - ox, y = s.y - oy;
      return x >= Math.max(30, i * cw) && x < Math.min(VW - 80, (i + 1) * cw) && y >= Math.max(80, j * ch) && y < Math.min(VH - 30, (j + 1) * ch)
        && !pts.some(p => Math.hypot(p.x - x, p.y - y) < gap); });
    if (s) pts.push({ x: s.x - ox, y: s.y - oy, h: 140 + s.z * 95 });
  }
  // bends and timings come from the points' places, so a redraw (a theme change) keeps the same routes
  const f = v => v.toFixed(1), hash = (...v) => { const x = Math.sin(v.reduce((s, n, i) => s + n * (12.9898 + i * 37.7), 0)) * 43758.5453; return x - Math.floor(x); };
  const rnd = (a, b, ...seed) => a + hash(...seed) * (b - a);
  const legs = []; // two routes, each through up to three points from left to right, bending a little sideways
  const byX = [...pts].sort((a, b) => a.x - b.x);
  for (const group of [byX.filter((_, i) => i % 2 === 0), byX.filter((_, i) => i % 2 === 1)]) {
    const g = group.slice(0, 3); if (g.length < 2) continue;
    let d = `M${f(g[0].x)} ${f(g[0].y)}`;
    for (let i = 1; i < g.length; i++) {
      const a = g[i - 1], b = g[i], len = Math.hypot(b.x - a.x, b.y - a.y), k = rnd(.15, .3, a.x, b.y) * (hash(b.x, a.y) < .5 ? -1 : 1);
      const cx = (a.x + b.x) / 2 - (b.y - a.y) / len * len * k, cy = (a.y + b.y) / 2 + (b.x - a.x) / len * len * k;
      d += ` Q${f(cx)} ${f(cy)} ${f(b.x)} ${f(b.y - 14)}`; // ends just short of the point, so the arrow does not cover it
    }
    legs.push(d);
  }
  const move = (i, d) => still.matches ? '' : `<g><circle r="9" fill="url(#bd-shine)"/><circle r="2.6" fill="${P.shine}"/>
    <animateMotion dur="${rnd(16, 26, i, VW).toFixed(1)}s" begin="-${rnd(0, 16, i, VH).toFixed(1)}s" repeatCount="indefinite" rotate="auto"><mpath href="#bd-r${i}"/></animateMotion></g>`;
  svg.innerHTML = `<defs><radialGradient id="bd-shine"><stop offset="0" stop-color="${P.shine}" stop-opacity=".9"/><stop offset="1" stop-color="${P.shine}" stop-opacity="0"/></radialGradient>
    <marker id="bd-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1L9 5L0 9z" fill="${P.route}"/></marker></defs>
    ${legs.map((d, i) => `<path id="bd-r${i}" class="route" d="${d}" stroke="${P.route}" stroke-opacity=".6" marker-end="url(#bd-arrow)" style="animation-delay:-${rnd(0, 2, i).toFixed(2)}s"/>${move(i, d)}`).join('')}
    ${pts.map(p => `<g transform="translate(${f(p.x)} ${f(p.y)})">
      <circle class="halo" r="22" fill="url(#bd-shine)" style="animation-delay:-${rnd(0, 4.5, p.x, p.y).toFixed(2)}s"/>
      <path d="M0 -7L6.5 4.5H-6.5Z" fill="none" stroke="${P.mark}" stroke-width="1.4" stroke-linejoin="round"/><circle r="1.6" fill="${P.mark}"/>
      <text x="10" y="-6" fill="${P.text}" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="10.5" letter-spacing=".04em">${p.h.toFixed(1)}</text></g>`).join('')}`;
  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
}
function draw() {
  if (!cv) return;
  const r = Math.min(2, devicePixelRatio || 1), P = PAL[theme()];
  cv.width = Math.ceil(VW * r); cv.height = Math.ceil(VH * r);
  ctx.setTransform(r, 0, 0, r, 0, 0);
  const g = ctx.createLinearGradient(0, 0, VW * .4, VH); g.addColorStop(0, P.bg[0]); g.addColorStop(1, P.bg[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  const glow = ctx.createRadialGradient(VW * .88, VH * .08, 0, VW * .88, VH * .08, Math.max(VW, VH) * .75);
  glow.addColorStop(0, P.glow); glow.addColorStop(1, 'rgb(0 0 0/0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, VW, VH);
  const ox = (FW - VW) / 2, oy = (FH - VH) / 2; // the middle of the field
  const [thin, heavy] = contours(ox, oy);
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.strokeStyle = P.line; ctx.lineWidth = .8; ctx.stroke(thin);
  ctx.strokeStyle = P.index; ctx.lineWidth = 1.4; ctx.stroke(heavy);
  ctx.strokeStyle = P.grid; ctx.lineWidth = 1; ctx.beginPath(); // small crosses where the map grid lines meet
  for (let x = GRID - ox % GRID; x < VW; x += GRID) for (let y = GRID - oy % GRID; y < VH; y += GRID) {
    ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5);
  }
  ctx.stroke();
  marks(ox, oy, P);
}
let dustTimer;
function dust() { // a gust somewhere low on the screen lifts a handful of sparks; they drift up with the wind, sway, flicker and burn out
  clearTimeout(dustTimer); dustTimer = setTimeout(dust, 5e3 + Math.random() * 11e3);
  if (!wrap || still.matches || document.hidden) return;
  const rnd = (a, b) => a + Math.random() * (b - a), x0 = rnd(0, VW), y0 = VH * rnd(.5, 1), wind = rnd(-90, 90), n = Math.round(rnd(6, 16));
  for (let i = 0; i < n; i++) {
    const e = document.createElement('i'); e.className = 'ember'; wrap.append(e);
    const x = x0 + rnd(-70, 70), y = y0 + rnd(-30, 30), up = rnd(150, 460), s = rnd(.5, 1.4), sway = rnd(-35, 35);
    e.animate([
      { transform: `translate(${x}px,${y}px) scale(${s})`, opacity: 0 },
      { transform: `translate(${x + wind * .15 + sway}px,${y - up * .2}px) scale(${s})`, opacity: 1, offset: .12 },
      { transform: `translate(${x + wind * .4 - sway}px,${y - up * .45}px) scale(${s * .9})`, opacity: .45, offset: .35 },
      { transform: `translate(${x + wind * .7 + sway}px,${y - up * .7}px) scale(${s * .7})`, opacity: .9, offset: .6 },
      { transform: `translate(${x + wind}px,${y - up}px) scale(${s * .25})`, opacity: 0 },
    ], { duration: rnd(2600, 6000), delay: rnd(0, 700), easing: 'ease-out', fill: 'both' }).onfinish = () => e.remove();
  }
}
function start() {
  if (wrap) return;
  if (!document.getElementById('bd-style')) document.head.insertAdjacentHTML('beforeend', `<style id="bd-style">${CSS}</style>`);
  wrap = document.createElement('div'); wrap.className = 'backdrop'; wrap.setAttribute('aria-hidden', 'true');
  cv = document.createElement('canvas'); ctx = cv.getContext('2d');
  svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('preserveAspectRatio', 'none');
  wrap.append(cv, svg); document.body.prepend(wrap); dustTimer = setTimeout(dust, 1500 + Math.random() * 4e3);
  [VW, VH] = box();
  if (!hills.length) layout();
  draw();
}
function stop() { clearTimeout(dustTimer); wrap?.remove(); wrap = cv = svg = null; }
function recolor() { // a theme change: the old picture stays on top as a copy and fades out over the new one
  if (!cv) return;
  if (!cv.width || still.matches) return draw();
  const old = document.createElement('div'), copy = document.createElement('canvas'); old.className = 'backdrop';
  copy.width = cv.width; copy.height = cv.height; copy.getContext('2d').drawImage(cv, 0, 0);
  old.append(copy, svg.cloneNode(true)); wrap.after(old); draw();
  old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease' }).onfinish = () => old.remove();
}
let resizing;
addEventListener('resize', () => { clearTimeout(resizing); resizing = setTimeout(() => { // only a real change of the canvas size redraws
  if (!wrap) return; const [w, h] = box(); if (w === VW && h === VH) return;
  VW = w; VH = h; if (VW > FW || VH > FH) layout(); draw();
}, 100); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor);
new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

window.BACKDROP = { start, stop };
})();

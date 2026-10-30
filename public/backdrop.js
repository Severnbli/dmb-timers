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

// A still topographic map behind the glass cards: contour lines of made-up hills, every fifth one heavier as on a real map,
// a faint grid of map crosses and a warm glow in one corner. The terrain is laid out once per page load on a field larger
// than most screens, so resizing only shows more or less of it. Colors follow the current theme; nothing moves.
(() => {
const PAL = {
  light: { bg: ['#ece8da', '#dcd7c2'], line: 'rgb(74 84 52/.2)', index: 'rgb(74 84 52/.36)', grid: 'rgb(74 84 52/.22)', glow: 'rgb(222 170 92/.28)' },
  dark: { bg: ['#171a12', '#1f2418'], line: 'rgb(196 206 160/.08)', index: 'rgb(196 206 160/.16)', grid: 'rgb(196 206 160/.14)', glow: 'rgb(224 140 64/.09)' },
};
const STEP = 10, LEVEL = .06, GRID = 160; // sampling step and grid spacing in CSS pixels, height between contour lines
const theme = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
let cv, ctx, hills = [], FW = 0, FH = 0, VW = 0, VH = 0;
// The canvas is as tall as the screen with the browser bars hidden (100lvh in the CSS), so on phones it does not
// change size, and the picture does not move, when the address bar slides away while scrolling
const box = () => [cv.clientWidth || innerWidth, cv.clientHeight || innerHeight];

function layout() { // soft hills and hollows scattered over the whole field
  FW = Math.max(2560, VW); FH = Math.max(1600, VH);
  hills = Array.from({ length: Math.round(FW * FH / 9e4) }, () => ({
    x: Math.random() * FW, y: Math.random() * FH, s: 90 + Math.random() * 260, a: (Math.random() - .35) * 1.4,
  }));
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
}
function start() {
  if (cv) return;
  cv = document.createElement('canvas'); cv.className = 'backdrop'; cv.setAttribute('aria-hidden', 'true');
  ctx = cv.getContext('2d'); document.body.prepend(cv);
  [VW, VH] = box();
  if (!hills.length) layout();
  draw();
}
function stop() { cv?.remove(); cv = null; }
function recolor() { // a theme change: the old picture stays on top as a copy and fades out over the new one
  if (!cv) return;
  if (!cv.width || matchMedia('(prefers-reduced-motion: reduce)').matches) return draw();
  const old = document.createElement('canvas'); old.className = 'backdrop'; old.width = cv.width; old.height = cv.height;
  old.getContext('2d').drawImage(cv, 0, 0); cv.after(old); draw();
  old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease' }).onfinish = () => old.remove();
}
let resizing;
addEventListener('resize', () => { clearTimeout(resizing); resizing = setTimeout(() => { // only a real change of the canvas size redraws
  if (!cv) return; const [w, h] = box(); if (w === VW && h === VH) return;
  VW = w; VH = h; if (VW > FW || VH > FH) layout(); draw();
}, 100); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', recolor);
new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

window.BACKDROP = { start, stop };
})();

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

// Still woodland camouflage behind the glass cards: layers of ragged patches from large to small, a fine grain and a soft vignette.
// The pattern is laid out once per page load on a field larger than most screens, so resizing only shows more or less of it.
// Colors follow the current theme. Nothing moves, so it costs nothing after the first paint.
(() => {
const PAL = { // base, then the layers from the largest patches to the smallest specks
  light: ['#c9c3a4', '#a9a77e', '#8c9466', '#b49f74', '#6f7a4f', '#d8d2b6'],
  dark: ['#181d12', '#2c3521', '#3d4831', '#48422c', '#27301f', '#11150c'],
};
// Patch radius range in CSS pixels and how densely each layer covers the field
const LAYERS = [{ r: [110, 230], k: .55 }, { r: [60, 130], k: .5 }, { r: [35, 75], k: .45 }, { r: [18, 40], k: .4 }, { r: [5, 13], k: .12 }];
const RES = .5; // canvas pixels per CSS pixel; the CSS scales it up a little softly
const theme = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
let cv, ctx, patches = [], FW = 0, FH = 0, VW = 0, VH = 0;
// The canvas is as tall as the screen with the browser bars hidden (100lvh in the CSS), so on phones it does not
// change size, and the picture does not move, when the address bar slides away while scrolling
const box = () => [cv.clientWidth || innerWidth, cv.clientHeight || innerHeight];

function layout() { // ragged patches over the whole field, stretched sideways like woodland camo
  FW = Math.max(2560, VW); FH = Math.max(1600, VH); patches = [];
  LAYERS.forEach((L, li) => {
    const avg = (L.r[0] + L.r[1]) / 2, n = Math.round(FW * FH * L.k / (Math.PI * avg * avg * 1.3));
    for (let i = 0; i < n; i++) {
      const R = L.r[0] + Math.random() * (L.r[1] - L.r[0]), m = 9 + Math.floor(Math.random() * 5);
      patches.push({ li, x: Math.random() * FW, y: Math.random() * FH, R, sx: 1.2 + Math.random() * .6, rot: (Math.random() - .5) * .9,
        pts: Array.from({ length: m }, () => .55 + Math.random() * .6) });
    }
  });
}
function grain(w, h) { // a small tile of fine noise, laid over everything
  const g = document.createElement('canvas'); g.width = w; g.height = h;
  const c = g.getContext('2d'), img = c.createImageData(w, h);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 18; }
  c.putImageData(img, 0, 0); return g;
}
function draw() {
  if (!cv) return;
  const W = Math.ceil(VW * RES), H = Math.ceil(VH * RES), pal = PAL[theme()], dark = theme() === 'dark';
  cv.width = W; cv.height = H;
  ctx.setTransform(RES, 0, 0, RES, 0, 0);
  ctx.fillStyle = pal[0]; ctx.fillRect(0, 0, VW, VH);
  const ox = (FW - VW) / 2, oy = (FH - VH) / 2; // the middle of the field
  for (const p of patches) {
    const x = p.x - ox, y = p.y - oy, reach = p.R * 2;
    if (x < -reach || y < -reach || x > VW + reach || y > VH + reach) continue;
    const n = p.pts.length, cos = Math.cos(p.rot), sin = Math.sin(p.rot);
    const pt = p.pts.map((k, i) => { const a = i / n * Math.PI * 2, px = Math.cos(a) * p.R * k * p.sx, py = Math.sin(a) * p.R * k * .8;
      return [x + px * cos - py * sin, y + px * sin + py * cos]; });
    const mid = i => { const a = pt[i % n], b = pt[(i + 1) % n]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    ctx.fillStyle = pal[p.li + 1]; ctx.beginPath(); ctx.moveTo(...mid(0));
    for (let i = 1; i <= n; i++) ctx.quadraticCurveTo(...pt[i % n], ...mid(i)); // a smooth closed curve through the midpoints
    ctx.fill();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = ctx.createPattern(grain(128, 128), 'repeat'); ctx.fillRect(0, 0, W, H);
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .25, W / 2, H / 2, Math.hypot(W, H) * .6);
  v.addColorStop(0, 'rgb(0 0 0/0)'); v.addColorStop(1, dark ? 'rgb(0 0 0/.45)' : 'rgb(60 52 30/.22)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function start() {
  if (cv) return;
  cv = document.createElement('canvas'); cv.className = 'camo'; cv.setAttribute('aria-hidden', 'true');
  ctx = cv.getContext('2d'); document.body.prepend(cv);
  [VW, VH] = box();
  if (!patches.length) layout();
  draw();
}
function stop() { cv?.remove(); cv = null; }
function recolor() { // a theme change: the old picture stays on top as a copy and fades out over the new one
  if (!cv) return;
  if (!cv.width || matchMedia('(prefers-reduced-motion: reduce)').matches) return draw();
  const old = document.createElement('canvas'); old.className = 'camo'; old.width = cv.width; old.height = cv.height;
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

window.CAMO = { start, stop };
})();

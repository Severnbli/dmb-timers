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

// Living camouflage background: soft blobs that wander, turn and change shape behind the glass cards.
// Drawn on a small canvas and scaled up, so the blur is nearly free. Colors follow the current theme.
(() => {
const PAL = {
  light: ['#c9c3a4', '#a9a77e', '#8c9466', '#b49f74', '#6f7a4f', '#d8d2b6'],
  dark: ['#181d12', '#2c3521', '#3d4831', '#48422c', '#27301f', '#11150c'],
};
const SCALE = 1 / 5, FPS = 60; // the CSS blur is light, so the canvas needs more pixels than it used to
const still = matchMedia('(prefers-reduced-motion: reduce)');
const theme = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
let cv, ctx, blobs = [], raf = 0, last = 0, W = 0, H = 0;

function size() {
  W = Math.ceil(innerWidth * SCALE); H = Math.ceil(innerHeight * SCALE);
  cv.width = W; cv.height = H;
}
function seed() { // enough blobs to cover the screen several times over, in every color of the palette
  const n = 26, pal = PAL[theme()];
  blobs = Array.from({ length: n }, (_, i) => ({
    x: Math.random(), y: Math.random(), r: .08 + Math.random() * .12, col: pal[i % pal.length],
    dir: Math.random() * 7, speed: .006 + Math.random() * .01, ph: Math.random() * 7,
    pts: Array.from({ length: 7 }, () => .7 + Math.random() * .5), // lumpy outline
  }));
}
function recolor() { const pal = PAL[theme()]; blobs.forEach((b, i) => b.col = pal[i % pal.length]); draw(performance.now()); }
function draw(t) {
  const s = t / 1000, m = Math.max(W, H);
  ctx.fillStyle = PAL[theme()][0]; ctx.fillRect(0, 0, W, H);
  for (const b of blobs) {
    const R = b.r * m, cx = b.x * W, cy = b.y * H, n = b.pts.length;
    const p = b.pts.map((k, i) => { // wobbling outline points; the shape turns slowly with its heading
      const a = i / n * Math.PI * 2 + b.dir * .3, rr = R * k * (1 + .18 * Math.sin(s * .4 + b.ph + i * 1.7));
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .75];
    });
    const mid = i => { const a = p[i % n], c = p[(i + 1) % n]; return [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]; };
    ctx.fillStyle = b.col; ctx.beginPath(); ctx.moveTo(...mid(0));
    for (let i = 1; i <= n; i++) ctx.quadraticCurveTo(...p[i % n], ...mid(i)); // smooth closed curve through the midpoints
    ctx.fill();
  }
}
function step(t) {
  raf = requestAnimationFrame(step);
  // a little slack, so frames that arrive a hair early are not skipped: skipping makes the motion jerk (33 ms, then 50 ms)
  if (t - last < 1000 / FPS - 4) return;
  const dt = Math.min(.1, (t - last) / 1000); last = t;
  for (const b of blobs) { // a slow random walk that wraps around the edges
    b.dir += Math.sin(t / 4000 + b.ph) * .4 * dt + (Math.random() - .5) * .3 * dt;
    b.x += Math.cos(b.dir) * b.speed * dt; b.y += Math.sin(b.dir) * b.speed * dt;
    const pad = b.r * 1.4;
    if (b.x < -pad) b.x = 1 + pad; if (b.x > 1 + pad) b.x = -pad;
    if (b.y < -pad) b.y = 1 + pad; if (b.y > 1 + pad) b.y = -pad;
  }
  draw(t);
}
function play() { cancelAnimationFrame(raf); raf = 0; if (!cv) return; draw(performance.now()); if (!still.matches) raf = requestAnimationFrame(step); }
function start() {
  if (cv) return;
  cv = document.createElement('canvas'); cv.className = 'camo'; cv.setAttribute('aria-hidden', 'true');
  ctx = cv.getContext('2d'); document.body.prepend(cv);
  size(); seed(); play();
}
function stop() { cancelAnimationFrame(raf); raf = 0; cv?.remove(); cv = null; }
addEventListener('resize', () => { if (cv) { size(); draw(performance.now()); } });
still.addEventListener('change', play);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => cv && recolor());
new MutationObserver(() => cv && recolor()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

window.CAMO = { start, stop };
})();

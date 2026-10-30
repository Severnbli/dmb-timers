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

// Words of support: visitors send them from the header button, and they drift down over the cards like leaves.
(() => {
const { t } = I18N;
const MAX_ON_SCREEN = 5, still = matchMedia('(prefers-reduced-motion: reduce)');
let words = [], leaves = [], raf = 0, last = 0, next = 0, layer, bag = [];

// Each leaf falls slowly and sways on two sine waves, so the path never looks mechanical; it tilts with the sway
function spawn(text, now) {
  if (!layer) { layer = document.createElement('div'); layer.className = 'leaves'; layer.setAttribute('aria-hidden', 'true'); document.body.append(layer); }
  const el = document.createElement('span');
  el.className = 'leaf'; el.textContent = text; layer.append(el);
  const w = el.offsetWidth, h = el.offsetHeight;
  leaves.push({ el, h, x: Math.random() * Math.max(0, innerWidth - w - 24) + 12, y: -h - 10, born: now,
    vy: 22 + Math.random() * 16, // px per second
    a1: 26 + Math.random() * 30, f1: .07 + Math.random() * .05, a2: 8 + Math.random() * 10, f2: .23 + Math.random() * .1, ph: Math.random() * 7,
    still: still.matches, life: 9 + Math.random() * 3 });
}
function pick() { // shuffled bag, so every word shows up before any repeats
  if (!bag.length) bag = words.map(w => w.text).sort(() => Math.random() - .5);
  return bag.pop();
}
function tick(now) {
  raf = 0;
  const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
  if (words.length && now > next && leaves.length < MAX_ON_SCREEN && !document.hidden) {
    spawn(pick(), now); next = now + 3500 + Math.random() * 3500;
  }
  for (const l of leaves) {
    const s = (now - l.born) / 1000;
    if (l.still) { // reduced motion: fade in at a random place and fade out, no movement
      if (s < .1) l.y = Math.random() * (innerHeight - l.h - 40) + 20;
      l.el.style.transform = `translate(${l.x}px,${l.y}px)`;
      l.el.style.opacity = Math.max(0, Math.min(1, s / .8, (l.life - s) / .8));
      l.done = s > l.life; continue;
    }
    l.y += l.vy * dt;
    const sway = Math.sin(s * l.f1 * 6.283 + l.ph), x = l.x + sway * l.a1 + Math.sin(s * l.f2 * 6.283 + l.ph * 2) * l.a2;
    const rot = Math.cos(s * l.f1 * 6.283 + l.ph) * 10, flip = .88 + .12 * Math.cos(s * l.f2 * 6.283);
    l.el.style.transform = `translate(${x.toFixed(1)}px,${l.y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scaleX(${flip.toFixed(3)})`;
    l.el.style.opacity = Math.max(0, Math.min(1, (l.y + l.h + 10) / 80, (innerHeight - l.y) / 120));
    l.done = l.y > innerHeight;
  }
  leaves = leaves.filter(l => { if (l.done) l.el.remove(); return !l.done; });
  if (words.length || leaves.length) raf = requestAnimationFrame(tick);
}
const run = () => { if (!raf) raf = requestAnimationFrame(tick); };

function set(list) { // the current list from /api/config; new words join the bag without restarting the fall
  const known = new Set(words.map(w => w.id)), fresh = list.filter(w => !known.has(w.id)).map(w => w.text);
  if (known.size) bag = bag.concat(fresh);
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
    <div class="wrow"><small class="cnt">0 / 160</small><small class="err" role="alert"></small></div>
    <div class="wrow"><button type="button" class="alt" value="cancel" data-i18n="words.cancel"></button><button data-i18n="words.send"></button></div></form>`;
  document.body.append(dlg); I18N.apply(dlg);
  const f = dlg.querySelector('form'), ta = f.elements.text, errEl = dlg.querySelector('.err');
  ta.oninput = () => { dlg.querySelector('.cnt').textContent = `${ta.value.length} / 160`; errEl.textContent = ''; };
  f.querySelector('.alt').onclick = () => dlg.close();
  dlg.onclick = e => { if (e.target === dlg) dlg.close(); }; // a tap outside the form closes it
  f.onsubmit = async e => {
    e.preventDefault();
    if (!ta.value.trim()) { errEl.textContent = t('err.words_empty'); return; }
    try {
      const r = await fetch('/api/words', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: ta.value }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { errEl.textContent = d.code ? t('err.' + d.code) : t('err.request'); return; }
      ta.value = ''; ta.oninput(); dlg.close();
      words = [d, ...words]; spawn(d.text, performance.now()); run(); // your own word falls right away
    } catch { errEl.textContent = t('err.request'); }
  };
  el.onclick = () => { dlg.showModal(); ta.focus(); };
}

window.WORDS = { set, button };
})();

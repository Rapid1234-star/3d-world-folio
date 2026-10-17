import * as THREE from 'three';
import * as CANNON from 'cannon-es';
export async function installPanel(S) {
S.toastT = undefined;
function toast(t, s = '') {
  S.$('toastT').textContent = t; S.$('toastS').textContent = s;
  const el = S.$('toast'); el.classList.add('on'); clearTimeout(S.toastT); S.toastT = setTimeout(() => el.classList.remove('on'), 2800);
}
S.stamped = new Set();
S.STANDS.forEach((s, i) => { const d = document.createElement('span'); d.className = 'st'; d.style.setProperty('--c', s.color); d.textContent = s.stamp || s.short[0]; d.title = s.title; S.$('stampRow').appendChild(d); });
function stamp(s) {
  if (S.stamped.has(s.id)) return;
  S.stamped.add(s.id);
  const i = S.STANDS.indexOf(s); S.$('stampRow').children[i].classList.add('got');
  S.$('stampN').textContent = `${S.stamped.size} / ${S.STANDS.length}`; S.$('stampN2').textContent = `${S.stamped.size}/${S.STANDS.length}`;
  S.tone(880, 0.25, 'sine', 0.12); S.tone(1320, 0.4, 'sine', 0.1, 0.09);
  if (S.stamped.size === S.STANDS.length) setTimeout(() => toast('Park complete', 'every stand stamped · thanks for the drive'), 900);
  else toast(`Stamp ${S.stamped.size} of ${S.STANDS.length}`, s.short || s.title);
}

S.panel = S.$('panel');
S.openStand = null, S.openVia = null, S.projectFocus = null, S.focusPoint = null;
function wordsHTML(str, base = 0, step = 40) {
  return String(str || '').split(' ').filter(Boolean).map((w, i) => `<span class="blr" style="transition-delay:${base + i * step}ms">${w}</span>`).join(' ');
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function showSheet() {
  const body = S.$('pBody');
  S.panel.classList.remove('closing'); S.panel.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => { S.panel.classList.add('on'); requestAnimationFrame(() => body.classList.add('in')); });
  S.tone(660, 0.18, 'triangle', 0.08);
}
function openProject(i) {
  const stand = S.STANDS.find(s => s.id === 'projects');
  const blocks = stand.blocks;
  i = (i + blocks.length) % blocks.length;
  if (S.openVia === 'project' && S.projectFocus === i && S.panel.classList.contains('on')) return;
  S.projectFocus = i; S.openStand = stand; S.openVia = 'project';
  const b = blocks[i];
  S.panel.style.setProperty('--c', stand.color);
  const img = S.$('pImg');
  img.src = posterData({ title: b.h.replace(/^\d+\s·\s/, ''), badge: String(i + 1).padStart(2, '0'), color: stand.color });
  img.alt = b.h; img.parentElement.style.display = '';
  S.$('pIdx').textContent = String(i + 1).padStart(2, '0');
  let html = `<p class="mono" style="color:var(--ink-62)">Project ${i + 1} of ${blocks.length}</p>`;
  html += `<h2 id="pTitle">${wordsHTML(b.h, 80, 40)}</h2>`;
  if (b.s) html += `<p class="mono dim">${esc(b.s)}</p>`;
  if (b.items) html += `<ul class="bul">${b.items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  if (b.scam) html += `<div class="scam"><button type="button" data-r="SAFE">Safe</button><button type="button" data-r="SUSPICIOUS">Suspicious</button><button type="button" data-r="SCAM">Scam</button><p class="scam-out"></p></div>`;
  const body = S.$('pBody'); body.innerHTML = html; body.scrollTop = 0;
  const cta = S.$('pCta'); S.$('pCtaT').textContent = 'GitHub'; cta.href = b.href; cta.dataset.soon = ''; cta.target = '_blank'; cta.rel = 'noopener';
  S.focusPoint = S.projectCards[i] ? S.projectCards[i].position.clone() : null;
  showSheet();
}
function openPanel(s, via = 'pad') {
  if (S.openStand === s && S.openVia !== 'project' && S.panel.classList.contains('on')) return;
  S.projectFocus = null; S.focusPoint = null;
  S.openStand = s; S.openVia = via;
  S.panel.style.setProperty('--c', s.color);
  const img = S.$('pImg');
  img.src = posterData(s);
  img.alt = `${s.title}`;
  img.parentElement.style.display = '';
  S.$('pIdx').textContent = s.badge || s.kind.toUpperCase();
  const head = s.h || s.title;
  let html = `<p class="mono" style="color:var(--ink-62)">${esc(s.kicker || s.badge || '')}</p>`;
  html += `<h2 id="pTitle">${wordsHTML(head, 120, 70)}</h2>`;
  html += `<p class="lede">${wordsHTML(s.lede[0], 300, 22)} <span class="dim">${wordsHTML(s.lede[1] || '', 420, 22)}</span></p>`;
  if (s.highlights) html += `<ul class="bul">${s.highlights.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  if (s.chips) html += `<div class="chips">${s.chips.map(c => `<span class="mono">${esc(c)}</span>`).join('')}</div>`;
  if (s.links) html += `<div class="chips">${s.links.map(([label, href]) => `<a class="mono" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`).join('')}</div>`;
  if (s.email) html += `<div class="contact"><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></div>`;
  html += `<div class="copy">${(s.copy || []).map(p => `<p>${esc(p)}</p>`).join('')}</div>`;
  if (s.blocks) html += s.blocks.map(b => {
    let bit = `<h3 class="blockh">${esc(b.h)}</h3>`;
    if (b.s) bit += `<p class="mono dim">${esc(b.s)}</p>`;
    if (b.items) bit += `<ul class="bul">${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (b.href) bit += `<p class="mono"><a href="${esc(b.href)}" target="_blank" rel="noopener">GitHub</a></p>`;
    if (b.scam) bit += `<div class="scam"><button type="button" data-r="SAFE">Safe</button><button type="button" data-r="SUSPICIOUS">Suspicious</button><button type="button" data-r="SCAM">Scam</button><p class="scam-out"></p></div>`;
    return bit;
  }).join('');
  if (s.meta) html += `<dl class="meta">${s.meta.map(([k, v]) => `<div><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  const body = S.$('pBody'); body.innerHTML = html; body.scrollTop = 0;
  const cta = S.$('pCta');
  if (s.cta) { S.$('pCtaT').textContent = s.cta[0]; cta.href = s.cta[1]; cta.dataset.soon = ''; cta.target = '_blank'; cta.rel = 'noopener'; }
  else { S.$('pCtaT').textContent = 'GitHub'; cta.href = S.LINKS.github; cta.dataset.soon = ''; }
  S.panel.classList.remove('closing'); S.panel.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => { S.panel.classList.add('on'); requestAnimationFrame(() => body.classList.add('in')); });
  S.tone(660, 0.18, 'triangle', 0.08);
}
function posterData(s) {
  const title = esc(s.title || '');
  const badge = esc(s.badge || '');
  const fill = s.color || '#cdb8f0';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${fill}"/><rect x="28" y="28" width="344" height="244" rx="16" fill="#fbf3e6"/><text x="48" y="78" font-family="Space Mono, monospace" font-size="16" fill="#2a1d38">${badge}</text><text x="48" y="160" font-family="Syne, sans-serif" font-size="42" font-weight="800" fill="#2a1d38">${title}</text></svg>`);
}
function closePanel() {
  if (!S.openStand) return;
  S.openStand = null; S.openVia = null; S.projectFocus = null; S.focusPoint = null;
  S.panel.classList.remove('on'); S.panel.classList.add('closing'); S.$('pBody').classList.remove('in'); S.panel.setAttribute('aria-hidden', 'true');
  setTimeout(() => S.panel.classList.remove('closing'), 1000);
  S.$('pBar').style.transition = 'none'; S.$('pBar').style.transform = 'scaleX(0)';
}
S.$('pClose').addEventListener('click', () => { closePanel(); if (S.tour.on) S.stopTour('Tour stopped'); });
S.$('pBody').addEventListener('click', e => {
  const b = e.target.closest('[data-r]');
  if (!b) return;
  const sample = S.SCAM[b.dataset.r];
  const out = b.parentElement.querySelector('.scam-out');
  if (out && sample) out.innerHTML = `<strong>${esc(b.dataset.r)}</strong> ${esc(sample.line)} ${esc(sample.note)}`;
});
S.$('pCta').addEventListener('click', () => {});
S.stepStand = d => {
  if (S.openVia === 'project' && S.projectFocus != null) { openProject(S.projectFocus + d); return; }
  const i = S.STANDS.indexOf(S.openStand); const s = S.STANDS[(i + d + S.STANDS.length) % S.STANDS.length]; closePanel(); setTimeout(() => { openPanel(s, 'list'); S.goTo(s); }, 60);
};
S.$('pPrev').addEventListener('click', () => S.stepStand(-1));
S.$('pNext').addEventListener('click', () => S.stepStand(1));

S.list = S.$('list');
S.lastFocus = undefined;
function openList() { S.lastFocus = document.activeElement; S.list.classList.add('on'); setTimeout(() => S.list.querySelector('li button')?.focus(), 50); }
function closeList() { S.list.classList.remove('on'); S.lastFocus?.focus?.(); }
S.buildListInto(S.$('lItems'), s => { closeList(); openPanel(s, 'list'); S.goTo(s); });
S.$('btnList').addEventListener('click', openList);
S.$('lClose').addEventListener('click', closeList);
S.list.addEventListener('click', e => { if (e.target === S.list) closeList(); });
S.$('lTour').addEventListener('click', () => { closeList(); S.startTour(); });
S.$('btnTour').addEventListener('click', () => S.tour.on ? S.stopTour('Tour stopped') : S.startTour());
S.$('btnSound').addEventListener('click', () => {
  S.audio.on = !S.audio.on; S.$('btnSound').setAttribute('aria-pressed', S.audio.on); S.$('btnSound').querySelector('.wv').style.opacity = S.audio.on ? 1 : 0.15;
  if (S.audio.master) S.audio.master.gain.value = S.audio.on ? 0.5 : 0;
});
S.toast = toast;
S.stamp = stamp;
S.wordsHTML = wordsHTML;
S.esc = esc;
S.showSheet = showSheet;
S.openProject = openProject;
S.openPanel = openPanel;
S.posterData = posterData;
S.closePanel = closePanel;
S.openList = openList;
S.closeList = closeList;

}

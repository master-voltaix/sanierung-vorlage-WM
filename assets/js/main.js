// Ereignisse für Google Tag Manager / Google Ads (dataLayer wird im <head> angelegt)
const track = (event, data = {}) => window.dataLayer.push({ event, ...data });

// Schatten unter dem Header beim Scrollen
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------------------------------------------------------------------------
// Anpassung an die Anzeige: ?ort=Bonn&leistung=Badsanierung
// In Google Ads als Final-URL-Suffix nutzbar, z. B. ?ort={LOCATION(City)}&leistung=Badsanierung
// ---------------------------------------------------------------------------
const params = new URLSearchParams(location.search);
const SERVICES = {
  badsanierung: ['Badsanierung', 'Badsanierung'],
  komplettsanierung: ['Komplettsanierung', 'Komplettsanierung'],
  altbausanierung: ['Altbausanierung', 'Altbausanierung'],
  kernsanierung: ['Kernsanierung', 'Altbausanierung'],
  wohnungssanierung: ['Wohnungssanierung', 'Komplettsanierung'],
  haussanierung: ['Haussanierung', 'Komplettsanierung'],
  schimmelsanierung: ['Schimmelsanierung', 'Schimmel & Wasserschaden'],
  wasserschaden: ['Wasserschadensanierung', 'Schimmel & Wasserschaden'],
  fassadensanierung: ['Fassadensanierung', 'Fassade & Dämmung'],
  dachsanierung: ['Dachsanierung', 'Fassade & Dämmung'],
  elektrosanierung: ['Elektrosanierung', 'Sonstiges'],
};
const service = SERVICES[(params.get('leistung') || '').toLowerCase()];
const ortRaw = (params.get('ort') || '').trim();
const ort = /^[A-Za-zÄÖÜäöüß .\-]{2,30}$/.test(ortRaw) ? ortRaw : null;
if (service) document.querySelectorAll('[data-kw]').forEach(el => (el.textContent = service[0]));
if (ort) document.querySelectorAll('[data-ort]').forEach(el => (el.textContent = ort));
if (service || ort) document.title = `${service ? service[0] : 'Sanierung'} in ${ort || 'Köln'} zum Festpreis | Kernwerk Meisterbetrieb`;

// ---------------------------------------------------------------------------
// Anfrageformular in drei Schritten
// ---------------------------------------------------------------------------
const lead = document.getElementById('angebot');
const steps = [...lead.querySelectorAll('.lead__step')];
const bar = lead.querySelector('.lead__bar i');
const count = lead.querySelector('.lead__count');
const err = lead.querySelector('.lead__err');
let current = 1;

['gclid', 'utm_source', 'utm_campaign', 'utm_term'].forEach(k => {
  if (params.get(k)) lead.elements[k].value = params.get(k).slice(0, 200);
});

const go = n => {
  lead.classList.toggle('is-back', n < current);
  current = n;
  steps.forEach(s => s.classList.toggle('is-active', +s.dataset.step === n));
  bar.style.width = Math.min(n, 3) / 3 * 100 + '%';
  err.textContent = '';
  if (n <= 3) count.querySelector('b').textContent = n;
  else { count.textContent = 'Anfrage gesendet'; lead.querySelector('.lead__safe').hidden = true; }
  const first = steps[n - 1].querySelector('input:not([type=radio]), select');
  if (first && n > 1 && n < 4 && window.innerWidth > 760) first.focus({ preventScroll: true });
  if (n > 1) track('lead_form_step', { step: n });
};

const valid = step => {
  let ok = true;
  step.querySelectorAll('[data-req]').forEach(i => {
    const v = i.value.trim();
    const good = i.dataset.req === 'plz' ? /^\d{5}$/.test(v) : v.length > 1;
    i.classList.toggle('is-invalid', !good);
    if (!good) ok = false;
  });
  if (!ok) {
    err.textContent = step.dataset.step === '2' ? 'Bitte geben Sie eine fünfstellige Postleitzahl an.' : 'Bitte geben Sie Name und Telefonnummer an.';
    lead.classList.remove('is-shake'); void lead.offsetWidth; lead.classList.add('is-shake');
  }
  return ok;
};

lead.querySelectorAll('input[name=leistung]').forEach(r =>
  r.addEventListener('change', () => setTimeout(() => go(2), 220)));
// Bereits gewählte Kachel erneut anklicken führt ebenfalls weiter
lead.querySelectorAll('.lead__tiles label').forEach(l =>
  l.addEventListener('click', () => { if (l.querySelector('input').checked && current === 1) setTimeout(() => go(2), 220); }));
lead.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => { if (valid(steps[current - 1])) go(current + 1); }));
lead.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => go(current - 1)));
lead.addEventListener('keydown', e => {
  if (e.key === 'Enter' && current === 2 && e.target.tagName !== 'BUTTON') { e.preventDefault(); if (valid(steps[1])) go(3); }
});

lead.addEventListener('submit', e => {
  e.preventDefault();
  if (current !== 3 || !valid(steps[2])) return;
  const data = Object.fromEntries(new FormData(lead));
  lead.querySelector('[data-name]').textContent = data.name.trim().split(' ')[0];
  // TODO Versand: hier die Daten an CRM / E-Mail-Dienst schicken (fetch). Aktuell wird nichts übertragen.
  track('generate_lead', { leistung: data.leistung || '', plz: data.plz, gclid: data.gclid });
  go(4);
});

const select = value => {
  const radio = [...lead.querySelectorAll('input[name=leistung]')].find(r => r.value === value);
  if (!radio) return;
  radio.checked = true;
  if (current === 1) go(2);
};
if (service) select(service[1]);

// Links zum Formular: Leistung vorwählen und Formular kurz hervorheben
document.querySelectorAll('a[href="#angebot"]').forEach(a => a.addEventListener('click', () => {
  if (a.dataset.service && current < 3) { go(1); select(a.dataset.service); }
  track('cta_click', { quelle: a.closest('section, header, .mbar')?.className.split(' ')[0] || '' });
  setTimeout(() => { lead.classList.remove('is-ping'); void lead.offsetWidth; lead.classList.add('is-ping'); }, 500);
}));

// Anrufe zählen
document.querySelectorAll('a[href^="tel:"]').forEach(a =>
  a.addEventListener('click', () => track('phone_click', { quelle: a.dataset.track || '' })));

// ---------------------------------------------------------------------------
// Projektfilter
// ---------------------------------------------------------------------------
const filters = document.getElementById('filters');
filters.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  filters.querySelectorAll('button').forEach(b => b.classList.toggle('is-active', b === btn));
  const cat = btn.dataset.filter;
  document.querySelectorAll('#projects figure').forEach(f => {
    const hide = cat !== 'all' && f.dataset.cat !== cat;
    f.classList.toggle('is-hidden', hide);
    f.classList.remove('pop');
    if (!hide) { void f.offsetWidth; f.classList.add('pop'); }
  });
});

// ---------------------------------------------------------------------------
// Einblenden beim Scrollen (nur Texte und Flächen, keine Bilder)
// ---------------------------------------------------------------------------
const mark = sel => document.querySelectorAll(sel).forEach(el => el.classList.add('rv'));
mark('.label, .section h2, .why h2, .cta h2, .head p, .why__lead, .why__feats > div, .compare__row, .compare__cta, ' +
     '.steps li, .filters, .reviews__sum, .about__text p, .checks li, .facts > div, .area__grid p, .area__grid .btn, ' +
     '.area__list li, .faq__grid > div:first-child p, .faq__phone, .faq details, .cta p, .cta__btns, .cta__points, .scard--cta');
document.querySelectorAll('.rv').forEach(el => {
  const sibs = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
  el.style.setProperty('--d', Math.min(sibs.indexOf(el), 7) * 0.08 + 's');
});

const countUp = el => {
  const m = el.textContent.match(/^([\d.]+)(.*)$/);
  if (!m) return;
  const end = +m[1].replace(/\./g, ''), suffix = m[2], start = performance.now(), dur = 1500;
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))).toLocaleString('de-DE') + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const watched = document.querySelectorAll('.rv, .steps');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    en.target.classList.add('is-in');
    const num = en.target.matches('.facts > div') && en.target.querySelector('b');
    if (num) countUp(num);
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  watched.forEach(el => io.observe(el));
} else {
  watched.forEach(el => el.classList.add('is-in'));
}

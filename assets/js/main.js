// Trennlinie unter dem Header beim Scrollen
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 50);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobiles Menü
const nav = document.getElementById('nav');
document.getElementById('burger').addEventListener('click', () => nav.classList.toggle('is-open'));
nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('is-open'); });

// Projektfilter
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
    if (!hide) { void f.offsetWidth; f.classList.add('pop', 'is-in'); }
  });
});

// Einblenden beim Scrollen
const mark = (sel, cls) => document.querySelectorAll(sel).forEach(el => el.classList.add(...cls.split(' ')));
mark('.label, h2, .services__head p, .services__head .btn, .about__text p, .checks li, .facts > div, .about__actions, ' +
     '.why__feats > div, .steps li, .faq__grid > div:first-child p, .faq__grid > div:first-child .btn, .faq details, ' +
     '.cta__text > p, .cta__contact li, .filters, .reviews__score, .scard, .rcard, .projects__grid figure, ' +
     '.footer__grid > div', 'rv');
mark('.trio__item, .callback__text', 'rv rv--left');
mark('.callback__form, .form', 'rv rv--right');
mark('.about__media, .why__media, .process__media', 'rv-img');

// Geschwister nacheinander einblenden
document.querySelectorAll('.rv').forEach(el => {
  const sibs = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
  el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6) * 0.09 + 's');
});

// Zahlen im Über-uns-Block hochzählen
const countUp = el => {
  const m = el.textContent.match(/^([\d.]+)(.*)$/);
  if (!m) return;
  const end = +m[1].replace(/\./g, ''), suffix = m[2], start = performance.now(), dur = 1300;
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('de-DE') + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const revealed = document.querySelectorAll('.rv, .rv-img');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    en.target.classList.add('is-in');
    const num = en.target.matches('.facts > div') && en.target.querySelector('b');
    if (num) countUp(num);
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealed.forEach(el => io.observe(el));
} else {
  revealed.forEach(el => el.classList.add('is-in'));
}

// Formulare (Demo – kein Versand)
document.querySelectorAll('.js-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(i => {
      const bad = !i.value.trim();
      i.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    const msg = form.querySelector('.form__msg');
    msg.style.color = ok ? '' : '#d43c2c';
    msg.textContent = ok
      ? 'Vielen Dank! Wir melden uns schnellstmöglich bei Ihnen.'
      : 'Bitte geben Sie Name und Telefonnummer an.';
    if (ok) form.reset();
  });
});

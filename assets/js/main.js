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
  document.querySelectorAll('#projects figure').forEach(f =>
    f.classList.toggle('is-hidden', cat !== 'all' && f.dataset.cat !== cat));
});

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

/* ═══════════════════════════════════════════════
   ДИЗАЙН 3 — «Темний преміум» · інтерактив
   Без залежностей.
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Рік у футері ── */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ── Мобільне меню ── */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Фон шапки при скролі ── */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Акордеон: відкритий лише один пункт ── */
  var details = document.querySelectorAll('.acc__i');
  details.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      details.forEach(function (other) { if (other !== d) other.open = false; });
    });
  });

  /* ── Поява блоків при скролі ── */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -70px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── Активний пункт меню ── */
  var links = Array.prototype.slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50%' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ── Форма → лист (бекенду немає) ──
     Для справжньої відправки замініть тіло обробника на fetch()
     до Formspree / власного PHP-скрипта / Google Forms.        */
  var form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var phone = (data.get('phone') || '').toString().trim();
      var type = (data.get('type') || '').toString().trim();
      var message = (data.get('message') || '').toString().trim();

      var body = [
        'Імʼя: ' + name,
        'Телефон: ' + phone,
        'Ситуація: ' + type,
        '',
        'Деталі:',
        message || '—'
      ].join('\n');

      /* ЗАМІНИТИ: адреса пошти */
      var href = 'mailto:info@example.com'
        + '?subject=' + encodeURIComponent('Заявка з сайту — ' + (name || 'без імені'))
        + '&body=' + encodeURIComponent(body);

      window.location.href = href;

      var ok = document.getElementById('formOk');
      if (ok) ok.hidden = false;
      form.reset();
    });
  }
})();

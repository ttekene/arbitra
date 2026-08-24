/* ═══════════════════════════════════════════════
   ДИЗАЙН 1 — «Класика» · інтерактив
   Без залежностей. Працює з file:// та з будь-якого хостингу.
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Рік у футері ── */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ── Мобільне меню ── */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Тінь у шапки при скролі ── */
  var header = document.getElementById('header');
  var onScroll = function () {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Поява блоків при скролі ── */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 80 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── Підсвічування активного пункту меню ── */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
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

  /* ── Акордеон: відкритий лише один пункт ── */
  var details = document.querySelectorAll('.acc__i');
  details.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      details.forEach(function (other) { if (other !== d) other.open = false; });
    });
  });

  /* ── Форма → лист (бекенду немає) ──
     Коли підключите справжній обробник (Formspree / Google Forms / PHP),
     замініть тіло цього обробника на fetch() до вашого endpoint.       */
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
        'Тема: ' + type,
        '',
        'Ситуація:',
        message || '—'
      ].join('\n');

      /* ЗАМІНИТИ: адреса пошти */
      var href = 'mailto:info@example.com'
        + '?subject=' + encodeURIComponent('Заявка на консультацію — ' + (name || 'сайт'))
        + '&body=' + encodeURIComponent(body);

      window.location.href = href;

      var ok = document.getElementById('formOk');
      if (ok) ok.hidden = false;
      form.reset();
    });
  }
})();

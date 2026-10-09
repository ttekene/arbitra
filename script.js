/* ═══════════════════════════════════════════════
   Основний сайт · інтерактив
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

  /* ── Стан шапки при скролі ── */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!('IntersectionObserver' in window)) return;

  /* ── Активний пункт меню ── */
  var links = Array.prototype.slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50%' });
  sections.forEach(function (s) { spy.observe(s); });

  /* ── Плаваюча кнопка ховається над контактами й футером ── */
  var fab = document.getElementById('fab');
  var fabZones = [document.getElementById('contact'), document.querySelector('.foot')].filter(Boolean);
  if (fab && fabZones.length) {
    var visible = new Set();
    var fabIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
      });
      fab.classList.toggle('is-hidden', visible.size > 0);
    }, { threshold: 0.15 });
    fabZones.forEach(function (z) { fabIo.observe(z); });
  }
})();

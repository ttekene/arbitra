/* ═══════════════════════════════════════════════
   Основний сайт (дизайн «Модерн») · інтерактив
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

  /* ── Таби «Кому допомагаю» ── */
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.tabs__b'));
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-tab');
      tabButtons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', String(on));
      });
      document.querySelectorAll('.tabs__p').forEach(function (panel) {
        var on = panel.id === id;
        panel.classList.toggle('is-on', on);
        panel.hidden = !on;
      });
    });
  });

  /* ── Акордеон: відкритий лише один пункт ── */
  var details = document.querySelectorAll('.acc__i');
  details.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      details.forEach(function (other) { if (other !== d) other.open = false; });
    });
  });

  /* ── Поява блоків + лічильники ── */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(el) {
    var target = el.getAttribute('data-count') || '';
    var digits = parseInt(target.replace(/\D/g, ''), 10);
    if (!digits || reduced) { el.textContent = target; return; }
    var start = performance.now();
    var dur = 1100;
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(digits * eased)).padStart(target.length, '0');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    })(start);
  }

  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        entry.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('[data-count]').forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
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

  /* ── Плаваюча кнопка ховається над контактами й футером ── */
  var fab = document.getElementById('fab');
  var fabZones = [document.getElementById('contact'), document.querySelector('.foot')].filter(Boolean);
  if (fab && fabZones.length && 'IntersectionObserver' in window) {
    var visible = new Set();
    var fabIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
      });
      fab.classList.toggle('is-hidden', visible.size > 0);
    }, { threshold: 0.15 });
    fabZones.forEach(function (z) { fabIo.observe(z); });
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

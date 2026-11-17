// Поведение главной: меню, маска телефона, согласие, отправка, ленты, таб-бар, окно «Связаться», фото в окне, появление блоков.
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Акция с датой (data-akciya-do): после даты по Минску блок убирается сам – решение 1А, 18.11
  var dnow = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Minsk' });
  $$('[data-akciya-do]').forEach(function (e) { if (dnow > e.getAttribute('data-akciya-do')) (e.closest('section') || e).remove(); });

  // Выпадающие «Услуги» и «Марки» в шапке (9А): по клику, закрываются вторым кликом, кликом мимо и Escape
  var dds = $$('.hnav__it');
  function ddClose(except) { dds.forEach(function (it) { if (it !== except) { it.classList.remove('open'); $('.hnav__b', it).setAttribute('aria-expanded', false); } }); }
  dds.forEach(function (it) {
    $('.hnav__b', it).addEventListener('click', function (e) {
      e.stopPropagation(); ddClose(it);
      var o = it.classList.toggle('open'); this.setAttribute('aria-expanded', o);
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.hnav__it')) ddClose(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ddClose(); });

  // Меню на узких экранах
  var hdr = $('.hdr'), burger = $('.menu-btn');
  if (burger) burger.addEventListener('click', function () {
    var o = hdr.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
  });
  $$('.mnu a').forEach(function (a) { a.addEventListener('click', function () { hdr.classList.remove('open'); }); });
  document.addEventListener('click', function (e) { if (!hdr.contains(e.target)) { hdr.classList.remove('open'); if (burger) burger.setAttribute('aria-expanded', false); } });
  // Шапка – стекло на первом экране, зелёная заливка ниже
  function solid() { hdr.classList.toggle('solid', window.scrollY > 120); }
  window.addEventListener('scroll', solid, { passive: true }); solid();

  // Маска телефона Беларуси: +375 (XX) XXX-XX-XX
  function mask(v) {
    var d = v.replace(/\D/g, '');
    while (d.indexOf('375') === 0) d = d.slice(3);
    if (d.indexOf('80') === 0) d = d.slice(2);
    d = d.slice(0, 9);
    var out = '+375';
    if (d.length) out += ' (' + d.slice(0, 2);
    if (d.length >= 2) out += ')';
    if (d.length > 2) out += ' ' + d.slice(2, 5);
    if (d.length > 5) out += '-' + d.slice(5, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    return { text: out, full: d.length === 9, d: d };
  }
  $$('form[data-form]').forEach(function (f) {
    var tel = $('[data-mask]', f), agree = $('[data-agree]', f), btn = $('button[type=submit]', f);
    function check() { btn.disabled = !(agree.checked && mask(tel.value).full); btn.title = btn.disabled ? 'Введите номер полностью и отметьте согласие' : ''; }
    var prev = '';
    tel.addEventListener('focus', function () { if (!tel.value) tel.value = '+375 ('; });
    tel.addEventListener('input', function (e) {
      var m = mask(tel.value);
      if (e && e.inputType === 'deleteContentBackward' && m.text === prev) m = mask('+375' + m.d.slice(0, -1));
      tel.value = prev = m.text; check();
    });
    tel.addEventListener('blur', function () { if (tel.value === '+375 (' || tel.value === '+375') tel.value = ''; });
    agree.addEventListener('change', check);
    // Дизайн-макет: заявка никуда не уходит, показываем экран «Заявка принята»
    f.addEventListener('submit', function (e) { e.preventDefault(); if (btn.disabled) return; f.classList.add('sent');
      var ok = $('.ok', f); if (ok) { ok.tabIndex = -1; ok.focus({ preventScroll: true }); ok.scrollIntoView({ block: 'center' }); } });
  });

  // Ленты вбок: счётчик «N / всего» и точки
  $$('.lenta').forEach(function (l) {
    var c = l.nextElementSibling;
    if (!c || !c.classList.contains('cnt')) return;
    var dots = $$('b', c), span = $('span', c), n = l.children.length;
    function upd() {
      var w = l.children[0].getBoundingClientRect().width + 12;
      var i = Math.min(n - 1, Math.round(l.scrollLeft / w));
      span.textContent = (i + 1) + ' / ' + n + ' · листайте вбок';
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    }
    l.addEventListener('scroll', upd, { passive: true }); upd();
  });

  // Таб-бар показывается, когда первый экран ушёл вверх
  var tab = $('.tab'), hero = $('.hero');
  if (tab && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { tab.classList.toggle('show', !es[0].isIntersecting); }, { threshold: 0.05 }).observe(hero);
  }

  // Окно «Связаться»
  var sheet = $('.sheet');
  function sheetSet(o) { sheet.classList.toggle('open', o); sheet.setAttribute('aria-hidden', !o); document.body.style.overflow = o ? 'hidden' : ''; }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-sheet-open]')) sheetSet(true);
    else if (e.target.closest('[data-sheet-close]')) sheetSet(false);
  });

  // Контентные фото – окном с крестиком, Esc закрывает
  var lb = $('.lb'), lbImg = $('img', lb);
  function lbSet(src, alt) { if (src) { lbImg.src = src; lbImg.alt = alt || ''; } lb.classList.toggle('open', !!src); lb.setAttribute('aria-hidden', !src); document.body.style.overflow = src ? 'hidden' : ''; }
  $$('[data-zoom]').forEach(function (img) { img.addEventListener('click', function () { lbSet(img.currentSrc || img.src, img.alt); }); });
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) lbSet(null); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { lbSet(null); sheetSet(false); hdr.classList.remove('open'); if (burger) burger.setAttribute('aria-expanded', false); } });

  // Появление блоков: только прозрачность и сдвиг, вёрстка не прыгает
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });
})();

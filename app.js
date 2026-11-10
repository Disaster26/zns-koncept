(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rok = document.getElementById('rok'); if (rok) rok.textContent = new Date().getFullYear();

  /* menu mobilne */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu-mob');
  function zamknij() { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  burger.addEventListener('click', function () {
    var otw = menu.hidden;
    menu.hidden = !otw;
    burger.setAttribute('aria-expanded', String(otw));
    burger.setAttribute('aria-label', otw ? 'Zamknij menu' : 'Otwórz menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { zamknij(); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 1000 && !menu.hidden) zamknij(); });

  /* hero: zdjęcia w owalu (auto + palec/mysz) */
  var hero = document.querySelector('[data-slider]');
  if (hero) {
    var slides = hero.querySelectorAll('.slide'), dots = hero.querySelectorAll('.hero-kropki button');
    var cur = 0, timer = null;
    function laduj(i) { var img = slides[i].querySelector('img'); if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; } }
    function pokaz(i) {
      i = (i + slides.length) % slides.length; laduj(i);
      slides[cur].classList.remove('on'); dots[cur].classList.remove('on');
      cur = i; slides[cur].classList.add('on'); dots[cur].classList.add('on');
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function start() { if (reduce) return; stop(); timer = setInterval(function () { pokaz(cur + 1); }, 5500); }
    [].forEach.call(dots, function (d, i) { d.addEventListener('click', function () { pokaz(i); start(); }); });
    var sx = null, sy = 0;
    hero.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; sx = e.clientX; sy = e.clientY; });
    hero.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { pokaz(cur + (dx < 0 ? 1 : -1)); start(); }
    });
    hero.addEventListener('pointercancel', function () { sx = null; });
    hero.addEventListener('dragstart', function (e) { e.preventDefault(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    window.addEventListener('load', function () { laduj(1); start(); });
  }

  /* przeciąganie myszą dla przewijanych torów */
  function przeciagaj(tor, krok) {
    var p0 = null, sl = 0, ruch = false;
    tor.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      p0 = e.clientX; sl = tor.scrollLeft; ruch = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (p0 === null) return;
      var dx = e.clientX - p0;
      if (!ruch && Math.abs(dx) > 5) { ruch = true; tor.classList.add('ciag'); }
      if (ruch) { e.preventDefault(); tor.scrollLeft = sl - dx; }
    });
    window.addEventListener('pointerup', function () {
      if (p0 === null) return;
      p0 = null;
      if (!ruch) return;
      var dx = tor.scrollLeft - sl, k = krok();
      tor.classList.remove('ciag');
      var start = Math.round(sl / k);
      var cel = Math.abs(dx) > k * 0.15 ? start + (dx > 0 ? 1 : -1) : start;
      tor.scrollTo({ left: Math.max(0, cel * k), behavior: reduce ? 'auto' : 'smooth' });
    });
    tor.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  /* karuzela zdjęć w usługach */
  [].forEach.call(document.querySelectorAll('[data-karuzela]'), function (k) {
    var tor = k.querySelector('.kar-tor'), n = tor.querySelectorAll('img').length;
    var l = k.querySelector('.kar-l'), p = k.querySelector('.kar-p'), licz = k.querySelector('.kar-licz');
    function idx() { return Math.round(tor.scrollLeft / tor.clientWidth); }
    function stan() { var i = idx(); licz.textContent = (i + 1) + ' / ' + n; l.disabled = i <= 0; p.disabled = i >= n - 1; }
    function idz(d) { var i = Math.max(0, Math.min(n - 1, idx() + d)); tor.scrollTo({ left: i * tor.clientWidth, behavior: reduce ? 'auto' : 'smooth' }); }
    l.addEventListener('click', function () { idz(-1); });
    p.addEventListener('click', function () { idz(1); });
    tor.addEventListener('scroll', function () { requestAnimationFrame(stan); }, { passive: true });
    tor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); idz(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); idz(-1); }
    });
    przeciagaj(tor, function () { return tor.clientWidth; });
    stan();
  });

  /* rząd produktów */
  var rzad = document.querySelector('[data-rzad]');
  if (rzad) {
    var krok = function () { var a = rzad.querySelectorAll('.produkt'); return a.length > 1 ? a[1].offsetLeft - a[0].offsetLeft : rzad.clientWidth; };
    przeciagaj(rzad, krok);
    function jedz(d) { rzad.scrollBy({ left: d * krok(), behavior: reduce ? 'auto' : 'smooth' }); }
    var bl = document.querySelector('.rz-l'), bp = document.querySelector('.rz-p');
    bl.addEventListener('click', function () { jedz(-1); });
    bp.addEventListener('click', function () { jedz(1); });
    rzad.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); jedz(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); jedz(-1); }
    });
  }

  /* formularz pokazowy - bez wysyłki */
  var form = document.getElementById('form'), info = document.getElementById('form-info');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.imie.value.trim() || !form.tel.value.trim()) { info.className = 'form-info blad'; info.textContent = 'Podaj nazwę firmy lub imię i numer telefonu, żebyśmy mogli oddzwonić.'; return; }
    if (!form.zgoda.checked) { info.className = 'form-info blad'; info.textContent = 'Zaznacz zgodę na kontakt w sprawie zapytania.'; return; }
    info.className = 'form-info ok';
    info.textContent = 'To wersja pokazowa, nic nie zostało wysłane. Na docelowej stronie zapytanie trafi od razu na zns@zns.pl.';
    form.reset();
  });

  /* aktywna pozycja menu */
  var linki = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) {
        if (!w.isIntersecting) return;
        [].forEach.call(linki, function (a) { a.classList.toggle('akt', a.getAttribute('href') === '#' + w.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['uslugi', 'produkcja', 'sprzedaz', 'firma', 'kontakt'].forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    var heroS = document.querySelector('.hero');
    new IntersectionObserver(function (w) { if (w[0].isIntersecting) [].forEach.call(linki, function (a) { a.classList.remove('akt'); }); }, { rootMargin: '-45% 0px -50% 0px' }).observe(heroS);
  }

  /* dolny pasek na telefonie: po przewinięciu za przycisk w hero, ukryty przy formularzu */
  var pasek = document.getElementById('mob-pasek'), cta = document.getElementById('hero-cta'), kontakt = document.getElementById('kontakt');
  if ('IntersectionObserver' in window && pasek && cta) {
    var zaCta = false, wKontakcie = false;
    function ustaw() {
      var on = zaCta && !wKontakcie;
      pasek.classList.toggle('widac', on);
      pasek.setAttribute('aria-hidden', String(!on));
      [].forEach.call(pasek.querySelectorAll('a'), function (a) { a.tabIndex = on ? 0 : -1; });
    }
    new IntersectionObserver(function (w) { zaCta = !w[0].isIntersecting && w[0].boundingClientRect.top < 0; ustaw(); }).observe(cta);
    new IntersectionObserver(function (w) { wKontakcie = w[0].isIntersecting; ustaw(); }, { rootMargin: '0px 0px -30% 0px' }).observe(kontakt);
  }
})();

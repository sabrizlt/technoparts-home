// Technoparts — home: nav, menu, slider hero con video, comparse, contatori, parallasse, mappa, video.
(() => {
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 50);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menu mobile
  const burger = nav.querySelector('.nav__burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });

  // lingua: apri/chiudi al click (utile su touch)
  const lang = nav.querySelector('.lang');
  lang.querySelector('.lang__btn').addEventListener('click', e => { e.stopPropagation(); lang.classList.toggle('is-open'); });
  document.addEventListener('click', () => lang.classList.remove('is-open'));

  // hero: il video resta fisso, ruotano solo i testi
  const texts = [...document.querySelectorAll('.hero__text')];
  const dots = [...document.querySelectorAll('.hero__dots button')];
  const heroVideo = document.querySelector('.hero__video');
  let i = 0, timer;
  const show = n => {
    i = (n + texts.length) % texts.length;
    [texts, dots].forEach(list => list.forEach((el, k) => el.classList.toggle('is-active', k === i)));
  };
  const start = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), 8000); };
  dots.forEach((d, k) => d.addEventListener('click', () => { show(k); start(); }));
  start();

  // video corporate a tutto schermo
  const modal = document.getElementById('vmodal');
  const mVideo = modal.querySelector('video');
  const close = () => { mVideo.pause(); modal.hidden = true; heroVideo.play().catch(() => {}); start(); };
  document.querySelectorAll('[data-video-open]').forEach(b => b.addEventListener('click', () => {
    clearInterval(timer); heroVideo.pause(); modal.hidden = false; mVideo.currentTime = 0; mVideo.play().catch(() => {});
  }));
  modal.querySelector('.vmodal__close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });

  // contatori
  const count = el => {
    const end = parseFloat(el.dataset.count), dec = el.dataset.count.includes('.') ? 1 : 0, t0 = performance.now();
    const fmt = v => v.toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const step = t => {
      const p = Math.min((t - t0) / 1600, 1);
      el.textContent = fmt(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // lunghezza delle rotte per disegnarle
  document.querySelectorAll('.routes path').forEach((p, k) => {
    p.style.setProperty('--len', Math.ceil(p.getTotalLength()));
    p.style.transitionDelay = (k * 0.08) + 's';
  });

  // comparsa allo scroll: si ripete ogni volta che l'elemento rientra nello schermo
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    const el = en.target;
    if (en.isIntersecting) {
      if (el.classList.contains('is-in')) return;
      el.classList.add('is-in');
      el.querySelectorAll('[data-count]').forEach(count);
    } else {
      el.classList.remove('is-in');
    }
  }), { threshold: 0.15 });
  document.querySelectorAll('.reveal, .map').forEach((el, k) => {
    if (el.classList.contains('reveal')) el.style.transitionDelay = ((k % 3) * 0.08) + 's';
    io.observe(el);
  });

  // parallasse leggera
  const par = [...document.querySelectorAll('[data-parallax]')];
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const tick = () => par.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.transform = `translate3d(0,${(r.top + r.height / 2 - innerHeight / 2) * -0.08}px,0)`;
    });
    addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true }); tick();
  }
})();

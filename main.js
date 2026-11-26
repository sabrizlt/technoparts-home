// Technoparts — home: nav, slideshow, comparse, contatori, parallasse, mappa.
(() => {
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menu mobile
  const burger = nav.querySelector('.nav__burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('is-open')));

  // slideshow hero: dissolvenza + zoom lento
  const slides = [...document.querySelectorAll('.hero__slide')];
  const dots = [...document.querySelectorAll('.hero__dots button')];
  let i = 0, timer;
  const show = n => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
  };
  const start = () => { clearInterval(timer); timer = setInterval(() => show(i + 1), 6000); };
  dots.forEach((d, k) => d.addEventListener('click', () => { show(k); start(); }));
  start();

  // contatori
  const count = el => {
    const end = parseFloat(el.dataset.count), dec = String(el.dataset.count).includes('.') ? 1 : 0;
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', t0 = performance.now();
    const fmt = v => pre + v.toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    const step = t => {
      const p = Math.min((t - t0) / 1600, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // lunghezza delle rotte per l'animazione del tratto
  document.querySelectorAll('.routes path').forEach((p, k) => {
    p.style.setProperty('--len', Math.ceil(p.getTotalLength()));
    p.style.transitionDelay = (k * 0.08) + 's';
  });

  // comparsa allo scroll
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add('is-in');
    el.querySelectorAll?.('[data-count]').forEach(count);
    if (el.matches('[data-count]')) count(el);
    io.unobserve(el);
  }), { threshold: 0.2 });
  document.querySelectorAll('.reveal, .wipe, .map, .stat').forEach((el, k) => {
    if (el.classList.contains('reveal')) el.style.transitionDelay = ((k % 4) * 0.07) + 's';
    io.observe(el);
  });

  // parallasse leggera
  const par = [...document.querySelectorAll('[data-parallax]')];
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const tick = () => {
      par.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const off = (r.top + r.height / 2 - innerHeight / 2) * -0.08;
        el.style.transform = `translate3d(0,${off}px,0)`;
      });
    };
    addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true }); tick();
  }
})();

// Globo intero con le rotte da Ragusa: rotazione lenta continua + flussi sulle rotte.
(() => {
  const host = document.getElementById('globe');
  if (!host || !window.d3 || !window.topojson) return;
  const NS = 'http://www.w3.org/2000/svg';
  const S = 800, R = 380;                               // viewBox quadrato, raggio del globo
  const hub = [14.73, 36.93];                           // Ragusa
  const dests = [
    [-3.70, 40.42], [2.35, 48.86], [-0.13, 51.51], [13.40, 52.52], [21.01, 52.23],
    [26.10, 44.43], [23.73, 37.98], [28.98, 41.01], [-7.59, 33.57], [3.06, 36.75],
    [10.18, 36.81], [13.19, 32.89], [31.24, 30.04], [-17.45, 14.69], [46.68, 24.71],
    [55.27, 25.20], [35.93, 31.95], [44.37, 33.31], [37.62, 55.75], [32.85, 39.93],
    // Americhe
    [-74.01, 40.71], [-79.38, 43.65], [-80.19, 25.76], [-99.13, 19.43], [-46.63, -23.55],
    [-58.38, -34.60], [-74.07, 4.71], [-66.90, 10.48], [3.38, 6.52], [36.82, -1.29]
  ];

  const topo = window.WORLD;
  if (!topo) return;
  const land = topojson.feature(topo, topo.objects.countries).features;
  const italy = land.filter(f => f.id === '380');

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${S} ${S}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Globo con le spedizioni Technoparts verso oltre 50 paesi');
  svg.innerHTML = `
    <defs>
      <radialGradient id="gSea" cx="38%" cy="32%" r="75%">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9e7e3"/>
      </radialGradient>
    </defs>
    <path class="g-sea" fill="url(#gSea)"/>
    <path class="g-grat"/>
    <path class="g-land"/>
    <path class="g-ita"/>
    <g class="g-routes"></g>
    <g class="g-dests"></g>
    <circle class="g-hub-pulse" r="7"/>
    <circle class="g-hub" r="5"/>
    <path class="g-rim"/>`;
  host.appendChild(svg);

  const $ = s => svg.querySelector(s);
  const routesG = $('.g-routes'), destsG = $('.g-dests');
  const routes = dests.map((d, k) => {
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = '<path class="r-base"/><path class="r-flow" pathLength="100"/>';
    g.lastChild.style.animationDelay = (-k * 0.37) + 's';
    routesG.appendChild(g);
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', 3.2);
    destsG.appendChild(c);
    return { g, c, line: { type: 'LineString', coordinates: [hub, d] }, d };
  });

  const proj = d3.geoOrthographic().scale(R).translate([S / 2, S / 2]).clipAngle(90).precision(0.5);
  const path = d3.geoPath(proj);
  const grat = d3.geoGraticule10();
  const sphere = { type: 'Sphere' };
  const landGeo = { type: 'FeatureCollection', features: land };
  const itaGeo = { type: 'FeatureCollection', features: italy };

  const draw = lon => {
    proj.rotate([-lon, -22]);
    $('.g-sea').setAttribute('d', path(sphere));
    $('.g-rim').setAttribute('d', path(sphere));
    $('.g-grat').setAttribute('d', path(grat));
    $('.g-land').setAttribute('d', path(landGeo));
    $('.g-ita').setAttribute('d', path(itaGeo));
    routes.forEach(r => {
      const d = path(r.line) || '';
      r.g.firstChild.setAttribute('d', d);
      r.g.lastChild.setAttribute('d', d);
      const p = proj(r.d), vis = d3.geoDistance(r.d, proj.invert([S / 2, S / 2])) < Math.PI / 2;
      r.c.setAttribute('cx', p[0]); r.c.setAttribute('cy', p[1]);
      r.c.style.display = vis ? '' : 'none';
    });
    const h = proj(hub);
    ['.g-hub', '.g-hub-pulse'].forEach(s => { $(s).setAttribute('cx', h[0]); $(s).setAttribute('cy', h[1]); });
  };

  // oscillazione lenta e continua attorno all'Europa
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let running = false, t0 = performance.now();
  const loop = t => {
    draw(-18 + Math.sin((t - t0) / 11000) * 34);   // da Medio Oriente fino alle Americhe
    if (running) requestAnimationFrame(loop);
  };
  draw(-5);
  if (still) return;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; requestAnimationFrame(loop); }
    else if (!e.isIntersecting) running = false;
  }).observe(host);
})();

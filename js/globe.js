// Mappa piatta con le rotte da Ragusa: flussi continui sulle rotte.
(() => {
  const host = document.getElementById('globe');
  if (!host || !window.d3 || !window.topojson) return;
  const NS = 'http://www.w3.org/2000/svg';
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
  const land = topojson.feature(topo, topo.objects.countries).features.filter(f => f.id !== '010'); // senza Antartide
  const landGeo = { type: 'FeatureCollection', features: land };
  const itaGeo = { type: 'FeatureCollection', features: land.filter(f => f.id === '380') };

  const W = 1000;
  const proj = d3.geoNaturalEarth1().fitWidth(W, landGeo);
  const path = d3.geoPath(proj);
  const H = Math.ceil(path.bounds(landGeo)[1][1]) + 4;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Mappa con le spedizioni Technoparts verso oltre 50 paesi');
  svg.innerHTML = `<path class="g-grat" d="${path(d3.geoGraticule10())}"/>
    <path class="g-land" d="${path(landGeo)}"/>
    <path class="g-ita" d="${path(itaGeo)}"/>
    <g class="g-routes"></g><g class="g-dests"></g>`;
  const rG = svg.querySelector('.g-routes'), dG = svg.querySelector('.g-dests');
  dests.forEach((d, k) => {
    // arco leggermente curvo tra Ragusa e la destinazione
    const a = proj(hub), b = proj(d);
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const c = `${mx},${my - dist * 0.25}`;
    const dd = `M${a}Q${c} ${b}`;
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = `<path class="r-base" d="${dd}"/><path class="r-flow" pathLength="100" d="${dd}" style="animation-delay:${-k * 0.37}s"/>`;
    rG.appendChild(g);
    dG.insertAdjacentHTML('beforeend', `<circle cx="${b[0]}" cy="${b[1]}" r="3"/>`);
  });
  const h = proj(hub);
  svg.insertAdjacentHTML('beforeend', `<circle class="g-hub-pulse" cx="${h[0]}" cy="${h[1]}" r="6"/><circle class="g-hub" cx="${h[0]}" cy="${h[1]}" r="4.5"/>`);
  host.appendChild(svg);
})();

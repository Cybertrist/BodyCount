// La carte des lieux, en usage : l'ouverture serrée sur tes villes, les
// villes qui tombent en pastilles, le pincement qui sépare Vannes d'Auray,
// le bouton qui ramène la vue d'ouverture, puis le classement et les
// visages vus à la première ville.
//
// Le fond est le vrai : les côtes et les départements sont lus dans
// assets/carte/france.bin, comme le fait l'application, puis coupés à la
// Bretagne et allégés. Le cadrage d'ouverture et le regroupement des
// bulles refont les calculs de lib/widgets/plan_france.dart, avec les
// mêmes seuils : ce que montre le téléphone est ce que l'application
// afficherait.
const fs = require('fs');
const path = require('path');

module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, paliers, fondu, visible, entre, telephone, toucher, icone, visage, barreNav, GENS,
    APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR } = O;
  const C = 32;
  const r2 = (v) => Math.round(v * 100) / 100;
  const r1 = (v) => Math.round(v * 10) / 10;

  // ---------------------------------------------------------- la géométrie
  // Le format FRA1 : des couches d'anneaux, chaque point sur deux entiers
  // de seize bits, au 1/2000e de degré depuis (-6°, 41°).
  const bin = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'assets', 'carte', 'france.bin'));
  const couches = [];
  {
    let p = 8;
    const nc = bin.readUInt32LE(4);
    for (let c = 0; c < nc; c++) {
      const na = bin.readUInt32LE(p); p += 4;
      const anneaux = [];
      for (let a = 0; a < na; a++) {
        const n = bin.readUInt32LE(p); p += 4;
        const pts = [];
        for (let i = 0; i < n; i++, p += 4) pts.push([bin.readUInt16LE(p) / 2000 - 6, bin.readUInt16LE(p + 2) / 2000 + 41]);
        anneaux.push(pts);
      }
      couches.push(anneaux);
    }
  }
  /// Coupe un anneau à un rectangle en degrés (Sutherland-Hodgman).
  function couper(pts, [o, s, e, n]) {
    const bords = [
      [(q) => q[0] >= o, (a, b) => { const k = (o - a[0]) / (b[0] - a[0]); return [o, a[1] + k * (b[1] - a[1])]; }],
      [(q) => q[0] <= e, (a, b) => { const k = (e - a[0]) / (b[0] - a[0]); return [e, a[1] + k * (b[1] - a[1])]; }],
      [(q) => q[1] >= s, (a, b) => { const k = (s - a[1]) / (b[1] - a[1]); return [a[0] + k * (b[0] - a[0]), s]; }],
      [(q) => q[1] <= n, (a, b) => { const k = (n - a[1]) / (b[1] - a[1]); return [a[0] + k * (b[0] - a[0]), n]; }],
    ];
    let sortie = pts;
    for (const [dedans, croise] of bords) {
      const entree = sortie;
      sortie = [];
      for (let i = 0; i < entree.length; i++) {
        const a = entree[(i + entree.length - 1) % entree.length], b = entree[i];
        if (dedans(b)) { if (!dedans(a)) sortie.push(croise(a, b)); sortie.push(b); }
        else if (dedans(a)) sortie.push(croise(a, b));
      }
      if (!sortie.length) break;
    }
    return sortie;
  }
  /// Allège un tracé : Douglas-Peucker, tolérance en degrés.
  function alleger(pts, tol) {
    if (pts.length < 4) return pts;
    const garde = new Uint8Array(pts.length);
    garde[0] = garde[pts.length - 1] = 1;
    const pile = [[0, pts.length - 1]];
    while (pile.length) {
      const [i, j] = pile.pop();
      const [ax, ay] = pts[i], [bx, by] = pts[j];
      const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy);
      let max = 0, k = -1;
      for (let m = i + 1; m < j; m++) {
        // Un anneau fermé commence et finit au même point : la distance
        // à un segment nul est alors la distance à ce point.
        const d = l < 1e-9 ? Math.hypot(pts[m][0] - ax, pts[m][1] - ay)
          : Math.abs(dy * pts[m][0] - dx * pts[m][1] + bx * ay - by * ax) / l;
        if (d > max) { max = d; k = m; }
      }
      if (max > tol && k > 0) { garde[k] = 1; pile.push([i, k], [k, j]); }
    }
    return pts.filter((_, i) => garde[i]);
  }

  // --------------------------------------------------- le cadrage (plan_france)
  const W = 246, H = 250; // le cadre de la carte dans le téléphone
  const COS = Math.cos((46.2 * Math.PI) / 180);
  const base = (() => {
    const minX = -5.15 * COS, maxX = 9.66 * COS, minY = -51.09, maxY = -41.33;
    let l = (maxX - minX) * 1.04, h = (maxY - minY) * 1.04;
    if (l / h < W / H) l = h * (W / H); else h = l / (W / H);
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, e: W / l };
  })();
  /// Projection sans zoom, dans le repère du cadre.
  const projBase = (lon, lat) => [W / 2 + (lon * COS - base.cx) * base.e, H / 2 + (-lat - base.cy) * base.e];
  const centre = [W / 2, H / 2];

  // Les villes du jeu d'essai, avec le nombre de rencontres qui y ont eu
  // lieu. Les coordonnées sont celles de assets/carte/communes.txt.
  const VILLES = [
    ['Vannes', 61, -2.748, 47.658], ['Rennes', 15, -1.688, 48.116], ['Lorient', 10, -3.380, 47.749],
    ['Nantes', 6, -1.560, 47.238], ['Auray', 4, -2.990, 47.668], ['Rochefort', 4, -0.963, 45.936],
    ['Marseille', 3, 5.381, 43.280], ['Quimper', 2, -4.097, 47.998], ['Paris', 2, 2.347, 48.859],
    ['La Rochelle', 2, -1.152, 46.160], ['Lyon', 2, 4.835, 45.758],
  ].map(([nom, n, lon, lat]) => ({ nom, n, lon, lat, b: projBase(lon, lat) }));
  const TOTAL = VILLES.reduce((a, v) => a + v.n, 0);
  const MAXI = VILLES[0].n;

  // La vue d'ouverture : de la ville principale, de proche en proche,
  // jusqu'aux deux tiers des rencontres, avec un plancher et une marge.
  const tete = VILLES[0];
  const coeur = [];
  {
    let cumul = 0;
    const triees = [...VILLES].sort((a, b) => ((a.lon - tete.lon) ** 2 + (a.lat - tete.lat) ** 2) - ((b.lon - tete.lon) ** 2 + (b.lat - tete.lat) ** 2));
    for (const v of triees) { coeur.push(v); cumul += v.n; if (cumul * 3 >= TOTAL * 2) break; }
  }
  const xs = coeur.map((v) => v.b[0]), ys = coeur.map((v) => v.b[1]);
  const plancher = Math.min(W, H) * 0.16;
  const Z0 = Math.min(Math.max(1, Math.min(W / (Math.max(Math.max(...xs) - Math.min(...xs), plancher) * 1.45),
    H / (Math.max(Math.max(...ys) - Math.min(...ys), plancher) * 1.45))), 12);
  const borne = (p, z) => {
    const lx = Math.max(0, (W * (z - 1)) / 2), ly = Math.max(0, (H * (z - 1)) / 2);
    return [Math.max(-lx, Math.min(lx, p[0])), Math.max(-ly, Math.min(ly, p[1]))];
  };
  const milieu = [(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2];
  const PAN0 = borne([-(milieu[0] - centre[0]) * Z0, -(milieu[1] - centre[1]) * Z0], Z0);
  const ecranDe = (b, z, pan) => [(b[0] - centre[0]) * z + centre[0] + pan[0], (b[1] - centre[1]) * z + centre[1] + pan[1]];

  // Le pincement : les doigts se posent sur le golfe, et ce point reste
  // sous les doigts (plan_france.dart, _pendantZoom).
  const Z1 = 9.6;
  const golfe = projBase(-2.87, 47.63);
  const FOYER = ecranDe(golfe, Z0, PAN0);
  const ancre = [(FOYER[0] - centre[0] - PAN0[0]) / Z0 + centre[0], (FOYER[1] - centre[1] - PAN0[1]) / Z0 + centre[1]];
  const panDe = (z) => [FOYER[0] - centre[0] - (ancre[0] - centre[0]) * z, FOYER[1] - centre[1] - (ancre[1] - centre[1]) * z];

  // Les instants du cycle.
  const OUVRE = 0.03, TERRE = 0.05, CHUTE = 0.09;
  const PINCE = [0.25, 0.37], RECADRE = 0.54, RETOUR = [0.545, 0.565], DEFILE = [0.63, 0.69], FIN = 0.97;
  /// Le zoom à l'instant [x], par morceaux linéaires.
  const CLES = [[0, Z0], [PINCE[0], Z0], [PINCE[1], Z1], [RETOUR[0], Z1], [RETOUR[1], Z0], [1, Z0]];
  const zoomA = (x) => {
    for (let i = 1; i < CLES.length; i++) {
      const [a, za] = CLES[i - 1], [b, zb] = CLES[i];
      if (x <= b) return za + ((zb - za) * (x - a)) / (b - a || 1);
    }
    return Z0;
  };
  const posA = (b, x) => ecranDe(b, zoomA(x), panDe(zoomA(x)));

  // Le regroupement glouton, rayons de 14 à 22 points, amincis au zoom.
  function grouper(z) {
    const maigreur = Math.max(0.78, Math.min(1, 1 / (1 + (z - 1) * 0.1)));
    const rayon = (n) => (14 + Math.sqrt(Math.min(1, n / MAXI)) * 8) * maigreur;
    const pan = panDe(z);
    let g = VILLES.map((v) => ({ villes: [v], n: v.n, c: ecranDe(v.b, z, pan), r: rayon(v.n) }));
    for (let passe = 0; passe < 8; passe++) {
      g.sort((a, b) => b.n - a.n);
      let fusion = false;
      for (let i = 0; i < g.length; i++) {
        for (let j = i + 1; j < g.length; j++) {
          const a = g[i], b = g[j];
          if (Math.hypot(b.c[0] - a.c[0], b.c[1] - a.c[1]) >= a.r + b.r + 5) continue;
          const n = a.n + b.n;
          g[i] = { villes: [...a.villes, ...b.villes].sort((u, v) => v.n - u.n), n,
            c: [(a.c[0] * a.n + b.c[0] * b.n) / n, (a.c[1] * a.n + b.c[1] * b.n) / n], r: rayon(n) };
          g.splice(j, 1); fusion = true; j--;
        }
      }
      if (!fusion) break;
    }
    return g.map((x) => ({ ...x, cle: x.villes.map((v) => v.nom).sort().join('+') }));
  }
  // On échantillonne le cycle pour savoir quelle bulle existe quand.
  const INSTANTS = [];
  for (let i = 0; i <= 400; i++) INSTANTS.push(i / 400);
  const bulles = new Map();
  INSTANTS.forEach((x) => {
    for (const g of grouper(zoomA(x))) {
      if (!bulles.has(g.cle)) bulles.set(g.cle, { g, instants: [] });
      bulles.get(g.cle).instants.push(x);
    }
  });
  const principale = grouper(Z0);

  // --------------------------------------------------------------- l'écran
  let corps = entete(t('LA CARTE', 'THE MAP'),
    t('Tes villes en pastilles, sur la vraie France. S’approcher les sépare.',
      'Your cities as bubbles, on the real map of France. Moving closer splits them.'));
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  const MX = SX + 12, MY = SY + 64; // le coin du cadre de la carte, à l'ouverture
  const DEFIL = 330;
  let page = '';

  // L'en-tête : l'intitulé à gauche, le nombre de villes à droite.
  page += texte(SX + 18, SY + 44, t('TES LIEUX', 'YOUR PLACES'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' });
  page += `<rect x="${SX + SL - 88}" y="${SY + 27}" width="72" height="26" rx="13" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
    ${texte(SX + SL - 75, SY + 44.5, '11', { taille: 13, couleur: APP.texte, poids: 800 })}
    ${texte(SX + SL - 55, SY + 44.5, t('Villes', 'Cities'), { taille: 10.5, couleur: APP.second, poids: 700 })}`;

  // Le cadre de la carte : la mer, puis tout ce qui se pose dessus.
  const clip = O.id('carte');
  let carte = `<defs>
    <radialGradient id="${clip}mer" cx="30%" cy="25%" r="140%"><stop offset="0" stop-color="#1B1044"/><stop offset="0.5" stop-color="#120B2A"/><stop offset="1" stop-color="#090413"/></radialGradient>
    <linearGradient id="${clip}terre" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B2470"/><stop offset="0.55" stop-color="#2C1857"/><stop offset="1" stop-color="#1E1040"/></linearGradient>
    <linearGradient id="${clip}trait" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.09"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
    <clipPath id="${clip}"><rect x="0" y="0" width="${W}" height="${H}" rx="18"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" rx="18" fill="url(#${clip}mer)"/>`;
  // Quelques étoiles dans la mer, qui scintillent à contretemps.
  const etoilesMer = [[18, 40], [60, 18], [30, 150], [200, 226], [226, 170], [110, 236], [14, 210], [150, 14]];
  etoilesMer.forEach(([x, y], i) => {
    carte += `<circle cx="${x}" cy="${y}" r="0.9" fill="#FFFFFF" opacity="0.3"><animate attributeName="opacity" dur="${3 + (i % 3)}s" begin="${i * 0.4}s" repeatCount="indefinite" values="0.1;0.5;0.1"/></circle>`;
  });

  // La terre : les anneaux coupés au rectangle que la vue peut atteindre.
  const FENETRE = [-5.6, 46.0, -0.6, 49.3];
  const chemin = (anneaux, tol, ferme) => anneaux.map((a) => alleger(couper(a, FENETRE), tol)).filter((a) => a.length > 2)
    .map((a) => 'M' + a.map(([lon, lat]) => projBase(lon, lat).map(r2).join(' ')).join('L') + (ferme ? 'Z' : '')).join('');
  const terre = chemin(couches[0], 0.0028, true);
  const depts = chemin(couches[1], 0.005, true);
  // Le zoom passe par une matrice, comme dans l'application : chaque
  // point du cadre de base va en b × z + (c × (1 - z) + pan).
  const decalage = (z) => { const p = panDe(z); return `${r2(centre[0] * (1 - z) + p[0])} ${r2(centre[1] * (1 - z) + p[1])}`; };
  const cles = CLES.map((c) => c[0]).join(';');
  const matrice = (contenu) => `<g>
    <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${cles}" values="${CLES.map((c) => decalage(c[1])).join(';')}"/>
    <g><animateTransform attributeName="transform" type="scale" dur="${C}s" repeatCount="indefinite" keyTimes="${cles}" values="${CLES.map((c) => r2(c[1])).join(';')}"/>
    ${contenu}</g></g>`;
  const nette = 'vector-effect="non-scaling-stroke" stroke-linejoin="round"';
  carte += `<g opacity="0">${fondu('opacity', C, [[0, 0], [TERRE, 0], [TERRE + 0.03, 1], [FIN, 1], [FIN + 0.01, 0], [1, 0]])}
    ${matrice(`<path d="${terre}" fill="none" stroke="${VIOLET}" stroke-opacity="0.12" stroke-width="7" ${nette}/>
      <path d="${terre}" fill="url(#${clip}terre)" fill-rule="nonzero"/>
      <path d="${depts}" fill="none" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="0.6" ${nette}/>
      <path d="${terre}" fill="none" stroke="${APP.rose}" stroke-opacity="0.55" stroke-width="1" ${nette}/>`)}
  </g>`;
  // Le trait de lumière qui traverse la carte une fois, à l'ouverture.
  carte += `<rect x="-120" y="0" width="120" height="${H}" fill="url(#${clip}trait)" opacity="0">
    ${fondu('x', C, [[0, -120], [TERRE, -120], [TERRE + 0.05, W], [1, W]])}
    ${visible(C, TERRE, TERRE + 0.05, 0.004)}</rect>`;

  // Les liaisons depuis la ville principale, avec une navette : dans la
  // matrice, donc de vrais trajets, plus longs vers Nantes que vers Auray.
  const liaisons = VILLES.slice(1).filter((v) => v.lon < 0 && v.lat > 46.3);
  const lignesVisibles = (v) => {
    const b = [...bulles.values()].find((x) => x.g.villes.length === 1 && x.g.villes[0].nom === v.nom);
    return b ? b.instants : [];
  };
  let liens = '';
  liaisons.forEach((v, i) => {
    const vus = lignesVisibles(v);
    if (!vus.length) return;
    // La ligne n'existe que tant que la ville a sa propre bulle.
    const etapes = [[0, 0]];
    INSTANTS.forEach((x) => etapes.push([x, vus.includes(x) && x >= CHUTE + 0.1 && x < FIN ? 1 : 0]));
    const simples = etapes.filter((e, k) => k === 0 || k === etapes.length - 1 || e[1] !== etapes[k - 1][1] || e[1] !== etapes[k + 1][1]);
    const d = `M${tete.b.map(r2).join(' ')}L${v.b.map(r2).join(' ')}`;
    const longueur = Math.hypot(v.b[0] - tete.b[0], v.b[1] - tete.b[1]);
    liens += `<g opacity="0">${paliers('opacity', C, simples.map((e) => [r2(e[0]) === 1 ? 1 : e[0], e[1]]).filter((e, k, a) => k === 0 || e[0] > a[k - 1][0]))}
      <path d="${d}" fill="none" stroke="${ACCENT}" stroke-opacity="0.28" stroke-width="1" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"/>
      <circle r="0.4" fill="#FFFFFF">
        <animate attributeName="r" dur="${C}s" repeatCount="indefinite" keyTimes="${cles}" values="${CLES.map((c) => r2(1.7 / c[1])).join(';')}"/>
        <animateMotion dur="${r1(1.2 + longueur * 0.9)}s" begin="${i * 0.7}s" repeatCount="indefinite" path="${d}"/>
      </circle></g>`;
  });
  carte += matrice(liens);

  // Les rencontres posées à la main : un point blanc cerclé de fuchsia,
  // qui s'allume au-delà de 2,5×, taille fixe à l'écran.
  const POINTS = [[-2.824, 47.633], [-2.905, 47.592], [-2.712, 47.616]];
  POINTS.forEach(([lon, lat]) => {
    const b = projBase(lon, lat);
    carte += `<g opacity="0">${fondu('opacity', C, [[0, 0], [CHUTE + 0.08, 0], [CHUTE + 0.1, 1], [FIN, 1], [FIN + 0.01, 0], [1, 0]])}
      <g><animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${cles}" values="${CLES.map((c) => posA(b, c[0]).map(r2).join(' ')).join(';')}"/>
        <circle r="8" fill="${APP.fuchsia}" opacity="0.18"><animate attributeName="r" dur="2.4s" repeatCount="indefinite" values="6;9;6"/></circle>
        <circle r="2.6" fill="#FFFFFF"/></g></g>`;
  });

  // Les bulles. Chacune suit sa position à l'écran d'un instant clé à
  // l'autre, et n'existe que tant que le regroupement la fait exister.
  const teinte = (part) => {
    const a = [0x7c, 0x3a, 0xed], b = [0xf0, 0xab, 0xfc];
    return '#' + a.map((x, i) => Math.round(x + (b[i] - x) * part).toString(16).padStart(2, '0')).join('');
  };
  const eclaircir = (hex, k, vers = [255, 255, 255]) => '#' + [1, 3, 5].map((i, j) => {
    const x = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(x + (vers[j] - x) * k).toString(16).padStart(2, '0');
  }).join('');
  const rangs = principale.map((g) => g.cle);
  let pastilles = '', noms = '';
  let nGrad = 0;
  for (const [cle, { g, instants }] of bulles) {
    // Hors du cadre de la carte à tout instant : rien à dessiner.
    const pos = (x) => {
      const z = zoomA(x), pan = panDe(z);
      const pts = g.villes.map((v) => ecranDe(v.b, z, pan));
      return [pts.reduce((a, p, k) => a + p[0] * g.villes[k].n, 0) / g.n, pts.reduce((a, p, k) => a + p[1] * g.villes[k].n, 0) / g.n];
    };
    const dedans = instants.some((x) => { const p = pos(x); return p[0] > -20 && p[0] < W + 20 && p[1] > -20 && p[1] < H + 20; });
    if (!dedans) continue;
    // La visibilité : les instants où la bulle existe, après sa chute.
    const rang = Math.max(0, rangs.indexOf(cle));
    const tombe = CHUTE + (rangs.includes(cle) ? rang * 0.018 : 0);
    const etat = INSTANTS.map((x) => [x, instants.includes(x) && x >= tombe && x < FIN ? 1 : 0]);
    const vis = [[0, etat[0][1]]];
    for (let k = 1; k < etat.length; k++) if (etat[k][1] !== etat[k - 1][1]) vis.push([etat[k][0], etat[k][1]]);
    // Ses positions aux instants clés, plus celles des bascules.
    const tps = [...new Set([...CLES.map((c) => c[0]), ...vis.map((v) => v[0])])].sort((a, b) => a - b);
    const part = Math.min(1, g.n / MAXI);
    const tn = teinte(part);
    const gid = `${clip}b${nGrad++}`;
    const dy = rangs.includes(cle) ? 18 : 0;
    pastilles += `<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${eclaircir(tn, 0.34)}"/><stop offset="0.46" stop-color="${tn}"/><stop offset="1" stop-color="${eclaircir(tn, 0.45, [0x2e, 0x10, 0x65])}"/></linearGradient>
    <g opacity="0">${paliers('opacity', C, vis)}
      <g><animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${tps.join(';')}" values="${tps.map((x) => pos(x).map(r2).join(' ')).join(';')}"/>
        <g>${dy ? `<animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${r2(tombe)};${(tombe + 0.02).toFixed(3)};${(tombe + 0.026).toFixed(3)};1" values="0 -${dy};0 -${dy};0 2;0 0;0 0"/>` : ''}
          ${g.villes[0].nom === 'Vannes' ? [0, 1].map((k) => `<circle r="${g.r}" fill="none" stroke="${ACCENT}" stroke-width="1.6" opacity="0">
            <animate attributeName="r" dur="3.2s" begin="${k * 1.6}s" repeatCount="indefinite" keyTimes="0;0.55;1" values="${r1(g.r)};${r1(g.r * 3.4)};${r1(g.r * 3.4)}"/>
            <animate attributeName="opacity" dur="3.2s" begin="${k * 1.6}s" repeatCount="indefinite" keyTimes="0;0.55;1" values="0.45;0;0"/></circle>`).join('') : ''}
          <circle r="${r1(g.r - 2)}" cy="4" fill="#000000" opacity="0.35"/>
          <circle r="${r1(g.r + 3)}" fill="${tn}" opacity="0.25"/>
          <circle r="${r1(g.r)}" fill="url(#${gid})" stroke="#FFFFFF" stroke-opacity="0.42" stroke-width="1.4"/>
          ${texte(0, r1((11.5 + part * 3) * 0.36), String(g.n), { taille: r1(11.5 + part * 3), couleur: '#FFFFFF', poids: 800, ancre: 'middle' })}
        </g></g></g>`;
    // Le nom, toujours dessous, sur une étiquette sombre.
    const nom = g.villes[0].nom.toUpperCase();
    const ln = nom.length * 5.9 + 12;
    noms += `<g opacity="0">${paliers('opacity', C, vis.map(([x, v]) => [x, v && x >= tombe ? 1 : v]))}
      <g><animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${tps.join(';')}" values="${tps.map((x) => { const p = pos(x); return `${r2(p[0])} ${r2(p[1] + g.r + 4)}`; }).join(';')}"/>
        <rect x="${r1(-ln / 2)}" y="0" width="${r1(ln)}" height="15" rx="7.5" fill="#090413" fill-opacity="0.7" stroke="#FFFFFF" stroke-opacity="0.11"/>
        ${texte(0, 10.8, nom, { taille: 8.5, couleur: '#FFFFFF', poids: 800, ancre: 'middle', extra: 'letter-spacing="0.55" fill-opacity="0.92"' })}
      </g></g>`;
  }
  carte += noms + pastilles;

  // La règle graphique, en bas à gauche : 100 km à l'ouverture, 50 km
  // une fois approché.
  const regle = (z) => {
    const kmParPx = 111.2 / (base.e * z);
    const km = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].find((k) => k / kmParPx >= 46) || 1000;
    return { km, l: Math.max(36, Math.min(W / 2, km / kmParPx)) };
  };
  const R0 = regle(Z0), R1 = regle(Z1);
  const dessinRegle = (R) => `<path d="M15 ${H - 17.5}v7M15 ${H - 14}h${r1(R.l)}M${r1(15 + R.l)} ${H - 17.5}v7" stroke="#FFFFFF" stroke-opacity="0.34" stroke-width="1.2" fill="none"/>
    ${texte(r1(15 + R.l / 2), H - 22, `${R.km} km`, { taille: 8, couleur: '#FFFFFF', poids: 700, ancre: 'middle', extra: 'fill-opacity="0.45"' })}`;
  const MILIEU = (PINCE[0] + PINCE[1]) / 2;
  carte += entre(C, TERRE + 0.02, MILIEU, dessinRegle(R0), 0.004) + entre(C, MILIEU, RETOUR[0] + 0.01, dessinRegle(R1), 0.004)
    + entre(C, RETOUR[0] + 0.01, FIN, dessinRegle(R0), 0.004);

  // Le bouton qui remet la vue d'ouverture, avec le facteur de zoom.
  const facteur = (z) => z.toFixed(1).replace('.', t(',', '.')) + '×';
  const etapesZoom = [];
  for (let k = 0; k <= 6; k++) etapesZoom.push(PINCE[0] + ((PINCE[1] - PINCE[0]) * k) / 6);
  let bouton = `<rect x="${W - 70}" y="10" width="60" height="24" rx="12" fill="#090413" fill-opacity="0.8" stroke="#FFFFFF" stroke-opacity="0.16"/>
    <path d="M${W - 60} 18v-3h3M${W - 51} 15h3v3M${W - 48} 26v3h-3M${W - 57} 29h-3v-3" fill="none" stroke="${APP.rose}" stroke-width="1.4" stroke-linecap="round"/>`;
  const valeurs = [[0, Z0], ...etapesZoom.map((x) => [x, zoomA(x)]), [RETOUR[0] + 0.004, Z0]];
  valeurs.forEach(([x, z], k) => {
    const fin = k + 1 < valeurs.length ? valeurs[k + 1][0] : 1;
    bouton += `<g opacity="${k === 0 ? 1 : 0}">${paliers('opacity', C, k === 0 ? [[0, 1], [valeurs[1][0], 0], [RETOUR[0] + 0.004, 1]] : [[0, 0], [x, 1], [fin, 0]])}
      ${texte(W - 43, 26, facteur(z), { taille: 10, couleur: APP.rose, poids: 800 })}</g>`;
  });
  carte += entre(C, CHUTE, FIN, bouton, 0.006);
  page += `<g transform="translate(${MX} ${MY})"><g clip-path="url(#${clip})">${carte}</g></g>`;

  // Le classement, sous la carte : huit villes au plus, en barres.
  const PY = SY + 330;
  const CLASSEMENT = VILLES.slice().sort((a, b) => b.n - a.n).slice(0, 8);
  page += `<rect x="${SX + 12}" y="${PY}" width="${W}" height="322" rx="18" fill="#FFFFFF" fill-opacity="0.043" stroke="${APP.bord}"/>
    ${texte(SX + 28, PY + 26, t('CLASSEMENT', 'RANKING'), { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}`;
  CLASSEMENT.forEach((v, i) => {
    const y = PY + 52 + i * 34, lb = W - 32, part = v.n / MAXI;
    const pc = Math.round((v.n * 100) / TOTAL);
    page += `${texte(SX + 28, y, v.nom, { taille: 12, couleur: i === 0 ? '#E9D5FF' : APP.texte, poids: i === 0 ? 800 : 600 })}
      ${texte(SX + W - 22, y, `${pc} %`, { taille: 9.5, couleur: APP.discret, poids: 700, ancre: 'end' })}
      ${texte(SX + W - 50, y, String(v.n), { taille: 12, couleur: '#FFFFFF', poids: 800, ancre: 'end' })}
      <rect x="${SX + 28}" y="${y + 8}" width="${lb}" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.06"/>
      <rect x="${SX + 28}" y="${y + 8}" height="6" rx="3" width="0" fill="${i === 0 ? APP.fuchsia : APP.violet}">
        ${fondu('width', C, [[0, 0], [CHUTE + 0.02 + i * 0.006, 0], [CHUTE + 0.05 + i * 0.008, r1(lb * part)], [FIN, r1(lb * part)], [FIN + 0.01, 0], [1, 0]])}</rect>`;
  });
  // Les visages vus à la première ville.
  const VY = PY + 338;
  page += `<rect x="${SX + 12}" y="${VY}" width="${W}" height="140" rx="18" fill="#FFFFFF" fill-opacity="0.043" stroke="${APP.bord}"/>
    ${texte(SX + 28, VY + 26, t('VU À VANNES', 'SEEN IN VANNES'), { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}`;
  [GENS.noa, GENS.lou, GENS.ibrahim, GENS.enzo].forEach((p, i) => {
    const x = SX + 28 + i * 70, y = VY + 40;
    page += `${visage(p.photo, x, y, 62, 84, 16)}
      <rect x="${x}" y="${y}" width="62" height="84" rx="16" fill="url(#voile)"/>
      ${texte(x + 31, y + 76, p.prenom, { taille: 9.5, couleur: '#FFFFFF', poids: 800, ancre: 'middle' })}`;
  });

  // Le défilement vers le classement, puis le retour en haut.
  let ecran = `<g opacity="0">${fondu('opacity', C, [[0, 0], [OUVRE, 0], [OUVRE + 0.015, 1], [FIN, 1], [FIN + 0.012, 0], [1, 0]])}
    <g>${fondu('transform', C, [])}
    <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${DEFILE[0]};${DEFILE[1]};1" values="0 0;0 0;0 -${DEFIL};0 -${DEFIL}"/>
    ${page}</g>
    ${barreNav(T, 'Carte')}
  </g>`.replace(`${fondu('transform', C, [])}`, '');
  // Les gestes : deux doigts qui s'écartent sur le golfe, le toucher sur
  // le bouton, le glissement vers le bas de la page.
  const fx = MX + FOYER[0], fy = MY + FOYER[1];
  const doigt = (dx0, dy0, dx1, dy1) => `<circle r="13" fill="#FFFFFF" fill-opacity="0.28" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.5" opacity="0">
      ${visible(C, PINCE[0] - 0.01, PINCE[1] + 0.005, 0.004)}
      ${fondu('cx', C, [[0, fx + dx0], [PINCE[0], fx + dx0], [PINCE[1], fx + dx1], [1, fx + dx1]])}
      ${fondu('cy', C, [[0, fy + dy0], [PINCE[0], fy + dy0], [PINCE[1], fy + dy1], [1, fy + dy1]])}</circle>`;
  ecran += doigt(-10, 8, -58, 48) + doigt(10, -8, 58, -48);
  ecran += toucher(MX + W - 40, MY + 22, C, RECADRE);
  ecran += `<circle r="13" fill="#FFFFFF" fill-opacity="0.28" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.5" cx="${SX + SL / 2 + 60}" opacity="0">
      ${visible(C, DEFILE[0] - 0.01, DEFILE[1], 0.004)}
      ${fondu('cy', C, [[0, SY + 440], [DEFILE[0], SY + 440], [DEFILE[1], SY + 200], [1, SY + 200]])}</circle>`;
  corps += T.ecran(ecran);

  // ---------------------------------------------- à droite : le cadrage
  const AX = 400, AL = 380, AY = 108;
  corps += rubrique(AX, AY, t('LE CADRAGE D’OUVERTURE', 'THE OPENING VIEW'));
  corps += `<rect x="${AX}" y="${AY + 18}" width="${AL}" height="236" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  // La France entière, en miniature, et le cadre de la vue dessus.
  const mini = { x: AX + 18, y: AY + 34, cote: 150 };
  const mk = mini.cote / (Math.max((9.66 + 5.15) * COS, 51.09 - 41.33) * 1.02);
  const miniDe = (lon, lat) => [mini.x + mini.cote / 2 + (lon * COS - base.cx) * mk, mini.y + mini.cote / 2 + (-lat - base.cy) * mk];
  const contour = couches[0].filter((a) => a.length > 300).map((a) => 'M' + alleger(a, 0.06).map(([lon, lat]) => miniDe(lon, lat).map(r1).join(' ')).join('L') + 'Z').join('');
  corps += `<path d="${contour}" fill="#2C1857" stroke="${APP.rose}" stroke-opacity="0.45" stroke-width="0.8"/>`;
  VILLES.forEach((v) => {
    const [x, y] = miniDe(v.lon, v.lat);
    const dansCoeur = coeur.includes(v);
    corps += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(1.8 + Math.sqrt(v.n / MAXI) * 3)}" fill="${teinte(v.n / MAXI)}"/>`;
    if (dansCoeur) corps += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(4 + Math.sqrt(v.n / MAXI) * 3)}" fill="none" stroke="${VERT}" stroke-width="1" opacity="0">${visible(C, CHUTE, PINCE[0])}</circle>`;
  });
  // Le cadre de la vue : ce qu'on voit à chaque zoom, en degrés.
  const vue = (z) => {
    const p = panDe(z);
    // Les coins de l'écran ramenés dans le repère de base, puis en degrés.
    const coin = (sx, sy) => { const bx = (sx - centre[0] - p[0]) / z + centre[0], by = (sy - centre[1] - p[1]) / z + centre[1]; return [((bx - W / 2) / base.e + base.cx) / COS, -((by - H / 2) / base.e + base.cy)]; };
    const [o, n] = coin(0, 0), [e, s] = coin(W, H);
    const [x0, y0] = miniDe(o, n), [x1, y1] = miniDe(e, s);
    return [r1(x0), r1(y0), r1(x1 - x0), r1(y1 - y0)];
  };
  const V = CLES.map(([x, z]) => vue(z));
  corps += `<rect fill="${ACCENT}" fill-opacity="0.12" stroke="${ACCENT}" stroke-width="1.4" rx="2" x="${V[0][0]}" y="${V[0][1]}" width="${V[0][2]}" height="${V[0][3]}" opacity="0">
    ${visible(C, TERRE, FIN)}
    ${['x', 'y', 'width', 'height'].map((a, k) => `<animate attributeName="${a}" dur="${C}s" repeatCount="indefinite" keyTimes="${cles}" values="${V.map((v) => v[k]).join(';')}"/>`).join('')}
  </rect>`;
  corps += texte(mini.x + mini.cote / 2, mini.y + mini.cote + 22, t('La vue, sur la France entière', 'The view, over all of France'), { taille: 11, couleur: DISCRET, ancre: 'middle' });
  // La somme qui s'arrête aux deux tiers.
  const TX = AX + 196;
  corps += texte(TX, AY + 52, t('Serrée sur tes villes :', 'Tight on your cities:'), { taille: 13.5, couleur: TITRE, poids: 700 });
  corps += texte(TX, AY + 71, t('de la principale, de proche', 'from the main one, nearest'), { taille: 12 });
  corps += texte(TX, AY + 88, t('en proche, jusqu’aux deux', 'first, until two thirds of'), { taille: 12 });
  corps += texte(TX, AY + 105, t('tiers des rencontres.', 'your encounters are in.'), { taille: 12 });
  let cumul = 0;
  coeur.forEach((v, i) => {
    cumul += v.n;
    const a = CHUTE + i * 0.02;
    corps += entre(C, a, FIN, `${texte(TX, AY + 134 + i * 19, (i ? '+ ' : '') + v.nom, { taille: 12.5, couleur: TEXTE, police: MONO })}
      ${texte(TX + 164, AY + 134 + i * 19, String(v.n), { taille: 12.5, couleur: TITRE, police: MONO, poids: 700, ancre: 'end' })}`, 0.006);
  });
  const ay = AY + 134 + coeur.length * 19;
  corps += entre(C, CHUTE + coeur.length * 0.02, FIN, `<line x1="${TX}" y1="${ay - 11}" x2="${TX + 164}" y2="${ay - 11}" stroke="${FIL}"/>
    ${texte(TX, ay + 6, t(`${cumul} sur ${TOTAL}`, `${cumul} of ${TOTAL}`), { taille: 12.5, couleur: VERT, police: MONO, poids: 700 })}
    ${texte(TX + 164, ay + 6, facteur(Z0), { taille: 12.5, couleur: ACCENT, police: MONO, poids: 700, ancre: 'end' })}`, 0.006);
  corps += texte(AX + 18, AY + 238, t('Paris, Lyon, Marseille restent hors du cadre : à un pincement.', 'Paris, Lyon, Marseille stay out of frame: one pinch away.'), { taille: 12, couleur: TEXTE });

  // ---------------------------------------------- à droite : les bulles
  const BX = 820, BL = 400, BY = 108;
  corps += rubrique(BX, BY, t('LES BULLES', 'THE BUBBLES'));
  corps += `<rect x="${BX}" y="${BY + 18}" width="${BL}" height="236" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  // Vannes et Auray, en grand : réunies à l'ouverture, séparées à 9,6×.
  const K = 1.7, DCX = BX + 100, DCY = BY + 118;
  const [gv, ga] = [grouper(Z1).find((g) => g.cle === 'Vannes'), grouper(Z1).find((g) => g.cle === 'Auray')];
  const gm = principale.find((g) => g.cle.includes('Vannes'));
  const ecart0 = Math.hypot(...[0, 1].map((k) => ecranDe(VILLES[4].b, Z0, PAN0)[k] - ecranDe(tete.b, Z0, PAN0)[k]));
  const ecart1 = Math.hypot(...[0, 1].map((k) => gv.c[k] - ga.c[k]));
  const bascule = INSTANTS.find((x) => x > PINCE[0] && !bulles.get(gm.cle).instants.includes(x)) || MILIEU;
  const retour = INSTANTS.find((x) => x > RETOUR[0] && bulles.get(gm.cle).instants.includes(x)) || RETOUR[1];
  // L'écart suit le zoom, et les deux disques s'écartent avec lui.
  const ecartA = (z) => ecart0 * (z / Z0) * K;
  const tA = [0, PINCE[0], PINCE[1], RETOUR[0], RETOUR[1], 1];
  const disque = (r, n, part, cx, fill) => `<circle r="${r1(r * K)}" fill="${fill}" stroke="#FFFFFF" stroke-opacity="0.42" stroke-width="1.4"/>
    ${texte(0, r1((11.5 + part * 3) * K * 0.36), String(n), { taille: r1((11.5 + part * 3) * K), couleur: '#FFFFFF', poids: 800, ancre: 'middle' })}`;
  corps += `<linearGradient id="${clip}dv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${eclaircir(teinte(1), 0.34)}"/><stop offset="0.46" stop-color="${teinte(1)}"/><stop offset="1" stop-color="${eclaircir(teinte(1), 0.45, [0x2e, 0x10, 0x65])}"/></linearGradient>
    <linearGradient id="${clip}da" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${eclaircir(teinte(4 / 61), 0.34)}"/><stop offset="0.46" stop-color="${teinte(4 / 61)}"/><stop offset="1" stop-color="${eclaircir(teinte(4 / 61), 0.45, [0x2e, 0x10, 0x65])}"/></linearGradient>`;
  // Les deux disques séparés, et la cote entre eux.
  const posDisque = (signe, poids) => tA.map((x) => `${r1(DCX + signe * ecartA(zoomA(x)) * poids)} ${DCY}`).join(';');
  const separes = [[0, 0], [bascule, 1], [retour, 0]];
  corps += `<g opacity="0">${paliers('opacity', C, separes)}
    <g>${`<animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${tA.join(';')}" values="${posDisque(1, 4 / 65)}"/>`}${disque(gv.r, 61, 1, 0, `url(#${clip}dv)`)}</g>
    <g>${`<animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${tA.join(';')}" values="${posDisque(-1, 61 / 65)}"/>`}${disque(ga.r, 4, 4 / 61, 0, `url(#${clip}da)`)}</g>
    ${texte(DCX - ecartA(Z1) * (61 / 65), DCY + ga.r * K + 22, 'AURAY', { taille: 9.5, couleur: TEXTE, poids: 800, ancre: 'middle', extra: 'letter-spacing="0.6"' })}
    ${texte(DCX + ecartA(Z1) * (4 / 65), DCY + gv.r * K + 22, 'VANNES', { taille: 9.5, couleur: TEXTE, poids: 800, ancre: 'middle', extra: 'letter-spacing="0.6"' })}
  </g>`;
  corps += `<g opacity="1">${paliers('opacity', C, [[0, 1], [bascule, 0], [retour, 1]])}
    <g transform="translate(${DCX} ${DCY})">
      <circle r="${r1(gm.r * K + 5)}" fill="${teinte(1)}" opacity="0.2"/>
      ${disque(gm.r, 65, 1, 0, `url(#${clip}dv)`)}</g>
    ${texte(DCX, DCY + gm.r * K + 22, 'VANNES', { taille: 9.5, couleur: TEXTE, poids: 800, ancre: 'middle', extra: 'letter-spacing="0.6"' })}
  </g>`;
  // La règle du regroupement, avec les vraies valeurs.
  const rv = gv.r, ra = ga.r;
  const seuil = r1(rv + ra + 5);
  corps += `<g>${paliers('opacity', C, [[0, 1], [bascule, 0], [retour, 1]])}
    ${texte(BX + 20, BY + 222, t(`écart ${Math.round(ecart0)} pt  <  ${Math.round(rv)} + ${Math.round(ra)} + 5`, `gap ${Math.round(ecart0)} pt  <  ${Math.round(rv)} + ${Math.round(ra)} + 5`), { taille: 12.5, couleur: ACCENT, police: MONO, poids: 700 })}
    ${texte(BX + 20, BY + 240, t(`à ${facteur(Z0)} : une seule bulle, 61 + 4`, `at ${facteur(Z0)}: a single bubble, 61 + 4`), { taille: 11.5, couleur: TEXTE, police: MONO })}</g>
  <g opacity="0">${paliers('opacity', C, [[0, 0], [bascule, 1], [retour, 0]])}
    ${texte(BX + 20, BY + 222, t(`écart ${Math.round(ecart1)} pt  ≥  ${Math.round(rv)} + ${Math.round(ra)} + 5`, `gap ${Math.round(ecart1)} pt  ≥  ${Math.round(rv)} + ${Math.round(ra)} + 5`), { taille: 12.5, couleur: VERT, police: MONO, poids: 700 })}
    ${texte(BX + 20, BY + 240, t(`à ${facteur(Z1)} : deux bulles, 17 km les séparent`, `at ${facteur(Z1)}: two bubbles, 17 km apart`), { taille: 11.5, couleur: TEXTE, police: MONO })}</g>`;
  void seuil;
  const QX = BX + 214;
  corps += texte(QX, BY + 52, t('Trop proches pour tenir', 'Too close to sit side'), { taille: 13.5, couleur: TITRE, poids: 700 });
  corps += texte(QX, BY + 70, t('côte à côte ?', 'by side?'), { taille: 13.5, couleur: TITRE, poids: 700 });
  corps += texte(QX, BY + 92, t('Une bulle, qui porte la', 'One bubble, carrying the'), { taille: 12 });
  corps += texte(QX, BY + 109, t('somme et le nom de la', 'sum and the name of the'), { taille: 12 });
  corps += texte(QX, BY + 126, t('plus fréquentée.', 'busiest one.'), { taille: 12 });
  corps += texte(QX, BY + 152, t('Les disques ne bougent', 'The disks never move'), { taille: 12 });
  corps += texte(QX, BY + 169, t('jamais d’un point :', 'by a single point:'), { taille: 12 });
  corps += texte(QX, BY + 186, t('s’approcher les sépare.', 'moving closer splits them.'), { taille: 12, couleur: VERT, poids: 700 });

  // ------------------------------------------------ ce qui se passe
  const EY = 390;
  corps += `<rect x="400" y="${EY}" width="820" height="58" rx="13" fill="${CARTE}" stroke="${BORD}"/>`;
  const phases = [
    [0, CHUTE + 0.1, VIOLET, t('L’arrivée', 'Arrival'), t('La terre monte, un trait de lumière passe, les villes tombent, les plus grosses d’abord.', 'The land rises, a streak of light passes, the cities drop in, biggest first.')],
    [CHUTE + 0.1, PINCE[0], ACCENT, t('La vie', 'Idle'), t('Deux ondes sur la ville principale, une navette vers chaque autre ville.', 'Two ripples on the main city, a shuttle to every other one.')],
    [PINCE[0], PINCE[1] + 0.01, OR, t('Pincer', 'Pinch'), t('Le point sous les doigts reste immobile, la règle passe de 100 à 50 km.', 'The point under your fingers stays put, the scale bar goes from 100 to 50 km.')],
    [PINCE[1] + 0.01, RECADRE, VERT, t('À 9,6×', 'At 9.6×'), t('Vannes et Auray se séparent. Les points posés à la main sont là, en blanc.', 'Vannes and Auray split apart. The pins placed by hand show up in white.')],
    [RECADRE, DEFILE[0], ACCENT, t('Le bouton', 'The button'), t('Il ramène la vue d’ouverture, serrée sur tes villes, pas la France entière.', 'It brings back the opening view, tight on your cities, not the whole of France.')],
    [DEFILE[0], FIN, VIOLET, t('Plus bas', 'Further down'), t('Le classement, huit villes au plus, puis les visages vus à la première.', 'The ranking, eight cities at most, then the faces seen in the top one.')],
  ];
  phases.forEach(([de, a, c, titre, phrase], i) => {
    // Un court blanc entre deux phases : un fondu enchaîné superposerait
    // les deux phrases.
    corps += entre(C, i ? de + 0.008 : de, a, `<circle cx="424" cy="${EY + 29}" r="5" fill="${c}"/>
      ${texte(442, EY + 34, titre, { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(442 + titre.length * 8.9 + 16, EY + 34, phrase, { taille: 13 })}`, 0.004);
  });

  // ------------------------------------------------ trois cartes du bas
  const bas = [
    [VIOLET, t('La couleur dit combien', 'Colour tells how many'),
      t('Du violet au rose pâle, selon la', 'From violet to pale pink, by its'), t('part de la ville la plus vue.', 'share of the busiest city.')],
    [ACCENT, t('Toujours le nombre', 'Always the number'),
      t('De 14 à 22 points, chaque disque', 'From 14 to 22 points, every disk'), t('a la place d’écrire deux chiffres.', 'has room for two digits.')],
    [VERT, t('Aucune tuile', 'No tiles'),
      t('Aucun serveur ne sait quel coin', 'No server knows which corner'), t('de la carte tu regardes.', 'of the map you are looking at.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = 400 + i * 280, y = 464;
    corps += `<rect x="${x}" y="${y}" width="260" height="92" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y + 14}" width="3" height="64" rx="1.5" fill="${c}"/>
      ${texte(x + 20, y + 31, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 53, l1, { taille: 12 })}
      ${texte(x + 20, y + 71, l2, { taille: 12 })}`;
    if (i === 0) {
      const g = O.id('degrade');
      corps += `<linearGradient id="${g}"><stop offset="0" stop-color="${teinte(0)}"/><stop offset="1" stop-color="${teinte(1)}"/></linearGradient>
        <rect x="${x + 196}" y="${y + 21}" width="48" height="8" rx="4" fill="url(#${g})"/>`;
    }
  });

  // ------------------------------------------------ le point précis
  const PX = 400, PYb = 572;
  corps += `<rect x="${PX}" y="${PYb}" width="820" height="100" rx="13" fill="${CARTE}" stroke="${BORD}"/>`;
  // Une vignette : les communes voisines comme repères, et l'épingle.
  const vg = O.id('point');
  corps += `<clipPath id="${vg}"><rect x="${PX + 14}" y="${PYb + 12}" width="170" height="76" rx="10"/></clipPath>
    <g clip-path="url(#${vg})"><rect x="${PX + 14}" y="${PYb + 12}" width="170" height="76" fill="#2C1857"/>`;
  const COMMUNES = [['Vannes', -2.748, 47.658], ['Arradon', -2.824, 47.633], ['Séné', -2.739, 47.623], ['Baden', -2.904, 47.606], ['Larmor-Baden', -2.899, 47.586]];
  const vp = (lon, lat) => [PX + 92 + (lon + 2.82) * COS * 820, PYb + 54 + (47.622 - lat) * 820];
  COMMUNES.forEach(([nom, lon, lat]) => {
    const [x, y] = vp(lon, lat);
    corps += `<circle cx="${r1(x)}" cy="${r1(y)}" r="1.8" fill="#FFFFFF" fill-opacity="0.8"/>${texte(r1(x + 5), r1(y + 3.5), nom, { taille: 9, couleur: '#FFFFFF', poids: 700, extra: 'fill-opacity="0.85"' })}`;
  });
  const [ex, ey] = vp(-2.79, 47.596);
  corps += `<g transform="translate(${r1(ex)} ${r1(ey)})"><circle r="7" fill="${APP.fuchsia}" opacity="0.25"/>
      <path d="M0 0 C0 0 -6 -8 -6 -12 a6 6 0 0 1 12 0 C6 -8 0 0 0 0 Z" fill="${APP.fuchsia}" stroke="#FFFFFF" stroke-width="1"/><circle cy="-12" r="2.2" fill="#FFFFFF"/>
      <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="0;0.6;0.63;0.64;1" values="${r1(ex)} ${r1(ey - 16)};${r1(ex)} ${r1(ey - 16)};${r1(ex)} ${r1(ey + 1)};${r1(ex)} ${r1(ey)};${r1(ex)} ${r1(ey)}"/></g>
    </g>`;
  corps += texte(PX + 204, PYb + 32, t('Point précis, pour une rencontre', 'Exact spot, for an encounter'), { taille: 14, couleur: TITRE, poids: 700 });
  corps += texte(PX + 204, PYb + 54, t('Sans tuiles, pas de rues : les communes voisines servent de repère, les plus peuplées d’abord.', 'No tiles, so no streets: nearby towns serve as landmarks, the most populated first.'), { taille: 12.5 });
  corps += texte(PX + 204, PYb + 73, t('De quoi poser un point entre Arradon et Séné. Sur la carte, il s’allume dès 2,5×,', 'Enough to drop a pin between Arradon and Séné. On the map, it lights up from 2.5×,'), { taille: 12.5 });
  corps += texte(PX + 204, PYb + 90, t('en blanc cerclé de fuchsia : à l’échelle du pays, il se confondrait avec les villes.', 'white ringed with fuchsia: at country scale it would blur into the cities.'), { taille: 12.5 });

  svg('carte.svg', 1280, 720, corps, t(
    `L’écran Carte de BodyCount. La vue s’ouvre serrée sur tes villes : de la principale, de proche en proche, jusqu’aux deux tiers des rencontres, ici Vannes, Auray et Lorient, soit ${facteur(Z0)}. La terre monte, les villes tombent en pastilles qui portent leur nombre, les plus grosses d’abord, avec deux ondes sur Vannes et une navette vers chaque autre ville. Vannes et Auray, trop proches à cette échelle, forment une seule bulle de 65. Un pincement sur le golfe approche jusqu’à ${facteur(Z1)} : la bulle se sépare en Vannes 61 et Auray 4, et les points posés à la main apparaissent. Le bouton du zoom ramène la vue d’ouverture. Plus bas, le classement des villes en barres, puis les visages vus à Vannes. Aucune tuile n’est chargée : aucun serveur ne sait quel coin de la carte tu regardes. Le point précis d’une rencontre se pose à la main, les communes voisines servant de repère.`,
    `The BodyCount Map screen. The view opens tight on your cities: from the main one, nearest first, until two thirds of your encounters are in, here Vannes, Auray and Lorient, at ${facteur(Z0)}. The land rises, the cities drop in as bubbles carrying their count, biggest first, with two ripples on Vannes and a shuttle to every other city. Vannes and Auray, too close at this scale, make a single bubble of 65. A pinch on the gulf zooms to ${facteur(Z1)}: the bubble splits into Vannes 61 and Auray 4, and the pins placed by hand appear. The zoom button brings back the opening view. Further down, the cities ranked in bars, then the faces seen in Vannes. No tile is loaded: no server knows which corner of the map you are looking at. The exact spot of an encounter is placed by hand, with nearby towns as landmarks.`));
};

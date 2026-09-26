// La fabrication du fond de carte : d'un GeoJSON de 1,2 Mo à france.bin,
// 180 Ko embarqués dans l'APK, puis ce que l'écran Carte en fait.
//
// En haut, les cinq étapes s'allument tour à tour ; au milieu, l'atelier
// montre l'étape en cours ; à gauche, le téléphone montre d'abord ce que
// l'APK emporte, puis l'écran Carte qui s'ouvre sans une seule requête.
// La France est la vraie, lue dans assets/carte/france.bin comme le fait
// lib/donnees/geometrie_france.dart.
const fs = require('fs');
const path = require('path');

module.exports = (O) => {
  const { t, EN, svg, texte, entete, rubrique, paliers, fondu, visible, entre, telephone, toucher, icone, id,
    APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU } = O;
  const C = 34;
  const r1 = (v) => Math.round(v * 10) / 10;
  const nombre = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, EN ? ',' : ' ');
  const dec = (v, n) => v.toFixed(n).replace('.', EN ? '.' : ',');

  // ---------------------------------------------------------- la géométrie
  // Le format FRA1 : « FRA1 », le nombre de couches, puis pour chaque
  // couche ses anneaux, chaque point sur deux entiers de seize bits au
  // 1/2000e de degré depuis (-6°, 41°).
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
  const [COTE, DEPTS] = couches;
  const pointsDe = (cc) => cc.reduce((s, a) => s + a.length, 0);
  const TOTAL = pointsDe(COTE) + pointsDe(DEPTS);
  const OCTETS = bin.length;

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
        const d = l < 1e-9 ? Math.hypot(pts[m][0] - ax, pts[m][1] - ay)
          : Math.abs(dy * pts[m][0] - dx * pts[m][1] + bx * ay - by * ax) / l;
        if (d > max) { max = d; k = m; }
      }
      if (max > tol && k > 0) { garde[k] = 1; pile.push([i, k], [k, j]); }
    }
    return pts.filter((_, i) => garde[i]);
  }

  // Un repère unique pour tous les dessins : x = longitude × cos 46,2°,
  // y = -latitude, en centièmes, recalé sur la France. Le même symbole
  // sert au téléphone et à l'atelier.
  const COS = Math.cos((46.2 * Math.PI) / 180);
  const X0 = -5.3 * COS, Y0 = -51.2;
  const U = (lon, lat) => [(lon * COS - X0) * 100, (-lat - Y0) * 100];
  const VBW = Math.round((9.7 * COS - X0) * 100), VBH = Math.round((-41.2 - Y0) * 100);
  const chemin = (anneaux, tol, ferme) => anneaux
    .map((a) => alleger(a, tol)).filter((a) => a.length > 2)
    .map((a) => 'M' + a.map((q) => U(q[0], q[1]).map(r1).join(' ')).join('L') + (ferme ? 'Z' : '')).join('');
  const TERRE = chemin(COTE, 0.012, true);
  const LIMITES = chemin(DEPTS, 0.02, false);
  const defs = `<symbol id="france" viewBox="0 0 ${VBW} ${VBH}" overflow="visible">
    <path d="${TERRE}" fill="#2A1753" stroke="${APP.rose}" stroke-opacity="0.55" stroke-width="1.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    <path d="${LIMITES}" fill="none" stroke="${APP.rose}" stroke-opacity="0.16" stroke-width="0.8" vector-effect="non-scaling-stroke"/>
  </symbol>`;
  /// La France, posée dans un cadre de hauteur [h] dont le coin est (x, y).
  const france = (x, y, h, extra = '') =>
    `<use href="#france" xlink:href="#france" x="${x}" y="${y}" width="${r1(h * VBW / VBH)}" height="${h}" ${extra}/>`;

  // Les villes du jeu d'essai, pour le cadrage : nombre de rencontres et
  // coordonnées de assets/carte/communes.txt.
  // Les mêmes que carte.js, pour que les deux schémas disent la même chose.
  const VILLES = [
    ['Vannes', 61, -2.748, 47.658], ['Rennes', 15, -1.688, 48.116], ['Lorient', 10, -3.380, 47.749],
    ['Nantes', 6, -1.560, 47.238], ['Auray', 4, -2.990, 47.668], ['Rochefort', 4, -0.963, 45.936],
    ['Marseille', 3, 5.381, 43.280], ['Quimper', 2, -4.097, 47.998], ['Paris', 2, 2.347, 48.859],
    ['La Rochelle', 2, -1.152, 46.160], ['Lyon', 2, 4.835, 45.758],
  ];

  // ------------------------------------------------------------ les étapes
  const E = [
    { de: 0.02, a: 0.2, c: BLEU, titre: 'GeoJSON', l1: t('1,2 Mo de texte', '1.2 MB of text'), l2: t('données ouvertes', 'open data') },
    { de: 0.2, a: 0.4, c: OR, titre: t('Quantifier', 'Quantize'), l1: t('4 octets par point', '4 bytes per point'), l2: t('1/2000e de degré', '1/2000 of a degree') },
    { de: 0.4, a: 0.58, c: ACCENT, titre: 'france.bin', l1: '180 ' + t('Ko', 'KB'), l2: t(`${nombre(TOTAL)} points`, `${nombre(TOTAL)} points`) },
    { de: 0.58, a: 0.76, c: VIOLET, titre: t('Cadrer', 'Frame'), l1: t('2/3 des rencontres', '2/3 of encounters'), l2: t('depuis la principale', 'from the main city') },
    { de: 0.76, a: 0.975, c: VERT, titre: t('Peindre', 'Paint'), l1: t('la terre, une fois', 'the land, once'), l2: t('la vie, en continu', 'motion, all along') },
  ];

  let corps = defs + entete(t('LE FOND DE CARTE', 'THE MAP BACKGROUND'),
    t('Aucune tuile : la France voyage dans l’APK, en 180 Ko.', 'No tiles: France travels inside the APK, in 180 KB.'));

  // Les cinq étapes, en haut.
  const PX = 400, PL = 156, PY = 96;
  E.forEach((e, i) => {
    const x = PX + i * (PL + 10);
    corps += `<rect x="${x}" y="${PY}" width="${PL}" height="92" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${PY}" width="${PL}" height="92" rx="13" fill="${e.c}" fill-opacity="0.07" stroke="${e.c}" stroke-width="1.5" opacity="0">${visible(C, e.de, e.a, 0.006)}</rect>
      <circle cx="${x + 26}" cy="${PY + 27}" r="11" fill="${FIL}"/>
      <circle cx="${x + 26}" cy="${PY + 27}" r="11" fill="${e.c}" opacity="0">${visible(C, e.de, 0.985, 0.006)}</circle>
      ${texte(x + 26, PY + 31, String(i + 1), { taille: 11, couleur: '#0D1117', police: MONO, poids: 700, ancre: 'middle' })}
      ${texte(x + 44, PY + 32, e.titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 14, PY + 60, e.l1, { taille: 11.5, couleur: TEXTE })}
      ${texte(x + 14, PY + 77, e.l2, { taille: 11.5, couleur: DISCRET })}`;
    if (i < 4) corps += `<path d="M${x + PL + 1} ${PY + 46} l4 0" stroke="${FIL}" stroke-width="2"/>`;
  });

  // L'atelier : un cadre, et le contenu de l'étape en cours.
  const AX = 400, AY = 206, AL = 820, AH = 352;
  corps += `<rect x="${AX}" y="${AY}" width="${AL}" height="${AH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const etiquette = (e, s) => rubrique(AX + 20, AY + 28, s, e.c);

  // ----------------------------------------------- 1. le GeoJSON, en texte
  {
    const e = E[0];
    // Un extrait bâti sur de vrais points du trait de côte, écrits comme
    // le ferait un GeoJSON, à six décimales. Le fichier d'origine est plus
    // fin que la grille : on rend à chaque point une part de ce qu'il a
    // perdu, moins d'un demi-carreau, tirée d'une suite fixe.
    const bruit = (i) => ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 0.00024;
    const anneau = COTE.reduce((m, a) => (a.length > m.length ? a : m), []);
    const brins = [];
    for (let i = 0; i < 64; i++) {
      const q = anneau[(i * 37) % anneau.length];
      brins.push(`[${(q[0] + bruit(i)).toFixed(6)},${(q[1] + bruit(i + 100)).toFixed(6)}]`);
    }
    const lignes = ['{"type":"FeatureCollection","features":[', '  {"type":"Feature","properties":{"nom":"France"},', '   "geometry":{"type":"MultiPolygon","coordinates":[[['];
    for (let i = 0; i < brins.length; i += 2) lignes.push(`     ${brins[i]},${brins[i + 1]},`);
    const cx = AX + 20, cy = AY + 44, cl = 440, ch = 290;
    const clip = id('code');
    const hauteur = lignes.length * 17;
    let code = '';
    lignes.forEach((l, i) => { code += texte(cx + 14, cy + 22 + i * 17, l, { taille: 10.5, couleur: i < 3 ? TEXTE : BLEU, police: MONO }); });
    corps += entre(C, e.de, e.a, `${etiquette(e, t('LE POINT DE DÉPART', 'THE STARTING POINT'))}
      <clipPath id="${clip}"><rect x="${cx}" y="${cy}" width="${cl}" height="${ch}" rx="10"/></clipPath>
      <rect x="${cx}" y="${cy}" width="${cl}" height="${ch}" rx="10" fill="#0A0F16" stroke="${BORD}"/>
      <g clip-path="url(#${clip})"><g>${code}
        <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${e.de + 0.05};${e.a};1" values="0 0;0 0;0 ${-(hauteur - ch + 30)};0 ${-(hauteur - ch + 30)}"/></g></g>
      ${texte(AX + 490, AY + 88, t('1,2 Mo', '1.2 MB'), { taille: 40, couleur: TITRE, poids: 800 })}
      ${texte(AX + 490, AY + 112, t('de texte, pour le trait de côte et les', 'of text, for the coastline and the'), { taille: 12.5 })}
      ${texte(AX + 490, AY + 130, t('limites des départements.', 'department borders.'), { taille: 12.5 })}
      <rect x="${AX + 490}" y="${AY + 150}" width="300" height="10" rx="5" fill="${BLEU}"/>
      ${texte(AX + 490, AY + 196, t('Chaque point, une vingtaine de caractères :', 'Each point, some twenty characters:'), { taille: 12.5, couleur: TITRE, poids: 700 })}
      ${texte(AX + 490, AY + 218, brins[0] + ',', { taille: 11.5, couleur: BLEU, police: MONO })}
      ${texte(AX + 490, AY + 256, t('Lu sur un téléphone, il coûterait', 'Parsed on a phone, it would cost'), { taille: 12.5 })}
      ${texte(AX + 490, AY + 274, t('une seconde à chaque ouverture.', 'a second on every opening.'), { taille: 12.5 })}
      ${texte(AX + 490, AY + 312, t('Préparé une fois, avant la compilation :', 'Prepared once, before the build:'), { taille: 12.5, couleur: e.c })}
      ${texte(AX + 490, AY + 330, t('le téléphone n’en verra jamais une ligne.', 'the phone never sees a line of it.'), { taille: 12.5, couleur: e.c })}`, 0.006);
  }

  // --------------------------------------------- 2. la quantification
  {
    const e = E[1];
    const gx = AX + 20, gy = AY + 44, gl = 380, gh = 290, pas = 38;
    const clip = id('grille');
    let g = `<clipPath id="${clip}"><rect x="${gx}" y="${gy}" width="${gl}" height="${gh}" rx="10"/></clipPath>
      <rect x="${gx}" y="${gy}" width="${gl}" height="${gh}" rx="10" fill="#0A0F16" stroke="${BORD}"/><g clip-path="url(#${clip})">`;
    for (let x = gx + 19; x < gx + gl; x += pas) g += `<line x1="${x}" y1="${gy}" x2="${x}" y2="${gy + gh}" stroke="${OR}" stroke-opacity="0.13"/>`;
    for (let y = gy + 11; y < gy + gh; y += pas) g += `<line x1="${gx}" y1="${y}" x2="${gx + gl}" y2="${y}" stroke="${OR}" stroke-opacity="0.13"/>`;
    // Des points tels qu'ils arrivent, et la croisée la plus proche.
    const bruts = [[40, 250], [83, 214], [118, 198], [150, 160], [197, 150], [228, 118], [262, 96], [300, 84], [345, 52]];
    const cale = (v, o) => Math.round((v - o) / pas) * pas + o;
    const pts = bruts.map(([x, y]) => [[gx + x, gy + y], [cale(gx + x, gx + 19), cale(gy + y, gy + 11)]]);
    const QA = e.de + 0.05, QB = e.de + 0.09;
    const ligne = (k) => pts.map((p) => p[k].join(' ')).join(' ');
    g += `<polyline points="${ligne(0)}" fill="none" stroke="${APP.rose}" stroke-width="2" stroke-linejoin="round">
        <animate attributeName="points" dur="${C}s" repeatCount="indefinite" keyTimes="0;${QA};${QB};1" values="${ligne(0)};${ligne(0)};${ligne(1)};${ligne(1)}"/></polyline>`;
    pts.forEach(([[x0, y0], [x1, y1]]) => {
      g += `<circle r="4.5" cx="${x0}" cy="${y0}" fill="#0A0F16" stroke="#FFFFFF" stroke-width="1.6">
        ${fondu('cx', C, [[0, x0], [QA, x0], [QB, x1], [1, x1]])}${fondu('cy', C, [[0, y0], [QA, y0], [QB, y1], [1, y1]])}
        ${paliers('fill', C, [[0, '#0A0F16'], [QB, OR]])}</circle>`;
    });
    g += `</g>${texte(gx + 12, gy + gh - 12, t('un carreau : 1/2000e de degré, une cinquantaine de mètres', 'one square: 1/2000 of a degree, about fifty metres'), { taille: 10.5, couleur: OR, police: MONO })}`;
    // La conversion d'un point, chiffres réels.
    const lon = -4.486124, lat = 48.382914;
    const qx = Math.round((lon + 6) * 2000), qy = Math.round((lat - 41) * 2000);
    const hex = (v) => [v & 0xff, v >> 8].map((b) => b.toString(16).toUpperCase().padStart(2, '0'));
    const octets = [...hex(qx), ...hex(qy)];
    const RX = AX + 430;
    let droite = `${texte(RX, AY + 70, t('Un point, pas à pas', 'One point, step by step'), { taille: 14, couleur: TITRE, poids: 700 })}
      ${texte(RX, AY + 98, `(${dec(lon, 6)} + 6) × 2000 = ${dec((lon + 6) * 2000, 2)}`, { taille: 12, couleur: TEXTE, police: MONO })}
      ${texte(RX, AY + 118, `(${dec(lat, 6)} − 41) × 2000 = ${dec((lat - 41) * 2000, 2)}`, { taille: 12, couleur: TEXTE, police: MONO })}
      ${entre(C, QA, e.a, texte(RX, AY + 146, t(`arrondis : ${qx} et ${qy}, deux entiers de 16 bits`, `rounded: ${qx} and ${qy}, two 16-bit integers`), { taille: 12, couleur: OR, police: MONO }), 0.006)}`;
    octets.forEach((o, i) => {
      const x = RX + i * 58;
      droite += entre(C, QB + i * 0.006, e.a, `<rect x="${x}" y="${AY + 166}" width="50" height="40" rx="8" fill="${OR}" fill-opacity="0.12" stroke="${OR}" stroke-opacity="0.6"/>
        ${texte(x + 25, AY + 192, o, { taille: 15, couleur: OR, police: MONO, poids: 700, ancre: 'middle' })}`, 0.004);
    });
    droite += entre(C, QB + 0.03, e.a, texte(RX + 244, AY + 192, t('4 octets', '4 bytes'), { taille: 13, couleur: TITRE, poids: 700 }), 0.004);
    droite += `${texte(RX, AY + 240, t('Au lieu d’une vingtaine de caractères : cinq fois moins.', 'Instead of some twenty characters: five times less.'), { taille: 12.5 })}
      ${texte(RX, AY + 268, t('L’erreur ne dépasse jamais un demi-carreau. Sur', 'The error never exceeds half a square. On'), { taille: 12.5 })}
      ${texte(RX, AY + 286, t('l’écran d’un téléphone, elle ne se voit pas.', 'a phone screen, it cannot be seen.'), { taille: 12.5 })}
      ${texte(RX, AY + 318, t('Seize bits vont jusqu’à 32,7° depuis (−6°, 41°) :', 'Sixteen bits reach 32.7° from (−6°, 41°):'), { taille: 12.5, couleur: DISCRET })}
      ${texte(RX, AY + 336, t('toute la France, Corse comprise, y tient.', 'all of France, Corsica included, fits.'), { taille: 12.5, couleur: DISCRET })}`;
    corps += entre(C, e.de, e.a, etiquette(e, t('QUANTIFIER', 'QUANTIZE')) + g + droite, 0.006);
  }

  // ---------------------------------------------------- 3. france.bin
  {
    const e = E[2];
    const d = e.a - e.de;
    // La structure du fichier, en tranches proportionnelles… presque : les
    // en-têtes, qui pèsent quelques octets, gardent de quoi se lire.
    const pc = pointsDe(COTE), pd = pointsDe(DEPTS);
    const SX0 = AX + 20, SY0 = AY + 44, SL0 = AL - 40;
    const tetes = [['FRA1', 64, TEXTE], ['2', 40, TEXTE]];
    let x = SX0, s = '';
    for (const [l, w, c] of tetes) {
      s += `<rect x="${x}" y="${SY0}" width="${w - 4}" height="44" rx="7" fill="${FIL}" fill-opacity="0.5" stroke="${BORD}"/>${texte(x + (w - 4) / 2, SY0 + 27, l, { taille: 12, couleur: c, police: MONO, poids: 700, ancre: 'middle' })}`;
      x += w;
    }
    const reste = SX0 + SL0 - x;
    const wc = Math.round(reste * pc / (pc + pd));
    const tranche = (x0, w, titre, sous, c, de) => entre(C, de, e.a, `<rect x="${x0}" y="${SY0}" width="${w - 4}" height="44" rx="7" fill="${c}" fill-opacity="0.13" stroke="${c}" stroke-opacity="0.6"/>
      ${texte(x0 + 12, SY0 + 19, titre, { taille: 12, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x0 + 12, SY0 + 36, sous, { taille: 11, couleur: TEXTE })}`, 0.006);
    s += tranche(x, wc, t('couche 1 : la côte', 'layer 1: the coast'), t(`${COTE.length} anneaux, ${nombre(pc)} points`, `${COTE.length} rings, ${nombre(pc)} points`), ACCENT, e.de + 0.01);
    s += tranche(x + wc, reste - wc + 4, t('couche 2 : les départements', 'layer 2: departments'), t(`${DEPTS.length} anneaux, ${nombre(pd)} points`, `${DEPTS.length} rings, ${nombre(pd)} points`), VIOLET, e.de + 0.03);
    // Les poids, face à face.
    const BX = AX + 20, BY = AY + 130, BL = 400;
    const k = OCTETS / 1.2e6;
    s += `${texte(BX, BY, 'GeoJSON', { taille: 12, couleur: TEXTE, police: MONO })}
      ${texte(BX + BL, BY, t('1,2 Mo', '1.2 MB'), { taille: 12, couleur: TEXTE, police: MONO, ancre: 'end' })}
      <rect x="${BX}" y="${BY + 8}" width="${BL}" height="10" rx="5" fill="${BLEU}" fill-opacity="0.45"/>
      ${texte(BX, BY + 48, 'france.bin', { taille: 12, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(BX + BL, BY + 48, t(`${nombre(OCTETS)} octets`, `${nombre(OCTETS)} bytes`), { taille: 12, couleur: ACCENT, police: MONO, poids: 700, ancre: 'end' })}
      <rect x="${BX}" y="${BY + 56}" height="10" rx="5" fill="${ACCENT}" width="${BL}">${fondu('width', C, [[0, BL], [e.de + 0.02, BL], [e.de + 0.07, r1(BL * k)], [1, r1(BL * k)]])}</rect>
      ${texte(BX, BY + 104, t(`${nombre(TOTAL)} points × 4 octets, plus un compte`, `${nombre(TOTAL)} points × 4 bytes, plus a count`), { taille: 12.5 })}
      ${texte(BX, BY + 122, t('par anneau : 180 Ko, sept fois moins.', 'per ring: 180 KB, seven times less.'), { taille: 12.5 })}
      ${texte(BX, BY + 160, t('Décodé en quelques millisecondes, en degrés', 'Decoded in a few milliseconds, straight into'), { taille: 12.5, couleur: TITRE, poids: 700 })}
      ${texte(BX, BY + 178, t('tout de suite, une seule fois par lancement.', 'degrees, once per launch.'), { taille: 12.5, couleur: TITRE, poids: 700 })}
      ${texte(BX, BY + 212, 'GeometrieFrance.charger()', { taille: 11.5, couleur: e.c, police: MONO })}`;
    // La France qui sort du fichier, du nord au sud.
    const FH = 250, FX = AX + 520, FY = AY + 92;
    const clip = id('revele');
    s += `<clipPath id="${clip}"><rect x="${FX - 10}" y="${FY - 10}" width="${r1(FH * VBW / VBH) + 30}" height="0">
        ${fondu('height', C, [[0, 0], [e.de + 0.03, 0], [e.de + d * 0.75, FH + 20], [1, FH + 20]])}</rect></clipPath>
      <g clip-path="url(#${clip})">${france(FX, FY, FH)}</g>
      <line x1="${FX - 10}" x2="${FX + r1(FH * VBW / VBH) + 20}" stroke="${ACCENT}" stroke-width="1.5" opacity="0">
        ${fondu('y1', C, [[0, FY - 10], [e.de + 0.03, FY - 10], [e.de + d * 0.75, FY + FH + 10], [1, FY + FH + 10]])}
        ${fondu('y2', C, [[0, FY - 10], [e.de + 0.03, FY - 10], [e.de + d * 0.75, FY + FH + 10], [1, FY + FH + 10]])}
        ${visible(C, e.de + 0.03, e.de + d * 0.75, 0.004)}</line>`;
    corps += entre(C, e.de, e.a, etiquette(e, t('LE FICHIER, TEL QU’IL EST DANS L’APK', 'THE FILE, AS IT SITS IN THE APK')) + s, 0.006);
  }

  // ------------------------------------------------------- 4. le cadrage
  {
    const e = E[3];
    const FH = 290, FX = AX + 30, FY = AY + 46;
    const k = FH / VBH;
    const P = (lon, lat) => { const [x, y] = U(lon, lat); return [FX + x * k, FY + y * k]; };
    let s = france(FX, FY, FH);
    const tete = VILLES[0];
    const proches = [...VILLES].sort((a, b) => Math.hypot(a[2] - tete[2], a[3] - tete[3]) - Math.hypot(b[2] - tete[2], b[3] - tete[3]));
    const total = VILLES.reduce((s2, v) => s2 + v[1], 0);
    let cumul = 0;
    const coeur = [];
    for (const v of proches) { coeur.push(v); cumul += v[1]; if (cumul * 3 >= total * 2) break; }
    const QUAND = (i) => e.de + 0.02 + i * 0.02;
    VILLES.forEach((v) => {
      const [x, y] = P(v[2], v[3]);
      const i = coeur.indexOf(v);
      const r = 2.5 + Math.sqrt(v[1]) * 0.9;
      s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${VIOLET}" fill-opacity="0.35" stroke="#FFFFFF" stroke-opacity="0.5"/>`;
      if (i >= 0) s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r + 2)}" fill="${ACCENT}" stroke="#FFFFFF" opacity="0">${visible(C, QUAND(i), e.a, 0.004)}</circle>`;
    });
    // Le cadre : de la France entière aux villes retenues, avec le plancher
    // et la marge de lib/widgets/plan_france.dart.
    const xs = coeur.map((v) => P(v[2], v[3])[0]), ys = coeur.map((v) => P(v[2], v[3])[1]);
    const cxv = (Math.min(...xs) + Math.max(...xs)) / 2, cyv = (Math.min(...ys) + Math.max(...ys)) / 2;
    const cadreL = 246, cadreH = 250;
    const plancher = Math.min(cadreL, cadreH) * 0.16 * (k * 100 / 23.1);
    let lv = Math.max(Math.max(...xs) - Math.min(...xs), plancher) * 1.45, hv = Math.max(Math.max(...ys) - Math.min(...ys), plancher) * 1.45;
    if (lv / hv < cadreL / cadreH) lv = hv * cadreL / cadreH; else hv = lv * cadreH / cadreL;
    const Lf = FH * VBW / VBH;
    const de = [FX, FY, Lf, FH], a = [cxv - lv / 2, cyv - hv / 2, lv, hv];
    const T0 = QUAND(coeur.length) + 0.01, T1 = T0 + 0.04;
    s += `<rect fill="none" stroke="${ACCENT}" stroke-width="2" rx="4" x="${de[0]}" y="${de[1]}" width="${r1(de[2])}" height="${de[3]}">
      ${['x', 'y', 'width', 'height'].map((att, j) => fondu(att, C, [[0, r1(de[j])], [T0, r1(de[j])], [T1, r1(a[j])], [1, r1(a[j])]])).join('')}</rect>`;
    const RX = AX + 370;
    const pas = [
      [t('On part de la ville principale.', 'Start from the main city.'), t('Vannes, 61 rencontres.', 'Vannes, 61 encounters.')],
      [t('On ajoute les plus proches…', 'Add the nearest ones…'), t('Auray 4, puis Lorient 10.', 'Auray 4, then Lorient 10.')],
      [t('… jusqu’aux deux tiers.', '… up to two thirds.'), t(`${cumul} sur ${total} : on s’arrête là.`, `${cumul} of ${total}: stop there.`)],
      [t('Un plancher, et de la marge.', 'A floor, and some margin.'), t('Assez de côte pour savoir où l’on est.', 'Enough coast to know where you are.')],
    ];
    pas.forEach(([l1, l2], i) => {
      const y = AY + 70 + i * 62, de2 = i < 3 ? QUAND(i) : T0;
      s += `<circle cx="${RX + 10}" cy="${y - 5}" r="10" fill="${FIL}"/>
        <circle cx="${RX + 10}" cy="${y - 5}" r="10" fill="${VIOLET}" opacity="0">${visible(C, de2, e.a, 0.004)}</circle>
        ${texte(RX + 10, y - 1, String(i + 1), { taille: 11, couleur: '#FFFFFF', police: MONO, poids: 700, ancre: 'middle' })}
        ${texte(RX + 32, y, l1, { taille: 13.5, couleur: TITRE, poids: 700 })}
        ${texte(RX + 32, y + 19, l2, { taille: 12.5 })}`;
    });
    s += entre(C, T1, e.a, `${texte(RX, AY + 322, t('Marseille, Lyon et Paris restent hors du cadre :', 'Marseille, Lyon and Paris stay out of frame:'), { taille: 12.5, couleur: DISCRET })}
      ${texte(RX, AY + 340, t('un seul week-end ne doit pas rouvrir sur la France entière.', 'one weekend must not reopen on all of France.'), { taille: 12.5, couleur: DISCRET })}`, 0.006);
    corps += entre(C, e.de, e.a, etiquette(e, t('LE CADRAGE, À L’OUVERTURE', 'THE FRAMING, ON OPENING')) + s, 0.006);
  }

  // --------------------------------------------------- 5. la peinture
  {
    const e = E[4];
    const LX = AX + 20, LY = AY + 46, LL = 380;
    const couche = (y, h, c, titre, l1, l2, compte) => `<rect x="${LX}" y="${y}" width="${LL}" height="${h}" rx="12" fill="${c}" fill-opacity="0.06" stroke="${c}" stroke-opacity="0.5"/>
      ${texte(LX + 18, y + 28, titre, { taille: 13, couleur: c, police: MONO, poids: 700, extra: 'letter-spacing="1.5"' })}
      ${texte(LX + 18, y + 52, l1, { taille: 12.5, couleur: TITRE })}
      ${texte(LX + 18, y + 71, l2, { taille: 12.5 })}
      ${compte}`;
    // Le compteur de la terre ne bouge pas ; celui de la vie défile.
    const images = [];
    const pasT = (e.a - e.de - 0.01) / 24;
    for (let i = 0; i <= 24; i++) images.push([e.de + 0.005 + i * pasT, i * 17]);
    let vie = '';
    images.forEach(([de, n], i) => {
      const a = i < images.length - 1 ? images[i + 1][0] : e.a;
      vie += `<text x="${LX + LL - 18}" y="${LY + 178}" font-family="${MONO}" font-size="22" font-weight="700" fill="${ACCENT}" text-anchor="end" opacity="0">${paliers('opacity', C, [[0, 0], [de, 1], [a, 0]])}${nombre(n)}</text>`;
    });
    let s = couche(LY, 110, VERT, t('LA TERRE', 'THE LAND'), t('Un CustomPaint dans un RepaintBoundary.', 'A CustomPaint inside a RepaintBoundary.'),
      t('Ses chemins sont bâtis une fois par cadrage.', 'Its paths are built once per framing.'),
      `${texte(LX + LL - 18, LY + 30, '1', { taille: 22, couleur: VERT, police: MONO, poids: 700, ancre: 'end' })}${texte(LX + LL - 18, LY + 48, t('peinture', 'paint'), { taille: 10.5, couleur: DISCRET, ancre: 'end' })}`);
    s += couche(LY + 126, 110, ACCENT, t('LA VIE', 'THE MOTION'), t('Étoiles, ondes, navettes vers chaque ville.', 'Stars, ripples, shuttles to every city.'),
      t('Repeinte à chaque image, par-dessus.', 'Repainted every frame, on top.'),
      `${vie}${texte(LX + LL - 18, LY + 196, t('images', 'frames'), { taille: 10.5, couleur: DISCRET, ancre: 'end' })}`);
    s += `${texte(LX, LY + 272, t('La frontière entre les deux isole la terre : les ondes', 'The boundary between the two shields the land: the'), { taille: 12.5 })}
      ${texte(LX, LY + 290, t('qui tournent ne la font jamais repeindre.', 'turning ripples never make it repaint.'), { taille: 12.5 })}`;
    const RX = AX + 430;
    const regles = [
      [t('Au pincement, une matrice', 'On a pinch, a matrix'), t('Le zoom est appliqué au moment de peindre :', 'The zoom is applied at paint time:'), t('aucun chemin n’est reconstruit.', 'no path gets rebuilt.')],
      [t('Seulement ce qui se voit', 'Only what shows'), t('Les anneaux hors de la vue sont écartés', 'Rings outside the view are dropped'), t('d’un seul test sur leur étendue.', 'with a single test on their bounds.')],
      [t('La mer, un seul aplat', 'The sea, one flat fill'), t('Un dégradé immobile, sous tout le reste.', 'A still gradient, under everything.'), t('La terre monte dessus à l’ouverture.', 'The land rises onto it on opening.')],
    ];
    regles.forEach(([titre, l1, l2], i) => {
      const y = AY + 46 + i * 98;
      s += entre(C, e.de + 0.02 + i * 0.03, e.a, `<rect x="${RX}" y="${y}" width="370" height="86" rx="12" fill="#0A0F16" stroke="${BORD}"/>
        <rect x="${RX}" y="${y + 14}" width="3" height="58" rx="1.5" fill="${VERT}"/>
        ${texte(RX + 18, y + 28, titre, { taille: 13.5, couleur: TITRE, poids: 700 })}
        ${texte(RX + 18, y + 50, l1, { taille: 12.5 })}
        ${texte(RX + 18, y + 68, l2, { taille: 12.5 })}`, 0.006);
    });
    corps += entre(C, e.de, e.a, etiquette(e, t('LA PEINTURE', 'THE PAINTING')) + s, 0.006);
  }

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';
  const CARTE_A = 0.56;
  // D'abord, ce que l'APK emporte.
  const fichiers = [
    ['assets/logo.png', t('233 Ko', '233 KB'), null],
    ['fonts/ChakraPetch-Bold', t('69 Ko', '69 KB'), null],
    ['fonts/ChakraPetch-SemiBold', t('69 Ko', '69 KB'), null],
    ['carte/communes.txt', t('34 836 communes', '34,836 towns'), null],
    ['carte/france.bin', t('180 Ko', '180 KB'), E[2].de + 0.08],
  ];
  let apk = `${texte(SX + 20, SY + 50, 'BodyCount.apk', { taille: 17, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 20, SY + 70, t('ce que l’appli emporte', 'what the app carries'), { taille: 11, couleur: APP.second })}
    ${texte(SX + 20, SY + 104, 'ASSETS', { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.6"' })}`;
  fichiers.forEach(([nom, taille, quand], i) => {
    const y = SY + 116 + i * 52;
    const ligne = `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="44" rx="12" fill="${APP.carte}" stroke="${quand ? APP.fuchsia : APP.bord}" ${quand ? 'stroke-opacity="0.8"' : ''}/>
      ${icone('fichier', SX + 24, y + 14, quand ? APP.fuchsia : APP.second, 1)}
      ${texte(SX + 48, y + 20, nom, { taille: 10, couleur: APP.texte, police: MONO, poids: 700 })}
      ${texte(SX + 48, y + 35, taille, { taille: 9.5, couleur: quand ? APP.rose : APP.discret })}`;
    apk += quand ? entre(C, quand, CARTE_A, ligne, 0.006) : ligne;
  });
  apk += `<rect x="${SX + 12}" y="${SY + 392}" width="${SL - 24}" height="64" rx="14" fill="${APP.vert}" fill-opacity="0.08" stroke="${APP.vert}" stroke-opacity="0.4"/>
    ${texte(SX + 26, SY + 418, t('Permission INTERNET : aucune', 'INTERNET permission: none'), { taille: 11.5, couleur: APP.vert, poids: 700 })}
    ${texte(SX + 26, SY + 438, t('Ni tuile, ni police à aller chercher.', 'No tile, no font to fetch.'), { taille: 10.5, couleur: APP.second })}`;
  ecran += entre(C, 0, CARTE_A, apk, 0.006);

  // Puis l'écran Carte : la terre monte, se cadre, la vie s'allume.
  const MX = SX + 12, MY = SY + 72, MW = SL - 24, MH = 300;
  const mer = id('mer'), clipCarte = id('carte');
  const k0 = MH / VBH * 0.96;
  const L0 = VBW * k0;
  const ox = MX + (MW - L0) / 2, oy = MY + MH * 0.02;
  const Pm = (lon, lat) => { const [x, y] = U(lon, lat); return [ox + x * k0, oy + y * k0]; };
  // Le zoom d'ouverture, 4,3 fois autour du cœur breton.
  const Z = 4.3, foyer = Pm(-3.05, 47.72), cible = [MX + MW / 2, MY + MH / 2];
  const zoomDe = (z) => `${r1(cible[0] - foyer[0] * z)} ${r1(cible[1] - foyer[1] * z)}`;
  const ZA = 0.61, ZB = 0.66, PA = 0.86, PB = 0.9, PC = 0.93, PD = 0.955;
  const Z2 = 6.2;
  const zooms = [[0, 1], [ZA, 1], [ZB, Z], [PA, Z], [PB, Z2], [PC, Z2], [PD, Z], [1, Z]];
  const matrice = `<animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${zooms.map((z) => z[0]).join(';')}" values="${zooms.map((z) => zoomDe(z[1])).join(';')}"/>
    <animateTransform attributeName="transform" type="scale" additive="sum" dur="${C}s" repeatCount="indefinite" keyTimes="${zooms.map((z) => z[0]).join(';')}" values="${zooms.map((z) => z[1]).join(';')}"/>`;
  const villes = [['Vannes', 65, -2.7597, 47.6586], ['Lorient', 10, -3.3702, 47.7483], ['Quimper', 2, -4.1024, 47.996], ['Rennes', 15, -1.68, 48.1119], ['Nantes', 6, -1.5536, 47.2173]];
  let pastilles = '';
  villes.forEach(([nom, n, lon, lat], i) => {
    const [x, y] = Pm(lon, lat);
    // Les pastilles gardent leur taille : on compense l'échelle du groupe.
    const r = (14 + Math.sqrt(Math.min(1, n / 65)) * 8) / Z;
    pastilles += `<g opacity="0">${visible(C, 0.68 + i * 0.012, 0.975, 0.006)}
      ${i === 0 ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="none" stroke="${APP.rose}" stroke-width="${r1(1.4 / Z)}">
        <animate attributeName="r" dur="2.4s" repeatCount="indefinite" values="${r1(r)};${r1(r * 2.4)}"/><animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" values="0.8;0"/></circle>` : ''}
      <circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${i === 0 ? APP.fuchsia : APP.violet}" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="${r1(1.4 / Z)}"/>
      <text x="${r1(x)}" y="${r1(y + 3.6 / Z)}" font-family="${O.SANS}" font-size="${r1(10.5 / Z)}" font-weight="800" fill="#FFFFFF" text-anchor="middle">${n}</text>
    </g>`;
  });
  const carte = `
    ${texte(SX + 18, SY + 44, t('TES LIEUX', 'YOUR PLACES'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
    <rect x="${SX + SL - 82}" y="${SY + 28}" width="68" height="24" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${texte(SX + SL - 48, SY + 44, t('11 villes', '11 cities'), { taille: 10.5, couleur: APP.texte, poids: 700, ancre: 'middle' })}
    <radialGradient id="${mer}" cx="30%" cy="25%" r="100%"><stop offset="0" stop-color="#1B1044"/><stop offset="0.5" stop-color="#120B2A"/><stop offset="1" stop-color="#090413"/></radialGradient>
    <clipPath id="${clipCarte}"><rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="18"/></clipPath>
    <rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="18" fill="url(#${mer})"/>
    <g clip-path="url(#${clipCarte})">
      <g>${matrice}
        <g opacity="0">${fondu('opacity', C, [[0, 0], [CARTE_A + 0.005, 0], [CARTE_A + 0.03, 1], [1, 1]])}${france(r1(ox), r1(oy), r1(VBH * k0))}</g>
        ${pastilles}
      </g>
      <rect x="${MX - 80}" y="${MY}" width="40" height="${MH}" fill="#FFFFFF" fill-opacity="0.07" transform="skewX(-12)" opacity="0">
        ${fondu('x', C, [[0, MX - 80], [CARTE_A + 0.025, MX - 80], [CARTE_A + 0.055, MX + MW + 40], [1, MX + MW + 40]])}
        ${visible(C, CARTE_A + 0.025, CARTE_A + 0.055, 0.004)}</rect>
    </g>
    <rect x="${MX}" y="${MY}" width="${MW}" height="${MH}" rx="18" fill="none" stroke="${APP.bord}"/>
    <rect x="${MX + MW - 58}" y="${MY + 10}" width="48" height="22" rx="11" fill="${APP.fond}" fill-opacity="0.7"/>
    ${[[0, ZA, '1,0×', '1.0×'], [ZB, PA, '4,3×', '4.3×'], [PB, PC, '6,2×', '6.2×'], [PD, 1.2, '4,3×', '4.3×']].map(([de, a, fr, en]) =>
      entre(C, Math.max(de, CARTE_A), a, texte(MX + MW - 34, MY + 25, t(fr, en), { taille: 10.5, couleur: APP.texte, police: MONO, poids: 700, ancre: 'middle' }), 0.004)).join('')}
    <rect x="${SX + 12}" y="${MY + MH + 14}" width="${SL - 24}" height="84" rx="16" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${texte(SX + 26, MY + MH + 40, t('RÉSEAU', 'NETWORK'), { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.6"' })}
    ${texte(SX + 26, MY + MH + 76, '0', { taille: 30, couleur: APP.vert, poids: 800 })}
    ${texte(SX + 56, MY + MH + 66, t('requête pour dessiner', 'requests to draw'), { taille: 11, couleur: APP.texte, poids: 600 })}
    ${texte(SX + 56, MY + MH + 82, t('la France et ses villes', 'France and its cities'), { taille: 11, couleur: APP.second })}
    ${O.barreNav(T, 'Carte')}`;
  ecran += entre(C, CARTE_A, 0.985, carte, 0.006);
  // Le pincement, deux doigts qui s'écartent.
  const doigt = (dx0, dy0, dx1, dy1) => `<circle r="13" fill="#FFFFFF" fill-opacity="0.28" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.5" opacity="0">
      ${visible(C, PA - 0.005, PB + 0.004, 0.004)}
      ${fondu('cx', C, [[0, cible[0] + dx0], [PA, cible[0] + dx0], [PB, cible[0] + dx1], [1, cible[0] + dx1]])}
      ${fondu('cy', C, [[0, cible[1] + dy0], [PA, cible[1] + dy0], [PB, cible[1] + dy1], [1, cible[1] + dy1]])}</circle>`;
  ecran += doigt(-12, 10, -60, 50) + doigt(12, -10, 60, -50);
  ecran += toucher(MX + MW - 34, MY + 21, C, PD - 0.01);
  corps += T.ecran(ecran);

  // ------------------------------------------------ trois cartes du bas
  const bas = [
    [VERT, t('Aucune requête', 'No request'), t('Une carte à tuiles dirait à un serveur,', 'A tiled map would tell a server,'), t('à chaque geste, où tu regardes.', 'at every gesture, where you look.')],
    [ACCENT, t('Rien à mettre à jour', 'Nothing to update'), t('Les frontières ne bougent pas : le fichier', 'Borders do not move: the file'), t('de 2026 vaudra encore dans dix ans.', 'from 2026 will still hold in ten years.')],
    [BLEU, t('Les communes aussi', 'The towns too'), t('34 836 noms et positions, 420 Ko dans', '34,836 names and positions, 420 KB'), t('l’APK : la recherche reste sur place.', 'in the APK: search stays on the phone.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = 400 + i * 280, y = 576;
    corps += `<rect x="${x}" y="${y}" width="260" height="96" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y + 14}" width="3" height="68" rx="1.5" fill="${c}"/>
      ${texte(x + 20, y + 32, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 55, l1, { taille: 12 })}
      ${texte(x + 20, y + 73, l2, { taille: 12 })}`;
  });

  svg('fabrication.svg', 1280, 700, corps, t(
    `La fabrication du fond de carte de BodyCount. Au départ, un GeoJSON de données ouvertes : 1,2 Mo de texte pour le trait de côte et les limites des départements, chaque point écrit en une vingtaine de caractères. Chaque longitude et chaque latitude est ramenée au 1/2000e de degré depuis (−6°, 41°), une cinquantaine de mètres, et tient sur un entier de seize bits : quatre octets par point, une erreur qui ne se voit pas sur un téléphone. Le fichier france.bin en sort : la marque FRA1, deux couches, ${COTE.length} anneaux de côte et ${DEPTS.length} de départements, ${nombre(TOTAL)} points, ${nombre(OCTETS)} octets, embarqués dans l’APK et décodés une fois par lancement. À l’ouverture de l’écran Carte, la vue se cadre sur la ville principale et ses voisines jusqu’aux deux tiers des rencontres, avec un plancher et une marge. La terre est un dessin à part, peint une fois et isolé des ondes et des navettes qui bougent en continu ; au pincement, le zoom passe par une matrice sans reconstruire le moindre chemin. Pas une requête réseau : aucune tuile, aucune police, les 34 836 communes embarquées elles aussi.`,
    `How the BodyCount map background is made. It starts as an open-data GeoJSON: 1.2 MB of text for the coastline and department borders, each point written in some twenty characters. Every longitude and latitude is brought down to 1/2000 of a degree from (−6°, 41°), about fifty metres, and fits in a 16-bit integer: four bytes per point, an error no phone screen can show. Out comes france.bin: the FRA1 mark, two layers, ${COTE.length} coast rings and ${DEPTS.length} department rings, ${nombre(TOTAL)} points, ${nombre(OCTETS)} bytes, shipped in the APK and decoded once per launch. When the Map screen opens, the view frames the main city and its neighbours up to two thirds of encounters, with a floor and a margin. The land is a separate drawing, painted once and shielded from the ripples and shuttles that move all along; on a pinch, the zoom goes through a matrix without rebuilding a single path. Not one network request: no tile, no font, and the 34,836 towns are shipped too.`));
};

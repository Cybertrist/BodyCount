// Une ville tapée, et la commune où elle tombe.
//
// À gauche, le téléphone : dans le formulaire d'une rencontre, le lieu se
// tape lettre à lettre, puis « Placer sur la carte » ouvre le point précis
// centré sur la commune trouvée, comme le fait
// lib/ecrans/formulaire_rencontre.dart avec coordonneesEnFrance(). Au
// milieu, la clé tirée de la saisie et les quatre essais de
// lib/donnees/coordonnees.dart, dans l'ordre ; à droite, les vraies
// candidates, lues dans assets/carte/communes.txt, avec leur rang de
// population. Le fond des cartes est le vrai : assets/carte/france.bin.
const fs = require('fs');
const path = require('path');

module.exports = (O) => {
  const { t, EN, svg, texte, entete, rubrique, paliers, fondu, visible, entre, telephone, toucher, frappe, icone, visage,
    bouton, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE } = O;
  const C = 45;
  const r1 = (v) => Math.round(v * 10) / 10;
  const racine = path.join(__dirname, '..', '..', '..');

  // ------------------------------------------------------------ les données
  // Le référentiel, dans l'ordre du fichier : de la plus peuplée à la
  // moins peuplée, comme l'application le lit.
  const communes = fs.readFileSync(path.join(racine, 'assets', 'carte', 'communes.txt'), 'utf8').split('\n')
    .map((l) => l.split(';')).filter((c) => c.length === 4)
    .map(([nom, dep, lat, lon]) => ({ nom, dep, lat: +lat / 1000, lon: +lon / 1000 }));
  const rang = (n) => (EN ? n.toLocaleString('en-US') : n.toLocaleString('fr-FR').replace(/\s/g, ' '));

  // La géométrie de la France, format FRA1 : des couches d'anneaux, chaque
  // point sur deux entiers de seize bits, au 1/2000e de degré depuis
  // (-6°, 41°). La couche 0 est la terre.
  const bin = fs.readFileSync(path.join(racine, 'assets', 'carte', 'france.bin'));
  const terre = [];
  {
    let p = 8;
    const na = bin.readUInt32LE(p); p += 4;
    for (let a = 0; a < na; a++) {
      const n = bin.readUInt32LE(p); p += 4;
      const pts = [];
      for (let i = 0; i < n; i++, p += 4) pts.push([bin.readUInt16LE(p) / 2000 - 6, bin.readUInt16LE(p + 2) / 2000 + 41]);
      terre.push(pts);
    }
  }
  /// Coupe un anneau à un rectangle en degrés (Sutherland-Hodgman).
  function couper(pts, [o, s, e, n]) {
    const bords = [
      [(q) => q[0] >= o, (a, b) => [o, a[1] + ((o - a[0]) / (b[0] - a[0])) * (b[1] - a[1])]],
      [(q) => q[0] <= e, (a, b) => [e, a[1] + ((e - a[0]) / (b[0] - a[0])) * (b[1] - a[1])]],
      [(q) => q[1] >= s, (a, b) => [a[0] + ((s - a[1]) / (b[1] - a[1])) * (b[0] - a[0]), s]],
      [(q) => q[1] <= n, (a, b) => [a[0] + ((n - a[1]) / (b[1] - a[1])) * (b[0] - a[0]), n]],
    ];
    let sortie = pts;
    for (const [dedans, croise] of bords) {
      const entree = sortie;
      sortie = [];
      for (let i = 0; i < entree.length; i++) {
        const a = entree[(i + entree.length - 1) % entree.length], b = entree[i];
        if (dedans(b)) { if (!dedans(a)) sortie.push(croise(a, b)); sortie.push(b); } else if (dedans(a)) sortie.push(croise(a, b));
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
        const d = l < 1e-9 ? Math.hypot(pts[m][0] - ax, pts[m][1] - ay) : Math.abs(dy * pts[m][0] - dx * pts[m][1] + bx * ay - by * ax) / l;
        if (d > max) { max = d; k = m; }
      }
      if (max > tol && k > 0) { garde[k] = 1; pile.push([i, k], [k, j]); }
    }
    return pts.filter((_, i) => garde[i]);
  }

  // Les cinq saisies. [etape] : l'essai qui répond, de 0 à 3, ou -1 pour
  // une ville de la table étrangère, que la carte ne pose pas.
  const loc = communes.find((c) => c.nom === 'Locmariaquer');
  const plg = communes.find((c) => c.nom === 'Plougastel-Daoulas');
  const van = communes.find((c) => c.nom === 'Vannes');
  const scenes = [
    { saisie: 'Locmariaquer', clef: 'locmariaquer', etape: 0, ou: loc },
    { saisie: 'Plougastel', clef: 'plougastel', etape: 1, ou: plg },
    { saisie: 'Locmariaqer', clef: 'locmariaqer', etape: 2, ou: loc },
    { saisie: t('Vannes centre', 'Vannes centre'), clef: 'vannescentre', etape: 3, ou: van },
    { saisie: 'Londres', clef: 'londres', etape: -1, ou: null },
  ];
  const S = (k) => k * 0.2; // le début de chaque saisie
  const TAPE = (k) => [S(k) + 0.012, S(k) + 0.052];
  const CLE = (k) => S(k) + 0.058;
  const ESSAI = (k, i) => S(k) + 0.07 + i * 0.016;
  const REPOND = (k) => ESSAI(k, Math.max(0, scenes[k].etape)) + (scenes[k].etape < 0 ? 0.012 : 0);
  const TOUCHE = (k) => REPOND(k) + 0.022;
  const CARTE_ = (k) => TOUCHE(k) + 0.008;
  const FIN = (k) => S(k) + 0.196;

  let corps = entete(t('LES VILLES', 'THE CITIES'),
    t('Ce que tu tapes tombe sur l’une des 34 836 communes. Quatre essais, dans l’ordre : le premier qui répond l’emporte.',
      'What you type lands on one of 34,836 communes. Four tries, in order: the first one that answers wins.'));

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // Le formulaire d'une rencontre, jusqu'au champ « Où ».
  const legende = (y, s) => texte(SX + 16, y, s, { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' });
  const y0 = SY + 62;
  const moitie = (SL - 38) / 2;
  let form = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${APP.fond}"/>
    ${icone('croix', SX + 16, SY + 28, APP.texte, 0.9)}
    ${texte(SX + 44, SY + 40, t('Nouvelle rencontre', 'New encounter'), { taille: 16, couleur: APP.texte, poids: 800 })}
    <rect x="${SX + 14}" y="${y0}" width="${SL - 28}" height="60" rx="18" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
    ${visage(GENS.enzo.photo, SX + 21, y0 + 7, 46, 46, 13)}
    ${texte(SX + 78, y0 + 27, GENS.enzo.prenom, { taille: 16, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 78, y0 + 44, t('8e fois · la dernière il y a 1 semaine', '8th time · the last one 1 week ago'), { taille: 9.5, couleur: APP.second, poids: 600 })}`;
  [[t('DATE', 'DATE'), t('26 sept.', '26 Sept.'), 'calendrier'], [t('HEURE', 'TIME'), t('22h40', '22:40'), 'horloge']].forEach(([l, v, ic], i) => {
    const x = SX + 14 + i * (moitie + 10);
    form += `<rect x="${x}" y="${y0 + 72}" width="${moitie}" height="46" rx="16" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
      ${icone(ic, x + 11, y0 + 87, APP.etoile, 0.95)}
      ${texte(x + 34, y0 + 90, l, { taille: 8, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}
      ${texte(x + 34, y0 + 106, v, { taille: 13, couleur: APP.texte, poids: 800 })}`;
  });
  const CY = y0 + 148; // le champ « Où »
  form += legende(y0 + 140, t('OÙ', 'WHERE'));
  form += `<rect x="${SX + 14}" y="${CY}" width="${SL - 28}" height="40" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
    <rect x="${SX + 14}" y="${CY}" width="${SL - 28}" height="40" rx="14" fill="none" stroke="${APP.violet}" stroke-width="1.5"/>
    ${icone('epingle', SX + 26, CY + 12, APP.second, 1)}
    ${icone('epingle', SX + 16, CY + 55, APP.discret, 1)}
    ${texte(SX + 38, CY + 68, t('Pas de point précis', 'No exact spot'), { taille: 9.5, couleur: APP.discret })}
    ${texte(SX + SL - 16, CY + 68, t('Placer sur la carte', 'Place on the map'), { taille: 9.5, couleur: APP.violet, poids: 700, ancre: 'end' })}`;
  form += legende(CY + 104, t('CE QUE ÇA A RAPPORTÉ', 'WHAT IT BROUGHT IN'));
  form += `<rect x="${SX + 14}" y="${CY + 112}" width="${SL - 28}" height="40" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
    ${icone('euro', SX + 26, CY + 124, APP.or, 1)}
    ${texte(SX + 48, CY + 136, t('Rien, ou 100', 'Nothing, or 100'), { taille: 11, couleur: APP.discret })}
    ${legende(CY + 176, t('TA NOTE', 'YOUR RATING'))}
    <rect x="${SX + 14}" y="${CY + 184}" width="${SL - 28}" height="70" rx="16" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
    ${texte(SX + 28, CY + 214, '3,5', { taille: 22, couleur: APP.texte, poids: 800 })}
    ${O.etoiles(SX + 28, CY + 244, 7, { taille: 15, pas: 22 })}
    <rect x="${SX}" y="${SY + SH - 64}" width="${SL}" height="64" fill="${APP.fond}"/>
    ${bouton(SX + 20, SY + SH - 54, SL - 40, 42, t('Enregistrer', 'Save'), { taille: 13.5 })}`;
  // Ce qui est tapé, scène par scène : le champ se vide, puis se remplit.
  let saisies = '';
  scenes.forEach((sc, k) => {
    saisies += entre(C, S(k) + 0.004, CARTE_(k) + 0.004,
      frappe(SX + 48, CY + 25, sc.saisie, C, TAPE(k)[0], TAPE(k)[1], { taille: 12.5, couleur: APP.texte, poids: 600 }) +
      // Le curseur, qui suit la frappe.
      `<rect y="${CY + 12}" width="1.6" height="17" fill="${APP.violet}" x="${SX + 49}">${fondu('x', C, [[0, SX + 49], [TAPE(k)[0], SX + 49], [TAPE(k)[1], r1(SX + 50 + sc.saisie.length * 12.5 * 0.56)], [1, r1(SX + 50 + sc.saisie.length * 12.5 * 0.56)]])}
        <animate attributeName="opacity" dur="0.9s" repeatCount="indefinite" values="1;1;0;0" keyTimes="0;0.5;0.55;1"/></rect>`, 0.003);
    saisies += toucher(SX + SL - 60, CY + 64, C, TOUCHE(k));
  });
  // Le formulaire reste là entre deux cartes ; il se cache pendant chacune.
  const formEtapes = [[0, 1]];
  scenes.forEach((_, k) => formEtapes.push([CARTE_(k), 0], [FIN(k) + 0.004, 1]));
  ecran += `<g>${paliers('opacity', C, formEtapes)}${form}${saisies}</g>`;

  // Le point précis, centré sur la commune trouvée : vingt-cinq kilomètres
  // de large, ou toute la France faute de commune.
  const COS = Math.cos((46.2 * Math.PI) / 180);
  const MY = SY + 52, MH = SH - 52 - 106;
  function pointPrecis(centre, clip) {
    const lon0 = centre ? centre.lon : 2.4, lat0 = centre ? centre.lat : 46.6;
    const e = centre ? SL / (0.32 * COS) : SL / (15 * COS);
    const px = (lon, lat) => [SX + SL / 2 + (lon - lon0) * COS * e, MY + MH / 2 - (lat - lat0) * e];
    const demiL = SL / 2 / (COS * e), demiH = MH / 2 / e;
    const fen = [lon0 - demiL * 1.1, lat0 - demiH * 1.1, lon0 + demiL * 1.1, lat0 + demiH * 1.1];
    const tol = 0.9 / e;
    const d = terre.map((a) => alleger(couper(a, fen), tol)).filter((a) => a.length > 2)
      .map((a) => 'M' + a.map(([lo, la]) => px(lo, la).map(r1).join(' ')).join('L') + 'Z').join('');
    // Les communes visibles, les plus peuplées d'abord ; un nom qui en
    // chevaucherait un autre n'est pas écrit.
    const dans = communes.filter((c) => c.lon >= fen[0] && c.lon <= fen[2] && c.lat >= fen[1] && c.lat <= fen[3]).slice(0, 140);
    if (centre && !dans.includes(centre)) dans.unshift(centre);
    const prises = [];
    let points = '', noms = '', ecrits = 0;
    const cible = centre ? [centre, ...dans.filter((c) => c !== centre)] : dans;
    for (const c of cible) {
      const [x, y] = px(c.lon, c.lat);
      if (x < SX + 4 || x > SX + SL - 4 || y < MY + 4 || y > MY + MH - 4) continue;
      points += `<circle cx="${r1(x)}" cy="${r1(y)}" r="1.7" fill="#FFFFFF" fill-opacity="0.55"/>`;
      if (ecrits >= 14) continue;
      const fort = ecrits < 6;
      const taille = fort ? 10 : 8.8;
      const l = c.nom.length * taille * 0.55, boite = [x + 4, y - taille, x + 6 + l, y + 3];
      if (boite[2] > SX + SL - 2) continue;
      if (prises.some((b) => !(boite[2] < b[0] || boite[0] > b[2] || boite[3] < b[1] || boite[1] > b[3]))) continue;
      prises.push(boite);
      noms += texte(r1(x + 5), r1(y + 3.5), c.nom, { taille, couleur: '#FFFFFF', poids: fort ? 700 : 600, extra: `fill-opacity="${fort ? 0.92 : 0.66}"` });
      ecrits++;
    }
    const id = O.id('pp');
    const [cx, cy] = px(lon0, lat0);
    return `<clipPath id="${id}"><rect x="${SX}" y="${MY}" width="${SL}" height="${MH}"/></clipPath>
      <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${APP.fond}"/>
      <g clip-path="url(#${id})">
        <rect x="${SX}" y="${MY}" width="${SL}" height="${MH}" fill="#07030F"/>
        <path d="${d}" fill="#261650" stroke="${APP.fuchsia}" stroke-opacity="0.55" stroke-width="1" stroke-linejoin="round"/>
        ${points}${noms}
        ${centre ? `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="9" fill="none" stroke="${ACCENT}" stroke-width="1.6"><animate attributeName="r" dur="1.6s" repeatCount="indefinite" values="6;16"/><animate attributeName="opacity" dur="1.6s" repeatCount="indefinite" values="0.9;0"/></circle>` : ''}
      </g>
      ${icone('croix', SX + 16, SY + 26, APP.texte, 0.9)}
      ${texte(SX + SL / 2, SY + 38, t('Point précis', 'Exact spot'), { taille: 15, couleur: APP.texte, poids: 800, ancre: 'middle' })}
      ${texte(SX + SL / 2, SY + SH - 82, t('Touche la carte pour poser le point.', 'Touch the map to set the spot.'), { taille: 10.5, couleur: APP.second, ancre: 'middle' })}
      <g opacity="0.38">${bouton(SX + 20, SY + SH - 62, SL - 40, 42, t('Poser ici', 'Set here'), { taille: 13.5 })}</g>`;
  }
  // Deux saisies tombent sur Locmariaquer : un seul dessin, deux fenêtres.
  const vues = [[loc, [0, 2]], [plg, [1]], [van, [3]], [null, [4]]];
  vues.forEach(([centre, ks]) => {
    const e = [[0, 0]];
    for (const k of ks) e.push([CARTE_(k), 1], [FIN(k), 0]);
    ecran += `<g opacity="0">${paliers('opacity', C, e)}${pointPrecis(centre)}</g>`;
  });
  corps += T.ecran(ecran);

  // ------------------------------------------------ la clé et les essais
  const MX = 390, ML = 460;
  corps += rubrique(MX, 108, t('CE QUI EST TAPÉ, PUIS SA CLÉ', 'WHAT IS TYPED, THEN ITS KEY'));
  corps += `<rect x="${MX}" y="120" width="${ML}" height="70" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    <path d="M${MX + 212} 155 h26 m-7 -6 l7 6 l-7 6" fill="none" stroke="${FIL}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(MX + 20, 181, t('tel que tapé', 'as typed'), { taille: 10.5, couleur: DISCRET })}
    ${texte(MX + 256, 181, t('minuscules, sans accents, tirets ni espaces', 'lower case, no accents, hyphens or spaces'), { taille: 10.5, couleur: DISCRET })}`;
  scenes.forEach((sc, k) => {
    // La saisie s'écrit au même rythme que dans le téléphone.
    corps += entre(C, S(k) + 0.006, FIN(k), frappe(MX + 20, 161, sc.saisie, C, TAPE(k)[0], TAPE(k)[1], { taille: 15, couleur: TITRE, poids: 700 }), 0.004);
    corps += entre(C, CLE(k), FIN(k), texte(MX + 256, 161, sc.clef, { taille: 15, couleur: ACCENT, police: MONO, poids: 700 }), 0.004);
  });

  corps += rubrique(MX, 216, t('QUATRE ESSAIS, DANS L’ORDRE', 'FOUR TRIES, IN ORDER'));
  const essais = [
    [t('Nom exact', 'Exact name'), t('la clé entière, « st » et « ste » développés', 'the whole key, « st » and « ste » spelled out')],
    [t('Début de nom', 'Start of a name'), t('trois lettres au moins, la plus peuplée', 'three letters at least, the most populous')],
    [t('Faute de frappe', 'Typo'), t('une lettre d’écart, deux dès huit lettres', 'one letter off, two from eight letters up')],
    [t('Ville, puis quartier', 'City, then area'), t('un nom de commune qui ouvre la saisie', 'a commune name that opens the input')],
  ];
  // Ce que chaque essai répond, saisie par saisie.
  const reponses = [
    [[t('Locmariaquer (56)', 'Locmariaquer (56)'), t('une seule commune a cette clé', 'one commune has this key')]],
    [null, [t('Plougastel-Daoulas (29)', 'Plougastel-Daoulas (29)'), t('la seule qui commence ainsi', 'the only one starting that way')]],
    [null, null, [t('Locmariaquer (56)', 'Locmariaquer (56)'), t('un « u » oublié : écart 1', 'a missing « u »: one letter off')]],
    [null, null, null, [t('Vannes (56)', 'Vannes (56)'), t('« vannes », puis « centre »', '« vannes », then « centre »')]],
    [null],
  ];
  const EY = (i) => 228 + i * 74;
  essais.forEach(([titre, regle], i) => {
    const y = EY(i);
    corps += `<rect x="${MX}" y="${y}" width="${ML}" height="64" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <circle cx="${MX + 30}" cy="${y + 32}" r="13" fill="${FIL}" fill-opacity="0.55"/>
      ${texte(MX + 30, y + 37, String(i + 1), { taille: 13, couleur: TEXTE, police: MONO, poids: 700, ancre: 'middle' })}
      ${texte(MX + 56, y + 28, titre, { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(MX + 56, y + 47, regle, { taille: 11.5 })}`;
    scenes.forEach((sc, k) => {
      const a = sc.etape < 0 ? 0 : sc.etape;
      const quand = ESSAI(k, i), fin = FIN(k);
      const droite = MX + ML - 18;
      if (sc.etape < 0 && i === 0) {
        // Rien en France, mais la table des villes étrangères répond : on
        // s'arrête là, sans approcher.
        corps += entre(C, quand, fin, `<rect x="${MX}" y="${y}" width="${ML}" height="64" rx="13" fill="${OR}" fill-opacity="0.06" stroke="${OR}" stroke-width="1.5"/>
          ${texte(droite, y + 29, t('rien en France', 'none in France'), { taille: 11.5, couleur: DISCRET, police: MONO, poids: 700, ancre: 'end' })}
          ${texte(droite, y + 47, t('table étrangère : stop', 'foreign table: stop'), { taille: 11, couleur: OR, poids: 700, ancre: 'end' })}`, 0.004);
      } else if (i < a) {
        // Essayé, sans réponse.
        corps += entre(C, quand, fin, `<g opacity="0.9">${icone('croix', droite - 12, y + 18, DISCRET, 0.75)}</g>
          ${texte(droite - 18, y + 30, t('rien', 'nothing'), { taille: 11.5, couleur: DISCRET, police: MONO, poids: 700, ancre: 'end' })}`, 0.004);
      } else if (i === a && sc.etape >= 0) {
        const [nom, pourquoi] = reponses[k][i];
        corps += entre(C, quand, fin, `<rect x="${MX}" y="${y}" width="${ML}" height="64" rx="13" fill="${VERT}" fill-opacity="0.06" stroke="${VERT}" stroke-width="1.5"/>
          <circle cx="${MX + 30}" cy="${y + 32}" r="13" fill="${VERT}"/>
          ${icone('coche', MX + 22, y + 24, '#06210F', 1)}
          ${texte(droite, y + 29, nom, { taille: 13, couleur: VERT, poids: 700, ancre: 'end' })}
          ${texte(droite, y + 47, pourquoi, { taille: 11, couleur: TEXTE, ancre: 'end' })}`, 0.004);
      } else {
        // Pas essayé : le premier qui répond l'emporte.
        const des = sc.etape < 0 ? ESSAI(k, 0) + 0.012 : REPOND(k) + 0.004;
        corps += entre(C, des, fin, texte(droite, y + 37, t('pas essayé', 'not tried'), { taille: 11, couleur: FIL, police: MONO, ancre: 'end' }), 0.004);
      }
    });
  });

  // ------------------------------------------------ les candidates
  const RX = 870, RL = 350;
  corps += rubrique(RX, 108, t('LES CANDIDATES', 'THE CANDIDATES'));
  corps += `<rect x="${RX}" y="120" width="${RL}" height="400" rx="13" fill="${CARTE}" stroke="${BORD}"/>`;
  const rangDe = (nom, dep) => communes.findIndex((c) => c.nom === nom && (!dep || c.dep === dep)) + 1;
  // Une ligne de candidate : son nom, son département, son rang.
  const ligne = (y, nom, dep, droite, { gagne = false, barre = false, couleur = VERT } = {}) => `
    <rect x="${RX + 16}" y="${y}" width="${RL - 32}" height="40" rx="10" fill="${gagne ? couleur : '#FFFFFF'}" fill-opacity="${gagne ? 0.1 : 0.03}" stroke="${gagne ? couleur : BORD}" stroke-opacity="${gagne ? 0.7 : 1}"/>
    ${icone('epingle', RX + 26, y + 12, gagne ? couleur : DISCRET, 1)}
    ${texte(RX + 50, y + 25, nom, { taille: 13, couleur: gagne ? TITRE : TEXTE, poids: 700 })}
    ${texte(RX + 50 + nom.length * 7.4 + 8, y + 25, dep, { taille: 11.5, couleur: DISCRET, police: MONO })}
    ${barre ? `<line x1="${RX + 46}" y1="${y + 20.5}" x2="${RX + 58 + nom.length * 7.4 + dep.length * 7}" y2="${y + 20.5}" stroke="${ROUGE}" stroke-width="1.5"/>` : ''}
    ${texte(RX + RL - 28, y + 25, droite, { taille: 11.5, couleur: gagne ? couleur : DISCRET, police: MONO, poids: 700, ancre: 'end' })}`;
  const titreCand = (s) => texte(RX + 18, 148, s, { taille: 11.5, couleur: ACCENT, police: MONO, poids: 700, extra: 'letter-spacing="1"' });
  const pied = (l1, l2) => texte(RX + 18, 480, l1, { taille: 12 }) + texte(RX + 18, 498, l2, { taille: 12 });
  const n = (nom, dep) => '#' + rang(rangDe(nom, dep));
  const panneaux = [
    titreCand(t('CLÉ « locmariaquer »', 'KEY « locmariaquer »')) +
      ligne(166, 'Locmariaquer', '(56)', n('Locmariaquer'), { gagne: true }) +
      texte(RX + 18, 238, t('Même clé, même commune :', 'Same key, same commune:'), { taille: 12, couleur: TEXTE }) +
      ['LOCMARIAQUER', 'locmariaquer', 'Locmariaquer '].map((s, i) => `<rect x="${RX + 18}" y="${252 + i * 36}" width="${RL - 36}" height="28" rx="8" fill="#FFFFFF" fill-opacity="0.03" stroke="${BORD}"/>
        ${texte(RX + 30, 271 + i * 36, `« ${s} »`, { taille: 12, couleur: TITRE, police: MONO })}
        ${texte(RX + RL - 30, 271 + i * 36, 'locmariaquer', { taille: 11.5, couleur: ACCENT, police: MONO, ancre: 'end' })}`).join('') +
      pied(t('Les communes sont rangées de la plus', 'Communes are ranked from most to least'), t('peuplée à la moins peuplée : #1 est Paris.', 'populous: #1 is Paris.')),
    titreCand(t('CLÉS QUI COMMENCENT PAR « plougastel »', 'KEYS STARTING WITH « plougastel »')) +
      ligne(166, 'Plougastel-Daoulas', '(29)', n('Plougastel-Daoulas'), { gagne: true }) +
      texte(RX + 18, 238, t('Avec « Plou » seulement, 69 communes :', 'With just « Plou », 69 communes:'), { taille: 12, couleur: TEXTE }) +
      ligne(252, 'Plouzané', '(29)', n('Plouzané'), { gagne: true, couleur: OR }) +
      ligne(300, 'Plougastel-Daoulas', '(29)', n('Plougastel-Daoulas')) +
      ligne(348, 'Ploufragan', '(22)', n('Ploufragan')) +
      texte(RX + 18, 414, t('La première qui convient est la plus peuplée :', 'The first that fits is the most populous:'), { taille: 12, couleur: OR }) +
      texte(RX + 18, 432, t('Plouzané passerait avant.', 'Plouzané would come first.'), { taille: 12, couleur: OR }) +
      pied(t('Trois lettres au moins : « Pl » ne cherche', 'Three letters at least: « Pl » does not'), t('rien, trop de villes y répondraient.', 'search, too many towns would answer.')),
    titreCand(t('À DEUX LETTRES PRÈS DE « locmariaqer »', 'WITHIN TWO LETTERS OF « locmariaqer »')) +
      ligne(166, 'Locmariaquer', '(56)', t('écart 1', '1 off'), { gagne: true }) +
      (() => {
        // Les lettres, côte à côte : il en manque une.
        const a = 'locmariaquer'.split(''), b = 'locmariaq_er'.split('');
        let s = '';
        a.forEach((ch, i) => {
          const x = RX + 24 + i * 25;
          const manque = b[i] === '_';
          s += `<rect x="${x}" y="236" width="21" height="26" rx="5" fill="${manque ? OR : '#FFFFFF'}" fill-opacity="${manque ? 0.18 : 0.04}" stroke="${manque ? OR : BORD}"/>
            ${texte(x + 10.5, 254, ch, { taille: 13, couleur: TITRE, police: MONO, poids: 700, ancre: 'middle' })}
            <rect x="${x}" y="270" width="21" height="26" rx="5" fill="#FFFFFF" fill-opacity="${manque ? 0 : 0.04}" stroke="${manque ? OR : BORD}" ${manque ? 'stroke-dasharray="3 3"' : ''}/>
            ${manque ? '' : texte(x + 10.5, 288, b[i], { taille: 13, couleur: TEXTE, police: MONO, poids: 700, ancre: 'middle' })}`;
        });
        return s + texte(RX + 18, 322, t('en haut la commune, en bas ta saisie', 'top, the commune; bottom, what you typed'), { taille: 11, couleur: DISCRET });
      })() +
      texte(RX + 18, 360, t('11 lettres : deux fautes tolérées.', '11 letters: two typos allowed.'), { taille: 12.5, couleur: TITRE, poids: 700 }) +
      texte(RX + 18, 380, t('Sous 8 lettres, une seule.', 'Under 8 letters, just one.'), { taille: 12.5, couleur: TITRE, poids: 700 }) +
      pied(t('La plus peuplée l’emporte, et une commune', 'The most populous wins, and a commune'), t('à une lettre arrête la recherche.', 'one letter off ends the search.')),
    titreCand(t('COMMUNES QUI OUVRENT « vannescentre »', 'COMMUNES OPENING « vannescentre »')) +
      ligne(166, 'Vannes', '(56)', t('6 lettres', '6 letters'), { gagne: true }) +
      ligne(214, 'Vanne', '(70)', t('5 lettres', '5 letters')) +
      texte(RX + 18, 286, t('Le plus long nom l’emporte :', 'The longest name wins:'), { taille: 12.5, couleur: TITRE, poids: 700 }) +
      texte(RX + 18, 306, t('« Saint-Malo plage » ne tombe pas', '« Saint-Malo plage » does not land'), { taille: 12 }) +
      texte(RX + 18, 324, t('sur une commune qui s’appellerait « Saint ».', 'on a commune that would be called « Saint ».'), { taille: 12 }) +
      texte(RX + 18, 362, t('Vanne, en Haute-Saône, est la ' + rang(rangDe('Vanne', '70')) + 'e.', 'Vanne, in Haute-Saône, ranks ' + rang(rangDe('Vanne', '70')) + 'th.'), { taille: 12, couleur: DISCRET }) +
      pied(t('Quatre lettres au moins, pour qu’un nom', 'Four letters at least, so that a short'), t('trop court ne prenne pas tout.', 'name does not take everything.')),
    titreCand(t('LES VILLES ÉTRANGÈRES', 'THE FOREIGN CITIES')) +
      ligne(166, 'Londres', t('51,5° N', '51.5° N'), t('hors carte', 'off map'), { gagne: true, couleur: OR }) +
      texte(RX + 18, 238, t('Sans cette table, à une lettre près :', 'Without that table, one letter off:'), { taille: 12, couleur: TEXTE }) +
      ligne(252, 'Ondres', '(40)', n('Ondres', '40'), { barre: true }) +
      ligne(300, 'Landres', '(54)', n('Landres', '54'), { barre: true }) +
      texte(RX + 18, 366, t('« Londres » tomberait à Ondres, dans les', '« Londres » would land in Ondres, in the'), { taille: 12, couleur: TEXTE }) +
      texte(RX + 18, 384, t('Landes. Elle n’est donc jamais approchée.', 'Landes. So it is never approximated.'), { taille: 12, couleur: TEXTE }) +
      pied(t('La carte ne la pose pas, le point précis', 'The map does not place it, the exact spot'), t('s’ouvre sur toute la France.', 'opens on the whole of France.')),
  ];
  panneaux.forEach((p, k) => {
    corps += entre(C, k === 4 ? REPOND(k) : REPOND(k), FIN(k), p, 0.005);
  });
  // Avant la réponse, le panneau attend.
  scenes.forEach((_, k) => {
    corps += entre(C, S(k) + 0.004, REPOND(k), `${icone('loupe', RX + RL / 2 - 12, 290, FIL, 1.5)}
      ${texte(RX + RL / 2, 340, t('34 836 communes, dans l’ordre…', '34,836 communes, in order…'), { taille: 12, couleur: DISCRET, ancre: 'middle' })}`, 0.004);
  });

  // ------------------------------------------------ trois cartes du bas
  const bas = [
    [OR, t('Homonymes', 'Namesakes'),
      t('« Saint-Denis » : la plus peuplée, la 93.', '« Saint-Denis »: the most populous, the 93.'),
      t('« Saint-Denis (11) » : celle de l’Aude.', '« Saint-Denis (11) »: the one in Aude.')],
    [VIOLET, t('« St » et « Ste »', '« St » and « Ste »'),
      t('« St Malo » devient « saintmalo » :', '« St Malo » becomes « saintmalo »:'),
      t('la même clé que Saint-Malo.', 'the same key as Saint-Malo.')],
    [VERT, t('« Chez lui » n’est pas un village', '« His place » is not a village'),
      t('Pour le classement, seul le nom exact', 'For the ranking, only the exact name'),
      t('fait d’un lieu une ville. Sinon, sa fiche.', 'makes a place a city. Otherwise, the card’s.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = 390 + i * 283, y = 548;
    corps += `<rect x="${x}" y="${y}" width="264" height="100" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(x + 20, y + 33, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 57, l1, { taille: 12 })}
      ${texte(x + 20, y + 76, l2, { taille: 12 })}`;
  });
  corps += texte(805, 682, t('34 836 communes de métropole et de Corse, embarquées dans l’application : la recherche ne sort jamais du téléphone.',
    '34,836 communes of mainland France and Corsica, bundled with the app: the search never leaves the phone.'), { taille: 12, couleur: DISCRET, ancre: 'middle' });

  svg('villes.svg', 1280, 720, corps, t(
    'Une ville tapée et la commune où elle tombe. Dans le formulaire d’une rencontre, le lieu se tape, puis Placer sur la carte ouvre le point précis centré sur la commune trouvée parmi les 34 836 du référentiel, rangées de la plus peuplée à la moins peuplée. La saisie devient une clé, en minuscules, sans accents, tirets ni espaces, puis passe quatre essais dans l’ordre, et le premier qui répond l’emporte. Locmariaquer : le nom exact. Plougastel : un début de nom, Plougastel-Daoulas ; avec Plou seulement, Plouzané, plus peuplée, passerait avant. Locmariaqer : une faute de frappe, une lettre d’écart, deux tolérées dès huit lettres. Vannes centre : un nom de commune qui ouvre la saisie, le plus long l’emporte, Vannes plutôt que Vanne en Haute-Saône. Londres est dans la table des villes étrangères : elle n’est jamais approchée, sans quoi elle tomberait à Ondres, dans les Landes, et le point précis s’ouvre sur toute la France. Un département entre parenthèses départage les homonymes, Saint-Denis (11) ; « St » devient « saint » ; et pour le classement, seul un nom exact fait d’un lieu une ville.',
    'A typed city and the commune it lands on. In the encounter form, the place is typed, then Place on the map opens the exact spot centred on the commune found among the 34,836 in the reference list, ranked from most to least populous. The input becomes a key, lower case, without accents, hyphens or spaces, then goes through four tries in order, and the first that answers wins. Locmariaquer: the exact name. Plougastel: the start of a name, Plougastel-Daoulas; with just Plou, Plouzané, more populous, would come first. Locmariaqer: a typo, one letter off, two allowed from eight letters. Vannes centre: a commune name opening the input, the longest wins, Vannes rather than Vanne in Haute-Saône. London is in the table of foreign cities: it is never approximated, otherwise it would land in Ondres, in the Landes, and the exact spot opens on the whole of France. A department in brackets settles namesakes, Saint-Denis (11); « St » becomes « saint »; and for the ranking, only an exact name makes a place a city.'));
};

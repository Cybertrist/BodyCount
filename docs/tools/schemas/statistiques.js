// L'écran des statistiques, et d'où sort chacun de ses chiffres.
//
// À gauche, le téléphone fait défiler l'écran de haut en bas, section par
// section. À droite, les cinq chiffres s'allument tour à tour, et le
// panneau refait le calcul de celui qui est allumé, comme
// lib/donnees/statistiques.dart le fait en SQL. Les valeurs sont celles du
// jeu d'essai, les mêmes que sur les captures.
module.exports = (O) => {
  const { EN, t, svg, texte, entete, rubrique, paliers, fondu, visible, entre, glisse, telephone, toucher, icone, visage,
    etoiles, barreNav, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, FUCHSIA, VERT, OR } = O;
  const C = 36;
  // Les cinq temps, et le défilement de l'écran qui les suit.
  const E = [[0.035, 0.215], [0.215, 0.40], [0.425, 0.585], [0.585, 0.755], [0.78, 0.955]];
  const ROLES = { versatile: '#34D399', actif: '#F87171', passif: '#60A5FA' };
  let corps = entete(t('LES STATISTIQUES', 'THE STATS'),
    t('Cinq chiffres sur l’année choisie, tous calculés dans la base, à partir des rencontres.',
      'Five figures for the chosen year, all computed in the database, from your encounters.'));

  // Un dégradé local : le 78 du total, peint du lilas au violet.
  corps += `<linearGradient id="chiffreStats" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#E9D5FF"/><stop offset="1" stop-color="${APP.violet}"/></linearGradient>
  <linearGradient id="gainsStats" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2A1E3A"/><stop offset="1" stop-color="#1C1428"/></linearGradient>
  <linearGradient id="barreStats" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${APP.fuchsia}"/><stop offset="1" stop-color="${APP.violet}"/></linearGradient>`;

  /// Un arc d'anneau, de a0 à a1 en fraction du tour, depuis midi.
  const arc = (cx, cy, r, a0, a1) => {
    const p = (a) => [cx + r * Math.sin(a * 2 * Math.PI), cy - r * Math.cos(a * 2 * Math.PI)].map((v) => v.toFixed(1)).join(' ');
    return `M${p(a0)} A${r} ${r} 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${p(a1)}`;
  };

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL } = T;
  const X = SX + 12, L = SL - 24;
  corps += T.cadre;
  let page = '';
  const titrePanneau = (y, s) => texte(X + 14, y, s, { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' });
  const panneau = (y, h, fond = APP.carte, bord = APP.bord) =>
    `<rect x="${X}" y="${y}" width="${L}" height="${h}" rx="18" fill="${fond}" stroke="${bord}"/>`;
  // Chaque section s'éclaire pendant son temps.
  const eclat = (y, h, [de, a], c = ACCENT) =>
    `<rect x="${X - 1}" y="${y - 1}" width="${L + 2}" height="${h + 2}" rx="19" fill="none" stroke="${c}" stroke-width="1.6" opacity="0">${visible(C, de, a)}</rect>`;

  // L'en-tête et le choix de l'année.
  page += texte(X + 2, SY + 40, t('STATISTIQUES', 'STATS'), { taille: 11, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.3"' });
  page += texte(X + 2, SY + 72, '2026', { taille: 28, couleur: APP.texte, poids: 800 });
  page += `<rect x="${X}" y="${SY + 86}" width="54" height="24" rx="12" fill="url(#marque)"/>
    ${texte(X + 27, SY + 102, '2026', { taille: 10.5, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
    <rect x="${X + 60}" y="${SY + 86}" width="54" height="24" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${texte(X + 87, SY + 102, '2025', { taille: 10.5, couleur: APP.second, poids: 700, ancre: 'middle' })}`;

  // Au total : le chiffre se compte depuis zéro, comme Compteur le fait.
  const yT = SY + 122;
  page += panneau(yT, 100, '#17102A') + eclat(yT, 100, E[0]);
  page += titrePanneau(yT + 24, t('AU TOTAL', 'IN TOTAL'));
  const compte = [0, 9, 24, 41, 56, 67, 74, 77, 78];
  compte.forEach((v, i) => {
    const de = 0.012 + i * 0.004, a = i === compte.length - 1 ? 1 : de + 0.004;
    page += `<g opacity="${i === compte.length - 1 ? 1 : 0}">${i === compte.length - 1 ? paliers('opacity', C, [[0, 0], [de, 1]]) : paliers('opacity', C, [[0, 0], [de, 1], [a, 0]])}
      ${texte(X + 14, yT + 70, String(v), { taille: 44, couleur: 'url(#chiffreStats)', poids: 800, extra: 'letter-spacing="-2"' })}</g>`;
  });
  page += texte(X + 14, yT + 88, t('Rencontres · 18 personnes', 'Encounters · 18 people'), { taille: 10.5, couleur: APP.second, poids: 700 });
  page += `<rect x="${X + L - 72}" y="${yT + 14}" width="60" height="22" rx="11" fill="${APP.vert}" fill-opacity="0.14"/>
    <path d="M${X + L - 64} ${yT + 29} l4 -4 l3 3 l5 -6 m-3 0 h3 v3" fill="none" stroke="${APP.vert}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(X + L - 20, yT + 29, '+136 %', { taille: 10, couleur: APP.vert, poids: 800, ancre: 'end' })}
    ${texte(X + L - 14, yT + 52, 'vs 2025', { taille: 9, couleur: APP.second, poids: 700, ancre: 'end' })}`;

  // Les mieux notés : le premier au milieu, sur la plus haute marche.
  const yP = SY + 234;
  page += panneau(yP, 176) + eclat(yP, 176, E[1]);
  page += titrePanneau(yP + 24, t('LES MIEUX NOTÉS', 'TOP RATED'));
  const marches = [[GENS.gabriel, 2, 81, '4,8', 8], [GENS.noa, 1, 107, '4,9', 14], [GENS.ibrahim, 3, 68, '4,8', 10]];
  const ML = (L - 20 - 12) / 3, bas = yP + 146;
  marches.forEach(([p, rang, h, moy, fois], i) => {
    const x = X + 10 + i * (ML + 6), y = bas - h, premier = rang === 1;
    const monte = E[1][0] + 0.01 + (rang === 3 ? 0 : rang === 2 ? 0.012 : 0.024);
    page += `<g>
      ${fondu('opacity', C, [[0, 1], [E[1][0], 1], [E[1][0] + 0.004, 0], [monte, 0], [monte + 0.01, 1], [1, 1]])}
      ${premier ? `<rect x="${x - 2}" y="${y + 6}" width="${ML + 4}" height="${h}" rx="14" fill="${APP.violet}" opacity="0.28" filter="url(#halo)"/>` : ''}
      ${visage(p.photo, x, y, ML, h, 13)}
      <rect x="${x}" y="${y}" width="${ML}" height="${h}" rx="13" fill="url(#voile)"/>
      <circle cx="${x + 13}" cy="${y + 13}" r="8" fill="${premier ? 'url(#marque)' : APP.fond}" fill-opacity="${premier ? 1 : 0.62}" stroke="#FFFFFF" stroke-opacity="0.22"/>
      ${texte(x + 13, y + 16.5, String(rang), { taille: 9.5, couleur: premier ? '#12071F' : '#FFFFFF', poids: 800, ancre: 'middle' })}
      ${etoiles(x + ML / 2 - (premier ? 29 : 25), y + h - 20, Math.round(parseFloat(moy.replace(',', '.')) * 2), { taille: premier ? 9 : 8 })}
      ${texte(x + ML / 2, y + h - 6, moy, { taille: premier ? 11.5 : 10.5, couleur: '#FFFFFF', poids: 800, ancre: 'middle' })}
      ${texte(x + ML / 2, bas + 14, p.prenom, { taille: 9.5, couleur: '#E2D8F2', poids: 800, ancre: 'middle' })}
      ${texte(x + ML / 2, bas + 25, t(`${fois} fois`, `${fois} times`), { taille: 8, couleur: APP.discret, poids: 600, ancre: 'middle' })}
    </g>`;
  });

  // Ce que ça a rapporté : doré, la jauge des soirées payées.
  const yG = SY + 422;
  page += `<rect x="${X}" y="${yG}" width="${L}" height="112" rx="18" fill="url(#gainsStats)" stroke="${APP.or}" stroke-opacity="0.24"/>` + eclat(yG, 112, E[2], OR);
  page += icone('euro', X + 13, yG + 14, APP.or, 0.7) + texte(X + 29, yG + 24, t('CE QUE ÇA A RAPPORTÉ', 'WHAT IT BROUGHT IN'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' });
  page += `<rect x="${X + L - 50}" y="${yG + 12}" width="38" height="18" rx="9" fill="${APP.or}" fill-opacity="0.14"/>
    ${texte(X + L - 31, yG + 25, '+36 %', { taille: 9, couleur: APP.or, poids: 800, ancre: 'middle' })}
    ${texte(X + 14, yG + 66, t('750 €', '€750'), { taille: 28, couleur: APP.or, poids: 800, extra: 'letter-spacing="-1"' })}
    ${texte(X + L - 14, yG + 52, t('107,14 €', '€107.14'), { taille: 13, couleur: APP.texte, poids: 800, ancre: 'end' })}
    ${texte(X + L - 14, yG + 65, t('en moyenne', 'on average'), { taille: 8.5, couleur: APP.second, poids: 700, ancre: 'end' })}
    <rect x="${X + 14}" y="${yG + 76}" width="${L - 28}" height="4" rx="2" fill="#FFFFFF" fill-opacity="0.07"/>
    <rect x="${X + 14}" y="${yG + 76}" width="${((L - 28) * 7) / 78}" height="4" rx="2" fill="${APP.or}"/>
    ${texte(X + 14, yG + 98, t('sur 7 soirées, des 78 de l’année', 'over 7 nights, out of the year’s 78'), { taille: 9.5, couleur: APP.second, poids: 600 })}`;

  // Par mois : douze barres, la plus haute en dégradé.
  const MOIS = [5, 7, 8, 7, 12, 7, 10, 4, 18, 0, 0, 0];
  const LETTRES = EN ? ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] : ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const yM = SY + 546;
  page += panneau(yM, 130) + eclat(yM, 130, E[3]);
  page += titrePanneau(yM + 24, t('PAR MOIS', 'BY MONTH'));
  page += texte(X + L - 14, yM + 24, t('Septembre · 18 fois', 'September · 18 times'), { taille: 9.5, couleur: APP.texte, poids: 700, ancre: 'end' });
  const BW = (L - 28) / 12;
  MOIS.forEach((v, i) => {
    const h = (v / 18) * 58 + 6, x = X + 14 + i * BW + 2, y0 = yM + 104;
    const c = i === 8 ? 'url(#barreStats)' : APP.violet;
    const op = i === 8 ? 1 : v > 9 ? 0.58 : 0.22;
    page += `<rect x="${x}" width="${BW - 4}" rx="4" fill="${c}" fill-opacity="${op}" y="${y0 - h}" height="${h}">
      ${fondu('height', C, [[0, h], [E[3][0], h], [E[3][0] + 0.004, 4], [E[3][0] + 0.02 + i * 0.003, 4], [E[3][0] + 0.04 + i * 0.003, h], [1, h]])}
      ${fondu('y', C, [[0, y0 - h], [E[3][0], y0 - h], [E[3][0] + 0.004, y0 - 4], [E[3][0] + 0.02 + i * 0.003, y0 - 4], [E[3][0] + 0.04 + i * 0.003, y0 - h], [1, y0 - h]])}</rect>
      ${texte(x + (BW - 4) / 2, y0 + 16, LETTRES[i], { taille: 8, couleur: APP.discret, poids: 700, ancre: 'middle' })}`;
  });

  // La répartition : l'anneau des rôles, en fiches.
  const yR = SY + 690;
  page += panneau(yR, 146) + eclat(yR, 146, E[4]);
  page += titrePanneau(yR + 24, t('RÉPARTITION', 'BREAKDOWN'));
  const parts = [[t('Versatile', 'Versatile'), 8, '45 %', ROLES.versatile], [t('Actif', 'Top'), 6, '33 %', ROLES.actif], [t('Passif', 'Bottom'), 4, '22 %', ROLES.passif]];
  let debut = 0;
  const DX = X + 56, DY = yR + 84;
  parts.forEach(([lib, n, pc, c], i) => {
    const fin = debut + n / 18;
    page += `<path d="${arc(DX, DY, 34, debut + 0.008, fin - 0.008)}" fill="none" stroke="${c}" stroke-width="11"/>`;
    debut = fin;
    const y = yR + 62 + i * 22;
    page += `<circle cx="${X + 112}" cy="${y - 3.5}" r="4" fill="${c}"/>
      ${texte(X + 122, y, lib, { taille: 10, couleur: APP.texte, poids: 700 })}
      ${texte(X + L - 14, y, `${n} · ${pc}`, { taille: 9.5, couleur: APP.second, poids: 700, ancre: 'end' })}`;
  });
  page += texte(DX, DY + 5, '18', { taille: 18, couleur: APP.texte, poids: 800, ancre: 'middle' });
  page += texte(DX, DY + 17, t('fiches', 'cards'), { taille: 8, couleur: APP.second, ancre: 'middle' });
  page += texte(X + 14, yR + 136, t('Sur les fiches où le rôle est renseigné.', 'On the cards where the role is filled in.'), { taille: 8.5, couleur: APP.discret });

  // Le défilement, puis la barre du bas, fixe, et le toucher sur Stats.
  const defile = glisse(C, [[0, '0 0'], [0.40, '0 0'], [0.42, '0 -250'], [0.755, '0 -250'], [0.775, '0 -350'], [0.958, '0 -350'], [0.985, '0 0'], [1, '0 0']]);
  let ecran = `<g>${defile}${page}</g>`;
  ecran += `<rect x="${SX}" y="${SY + 480}" width="${SL}" height="80" fill="${APP.fond}" fill-opacity="0.9"/>`;
  ecran += barreNav(T, 'Stats');
  ecran += toucher(SX + 25 + (SL - 20) / 5 * 1.5 - 15, SY + 552 - 35, C, 0.008);
  corps += T.ecran(ecran);

  // --------------------------------------------- les cinq chiffres, à droite
  const LX = 400, LW = 246;
  const etapes = [
    [t('Au total', 'In total'), t('78, soit +136 % sur 2025', '78, or +136% on 2025')],
    [t('Les mieux notés', 'Top rated'), t('la moyenne, puis les fois', 'the average, then the count')],
    [t('Ce que ça a rapporté', 'What it brought in'), t('750 € sur 7 soirées', '€750 over 7 nights')],
    [t('Par mois', 'By month'), t('Septembre · 18 fois', 'September · 18 times')],
    [t('Répartition', 'Breakdown'), t('18 fiches, trois rôles', '18 cards, three roles')],
  ];
  const couleurEtape = [ACCENT, ACCENT, OR, ACCENT, ACCENT];
  etapes.forEach(([titre, sous], i) => {
    const y = 92 + i * 80, [de, a] = E[i], c = couleurEtape[i];
    corps += `<rect x="${LX}" y="${y}" width="${LW}" height="68" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${LX}" y="${y}" width="${LW}" height="68" rx="13" fill="none" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, de, a)}</rect>
      <circle cx="${LX + 28}" cy="${y + 34}" r="13" fill="${FIL}" fill-opacity="0.6"/>
      <circle cx="${LX + 28}" cy="${y + 34}" r="13" fill="${c}" opacity="0">${visible(C, de, a)}</circle>
      ${texte(LX + 28, y + 38.5, String(i + 1), { taille: 12, couleur: TITRE, poids: 800, ancre: 'middle' })}
      ${entre(C, de, a, texte(LX + 28, y + 38.5, String(i + 1), { taille: 12, couleur: '#12071F', poids: 800, ancre: 'middle' }))}
      ${texte(LX + 52, y + 30, titre, { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(LX + 52, y + 50, sous, { taille: 12 })}`;
  });

  // --------------------------------------------------------- le calcul
  const PX = 670, PY = 92, PW = 550, PH = 388;
  corps += `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const panneauCalcul = (i, contenu) => entre(C, E[i][0] + 0.004, E[i][1] - 0.004, contenu, 0.008);
  const code = (x, y, s, c = TEXTE) => texte(x, y, s, { taille: 11.5, couleur: c, police: MONO });

  // Une rangée de points, un par rencontre, qui apparaissent colonne par
  // colonne entre [de] et [a].
  const points = (x, y, n, { cols = 26, pas = 17, r = 5, couleur = VIOLET, de, a, dores = [] }) => {
    let s = '';
    const nc = Math.min(cols, n);
    for (let c = 0; c < nc; c++) {
      let col = '';
      for (let l = 0; l * cols + c < n; l++) {
        const k = l * cols + c;
        const d = dores.includes(k);
        col += `<circle cx="${x + c * pas + r}" cy="${y + l * pas + r}" r="${r}" fill="${couleur}" fill-opacity="${couleur === VIOLET ? 0.85 : 0.6}"/>`;
        if (d) col += `<circle cx="${x + c * pas + r}" cy="${y + l * pas + r}" r="${r + 0.5}" fill="${OR}" opacity="0">${fondu('opacity', C, [[0, 0], [dores.quand, 0], [dores.quand + 0.01, 1], [1, 1]])}</circle>`;
      }
      const inst = de + ((a - de) * c) / nc;
      s += `<g opacity="0">${fondu('opacity', C, [[0, 0], [inst, 0], [inst + 0.006, 1], [1, 1]])}${col}</g>`;
    }
    return s;
  };

  // 1. Au total.
  {
    const [de] = E[0];
    let p = rubrique(PX + 24, PY + 32, t('AU TOTAL : COMPTER, PUIS COMPARER', 'IN TOTAL: COUNT, THEN COMPARE'), ACCENT);
    p += texte(PX + 24, PY + 66, t('2026', '2026'), { taille: 13, couleur: TITRE, poids: 700 });
    p += texte(PX + PW - 24, PY + 66, t('78 rencontres', '78 encounters'), { taille: 13, couleur: VIOLET, poids: 700, ancre: 'end' });
    p += points(PX + 24, PY + 78, 78, { de: de + 0.01, a: de + 0.05 });
    p += texte(PX + 24, PY + 162, '2025', { taille: 13, couleur: TITRE, poids: 700 });
    p += texte(PX + PW - 24, PY + 162, t('33 rencontres', '33 encounters'), { taille: 13, couleur: TEXTE, poids: 700, ancre: 'end' });
    p += points(PX + 24, PY + 174, 33, { couleur: '#6B5A8A', de: de + 0.055, a: de + 0.08 });
    p += entre(C, de + 0.095, 1, `
      <rect x="${PX + 24}" y="${PY + 226}" width="${PW - 48}" height="54" rx="12" fill="${VERT}" fill-opacity="0.08" stroke="${VERT}" stroke-opacity="0.4"/>
      ${texte(PX + 44, PY + 260, '(78 − 33) / 33', { taille: 18, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(PX + PW - 44, PY + 260, '= +136 %', { taille: 20, couleur: VERT, police: MONO, poids: 800, ancre: 'end' })}`, 0.006);
    p += entre(C, de + 0.12, 1, `
      ${code(PX + 24, PY + 310, "COUNT(*) WHERE quand >= '2026-01-01' AND quand < '2027-01-01'")}
      ${texte(PX + 24, PY + 336, t('Les 18 personnes : COUNT(DISTINCT personne_id), chacune comptée une fois.', 'The 18 people: COUNT(DISTINCT personne_id), each counted once.'), { taille: 12.5 })}
      ${texte(PX + 24, PY + 356, t('Une année d’avant vide ? Pas de pourcentage : diviser par zéro ne dit rien.', 'An empty year before? No percentage: dividing by zero says nothing.'), { taille: 12.5 })}`, 0.006);
    corps += panneauCalcul(0, p);
  }

  // 2. Le podium : le tri se fait sous nos yeux.
  {
    const [de] = E[1];
    let p = rubrique(PX + 24, PY + 32, t('LES MIEUX NOTÉS : UNE MOYENNE, PUIS UN TRI', 'TOP RATED: AN AVERAGE, THEN A SORT'), ACCENT);
    // D'abord dans l'ordre où la base les trouve, puis triés.
    const lignes = [
      [GENS.ibrahim, '4,8', 10, 0, 2, 9.6],
      [GENS.gabriel, '4,8', 8, 1, 1, 9.6],
      [GENS.noa, '4,9', 14, 2, 0, 9.8],
    ];
    const tri = de + 0.075;
    lignes.forEach(([g, moy, fois, avant, apres]) => {
      const ya = PY + 50 + avant * 62, yb = PY + 50 + apres * 62;
      const premier = apres === 0;
      p += `<g>${glisse(C, [[0, `0 ${ya}`], [tri, `0 ${ya}`], [tri + 0.02, `0 ${yb}`], [1, `0 ${yb}`]])}
        <rect x="${PX + 24}" y="0" width="${PW - 48}" height="52" rx="11" fill="#0F151E" stroke="${BORD}"/>
        <rect x="${PX + 24}" y="0" width="${PW - 48}" height="52" rx="11" fill="none" stroke="${premier ? ACCENT : FIL}" stroke-width="1.4" opacity="0">${fondu('opacity', C, [[0, 0], [tri + 0.02, 0], [tri + 0.03, 1], [1, 1]])}</rect>
        <g opacity="0">${fondu('opacity', C, [[0, 0], [tri + 0.02, 0], [tri + 0.03, 1], [1, 1]])}
          <circle cx="${PX + 46}" cy="26" r="11" fill="${premier ? 'url(#marque)' : FIL}"/>
          ${texte(PX + 46, 30.5, String(apres + 1), { taille: 11.5, couleur: TITRE, poids: 800, ancre: 'middle' })}
        </g>
        ${visage(g.photo, PX + 66, 6, 40, 40, 10)}
        ${texte(PX + 118, 23, g.prenom, { taille: 13.5, couleur: TITRE, poids: 700 })}
        ${texte(PX + 118, 41, t(`${fois} rencontres notées`, `${fois} rated encounters`), { taille: 11.5 })}
        ${etoiles(PX + 300, 31, Math.round(parseFloat(moy.replace(',', '.')) * 2), { taille: 11 })}
        ${texte(PX + PW - 40, 32, moy, { taille: 17, couleur: premier ? ACCENT : TITRE, police: MONO, poids: 800, ancre: 'end' })}
      </g>`;
    });
    p += entre(C, tri - 0.03, 1, code(PX + 24, PY + 250, 'AVG(note) ORDER BY moyenne DESC, nb DESC LIMIT 3', ACCENT), 0.006);
    p += entre(C, tri + 0.035, 1, `
      ${texte(PX + 24, PY + 284, t('La note est en demi-points sur dix : la moyenne divisée par deux donne 4,9.', 'Scores are half-points out of ten: the average halved gives 4.9.'), { taille: 12.5 })}
      ${texte(PX + 24, PY + 312, t('Gabriel et Ibrahim affichent 4,8 tous les deux. C’est la moyenne exacte,', 'Gabriel and Ibrahim both show 4.8. The exact average, before rounding,'), { taille: 12.5, couleur: TITRE })}
      ${texte(PX + 24, PY + 330, t('avant l’arrondi, qui les départage, avant les 10 fois d’Ibrahim.', 'is what separates them, ahead of Ibrahim’s 10 times.'), { taille: 12.5, couleur: TITRE })}
      ${texte(PX + 24, PY + 358, t('Toutes années confondues : changer d’année ne change pas le podium.', 'Across all years: switching year leaves the podium as it is.'), { taille: 12.5 })}`, 0.006);
    corps += panneauCalcul(1, p);
  }

  // 3. Ce que ça a rapporté : sept soirées dorées sur soixante-dix-huit.
  {
    const [de] = E[2];
    let p = rubrique(PX + 24, PY + 32, t('CE QUE ÇA A RAPPORTÉ : UNE SOMME, UNE MOYENNE', 'WHAT IT BROUGHT IN: A SUM, AN AVERAGE'), OR);
    p += texte(PX + 24, PY + 66, t('Les 78 soirées de 2026, dont 7 avec un montant', 'The 78 nights of 2026, 7 of them with an amount'), { taille: 13, couleur: TITRE, poids: 700 });
    const dores = [3, 14, 22, 37, 45, 58, 71];
    dores.quand = de + 0.03;
    p += points(PX + 24, PY + 78, 78, { de: de + 0.004, a: de + 0.02, dores, couleur: '#4A3A68' });
    p += entre(C, de + 0.05, 1, `
      ${code(PX + 24, PY + 162, 'SUM(montant_centimes)', OR)}
      ${texte(PX + PW - 24, PY + 162, t('750 €', '€750'), { taille: 20, couleur: OR, poids: 800, ancre: 'end' })}`, 0.006);
    p += entre(C, de + 0.075, 1, `
      <rect x="${PX + 24}" y="${PY + 180}" width="${PW - 48}" height="50" rx="12" fill="${OR}" fill-opacity="0.08" stroke="${OR}" stroke-opacity="0.4"/>
      ${texte(PX + 44, PY + 211, t('750 € / 7 soirées payées', '€750 / 7 paid nights'), { taille: 15, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(PX + PW - 44, PY + 211, t('= 107,14 €', '= €107.14'), { taille: 17, couleur: OR, police: MONO, poids: 800, ancre: 'end' })}`, 0.006);
    p += entre(C, de + 0.1, 1, `
      ${texte(PX + 44, PY + 258, t('750 € / 78 soirées', '€750 / 78 nights'), { taille: 13, couleur: DISCRET, police: MONO })}
      ${texte(PX + PW - 44, PY + 258, t('= 9,62 €', '= €9.62'), { taille: 13, couleur: DISCRET, police: MONO, ancre: 'end' })}
      <line x1="${PX + 40}" y1="${PY + 254}" x2="${PX + PW - 40}" y2="${PY + 254}" stroke="${DISCRET}" stroke-width="1.5"/>
      ${texte(PX + 24, PY + 288, t('La moyenne ne compte que les soirées payées : les autres, où la question', 'The average only counts paid nights: the others, where the question'), { taille: 12.5 })}
      ${texte(PX + 24, PY + 306, t('ne se posait pas, la tireraient vers le bas.', 'never came up, would drag it down.'), { taille: 12.5 })}
      ${texte(PX + 24, PY + 334, t('La jauge dorée, c’est 7 sur 78 : on voit si c’est souvent ou rare.', 'The gold bar is 7 out of 78: you see whether it is often or rare.'), { taille: 12.5 })}
      ${texte(PX + 24, PY + 358, t('+36 % face à 2025. Si 2025 n’avait rien rapporté, pas de pourcentage.', '+36% on 2025. Had 2025 brought in nothing, there would be no percentage.'), { taille: 12.5 })}`, 0.006);
    corps += panneauCalcul(2, p);
  }

  // 4. Par mois : les barres montent, la moitié du maximum les départage.
  {
    const [de] = E[3];
    let p = rubrique(PX + 24, PY + 32, t('PAR MOIS : CHAQUE RENCONTRE DANS SON MOIS', 'BY MONTH: EACH ENCOUNTER IN ITS MONTH'), ACCENT);
    p += code(PX + 24, PY + 58, "strftime('%m', quand) … GROUP BY mois");
    const NOMS = EN ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
    const bx = PX + 30, bw = (PW - 60) / 12, base = PY + 262, hmax = 160;
    // La moitié du plus haut : au-dessus, la barre s'éclaire.
    const ym = base - (9 / 18) * hmax - 6;
    p += `<line x1="${bx}" y1="${ym}" x2="${bx + bw * 12}" y2="${ym}" stroke="${ACCENT}" stroke-opacity="0.45" stroke-dasharray="4 5"/>`;
    p += texte(bx, ym - 8, t('la moitié du plus haut : 9', 'half the highest: 9'), { taille: 10.5, couleur: ACCENT, police: MONO });
    MOIS.forEach((v, i) => {
      const h = (v / 18) * hmax + 6, x = bx + i * bw + 5, w = bw - 10;
      const a = de + 0.015 + i * 0.006;
      const c = i === 8 ? 'url(#barreStats)' : VIOLET;
      const op = i === 8 ? 1 : v > 9 ? 0.6 : 0.24;
      p += `<rect x="${x}" width="${w}" rx="5" fill="${c}" fill-opacity="${op}" y="${base - 4}" height="4">
        ${fondu('height', C, [[0, 4], [a, 4], [a + 0.02, h], [1, h]])}${fondu('y', C, [[0, base - 4], [a, base - 4], [a + 0.02, base - h], [1, base - h]])}</rect>
        ${entre(C, a + 0.02, 1, texte(x + w / 2, base - h - 7, String(v), { taille: 11, couleur: i === 8 ? ACCENT : v ? TEXTE : DISCRET, police: MONO, poids: 700, ancre: 'middle' }), 0.004)}
        ${texte(x + w / 2, base + 18, NOMS[i], { taille: 10.5, couleur: DISCRET, ancre: 'middle' })}`;
    });
    p += entre(C, de + 0.1, 1, `
      ${texte(PX + 24, PY + 316, t('Le plus chargé s’écrit « Septembre · 18 fois ». Sans le mot « fois »,', 'The busiest reads “September · 18 times”. Without the word “times”,'), { taille: 12.5, couleur: TITRE })}
      ${texte(PX + 24, PY + 334, t('on lisait une date : le 18 septembre.', 'it read like a date: 18 September.'), { taille: 12.5, couleur: TITRE })}
      ${texte(PX + 24, PY + 360, t('Douze entiers remontent de la base, pas soixante-dix-huit rencontres.', 'Twelve integers come back from the database, not seventy-eight encounters.'), { taille: 12.5 })}`, 0.006);
    corps += panneauCalcul(3, p);
  }

  // 5. La répartition : dix-huit visages se rangent par rôle.
  {
    const [de] = E[4];
    let p = rubrique(PX + 24, PY + 32, t('RÉPARTITION : DES PERSONNES, PAS DES FOIS', 'BREAKDOWN: PEOPLE, NOT TIMES'), ACCENT);
    const groupes = {
      versatile: ['lou', 'emma', 'chloe', 'gabriel', 'noa', 'enzo', 'kelyan', 'malo'],
      actif: ['matteo', 'ines', 'sami', 'ibrahim', 'adam', 'nathan'],
      passif: ['jade', 'raphael', 'erwan', 'tom'],
    };
    const noms = { versatile: t('Versatile · 8', 'Versatile · 8'), actif: t('Actif · 6', 'Top · 6'), passif: t('Passif · 4', 'Bottom · 4') };
    const tous = Object.keys(GENS);
    const range = de + 0.035, cote = 34;
    // Où chacun finit : trois colonnes, une par rôle.
    const place = {};
    Object.entries(groupes).forEach(([role, liste], g) => {
      liste.forEach((k, j) => { place[k] = [PX + 34 + g * 118 + (j % 2) * 42, PY + 92 + Math.floor(j / 2) * 42, role]; });
    });
    Object.entries(groupes).forEach(([role], g) => {
      p += entre(C, range + 0.01, 1, `
        <rect x="${PX + 28 + g * 118}" y="${PY + 62}" width="96" height="3" rx="1.5" fill="${ROLES[role]}"/>
        ${texte(PX + 28 + g * 118, PY + 82, noms[role], { taille: 12, couleur: ROLES[role], poids: 700 })}`, 0.006);
    });
    tous.forEach((k, i) => {
      const x0 = PX + 34 + (i % 9) * 42, y0 = PY + 110 + Math.floor(i / 9) * 42;
      const [x1, y1, role] = place[k];
      const apparait = de + 0.004 + i * 0.0012;
      p += `<g opacity="0">${fondu('opacity', C, [[0, 0], [apparait, 0], [apparait + 0.006, 1], [1, 1]])}
        <g>${glisse(C, [[0, `${x0} ${y0}`], [range, `${x0} ${y0}`], [range + 0.025, `${x1} ${y1}`], [1, `${x1} ${y1}`]])}
          ${visage(GENS[k].photo, 0, 0, cote, cote, 9)}
          <rect width="${cote}" height="${cote}" rx="9" fill="none" stroke="${ROLES[role]}" stroke-width="2" opacity="0">${fondu('opacity', C, [[0, 0], [range + 0.02, 0], [range + 0.03, 1], [1, 1]])}</rect>
        </g></g>`;
    });
    // L'anneau, qui se trace une fois le rangement fait.
    let debutA = 0;
    const AX = PX + PW - 88, AY = PY + 160;
    const trace = range + 0.035;
    [['versatile', 8], ['actif', 6], ['passif', 4]].forEach(([role, n], i) => {
      const fin = debutA + n / 18;
      const d = arc(AX, AY, 52, debutA + 0.006, fin - 0.006);
      const long = 2 * Math.PI * 52 * (fin - debutA);
      const a = trace + i * 0.012;
      p += `<path d="${d}" fill="none" stroke="${ROLES[role]}" stroke-width="16" stroke-dasharray="${long} ${long}" stroke-dashoffset="${long}">
        ${fondu('stroke-dashoffset', C, [[0, long], [a, long], [a + 0.015, 0], [1, 0]])}</path>`;
      debutA = fin;
    });
    p += entre(C, trace, 1, `${texte(AX, AY + 7, '18', { taille: 24, couleur: TITRE, poids: 800, ancre: 'middle' })}
      ${texte(AX, AY + 24, t('fiches', 'cards'), { taille: 11, couleur: TEXTE, ancre: 'middle' })}`, 0.006);
    p += entre(C, trace + 0.04, 1, `
      ${code(PX + 24, PY + 300, "SELECT role, COUNT(*) FROM personnes GROUP BY role")}
      ${texte(PX + 24, PY + 328, t('Comptées en personnes : la question est « avec qui », pas « combien de fois ».', 'Counted in people: the question is “who with”, not “how many times”.'), { taille: 12.5, couleur: TITRE })}
      ${texte(PX + 24, PY + 352, t('Toutes les fiches où le rôle est renseigné, quelle que soit l’année.', 'Every card where the role is filled in, whatever the year.'), { taille: 12.5 })}`, 0.006);
    corps += panneauCalcul(4, p);
  }

  // ------------------------------------------------ trois cartes du bas
  const bas3 = [
    [VIOLET, t('Calculé dans la base', 'Computed in the database'),
      t('COUNT, SUM et AVG en SQL : pour douze', 'COUNT, SUM and AVG in SQL: no need to'), t('barres, rien à rapatrier dans l’appli.', 'haul every encounter into the app.')],
    [ACCENT, t('Une autre année', 'Another year'),
      t('Toucher 2025 refait tout sur 2025.', 'Tapping 2025 redoes it all for 2025.'), t('Rien de 2024 ? Le pourcentage disparaît.', 'Nothing in 2024? The percentage goes.')],
    [OR, t('L’année, ou toujours', 'The year, or always'),
      t('Total, gains, mois : l’année choisie.', 'Total, earnings, months: the chosen year.'), t('Podium et rôles : toutes les fiches.', 'Podium and roles: every card.')],
  ];
  bas3.forEach(([c, titre, l1, l2], i) => {
    const x = 400 + i * 280, y = 512;
    corps += `<rect x="${x}" y="${y}" width="260" height="104" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(x + 20, y + 34, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 60, l1, { taille: 12 })}
      ${texte(x + 20, y + 80, l2, { taille: 12 })}`;
  });
  corps += texte(810, 662, t('Les chiffres sont ceux du jeu d’essai, les mêmes que sur les captures.', 'The figures come from the sample data, the same as in the screenshots.'), { taille: 12.5, couleur: DISCRET, ancre: 'middle' });

  svg('statistiques.svg', 1280, 720, corps, t(
    'L’écran des statistiques et d’où sortent ses chiffres. Au total : 78 rencontres en 2026 contre 33 en 2025, soit +136 %, avec 18 personnes comptées une fois chacune. Les mieux notés : la moyenne des notes, divisée par deux pour tenir sur cinq, puis le nombre de fois ; Noa J. à 4,9, Gabriel T. et Ibrahim D. à 4,8, départagés par la moyenne exacte ; le podium vaut pour toutes les années. Ce que ça a rapporté : 750 € sur 7 soirées payées des 78, soit 107,14 € en moyenne, la moyenne ne comptant que les soirées payées. Par mois : chaque rencontre rangée dans son mois, septembre en tête avec 18 fois. Répartition : 18 fiches rangées par rôle, 8 versatiles, 6 actifs, 4 passifs, comptées en personnes et non en rencontres. Tout est calculé en SQL dans la base chiffrée.',
    'The stats screen and where its figures come from. In total: 78 encounters in 2026 against 33 in 2025, or +136%, with 18 people each counted once. Top rated: the average score, halved to fit out of five, then the number of times; Noa J. at 4.9, Gabriel T. and Ibrahim D. at 4.8, split by the exact average; the podium covers every year. What it brought in: €750 over 7 paid nights out of 78, or €107.14 on average, the average only counting paid nights. By month: each encounter in its month, September first with 18 times. Breakdown: 18 cards sorted by role, 8 versatile, 6 top, 4 bottom, counted in people, not encounters. Everything is computed in SQL inside the encrypted database.'));
};

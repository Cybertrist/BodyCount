// Les fonctionnalités, en vitrine : le téléphone passe d'un écran à
// l'autre, et à droite la tuile de ce qu'il montre s'allume.
//
// Onze fonctionnalités, onze tranches égales du cycle. Chaque tuile garde
// une coche une fois vue, pour qu'on sache où en est le tour. Le détail de
// chacune a son propre schéma plus bas dans le README : celui-ci ne fait
// que les présenter.
module.exports = (O) => {
  const { t, svg, texte, entete, paliers, fondu, visible, entre, telephone, toucher, empreinte, logo, icone, visage,
    etoiles, pastille, bouton, barreNav, cartePersonne, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL,
    ACCENT, VIOLET, FUCHSIA, VERT, OR, ROUGE, BLEU } = O;
  const N = 11, C = 44;
  const A = (k) => k / N + 0.003, B = (k) => (k + 1) / N - 0.003;
  /// Un instant dans la tranche k, en fraction de la tranche.
  const dans = (k, f) => A(k) + (B(k) - A(k)) * f;

  let corps = entete(t('LES FONCTIONNALITÉS', 'THE FEATURES'),
    t('Tout ce que fait BodyCount, sur le téléphone et nulle part ailleurs.', 'Everything BodyCount does, on the phone and nowhere else.'));

  // Quelques pictogrammes de plus, dans le même carré de 16.
  const PICTO = {
    grille: (c) => `<rect x="2" y="2" width="5" height="5" rx="1.3" fill="none" stroke="${c}" stroke-width="1.5"/><rect x="9" y="2" width="5" height="5" rx="1.3" fill="none" stroke="${c}" stroke-width="1.5"/><rect x="2" y="9" width="5" height="5" rx="1.3" fill="none" stroke="${c}" stroke-width="1.5"/><rect x="9" y="9" width="5" height="5" rx="1.3" fill="none" stroke="${c}" stroke-width="1.5"/>`,
    barres: (c) => `<path d="M3 14 V9 M8 14 V3 M13 14 V6" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`,
    carte: (c) => `<path d="M1.5 4 L5.5 2.5 L10.5 4 L14.5 2.5 V12 L10.5 13.5 L5.5 12 L1.5 13.5 Z M5.5 2.5 V12 M10.5 4 V13.5" fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round"/>`,
    reprendre: (c) => `<path d="M3 8 a5 5 0 1 0 1.6 -3.7 M3 2 V5 H6" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    itineraire: (c) => `<path d="M8 1.5 L14.5 8 L8 14.5 L1.5 8 Z M6 10 V7.5 H10 M8.5 5.8 L10.2 7.5 L8.5 9.2" fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>`,
    ecrans: (c) => `<rect x="1" y="4" width="5" height="9" rx="1.2" fill="none" stroke="${c}" stroke-width="1.4"/><rect x="7.5" y="2" width="7.5" height="11" rx="1.2" fill="none" stroke="${c}" stroke-width="1.4"/>`,
    mur: (c) => `<path d="M8 1.5 L14 4 V8 C14 11.5 11.3 13.8 8 14.8 C4.7 13.8 2 11.5 2 8 V4 Z" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/><path d="M5.5 8 L7.3 9.8 L10.8 6.2" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
  const picto = (nom, x, y, c, k = 1) => (PICTO[nom] ? `<g transform="translate(${x} ${y}) scale(${k})">${PICTO[nom](c)}</g>` : icone(nom, x, y, c, k));

  // ------------------------------------------------------------ les tuiles
  const TUILES = [
    ['empreinte', VIOLET, t('Verrouillage biométrique', 'Biometric lock'), t('L’empreinte charge la clé.', 'The fingerprint loads the key.'), t('Sans elle, la base est illisible.', 'Without it, the database is noise.')],
    ['grille', FUCHSIA, t('Répertoire', 'People'), t('Photos, carnet daté, étiquettes,', 'Photos, dated notes, tags,'), t('genre, rôle, notes sur cinq.', 'gender, role, ratings out of five.')],
    ['barres', ACCENT, t('Statistiques', 'Statistics'), t('Le total de l’année, le rythme', 'The year’s total, the monthly'), t('mois par mois, le podium.', 'rhythm, the podium.')],
    ['carte', BLEU, t('Carte de France', 'Map of France'), t('34 836 communes embarquées,', '34,836 communes built in,'), t('même mal orthographiées.', 'even when misspelled.')],
    ['calendrier', VIOLET, t('Calendrier', 'Calendar'), t('Sept colonnes, et sous chaque', 'Seven columns, and under each'), t('jour, ce qu’il a eu de rare.', 'day, what made it rare.')],
    ['photo', FUCHSIA, t('Galerie privée', 'Private gallery'), t('Photos et vidéos chiffrées,', 'Encrypted photos and videos,'), t('absentes de la galerie Android.', 'absent from the Android gallery.')],
    ['fichier', VERT, t('Sauvegarde complète', 'Full backup'), t('Tout dans un fichier, fermé', 'Everything in one file, locked'), t('par ta phrase de passe.', 'by your passphrase.')],
    ['euro', OR, t('Ce que ça rapporte', 'What it brings in'), t('Un montant par rencontre, le', 'An amount per encounter, the'), t('total et la moyenne de l’année.', 'year’s total and average.')],
    ['reprendre', ACCENT, t('Tout se reprend', 'Nothing is final'), t('Fiche, rencontre, note, photo :', 'Card, encounter, note, photo:'), t('rien n’est définitif.', 'everything can be undone.')],
    ['itineraire', BLEU, t('Adresse et itinéraire', 'Address and route'), t('La seule sortie du téléphone,', 'The only way out of the phone,'), t('et seulement sur un toucher.', 'and only on a tap.')],
    ['ecrans', VIOLET, t('Trois formats d’écran', 'Three screen sizes'), t('Téléphone, couverture, déplié :', 'Phone, cover screen, unfolded:'), t('la mise en page suit.', 'the layout follows.')],
  ];
  const GX = 400, GY = 92, TL = 264, TH = 124, PAS_X = TL + 14, PAS_Y = TH + 14;
  TUILES.forEach(([ic, c, titre, l1, l2], k) => {
    const x = GX + (k % 3) * PAS_X, y = GY + Math.floor(k / 3) * PAS_Y;
    const a = A(k), b = B(k);
    corps += `<g>
      <rect x="${x}" y="${y}" width="${TL}" height="${TH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y}" width="${TL}" height="${TH}" rx="14" fill="${c}" fill-opacity="0.07" stroke="${c}" stroke-width="1.6" opacity="0">${visible(C, a, b, 0.004)}</rect>
      <rect x="${x + 16}" y="${y + 16}" width="32" height="32" rx="9" fill="${c}" fill-opacity="0.13" stroke="${c}" stroke-opacity="0.45"/>
      ${ic === 'empreinte' ? empreinte(x + 32, y + 32, 20, c) : picto(ic, x + 24, y + 24, c)}
      <g opacity="0">${fondu('opacity', C, [[0, 0], [b, 0], [b + 0.004, 1], [0.995, 1], [1, 0]])}
        <circle cx="${x + 47}" cy="${y + 47}" r="8" fill="${c}" stroke="${CARTE}" stroke-width="2"/>${icone('coche', x + 41.5, y + 41.5, '#FFFFFF', 0.7)}
      </g>
      ${texte(x + 60, y + 37, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 16, y + 76, l1, { taille: 12.5 })}
      ${texte(x + 16, y + 95, l2, { taille: 12.5 })}
      <rect x="${x + 16}" y="${y + TH - 13}" width="${TL - 32}" height="3" rx="1.5" fill="${FIL}" fill-opacity="0.5" opacity="0">${visible(C, a, b, 0.004)}</rect>
      <rect x="${x + 16}" y="${y + TH - 13}" height="3" rx="1.5" width="0" fill="${c}">${fondu('width', C, [[0, 0], [a, 0], [b, TL - 32], [b + 0.003, 0], [1, 0]])}</rect>
    </g>`;
  });
  // La douzième case : ce qui les tient toutes.
  {
    const x = GX + 2 * PAS_X, y = GY + 3 * PAS_Y;
    corps += `<rect x="${x}" y="${y}" width="${TL}" height="${TH}" rx="14" fill="${VERT}" fill-opacity="0.05" stroke="${VERT}" stroke-opacity="0.35" stroke-dasharray="5 5"/>
      <rect x="${x + 16}" y="${y + 16}" width="32" height="32" rx="9" fill="${VERT}" fill-opacity="0.13" stroke="${VERT}" stroke-opacity="0.45"/>
      ${picto('mur', x + 24, y + 24, VERT)}
      ${texte(x + 60, y + 37, t('Rien ne sort', 'Nothing leaves'), { taille: 13.5, couleur: VERT, police: MONO, poids: 700 })}
      ${texte(x + 16, y + 76, t('Pas de serveur, pas de compte,', 'No server, no account,'), { taille: 12.5 })}
      ${texte(x + 16, y + 95, t('pas de télémétrie.', 'no telemetry.'), { taille: 12.5 })}`;
  }
  corps += texte(GX + (3 * PAS_X - 14) / 2, 676, t('Chacune a son schéma plus bas, qui la montre en détail.', 'Each one has its own diagram further down, showing it in detail.'), { taille: 12.5, couleur: DISCRET, ancre: 'middle' });

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  const scenes = [];
  const titreEcran = (s, droite = '') => `${texte(SX + 18, SY + 44, s, { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
    ${droite ? `<rect x="${SX + SL - 18 - droite.length * 6.2 - 18}" y="${SY + 28}" width="${droite.length * 6.2 + 18}" height="24" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>${texte(SX + SL - 27, SY + 44, droite, { taille: 10.5, couleur: APP.texte, poids: 700, ancre: 'end' })}` : ''}`;
  const panneau = (x, y, l, h) => `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="18" fill="${APP.carte}" stroke="${APP.bord}"/>`;
  const petit = (x, y, s, c = APP.second) => texte(x, y, s, { taille: 9.5, couleur: c, poids: 700, extra: 'letter-spacing="1.4"' });

  // 1. Le verrou.
  {
    const k = 0, touche = dans(k, 0.35), ouvre = dans(k, 0.62);
    scenes.push(`${logo(SX + SL / 2, SY + 128, 76)}
      ${texte(SX + SL / 2, SY + 212, 'BodyCount', { taille: 30, couleur: APP.texte, poids: 800, ancre: 'middle' })}
      ${texte(SX + SL / 2, SY + 240, t('Tout reste sur cet appareil. Aucun compte,', 'Everything stays on this device. No account,'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
      ${texte(SX + SL / 2, SY + 257, t('aucun serveur, aucune requête réseau.', 'no server, no network request.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
      <circle cx="${SX + SL / 2}" cy="${SY + 380}" r="56" fill="${VIOLET}" opacity="0.12"><animate attributeName="r" dur="2.6s" repeatCount="indefinite" values="50;62;50"/></circle>
      <circle cx="${SX + SL / 2}" cy="${SY + 380}" r="46" fill="url(#marque)"/>
      ${empreinte(SX + SL / 2, SY + 380, 44, '#FFFFFF')}
      ${entre(C, A(k), touche, texte(SX + SL / 2, SY + 470, t('Touche le capteur pour ouvrir', 'Touch the sensor to open'), { taille: 12.5, couleur: APP.second, poids: 600, ancre: 'middle' }), 0.003)}
      ${entre(C, touche, ouvre, texte(SX + SL / 2, SY + 470, t('Vérification…', 'Checking…'), { taille: 12.5, couleur: APP.rose, poids: 600, ancre: 'middle' }), 0.003)}
      ${entre(C, ouvre, B(k), texte(SX + SL / 2, SY + 470, t('Clé chargée', 'Key loaded'), { taille: 12.5, couleur: APP.vert, poids: 700, ancre: 'middle' }), 0.003)}
      ${toucher(SX + SL / 2, SY + 380, C, touche)}
      ${icone('cadenas', SX + 38, SY + SH - 40, APP.vert, 0.75)}
      ${texte(SX + 54, SY + SH - 29, t('Base chiffrée, clé rangée dans le Keystore', 'Encrypted database, key kept in the Keystore'), { taille: 10, couleur: APP.second, poids: 600 })}`);
  }

  // 2. Le répertoire.
  {
    const k = 1;
    let s = `${titreEcran(t('RÉPERTOIRE', 'PEOPLE'))}
      <rect x="${SX + 128}" y="${SY + 28}" width="${SL - 146}" height="26" rx="13" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${icone('loupe', SX + 138, SY + 33, APP.second, 0.8)}
      ${texte(SX + 156, SY + 45, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 10, couleur: APP.discret })}`;
    let cx = SX + 12;
    [[t('Récents', 'Recent'), true], [t('Mieux notés', 'Top rated'), false], [t('Plus vues', 'Most seen'), false]].forEach(([p, plein]) => {
      s += pastille(cx, SY + 66, p, { plein, taille: 10 });
      cx += O.largeurPastille(p, 10) + 6;
    });
    const CL = (SL - 36) / 2, CH = 142;
    [GENS.noa, GENS.lou, GENS.enzo, GENS.jade, GENS.matteo, GENS.gabriel].forEach((p, i) => {
      s += cartePersonne(p, SX + 12 + (i % 2) * (CL + 12), SY + 100 + Math.floor(i / 2) * (CH + 10), CL, CH, { premier: i === 0 });
    });
    s += barreNav(T, 'Fiches') + toucher(SX + 70, SY + 180, C, dans(k, 0.7));
    scenes.push(s);
  }

  // 3. Les statistiques.
  {
    const k = 2, X = SX + 12, L = SL - 24;
    let s = `${petit(SX + 18, SY + 36, t('STATISTIQUES', 'STATISTICS'), APP.texte)}
      ${texte(SX + 18, SY + 66, '2026', { taille: 26, couleur: APP.texte, poids: 800 })}
      ${pastille(SX + 18, SY + 78, '2026', { plein: true, taille: 10 })}${pastille(SX + 78, SY + 78, '2025', { taille: 10 })}
      ${panneau(X, SY + 112, L, 100)}
      ${petit(X + 16, SY + 136, t('AU TOTAL', 'IN TOTAL'))}
      <rect x="${X + L - 74}" y="${SY + 124}" width="60" height="20" rx="10" fill="${APP.vert}" fill-opacity="0.14" stroke="${APP.vert}" stroke-opacity="0.5"/>
      ${texte(X + L - 44, SY + 138, '+136 %', { taille: 10, couleur: APP.vert, poids: 800, ancre: 'middle' })}
      ${texte(X + L - 14, SY + 160, 'vs 2025', { taille: 9.5, couleur: APP.second, ancre: 'end' })}
      ${texte(X + 16, SY + 182, '78', { taille: 38, couleur: APP.rose, poids: 800 })}
      ${texte(X + 16, SY + 200, t('Rencontres · 18 personnes', 'Encounters · 18 people'), { taille: 10, couleur: APP.second })}
      ${panneau(X, SY + 222, L, 110)}
      ${petit(X + 16, SY + 246, t('PAR MOIS', 'BY MONTH'))}
      ${texte(X + L - 14, SY + 246, t('Septembre · 18 fois', 'September · 18 times'), { taille: 9.5, couleur: APP.texte, poids: 700, ancre: 'end' })}`;
    const mois = [5, 7, 8, 7, 12, 7, 10, 4, 18, 0, 0, 0];
    const bl = (L - 32 - 11 * 5) / 12;
    mois.forEach((v, i) => {
      const h = Math.max(3, v * 3.6), x = X + 16 + i * (bl + 5), yb = SY + 318;
      const de = dans(k, 0.08 + i * 0.03);
      s += `<rect x="${x.toFixed(1)}" width="${bl.toFixed(1)}" rx="2.5" fill="${i === 8 ? APP.fuchsia : APP.violet}" fill-opacity="${i === 8 ? 1 : 0.55}" y="${yb}" height="0">
        ${fondu('height', C, [[0, 0], [de, 0], [de + 0.008, h], [1, h]])}${fondu('y', C, [[0, yb], [de, yb], [de + 0.008, yb - h], [1, yb - h]])}</rect>`;
    });
    s += `${panneau(X, SY + 342, L, 140)}${petit(X + 16, SY + 366, t('LES MIEUX NOTÉS', 'TOP RATED'))}`;
    [[GENS.gabriel, 2, 46, '4,8'], [GENS.noa, 1, 56, '4,9'], [GENS.ibrahim, 3, 40, '4,8']].forEach(([p, rang, h, note], i) => {
      const x = X + 18 + i * 74, y = SY + 446 - h;
      s += `${visage(p.photo, x, y - 14, 62, 62, 14)}
        <circle cx="${x + 8}" cy="${y - 10}" r="8" fill="${rang === 1 ? APP.or : APP.surface}" stroke="${APP.bord}"/>
        ${texte(x + 8, y - 6.5, String(rang), { taille: 9, couleur: rang === 1 ? '#3A2606' : APP.texte, poids: 800, ancre: 'middle' })}
        ${texte(x + 31, SY + 462, EN_(note), { taille: 10, couleur: APP.rose, poids: 800, ancre: 'middle' })}${texte(x + 31, SY + 475, p.prenom, { taille: 8.5, couleur: APP.texte, poids: 700, ancre: 'middle' })}`;
    });
    s += barreNav(T, 'Stats');
    scenes.push(s);
  }
  function EN_(note) { return O.EN ? note.replace(',', '.') : note; }

  // 4. La carte.
  {
    const k = 3, MX = SX + 12, MY = SY + 68, ML = SL - 24, MH = 250;
    let s = `${titreEcran(t('TES LIEUX', 'YOUR PLACES'), t('11 Villes', '11 Cities'))}
      <clipPath id="fcCarte"><rect x="${MX}" y="${MY}" width="${ML}" height="${MH}" rx="18"/></clipPath>
      <rect x="${MX}" y="${MY}" width="${ML}" height="${MH}" rx="18" fill="#1B0C36" stroke="${APP.bord}"/>
      <g clip-path="url(#fcCarte)">`;
    // Une Bretagne stylisée : la pointe à l'ouest, la Loire au sud-est.
    const cote = [[0.02, 0.42], [0.1, 0.35], [0.18, 0.31], [0.27, 0.29], [0.35, 0.22], [0.45, 0.25], [0.55, 0.18], [0.65, 0.21], [0.74, 0.15], [0.86, 0.18], [1.05, 0.12], [1.05, 1.05], [0.9, 0.95],
      [0.82, 0.84], [0.72, 0.76], [0.62, 0.72], [0.52, 0.69], [0.44, 0.64], [0.34, 0.61], [0.26, 0.58], [0.16, 0.55], [0.08, 0.5], [0.02, 0.47]];
    const P = ([u, v]) => [MX + u * ML, MY + v * MH];
    s += `<path d="${cote.map((p, i) => (i ? 'L' : 'M') + P(p).map((n) => n.toFixed(1)).join(' ')).join(' ')} Z" fill="#2C1857" stroke="${APP.violet}" stroke-opacity="0.55" stroke-width="1.2"/>
      <path d="M${P([0.3, 0.3]).join(' ')} L${P([0.34, 0.6]).join(' ')} M${P([0.6, 0.2]).join(' ')} L${P([0.62, 0.71]).join(' ')} M${P([0.62, 0.45]).join(' ')} L${P([1.05, 0.5]).join(' ')}" stroke="${APP.violet}" stroke-opacity="0.18" fill="none"/>`;
    const villes = [['Vannes', 0.5, 0.63, 65, 0], ['Rennes', 0.8, 0.38, 15, 1], ['Lorient', 0.36, 0.57, 10, 2], ['Nantes', 0.86, 0.8, 6, 3], ['Quimper', 0.2, 0.49, 2, 4]];
    villes.forEach(([nom, u, v, n, i]) => {
      const [x, y] = P([u, v]), r = 9 + Math.min(13, Math.sqrt(n) * 1.6), de = dans(k, 0.1 + i * 0.08);
      s += `<g opacity="0">${fondu('opacity', C, [[0, 0], [de, 0], [de + 0.006, 1], [1, 1]])}
        ${i === 0 ? `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${APP.fuchsia}" stroke-width="2"><animate attributeName="r" dur="2s" repeatCount="indefinite" values="${r};${r + 16}"/><animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.7;0"/></circle>` : ''}
        <circle cx="${x}" cy="${y}" r="${r}" fill="${i === 0 ? APP.rose : APP.violet}" stroke="#FFFFFF" stroke-opacity="0.6"/>
        ${texte(x, y + 4, String(n), { taille: 10.5, couleur: i === 0 ? '#3B0764' : '#FFFFFF', poids: 800, ancre: 'middle' })}
        ${texte(x, y + r + 12, nom.toUpperCase(), { taille: 7.5, couleur: '#FFFFFF', poids: 800, ancre: 'middle', extra: 'letter-spacing="0.8"' })}
      </g>`;
    });
    s += `</g>${panneau(MX, MY + MH + 12, ML, 142)}${petit(MX + 16, MY + MH + 36, t('CLASSEMENT', 'RANKING'))}`;
    [['Vannes', 61, '55 %'], ['Rennes', 15, '14 %'], ['Lorient', 10, '9 %']].forEach(([nom, n, pc], i) => {
      const y = MY + MH + 60 + i * 30, lb = ML - 32, de = dans(k, 0.5 + i * 0.05);
      s += `${texte(MX + 16, y, nom, { taille: 11, couleur: APP.texte, poids: 700 })}
        ${texte(MX + ML - 48, y, String(n), { taille: 11, couleur: APP.texte, poids: 800, ancre: 'end' })}
        ${texte(MX + ML - 16, y, pc, { taille: 8.5, couleur: APP.second, ancre: 'end' })}
        <rect x="${MX + 16}" y="${y + 7}" width="${lb}" height="5" rx="2.5" fill="#FFFFFF" fill-opacity="0.06"/>
        <rect x="${MX + 16}" y="${y + 7}" height="5" rx="2.5" width="0" fill="${i === 0 ? APP.fuchsia : APP.violet}">${fondu('width', C, [[0, 0], [de, 0], [de + 0.01, lb * n / 61], [1, lb * n / 61]])}</rect>`;
    });
    s += barreNav(T, 'Carte');
    scenes.push(s);
  }

  // 5. Le calendrier.
  {
    const k = 4, X = SX + 12, L = SL - 24;
    let s = `${titreEcran(t('CALENDRIER', 'CALENDAR'), t('111 Rencontres', '111 Encounters'))}
      ${pastille(SX + 14, SY + 66, '2026', { plein: true, taille: 10 })}${pastille(SX + 74, SY + 66, '2025', { taille: 10 })}
      ${panneau(X, SY + 100, L, 272)}
      ${texte(SX + SL / 2, SY + 126, t('SEPTEMBRE 2026', 'SEPTEMBER 2026'), { taille: 11, couleur: APP.texte, poids: 800, ancre: 'middle', extra: 'letter-spacing="1.2"' })}
      ${texte(SX + SL / 2, SY + 141, t('18 rencontres · 50 €', '18 encounters · €50'), { taille: 9, couleur: APP.second, ancre: 'middle' })}`;
    const col = (L - 20) / 7;
    (O.EN ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['L', 'M', 'M', 'J', 'V', 'S', 'D']).forEach((j, i) => {
      s += texte(X + 10 + col * i + col / 2, SY + 164, j, { taille: 9, couleur: APP.discret, poids: 700, ancre: 'middle' });
    });
    const pleins = { 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 1, 23: 2, 5: 1, 9: 1 };
    const signes = [APP.or, APP.rose, APP.vert, BLEU];
    for (let d = 1; d <= 30; d++) {
      const pos = d + 1, i = pos % 7, ligne = Math.floor(pos / 7);
      const cx = X + 10 + col * i + col / 2, cy = SY + 190 + ligne * 36;
      if (pleins[d]) {
        const de = dans(k, 0.08 + (d % 12) * 0.035);
        // Le chiffre grisé d'abord, que le disque vient recouvrir.
        s += texte(cx, cy + 3.5, String(d), { taille: 9.5, couleur: APP.discret, ancre: 'middle' });
        s += `<g opacity="0">${fondu('opacity', C, [[0, 0], [de, 0], [de + 0.005, 1], [1, 1]])}
          <circle cx="${cx}" cy="${cy}" r="12" fill="${pleins[d] === 2 ? APP.or : APP.violet}"/>
          ${texte(cx, cy + 3.5, String(d), { taille: 9.5, couleur: pleins[d] === 2 ? '#3A2606' : '#FFFFFF', poids: 800, ancre: 'middle' })}
          ${[0, 1, 2].map((j) => `<circle cx="${cx - 6 + j * 6}" cy="${cy + 17}" r="2" fill="${signes[(d + j) % 4]}"/>`).join('')}
        </g>`;
      } else s += texte(cx, cy + 3.5, String(d), { taille: 9.5, couleur: APP.discret, ancre: 'middle' });
    }
    s += `${petit(SX + 18, SY + 398, t('SEPTEMBRE · 18 RENCONTRES', 'SEPTEMBER · 18 ENCOUNTERS'), APP.texte)}
      ${panneau(X, SY + 410, L, 58)}
      ${visage(GENS.malo.photo, X + 10, SY + 419, 40, 40, 11)}
      ${texte(X + 60, SY + 435, GENS.malo.prenom, { taille: 12, couleur: APP.texte, poids: 800 })}
      ${etoiles(X + 60, SY + 450, 7, { taille: 8 })}
      ${texte(X + 60, SY + 462, t('25 sept. · Marseille · 23h30', '25 Sept. · Marseille · 11:30 pm'), { taille: 8.5, couleur: APP.discret })}
      ${barreNav(T, 'Agenda')}`;
    scenes.push(s);
  }

  // 6. La galerie privée.
  {
    const k = 5, ouvre = dans(k, 0.5);
    const vign = (x, y, l, video) => `${visage(GENS.enzo.photo, x, y, l, l, 12)}
      ${video ? `<circle cx="${x + l / 2}" cy="${y + l / 2}" r="13" fill="#000000" fill-opacity="0.55"/>${icone('lecture', x + l / 2 - 6, y + l / 2 - 8, '#FFFFFF', 1)}${texte(x + l - 6, y + l - 7, '0:42', { taille: 8.5, couleur: '#FFFFFF', poids: 700, ancre: 'end' })}` : ''}
      <rect x="${x + 6}" y="${y + 6}" width="18" height="18" rx="6" fill="${APP.fond}" fill-opacity="0.7"/>${icone('cadenas', x + 7.5, y + 7.5, APP.rose, 0.95)}`;
    const L3 = (SL - 48) / 3;
    const galerie = `${texte(SX + 20, SY + 48, '‹', { taille: 24, couleur: APP.texte })}
      ${texte(SX + 44, SY + 48, t('Photos et vidéos', 'Photos and videos'), { taille: 18, couleur: APP.texte, poids: 800 })}
      ${petit(SX + 18, SY + 86, t('GALERIE · 3', 'GALLERY · 3'))}
      ${vign(SX + 12, SY + 98, L3, false)}${vign(SX + 24 + L3, SY + 98, L3, true)}${vign(SX + 36 + 2 * L3, SY + 98, L3, false)}
      <rect x="${SX + 12}" y="${SY + 110 + L3}" width="${L3}" height="${L3}" rx="12" fill="none" stroke="${APP.bord}" stroke-dasharray="4 4"/>
      <path d="M${SX + 12 + L3 / 2 - 8} ${SY + 110 + L3 * 1.5} h16 M${SX + 12 + L3 / 2} ${SY + 110 + L3 * 1.5 - 8} v16" stroke="${APP.second}" stroke-width="2" stroke-linecap="round"/>
      <rect x="${SX + 12}" y="${SY + 390}" width="${SL - 24}" height="70" rx="16" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${icone('cadenas', SX + 28, SY + 410, APP.rose, 1.1)}
      ${texte(SX + 56, SY + 419, t('Chiffrées dans le coffre de l’appli.', 'Encrypted in the app’s vault.'), { taille: 10.5, couleur: APP.texte, poids: 700 })}
      ${texte(SX + 56, SY + 437, t('Rien dans la galerie du téléphone.', 'Nothing in the phone’s gallery.'), { taille: 10, couleur: APP.second })}
      ${toucher(SX + 24 + L3 * 1.5, SY + 98 + L3 / 2, C, ouvre - 0.006)}`;
    const visionneuse = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
      ${icone('croix', SX + 18, SY + 30, '#FFFFFF', 0.9)}
      ${texte(SX + SL / 2, SY + 43, '2 / 3', { taille: 12, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
      ${icone('telecharger', SX + SL - 34, SY + 30, '#FFFFFF', 1)}
      ${visage(GENS.enzo.photo, SX, SY + 150, SL, SL, 0)}
      <rect x="${SX + 20}" y="${SY + SH - 50}" width="${SL - 40}" height="3" rx="1.5" fill="#FFFFFF" fill-opacity="0.2"/>
      <rect x="${SX + 20}" y="${SY + SH - 50}" height="3" rx="1.5" width="0" fill="${APP.violet}">${fondu('width', C, [[0, 0], [ouvre, 0], [B(k), SL - 60], [1, SL - 60]])}</rect>
      ${texte(SX + 20, SY + SH - 30, '0:07', { taille: 9, couleur: '#FFFFFF' })}${texte(SX + SL - 20, SY + SH - 30, '0:42', { taille: 9, couleur: '#FFFFFF', ancre: 'end' })}`;
    scenes.push(entre(C, A(k), ouvre, galerie, 0.003) + entre(C, ouvre, B(k), visionneuse, 0.003));
  }

  // 7. La sauvegarde.
  {
    const k = 6, touche = dans(k, 0.28), fin = dans(k, 0.72);
    const ligne = (y, ic, titre, sous, valeur = '', c = APP.second) => `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="56" rx="16" fill="${APP.carte}" stroke="${APP.bord}"/>
      <rect x="${SX + 24}" y="${y + 13}" width="30" height="30" rx="9" fill="${c}" fill-opacity="0.14"/>${picto(ic, SX + 31, y + 20, c)}
      ${texte(SX + 64, y + 25, titre, { taille: 11.5, couleur: APP.texte, poids: 700 })}
      ${texte(SX + 64, y + 41, sous, { taille: 9, couleur: APP.discret })}
      ${valeur ? texte(SX + SL - 24, y + 33, valeur, { taille: 9, couleur: APP.second, poids: 700, ancre: 'end' }) : ''}`;
    const fond = `${texte(SX + 20, SY + 48, '‹', { taille: 24, couleur: APP.texte })}
      ${texte(SX + 44, SY + 48, t('Réglages', 'Settings'), { taille: 21, couleur: APP.texte, poids: 800 })}
      <rect x="${SX + 12}" y="${SY + 70}" width="${SL - 24}" height="64" rx="18" fill="${APP.violet}" fill-opacity="0.12" stroke="${APP.bord}"/>
      ${logo(SX + 44, SY + 102, 38)}
      ${texte(SX + 74, SY + 98, t('18 Personnes', '18 People'), { taille: 14, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 74, SY + 115, t('111 Rencontres', '111 Encounters'), { taille: 9.5, couleur: APP.second })}
      ${petit(SX + 18, SY + 164, t('DONNÉES', 'DATA'))}
      ${ligne(SY + 176, 'mur', t('Tout reste sur ce téléphone', 'Everything stays on this phone'), t('Base chiffrée, aucun compte', 'Encrypted database, no account'), '', APP.vert)}
      ${ligne(SY + 240, 'telecharger', t('Exporter, chiffré', 'Export, encrypted'), '', t('Phrase de passe ›', 'Passphrase ›'), APP.violet)}
      ${entre(C, A(k), fin, texte(SX + 64, SY + 281, t('Dernière il y a 38 jours', 'Last one 38 days ago'), { taille: 9, couleur: APP.or }), 0.003)}
      ${entre(C, fin, B(k), texte(SX + 64, SY + 281, t('Dernière aujourd’hui', 'Last one today'), { taille: 9, couleur: APP.vert, poids: 700 }), 0.003)}
      ${ligne(SY + 304, 'fichier', t('Restaurer une sauvegarde', 'Restore a backup'), t('Remplace ce qui est ici', 'Replaces what is here'), '.bcx')}`;
    const dialogue = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
      <rect x="${SX + 16}" y="${SY + 170}" width="${SL - 32}" height="186" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${texte(SX + 36, SY + 206, t('Phrase de passe', 'Passphrase'), { taille: 16, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 36, SY + 228, t('Elle seule permettra de la relire.', 'Only it will read it back.'), { taille: 10, couleur: APP.second })}
      ${O.frappe(SX + 36, SY + 272, '••••••••••••', C, touche + 0.004, touche + 0.03, { taille: 14, couleur: APP.texte })}
      <rect x="${SX + 36}" y="${SY + 282}" width="${SL - 72}" height="2" fill="${APP.violet}"/>
      ${texte(SX + SL - 120, SY + 330, t('Annuler', 'Cancel'), { taille: 11.5, couleur: APP.second, poids: 700, ancre: 'end' })}
      ${texte(SX + SL - 36, SY + 330, t('Exporter', 'Export'), { taille: 11.5, couleur: APP.rose, poids: 800, ancre: 'end' })}
      ${toucher(SX + SL - 60, SY + 326, C, fin - 0.006)}`;
    const attente = `<rect x="${SX + 12}" y="${SY + SH - 70}" width="${SL - 24}" height="44" rx="12" fill="#2E2640"/>
      ${texte(SX + 26, SY + SH - 43, t('Sauvegarde enregistrée.', 'Backup saved.'), { taille: 11.5, couleur: APP.texte })}`;
    scenes.push(fond + toucher(SX + SL / 2, SY + 268, C, touche - 0.006) + entre(C, touche, fin, dialogue, 0.003) + entre(C, fin + 0.004, B(k), attente, 0.003));
  }

  // 8. Ce que ça rapporte.
  {
    const k = 7, X = SX + 12, L = SL - 24;
    const montants = [['0 €', '€0'], ['250 €', '€250'], ['500 €', '€500'], ['750 €', '€750']];
    let s = `${petit(SX + 18, SY + 36, t('STATISTIQUES', 'STATISTICS'), APP.texte)}
      ${texte(SX + 18, SY + 66, '2026', { taille: 26, couleur: APP.texte, poids: 800 })}
      ${panneau(X, SY + 86, L, 168)}
      <rect x="${X}" y="${SY + 86}" width="${L}" height="168" rx="18" fill="${APP.or}" fill-opacity="0.05"/>
      ${icone('euro', X + 16, SY + 100, APP.or, 0.8)}${petit(X + 34, SY + 112, t('CE QUE ÇA A RAPPORTÉ', 'WHAT IT BROUGHT IN'), APP.or)}`;
    montants.forEach(([fr, en], i) => {
      const de = i === 0 ? 0 : dans(k, 0.1 + i * 0.1), a = i === 3 ? 1.2 : dans(k, 0.2 + i * 0.1);
      s += entre(C, Math.max(A(k), de), i === 3 ? B(k) : a, texte(X + 16, SY + 160, t(fr, en), { taille: 36, couleur: APP.or, poids: 800 }), 0.002);
    });
    s += `${texte(X + L - 16, SY + 148, t('107,14 €', '€107.14'), { taille: 14, couleur: APP.texte, poids: 800, ancre: 'end' })}
      ${texte(X + L - 16, SY + 164, t('en moyenne', 'on average'), { taille: 9, couleur: APP.second, ancre: 'end' })}
      <rect x="${X + 16}" y="${SY + 188}" width="${L - 32}" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.06"/>
      <rect x="${X + 16}" y="${SY + 188}" height="6" rx="3" width="0" fill="${APP.or}">${fondu('width', C, [[0, 0], [dans(k, 0.1), 0], [dans(k, 0.45), (L - 32) * 7 / 78], [1, (L - 32) * 7 / 78]])}</rect>
      ${texte(X + 16, SY + 214, t('sur 7 soirées, des 78 de l’année', 'over 7 nights, of the year’s 78'), { taille: 9.5, couleur: APP.second })}
      ${texte(X + 16, SY + 236, t('La moyenne ne compte que les payées.', 'The average only counts paid ones.'), { taille: 9.5, couleur: APP.discret })}
      ${petit(SX + 18, SY + 286, t('UNE RENCONTRE', 'ONE ENCOUNTER'))}
      ${panneau(X, SY + 298, L, 120)}
      ${visage(GENS.enzo.photo, X + 14, SY + 312, 40, 40, 11)}
      ${texte(X + 64, SY + 328, t('Enzo P. · 26 sept.', 'Enzo P. · 26 Sept.'), { taille: 12, couleur: APP.texte, poids: 800 })}
      ${texte(X + 64, SY + 344, 'Auray · 22h48', { taille: 9.5, couleur: APP.discret })}
      ${petit(X + 14, SY + 378, t('CE QUE ÇA A RAPPORTÉ', 'WHAT IT BROUGHT IN'))}
      <rect x="${X + 14}" y="${SY + 386}" width="${L - 28}" height="24" rx="10" fill="${APP.fond}" stroke="${APP.bord}"/>
      ${texte(X + 26, SY + 402, '50', { taille: 11.5, couleur: APP.texte, poids: 700 })}${texte(X + L - 26, SY + 402, '€', { taille: 11.5, couleur: APP.or, poids: 800, ancre: 'end' })}
      ${texte(X + 14, SY + 438, t('Vide, c’est rien : pas une fois à 0 €.', 'Empty means nothing: not a €0 night.'), { taille: 9.5, couleur: APP.discret })}
      ${barreNav(T, 'Stats')}`;
    scenes.push(s);
  }

  // 9. Tout se reprend.
  {
    const k = 8, touche = dans(k, 0.3), dlg = dans(k, 0.36), annule = dans(k, 0.82);
    const X = SX + 12, L = SL - 24;
    let s = `${visage(GENS.enzo.photo, SX, SY, SL, 190, 0)}
      <rect x="${SX}" y="${SY}" width="${SL}" height="190" fill="url(#voile)"/>
      ${texte(SX + 18, SY + 176, 'Enzo P.', { taille: 26, couleur: '#FFFFFF', poids: 800 })}
      ${petit(SX + 18, SY + 220, t('RENCONTRES · 8', 'ENCOUNTERS · 8'))}${texte(SX + SL - 18, SY + 220, t('Ajouter', 'Add'), { taille: 9.5, couleur: APP.violet, poids: 700, ancre: 'end' })}`;
    [[t('26 sept.', '26 Sept.'), 'Auray · 22h48', 9], [t('14 sept.', '14 Sept.'), 'Auray · 22h22', 7], [t('2 sept.', '2 Sept.'), 'Vannes · 21h10', 8]].forEach(([d, l, n], i) => {
      const y = SY + 232 + i * 56;
      s += `${panneau(X, y, L, 48)}
        ${texte(X + 14, y + 21, d, { taille: 12, couleur: APP.texte, poids: 800 })}
        ${texte(X + 14, y + 37, l, { taille: 9, couleur: APP.discret })}
        ${etoiles(X + L - 86, y + 29, n, { taille: 9 })}${texte(X + L - 14, y + 29, '›', { taille: 14, couleur: APP.second, ancre: 'end' })}`;
    });
    s += toucher(X + L / 2, SY + 256, C, touche);
    s += entre(C, dlg, annule, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.6"/>
      <rect x="${SX + 16}" y="${SY + 180}" width="${SL - 32}" height="176" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${texte(SX + 34, SY + 214, t('Supprimer cette rencontre ?', 'Delete this encounter?'), { taille: 14.5, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 34, SY + 240, t('Elle disparaît des statistiques, de la', 'It leaves the statistics, the map and'), { taille: 10, couleur: APP.second })}
      ${texte(SX + 34, SY + 256, t('carte et du calendrier. Les notes écrites', 'the calendar. The notes written that'), { taille: 10, couleur: APP.second })}
      ${texte(SX + 34, SY + 272, t('ce soir-là restent sur la fiche.', 'night stay on the card.'), { taille: 10, couleur: APP.second })}
      ${texte(SX + SL - 118, SY + 328, t('Annuler', 'Cancel'), { taille: 11.5, couleur: APP.rose, poids: 700, ancre: 'end' })}
      ${texte(SX + SL - 36, SY + 328, t('Supprimer', 'Delete'), { taille: 11.5, couleur: APP.rouge, poids: 800, ancre: 'end' })}
      ${toucher(SX + SL - 140, SY + 324, C, annule - 0.008)}`, 0.003);
    scenes.push(s);
  }

  // 10. Adresse et itinéraire.
  {
    const k = 9, touche = dans(k, 0.3), choix = dans(k, 0.34), cartes = dans(k, 0.62);
    const X = SX + 12, L = SL - 24;
    const fiche = `${visage(GENS.enzo.photo, SX, SY, SL, 230, 0)}
      <rect x="${SX}" y="${SY}" width="${SL}" height="230" fill="url(#voile)"/>
      ${pastille(SX + 16, SY + 170, 'N°12', { couleur: APP.vert, taille: 9 })}${pastille(SX + 66, SY + 170, t('23 ans', '23 y/o'), { taille: 9 })}${pastille(SX + 124, SY + 170, 'Vannes', { taille: 9 })}
      ${texte(SX + 18, SY + 218, 'Enzo P.', { taille: 26, couleur: '#FFFFFF', poids: 800 })}
      ${petit(SX + 18, SY + 262, 'INFOS')}
      ${panneau(X, SY + 274, L, 44)}${icone('telephoneIcone', X + 14, SY + 288, APP.second, 0.9)}
      ${texte(X + 38, SY + 300, t('Téléphone', 'Phone'), { taille: 10, couleur: APP.second })}${texte(X + L - 14, SY + 300, '07 15 93 62 08', { taille: 10.5, couleur: APP.texte, poids: 700, ancre: 'end' })}
      ${panneau(X, SY + 326, L, 44)}${icone('epingle', X + 14, SY + 340, APP.second, 0.9)}
      ${texte(X + 38, SY + 352, t('Adresse', 'Address'), { taille: 10, couleur: APP.second })}${texte(X + L - 14, SY + 352, 'Place des Lices, Vannes', { taille: 10.5, couleur: APP.texte, poids: 700, ancre: 'end' })}
      <circle cx="${X + 22}" cy="${SY + SH - 38}" r="20" fill="${APP.carte}" stroke="${APP.bord}"/>${icone('telephoneIcone', X + 15, SY + SH - 45, APP.texte, 0.9)}
      <circle cx="${X + 68}" cy="${SY + SH - 38}" r="20" fill="${APP.carte}" stroke="${APP.bord}"/>${picto('itineraire', X + 60, SY + SH - 46, APP.texte)}
      ${bouton(X + 98, SY + SH - 58, L - 98, 40, t('+ Nouvelle rencontre', '+ New encounter'), { taille: 11 })}
      ${toucher(X + 68, SY + SH - 38, C, touche)}`;
    const selecteur = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
      <rect x="${SX}" y="${SY + SH - 200}" width="${SL}" height="200" rx="22" fill="#F2F0F7"/>
      ${texte(SX + 22, SY + SH - 168, t('Ouvrir avec', 'Open with'), { taille: 14, couleur: '#1D1B22', poids: 700 })}
      ${[['Maps', '#34A853'], ['Organic Maps', '#2E7D32'], ['Waze', '#33CCFF']].map(([n, c], i) => `<rect x="${SX + 22 + i * 82}" y="${SY + SH - 140}" width="48" height="48" rx="14" fill="${c}"/>${texte(SX + 46 + i * 82, SY + SH - 76, n, { taille: 9.5, couleur: '#1D1B22', ancre: 'middle' })}`).join('')}
      ${toucher(SX + 46, SY + SH - 116, C, cartes - 0.008)}`;
    const route = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#E8EDE6"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${SX} ${SY + 60 + i * 90} L${SX + SL} ${SY + 20 + i * 90}" stroke="#FFFFFF" stroke-width="10"/>`).join('')}
      ${[0, 1, 2, 3].map((i) => `<path d="M${SX + 30 + i * 75} ${SY} L${SX + 60 + i * 75} ${SY + SH}" stroke="#FFFFFF" stroke-width="7"/>`).join('')}
      <path d="M${SX + 70} ${SY + SH - 70} C${SX + 90} ${SY + 380} ${SX + 200} ${SY + 330} ${SX + 170} ${SY + 190}" fill="none" stroke="#4285F4" stroke-width="6" stroke-linecap="round"/>
      <path d="M${SX + 170} ${SY + 176} c-9 -14 -9 -26 0 -26 s9 12 0 26 Z" fill="#EA4335"/>
      <rect x="${SX + 14}" y="${SY + 22}" width="${SL - 28}" height="34" rx="17" fill="#FFFFFF"/>
      ${texte(SX + 30, SY + 44, 'Place des Lices, Vannes', { taille: 11.5, couleur: '#1D1B22', poids: 600 })}
      <rect x="${SX}" y="${SY + SH - 70}" width="${SL}" height="70" fill="#FFFFFF"/>
      ${texte(SX + 20, SY + SH - 40, '8 min', { taille: 17, couleur: '#188038', poids: 800 })}
      ${texte(SX + 20, SY + SH - 20, t('Une autre appli : elle sait où tu vas.', 'Another app: it knows where you go.'), { taille: 9.5, couleur: '#5F6368' })}`;
    scenes.push(fiche + entre(C, choix, cartes, selecteur, 0.003) + entre(C, cartes, B(k), route, 0.003));
  }

  // 11. Trois formats : le même répertoire en 2, 3 puis 4 colonnes.
  {
    const k = 10;
    const formats = [[2, t('Téléphone 16/9 · 2 colonnes', 'Phone 16:9 · 2 columns')], [3, t('Couverture du Fold · 3 colonnes', 'Fold cover · 3 columns')], [4, t('Écran déplié · 4 colonnes', 'Unfolded · 4 columns')]];
    const gens = [GENS.noa, GENS.lou, GENS.enzo, GENS.jade, GENS.matteo, GENS.gabriel, GENS.ibrahim, GENS.kelyan, GENS.adam, GENS.chloe, GENS.tom, GENS.sami];
    let s = '';
    formats.forEach(([n, lib], f) => {
      const de = dans(k, f / 3), a = f === 2 ? B(k) : dans(k, (f + 1) / 3);
      const CL = (SL - 24 - (n - 1) * 8) / n, CH = CL * 1.25;
      let g = `${titreEcran(t('RÉPERTOIRE', 'PEOPLE'))}
        <rect x="${SX + 12}" y="${SY + 62}" width="${SL - 24}" height="26" rx="13" fill="${APP.violet}" fill-opacity="0.16" stroke="${APP.violet}" stroke-opacity="0.5"/>
        ${texte(SX + SL / 2, SY + 79, lib, { taille: 10.5, couleur: APP.texte, poids: 700, ancre: 'middle' })}`;
      const lignes = Math.min(Math.floor((SH - 170) / (CH + 8)), 4);
      gens.slice(0, n * lignes).forEach((p, i) => {
        const x = SX + 12 + (i % n) * (CL + 8), y = SY + 100 + Math.floor(i / n) * (CH + 8);
        // En trois ou quatre colonnes, la carte complète ne tient plus à
        // cette échelle : la photo, le prénom et les étoiles suffisent.
        g += n === 2 ? cartePersonne(p, x, y, CL, CH, { premier: i === 0 })
          : `${visage(p.photo, x, y, CL, CH, 10)}<rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="10" fill="url(#voile)"/>
            ${texte(x + 6, y + CH - 16, p.prenom.split(' ')[0], { taille: n === 3 ? 10 : 8.5, couleur: '#FFFFFF', poids: 800 })}
            ${etoiles(x + 6, y + CH - 5, p.note, { taille: n === 3 ? 6.5 : 5.5 })}`;
      });
      g += barreNav(T, 'Fiches');
      s += entre(C, de, a, g, 0.003);
    });
    scenes.push(s);
  }

  let ecran = '';
  // Les écrans débordent un peu sur leurs voisins : ils se relaient en
  // fondu au lieu de laisser l’écran noir un quart de seconde.
  scenes.forEach((s, k) => { ecran += entre(C, Math.max(0, k / N - 0.003), Math.min(1, (k + 1) / N + 0.003), s, 0.003); });
  corps += T.ecran(ecran);

  svg('fonctionnalites.svg', 1280, 720, corps, t(
    'Les fonctionnalités de BodyCount, en onze écrans. Verrouillage biométrique : l’empreinte charge la clé, sans elle la base est illisible. Répertoire : photos, carnet daté, étiquettes, genre, rôle, notes sur cinq. Statistiques : le total de l’année, le rythme mois par mois, le podium. Carte de France : 34 836 communes embarquées, même mal orthographiées. Calendrier : sept colonnes, et sous chaque jour ce qu’il a eu de rare. Galerie privée : photos et vidéos chiffrées, absentes de la galerie Android. Sauvegarde complète : tout dans un fichier fermé par ta phrase de passe. Ce que ça rapporte : un montant par rencontre, le total et la moyenne de l’année. Tout se reprend : fiche, rencontre, note, photo, rien n’est définitif. Adresse et itinéraire : la seule sortie du téléphone, et seulement sur un toucher. Trois formats d’écran : téléphone, couverture et déplié, la mise en page suit. Et rien ne sort : pas de serveur, pas de compte, pas de télémétrie.',
    'BodyCount’s features, in eleven screens. Biometric lock: the fingerprint loads the key, without it the database is noise. People: photos, dated notes, tags, gender, role, ratings out of five. Statistics: the year’s total, the monthly rhythm, the podium. Map of France: 34,836 communes built in, even when misspelled. Calendar: seven columns, and under each day what made it rare. Private gallery: encrypted photos and videos, absent from the Android gallery. Full backup: everything in one file locked by your passphrase. What it brings in: an amount per encounter, the year’s total and average. Nothing is final: card, encounter, note, photo, everything can be undone. Address and route: the only way out of the phone, and only on a tap. Three screen sizes: phone, cover screen and unfolded, the layout follows. And nothing leaves: no server, no account, no telemetry.'));
};

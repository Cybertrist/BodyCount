// Les cinq couches, traversées par un vrai geste : « Enregistrer » sur une
// rencontre d'Enzo.
//
// À gauche, le téléphone : le formulaire, le toucher, puis la fiche qui
// revient et se met à jour. À droite, les couches empilées ; une bille
// descend pour écrire (l'écran appelle un dépôt, sans passer par un
// provider), puis remonte pour relire (rafraichir() invalide, les
// providers relisent par les dépôts, les écrans suivent). Tout vient de
// formulaire_rencontre.dart, depots.dart, base.dart et providers/donnees.dart.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, visage, etoiles, pastille,
    largeurPastille, bouton, icone, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, FUCHSIA,
    VERT, OR, BLEU } = O;
  const C = 32;
  const TOUCHE = 0.1, POP = 0.4, RELU = 0.66, FIN = 0.975;
  const enzo = GENS.enzo;
  let corps = entete(t('LES COUCHES', 'THE LAYERS'),
    t('Un toucher sur Enregistrer descend jusqu’au disque, puis tout remonte relire.',
      'One tap on Save goes all the way down to the disk, then everything climbs back up to reread.'));

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // Le formulaire, rempli, qu'on enregistre.
  const champ = (x, y, l, h, titre, valeur) => `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${texte(x + 12, y + 17, titre, { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}
    ${texte(x + 12, y + 35, valeur, { taille: 12.5, couleur: APP.texte, poids: 700 })}`;
  let form = `${texte(SX + 20, SY + 46, '✕', { taille: 15, couleur: APP.texte })}
    ${texte(SX + 44, SY + 47, t('Nouvelle rencontre', 'New encounter'), { taille: 17, couleur: APP.texte, poids: 800 })}
    <rect x="${SX + 12}" y="${SY + 66}" width="${SL - 24}" height="50" rx="16" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${visage(enzo.photo, SX + 22, SY + 74, 34, 34, 10)}
    ${texte(SX + 66, SY + 89, enzo.prenom, { taille: 13, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 66, SY + 105, t('7 fois, la dernière le 14 sept.', '7 times, last on 14 Sept.'), { taille: 9.5, couleur: APP.second })}
    ${champ(SX + 12, SY + 126, (SL - 32) / 2, 48, t('DATE', 'DATE'), t('26 sept.', '26 Sept.'))}
    ${champ(SX + 20 + (SL - 32) / 2, SY + 126, (SL - 32) / 2, 48, t('HEURE', 'TIME'), '22h48')}
    ${champ(SX + 12, SY + 184, SL - 24, 48, t('OÙ', 'WHERE'), 'Auray')}
    <rect x="${SX + 12}" y="${SY + 242}" width="${SL - 24}" height="74" rx="16" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${texte(SX + 24, SY + 260, t('TA NOTE', 'YOUR RATING'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}
    <text x="${SX + 24}" y="${SY + 288}" font-family="${O.SANS}" font-size="22" font-weight="800" fill="${APP.texte}">${t('4,5', '4.5')}<tspan font-size="11" fill="${APP.second}" font-weight="600"> ${t('sur 5', 'out of 5')}</tspan></text>
    ${etoiles(SX + 24, SY + 309, 9, { taille: 14, pas: 19 })}
    ${texte(SX + 20, SY + 340, t('CETTE FOIS-LÀ', 'THAT TIME'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}`;
  let px = SX + 18;
  for (const e of [t('Chez lui', 'His place'), t('Toute la nuit', 'All night')]) {
    form += pastille(px, SY + 350, e, { plein: true, taille: 10 });
    px += largeurPastille(e, 10) + 6;
  }
  form += bouton(SX + 16, SY + SH - 70, SL - 32, 46, t('Enregistrer', 'Save'), { taille: 14 });
  // Pendant l'écriture, le bouton attend.
  form += entre(C, TOUCHE + 0.01, POP, `<rect x="${SX + 16}" y="${SY + SH - 70}" width="${SL - 32}" height="46" rx="18" fill="${APP.fond}" fill-opacity="0.35"/>
    <circle cx="${SX + SL / 2 - 52}" cy="${SY + SH - 47}" r="7" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="30 14">
      <animateTransform attributeName="transform" type="rotate" from="0 ${SX + SL / 2 - 52} ${SY + SH - 47}" to="360 ${SX + SL / 2 - 52} ${SY + SH - 47}" dur="0.9s" repeatCount="indefinite"/></circle>`, 0.004);
  form += toucher(SX + SL / 2, SY + SH - 47, C, TOUCHE);
  ecran += entre(C, 0, POP, form, 0.006);

  // La fiche d'Enzo : d'abord les chiffres d'avant, puis ceux relus.
  const PH = 244;
  const col = (i) => SX + 16 + i * ((SL - 32) / 3);
  const chiffres = (moy, fois, note) => `${texte(col(0), SY + 292, moy, { taille: 23, couleur: '#E9D5FF', poids: 800 })}
    ${etoiles(col(0), SY + 310, note, { taille: 9 })}
    ${texte(col(1), SY + 292, fois, { taille: 23, couleur: APP.texte, poids: 800 })}
    ${texte(col(1), SY + 309, t('FOIS', 'TIMES'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}`;
  const ligne = (y, date, detail, note, neuve) => `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="46" rx="14" fill="${neuve ? APP.violet : APP.carte}" fill-opacity="${neuve ? 0.16 : 1}" stroke="${neuve ? APP.violet : APP.bord}" stroke-opacity="${neuve ? 0.7 : 1}"/>
    ${texte(SX + 26, y + 20, date, { taille: 12, couleur: APP.texte, poids: 700 })}
    ${texte(SX + 26, y + 36, detail, { taille: 9.5, couleur: APP.second })}
    ${etoiles(SX + SL - 88, y + 28, note, { taille: 9 })}`;
  let fiche = `${visage(enzo.photo, SX, SY, SL, PH, 0)}
    <rect x="${SX}" y="${SY}" width="${SL}" height="${PH}" fill="url(#voile)"/>
    ${texte(SX + 16, SY + 228, enzo.prenom, { taille: 27, couleur: '#FFFFFF', poids: 800, extra: 'letter-spacing="-0.6"' })}
    <rect x="${SX + 12}" y="${SY + 258}" width="${SL - 24}" height="66" rx="16" fill="${APP.carte}" stroke="${APP.bord}"/>
    <text x="${col(2)}" y="${SY + 292}" font-family="${O.SANS}" font-size="23" font-weight="800" fill="${APP.texte}">347<tspan font-size="12" fill="${APP.second}"> ${t('j', 'd')}</tspan></text>
    ${texte(col(2), SY + 309, t('DEPUIS', 'SINCE'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}
    ${entre(C, 0, RELU, chiffres(t('3,8', '3.8'), '7', 8), 0.004)}
    ${entre(C, RELU, 1.2, chiffres(t('3,9', '3.9'), '8', 8), 0.004)}
    ${texte(SX + 18, SY + 350, t('RENCONTRES', 'ENCOUNTERS'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}`;
  // La liste : la nouvelle ligne arrive en tête une fois relue, et pousse
  // les autres.
  const anciennes = `${ligne(SY + 362, t('14 sept.', '14 Sept.'), t('22h22 · Auray', '22:22 · Auray'), 7, false)}
    ${ligne(SY + 414, t('29 août', '29 Aug.'), t('23h05 · Vannes', '23:05 · Vannes'), 8, false)}
    ${ligne(SY + 466, t('3 août', '3 Aug.'), t('21h40 · Vannes', '21:40 · Vannes'), 8, false)}`;
  fiche += `<g>${anciennes}<animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${RELU};${RELU + 0.012};1" values="0 0;0 0;0 52;0 52"/></g>`;
  fiche += entre(C, RELU + 0.01, 1.2, ligne(SY + 362, t('26 sept.', '26 Sept.'), t('22h48 · Auray', '22:48 · Auray'), 9, true), 0.006);
  fiche += `<rect x="${SX}" y="${SY + SH - 64}" width="${SL}" height="64" fill="${APP.fond}"/>` + bouton(SX + 16, SY + SH - 56, SL - 32, 42, t('+ Nouvelle rencontre', '+ New encounter'), { taille: 13 });
  // Entre le retour et la relecture, la fiche tient ses anciens chiffres :
  // un fin trait qui court sous le titre dit qu'elle se relit.
  fiche += entre(C, POP + 0.01, RELU, `<rect x="${SX + 12}" y="${SY + 252}" width="${SL - 24}" height="2" rx="1" fill="${APP.bord}"/>
    <rect x="${SX + 12}" y="${SY + 252}" width="60" height="2" rx="1" fill="${APP.violet}">
      <animate attributeName="x" dur="1.1s" repeatCount="indefinite" values="${SX + 12};${SX + SL - 72};${SX + 12}"/></rect>`, 0.004);
  ecran += entre(C, POP, FIN, fiche, 0.006);
  corps += T.ecran(ecran);

  // -------------------------------------------------------------- les couches
  const BX = 400, BL = 820, BH = 88, G = 9, Y0 = 92;
  const SEP = BX + 262, AX = SEP + 26;
  const yb = (i) => Y0 + i * (BH + G);
  const couches = [
    [t('Écrans', 'Screens'), 'lib/ecrans/', t('lisent des providers, écrivent', 'read providers, write through'), t('par un dépôt, jamais de SQL', 'a repository, never any SQL'), VIOLET],
    [t('Providers', 'Providers'), 'lib/providers/', t('Riverpod : une écriture invalide', 'Riverpod: one write invalidates'), t('tout ce qui en dépend', 'everything that depends on it'), ACCENT],
    [t('Dépôts', 'Repositories'), 'lib/donnees/depots.dart', t('le seul endroit où s’écrit', 'the only place SQL gets'), t('du SQL, en requêtes groupées', 'written, in grouped queries'), OR],
    [t('Sécurité', 'Security'), 'lib/security/', t('trousseau, coffres, verrou :', 'keys, vaults, lock: nothing'), t('rien ne passe à côté', 'goes around them'), BLEU],
    [t('Disque', 'Disk'), 'bodycount.db · vault/', t('SQLite chiffré, et un fichier', 'encrypted SQLite, and one'), t('chiffré par photo ou vidéo', 'encrypted file per media'), VERT],
  ];
  // Les fenêtres où chaque couche travaille, à la descente puis à la montée.
  const actives = [[[TOUCHE, 0.17], [POP, 0.445], [RELU - 0.01, FIN]], [[0.44, 0.53]], [[0.165, 0.235], [0.52, 0.56]], [[0.225, 0.29], [0.55, 0.585]], [[0.285, 0.37], [0.58, 0.63]]];
  couches.forEach(([nom, chemin, r1, r2, c], i) => {
    const y = yb(i);
    corps += `<rect x="${BX}" y="${y}" width="${BL}" height="${BH}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${BX}" y="${y + 14}" width="3" height="${BH - 28}" rx="1.5" fill="${c}"/>
      ${actives[i].map(([a, b]) => `<rect x="${BX}" y="${y}" width="${BL}" height="${BH}" rx="13" fill="${c}" fill-opacity="0.05" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, a, b, 0.008)}</rect>`).join('')}
      ${texte(BX + 20, y + 27, nom, { taille: 15, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(BX + 20, y + 45, chemin, { taille: 10.5, couleur: c, police: MONO })}
      ${texte(BX + 20, y + 63, r1, { taille: 11.5 })}
      ${texte(BX + 20, y + 78, r2, { taille: 11.5 })}
      <line x1="${SEP}" y1="${y + 12}" x2="${SEP}" y2="${y + BH - 12}" stroke="${BORD}"/>`;
  });

  // Ce que chaque couche fait à l'instant : deux lignes dans sa moitié droite.
  const dit = (i, de, a, l1, l2, { c1 = TITRE, c2 = TEXTE, mono1 = true } = {}) => {
    const y = yb(i);
    return entre(C, de, a, `${texte(AX, y + 38, l1, { taille: 12.5, couleur: c1, police: mono1 ? MONO : O.SANS, poids: 700 })}
      ${texte(AX, y + 60, l2, { taille: 12 , couleur: c2 })}`, 0.006);
  };
  // Au repos, avant le toucher et après la relecture.
  const repos = [
    [t('formulaire_rencontre.dart', 'formulaire_rencontre.dart'), t('le formulaire est rempli, rien n’est écrit', 'the form is filled in, nothing written yet')],
    [t('fichePersonneProvider(12)', 'fichePersonneProvider(12)'), t('garde la fiche d’Enzo telle qu’elle a été lue', 'holds Enzo’s card as it was read')],
    ['DepotRencontres', t('attend qu’on l’appelle', 'waits to be called')],
    ['Base.instance.db', t('la connexion ouverte au déverrouillage', 'the connection opened at unlock')],
    ['bodycount.db', t('des pages chiffrées, illisibles sans la clé', 'encrypted pages, unreadable without the key')],
  ];
  repos.forEach(([l1, l2], i) => {
    corps += dit(i, 0, [TOUCHE, 0.13, 0.165, 0.225, 0.285][i] - 0.008, l1, l2, { c1: TEXTE, c2: DISCRET });
  });

  // La descente : écrire.
  corps += dit(0, TOUCHE, POP, '_enregistrer()', t('appelle depotRencontres.creer(…), pas un provider', 'calls depotRencontres.creer(…), not a provider'), { c1: VIOLET });
  corps += dit(1, 0.13, 0.44, t('rien, à la descente', 'nothing, on the way down'), t('une écriture ne passe jamais par ici', 'a write never goes through here'), { c1: DISCRET, c2: DISCRET });
  corps += dit(2, 0.165, 0.52, 'INSERT INTO rencontres (…)', t('puis 2 étiquettes et une note au carnet', 'then 2 tags and a notebook note'), { c1: OR });
  corps += dit(3, 0.225, 0.55, 'await Base.instance.db', t('la même connexion, clé tirée de bodycount/db/v1', 'the same connection, key from bodycount/db/v1'), { c1: BLEU });
  // Le disque : des octets qui changent, chiffrés avant d'être écrits.
  const octets = (graine) => Array.from({ length: 16 }, (_, k) => ((graine * 37 + k * 91 + k * k * 13) % 256).toString(16).padStart(2, '0')).join(' ');
  corps += entre(C, 0.285, 0.58, `${texte(AX, yb(4) + 38, octets(3), { taille: 12, couleur: TEXTE, police: MONO })}
    <rect x="${AX + 5 * 21 - 3}" y="${yb(4) + 25}" width="${6 * 21}" height="18" rx="4" fill="${VERT}" fill-opacity="0.14" stroke="${VERT}" stroke-opacity="0.5" opacity="0">${visible(C, 0.3, 0.58, 0.006)}</rect>
    ${texte(AX, yb(4) + 60, t('une page change, chiffrée avant de toucher le disque', 'one page changes, encrypted before it hits the disk'), { taille: 12 })}`, 0.006);

  // La montée : relire.
  corps += dit(0, POP, RELU - 0.01, 'rafraichir(ref, personneId: 12)', t('puis context.pop() : on revient sur la fiche', 'then context.pop(): back to the card'), { c1: VIOLET });
  // Les providers invalidés, en pastilles qui passent au fuchsia.
  const noms = ['repertoire', 'villes', 'journal', 'statistiques', 'annees', 'vocabulaire', 'fiche(12)', 'rang(12)', 'rencontres(12)', 'notes(12)', 'photos(12)', 'etiquettes(12)'];
  let pp = '', cx = AX, cy = yb(1) + 30;
  noms.forEach((n, k) => {
    const l = Math.round(n.length * 6.2 + 14);
    if (cx + l > BX + BL - 18) { cx = AX; cy += 26; }
    const a = 0.445 + k * 0.004;
    pp += `<rect x="${cx}" y="${cy}" width="${l}" height="20" rx="10" fill="${CARTE}" stroke="${FIL}"/>
      <rect x="${cx}" y="${cy}" width="${l}" height="20" rx="10" fill="${ACCENT}" fill-opacity="0.16" stroke="${ACCENT}" opacity="0">${visible(C, a, RELU + 0.02, 0.004)}</rect>
      ${texte(cx + l / 2, cy + 14, n, { taille: 10, couleur: TITRE, police: MONO, ancre: 'middle' })}`;
    cx += l + 6;
  });
  corps += entre(C, 0.44, RELU + 0.03, `${pp}${texte(AX, yb(1) + 22, t('invalidés d’un seul appel', 'invalidated in a single call'), { taille: 11, couleur: ACCENT, poids: 700 })}`, 0.006);
  corps += dit(2, 0.52, RELU + 0.03, 'lister() · parId(12) · pourPersonne(12)', t('SELECT … GROUP BY p.id : une requête, pas une par fiche', 'SELECT … GROUP BY p.id: one query, not one per card'), { c1: OR });
  corps += dit(3, 0.55, RELU + 0.03, t('rien à rouvrir', 'nothing to reopen'), t('la connexion est déjà là, la clé aussi', 'the connection is already there, so is the key'), { c1: BLEU });
  corps += dit(4, 0.58, RELU + 0.03, t('lecture', 'read'), t('les pages se déchiffrent à la volée, en mémoire', 'pages are decrypted on the fly, in memory'), { c1: VERT });
  // Relu : tout en haut, les écrans suivent.
  corps += dit(0, RELU, FIN, t('les écrans se relisent', 'the screens reread'), t('8 fois, 3,9, N°11 : aucun chiffre périmé', '8 times, 3.9, No. 11: no stale number'), { c1: VERT, mono1: false });
  corps += dit(1, RELU + 0.03, FIN, t('relus, en cache jusqu’à la prochaine écriture', 'reread, cached until the next write'), t('fiche, rang, répertoire, statistiques, carte, agenda', 'card, rank, people, statistics, map, agenda'), { c1: TEXTE, c2: DISCRET, mono1: false });
  corps += dit(2, RELU + 0.03, FIN, 'DepotRencontres', t('a rendu la main', 'has handed back'), { c1: TEXTE, c2: DISCRET });
  corps += dit(3, RELU + 0.03, FIN, 'Base.instance.db', t('toujours ouverte, jusqu’au verrou', 'still open, until the lock'), { c1: TEXTE, c2: DISCRET });
  corps += dit(4, RELU + 0.03, FIN, 'bodycount.db', t('une rencontre de plus, chiffrée', 'one more encounter, encrypted'), { c1: TEXTE, c2: DISCRET });

  // La bille : descend sur le trait, saute les providers, puis remonte.
  const yc = (i) => yb(i) + BH / 2;
  const trajet = [[0, yc(0)], [TOUCHE, yc(0)], [0.165, yc(2)], [0.225, yc(3)], [0.285, yc(4)], [0.37, yc(4)], [0.4, yc(0)],
    [0.44, yc(1)], [0.52, yc(2)], [0.55, yc(3)], [0.58, yc(4)], [RELU - 0.01, yc(0)], [1, yc(0)]];
  const vis = [[0, 0], [TOUCHE - 0.004, 0], [TOUCHE, 1], [0.37, 1], [0.375, 0], [POP, 0], [POP + 0.004, 1], [RELU, 1], [RELU + 0.008, 0], [1, 0]];
  const coul = [[0, VIOLET], [0.165, OR], [0.225, BLEU], [0.285, VERT], [POP, VIOLET], [0.44, ACCENT], [0.52, OR], [0.55, BLEU], [0.58, VERT], [0.6, '#FFFFFF'], [1, '#FFFFFF']];
  const anime = (attr, e) => `<animate attributeName="${attr}" dur="${C}s" repeatCount="indefinite" keyTimes="${e.map((x) => x[0]).join(';')}" values="${e.map((x) => x[1]).join(';')}"/>`;
  const discret = (attr, e) => `<animate attributeName="${attr}" dur="${C}s" repeatCount="indefinite" keyTimes="${e.map((x) => x[0]).join(';')}" values="${e.map((x) => x[1]).join(';')}" calcMode="discrete"/>`;
  // À la descente, un arc contourne les providers : l'écriture les saute.
  corps += entre(C, TOUCHE, 0.37, `<path d="M${SEP} ${yc(0) + 10} C${SEP - 40} ${yc(1) - 20} ${SEP - 40} ${yc(1) + 20} ${SEP} ${yc(2) - 10}" fill="none" stroke="${VIOLET}" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.8"/>`, 0.006);
  corps += `<g opacity="0">${anime('opacity', vis)}
    <circle cx="${SEP}" r="12" fill="${VIOLET}" opacity="0.25" filter="url(#halo)">${anime('cy', trajet)}${discret('fill', coul)}</circle>
    <circle cx="${SEP}" r="5.5" fill="#FFFFFF">${anime('cy', trajet)}</circle>
  </g>`;

  // ------------------------------------------------ la règle, en bas
  const LY = yb(5) + 4;
  corps += `<rect x="${BX}" y="${LY}" width="${BL}" height="${720 - LY - 24}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    <path d="M${BX + 26} ${LY + 18} v16 m-5 -6 l5 6 l5 -6" fill="none" stroke="${OR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(BX + 44, LY + 32, t('Écrire descend :', 'Writing goes down:'), { taille: 13, couleur: TITRE, poids: 700 })}
    ${texte(BX + 44 + t('Écrire descend :', 'Writing goes down:').length * 7.4 + 8, LY + 32, t('l’écran appelle un dépôt, qui passe par la base chiffrée.', 'the screen calls a repository, which goes through the encrypted database.'), { taille: 12.5 })}
    <path d="M${BX + 26} ${LY + 64} v-16 m-5 6 l5 -6 l5 6" fill="none" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(BX + 44, LY + 60, t('Relire remonte :', 'Rereading goes up:'), { taille: 13, couleur: TITRE, poids: 700 })}
    ${texte(BX + 44 + t('Relire remonte :', 'Rereading goes up:').length * 7.4 + 8, LY + 60, t('rafraichir() invalide, les providers relisent, les écrans suivent.', 'rafraichir() invalidates, providers reread, screens follow.'), { taille: 12.5 })}`;

  svg('couches.svg', 1280, 720, corps, t(
    'Les cinq couches de BodyCount, traversées par un toucher sur Enregistrer. Le formulaire d’une rencontre d’Enzo est rempli : Auray, 4,5 sur 5, Chez lui et Toute la nuit. À la descente, l’écran appelle directement depotRencontres.creer, sans passer par les providers ; le dépôt, seul endroit où s’écrit du SQL, fait l’INSERT, puis les étiquettes et la note au carnet ; la sécurité fournit la connexion ouverte avec la clé tirée de bodycount/db/v1 ; sur le disque, une page de bodycount.db change, chiffrée avant d’être écrite. À la montée, l’écran appelle rafraichir, qui invalide d’un seul appel douze providers, du répertoire aux étiquettes d’Enzo ; ils relisent par les dépôts, en requêtes groupées, sur la même connexion, et la fiche revient à jour : 8 fois, 3,9, la rencontre du 26 septembre en tête. Écrire descend, relire remonte, et aucun écran n’écrit de SQL.',
    'The five layers of BodyCount, crossed by one tap on Save. The form for an encounter with Enzo is filled in: Auray, 4.5 out of 5, His place and All night. On the way down, the screen calls depotRencontres.creer directly, without going through the providers; the repository, the only place SQL is written, runs the INSERT, then the tags and the notebook note; the security layer hands over the connection opened with the key from bodycount/db/v1; on the disk, one page of bodycount.db changes, encrypted before it is written. On the way up, the screen calls rafraichir, which invalidates twelve providers in a single call, from the people list to Enzo’s tags; they reread through the repositories, with grouped queries, on the same connection, and the card comes back up to date: 8 times, 3.9, the encounter of 26 September on top. Writing goes down, rereading goes up, and no screen writes SQL.'));
};

// Les cinq couches, traversées par un vrai geste : « Enregistrer » sur une
// rencontre d'Enzo.
//
// À gauche, le téléphone : le formulaire, le toucher, puis la fiche qui
// revient et se met à jour. À droite, les cinq couches en bandes larges,
// chacune avec un objet concret : la fiche, le graphe des providers, la
// requête, la clé, les pages du fichier. Une carte « rencontre » descend
// par la colonne de gauche en enjambant les providers (l'écran appelle le
// dépôt directement), puis rafraichir() remonte par la colonne de droite :
// les douze providers s'invalident en éventail, relisent aux dépôts, et
// les valeurs remontent jusqu'à la fiche. Tout vient de
// formulaire_rencontre.dart, depots.dart, base.dart et providers/donnees.dart.
module.exports = (O) => {
  const { t, svg, texte, entete, fondu, visible, entre, telephone, toucher, visage, etoiles, pastille,
    largeurPastille, bouton, icone, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET,
    VERT, OR, BLEU } = O;
  const C = 36;
  // Le rythme : la descente, un temps, la remontée, un long repos.
  const TOUCHE = 0.08;
  const D0 = 0.1, SAUT = [0.13, 0.19], D2 = 0.2, D3 = 0.29, D4 = 0.35, POSE = 0.43;
  const POP = 0.46, INV = [0.48, 0.53], LIT = [0.55, 0.61], M3 = 0.61, M4 = 0.63, MONTE = [0.67, 0.73];
  const RELU = 0.74, FIN = 0.975;
  const enzo = GENS.enzo;
  let corps = entete(t('LES COUCHES', 'THE LAYERS'),
    t('Un toucher sur Enregistrer descend jusqu’au disque, puis tout remonte relire.',
      'One tap on Save goes all the way down to the disk, then everything climbs back up to reread.'));

  // Une valeur qui glisse ou saute au fil du cycle.
  const anime = (attr, e, discret = false) => `<animate attributeName="${attr}" dur="${C}s" repeatCount="indefinite" keyTimes="${e.map((x) => x[0]).join(';')}" values="${e.map((x) => x[1]).join(';')}"${discret ? ' calcMode="discrete"' : ''}/>`;
  /// Un trait qui se trace de [de] à [a], reste jusqu'à [fin], puis s'efface.
  const trace = (d, de, a, fin, couleur, { l = 400, epaisseur = 2, extra = '' } = {}) =>
    `<path d="${d}" fill="none" stroke="${couleur}" stroke-width="${epaisseur}" stroke-linecap="round" stroke-dasharray="${l}" stroke-dashoffset="${l}" opacity="0" ${extra}>
      ${fondu('stroke-dashoffset', C, [[0, l], [de, l], [a, 0], [1, 0]])}${visible(C, de, fin, 0.006)}</path>`;

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
    <rect x="${SX + 12}" y="${SY + 258}" width="${SL - 24}" height="66" rx="16" fill="none" stroke="${VERT}" stroke-width="1.5" opacity="0">${visible(C, RELU, RELU + 0.05, 0.006)}</rect>
    <text x="${col(2)}" y="${SY + 292}" font-family="${O.SANS}" font-size="23" font-weight="800" fill="${APP.texte}">347<tspan font-size="12" fill="${APP.second}"> ${t('j', 'd')}</tspan></text>
    ${texte(col(2), SY + 309, t('DEPUIS', 'SINCE'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}
    ${entre(C, 0, RELU, chiffres(t('3,8', '3.8'), '7', 8), 0.004)}
    ${entre(C, RELU, 1.2, chiffres(t('3,9', '3.9'), '8', 8), 0.004)}
    ${texte(SX + 18, SY + 350, t('RENCONTRES', 'ENCOUNTERS'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}`;
  const anciennes = `${ligne(SY + 362, t('14 sept.', '14 Sept.'), t('22h22 · Auray', '22:22 · Auray'), 7, false)}
    ${ligne(SY + 414, t('29 août', '29 Aug.'), t('23h05 · Vannes', '23:05 · Vannes'), 8, false)}
    ${ligne(SY + 466, t('3 août', '3 Aug.'), t('21h40 · Vannes', '21:40 · Vannes'), 8, false)}`;
  fiche += `<g>${anciennes}<animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${RELU};${RELU + 0.012};1" values="0 0;0 0;0 52;0 52"/></g>`;
  fiche += entre(C, RELU + 0.01, 1.2, ligne(SY + 362, t('26 sept.', '26 Sept.'), t('22h48 · Auray', '22:48 · Auray'), 9, true), 0.006);
  fiche += `<rect x="${SX}" y="${SY + SH - 64}" width="${SL}" height="64" fill="${APP.fond}"/>` + bouton(SX + 16, SY + SH - 56, SL - 32, 42, t('+ Nouvelle rencontre', '+ New encounter'), { taille: 13 });
  // Entre le retour et la relecture, un fin trait qui court dit qu'elle se relit.
  fiche += entre(C, POP + 0.01, RELU, `<rect x="${SX + 12}" y="${SY + 252}" width="${SL - 24}" height="2" rx="1" fill="${APP.bord}"/>
    <rect x="${SX + 12}" y="${SY + 252}" width="60" height="2" rx="1" fill="${APP.violet}">
      <animate attributeName="x" dur="1.1s" repeatCount="indefinite" values="${SX + 12};${SX + SL - 72};${SX + 12}"/></rect>`, 0.004);
  ecran += entre(C, POP, FIN, fiche, 0.006);
  corps += T.ecran(ecran);

  // -------------------------------------------------------------- les couches
  // La colonne de gauche porte la descente, celle de droite la remontée ;
  // entre les deux, les bandes.
  const DX = 468;                 // l'axe de la descente
  const BX = 548, BL = 632;       // les bandes
  const MX = BX + BL + 20;        // l'axe de la remontée
  const BH = 96, G = 8, Y0 = 84;
  const OX = BX + 196, OL = BL - 196 - 16; // la zone de l'objet, dans chaque bande
  const yb = (i) => Y0 + i * (BH + G);
  const yc = (i) => yb(i) + BH / 2;
  const couches = [
    [t('Écrans', 'Screens'), 'lib/ecrans/', t('jamais de SQL', 'never any SQL'), VIOLET, 'telephoneIcone'],
    [t('Providers', 'Providers'), 'lib/providers/', t('l’état, en cache', 'state, cached'), ACCENT, 'oeil'],
    [t('Dépôts', 'Repositories'), 'lib/donnees/', t('le seul SQL', 'the only SQL'), OR, 'base'],
    [t('Sécurité', 'Security'), 'lib/security/', t('clés et coffres', 'keys and vaults'), BLEU, 'cle'],
    [t('Disque', 'Disk'), 'bodycount.db', t('chiffré au repos', 'encrypted at rest'), VERT, 'fichier'],
  ];
  // Quand chaque bande travaille : à la descente, puis à la remontée.
  const actives = [
    [[D0 - 0.02, SAUT[0] + 0.01], [POP, INV[0] + 0.02], [MONTE[1] - 0.01, RELU + 0.06]],
    [[INV[0], LIT[0] + 0.02], [MONTE[0], MONTE[1] + 0.01]],
    [[D2, D3 + 0.01], [LIT[0], LIT[1] + 0.01]],
    [[D3, D4 + 0.01], [M3, M3 + 0.03]],
    [[D4, POSE + 0.01], [M4, MONTE[0] + 0.01]],
  ];
  couches.forEach(([nom, chemin, role, c, ic], i) => {
    const y = yb(i);
    corps += `<rect x="${BX}" y="${y}" width="${BL}" height="${BH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>
      ${actives[i].map(([a, b]) => `<rect x="${BX}" y="${y}" width="${BL}" height="${BH}" rx="14" fill="${c}" fill-opacity="0.06" stroke="${c}" stroke-width="1.6" opacity="0">${visible(C, a, b, 0.008)}</rect>`).join('')}
      <rect x="${BX + 18}" y="${y + 18}" width="34" height="34" rx="10" fill="${c}" fill-opacity="0.13" stroke="${c}" stroke-opacity="0.5"/>
      ${icone(ic, BX + 26, y + 26, c, 1.1)}
      ${texte(BX + 64, y + 33, nom, { taille: 16, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(BX + 64, y + 51, chemin, { taille: 12, couleur: c, police: MONO })}
      ${texte(BX + 20, y + 78, role, { taille: 12.5 })}
      <line x1="${OX - 14}" y1="${y + 14}" x2="${OX - 14}" y2="${y + BH - 14}" stroke="${BORD}"/>`;
  });

  // ------------------------------------------------ 1. Écrans : la fiche
  {
    const y = yb(0), x = OX;
    const mini = (fois, moy, note, c) => `${texte(x + 64, y + 42, enzo.prenom, { taille: 15, couleur: TITRE, poids: 800 })}
      ${texte(x + 64, y + 64, fois, { taille: 13, couleur: c, poids: 700 })}
      ${texte(x + 64 + fois.length * 7.6 + 10, y + 64, moy, { taille: 13, couleur: c, poids: 700 })}
      ${etoiles(x + 64, y + 82, note, { taille: 10 })}`;
    corps += `<rect x="${x}" y="${y + 14}" width="190" height="68" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${visage(enzo.photo, x + 10, y + 22, 44, 52, 9)}
      ${entre(C, 0, RELU, mini(t('7 fois', '7 times'), '3,8'.replace(',', t(',', '.')), 8, TEXTE), 0.004)}
      ${entre(C, RELU, 1.2, mini(t('8 fois', '8 times'), '3,9'.replace(',', t(',', '.')), 8, VERT), 0.004)}`;
    // Ce que fait l'écran, à droite de la fiche.
    const dit = (de, a, l1, l2, c) => entre(C, de, a, `${texte(x + 206, y + 42, l1, { taille: 13, couleur: c, police: MONO, poids: 700 })}
      ${texte(x + 206, y + 62, l2, { taille: 12.5 })}`, 0.006);
    corps += dit(0, D0, t('le formulaire', 'the form'), t('rempli, rien n’est écrit', 'filled in, nothing written'), TEXTE);
    corps += dit(D0, POP, '_enregistrer()', t('appelle depotRencontres.creer', 'calls depotRencontres.creer'), VIOLET);
    corps += dit(POP, RELU, 'rafraichir(ref, 12)', t('puis context.pop()', 'then context.pop()'), ACCENT);
    corps += dit(RELU, 1.2, t('relue', 'reread'), t('8 fois, 3,9 : rien de périmé', '8 times, 3.9: nothing stale'), VERT);
  }

  // ------------------------------------------ 2. Providers : le graphe
  const NOMS = ['repertoire', 'villes', 'journal', 'statistiques', 'annees', 'vocabulaire',
    'fiche(12)', 'rang(12)', 'rencontres(12)', 'notes(12)', 'photos(12)', 'etiquettes(12)'];
  const NL = (OL - 3 * 8) / 4, NH = 22;
  const noeud = (k) => [OX + (k % 4) * (NL + 8), yb(1) + 10 + Math.floor(k / 4) * (NH + 6)];
  {
    NOMS.forEach((n, k) => {
      const [x, y] = noeud(k);
      const a = INV[0] + 0.02 + k * 0.0022; // l'éventail : l'un après l'autre
      const lu = MONTE[0] + 0.005 + k * 0.0015;
      corps += `<rect x="${x}" y="${y}" width="${NL}" height="${NH}" rx="11" fill="${APP.carte}" stroke="${FIL}"/>
        <rect x="${x}" y="${y}" width="${NL}" height="${NH}" rx="11" fill="${ACCENT}" fill-opacity="0.22" stroke="${ACCENT}" stroke-width="1.4" opacity="0">
          ${fondu('opacity', C, [[0, 0], [a - 0.001, 0], [a, 1], [a + 0.006, 0.45], [a + 0.012, 1], [lu, 1], [lu + 0.004, 0], [1, 0]])}</rect>
        <rect x="${x}" y="${y}" width="${NL}" height="${NH}" rx="11" fill="${VERT}" fill-opacity="0.16" stroke="${VERT}" stroke-width="1.2" opacity="0">${visible(C, lu, RELU + 0.1, 0.006)}</rect>
        ${texte(x + NL / 2, y + 15, n, { taille: 11, couleur: TITRE, police: MONO, ancre: 'middle' })}`;
    });
    // Pendant la descente, la bande reste de côté : un mot le dit.
    corps += entre(C, SAUT[0], D3, `<rect x="${OX - 4}" y="${yb(1) + 6}" width="${OL + 8}" height="${BH - 12}" rx="10" fill="${CARTE}"/>
      ${icone('croix', OX + 6, yb(1) + 30, DISCRET, 1)}
      ${texte(OX + 34, yb(1) + 38, t('Rien, à la descente.', 'Nothing, on the way down.'), { taille: 14, couleur: TITRE, poids: 700 })}
      ${texte(OX + 34, yb(1) + 60, t('L’écran appelle le dépôt directement : une écriture', 'The screen calls the repository directly: a write'), { taille: 12.5 })}
      ${texte(OX + 34, yb(1) + 78, t('ne passe jamais par un provider.', 'never goes through a provider.'), { taille: 12.5 })}`, 0.006);
  }

  // --------------------------------------------- 3. Dépôts : la requête
  {
    const y = yb(2), x = OX;
    corps += `<rect x="${x}" y="${y + 12}" width="${OL}" height="${BH - 24}" rx="10" fill="#0A0E14" stroke="${BORD}"/>`;
    const code = (de, a, lignes) => entre(C, de, a, lignes.map(([s, c], k) =>
      O.frappe(x + 14, y + 36 + k * 20, s, C, de + 0.004 + k * 0.018, de + 0.02 + k * 0.018, { taille: 12, couleur: c, police: MONO })).join(''), 0.006);
    corps += entre(C, 0, D2, texte(x + 14, y + 52, t('-- en attente', '-- waiting'), { taille: 12, couleur: DISCRET, police: MONO }), 0.006);
    corps += code(D2, LIT[0] - 0.012, [
      ['INSERT INTO rencontres (personne_id, quand,', OR],
      ['  lieu, note) VALUES (12, \'2026-09-26T22:48\',', TITRE],
      ['  \'Auray\', 9)  -- 4,5 : neuf demi-points'.replace('4,5 : neuf demi-points', t('4,5 : neuf demi-points', '4.5: nine half points')), TEXTE],
    ]);
    corps += code(LIT[0] - 0.004, RELU + 0.08, [
      ['SELECT p.*, COUNT(r.id), AVG(r.note)', OR],
      ['  FROM personnes p LEFT JOIN rencontres r', TITRE],
      ['  GROUP BY p.id  -- ' + t('une requête, pas une par fiche', 'one query, not one per card'), TEXTE],
    ]);
    corps += entre(C, RELU + 0.08, 1.2, texte(x + 14, y + 52, t('-- a rendu la main', '-- has handed back'), { taille: 12, couleur: DISCRET, police: MONO }), 0.006);
  }

  // --------------------------------------------- 4. Sécurité : la clé
  {
    const y = yb(3), x = OX;
    // La clé, puis le fil qui la relie à la connexion ouverte.
    corps += `<rect x="${x}" y="${y + 20}" width="150" height="56" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${icone('cle', x + 12, y + 36, BLEU, 1.5)}
      ${texte(x + 48, y + 44, 'bodycount/db/v1', { taille: 11, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 48, y + 62, t('clé dérivée, HKDF', 'derived key, HKDF'), { taille: 11 })}
      <rect x="${x + OL - 170}" y="${y + 20}" width="170" height="56" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${icone('base', x + OL - 158, y + 36, BLEU, 1.4)}
      ${texte(x + OL - 124, y + 44, 'Base.instance.db', { taille: 11, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + OL - 124, y + 62, t('ouverte au déverrouillage', 'opened at unlock'), { taille: 11 })}
      <line x1="${x + 158}" y1="${y + 48}" x2="${x + OL - 178}" y2="${y + 48}" stroke="${FIL}" stroke-width="2" stroke-dasharray="3 5"/>`;
    // La même connexion sert l'écriture puis la lecture : le fil s'éclaire.
    for (const [de, a] of [[D3, D4 + 0.02], [M3, M3 + 0.04]]) {
      corps += `<line x1="${x + 158}" y1="${y + 48}" x2="${x + OL - 178}" y2="${y + 48}" stroke="${BLEU}" stroke-width="2.5" opacity="0">${visible(C, de, a, 0.006)}</line>
        <circle cy="${y + 48}" r="4" fill="#FFFFFF" opacity="0">${visible(C, de, a, 0.004)}${fondu('cx', C, [[0, x + 158], [de, x + 158], [a, x + OL - 178], [1, x + OL - 178]])}</circle>`;
    }
    corps += entre(C, D3, POP, texte(x + OL / 2 - 16, y + 88, t('la même connexion', 'the same connection'), { taille: 11.5, couleur: BLEU, ancre: 'middle' }), 0.006);
    corps += entre(C, M3, RELU, texte(x + OL / 2 - 16, y + 88, t('rien à rouvrir', 'nothing to reopen'), { taille: 11.5, couleur: BLEU, ancre: 'middle' }), 0.006);
  }

  // --------------------------------------------- 5. Disque : les pages
  {
    const y = yb(4), x = OX;
    const N = 14, PL = (OL - (N - 1) * 5) / N;
    for (let k = 0; k < N; k++) {
      const px = x + k * (PL + 5);
      corps += `<rect x="${px}" y="${y + 14}" width="${PL}" height="26" rx="4" fill="${APP.carte}" stroke="${FIL}"/>`;
    }
    // La page qui change : elle s'allume, puis se chiffre.
    const K = 9, kx = x + K * (PL + 5);
    corps += `<rect x="${kx}" y="${y + 14}" width="${PL}" height="26" rx="4" fill="${VERT}" fill-opacity="0.2" stroke="${VERT}" stroke-width="1.5" opacity="0">${visible(C, D4 + 0.01, POP + 0.02, 0.006)}</rect>
      <path d="M${kx + PL / 2} ${y + 42} v8" stroke="${VERT}" stroke-width="1.5" opacity="0">${visible(C, D4 + 0.01, POSE + 0.02, 0.006)}</path>`;
    // La lecture : un balayage passe sur toutes les pages.
    corps += `<rect y="${y + 12}" width="${PL + 6}" height="30" rx="5" fill="${VERT}" fill-opacity="0.14" stroke="${VERT}" stroke-opacity="0.6" opacity="0">
        ${visible(C, M4, MONTE[0], 0.006)}${fondu('x', C, [[0, x - 3], [M4, x - 3], [MONTE[0], x + OL - PL - 3], [1, x + OL - PL - 3]])}</rect>`;
    // Les octets de la page : clairs un instant, puis brouillés.
    const hex = (g) => Array.from({ length: 16 }, (_, k) => ((g * 53 + k * 97 + k * k * 29) % 256).toString(16).padStart(2, '0')).join(' ');
    const clair = t('26 sept. · Auray · 9 · 12', '26 Sept. · Auray · 9 · 12');
    const lignes = [
      [0, D4 + 0.015, hex(2), DISCRET],
      [D4 + 0.015, D4 + 0.045, clair, OR],
      [D4 + 0.045, D4 + 0.055, hex(7), VERT],
      [D4 + 0.055, D4 + 0.065, hex(11), VERT],
      [D4 + 0.065, 1.2, hex(19), TEXTE],
    ];
    for (const [de, a, s, c] of lignes) corps += entre(C, de, a, texte(x, y + 68, s, { taille: 12.5, couleur: c, police: MONO }), 0.002);
    corps += entre(C, 0, D4 + 0.015, texte(x, y + 86, t('des pages chiffrées, illisibles sans la clé', 'encrypted pages, unreadable without the key'), { taille: 12 }), 0.006);
    corps += entre(C, D4 + 0.015, D4 + 0.045, texte(x, y + 86, t('la rencontre, en mémoire seulement', 'the encounter, in memory only'), { taille: 12, couleur: OR }), 0.006);
    corps += entre(C, D4 + 0.045, M4, texte(x, y + 86, t('chiffrée par SQLCipher avant de toucher le disque', 'encrypted by SQLCipher before it hits the disk'), { taille: 12, couleur: VERT }), 0.006);
    corps += entre(C, M4, 1.2, texte(x, y + 86, t('relue, déchiffrée à la volée en mémoire', 'reread, decrypted on the fly in memory'), { taille: 12 }), 0.006);
  }

  // ------------------------------------------------ la descente, à gauche
  // Le rail, puis la carte « rencontre » qui tombe de bande en bande. Entre
  // les Écrans et les Dépôts, elle enjambe les Providers par un arc.
  const RL = 118, RH = 50; // la carte qui descend
  corps += `<line x1="${DX}" y1="${yc(0)}" x2="${DX}" y2="${yc(4)}" stroke="${FIL}" stroke-width="1.5" stroke-dasharray="2 6"/>`;
  corps += texte(DX, Y0 - 8, t('ÉCRIRE', 'WRITE'), { taille: 11, couleur: OR, police: MONO, poids: 700, ancre: 'middle', extra: 'letter-spacing="2"' });
  const arc = `M${DX} ${yc(0) + 26} C${DX - 70} ${yc(0) + 60} ${DX - 70} ${yc(2) - 60} ${DX} ${yc(2) - 26}`;
  corps += trace(arc, SAUT[0], SAUT[0] + 0.03, POP, VIOLET, { l: 260, epaisseur: 2.5 });
  corps += entre(C, SAUT[0] + 0.02, D3, `<rect x="${DX - 78}" y="${yc(1) - 13}" width="74" height="26" rx="13" fill="${VIOLET}" fill-opacity="0.18" stroke="${VIOLET}"/>
    ${texte(DX - 41, yc(1) + 4.5, t('saute', 'skips'), { taille: 11.5, couleur: '#E9D5FF', poids: 700, ancre: 'middle' })}`, 0.006);
  // Les flèches entre les dépôts, la sécurité et le disque.
  corps += trace(`M${DX} ${yc(2) + 26} V${yc(3) - 26}`, D3 - 0.01, D3 + 0.01, POP, OR, { l: 60, epaisseur: 2.5 });
  corps += trace(`M${DX} ${yc(3) + 26} V${yc(4) - 26}`, D4 - 0.01, D4 + 0.01, POP, BLEU, { l: 60, epaisseur: 2.5 });
  // Le paquet : position par étapes, en suivant l'arc pour le saut.
  const posPaquet = [[0, yc(0)], [D0, yc(0)], [SAUT[0], yc(0)]];
  for (let k = 1; k <= 8; k++) {
    // L'arc, échantillonné : la carte s'écarte à gauche puis revient.
    const u = k / 8, s0 = SAUT[0] + (SAUT[1] - SAUT[0]) * u;
    posPaquet.push([s0, null, u]);
  }
  const bez = (u, a, b, c, d) => (1 - u) ** 3 * a + 3 * (1 - u) ** 2 * u * b + 3 * (1 - u) * u * u * c + u ** 3 * d;
  const xy = posPaquet.map(([tt, y, u]) => {
    if (y !== null) return [tt, DX, y];
    const bx = bez(u, DX, DX - 70, DX - 70, DX), by = bez(u, yc(0) + 26, yc(0) + 60, yc(2) - 60, yc(2) - 26);
    return [tt, bx, u === 1 ? yc(2) : by];
  });
  xy.push([D3 - 0.012, DX, yc(2)], [D3 + 0.012, DX, yc(3)], [D4 - 0.012, DX, yc(3)], [D4 + 0.012, DX, yc(4)], [1, DX, yc(4)]);
  const trans = xy.map(([, x, y]) => `${Math.round(x - RL / 2)} ${Math.round(y - RH / 2)}`).join(';');
  const temps = xy.map(([tt]) => tt.toFixed(4)).join(';');
  corps += `<g opacity="0">
    ${fondu('opacity', C, [[0, 0], [D0 - 0.01, 0], [D0, 1], [POSE, 1], [POSE + 0.015, 0], [1, 0]])}
    <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${temps}" values="${trans}"/>
    <rect width="${RL}" height="${RH}" rx="12" fill="#1E1433" stroke="${VIOLET}" stroke-width="1.5" filter="url(#halo)"/>
    ${texte(12, 19, t('rencontre', 'encounter'), { taille: 10, couleur: '#C4B5FD', police: MONO, poids: 700, extra: 'letter-spacing="1"' })}
    ${texte(12, 38, 'Auray', { taille: 13, couleur: '#FFFFFF', poids: 800 })}
    ${etoiles(58, 37, 9, { taille: 9.5 })}
  </g>`;

  // ------------------------------------------------ la remontée, à droite
  corps += `<line x1="${MX}" y1="${yc(0)}" x2="${MX}" y2="${yc(4)}" stroke="${FIL}" stroke-width="1.5" stroke-dasharray="2 6"/>`;
  corps += texte(MX, Y0 - 8, t('RELIRE', 'REREAD'), { taille: 11, couleur: ACCENT, police: MONO, poids: 700, ancre: 'middle', extra: 'letter-spacing="2"' });
  // rafraichir() : de l'écran vers le rail, puis en éventail sur les
  // douze providers.
  const src = [MX, yc(0) + 22];
  corps += trace(`M${OX + 330} ${yb(0) + 58} H${MX} V${yc(0) + 22}`, INV[0] - 0.02, INV[0], LIT[1], ACCENT, { l: 160, epaisseur: 2 });
  NOMS.forEach((n, k) => {
    const [x, y] = noeud(k);
    const cx = x + NL / 2, cy = y + NH / 2;
    const d = `M${src[0]} ${src[1]} C${src[0] - 20} ${src[1] + 40} ${cx + 60} ${cy - 30} ${x + NL} ${cy}`;
    const a = INV[0] + 0.005 + k * 0.0022;
    corps += trace(d, a, a + 0.012, LIT[0] + 0.02, ACCENT, { l: 420, epaisseur: 1.2, extra: 'stroke-opacity="0.55"' });
  });
  // Les providers descendent lire aux dépôts : des fils verticaux.
  for (let k = 0; k < 4; k++) {
    const x = OX + k * (NL + 8) + NL / 2;
    corps += trace(`M${x} ${yb(1) + BH - 4} V${yb(2) + 8}`, LIT[0], LIT[0] + 0.015, M4, OR, { l: 30, epaisseur: 2 });
  }
  // Les valeurs remontent le rail, du disque jusqu'à la fiche.
  for (let k = 0; k < 4; k++) {
    const de = MONTE[0] + k * 0.012;
    corps += `<circle cx="${MX}" r="5" fill="${VERT}" opacity="0" filter="url(#halo)">
      ${fondu('opacity', C, [[0, 0], [de, 0], [de + 0.004, 1], [de + 0.045, 1], [de + 0.05, 0], [1, 0]])}
      ${fondu('cy', C, [[0, yc(4)], [de, yc(4)], [de + 0.05, yc(0)], [1, yc(0)]])}</circle>`;
  }
  corps += trace(`M${MX} ${yc(4)} V${yc(0)}`, MONTE[0], MONTE[1], RELU + 0.06, VERT, { l: 420, epaisseur: 2.5 });
  corps += trace(`M${MX} ${yc(0)} H${OX + 196}`, MONTE[1] - 0.01, RELU, RELU + 0.06, VERT, { l: 300, epaisseur: 2.5 });

  // ------------------------------------------------ la règle et l'étape
  const LY = yb(5) + 6, LH = 720 - LY - 22;
  corps += `<rect x="400" y="${LY}" width="820" height="${LH}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    <path d="M422 ${LY + 17} v14 m-5 -6 l5 6 l5 -6" fill="none" stroke="${OR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(436, LY + 30, t('Écrire descend.', 'Writing goes down.'), { taille: 13.5, couleur: TITRE, poids: 700 })}
    <path d="M${596} ${LY + 31} v-14 m-5 6 l5 -6 l5 6" fill="none" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(610, LY + 30, t('Relire remonte.', 'Rereading goes up.'), { taille: 13.5, couleur: TITRE, poids: 700 })}
    ${texte(772, LY + 30, t('Aucun écran n’écrit de SQL.', 'No screen writes SQL.'), { taille: 13.5, couleur: VERT, poids: 700 })}`;
  const etapes = [
    [0, D0, t('Le formulaire est rempli : Auray, 4,5 sur 5, Chez lui, Toute la nuit.', 'The form is filled in: Auray, 4.5 out of 5, His place, All night.')],
    [D0, D2, t('Enregistrer : l’écran appelle le dépôt directement, sans passer par un provider.', 'Save: the screen calls the repository directly, without a provider.')],
    [D2, D3, t('Le dépôt écrit l’INSERT, puis les étiquettes du soir et la note au carnet.', 'The repository writes the INSERT, then the evening tags and the notebook note.')],
    [D3, D4, t('La sécurité prête la connexion, ouverte avec la clé tirée de bodycount/db/v1.', 'Security lends the connection, opened with the key from bodycount/db/v1.')],
    [D4, POP, t('Sur le disque, une page change, chiffrée avant d’être écrite.', 'On the disk, one page changes, encrypted before it is written.')],
    [POP, LIT[0], t('rafraichir() invalide douze providers d’un seul appel, en éventail.', 'rafraichir() invalidates twelve providers in a single call, fanning out.')],
    [LIT[0], MONTE[0], t('Ils relisent par les dépôts, en requêtes groupées, sur la même connexion.', 'They reread through the repositories, grouped queries, same connection.')],
    [MONTE[0], RELU, t('Les valeurs remontent jusqu’à l’écran.', 'The values climb back up to the screen.')],
    [RELU, 1.2, t('La fiche revient à jour : 8 fois, 3,9, la rencontre du 26 sept. en tête.', 'The card comes back up to date: 8 times, 3.9, the 26 Sept. encounter on top.')],
  ];
  for (const [de, a, s] of etapes) corps += entre(C, de, a, texte(422, LY + 56, s, { taille: 12.5, couleur: TEXTE }), 0.006);

  svg('couches.svg', 1280, 720, corps, t(
    'Les cinq couches de BodyCount, traversées par un toucher sur Enregistrer. Le formulaire d’une rencontre d’Enzo est rempli : Auray, 4,5 sur 5, Chez lui et Toute la nuit. À la descente, une carte « rencontre » tombe de couche en couche : l’écran appelle directement depotRencontres.creer et enjambe les providers ; le dépôt, seul endroit où s’écrit du SQL, fait l’INSERT, puis les étiquettes et la note au carnet ; la sécurité prête la connexion ouverte avec la clé tirée de bodycount/db/v1 ; sur le disque, une page de bodycount.db change et se chiffre avant d’être écrite. À la remontée, l’écran appelle rafraichir, qui invalide d’un seul appel douze providers, du répertoire aux étiquettes d’Enzo ; ils relisent par les dépôts, en requêtes groupées, sur la même connexion, et les valeurs remontent jusqu’à la fiche, qui revient à jour : 8 fois, 3,9, la rencontre du 26 septembre en tête. Écrire descend, relire remonte, et aucun écran n’écrit de SQL.',
    'The five layers of BodyCount, crossed by one tap on Save. The form for an encounter with Enzo is filled in: Auray, 4.5 out of 5, His place and All night. On the way down, an “encounter” card drops from layer to layer: the screen calls depotRencontres.creer directly and jumps over the providers; the repository, the only place SQL is written, runs the INSERT, then the tags and the notebook note; the security layer lends the connection opened with the key from bodycount/db/v1; on the disk, one page of bodycount.db changes and is encrypted before it is written. On the way up, the screen calls rafraichir, which invalidates twelve providers in a single call, from the people list to Enzo’s tags; they reread through the repositories, with grouped queries, on the same connection, and the values climb back to the card, which comes back up to date: 8 times, 3.9, the encounter of 26 September on top. Writing goes down, rereading goes up, and no screen writes SQL.'));
};

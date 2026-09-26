// La palette, là où elle sert.
//
// À gauche, la fiche d'Enzo telle que l'application la dessine ; à droite,
// les couleurs de lib/config/theme.dart, une par ligne. Chacune s'allume à
// son tour, et un trait la relie à l'endroit de l'écran qui la porte. La
// dernière, le rouge, n'existe que dans une boîte de dialogue : elle
// s'ouvre pour lui.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, visage, etoiles, bouton, icone,
    APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT } = O;
  const C = 36;
  const H = 704;
  let corps = entete(t('LA PALETTE', 'THE PALETTE'),
    t('Tirée du logo : le violet et le fuchsia du dégradé, sur un fond presque noir qui tire au violet.',
      'Drawn from the logo: the violet and fuchsia of its gradient, on a near black that leans violet.'));

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 92, 290, 540);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // La photo, le voile, les deux boutons ronds.
  ecran += `${visage(12, SX, SY, SL, 238, 0)}
    <rect x="${SX}" y="${SY}" width="${SL}" height="238" fill="url(#voile)"/>
    <circle cx="${SX + 24}" cy="${SY + 24}" r="14" fill="${APP.fond}" fill-opacity="0.55"/>
    <path d="M${SX + 28} ${SY + 18} L${SX + 21} ${SY + 24} L${SX + 28} ${SY + 30}" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${SX + SL - 24}" cy="${SY + 24}" r="14" fill="${APP.fond}" fill-opacity="0.55"/>
    <path d="M${SX + SL - 29} ${SY + 29} l2 -6 l7 -7 l4 4 l-7 7 z" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round"/>`;
  // Les pastilles posées sur la photo : le rang en vert, le reste voilé.
  const PY = SY + 190;
  ecran += `<rect x="${SX + 14}" y="${PY}" width="52" height="20" rx="10" fill="${APP.vert}"/>
    ${icone('etoile', SX + 20, PY + 4.5, '#0B2A16', 0.7)}
    ${texte(SX + 34, PY + 14, 'N°12', { taille: 10, couleur: '#0B2A16', poids: 800 })}`;
  let px = SX + 72;
  for (const s of [t('23 ans', '23 y/o'), 'Vannes', t('Versatile', 'Versatile')]) {
    const l = Math.round(s.length * 6 + 18);
    ecran += `<rect x="${px}" y="${PY}" width="${l}" height="20" rx="10" fill="${APP.fond}" fill-opacity="0.6"/>
      ${texte(px + l / 2, PY + 14, s, { taille: 10, couleur: APP.texte, poids: 600, ancre: 'middle' })}`;
    px += l + 6;
  }
  ecran += texte(SX + 16, SY + 234, 'Enzo P.', { taille: 27, couleur: APP.texte, poids: 800, extra: 'letter-spacing="-0.5"' });

  // Les trois chiffres.
  const ST = SY + 262;
  ecran += `${texte(SX + 18, ST + 12, '3,8', { taille: 19, couleur: APP.texte, poids: 800 })}
    ${etoiles(SX + 18, ST + 28, 8, { taille: 8.5 })}
    <line x1="${SX + 96}" y1="${ST - 4}" x2="${SX + 96}" y2="${ST + 30}" stroke="${APP.bord}"/>
    ${texte(SX + 110, ST + 12, '7', { taille: 19, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 110, ST + 28, t('FOIS', 'TIMES'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    <line x1="${SX + 180}" y1="${ST - 4}" x2="${SX + 180}" y2="${ST + 30}" stroke="${APP.bord}"/>
    ${texte(SX + 194, ST + 12, t('347 j', '347 d'), { taille: 19, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 194, ST + 28, t('DEPUIS', 'SINCE'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}`;

  // Les étiquettes : deux pleines, en dégradé, une discrète.
  const EY = SY + 318;
  ecran += `${texte(SX + 18, EY, t('ÉTIQUETTES', 'TAGS'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    ${texte(SX + SL - 18, EY, t('Modifier', 'Edit'), { taille: 10.5, couleur: APP.violet, poids: 700, ancre: 'end' })}`;
  px = SX + 16;
  const ETIQ = [[t('Bronzé', 'Tanned'), true], [t('Moustache', 'Moustache'), true], [t('Bavard', 'Chatty'), false]];
  const posEtiq = [];
  for (const [s, plein] of ETIQ) {
    const l = Math.round(s.length * 6.2 + 22);
    posEtiq.push([px, l]);
    ecran += `<rect x="${px}" y="${EY + 10}" width="${l}" height="22" rx="11" fill="${plein ? 'url(#marque)' : APP.carte}" stroke="${plein ? 'none' : APP.bord}"/>
      ${texte(px + l / 2, EY + 25, s, { taille: 10.5, couleur: plein ? '#FFFFFF' : APP.texte, poids: 600, ancre: 'middle' })}`;
    px += l + 6;
  }

  // Une rencontre, dans sa carte.
  const RY = SY + 376;
  ecran += `${texte(SX + 18, RY, t('RENCONTRES · 7', 'ENCOUNTERS · 7'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    ${texte(SX + SL - 18, RY, t('Ajouter', 'Add'), { taille: 10.5, couleur: APP.violet, poids: 700, ancre: 'end' })}
    <rect x="${SX + 12}" y="${RY + 10}" width="${SL - 24}" height="50" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${texte(SX + 26, RY + 31, t('14 sept.', '14 Sept.'), { taille: 12.5, couleur: APP.texte, poids: 700 })}
    ${texte(SX + 26, RY + 48, t('22h22 · Auray', '10:22 pm · Auray'), { taille: 10, couleur: APP.discret })}
    <rect x="${SX + 116}" y="${RY + 21}" width="40" height="18" rx="9" fill="${APP.or}" fill-opacity="0.15"/>
    ${texte(SX + 136, RY + 34, t('50 €', '€50'), { taille: 10, couleur: APP.or, poids: 700, ancre: 'middle' })}
    ${etoiles(SX + SL - 88, RY + 40, 7, { taille: 9 })}
    <path d="M${SX + SL - 30} ${RY + 29} l4 5 l-4 5" fill="none" stroke="${APP.discret}" stroke-width="1.6" stroke-linecap="round"/>`;

  // Le bas : l'appel et le bouton d'action.
  const BY = SY + SH - 58;
  ecran += `<rect x="${SX + 12}" y="${BY}" width="42" height="42" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${icone('telephoneIcone', SX + 25, BY + 13, APP.second, 1)}
    ${bouton(SX + 62, BY, SL - 74, 42, t('+  Nouvelle rencontre', '+  New encounter'))}`;

  // Les couleurs, dans l'ordre où elles s'allument : [nom, hexa, usage,
  // zone de l'écran (x, y, l, h), couleur du trait].
  const COULEURS = [
    [t('Fond', 'Background'), '#0B0616', t('le sol, un noir qui tire au violet', 'the floor, a black leaning violet'), [SX + 2, SY + 244, SL - 4, SH - 250]],
    [t('Arête', 'Edge'), '#261A45', t('le bord des cartes et les séparateurs', 'card edges and dividers'), [SX + 12, RY + 10, SL - 24, 50]],
    [t('Carte', 'Card'), '#1A1030', t('le fond d’une rencontre, d’un champ', 'the fill of an encounter, of a field'), [SX + 12, RY + 10, SL - 24, 50]],
    [t('Texte', 'Text'), '#F6F2FF', t('le prénom, les chiffres, les titres', 'the name, the figures, the titles'), [SX + 12, SY + 208, 120, 34]],
    [t('Texte second', 'Secondary text'), '#9B8CB8', t('les intitulés : FOIS, DEPUIS, ÉTIQUETTES', 'the labels: TIMES, SINCE, TAGS'), [SX + 104, ST + 18, 150, 16]],
    [t('Texte tertiaire', 'Tertiary text'), '#7D6E99', t('ce qui se lit en dernier : l’heure, le lieu', 'what reads last: the time, the place'), [SX + 22, RY + 38, 88, 15]],
    [t('Violet, primaire', 'Violet, primary'), '#A855F7', t('les liens, le début du dégradé', 'links, the start of the gradient'), [SX + SL - 72, RY - 13, 60, 18]],
    [t('Fuchsia, accent', 'Fuchsia, accent'), '#D946EF', t('la fin du dégradé : ce qui doit sauter aux yeux', 'the end of the gradient: what must stand out'), [SX + 60, BY - 3, SL - 70, 48]],
    [t('Étoile', 'Star'), '#C084FC', t('les notes, un violet clair qui ne crie pas', 'ratings, a pale violet that does not shout'), [SX + 14, ST + 16, 64, 16]],
    [t('Vert', 'Green'), '#1ED760', t('le rang, les hausses : ce qui monte', 'rank and rises: what goes up'), [SX + 12, PY - 3, 56, 26]],
    [t('Or', 'Gold'), '#FDE68A', t('ce que ça a rapporté, l’étoile du podium', 'what it brought in, the podium star'), [SX + 112, RY + 18, 48, 24]],
    [t('Surface', 'Surface'), '#150C28', t('les panneaux, les feuilles, les dialogues', 'panels, sheets, dialogs'), null],
    [t('Rouge', 'Red'), '#F87171', t('le seul rouge de l’appli : supprimer', 'the app’s only red: delete'), null],
  ];
  const N = COULEURS.length;
  const PAS = 0.94 / N;
  const debut = (i) => 0.02 + i * PAS;

  // La boîte de dialogue, pour la surface et le rouge.
  const DLG = [SX + 16, SY + 150, SL - 32, 170];
  const dialogue = debut(N - 2);
  ecran += entre(C, dialogue - 0.01, 0.985, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.6"/>
    <rect x="${DLG[0]}" y="${DLG[1]}" width="${DLG[2]}" height="${DLG[3]}" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
    ${texte(DLG[0] + 20, DLG[1] + 34, t('Supprimer cette rencontre ?', 'Delete this encounter?'), { taille: 14.5, couleur: APP.texte, poids: 700 })}
    ${texte(DLG[0] + 20, DLG[1] + 60, t('Elle disparaît des statistiques, de la', 'It leaves the statistics, the map'), { taille: 10.5, couleur: APP.second })}
    ${texte(DLG[0] + 20, DLG[1] + 76, t('carte et du calendrier. Les notes écrites', 'and the calendar. The notes written'), { taille: 10.5, couleur: APP.second })}
    ${texte(DLG[0] + 20, DLG[1] + 92, t('ce soir-là restent sur la fiche.', 'that night stay on the card.'), { taille: 10.5, couleur: APP.second })}
    ${texte(DLG[0] + DLG[2] - 104, DLG[1] + 146, t('Annuler', 'Cancel'), { taille: 12, couleur: APP.violet, poids: 700, ancre: 'end' })}
    ${texte(DLG[0] + DLG[2] - 20, DLG[1] + 146, t('Supprimer', 'Delete'), { taille: 12, couleur: APP.rouge, poids: 700, ancre: 'end' })}`, 0.008);
  COULEURS[N - 2][3] = DLG;
  COULEURS[N - 1][3] = [DLG[0] + DLG[2] - 94, DLG[1] + 128, 82, 26];
  corps += T.ecran(ecran);

  // ------------------------------------------------------------ les couleurs
  const LX = 420, LL = 800, LY = 100, RH = 36, RP = 40;
  corps += rubrique(LX, LY - 12, t('LIB/CONFIG/THEME.DART, UNE COULEUR À LA FOIS', 'LIB/CONFIG/THEME.DART, ONE COLOUR AT A TIME'));
  COULEURS.forEach(([nom, hexa, usage, zone], i) => {
    const y = LY + i * RP, de = debut(i), a = de + PAS;
    const clair = ['#F6F2FF', '#FDE68A', '#1ED760', '#C084FC', '#F87171', '#9B8CB8', '#D946EF', '#A855F7'].includes(hexa);
    corps += `<rect x="${LX}" y="${y}" width="${LL}" height="${RH}" rx="10" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${LX}" y="${y}" width="${LL}" height="${RH}" rx="10" fill="${hexa}" fill-opacity="0.07" stroke="${clair ? hexa : ACCENT}" stroke-width="1.5" opacity="0">${visible(C, de, a, 0.006)}</rect>
      <rect x="${LX + 8}" y="${y + 6}" width="44" height="24" rx="7" fill="${hexa}" stroke="#FFFFFF" stroke-opacity="0.14"/>
      ${texte(LX + 66, y + 23, nom, { taille: 13, couleur: TITRE, poids: 700 })}
      ${texte(LX + 222, y + 23, hexa, { taille: 12, couleur: clair ? hexa : TEXTE, police: MONO, poids: 700 })}
      ${texte(LX + 316, y + 23, usage, { taille: 12.5 })}`;

    // Sur l'écran : un cadre pointillé autour de ce qui la porte, et un
    // trait jusqu'à sa ligne.
    const [zx, zy, zl, zh] = zone;
    const cy = zy + zh / 2, ly = y + RH / 2;
    const trait = clair ? hexa : ACCENT;
    corps += entre(C, de, a, `<rect x="${zx - 2}" y="${zy - 2}" width="${zl + 4}" height="${zh + 4}" rx="10" fill="none" stroke="${trait}" stroke-width="2" stroke-dasharray="5 4">
        <animate attributeName="stroke-dashoffset" dur="1.2s" repeatCount="indefinite" values="0;-18"/></rect>
      <path d="M${zx + zl + 2} ${cy} H${SX + SL + 22} C${SX + SL + 44} ${cy} ${SX + SL + 44} ${ly} ${LX - 22} ${ly} H${LX}" fill="none" stroke="${trait}" stroke-width="1.5" stroke-opacity="0.8"/>
      <circle cx="${zx + zl + 2}" cy="${cy}" r="3.5" fill="${trait}"/>`, 0.006);
  });

  // Le dégradé de la marque, et ce qui ne s'invente pas.
  const GY = LY + N * RP + 8;
  corps += `<rect x="${LX}" y="${GY}" width="${LL}" height="52" rx="12" fill="${CARTE}" stroke="${BORD}"/>
    <rect x="${LX + 12}" y="${GY + 12}" width="160" height="28" rx="14" fill="url(#marque)"/>
    ${texte(LX + 92, GY + 30.5, t('le dégradé', 'the gradient'), { taille: 12, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
    ${texte(LX + 190, GY + 23, t('Du violet au fuchsia, en diagonale : les boutons d’action et les pastilles pleines.', 'Violet to fuchsia, on the diagonal: action buttons and filled chips.'), { taille: 12.5, couleur: TITRE })}
    ${texte(LX + 190, GY + 41, t('Les photos ne sont presque pas teintées : un voile violet faisait virer les visages.', 'Photos are barely tinted: a violet veil used to turn faces purple.'), { taille: 12 })}`;

  svg('palette.svg', 1280, H, corps, t(
    'La palette de BodyCount, sur la fiche d’Enzo. Chaque couleur s’allume à son tour et un trait la relie à ce qui la porte. Fond #0B0616, le sol, un noir qui tire au violet. Arête #261A45, le bord des cartes. Carte #1A1030, le fond d’une rencontre. Texte #F6F2FF, le prénom et les chiffres. Texte second #9B8CB8, les intitulés. Texte tertiaire #7D6E99, l’heure et le lieu. Violet primaire #A855F7, les liens et le début du dégradé. Fuchsia #D946EF, la fin du dégradé sur le bouton Nouvelle rencontre. Étoile #C084FC, les notes. Vert #1ED760, le rang N°12. Or #FDE68A, les 50 € d’une soirée. Surface #150C28, la boîte de dialogue qui s’ouvre. Rouge #F87171, le seul rouge de l’appli, sur Supprimer.',
    'The BodyCount palette, on Enzo’s card. Each colour lights up in turn and a line ties it to what carries it. Background #0B0616, the floor, a black leaning violet. Edge #261A45, card borders. Card #1A1030, the fill of an encounter. Text #F6F2FF, the name and figures. Secondary text #9B8CB8, the labels. Tertiary text #7D6E99, the time and place. Primary violet #A855F7, links and the start of the gradient. Fuchsia #D946EF, the end of the gradient on the New encounter button. Star #C084FC, ratings. Green #1ED760, the No. 12 rank. Gold #FDE68A, the €50 of a night out. Surface #150C28, the dialog that opens. Red #F87171, the app’s only red, on Delete.'));
};

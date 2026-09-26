// Le calendrier : un mois sur sept colonnes, des disques pour les jours
// pleins, et sous chacun jusqu'à trois signes, triés du plus rare au plus
// banal (lib/ecrans/marqueurs_calendrier.dart).
//
// À gauche, le téléphone : septembre se remplit, un jour se touche, la
// légende s'ouvre, puis août et décembre 2025 passent. À droite, ce que
// veut dire une case, le tri des signes du jour touché, les vingt-cinq
// signes de la légende avec leur rang, et trois cartes.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, paliers, fondu, visible, entre, glisse, telephone, toucher, icone,
    visage, etoiles, barreNav, GENS, APP, MONO, SANS, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR } = O;
  const C = 36;
  const EMOJI = 'Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif';
  const emoji = (x, y, s, taille, extra = '') =>
    `<text x="${x}" y="${y}" font-family="${EMOJI}" font-size="${taille}" text-anchor="middle" ${extra}>${s}</text>`;

  // Les instants du cycle.
  const TOUCHE = 0.27, LEGENDE = 0.5, RETOUR = 0.655, AOUT = 0.7, ANNEE = 0.84, FIN = 0.985;

  // L'ordre de rareté, celui de _priorites.
  const RANG = ['🤑', '💰', '💵', '👑', '⭐', '🔥', '🎂', '✨', '❤️', '🏁', '📅', '🌙', '🌅', '🌃', '🕐', '⚡', '✈️', '🏖️', '🚗', '🌲', '🏠', '🛏️', '🍆', '🍑', '♾️'];
  const rang = (s) => RANG.indexOf(s) + 1;
  const ARGENT = ['🤑', '💰', '💵'];

  let corps = `<defs><linearGradient id="orCal" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FDE68A"/><stop offset="1" stop-color="#E0A93F"/></linearGradient></defs>`;
  corps += entete(t('LE CALENDRIER', 'THE CALENDAR'),
    t('Un mois sur sept colonnes. Sous chaque jour plein, trois signes au plus, les plus rares d’abord.',
      'A month on seven columns. Under each busy day, three signs at most, the rarest first.'));

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // Ce qui ne bouge pas : le titre, le total, les années.
  ecran += `${texte(SX + 16, SY + 44, t('CALENDRIER', 'CALENDAR'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
    <rect x="${SX + SL - 108}" y="${SY + 27}" width="94" height="25" rx="12.5" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
    ${texte(SX + SL - 98, SY + 44, '111', { taille: 12.5, couleur: APP.texte, poids: 800 })}
    ${texte(SX + SL - 73, SY + 44, t('Rencontres', 'Encounters'), { taille: 10, couleur: APP.second, poids: 600 })}`;
  // Les pastilles d'année : 2026 jusqu'au toucher sur 2025.
  const annee = (x, s, actif) => `<rect x="${x}" y="${SY + 62}" width="58" height="26" rx="13" fill="${actif ? 'url(#marque)' : '#FFFFFF'}" fill-opacity="${actif ? 1 : 0.05}" stroke="${actif ? 'none' : APP.bord}"/>
    ${texte(x + 29, SY + 79, s, { taille: 11.5, couleur: actif ? '#FFFFFF' : APP.second, poids: 800, ancre: 'middle' })}`;
  ecran += entre(C, 0, ANNEE, annee(SX + 16, '2026', true) + annee(SX + 82, '2025', false), 0.004);
  ecran += entre(C, ANNEE, 1, annee(SX + 16, '2026', false) + annee(SX + 82, '2025', true), 0.004);

  // La carte du mois.
  const CX = SX + 10, CY = SY + 100, CW = SL - 20, CH = 292;
  const cw = (CW - 12) / 7;
  const colX = (c) => CX + 6 + cw * (c + 0.5);
  const ligneY = (r) => CY + 91 + r * 34;
  const bouton = (x, y, trace) => `<circle cx="${x}" cy="${y}" r="13" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
    <path d="${trace}" fill="none" stroke="${APP.second}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  const BG = { x: CX + 22, y: CY + 26 }, BD = { x: CX + CW - 50, y: CY + 26 }, BQ = { x: CX + CW - 20, y: CY + 26 };
  const jours = t(['L', 'M', 'M', 'J', 'V', 'S', 'D'], ['M', 'T', 'W', 'T', 'F', 'S', 'S']);

  /// Un mois : [debut] la colonne du 1er (0 lundi), [nb] ses jours,
  /// [pleins] les signes de chaque jour plein. [pop] fait apparaître les
  /// disques un à un à partir de cet instant.
  function mois({ titre, sous, debut, nb, pleins, aujourdhui = 0, pop = null }) {
    let s = `<rect x="${CX}" y="${CY}" width="${CW}" height="${CH}" rx="18" fill="#FFFFFF" fill-opacity="0.045" stroke="${APP.bord}"/>
      ${bouton(BG.x, BG.y, `M${BG.x + 2.5} ${BG.y - 5} L${BG.x - 2.5} ${BG.y} L${BG.x + 2.5} ${BG.y + 5}`)}
      ${bouton(BD.x, BD.y, `M${BD.x - 2.5} ${BD.y - 5} L${BD.x + 2.5} ${BD.y} L${BD.x - 2.5} ${BD.y + 5}`)}
      <circle cx="${BQ.x}" cy="${BQ.y}" r="13" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
      ${texte(BQ.x, BQ.y + 4.5, '?', { taille: 13, couleur: APP.second, poids: 800, ancre: 'middle' })}
      ${texte(CX + CW / 2 - 14, CY + 24, titre, { taille: 11.5, couleur: '#E9D5FF', poids: 800, ancre: 'middle', extra: 'letter-spacing="1"' })}
      ${texte(CX + CW / 2 - 14, CY + 39, sous, { taille: 9.5, couleur: APP.discret, ancre: 'middle' })}`;
    jours.forEach((j, c) => { s += texte(colX(c), CY + 66, j, { taille: 9.5, couleur: APP.discret, poids: 700, ancre: 'middle' }); });
    const ordre = Object.keys(pleins).map(Number).sort((a, b) => a - b);
    for (let d = 1; d <= nb; d++) {
      const k = debut + d - 1, x = colX(k % 7), y = ligneY(Math.floor(k / 7));
      const signes = pleins[d];
      if (!signes) {
        s += d === aujourdhui
          ? `<circle cx="${x}" cy="${y}" r="11.5" fill="none" stroke="${APP.violet}" stroke-opacity="0.55"/>${texte(x, y + 4, String(d), { taille: 10.5, couleur: APP.rose, poids: 600, ancre: 'middle' })}`
          : texte(x, y + 4, String(d), { taille: 10.5, couleur: APP.discret, poids: 600, ancre: 'middle' });
        continue;
      }
      const or = signes.some((m) => ARGENT.includes(m));
      let disque = `<circle cx="0" cy="0" r="11.5" fill="${or ? 'url(#orCal)' : 'url(#marque)'}"/>
        ${texte(0, 4, String(d), { taille: 10.5, couleur: '#12071F', poids: 800, ancre: 'middle' })}`;
      let marques = emoji(x, y + 21, signes.join(''), 7.2);
      if (pop !== null) {
        const a = pop + ordre.indexOf(d) * 0.011;
        disque = `<g><animateTransform attributeName="transform" type="scale" dur="${C}s" repeatCount="indefinite" keyTimes="0;${a.toFixed(4)};${(a + 0.008).toFixed(4)};${(a + 0.014).toFixed(4)};1" values="0;0;1.25;1;1"/>${disque}</g>`;
        marques = entre(C, a + 0.012, 1, marques, 0.006);
      }
      s += `<g transform="translate(${x} ${y})">${disque}</g>${marques}`;
    }
    return s;
  }

  // Les trois mois du cycle.
  const SEPT = {
    titre: t('SEPTEMBRE 2026', 'SEPTEMBER 2026'), sous: t('12 rencontres  💵 180 €', '12 encounters  💵 €180'), debut: 1, nb: 30, aujourdhui: 26,
    pleins: { 2: ['🕐', '🍆'], 5: ['💰', '🌲', '🍑'], 6: ['✨', '🛏️'], 11: ['❤️', '🌙', '♾️'], 13: ['🔥', '📅', '🏠'], 14: ['🔥', '⚡', '🍆'],
      15: ['🔥', '🌃', '🛏️'], 19: ['💵', '🎂', '🌅'], 20: ['🚗', '🍑'], 23: ['💵', '👑', '✨'], 25: ['✈️', '🏖️', '♾️'] },
  };
  const AOUT_ = {
    titre: t('AOÛT 2026', 'AUGUST 2026'), sous: t('6 rencontres  💵 40 €', '6 encounters  💵 €40'), debut: 5, nb: 31,
    pleins: { 1: ['🌙', '♾️'], 8: ['💵', '🌲', '🍆'], 15: ['🏖️', '🍑'], 16: ['✨', '🕐'], 22: ['👑', '🛏️', '♾️'], 29: ['🌃', '🏠'] },
  };
  const DEC = {
    titre: t('DÉCEMBRE 2025', 'DECEMBER 2025'), sous: t('5 rencontres  💵 120 €', '5 encounters  💵 €120'), debut: 0, nb: 31,
    pleins: { 6: ['✨', '🛏️'], 13: ['💰', '🍑'], 20: ['🌙', '♾️'], 24: ['🎂', '🏠'], 31: ['🌃', '🍆'] },
  };
  ecran += entre(C, 0, AOUT, mois({ ...SEPT, pop: 0.03 }), 0.004);
  ecran += entre(C, AOUT, ANNEE, mois(AOUT_), 0.004);
  ecran += entre(C, ANNEE, 1, mois(DEC), 0.004);
  // Le jour touché, cerclé de blanc.
  const k23 = SEPT.debut + 22, X23 = colX(k23 % 7), Y23 = ligneY(Math.floor(k23 / 7));
  ecran += entre(C, TOUCHE + 0.004, AOUT, `<circle cx="${X23}" cy="${Y23}" r="12.5" fill="none" stroke="#FFFFFF" stroke-width="2"/>`, 0.003);

  // La liste du dessous : son en-tête et sa première ligne.
  const LY = SY + 416;
  const entete_ = (gauche, compte, tout = false) => `${texte(SX + 16, LY, gauche, { taille: 11.5, couleur: '#C9B8E8', poids: 800, extra: 'letter-spacing="0.6"' })}
    ${texte(SX + 16 + gauche.length * 7.6 + 8, LY, compte, { taille: 10, couleur: APP.discret, poids: 600 })}
    ${tout ? `<rect x="${SX + SL - 88}" y="${LY - 15}" width="74" height="21" rx="10.5" fill="${APP.violet}" fill-opacity="0.16" stroke="${APP.violet}" stroke-opacity="0.3"/>
      ${texte(SX + SL - 51, LY - 1, t('Tout le mois', 'Whole month'), { taille: 9.5, couleur: '#E9D5FF', poids: 700, ancre: 'middle' })}` : ''}`;
  const ligne = (p, quand, lieu, heure, signes, montant = null) => {
    const y = LY + 12;
    return `<rect x="${SX + 10}" y="${y}" width="${SL - 20}" height="60" rx="16" fill="#FFFFFF" fill-opacity="0.045" stroke="${APP.bord}"/>
      ${visage(p.photo, SX + 18, y + 8, 44, 44, 11)}
      ${texte(SX + 72, y + 24, p.prenom, { taille: 13.5, couleur: APP.texte, poids: 800 })}
      ${etoiles(SX + 72, y + 38, p.note, { taille: 8 })}
      ${texte(SX + 72, y + 52, `${quand}  ·  ${lieu}  ·  ${heure}`, { taille: 9.5, couleur: APP.second })}
      <rect x="${SX + SL - 58}" y="${y + 8}" width="38" height="18" rx="9" fill="${APP.fond}" fill-opacity="0.8" stroke="${APP.bord}"/>
      ${emoji(SX + SL - 39, y + 21, signes.join(''), 9.5)}
      ${montant ? `<rect x="${SX + SL - 58}" y="${y + 34}" width="38" height="17" rx="8.5" fill="${APP.or}" fill-opacity="0.14"/>${texte(SX + SL - 39, y + 46, montant, { taille: 9.5, couleur: APP.or, poids: 800, ancre: 'middle' })}` : ''}`;
  };
  ecran += entre(C, 0.05, TOUCHE, entete_(t('SEPTEMBRE', 'SEPTEMBER'), t('12 rencontres', '12 encounters')) +
    ligne(GENS.malo, t('25 sept.', '25 Sept.'), 'Marseille', '21h30', ['✈️', '🏖️']), 0.006);
  ecran += entre(C, TOUCHE, AOUT, entete_(t('mercredi 23', 'Wed 23'), t('1 rencontre', '1 encounter'), true) +
    ligne({ ...GENS.tom, note: 9 }, t('23 sept.', '23 Sept.'), 'Vannes', '22h40', ['💵', '👑'], t('50 €', '€50')), 0.004);
  ecran += entre(C, AOUT, ANNEE, entete_(t('AOÛT', 'AUGUST'), t('6 rencontres', '6 encounters')) +
    ligne(GENS.lou, t('29 août', '29 Aug.'), 'Vannes', '02h10', ['🌃', '🏠']), 0.004);
  ecran += entre(C, ANNEE, FIN, entete_(t('DÉCEMBRE', 'DECEMBER'), t('5 rencontres', '5 encounters')) +
    ligne(GENS.noa, t('31 déc.', '31 Dec.'), 'Vannes', '01h20', ['🌃', '🍆']), 0.004);
  ecran += barreNav(T, 'Agenda');

  // Les touchers.
  ecran += toucher(X23, Y23, C, TOUCHE);
  ecran += toucher(BQ.x, BQ.y, C, LEGENDE - 0.012);
  ecran += toucher(BG.x, BG.y, C, AOUT - 0.008);
  ecran += toucher(SX + 111, SY + 75, C, ANNEE - 0.008);

  // La légende, par dessus le calendrier.
  const familles = [
    [t('Argent', 'Money'), [['🤑', t('Ton meilleur montant de l’année', 'Your best amount of the year')], ['💰', t('Plus de 100 €', 'Over €100')], ['💵', t('La soirée a rapporté quelque chose', 'The night brought something in')]]],
    [t('Note', 'Rating'), [['👑', t('La meilleure note du mois', 'The best rating of the month')], ['⭐', t('Un cinq sur cinq', 'A five out of five')]]],
    [t('Qui', 'Who'), [['✨', t('Une première fois avec cette personne', 'A first time with this person')], ['❤️', t('La cinquième fois avec la même', 'The fifth time with the same one')], ['🎂', t('Un an jour pour jour après', 'A year to the day after')]]],
    [t('Rythme', 'Rhythm'), [['🔥', t('Trois jours d’affilée', 'Three days in a row')]]],
  ];
  let leg = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${APP.fond}"/>
    <circle cx="${SX + 30}" cy="${SY + 40}" r="15" fill="#FFFFFF" fill-opacity="0.06"/>
    <path d="M${SX + 34} ${SY + 34} L${SX + 28} ${SY + 40} L${SX + 34} ${SY + 46}" fill="none" stroke="${APP.texte}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(SX + 18, SY + 92, t('Légende', 'Legend'), { taille: 26, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 18, SY + 114, t('Les signes du calendrier', 'The calendar signs'), { taille: 12, couleur: APP.second })}`;
  let y = SY + 146;
  familles.forEach(([nom, lignes]) => {
    leg += texte(SX + 18, y, nom.toUpperCase(), { taille: 9.5, couleur: APP.discret, poids: 800, extra: 'letter-spacing="1.4"' });
    y += 10;
    leg += `<rect x="${SX + 10}" y="${y}" width="${SL - 20}" height="${lignes.length * 30 + 6}" rx="14" fill="#FFFFFF" fill-opacity="0.045" stroke="${APP.bord}"/>`;
    lignes.forEach(([e, l], i) => {
      leg += emoji(SX + 32, y + 24 + i * 30, e, 14) + texte(SX + 50, y + 23 + i * 30, l, { taille: 10.5, couleur: APP.texte });
    });
    y += lignes.length * 30 + 28;
  });
  leg += toucher(SX + 30, SY + 40, C, RETOUR);
  ecran += entre(C, LEGENDE, RETOUR + 0.01, leg, 0.004);
  ecran += `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${APP.fond}" opacity="0">${fondu('opacity', C, [[0, 1], [0.012, 0], [FIN, 0], [1, 1]])}</rect>`;
  corps += T.ecran(ecran);

  // ------------------------------------------------ une case, quatre états
  const AX = 400, AL = 380, AY = 108;
  corps += rubrique(AX, AY, t('UNE CASE', 'ONE DAY'));
  corps += `<rect x="${AX}" y="${AY + 18}" width="${AL}" height="146" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const etats = [
    [(x, y) => texte(x, y + 5, '4', { taille: 14, couleur: APP.discret, poids: 600, ancre: 'middle' }), '', t('chiffre effacé', 'faded number'), t('rien ce jour-là', 'nothing that day')],
    [(x, y) => `<circle cx="${x}" cy="${y}" r="17" fill="url(#marque)"/>${texte(x, y + 5, '14', { taille: 14, couleur: '#12071F', poids: 800, ancre: 'middle' })}`, '🔥⚡🍆', t('disque violet', 'purple disc'), t('au moins une', 'at least one')],
    [(x, y) => `<circle cx="${x}" cy="${y}" r="17" fill="url(#orCal)"/>${texte(x, y + 5, '19', { taille: 14, couleur: '#12071F', poids: 800, ancre: 'middle' })}`, '💵🎂🌅', t('disque doré', 'golden disc'), t('ça a rapporté', 'it paid')],
    [(x, y) => `<circle cx="${x}" cy="${y}" r="17" fill="url(#orCal)"/><circle cx="${x}" cy="${y}" r="19" fill="none" stroke="#FFFFFF" stroke-width="2.5"/>${texte(x, y + 5, '23', { taille: 14, couleur: '#12071F', poids: 800, ancre: 'middle' })}`, '💵👑✨', t('cerclé de blanc', 'white ring'), t('la liste n’a que lui', 'list shows just it')],
  ];
  etats.forEach(([dessin, signes, l1, l2], i) => {
    const x = AX + 50 + i * 93, y = AY + 66;
    const s = dessin(x, y) + (signes ? emoji(x, y + 34, signes, 11) : '') +
      texte(x, y + 62, l1, { taille: 12, couleur: TITRE, poids: 700, ancre: 'middle' }) +
      texte(x, y + 79, l2, { taille: 11, couleur: TEXTE, ancre: 'middle' });
    // Le dernier état ne s'allume qu'une fois le jour touché.
    corps += i === 3
      ? `<g opacity="0.35">${fondu('opacity', C, [[0, 0.35], [TOUCHE, 0.35], [TOUCHE + 0.01, 1], [AOUT, 1], [AOUT + 0.01, 0.35], [1, 0.35]])}${s}</g>`
      : s;
  });

  // ------------------------------------------------ le tri des signes
  const BX = 820, BL = 400, BY = 108;
  corps += rubrique(BX, BY, t('LE TRI DES SIGNES', 'SORTING THE SIGNS'));
  corps += `<rect x="${BX}" y="${BY + 18}" width="${BL}" height="146" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  corps += entre(C, 0, TOUCHE + 0.01, texte(BX + BL / 2, BY + 96, t('Touche un jour : ses signes passent au tri.', 'Touch a day: its signs get sorted.'), { taille: 13, couleur: DISCRET, ancre: 'middle' }), 0.006);
  const calcules = ['🍑', '🌙', '✨', '💵', '🛏️', '👑'];
  const tries = [...calcules].sort((a, b) => rang(a) - rang(b));
  const pasB = 58, x0 = BX + 55;
  const TRI = TOUCHE + 0.06, GARDE = TRI + 0.06;
  let tri = texte(BX + 20, BY + 44, t('Mercredi 23 : six signes s’appliquent.', 'Wednesday 23: six signs apply.'), { taille: 13, couleur: TITRE, poids: 700 });
  calcules.forEach((e, i) => {
    const j = tries.indexOf(e), dx = (i - j) * pasB, xj = x0 + j * pasB;
    const garde = j < 3;
    tri += `<g opacity="1">${garde ? '' : fondu('opacity', C, [[0, 1], [GARDE, 1], [GARDE + 0.012, 0.3], [1, 0.3]])}
      <g>${glisse(C, [[0, `${dx} 0`], [TRI, `${dx} 0`], [TRI + 0.025, '0 0'], [1, '0 0']])}
        ${emoji(xj, BY + 88, e, 22)}
      </g>
      ${entre(C, TRI + 0.03, 1, texte(xj, BY + 112, `n° ${rang(e)}`, { taille: 10.5, couleur: garde ? ACCENT : DISCRET, police: MONO, poids: 700, ancre: 'middle' }), 0.006)}</g>`;
  });
  // Les deux crochets : trois sous le jour, deux sur la ligne de la liste.
  const crochet = (n, yy, couleur, s) => `<path d="M${x0 - 20} ${yy - 8} V${yy} H${x0 + (n - 1) * pasB + 20} V${yy - 8}" fill="none" stroke="${couleur}" stroke-width="1.6"/>
    ${texte(x0 + (n - 1) * pasB + 30, yy + 4, s, { taille: 11.5, couleur, poids: 700 })}`;
  tri += entre(C, GARDE, 1, crochet(3, BY + 128, ACCENT, t('sous le jour', 'under the day')), 0.006);
  tri += entre(C, GARDE + 0.025, 1, crochet(2, BY + 150, OR, t('sur la ligne de la liste', 'on the list row')), 0.006);
  corps += entre(C, TOUCHE + 0.01, FIN, tri, 0.006);

  // ------------------------------------------------ les vingt-cinq signes
  const GY = 294;
  corps += rubrique(400, GY, t('LES 25 SIGNES, ET LEUR RANG DE RARETÉ', 'THE 25 SIGNS, AND THEIR RARITY RANK'));
  corps += `<rect x="400" y="${GY + 18}" width="820" height="272" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const legende = [
    [t('ARGENT', 'MONEY'), [['🤑', t('meilleur de l’année', 'best of the year')], ['💰', t('plus de 100 €', 'over €100')], ['💵', t('a rapporté', 'it paid')]]],
    [t('NOTE', 'RATING'), [['👑', t('meilleure du mois', 'best of the month')], ['⭐', t('cinq sur cinq', 'five out of five')]]],
    [t('QUI', 'WHO'), [['✨', t('première fois', 'first time')], ['❤️', t('cinquième fois', 'fifth time')], ['🎂', t('un an, jour pour jour', 'a year to the day')]]],
    [t('RYTHME', 'RHYTHM'), [['🔥', t('trois jours d’affilée', 'three days running')], ['🏁', t('première de l’année', 'first of the year')], ['📅', t('jour le plus chargé', 'busiest day')]]],
    [t('HEURE', 'TIME'), [['🌙', t('toute la nuit', 'all night')], ['🌅', t('entre 6 h et 10 h', '6 am to 10 am')], ['🌃', t('entre minuit et 6 h', 'midnight to 6 am')], ['🕐', t('avant 18 h', 'before 6 pm')], ['⚡', t('« Rapide »', '“Quick”')]]],
    [t('LIEU', 'PLACE'), [['✈️', t('à plus de 200 km', 'over 200 km away')], ['🏖️', t('« En vacances »', '“On holiday”')], ['🚗', t('« Dans une voiture »', '“In a car”')], ['🌲', t('« Dehors »', '“Outdoors”')], ['🏠', t('« Chez moi »', '“My place”')], ['🛏️', t('« Chez lui », « elle »', '“His”, “her place”')]]],
    [t('RÔLE', 'ROLE'), [['🍆', t('actif', 'top')], ['🍑', t('passif', 'bottom')], ['♾️', t('versatile', 'versatile')]]],
  ];
  // Deux rangées : quatre familles de trois, puis l'heure, le lieu en
  // deux colonnes et le rôle.
  const places = [
    [420, GY + 50, 1], [620, GY + 50, 1], [820, GY + 50, 1], [1020, GY + 50, 1],
    [420, GY + 160, 1], [620, GY + 160, 2], [1020, GY + 160, 1],
  ];
  const PAS = 22;
  legende.forEach(([nom, lignes], f) => {
    const [fx, fy, cols] = places[f];
    const allume = LEGENDE + 0.012 + f * 0.018;
    corps += texte(fx, fy, nom, { taille: 11, couleur: DISCRET, police: MONO, poids: 700, extra: 'letter-spacing="1.5"' });
    corps += entre(C, allume, RETOUR + 0.01, texte(fx, fy, nom, { taille: 11, couleur: ACCENT, police: MONO, poids: 700, extra: 'letter-spacing="1.5"' }), 0.006);
    const parCol = Math.ceil(lignes.length / cols);
    lignes.forEach(([e, l], i) => {
      const x = fx + Math.floor(i / parCol) * 196, y = fy + 22 + (i % parCol) * PAS;
      // Les six candidats du 23 se signalent pendant le tri.
      if (calcules.includes(e)) {
        corps += entre(C, TOUCHE + 0.02, LEGENDE, `<rect x="${x - 8}" y="${y - 15}" width="186" height="21" rx="6" fill="${tries.indexOf(e) < 3 ? ACCENT : TEXTE}" fill-opacity="${tries.indexOf(e) < 3 ? 0.16 : 0.08}"/>`, 0.006);
      }
      corps += emoji(x + 7, y, e, 13) + texte(x + 22, y - 1, l, { taille: 11.5, couleur: TITRE }) +
        texte(x + 172, y - 1, String(rang(e)), { taille: 10.5, couleur: DISCRET, police: MONO, ancre: 'end' });
    });
  });

  // ------------------------------------------------ trois cartes du bas
  const bas = [
    [VERT, t('Rien à saisir en plus', 'Nothing extra to enter'), t('Note, montant, heure, étiquettes du soir,', 'Rating, amount, time, the night’s tags,'), t('rôle et ville : tout est déjà là.', 'role and city: it is all there.'), null],
    [VIOLET, t('Toujours six semaines', 'Always six weeks'), t('Août déborde sur six lignes, septembre non :', 'August spills onto six rows, September not:'), t('la grille ne saute pas quand on feuillette.', 'the grid never jumps as you flip.'), [AOUT, ANNEE]],
    [OR, t('Une année, un toucher', 'One year, one touch'), t('2025 s’ouvre sur son dernier mois plein,', '2025 opens on its last busy month,'), t('pas sur un janvier vide.', 'not on an empty January.'), [ANNEE, FIN]],
  ];
  bas.forEach(([c, titre, l1, l2, allume], i) => {
    const x = 400 + i * 280, y = 598;
    corps += `<rect x="${x}" y="${y}" width="260" height="86" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${allume ? `<rect x="${x}" y="${y}" width="260" height="86" rx="13" fill="none" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, allume[0], allume[1])}</rect>` : ''}
      ${texte(x + 20, y + 30, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 52, l1, { taille: 12 })}
      ${texte(x + 20, y + 70, l2, { taille: 12 })}`;
  });

  svg('calendrier.svg', 1280, 720, corps, t(
    'Le calendrier de BodyCount. Septembre 2026 se remplit sur sept colonnes : un jour vide n’est qu’un chiffre effacé, un jour plein porte un disque violet, doré quand la soirée a rapporté. Sous chaque disque, trois signes au plus. On touche le 23 : il se cercle de blanc et la liste ne montre plus que lui. Ses six signes, première fois, montant, meilleure note du mois, toute la nuit, chez lui, passif, sont triés par rareté : les trois premiers restent sous le jour, les deux premiers sur la ligne de la liste. La légende, ouverte par le point d’interrogation, donne les vingt-cinq signes en sept familles, argent, note, qui, rythme, heure, lieu et rôle, tous déduits de ce qui est déjà saisi. Puis août s’affiche, toujours sur six semaines, et un toucher sur 2025 ouvre décembre, son dernier mois plein.',
    'The BodyCount calendar. September 2026 fills in on seven columns: an empty day is only a faded number, a busy day carries a purple disc, golden when the night paid. Under each disc, three signs at most. Touching the 23rd rings it in white and the list shows only that day. Its six signs, first time, amount, best rating of the month, all night, his place, bottom, are sorted by rarity: the first three stay under the day, the first two on the list row. The legend, opened by the question mark, gives the twenty-five signs in seven families, money, rating, who, rhythm, time, place and role, all worked out from what is already entered. Then August shows, still on six weeks, and a touch on 2025 opens December, its last busy month.'));
};

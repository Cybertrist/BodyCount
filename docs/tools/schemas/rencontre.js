// Noter une rencontre, depuis la fiche : le formulaire se remplit champ
// par champ, puis un seul enregistrement remet à jour tout ce qui en
// dépend (rafraichir() dans lib/providers/donnees.dart).
//
// À gauche, le téléphone passe de la fiche d'Enzo au formulaire, puis
// revient sur la fiche à jour. Au milieu, les six champs se cochent ; à
// droite, les écrans que l'écriture fait relire s'allument un à un.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, paliers, fondu, visible, entre, glisse, telephone, toucher, frappe, visage,
    etoiles, pastille, largeurPastille, bouton, icone, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL,
    ACCENT, VIOLET, VERT, OR } = O;
  const C = 36;
  const FORM = 0.14, RETOUR = 0.705, FIN = 0.985;
  const SAUVE = 0.665;
  const enzo = GENS.enzo;
  let corps = entete(t('UNE RENCONTRE', 'AN ENCOUNTER'),
    t('Six champs, tous facultatifs sauf la date. Un seul enregistrement, et tout se remet à jour.',
      'Six fields, all optional except the date. One save, and everything catches up.'));

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  /// Un petit bouton rond posé sur la photo.
  const rond = (cx, cy, dessin) => `<circle cx="${cx}" cy="${cy}" r="14" fill="${APP.fond}" fill-opacity="0.55" stroke="#FFFFFF" stroke-opacity="0.18"/>${dessin}`;

  // La fiche d'Enzo, avant et après : seuls les chiffres, le rang et la
  // première rencontre changent.
  function fiche(apres) {
    const PH = 250;
    let s = `${visage(enzo.photo, SX, SY, SL, PH, 0)}
      <rect x="${SX}" y="${SY}" width="${SL}" height="${PH}" fill="url(#voile)"/>
      <rect x="${SX}" y="${SY + PH - 60}" width="${SL}" height="60" fill="${APP.fond}" fill-opacity="0.35"/>
      ${rond(SX + 26, SY + 30, `<path d="M${SX + 31} ${SY + 30} h-10 m4 -5 l-5 5 l5 5" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`)}
      ${rond(SX + SL - 26, SY + 30, `<path d="M${SX + SL - 31} ${SY + 35} l2 -5 l6 -6 l3 3 l-6 6 z" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/>`)}`;
    // Les pastilles : le rang, l'âge, la ville, le rôle, le genre.
    const rang = apres ? 'N°11' : 'N°12';
    let px = SX + 14;
    const rl = largeurPastille(rang, 9) + 10;
    s += `<rect x="${px}" y="${SY + 190}" width="${rl}" height="18" rx="9" fill="${APP.vert}"/>
      ${icone('etoile', px + 5, SY + 194, '#062A12', 0.62)}
      ${texte(px + 16 + (rl - 16) / 2, SY + 202.5, rang, { taille: 9, couleur: '#062A12', poids: 800, ancre: 'middle' })}`;
    if (apres) s += `<rect x="${px - 3}" y="${SY + 187}" width="${rl + 6}" height="24" rx="12" fill="none" stroke="${APP.vert}" stroke-width="1.5" opacity="0">${visible(C, RETOUR + 0.02, RETOUR + 0.1)}</rect>`;
    px += rl + 5;
    for (const e of [t('23 ans', '23'), 'Vannes', 'Versatile', t('Homme', 'Man')]) {
      const l = largeurPastille(e, 9);
      if (px + l > SX + SL - 10) continue;
      s += `<rect x="${px}" y="${SY + 190}" width="${l}" height="18" rx="9" fill="${APP.fond}" fill-opacity="0.6" stroke="#FFFFFF" stroke-opacity="0.15"/>
        ${texte(px + l / 2, SY + 202.5, e, { taille: 9, couleur: APP.texte, poids: 600, ancre: 'middle' })}`;
      px += l + 5;
    }
    s += texte(SX + 14, SY + 240, enzo.prenom, { taille: 28, couleur: '#FFFFFF', poids: 800, extra: 'letter-spacing="-0.6"' });
    // Les trois chiffres.
    const cy = SY + 286;
    const col = (i) => SX + 16 + i * ((SL - 32) / 3);
    s += `<line x1="${col(1) - 8}" y1="${cy - 24}" x2="${col(1) - 8}" y2="${cy + 16}" stroke="${APP.bord}"/>
      <line x1="${col(2) - 8}" y1="${cy - 24}" x2="${col(2) - 8}" y2="${cy + 16}" stroke="${APP.bord}"/>
      ${texte(col(0), cy, apres ? '3,9' : '3,8', { taille: 24, couleur: '#E9D5FF', poids: 800 })}
      ${etoiles(col(0), cy + 16, 8, { taille: 9 })}
      ${texte(col(1), cy, apres ? '8' : '7', { taille: 24, couleur: APP.texte, poids: 800 })}
      ${texte(col(1), cy + 15, t('FOIS', 'TIMES'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      <text x="${col(2)}" y="${cy}" font-family="${O.SANS}" font-size="24" font-weight="800" fill="${APP.texte}">347<tspan font-size="13" fill="${APP.second}"> ${t('j', 'd')}</tspan></text>
      ${texte(col(2), cy + 15, t('DEPUIS', 'SINCE'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}`;
    if (apres) {
      s += `<rect x="${col(0) - 6}" y="${cy - 28}" width="${col(2) - col(0) - 8}" height="50" rx="10" fill="none" stroke="${ACCENT}" stroke-width="1.5" opacity="0">${visible(C, RETOUR + 0.02, RETOUR + 0.1)}</rect>`;
    }
    // Les étiquettes de la fiche.
    s += texte(SX + 14, SY + 336, t('ÉTIQUETTES', 'TAGS'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' });
    s += texte(SX + SL - 14, SY + 336, t('Modifier', 'Edit'), { taille: 9, couleur: APP.violet, poids: 700, ancre: 'end' });
    px = SX + 14;
    [[t('Bronzé', 'Tanned'), true], [t('Moustache', 'Moustache'), true], [t('Bavard', 'Chatty'), false], [t('Embrasse bien', 'Good kisser'), false]].forEach(([e, plein]) => {
      const l = largeurPastille(e, 9);
      if (px + l > SX + SL - 10) return;
      s += pastille(px, SY + 344, e, { plein, taille: 9, h: 20 });
      px += l + 5;
    });
    // Les rencontres.
    const n = apres ? 8 : 7;
    s += texte(SX + 14, SY + 392, t(`RENCONTRES · ${n}`, `ENCOUNTERS · ${n}`), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' });
    s += texte(SX + SL - 14, SY + 392, t('Ajouter', 'Add'), { taille: 9, couleur: APP.violet, poids: 700, ancre: 'end' });
    const ligne = (y, jour, detail, note, neuve) => `
      <rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="42" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${neuve ? `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="42" rx="12" fill="none" stroke="${ACCENT}" stroke-width="1.5" opacity="0">${visible(C, RETOUR + 0.03, FIN - 0.02)}</rect>` : ''}
      ${texte(SX + 24, y + 18, jour, { taille: 11.5, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 24, y + 33, detail, { taille: 9, couleur: APP.second })}
      ${etoiles(SX + SL - 88, y + 25, note, { taille: 9 })}
      <path d="M${SX + SL - 29} ${y + 16} l4 5 l-4 5" fill="none" stroke="${APP.second}" stroke-width="1.5" stroke-linecap="round"/>`;
    if (apres) {
      s += ligne(SY + 402, t('26 sept.', '26 Sept.'), t('22h40  Auray', '22:40  Auray'), 9, true);
      s += ligne(SY + 450, t('14 sept.', '14 Sept.'), t('22h22  Auray', '22:22  Auray'), 7, false);
    } else {
      s += ligne(SY + 402, t('14 sept.', '14 Sept.'), t('22h22  Auray', '22:22  Auray'), 7, false);
      s += ligne(SY + 450, t('2 sept.', '2 Sept.'), t('23h05  Vannes', '23:05  Vannes'), 8, false);
    }
    // La barre du bas : appeler, et la nouvelle rencontre.
    s += `<rect x="${SX}" y="${SY + SH - 62}" width="${SL}" height="62" fill="${APP.fond}"/>
      <rect x="${SX + 12}" y="${SY + SH - 52}" width="42" height="40" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
      <path d="M${SX + 27} ${SY + SH - 40} c-1 5 3 11 9 13 l3 -3 l-3.5 -3 l-2 1.5 c-2 -1 -3.5 -3 -4 -5 l1.5 -2 l-3 -3.5 z" fill="none" stroke="${APP.violet}" stroke-width="1.4" stroke-linejoin="round"/>
      ${bouton(SX + 62, SY + SH - 52, SL - 74, 40, t('+  Nouvelle rencontre', '+  New encounter'), { taille: 12.5 })}`;
    return s;
  }
  ecran += entre(C, 0, FORM, fiche(false) + toucher(SX + 62 + (SL - 74) / 2, SY + SH - 32, C, 0.1), 0.006);
  ecran += entre(C, RETOUR, FIN, fiche(true), 0.006);

  // ------------------------------------------------------------ le formulaire
  // Les instants où chaque champ se remplit.
  const LIEU = [0.19, 0.24], ARGENT = [0.275, 0.3], DEFILE = [0.33, 0.37], NOTE = 0.4,
    CHIPS = [0.455, 0.5], CARNET = [0.54, 0.62];
  const D = 222; // le défilement, en points
  const HAUT = SY + 54, BAS = SY + SH - 64;
  // Un champ de saisie, avec son indice et son pictogramme.
  const champ = (y, h, ic, indice) => `
    <rect x="${SX + 14}" y="${y}" width="${SL - 28}" height="${h}" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
    ${ic ? icone(ic, SX + 26, y + h / 2 - 8, ic === 'euro' ? APP.or : APP.second, 1) : ''}
    ${indice}`;
  const legende = (y, s) => texte(SX + 16, y, s, { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' });
  const y0 = SY + 62;
  let f = '';
  // Le bandeau : la photo, le prénom, la prochaine fois.
  f += `<rect x="${SX + 14}" y="${y0}" width="${SL - 28}" height="60" rx="18" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
    ${visage(enzo.photo, SX + 21, y0 + 7, 46, 46, 13)}
    ${texte(SX + 78, y0 + 27, enzo.prenom, { taille: 16, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 78, y0 + 44, t('8e fois · la dernière il y a 1 semaine', '8th time · the last one 1 week ago'), { taille: 9.5, couleur: APP.second, poids: 600 })}`;
  // La date et l'heure, déjà à maintenant.
  const moitie = (SL - 38) / 2;
  [[t('DATE', 'DATE'), t('26 sept.', '26 Sept.'), 'calendrier'], [t('HEURE', 'TIME'), t('22h40', '22:40'), 'horloge']].forEach(([l, v, ic], i) => {
    const x = SX + 14 + i * (moitie + 10);
    f += `<rect x="${x}" y="${y0 + 72}" width="${moitie}" height="46" rx="16" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
      ${icone(ic, x + 11, y0 + 87, APP.etoile, 0.95)}
      ${texte(x + 34, y0 + 90, l, { taille: 8, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}
      ${texte(x + 34, y0 + 106, v, { taille: 13, couleur: APP.texte, poids: 800 })}`;
  });
  f += `<rect x="${SX + 12}" y="${y0 + 70}" width="${SL - 24}" height="50" rx="17" fill="none" stroke="${ACCENT}" stroke-width="1.5" opacity="0">${visible(C, 0.165, 0.2)}</rect>`;
  // Où.
  f += legende(y0 + 140, t('OÙ', 'WHERE'));
  f += champ(y0 + 148, 40, 'epingle',
    entre(C, 0, LIEU[0], texte(SX + 48, y0 + 172, t('Chez lui, Vannes, Le Fébrile…', 'His place, Vannes, Le Fébrile…'), { taille: 11, couleur: APP.discret }), 0.004) +
    `<g opacity="0">${visible(C, LIEU[0], FIN, 0.004)}${frappe(SX + 48, y0 + 172, 'Auray', C, LIEU[0] + 0.01, LIEU[1], { taille: 12.5, couleur: APP.texte, poids: 600 })}</g>`);
  f += texte(SX + 16, y0 + 208, t('Pas de point précis', 'No exact spot'), { taille: 9.5, couleur: APP.second });
  f += texte(SX + SL - 16, y0 + 208, t('Placer sur la carte', 'Place on the map'), { taille: 9.5, couleur: APP.violet, poids: 700, ancre: 'end' });
  // Ce que ça a rapporté.
  f += legende(y0 + 236, t('CE QUE ÇA A RAPPORTÉ', 'WHAT IT BROUGHT IN'));
  f += champ(y0 + 244, 40, 'euro',
    entre(C, 0, ARGENT[0], texte(SX + 48, y0 + 268, t('Rien, ou 100', 'Nothing, or 100'), { taille: 11, couleur: APP.discret }), 0.004) +
    `<g opacity="0">${visible(C, ARGENT[0], FIN, 0.004)}${frappe(SX + 48, y0 + 268, '50', C, ARGENT[0] + 0.008, ARGENT[1], { taille: 12.5, couleur: APP.texte, poids: 600 })}</g>` +
    texte(SX + SL - 28, y0 + 269, '€', { taille: 14, couleur: APP.or, poids: 800, ancre: 'end' }));
  // Ta note : le chiffre en grand, puis les étoiles.
  f += legende(y0 + 306, t('TA NOTE', 'YOUR RATING'));
  f += `<rect x="${SX + 14}" y="${y0 + 314}" width="${SL - 28}" height="96" rx="20" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>`;
  const avantNote = (s) => entre(C, 0, NOTE, s, 0.003);
  const apresNote = (s) => `<g opacity="0">${visible(C, NOTE, FIN, 0.003)}${s}</g>`;
  const grand = (v) => `<text x="${SX + 30}" y="${y0 + 354}" font-family="${O.SANS}" font-size="34" font-weight="800" fill="${APP.texte}" letter-spacing="-1.2">${v}<tspan font-size="11" fill="${APP.discret}" letter-spacing="0">  ${t('sur 5', 'out of 5')}</tspan></text>`;
  f += avantNote(grand('3,5')) + apresNote(grand('4,5'));
  const pasE = (SL - 60) / 5;
  const etoilesForm = (n) => etoiles(SX + 30 + (pasE - 26) / 2, y0 + 396, n, { taille: 26, pas: pasE, couleur: APP.fuchsia, vide: '#2A2140' });
  f += avantNote(etoilesForm(7)) + apresNote(etoilesForm(9));
  // Cette fois là : les étiquettes de la soirée.
  f += legende(y0 + 432, t('CETTE FOIS LÀ', 'THAT TIME'));
  let cx = SX + 14;
  const chips = [[t('Chez lui', 'His place'), CHIPS[0]], [t('Toute la nuit', 'All night'), CHIPS[1]], [t('Dehors', 'Outside'), null]];
  const posChips = [];
  chips.forEach(([e, quand]) => {
    const l = largeurPastille(e, 10);
    posChips.push(cx + l / 2);
    f += pastille(cx, y0 + 440, e, { taille: 10, h: 26 });
    if (quand) f += `<g opacity="0">${visible(C, quand, FIN, 0.003)}${pastille(cx, y0 + 440, e, { plein: true, taille: 10, h: 26 })}</g>`;
    cx += l + 6;
  });
  // Une note ?
  f += legende(y0 + 492, t('UNE NOTE ?', 'A NOTE?'));
  f += champ(y0 + 500, 62, null,
    entre(C, 0, CARNET[0], texte(SX + 28, y0 + 522, t('Ce que tu veux retenir de cette fois là…', 'What you want to remember about this time…'), { taille: 10, couleur: APP.discret }), 0.004) +
    `<g opacity="0">${visible(C, CARNET[0], FIN, 0.004)}
      ${frappe(SX + 28, y0 + 522, t('Terrasse à Auray, puis chez lui.', 'Terrace in Auray, then his place.'), C, CARNET[0] + 0.01, CARNET[0] + 0.045, { taille: 10.5, couleur: APP.texte })}
      ${frappe(SX + 28, y0 + 540, t('Bavard jusqu’au bout.', 'Chatty to the very end.'), C, CARNET[0] + 0.05, CARNET[1], { taille: 10.5, couleur: APP.texte })}</g>`);

  // Le contenu défile une fois, entre le montant et la note.
  const clip = O.id('formulaire');
  let form = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${APP.fond}"/>
    <clipPath id="${clip}"><rect x="${SX}" y="${HAUT}" width="${SL}" height="${BAS - HAUT}"/></clipPath>
    <g clip-path="url(#${clip})"><g>${glisse(C, [[0, '0 0'], [DEFILE[0], '0 0'], [DEFILE[1], `0 ${-D}`], [1, `0 ${-D}`]])}${f}</g></g>
    <path d="M${SX + 18} ${SY + 30} l10 10 m0 -10 l-10 10" stroke="${APP.texte}" stroke-width="1.8" stroke-linecap="round"/>
    ${texte(SX + 44, SY + 40, t('Nouvelle rencontre', 'New encounter'), { taille: 16, couleur: APP.texte, poids: 800 })}
    <rect x="${SX}" y="${BAS}" width="${SL}" height="${SY + SH - BAS}" fill="${APP.fond}"/>
    ${bouton(SX + 20, SY + SH - 54, SL - 40, 42, t('Enregistrer', 'Save'), { taille: 13.5 })}`;
  // Les touchers, aux coordonnées de l'écran, défilement compris.
  form += toucher(SX + 150, y0 + 168, C, LIEU[0]);
  form += toucher(SX + 150, y0 + 264, C, ARGENT[0]);
  form += `<g>${fondu('opacity', C, [[0, 0], [DEFILE[0] - 0.01, 0], [DEFILE[0], 0.9], [DEFILE[1], 0.9], [DEFILE[1] + 0.01, 0], [1, 0]])}
    <circle cx="${SX + SL / 2}" r="12" fill="#FFFFFF" fill-opacity="0.28" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.5">
      ${fondu('cy', C, [[0, y0 + 420], [DEFILE[0], y0 + 420], [DEFILE[1], y0 + 420 - D], [1, y0 + 420 - D]])}</circle></g>`;
  // Moitié gauche de la cinquième étoile : un demi-point.
  form += toucher(SX + 30 + 4 * pasE + pasE * 0.3, y0 + 384 - D, C, NOTE);
  form += toucher(posChips[0], y0 + 453 - D, C, CHIPS[0]);
  form += toucher(posChips[1], y0 + 453 - D, C, CHIPS[1]);
  form += toucher(SX + 150, y0 + 530 - D, C, CARNET[0]);
  form += toucher(SX + SL / 2, SY + SH - 33, C, SAUVE);
  ecran += entre(C, FORM, RETOUR, form, 0.006);
  corps += T.ecran(ecran);

  // ------------------------------------------------ les six champs
  const FX = 390, FL = 400, FY = 108;
  corps += rubrique(FX, FY, t('CE QUE TU SAISIS', 'WHAT YOU ENTER'));
  const champs = [
    ['calendrier', t('Date et heure', 'Date and time'), t('maintenant, sauf si tu changes', 'now, unless you change it'), 0.18],
    ['epingle', t('Où', 'Where'), t('un texte libre, et un point sur la carte', 'free text, and a pin on the map'), LIEU[1]],
    ['euro', t('Ce que ça a rapporté', 'What it brought in'), t('vide, c’est rien : pas une fois à 0 €', 'empty means nothing, not a €0 time'), ARGENT[1]],
    ['etoile', t('Ta note', 'Your rating'), t('par demi-point : la moitié d’une étoile', 'by half points: half a star'), NOTE + 0.01],
    ['cle', t('Cette fois là', 'That time'), t('les étiquettes du soir, pas de la fiche', 'tags for the night, not the person'), CHIPS[1] + 0.005],
    ['fichier', t('Une note ?', 'A note?'), t('au carnet, datée, liée à ce soir-là', 'into the notebook, dated, tied to that night'), CARNET[1]],
  ];
  champs.forEach(([ic, titre, sous, fait], i) => {
    const y = FY + 18 + i * 70;
    corps += `<rect x="${FX}" y="${y}" width="${FL}" height="60" rx="12" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${FX}" y="${y}" width="${FL}" height="60" rx="12" fill="none" stroke="${ACCENT}" stroke-opacity="0.55" opacity="0">${visible(C, fait, FIN)}</rect>
      <rect x="${FX + 14}" y="${y + 14}" width="32" height="32" rx="9" fill="${FIL}" fill-opacity="0.5"/>
      <g opacity="0.4">${icone(ic, FX + 22, y + 22, TEXTE)}</g>
      <g opacity="0">${visible(C, fait, FIN)}
        <rect x="${FX + 14}" y="${y + 14}" width="32" height="32" rx="9" fill="${ACCENT}" fill-opacity="0.14" stroke="${ACCENT}" stroke-opacity="0.5"/>
        ${icone(ic, FX + 22, y + 22, ACCENT)}
        <circle cx="${FX + FL - 26}" cy="${y + 30}" r="10" fill="${ACCENT}"/>
        ${icone('coche', FX + FL - 32.5, y + 23.5, '#1A0B24', 0.82)}
      </g>
      <circle cx="${FX + FL - 26}" cy="${y + 30}" r="10" fill="none" stroke="${FIL}" stroke-width="1.5" opacity="1">${paliers('opacity', C, [[0, 1], [fait, 0], [FIN, 1]])}</circle>
      ${texte(FX + 60, y + 26, titre, { taille: 13.5, couleur: TITRE, poids: 700 })}
      ${texte(FX + 60, y + 44, sous, { taille: 11.5 })}`;
  });

  // ------------------------------------------------ ce qui se remet à jour
  const RX = 830, RL = 390, RY = 108;
  corps += rubrique(RX, RY, t('UNE ÉCRITURE, TOUT SE RELIT', 'ONE WRITE, EVERYTHING RELOADS'));
  // Le nœud d'où tout part.
  const NY = RY + 18;
  corps += `<rect x="${RX}" y="${NY}" width="${RL}" height="52" rx="12" fill="${CARTE}" stroke="${BORD}"/>
    <rect x="${RX}" y="${NY}" width="${RL}" height="52" rx="12" fill="none" stroke="${VIOLET}" stroke-width="1.8" opacity="0" filter="url(#halo)">${visible(C, SAUVE, SAUVE + 0.06)}</rect>
    ${texte(RX + 18, NY + 23, 'rafraichir()', { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(RX + 18, NY + 41, t('appelée par chaque enregistrement, sans exception', 'called by every save, without exception'), { taille: 11.5 })}`;
  const cibles = [
    [t('La fiche', 'The card'), t('7 fois → 8 fois, note 3,8 → 3,9', '7 times → 8 times, rating 3.8 → 3.9'), ACCENT],
    [t('Le rang', 'The rank'), t('N°12 → N°11 au classement des moyennes', 'No. 12 → No. 11 in the average ranking'), VERT],
    [t('Le répertoire', 'The people list'), t('la carte d’Enzo passe à « 8 fois »', 'Enzo’s card now says “8 times”'), VIOLET],
    [t('Les statistiques', 'The statistics'), t('2026 : 78 → 79 rencontres', '2026: 78 → 79 encounters'), OR],
    [t('Le calendrier', 'The calendar'), t('le 26 septembre prend ses signes', '26 September gets its marks'), VIOLET],
    [t('La carte et le carnet', 'The map and the notebook'), t('Auray, et la note datée du soir', 'Auray, and the dated note of the night'), ACCENT],
  ];
  const X0 = RX + 22, CY0 = NY + 76;
  corps += `<line x1="${X0}" y1="${NY + 52}" x2="${X0}" y2="${CY0 + 5 * 58 + 24}" stroke="${FIL}" stroke-width="1.8"/>`;
  cibles.forEach(([titre, sous, c], i) => {
    const y = CY0 + i * 58, a = SAUVE + 0.012 + i * 0.012;
    const long = 22;
    corps += `<path d="M${X0} ${y + 24} H${X0 + long}" stroke="${FIL}" stroke-width="1.8"/>
      <circle r="4" fill="#FFFFFF" opacity="0">
        <animateMotion dur="${C}s" repeatCount="indefinite" path="M${X0} ${NY + 52} V${y + 24} H${X0 + long}" keyPoints="0;0;1;1" keyTimes="0;${(a - 0.03).toFixed(4)};${a.toFixed(4)};1" calcMode="linear"/>
        ${fondu('opacity', C, [[0, 0], [a - 0.031, 0], [a - 0.03, 1], [a, 1], [a + 0.002, 0], [1, 0]])}
      </circle>
      <rect x="${X0 + long}" y="${y}" width="${RL - 44}" height="48" rx="11" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${X0 + long}" y="${y}" width="${RL - 44}" height="48" rx="11" fill="none" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, a, FIN)}</rect>
      ${texte(X0 + long + 16, y + 20, titre, { taille: 13, couleur: TITRE, poids: 700 })}
      ${entre(C, 0, a, texte(X0 + long + 16, y + 37, t('en attente', 'waiting'), { taille: 11, couleur: DISCRET, police: MONO }), 0.003)}
      ${entre(C, a, FIN, texte(X0 + long + 16, y + 37, sous, { taille: 11.5, couleur: TEXTE }), 0.003)}`;
  });

  // ------------------------------------------------ la carte du bas
  const BY = 574;
  corps += `<rect x="390" y="${BY}" width="830" height="84" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    ${texte(410, BY + 32, t('Rien n’est définitif', 'Nothing is final'), { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(410, BY + 54, t('Une rencontre se reprend ou se supprime. Supprimée, elle quitte les statistiques, la carte et le calendrier ;', 'An encounter can be edited or deleted. Once deleted, it leaves the statistics, the map and the calendar;'), { taille: 12.5 })}
    ${texte(410, BY + 72, t('les notes écrites ce soir-là restent sur la fiche.', 'the notes written that night stay on the card.'), { taille: 12.5 })}`;

  svg('rencontre.svg', 1280, 720, corps, t(
    'Noter une rencontre. Depuis la fiche d’Enzo, Nouvelle rencontre ouvre le formulaire : la date et l’heure sont déjà à maintenant, le lieu se tape, Auray, avec un point sur la carte si l’on veut ; le montant reste vide pour rien, ici 50 € ; la note se donne par demi-point en touchant la moitié d’une étoile, 4,5 sur 5 ; les étiquettes Chez lui et Toute la nuit décrivent cette fois-là ; une note part au carnet, datée et liée à la rencontre. Enregistrer appelle rafraichir(), qui fait relire la fiche (8 fois, note 3,9), le rang (N°12 devient N°11), le répertoire, les statistiques de l’année, le calendrier, la carte et le carnet. Une rencontre se reprend ou se supprime ; supprimée, elle quitte les statistiques, la carte et le calendrier, ses notes restent.',
    'Logging an encounter. From Enzo’s card, New encounter opens the form: the date and time are already set to now, the place is typed, Auray, with a pin on the map if you want; the amount stays empty for nothing, here €50; the rating is given in half points by touching half a star, 4.5 out of 5; the tags His place and All night describe that time; a note goes into the notebook, dated and tied to the encounter. Save calls rafraichir(), which reloads the card (8 times, rating 3.9), the rank (No. 12 becomes No. 11), the people list, the year’s statistics, the calendar, the map and the notebook. An encounter can be edited or deleted; once deleted, it leaves the statistics, the map and the calendar, its notes stay.'));
};

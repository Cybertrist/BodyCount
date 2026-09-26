// Sans Internet : le mur que tient Android, et les quatre portes.
//
// À gauche, le téléphone rejoue les quatre sorties, chacune sur un
// toucher : Y aller et Appeler depuis la fiche d'Enzo (lib/ecrans/
// fiche.dart, geo: et tel:), Exporter depuis les réglages (le sélecteur
// du système), Télécharger depuis la visionneuse (Medias.versGalerie).
// En haut à droite, ce que d'autres applications enverraient d'elles
// mêmes s'écrase sur le mur : sans la permission INTERNET, Android
// refuse d'ouvrir la connexion. Dessous, les quatre portes s'allument à
// mesure que le téléphone les ouvre.
module.exports = (O) => {
  const { t, id, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, visage, icone, bouton, etoiles,
    APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU } = O;
  const C = 34;
  let corps = entete(t('SANS INTERNET', 'NO INTERNET'),
    t('Pas de permission INTERNET : Android refuse toute connexion. Il reste quatre portes, chacune sur un toucher.',
      'No INTERNET permission: Android refuses every connection. Four doors remain, each opened by a touch.'));

  // Les quatre phases du téléphone : [début, fin].
  const PH = [[0, 0.25], [0.25, 0.47], [0.47, 0.73], [0.73, 0.985]];

  // Quelques pictogrammes de plus, au trait, dans un carré de 16.
  const combine = (c) => `<g transform="scale(0.6667)">${O.ICONES_APP.call(c)}</g>`;
  const direction = (c) => `<g transform="scale(0.6667)">${O.ICONES_APP.directions(c)}</g>`;
  const maison = (c) => `<g transform="scale(0.6667)">${O.ICONES_APP.home(c)}</g>`;
  const partage = (c) => `<g transform="scale(0.6667)">${O.ICONES_APP.ios_share(c)}</g>`;
  const dossier = (c) => `<g transform="scale(0.6667)">${O.ICONES_APP.save_alt(c)}</g>`;
  const globe = (c) => `<circle cx="8" cy="8" r="6.3" fill="none" stroke="${c}" stroke-width="1.4"/><ellipse cx="8" cy="8" rx="2.8" ry="6.3" fill="none" stroke="${c}" stroke-width="1.2"/><path d="M1.8 8 H14.2 M3 4.6 H13 M3 11.4 H13" stroke="${c}" stroke-width="1.1"/>`;
  const picto = (f, x, y, c, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${f(c)}</g>`;

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // Une feuille qui monte du bas de l'écran.
  const feuille = (h, contenu) => `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
    <rect x="${SX}" y="${SY + SH - h}" width="${SL}" height="${h + 20}" rx="22" fill="${APP.carte}"/>
    <rect x="${SX + SL / 2 - 18}" y="${SY + SH - h + 9}" width="36" height="4" rx="2" fill="${APP.bord}"/>${contenu}`;
  // Un bandeau en bas de l'écran, comme une SnackBar.
  const bandeau = (l1, l2 = '') => `<rect x="${SX + 12}" y="${SY + SH - (l2 ? 74 : 58)}" width="${SL - 24}" height="${l2 ? 58 : 42}" rx="10" fill="#2E2640"/>
    ${texte(SX + 26, SY + SH - (l2 ? 49 : 32), l1, { taille: 11.5, couleur: APP.texte })}
    ${l2 ? texte(SX + 26, SY + SH - 31, l2, { taille: 11.5, couleur: APP.texte }) : ''}`;

  // La fiche d'Enzo, bas de page : les deux ronds et Nouvelle rencontre.
  const fiche = () => {
    let s = visage(12, SX, SY, SL, 300, 0);
    s += `<rect x="${SX}" y="${SY}" width="${SL}" height="300" fill="url(#voile)"/>
      <circle cx="${SX + 26}" cy="${SY + 28}" r="15" fill="${APP.fond}" fill-opacity="0.6"/>
      <path d="M${SX + 31} ${SY + 28} h-10 m4 -5 l-5 5 l5 5" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    let px = SX + 16;
    for (const [lib, vert] of [['N°12', true], [t('23 ans', '23 y.o.'), false], ['Vannes', false]]) {
      const l = lib.length * 6.2 + 18;
      s += `<rect x="${px}" y="${SY + 238}" width="${l}" height="20" rx="10" fill="${vert ? APP.vert : APP.fond}" fill-opacity="${vert ? 1 : 0.7}"/>
        ${texte(px + l / 2, SY + 252, lib, { taille: 10, couleur: vert ? '#04210F' : APP.texte, poids: 700, ancre: 'middle' })}`;
      px += l + 6;
    }
    s += texte(SX + 16, SY + 290, 'Enzo P.', { taille: 28, couleur: '#FFFFFF', poids: 800 });
    // Les trois chiffres.
    [['3,8', ''], ['7', t('FOIS', 'TIMES')], ['347 j', t('DEPUIS', 'SINCE')]].forEach(([v, l], i) => {
      const x = SX + 16 + i * 86;
      s += texte(x, SY + 330, v, { taille: 19, couleur: APP.texte, poids: 800 });
      s += i === 0 ? etoiles(x, SY + 347, 8, { taille: 8 }) : texte(x, SY + 346, l, { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' });
    });
    // Les infos : le numéro et l'adresse.
    s += texte(SX + 16, SY + 380, 'INFOS', { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.6"' });
    [[combine, t('Téléphone', 'Phone'), '07 15 93 62 08'], [maison, t('Adresse', 'Address'), 'Place des Lices, Vannes']].forEach(([f, l, v], i) => {
      const y = SY + 390 + i * 44;
      s += `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="38" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
        ${picto(f, SX + 22, y + 11, APP.second, 1)}
        ${texte(SX + 46, y + 23.5, l, { taille: 10.5, couleur: APP.second })}
        ${texte(SX + SL - 24, y + 23.5, v, { taille: 10.5, couleur: APP.texte, poids: 700, ancre: 'end' })}`;
    });
    // Le bas : Appeler, Y aller, Nouvelle rencontre.
    const yb = SY + SH - 62;
    for (const [i, f] of [[0, combine], [1, direction]]) {
      s += `<circle cx="${SX + 36 + i * 52}" cy="${yb + 22}" r="21" fill="${APP.carte}" stroke="${APP.bord}"/>${picto(f, SX + 28 + i * 52, yb + 14, APP.etoile)}`;
    }
    s += bouton(SX + 116, yb, SL - 130, 44, t('+ Nouvelle rencontre', '+ New encounter'), { taille: 12 });
    return s;
  };
  const APPELER = [SX + 36, SY + SH - 40], YALLER = [SX + 88, SY + SH - 40];

  // 1. Y aller : Android demande avec quoi ouvrir, puis l'appli de cartes.
  const [a1, b1] = PH[0];
  ecran += entre(C, a1, b1, `${fiche()}${toucher(...YALLER, C, 0.07)}
    ${entre(C, 0.09, 0.17, feuille(230, `
      ${texte(SX + 20, SY + SH - 190, t('Ouvrir avec', 'Open with'), { taille: 15, couleur: APP.texte, poids: 700 })}
      ${texte(SX + 20, SY + SH - 170, 'geo:0,0?q=Place%20des%20Lices…', { taille: 9.5, couleur: APP.second, police: MONO })}
      ${['Google Maps', 'Organic Maps', 'Waze'].map((n, i) => `
        <rect x="${SX + 20}" y="${SY + SH - 150 + i * 44}" width="30" height="30" rx="8" fill="${['#34A853', '#2E7D32', '#33CCFF'][i]}" fill-opacity="0.85"/>
        ${texte(SX + 62, SY + SH - 130 + i * 44, n, { taille: 12.5, couleur: APP.texte })}`).join('')}
      ${toucher(SX + 100, SY + SH - 91, C, 0.14)}`), 0.004)}
    ${entre(C, 0.17, b1, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#1E2A22"/>
      ${[...Array(9)].map((_, i) => `<path d="M${SX - 20} ${SY + 60 + i * 62} L${SX + SL + 20} ${SY + 20 + i * 70}" stroke="#2B3A30" stroke-width="${i % 3 ? 3 : 7}"/>`).join('')}
      ${[...Array(5)].map((_, i) => `<path d="M${SX + 30 + i * 60} ${SY} L${SX + 10 + i * 64} ${SY + SH}" stroke="#2B3A30" stroke-width="${i % 2 ? 3 : 6}"/>`).join('')}
      <path d="M${SX + 70} ${SY + 470} C${SX + 90} ${SY + 380} ${SX + 190} ${SY + 360} ${SX + 170} ${SY + 250} S${SX + 150} ${SY + 170} ${SX + 190} ${SY + 140}" fill="none" stroke="#4C8DF6" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${SX + 70}" cy="${SY + 470}" r="8" fill="#4C8DF6" stroke="#FFFFFF" stroke-width="2.5"/>
      <path d="M${SX + 190} ${SY + 140} c0 0 -12 -14 -12 -22 a12 12 0 0 1 24 0 c0 8 -12 22 -12 22 z" fill="#EA4335"/>
      <rect x="${SX + 12}" y="${SY + 16}" width="${SL - 24}" height="40" rx="20" fill="#FFFFFF"/>
      ${texte(SX + 30, SY + 41, 'Place des Lices, Vannes', { taille: 12.5, couleur: '#202124', poids: 600 })}
      <rect x="${SX}" y="${SY + SH - 90}" width="${SL}" height="90" fill="#FFFFFF"/>
      ${texte(SX + 20, SY + SH - 58, t('8 min', '8 min'), { taille: 18, couleur: '#188038', poids: 700 })}
      ${texte(SX + 20, SY + SH - 36, t('Une autre appli : elle sait où tu vas.', 'Another app: it knows where you are going.'), { taille: 10.5, couleur: '#5F6368' })}`, 0.004)}`, 0.006);

  // 2. Appeler : le composeur du téléphone reprend le numéro.
  const [a2, b2] = PH[1];
  ecran += entre(C, a2, b2, `${fiche()}${toucher(...APPELER, C, 0.29)}
    ${entre(C, 0.31, b2, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#111317"/>
      ${texte(SX + SL / 2, SY + 110, '07 15 93 62 08', { taille: 26, couleur: '#E8EAED', ancre: 'middle' })}
      ${texte(SX + SL / 2, SY + 138, t('tel:0715936208', 'tel:0715936208'), { taille: 10, couleur: '#80868B', police: MONO, ancre: 'middle' })}
      ${['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k, i) =>
        texte(SX + 60 + (i % 3) * 75, SY + 208 + Math.floor(i / 3) * 62, k, { taille: 24, couleur: '#E8EAED', ancre: 'middle' })).join('')}
      <circle cx="${SX + SL / 2}" cy="${SY + 470}" r="30" fill="#1E8E3E"/>
      ${picto(combine, SX + SL / 2 - 12, SY + 458, '#FFFFFF', 1.5)}
      ${texte(SX + SL / 2, SY + 526, t('Le composeur, pas BodyCount', 'The dialer, not BodyCount'), { taille: 10.5, couleur: '#80868B', ancre: 'middle' })}`, 0.004)}`, 0.006);

  // 3. Exporter : la feuille Sauvegarde prête, puis le sélecteur.
  const [a3, b3] = PH[2];
  const reglages = `${texte(SX + 18, SY + 48, t('Réglages', 'Settings'), { taille: 21, couleur: APP.texte, poids: 800 })}
    <rect x="${SX + 12}" y="${SY + 70}" width="${SL - 24}" height="64" rx="16" fill="${APP.surface}" stroke="${APP.bord}"/>
    ${O.logo(SX + 44, SY + 102, 36)}
    ${texte(SX + 72, SY + 99, t('18 Personnes', '18 People'), { taille: 13.5, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 72, SY + 116, t('111 Rencontres', '111 Encounters'), { taille: 10, couleur: APP.second })}
    ${texte(SX + 18, SY + 166, t('DONNÉES', 'DATA'), { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.6"' })}
    <rect x="${SX + 12}" y="${SY + 176}" width="${SL - 24}" height="182" rx="16" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${[[null, t('Tout reste sur ce téléphone', 'Everything stays on this phone'), t('Base chiffrée, aucun serveur', 'Encrypted, no server'), APP.vert],
      [null, t('Exporter, chiffré', 'Export, encrypted'), t('Dernière il y a 3 jours', 'Last one 3 days ago'), APP.etoile],
      [null, t('Restaurer une sauvegarde', 'Restore a backup'), t('Remplace ce qui est ici', 'Replaces what is here'), APP.etoile]].map(([f, l1, l2, c], i) => {
      const y = SY + 190 + i * 58;
      const ic = icone(['shield', 'ios_share', 'settings_backup_restore'][i], SX + 30, y + 11, c);
      return `<rect x="${SX + 22}" y="${y + 3}" width="32" height="32" rx="10" fill="${c}" fill-opacity="0.12"/>${ic}
        ${texte(SX + 66, y + 17, l1, { taille: 12, couleur: APP.texte, poids: 600 })}
        ${texte(SX + 66, y + 33, l2, { taille: 9.5, couleur: APP.second })}`;
    }).join('')}`;
  ecran += entre(C, a3, b3, `${reglages}${toucher(SX + 130, SY + 264, C, 0.505)}
    ${entre(C, 0.525, 0.61, feuille(200, `
      ${texte(SX + 22, SY + SH - 160, t('Sauvegarde prête, 186 Mo', 'Backup ready, 186 MB'), { taille: 14.5, couleur: APP.texte, poids: 700 })}
      ${icone('save_alt', SX + 24, SY + SH - 128, APP.etoile)}
      ${texte(SX + 54, SY + SH - 122, t('Enregistrer sur le téléphone', 'Save on the phone'), { taille: 12, couleur: APP.texte })}
      ${texte(SX + 54, SY + SH - 106, t('Dans le dossier de ton choix', 'In the folder of your choice'), { taille: 9.5, couleur: APP.second })}
      ${icone('ios_share', SX + 24, SY + SH - 76, APP.etoile)}
      ${texte(SX + 54, SY + SH - 70, t('Partager', 'Share'), { taille: 12, couleur: APP.texte })}
      ${texte(SX + 54, SY + SH - 54, t('Vers une autre application', 'To another app'), { taille: 9.5, couleur: APP.second })}
      ${toucher(SX + 130, SY + SH - 116, C, 0.585)}`), 0.004)}
    ${entre(C, 0.61, 0.69, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#15171B"/>
      ${texte(SX + 18, SY + 50, t('Téléchargements', 'Downloads'), { taille: 18, couleur: '#E8EAED', poids: 600 })}
      ${[['bodycount-2026-08-19.bcx', '172 Mo'], ['facture-free.pdf', '84 Ko'], ['IMG_2211.jpg', '3,1 Mo']].map(([n, tl], i) => `
        ${picto(dossier, SX + 20, SY + 92 + i * 46, '#8AB4F8')}
        ${texte(SX + 48, SY + 104 + i * 46, n, { taille: 11.5, couleur: '#E8EAED' })}
        ${texte(SX + SL - 18, SY + 104 + i * 46, t(tl, tl.replace('Mo', 'MB').replace('Ko', 'KB').replace(',', '.')), { taille: 10, couleur: '#9AA0A6', ancre: 'end' })}`).join('')}
      <rect x="${SX}" y="${SY + SH - 110}" width="${SL}" height="110" fill="#202124"/>
      <rect x="${SX + 16}" y="${SY + SH - 96}" width="${SL - 32}" height="34" rx="6" fill="#303134"/>
      ${texte(SX + 26, SY + SH - 74, 'bodycount-2026-09-26.bcx', { taille: 11.5, couleur: '#E8EAED', police: MONO })}
      <rect x="${SX + SL - 110}" y="${SY + SH - 50}" width="94" height="32" rx="16" fill="#8AB4F8"/>
      ${texte(SX + SL - 63, SY + SH - 29.5, t('Enregistrer', 'Save'), { taille: 12, couleur: '#062E6F', poids: 700, ancre: 'middle' })}
      ${toucher(SX + SL - 63, SY + SH - 34, C, 0.655)}
      ${texte(SX + SL / 2, SY + SH - 130, t('Le sélecteur du système', 'The system picker'), { taille: 10.5, couleur: '#9AA0A6', ancre: 'middle' })}`, 0.004)}
    ${entre(C, 0.69, b3, bandeau(t('Sauvegarde enregistrée.', 'Backup saved.')), 0.004)}`, 0.006);

  // 4. Télécharger : la visionneuse, puis le bandeau de la galerie.
  const [a4, b4] = PH[3];
  ecran += entre(C, a4, b4, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
    ${visage(12, SX, SY + 130, SL, SL, 0)}
    ${picto(O.ICONE.croix, SX + 16, SY + 26, '#FFFFFF', 1.1)}
    ${texte(SX + SL / 2, SY + 40, '1 / 3', { taille: 13, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
    ${picto(O.ICONE.telecharger, SX + SL - 64, SY + 25, '#FFFFFF', 1.2)}
    <circle cx="${SX + SL - 22}" cy="${SY + 30}" r="1.8" fill="#FFFFFF"/><circle cx="${SX + SL - 22}" cy="${SY + 36}" r="1.8" fill="#FFFFFF"/><circle cx="${SX + SL - 22}" cy="${SY + 24}" r="1.8" fill="#FFFFFF"/>
    ${toucher(SX + SL - 54, SY + 35, C, 0.79)}
    ${entre(C, 0.815, b4, bandeau(t('Enregistrée dans Images › BodyCount,', 'Saved to Pictures › BodyCount,'), t('en clair, hors du coffre.', 'in the clear, outside the vault.')), 0.004)}`, 0.006);
  corps += T.ecran(ecran);

  // ------------------------------------------------------------ le mur
  const WX = 400, WL = 820, WY = 84, WH = 220;
  corps += rubrique(WX, WY + 14, t('SI QUELQUE CHOSE ESSAYAIT DE SORTIR SEUL', 'IF ANYTHING TRIED TO GO OUT ON ITS OWN'));
  corps += `<rect x="${WX}" y="${WY + 26}" width="${WL}" height="${WH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const MUR = WX + 560;
  // Les tentatives, ce que font d'ordinaire les autres applications.
  const essais = [
    [t('Tuiles de carte', 'Map tiles'), 'tile.openstreetmap.org', 0.03],
    [t('Polices', 'Fonts'), 'fonts.googleapis.com', 0.27],
    [t('Mesure d’audience', 'Analytics'), 'app-measurement.com', 0.5],
    [t('Rapport de plantage', 'Crash report'), 'sentry.io', 0.75],
  ];
  essais.forEach(([nom, hote, d], i) => {
    const y = WY + 68 + i * 44;
    const choc = d + 0.07, fin = Math.min(d + 0.21, 0.985);
    corps += `<rect x="${WX + 18}" y="${y - 18}" width="230" height="40" rx="10" fill="${FIL}" fill-opacity="0.25" stroke="${BORD}"/>
      <rect x="${WX + 18}" y="${y - 18}" width="230" height="40" rx="10" fill="none" stroke="${ROUGE}" stroke-opacity="0.8" opacity="0">${visible(C, choc, fin)}</rect>
      ${picto(globe, WX + 30, y - 7, TEXTE)}
      ${texte(WX + 56, y - 1, nom, { taille: 12.5, couleur: TITRE, poids: 700 })}
      ${texte(WX + 56, y + 14, hote, { taille: 10, couleur: DISCRET, police: MONO })}
      <line x1="${WX + 256}" y1="${y}" x2="${MUR - 12}" y2="${y}" stroke="${FIL}" stroke-width="1.6" stroke-dasharray="3 6"/>`;
    // Le paquet qui file et s'écrase.
    const chemin = `M${WX + 262} ${y} H${MUR - 14}`;
    const mvt = `<animateMotion dur="${C}s" repeatCount="indefinite" path="${chemin}" keyPoints="0;0;1;1" keyTimes="0;${d.toFixed(4)};${choc.toFixed(4)};1" calcMode="linear"/>`;
    corps += `<g filter="url(#halo)"><circle r="7" fill="${ACCENT}" opacity="0">${mvt}${visible(C, d, choc, 0.004)}</circle>
      <circle r="3" fill="#FFFFFF" opacity="0">${mvt}${visible(C, d, choc, 0.004)}</circle></g>
      <circle cx="${MUR - 12}" cy="${y}" r="4" fill="none" stroke="${ROUGE}" stroke-width="2" opacity="0">
        ${fondu('r', C, [[0, 4], [choc, 4], [choc + 0.04, 26], [1, 26]])}
        ${fondu('opacity', C, [[0, 0], [choc, 0], [choc + 0.002, 0.95], [choc + 0.04, 0], [1, 0]])}
      </circle>
      ${entre(C, choc, fin, `<rect x="${MUR - 90}" y="${y - 10}" width="74" height="20" rx="10" fill="${CARTE}" stroke="${ROUGE}" stroke-opacity="0.5"/>` + texte(MUR - 53, y + 4, t('refusée', 'refused'), { taille: 10.5, couleur: ROUGE, police: MONO, poids: 700, ancre: 'middle' }), 0.006)}`;
  });
  // Le mur lui-même, en briques.
  let briques = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 2; c++) {
      const bx = MUR - 8 + (r % 2 ? -6 : 0) + c * 14;
      if (bx + 12 > MUR + 22) continue;
      briques += `<rect x="${Math.max(bx, MUR - 8)}" y="${WY + 56 + r * 18}" width="${Math.min(12, MUR + 20 - bx)}" height="15" rx="2" fill="${ROUGE}" fill-opacity="${0.55 + ((r + c) % 3) * 0.12}"/>`;
    }
  }
  corps += briques;
  corps += texte(MUR + 7, WY + 50, 'Android', { taille: 11, couleur: ROUGE, police: MONO, poids: 700, ancre: 'middle' });
  corps += texte(MUR + 7, WY + WH + 18, t('pas de permission INTERNET', 'no INTERNET permission'), { taille: 10.5, couleur: ROUGE, police: MONO, ancre: 'middle' });
  // Internet, de l'autre côté, jamais atteint.
  const IX = MUR + 44;
  corps += `<line x1="${MUR + 26}" y1="${WY + 144}" x2="${IX}" y2="${WY + 144}" stroke="${FIL}" stroke-dasharray="3 6" opacity="0.5"/>
    <rect x="${IX}" y="${WY + 104}" width="${WX + WL - 18 - IX}" height="80" rx="12" fill="${FIL}" fill-opacity="0.18" stroke="${BORD}" stroke-dasharray="4 4"/>
    ${picto(globe, IX + 18, WY + 122, DISCRET, 1.4)}
    ${texte(IX + 50, WY + 136, 'Internet', { taille: 14, couleur: TEXTE, police: MONO, poids: 700 })}
    ${texte(IX + 18, WY + 166, t('jamais atteint', 'never reached'), { taille: 12, couleur: DISCRET })}`;
  corps += texte(WX + 18, WY + WH + 18, t('Le mur n’est pas dans le code : même une dépendance piégée s’y heurte.', 'The wall is not in the code: even a poisoned dependency hits it.'), { taille: 11.5, couleur: DISCRET });

  // ------------------------------------------------------------ les portes
  const DY = 396, DL = 193, DH = 146;
  corps += rubrique(WX, DY - 36, t('LES QUATRE PORTES, SUR UN TOUCHER', 'THE FOUR DOORS, ON A TOUCH'));
  const portes = [
    [direction, t('Y aller', 'Directions'), t('l’adresse', 'the address'), t('à l’appli de cartes', 'to the maps app'), t('choisie par geo:', 'picked through geo:'), t('en clair', 'in the clear'), OR],
    [combine, t('Appeler', 'Call'), t('le numéro', 'the number'), t('au composeur', 'to the dialer'), t('par tel:', 'through tel:'), t('en clair', 'in the clear'), OR],
    [partage, t('Exporter', 'Export'), t('la sauvegarde', 'the backup'), t('au dossier choisi', 'to the chosen folder'), t('ou à une appli', 'or to an app'), t('chiffrée', 'encrypted'), VERT],
    [O.ICONE.telecharger, t('Télécharger', 'Download'), t('une photo', 'a photo'), t('à la galerie', 'to the gallery'), 'Images › BodyCount', t('en clair', 'in the clear'), OR],
  ];
  // Le fil qui part du téléphone et dessert chaque porte par le haut.
  const centre = (i) => WX + i * (DL + 16) + DL / 2;
  corps += `<path d="M350 ${DY - 18} H${centre(3)}" stroke="${FIL}" stroke-width="1.6" fill="none"/>`;
  portes.forEach(([f, titre, quoi, ou, comment, etat, c], i) => {
    const x = WX + i * (DL + 16), [a, b] = PH[i];
    const ouvre = [0.075, 0.295, 0.51, 0.795][i];
    corps += `<path d="M${centre(i)} ${DY - 18} V${DY}" stroke="${FIL}" stroke-width="1.6"/>
      <rect x="${x}" y="${DY}" width="${DL}" height="${DH}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${DY}" width="${DL}" height="${DH}" rx="13" fill="${ACCENT}" fill-opacity="0.05" stroke="${ACCENT}" stroke-width="1.5" opacity="0">${visible(C, ouvre, b - 0.004)}</rect>
      <rect x="${x + 16}" y="${DY + 16}" width="34" height="34" rx="10" fill="${ACCENT}" fill-opacity="0.12" stroke="${ACCENT}" stroke-opacity="0.4"/>
      ${picto(f, x + 25, DY + 25, ACCENT)}
      ${texte(x + 60, DY + 38, titre, { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 16, DY + 76, quoi, { taille: 13, couleur: TITRE, poids: 700 })}
      ${texte(x + 16, DY + 95, ou, { taille: 12 })}
      ${texte(x + 16, DY + 112, comment, { taille: 11.5, couleur: DISCRET, police: comment.includes(':') || comment.includes('›') ? MONO : O.SANS })}
      <rect x="${x + 16}" y="${DY + 122}" width="${etat.length * 6.4 + 18}" height="18" rx="9" fill="${c}" fill-opacity="0.12" stroke="${c}" stroke-opacity="0.5"/>
      ${texte(x + 25, DY + 134.5, etat, { taille: 10, couleur: c, poids: 700 })}`;
    // La bille qui part du téléphone quand la porte s'ouvre.
    const chemin = `M350 ${DY - 18} H${centre(i)} V${DY + 2}`;
    const d2 = ouvre + 0.04;
    const mvt = `<animateMotion dur="${C}s" repeatCount="indefinite" path="${chemin}" keyPoints="0;0;1;1" keyTimes="0;${ouvre.toFixed(4)};${d2.toFixed(4)};1" calcMode="linear"/>`;
    corps += `<g filter="url(#halo)"><circle r="7" fill="${ACCENT}" opacity="0">${mvt}${visible(C, ouvre, d2, 0.003)}</circle>
      <circle r="3" fill="#FFFFFF" opacity="0">${mvt}${visible(C, ouvre, d2, 0.003)}</circle></g>`;
  });
  corps += texte(WX + 820, DY + DH + 20, t('Chacune passe la main à une autre appli, qui répond ensuite de ce qu’elle en fait.', 'Each hands over to another app, which then answers for what it does with it.'), { taille: 11.5, couleur: DISCRET, ancre: 'end' });

  // ------------------------------------------------------------ le bas
  const bas = [
    [VIOLET, t('Le manifeste', 'The manifest'), t('Une permission écrite : l’empreinte.', 'One permission written: fingerprint.')],
    [BLEU, t('Pas de tuiles', 'No tiles'), t('La France est dans l’APK, 180 Ko.', 'France is in the APK, 180 KB.')],
    [VERT, t('Pas de polices distantes', 'No remote fonts'), t('Chakra Petch est embarquée.', 'Chakra Petch ships inside.')],
    [OR, t('Ni sauvegarde Android', 'No Android backup'), t('allowBackup="false"', 'allowBackup="false"')],
  ];
  bas.forEach(([c, titre, l], i) => {
    const x = WX + i * (DL + 16), y = 580;
    corps += `<rect x="${x}" y="${y}" width="${DL}" height="70" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(x + 16, y + 29, titre, { taille: 12.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 16, y + 50, l, { taille: 11, couleur: TEXTE, police: l.startsWith('allow') ? MONO : O.SANS })}`;
  });
  const verifiable = t('Vérifiable sur l’APK, sans lire le code :', 'Checkable on the APK, without reading the code:');
  corps += texte(WX, 676, verifiable, { taille: 12, couleur: TEXTE });
  corps += texte(WX + Math.round(verifiable.length * 6.1) + 12, 676, 'aapt2 dump permissions app-arm64-v8a-release.apk', { taille: 12, couleur: ACCENT, police: MONO });

  svg('reseau.svg', 1280, 700, corps, t(
    'BodyCount ne demande pas la permission INTERNET : Android refuse d’ouvrir la moindre connexion. Les tuiles de carte, les polices, la mesure d’audience ou les rapports de plantage que d’autres applications envoient d’elles-mêmes s’écraseraient sur ce mur, et Internet n’est jamais atteint. Il reste quatre portes, chacune sur un toucher, qui passent la main à une autre application : Y aller donne l’adresse à l’appli de cartes choisie par geo:, Appeler donne le numéro au composeur par tel:, Exporter pose la sauvegarde chiffrée dans le dossier choisi par le sélecteur du système, et Télécharger range une copie en clair de la photo dans Images › BodyCount. Le manifeste n’écrit qu’une permission, l’empreinte ; la France est embarquée, la police aussi, et la sauvegarde d’Android est refusée.',
    'BodyCount does not ask for the INTERNET permission: Android refuses to open any connection. Map tiles, fonts, analytics or crash reports that other apps send on their own would crash into that wall, and the Internet is never reached. Four doors remain, each opened by a touch and handing over to another app: Directions gives the address to the maps app chosen through geo:, Call gives the number to the dialer through tel:, Export puts the encrypted backup in the folder picked in the system picker, and Download files a plain copy of the photo under Pictures › BodyCount. The manifest writes a single permission, the fingerprint; France ships inside, so does the font, and Android backup is refused.'));
};

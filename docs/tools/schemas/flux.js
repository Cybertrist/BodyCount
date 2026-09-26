// Le flux chiffré par morceaux, vivant : une vidéo d'Enzo entre au coffre
// un mégaoctet à la fois, se relit pour la visionneuse, puis subit trois
// attaques qui finissent toutes sur le même refus.
//
// À gauche, le téléphone : l'import, puis la visionneuse. À droite, en
// haut, la vidéo en clair, le tampon et AES-GCM, et le fichier BCV1 qui se
// remplit ; au milieu, un morceau de près et ce que dit la lecture ; en
// bas, les trois attaques. Tout vient de lib/security/flux_chiffre.dart,
// aes_natif.dart et video_vault.dart.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, paliers, fondu, visible, entre, glisse, telephone, toucher, visage, icone,
    APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU, id } = O;
  const C = 36;
  let corps = entete(t('LE FLUX CHIFFRÉ', 'THE ENCRYPTED STREAM'),
    t('Un mégaoctet à la fois. Aucun morceau ne change de place, ne manque ou ne bouge d’un octet sans que la lecture le voie.',
      'One megabyte at a time. No chunk moves, goes missing or changes by a byte without the reader noticing.'));

  // Le déroulé, en fraction du cycle.
  const N = 7; // six morceaux pleins et un dernier de 0,4 Mo
  const A = (i) => 0.05 + i * 0.043; // l'instant où le morceau i est lu
  const VOL = 0.036; // son trajet jusqu'au fichier
  const FERMER = A(N - 1) + VOL, LECTURE = 0.4, LU = 0.475, FIN_LECTURE = 0.58;
  const ATT = [0.6, 0.72, 0.84], FIN = 0.965;

  // Deux couleurs unies, sans motif : le bleu pour le clair, le violet
  // pour le chiffré. La légende en haut à droite les nomme.
  const FOND_CLAIR = '#1E3A5F', FOND_CHIFFRE = '#3B1F66';

  const coche = (x, y, c = VERT) => `<circle cx="${x}" cy="${y}" r="8" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-opacity="0.8"/>${icone('coche', x - 6, y - 6, c, 0.75)}`;
  const refus = (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="${ROUGE}" fill-opacity="0.2" stroke="${ROUGE}"/>${icone('croix', x - 5, y - 5, ROUGE, 0.62)}`;

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // L'import : la vidéo d'Enzo se chiffre, la barre avance par morceau.
  const progression = [[0, 0]];
  for (let i = 0; i < N; i++) progression.push([A(i) + VOL, (SL - 72) * Math.min(1, (i + 1) * 1 / 6.4)]);
  progression.push([1, SL - 72]);
  ecran += entre(C, 0, LECTURE, `
    <path d="M${SX + 24} ${SY + 38} l-7 7 l7 7" fill="none" stroke="${APP.texte}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(SX + 44, SY + 51, t('Photos et vidéos', 'Photos and videos'), { taille: 17, couleur: APP.texte, poids: 800 })}
    ${visage(12, SX + 18, SY + 90, SL - 36, 190, 16)}
    <rect x="${SX + 18}" y="${SY + 90}" width="${SL - 36}" height="190" rx="16" fill="#000000" fill-opacity="0.25"/>
    <circle cx="${SX + SL / 2}" cy="${SY + 185}" r="20" fill="#000000" fill-opacity="0.45" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="1.5"/>
    <path d="M${SX + SL / 2 - 6} ${SY + 176} L${SX + SL / 2 + 10} ${SY + 185} L${SX + SL / 2 - 6} ${SY + 194} Z" fill="#FFFFFF"/>
    ${texte(SX + SL - 30, SY + 270, '0:42', { taille: 11, couleur: '#FFFFFF', poids: 700, ancre: 'end' })}
    ${texte(SX + 24, SY + 306, t('enzo.mp4 · 6,4 Mo', 'enzo.mp4 · 6.4 MB'), { taille: 11.5, couleur: APP.second, police: MONO })}
    <rect x="${SX + 18}" y="${SY + 330}" width="${SL - 36}" height="92" rx="16" fill="${APP.surface}" stroke="${APP.bord}"/>
    ${entre(C, 0, FERMER, `<circle cx="${SX + 42}" cy="${SY + 358}" r="8" fill="none" stroke="${APP.violet}" stroke-width="2.4" stroke-dasharray="30 20">
        <animateTransform attributeName="transform" type="rotate" from="0 ${SX + 42} ${SY + 358}" to="360 ${SX + 42} ${SY + 358}" dur="0.9s" repeatCount="indefinite"/></circle>
      ${texte(SX + 60, SY + 362, t('Chiffrement de la vidéo, 1 sur 1…', 'Encrypting the video, 1 of 1…'), { taille: 11.5, couleur: APP.texte, poids: 600 })}`, 0.004)}
    ${entre(C, FERMER, LECTURE, `${coche(SX + 42, SY + 358, APP.vert)}
      ${texte(SX + 60, SY + 362, t('Au coffre, chiffrée.', 'In the vault, encrypted.'), { taille: 11.5, couleur: APP.texte, poids: 600 })}`, 0.004)}
    <rect x="${SX + 36}" y="${SY + 386}" width="${SL - 72}" height="6" rx="3" fill="${APP.bord}"/>
    <rect x="${SX + 36}" y="${SY + 386}" height="6" rx="3" width="0" fill="url(#marque)">${fondu('width', C, progression)}</rect>
    ${texte(SX + 36, SY + 410, t('un mégaoctet à la fois', 'one megabyte at a time'), { taille: 10, couleur: APP.discret })}
    ${toucher(SX + SL / 2, SY + 185, C, LECTURE - 0.012)}`, 0.006);

  // La visionneuse : déchiffrement, lecture, puis « Vidéo illisible »
  // à chaque attaque.
  const haut = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
    ${icone('croix', SX + 18, SY + 36, '#FFFFFF', 0.9)}
    ${texte(SX + SL / 2, SY + 48, '1 / 1', { taille: 12.5, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
    ${icone('telecharger', SX + SL - 58, SY + 36, '#FFFFFF', 0.9)}
    <circle cx="${SX + SL - 22}" cy="${SY + 38}" r="1.6" fill="#FFFFFF"/><circle cx="${SX + SL - 22}" cy="${SY + 44}" r="1.6" fill="#FFFFFF"/><circle cx="${SX + SL - 22}" cy="${SY + 50}" r="1.6" fill="#FFFFFF"/>`;
  const dechiffrement = `<circle cx="${SX + SL / 2}" cy="${SY + SH / 2 - 16}" r="13" fill="none" stroke="${APP.violet}" stroke-width="2.6" stroke-dasharray="52 30">
      <animateTransform attributeName="transform" type="rotate" from="0 ${SX + SL / 2} ${SY + SH / 2 - 16}" to="360 ${SX + SL / 2} ${SY + SH / 2 - 16}" dur="0.9s" repeatCount="indefinite"/></circle>
    ${texte(SX + SL / 2, SY + SH / 2 + 20, t('Déchiffrement…', 'Decrypting…'), { taille: 12.5, couleur: APP.second, ancre: 'middle' })}`;
  const illisible = `<g transform="translate(${SX + SL / 2 - 17} ${SY + SH / 2 - 36})">
      <rect x="2" y="8" width="22" height="18" rx="3" fill="none" stroke="${APP.discret}" stroke-width="2.2"/>
      <path d="M24 14 L32 9 V25 L24 20" fill="none" stroke="${APP.discret}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M0 2 L34 32" stroke="${APP.discret}" stroke-width="2.4" stroke-linecap="round"/></g>
    ${texte(SX + SL / 2, SY + SH / 2 + 20, t('Vidéo illisible', 'Unreadable video'), { taille: 13, couleur: APP.second, ancre: 'middle' })}`;
  let vision = haut + entre(C, LECTURE, LU, dechiffrement, 0.004);
  vision += entre(C, LU, FIN_LECTURE, `${visage(12, SX, SY + SH / 2 - 120, SL, 220, 0)}
    ${texte(SX + 16, SY + SH - 40, '0:03', { taille: 10.5, couleur: '#FFFFFF' })}
    ${texte(SX + SL - 16, SY + SH - 40, '0:42', { taille: 10.5, couleur: '#FFFFFF', ancre: 'end' })}
    <rect x="${SX + 50}" y="${SY + SH - 45}" width="${SL - 100}" height="3" rx="1.5" fill="#FFFFFF" fill-opacity="0.25"/>
    <rect x="${SX + 50}" y="${SY + SH - 45}" height="3" rx="1.5" width="0" fill="${APP.violet}">${fondu('width', C, [[0, 0], [LU, 0], [FIN_LECTURE, (SL - 100) * 0.4], [1, (SL - 100) * 0.4]])}</rect>`, 0.004);
  ATT.forEach((a) => {
    vision += entre(C, a, a + 0.06, dechiffrement, 0.004);
    vision += entre(C, a + 0.06, a + 0.115, illisible, 0.004);
  });
  ecran += entre(C, LECTURE, FIN, vision, 0.006);
  corps += T.ecran(ecran);

  // ------------------------------------------------ l'écriture, en haut
  const X = (i) => 500 + i * 104, W = (i) => (i < N - 1 ? 98 : 40);
  const SY_ = 140, FY = 272, H = 26;
  corps += rubrique(400, 108, t('LA VIDÉO ENTRE, UN MÉGAOCTET À LA FOIS', 'THE VIDEO GOES IN, ONE MEGABYTE AT A TIME'));
  corps += texte(400, SY_ + 17, t('clair', 'clear'), { taille: 11, couleur: BLEU, police: MONO, poids: 700 });
  corps += texte(400, FY + 17, 'vault/', { taille: 11, couleur: ACCENT, police: MONO, poids: 700 });
  corps += texte(1220, 108, t('enzo.mp4 · 6,4 Mo', 'enzo.mp4 · 6.4 MB'), { taille: 11, couleur: DISCRET, police: MONO, ancre: 'end' });
  // La légende des deux couleurs.
  {
    const lx = 880, ly = 108;
    corps += `<rect x="${lx}" y="${ly - 10}" width="16" height="12" rx="3" fill="${FOND_CLAIR}" stroke="${BLEU}"/>`;
    corps += texte(lx + 22, ly, t('en clair', 'in the clear'), { taille: 11.5, couleur: BLEU });
    corps += `<rect x="${lx + 100}" y="${ly - 10}" width="16" height="12" rx="3" fill="${FOND_CHIFFRE}" stroke="${VIOLET}"/>`;
    corps += texte(lx + 122, ly, t('chiffré', 'encrypted'), { taille: 11.5, couleur: VIOLET });
  }
  // La vidéo en clair : sept tranches, dont une courte.
  for (let i = 0; i < N; i++) {
    corps += `<rect x="${X(i)}" y="${SY_}" width="${W(i)}" height="${H}" rx="5" fill="${FOND_CLAIR}" stroke="${BLEU}" stroke-opacity="0.6"/>
      <rect x="${X(i)}" y="${SY_}" width="${W(i)}" height="${H}" rx="5" fill="none" stroke="${BLEU}" stroke-width="1.6" opacity="0">${visible(C, A(i), A(i) + 0.012, 0.004)}</rect>
      <rect x="${X(i)}" y="${SY_}" width="${W(i)}" height="${H}" rx="5" fill="${FOND_SOMBRE()}" fill-opacity="0.55" opacity="0">${paliers('opacity', C, [[0, 0], [A(i) + 0.012, 1], [FIN, 0]])}</rect>`;
  }
  function FOND_SOMBRE() { return '#0D1117'; }
  corps += texte(X(N - 1) + W(N - 1) + 8, SY_ + 17, t('0,4', '0.4'), { taille: 10, couleur: DISCRET, police: MONO });

  const TX = 580, TL = 170, AX = 810, AL = 300, PY = 186, PH = 58;
  // Les morceaux en vol : clair jusqu'à AES, chiffré ensuite. Ils passent
  // sous les deux cartes : on les voit entrer, puis ressortir changés.
  for (let i = 0; i < N; i++) {
    const w = W(i), a = A(i);
    const p1 = [TX + TL / 2, PY + PH / 2], p2 = [AX + AL / 2, PY + PH / 2];
    const depart = [X(i) + w / 2, SY_ + H / 2], arrivee = [X(i) + w / 2, FY + H / 2];
    const seg = [depart, p1, p2, arrivee];
    const lg = [0];
    for (let k = 1; k < seg.length; k++) lg.push(lg[k - 1] + Math.hypot(seg[k][0] - seg[k - 1][0], seg[k][1] - seg[k - 1][1]));
    const f = lg.map((v) => (v / lg[3]).toFixed(4));
    const chemin = `M${seg.map((p) => p.join(' ')).join(' L')}`;
    const mouvement = `<animateMotion dur="${C}s" repeatCount="indefinite" path="${chemin}" calcMode="linear"
      keyPoints="0;0;${f[1]};${f[1]};${f[2]};${f[2]};1;1" keyTimes="0;${a};${(a + 0.01).toFixed(4)};${(a + 0.016).toFixed(4)};${(a + 0.024).toFixed(4)};${(a + 0.027).toFixed(4)};${(a + VOL).toFixed(4)};1"/>`;
    corps += `<g>${mouvement}
      <rect x="${-w / 2}" y="${-H / 2}" width="${w}" height="${H}" rx="5" fill="${FOND_CLAIR}" stroke="${BLEU}" opacity="0">${visible(C, a, a + 0.022, 0.003)}</rect>
      <rect x="${-w / 2}" y="${-H / 2}" width="${w}" height="${H}" rx="5" fill="${FOND_CHIFFRE}" stroke="${VIOLET}" opacity="0" filter="url(#halo)">${visible(C, a + 0.022, a + VOL, 0.003)}</rect>
    </g>`;
  }

  // Le tampon et AES-GCM, entre les deux.
  corps += `<rect x="${TX}" y="${PY}" width="${TL}" height="${PH}" rx="12" fill="${CARTE}" stroke="${BORD}"/>
    ${texte(TX + 14, PY + 22, t('Tampon', 'Buffer'), { taille: 13, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(TX + 14, PY + 39, t('1 Mo en mémoire, au plus', '1 MB in memory, at most'), { taille: 10.5 })}
    <rect x="${TX + 14}" y="${PY + 47}" width="${TL - 28}" height="5" rx="2.5" fill="${FIL}"/>`;
  const plein = [[0, 0]];
  for (let i = 0; i < N; i++) plein.push([A(i), 0], [A(i) + 0.01, (TL - 28) * (i < N - 1 ? 1 : 0.4)], [A(i) + 0.02, (TL - 28) * (i < N - 1 ? 1 : 0.4)], [A(i) + 0.026, 0]);
  plein.push([1, 0]);
  corps += `<rect x="${TX + 14}" y="${PY + 47}" height="5" rx="2.5" width="0" fill="${BLEU}">${fondu('width', C, plein)}</rect>`;
  corps += `<rect x="${AX}" y="${PY}" width="${AL}" height="${PH}" rx="12" fill="${CARTE}" stroke="${BORD}"/>
    <rect x="${AX}" y="${PY}" width="${AL}" height="${PH}" rx="12" fill="none" stroke="${VIOLET}" stroke-width="1.5" opacity="0">${fondu('opacity', C, [[0, 0], [A(0), 0], [A(0) + 0.01, 1], [FERMER, 1], [FERMER + 0.01, 0], [1, 0]])}</rect>
    ${texte(AX + 14, PY + 22, t('AES-GCM natif', 'Native AES-GCM'), { taille: 13, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(AX + 14, PY + 40, t('clé du coffre, nonce neuf à chaque fois', 'vault key, a fresh nonce every time'), { taille: 10.5 })}`;
  // Ce que le morceau authentifie, qui change à chaque passage.
  for (let i = 0; i < N; i++) {
    const der = i === N - 1;
    corps += entre(C, A(i) + 0.012, i < N - 1 ? A(i + 1) + 0.012 : FIN, texte(AX + AL - 14, PY + 22, `AD : ${t('rang', 'rank')} ${i} · ${t('dernier', 'last')} ${der ? 1 : 0}`,
      { taille: 10.5, couleur: der ? OR : ACCENT, police: MONO, poids: 700, ancre: 'end' }), 0.003);
  }
  corps += `<path d="M${TX + TL} ${PY + PH / 2} H${AX}" stroke="${FIL}" stroke-width="1.6" stroke-dasharray="4 4"/>`;

  // Le fichier du coffre : BCV1, puis les morceaux à mesure qu'ils sortent.
  corps += `<rect x="446" y="${FY}" width="46" height="${H}" rx="5" fill="${CARTE}" stroke="${ACCENT}" stroke-opacity="0.6"/>
    ${texte(469, FY + 17, 'BCV1', { taille: 10.5, couleur: ACCENT, police: MONO, poids: 700, ancre: 'middle' })}`;
  // Les trois attaques déplacent ou abîment des morceaux du fichier.
  const [A1, A2, A3] = ATT;
  const deplacement = (i) => {
    if (i !== 2 && i !== 3) return '';
    const d = i === 2 ? 106 : -106;
    return glisse(C, [[0, '0 0'], [A1, '0 0'], [A1 + 0.022, `${d} 0`], [A1 + 0.1, `${d} 0`], [A1 + 0.115, '0 0'], [1, '0 0']]);
  };
  for (let i = 0; i < N; i++) {
    const arrive = A(i) + VOL;
    const der = i === N - 1;
    let morceau = `<rect x="${X(i)}" y="${FY}" width="${W(i)}" height="${H}" rx="5" fill="${FOND_CHIFFRE}" stroke="${der ? OR : VIOLET}" stroke-opacity="0.8"/>
      <rect x="${X(i) + 3}" y="${FY + 4}" width="5" height="${H - 8}" rx="1.5" fill="${BLEU}" fill-opacity="0.85"/>
      <rect x="${X(i) + W(i) - 8}" y="${FY + 4}" width="5" height="${H - 8}" rx="1.5" fill="${ACCENT}"/>
      ${texte(X(i) + W(i) / 2, FY + H + 15, der ? `${i} · ${t('dernier', 'last')}` : `${t('rang', 'rank')} ${i}`, { taille: 10, couleur: der ? OR : DISCRET, police: MONO, ancre: 'middle' })}`;
    // Un octet changé, dans le morceau 4.
    if (i === 4) morceau += entre(C, A3 + 0.006, A3 + 0.105, `<rect x="${X(i) + 46}" y="${FY + 8}" width="10" height="10" rx="2" fill="${ROUGE}">
        <animate attributeName="opacity" dur="0.5s" repeatCount="indefinite" values="1;0.35;1"/></rect>`, 0.004);
    let groupe = `<g>${deplacement(i)}${morceau}</g>`;
    // La troncature coupe le dernier.
    const vie = der
      ? fondu('opacity', C, [[0, 0], [arrive - 0.004, 0], [arrive, 1], [A2 + 0.006, 1], [A2 + 0.022, 0], [A2 + 0.1, 0], [A2 + 0.112, 1], [FIN, 1], [FIN + 0.012, 0], [1, 0]])
      : visible(C, arrive, FIN, 0.006);
    corps += `<g opacity="0">${vie}${groupe}</g>`;
  }
  // Le trait de la coupe.
  corps += entre(C, A2 + 0.006, A2 + 0.105, `<path d="M${X(N - 1) - 3} ${FY - 10} V${FY + H + 10}" stroke="${ROUGE}" stroke-width="2" stroke-dasharray="4 3"/>
    <rect x="${X(N - 1)}" y="${FY}" width="${W(N - 1)}" height="${H}" rx="5" fill="none" stroke="${ROUGE}" stroke-dasharray="4 3"/>
    ${texte(X(N - 1) + W(N - 1) / 2, FY - 8, t('coupé', 'cut'), { taille: 10, couleur: ROUGE, police: MONO, poids: 700, ancre: 'middle' })}`, 0.004);

  // Les coches de la lecture, à la place de chaque morceau.
  const verifs = []; // [position, de, a, ok]
  for (let i = 0; i < N; i++) verifs.push([i, LECTURE + 0.008 + i * 0.009, FIN_LECTURE, true]);
  [[A1, 2], [A2, 5], [A3, 4]].forEach(([a, casse]) => {
    for (let i = 0; i <= casse; i++) verifs.push([i, a + 0.03 + i * 0.006, a + 0.112, i < casse]);
  });
  verifs.forEach(([i, de, a, ok]) => {
    corps += entre(C, de, a, ok ? coche(X(i) + W(i) / 2, FY - 14) : refus(X(i) + W(i) / 2, FY - 14), 0.003);
  });
  
  // ------------------------------------------------ un morceau de près
  const ZX = 400, ZY = 350, ZL = 420;
  corps += rubrique(ZX, ZY - 16, t('UN MORCEAU, DE PRÈS', 'ONE CHUNK, UP CLOSE'));
  corps += `<rect x="${ZX}" y="${ZY}" width="${ZL}" height="112" rx="13" fill="${CARTE}" stroke="${BORD}"/>`;
  const champs = [[t('longueur', 'length'), '4', 62, BLEU], ['nonce', '12', 74, BLEU], [t('chiffré', 'ciphertext'), t('≤ 1 Mo', '≤ 1 MB'), 172, VIOLET], ['MAC', '16', 60, ACCENT]];
  let cx = ZX + 16;
  champs.forEach(([nom, taille, l, c]) => {
    corps += `<rect x="${cx}" y="${ZY + 16}" width="${l - 4}" height="34" rx="6" fill="${c === VIOLET ? FOND_CHIFFRE : c}" fill-opacity="${c === VIOLET ? 1 : 0.16}" stroke="${c}" stroke-opacity="0.7"/>
      ${texte(cx + (l - 4) / 2, ZY + 31, nom, { taille: 10.5, couleur: c === VIOLET ? '#FFFFFF' : c, police: MONO, poids: 700, ancre: 'middle' })}
      ${texte(cx + (l - 4) / 2, ZY + 44, taille, { taille: 9.5, couleur: c === VIOLET ? '#E9DEFF' : TEXTE, police: MONO, ancre: 'middle' })}`;
    cx += l;
  });
  const macX = ZX + 16 + 62 + 74 + 172 + 28;
  corps += `<rect x="${ZX + 16}" y="${ZY + 66}" width="${ZL - 32}" height="32" rx="7" fill="none" stroke="${OR}" stroke-opacity="0.7" stroke-dasharray="4 3"/>
    ${texte(ZX + 28, ZY + 80, t('données associées, jamais écrites', 'associated data, never written'), { taille: 10.5, couleur: OR, police: MONO, poids: 700 })}
    ${texte(ZX + 28, ZY + 93, t('rang sur 8 octets · dernier sur 1', 'rank on 8 bytes · last on 1'), { taille: 10.5, couleur: TEXTE, police: MONO })}
    <path d="M${macX} ${ZY + 66} V${ZY + 52}" stroke="${OR}" stroke-width="1.6"/>
    <path d="M${macX - 4} ${ZY + 57} L${macX} ${ZY + 51} L${macX + 4} ${ZY + 57}" fill="none" stroke="${OR}" stroke-width="1.6"/>`;

  // ------------------------------------------------ ce que dit la lecture
  const VX = 840, VL = 380;
  corps += rubrique(VX, ZY - 16, t('CE QUE DIT LA LECTURE', 'WHAT THE READER SAYS'));
  corps += `<rect x="${VX}" y="${ZY}" width="${VL}" height="112" rx="13" fill="${CARTE}" stroke="${BORD}"/>`;
  const console_ = (de, a, lignes, couleur = TEXTE) => entre(C, de, a, lignes.map(([s, c, p], k) =>
    texte(VX + 18, ZY + 30 + k * 22, s, { taille: k === 0 ? 13 : 11.5, couleur: c || couleur, police: p === 0 ? undefined : MONO, poids: k === 0 ? 700 : 400 })).join(''), 0.005);
  corps += console_(0, FERMER, [
    [t('EcritureChiffree', 'EcritureChiffree'), TITRE],
    [t('un morceau plein attend l’octet suivant', 'a full chunk waits for the next byte'), TEXTE],
    [t('avant d’être écrit : le vrai dernier', 'before being written: that is how the'), TEXTE],
    [t('se reconnaît à la fermeture.', 'real last one is known at close.'), TEXTE],
  ]);
  corps += console_(FERMER, LECTURE, [
    [t('7 morceaux, 6,4 Mo', '7 chunks, 6.4 MB'), VERT],
    [t('jamais plus d’un en mémoire', 'never more than one in memory'), TEXTE],
    [t('l’original du sélecteur est effacé', 'the picker’s original is deleted'), TEXTE],
  ]);
  corps += console_(LECTURE, FIN_LECTURE, [
    [t('7 étiquettes vérifiées', '7 tags verified'), VERT],
    [t('rang 0 à 6, dernier au bon endroit', 'ranks 0 to 6, last in its place'), TEXTE],
    [t('→ cache/lecture/…mp4, le temps de lire', '→ cache/lecture/…mp4, while it plays'), TEXTE],
  ]);
  corps += console_(FIN_LECTURE, A1, [[t('Et si quelqu’un touche au fichier ?', 'And if someone tampers with the file?'), TITRE]]);
  const verdicts = [
    [t('attendu : rang 2', 'expected: rank 2'), t('reçu : chiffré pour le rang 3', 'got: encrypted for rank 3'), t('Morceau 2 refusé.', 'Chunk 2 refused.')],
    [t('le 5 arrive en fin de fichier', 'chunk 5 now ends the file'), t('mais il a été chiffré avec dernier 0', 'but was encrypted with last 0'), t('Morceau 5 refusé.', 'Chunk 5 refused.')],
    [t('un octet changé dans le 4', 'one byte changed in chunk 4'), t('l’étiquette ne correspond plus', 'the tag no longer matches'), t('Morceau 4 refusé.', 'Chunk 4 refused.')],
  ];
  ATT.forEach((a, k) => {
    corps += console_(a, a + 0.112, [[verdicts[k][0], TITRE], [verdicts[k][1], TEXTE]]);
    corps += entre(C, a + 0.06, a + 0.112, `${refus(VX + 26, ZY + 90)}${texte(VX + 42, ZY + 94.5, verdicts[k][2], { taille: 12.5, couleur: ROUGE, police: MONO, poids: 700 })}`, 0.004);
  });
  corps += console_(FIN - 0.005, 1.1, [[t('Au prochain tour, on recommence.', 'Next round, we start again.'), DISCRET]]);

  // ------------------------------------------------ les trois attaques
  const cartes = [
    [t('Deux morceaux intervertis', 'Two chunks swapped'), t('Le rang n’est pas écrit : il entre', 'The rank is not written: it goes into'), t('dans l’étiquette. Déplacé, il ment.', 'the tag. Moved, the chunk lies.'), VIOLET],
    [t('La fin coupée', 'The end cut off'), t('Sans son dernier, le fichier s’arrête', 'Without its last chunk, the file stops'), t('sur un morceau qui n’en était pas un.', 'on a chunk that was not the last.'), OR],
    [t('Un octet changé', 'One byte changed'), t('AES-GCM authentifie chaque morceau :', 'AES-GCM authenticates every chunk:'), t('un seul bit, et l’étiquette refuse.', 'a single bit, and the tag refuses.'), ACCENT],
  ];
  cartes.forEach(([titre, l1, l2, c], k) => {
    const x = 400 + k * 280, y = 504, a = ATT[k];
    corps += `<rect x="${x}" y="${y}" width="260" height="100" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y}" width="260" height="100" rx="13" fill="none" stroke="${ROUGE}" stroke-width="1.5" opacity="0">${visible(C, a, a + 0.112, 0.006)}</rect>
      ${texte(x + 20, y + 30, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 54, l1, { taille: 12 })}
      ${texte(x + 20, y + 72, l2, { taille: 12 })}
      ${texte(x + 20, y + 90, verdicts[k][2], { taille: 11, couleur: ROUGE, police: MONO, poids: 700 })}`;
  });
  corps += `${icone('horloge', 400, 628, DISCRET, 0.9)}
    ${texte(420, 640, t('Chiffré par Android, sur les instructions AES du processeur : en Dart pur, cent mégaoctets prenaient une demi-minute.', 'Encrypted by Android, on the processor’s AES instructions: in pure Dart, a hundred megabytes took half a minute.'), { taille: 12.5, couleur: TEXTE })}
    ${texte(420, 660, t('Les sauvegardes passent par le même flux : une vidéo n’y tient jamais en mémoire d’un bloc.', 'Backups go through the same stream: a video never sits in memory in one block.'), { taille: 12.5, couleur: DISCRET })}`;

  svg('flux.svg', 1280, 720, corps, t(
    'Le flux chiffré par morceaux. Une vidéo d’Enzo de 6,4 Mo entre au coffre un mégaoctet à la fois : chaque tranche passe par un tampon d’un mégaoctet au plus, puis par AES-GCM natif avec la clé du coffre et un nonce neuf, et s’écrit dans le fichier BCV1, précédée de sa longueur et de son nonce, suivie de son étiquette. Chaque morceau authentifie aussi, sans l’écrire, son rang et le fait d’être le dernier ; le dernier, même vide, n’est écrit qu’à la fermeture. À la lecture, les sept étiquettes sont vérifiées et la vidéo se déchiffre dans le cache privé. Puis trois attaques : deux morceaux intervertis, et le morceau 2 est refusé ; la fin coupée, et le morceau 5, qui passe pour le dernier sans l’être, est refusé ; un octet changé dans le morceau 4, refusé. Chaque fois, la visionneuse affiche Vidéo illisible au lieu d’un contenu amputé.',
    'The chunked encrypted stream. A 6.4 MB video of Enzo enters the vault one megabyte at a time: each slice goes through a buffer of one megabyte at most, then through native AES-GCM with the vault key and a fresh nonce, and is written into the BCV1 file, preceded by its length and nonce, followed by its tag. Each chunk also authenticates, without writing them, its rank and whether it is the last; the last one, even empty, is only written on close. On reading, the seven tags are verified and the video is decrypted into the private cache. Then three attacks: two chunks swapped, and chunk 2 is refused; the end cut off, and chunk 5, which now looks like the last without being it, is refused; one byte changed in chunk 4, refused. Each time, the viewer shows Unreadable video instead of a truncated content.'));
};

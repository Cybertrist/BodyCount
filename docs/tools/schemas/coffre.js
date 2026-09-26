// La galerie privée : une photo et une vidéo, du sélecteur d'Android à
// l'écran, sans jamais passer en clair par la galerie du téléphone.
//
// À gauche, le téléphone : la fiche d'Enzo, « Photos et vidéos », le
// sélecteur, l'import qui chiffre, puis la visionneuse. À droite, où se
// trouve chaque fichier à chaque instant (lib/utils/medias.dart,
// lib/security/photo_vault.dart, video_vault.dart) : l'entrée, le coffre,
// et les trois sorties, la mémoire vive, le cache privé et la galerie.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, paliers, fondu, visible, entre, glisse, telephone, toucher, visage, icone,
    APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU, id } = O;
  const C = 34;
  let corps = entete(t('LE COFFRE', 'THE VAULT'),
    t('Chaque photo, chaque vidéo entre chiffrée. Elle ne ressort en clair que si tu le demandes.',
      'Every photo and video goes in encrypted. It only comes out in the clear if you ask for it.'));

  // Le visage d'Enzo, recadré à la demande : la même photo sert de photo
  // de fiche, de nouvelle photo et d'image de la vidéo, à des cadrages
  // différents. visage() n'est appelé qu'une fois, hors champ, pour que
  // le symbole soit embarqué.
  corps += `<g display="none">${visage(12, 0, 0, 1)}</g>`;
  function cadre(x, y, l, h, { zoom = 1, fx = 0.5, fy = 0.3, rx = 12, n = 12 } = {}) {
    const c = id('cadre');
    const cote = Math.max(l, h) * zoom;
    return `<clipPath id="${c}"><rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${rx}"/></clipPath>
    <g clip-path="url(#${c})"><rect x="${x}" y="${y}" width="${l}" height="${h}" fill="${APP.carte}"/>
      <use href="#visage${n}" xlink:href="#visage${n}" x="${x + l / 2 - cote * fx}" y="${y + h * 0.4 - cote * fy}" width="${cote}" height="${cote}"/></g>`;
  }
  // Les trois médias de la galerie d'Enzo : celle qu'il avait, la
  // nouvelle photo, la vidéo.
  const ANCIENNE = { zoom: 1 }, NOUVELLE = { zoom: 1.7, fx: 0.42, fy: 0.3 }, VIDEO = { zoom: 1.3, fx: 0.58, fy: 0.24 };
  const lecture = (cx, cy, r = 11) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#000000" fill-opacity="0.45" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="1.4"/>
    <path d="M${cx - r * 0.3} ${cy - r * 0.45} L${cx + r * 0.5} ${cy} L${cx - r * 0.3} ${cy + r * 0.45} Z" fill="#FFFFFF"/>`;
  const vignetteVideo = (x, y, s) => cadre(x, y, s, s, { ...VIDEO, rx: 10 }) + lecture(x + s / 2, y + s / 2 - 4, s * 0.17) +
    texte(x + s - 6, y + s - 6, '0:05', { taille: 9, couleur: '#FFFFFF', poids: 700, ancre: 'end' });

  // Un fichier chiffré : du bruit violet, un cadenas au milieu.
  corps += `<defs><pattern id="brouille" width="12" height="12" patternUnits="userSpaceOnUse">
    <rect width="12" height="12" fill="#2A1846"/>
    <rect width="4" height="4" fill="#5B2A8C"/><rect x="8" y="0" width="4" height="4" fill="#3D2263"/>
    <rect x="4" y="4" width="4" height="4" fill="#7C3AED" fill-opacity="0.7"/><rect x="0" y="8" width="4" height="4" fill="#4A1F73"/>
    <rect x="8" y="8" width="4" height="4" fill="#A855F7" fill-opacity="0.5"/><rect x="4" y="8" width="4" height="4" fill="#1F1233"/>
  </pattern></defs>`;
  const chiffre = (x, y, s) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="9" fill="url(#brouille)" stroke="${VIOLET}" stroke-opacity="0.7"/>
    <circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s * 0.24}" fill="#0B0616" fill-opacity="0.75"/>
    ${icone('cadenas', x + s / 2 - s * 0.16, y + s / 2 - s * 0.16, APP.rose, s * 0.02)}`;
  // Une photo de paysage quelconque, pour la galerie du téléphone.
  const PAYSAGES = [['#F6AD55', '#9C4221'], ['#63B3ED', '#2C5282'], ['#68D391', '#276749'], ['#F687B3', '#702459'], ['#B794F4', '#44337A'], ['#FBD38D', '#975A16'], ['#90CDF4', '#2A4365'], ['#9AE6B4', '#22543D'], ['#FEB2B2', '#9B2C2C'], ['#A3BFFA', '#3C366B'], ['#FAF089', '#744210']];
  corps += `<defs>${PAYSAGES.map(([a, b], i) => `<linearGradient id="paysage${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join('')}</defs>`;
  const paysage = (x, y, s, i) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="6" fill="url(#paysage${i % PAYSAGES.length})"/>
    <circle cx="${x + s * 0.72}" cy="${y + s * 0.3}" r="${s * 0.1}" fill="#FFFFFF" fill-opacity="0.7"/>
    <path d="M${x} ${y + s * 0.85} L${x + s * 0.35} ${y + s * 0.5} L${x + s * 0.6} ${y + s * 0.72} L${x + s * 0.78} ${y + s * 0.6} L${x + s} ${y + s * 0.82} V${y + s - 6} a6 6 0 0 1 -6 6 H${x + 6} a6 6 0 0 1 -6 -6 Z" fill="#000000" fill-opacity="0.28"/>`;

  // Le déroulé, en fraction du cycle.
  const AJOUT = 0.03, BOUTON = 0.07, CHOIX = [0.1, 0.118], VALIDE = 0.14;
  const MSG = [0.15, 0.21, 0.25, 0.315], PHOTO_IN = 0.2, VIGN_IN = 0.245, VIDEO_IN = 0.31, RETOUR = 0.33;
  const OUVRE = 0.415, GLISSE = 0.535, LIT = 0.585, SORT = 0.665, FERME = 0.79, FIN = 0.985;

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // La fiche d'Enzo. [n] : le nombre de médias de sa galerie.
  const fiche = (n, touche) => {
    let s = `${cadre(SX, SY, SL, 236, { zoom: 1, fy: 0.28, rx: 0 })}
      <rect x="${SX}" y="${SY}" width="${SL}" height="236" fill="url(#voile)"/>
      <circle cx="${SX + 26}" cy="${SY + 28}" r="14" fill="#000000" fill-opacity="0.4"/>
      <path d="M${SX + 30} ${SY + 22} l-6 6 l6 6" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="${SX + 16}" y="${SY + 172}" width="44" height="18" rx="9" fill="${APP.vert}"/>
      ${texte(SX + 38, SY + 185, 'N°12', { taille: 9.5, couleur: '#062B12', poids: 800, ancre: 'middle' })}
      <rect x="${SX + 66}" y="${SY + 172}" width="48" height="18" rx="9" fill="#000000" fill-opacity="0.45"/>
      ${texte(SX + 90, SY + 185, t('23 ans', 'age 23'), { taille: 9.5, couleur: '#FFFFFF', poids: 600, ancre: 'middle' })}
      <rect x="${SX + 120}" y="${SY + 172}" width="58" height="18" rx="9" fill="#000000" fill-opacity="0.45"/>
      ${texte(SX + 149, SY + 185, 'Vannes', { taille: 9.5, couleur: '#FFFFFF', poids: 600, ancre: 'middle' })}
      ${texte(SX + 16, SY + 222, 'Enzo P.', { taille: 26, couleur: '#FFFFFF', poids: 800 })}
      ${texte(SX + 18, SY + 268, '3,8', { taille: 17, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 108, SY + 268, '7', { taille: 17, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 108, SY + 283, t('FOIS', 'TIMES'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}
      ${texte(SX + 196, SY + 268, '347 j', { taille: 17, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 196, SY + 283, t('DEPUIS', 'SINCE'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}
      ${O.etoiles(SX + 18, SY + 284, 8, { taille: 8 })}
      ${texte(SX + 16, SY + 318, t(`GALERIE · ${n}`, `GALLERY · ${n}`), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.5"' })}`;
    const G = 60, gy = SY + 330;
    const medias = [(x) => cadre(x, gy, G, G, { ...ANCIENNE, rx: 12 }), (x) => cadre(x, gy, G, G, { ...NOUVELLE, rx: 12 }), (x) => vignetteVideo(x, gy, G)];
    for (let i = 0; i < n; i++) s += medias[i](SX + 16 + i * (G + 8));
    const px = SX + 16 + n * (G + 8);
    s += `<rect x="${px}" y="${gy}" width="${G}" height="${G}" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
      <path d="M${px + G / 2 - 8} ${gy + G / 2} h16 M${px + G / 2} ${gy + G / 2 - 8} v16" stroke="${APP.second}" stroke-width="2" stroke-linecap="round"/>
      ${texte(SX + 16, SY + 424, 'INFOS', { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.5"' })}
      <rect x="${SX + 12}" y="${SY + 434}" width="${SL - 24}" height="40" rx="12" fill="${APP.carte}"/>
      ${texte(SX + 26, SY + 458, t('Téléphone', 'Phone'), { taille: 11, couleur: APP.second })}
      ${texte(SX + SL - 26, SY + 458, '07 15 93 62 08', { taille: 11, couleur: APP.texte, poids: 700, ancre: 'end' })}
      <rect x="${SX + 12}" y="${SY + SH - 58}" width="40" height="40" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${icone('telephoneIcone', SX + 24, SY + SH - 46, APP.second)}
      ${O.bouton(SX + 60, SY + SH - 58, SL - 72, 40, t('+  Nouvelle rencontre', '+  New encounter'), { taille: 12 })}`;
    if (touche) s += toucher(...touche);
    return s;
  };
  ecran += entre(C, 0, 0.045, fiche(1, [SX + 16 + 68 + 30, SY + 360, C, AJOUT]), 0.004);
  ecran += entre(C, 0.34, 0.43, fiche(3, [SX + 16 + 68 + 30, SY + 360, C, OUVRE]), 0.004);
  ecran += entre(C, 0.8, FIN, fiche(3), 0.004);

  // « Photos et vidéos », l'écran de la galerie, avant et pendant l'import.
  const TG = (SL - 40) / 3;
  const tuileG = (i) => [SX + 12 + (i % 3) * (TG + 8), SY + 112 + Math.floor(i / 3) * (TG + 8)];
  const galerie = (importe) => {
    let s = `<path d="M${SX + 26} ${SY + 38} l-6 6 l6 6" fill="none" stroke="${APP.texte}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${texte(SX + 44, SY + 50, t('Photos et vidéos', 'Photos and videos'), { taille: 17, couleur: APP.texte, poids: 700 })}
      ${cadre(...tuileG(0), TG, TG, { ...ANCIENNE, rx: 12 })}`;
    if (importe) {
      const msg = (de, a, fr, en) => entre(C, de, a, texte(SX + 16, SY + 82, t(fr, en), { taille: 11.5, couleur: APP.second }), 0.003);
      s += msg(MSG[0], MSG[1], 'Chiffrement, 1 sur 2…', 'Encrypting, 1 of 2…');
      s += msg(MSG[1], MSG[2], 'Chiffrement de la vidéo, 2 sur 2…', 'Encrypting the video, 2 of 2…');
      [[MSG[2], 0.265, 12], [0.265, 0.28, 38], [0.28, 0.297, 64], [0.297, MSG[3], 91]].forEach(([de, a, p]) => {
        s += msg(de, a, `Allègement de la vidéo, ${p} %…`, `Shrinking the video, ${p}%…`);
      });
      s += entre(C, MSG[0], MSG[3], `<rect x="${SX + 16}" y="${SY + 92}" width="${SL - 32}" height="3" rx="1.5" fill="${APP.bord}"/>
        <rect x="${SX + 16}" y="${SY + 92}" height="3" rx="1.5" width="60" fill="${APP.violet}">
          <animate attributeName="x" dur="1.4s" repeatCount="indefinite" values="${SX + 16};${SX + SL - 76};${SX + 16}"/></rect>`, 0.003);
      s += entre(C, PHOTO_IN, 1, cadre(...tuileG(1), TG, TG, { ...NOUVELLE, rx: 12 }), 0.004);
      s += entre(C, VIDEO_IN, 1, vignetteVideo(...tuileG(2), TG), 0.004);
      s += toucher(SX + 26, SY + 44, C, RETOUR);
    }
    s += `<rect x="${SX + SL - 118}" y="${SY + SH - 70}" width="102" height="46" rx="16" fill="${APP.violet}" ${importe ? 'fill-opacity="0.35"' : ''}/>
      ${icone('photo', SX + SL - 104, SY + SH - 55, '#FFFFFF')}
      ${texte(SX + SL - 82, SY + SH - 42, t('Ajouter', 'Add'), { taille: 13, couleur: '#FFFFFF', poids: 700 })}`;
    if (!importe) s += toucher(SX + SL - 67, SY + SH - 47, C, BOUTON);
    return s;
  };
  ecran += entre(C, 0.045, 0.085, galerie(false), 0.004);
  ecran += entre(C, 0.15, 0.34, galerie(true), 0.004);

  // Le sélecteur d'Android : ce n'est plus BodyCount, c'est le système.
  {
    const TP = (SL - 24 - 6) / 4;
    const case_ = (i) => [SX + 12 + (i % 4) * (TP + 2), SY + 96 + Math.floor(i / 4) * (TP + 2)];
    let s = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#1B1B1F"/>
      ${icone('croix', SX + 18, SY + 36, '#E3E2E6')}
      ${texte(SX + 46, SY + 49, t('Sélectionner des éléments', 'Select items'), { taille: 14, couleur: '#E3E2E6', poids: 600 })}
      ${texte(SX + 16, SY + 84, t('Aujourd’hui', 'Today'), { taille: 11, couleur: '#C4C6D0', poids: 600 })}`;
    for (let i = 0; i < 20; i++) {
      const [x, y] = case_(i);
      if (i === 1) s += cadre(x, y, TP, TP, { ...NOUVELLE, rx: 2 });
      else if (i === 2) s += cadre(x, y, TP, TP, { ...VIDEO, rx: 2 }) + texte(x + TP - 5, y + TP - 5, '0:05', { taille: 8.5, couleur: '#FFFFFF', poids: 700, ancre: 'end' });
      else s += `<g opacity="0.85">${paysage(x, y, TP, i)}</g>`;
    }
    [1, 2].forEach((i, k) => {
      const [x, y] = case_(i);
      s += `<circle cx="${x + 11}" cy="${y + 11}" r="8" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>`;
      s += entre(C, CHOIX[k], 1, `<rect x="${x + 1}" y="${y + 1}" width="${TP - 2}" height="${TP - 2}" rx="2" fill="none" stroke="#A8C7FA" stroke-width="3"/>
        <circle cx="${x + 11}" cy="${y + 11}" r="9" fill="#A8C7FA"/>${texte(x + 11, y + 14.5, String(k + 1), { taille: 10, couleur: '#062E6F', poids: 800, ancre: 'middle' })}`, 0.003);
      s += toucher(x + TP / 2, y + TP / 2, C, CHOIX[k]);
    });
    s += `<rect x="${SX}" y="${SY + SH - 70}" width="${SL}" height="70" fill="#1B1B1F"/>
      <rect x="${SX + SL - 124}" y="${SY + SH - 56}" width="108" height="38" rx="19" fill="#A8C7FA"/>
      ${texte(SX + SL - 70, SY + SH - 32, t('Ajouter (2)', 'Add (2)'), { taille: 12.5, couleur: '#062E6F', poids: 700, ancre: 'middle' })}
      ${toucher(SX + SL - 70, SY + SH - 37, C, VALIDE)}`;
    ecran += entre(C, 0.085, 0.15, s, 0.004);
  }

  // La visionneuse : la photo, puis la vidéo, sur fond noir.
  const barre = (rang) => `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
    ${icone('croix', SX + 18, SY + 34, '#FFFFFF')}
    ${texte(SX + SL / 2, SY + 47, `${rang} / 3`, { taille: 13, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
    ${icone('telecharger', SX + SL - 64, SY + 34, '#FFFFFF')}
    <circle cx="${SX + SL - 25}" cy="${SY + 37}" r="1.6" fill="#FFFFFF"/><circle cx="${SX + SL - 25}" cy="${SY + 42}" r="1.6" fill="#FFFFFF"/><circle cx="${SX + SL - 25}" cy="${SY + 47}" r="1.6" fill="#FFFFFF"/>`;
  ecran += entre(C, 0.43, 0.55, `${barre(2)}${cadre(SX, SY + 140, SL, SL, { ...NOUVELLE, rx: 0 })}
    ${toucher(SX + SL - 50, SY + 280, C, GLISSE)}`, 0.004);
  {
    const VY = SY + 160, VH = 230;
    let s = `${barre(3)}
      ${entre(C, 0.55, LIT, `<circle cx="${SX + SL / 2}" cy="${VY + VH / 2 - 14}" r="14" fill="none" stroke="${APP.violet}" stroke-width="3" stroke-dasharray="60 30">
          <animateTransform attributeName="transform" type="rotate" from="0 ${SX + SL / 2} ${VY + VH / 2 - 14}" to="360 ${SX + SL / 2} ${VY + VH / 2 - 14}" dur="0.9s" repeatCount="indefinite"/></circle>
        ${texte(SX + SL / 2, VY + VH / 2 + 26, t('Déchiffrement…', 'Decrypting…'), { taille: 12.5, couleur: '#D8CCEF', poids: 600, ancre: 'middle' })}`, 0.003)}
      ${entre(C, LIT, 1, `${cadre(SX, VY, SL, VH, { ...VIDEO, rx: 0 })}
        ${texte(SX + 16, SY + SH - 34, '0:01', { taille: 10.5, couleur: '#FFFFFF' })}
        ${texte(SX + SL - 16, SY + SH - 34, '0:05', { taille: 10.5, couleur: '#FFFFFF', ancre: 'end' })}
        <rect x="${SX + 48}" y="${SY + SH - 41}" width="${SL - 96}" height="4" rx="2" fill="#FFFFFF" fill-opacity="0.25"/>
        <rect x="${SX + 48}" y="${SY + SH - 41}" height="4" rx="2" fill="${APP.violet}" width="0">${fondu('width', C, [[0, 0], [LIT, 0], [FERME, SL - 96], [1, SL - 96]])}</rect>`, 0.003)}
      ${toucher(SX + SL - 57, SY + 41, C, SORT)}
      ${entre(C, SORT + 0.01, 0.78, `<rect x="${SX + 10}" y="${SY + SH - 122}" width="${SL - 20}" height="58" rx="10" fill="#322F37"/>
        ${texte(SX + 24, SY + SH - 97, t('Enregistrée dans Films › BodyCount,', 'Saved to Movies › BodyCount,'), { taille: 11.5, couleur: '#F4EFF4' })}
        ${texte(SX + 24, SY + SH - 79, t('en clair, hors du coffre.', 'in the clear, outside the vault.'), { taille: 11.5, couleur: '#F4EFF4' })}`, 0.004)}
      ${toucher(SX + 24, SY + 41, C, FERME)}`;
    ecran += entre(C, 0.55, 0.8, s, 0.004);
  }
  corps += T.ecran(ecran);

  // ------------------------------------------------ où est chaque fichier
  const EX = 400, EL = 200, KX = 636, KL = 280, SXo = 952, SLo = 268, HY = 120;
  corps += rubrique(EX, 108, t('ENTRÉE', 'IN'));
  corps += rubrique(KX, 108, t('LE COFFRE', 'THE VAULT'));
  corps += rubrique(SXo, 108, t('SORTIES', 'OUT'));

  // L'entrée : la copie temporaire du sélecteur.
  corps += `<rect x="${EX}" y="${HY}" width="${EL}" height="300" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    ${texte(EX + 18, HY + 30, t('Le sélecteur', 'The system picker'), { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(EX + 18, HY + 50, t('rend une copie temporaire,', 'hands over a temporary copy,'), { taille: 12 })}
    ${texte(EX + 18, HY + 67, t('lisible par d’autres applis', 'readable by other apps'), { taille: 12 })}`;
  const ENT = [[EX + 22, HY + 92], [EX + 106, HY + 92]], ES = 72;
  const entree = (i, dessin, part) => `<rect x="${ENT[i][0]}" y="${ENT[i][1]}" width="${ES}" height="${ES}" rx="10" fill="none" stroke="${FIL}" stroke-dasharray="4 4"/>
    ${entre(C, VALIDE + 0.004, part, dessin + texte(ENT[i][0] + ES / 2, ENT[i][1] + ES + 18, t('en clair', 'in the clear'), { taille: 11, couleur: OR, police: MONO, poids: 700, ancre: 'middle' }), 0.005)}
    ${entre(C, part, FIN, texte(ENT[i][0] + ES / 2, ENT[i][1] + ES + 18, t('effacée', 'deleted'), { taille: 11, couleur: DISCRET, police: MONO, ancre: 'middle' }), 0.005)}`;
  corps += entree(0, cadre(ENT[0][0], ENT[0][1], ES, ES, { ...NOUVELLE, rx: 10 }), PHOTO_IN);
  corps += entree(1, vignetteVideo(ENT[1][0], ENT[1][1], ES), VIDEO_IN);
  corps += `<line x1="${EX + 18}" y1="${HY + 204}" x2="${EX + EL - 18}" y2="${HY + 204}" stroke="${BORD}"/>
    ${texte(EX + 18, HY + 228, t('La durée et une image de la', 'The length and one frame of'), { taille: 11.5 })}
    ${texte(EX + 18, HY + 245, t('vidéo se lisent avant, sur', 'the video are read first, on'), { taille: 11.5 })}
    ${texte(EX + 18, HY + 262, t('le fichier encore en clair.', 'the file still in the clear.'), { taille: 11.5 })}
    ${texte(EX + 18, HY + 284, t('Puis l’original est effacé.', 'Then the original is deleted.'), { taille: 11.5, couleur: TITRE })}`;

  // Le coffre.
  corps += `<rect x="${KX}" y="${HY}" width="${KL}" height="300" rx="13" fill="${CARTE}" stroke="${VIOLET}" stroke-opacity="0.55"/>
    <rect x="${KX}" y="${HY}" width="${KL}" height="300" rx="13" fill="none" stroke="${VIOLET}" stroke-width="2" filter="url(#halo)" opacity="0.25"/>
    ${icone('cadenas', KX + 18, HY + 17, ACCENT, 1.1)}
    ${texte(KX + 42, HY + 30, 'vault/', { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(KX + KL - 18, HY + 30, t('dossier privé de l’appli', 'app’s private folder'), { taille: 11, couleur: DISCRET, ancre: 'end' })}`;
  const RANGS = [
    ['3f9c…a1.bcx', t('photo · BCX1, un seul bloc', 'photo · BCX1, one block'), PHOTO_IN],
    ['7c02…5e.bcx', t('image de la vidéo · BCX1', 'video frame · BCX1'), VIGN_IN],
    ['e9b4…d0.bcx', t('vidéo · BCV1, par morceaux', 'video · BCV1, in chunks'), VIDEO_IN],
  ];
  const KS = 44, rangY = (i) => HY + 52 + i * 62;
  RANGS.forEach(([nom, sous, de], i) => {
    const y = rangY(i);
    corps += `<rect x="${KX + 16}" y="${y}" width="${KL - 32}" height="54" rx="10" fill="none" stroke="${FIL}" stroke-dasharray="4 4"/>
      ${entre(C, de, FIN, `<rect x="${KX + 16}" y="${y}" width="${KL - 32}" height="54" rx="10" fill="#171022" stroke="${BORD}"/>
        ${chiffre(KX + 21, y + 5, KS)}
        ${texte(KX + 76, y + 24, nom, { taille: 12.5, couleur: TITRE, police: MONO, poids: 700 })}
        ${texte(KX + 76, y + 42, sous, { taille: 11.5 })}`, 0.005)}`;
  });
  corps += `<line x1="${KX + 16}" y1="${HY + 246}" x2="${KX + KL - 16}" y2="${HY + 246}" stroke="${BORD}"/>
    ${texte(KX + 18, HY + 268, t('AES-GCM, clé tirée de la clé maîtresse.', 'AES-GCM, key derived from the master key.'), { taille: 11.5 })}
    ${texte(KX + 18, HY + 285, t('Les autres applis n’y ont pas accès.', 'Other apps have no access to it.'), { taille: 11.5 })}`;
  // L'allègement, le temps que la vidéo y passe.
  corps += entre(C, MSG[2], VIDEO_IN, `<rect x="${KX + 16}" y="${rangY(2)}" width="${KL - 32}" height="54" rx="10" fill="${OR}" fill-opacity="0.08" stroke="${OR}" stroke-opacity="0.6"/>
    ${texte(KX + KL / 2, rangY(2) + 23, t('allégée d’abord : 720p, H.264', 'shrunk first: 720p, H.264'), { taille: 12, couleur: OR, poids: 700, ancre: 'middle' })}
    ${texte(KX + KL / 2, rangY(2) + 41, t('gardée si elle gagne un dixième', 'kept if it saves a tenth'), { taille: 11, couleur: TEXTE, ancre: 'middle' })}`, 0.004);

  // Les trois sorties.
  const SORTIES = [
    [VIOLET, t('Mémoire vive', 'Memory'), t('la photo déchiffrée à l’écran,', 'the photo decrypted for display,'), t('40 au plus, vidées au verrou', '40 at most, cleared on lock'), OUVRE + 0.03, FIN],
    [BLEU, t('Cache privé · lecture/', 'Private cache · lecture/'), t('la vidéo en clair le temps', 'the video in the clear while'), t('de la lire, puis effacée', 'it plays, then deleted'), LIT, FERME],
    [OR, t('Galerie · Films/BodyCount', 'Gallery · Movies/BodyCount'), t('une copie en clair, seulement', 'a copy in the clear, only'), t('si tu touches le bouton', 'if you tap the button'), SORT + 0.025, FIN],
  ];
  const sortieY = (i) => HY + i * 102;
  SORTIES.forEach(([c, titre, l1, l2, de, a], i) => {
    const y = sortieY(i);
    corps += `<rect x="${SXo}" y="${y}" width="${SLo}" height="92" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${SXo}" y="${y}" width="${SLo}" height="92" rx="13" fill="none" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, de, a)}</rect>
      ${texte(SXo + 18, y + 28, titre, { taille: 13, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(SXo + 18, y + 50, l1, { taille: 11.5 })}
      ${texte(SXo + 18, y + 67, l2, { taille: 11.5 })}`;
  });
  // Ce que contient chaque sortie, quand elle sert.
  const MS = 40, mx = SXo + SLo - MS - 14;
  corps += entre(C, OUVRE + 0.03, FIN, cadre(mx, sortieY(0) + 40, MS, MS, { ...NOUVELLE, rx: 8 }), 0.005);
  corps += entre(C, LIT, FERME, cadre(mx, sortieY(1) + 40, MS, MS, { ...VIDEO, rx: 8 }) + lecture(mx + MS / 2, sortieY(1) + 60, 8), 0.005);
  corps += entre(C, FERME, FIN, texte(SXo + SLo - 14, sortieY(1) + 28, t('effacée', 'deleted'), { taille: 11, couleur: ROUGE, police: MONO, poids: 700, ancre: 'end' }), 0.005);
  corps += entre(C, SORT + 0.025, FIN, cadre(mx, sortieY(2) + 40, MS, MS, { ...VIDEO, rx: 8 }) + lecture(mx + MS / 2, sortieY(2) + 60, 8), 0.005);

  // Les fichiers qui voyagent d'une colonne à l'autre. [change] : l'instant
  // (en part du trajet) où le clair devient chiffré, ou l'inverse.
  function voyage(de, a, [x1, y1], [x2, y2], avant, apres, s = 44) {
    const m = de + (a - de) * 0.5;
    const pos = [[0, `${x1} ${y1}`], [de, `${x1} ${y1}`], [a, `${x2} ${y2}`], [1, `${x2} ${y2}`]];
    return `<g opacity="0">${visible(C, de, a, 0.004)}
      <g>${glisse(C, pos)}
        <g filter="url(#halo)"><rect x="-4" y="-4" width="${s + 8}" height="${s + 8}" rx="12" fill="${VIOLET}" opacity="0.25"/></g>
        <g opacity="1">${fondu('opacity', C, [[0, 1], [de, 1], [m - 0.004, 1], [m + 0.004, 0], [1, 0]])}${avant(s)}</g>
        <g opacity="0">${fondu('opacity', C, [[0, 0], [m - 0.004, 0], [m + 0.004, 1], [1, 1]])}${apres(s)}</g>
      </g></g>`;
  }
  const clairPhoto = (s) => cadre(0, 0, s, s, { ...NOUVELLE, rx: 9 });
  const clairVideo = (s) => cadre(0, 0, s, s, { ...VIDEO, rx: 9 }) + lecture(s / 2, s / 2, s * 0.18);
  const brouille = (s) => chiffre(0, 0, s);
  // Les fils, sous les billes.
  const fils = [
    `M${EX + EL} ${HY + 128} H${KX}`,
    `M${KX + KL} ${rangY(0) + 27} H${SXo}`,
    `M${KX + KL} ${rangY(2) + 27} C${KX + KL + 20} ${rangY(2) + 27} ${SXo - 20} ${sortieY(1) + 46} ${SXo} ${sortieY(1) + 46}`,
    `M${SXo + SLo / 2} ${sortieY(1) + 92} V${sortieY(2)}`,
  ];
  corps += fils.map((d) => `<path d="${d}" fill="none" stroke="${FIL}" stroke-width="1.6" stroke-dasharray="3 5"/>`).join('');
  corps += voyage(0.16, PHOTO_IN, [ENT[0][0] + 14, ENT[0][1] + 14], [KX + 21, rangY(0) + 5], clairPhoto, brouille);
  corps += voyage(0.215, VIGN_IN, [ENT[1][0] + 14, ENT[1][1] + 14], [KX + 21, rangY(1) + 5], (s) => cadre(0, 0, s, s, { ...VIDEO, rx: 9 }), brouille);
  corps += voyage(MSG[3] - 0.03, VIDEO_IN, [ENT[1][0] + 14, ENT[1][1] + 14], [KX + 21, rangY(2) + 5], clairVideo, brouille);
  corps += voyage(OUVRE, OUVRE + 0.03, [KX + 21, rangY(0) + 5], [mx - 2, sortieY(0) + 38], brouille, clairPhoto);
  corps += voyage(0.55, LIT, [KX + 21, rangY(2) + 5], [mx - 2, sortieY(1) + 38], brouille, clairVideo);
  corps += voyage(SORT, SORT + 0.025, [mx - 2, sortieY(1) + 38], [mx - 2, sortieY(2) + 38], clairVideo, clairVideo);

  // ------------------------------------------------ la galerie du téléphone
  const GX = 400, GY = 452, GL = 470, GH = 234;
  corps += `<rect x="${GX}" y="${GY}" width="${GL}" height="${GH}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    ${rubrique(GX + 18, GY + 28, t('LA GALERIE DU TÉLÉPHONE', 'THE PHONE’S GALLERY'))}`;
  const GS = 58, gpas = 64;
  // Les photos de tous les jours ; à la sortie, elles se décalent d'une
  // case pour laisser la place à la copie.
  let tuiles = '';
  for (let i = 0; i < 13; i++) tuiles += paysage(GX + 18 + (i % 7) * gpas, GY + 44 + Math.floor(i / 7) * gpas, GS, i + 3);
  corps += `<clipPath id="grilleTel"><rect x="${GX + 18}" y="${GY + 44}" width="${7 * gpas - 6}" height="${2 * gpas}"/></clipPath>
    <g clip-path="url(#grilleTel)">${tuiles}</g>`;
  corps += entre(C, SORT + 0.025, FIN, `<rect x="${GX + 18 + 6 * gpas}" y="${GY + 44 + gpas}" width="${GS}" height="${GS}" rx="6" fill="${CARTE}"/>
    ${cadre(GX + 18 + 6 * gpas, GY + 44 + gpas, GS, GS, { ...VIDEO, rx: 6 })}${lecture(GX + 18 + 6 * gpas + GS / 2, GY + 44 + gpas + GS / 2, 10)}
    <rect x="${GX + 18 + 6 * gpas}" y="${GY + 44 + gpas}" width="${GS}" height="${GS}" rx="6" fill="none" stroke="${OR}" stroke-width="2"/>`, 0.005);
  corps += entre(C, 0, SORT + 0.025, `${icone('coche', GX + 18, GY + GH - 50, VERT, 1)}
    ${texte(GX + 42, GY + GH - 38, t('Aucune photo de BodyCount ici : ni les tiennes, ni leurs vignettes.', 'No BodyCount photo here: not yours, not their thumbnails.'), { taille: 12.5, couleur: TITRE, poids: 700 })}
    ${texte(GX + 42, GY + GH - 18, t('La copie du sélecteur est effacée dès l’entrée au coffre.', 'The picker’s copy is deleted as soon as it enters the vault.'), { taille: 12 })}`, 0.005);
  corps += entre(C, SORT + 0.025, FIN, `${icone('telecharger', GX + 18, GY + GH - 50, OR, 1)}
    ${texte(GX + 42, GY + GH - 38, t('Une copie, parce que tu l’as demandée.', 'One copy, because you asked for it.'), { taille: 12.5, couleur: OR, poids: 700 })}
    ${texte(GX + 42, GY + GH - 18, t('Hors du coffre, elle peut partir avec la sauvegarde photo.', 'Outside the vault, it can leave with the photo backup.'), { taille: 12 })}`, 0.005);

  // ------------------------------------------------ deux cartes
  const cartes = [
    [ROUGE, t('Un octet changé : rien', 'One byte changed: nothing'), t('AES-GCM authentifie chaque fichier.', 'AES-GCM authenticates every file.'), t('Touché, il rend un carré vide.', 'Tampered with, it shows an empty tile.')],
    [VIOLET, t('Au verrou, tout part', 'On lock, it all goes'), t('Le cache des photos est vidé, les', 'The photo cache is cleared, playback'), t('copies de lecture aussi, même après un arrêt brutal.', 'copies too, even after a crash.')],
  ];
  cartes.forEach(([c, titre, l1, l2], i) => {
    const y = GY + i * 124;
    corps += `<rect x="890" y="${y}" width="330" height="110" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(910, y + 34, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(910, y + 60, l1, { taille: 12 })}
      ${texte(910, y + 80, l2, { taille: 12 })}`;
  });

  svg('coffre.svg', 1280, 720, corps, t(
    'Le coffre des photos et des vidéos. Sur la fiche d’Enzo, Photos et vidéos, puis Ajouter : le sélecteur d’Android rend une photo et une vidéo en copies temporaires, en clair. La photo entre au coffre chiffrée d’un seul bloc en AES-GCM ; la vidéo laisse d’abord sa durée et une image, qui devient sa vignette chiffrée, puis est allégée et chiffrée par morceaux. Chaque original est effacé, et rien n’apparaît dans la galerie du téléphone. Dans la visionneuse, la photo est déchiffrée en mémoire vive ; la vidéo est déchiffrée dans le cache privé le temps de la lecture, puis effacée à la fermeture. Le bouton de téléchargement en pose une copie en clair dans Films › BodyCount, seulement sur demande. Un fichier modifié d’un octet est refusé, et au verrouillage le cache des photos et les copies de lecture disparaissent.',
    'The photo and video vault. On Enzo’s card, Photos and videos, then Add: the Android picker hands over a photo and a video as temporary copies, in the clear. The photo enters the vault encrypted as one AES-GCM block; the video first gives up its length and one frame, which becomes its encrypted thumbnail, then is shrunk and encrypted in chunks. Each original is deleted, and nothing shows up in the phone’s gallery. In the viewer, the photo is decrypted in memory; the video is decrypted into the private cache while it plays, then deleted on close. The download button puts a copy in the clear into Movies › BodyCount, only when asked. A file changed by one byte is refused, and on lock the photo cache and the playback copies are gone.'));
};

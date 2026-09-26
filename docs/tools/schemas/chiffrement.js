// D'où viennent les clés, et ce qu'elles ouvrent.
//
// À gauche, l'appli telle qu'elle est : l'écran de verrou, la demande
// d'Android, puis le répertoire qui s'ouvre en deux temps, les textes
// quand la base s'ouvre, les visages qui se déchiffrent quand la clé du
// coffre arrive ; la fiche d'Enzo, sa grande photo et sa galerie ; puis
// le verrou, et ce qu'un voleur trouve dans les fichiers. À droite, la
// chaîne de lib/security/key_vault.dart : l'empreinte, la clé maîtresse
// du Keystore, HKDF et ses deux étiquettes. Dessous, les trois fichiers
// du disque, tels qu'un voleur les lit, puis tels que l'appli les voit.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, empreinte, logo, icone, visage,
    etoiles, pastille, bouton, barreNav, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU } = O;
  const C = 34;
  // Le verrou et la demande d'Android.
  const TOUCHE = 0.04, DEMANDE = 0.055, DOIGT = 0.1, OUVRE = 0.135;
  // La chaîne, étape par étape.
  const A = 0.1, B = 0.145, H = 0.19, D1 = 0.23, D2 = 0.27, BASE = 0.245, COFFRE = 0.285;
  // La fiche d'Enzo, puis le verrou et la vue du voleur.
  const TAPE = 0.43, FICHE = 0.45, VERR = 0.68, VOL = 0.7, FIN = 0.965;
  let corps = entete(t('LE CHIFFREMENT', 'ENCRYPTION'),
    t('Une clé tirée au hasard, rangée dans le Keystore, et deux clés qui en descendent.',
      'One random key, kept in the Keystore, and two keys that descend from it.'));

  // Une bille qui ne passe qu'une fois par tour, de [de] à [a].
  const bille = (chemin, de, a, couleur = ACCENT) => {
    const m = `<animateMotion dur="${C}s" repeatCount="indefinite" path="${chemin}" keyPoints="0;0;1;1" keyTimes="0;${de};${a};1" calcMode="linear"/>`;
    return `<g opacity="0">${visible(C, de, a, 0.006)}
      <circle r="9" fill="${couleur}" opacity="0.25" filter="url(#halo)">${m}</circle>
      <circle r="3.5" fill="#FFFFFF">${m}</circle></g>`;
  };
  // Un fil qui se colore une fois la bille passée, jusqu'au verrou.
  const fil = (chemin, de, couleur = ACCENT) => `<path d="${chemin}" fill="none" stroke="${FIL}" stroke-width="1.8"/>
    <path d="${chemin}" fill="none" stroke="${couleur}" stroke-width="1.8" stroke-opacity="0.7" opacity="0">${visible(C, de, VERR)}</path>`;

  // Une image qui se déchiffre : floue et pâle, puis nette, de [de] à [a].
  // Au verrou, elle retombe dans le flou.
  let _flous = 0;
  const dechiffre = (contenu, de, a) => {
    const id = `dechiffre${_flous++}`;
    return `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="14">${fondu('stdDeviation', C, [[0, 14], [de, 14], [a, 0], [VERR, 0], [VERR + 0.01, 14], [1, 14]])}</feGaussianBlur></filter>
      <g filter="url(#${id})" opacity="0">${fondu('opacity', C, [[0, 0], [de, 0], [de + 0.006, 0.55], [a, 1], [VERR, 1], [VERR + 0.01, 0], [1, 0]])}${contenu}</g>`;
  };

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';
  const CX = SX + SL / 2;

  // L'écran de verrou, comme lib/ecrans/verrouillage.dart : le logo, le
  // nom, la promesse, le bouton d'empreinte qu'une ligne de lecture balaie.
  const libelle = (s, c = APP.second) => texte(CX, SY + 470, s, { taille: 12.5, couleur: c, poids: 600, ancre: 'middle' });
  ecran += entre(C, 0, OUVRE, `
    ${logo(CX, SY + 128, 76)}
    ${texte(CX, SY + 212, 'BodyCount', { taille: 30, couleur: APP.texte, poids: 800, ancre: 'middle' })}
    ${texte(CX, SY + 240, t('Tout reste sur cet appareil. Aucun compte,', 'Everything stays on this device. No account,'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    ${texte(CX, SY + 257, t('aucun serveur, aucune requête réseau.', 'no server, no network request.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    <circle cx="${CX}" cy="${SY + 380}" r="58" fill="${VIOLET}" opacity="0.12"><animate attributeName="r" dur="2.6s" repeatCount="indefinite" values="50;62;50"/></circle>
    <circle cx="${CX}" cy="${SY + 380}" r="46" fill="url(#marque)"/>
    ${empreinte(CX, SY + 380, 44, '#FFFFFF')}
    <clipPath id="lectureVerrou"><circle cx="${CX}" cy="${SY + 380}" r="30"/></clipPath>
    <g clip-path="url(#lectureVerrou)"><rect x="${CX - 30}" y="${SY + 350}" width="60" height="5" fill="#FFFFFF" opacity="0.85">
      <animate attributeName="y" dur="2.2s" repeatCount="indefinite" values="${SY + 346};${SY + 410};${SY + 410}" keyTimes="0;0.7;1"/></rect></g>
    ${entre(C, 0, TOUCHE, libelle(t('Touche le capteur pour ouvrir', 'Touch the sensor to open')), 0.004)}
    ${entre(C, TOUCHE, OUVRE, libelle(t('Vérification…', 'Checking…'), APP.rose), 0.004)}
    ${icone('cadenas', SX + 38, SY + SH - 40, APP.vert, 0.75)}
    ${texte(SX + 54, SY + SH - 29, t('Base chiffrée, clé rangée dans le Keystore', 'Encrypted database, key kept in the Keystore'), { taille: 10, couleur: APP.second, poids: 600 })}
    ${toucher(CX, SY + 380, C, TOUCHE)}`, 0.006);

  // La demande d'Android, par-dessus : le code du téléphone est accepté aussi.
  const BY = SY + SH - 262;
  ecran += entre(C, DEMANDE, OUVRE, `
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
    <rect x="${SX + 8}" y="${BY}" width="${SL - 16}" height="254" rx="26" fill="#1D1A24"/>
    <rect x="${CX - 16}" y="${BY + 10}" width="32" height="4" rx="2" fill="#4A4458"/>
    ${texte(CX, BY + 44, t('Authentification requise', 'Authentication required'), { taille: 15, couleur: '#ECE6F4', poids: 600, ancre: 'middle' })}
    ${texte(CX, BY + 66, t('Déverrouille BodyCount', 'Unlock BodyCount'), { taille: 12, couleur: '#B5ADC4', ancre: 'middle' })}
    <circle cx="${CX}" cy="${BY + 130}" r="32" fill="#2A2533"/>
    ${empreinte(CX, BY + 130, 36, '#D0BCFF')}
    <g opacity="0">${visible(C, DOIGT + 0.006, OUVRE, 0.004)}
      <circle cx="${CX}" cy="${BY + 130}" r="32" fill="${APP.vert}"/>
      ${icone('coche', CX - 12, BY + 118, '#062B14', 1.5)}
    </g>
    ${toucher(CX, BY + 130, C, DOIGT)}
    ${entre(C, 0, DOIGT + 0.006, texte(CX, BY + 190, t('Touche le lecteur d’empreinte', 'Touch the fingerprint sensor'), { taille: 11.5, couleur: '#B5ADC4', ancre: 'middle' }), 0.004)}
    ${entre(C, DOIGT + 0.006, OUVRE, texte(CX, BY + 190, t('Empreinte reconnue', 'Fingerprint recognised'), { taille: 11.5, couleur: APP.vert, poids: 700, ancre: 'middle' }), 0.004)}
    ${texte(CX, BY + 230, t('Utiliser le code', 'Use PIN'), { taille: 12, couleur: '#D0BCFF', poids: 600, ancre: 'middle' })}`, 0.004);

  // Le répertoire, en deux temps. Tant que la base est fermée, les cartes
  // attendent ; les textes arrivent avec la base, les visages se
  // déchiffrent quand la clé du coffre arrive, l'un après l'autre, comme
  // lib/security/vault_image.dart les ouvre à l'affichage.
  const gens = [GENS.noa, GENS.lou, GENS.enzo, GENS.jade, GENS.matteo, GENS.gabriel];
  let rep = `${texte(SX + 18, SY + 44, t('RÉPERTOIRE', 'PEOPLE'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
    <rect x="${SX + 128}" y="${SY + 26}" width="${SL - 146}" height="28" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${icone('loupe', SX + 138, SY + 33, APP.second, 0.8)}
    ${texte(SX + 156, SY + 44.5, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 10, couleur: APP.discret })}`;
  const CL = (SL - 36) / 2, CH = 150;
  const place = (i) => [SX + 12 + (i % 2) * (CL + 12), SY + 72 + Math.floor(i / 2) * (CH + 12)];
  gens.forEach((p, i) => {
    const [x, y] = place(i);
    const photo = COFFRE + 0.008 + i * 0.012;
    rep += `<rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="14" fill="#1B0C36" stroke="#FFFFFF" stroke-opacity="0.07"/>`;
    // L'attente : des barres qui respirent.
    rep += entre(C, 0, BASE, `<g><animate attributeName="opacity" dur="1.4s" repeatCount="indefinite" values="0.35;0.8;0.35"/>
      <rect x="${x + 10}" y="${y + 10}" width="44" height="16" rx="8" fill="${APP.bord}"/>
      <rect x="${x + 10}" y="${y + CH - 44}" width="${CL - 34}" height="12" rx="4" fill="${APP.bord}"/>
      <rect x="${x + 10}" y="${y + CH - 24}" width="${CL - 54}" height="8" rx="4" fill="${APP.bord}"/></g>`, 0.006);
    // Le visage, qui se déchiffre.
    rep += dechiffre(visage(p.photo, x, y, CL, CH, 14), photo, photo + 0.03);
    // Le voile et les textes, lus dans la base.
    const fois = t(`${p.fois} fois`, `${p.fois} times`);
    rep += entre(C, BASE + i * 0.004, 1.2, `<rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="14" fill="url(#voile)"/>
      <rect x="${x + 8}" y="${y + 8}" width="${fois.length * 5.6 + 14}" height="17" rx="8.5" fill="${APP.fond}" fill-opacity="0.56"/>
      ${texte(x + 15, y + 20, fois, { taille: 9, couleur: '#E9DEFF', poids: 700 })}
      ${i === 0 ? `<circle cx="${x + CL - 17}" cy="${y + 16.5}" r="8.5" fill="${APP.or}"/>${icone('etoile', x + CL - 22.5, y + 11, '#3A2606', 0.7)}` : ''}
      ${texte(x + 9, y + CH - 34, p.prenom, { taille: 14, couleur: '#FFFFFF', poids: 800 })}
      ${etoiles(x + 9, y + CH - 20, p.note, { taille: 8.5 })}
      ${icone('epingle', x + 8, y + CH - 14, '#C9BBE0', 0.55)}
      ${texte(x + 19, y + CH - 7, p.ville, { taille: 8.5, couleur: '#C9BBE0', poids: 600 })}`, 0.006);
  });
  rep += barreNav(T, 'Fiches');
  const [ex, ey] = place(2);
  rep += toucher(ex + CL / 2, ey + CH / 2, C, TAPE);
  ecran += entre(C, OUVRE, FICHE, rep, 0.006);

  // La fiche d'Enzo : la grande photo se déchiffre à son tour, puis la
  // galerie, photo et vidéo, chacune un fichier .bcx du coffre.
  const PH = 250;
  let fiche = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${APP.fond}"/>
    <rect x="${SX}" y="${SY}" width="${SL}" height="${PH}" fill="#1B0C36"/>
    ${dechiffre(visage(GENS.enzo.photo, SX, SY, SL, PH, 0), FICHE + 0.01, FICHE + 0.05)}
    <rect x="${SX}" y="${SY}" width="${SL}" height="${PH}" fill="url(#voile)"/>
    <circle cx="${SX + 28}" cy="${SY + 32}" r="15" fill="${APP.fond}" fill-opacity="0.6"/>
    ${texte(SX + 28, SY + 38, '‹', { taille: 20, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
    ${entre(C, FICHE, FICHE + 0.05, `<rect x="${SX + SL - 124}" y="${SY + 20}" width="108" height="24" rx="12" fill="${APP.fond}" fill-opacity="0.8" stroke="${BLEU}" stroke-opacity="0.6"/>
      ${texte(SX + SL - 70, SY + 36, t('déchiffrement…', 'decrypting…'), { taille: 10.5, couleur: BLEU, poids: 700, ancre: 'middle' })}`, 0.004)}
    ${pastille(SX + 14, SY + PH - 68, 'N°12', { couleur: APP.vert, taille: 10, h: 20 })}
    ${pastille(SX + 66, SY + PH - 68, t('23 ans', '23'), { taille: 10, h: 20 })}
    ${pastille(SX + 126, SY + PH - 68, 'Vannes', { taille: 10, h: 20 })}
    ${pastille(SX + 186, SY + PH - 68, 'Versatile', { taille: 10, h: 20 })}
    ${texte(SX + 16, SY + PH - 18, 'Enzo P.', { taille: 28, couleur: '#FFFFFF', poids: 800 })}`;
  const stat = (x, v, l, avecEtoiles) => `${texte(x, SY + PH + 42, v, { taille: 20, couleur: APP.texte, poids: 800 })}
    ${avecEtoiles ? etoiles(x, SY + PH + 58, 8, { taille: 8 }) : texte(x, SY + PH + 58, l, { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}`;
  fiche += `<rect x="${SX + 12}" y="${SY + PH + 12}" width="${SL - 24}" height="62" rx="16" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${stat(SX + 28, '3,8', '', true)}${stat(SX + 112, '7', t('FOIS', 'TIMES'))}${stat(SX + 188, t('347 j', '347 d'), t('DEPUIS', 'SINCE'))}
    ${texte(SX + 16, SY + PH + 100, t('ÉTIQUETTES', 'TAGS'), { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    ${pastille(SX + 14, SY + PH + 110, t('Bronzé', 'Tanned'), { plein: true, taille: 10, h: 22 })}
    ${pastille(SX + 84, SY + PH + 110, 'Moustache', { plein: true, taille: 10, h: 22 })}
    ${pastille(SX + 172, SY + PH + 110, t('Bavard', 'Chatty'), { taille: 10, h: 22 })}
    ${texte(SX + 16, SY + PH + 160, t('GALERIE · 2', 'GALLERY · 2'), { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}`;
  // Deux vignettes du coffre, qui se déchiffrent l'une après l'autre.
  [[SX + 14, FICHE + 0.06, false], [SX + 92, FICHE + 0.085, true]].forEach(([x, de, video]) => {
    const y = SY + PH + 172;
    fiche += `<rect x="${x}" y="${y}" width="68" height="68" rx="12" fill="#1B0C36" stroke="${APP.bord}"/>
      ${dechiffre(visage(GENS.enzo.photo, x, y, 68, 68, 12), de, de + 0.03)}
      ${video ? `<g opacity="0">${visible(C, de + 0.03, VERR, 0.004)}<circle cx="${x + 34}" cy="${y + 34}" r="13" fill="#000000" fill-opacity="0.55"/>${icone('lecture', x + 28, y + 27, '#FFFFFF', 0.9)}
        ${texte(x + 62, y + 62, '0:05', { taille: 8.5, couleur: '#FFFFFF', poids: 700, ancre: 'end' })}</g>` : ''}`;
  });
  fiche += `<rect x="${SX + 170}" y="${SY + PH + 172}" width="68" height="68" rx="12" fill="none" stroke="${APP.bord}" stroke-dasharray="4 4"/>
    ${texte(SX + 204, SY + PH + 212, '+', { taille: 22, couleur: APP.second, ancre: 'middle' })}
    ${bouton(SX + 14, SY + SH - 58, SL - 28, 44, t('+ Nouvelle rencontre', '+ New encounter'))}`;
  ecran += entre(C, FICHE, VERR, fiche, 0.006);

  // Le verrou retombe : l'écran se referme sur le cadenas.
  ecran += entre(C, VERR, VOL, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${APP.fond}"/>
    <circle cx="${CX}" cy="${SY + SH / 2 - 20}" r="40" fill="${ROUGE}" fill-opacity="0.12" stroke="${ROUGE}" stroke-opacity="0.6"/>
    ${icone('cadenas', CX - 20, SY + SH / 2 - 40, ROUGE, 2.5)}
    ${texte(CX, SY + SH / 2 + 50, t('Verrouillé', 'Locked'), { taille: 16, couleur: APP.texte, poids: 800, ancre: 'middle' })}`, 0.004);

  // Ce qu'un voleur voit : les mêmes fichiers, sans l'empreinte.
  const bruit = (graine, n) => {
    let s = '', x = graine;
    for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) % 2147483648; s += (x >> 16 & 255).toString(16).toUpperCase().padStart(2, '0') + ' '; }
    return s.trim();
  };
  let vol = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#07050C"/>
    ${texte(SX + 18, SY + 42, t('SANS L’EMPREINTE', 'WITHOUT THE FINGERPRINT'), { taille: 12, couleur: ROUGE, police: MONO, poids: 700, extra: 'letter-spacing="1.5"' })}
    ${texte(SX + 18, SY + 62, t('les fichiers de l’appli, lus à la main', 'the app’s files, read by hand'), { taille: 11, couleur: APP.second })}`;
  // bodycount.db : un vidage hexadécimal qui défile, sans rien de lisible.
  const DBY = SY + 80;
  vol += `<rect x="${SX + 12}" y="${DBY}" width="${SL - 24}" height="186" rx="14" fill="#120D1C" stroke="#2A2038"/>
    ${icone('base', SX + 26, DBY + 13, VERT, 0.9)}
    ${texte(SX + 48, DBY + 26, 'bodycount.db', { taille: 12, couleur: APP.texte, police: MONO, poids: 700 })}
    ${texte(SX + SL - 26, DBY + 26, '2,4 ' + t('Mo', 'MB'), { taille: 10, couleur: APP.discret, police: MONO, ancre: 'end' })}
    <clipPath id="volHex"><rect x="${SX + 22}" y="${DBY + 40}" width="${SL - 44}" height="108"/></clipPath>
    <g clip-path="url(#volHex)"><g>
      <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${VOL};${FIN};1" values="0 0;0 0;0 -150;0 -150"/>
      ${[...Array(18)].map((_, i) => texte(SX + 26, DBY + 56 + i * 17, bruit(31 + i * 7, 8), { taille: 10.5, couleur: '#6B5870', police: MONO })).join('')}
    </g></g>
    ${texte(SX + 26, DBY + 170, t('« file is not a database »', '“file is not a database”'), { taille: 10.5, couleur: ROUGE, police: MONO })}`;
  // Un fichier du coffre : du bruit à la place d'un visage.
  const VY = DBY + 198;
  let bruitImage = '';
  {
    let x = 97;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      x = (x * 1103515245 + 12345) % 2147483648;
      const g = 20 + (x >> 16 & 63);
      bruitImage += `<rect x="${SX + 26 + c * 9}" y="${VY + 38 + r * 9}" width="9" height="9" fill="rgb(${g + 14},${g},${g + 30})"/>`;
    }
  }
  vol += `<rect x="${SX + 12}" y="${VY}" width="${SL - 24}" height="122" rx="14" fill="#120D1C" stroke="#2A2038"/>
    ${icone('photo', SX + 26, VY + 13, BLEU, 0.9)}
    ${texte(SX + 48, VY + 26, 'vault/7c02…5e.bcx', { taille: 12, couleur: APP.texte, police: MONO, poids: 700 })}
    ${bruitImage}
    ${texte(SX + 112, VY + 54, '42 43 58 31', { taille: 10.5, couleur: BLEU, police: MONO, poids: 700 })}
    ${texte(SX + 112, VY + 72, t('« BCX1 », puis rien', '“BCX1”, then nothing'), { taille: 10.5, couleur: APP.second })}
    ${texte(SX + 112, VY + 88, t('de reconnaissable', 'recognisable'), { taille: 10.5, couleur: APP.second })}`;
  // La clé rangée : chiffrée par le Keystore, qui ne la rend qu'à l'appli.
  const KY = VY + 132;
  vol += `<rect x="${SX + 12}" y="${KY}" width="${SL - 24}" height="78" rx="14" fill="#120D1C" stroke="#2A2038"/>
    ${icone('cle', SX + 26, KY + 13, ACCENT, 0.9)}
    ${texte(SX + 48, KY + 26, 'FlutterSecureStorage.xml', { taille: 11.5, couleur: APP.texte, police: MONO, poids: 700 })}
    ${texte(SX + 26, KY + 48, bruit(71, 8), { taille: 10.5, couleur: '#6B5870', police: MONO })}
    ${texte(SX + 26, KY + 65, t('chiffrée par le Keystore d’Android', 'encrypted by the Android Keystore'), { taille: 10, couleur: APP.second })}`;
  vol += `<rect x="${SX + 12}" y="${SY + SH - 52}" width="${SL - 24}" height="38" rx="12" fill="${ROUGE}" fill-opacity="0.1" stroke="${ROUGE}" stroke-opacity="0.5"/>
    ${texte(CX, SY + SH - 28, t('Ni prénom, ni visage, ni note.', 'No name, no face, no rating.'), { taille: 12, couleur: ROUGE, poids: 700, ancre: 'middle' })}`;
  ecran += entre(C, VOL, FIN, vol, 0.006);
  corps += T.ecran(ecran);

  // ------------------------------------------------------- la chaîne des clés
  corps += rubrique(400, 108, t('D’OÙ VIENNENT LES CLÉS', 'WHERE THE KEYS COME FROM'));
  const Y = 212; // l'axe de la chaîne
  const boite = (x, y, l, h, titre, l1, l2, c, de) => `
    <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="13" fill="${c}" fill-opacity="0.07" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, de, VERR)}</rect>
    ${texte(x + 18, y + 28, titre, { taille: 13.5, couleur: c, police: MONO, poids: 700 })}
    ${texte(x + 18, y + 48, l1, { taille: 11.5 })}
    ${l2 ? texte(x + 18, y + 64, l2, { taille: 11.5 }) : ''}`;
  // Les fils, posés d'abord : les cartes passent par-dessus.
  const fAB = `M 560 ${Y} H 590`, fBH = `M 790 ${Y} H 820`;
  const fH1 = `M 960 ${Y} H 985 V 146 H 1010`, fH2 = `M 960 ${Y} H 985 V 278 H 1010`;
  corps += fil(fAB, A + 0.04) + fil(fBH, B + 0.04) + fil(fH1, D1, VERT) + fil(fH2, D2, BLEU);
  corps += boite(400, Y - 40, 160, 80, t('Empreinte', 'Fingerprint'), t('ou le code du', 'or the phone’s'), t('téléphone', 'PIN'), VIOLET, A);
  corps += boite(590, Y - 40, 200, 80, t('Keystore', 'Keystore'), t('clé maîtresse, 32 octets', 'master key, 32 bytes'), t('tirés au premier lancement', 'drawn on first launch'), ACCENT, B);
  corps += boite(820, Y - 40, 140, 80, 'HKDF', 'SHA-256', t('une étiquette = une clé', 'one label = one key'), OR, H);
  corps += boite(1010, 108, 210, 76, 'bodycount/db/v1', t('mot de passe SQLCipher', 'SQLCipher password'), t('64 caractères hex', '64 hex characters'), VERT, D1);
  corps += boite(1010, 240, 210, 76, 'bodycount/photos/v1', t('clé AES-256-GCM', 'AES-256-GCM key'), t('photos et vidéos', 'photos and videos'), BLEU, D2);
  corps += bille(fAB, A, A + 0.04) + bille(fBH, B, B + 0.04) + bille(fH1, H + 0.02, D1, VERT) + bille(fH2, H + 0.04, D2, BLEU);
  // Ce que fait l'appel en cours, sous la chaîne.
  const legendes = [
    [0, A, t('Avant l’empreinte, aucune de ces clés n’existe en mémoire.', 'Before the fingerprint, none of these keys exists in memory.'), DISCRET],
    [A, B, t('authenticate() : Android vérifie le doigt, l’appli ne le voit jamais.', 'authenticate(): Android checks the finger, the app never sees it.'), VIOLET],
    [B, H, t('unlock() : la clé maîtresse sort des préférences chiffrées par le Keystore.', 'unlock(): the master key comes out of the Keystore-encrypted preferences.'), ACCENT],
    [H, BASE, t('_derive() : HMAC-SHA256, la même clé, deux étiquettes, deux clés sans lien.', '_derive(): HMAC-SHA256, the same key, two labels, two unrelated keys.'), OR],
    [BASE, COFFRE + 0.05, t('La base s’ouvre : prénoms, villes et notes se lisent.', 'The database opens: names, cities and ratings can be read.'), VERT],
    [COFFRE + 0.05, TAPE, t('Le coffre s’ouvre : chaque photo est déchiffrée à l’affichage.', 'The vault opens: each photo is decrypted as it is shown.'), BLEU],
    [TAPE, VERR, t('La fiche d’Enzo : sa photo et sa galerie, déchiffrées en mémoire, jamais sur le disque.', 'Enzo’s card: his photo and gallery, decrypted in memory, never on disk.'), BLEU],
    [VERR, FIN, t('Verrouillé : les clés sont oubliées, il ne reste que du bruit.', 'Locked: the keys are forgotten, only noise is left.'), ROUGE],
  ];
  legendes.forEach(([de, a, s, c]) => {
    corps += entre(C, de, a, `<circle cx="410" cy="337" r="4" fill="${c}"/>${texte(424, 342, s, { taille: 13, couleur: c === DISCRET ? TEXTE : TITRE, poids: 600 })}`, 0.006);
  });

  // ------------------------------------------------------- ce qu'il y a sur le disque
  const DY = 356;
  corps += rubrique(400, DY + 16, t('SUR LE DISQUE', 'ON DISK'));
  const voleur = rubrique(560, DY + 16, t('CE QU’UN VOLEUR LIT SANS L’EMPREINTE', 'WHAT A THIEF READS WITHOUT THE FINGERPRINT'), ROUGE);
  corps += entre(C, 0, B, voleur, 0.006) + entre(C, VOL, 1.2, voleur, 0.006);
  corps += entre(C, B, VOL, rubrique(560, DY + 16, t('CE QUE L’APPLI VOIT, EN MÉMOIRE SEULEMENT', 'WHAT THE APP SEES, IN MEMORY ONLY'), VERT), 0.006);
  corps += `<rect x="400" y="${DY + 30}" width="820" height="186" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const lignes = [
    ['databases/bodycount.db', t('SQLCipher, AES-256, page par page', 'SQLCipher, AES-256, page by page'), VERT, BASE,
      bruit(7, 14), null, 'base'],
    ['app_flutter/vault/7c02…5e.bcx', t('BCX1, nonce, AES-GCM, MAC', 'BCX1, nonce, AES-GCM, MAC'), BLEU, COFFRE + 0.012,
      '42 43 58 31 │ ' + bruit(3, 10), 'photo', 'photo'],
    ['shared_prefs/FlutterSecureStorage.xml', 'bodycount_master_key_v1', ACCENT, B,
      bruit(11, 14), 'cle', 'cle'],
  ];
  lignes.forEach(([chemin, sous, c, de, hex, sorte, ic], i) => {
    const y = DY + 48 + i * 58;
    if (i) corps += `<line x1="416" y1="${y - 8}" x2="1204" y2="${y - 8}" stroke="${BORD}"/>`;
    corps += `<rect x="416" y="${y + 4}" width="34" height="34" rx="9" fill="${c}" fill-opacity="0.12" stroke="${c}" stroke-opacity="0.45"/>
      ${icone(ic, 425, y + 13, c)}
      ${texte(462, y + 17, chemin, { taille: 12, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(462, y + 35, sous, { taille: 11, couleur: DISCRET })}`;
    const X = 760;
    const illisible = texte(X, y + 26, hex, { taille: 11.5, couleur: '#6B5870', police: MONO });
    corps += entre(C, 0, de, illisible, 0.006) + entre(C, VOL, 1.2, illisible, 0.006);
    let clair;
    if (sorte === 'photo') {
      clair = `${visage(GENS.enzo.photo, X, y + 2, 38, 38, 8)}
        ${texte(X + 50, y + 18, t('Enzo P., photo 1080 × 1350', 'Enzo P., photo 1080 × 1350'), { taille: 12.5, couleur: TITRE, poids: 600 })}
        ${texte(X + 50, y + 35, t('déchiffrée en mémoire vive, jamais réécrite en clair', 'decrypted in RAM, never written back in the clear'), { taille: 11, couleur: TEXTE })}`;
    } else if (sorte === 'cle') {
      clair = `${texte(X, y + 18, '9f 2c 71 e0 … 4b d8  (32 ' + t('octets', 'bytes') + ')', { taille: 12, couleur: ACCENT, police: MONO, poids: 700 })}
        ${texte(X, y + 35, t('lue une fois, écrasée de zéros au verrouillage', 'read once, overwritten with zeros on lock'), { taille: 11, couleur: TEXTE })}`;
    } else {
      clair = `${texte(X, y + 18, t('Enzo P. · 23 ans · Vannes · 7 fois · 3,8', 'Enzo P. · 23 · Vannes · 7 times · 3.8'), { taille: 12.5, couleur: TITRE, poids: 600 })}
        ${texte(X, y + 35, t('personnes, rencontres, notes, étiquettes, photos', 'people, encounters, notes, tags, photos'), { taille: 11, couleur: TEXTE })}`;
    }
    corps += entre(C, de, VERR, clair, 0.008);
    // Un balayage au moment où la ligne se déchiffre.
    corps += `<rect x="${X - 6}" y="${y}" width="0" height="42" fill="${c}" fill-opacity="0.12">${fondu('width', C, [[0, 0], [de - 0.02, 0], [de, 450], [de + 0.02, 0], [1, 0]])}</rect>`;
  });

  // ------------------------------------------------------- trois cartes du bas
  const bas = [
    [OR, t('Une clé par usage', 'One key per use'), t('Une étiquette HKDF différente pour', 'Two HKDF labels, two keys:'), t('la base et le coffre : l’une ne livre pas l’autre.', 'one never opens the other’s door.')],
    [VIOLET, t('Rien avant l’empreinte', 'Nothing before the fingerprint'), t('unlock() n’est appelé qu’une fois', 'unlock() is only called once'), t('l’identité prouvée, jamais avant.', 'identity is proven, never before.')],
    [ROUGE, t('Tout effacer, c’est oublier', 'To erase is to forget'), t('destroy() retire la clé du Keystore :', 'destroy() drops the Keystore key:'), t('le disque devient du bruit, pour tous.', 'the disk turns into noise, for everyone.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = 400 + i * 280, y = 594;
    corps += `<rect x="${x}" y="${y}" width="260" height="90" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y}" width="260" height="90" rx="13" fill="${c}" fill-opacity="0.05"/>
      ${texte(x + 20, y + 32, titre, { taille: 13.5, couleur: c, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 55, l1, { taille: 12 })}
      ${texte(x + 20, y + 73, l2, { taille: 12 })}`;
  });

  svg('chiffrement.svg', 1280, 720, corps, t(
    'D’où viennent les clés de BodyCount. On touche le capteur de l’écran de verrou, Android demande l’empreinte ou le code du téléphone et la vérifie lui-même. Alors seulement, la clé maîtresse de 32 octets, tirée au hasard au premier lancement et rangée dans des préférences chiffrées par le Keystore, entre en mémoire. HKDF-SHA256 en dérive deux clés par deux étiquettes : bodycount/db/v1 donne le mot de passe SQLCipher de la base, bodycount/photos/v1 la clé AES-256-GCM du coffre des photos et des vidéos. Le répertoire se remplit : les prénoms quand la base s’ouvre, les visages qui se déchiffrent quand le coffre s’ouvre, puis la fiche d’Enzo, sa grande photo et sa galerie, déchiffrées en mémoire. Au verrouillage, les clés sont oubliées : sur le disque, sans l’empreinte, bodycount.db, les fichiers .bcx du coffre et la clé rangée ne sont que du bruit. Effacer la clé du Keystore suffit à rendre tout illisible, pour tout le monde.',
    'Where the BodyCount keys come from. You touch the sensor on the lock screen, Android asks for the fingerprint or the phone’s PIN and checks it itself. Only then does the 32-byte master key, drawn at random on first launch and kept in preferences encrypted by the Keystore, enter memory. HKDF-SHA256 derives two keys from it with two labels: bodycount/db/v1 gives the SQLCipher password of the database, bodycount/photos/v1 the AES-256-GCM key of the photo and video vault. The people list fills in: names when the database opens, faces decrypting when the vault opens, then Enzo’s card, his large photo and gallery, decrypted in memory. On lock, the keys are forgotten: on disk, without the fingerprint, bodycount.db, the vault’s .bcx files and the stored key are just noise. Removing the key from the Keystore is enough to make everything unreadable, for everyone.'));
};

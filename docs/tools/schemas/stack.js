// La stack, là où chaque paquet travaille.
//
// À gauche, six gestes dans l'application : ouvrir, parcourir, ajouter une
// photo, ajouter une vidéo, aller voir quelqu'un, sauvegarder. À droite,
// les dépendances de pubspec.yaml et les deux morceaux natifs, rangées par
// rôle : chacune s'allume pendant le geste qui l'appelle.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, empreinte, logo, icone,
    visage, cartePersonne, barreNav, bouton, etoiles, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL,
    ACCENT, VIOLET, FUCHSIA, VERT, OR, BLEU } = O;
  const C = 42;
  const H = 700;
  let corps = entete(t('LA STACK', 'THE STACK'),
    t('Quinze paquets et deux morceaux natifs. Chacun s’allume quand l’appli en a besoin.',
      'Fifteen packages and two native parts. Each one lights up when the app needs it.'));

  // Les six gestes : [titre, phrase, début].
  const PAS = 0.155;
  const GESTES = [
    [t('Ouvrir', 'Open'), t('L’empreinte est vérifiée par Android, la clé sort du Keystore, HKDF en tire deux clés.', 'Android checks the fingerprint, the key leaves the Keystore, HKDF derives two keys.')],
    [t('Parcourir', 'Browse'), t('La base chiffrée s’ouvre dans un dossier privé, les écrans lisent l’état et se mettent à jour.', 'The encrypted database opens in a private folder, screens read the state and refresh.')],
    [t('Ajouter une photo', 'Add a photo'), t('Le sélecteur la rend, elle est chiffrée en AES-GCM sous un nom tiré au hasard.', 'The picker hands it over, it is encrypted with AES-GCM under a random name.')],
    [t('Ajouter une vidéo', 'Add a video'), t('Media3 l’allège, l’AES natif la chiffre par morceaux, le lecteur la rejoue.', 'Media3 shrinks it, native AES encrypts it in chunks, the player plays it back.')],
    [t('Aller le voir', 'Go and see him'), t('Les dates sont écrites en français, l’itinéraire part vers l’appli de cartes.', 'Dates are written out, directions go to the maps app.')],
    [t('Sauvegarder', 'Back up'), t('La phrase passe par PBKDF2, le fichier s’écrit en flux ; l’ancien format se relit encore.', 'The passphrase goes through PBKDF2, the file is written as a stream; the old format still reads.')],
  ].map(([titre, phrase], i) => [titre, phrase, 0.02 + i * PAS]);
  const D = (i) => GESTES[i][2];

  // ------------------------------------------------------------ les paquets
  // [nom, version, rôle, colonne, rangée, gestes où il travaille]
  const PAQUETS = [
    ['local_auth', '2.3.0', t('l’empreinte, vue par Android', 'the fingerprint, seen by Android'), 0, 0, [0]],
    ['flutter_secure_storage', '9.2.4', t('la clé, gardée par le Keystore', 'the key, kept by the Keystore'), 0, 1, [0]],
    ['cryptography', '2.7.0', t('HKDF, AES-GCM, PBKDF2', 'HKDF, AES-GCM, PBKDF2'), 0, 2, [0, 2, 5]],
    ['javax.crypto', 'Android', t('l’AES natif des flux', 'native AES for streams'), 0, 3, [3, 5]],
    ['sqflite_sqlcipher', '3.1.0+1', t('SQLite chiffré, SQLCipher', 'SQLite encrypted by SQLCipher'), 1, 0, [1]],
    ['path_provider', '2.1.5', t('les dossiers privés', 'the private folders'), 1, 1, [1, 2, 5]],
    ['uuid', '4.5.1', t('le nom des fichiers du coffre', 'vault file names'), 1, 2, [2]],
    ['archive', '4.0.4', t('relire l’ancien format', 'reading the old format'), 1, 3, [5]],
    ['flutter_riverpod', '2.6.1', t('l’état, relu après écriture', 'state, reread after writes'), 2, 0, [1]],
    ['go_router', '14.8.1', t('les écrans, gardés par le verrou', 'screens, guarded by the lock'), 2, 1, [0, 1]],
    ['intl', '0.20.2', t('les dates, en toutes lettres', 'dates, written out'), 2, 2, [4]],
    ['url_launcher', '6.3.1', t('l’itinéraire et l’appel', 'directions and calls'), 2, 3, [4]],
    ['image_picker', '1.1.2', t('photos et vidéos choisies', 'photos and videos picked'), 3, 0, [2, 3]],
    ['video_player', '2.14.0', t('la lecture', 'playback'), 3, 1, [3]],
    ['media3-transformer', '1.11.1', t('l’allègement, en Kotlin', 'shrinking, in Kotlin'), 3, 2, [3]],
    ['Chakra Petch', 'assets/fonts', t('les grands titres, embarqués', 'big titles, bundled'), 3, 3, [1]],
  ];
  const COLS = [[t('SÉCURITÉ', 'SECURITY'), VIOLET], [t('DONNÉES', 'DATA'), BLEU], [t('ÉTAT ET ÉCRANS', 'STATE AND SCREENS'), VERT], [t('MÉDIAS', 'MEDIA'), FUCHSIA]];
  const GX = 400, CW = 196, CG = 12, GY = 176, RH = 62, RG = 10;

  // Flutter, sous tout le reste.
  corps += `<rect x="${GX}" y="96" width="${4 * CW + 3 * CG}" height="44" rx="12" fill="${CARTE}" stroke="${BORD}"/>
    <path d="M${GX + 22} 118 l10 -10 h7 l-10 10 l10 10 h-7 z" fill="${BLEU}"/>
    ${texte(GX + 50, 123, 'Flutter', { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(GX + 118, 123, t('Dart 3.11, un seul code pour chaque écran, dessiné par l’appli elle-même', 'Dart 3.11, one codebase for every screen, drawn by the app itself'), { taille: 12.5 })}`;
  COLS.forEach(([nom, c], i) => {
    corps += `<rect x="${GX + i * (CW + CG)}" y="156" width="18" height="3" rx="1.5" fill="${c}"/>
      ${texte(GX + i * (CW + CG) + 26, 162, nom, { taille: 10.5, couleur: DISCRET, police: MONO, poids: 700, extra: 'letter-spacing="1.6"' })}`;
  });
  PAQUETS.forEach(([nom, version, role, col, rang, gestes]) => {
    const x = GX + col * (CW + CG), y = GY + rang * (RH + RG), c = COLS[col][1];
    // L'éclairage : une fenêtre par geste où il sert.
    const etapes = [[0, 0]];
    for (const g of gestes) {
      const de = D(g) + 0.012, a = D(g) + PAS - 0.006;
      etapes.push([de - 0.008, 0], [de, 1], [a, 1], [a + 0.006, 0]);
    }
    etapes.push([1, 0]);
    const anim = fondu('opacity', C, etapes);
    const taille = nom.length > 18 ? 11.5 : 12.5;
    corps += `<rect x="${x}" y="${y}" width="${CW}" height="${RH}" rx="11" fill="${CARTE}" stroke="${BORD}"/>
      <g opacity="0">${anim}
        <rect x="${x}" y="${y}" width="${CW}" height="${RH}" rx="11" fill="${c}" fill-opacity="0.09" stroke="${c}" stroke-width="1.5"/>
      </g>
      <rect x="${x}" y="${y + 13}" width="3" height="${RH - 26}" rx="1.5" fill="${c}"/>
      ${texte(x + CW - 10, y + 15, version, { taille: 9, couleur: DISCRET, police: MONO, ancre: 'end' })}
      ${texte(x + 14, y + 29, nom, { taille, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 14, y + 47, role, { taille: 11 })}`;
  });

  // Le geste en cours, sous la grille.
  const EY = GY + 4 * (RH + RG) + 6;
  corps += `<rect x="${GX}" y="${EY}" width="${4 * CW + 3 * CG}" height="64" rx="12" fill="${CARTE}" stroke="${BORD}"/>`;
  GESTES.forEach(([titre, phrase, de], i) => {
    corps += entre(C, de + 0.004, de + PAS - 0.004, `<circle cx="${GX + 30}" cy="${EY + 32}" r="15" fill="${ACCENT}" fill-opacity="0.14" stroke="${ACCENT}" stroke-opacity="0.6"/>
      ${texte(GX + 30, EY + 37, String(i + 1), { taille: 13, couleur: ACCENT, police: MONO, poids: 700, ancre: 'middle' })}
      ${texte(GX + 58, EY + 27, titre, { taille: 14.5, couleur: TITRE, poids: 700 })}
      ${texte(GX + 58, EY + 47, phrase, { taille: 12.5 })}`, 0.004);
  });
  // Les six étapes, en petits points.
  GESTES.forEach(([, , de], i) => {
    const x = GX + 4 * CW + 3 * CG - 20 - (5 - i) * 14;
    corps += `<circle cx="${x}" cy="${EY + 14}" r="3" fill="${FIL}"/><circle cx="${x}" cy="${EY + 14}" r="3" fill="${ACCENT}" opacity="0">${visible(C, de + 0.004, de + PAS - 0.004, 0.004)}</circle>`;
  });

  // Trois cartes du bas.
  const bas = [
    [VERT, t('Aucun paquet réseau', 'No network package'), t('Ni http, ni Firebase, ni analytique :', 'No http, no Firebase, no analytics:'), t('rien dans la liste ne parle à un serveur.', 'nothing on the list talks to a server.')],
    [ACCENT, t('Deux morceaux natifs', 'Two native parts'), t('L’AES matériel et Media3, en Kotlin :', 'Hardware AES and Media3, in Kotlin:'), t('en Dart pur, 100 Mo prenaient 30 s.', 'in pure Dart, 100 MB took 30 s.')],
    [OR, t('Une police, embarquée', 'One font, bundled'), t('Chakra Petch vit dans l’APK : aucun', 'Chakra Petch ships in the APK: no'), t('appel à Google Fonts au lancement.', 'call to Google Fonts at launch.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = GX + i * 280, y = EY + 82, l = i === 2 ? 4 * CW + 3 * CG - 560 : 264;
    corps += `<rect x="${x}" y="${y}" width="${l}" height="90" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y + 14}" width="3" height="62" rx="1.5" fill="${c}"/>
      ${texte(x + 20, y + 30, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 52, l1, { taille: 12 })}
      ${texte(x + 20, y + 70, l2, { taille: 12 })}`;
  });

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 92, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';
  const scene = (i, contenu) => entre(C, i === 0 ? 0 : D(i), D(i) + PAS, contenu, 0.006);
  const titreEcran = (s) => texte(SX + 18, SY + 46, s, { taille: 19, couleur: APP.texte, poids: 800 });
  const attente = (y, s, de, a) => entre(C, de, a, `<rect x="${SX + 16}" y="${y}" width="${SL - 32}" height="54" rx="18" fill="${APP.surface}" stroke="${APP.bord}"/>
    <circle cx="${SX + 42}" cy="${y + 27}" r="9" fill="none" stroke="${APP.violet}" stroke-width="2.6" stroke-dasharray="36 22">
      <animateTransform attributeName="transform" type="rotate" from="0 ${SX + 42} ${y + 27}" to="360 ${SX + 42} ${y + 27}" dur="0.9s" repeatCount="indefinite"/></circle>
    ${texte(SX + 62, y + 31, s, { taille: 11.5, couleur: APP.texte, poids: 600 })}`, 0.004);

  // 1. Ouvrir : le verrou, puis la feuille d'Android.
  const d0 = D(0);
  ecran += scene(0, `${logo(SX + SL / 2, SY + 120, 72)}
    ${texte(SX + SL / 2, SY + 200, 'BodyCount', { taille: 28, couleur: APP.texte, poids: 800, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + 226, t('Tout reste sur cet appareil.', 'Everything stays on this device.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    <circle cx="${SX + SL / 2}" cy="${SY + 330}" r="44" fill="url(#marque)"/>
    ${empreinte(SX + SL / 2, SY + 330, 42, '#FFFFFF')}
    ${toucher(SX + SL / 2, SY + 330, C, d0 + 0.02)}
    ${entre(C, d0 + 0.03, d0 + 0.11, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.5"/>
      <rect x="${SX + 8}" y="${SY + SH - 196}" width="${SL - 16}" height="188" rx="24" fill="#1E1B24"/>
      ${texte(SX + SL / 2, SY + SH - 160, t('Déverrouille BodyCount', 'Unlock BodyCount'), { taille: 15, couleur: '#ECE6F0', poids: 600, ancre: 'middle' })}
      <circle cx="${SX + SL / 2}" cy="${SY + SH - 96}" r="28" fill="none" stroke="#D0BCFF" stroke-width="2"/>
      ${empreinte(SX + SL / 2, SY + SH - 96, 32, '#D0BCFF')}
      ${texte(SX + SL / 2, SY + SH - 40, t('Touchez le lecteur d’empreinte', 'Touch the fingerprint sensor'), { taille: 11, couleur: '#CAC4D0', ancre: 'middle' })}`, 0.004)}`);

  // 2. Parcourir : le répertoire.
  let rep = titreEcran(t('RÉPERTOIRE', 'PEOPLE'));
  [GENS.noa, GENS.lou, GENS.enzo, GENS.jade].forEach((p, i) => {
    const l = (SL - 36) / 2;
    rep += cartePersonne(p, SX + 12 + (i % 2) * (l + 12), SY + 70 + Math.floor(i / 2) * 206, l, 194, { premier: i === 0 });
  });
  rep += barreNav(T, 'Fiches') + toucher(SX + 200, SY + 170, C, D(1) + 0.09);
  ecran += scene(1, rep);

  // 3. et 4. La galerie d'Enzo : une photo, puis une vidéo.
  const galerie = (vignettes, attentes) => `
    <path d="M${SX + 26} ${SY + 36} l-7 7 l7 7" fill="none" stroke="${APP.texte}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(SX + 42, SY + 49, t('Photos et vidéos', 'Photos and videos'), { taille: 17, couleur: APP.texte, poids: 800 })}
    ${vignettes}
    <rect x="${SX + SL - 118}" y="${SY + SH - 64}" width="104" height="42" rx="16" fill="${APP.violet}" fill-opacity="0.3"/>
    ${icone('photo', SX + SL - 104, SY + SH - 51, APP.texte, 1)}
    ${texte(SX + SL - 82, SY + SH - 38, t('Ajouter', 'Add'), { taille: 12.5, couleur: APP.texte, poids: 700 })}
    ${attentes}`;
  const VL = (SL - 44) / 3;
  const vignette = (n, k, video = false) => {
    const x = SX + 12 + k * (VL + 10), y = SY + 76;
    return `${visage(n, x, y, VL, VL, 12)}${video ? `<circle cx="${x + VL / 2}" cy="${y + VL / 2}" r="13" fill="#000000" fill-opacity="0.5"/>${icone('lecture', x + VL / 2 - 6, y + VL / 2 - 8, '#FFFFFF', 1)}` : ''}`;
  };
  const selecteur = (de, a, choix) => entre(C, de, a, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#101014"/>
      ${texte(SX + 18, SY + 46, t('Sélectionner des éléments', 'Select items'), { taille: 15, couleur: '#E6E1E5', poids: 600 })}
      ${[1, 2, 3, 4, 5, 7].map((n, k) => {
        const l = (SL - 36) / 3, x = SX + 12 + (k % 3) * (l + 6), y = SY + 70 + Math.floor(k / 3) * (l + 6);
        const pris = k === choix;
        return `${visage(n === 5 ? 12 : n, x, y, l, l, 4)}${pris ? `<rect x="${x}" y="${y}" width="${l}" height="${l}" rx="4" fill="none" stroke="#A8C7FA" stroke-width="3"/><circle cx="${x + l - 14}" cy="${y + 14}" r="9" fill="#A8C7FA"/>${icone('coche', x + l - 22, y + 6, '#0B1D36', 1)}` : ''}${choix === 4 && k === 4 ? `<rect x="${x + 6}" y="${y + l - 22}" width="34" height="16" rx="8" fill="#000000" fill-opacity="0.6"/>${texte(x + 23, y + l - 10, '0:42', { taille: 9, couleur: '#FFFFFF', ancre: 'middle' })}` : ''}`;
      }).join('')}
      ${toucher(SX + 12 + (choix % 3) * ((SL - 36) / 3 + 6) + 40, SY + 110 + Math.floor(choix / 3) * ((SL - 36) / 3 + 6), C, de + 0.03)}`, 0.004);
  const d2 = D(2), d3 = D(3);
  ecran += scene(2, galerie(vignette(12, 0) + entre(C, d2 + 0.11, d2 + PAS, vignette(3, 1), 0.004),
    toucher(SX + SL - 66, SY + SH - 43, C, d2 + 0.02) + selecteur(d2 + 0.03, d2 + 0.08, 2) +
    attente(SY + SH - 140, t('Chiffrement, 1 sur 1…', 'Encrypting, 1 of 1…'), d2 + 0.08, d2 + 0.11)));
  ecran += scene(3, galerie(vignette(12, 0) + vignette(3, 1) + entre(C, d3 + 0.1, d3 + PAS, vignette(12, 2, true), 0.004),
    toucher(SX + SL - 66, SY + SH - 43, C, d3 + 0.015) + selecteur(d3 + 0.022, d3 + 0.05, 4) +
    attente(SY + SH - 140, t('Allègement de la vidéo, 66 %…', 'Shrinking the video, 66%…'), d3 + 0.05, d3 + 0.075) +
    attente(SY + SH - 140, t('Chiffrement de la vidéo, 1 sur 1…', 'Encrypting the video, 1 of 1…'), d3 + 0.075, d3 + 0.1) +
    toucher(SX + 12 + 2 * (VL + 10) + VL / 2, SY + 76 + VL / 2, C, d3 + 0.115) +
    entre(C, d3 + 0.12, d3 + PAS, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
      ${visage(12, SX, SY + 150, SL, 220, 0)}
      <rect x="${SX + 20}" y="${SY + SH - 60}" width="${SL - 40}" height="4" rx="2" fill="#FFFFFF" fill-opacity="0.25"/>
      <rect x="${SX + 20}" y="${SY + SH - 60}" height="4" rx="2" width="0" fill="${APP.violet}">${fondu('width', C, [[0, 0], [d3 + 0.12, 0], [d3 + PAS, (SL - 40) * 0.3], [1, (SL - 40) * 0.3]])}</rect>
      ${texte(SX + 20, SY + SH - 40, '0:04', { taille: 10, couleur: '#FFFFFF' })}
      ${texte(SX + SL - 20, SY + SH - 40, '0:42', { taille: 10, couleur: '#FFFFFF', ancre: 'end' })}`, 0.004)));

  // 5. Aller le voir : la fiche, les dates, Y aller.
  const d4 = D(4);
  ecran += scene(4, `${visage(12, SX, SY, SL, 200, 0)}
    <rect x="${SX}" y="${SY}" width="${SL}" height="200" fill="url(#voile)"/>
    ${texte(SX + 16, SY + 190, 'Enzo P.', { taille: 26, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 18, SY + 232, t('RENCONTRES · 7', 'ENCOUNTERS · 7'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    ${[[t('14 sept.', '14 Sept.'), t('samedi, 22h22 · Auray', 'Saturday, 10:22 pm · Auray'), 7], [t('2 août', '2 Aug.'), t('samedi, 23h05 · Vannes', 'Saturday, 11:05 pm · Vannes'), 8], [t('5 juin', '5 June'), t('jeudi, 21h40 · Vannes', 'Thursday, 9:40 pm · Vannes'), 7]].map(([j, s, n], k) => {
      const y = SY + 244 + k * 58;
      return `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="50" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
        ${texte(SX + 26, y + 21, j, { taille: 12.5, couleur: APP.texte, poids: 700 })}
        ${texte(SX + 26, y + 38, s, { taille: 10, couleur: APP.discret })}
        ${etoiles(SX + SL - 84, y + 30, n, { taille: 9 })}`;
    }).join('')}
    <rect x="${SX + 12}" y="${SY + SH - 58}" width="42" height="42" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${icone('telephoneIcone', SX + 25, SY + SH - 45, APP.second, 1)}
    <rect x="${SX + 62}" y="${SY + SH - 58}" width="42" height="42" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${icone('epingle', SX + 75, SY + SH - 45, APP.second, 1)}
    ${bouton(SX + 112, SY + SH - 58, SL - 124, 42, t('+ Rencontre', '+ Encounter'), { taille: 12 })}
    ${toucher(SX + 83, SY + SH - 37, C, d4 + 0.07)}
    ${entre(C, d4 + 0.08, d4 + PAS, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.5"/>
      <rect x="${SX + 8}" y="${SY + SH - 186}" width="${SL - 16}" height="178" rx="24" fill="#1E1B24"/>
      ${texte(SX + 28, SY + SH - 152, t('Ouvrir avec', 'Open with'), { taille: 14, couleur: '#ECE6F0', poids: 600 })}
      ${[['Google Maps', '#34A853'], ['Organic Maps', '#6BBF59'], ['Waze', '#33CCFF']].map(([n, c], k) => `<circle cx="${SX + 42}" cy="${SY + SH - 118 + k * 38}" r="12" fill="${c}"/>${texte(SX + 64, SY + SH - 114 + k * 38, n, { taille: 12.5, couleur: '#ECE6F0' })}`).join('')}`, 0.004)}`);

  // 6. Sauvegarder : les réglages, la phrase, le fichier prêt.
  const d5 = D(5);
  ecran += scene(5, `${titreEcran(t('Réglages', 'Settings'))}
    <rect x="${SX + 12}" y="${SY + 70}" width="${SL - 24}" height="60" rx="18" fill="${APP.violet}" fill-opacity="0.12" stroke="${APP.bord}"/>
    ${logo(SX + 42, SY + 100, 34)}
    ${texte(SX + 70, SY + 97, t('18 Personnes', '18 People'), { taille: 13, couleur: APP.texte, poids: 700 })}
    ${texte(SX + 70, SY + 113, t('111 Rencontres', '111 Encounters'), { taille: 10, couleur: APP.second })}
    ${texte(SX + 18, SY + 160, t('DONNÉES', 'DATA'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    ${[[t('Tout reste sur ce téléphone', 'Everything stays on this phone'), t('Base chiffrée, aucun compte', 'Encrypted database, no account')], [t('Exporter, chiffré', 'Export, encrypted'), t('Dernière il y a 38 jours', 'Last one 38 days ago')], [t('Restaurer une sauvegarde', 'Restore a backup'), t('Remplace ce qui est ici', 'Replaces what is here')]].map(([a, b], k) => {
      const y = SY + 172 + k * 58;
      return `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="50" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
        ${texte(SX + 26, y + 22, a, { taille: 12, couleur: APP.texte, poids: 600 })}
        ${texte(SX + 26, y + 38, b, { taille: 9.5, couleur: APP.discret })}`;
    }).join('')}
    ${toucher(SX + 120, SY + 255, C, d5 + 0.02)}
    ${entre(C, d5 + 0.03, d5 + 0.085, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
      <rect x="${SX + 16}" y="${SY + 170}" width="${SL - 32}" height="170" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${texte(SX + 34, SY + 204, t('Phrase de passe', 'Passphrase'), { taille: 15, couleur: APP.texte, poids: 700 })}
      ${texte(SX + 34, SY + 226, t('Elle seule permettra de la relire.', 'Only it will read it back.'), { taille: 10.5, couleur: APP.second })}
      <line x1="${SX + 34}" y1="${SY + 272}" x2="${SX + SL - 34}" y2="${SY + 272}" stroke="${APP.violet}" stroke-width="2"/>
      ${texte(SX + 34, SY + 264, '••••••••••••', { taille: 14, couleur: APP.texte })}
      ${texte(SX + SL - 34, SY + 318, t('Exporter', 'Export'), { taille: 12, couleur: APP.violet, poids: 700, ancre: 'end' })}
      ${toucher(SX + SL - 60, SY + 314, C, d5 + 0.075)}`, 0.004)}
    ${attente(SY + 250, t('Chiffrement des médias, 12 sur 40…', 'Encrypting media, 12 of 40…'), d5 + 0.085, d5 + 0.115)}
    ${entre(C, d5 + 0.115, d5 + PAS, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
      <rect x="${SX + 16}" y="${SY + 190}" width="${SL - 32}" height="130" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${texte(SX + 34, SY + 224, t('Sauvegarde prête', 'Backup ready'), { taille: 15, couleur: APP.texte, poids: 700 })}
      ${texte(SX + 34, SY + 246, t('Chiffrée par ta phrase de passe.', 'Encrypted by your passphrase.'), { taille: 10.5, couleur: APP.second })}
      ${texte(SX + SL - 110, SY + 298, t('Partager', 'Share'), { taille: 12, couleur: APP.violet, poids: 700, ancre: 'end' })}
      ${texte(SX + SL - 34, SY + 298, t('Enregistrer', 'Save'), { taille: 12, couleur: APP.violet, poids: 700, ancre: 'end' })}`, 0.004)}`);
  corps += T.ecran(ecran);

  svg('stack.svg', 1280, H, corps, t(
    'La stack de BodyCount, paquet par paquet, là où chacun travaille. Flutter en Dart 3.11 dessine chaque écran. Ouvrir : local_auth laisse Android vérifier l’empreinte, flutter_secure_storage sort la clé gardée par le Keystore, cryptography en tire deux clés par HKDF, go_router garde les écrans derrière le verrou. Parcourir : sqflite_sqlcipher ouvre la base chiffrée dans un dossier donné par path_provider, flutter_riverpod tient l’état et le relit après chaque écriture, et les grands titres sont en Chakra Petch, embarquée. Ajouter une photo : image_picker la rend, cryptography la chiffre en AES-GCM, uuid lui donne un nom sans rapport avec elle. Ajouter une vidéo : media3-transformer l’allège en Kotlin, javax.crypto la chiffre par morceaux avec l’AES matériel, video_player la rejoue. Aller le voir : intl écrit les dates, url_launcher passe l’itinéraire à l’appli de cartes. Sauvegarder : cryptography tire la clé de la phrase par PBKDF2, javax.crypto écrit le flux, archive relit encore l’ancien format. Aucun paquet réseau dans la liste.',
    'The BodyCount stack, package by package, where each one works. Flutter on Dart 3.11 draws every screen. Open: local_auth lets Android check the fingerprint, flutter_secure_storage takes out the key kept by the Keystore, cryptography derives two keys with HKDF, go_router keeps screens behind the lock. Browse: sqflite_sqlcipher opens the encrypted database in a folder given by path_provider, flutter_riverpod holds state and rereads it after every write, and the big titles are in Chakra Petch, bundled. Add a photo: image_picker hands it over, cryptography encrypts it with AES-GCM, uuid gives it a name unrelated to it. Add a video: media3-transformer shrinks it in Kotlin, javax.crypto encrypts it in chunks with hardware AES, video_player plays it back. Go and see him: intl writes the dates, url_launcher hands directions to the maps app. Back up: cryptography derives the key from the passphrase with PBKDF2, javax.crypto writes the stream, archive still reads the old format. No network package on the list.'));
};

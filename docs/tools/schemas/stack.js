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
  const C = 54;
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
    corps += `${texte(GX + i * (CW + CG) + 2, 162, nom, { taille: 10.5, couleur: c, police: MONO, poids: 700, extra: 'letter-spacing="1.6"' })}`;
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
      <rect x="${x}" y="${y}" width="${CW}" height="${RH}" rx="11" fill="${c}" fill-opacity="0.035" stroke="${c}" stroke-opacity="0.18"/>
      <g opacity="0">${anim}
        <rect x="${x}" y="${y}" width="${CW}" height="${RH}" rx="11" fill="${c}" fill-opacity="0.09" stroke="${c}" stroke-width="1.5"/>
      </g>
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
      ${texte(x + 20, y + 30, titre, { taille: 13.5, couleur: c, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 52, l1, { taille: 12 })}
      ${texte(x + 20, y + 70, l2, { taille: 12 })}`;
  });

  // ------------------------------------------------------------ le téléphone
  // Les mêmes écrans que les schémas dédiés : le verrou de verrou.svg, le
  // répertoire de repertoire.svg, la galerie et le sélecteur de coffre.svg,
  // la fiche et l'« Ouvrir avec » de reseau.svg, les réglages et la phrase
  // de sauvegarde.svg. Chaque geste s'y joue pour de vrai : touchers,
  // défilement, frappe, barres qui avancent.
  const T = telephone(60, 92, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';
  /// Un instant du geste [i], en part de sa durée (0 son début, 1 sa fin).
  const p = (i, k) => D(i) + k * PAS;
  const dans = (i, a, b, contenu, douceur = 0.003) => entre(C, p(i, a), p(i, b), contenu, douceur);
  const scene = (i, contenu) => entre(C, i === 0 ? 0 : D(i), i === GESTES.length - 1 ? 1 : D(i) + PAS, contenu, 0.005);
  const voile = (o = 0.55) => `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="${o}"/>`;
  const retour = (y = SY + 38) => `<path d="M${SX + 26} ${y} l-6 6 l6 6" fill="none" stroke="${APP.texte}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const rond = (cx, cy, r = 11) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${APP.violet}" stroke-width="3" stroke-dasharray="${r * 4} ${r * 2.4}">
      <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="0.9s" repeatCount="indefinite"/></circle>`;
  /// Une barre qui avance sans fin, comme LinearProgressIndicator.
  const barreFile = (y) => `<rect x="${SX + 16}" y="${y}" width="${SL - 32}" height="3" rx="1.5" fill="${APP.bord}"/>
    <rect x="${SX + 16}" y="${y}" height="3" rx="1.5" width="60" fill="${APP.violet}">
      <animate attributeName="x" dur="1.4s" repeatCount="indefinite" values="${SX + 16};${SX + SL - 76};${SX + 16}"/></rect>`;

  // Le visage d'Enzo, recadré à la demande, comme dans coffre.js : la même
  // photo sert de photo de fiche, de nouvelle photo et d'image de la vidéo.
  corps += `<g display="none">${visage(12, 0, 0, 1)}</g>`;
  function cadre(x, y, l, h, { zoom = 1, fx = 0.5, fy = 0.3, rx = 12 } = {}) {
    const c = O.id('cadre');
    const cote = Math.max(l, h) * zoom;
    return `<clipPath id="${c}"><rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${rx}"/></clipPath>
    <g clip-path="url(#${c})"><rect x="${x}" y="${y}" width="${l}" height="${h}" fill="${APP.carte}"/>
      <use href="#visage12" xlink:href="#visage12" x="${x + l / 2 - cote * fx}" y="${y + h * 0.4 - cote * fy}" width="${cote}" height="${cote}"/></g>`;
  }
  const ANCIENNE = { zoom: 1 }, NOUVELLE = { zoom: 1.7, fx: 0.42, fy: 0.3 }, VIDEO = { zoom: 1.3, fx: 0.58, fy: 0.24 };
  const lecture = (cx, cy, r = 11) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#000000" fill-opacity="0.45" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="1.4"/>
    <path d="M${cx - r * 0.3} ${cy - r * 0.45} L${cx + r * 0.5} ${cy} L${cx - r * 0.3} ${cy + r * 0.45} Z" fill="#FFFFFF"/>`;
  const vignetteVideo = (x, y, s, duree = '0:42') => cadre(x, y, s, s, { ...VIDEO, rx: 10 }) + lecture(x + s / 2, y + s / 2 - 4, s * 0.17) +
    texte(x + s - 6, y + s - 6, duree, { taille: 9, couleur: '#FFFFFF', poids: 700, ancre: 'end' });
  // Les photos de tous les jours, dans le sélecteur d'Android.
  const PAYSAGES = [['#F6AD55', '#9C4221'], ['#63B3ED', '#2C5282'], ['#68D391', '#276749'], ['#F687B3', '#702459'], ['#B794F4', '#44337A'], ['#FBD38D', '#975A16'], ['#90CDF4', '#2A4365'], ['#9AE6B4', '#22543D']];
  corps += `<defs>${PAYSAGES.map(([a, b], i) => `<linearGradient id="stackPaysage${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join('')}</defs>`;
  const paysage = (x, y, s, i) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="2" fill="url(#stackPaysage${i % PAYSAGES.length})"/>
    <circle cx="${x + s * 0.72}" cy="${y + s * 0.3}" r="${s * 0.1}" fill="#FFFFFF" fill-opacity="0.7"/>
    <path d="M${x} ${y + s * 0.85} L${x + s * 0.35} ${y + s * 0.5} L${x + s * 0.6} ${y + s * 0.72} L${x + s * 0.78} ${y + s * 0.6} L${x + s} ${y + s * 0.82} V${y + s} H${x} Z" fill="#000000" fill-opacity="0.28"/>`;

  // ------------------------------------------------ 1. Ouvrir
  // Le verrou de verrou.svg, puis la demande d'Android : il lit le doigt
  // lui-même, l'appli n'en voit rien, elle reçoit un oui.
  {
    const cx = SX + SL / 2, cy = SY + 380;
    const libelle = (s, c = APP.second) => texte(cx, SY + 470, s, { taille: 12.5, couleur: c, poids: 600, ancre: 'middle' });
    let s = `${logo(cx, SY + 128, 76)}
      ${texte(cx, SY + 212, 'BodyCount', { taille: 30, couleur: APP.texte, poids: 800, ancre: 'middle' })}
      ${texte(cx, SY + 240, t('Tout reste sur cet appareil. Aucun compte,', 'Everything stays on this device. No account,'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
      ${texte(cx, SY + 257, t('aucun serveur, aucune requête réseau.', 'no server, no network request.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
      <circle cx="${cx}" cy="${cy}" r="58" fill="${VIOLET}" opacity="0.12"><animate attributeName="r" dur="2.6s" repeatCount="indefinite" values="50;62;50"/></circle>
      <circle cx="${cx}" cy="${cy}" r="46" fill="url(#marque)"/>
      ${empreinte(cx, cy, 44, '#FFFFFF')}
      ${icone('lock', SX + 38, SY + SH - 40, APP.vert, 0.75)}
      ${texte(SX + 54, SY + SH - 29, t('Base chiffrée, clé rangée dans le Keystore', 'Encrypted database, key kept in the Keystore'), { taille: 10, couleur: APP.second, poids: 600 })}
      ${entre(C, 0, p(0, 0.14), libelle(t('Touche le capteur pour ouvrir', 'Touch the sensor to open')), 0.003)}
      ${toucher(cx, cy, C, p(0, 0.12))}
      ${dans(0, 0.68, 1, libelle(t('Vérification…', 'Checking…'), APP.rose))}`;
    // La feuille d'Android, avec son capteur que balaie une ligne.
    const fy = SY + SH - 214, fcy = fy + 112;
    const clip = O.id('doigt');
    s += dans(0, 0.17, 0.66, `${voile(0.6)}
      <rect x="${SX + 8}" y="${fy}" width="${SL - 16}" height="206" rx="26" fill="#211F26"/>
      ${logo(SX + 36, fy + 32, 22)}
      ${texte(SX + 54, fy + 37, 'BodyCount', { taille: 11.5, couleur: '#CAC4D0', poids: 600 })}
      ${texte(cx, fy + 70, t('Déverrouille BodyCount', 'Unlock BodyCount'), { taille: 16, couleur: '#E6E0E9', poids: 600, ancre: 'middle' })}
      <circle cx="${cx}" cy="${fcy}" r="27" fill="none" stroke="#4A4458" stroke-width="1.5"/>
      <clipPath id="${clip}">${empreinte(cx, fcy, 34, '#FFFFFF')}</clipPath>
      ${dans(0, 0.17, 0.5, `${empreinte(cx, fcy, 34, '#D0BCFF')}
        <g clip-path="url(#${clip})"><rect x="${cx - 20}" y="${fcy - 26}" width="40" height="8" fill="#FFFFFF">
          <animate attributeName="y" dur="1.1s" repeatCount="indefinite" values="${fcy - 26};${fcy + 18};${fcy - 26}"/></rect></g>`)}
      ${dans(0, 0.5, 0.66, `<circle cx="${cx}" cy="${fcy}" r="27" fill="${APP.vert}" fill-opacity="0.18" stroke="${APP.vert}" stroke-width="2"/>
        ${icone('coche', cx - 12, fcy - 12, APP.vert, 1.5)}`)}
      ${dans(0, 0.17, 0.5, texte(cx, fy + 176, t('Touchez le lecteur d’empreinte', 'Touch the fingerprint sensor'), { taille: 11, couleur: '#CAC4D0', ancre: 'middle' }))}
      ${dans(0, 0.5, 0.66, texte(cx, fy + 176, t('Empreinte reconnue', 'Fingerprint recognised'), { taille: 11, couleur: APP.vert, poids: 600, ancre: 'middle' }))}`);
    s += toucher(cx, fcy, C, p(0, 0.3));
    ecran += scene(0, s);
  }

  // ------------------------------------------------ 2. Parcourir
  // Le répertoire de repertoire.svg : l'en-tête, le champ, les pastilles,
  // puis la grille qui défile sous le doigt jusqu'à la carte d'Enzo.
  const CL = (SL - 36) / 2, CH = 150, GY0 = SY + 164;
  const DEFILE = 120;
  {
    let s = `${texte(SX + 18, SY + 44, t('RÉPERTOIRE', 'PEOPLE'), { taille: 15, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
      <rect x="${SX + SL - 52}" y="${SY + 24}" width="36" height="36" rx="12" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
      <path d="M${SX + SL - 43} ${SY + 37} h18 M${SX + SL - 43} ${SY + 47} h18" stroke="${APP.second}" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="${SX + SL - 30}" cy="${SY + 37}" r="2.6" fill="${APP.fond}" stroke="${APP.second}" stroke-width="1.6"/>
      <circle cx="${SX + SL - 38}" cy="${SY + 47}" r="2.6" fill="${APP.fond}" stroke="${APP.second}" stroke-width="1.6"/>
      <rect x="${SX + 12}" y="${SY + 70}" width="${SL - 24}" height="38" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${icone('loupe', SX + 26, SY + 81, APP.second, 1)}
      ${texte(SX + 50, SY + 94, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 12, couleur: APP.discret })}`;
    let px = SX + 12;
    [[t('Récents', 'Recent'), true], [t('Mieux notés', 'Top rated'), false], [t('Plus vues', 'Most seen'), false], [t('A à Z', 'A to Z'), false], ['Vannes', false]].forEach(([lib, actif]) => {
      s += O.pastille(px, SY + 120, lib, { plein: actif, taille: 11, h: 27 });
      px += O.largeurPastille(lib, 11) + 7;
    });
    // La grille, coupée sous les pastilles, qui défile.
    const clip = O.id('grille');
    let grille = '';
    [GENS.noa, GENS.lou, GENS.enzo, GENS.jade, GENS.matteo, GENS.gabriel, GENS.kelyan, GENS.ibrahim].forEach((q, i) => {
      grille += cartePersonne(q, SX + 12 + (i % 2) * (CL + 12), GY0 + Math.floor(i / 2) * (CH + 12), CL, CH, { premier: i === 0 });
    });
    s += `<clipPath id="${clip}"><rect x="${SX}" y="${SY + 156}" width="${SL}" height="${SH - 156}"/></clipPath>
      <g clip-path="url(#${clip})"><g>
        <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite"
          keyTimes="0;${p(1, 0.28).toFixed(4)};${p(1, 0.58).toFixed(4)};1" values="0 0;0 0;0 -${DEFILE};0 -${DEFILE}"
          calcMode="spline" keySplines="0 0 1 1;0.3 0 0.2 1;0 0 1 1"/>
        ${grille}</g></g>
      ${barreNav(T, 'Fiches')}`;
    // Le doigt qui pousse la grille vers le haut.
    s += `<circle r="13" fill="#FFFFFF" fill-opacity="0.28" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.5" cx="${SX + 190}" cy="${SY + 440}" opacity="0">
        ${visible(C, p(1, 0.26), p(1, 0.6), 0.004)}
        ${fondu('cy', C, [[0, SY + 440], [p(1, 0.28), SY + 440], [p(1, 0.58), SY + 440 - DEFILE], [1, SY + 440 - DEFILE]])}</circle>`;
    // Puis la carte d'Enzo, touchée.
    s += toucher(SX + 12 + CL / 2, GY0 + CH + 12 - DEFILE + CH / 2, C, p(1, 0.84));
    ecran += scene(1, s);
  }

  // ------------------------------------------------ 3. et 4. La galerie
  // La fiche d'Enzo et sa galerie, comme dans coffre.js. [n] : ses médias.
  const G = 60, GYF = SY + 330;
  const mediasFiche = [(x) => cadre(x, GYF, G, G, { ...ANCIENNE, rx: 12 }), (x) => cadre(x, GYF, G, G, { ...NOUVELLE, rx: 12 }), (x) => vignetteVideo(x, GYF, G)];
  const enTeteFiche = (h) => {
    let s = `${cadre(SX, SY, SL, h, { zoom: 1, fy: 0.28, rx: 0 })}
      <rect x="${SX}" y="${SY}" width="${SL}" height="${h}" fill="url(#voile)"/>
      <circle cx="${SX + 26}" cy="${SY + 28}" r="14" fill="#000000" fill-opacity="0.4"/>
      <path d="M${SX + 30} ${SY + 22} l-6 6 l6 6" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    let px = SX + 16;
    for (const [lib, vert] of [['N°12', true], [t('23 ans', 'age 23'), false], ['Vannes', false], [t('Versatile', 'Versatile'), false]]) {
      const l = lib.length * 6 + 18;
      s += `<rect x="${px}" y="${SY + h - 64}" width="${l}" height="18" rx="9" fill="${vert ? APP.vert : '#000000'}" fill-opacity="${vert ? 1 : 0.45}"/>
        ${texte(px + l / 2, SY + h - 51, lib, { taille: 9.5, couleur: vert ? '#062B12' : '#FFFFFF', poids: 700, ancre: 'middle' })}`;
      px += l + 5;
    }
    s += texte(SX + 16, SY + h - 14, 'Enzo P.', { taille: 26, couleur: '#FFFFFF', poids: 800 });
    [['3,8', ''], ['7', t('FOIS', 'TIMES')], ['347 j', t('DEPUIS', 'SINCE')]].forEach(([v, l], i) => {
      const x = SX + 18 + i * 88;
      s += texte(x, SY + h + 32, v, { taille: 17, couleur: APP.texte, poids: 800 });
      s += i === 0 ? etoiles(x, SY + h + 48, 8, { taille: 8 }) : texte(x, SY + h + 47, l, { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' });
    });
    return s;
  };
  const ficheGalerie = (n, touche) => {
    let s = enTeteFiche(236) + texte(SX + 16, SY + 318, t(`GALERIE · ${n}`, `GALLERY · ${n}`), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.5"' });
    for (let i = 0; i < n; i++) s += mediasFiche[i](SX + 16 + i * (G + 8));
    const px = SX + 16 + n * (G + 8);
    s += `<rect x="${px}" y="${GYF}" width="${G}" height="${G}" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
      <path d="M${px + G / 2 - 8} ${GYF + G / 2} h16 M${px + G / 2} ${GYF + G / 2 - 8} v16" stroke="${APP.second}" stroke-width="2" stroke-linecap="round"/>
      ${texte(SX + 16, SY + 424, 'INFOS', { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.5"' })}
      <rect x="${SX + 12}" y="${SY + 434}" width="${SL - 24}" height="40" rx="12" fill="${APP.carte}"/>
      ${texte(SX + 26, SY + 458, t('Téléphone', 'Phone'), { taille: 11, couleur: APP.second })}
      ${texte(SX + SL - 26, SY + 458, '07 15 93 62 08', { taille: 11, couleur: APP.texte, poids: 700, ancre: 'end' })}
      <rect x="${SX + 12}" y="${SY + SH - 58}" width="40" height="40" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${icone('call', SX + 24, SY + SH - 46, APP.second)}
      ${bouton(SX + 60, SY + SH - 58, SL - 72, 40, t('+  Nouvelle rencontre', '+  New encounter'), { taille: 12 })}`;
    if (touche !== undefined) s += toucher(px + G / 2, GYF + G / 2, C, touche);
    return s;
  };
  // « Photos et vidéos », l'écran de la galerie.
  const TG = (SL - 40) / 3;
  const tuileG = (i) => [SX + 12 + (i % 3) * (TG + 8), SY + 112 + Math.floor(i / 3) * (TG + 8)];
  const tuiles = [(i) => cadre(...tuileG(i), TG, TG, { ...ANCIENNE, rx: 12 }), (i) => cadre(...tuileG(i), TG, TG, { ...NOUVELLE, rx: 12 }), (i) => vignetteVideo(...tuileG(i), TG)];
  const galerie = (n, { ajouter = null, messages = '', arrivee = null } = {}) => {
    let s = `${retour(SY + 38)}
      ${texte(SX + 44, SY + 50, t('Photos et vidéos', 'Photos and videos'), { taille: 17, couleur: APP.texte, poids: 700 })}`;
    for (let i = 0; i < n; i++) s += tuiles[i](i);
    if (arrivee) s += entre(C, arrivee[1], 1, tuiles[arrivee[0]](arrivee[0]), 0.004);
    s += messages;
    s += `<rect x="${SX + SL - 118}" y="${SY + SH - 70}" width="102" height="46" rx="16" fill="${APP.violet}" ${messages ? 'fill-opacity="0.35"' : ''}/>
      ${icone('photo', SX + SL - 104, SY + SH - 55, '#FFFFFF')}
      ${texte(SX + SL - 82, SY + SH - 42, t('Ajouter', 'Add'), { taille: 13, couleur: '#FFFFFF', poids: 700 })}`;
    if (ajouter !== null) s += toucher(SX + SL - 67, SY + SH - 47, C, ajouter);
    return s;
  };
  const message = (de, a, s) => entre(C, de, a, texte(SX + 16, SY + 82, s, { taille: 11.5, couleur: APP.second }), 0.002);
  // Le sélecteur d'Android : [choix] la case prise, [video] s'il s'agit d'une vidéo.
  const selecteur = (choix, video, prend, valide) => {
    const TP = (SL - 24 - 6) / 4;
    const kase = (i) => [SX + 12 + (i % 4) * (TP + 2), SY + 96 + Math.floor(i / 4) * (TP + 2)];
    let s = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#1B1B1F"/>
      ${icone('croix', SX + 18, SY + 36, '#E3E2E6')}
      ${texte(SX + 46, SY + 49, t('Sélectionner des éléments', 'Select items'), { taille: 14, couleur: '#E3E2E6', poids: 600 })}
      ${texte(SX + 16, SY + 84, t('Aujourd’hui', 'Today'), { taille: 11, couleur: '#C4C6D0', poids: 600 })}`;
    for (let i = 0; i < 20; i++) {
      const [x, y] = kase(i);
      if (i === 1) s += cadre(x, y, TP, TP, { ...NOUVELLE, rx: 2 });
      else if (i === 2) s += cadre(x, y, TP, TP, { ...VIDEO, rx: 2 }) + texte(x + TP - 5, y + TP - 5, '0:42', { taille: 8.5, couleur: '#FFFFFF', poids: 700, ancre: 'end' });
      else s += `<g opacity="0.85">${paysage(x, y, TP, i)}</g>`;
    }
    const [x, y] = kase(choix);
    s += `<circle cx="${x + 11}" cy="${y + 11}" r="8" fill="none" stroke="#FFFFFF" stroke-width="1.5"/>
      ${entre(C, prend, 1, `<rect x="${x + 1}" y="${y + 1}" width="${TP - 2}" height="${TP - 2}" rx="2" fill="none" stroke="#A8C7FA" stroke-width="3"/>
        <circle cx="${x + 11}" cy="${y + 11}" r="9" fill="#A8C7FA"/>${texte(x + 11, y + 14.5, '1', { taille: 10, couleur: '#062E6F', poids: 800, ancre: 'middle' })}`, 0.003)}
      ${toucher(x + TP / 2, y + TP / 2, C, prend)}
      <rect x="${SX}" y="${SY + SH - 70}" width="${SL}" height="70" fill="#1B1B1F"/>
      <rect x="${SX + SL - 124}" y="${SY + SH - 56}" width="108" height="38" rx="19" fill="#A8C7FA"/>
      ${texte(SX + SL - 70, SY + SH - 32, t('Ajouter (1)', 'Add (1)'), { taille: 12.5, couleur: '#062E6F', poids: 700, ancre: 'middle' })}
      ${toucher(SX + SL - 70, SY + SH - 37, C, valide)}`;
    return s;
  };

  // 3. Une photo : la fiche, la galerie, le sélecteur, le chiffrement.
  ecran += scene(2, `${dans(2, 0, 0.2, ficheGalerie(1, p(2, 0.12)))}
    ${dans(2, 0.2, 0.36, galerie(1, { ajouter: p(2, 0.3) }))}
    ${dans(2, 0.36, 0.64, selecteur(1, false, p(2, 0.46), p(2, 0.57)))}
    ${dans(2, 0.64, 1, galerie(1, {
      arrivee: [1, p(2, 0.84)],
      messages: message(p(2, 0.64), p(2, 0.84), t('Chiffrement, 1 sur 1…', 'Encrypting, 1 of 1…')) +
        entre(C, p(2, 0.64), p(2, 0.84), barreFile(SY + 92), 0.003),
    }))}`);

  // 4. Une vidéo : le sélecteur, l'allègement, le chiffrement, la lecture.
  {
    const allege = [[0.41, 0.48, 24], [0.48, 0.55, 57], [0.55, 0.62, 91]];
    let msgs = message(p(3, 0.34), p(3, 0.41), t('Chiffrement de la vidéo, 1 sur 1…', 'Encrypting the video, 1 of 1…'));
    for (const [a, b, n] of allege) msgs += message(p(3, a), p(3, b), t(`Allègement de la vidéo, ${n} %…`, `Shrinking the video, ${n}%…`));
    msgs += entre(C, p(3, 0.34), p(3, 0.62), barreFile(SY + 92), 0.003);
    const VY = SY + 160, VH = 230;
    const visionneuse = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
      ${icone('croix', SX + 18, SY + 34, '#FFFFFF')}
      ${texte(SX + SL / 2, SY + 47, '3 / 3', { taille: 13, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
      ${icone('telecharger', SX + SL - 64, SY + 34, '#FFFFFF')}
      ${dans(3, 0.74, 0.84, `${rond(SX + SL / 2, VY + VH / 2 - 14, 14)}
        ${texte(SX + SL / 2, VY + VH / 2 + 26, t('Déchiffrement…', 'Decrypting…'), { taille: 12.5, couleur: '#D8CCEF', poids: 600, ancre: 'middle' })}`)}
      ${dans(3, 0.84, 1, `${cadre(SX, VY, SL, VH, { ...VIDEO, rx: 0 })}
        <rect x="${SX + 48}" y="${SY + SH - 41}" width="${SL - 96}" height="4" rx="2" fill="#FFFFFF" fill-opacity="0.25"/>
        <rect x="${SX + 48}" y="${SY + SH - 41}" height="4" rx="2" fill="${APP.violet}" width="0">${fondu('width', C, [[0, 0], [p(3, 0.84), 0], [p(3, 1), (SL - 96) * 0.24], [1, (SL - 96) * 0.24]])}</rect>
        <circle cy="${SY + SH - 39}" r="6" fill="${APP.violet}" cx="${SX + 48}">${fondu('cx', C, [[0, SX + 48], [p(3, 0.84), SX + 48], [p(3, 1), SX + 48 + (SL - 96) * 0.24], [1, SX + 48 + (SL - 96) * 0.24]])}</circle>
        ${texte(SX + 16, SY + SH - 34, '0:04', { taille: 10.5, couleur: '#FFFFFF' })}
        ${texte(SX + SL - 16, SY + SH - 34, '0:42', { taille: 10.5, couleur: '#FFFFFF', ancre: 'end' })}`)}`;
    ecran += scene(3, `${dans(3, 0, 0.14, galerie(2, { ajouter: p(3, 0.08) }))}
      ${dans(3, 0.14, 0.34, selecteur(2, true, p(3, 0.22), p(3, 0.3)))}
      ${dans(3, 0.34, 0.74, galerie(2, { arrivee: [2, p(3, 0.62)], messages: msgs }) + toucher(...tuileG(2).map((v) => v + TG / 2), C, p(3, 0.71)))}
      ${dans(3, 0.74, 1, visionneuse)}`);
  }

  // ------------------------------------------------ 5. Aller le voir
  // La fiche de reseau.svg, ses rencontres datées par intl, « Y aller »,
  // puis l'appli de cartes sur la vraie côte du golfe du Morbihan.
  {
    const direction = (c) => `<g transform="scale(0.6667)">${O.ICONES_APP.directions(c)}</g>`;
    const maison = (c) => `<g transform="scale(0.6667)">${O.ICONES_APP.home(c)}</g>`;
    const combine = (c) => `<g transform="scale(0.6667)">${O.ICONES_APP.call(c)}</g>`;
    const picto = (f, x, y, c) => `<g transform="translate(${x} ${y})">${f(c)}</g>`;
    let fiche = enTeteFiche(250);
    fiche += texte(SX + 16, SY + 334, t('RENCONTRES · 7', 'ENCOUNTERS · 7'), { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.6"' });
    [[t('14 sept. 2026', '14 Sept 2026'), t('22h22 · Auray', '10:22 pm · Auray'), 7], [t('2 août 2026', '2 Aug 2026'), t('23h05 · Vannes', '11:05 pm · Vannes'), 8]].forEach(([j, s, n], k) => {
      const y = SY + 344 + k * 50;
      fiche += `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="44" rx="13" fill="${APP.carte}" stroke="${APP.bord}"/>
        ${texte(SX + 26, y + 19, j, { taille: 12, couleur: APP.texte, poids: 700 })}
        ${texte(SX + 26, y + 34, s, { taille: 9.5, couleur: APP.discret })}
        ${etoiles(SX + SL - 84, y + 27, n, { taille: 9 })}`;
    });
    fiche += `<rect x="${SX + 12}" y="${SY + 446}" width="${SL - 24}" height="36" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${picto(maison, SX + 22, SY + 456, APP.second)}
      ${texte(SX + 46, SY + 468.5, t('Adresse', 'Address'), { taille: 10.5, couleur: APP.second })}
      ${texte(SX + SL - 24, SY + 468.5, 'Place des Lices, Vannes', { taille: 10.5, couleur: APP.texte, poids: 700, ancre: 'end' })}`;
    const yb = SY + SH - 58;
    [[0, combine], [1, direction]].forEach(([i, f]) => {
      fiche += `<circle cx="${SX + 34 + i * 50}" cy="${yb + 21}" r="20" fill="${APP.carte}" stroke="${APP.bord}"/>${picto(f, SX + 26 + i * 50, yb + 13, APP.etoile)}`;
    });
    fiche += bouton(SX + 110, yb, SL - 122, 42, t('+ Nouvelle rencontre', '+ New encounter'), { taille: 12 });
    fiche += toucher(SX + 84, yb + 21, C, p(4, 0.16));
    // « Ouvrir avec » : Android demande à quelle appli passer l'adresse.
    const fh = 232, fy = SY + SH - fh;
    const feuille = `${voile(0.55)}
      <rect x="${SX}" y="${fy}" width="${SL}" height="${fh + 20}" rx="22" fill="${APP.carte}"/>
      <rect x="${SX + SL / 2 - 18}" y="${fy + 9}" width="36" height="4" rx="2" fill="${APP.bord}"/>
      ${texte(SX + 20, fy + 42, t('Ouvrir avec', 'Open with'), { taille: 15, couleur: APP.texte, poids: 700 })}
      ${texte(SX + 20, fy + 62, 'geo:0,0?q=Place%20des%20Lices…', { taille: 9.5, couleur: APP.second, police: MONO })}
      ${['Google Maps', 'Organic Maps', 'Waze'].map((n, i) => `
        <rect x="${SX + 20}" y="${fy + 80 + i * 44}" width="30" height="30" rx="8" fill="${['#34A853', '#2E7D32', '#33CCFF'][i]}" fill-opacity="0.85"/>
        ${texte(SX + 62, fy + 100 + i * 44, n, { taille: 12.5, couleur: APP.texte })}`).join('')}
      ${toucher(SX + 100, fy + 95, C, p(4, 0.42))}`;
    // L'appli de cartes : la vraie côte, lue dans france.bin. La fenêtre
    // épouse l'écran, pour que la carte le couvre sans marge.
    const cLon = -2.79, cLat = 47.625, k = SH / 0.2, cos = Math.cos((cLat * Math.PI) / 180);
    const dLon = SL / (k * cos) / 2;
    const F = O.france(SX, SY, SL, SH, [cLon - dLon, cLat - 0.1, cLon + dLon, cLat + 0.1]);
    const [ax, ay] = F.proj(-2.7598, 47.6567); // Place des Lices
    const trajet = [[-2.8225, 47.6275], [-2.812, 47.634], [-2.798, 47.6405], [-2.784, 47.6455], [-2.771, 47.6505], [-2.7598, 47.6567]].map(([o, a]) => F.proj(o, a));
    const d = 'M' + trajet.map((q) => q.map((v) => Math.round(v * 10) / 10).join(' ')).join('L');
    let L = 0;
    for (let i = 1; i < trajet.length; i++) L += Math.hypot(trajet[i][0] - trajet[i - 1][0], trajet[i][1] - trajet[i - 1][1]);
    L = Math.ceil(L) + 4;
    const lieux = [['Vannes', -2.752, 47.668, 13, 700], ['Séné', -2.737, 47.609, 11, 600], ['Arradon', -2.826, 47.619, 11, 600], ['Île-aux-Moines', -2.832, 47.592, 10, 600]];
    const clip = O.id('plan');
    const plan = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#AADAFF"/>
      <clipPath id="${clip}"><rect x="${SX}" y="${SY}" width="${SL}" height="${SH}"/></clipPath>
      <g clip-path="url(#${clip})">
        <path d="${F.terre}" fill="#F1F3F4" stroke="#C9D7E3" stroke-width="0.8" fill-rule="evenodd"/>
        ${lieux.map(([n, o, a, tl, pd]) => { const [x, y] = F.proj(o, a); return texte(x, y, n, { taille: tl, couleur: '#5F6368', poids: pd, ancre: 'middle' }); }).join('')}
        <path d="${d}" fill="none" stroke="#1A73E8" stroke-opacity="0.35" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${d}" fill="none" stroke="#4285F4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${L}" stroke-dashoffset="${L}">
          ${fondu('stroke-dashoffset', C, [[0, L], [p(4, 0.58), L], [p(4, 0.78), 0], [1, 0]])}</path>
        <circle cx="${trajet[0][0].toFixed(1)}" cy="${trajet[0][1].toFixed(1)}" r="8" fill="#4285F4" stroke="#FFFFFF" stroke-width="2.5"/>
        <g opacity="0">${visible(C, p(4, 0.76), 1, 0.004)}
          <path d="M${ax.toFixed(1)} ${ay.toFixed(1)} c0 0 -12 -14 -12 -22 a12 12 0 0 1 24 0 c0 8 -12 22 -12 22 z" fill="#EA4335"/>
          <circle cx="${ax.toFixed(1)}" cy="${(ay - 22).toFixed(1)}" r="4" fill="#B31412"/></g>
      </g>
      <rect x="${SX + 12}" y="${SY + 16}" width="${SL - 24}" height="40" rx="20" fill="#FFFFFF"/>
      ${texte(SX + 30, SY + 41, 'Place des Lices, Vannes', { taille: 12.5, couleur: '#202124', poids: 600 })}
      <rect x="${SX}" y="${SY + SH - 92}" width="${SL}" height="92" fill="#FFFFFF"/>
      ${entre(C, p(4, 0.78), 1, texte(SX + 20, SY + SH - 60, t('8 min · 3,4 km', '8 min · 3.4 km'), { taille: 18, couleur: '#188038', poids: 700 }), 0.003)}
      ${entre(C, p(4, 0.5), p(4, 0.78), texte(SX + 20, SY + SH - 60, t('Calcul de l’itinéraire…', 'Finding the route…'), { taille: 14, couleur: '#5F6368', poids: 600 }), 0.003)}
      ${texte(SX + 20, SY + SH - 36, t('Une autre appli : elle, sait où tu vas.', 'Another app: it knows where you go.'), { taille: 10.5, couleur: '#5F6368' })}`;
    ecran += scene(4, `${dans(4, 0, 0.5, fiche + dans(4, 0.2, 0.5, feuille))}${dans(4, 0.5, 1, plan)}`);
  }

  // ------------------------------------------------ 6. Sauvegarder
  // Les réglages de sauvegarde.svg, la phrase tapée, l'attente qui compte
  // les médias, puis la feuille « Sauvegarde prête ».
  {
    const ligne = (y, ic, c, titre, sous, valeur = '') => `
      <rect x="${SX + 26}" y="${y + 14}" width="28" height="28" rx="8" fill="${c}" fill-opacity="0.14"/>
      ${icone(ic, SX + 32, y + 20, c)}
      ${texte(SX + 64, y + 26, titre, { taille: 12, couleur: APP.texte, poids: 600 })}
      ${texte(SX + 64, y + 42, sous, { taille: 9.5, couleur: APP.discret })}
      ${valeur ? texte(SX + SL - 26, y + 34, valeur, { taille: 9.5, couleur: APP.second, poids: 700, ancre: 'end', extra: 'letter-spacing="0.8"' }) : ''}`;
    const reglages = `
      ${texte(SX + 20, SY + 48, '‹', { taille: 24, couleur: APP.texte })}
      ${texte(SX + 44, SY + 48, t('Réglages', 'Settings'), { taille: 21, couleur: APP.texte, poids: 800 })}
      <rect x="${SX + 12}" y="${SY + 70}" width="${SL - 24}" height="64" rx="18" fill="${APP.violet}" fill-opacity="0.12" stroke="${APP.bord}"/>
      ${logo(SX + 44, SY + 102, 38)}
      ${texte(SX + 74, SY + 99, t('18 Personnes', '18 People'), { taille: 14, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 74, SY + 116, t('111 Rencontres', '111 Encounters'), { taille: 10.5, couleur: APP.second, poids: 600 })}
      ${texte(SX + 20, SY + 166, t('DONNÉES', 'DATA'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.5"' })}
      <rect x="${SX + 12}" y="${SY + 178}" width="${SL - 24}" height="186" rx="18" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${ligne(SY + 182, 'shield', APP.vert, t('Tout reste sur ce téléphone', 'Everything stays on this phone'), t('Base chiffrée, aucun compte', 'Encrypted database, no account'))}
      <line x1="${SX + 12}" y1="${SY + 240}" x2="${SX + SL - 12}" y2="${SY + 240}" stroke="${APP.bord}"/>
      ${ligne(SY + 242, 'ios_share', APP.rose, t('Exporter, chiffré', 'Export, encrypted'), t('Dernière il y a 38 jours', 'Last one 38 days ago'), t('Phrase', 'Passphrase'))}
      <line x1="${SX + 12}" y1="${SY + 302}" x2="${SX + SL - 12}" y2="${SY + 302}" stroke="${APP.bord}"/>
      ${ligne(SY + 304, 'settings_backup_restore', APP.rose, t('Restaurer une sauvegarde', 'Restore a backup'), t('Remplace ce qui est ici', 'Replaces what is here'), '.bcx')}`;
    const phrase = `${voile(0.62)}
      <rect x="${SX + 16}" y="${SY + 150}" width="${SL - 32}" height="236" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${texte(SX + 38, SY + 190, t('Phrase de passe', 'Passphrase'), { taille: 17, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 38, SY + 216, t('Elle protège la sauvegarde, et elle', 'It protects the backup, and it alone'), { taille: 10.5, couleur: APP.second })}
      ${texte(SX + 38, SY + 231, t('seule permettra de la relire. Personne', 'will let you read it again. Nobody'), { taille: 10.5, couleur: APP.second })}
      ${texte(SX + 38, SY + 246, t('ne peut la retrouver à ta place.', 'can recover it for you.'), { taille: 10.5, couleur: APP.second })}
      ${entre(C, 0, p(5, 0.28), texte(SX + 40, SY + 286, t('Au moins 8 caractères', 'At least 8 characters'), { taille: 11.5, couleur: APP.discret }), 0.003)}
      ${O.frappe(SX + 40, SY + 287, '••••••••••••••', C, p(5, 0.28), p(5, 0.42), { taille: 15, couleur: APP.texte })}
      <line x1="${SX + 38}" y1="${SY + 298}" x2="${SX + SL - 38}" y2="${SY + 298}" stroke="${APP.violet}" stroke-width="2"/>
      ${texte(SX + SL - 118, SY + 350, t('Annuler', 'Cancel'), { taille: 12, couleur: APP.second, poids: 700, ancre: 'middle' })}
      ${texte(SX + SL - 52, SY + 350, t('Exporter', 'Export'), { taille: 12, couleur: APP.rose, poids: 700, ancre: 'middle' })}
      ${toucher(SX + SL - 52, SY + 346, C, p(5, 0.47))}`;
    // L'attente : le compteur des médias avance.
    const pas = [4, 11, 18, 26, 33, 40];
    let compte = '';
    pas.forEach((n, i) => {
      const a = 0.52 + i * 0.045, b = i === pas.length - 1 ? 0.8 : 0.52 + (i + 1) * 0.045;
      compte += dans(5, a, b, texte(SX + 66, SY + 301, t('Chiffrement des médias,', 'Encrypting media,'), { taille: 10.5, couleur: APP.texte }) +
        texte(SX + 66, SY + 317, t(`${n} sur 40…`, `${n} of 40…`), { taille: 10.5, couleur: APP.second, police: MONO }), 0.002);
    });
    const attente = `${voile(0.62)}
      <rect x="${SX + 16}" y="${SY + 270}" width="${SL - 32}" height="70" rx="20" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${rond(SX + 46, SY + 305)}
      ${compte}`;
    const prete = `${voile(0.62)}
      <rect x="${SX}" y="${SY + SH - 190}" width="${SL}" height="200" rx="22" fill="${APP.carte}"/>
      <rect x="${SX + SL / 2 - 18}" y="${SY + SH - 180}" width="36" height="4" rx="2" fill="${APP.bord}"/>
      ${texte(SX + 22, SY + SH - 150, t('Sauvegarde prête, 186 Mo', 'Backup ready, 186 MB'), { taille: 14.5, couleur: APP.texte, poids: 700 })}
      ${icone('save_alt', SX + 24, SY + SH - 122, APP.second)}
      ${texte(SX + 56, SY + SH - 116, t('Enregistrer sur le téléphone', 'Save on the phone'), { taille: 12, couleur: APP.texte, poids: 600 })}
      ${texte(SX + 56, SY + SH - 100, t('Dans le dossier de ton choix', 'In the folder of your choice'), { taille: 10, couleur: APP.discret })}
      ${icone('ios_share', SX + 24, SY + SH - 70, APP.second)}
      ${texte(SX + 56, SY + SH - 64, t('Partager', 'Share'), { taille: 12, couleur: APP.texte, poids: 600 })}
      ${texte(SX + 56, SY + SH - 48, t('Vers une autre application', 'To another app'), { taille: 10, couleur: APP.discret })}
      ${toucher(SX + 130, SY + SH - 110, C, p(5, 0.93))}`;
    ecran += scene(5, `${reglages}${toucher(SX + 130, SY + 272, C, p(5, 0.12))}
      ${dans(5, 0.2, 0.5, phrase)}${dans(5, 0.5, 0.8, attente)}${dans(5, 0.8, 1.3, prete)}`);
  }
  corps += T.ecran(ecran);

  svg('stack.svg', 1280, H, corps, t(
    'La stack de BodyCount, paquet par paquet, là où chacun travaille. Flutter en Dart 3.11 dessine chaque écran. Ouvrir : local_auth laisse Android vérifier l’empreinte, flutter_secure_storage sort la clé gardée par le Keystore, cryptography en tire deux clés par HKDF, go_router garde les écrans derrière le verrou. Parcourir : sqflite_sqlcipher ouvre la base chiffrée dans un dossier donné par path_provider, flutter_riverpod tient l’état et le relit après chaque écriture, et les grands titres sont en Chakra Petch, embarquée. Ajouter une photo : image_picker la rend, cryptography la chiffre en AES-GCM, uuid lui donne un nom sans rapport avec elle. Ajouter une vidéo : media3-transformer l’allège en Kotlin, javax.crypto la chiffre par morceaux avec l’AES matériel, video_player la rejoue. Aller le voir : intl écrit les dates, url_launcher passe l’itinéraire à l’appli de cartes. Sauvegarder : cryptography tire la clé de la phrase par PBKDF2, javax.crypto écrit le flux, archive relit encore l’ancien format. Aucun paquet réseau dans la liste.',
    'The BodyCount stack, package by package, where each one works. Flutter on Dart 3.11 draws every screen. Open: local_auth lets Android check the fingerprint, flutter_secure_storage takes out the key kept by the Keystore, cryptography derives two keys with HKDF, go_router keeps screens behind the lock. Browse: sqflite_sqlcipher opens the encrypted database in a folder given by path_provider, flutter_riverpod holds state and rereads it after every write, and the big titles are in Chakra Petch, bundled. Add a photo: image_picker hands it over, cryptography encrypts it with AES-GCM, uuid gives it a name unrelated to it. Add a video: media3-transformer shrinks it in Kotlin, javax.crypto encrypts it in chunks with hardware AES, video_player plays it back. Go and see him: intl writes the dates, url_launcher hands directions to the maps app. Back up: cryptography derives the key from the passphrase with PBKDF2, javax.crypto writes the stream, archive still reads the old format. No network package on the list.'));
};

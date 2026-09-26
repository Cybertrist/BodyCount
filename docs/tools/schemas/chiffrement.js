// D'où viennent les clés, et ce qu'elles ouvrent.
//
// À gauche, le téléphone : l'écran de verrou, la demande d'Android, puis
// le répertoire qui se remplit, le texte quand la base s'ouvre, les
// photos quand la clé du coffre arrive. À droite, la chaîne de
// lib/security/key_vault.dart : l'empreinte, la clé maîtresse du
// Keystore, HKDF et ses deux étiquettes. Dessous, les trois fichiers du
// disque, tels qu'un voleur les lit sans l'empreinte, puis tels que
// l'appli les voit en mémoire.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, empreinte, logo, icone, visage,
    cartePersonne, barreNav, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU } = O;
  const C = 24;
  const TOUCHE = 0.05, DEMANDE = 0.065, DOIGT = 0.13, OUVRE = 0.155;
  const A = 0.15, B = 0.2, H = 0.25, D1 = 0.3, D2 = 0.35, BASE = 0.33, COFFRE = 0.39, FIN = 0.955;
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
  // Un fil qui se colore une fois la bille passée.
  const fil = (chemin, de, couleur = ACCENT) => `<path d="${chemin}" fill="none" stroke="${FIL}" stroke-width="1.8"/>
    <path d="${chemin}" fill="none" stroke="${couleur}" stroke-width="1.8" stroke-opacity="0.7" opacity="0">${visible(C, de, FIN)}</path>`;

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // L'écran de verrou.
  ecran += entre(C, 0, OUVRE, `
    ${logo(SX + SL / 2, SY + 128, 76)}
    ${texte(SX + SL / 2, SY + 212, 'BodyCount', { taille: 30, couleur: APP.texte, poids: 800, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + 240, t('Tout reste sur cet appareil. Aucun compte,', 'Everything stays on this device. No account,'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + 257, t('aucun serveur, aucune requête réseau.', 'no server, no network request.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    <circle cx="${SX + SL / 2}" cy="${SY + 380}" r="46" fill="url(#marque)"/>
    ${empreinte(SX + SL / 2, SY + 380, 44, '#FFFFFF')}
    ${texte(SX + SL / 2, SY + 470, t('Touche le capteur pour ouvrir', 'Touch the sensor to open'), { taille: 12.5, couleur: APP.second, poids: 600, ancre: 'middle' })}
    ${toucher(SX + SL / 2, SY + 380, C, TOUCHE)}
    ${icone('cadenas', SX + 38, SY + SH - 40, APP.vert, 0.75)}
    ${texte(SX + 54, SY + SH - 29, t('Base chiffrée, clé rangée dans le Keystore', 'Encrypted database, key kept in the Keystore'), { taille: 10, couleur: APP.second, poids: 600 })}`, 0.006);

  // La demande d'Android, par-dessus : le code du téléphone est accepté aussi.
  ecran += entre(C, DEMANDE, OUVRE, `
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
    <rect x="${SX + 8}" y="${SY + SH - 250}" width="${SL - 16}" height="242" rx="24" fill="#1D1A24"/>
    ${texte(SX + SL / 2, SY + SH - 214, t('Authentification requise', 'Authentication required'), { taille: 15, couleur: '#ECE6F4', poids: 600, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + SH - 192, t('Déverrouille BodyCount', 'Unlock BodyCount'), { taille: 12, couleur: '#B5ADC4', ancre: 'middle' })}
    <circle cx="${SX + SL / 2}" cy="${SY + SH - 130}" r="30" fill="none" stroke="#3A3446" stroke-width="2"/>
    ${empreinte(SX + SL / 2, SY + SH - 130, 36, '#D0BCFF')}
    <circle cx="${SX + SL / 2}" cy="${SY + SH - 130}" r="30" fill="none" stroke="${APP.vert}" stroke-width="2.5" opacity="0">${visible(C, DOIGT + 0.006, OUVRE)}</circle>
    ${toucher(SX + SL / 2, SY + SH - 130, C, DOIGT)}
    ${texte(SX + SL / 2, SY + SH - 76, t('Touche le lecteur d’empreinte', 'Touch the fingerprint sensor'), { taille: 11, couleur: '#B5ADC4', ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + SH - 36, t('Utiliser le code', 'Use PIN'), { taille: 12, couleur: '#D0BCFF', poids: 600, ancre: 'middle' })}`, 0.004);

  // Le répertoire : d'abord des cases vides, puis le texte quand la base
  // s'ouvre, puis les photos quand la clé du coffre arrive.
  const gens = [GENS.noa, GENS.lou, GENS.enzo, GENS.jade, GENS.matteo, GENS.gabriel];
  let rep = `${texte(SX + 18, SY + 44, t('RÉPERTOIRE', 'PEOPLE'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
    <rect x="${SX + 128}" y="${SY + 26}" width="${SL - 146}" height="28" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${icone('loupe', SX + 138, SY + 33, APP.second, 0.8)}
    ${texte(SX + 156, SY + 44.5, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 10, couleur: APP.discret })}`;
  const CL = (SL - 36) / 2, CH = 150;
  gens.forEach((p, i) => {
    const x = SX + 12 + (i % 2) * (CL + 12), y = SY + 72 + Math.floor(i / 2) * (CH + 12);
    const photo = COFFRE + 0.012 + i * 0.012;
    // La case, avant : un fond, un cadenas qui attend.
    rep += `<rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
      <g opacity="0.5">${icone('cadenas', x + CL / 2 - 12, y + CH / 2 - 24, APP.discret, 1.5)}</g>`;
    rep += entre(C, BASE + i * 0.006, FIN, `
      <rect x="${x + 9}" y="${y + CH - 46}" width="${CL - 30}" height="12" rx="4" fill="${APP.bord}"/>
      <rect x="${x + 9}" y="${y + CH - 26}" width="${CL - 50}" height="8" rx="4" fill="${APP.bord}"/>`, 0.006);
    rep += entre(C, photo, FIN, cartePersonne(p, x, y, CL, CH, { premier: i === 0 }), 0.01);
  });
  rep += barreNav(T, 'Fiches');
  ecran += entre(C, OUVRE, FIN, rep, 0.006);
  corps += T.ecran(ecran);

  // ------------------------------------------------------- la chaîne des clés
  corps += rubrique(400, 108, t('D’OÙ VIENNENT LES CLÉS', 'WHERE THE KEYS COME FROM'));
  const Y = 212; // l'axe de la chaîne
  const boite = (x, y, l, h, titre, l1, l2, c, de) => `
    <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="13" fill="none" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, de, FIN)}</rect>
    <rect x="${x}" y="${y + 14}" width="3" height="${h - 28}" rx="1.5" fill="${c}"/>
    ${texte(x + 18, y + 28, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
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
    [COFFRE + 0.05, FIN, t('Le coffre s’ouvre : chaque photo est déchiffrée à l’affichage.', 'The vault opens: each photo is decrypted as it is shown.'), BLEU],
  ];
  legendes.forEach(([de, a, s, c]) => {
    corps += entre(C, de, a, `<circle cx="410" cy="337" r="4" fill="${c}"/>${texte(424, 342, s, { taille: 13, couleur: c === DISCRET ? TEXTE : TITRE, poids: 600 })}`, 0.006);
  });

  // ------------------------------------------------------- ce qu'il y a sur le disque
  const DY = 356;
  corps += rubrique(400, DY + 16, t('SUR LE DISQUE', 'ON DISK'));
  corps += entre(C, 0, BASE, rubrique(560, DY + 16, t('CE QU’UN VOLEUR LIT SANS L’EMPREINTE', 'WHAT A THIEF READS WITHOUT THE FINGERPRINT'), ROUGE), 0.006);
  corps += entre(C, BASE, FIN, rubrique(560, DY + 16, t('CE QUE L’APPLI VOIT, EN MÉMOIRE SEULEMENT', 'WHAT THE APP SEES, IN MEMORY ONLY'), VERT), 0.006);
  corps += `<rect x="400" y="${DY + 30}" width="820" height="186" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const bruit = (graine, n) => {
    let s = '', x = graine;
    for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) % 2147483648; s += (x >> 16 & 255).toString(16).toUpperCase().padStart(2, '0') + ' '; }
    return s.trim();
  };
  const lignes = [
    ['databases/bodycount.db', t('SQLCipher, AES-256, page par page', 'SQLCipher, AES-256, page by page'), VERT, BASE,
      bruit(7, 16), null],
    ['app_flutter/vault/7c02…5e.bcx', t('BCX1, nonce, AES-GCM, MAC', 'BCX1, nonce, AES-GCM, MAC'), BLEU, COFFRE + 0.012,
      '42 43 58 31 │ ' + bruit(3, 12), 'photo'],
    ['shared_prefs/FlutterSecureStorage.xml', 'bodycount_master_key_v1', ACCENT, B,
      bruit(11, 16), 'cle'],
  ];
  lignes.forEach(([chemin, sous, c, de, hex, sorte], i) => {
    const y = DY + 48 + i * 58;
    if (i) corps += `<line x1="416" y1="${y - 8}" x2="1204" y2="${y - 8}" stroke="${BORD}"/>`;
    corps += `<rect x="416" y="${y}" width="3" height="42" rx="1.5" fill="${c}"/>
      ${texte(430, y + 17, chemin, { taille: 12, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(430, y + 35, sous, { taille: 11, couleur: DISCRET })}`;
    const X = 740;
    corps += entre(C, 0, de, `${texte(X, y + 26, hex, { taille: 11.5, couleur: '#6B5870', police: MONO })}`, 0.006);
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
    corps += entre(C, de, FIN, clair, 0.008);
    // Un balayage au moment où la ligne se déchiffre.
    corps += `<rect x="${X - 6}" y="${y}" width="0" height="42" fill="${c}" fill-opacity="0.12">${fondu('width', C, [[0, 0], [de - 0.02, 0], [de, 470], [de + 0.02, 0], [1, 0]])}</rect>`;
  });

  // ------------------------------------------------------- trois cartes du bas
  const bas = [
    [OR, t('Une clé par usage', 'One key per use'), t('Une étiquette HKDF différente pour', 'Two HKDF labels, two keys:'), t('la base et le coffre : l’une ne livre pas l’autre.', 'one never opens the other’s door.')],
    [VIOLET, t('Rien avant l’empreinte', 'Nothing before the fingerprint'), t('unlock() n’est appelé qu’une fois', 'unlock() is only called once'), t('l’identité prouvée, jamais avant.', 'identity is proven, never before.')],
    [ROUGE, t('Tout effacer, c’est oublier', 'To erase is to forget'), t('destroy() retire la clé du Keystore :', 'destroy() removes the key from the Keystore:'), t('le disque devient du bruit, pour tous.', 'the disk turns into noise, for everyone.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = 400 + i * 280, y = 594;
    corps += `<rect x="${x}" y="${y}" width="260" height="90" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y + 14}" width="3" height="62" rx="1.5" fill="${c}"/>
      ${texte(x + 20, y + 32, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 55, l1, { taille: 12 })}
      ${texte(x + 20, y + 73, l2, { taille: 12 })}`;
  });

  svg('chiffrement.svg', 1280, 720, corps, t(
    'D’où viennent les clés de BodyCount. On touche le capteur de l’écran de verrou, Android demande l’empreinte ou le code du téléphone et la vérifie lui-même. Alors seulement, la clé maîtresse de 32 octets, tirée au hasard au premier lancement et rangée dans des préférences chiffrées par le Keystore, entre en mémoire. HKDF-SHA256 en dérive deux clés par deux étiquettes : bodycount/db/v1 donne le mot de passe SQLCipher de la base, bodycount/photos/v1 la clé AES-256-GCM du coffre des photos et des vidéos. Le répertoire se remplit : les prénoms quand la base s’ouvre, les visages quand le coffre s’ouvre. Sur le disque, sans l’empreinte, bodycount.db, les fichiers .bcx du coffre et la clé rangée ne sont que du bruit. Effacer la clé du Keystore suffit à rendre tout illisible, pour tout le monde.',
    'Where the BodyCount keys come from. You touch the sensor on the lock screen, Android asks for the fingerprint or the phone’s PIN and checks it itself. Only then does the 32-byte master key, drawn at random on first launch and kept in preferences encrypted by the Keystore, enter memory. HKDF-SHA256 derives two keys from it with two labels: bodycount/db/v1 gives the SQLCipher password of the database, bodycount/photos/v1 the AES-256-GCM key of the photo and video vault. The people list fills in: names when the database opens, faces when the vault opens. On disk, without the fingerprint, bodycount.db, the vault’s .bcx files and the stored key are just noise. Removing the key from the Keystore is enough to make everything unreadable, for everyone.'));
};

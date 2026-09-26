// Le verrou, d'un bout à l'autre : l'empreinte ouvre, le compte à rebours
// tourne, l'aperçu du multitâche reste noir, et au retour d'arrière-plan
// passé le délai, tout ce qui était en mémoire est effacé.
//
// À gauche, le téléphone ; à droite, ce qui vit en mémoire et le compte à
// rebours d'inactivité (lib/app.dart), puis trois cartes pour ce que le
// schéma ne montre pas en mouvement.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, paliers, fondu, visible, entre, telephone, toucher, empreinte, logo, icone,
    cartePersonne, barreNav, GENS, APP, MONO, SANS, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE } = O;
  const C = 30;
  const OUVRE = 0.1, MULTI = 0.44, FOND_ = 0.5, RETOUR = 0.8, FERME = 0.815;
  let corps = entete(t('LE VERROU', 'THE LOCK'),
    t('L’empreinte charge la clé. Passé le délai, tout ce qui était en mémoire disparaît.',
      'The fingerprint loads the key. Once the delay runs out, everything held in memory is gone.'));

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // L'écran de verrou, au début et après le retour.
  const verrou = (instant, libelle) => `
    ${logo(SX + SL / 2, SY + 128, 76)}
    ${texte(SX + SL / 2, SY + 212, 'BodyCount', { taille: 30, couleur: APP.texte, poids: 800, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + 240, t('Tout reste sur cet appareil. Aucun compte,', 'Everything stays on this device. No account,'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + 257, t('aucun serveur, aucune requête réseau.', 'no server, no network request.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    <circle cx="${SX + SL / 2}" cy="${SY + 380}" r="58" fill="${VIOLET}" opacity="0.12">
      <animate attributeName="r" dur="2.6s" repeatCount="indefinite" values="50;62;50"/>
    </circle>
    <circle cx="${SX + SL / 2}" cy="${SY + 380}" r="46" fill="url(#marque)"/>
    ${empreinte(SX + SL / 2, SY + 380, 44, '#FFFFFF')}
    ${libelle}
    ${instant !== null ? toucher(SX + SL / 2, SY + 380, C, instant) : ''}
    ${icone('cadenas', SX + 38, SY + SH - 40, APP.vert, 0.75)}
    ${texte(SX + 54, SY + SH - 29, t('Base chiffrée, clé rangée dans le Keystore', 'Encrypted database, key kept in the Keystore'), { taille: 10, couleur: APP.second, poids: 600 })}`;
  const libelle = (s, c = APP.second) => texte(SX + SL / 2, SY + 470, s, { taille: 12.5, couleur: c, poids: 600, ancre: 'middle' });
  ecran += entre(C, 0, OUVRE, verrou(0.05,
    entre(C, 0, 0.05, libelle(t('Touche le capteur pour ouvrir', 'Touch the sensor to open')), 0.004) +
    entre(C, 0.05, OUVRE, libelle(t('Vérification…', 'Checking…'), APP.rose), 0.004)), 0.006);
  ecran += entre(C, FERME, 0.985, verrou(null, libelle(t('Touche le capteur pour ouvrir', 'Touch the sensor to open'))), 0.006);

  // Le répertoire, ouvert : deux colonnes de fiches.
  const gens = [GENS.noa, GENS.lou, GENS.enzo, GENS.jade, GENS.matteo, GENS.gabriel];
  let rep = `${texte(SX + 18, SY + 44, t('RÉPERTOIRE', 'PEOPLE'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
    <rect x="${SX + 128}" y="${SY + 26}" width="${SL - 146}" height="28" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${icone('loupe', SX + 138, SY + 33, APP.second, 0.8)}
    ${texte(SX + 156, SY + 44.5, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 10, couleur: APP.discret })}`;
  const CL = (SL - 36) / 2, CH = 150;
  gens.forEach((p, i) => {
    rep += cartePersonne(p, SX + 12 + (i % 2) * (CL + 12), SY + 72 + Math.floor(i / 2) * (CH + 12), CL, CH, { premier: i === 0 });
  });
  rep += barreNav(T, 'Fiches');
  // Trois touchers pendant qu'on s'en sert : chacun relance le compte.
  const TOUCHERS = [0.18, 0.26, 0.34];
  rep += toucher(SX + 70, SY + 150, C, TOUCHERS[0]) + toucher(SX + 200, SY + 310, C, TOUCHERS[1]) + toucher(SX + 90, SY + 420, C, TOUCHERS[2]);
  ecran += entre(C, OUVRE, MULTI, rep, 0.006);

  // Le multitâche : la carte de l'application reste vide.
  ecran += entre(C, MULTI, FOND_, `
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#141019"/>
    <rect x="${SX + 40}" y="${SY + 90}" width="${SL - 80}" height="330" rx="18" fill="#000000" stroke="#2A2438"/>
    ${logo(SX + 58, SY + 68, 22)}
    ${texte(SX + 76, SY + 72, 'BodyCount', { taille: 12, couleur: '#E9E4F2', poids: 700 })}
    ${texte(SX + SL / 2, SY + 262, t('aperçu masqué', 'preview hidden'), { taille: 11.5, couleur: '#4A4458', police: MONO, ancre: 'middle' })}
    <rect x="${SX + SL - 30}" y="${SY + 110}" width="40" height="290" rx="16" fill="#1E1A28"/>
    ${texte(SX + SL / 2, SY + 470, t('Tout effacer', 'Clear all'), { taille: 12, couleur: '#B8B0C8', poids: 600, ancre: 'middle' })}
    ${toucher(SX + SL / 2, SY + 520, C, MULTI + 0.045)}`, 0.004);

  // Une autre application : le temps passe dehors.
  ecran += entre(C, FOND_, RETOUR, `
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#101418"/>
    ${texte(SX + SL / 2, SY + 150, '22:14', { taille: 54, couleur: '#E8EEF4', poids: 300, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + 178, t('samedi 26 septembre', 'Saturday 26 September'), { taille: 12.5, couleur: '#9AA8B6', ancre: 'middle' })}
    ${[0, 1, 2, 3].map((i) => `<rect x="${SX + 30 + i * 58}" y="${SY + 420}" width="40" height="40" rx="12" fill="${['#2B6CB0', '#2F855A', '#B7791F', '#6B46C1'][i]}" fill-opacity="0.8"/>`).join('')}
    <g>${logo(SX + 30 + 3 * 58 + 20, SY + 440, 40)}</g>
    ${toucher(SX + 30 + 3 * 58 + 20, SY + 440, C, RETOUR - 0.01)}`, 0.004);
  ecran += `<g opacity="0">${visible(C, 0.985, 1, 0.006)}</g>`;
  corps += T.ecran(ecran);

  // ------------------------------------------------ ce qui vit en mémoire
  const MX = 400, ML = 380, MY = 108;
  corps += rubrique(MX, MY, t('CE QUI VIT EN MÉMOIRE', 'WHAT LIVES IN MEMORY'));
  const memoire = [
    [t('Clé maîtresse', 'Master key'), t('tirée du Keystore par l’empreinte', 'pulled from the Keystore by the fingerprint'), 'KeyVault.lock()', 'cle'],
    [t('Connexion à la base', 'Database connection'), t('SQLCipher, ouverte avec la clé dérivée', 'SQLCipher, opened with the derived key'), 'Base.fermer()', 'base'],
    [t('Photos déchiffrées', 'Decrypted photos'), t('le cache des images affichées', 'the cache of images on screen'), 'PhotoVault.forget()', 'photo'],
    [t('Vidéos en lecture', 'Videos being played'), t('déchiffrées dans le cache privé', 'decrypted into the private cache'), 'oublierLectures()', 'lecture'],
  ];
  memoire.forEach(([titre, sous, appel, ic], i) => {
    const y = MY + 18 + i * 74, allume = OUVRE + 0.006 + i * 0.008, eteint = FERME + i * 0.01;
    corps += `<rect x="${MX}" y="${y}" width="${ML}" height="62" rx="12" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${MX}" y="${y}" width="${ML}" height="62" rx="12" fill="none" stroke="${VERT}" stroke-opacity="0.5" opacity="0">${visible(C, allume, eteint)}</rect>
      <rect x="${MX}" y="${y}" width="${ML}" height="62" rx="12" fill="none" stroke="${ROUGE}" stroke-width="1.5" opacity="0">${visible(C, eteint, eteint + 0.05)}</rect>
      <rect x="${MX + 14}" y="${y + 15}" width="32" height="32" rx="9" fill="${FIL}" fill-opacity="0.5"/>
      <g opacity="0.35">${icone(ic, MX + 22, y + 23, TEXTE)}</g>
      <g opacity="0">${visible(C, allume, eteint)}
        <rect x="${MX + 14}" y="${y + 15}" width="32" height="32" rx="9" fill="${VERT}" fill-opacity="0.14" stroke="${VERT}" stroke-opacity="0.5"/>
        ${icone(ic, MX + 22, y + 23, VERT)}
      </g>
      ${texte(MX + 60, y + 27, titre, { taille: 13.5, couleur: TITRE, poids: 700 })}
      ${texte(MX + 60, y + 45, sous, { taille: 11.5 })}
      ${entre(C, 0, allume, texte(MX + ML - 16, y + 36, t('absente', 'absent'), { taille: 11, couleur: DISCRET, police: MONO, ancre: 'end' }), 0.004)}
      ${entre(C, allume, eteint, texte(MX + ML - 16, y + 36, t('chargée', 'loaded'), { taille: 11, couleur: VERT, police: MONO, poids: 700, ancre: 'end' }), 0.004)}
      ${entre(C, eteint, 0.985, texte(MX + ML - 16, y + 30, t('effacée', 'wiped'), { taille: 11, couleur: ROUGE, police: MONO, poids: 700, ancre: 'end' }) +
        texte(MX + ML - 16, y + 46, appel, { taille: 10, couleur: DISCRET, police: MONO, ancre: 'end' }), 0.004)}`;
  });

  // ------------------------------------------------ le compte à rebours
  const RX = 820, RL = 400, RY = 108;
  corps += rubrique(RX, RY, t('LE COMPTE À REBOURS', 'THE COUNTDOWN'));
  corps += `<rect x="${RX}" y="${RY + 18}" width="${RL}" height="284" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  corps += texte(RX + 20, RY + 50, t('Verrouiller après 45 s', 'Lock after 45 s'), { taille: 15, couleur: TITRE, poids: 700 });
  corps += texte(RX + 20, RY + 70, t('au choix : 15 s, 45 s, 2 min ou 5 min', 'your pick: 15 s, 45 s, 2 min or 5 min'), { taille: 12 });
  // La jauge : le temps écoulé sans toucher l'écran, puis hors de l'appli.
  const JX = RX + 20, JY = RY + 96, JL = RL - 40;
  const ecoule = [[0, 0], [OUVRE, 0]];
  let dernier = OUVRE;
  for (const a of TOUCHERS) {
    ecoule.push([a, JL * Math.min(1, (a - dernier) / 0.3) * 0.9], [a + 0.004, 0]);
    dernier = a + 0.004;
  }
  ecoule.push([MULTI + 0.03, JL * 0.33], [RETOUR - 0.075, JL], [FERME, JL], [FERME + 0.02, 0], [1, 0]);
  corps += `<rect x="${JX}" y="${JY}" width="${JL}" height="12" rx="6" fill="${FIL}" fill-opacity="0.6"/>
    <rect x="${JX}" y="${JY}" height="12" rx="6" width="0" fill="${VIOLET}">${fondu('width', C, ecoule)}
      ${paliers('fill', C, [[0, VIOLET], [RETOUR - 0.075, ROUGE], [FERME + 0.02, VIOLET]])}</rect>
    ${texte(JX, JY + 32, '0 s', { taille: 10.5, couleur: DISCRET, police: MONO })}
    ${texte(JX + JL, JY + 32, '45 s', { taille: 10.5, couleur: DISCRET, police: MONO, ancre: 'end' })}`;
  // Ce qui se passe, ligne à ligne.
  const evenements = [
    [OUVRE, MULTI, t('Un toucher : le compte repart de zéro.', 'A touch: the count starts over.'), t('Posée sur la table, l’appli se ferme aussi.', 'Left on the table, the app locks as well.'), VIOLET],
    [MULTI, RETOUR, t('En arrière-plan : l’heure est notée.', 'In the background: the time is noted.'), t('pausedAt = 22:14:05', 'pausedAt = 22:14:05'), TEXTE],
    [RETOUR - 0.075, RETOUR, t('45 s sont passées dehors.', '45 s have gone by outside.'), t('Rien ne se passe encore : on attend le retour.', 'Nothing happens yet: it waits for the return.'), OR],
    [RETOUR, 0.985, t('Au retour, le délai est dépassé :', 'On return, the delay has run out:'), t('lock() referme tout, l’empreinte est redemandée.', 'lock() shuts everything, the fingerprint is asked again.'), ROUGE],
  ];
  evenements.forEach(([de, a, l1, l2, c]) => {
    corps += entre(C, de, a, `<circle cx="${RX + 26}" cy="${RY + 176}" r="4" fill="${c}"/>
      ${texte(RX + 40, RY + 181, l1, { taille: 13.5, couleur: TITRE, poids: 700 })}
      ${texte(RX + 40, RY + 201, l2, { taille: 12, couleur: c === TEXTE ? DISCRET : TEXTE, police: l2.startsWith('pausedAt') ? MONO : SANS })}`, 0.006);
  });
  corps += `<line x1="${RX + 20}" y1="${RY + 228}" x2="${RX + RL - 20}" y2="${RY + 228}" stroke="${BORD}"/>`;
  corps += texte(RX + 20, RY + 254, t('Un travail en cours retient le verrou :', 'Work in progress holds the lock back:'), { taille: 12.5, couleur: TEXTE, poids: 700 });
  corps += texte(RX + 20, RY + 274, t('sauvegarde, restauration, vidéo qui se chiffre.', 'a backup, a restore, a video being encrypted.'), { taille: 12.5 });

  // ------------------------------------------------ trois cartes du bas
  const bas = [
    [VIOLET, t('Une empreinte, pas un écran', 'A fingerprint, not a screen'),
      t('Sans elle, la clé reste au Keystore :', 'Without it, the key stays in the Keystore:'), t('pas de base, pas de photo à lire.', 'no database, no photo to read.')],
    [ACCENT, t('Multitâche et captures', 'Recents and screenshots'),
      t('L’aperçu est noir, les captures bloquées :', 'The preview is black, screenshots blocked:'), t('FLAG_SECURE, posé dès le démarrage.', 'FLAG_SECURE, set right at startup.')],
    [VERT, t('Rouvrir, c’est repartir à zéro', 'Reopening starts from scratch'),
      t('Base rouverte, fiches relues, filtres', 'Database reopened, cards reread, search'), t('de recherche remis à vide.', 'filters cleared.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = 400 + i * 280, y = 440;
    corps += `<rect x="${x}" y="${y}" width="260" height="96" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(x + 20, y + 32, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 55, l1, { taille: 12 })}
      ${texte(x + 20, y + 73, l2, { taille: 12 })}`;
  });
  // Les allers-retours rapides passent sans empreinte.
  corps += `<rect x="400" y="560" width="820" height="96" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    ${icone('horloge', 420, 598, OR, 1.3)}
    ${texte(456, 598, t('Pourquoi pas dès la sortie de l’appli ?', 'Why not the moment you leave the app?'), { taille: 14, couleur: TITRE, poids: 700 })}
    ${texte(456, 620, t('Répondre à un message ou ouvrir l’appareil photo redemanderait l’empreinte à chaque fois.', 'Answering a message or opening the camera would ask for the fingerprint every single time.'), { taille: 12.5 })}
    ${texte(456, 639, t('Le délai laisse ces allers-retours tranquilles, sans laisser l’appli ouverte dans la poche.', 'The delay leaves those quick trips alone, without leaving the app open in your pocket.'), { taille: 12.5 })}`;

  svg('verrou.svg', 1280, 720, corps, t(
    'Le verrou de BodyCount. Au toucher du capteur, l’empreinte charge la clé maîtresse depuis le Keystore, la base s’ouvre et le répertoire apparaît. Chaque toucher relance un compte à rebours de 45 secondes, réglable à 15 s, 2 ou 5 minutes. Dans le multitâche, l’aperçu de l’application reste noir et les captures sont bloquées. En arrière-plan, l’heure est notée ; au retour, si le délai est dépassé, la clé, la connexion à la base, les photos déchiffrées et les vidéos en lecture sont effacées de la mémoire, et l’empreinte est redemandée. Une sauvegarde, une restauration ou une vidéo qui se chiffre retiennent le verrou.',
    'The BodyCount lock. On touching the sensor, the fingerprint loads the master key from the Keystore, the database opens and the people list appears. Every touch restarts a 45-second countdown, adjustable to 15 s, 2 or 5 minutes. In the recents screen, the app preview stays black and screenshots are blocked. In the background, the time is noted; on return, if the delay has run out, the key, the database connection, the decrypted photos and the videos being played are wiped from memory, and the fingerprint is asked again. A backup, a restore or a video being encrypted holds the lock back.'));
};

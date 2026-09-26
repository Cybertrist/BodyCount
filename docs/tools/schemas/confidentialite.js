// Le modèle de confidentialité : ce qui est vrai, et ce qui ne l'est pas.
//
// Deux colonnes qui se remplissent carte par carte. Pendant que chaque
// carte s'allume, le téléphone de gauche montre la scène qui la prouve,
// ou la limite qu'elle avoue. Chaque carte renvoie au schéma qui la
// détaille, sans le refaire.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, empreinte, logo, icone, visage,
    cartePersonne, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE } = O;
  const C = 44;
  const D = 0.02, PAS = 0.095;
  const P = (i) => D + i * PAS; // le début de la phase i
  const FIN = 0.975;
  let corps = entete(t('LA CONFIDENTIALITÉ', 'PRIVACY'),
    t('Ce qui est vrai, et ce qui ne l’est pas. Les deux comptent autant.',
      'What is true, and what is not. Both matter just as much.'));

  // ------------------------------------------------------------ les cartes
  const VRAI = [
    [t('Rien ne sort', 'Nothing leaves'),
      t('Aucune requête réseau, aucun compte,', 'No network request, no account,'),
      t('aucune analytique : pas de permission INTERNET.', 'no analytics: no INTERNET permission.'), 'reseau.svg'],
    [t('La base est chiffrée', 'The database is encrypted'),
      t('SQLCipher ; sa clé vit dans le Keystore,', 'SQLCipher; its key lives in the Keystore,'),
      t('chargée seulement après l’empreinte.', 'loaded only after the fingerprint.'), 'chiffrement.svg'],
    [t('Photos et vidéos au coffre', 'Photos and videos in the vault'),
      t('Chacune chiffrée en AES-GCM, et absente', 'Each encrypted with AES-GCM, and absent'),
      t('de la galerie du téléphone.', 'from the phone’s gallery.'), 'coffre.svg'],
    [t('Rien ne fuit de l’écran', 'Nothing leaks from the screen'),
      t('Aperçu du multitâche masqué, captures', 'Recents preview hidden, screenshots'),
      t('bloquées, sauvegarde Android refusée.', 'blocked, Android backup refused.'), 'verrou.svg'],
    [t('Une restauration prudente', 'A careful restore'),
      t('Toute la sauvegarde est vérifiée', 'The whole backup is checked'),
      t('avant d’effacer quoi que ce soit.', 'before anything is erased.'), 'restauration.svg'],
  ];
  const FAUX = [
    [t('L’écran ouvert se lit', 'An open screen can be read'),
      t('L’empreinte protège l’accès, pas ton épaule :', 'The fingerprint guards access, not your shoulder:'),
      t('ouverte, l’appli montre tout.', 'once open, the app shows everything.'), 'verrou.svg'],
    [t('Une sauvegarde voyage', 'A backup travels'),
      t('Le fichier quitte le téléphone : il vaut', 'The file leaves the phone: it is worth'),
      t('ce que vaut ta phrase de passe.', 'what your passphrase is worth.'), 'sauvegarde.svg'],
    [t('Téléphone perdu, données perdues', 'Phone lost, data lost'),
      t('La clé ne se recopie nulle part :', 'The key is copied nowhere:'),
      t('sans sauvegarde, rien ne revient.', 'without a backup, nothing comes back.'), 'sauvegarde.svg'],
    [t('L’empreinte se coupe', 'The fingerprint can be turned off'),
      t('La base reste chiffrée, mais la clé', 'The database stays encrypted, but the key'),
      t('se charge alors sans rien demander.', 'then loads without asking anything.'), t('Réglages', 'Settings')],
    [t('Une vidéo se lit en clair', 'A video plays in the clear'),
      t('Déchiffrée dans le cache privé le temps', 'Decrypted into the private cache while'),
      t('de la lecture, puis effacée.', 'it plays, then deleted.'), 'coffre.svg'],
  ];

  const CL = 392, CH = 92, CG = 8, CY0 = 124;
  const colonne = (x, titre, couleur, items, decale) => {
    let s = rubrique(x, 110, titre, couleur);
    items.forEach(([t1, l1, l2, ref], k) => {
      const i = decale + k, y = CY0 + k * (CH + CG), de = P(i);
      s += `<rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="13" fill="${CARTE}" stroke="${BORD}" stroke-dasharray="5 5" stroke-opacity="0.8"/>`;
      s += entre(C, de, FIN, `
        <rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
        <rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="13" fill="none" stroke="${couleur}" stroke-width="1.5" opacity="0">${visible(C, de, de + PAS, 0.006)}</rect>
        <rect x="${x}" y="${y + 14}" width="3" height="${CH - 28}" rx="1.5" fill="${couleur}"/>
        <circle cx="${x + 30}" cy="${y + 30}" r="12" fill="${couleur}" fill-opacity="0.14" stroke="${couleur}" stroke-opacity="0.6"/>
        ${icone(couleur === VERT ? 'coche' : 'croix', x + 22, y + 22, couleur, 1)}
        ${texte(x + 52, y + 36, t1, { taille: 14, couleur: TITRE, poids: 700 })}
        ${texte(x + 52, y + 57, l1, { taille: 12 })}
        ${texte(x + 52, y + 75, l2, { taille: 12 })}
        ${texte(x + CL - 14, y + 18, '→ ' + ref, { taille: 9.5, couleur: DISCRET, police: MONO, ancre: 'end' })}`, 0.006);
    });
    return s;
  };
  corps += colonne(400, t('CE QUI EST VRAI', 'WHAT IS TRUE'), VERT, VRAI, 0);
  corps += colonne(828, t('CE QUI NE L’EST PAS', 'WHAT IS NOT'), OR, FAUX, 5);
  corps += texte(824, 650, t('Un modèle de confidentialité qui ne dirait que la première colonne mentirait par omission.',
    'A privacy model that only showed the first column would be lying by omission.'), { taille: 12.5, couleur: DISCRET, ancre: 'middle' });
  corps += texte(824, 672, t('Chaque carte renvoie au schéma qui la détaille.', 'Each card points to the diagram that details it.'),
    { taille: 12, couleur: DISCRET, ancre: 'middle' });

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  const scene = (i, contenu) => entre(C, P(i), P(i) + PAS, contenu, 0.005);
  const titreEcran = (s) => texte(SX + 18, SY + 46, s, { taille: 20, couleur: APP.texte, poids: 800 });
  const bandeau = (s, c = APP.texte, y = SY + SH - 78) => `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="46" rx="12" fill="#2A2238"/>
    ${texte(SX + 26, y + 28, s, { taille: 11.5, couleur: c, poids: 600 })}`;
  const reglagesHaut = () => `${texte(SX + 18, SY + 48, '‹', { taille: 24, couleur: APP.texte })}
    ${texte(SX + 40, SY + 48, t('Réglages', 'Settings'), { taille: 21, couleur: APP.texte, poids: 800 })}
    <rect x="${SX + 12}" y="${SY + 70}" width="${SL - 24}" height="62" rx="18" fill="${APP.violet}" fill-opacity="0.12" stroke="${APP.bord}"/>
    ${logo(SX + 42, SY + 101, 34)}
    ${texte(SX + 70, SY + 98, t('18 Personnes', '18 People'), { taille: 14, couleur: APP.texte, poids: 700 })}
    ${texte(SX + 70, SY + 115, t('111 Rencontres', '111 Encounters'), { taille: 10, couleur: APP.second })}`;
  let ecran = '';
  // Ce qui passe par-dessus le téléphone : l'œil, le fichier qui sort.
  let dessus = '';

  // 1. Rien ne sort : une requête part vers le haut et s'écrase.
  {
    const gens = [GENS.noa, GENS.lou, GENS.enzo, GENS.jade];
    const L = (SL - 36) / 2;
    let s = titreEcran(t('Répertoire', 'People'));
    gens.forEach((p, k) => { s += cartePersonne(p, SX + 12 + (k % 2) * (L + 12), SY + 150 + Math.floor(k / 2) * 172, L, 160); });
    const a = P(0) + 0.015, b = P(0) + 0.045;
    s += `<rect x="${SX}" y="${SY + 64}" width="${SL}" height="10" fill="${ROUGE}" fill-opacity="0.85"/>
      ${texte(SX + SL / 2, SY + 94, t('Android : pas de permission INTERNET', 'Android: no INTERNET permission'), { taille: 10.5, couleur: ROUGE, poids: 700, police: MONO, ancre: 'middle' })}
      <circle cx="${SX + SL / 2}" r="6" fill="${ACCENT}" filter="url(#halo)" opacity="0">
        ${fondu('cy', C, [[0, SY + 300], [a, SY + 300], [b, SY + 80], [1, SY + 80]])}
        ${fondu('opacity', C, [[0, 0], [a, 0], [a + 0.004, 1], [b, 1], [b + 0.01, 0], [1, 0]])}
      </circle>
      ${entre(C, b, P(0) + PAS, `<circle cx="${SX + SL / 2}" cy="${SY + 80}" r="14" fill="none" stroke="${ROUGE}" stroke-width="2"/>`, 0.004)}
      ${bandeau(t('Connexion refusée avant de partir.', 'Connection refused before it leaves.'), ROUGE)}`;
    ecran += scene(0, s);
  }

  // 2. La base chiffrée : l'écran de verrou.
  ecran += scene(1, `
    ${logo(SX + SL / 2, SY + 128, 76)}
    ${texte(SX + SL / 2, SY + 212, 'BodyCount', { taille: 30, couleur: APP.texte, poids: 800, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + 240, t('Tout reste sur cet appareil. Aucun compte,', 'Everything stays on this device. No account,'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + 257, t('aucun serveur, aucune requête réseau.', 'no server, no network request.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    <circle cx="${SX + SL / 2}" cy="${SY + 370}" r="46" fill="url(#marque)"/>
    ${empreinte(SX + SL / 2, SY + 370, 44, '#FFFFFF')}
    ${texte(SX + SL / 2, SY + 452, t('Touche le capteur pour ouvrir', 'Touch the sensor to open'), { taille: 12.5, couleur: APP.second, poids: 600, ancre: 'middle' })}
    ${icone('cadenas', SX + 38, SY + SH - 40, APP.vert, 0.75)}
    ${texte(SX + 54, SY + SH - 29, t('Base chiffrée, clé rangée dans le Keystore', 'Encrypted database, key kept in the Keystore'), { taille: 10, couleur: APP.second, poids: 600 })}`);

  // 3. La galerie du téléphone : rien de BodyCount.
  {
    const teintes = ['#C0587E', '#7C5CC4', '#D9A441', '#4B8FB8', '#4FA37A', '#C8664F', '#6C6FB5', '#B89A3E', '#D2833F', '#3F97A8', '#5DA15A', '#B55A8C'];
    let s = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#111418"/>
      ${texte(SX + 18, SY + 46, t('Galerie', 'Gallery'), { taille: 20, couleur: '#E8EEF4', poids: 700 })}
      ${texte(SX + 18, SY + 74, t('Récents', 'Recent'), { taille: 11.5, couleur: '#9AA8B6', poids: 600 })}`;
    const c = (SL - 24 - 2 * 6) / 3;
    teintes.forEach((tt, k) => {
      const x = SX + 12 + (k % 3) * (c + 6), y = SY + 88 + Math.floor(k / 3) * (c + 6);
      s += `<rect x="${x}" y="${y}" width="${c}" height="${c}" rx="6" fill="${tt}" fill-opacity="0.75"/>
        <circle cx="${x + c * 0.7}" cy="${y + c * 0.3}" r="${c * 0.09}" fill="#FFFFFF" fill-opacity="0.7"/>
        <path d="M${x} ${y + c} L${x + c * 0.35} ${y + c * 0.55} L${x + c * 0.6} ${y + c * 0.8} L${x + c * 0.8} ${y + c * 0.62} L${x + c} ${y + c * 0.85} V${y + c} Z" fill="#000000" fill-opacity="0.25"/>`;
    });
    s += `<rect x="${SX + 12}" y="${SY + SH - 86}" width="${SL - 24}" height="56" rx="12" fill="${VERT}" fill-opacity="0.12" stroke="${VERT}" stroke-opacity="0.5"/>
      ${icone('coche', SX + 24, SY + SH - 66, VERT, 1)}
      ${texte(SX + 48, SY + SH - 62, t('Aucune photo de BodyCount ici.', 'No BodyCount photo in here.'), { taille: 11.5, couleur: '#E8EEF4', poids: 700 })}
      ${texte(SX + 48, SY + SH - 45, t('Elles sont au coffre, chiffrées.', 'They are in the vault, encrypted.'), { taille: 10.5, couleur: '#9AA8B6' })}`;
    ecran += scene(2, s);
  }

  // 4. Le multitâche, et une capture refusée.
  ecran += scene(3, `
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#141019"/>
    ${logo(SX + 58, SY + 68, 22)}
    ${texte(SX + 76, SY + 72, 'BodyCount', { taille: 12, couleur: '#E9E4F2', poids: 700 })}
    <rect x="${SX + 40}" y="${SY + 90}" width="${SL - 80}" height="330" rx="18" fill="#000000" stroke="#2A2438"/>
    ${texte(SX + SL / 2, SY + 262, t('aperçu masqué', 'preview hidden'), { taille: 11.5, couleur: '#4A4458', police: MONO, ancre: 'middle' })}
    <rect x="${SX + SL - 30}" y="${SY + 110}" width="40" height="290" rx="16" fill="#1E1A28"/>
    ${entre(C, P(3) + 0.04, P(3) + PAS, bandeau(t('Capture refusée par l’appli.', 'Screenshot refused by the app.'), '#F0E6FF'), 0.004)}`);

  // 5. La restauration : l'avertissement, puis la vérification.
  ecran += scene(4, `${reglagesHaut()}
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
    ${entre(C, P(4), P(4) + 0.05, `
      <rect x="${SX + 16}" y="${SY + 170}" width="${SL - 32}" height="220" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${texte(SX + 36, SY + 208, t('Restaurer une sauvegarde ?', 'Restore a backup?'), { taille: 15, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 36, SY + 238, t('Tout sera remplacé. Rien ne change', 'Everything will be replaced. Nothing'), { taille: 11.5, couleur: APP.second })}
      ${texte(SX + 36, SY + 256, t('tant qu’elle n’a pas été lue et', 'changes until it has been read and'), { taille: 11.5, couleur: APP.second })}
      ${texte(SX + 36, SY + 274, t('vérifiée en entier.', 'checked in full.'), { taille: 11.5, couleur: APP.second })}
      ${texte(SX + SL - 36, SY + 352, t('Choisir le fichier', 'Pick the file'), { taille: 12, couleur: APP.rose, poids: 700, ancre: 'end' })}
      ${toucher(SX + SL - 90, SY + 348, C, P(4) + 0.04)}`, 0.004)}
    ${entre(C, P(4) + 0.05, P(4) + PAS, `
      <rect x="${SX + 16}" y="${SY + 250}" width="${SL - 32}" height="80" rx="20" fill="${APP.surface}" stroke="${APP.bord}"/>
      <circle cx="${SX + 46}" cy="${SY + 290}" r="11" fill="none" stroke="${APP.violet}" stroke-width="3" stroke-dasharray="44 26">
        <animateTransform attributeName="transform" type="rotate" from="0 ${SX + 46} ${SY + 290}" to="360 ${SX + 46} ${SY + 290}" dur="1s" repeatCount="indefinite"/></circle>
      ${texte(SX + 68, SY + 286, t('Vérification de la', 'Checking the'), { taille: 12, couleur: APP.texte, poids: 600 })}
      ${texte(SX + 68, SY + 303, t('sauvegarde…', 'backup…'), { taille: 12, couleur: APP.texte, poids: 600 })}
      ${bandeau(t('Tes 18 fiches sont encore intactes.', 'Your 18 cards are still intact.'), VERT)}`, 0.004)}`);

  // 6. L'écran ouvert se lit : la fiche d'Enzo, et un œil qui passe.
  ecran += scene(5, `
    ${visage(GENS.enzo.photo, SX, SY, SL, 300, 0)}
    <rect x="${SX}" y="${SY}" width="${SL}" height="300" fill="url(#voile)"/>
    ${texte(SX + 18, SY + 282, 'Enzo P.', { taille: 30, couleur: '#FFFFFF', poids: 800 })}
    ${texte(SX + 20, SY + 340, '3,8', { taille: 22, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 20, SY + 358, t('NOTE', 'RATING'), { taille: 9, couleur: APP.second, poids: 700 })}
    ${texte(SX + 110, SY + 340, '7', { taille: 22, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 110, SY + 358, t('FOIS', 'TIMES'), { taille: 9, couleur: APP.second, poids: 700 })}
    ${texte(SX + 190, SY + 340, t('347 j', '347 d'), { taille: 22, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 190, SY + 358, t('DEPUIS', 'SINCE'), { taille: 9, couleur: APP.second, poids: 700 })}
    <rect x="${SX + 12}" y="${SY + 380}" width="${SL - 24}" height="70" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${texte(SX + 26, SY + 406, t('Toujours partant pour un deuxième', 'Always up for a second round,'), { taille: 11, couleur: APP.texte })}
    ${texte(SX + 26, SY + 423, t('round, jamais pour rester dormir.', 'never for staying the night.'), { taille: 11, couleur: APP.texte })}
    ${texte(SX + 26, SY + 440, t('5 juin', '5 June'), { taille: 9.5, couleur: APP.discret })}`);
  // L'œil, hors de l'écran, par-dessus l'épaule.
  dessus += entre(C, P(5) + 0.01, P(5) + PAS, `<g>
    <circle cx="362" cy="150" r="24" fill="${OR}" fill-opacity="0.12" stroke="${OR}" stroke-opacity="0.6"/>
    ${icone('oeil', 350, 138, OR, 1.5)}
    <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite"
      keyTimes="0;${(P(5) + 0.01).toFixed(4)};${(P(5) + 0.04).toFixed(4)};1" values="12 -10;12 -10;0 0;0 0"/>
  </g>`, 0.004);

  // 7. Une sauvegarde voyage : le fichier sort du téléphone.
  ecran += scene(6, `${reglagesHaut()}
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
    <rect x="${SX + 16}" y="${SY + 200}" width="${SL - 32}" height="170" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
    ${texte(SX + 36, SY + 238, t('Sauvegarde prête', 'Backup ready'), { taille: 15, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 36, SY + 264, t('186 Mo, chiffrée par ta phrase.', '186 MB, encrypted by your passphrase.'), { taille: 11.5, couleur: APP.second })}
    ${texte(SX + 36, SY + 340, t('Partager', 'Share'), { taille: 12, couleur: APP.second, poids: 700 })}
    ${texte(SX + SL - 36, SY + 340, t('Enregistrer', 'Save'), { taille: 12, couleur: APP.rose, poids: 700, ancre: 'end' })}
    ${toucher(SX + 60, SY + 336, C, P(6) + 0.025)}`);
  dessus += entre(C, P(6) + 0.03, P(6) + PAS, `<g>
    <rect x="-18" y="-22" width="36" height="44" rx="6" fill="${CARTE}" stroke="${OR}"/>
    ${icone('cadenas', -8, -12, OR, 1)}
    <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite"
      keyTimes="0;${(P(6) + 0.03).toFixed(4)};${(P(6) + 0.07).toFixed(4)};1" values="130 446;130 446;375 260;375 260"/>
  </g>`, 0.004);

  // 8. Le téléphone perdu : l'écran s'éteint, rien d'autre n'a la clé.
  ecran += scene(7, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#050308"/>
    <path d="M${SX + 190} ${SY} L${SX + 160} ${SY + 120} L${SX + 205} ${SY + 190} L${SX + 140} ${SY + 330} L${SX + 175} ${SY + 400} L${SX + 120} ${SY + SH}
      M${SX + 160} ${SY + 120} L${SX + 60} ${SY + 170} M${SX + 140} ${SY + 330} L${SX + 250} ${SY + 380}" fill="none" stroke="#6B6480" stroke-width="1.4" stroke-opacity="0.8"/>
    <rect x="${SX + 22}" y="${SY + 228}" width="${SL - 44}" height="96" rx="16" fill="${APP.surface}" stroke="${APP.bord}"/>
    ${icone('cle', SX + 40, SY + 256, OR, 1.2)}
    ${texte(SX + 70, SY + 268, t('La clé n’existe qu’ici.', 'The key only exists here.'), { taille: 12.5, couleur: APP.texte, poids: 700 })}
    ${texte(SX + 40, SY + 298, t('Pas de compte, pas de copie :', 'No account, no copy:'), { taille: 11, couleur: APP.second })}
    ${texte(SX + 40, SY + 314, t('ta sauvegarde, ou rien.', 'your backup, or nothing.'), { taille: 11, couleur: APP.second })}`);

  // 9. L'empreinte se coupe : la bascule, la confirmation, et après.
  {
    const a = P(8), m = P(8) + 0.035, b = P(8) + 0.06;
    const ligne = (on) => `<rect x="${SX + 12}" y="${SY + 170}" width="${SL - 24}" height="66" rx="16" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${empreinte(SX + 36, SY + 203, 20, APP.violet)}
      ${texte(SX + 56, SY + 198, t('Empreinte à l’ouverture', 'Fingerprint on opening'), { taille: 12, couleur: APP.texte, poids: 600 })}
      ${texte(SX + 56, SY + 215, on ? t('C’est elle qui charge la clé', 'It is what loads the key') : t('Coupée : la clé se charge', 'Off: the key loads'), { taille: 9.5, couleur: on ? APP.discret : OR })}
      ${on ? '' : texte(SX + 56, SY + 228, t('sans rien demander', 'without asking anything'), { taille: 9.5, couleur: OR })}
      <rect x="${SX + SL - 64}" y="${SY + 192}" width="40" height="22" rx="11" fill="${on ? APP.violet : '#3A3150'}"/>
      <circle cx="${SX + SL - (on ? 35 : 53)}" cy="${SY + 203}" r="8" fill="#FFFFFF"/>`;
    ecran += scene(8, `${reglagesHaut()}
      ${texte(SX + 18, SY + 158, t('SÉCURITÉ', 'SECURITY'), { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      ${entre(C, a, b, ligne(true), 0.003)}
      ${entre(C, b, a + PAS, ligne(false), 0.003)}
      ${toucher(SX + SL - 44, SY + 203, C, a + 0.012)}
      ${entre(C, a + 0.016, b, `
        <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
        <rect x="${SX + 14}" y="${SY + 250}" width="${SL - 28}" height="200" rx="22" fill="${APP.surface}" stroke="${APP.bord}"/>
        ${texte(SX + 32, SY + 284, t('Ouvrir sans empreinte ?', 'Open without fingerprint?'), { taille: 14.5, couleur: APP.texte, poids: 800 })}
        ${texte(SX + 32, SY + 310, t('La base restera chiffrée et la clé', 'The database stays encrypted and the'), { taille: 10.5, couleur: APP.second })}
        ${texte(SX + 32, SY + 326, t('restera dans le Keystore. Mais', 'key stays in the Keystore. But'), { taille: 10.5, couleur: APP.second })}
        ${texte(SX + 32, SY + 342, t('quiconque tient ton téléphone', 'anyone holding your unlocked'), { taille: 10.5, couleur: APP.second })}
        ${texte(SX + 32, SY + 358, t('déverrouillé ouvrira le journal.', 'phone will open the journal.'), { taille: 10.5, couleur: APP.second })}
        ${texte(SX + 32, SY + 424, t('Annuler', 'Cancel'), { taille: 12, couleur: APP.second, poids: 700 })}
        ${texte(SX + SL - 32, SY + 424, t('Couper le verrou', 'Turn off the lock'), { taille: 12, couleur: APP.rouge, poids: 700, ancre: 'end' })}
        ${toucher(SX + SL - 80, SY + 420, C, m)}`, 0.003)}`);
  }

  // 10. La vidéo en lecture : déchiffrée dans le cache, le temps de la voir.
  {
    const a = P(9), b = P(9) + PAS;
    ecran += scene(9, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
      ${texte(SX + 22, SY + 44, '×', { taille: 22, couleur: '#FFFFFF' })}
      ${texte(SX + SL / 2, SY + 42, '1 / 1', { taille: 12, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
      ${icone('telecharger', SX + SL - 40, SY + 28, '#FFFFFF', 1)}
      ${visage(GENS.enzo.photo, SX, SY + 170, SL, 190, 0)}
      <rect x="${SX + 24}" y="${SY + SH - 70}" width="${SL - 48}" height="4" rx="2" fill="#FFFFFF" fill-opacity="0.2"/>
      <rect x="${SX + 24}" y="${SY + SH - 70}" height="4" rx="2" fill="${APP.violet}" width="0">${fondu('width', C, [[0, 0], [a, 0], [b, SL - 48], [1, SL - 48]])}</rect>
      ${texte(SX + 24, SY + SH - 48, '0:02', { taille: 10, couleur: '#FFFFFF' })}
      ${texte(SX + SL - 24, SY + SH - 48, '0:05', { taille: 10, couleur: '#FFFFFF', ancre: 'end' })}
      <rect x="${SX + 16}" y="${SY + 84}" width="${SL - 32}" height="52" rx="12" fill="${OR}" fill-opacity="0.1" stroke="${OR}" stroke-opacity="0.55"/>
      ${texte(SX + 30, SY + 106, 'cache/lecture/7c02.mp4', { taille: 10.5, couleur: OR, police: MONO, poids: 700 })}
      ${texte(SX + 30, SY + 124, t('en clair, effacé à la fermeture', 'in the clear, deleted on close'), { taille: 10.5, couleur: '#E9E4F2' })}`);
  }
  corps += T.ecran(ecran) + dessus;

  svg('confidentialite.svg', 1280, 720, corps, t(
    'Le modèle de confidentialité de BodyCount, en deux colonnes. Ce qui est vrai : aucune requête réseau, aucun compte, aucune analytique, Android refuse toute connexion faute de permission INTERNET. La base est chiffrée par SQLCipher, sa clé vit dans le Keystore et n’est chargée qu’après l’empreinte. Chaque photo et chaque vidéo est chiffrée en AES-GCM et reste absente de la galerie du téléphone. L’aperçu du multitâche est masqué, les captures bloquées, la sauvegarde Android refusée. Une restauration vérifie toute la sauvegarde avant d’effacer quoi que ce soit. Ce qui ne l’est pas : une fois l’application ouverte, tout est lisible à l’écran, l’empreinte protège l’accès, pas ton épaule. Une sauvegarde exportée voyage, elle vaut ce que vaut ta phrase de passe. Perdre le téléphone, c’est perdre les données, la clé ne se recopie nulle part. L’empreinte se coupe dans les réglages, et la clé se charge alors sans rien demander. Pour être lue, une vidéo est déchiffrée dans le cache privé le temps de la lecture.',
    'The BodyCount privacy model, in two columns. What is true: no network request, no account, no analytics, Android refuses any connection for lack of the INTERNET permission. The database is encrypted by SQLCipher, its key lives in the Keystore and is only loaded after the fingerprint. Every photo and video is encrypted with AES-GCM and never shows in the phone gallery. The recents preview is hidden, screenshots blocked, Android backup refused. A restore checks the whole backup before erasing anything. What is not: once the app is open, everything is readable on screen, the fingerprint guards access, not your shoulder. An exported backup travels, it is worth what your passphrase is worth. Losing the phone means losing the data, the key is copied nowhere. The fingerprint can be turned off in the settings, and the key then loads without asking anything. To be played, a video is decrypted into the private cache while it plays.'));
};

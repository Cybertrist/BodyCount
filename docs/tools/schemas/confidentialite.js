// Le modèle de confidentialité : ce qui est vrai, et ce qui ne l'est pas.
//
// Deux colonnes qui se remplissent carte par carte, sans case vide qui
// attend son texte. Pendant que chaque carte arrive, le téléphone de
// gauche joue la scène qui la prouve, ou la limite qu'elle avoue, avec les
// écrans des autres schémas. Chaque carte renvoie au schéma qui la
// détaille, sans le refaire.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, empreinte, logo, icone, visage,
    cartePersonne, barreNav, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, VIOLET, VERT, OR, ROUGE } = O;
  const C = 50;
  const D = 0.02, PAS = 0.095;
  // Le début de la scène n : les cinq vérités (0 à 4) et les cinq limites
  // (5 à 9) passent en alternance, une de chaque côté, pour que les deux
  // colonnes se remplissent ensemble au lieu que la seconde attende.
  const P = (n) => D + (n < 5 ? 2 * n : 2 * (n - 5) + 1) * PAS;
  const FIN = 0.985;
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
      t('se charge alors sans rien demander.', 'then loads without asking anything.'), t('les Réglages', 'Settings')],
    [t('Une vidéo se lit en clair', 'A video plays in the clear'),
      t('Déchiffrée dans le cache privé le temps', 'Decrypted into the private cache while'),
      t('de la lecture, puis effacée.', 'it plays, then deleted.'), 'coffre.svg'],
  ];

  // Deux colonnes de 400, cinq cartes de 104 chacune.
  const CL = 400, CH = 104, CG = 8, CY0 = 122;
  const colonne = (x, titre, couleur, items, decale) => {
    let s = rubrique(x, 106, titre, couleur);
    items.forEach(([t1, l1, l2, ref], k) => {
      const i = decale + k, y = CY0 + k * (CH + CG), de = P(i);
      // La carte glisse de la droite en apparaissant, puis reste.
      s += `<g opacity="0">${visible(C, de, FIN, 0.008)}
        <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite"
          keyTimes="0;${de.toFixed(4)};${(de + 0.012).toFixed(4)};1" values="18 0;18 0;0 0;0 0"/>
        <rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>
        <rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="14" fill="${couleur}" fill-opacity="0.07" stroke="${couleur}" stroke-width="1.5" opacity="0">${visible(C, de, de + PAS, 0.006)}</rect>
        <circle cx="${x + 32}" cy="${y + 32}" r="14" fill="${couleur}" fill-opacity="0.14" stroke="${couleur}" stroke-opacity="0.6"/>
        ${icone(couleur === VERT ? 'coche' : 'croix', x + 24, y + 24, couleur, 1)}
        ${texte(x + 58, y + 37, t1, { taille: 15, couleur: TITRE, poids: 700 })}
        ${texte(x + 58, y + 59, l1, { taille: 12.5 })}
        ${texte(x + 58, y + 77, l2, { taille: 12.5 })}
        ${texte(x + 58, y + 95, t('voir ', 'see ') + ref, { taille: 11, couleur: DISCRET, police: MONO })}
      </g>`;
    });
    return s;
  };
  corps += colonne(400, t('CE QUI EST VRAI', 'WHAT IS TRUE'), VERT, VRAI, 0);
  corps += colonne(820, t('CE QUI NE L’EST PAS', 'WHAT IS NOT'), OR, FAUX, 5);
  corps += texte(810, 700, t('Un modèle de confidentialité qui ne dirait que la première colonne mentirait par omission.',
    'A privacy model that only showed the first column would be lying by omission.'), { taille: 12.5, couleur: TEXTE, ancre: 'middle' });

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  const scene = (i, contenu) => entre(C, P(i), P(i) + PAS, contenu, 0.005);
  // Un message de l'appli ou d'Android, en bas de l'écran.
  const bandeau = (l1, c = APP.texte, l2 = '', y = SY + SH - 92) => `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="${l2 ? 60 : 44}" rx="12" fill="#2A2238"/>
    ${texte(SX + 26, y + 27, l1, { taille: 12, couleur: c, poids: 700 })}
    ${l2 ? texte(SX + 26, y + 45, l2, { taille: 11, couleur: APP.second }) : ''}`;
  const haut = (titre) => `${texte(SX + 18, SY + 46, titre, { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
    <rect x="${SX + 128}" y="${SY + 28}" width="${SL - 146}" height="28" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${icone('loupe', SX + 138, SY + 35, APP.second, 0.8)}
    ${texte(SX + 156, SY + 46.5, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 10, couleur: APP.discret })}`;
  const reglagesHaut = () => `${texte(SX + 18, SY + 48, '‹', { taille: 24, couleur: APP.texte })}
    ${texte(SX + 40, SY + 48, t('Réglages', 'Settings'), { taille: 21, couleur: APP.texte, poids: 800 })}
    <rect x="${SX + 12}" y="${SY + 70}" width="${SL - 24}" height="62" rx="18" fill="${APP.violet}" fill-opacity="0.12" stroke="${APP.bord}"/>
    ${logo(SX + 42, SY + 101, 34)}
    ${texte(SX + 70, SY + 98, t('18 Personnes', '18 People'), { taille: 14, couleur: APP.texte, poids: 700 })}
    ${texte(SX + 70, SY + 115, t('111 Rencontres', '111 Encounters'), { taille: 10.5, couleur: APP.second })}`;
  const voile = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>`;
  const CL2 = (SL - 36) / 2;
  const grille = (gens, y0, h = 150) => gens.map((p, k) =>
    cartePersonne(p, SX + 12 + (k % 2) * (CL2 + 12), y0 + Math.floor(k / 2) * (h + 12), CL2, h, { premier: p === GENS.noa })).join('');
  let ecran = '';

  // 1. Rien ne sort : une requête part vers le haut et s'écrase sur le mur
  // d'Android, en briques comme dans reseau.svg.
  {
    const a = P(0) + 0.02, b = P(0) + 0.05;
    let s = haut(t('RÉPERTOIRE', 'PEOPLE')) + grille([GENS.noa, GENS.lou, GENS.enzo, GENS.jade], SY + 150, 150);
    s += barreNav(T, 'Fiches');
    // Le mur, sous l'en-tête.
    let briques = '';
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 10; c++) {
        const bx = SX + 12 + c * 25 + (r % 2 ? 12 : 0);
        if (bx + 22 > SX + SL - 12) continue;
        briques += `<rect x="${bx}" y="${SY + 76 + r * 14}" width="22" height="11" rx="2" fill="${ROUGE}" fill-opacity="${0.5 + ((r + c) % 3) * 0.14}"/>`;
      }
    }
    s += briques;
    s += texte(SX + SL / 2, SY + 124, t('Android : pas de permission INTERNET', 'Android: no INTERNET permission'), { taille: 10.5, couleur: ROUGE, poids: 700, police: MONO, ancre: 'middle' });
    s += `<circle cx="${SX + SL / 2}" r="6" fill="${APP.fuchsia}" filter="url(#halo)" opacity="0">
        ${fondu('cy', C, [[0, SY + 330], [a, SY + 330], [b, SY + 106], [1, SY + 106]])}
        ${fondu('opacity', C, [[0, 0], [a, 0], [a + 0.003, 1], [b, 1], [b + 0.004, 0], [1, 0]])}
      </circle>
      ${entre(C, b, b + 0.02, `<circle cx="${SX + SL / 2}" cy="${SY + 100}" r="16" fill="none" stroke="${ROUGE}" stroke-width="2.5"/>`, 0.004)}
      ${entre(C, b, P(0) + PAS, bandeau(t('Connexion refusée par Android.', 'Connection refused by Android.'), ROUGE, t('Aucune requête ne quitte le téléphone.', 'No request leaves the phone.'), SY + SH - 150), 0.004)}`;
    ecran += scene(0, s);
  }

  // 2. La base chiffrée : le verrou, l'empreinte lue, la clé qui arrive.
  {
    const touche = P(1) + 0.02, cle = P(1) + 0.05;
    ecran += scene(1, `
      ${logo(SX + SL / 2, SY + 118, 76)}
      ${texte(SX + SL / 2, SY + 200, 'BodyCount', { taille: 30, couleur: APP.texte, poids: 800, ancre: 'middle' })}
      ${texte(SX + SL / 2, SY + 228, t('Tout reste sur cet appareil. Aucun compte,', 'Everything stays on this device. No account,'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
      ${texte(SX + SL / 2, SY + 245, t('aucun serveur, aucune requête réseau.', 'no server, no network request.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
      <circle cx="${SX + SL / 2}" cy="${SY + 350}" r="56" fill="${VIOLET}" opacity="0.12"/>
      <circle cx="${SX + SL / 2}" cy="${SY + 350}" r="46" fill="url(#marque)"/>
      ${empreinte(SX + SL / 2, SY + 350, 44, '#FFFFFF')}
      <clipPath id="lectureConf"><circle cx="${SX + SL / 2}" cy="${SY + 350}" r="30"/></clipPath>
      <g clip-path="url(#lectureConf)"><rect x="${SX + SL / 2 - 30}" width="60" height="5" fill="#FFFFFF" opacity="0">
        ${fondu('y', C, [[0, SY + 318], [touche, SY + 318], [cle, SY + 380], [1, SY + 380]])}
        ${fondu('opacity', C, [[0, 0], [touche, 0], [touche + 0.002, 0.9], [cle, 0.9], [cle + 0.002, 0], [1, 0]])}</rect></g>
      ${toucher(SX + SL / 2, SY + 350, C, touche)}
      ${entre(C, P(1), touche, texte(SX + SL / 2, SY + 432, t('Touche le capteur pour ouvrir', 'Touch the sensor to open'), { taille: 12.5, couleur: APP.second, poids: 600, ancre: 'middle' }), 0.004)}
      ${entre(C, touche, cle, texte(SX + SL / 2, SY + 432, t('Vérification…', 'Checking…'), { taille: 12.5, couleur: APP.rose, poids: 600, ancre: 'middle' }), 0.004)}
      ${entre(C, cle, P(1) + PAS, bandeau(t('Clé tirée du Keystore, base ouverte.', 'Key pulled from the Keystore, base open.'), VERT, t('Sans l’empreinte, elle reste illisible.', 'Without the fingerprint, it stays unreadable.'), SY + SH - 130), 0.004)}
      ${icone('lock', SX + 38, SY + SH - 42, APP.vert, 0.75)}
      ${texte(SX + 54, SY + SH - 31, t('Base chiffrée, clé rangée dans le Keystore', 'Encrypted database, key kept in the Keystore'), { taille: 10, couleur: APP.second, poids: 600 })}`);
  }

  // 3. La galerie du téléphone : les photos de tous les jours, rien de
  // BodyCount. Les mêmes paysages que coffre.svg.
  {
    const PAYSAGES = [['#F6AD55', '#9C4221'], ['#63B3ED', '#2C5282'], ['#68D391', '#276749'], ['#F687B3', '#702459'], ['#B794F4', '#44337A'], ['#FBD38D', '#975A16'], ['#90CDF4', '#2A4365'], ['#9AE6B4', '#22543D'], ['#FEB2B2', '#9B2C2C'], ['#A3BFFA', '#3C366B'], ['#FAF089', '#744210']];
    corps += `<defs>${PAYSAGES.map(([a, b], i) => `<linearGradient id="paysageConf${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`).join('')}</defs>`;
    const paysage = (x, y, c, i) => `<rect x="${x}" y="${y}" width="${c}" height="${c}" rx="6" fill="url(#paysageConf${i % PAYSAGES.length})"/>
      <circle cx="${x + c * 0.72}" cy="${y + c * 0.3}" r="${c * 0.1}" fill="#FFFFFF" fill-opacity="0.7"/>
      <path d="M${x} ${y + c * 0.85} L${x + c * 0.35} ${y + c * 0.5} L${x + c * 0.6} ${y + c * 0.72} L${x + c * 0.78} ${y + c * 0.6} L${x + c} ${y + c * 0.82} V${y + c - 6} a6 6 0 0 1 -6 6 H${x + 6} a6 6 0 0 1 -6 -6 Z" fill="#000000" fill-opacity="0.28"/>`;
    let s = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#111418"/>
      ${texte(SX + 18, SY + 48, t('Galerie', 'Gallery'), { taille: 21, couleur: '#E8EEF4', poids: 700 })}
      ${texte(SX + 18, SY + 78, t('Récents', 'Recent'), { taille: 12, couleur: '#9AA8B6', poids: 600 })}
      ${texte(SX + SL - 18, SY + 78, t('15 éléments', '15 items'), { taille: 11, couleur: '#6B7785', ancre: 'end' })}`;
    const c = (SL - 24 - 2 * 6) / 3;
    for (let k = 0; k < 15; k++) s += paysage(SX + 12 + (k % 3) * (c + 6), SY + 92 + Math.floor(k / 3) * (c + 6), c, k + 3);
    s += `<rect x="${SX}" y="${SY + SH - 110}" width="${SL}" height="110" fill="#111418"/>
      <rect x="${SX + 12}" y="${SY + SH - 96}" width="${SL - 24}" height="62" rx="12" fill="${VERT}" fill-opacity="0.12" stroke="${VERT}" stroke-opacity="0.5"/>
      ${icone('coche', SX + 24, SY + SH - 81, VERT, 1)}
      ${texte(SX + 48, SY + SH - 70, t('Aucune photo de BodyCount ici.', 'No BodyCount photo in here.'), { taille: 12, couleur: '#E8EEF4', poids: 700 })}
      ${texte(SX + 48, SY + SH - 51, t('Elles sont au coffre, chiffrées.', 'They are in the vault, encrypted.'), { taille: 11, couleur: '#9AA8B6' })}`;
    ecran += scene(2, s);
  }

  // 4. Le multitâche : l'aperçu reste noir, puis une capture est refusée.
  {
    const flash = P(3) + 0.045;
    ecran += scene(3, `
      <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#141019"/>
      ${logo(SX + 58, SY + 70, 22)}
      ${texte(SX + 76, SY + 74, 'BodyCount', { taille: 12.5, couleur: '#E9E4F2', poids: 700 })}
      <rect x="${SX + 40}" y="${SY + 92}" width="${SL - 80}" height="330" rx="18" fill="#000000" stroke="#2A2438"/>
      ${texte(SX + SL / 2, SY + 262, t('aperçu masqué', 'preview hidden'), { taille: 12, couleur: '#5A536B', police: MONO, ancre: 'middle' })}
      <rect x="${SX + SL - 30}" y="${SY + 112}" width="40" height="290" rx="16" fill="#1E1A28"/>
      <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#FFFFFF" opacity="0">
        ${fondu('opacity', C, [[0, 0], [flash, 0], [flash + 0.002, 0.35], [flash + 0.01, 0], [1, 0]])}</rect>
      ${entre(C, flash + 0.004, P(3) + PAS, bandeau(t('Capture d’écran bloquée par l’appli.', 'Screenshot blocked by the app.'), '#F0E6FF', t('FLAG_SECURE, posé au démarrage.', 'FLAG_SECURE, set at startup.'), SY + SH - 130), 0.004)}`);
  }

  // 5. La restauration : l'avertissement, puis la vérification.
  ecran += scene(4, `${reglagesHaut()}
    ${voile}
    ${entre(C, P(4), P(4) + 0.05, `
      <rect x="${SX + 16}" y="${SY + 170}" width="${SL - 32}" height="220" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${texte(SX + 36, SY + 208, t('Restaurer une sauvegarde ?', 'Restore a backup?'), { taille: 15, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 36, SY + 238, t('Tout sera remplacé. Rien ne change', 'Everything will be replaced. Nothing'), { taille: 11.5, couleur: APP.second })}
      ${texte(SX + 36, SY + 256, t('tant qu’elle n’a pas été lue et', 'changes until it has been read and'), { taille: 11.5, couleur: APP.second })}
      ${texte(SX + 36, SY + 274, t('vérifiée en entier.', 'checked in full.'), { taille: 11.5, couleur: APP.second })}
      ${texte(SX + 36, SY + 352, t('Annuler', 'Cancel'), { taille: 12, couleur: APP.second, poids: 700 })}
      ${texte(SX + SL - 36, SY + 352, t('Choisir le fichier', 'Pick the file'), { taille: 12, couleur: APP.rose, poids: 700, ancre: 'end' })}
      ${toucher(SX + SL - 90, SY + 348, C, P(4) + 0.04)}`, 0.004)}
    ${entre(C, P(4) + 0.05, P(4) + PAS, `
      <rect x="${SX + 16}" y="${SY + 230}" width="${SL - 32}" height="84" rx="20" fill="${APP.surface}" stroke="${APP.bord}"/>
      <circle cx="${SX + 46}" cy="${SY + 272}" r="11" fill="none" stroke="${APP.violet}" stroke-width="3" stroke-dasharray="44 26">
        <animateTransform attributeName="transform" type="rotate" from="0 ${SX + 46} ${SY + 272}" to="360 ${SX + 46} ${SY + 272}" dur="1s" repeatCount="indefinite"/></circle>
      ${texte(SX + 70, SY + 268, t('Vérification de la', 'Checking the'), { taille: 12.5, couleur: APP.texte, poids: 600 })}
      ${texte(SX + 70, SY + 286, t('sauvegarde…', 'backup…'), { taille: 12.5, couleur: APP.texte, poids: 600 })}
      ${bandeau(t('Tes 18 fiches sont encore intactes.', 'Your 18 cards are still intact.'), VERT, t('Rien ne bouge avant la fin.', 'Nothing moves until the end.'), SY + SH - 130)}`, 0.004)}`);

  // 6. L'écran ouvert se lit : la fiche d'Enzo, et un regard qui entre
  // dans l'écran par le haut, posé dans le téléphone.
  {
    const oeil = P(5) + 0.025;
    ecran += scene(5, `
      ${visage(GENS.enzo.photo, SX, SY, SL, 290, 0)}
      <rect x="${SX}" y="${SY}" width="${SL}" height="290" fill="url(#voile)"/>
      ${texte(SX + 18, SY + 272, 'Enzo P.', { taille: 30, couleur: '#FFFFFF', poids: 800 })}
      ${texte(SX + 20, SY + 330, '3,8', { taille: 22, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 20, SY + 348, t('NOTE', 'RATING'), { taille: 9.5, couleur: APP.second, poids: 700 })}
      ${texte(SX + 110, SY + 330, '7', { taille: 22, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 110, SY + 348, t('FOIS', 'TIMES'), { taille: 9.5, couleur: APP.second, poids: 700 })}
      ${texte(SX + 180, SY + 330, t('347 j', '347 d'), { taille: 22, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 180, SY + 348, t('DEPUIS', 'SINCE'), { taille: 9.5, couleur: APP.second, poids: 700 })}
      <rect x="${SX + 12}" y="${SY + 368}" width="${SL - 24}" height="74" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${texte(SX + 26, SY + 394, t('Toujours partant pour un deuxième', 'Always up for a second round,'), { taille: 11.5, couleur: APP.texte })}
      ${texte(SX + 26, SY + 412, t('round, jamais pour rester dormir.', 'never for staying the night.'), { taille: 11.5, couleur: APP.texte })}
      ${texte(SX + 26, SY + 430, t('5 juin', '5 June'), { taille: 10, couleur: APP.discret })}
      <g opacity="0">${visible(C, oeil, P(5) + PAS, 0.006)}
        <rect x="${SX + 12}" y="${SY + 12}" width="${SL - 24}" height="44" rx="22" fill="#0B0616" fill-opacity="0.82" stroke="${OR}" stroke-opacity="0.7"/>
        ${icone('oeil', SX + 26, SY + 26, OR, 1.1)}
        ${texte(SX + 52, SY + 39, t('Quelqu’un lit par-dessus ton épaule.', 'Someone reads over your shoulder.'), { taille: 11.5, couleur: OR, poids: 700 })}
      </g>
      ${entre(C, oeil + 0.02, P(5) + PAS, bandeau(t('Ouverte, l’appli montre tout.', 'Once open, the app shows everything.'), OR, t('L’empreinte garde l’entrée, pas l’écran.', 'It guards the door, not the screen.'), SY + SH - 92), 0.004)}`);
  }

  // 7. Une sauvegarde voyage : prête, puis partagée hors du téléphone.
  {
    const partage = P(6) + 0.035;
    ecran += scene(6, `${reglagesHaut()}
      ${voile}
      ${entre(C, P(6), partage, `
        <rect x="${SX + 16}" y="${SY + 200}" width="${SL - 32}" height="170" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
        ${texte(SX + 36, SY + 238, t('Sauvegarde prête', 'Backup ready'), { taille: 15, couleur: APP.texte, poids: 800 })}
        ${texte(SX + 36, SY + 264, t('186 Mo, chiffrée par ta phrase.', '186 MB, encrypted by your passphrase.'), { taille: 11.5, couleur: APP.second })}
        ${texte(SX + 36, SY + 344, t('Partager', 'Share'), { taille: 12.5, couleur: APP.rose, poids: 700 })}
        ${texte(SX + SL - 36, SY + 344, t('Enregistrer', 'Save'), { taille: 12.5, couleur: APP.second, poids: 700, ancre: 'end' })}
        ${toucher(SX + 62, SY + 340, C, partage - 0.012)}`, 0.004)}
      ${entre(C, partage, P(6) + PAS, `
        <rect x="${SX}" y="${SY + SH - 290}" width="${SL}" height="290" rx="22" fill="#1C1B22"/>
        <rect x="${SX + SL / 2 - 18}" y="${SY + SH - 280}" width="36" height="4" rx="2" fill="#4A4855"/>
        <rect x="${SX + 16}" y="${SY + SH - 258}" width="${SL - 32}" height="52" rx="12" fill="#26252E"/>
        ${icone('fichier', SX + 28, SY + SH - 240, OR, 1.1)}
        ${texte(SX + 54, SY + SH - 234, 'bodycount-2026-09-26.bcx', { taille: 11, couleur: '#E8E6F0', police: MONO, poids: 700 })}
        ${texte(SX + 54, SY + SH - 217, t('186 Mo · chiffré', '186 MB · encrypted'), { taille: 10.5, couleur: '#9A98A8' })}
        ${texte(SX + 18, SY + SH - 180, t('Envoyer vers', 'Send to'), { taille: 12, couleur: '#E8E6F0', poids: 700 })}
        ${[[t('Drive', 'Drive'), '#4285F4'], [t('E-mail', 'Email'), '#EA4335'], ['Bluetooth', '#1E88E5'], [t('Messages', 'Messages'), '#34A853']].map(([nom, c], k) => {
          const x = SX + 22 + k * 62;
          return `<circle cx="${x + 20}" cy="${SY + SH - 138}" r="20" fill="${c}" fill-opacity="0.85"/>
            ${texte(x + 20, SY + SH - 102, nom, { taille: 10, couleur: '#C9C7D4', ancre: 'middle' })}`;
        }).join('')}
        ${texte(SX + 18, SY + SH - 62, t('Elle quitte le téléphone : elle vaut', 'It leaves the phone: it is worth'), { taille: 11.5, couleur: OR, poids: 700 })}
        ${texte(SX + 18, SY + SH - 44, t('ce que vaut ta phrase de passe.', 'what your passphrase is worth.'), { taille: 11.5, couleur: OR })}`, 0.004)}`);
  }

  // 8. Le téléphone perdu : un nouveau téléphone, BodyCount réinstallé,
  // et un répertoire vide. La clé n'a pas suivi.
  ecran += scene(7, `${haut(t('RÉPERTOIRE', 'PEOPLE'))}
    <circle cx="${SX + SL / 2}" cy="${SY + 220}" r="44" fill="${APP.violet}" fill-opacity="0.1" stroke="${APP.bord}"/>
    ${icone('cle', SX + SL / 2 - 16, SY + 204, APP.second, 2)}
    ${texte(SX + SL / 2, SY + 300, t('Le répertoire est vide', 'The people list is empty'), { taille: 16, couleur: APP.texte, poids: 800, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + 324, t('Le bouton en bas à droite ajoute', 'The button at the bottom right adds'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + 341, t('une première fiche.', 'a first card.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    ${entre(C, P(7) + 0.02, P(7) + PAS, bandeau(t('Nouveau téléphone, nouvelle clé.', 'New phone, new key.'), OR, t('Sans sauvegarde, rien ne revient.', 'Without a backup, nothing comes back.'), SY + SH - 150), 0.004)}
    ${barreNav(T, 'Fiches')}`);

  // 9. L'empreinte se coupe : la bascule, la confirmation, et après.
  {
    const a = P(8), m = P(8) + 0.035, b = P(8) + 0.05;
    const ligne = (on) => `<rect x="${SX + 12}" y="${SY + 170}" width="${SL - 24}" height="70" rx="16" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${empreinte(SX + 36, SY + 205, 20, APP.violet)}
      ${texte(SX + 56, SY + 199, t('Empreinte à l’ouverture', 'Fingerprint on opening'), { taille: 12.5, couleur: APP.texte, poids: 600 })}
      ${texte(SX + 56, SY + 217, on ? t('C’est elle qui charge la clé', 'It is what loads the key') : t('Coupée : la clé se charge', 'Off: the key loads'), { taille: 11, couleur: on ? APP.discret : OR })}
      ${on ? '' : texte(SX + 56, SY + 232, t('sans rien demander', 'without asking anything'), { taille: 11, couleur: OR })}
      <rect x="${SX + SL - 64}" y="${SY + 194}" width="40" height="22" rx="11" fill="${on ? APP.violet : '#3A3150'}"/>
      <circle cx="${SX + SL - (on ? 35 : 53)}" cy="${SY + 205}" r="8" fill="#FFFFFF"/>`;
    ecran += scene(8, `${reglagesHaut()}
      ${texte(SX + 18, SY + 158, t('SÉCURITÉ', 'SECURITY'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      ${entre(C, a, b, ligne(true), 0.003)}
      ${entre(C, b, a + PAS, ligne(false), 0.003)}
      ${toucher(SX + SL - 44, SY + 205, C, a + 0.012)}
      ${entre(C, a + 0.016, b, `
        ${voile}
        <rect x="${SX + 14}" y="${SY + 250}" width="${SL - 28}" height="206" rx="22" fill="${APP.surface}" stroke="${APP.bord}"/>
        ${texte(SX + 32, SY + 284, t('Ouvrir sans empreinte ?', 'Open without fingerprint?'), { taille: 14.5, couleur: APP.texte, poids: 800 })}
        ${texte(SX + 32, SY + 312, t('La base restera chiffrée et la clé', 'The database stays encrypted and the'), { taille: 11, couleur: APP.second })}
        ${texte(SX + 32, SY + 329, t('restera dans le Keystore. Mais', 'key stays in the Keystore. But'), { taille: 11, couleur: APP.second })}
        ${texte(SX + 32, SY + 346, t('quiconque tient ton téléphone', 'anyone holding your unlocked'), { taille: 11, couleur: APP.second })}
        ${texte(SX + 32, SY + 363, t('déverrouillé ouvrira le journal.', 'phone will open the journal.'), { taille: 11, couleur: APP.second })}
        ${texte(SX + 32, SY + 430, t('Annuler', 'Cancel'), { taille: 12, couleur: APP.second, poids: 700 })}
        ${texte(SX + SL - 32, SY + 430, t('Couper le verrou', 'Turn off the lock'), { taille: 12, couleur: APP.rouge, poids: 700, ancre: 'end' })}
        ${toucher(SX + SL - 80, SY + 426, C, m)}`, 0.003)}
      ${entre(C, b, a + PAS, bandeau(t('Le chiffrement reste,', 'Encryption stays,'), OR, t('mais la porte est ouverte.', 'but the door is open.'), SY + SH - 130), 0.004)}`);
  }

  // 10. La vidéo en lecture : déchiffrée dans le cache, le temps de la voir.
  {
    const a = P(9), b = P(9) + PAS;
    ecran += scene(9, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
      ${texte(SX + 22, SY + 46, '×', { taille: 22, couleur: '#FFFFFF' })}
      ${texte(SX + SL / 2, SY + 44, '1 / 1', { taille: 12.5, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
      ${icone('telecharger', SX + SL - 40, SY + 30, '#FFFFFF', 1)}
      <rect x="${SX + 16}" y="${SY + 76}" width="${SL - 32}" height="58" rx="12" fill="${OR}" fill-opacity="0.1" stroke="${OR}" stroke-opacity="0.55"/>
      ${texte(SX + 30, SY + 100, 'cache/lecture/7c02.mp4', { taille: 11, couleur: OR, police: MONO, poids: 700 })}
      ${texte(SX + 30, SY + 120, t('en clair, effacé à la fermeture', 'in the clear, deleted on close'), { taille: 11.5, couleur: '#E9E4F2' })}
      ${visage(GENS.enzo.photo, SX, SY + 170, SL, SL, 0)}
      <circle cx="${SX + SL / 2}" cy="${SY + 170 + SL / 2}" r="24" fill="#000000" fill-opacity="0.35">
        ${fondu('opacity', C, [[0, 1], [a + 0.01, 1], [a + 0.02, 0], [1, 0]])}</circle>
      <rect x="${SX + 24}" y="${SY + SH - 62}" width="${SL - 48}" height="4" rx="2" fill="#FFFFFF" fill-opacity="0.2"/>
      <rect x="${SX + 24}" y="${SY + SH - 62}" height="4" rx="2" fill="${APP.violet}" width="0">${fondu('width', C, [[0, 0], [a, 0], [b, SL - 48], [1, SL - 48]])}</rect>
      ${texte(SX + 24, SY + SH - 40, '0:02', { taille: 10.5, couleur: '#FFFFFF' })}
      ${texte(SX + SL - 24, SY + SH - 40, '0:05', { taille: 10.5, couleur: '#FFFFFF', ancre: 'end' })}`);
  }
  corps += T.ecran(ecran);

  svg('confidentialite.svg', 1280, 720, corps, t(
    'Le modèle de confidentialité de BodyCount, en deux colonnes. Ce qui est vrai : aucune requête réseau, aucun compte, aucune analytique, Android refuse toute connexion faute de permission INTERNET. La base est chiffrée par SQLCipher, sa clé vit dans le Keystore et n’est chargée qu’après l’empreinte. Chaque photo et chaque vidéo est chiffrée en AES-GCM et reste absente de la galerie du téléphone. L’aperçu du multitâche est masqué, les captures bloquées, la sauvegarde Android refusée. Une restauration vérifie toute la sauvegarde avant d’effacer quoi que ce soit. Ce qui ne l’est pas : une fois l’application ouverte, tout est lisible à l’écran, l’empreinte protège l’accès, pas ton épaule. Une sauvegarde exportée voyage, elle vaut ce que vaut ta phrase de passe. Perdre le téléphone, c’est perdre les données, la clé ne se recopie nulle part. L’empreinte se coupe dans les réglages, et la clé se charge alors sans rien demander. Pour être lue, une vidéo est déchiffrée dans le cache privé le temps de la lecture.',
    'The BodyCount privacy model, in two columns. What is true: no network request, no account, no analytics, Android refuses any connection for lack of the INTERNET permission. The database is encrypted by SQLCipher, its key lives in the Keystore and is only loaded after the fingerprint. Every photo and video is encrypted with AES-GCM and never shows in the phone gallery. The recents preview is hidden, screenshots blocked, Android backup refused. A restore checks the whole backup before erasing anything. What is not: once the app is open, everything is readable on screen, the fingerprint guards access, not your shoulder. An exported backup travels, it is worth what your passphrase is worth. Losing the phone means losing the data, the key is copied nowhere. The fingerprint can be turned off in the settings, and the key then loads without asking anything. To be played, a video is decrypted into the private cache while it plays.'));
};

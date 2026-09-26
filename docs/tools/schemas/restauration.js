// Restaurer une sauvegarde : le fichier est lu deux fois, et le téléphone
// ne change qu'au tout dernier instant.
//
// À gauche, le téléphone : Réglages, Restaurer, l'avertissement, le
// sélecteur du système, la phrase, l'attente, puis le répertoire revenu ;
// et pour finir une autre tentative, avec une phrase fausse. À droite, le
// fichier BCEX2 de sauvegarde.svg, qu'une tête de lecture parcourt deux
// fois (lib/utils/export_helper.dart, importEncrypted), le coffre et les
// fiches du téléphone, et ce que devient chaque échec.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, icone, logo, frappe, visage,
    cartePersonne, barreNav, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU } = O;
  const C = 36;
  // Les écrans du téléphone, dans l'ordre.
  const AVERTIR = 0.085, CHOISIR = 0.16, PHRASE = 0.235, P1 = 0.315, P2 = 0.47, REMPLACE = 0.64, FAIT = 0.665,
    REPERT = 0.735, RATE = 0.8, ERREUR = 0.875, FIN = 0.975;
  let corps = entete(t('LA RESTAURATION', 'THE RESTORE'),
    t('Le fichier est lu deux fois. Tant qu’il n’est pas entièrement vérifié, rien ne bouge sur le téléphone.',
      'The file is read twice. Until all of it is checked, nothing moves on the phone.'));

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // Les réglages, avec le résumé des fiches du moment.
  const ligne = (y, ic, couleurIc, titre, sous, valeur = '') => `
    <rect x="${SX + 26}" y="${y + 14}" width="28" height="28" rx="8" fill="${couleurIc}" fill-opacity="0.14"/>
    ${icone(ic, SX + 32, y + 20, couleurIc)}
    ${texte(SX + 64, y + 26, titre, { taille: 12, couleur: APP.texte, poids: 600 })}
    ${texte(SX + 64, y + 42, sous, { taille: 9.5, couleur: APP.discret })}
    ${valeur ? texte(SX + SL - 26, y + 34, valeur, { taille: 9.5, couleur: APP.second, poids: 700, ancre: 'end', extra: 'letter-spacing="0.8"' }) : ''}`;
  const reglages = (personnes, rencontres) => `
    ${texte(SX + 20, SY + 48, '‹', { taille: 24, couleur: APP.texte })}
    ${texte(SX + 44, SY + 48, t('Réglages', 'Settings'), { taille: 21, couleur: APP.texte, poids: 800 })}
    <rect x="${SX + 12}" y="${SY + 70}" width="${SL - 24}" height="64" rx="18" fill="${APP.violet}" fill-opacity="0.12" stroke="${APP.bord}"/>
    ${logo(SX + 44, SY + 102, 38)}
    ${texte(SX + 74, SY + 99, t(`${personnes} Personnes`, `${personnes} People`), { taille: 14, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 74, SY + 116, t(`${rencontres} Rencontres`, `${rencontres} Encounters`), { taille: 10.5, couleur: APP.second, poids: 600 })}
    ${texte(SX + 20, SY + 166, t('DONNÉES', 'DATA'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.5"' })}
    <rect x="${SX + 12}" y="${SY + 178}" width="${SL - 24}" height="186" rx="18" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${ligne(SY + 182, 'cadenas', APP.vert, t('Tout reste sur ce téléphone', 'Everything stays on this phone'), t('Base chiffrée, aucun compte', 'Encrypted database, no account'))}
    <line x1="${SX + 12}" y1="${SY + 240}" x2="${SX + SL - 12}" y2="${SY + 240}" stroke="${APP.bord}"/>
    ${ligne(SY + 242, 'telecharger', APP.rose, t('Exporter, chiffré', 'Export, encrypted'), t('Dernière il y a 12 jours', 'Last one 12 days ago'), t('Phrase', 'Passphrase'))}
    <line x1="${SX + 12}" y1="${SY + 302}" x2="${SX + SL - 12}" y2="${SY + 302}" stroke="${APP.bord}"/>
    ${ligne(SY + 304, 'fichier', APP.rose, t('Restaurer une sauvegarde', 'Restore a backup'), t('Remplace ce qui est ici', 'Replaces what is here'), '.bcx')}`;
  const voile = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.62"/>`;
  // Des fonctions, pas des chaînes : chaque usage doit avoir ses propres
  // identifiants de clipPath, sinon le fichier en porte deux fois le même.
  const AVANT = () => reglages(12, 70), APRES = () => reglages(18, 111);

  // 1. Les réglages, le toucher sur Restaurer.
  ecran += entre(C, 0, AVERTIR, AVANT() + toucher(SX + 130, SY + 334, C, 0.06), 0.006);

  // 2. L'avertissement, qui dit déjà la règle.
  ecran += entre(C, AVERTIR, CHOISIR, `${AVANT()}${voile}
    <rect x="${SX + 16}" y="${SY + 150}" width="${SL - 32}" height="226" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
    ${texte(SX + 36, SY + 188, t('Restaurer une sauvegarde ?', 'Restore a backup?'), { taille: 15.5, couleur: APP.texte, poids: 800 })}
    ${[t('Les fiches, rencontres, notes, photos', 'The cards, encounters, notes, photos'),
      t('et vidéos du téléphone seront', 'and videos on the phone will be'),
      t('remplacées par celles de la sauvegarde.', 'replaced by those in the backup.'),
      t('Rien ne change tant qu’elle n’a pas', 'Nothing changes until it has been'),
      t('été lue et vérifiée en entier.', 'read and checked in full.')].map((s, i) =>
      texte(SX + 36, SY + 216 + i * 16, s, { taille: 10.5, couleur: i >= 3 ? APP.texte : APP.second, poids: i >= 3 ? 600 : 400 })).join('')}
    ${texte(SX + SL - 146, SY + 348, t('Annuler', 'Cancel'), { taille: 12, couleur: APP.second, poids: 700, ancre: 'middle' })}
    ${texte(SX + SL - 66, SY + 348, t('Choisir le fichier', 'Choose the file'), { taille: 12, couleur: APP.rose, poids: 700, ancre: 'middle' })}
    ${toucher(SX + SL - 66, SY + 344, C, 0.135)}`, 0.006);

  // 3. Le sélecteur du système : la sauvegarde d'il y a douze jours.
  const GRIS = { fond: '#1B1D22', carte: '#262930', texte: '#E6E8EC', second: '#9AA0AA', bleu: '#8AB4F8' };
  ecran += entre(C, CHOISIR, PHRASE, `
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${GRIS.fond}"/>
    ${texte(SX + 20, SY + 48, '☰', { taille: 16, couleur: GRIS.second })}
    ${texte(SX + 48, SY + 48, t('Téléchargements', 'Downloads'), { taille: 16, couleur: GRIS.texte, poids: 600 })}
    ${[['bodycount-2026-09-14.bcx', '186 Mo', true], [t('facture-août.pdf', 'invoice-aug.pdf'), '84 Ko'], ['IMG_20260914.jpg', '3,1 Mo'], [t('billet-train.pdf', 'train-ticket.pdf'), '212 Ko']].map(([f, taille, bon], i) => `
      ${bon ? `<rect x="${SX + 8}" y="${SY + 70}" width="${SL - 16}" height="46" rx="10" fill="${GRIS.bleu}" fill-opacity="0.12"/>` : ''}
      ${icone('fichier', SX + 22, SY + 85 + i * 50, bon ? GRIS.bleu : GRIS.second)}
      ${texte(SX + 50, SY + 92 + i * 50, f, { taille: 11.5, couleur: GRIS.texte, police: bon ? MONO : undefined })}
      ${texte(SX + 50, SY + 107 + i * 50, bon ? t('186 Mo · 14 sept.', '186 MB · 14 Sept.') : taille, { taille: 10, couleur: GRIS.second })}`).join('')}
    ${toucher(SX + 120, SY + 94, C, 0.205)}
    <rect x="${SX + 12}" y="${SY + SH - 64}" width="${SL - 24}" height="44" rx="10" fill="${GRIS.carte}"/>
    ${texte(SX + 26, SY + SH - 44, t('BodyCount en reçoit une copie privée,', 'BodyCount gets a private copy,'), { taille: 10.5, couleur: GRIS.second })}
    ${texte(SX + 26, SY + SH - 29, t('effacée quoi qu’il arrive.', 'deleted whatever happens.'), { taille: 10.5, couleur: GRIS.second })}`, 0.006);

  // La phrase de passe, par-dessus les réglages assombris.
  const phrase = (de, a, touche, points, fond = AVANT) => `${fond()}${voile}
    <rect x="${SX + 16}" y="${SY + 170}" width="${SL - 32}" height="196" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
    ${texte(SX + 38, SY + 210, t('Phrase de passe', 'Passphrase'), { taille: 17, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 38, SY + 234, t('Celle choisie au moment de l’export.', 'The one chosen at export time.'), { taille: 10.5, couleur: APP.second })}
    ${entre(C, 0, de, texte(SX + 40, SY + 280, t('Au moins 8 caractères', 'At least 8 characters'), { taille: 11.5, couleur: APP.discret }), 0.003)}
    ${frappe(SX + 40, SY + 281, points, C, de, a, { taille: 15, couleur: APP.texte })}
    <line x1="${SX + 38}" y1="${SY + 292}" x2="${SX + SL - 38}" y2="${SY + 292}" stroke="${APP.violet}" stroke-width="2"/>
    ${texte(SX + SL - 124, SY + 340, t('Annuler', 'Cancel'), { taille: 12, couleur: APP.second, poids: 700, ancre: 'middle' })}
    ${texte(SX + SL - 56, SY + 340, t('Restaurer', 'Restore'), { taille: 12, couleur: APP.rose, poids: 700, ancre: 'middle' })}
    ${toucher(SX + SL - 56, SY + 336, C, touche)}`;
  ecran += entre(C, PHRASE, P1, phrase(0.25, 0.29, 0.305, '••••••••••••••'), 0.006);

  // L'attente : un seul message au premier passage, les vidéos au second.
  const attente = (fond, messages) => `${fond()}${voile}
    <rect x="${SX + 16}" y="${SY + 270}" width="${SL - 32}" height="70" rx="20" fill="${APP.surface}" stroke="${APP.bord}"/>
    <circle cx="${SX + 46}" cy="${SY + 305}" r="11" fill="none" stroke="${APP.violet}" stroke-width="3" stroke-dasharray="44 26">
      <animateTransform attributeName="transform" type="rotate" from="0 ${SX + 46} ${SY + 305}" to="360 ${SX + 46} ${SY + 305}" dur="0.9s" repeatCount="indefinite"/></circle>
    ${messages}`;
  const msg = (l1, l2 = '') => l2
    ? texte(SX + 66, SY + 301, l1, { taille: 10.5, couleur: APP.texte }) + texte(SX + 66, SY + 317, l2, { taille: 10.5, couleur: APP.second, police: MONO })
    : texte(SX + 66, SY + 309.5, l1, { taille: 10.5, couleur: APP.texte });
  const VIDEOS = [0.555, 0.6];
  ecran += entre(C, P1, FAIT, attente(AVANT,
    entre(C, 0, VIDEOS[0], msg(t('Vérification de la sauvegarde…', 'Checking the backup…')), 0.003) +
    entre(C, VIDEOS[0], VIDEOS[1], msg(t('Déchiffrement des vidéos,', 'Decrypting videos,'), t('1 sur 2…', '1 of 2…')), 0.003) +
    entre(C, VIDEOS[1], 1, msg(t('Déchiffrement des vidéos,', 'Decrypting videos,'), t('2 sur 2…', '2 of 2…')), 0.003)), 0.006);

  // Fait : les réglages disent 18, le message confirme.
  ecran += entre(C, FAIT, REPERT, `${APRES()}
    <rect x="${SX + 12}" y="${SY + SH - 64}" width="${SL - 24}" height="44" rx="10" fill="#2B2340"/>
    ${texte(SX + 26, SY + SH - 37, t('Sauvegarde restaurée.', 'Backup restored.'), { taille: 12, couleur: APP.texte })}
    ${toucher(SX + 26, SY + 42, C, 0.72)}`, 0.006);

  // Le répertoire revenu : les dix-huit fiches, relues de zéro.
  const gens = [GENS.noa, GENS.lou, GENS.enzo, GENS.jade, GENS.matteo, GENS.gabriel];
  const CL = (SL - 36) / 2, CH = 150;
  let rep = `${texte(SX + 18, SY + 44, t('RÉPERTOIRE', 'PEOPLE'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
    <rect x="${SX + SL - 88}" y="${SY + 28}" width="70" height="22" rx="11" fill="${APP.violet}" fill-opacity="0.2"/>
    ${texte(SX + SL - 53, SY + 43, t('18 fiches', '18 cards'), { taille: 10, couleur: APP.rose, poids: 700, ancre: 'middle' })}`;
  gens.forEach((p, i) => {
    rep += cartePersonne(p, SX + 12 + (i % 2) * (CL + 12), SY + 66 + Math.floor(i / 2) * (CH + 12), CL, CH, { premier: i === 0 });
  });
  rep += barreNav(T, 'Fiches');
  ecran += entre(C, REPERT, RATE, rep, 0.006);

  // Une autre fois : une phrase fausse.
  ecran += entre(C, RATE, 0.835, phrase(0.806, 0.822, 0.83, '•••••••••', APRES), 0.005);
  ecran += entre(C, 0.835, ERREUR, attente(APRES, msg(t('Vérification de la sauvegarde…', 'Checking the backup…'))), 0.004);
  ecran += entre(C, ERREUR, FIN, `${APRES()}
    <rect x="${SX + 12}" y="${SY + SH - 76}" width="${SL - 24}" height="56" rx="10" fill="${APP.rouge}"/>
    ${texte(SX + 26, SY + SH - 52, t('Cette phrase de passe n’ouvre', 'This passphrase does not open'), { taille: 12, couleur: '#2A0A0A', poids: 700 })}
    ${texte(SX + 26, SY + SH - 35, t('pas la sauvegarde.', 'the backup.'), { taille: 12, couleur: '#2A0A0A', poids: 700 })}`, 0.006);
  corps += T.ecran(ecran);

  // ------------------------------------------------ le fichier, lu deux fois
  const K = 400, FY = 126, FL = 820;
  corps += rubrique(K, FY - 18, t('LA SAUVEGARDE, LUE DEUX FOIS', 'THE BACKUP, READ TWICE'));
  corps += `<rect x="${K}" y="${FY}" width="${FL}" height="146" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  // Les mêmes morceaux que dans sauvegarde.svg.
  const morceaux = [
    { l: 62, c: TEXTE, lib: 'BCEX2' },
    { l: 70, c: OR, lib: t('sel', 'salt') },
    { l: 116, c: BLEU, lib: 'donnees.json', chiffre: true },
    ...[0, 1, 2, 3].map(() => ({ l: 44, c: ACCENT, lib: '', chiffre: true, genre: 'photo' })),
    ...[0, 1, 2, 3, 4, 5].map(() => ({ l: 44, c: VIOLET, lib: '', chiffre: true, genre: 'video' })),
    { l: 30, c: DISCRET, lib: '0' },
  ];
  const MY = FY + 40, MH = 46;
  let mx = K + 18;
  const pos = [];
  morceaux.forEach((m) => { pos.push(mx); mx += m.l + 5; });
  const bout = mx - 5;
  // Chaque passage : la tête va du premier morceau chiffré à la fin.
  const passage = (de, a) => ({ de, a, x: (x) => de + ((x - pos[2]) / (bout - pos[2])) * (a - de) });
  const UN = passage(P1 + 0.01, P2 - 0.01), DEUX = passage(P2 + 0.005, REMPLACE - 0.01);
  // L'instant où la tête atteint le milieu du morceau i.
  const instant = (p, i) => p.x(pos[i] + morceaux[i].l / 2);

  // Où chaque morceau de média se pose dans le coffre : une tuile par
  // photo, une par vidéo (ses trois morceaux vont à la même).
  const EY = 318;
  const place = (j) => [K + 196 + (j % 3) * 38, EY + 42 + Math.floor(j / 3) * 38];
  const destination = { 3: 0, 4: 1, 5: 2, 6: 3, 7: 4, 8: 4, 9: 4, 10: 5, 11: 5, 12: 5 };
  morceaux.forEach((m, i) => {
    const x = pos[i];
    const avant = i < 2 || !m.chiffre;
    const vu1 = avant ? UN.de : instant(UN, i), vu2 = avant ? DEUX.de : instant(DEUX, i);
    // Le morceau lui-même, présent tout le long.
    corps += `<rect x="${x}" y="${MY}" width="${m.l}" height="${MH}" rx="7" fill="${m.c}" fill-opacity="0.13" stroke="${m.c}" stroke-opacity="0.6"/>
      ${m.chiffre ? icone('cadenas', x + m.l / 2 - 8, MY + (m.lib ? 7 : 15), m.c) : ''}
      ${m.lib ? texte(x + m.l / 2, MY + (m.chiffre ? 38 : 28), m.lib, { taille: 11, couleur: m.c === TEXTE ? TITRE : m.c, police: MONO, poids: 700, ancre: 'middle' }) : ''}`;
    if (!m.chiffre) return;
    // Premier passage : un cadre vert, puis « jeté » : il s'éteint.
    corps += `<rect x="${x - 1}" y="${MY - 1}" width="${m.l + 2}" height="${MH + 2}" rx="8" fill="none" stroke="${VERT}" stroke-width="2" opacity="0">
        ${fondu('opacity', C, [[0, 0], [vu1 - 0.002, 0], [vu1, 1], [vu1 + 0.02, 0.35], [P2, 0.35], [P2 + 0.004, 0], [1, 0]])}</rect>
      <g opacity="0">${visible(C, vu1, P2, 0.004)}${icone('coche', x + m.l / 2 - 7, MY - 20, VERT, 0.9)}</g>`;
    // Second passage : les médias partent vers le coffre, le JSON attend.
    if (m.genre) {
      const c = m.c;
      const [dx, dy] = place(destination[i]);
      corps += `<rect x="${x + m.l / 2 - 6}" y="${MY + MH}" width="12" height="12" rx="3" fill="${c}" opacity="0" filter="url(#halo)">
          ${fondu('opacity', C, [[0, 0], [vu2, 0], [vu2 + 0.004, 1], [vu2 + 0.028, 1], [vu2 + 0.032, 0], [1, 0]])}
          ${fondu('x', C, [[0, x + m.l / 2 - 6], [vu2, x + m.l / 2 - 6], [vu2 + 0.03, dx + 9], [1, dx + 9]])}
          ${fondu('y', C, [[0, MY + MH], [vu2, MY + MH], [vu2 + 0.03, dy + 9], [1, dy + 9]])}</rect>`;
    } else {
      corps += `<rect x="${x - 1}" y="${MY - 1}" width="${m.l + 2}" height="${MH + 2}" rx="8" fill="none" stroke="${BLEU}" stroke-width="2" opacity="0">${visible(C, vu2, REMPLACE + 0.02, 0.004)}</rect>`;
    }
  });
  // La tête de lecture, une barre qui balaie.
  const tete = (p, couleur) => `<g opacity="0">${visible(C, p.de, p.a, 0.004)}
      <rect y="${MY - 8}" width="3" height="${MH + 16}" rx="1.5" fill="${couleur}" filter="url(#halo)">
        ${fondu('x', C, [[0, pos[2] - 4], [p.de, pos[2] - 4], [p.a, bout + 2], [1, bout + 2]])}</rect></g>`;
  corps += tete(UN, VERT) + tete(DEUX, ACCENT);
  // L'échec : la tête s'arrête net sur le premier morceau chiffré.
  const ARRET = ERREUR - 0.012;
  corps += `<g opacity="0">${visible(C, 0.84, FIN, 0.004)}
      <rect y="${MY - 8}" width="3" height="${MH + 16}" rx="1.5" fill="${ROUGE}" filter="url(#halo)">
        ${fondu('x', C, [[0, pos[2] - 4], [0.84, pos[2] - 4], [ARRET, pos[2] + 40], [1, pos[2] + 40]])}</rect></g>
    <rect x="${pos[2] - 1}" y="${MY - 1}" width="${morceaux[2].l + 2}" height="${MH + 2}" rx="8" fill="${ROUGE}" fill-opacity="0.12" stroke="${ROUGE}" stroke-width="2" opacity="0">${visible(C, ARRET, FIN, 0.004)}</rect>
    <g opacity="0">${visible(C, ARRET, FIN, 0.004)}${icone('croix', pos[2] + morceaux[2].l / 2 - 7, MY - 20, ROUGE, 0.9)}</g>`;
  // Ce que fait le passage en cours, sous le fichier.
  const phases = [
    [0, P1 + 0.01, DISCRET, t('La phrase et le sel refont la clé : PBKDF2, 210 000 tours, comme à l’export.', 'The passphrase and salt rebuild the key: PBKDF2, 210,000 rounds, as at export.')],
    [P1 + 0.01, P2, VERT, t('1er passage : chaque morceau est déchiffré, son étiquette vérifiée, puis il est jeté.', '1st pass: each chunk is decrypted, its tag checked, then dropped.')],
    [P2, REMPLACE - 0.01, ACCENT, t('2e passage : les médias entrent au coffre, donnees.json est gardé pour la fin.', '2nd pass: the media go into the vault, donnees.json is kept for the end.')],
    [REMPLACE - 0.01, RATE, BLEU, t('Seulement maintenant : les fiches sont remplacées par celles du JSON.', 'Only now: the cards are replaced by those in the JSON.')],
    [RATE, ARRET, DISCRET, t('Une autre fois, avec une phrase fausse…', 'Another time, with a wrong passphrase…')],
    [ARRET, FIN, ROUGE, t('Le premier morceau ne se déchiffre pas : arrêt net, rien n’a été écrit.', 'The first chunk does not decrypt: a hard stop, nothing was written.')],
  ];
  phases.forEach(([de, a, c, s]) => {
    corps += entre(C, de, a, `<circle cx="${K + 24}" cy="${FY + 118}" r="4" fill="${c}"/>${texte(K + 38, FY + 122.5, s, { taille: 12.5, couleur: TITRE })}`, 0.005);
  });
  // Le numéro du passage, en haut à droite du cadre.
  corps += entre(C, UN.de, P2, texte(K + FL - 20, FY + 24, t('passage 1 sur 2', 'pass 1 of 2'), { taille: 11, couleur: VERT, police: MONO, poids: 700, ancre: 'end' }), 0.004);
  corps += entre(C, P2, REMPLACE, texte(K + FL - 20, FY + 24, t('passage 2 sur 2', 'pass 2 of 2'), { taille: 11, couleur: ACCENT, police: MONO, poids: 700, ancre: 'end' }), 0.004);
  corps += texte(K + 20, FY + 24, 'bodycount-2026-09-14.bcx', { taille: 11, couleur: TEXTE, police: MONO });

  // ------------------------------------------------ le téléphone, pendant ce temps
  corps += rubrique(K, EY - 18, t('LE COFFRE', 'THE VAULT'));
  corps += rubrique(K + 420, EY - 18, t('LES FICHES', 'THE CARDS'));
  // Le coffre : les anciens fichiers, puis les nouveaux à côté, puis le ménage.
  corps += `<rect x="${K}" y="${EY}" width="400" height="140" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  corps += texte(K + 20, EY + 26, 'vault/', { taille: 12.5, couleur: TITRE, police: MONO, poids: 700 });
  const tuile = (x, y, c, n) => `<rect x="${x}" y="${y}" width="30" height="30" rx="7" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-opacity="0.55"/>
    ${icone(n, x + 7, y + 7, c)}`;
  const SUPPR = REMPLACE + 0.018;
  for (let i = 0; i < 8; i++) {
    const x = K + 20 + (i % 4) * 38, y = EY + 42 + Math.floor(i / 4) * 38;
    corps += `<g>${fondu('opacity', C, [[0, 1], [SUPPR + i * 0.002, 1], [SUPPR + i * 0.002 + 0.008, 0], [FIN, 0], [FIN + 0.01, 1], [1, 1]])}${tuile(x, y, DISCRET, i % 3 ? 'photo' : 'lecture')}</g>`;
  }
  corps += entre(C, 0, SUPPR, texte(K + 20, EY + 128, t('les anciens, encore là', 'the old ones, still there'), { taille: 11.5, couleur: DISCRET }), 0.004);
  corps += entre(C, SUPPR, FIN, texte(K + 20, EY + 128, t('les anciens, effacés à la fin', 'the old ones, deleted at the end'), { taille: 11.5, couleur: ROUGE }), 0.004);
  // Les nouveaux, un par média, qui arrivent pendant le second passage.
  // Quatre morceaux de photo font quatre photos ; six de vidéo, deux vidéos.
  const arrivees = [
    ...[3, 4, 5, 6].map((i) => [instant(DEUX, i) + 0.03, ACCENT, 'photo']),
    [instant(DEUX, 9) + 0.03, VIOLET, 'lecture'],
    [instant(DEUX, 12) + 0.03, VIOLET, 'lecture'],
  ];
  arrivees.forEach(([a, c, n], i) => {
    const [x, y] = place(i);
    corps += `<rect x="${x}" y="${y}" width="30" height="30" rx="7" fill="none" stroke="${FIL}" stroke-dasharray="3 3"/>
      <g opacity="0">${visible(C, a, FIN, 0.004)}${tuile(x, y, c, n)}</g>`;
  });
  corps += `<line x1="${K + 180}" y1="${EY + 44}" x2="${K + 180}" y2="${EY + 108}" stroke="${BORD}"/>`;
  corps += entre(C, 0, P2 + 0.03, texte(K + 196, EY + 128, t('les nouveaux, pas encore', 'the new ones, not yet'), { taille: 11.5, couleur: DISCRET }), 0.004);
  corps += entre(C, P2 + 0.03, FIN, texte(K + 196, EY + 128, t('les nouveaux, nouveaux noms', 'the new ones, new names'), { taille: 11.5, couleur: ACCENT }), 0.004);

  // Les fiches : intactes jusqu'au dernier instant.
  const FX = K + 420;
  corps += `<rect x="${FX}" y="${EY}" width="400" height="140" rx="14" fill="${CARTE}" stroke="${BORD}"/>
    <rect x="${FX}" y="${EY}" width="400" height="140" rx="14" fill="none" stroke="${VERT}" stroke-opacity="0.55" opacity="0">${visible(C, P1, REMPLACE - 0.01)}</rect>
    <rect x="${FX}" y="${EY}" width="400" height="140" rx="14" fill="none" stroke="${BLEU}" stroke-width="1.6" opacity="0">${visible(C, REMPLACE - 0.01, REMPLACE + 0.05)}</rect>
    <rect x="${FX}" y="${EY}" width="400" height="140" rx="14" fill="none" stroke="${VERT}" stroke-opacity="0.55" opacity="0">${visible(C, 0.835, FIN)}</rect>`;
  // Des visages en petit, qui changent quand les fiches sont remplacées.
  const ANCIENS = [GENS.enzo.photo, GENS.jade.photo, GENS.tom.photo, GENS.erwan.photo, GENS.chloe.photo];
  const NOUVEAUX = [GENS.noa.photo, GENS.lou.photo, GENS.enzo.photo, GENS.jade.photo, GENS.matteo.photo, GENS.gabriel.photo];
  corps += entre(C, 0, REMPLACE, ANCIENS.map((n, i) => visage(n, FX + 20 + i * 34, EY + 20, 28, 28, 14)).join(''), 0.004);
  corps += entre(C, REMPLACE, 1.2, NOUVEAUX.map((n, i) => visage(n, FX + 20 + i * 34, EY + 20, 28, 28, 14)).join(''), 0.004);
  const etat = (de, a, titre, sous, c) => entre(C, de, a, `
    ${texte(FX + 20, EY + 82, titre, { taille: 15, couleur: TITRE, poids: 700 })}
    ${texte(FX + 20, EY + 104, sous, { taille: 12.5, couleur: c })}`, 0.004);
  corps += etat(0, P1, t('12 fiches, 70 rencontres', '12 cards, 70 encounters'), t('ce que porte le téléphone aujourd’hui', 'what the phone holds today'), TEXTE);
  corps += etat(P1, REMPLACE - 0.01, t('12 fiches, 70 rencontres', '12 cards, 70 encounters'), t('intactes : la base n’a pas été touchée', 'intact: the database has not been touched'), VERT);
  corps += etat(REMPLACE - 0.01, RATE, t('18 fiches, 111 rencontres', '18 cards, 111 encounters'), t('remplacées d’un coup, puis tout est relu', 'replaced in one go, then everything reread'), BLEU);
  corps += etat(RATE, FIN, t('18 fiches, 111 rencontres', '18 cards, 111 encounters'), t('la phrase fausse n’y change rien', 'the wrong passphrase changes nothing'), VERT);
  corps += texte(FX + 20, EY + 128, t('La base n’est vidée qu’une fois tout vérifié et rangé.', 'The database is only emptied once all is checked and stored.'), { taille: 11.5, couleur: DISCRET });

  // ------------------------------------------------ si ça rate
  const RY = 492;
  corps += rubrique(K, RY - 12, t('SI ÇA RATE', 'IF IT FAILS'));
  const rates = [
    [t('Phrase fausse', 'Wrong passphrase'), t('Le premier morceau refuse :', 'The first chunk refuses:'), t('« n’ouvre pas la sauvegarde ».', '“does not open the backup”.'), ARRET],
    [t('Un octet abîmé', 'One damaged byte'), t('Son morceau refuse, au 1er', 'Its chunk refuses, on the 1st'), t('passage : « la sauvegarde est abîmée ».', 'pass: “the backup is damaged”.'), null],
    [t('Coupé en route', 'Cut off halfway'), t('Au 2e passage, les nouveaux fichiers', 'On the 2nd pass, the new vault files'), t('du coffre sont effacés, rien d’autre.', 'are deleted, nothing else.'), null],
  ];
  rates.forEach(([titre, l1, l2, allume], i) => {
    const x = K + i * 280;
    corps += `<rect x="${x}" y="${RY}" width="260" height="86" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${allume ? `<rect x="${x}" y="${RY}" width="260" height="86" rx="13" fill="none" stroke="${ROUGE}" stroke-width="1.5" opacity="0">${visible(C, allume, FIN)}</rect>` : ''}
      <rect x="${x}" y="${RY + 14}" width="3" height="58" rx="1.5" fill="${ROUGE}"/>
      ${texte(x + 20, RY + 28, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, RY + 50, l1, { taille: 12 })}
      ${texte(x + 20, RY + 68, l2, { taille: 12 })}`;
  });

  // ------------------------------------------------ deux cartes du bas
  const bas = [
    [OR, t('Le verrou attend', 'The lock waits'), t('Le sélecteur et les deux passages le retiennent : le délai ne coupe rien.', 'The picker and both passes hold it back: the delay cuts nothing off.')],
    [VERT, t('La copie privée part toujours', 'The private copy always goes'), t('Réussite ou échec, la copie du fichier reçue du sélecteur est effacée.', 'Success or failure, the copy received from the picker is deleted.')],
  ];
  bas.forEach(([c, titre, l1], i) => {
    const x = K + i * 420, y = 600;
    corps += `<rect x="${x}" y="${y}" width="400" height="76" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y + 14}" width="3" height="48" rx="1.5" fill="${c}"/>
      ${texte(x + 20, y + 30, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 54, l1, { taille: 12 })}`;
  });

  svg('restauration.svg', 1280, 720, corps, t(
    'Restaurer une sauvegarde. Dans les réglages, Restaurer une sauvegarde prévient que tout sera remplacé, mais que rien ne change tant qu’elle n’a pas été lue et vérifiée en entier. Le sélecteur du système donne le fichier, puis la phrase choisie à l’export refait la clé par PBKDF2. Le fichier est lu deux fois : au premier passage, chaque morceau est déchiffré, son étiquette vérifiée, puis il est jeté ; au second, les photos et les vidéos entrent au coffre sous de nouveaux noms, à côté des anciennes, et donnees.json est gardé pour la fin. Pendant tout ce temps, les 12 fiches du téléphone sont intactes. Seulement alors elles sont remplacées par les 18 de la sauvegarde, les anciens fichiers du coffre sont effacés, et le répertoire est relu. Une autre fois, avec une phrase fausse, le premier morceau refuse de se déchiffrer : la restauration s’arrête net et rien n’a bougé. Un octet abîmé arrête le premier passage ; une coupure au second n’efface que les nouveaux fichiers. Le verrou attend, et la copie du fichier est toujours effacée.',
    'Restoring a backup. In the settings, Restore a backup warns that everything will be replaced, but that nothing changes until it has been read and checked in full. The system picker hands over the file, then the passphrase chosen at export rebuilds the key through PBKDF2. The file is read twice: on the first pass, each chunk is decrypted, its tag checked, then dropped; on the second, the photos and videos enter the vault under new names, next to the old ones, and donnees.json is kept for the end. All that time, the 12 cards on the phone are intact. Only then are they replaced by the 18 from the backup, the old vault files deleted, and the people list reread. Another time, with a wrong passphrase, the first chunk refuses to decrypt: the restore stops dead and nothing has moved. A damaged byte stops the first pass; a cut-off during the second only deletes the new files. The lock waits, and the copy of the file is always deleted.'));
};

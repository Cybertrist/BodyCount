// Exporter une sauvegarde : du rappel en haut du répertoire au fichier
// posé dans Téléchargements.
//
// À gauche, le téléphone : le rappel, les réglages, la phrase de passe,
// l'attente, le choix d'enregistrer, le sélecteur du système. À droite, la
// clé qui sort de la phrase (PBKDF2), le fichier BCEX2 qui s'écrit morceau
// par morceau (lib/utils/export_helper.dart), où il va, et le rappel qui
// se tait (lib/providers/settings_provider.dart). La relecture est l'affaire
// de restauration.svg, le détail des octets celle de formats.png.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, paliers, fondu, visible, entre, telephone, toucher, icone, logo, frappe,
    cartePersonne, barreNav, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU } = O;
  const C = 32;
  // Les écrans du téléphone, dans l'ordre.
  const REGLAGES = 0.16, PHRASE = 0.27, ATTENTE = 0.405, PRETE = 0.645, SELECTEUR = 0.745, FINI = 0.845, FIN = 0.975;
  let corps = entete(t('LA SAUVEGARDE', 'THE BACKUP'),
    t('Un fichier chiffré par ta phrase de passe, pas par le téléphone : il se relit sur un autre.',
      'A file encrypted with your passphrase, not the phone: it can be read on another one.'));

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // 1. Le répertoire, et le rappel en haut.
  const gens = [GENS.noa, GENS.lou, GENS.enzo, GENS.jade];
  let rep = texte(SX + 18, SY + 44, t('RÉPERTOIRE', 'PEOPLE'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' });
  rep += `<rect x="${SX + 12}" y="${SY + 62}" width="${SL - 24}" height="118" rx="18" fill="${APP.violet}" fill-opacity="0.16" stroke="${APP.violet}" stroke-opacity="0.35"/>
    <circle cx="${SX + 38}" cy="${SY + 92}" r="15" fill="${APP.violet}" fill-opacity="0.22"/>
    ${icone('telecharger', SX + 30, SY + 84, APP.rose)}
    ${texte(SX + 62, SY + 88, t('Dernière sauvegarde', 'Last backup'), { taille: 12, couleur: APP.texte, poids: 700 })}
    ${texte(SX + 62, SY + 104, t('il y a 38 jours', '38 days ago'), { taille: 12, couleur: APP.texte, poids: 700 })}
    ${texte(SX + 24, SY + 128, t('Perdre le téléphone, c’est perdre', 'Losing the phone means losing'), { taille: 10.5, couleur: APP.second })}
    ${texte(SX + 24, SY + 142, t('ce qui n’a pas été exporté.', 'whatever was not exported.'), { taille: 10.5, couleur: APP.second })}
    ${icone('croix', SX + SL - 38, SY + 76, APP.discret, 0.7)}
    <rect x="${SX + SL - 108}" y="${SY + 146}" width="84" height="26" rx="13" fill="${APP.violet}" fill-opacity="0.25"/>
    ${texte(SX + SL - 66, SY + 163, t('Sauvegarder', 'Back up'), { taille: 11, couleur: APP.rose, poids: 700, ancre: 'middle' })}
    ${toucher(SX + SL - 66, SY + 159, C, 0.12)}`;
  const CL = (SL - 36) / 2;
  gens.forEach((p, i) => {
    rep += cartePersonne(p, SX + 12 + (i % 2) * (CL + 12), SY + 194 + Math.floor(i / 2) * 162, CL, 150, { premier: i === 0 });
  });
  rep += barreNav(T, 'Fiches');
  ecran += entre(C, 0, REGLAGES, rep, 0.006);

  // Les réglages, section Données. [derniere] : le sous-titre de l'export.
  const ligne = (y, ic, couleurIc, titre, sous, valeur = '') => `
    <rect x="${SX + 26}" y="${y + 14}" width="28" height="28" rx="8" fill="${couleurIc}" fill-opacity="0.14"/>
    ${icone(ic, SX + 32, y + 20, couleurIc)}
    ${texte(SX + 64, y + 26, titre, { taille: 12, couleur: APP.texte, poids: 600 })}
    ${sous}
    ${valeur ? texte(SX + SL - 26, y + 34, valeur, { taille: 9.5, couleur: APP.second, poids: 700, ancre: 'end', extra: 'letter-spacing="0.8"' }) : ''}`;
  const sous = (y, s) => texte(SX + 64, y + 42, s, { taille: 9.5, couleur: APP.discret });
  const reglages = (derniere) => `
    ${texte(SX + 20, SY + 48, '‹', { taille: 24, couleur: APP.texte })}
    ${texte(SX + 44, SY + 48, t('Réglages', 'Settings'), { taille: 21, couleur: APP.texte, poids: 800 })}
    <rect x="${SX + 12}" y="${SY + 70}" width="${SL - 24}" height="64" rx="18" fill="${APP.violet}" fill-opacity="0.12" stroke="${APP.bord}"/>
    ${logo(SX + 44, SY + 102, 38)}
    ${texte(SX + 74, SY + 99, t('18 Personnes', '18 People'), { taille: 14, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 74, SY + 116, t('111 Rencontres', '111 Encounters'), { taille: 10.5, couleur: APP.second, poids: 600 })}
    ${texte(SX + 20, SY + 166, t('DONNÉES', 'DATA'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.5"' })}
    <rect x="${SX + 12}" y="${SY + 178}" width="${SL - 24}" height="186" rx="18" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${ligne(SY + 182, 'shield', APP.vert, t('Tout reste sur ce téléphone', 'Everything stays on this phone'), sous(SY + 182, t('Base chiffrée, aucun compte', 'Encrypted database, no account')))}
    <line x1="${SX + 12}" y1="${SY + 240}" x2="${SX + SL - 12}" y2="${SY + 240}" stroke="${APP.bord}"/>
    ${ligne(SY + 242, 'ios_share', APP.rose, t('Exporter, chiffré', 'Export, encrypted'), derniere, t('Phrase', 'Passphrase'))}
    <line x1="${SX + 12}" y1="${SY + 302}" x2="${SX + SL - 12}" y2="${SY + 302}" stroke="${APP.bord}"/>
    ${ligne(SY + 304, 'settings_backup_restore', APP.rose, t('Restaurer une sauvegarde', 'Restore a backup'), sous(SY + 304, t('Remplace ce qui est ici', 'Replaces what is here')), '.bcx')}`;

  // 2. Les réglages, avant l'export, et le toucher sur Exporter.
  ecran += entre(C, REGLAGES, PHRASE, reglages(sous(SY + 242, t('Dernière il y a 38 jours', 'Last one 38 days ago'))) +
    toucher(SX + 130, SY + 272, C, 0.235), 0.006);

  // 3. La phrase de passe, par-dessus les réglages assombris.
  const PHRASE_DE = 0.29, PHRASE_A = 0.35;
  ecran += entre(C, PHRASE, ATTENTE, `${reglages(sous(SY + 242, t('Dernière il y a 38 jours', 'Last one 38 days ago')))}
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.62"/>
    <rect x="${SX + 16}" y="${SY + 150}" width="${SL - 32}" height="236" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
    ${texte(SX + 38, SY + 190, t('Phrase de passe', 'Passphrase'), { taille: 17, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 38, SY + 216, t('Elle protège la sauvegarde, et elle', 'It protects the backup, and it alone'), { taille: 10.5, couleur: APP.second })}
    ${texte(SX + 38, SY + 231, t('seule permettra de la relire. Personne', 'will let you read it again. Nobody'), { taille: 10.5, couleur: APP.second })}
    ${texte(SX + 38, SY + 246, t('ne peut la retrouver à ta place.', 'can recover it for you.'), { taille: 10.5, couleur: APP.second })}
    ${entre(C, 0, PHRASE_DE, texte(SX + 40, SY + 286, t('Au moins 8 caractères', 'At least 8 characters'), { taille: 11.5, couleur: APP.discret }), 0.003)}
    ${frappe(SX + 40, SY + 287, '••••••••••••••', C, PHRASE_DE, PHRASE_A, { taille: 15, couleur: APP.texte })}
    <line x1="${SX + 38}" y1="${SY + 298}" x2="${SX + SL - 38}" y2="${SY + 298}" stroke="${APP.violet}" stroke-width="2"/>
    ${texte(SX + SL - 118, SY + 350, t('Annuler', 'Cancel'), { taille: 12, couleur: APP.second, poids: 700, ancre: 'middle' })}
    ${texte(SX + SL - 52, SY + 350, t('Exporter', 'Export'), { taille: 12, couleur: APP.rose, poids: 700, ancre: 'middle' })}
    ${toucher(SX + SL - 52, SY + 346, C, 0.385)}`, 0.006);

  // 4. L'attente : le fichier s'écrit, les médias défilent.
  const MEDIAS = [0.49, 0.515, 0.54, 0.565, 0.59, 0.615];
  let compte = entre(C, ATTENTE, MEDIAS[0], texte(SX + 66, SY + 309.5, t('Chiffrement de la sauvegarde…', 'Encrypting the backup…'), { taille: 10.5, couleur: APP.texte }), 0.003);
  MEDIAS.forEach((a, i) => {
    const fait = [4, 11, 18, 26, 33, 40][i];
    const b = MEDIAS[i + 1] || PRETE;
    compte += entre(C, a, b, texte(SX + 66, SY + 301, t('Chiffrement des médias,', 'Encrypting media,'), { taille: 10.5, couleur: APP.texte }) + texte(SX + 66, SY + 317, t(`${fait} sur 40…`, `${fait} of 40…`), { taille: 10.5, couleur: APP.second, police: MONO }), 0.002);
  });
  ecran += entre(C, ATTENTE, PRETE, `${reglages(sous(SY + 242, t('Dernière il y a 38 jours', 'Last one 38 days ago')))}
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.62"/>
    <rect x="${SX + 16}" y="${SY + 270}" width="${SL - 32}" height="70" rx="20" fill="${APP.surface}" stroke="${APP.bord}"/>
    <circle cx="${SX + 46}" cy="${SY + 305}" r="11" fill="none" stroke="${APP.violet}" stroke-width="3" stroke-dasharray="44 26">
      <animateTransform attributeName="transform" type="rotate" from="0 ${SX + 46} ${SY + 305}" to="360 ${SX + 46} ${SY + 305}" dur="0.9s" repeatCount="indefinite"/></circle>
    ${compte}`, 0.006);

  // 5. Prête : enregistrer ou partager.
  const feuille = `
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.62"/>
    <rect x="${SX}" y="${SY + SH - 190}" width="${SL}" height="200" rx="22" fill="${APP.carte}"/>
    <rect x="${SX + SL / 2 - 18}" y="${SY + SH - 180}" width="36" height="4" rx="2" fill="${APP.bord}"/>
    ${texte(SX + 22, SY + SH - 150, t('Sauvegarde prête, 186 Mo', 'Backup ready, 186 MB'), { taille: 14.5, couleur: APP.texte, poids: 700 })}
    ${icone('save_alt', SX + 24, SY + SH - 122, APP.second)}
    ${texte(SX + 56, SY + SH - 116, t('Enregistrer sur le téléphone', 'Save on the phone'), { taille: 12, couleur: APP.texte, poids: 600 })}
    ${texte(SX + 56, SY + SH - 100, t('Dans le dossier de ton choix', 'In the folder of your choice'), { taille: 10, couleur: APP.discret })}
    ${icone('ios_share', SX + 24, SY + SH - 70, APP.second)}
    ${texte(SX + 56, SY + SH - 64, t('Partager', 'Share'), { taille: 12, couleur: APP.texte, poids: 600 })}
    ${texte(SX + 56, SY + SH - 48, t('Vers une autre application', 'To another app'), { taille: 10, couleur: APP.discret })}`;
  ecran += entre(C, PRETE, SELECTEUR, reglages(sous(SY + 242, t('Dernière il y a 38 jours', 'Last one 38 days ago'))) + feuille +
    toucher(SX + 130, SY + SH - 110, C, 0.715), 0.006);

  // 6. Le sélecteur du système : une autre application, le verrou attend.
  const GRIS = { fond: '#1B1D22', carte: '#262930', texte: '#E6E8EC', second: '#9AA0AA', bleu: '#8AB4F8' };
  ecran += entre(C, SELECTEUR, FINI, `
    <rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${GRIS.fond}"/>
    ${texte(SX + 20, SY + 48, '☰', { taille: 16, couleur: GRIS.second })}
    ${texte(SX + 48, SY + 48, t('Téléchargements', 'Downloads'), { taille: 16, couleur: GRIS.texte, poids: 600 })}
    ${[t('facture-août.pdf', 'invoice-aug.pdf'), 'IMG_20260914.jpg', t('billet-train.pdf', 'train-ticket.pdf')].map((f, i) => `
      ${icone('fichier', SX + 22, SY + 82 + i * 46, GRIS.second)}
      ${texte(SX + 50, SY + 94 + i * 46, f, { taille: 12, couleur: GRIS.texte })}
      <line x1="${SX + 16}" y1="${SY + 110 + i * 46}" x2="${SX + SL - 16}" y2="${SY + 110 + i * 46}" stroke="${GRIS.carte}"/>`).join('')}
    <rect x="${SX}" y="${SY + SH - 118}" width="${SL}" height="118" fill="${GRIS.carte}"/>
    <rect x="${SX + 16}" y="${SY + SH - 102}" width="${SL - 32}" height="36" rx="8" fill="none" stroke="${GRIS.bleu}" stroke-width="1.5"/>
    ${texte(SX + 28, SY + SH - 79, 'bodycount-2026-09-26.bcx', { taille: 11.5, couleur: GRIS.texte, police: MONO })}
    <rect x="${SX + SL - 118}" y="${SY + SH - 54}" width="102" height="34" rx="17" fill="${GRIS.bleu}"/>
    ${texte(SX + SL - 67, SY + SH - 32.5, t('Enregistrer', 'Save'), { taille: 12, couleur: '#10233F', poids: 700, ancre: 'middle' })}
    ${toucher(SX + SL - 67, SY + SH - 37, C, 0.815)}`, 0.006);

  // 7. De retour : la date a changé, le rappel se tait.
  ecran += entre(C, FINI, FIN, `${reglages(texte(SX + 64, SY + 284, t('Dernière aujourd’hui', 'Last one today'), { taille: 9.5, couleur: APP.vert, poids: 700 }))}
    <rect x="${SX + 12}" y="${SY + SH - 64}" width="${SL - 24}" height="44" rx="10" fill="#2B2340"/>
    ${texte(SX + 26, SY + SH - 37, t('Sauvegarde enregistrée.', 'Backup saved.'), { taille: 12, couleur: APP.texte })}`, 0.006);
  corps += T.ecran(ecran);

  // ------------------------------------------------ la clé, tirée de la phrase
  const K = 400, KY = 108;
  corps += rubrique(K, KY, t('LA CLÉ, TIRÉE DE LA PHRASE', 'THE KEY, DRAWN FROM THE PASSPHRASE'));
  const bloc = (x, l, titre, s1, couleur, de, contenuTitre = null) => `
    <rect x="${x}" y="${KY + 18}" width="${l}" height="78" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    <rect x="${x}" y="${KY + 18}" width="${l}" height="78" rx="13" fill="none" stroke="${couleur}" stroke-width="1.5" opacity="0">${visible(C, de, FIN)}</rect>
    ${contenuTitre || texte(x + 20, KY + 52, titre, { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(x + 20, KY + 74, s1, { taille: 12 })}`;
  corps += bloc(K, 230, '', t('au moins 8 caractères, jamais gardée', 'at least 8 characters, never stored'), ACCENT, PHRASE_DE,
    entre(C, 0, PHRASE_DE, texte(K + 20, KY + 52, t('ta phrase de passe', 'your passphrase'), { taille: 14, couleur: DISCRET, police: MONO, poids: 700 }), 0.004) +
    frappe(K + 20, KY + 53, '••••••••••••••', C, PHRASE_DE, PHRASE_A, { taille: 16, couleur: TITRE, police: MONO }));
  corps += bloc(K + 280, 270, 'PBKDF2-HMAC-SHA256', t('210 000 tours, environ une seconde', '210,000 rounds, about one second'), OR, ATTENTE);
  corps += bloc(K + 600, 220, t('clé AES-256', 'AES-256 key'), t('elle chiffre tout le flux', 'it encrypts the whole stream'), VERT, ATTENTE + 0.03);
  // Le sel, tiré au hasard, entre par le bas dans PBKDF2.
  corps += `<g opacity="0">${visible(C, ATTENTE - 0.005, FIN)}
    <rect x="${K + 318}" y="${KY + 104}" width="196" height="24" rx="12" fill="${OR}" fill-opacity="0.1" stroke="${OR}" stroke-opacity="0.45"/>
    ${texte(K + 416, KY + 120.5, t('+ sel : 16 octets au hasard', '+ salt: 16 random bytes'), { taille: 11, couleur: OR, ancre: 'middle' })}
  </g>`;
  // Les fils, qui s'allument quand la phrase passe.
  const fil = (x1, x2, de) => {
    const l = x2 - x1;
    return `<line x1="${x1}" y1="${KY + 57}" x2="${x2}" y2="${KY + 57}" stroke="${FIL}" stroke-width="2"/>
      <line x1="${x1}" y1="${KY + 57}" x2="${x2}" y2="${KY + 57}" stroke="${OR}" stroke-width="2" stroke-dasharray="${l}" stroke-dashoffset="${l}">
        ${fondu('stroke-dashoffset', C, [[0, l], [de, l], [de + 0.012, 0], [FIN, 0], [FIN + 0.01, l], [1, l]])}</line>`;
  };
  corps += fil(K + 232, K + 278, ATTENTE - 0.012) + fil(K + 552, K + 598, ATTENTE + 0.018);

  // ------------------------------------------------ le fichier, écrit en flux
  const FY = 270;
  corps += rubrique(K, FY - 18, t('LE FICHIER, ÉCRIT EN FLUX', 'THE FILE, WRITTEN AS A STREAM'));
  corps += `<rect x="${K}" y="${FY}" width="820" height="150" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  // Les morceaux, de gauche à droite, avec l'instant où chacun s'écrit.
  const morceaux = [
    { l: 62, c: TEXTE, lib: 'BCEX2', a: ATTENTE + 0.012 },
    { l: 70, c: OR, lib: t('sel', 'salt'), a: ATTENTE + 0.024 },
    { l: 116, c: BLEU, lib: 'donnees.json', a: ATTENTE + 0.05, chiffre: true },
    ...[0, 1, 2, 3].map((i) => ({ l: 44, c: ACCENT, lib: '', a: MEDIAS[0] + i * 0.012, chiffre: true })),
    ...[0, 1, 2, 3, 4, 5].map((i) => ({ l: 44, c: VIOLET, lib: '', a: MEDIAS[2] + i * 0.014, chiffre: true })),
    { l: 30, c: DISCRET, lib: '0', a: PRETE - 0.012 },
  ];
  let mx = K + 18;
  const MY = FY + 22, MH = 46;
  const positions = [];
  morceaux.forEach((m) => {
    positions.push(mx);
    corps += `<rect x="${mx}" y="${MY}" width="${m.l}" height="${MH}" rx="7" fill="none" stroke="${FIL}" stroke-dasharray="3 3"/>
      <g opacity="0">${visible(C, m.a, FIN, 0.006)}
        <rect x="${mx}" y="${MY}" width="${m.l}" height="${MH}" rx="7" fill="${m.c}" fill-opacity="0.16" stroke="${m.c}" stroke-opacity="0.7"/>
        ${m.chiffre ? icone('cadenas', mx + m.l / 2 - 8, MY + (m.lib ? 7 : 15), m.c) : ''}
        ${m.lib ? texte(mx + m.l / 2, MY + (m.chiffre ? 38 : 28), m.lib, { taille: 11, couleur: m.c === TEXTE ? TITRE : m.c, police: MONO, poids: 700, ancre: 'middle' }) : ''}
      </g>`;
    mx += m.l + 5;
  });
  // Les accolades sous chaque genre d'entrée.
  const accolade = (i, j, s, c, de) => {
    const x1 = positions[i], x2 = positions[j] + morceaux[j].l;
    return `<g opacity="0">${visible(C, de, FIN, 0.006)}
      <path d="M${x1} ${MY + MH + 8} v6 H${x2} v-6" fill="none" stroke="${c}" stroke-opacity="0.6" stroke-width="1.5"/>
      ${texte((x1 + x2) / 2, MY + MH + 32, s, { taille: 11.5, couleur: c, ancre: 'middle', poids: 700 })}
    </g>`;
  };
  corps += accolade(0, 1, t('en clair', 'plain'), TEXTE, ATTENTE + 0.024);
  corps += accolade(2, 2, t('les fiches', 'the cards'), BLEU, ATTENTE + 0.05);
  corps += accolade(3, 6, t('une photo', 'a photo'), ACCENT, MEDIAS[0] + 0.036);
  corps += accolade(7, 12, t('une vidéo, 1 Mo par morceau', 'a video, 1 MB a chunk'), VIOLET, MEDIAS[2] + 0.07);
  corps += accolade(13, 13, t('fin', 'end'), DISCRET, PRETE - 0.012);
  // Ce qui est en train de s'écrire.
  const legendes = [
    [ATTENTE + 0.05, MEDIAS[0], BLEU, t('donnees.json d’abord : les 18 fiches, leurs rencontres, notes et étiquettes.', 'donnees.json first: the 18 cards, their encounters, notes and tags.')],
    [MEDIAS[0], MEDIAS[2], ACCENT, t('Chaque photo sort du coffre déchiffrée et rentre aussitôt, rechiffrée, dans le flux.', 'Each photo leaves the vault decrypted and goes straight back in, re-encrypted, into the stream.')],
    [MEDIAS[2], PRETE - 0.012, VIOLET, t('Une vidéo ne tient jamais en mémoire d’un bloc : elle passe morceau par morceau.', 'A video never sits in memory in one piece: it goes through chunk by chunk.')],
    [PRETE - 0.012, FIN, TEXTE, t('Un octet nul ferme le fichier. Rien n’a touché le disque en clair.', 'A single zero byte closes the file. Nothing touched the disk in the clear.')],
  ];
  legendes.forEach(([de, a, c, s]) => {
    corps += entre(C, de, a, `<circle cx="${K + 24}" cy="${FY + 128}" r="4" fill="${c}"/>${texte(K + 38, FY + 132.5, s, { taille: 12.5, couleur: TITRE })}`, 0.006);
  });
  corps += entre(C, 0, ATTENTE + 0.05, texte(K + 24, FY + 132.5, t('Le fichier s’écrit dans le cache privé de l’appli, jamais ailleurs en clair.', 'The file is written into the app’s private cache, never anywhere else in the clear.'), { taille: 12.5, couleur: DISCRET }), 0.006);

  // ------------------------------------------------ où il va, et le rappel
  const BY = 452;
  corps += rubrique(K, BY - 8, t('OÙ IL VA', 'WHERE IT GOES'));
  corps += `<rect x="${K}" y="${BY + 8}" width="400" height="116" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const etapes = [
    [0, t('cache/sauvegardes/', 'cache/sauvegardes/'), t('le temps de choisir', 'while you choose'), TEXTE, PRETE],
    [1, t('Téléchargements', 'Downloads'), t('par le sélecteur du système', 'through the system picker'), BLEU, 0.82],
    [2, t('copie du cache', 'cache copy'), t('effacée derrière', 'deleted afterwards'), ROUGE, FINI + 0.01],
  ];
  etapes.forEach(([i, titre, s, c, de]) => {
    const y = BY + 36 + i * 32;
    corps += `<circle cx="${K + 26}" cy="${y - 4}" r="6" fill="none" stroke="${FIL}" stroke-width="2"/>
      <g opacity="0">${visible(C, de, FIN, 0.006)}<circle cx="${K + 26}" cy="${y - 4}" r="6" fill="${c}"/></g>
      ${texte(K + 42, y, titre, { taille: 12.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(K + 226, y, s, { taille: 12 })}`;
  });

  const RX = K + 420;
  corps += rubrique(RX, BY - 8, t('LE RAPPEL', 'THE REMINDER'));
  corps += `<rect x="${RX}" y="${BY + 8}" width="400" height="116" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  // Une frise de 40 jours : la dernière sauvegarde, puis 30 jours de calme.
  const FX = RX + 20, FL = 360, FYY = BY + 62;
  const jour = (j) => FX + (FL * j) / 40;
  corps += `<line x1="${FX}" y1="${FYY}" x2="${FX + FL}" y2="${FYY}" stroke="${FIL}" stroke-width="3" stroke-linecap="round"/>
    <line x1="${jour(30)}" y1="${FYY - 9}" x2="${jour(30)}" y2="${FYY + 9}" stroke="${OR}" stroke-width="2"/>
    ${texte(jour(30), FYY + 22, t('30 jours', '30 days'), { taille: 11, couleur: OR, police: MONO, ancre: 'middle' })}`;
  // Avant : 38 jours sans sauvegarde, le rappel parle.
  corps += entre(C, 0, FINI + 0.01, `
    <line x1="${FX}" y1="${FYY}" x2="${jour(38)}" y2="${FYY}" stroke="${ACCENT}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${jour(38)}" cy="${FYY}" r="6" fill="${ACCENT}"/>
    ${texte(FX, FYY + 22, t('il y a 38 jours', '38 days ago'), { taille: 11, couleur: TEXTE, police: MONO })}
    ${texte(RX + 20, BY + 38, t('Plus d’un mois : le bandeau s’affiche.', 'Over a month: the banner shows up.'), { taille: 13, couleur: TITRE, poids: 700 })}`, 0.006);
  // Après : aujourd'hui, le rappel se tait pour un mois.
  corps += entre(C, FINI + 0.01, FIN, `
    <circle cx="${FX}" cy="${FYY}" r="6" fill="${VERT}"/>
    ${texte(FX, FYY + 22, t('aujourd’hui', 'today'), { taille: 11, couleur: VERT, police: MONO })}
    ${texte(RX + 20, BY + 38, t('Date notée : plus un mot pendant 30 jours.', 'Date noted: not a word for 30 days.'), { taille: 13, couleur: TITRE, poids: 700 })}`, 0.006);
  corps += texte(RX + 20, BY + 112, t('« Plus tard » le fait taire une semaine.', '“Later” silences it for a week.'), { taille: 12 });

  // ------------------------------------------------ trois cartes du bas
  const bas = [
    [OR, t('Le verrou attend', 'The lock waits'),
      t('Pendant l’export et le sélecteur,', 'During the export and the picker,'), t('le délai ne coupe rien.', 'the delay cuts nothing off.')],
    [ACCENT, t('Une phrase, pas le téléphone', 'A passphrase, not the phone'),
      t('Chiffrée par la clé de l’appareil, elle', 'Encrypted with the device key, it'), t('mourrait avec lui. Là, elle voyage.', 'would die with it. This one travels.')],
    [VERT, t('La relire', 'Reading it back'),
      t('La restauration la vérifie en entier', 'A restore checks all of it'), t('avant de toucher à quoi que ce soit.', 'before touching anything at all.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = K + i * 280, y = 594;
    corps += `<rect x="${x}" y="${y}" width="260" height="92" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(x + 20, y + 30, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 53, l1, { taille: 12 })}
      ${texte(x + 20, y + 71, l2, { taille: 12 })}`;
  });

  svg('sauvegarde.svg', 1280, 720, corps, t(
    'Exporter une sauvegarde. Le répertoire rappelle que la dernière date de 38 jours ; Sauvegarder mène aux réglages, puis à Exporter, chiffré. La phrase de passe, huit caractères au moins, passe par PBKDF2-HMAC-SHA256 en 210 000 tours avec un sel de 16 octets tiré au hasard, et donne une clé AES-256. Le fichier s’écrit en flux dans le cache privé : la marque BCEX2 et le sel en clair, puis donnees.json avec les fiches, puis chaque photo et chaque vidéo, sorties du coffre et rechiffrées aussitôt par morceaux d’un mégaoctet, et un octet nul pour finir. Sauvegarde prête : on l’enregistre dans Téléchargements par le sélecteur du système, la copie du cache est effacée, et la date notée fait taire le rappel pendant 30 jours. « Plus tard » le fait taire une semaine. Le verrou attend pendant l’export, et la restauration vérifie tout avant de toucher à quoi que ce soit.',
    'Exporting a backup. The people list reminds you the last one is 38 days old; Back up leads to the settings, then to Export, encrypted. The passphrase, at least eight characters, goes through PBKDF2-HMAC-SHA256 for 210,000 rounds with a random 16-byte salt, and yields an AES-256 key. The file is written as a stream into the private cache: the BCEX2 mark and the salt in the clear, then donnees.json with the cards, then each photo and each video, taken out of the vault and re-encrypted straight away in one-megabyte chunks, and a single zero byte to finish. Backup ready: it is saved to Downloads through the system picker, the cache copy is deleted, and the date noted silences the reminder for 30 days. “Later” silences it for a week. The lock waits during the export, and a restore checks everything before touching anything.'));
};

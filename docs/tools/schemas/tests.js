// Les tests, qui tournent.
//
// À droite, la sortie de flutter test : chaque ligne est un test qui
// existe, avec son nom tel qu'il est écrit dans integration_test/ et
// test/, et passe au vert quand il a fini. À gauche, le téléphone de
// l'émulateur : rien à voir pendant que la base, le flux et la sauvegarde
// s'éprouvent sous le capot, puis les six parcours de ecrans_test.dart,
// joués au doigt comme le test les joue.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, visible, entre, fondu, telephone, toucher, frappe, visage, etoiles, icone,
    pastille, largeurPastille, barreNav, APP, MONO, SANS, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET,
    VERT, OR, ROUGE, BLEU, GENS } = O;
  const C = 56;
  const FIN = 0.985;
  let corps = entete(t('LES TESTS', 'THE TESTS'),
    t('Sur un émulateur, avec les vraies bibliothèques d’Android. Chaque nom ici est un test qui existe.',
      'On an emulator, with Android’s real libraries. Every name here is a test that exists.'));

  // ------------------------------------------------------------ le calendrier
  // Les dix-huit tests sans écran de bodycount_test.dart, puis les six
  // parcours de ecrans_test.dart, puis les sept tests de test/, sur la
  // machine.
  const FAMILLES = [
    { nom: t('Base', 'Database'), icone: 'base', tests: [
      'les ouvertures simultanées partagent une seule connexion',
      'une écriture se relit par toutes les lectures qui suivent',
      'une base chiffrée n\'est jamais prise pour une base en clair',
      'une base sans numéro de version est réparée, pas détruite'] },
    { nom: t('Flux chiffré', 'Encrypted stream'), icone: 'cle', tests: [
      // tailleMorceau vaut 1 Mo : [0, 10, tailleMorceau, tailleMorceau * 3 + 17].
      'aller-retour de 0 octets', 'aller-retour de 10 octets', 'aller-retour de 1048576 octets',
      'aller-retour de 3145745 octets', 'le natif et le Dart se relisent l\'un l\'autre',
      'un fichier tronqué est refusé', 'deux morceaux intervertis sont refusés', 'un octet modifié est refusé'] },
    { nom: t('Coffre des vidéos', 'Video vault'), icone: 'lecture', tests: [
      'une vidéo entre, se relit à l\'identique, et l\'original part'] },
    { nom: t('Sauvegarde', 'Backup'), icone: 'fichier', tests: [
      'tout revient : fiche, étiquettes, rencontre, photo, vidéo', 'une mauvaise phrase ne touche à rien',
      'une sauvegarde abîmée ne touche à rien', 'un fichier qui n\'est pas une sauvegarde est refusé'] },
    { nom: t('Communes', 'Communes'), icone: 'epingle', tests: ['un village, une faute, un homonyme'] },
  ];
  const ECRANS = [
    'changer la ville d’une fiche se voit dans le répertoire',
    'une étiquette filtre le répertoire',
    'la recherche trouve une étiquette',
    'la photo d’une fiche s’ouvre en grand',
    'la carte range les lieux, l’agenda montre le mois',
    'le rappel de sauvegarde se montre, puis se tait',
  ];
  const UNITAIRES = [
    'un petit village du Morbihan est sur la carte', 'un début de nom suffit',
    'une faute de frappe tombe quand même', 'un nom de ville suivi d\'une précision',
    'le département départage les homonymes', 'l\'étranger a des coordonnées, pas de place sur la carte',
    'un lieu qui n\'est pas une ville n\'en devient pas une',
  ];
  const A0 = 0.035, DA = 0.0225;           // les dix-huit sans écran
  const B0 = 0.45, DB = 0.075;             // les six parcours
  const U0 = 0.918, DU = 0.0055;           // les sept sur la machine
  const PASSE = 0.85;                      // part du créneau où le test tourne

  // ------------------------------------------------------------ le terminal
  const TX = 380, TY = 80, TL = 840, TH = 506;
  corps += `<rect x="${TX}" y="${TY}" width="${TL}" height="${TH}" rx="14" fill="#0A0D12" stroke="${BORD}"/>
    <path d="M${TX} ${TY + 34} H${TX + TL}" stroke="${BORD}"/>
    <circle cx="${TX + 20}" cy="${TY + 17}" r="5" fill="${ROUGE}" fill-opacity="0.7"/>
    <circle cx="${TX + 37}" cy="${TY + 17}" r="5" fill="${OR}" fill-opacity="0.7"/>
    <circle cx="${TX + 54}" cy="${TY + 17}" r="5" fill="${VERT}" fill-opacity="0.7"/>
    ${texte(TX + TL / 2, TY + 21.5, 'emulator-5554', { taille: 11, couleur: DISCRET, police: MONO, ancre: 'middle' })}`;
  corps += entre(C, 0, FIN, frappe(TX + 20, TY + 58, '$ flutter test integration_test -d emulator-5554', C, 0.004, 0.026,
    { taille: 12, couleur: TITRE, police: MONO, poids: 700 }), 0.004);

  const X1 = TX + 20, X2 = TX + 440, Y0 = TY + 88, PAS = 16.4;
  /// Une ligne de test : elle apparaît à [s], tourne, passe au vert à [e].
  const ligne = (x, y, nom, s, e, largeur = 400) => `<g opacity="0">${visible(C, s, FIN, 0.003)}
      <rect x="${x - 6}" y="${y - 12}" width="${largeur}" height="16" rx="4" fill="${VIOLET}" fill-opacity="0.13" opacity="0">${visible(C, s, e + 0.002, 0.002)}</rect>
      <g opacity="0">${visible(C, s, e, 0.002)}
        <circle cx="${x + 6}" cy="${y - 4}" r="4.5" fill="none" stroke="${VIOLET}" stroke-width="1.6" stroke-dasharray="18 10">
          <animateTransform attributeName="transform" type="rotate" from="0 ${x + 6} ${y - 4}" to="360 ${x + 6} ${y - 4}" dur="0.8s" repeatCount="indefinite"/></circle>
      </g>
      <g opacity="0">${visible(C, e, FIN, 0.002)}${icone('coche', x - 1, y - 12, VERT, 0.9)}</g>
      ${texte(x + 20, y, nom, { taille: 11, couleur: TEXTE })}
    </g>`;
  const titreFamille = (x, y, nom, n, s) => entre(C, s, FIN,
    texte(x, y, nom.toUpperCase(), { taille: 10.5, couleur: ACCENT, police: MONO, poids: 700, extra: 'letter-spacing="1.5"' }) +
    texte(x + nom.length * 8.2 + 16, y, String(n), { taille: 10.5, couleur: DISCRET, police: MONO }), 0.003);

  // Colonne de gauche : les dix-huit tests sans écran.
  let y = Y0, k = 0;
  const bornesFamille = [];
  for (const f of FAMILLES) {
    const s0 = A0 + k * DA;
    corps += titreFamille(X1, y, f.nom, f.tests.length, s0);
    y += PAS;
    for (const nom of f.tests) {
      const s = A0 + k * DA;
      corps += ligne(X1, y, nom, s, s + DA * PASSE);
      y += PAS;
      k++;
    }
    bornesFamille.push([s0, A0 + k * DA, f]);
    y += 5;
  }
  // Colonne de droite : les six parcours d'écran.
  let y2 = Y0;
  corps += titreFamille(X2, y2, t('Parcours d’écrans', 'Screen journeys'), ECRANS.length, B0);
  y2 += PAS;
  ECRANS.forEach((nom, i) => {
    const s = B0 + i * DB;
    corps += ligne(X2, y2, nom, s, s + DB * PASSE, 384);
    y2 += PAS;
  });
  // Puis les tests de test/, sur la machine, sans émulateur.
  y2 += 14;
  corps += entre(C, U0 - 0.014, FIN, frappe(X2, y2, '$ flutter test test/', C, U0 - 0.014, U0 - 0.004,
    { taille: 12, couleur: TITRE, police: MONO, poids: 700 }), 0.003);
  y2 += PAS + 6;
  corps += titreFamille(X2, y2, t('Sur la machine', 'On the machine'), UNITAIRES.length, U0);
  y2 += PAS;
  UNITAIRES.forEach((nom, i) => {
    const s = U0 + i * DU;
    corps += ligne(X2, y2, nom, s, s + DU * PASSE, 384);
    y2 += PAS;
  });

  // Le compteur : un nombre par palier, de 0 à 24.
  const fins = [...Array(18)].map((_, i) => A0 + i * DA + DA * PASSE)
    .concat(ECRANS.map((_, i) => B0 + i * DB + DB * PASSE));
  const KX = X2, KY = TY + TH - 78;
  corps += `<path d="M${KX - 6} ${KY - 34} H${TX + TL - 20}" stroke="${BORD}"/>`;
  for (let n = 0; n <= 24; n++) {
    const de = n === 0 ? 0 : fins[n - 1], a = n === 24 ? FIN : fins[n];
    corps += entre(C, de, a, texte(KX, KY + 4, `+${n}`, { taille: 34, couleur: n === 24 ? VERT : TITRE, police: MONO, poids: 800 }), 0.001);
  }
  corps += texte(KX + 96, KY - 8, t('passés sur l’émulateur', 'passed on the emulator'), { taille: 12.5, couleur: TITRE, poids: 700 });
  corps += texte(KX + 96, KY + 10, t('sur 24, avec SQLCipher et le Keystore', 'out of 24, with SQLCipher and the Keystore'), { taille: 11.5 });
  corps += entre(C, fins[23] + 0.004, FIN,
    texte(KX, KY + 36, '+24: All tests passed!', { taille: 12, couleur: VERT, police: MONO, poids: 700 }), 0.003);
  corps += entre(C, U0 + 7 * DU, FIN,
    texte(KX + 210, KY + 36, '+7: All tests passed!', { taille: 12, couleur: VERT, police: MONO, poids: 700 }), 0.003);

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 80, 280, 560);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  const CX = SX + SL / 2;

  // ---- ce qu'il faut pour dessiner les écrans du test
  // Les fiches du test n'ont ni rencontre ni note : « jamais », sans étoiles.
  const CL = (SL - 36) / 2, CH = 150;
  const cellule = (i) => [SX + 12 + (i % 2) * (CL + 12), SY + 112 + Math.floor(i / 2) * (CH + 12)];
  const carteTest = (p, x, y) => {
    const photo = p.violet
      ? `<rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="14" fill="#A855F7"/>`
      : visage(p.photo, x, y, CL, CH, 14);
    return `${photo}
      <rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="14" fill="url(#voile)"/>
      <rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.07"/>
      <rect x="${x + 8}" y="${y + 8}" width="${t('jamais', 'never').length * 5.6 + 14}" height="17" rx="8.5" fill="${APP.fond}" fill-opacity="0.56"/>
      ${texte(x + 15, y + 20, t('jamais', 'never'), { taille: 9, couleur: '#E9DEFF', poids: 700 })}
      ${texte(x + 9, y + CH - (p.ville ? 24 : 12), p.prenom, { taille: 14, couleur: '#FFFFFF', poids: 800 })}
      ${p.ville ? `${icone('epingle', x + 8, y + CH - 16, '#C9BBE0', 0.55)}${texte(x + 19, y + CH - 8, p.ville, { taille: 8.5, couleur: '#C9BBE0', poids: 600 })}` : ''}`;
  };
  const haut = (recherche = '') => `${texte(SX + 18, SY + 44, t('RÉPERTOIRE', 'PEOPLE'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
    <rect x="${SX + 128}" y="${SY + 26}" width="${SL - 146}" height="28" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${icone('loupe', SX + 138, SY + 33, APP.second, 0.8)}
    ${recherche || texte(SX + 156, SY + 44.5, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 10, couleur: APP.discret })}`;
  /// La rangée de pastilles, qui peut glisser de côté.
  const rangee = (extra, { actif = t('Récents', 'Recent'), decale = null, plein = null } = {}) => {
    const noms = [t('Récents', 'Recent'), t('Mieux notés', 'Top rated'), t('Plus vues', 'Most seen'), t('A à Z', 'A to Z'), ...extra];
    let x = SX + 12, s = '';
    const pos = {};
    noms.forEach((n) => {
      const l = largeurPastille(n, 10);
      pos[n] = x;
      s += pastille(x, SY + 70, n, { plein: n === actif, taille: 10 });
      if (plein && n === plein[0]) s += `<g opacity="0">${visible(C, plein[1], plein[2], 0.002)}${pastille(x, SY + 70, n, { plein: true, taille: 10 })}</g>`;
      x += l + 6;
    });
    const c = O.id('rangee');
    return { pos, svg: `<clipPath id="${c}"><rect x="${SX}" y="${SY + 64}" width="${SL}" height="34"/></clipPath>
      <g clip-path="url(#${c})"><g>${decale || ''}${s}</g></g>` };
  };
  const repertoire = (gens, opts = {}) => `${haut(opts.recherche)}${(opts.rangee || rangee([])).svg}
    ${gens.map((p, i) => carteTest(p, ...cellule(i))).join('')}${barreNav(T, opts.nav || 'Fiches')}`;
  const b = (i, f) => B0 + i * DB + f * DB; // un instant dans le créneau du parcours i

  // ---- les dix-huit tests sans écran
  // bodycount_test.dart n'affiche rien : ce sont des test(), pas des
  // testWidgets(). Le téléphone montre donc, famille par famille, l'écran
  // de l'appli que chaque test garantit, et le dit sous le cadre.
  const [BASE, FLUX, COFFRE, SAUVE, COMMUNES] = bornesFamille.map(([de, a]) => [de, a]);
  const debutTest = (i) => A0 + i * DA; // l'instant où le i-ème test sans écran démarre
  const spinner = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${APP.violet}" stroke-width="2.6" stroke-dasharray="${r * 3.3} ${r * 2.2}">
      <animateTransform attributeName="transform" type="rotate" from="0 ${x} ${y}" to="360 ${x} ${y}" dur="0.9s" repeatCount="indefinite"/></circle>`;
  const retour = (titre) => `<path d="M${SX + 24} ${SY + 38} l-7 7 l7 7" fill="none" stroke="${APP.texte}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(SX + 44, SY + 51, titre, { taille: 17, couleur: APP.texte, poids: 800 })}`;

  // Base : le répertoire s'ouvre, les fiches arrivent par la même connexion,
  // puis une écriture (Enzo, une rencontre de plus) se relit aussitôt.
  {
    const gens = [GENS.noa, GENS.lou, GENS.enzo, GENS.jade];
    const [de, a] = [0.012, BASE[1]];
    const ecrit = debutTest(1) + DA * 0.6;
    let s = `${texte(SX + 18, SY + 44, t('RÉPERTOIRE', 'PEOPLE'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
      <rect x="${SX + 128}" y="${SY + 26}" width="${SL - 146}" height="28" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${icone('loupe', SX + 138, SY + 33, APP.second, 0.8)}
      ${texte(SX + 156, SY + 44.5, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 10, couleur: APP.discret })}
      ${rangee([]).svg}`;
    gens.forEach((p, i) => {
      const [x, y] = cellule(i);
      const arrive = BASE[0] + 0.004 + i * 0.005;
      if (p === GENS.enzo) {
        s += entre(C, arrive, ecrit, O.cartePersonne(p, x, y, CL, CH), 0.003);
        s += entre(C, ecrit, a, O.cartePersonne({ ...p, fois: 8 }, x, y, CL, CH) +
          `<rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="14" fill="none" stroke="${VERT}" stroke-width="2" opacity="0">${visible(C, ecrit, ecrit + 0.02, 0.003)}</rect>`, 0.003);
      } else {
        s += entre(C, arrive, a, O.cartePersonne(p, x, y, CL, CH, { premier: i === 0 }), 0.003);
      }
      // Avant l'ouverture, la place de la carte, vide.
      s += entre(C, de, arrive, `<rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>`, 0.003);
    });
    s += barreNav(T, 'Fiches');
    ecran += entre(C, de, a, s, 0.004);
  }

  // Flux chiffré : la vidéo d'Enzo entre au coffre un mégaoctet à la fois
  // pendant les allers-retours, se relit dans la visionneuse (le natif et
  // le Dart), puis chaque attaque finit sur « Vidéo illisible ».
  {
    const [de, a] = FLUX;
    const lecture = debutTest(8), attaques = [debutTest(9), debutTest(10), debutTest(11)];
    ecran += entre(C, de, lecture, `${retour(t('Photos et vidéos', 'Photos and videos'))}
      ${visage(12, SX + 18, SY + 90, SL - 36, 190, 16)}
      <rect x="${SX + 18}" y="${SY + 90}" width="${SL - 36}" height="190" rx="16" fill="#000000" fill-opacity="0.25"/>
      <circle cx="${CX}" cy="${SY + 185}" r="20" fill="#000000" fill-opacity="0.45" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="1.5"/>
      <path d="M${CX - 6} ${SY + 176} L${CX + 10} ${SY + 185} L${CX - 6} ${SY + 194} Z" fill="#FFFFFF"/>
      ${texte(SX + SL - 30, SY + 270, '0:42', { taille: 11, couleur: '#FFFFFF', poids: 700, ancre: 'end' })}
      <rect x="${SX + 18}" y="${SY + 310}" width="${SL - 36}" height="92" rx="16" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${spinner(SX + 42, SY + 338, 8)}
      ${texte(SX + 60, SY + 342, t('Chiffrement de la vidéo, 1 sur 1…', 'Encrypting the video, 1 of 1…'), { taille: 11, couleur: APP.texte, poids: 600 })}
      <rect x="${SX + 36}" y="${SY + 366}" width="${SL - 72}" height="6" rx="3" fill="${APP.bord}"/>
      <rect x="${SX + 36}" y="${SY + 366}" height="6" rx="3" width="0" fill="url(#marque)">${fondu('width', C, [[0, 0], [de, 0], [lecture - 0.004, SL - 72], [1, SL - 72]])}</rect>
      ${texte(SX + 36, SY + 390, t('un mégaoctet à la fois', 'one megabyte at a time'), { taille: 10, couleur: APP.discret })}
      ${toucher(CX, SY + 185, C, lecture - 0.006)}`, 0.004);
    // La visionneuse.
    const noir = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
      ${icone('croix', SX + 18, SY + 36, '#FFFFFF', 0.9)}
      ${texte(CX, SY + 48, '1 / 1', { taille: 12.5, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
      ${icone('telecharger', SX + SL - 44, SY + 36, '#FFFFFF', 0.9)}`;
    const dechiffre = `${spinner(CX, SY + SH / 2 - 16, 13)}
      ${texte(CX, SY + SH / 2 + 20, t('Déchiffrement…', 'Decrypting…'), { taille: 12.5, couleur: APP.second, ancre: 'middle' })}`;
    const illisible = `<g transform="translate(${CX - 17} ${SY + SH / 2 - 36})">
        <rect x="2" y="8" width="22" height="18" rx="3" fill="none" stroke="${APP.discret}" stroke-width="2.2"/>
        <path d="M24 14 L32 9 V25 L24 20" fill="none" stroke="${APP.discret}" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M0 2 L34 32" stroke="${APP.discret}" stroke-width="2.4" stroke-linecap="round"/></g>
      ${texte(CX, SY + SH / 2 + 20, t('Vidéo illisible', 'Unreadable video'), { taille: 13, couleur: APP.second, ancre: 'middle' })}`;
    const lu = lecture + DA * 0.3;
    let v = noir + entre(C, lecture, lu, dechiffre, 0.002);
    v += entre(C, lu, attaques[0], `${visage(12, SX, SY + SH / 2 - 120, SL, 220, 0)}
      ${texte(SX + 16, SY + SH - 40, '0:03', { taille: 10.5, couleur: '#FFFFFF' })}
      ${texte(SX + SL - 16, SY + SH - 40, '0:42', { taille: 10.5, couleur: '#FFFFFF', ancre: 'end' })}
      <rect x="${SX + 50}" y="${SY + SH - 45}" width="${SL - 100}" height="3" rx="1.5" fill="#FFFFFF" fill-opacity="0.25"/>
      <rect x="${SX + 50}" y="${SY + SH - 45}" height="3" rx="1.5" width="0" fill="${APP.violet}">${fondu('width', C, [[0, 0], [lu, 0], [attaques[0], (SL - 100) * 0.3], [1, (SL - 100) * 0.3]])}</rect>`, 0.002);
    attaques.forEach((x, i) => {
      const fin = i < 2 ? attaques[i + 1] : a;
      const m = x + DA * 0.35;
      v += entre(C, x, m, dechiffre, 0.002);
      v += entre(C, m, fin, illisible, 0.002);
    });
    ecran += entre(C, lecture, a, v, 0.003);
  }

  // Coffre des vidéos : la vidéo arrive dans la galerie d'Enzo, chiffrée.
  {
    const [de, a] = COFFRE;
    const cote = (SL - 48) / 3;
    const vignette = (i, n, video, dure) => {
      const x = SX + 12 + i * (cote + 12), y = SY + 96;
      return `${visage(n, x, y, cote, cote, 12)}${video ? `<circle cx="${x + cote / 2}" cy="${y + cote / 2}" r="13" fill="#000000" fill-opacity="0.5" stroke="#FFFFFF" stroke-opacity="0.9"/>
        <path d="M${x + cote / 2 - 4} ${y + cote / 2 - 6} L${x + cote / 2 + 7} ${y + cote / 2} L${x + cote / 2 - 4} ${y + cote / 2 + 6} Z" fill="#FFFFFF"/>
        ${texte(x + cote - 6, y + cote - 7, dure, { taille: 9.5, couleur: '#FFFFFF', poids: 700, ancre: 'end' })}` : ''}`;
    };
    ecran += entre(C, de, a, `${retour(t('Photos et vidéos', 'Photos and videos'))}
      ${vignette(0, 12, false)}${vignette(1, 12, true, '0:10')}
      ${entre(C, de + DA * 0.45, 1, vignette(2, 12, true, '0:42'), 0.002)}
      <rect x="${SX + 12}" y="${SY + 96 + cote + 20}" width="${SL - 24}" height="54" rx="16" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${entre(C, 0, de + DA * 0.45, `${spinner(SX + 36, SY + 96 + cote + 47, 8)}${texte(SX + 54, SY + 96 + cote + 51, t('Chiffrement de la vidéo, 1 sur 1…', 'Encrypting the video, 1 of 1…'), { taille: 11, couleur: APP.texte, poids: 600 })}`, 0.002)}
      ${entre(C, de + DA * 0.45, 1, `${icone('coche', SX + 28, SY + 96 + cote + 39, APP.vert, 1)}${texte(SX + 54, SY + 96 + cote + 51, t('Au coffre. L’original est effacé.', 'In the vault. The original is gone.'), { taille: 11, couleur: APP.texte, poids: 600 })}`, 0.002)}
      <rect x="${SX + SL - 118}" y="${SY + SH - 66}" width="104" height="40" rx="14" fill="${APP.violet}" fill-opacity="0.22" stroke="${APP.violet}" stroke-opacity="0.45"/>
      ${icone('photo', SX + SL - 106, SY + SH - 54, APP.texte, 1)}
      ${texte(SX + SL - 84, SY + SH - 41, t('Ajouter', 'Add'), { taille: 12, couleur: APP.texte, poids: 700 })}`, 0.004);
  }

  // Sauvegarde : l'export, la restauration qui ramène tout, puis trois
  // refus qui ne touchent à rien.
  {
    const [de, a] = SAUVE;
    const ligneReglage = (y, ic, couleurIc, titre, sous, valeur) => `
      <rect x="${SX + 26}" y="${y + 14}" width="28" height="28" rx="9" fill="${couleurIc}" fill-opacity="0.14"/>
      ${icone(ic, SX + 32, y + 20, couleurIc)}
      ${texte(SX + 64, y + 26, titre, { taille: 12, couleur: APP.texte, poids: 600 })}
      ${texte(SX + 64, y + 42, sous, { taille: 9.5, couleur: APP.discret })}
      ${valeur ? texte(SX + SL - 26, y + 34, valeur, { taille: 9.5, couleur: APP.second, poids: 700, ancre: 'end' }) : ''}`;
    const reglages = () => `${texte(SX + 20, SY + 48, '‹', { taille: 24, couleur: APP.texte })}
      ${texte(SX + 44, SY + 48, t('Réglages', 'Settings'), { taille: 21, couleur: APP.texte, poids: 800 })}
      <rect x="${SX + 12}" y="${SY + 70}" width="${SL - 24}" height="64" rx="18" fill="${APP.violet}" fill-opacity="0.12" stroke="${APP.bord}"/>
      ${O.logo(SX + 44, SY + 102, 38)}
      ${texte(SX + 74, SY + 99, t('18 Personnes', '18 People'), { taille: 14, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 74, SY + 116, t('111 Rencontres', '111 Encounters'), { taille: 10.5, couleur: APP.second, poids: 600 })}
      ${texte(SX + 20, SY + 166, t('DONNÉES', 'DATA'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.5"' })}
      <rect x="${SX + 12}" y="${SY + 178}" width="${SL - 24}" height="186" rx="18" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${ligneReglage(SY + 182, 'shield', APP.vert, t('Tout reste sur ce téléphone', 'Everything stays on this phone'), t('Base chiffrée, aucun compte', 'Encrypted database, no account'))}
      <line x1="${SX + 12}" y1="${SY + 240}" x2="${SX + SL - 12}" y2="${SY + 240}" stroke="${APP.bord}"/>
      ${ligneReglage(SY + 242, 'ios_share', APP.rose, t('Exporter, chiffré', 'Export, encrypted'), t('Dernière aujourd’hui', 'Last one today'), t('Phrase', 'Passphrase'))}
      <line x1="${SX + 12}" y1="${SY + 302}" x2="${SX + SL - 12}" y2="${SY + 302}" stroke="${APP.bord}"/>
      ${ligneReglage(SY + 304, 'settings_backup_restore', APP.rose, t('Restaurer une sauvegarde', 'Restore a backup'), t('Remplace ce qui est ici', 'Replaces what is here'), '.bcx')}`;
    const voile = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.62"/>`;
    const bandeau = (l1, l2, rouge) => `<rect x="${SX + 12}" y="${SY + SH - 76}" width="${SL - 24}" height="56" rx="10" fill="${rouge ? APP.rouge : '#2E2E3A'}"/>
      ${texte(SX + 26, SY + SH - 52, l1, { taille: 12, couleur: rouge ? '#2A0A0A' : '#FFFFFF', poids: 700 })}
      ${l2 ? texte(SX + 26, SY + SH - 35, l2, { taille: 12, couleur: rouge ? '#2A0A0A' : '#FFFFFF', poids: 700 }) : ''}`;
    const attente = (msg) => `${voile}<rect x="${SX + 16}" y="${SY + 270}" width="${SL - 32}" height="64" rx="20" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${spinner(SX + 44, SY + 302, 10)}${texte(SX + 64, SY + 306, msg, { taille: 11, couleur: APP.texte, poids: 600 })}`;
    const [t1, t2, t3, t4] = [0, 1, 2, 3].map((i) => debutTest(13 + i));
    const milieu = (x) => x + DA * 0.5;
    // 1. Tout revient.
    ecran += entre(C, de, milieu(t1), reglages() + attente(t('Vérification de la sauvegarde…', 'Checking the backup…')), 0.003);
    ecran += entre(C, milieu(t1), t2, reglages() + bandeau(t('Sauvegarde restaurée.', 'Backup restored.'), '', false), 0.003);
    // 2. Une mauvaise phrase.
    ecran += entre(C, t2, milieu(t2), `${reglages()}${voile}
      <rect x="${SX + 16}" y="${SY + 150}" width="${SL - 32}" height="170" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${texte(SX + 38, SY + 190, t('Phrase de passe', 'Passphrase'), { taille: 17, couleur: APP.texte, poids: 800 })}
      ${frappe(SX + 40, SY + 240, '•••••••••', C, t2 + 0.002, milieu(t2) - 0.004, { taille: 15, couleur: APP.texte })}
      <line x1="${SX + 38}" y1="${SY + 251}" x2="${SX + SL - 38}" y2="${SY + 251}" stroke="${APP.violet}" stroke-width="2"/>
      ${texte(SX + SL - 52, SY + 296, t('Restaurer', 'Restore'), { taille: 12, couleur: APP.rose, poids: 700, ancre: 'middle' })}`, 0.002);
    ecran += entre(C, milieu(t2), t3, reglages() + bandeau(t('Cette phrase de passe n’ouvre', 'This passphrase does not open'), t('pas la sauvegarde.', 'the backup.'), true), 0.002);
    // 3. Une sauvegarde abîmée.
    ecran += entre(C, t3, milieu(t3), reglages() + attente(t('Vérification de la sauvegarde…', 'Checking the backup…')), 0.002);
    ecran += entre(C, milieu(t3), t4, reglages() + bandeau(t('La sauvegarde est abîmée.', 'The backup is damaged.'), '', true), 0.002);
    // 4. Un fichier étranger.
    ecran += entre(C, t4, milieu(t4), reglages() + attente(t('Vérification de la sauvegarde…', 'Checking the backup…')), 0.002);
    ecran += entre(C, milieu(t4), a, reglages() + bandeau(t('Ce fichier n’est pas une', 'This file is not a'), t('sauvegarde BodyCount.', 'BodyCount backup.'), true), 0.002);
  }

  // Communes : « Locmariaqer » tapé avec une faute, et le point précis
  // s'ouvre quand même sur Locmariaquer, sur la vraie côte.
  {
    const [de] = COMMUNES, a = B0;
    const carteA = de + (a - de) * 0.5;
    ecran += entre(C, de, carteA, `${icone('croix', SX + 16, SY + 28, APP.texte, 0.9)}
      ${texte(SX + 44, SY + 40, t('Nouvelle rencontre', 'New encounter'), { taille: 16, couleur: APP.texte, poids: 800 })}
      <rect x="${SX + 14}" y="${SY + 62}" width="${SL - 28}" height="60" rx="18" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
      ${visage(GENS.enzo.photo, SX + 21, SY + 69, 46, 46, 13)}
      ${texte(SX + 78, SY + 89, GENS.enzo.prenom, { taille: 16, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 78, SY + 106, t('8e fois', '8th time'), { taille: 9.5, couleur: APP.second, poids: 600 })}
      ${[[t('DATE', 'DATE'), t('26 sept.', '26 Sept.'), 'calendrier'], [t('HEURE', 'TIME'), t('22h40', '22:40'), 'horloge']].map(([l, v, ic], i) => {
        const w = (SL - 38) / 2, x = SX + 14 + i * (w + 10);
        return `<rect x="${x}" y="${SY + 134}" width="${w}" height="46" rx="16" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
          ${icone(ic, x + 11, SY + 149, APP.etoile, 0.95)}
          ${texte(x + 34, SY + 152, l, { taille: 8, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}
          ${texte(x + 34, SY + 168, v, { taille: 13, couleur: APP.texte, poids: 800 })}`;
      }).join('')}
      ${texte(SX + 20, SY + 84 + 120, t('OÙ', 'WHERE'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      <rect x="${SX + 14}" y="${SY + 214}" width="${SL - 28}" height="40" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.violet}" stroke-width="1.5"/>
      ${icone('epingle', SX + 26, SY + 226, APP.second, 1)}
      ${frappe(SX + 48, SY + 239, 'Locmariaqer', C, de + 0.002, carteA - 0.006, { taille: 12.5, couleur: APP.texte })}
      ${icone('epingle', SX + 16, SY + 270, APP.discret, 1)}
      ${texte(SX + 38, SY + 282, t('Pas de point précis', 'No exact spot'), { taille: 9.5, couleur: APP.discret })}
      ${texte(SX + SL - 16, SY + 282, t('Placer sur la carte', 'Place on the map'), { taille: 9.5, couleur: APP.violet, poids: 700, ancre: 'end' })}
      ${toucher(SX + SL - 60, SY + 278, C, carteA - 0.003)}`, 0.002);
    const MY = SY + 60, MH = SH - 170;
    const plan = O.france(SX, MY, SL, MH, [-3.2, 47.45, -2.65, 47.72]);
    const [lx, ly] = plan.proj(-2.945, 47.571);
    const cid = O.id('pointTest');
    const voisines = [['Locmariaquer', -2.945, 47.571], ['Crac’h', -2.998, 47.617], ['Auray', -2.99, 47.668], ['Baden', -2.919, 47.617], ['Carnac', -3.078, 47.584], ['Arzon', -2.892, 47.548]];
    ecran += entre(C, carteA, a, `<clipPath id="${cid}"><rect x="${SX}" y="${MY}" width="${SL}" height="${MH}"/></clipPath>
      <g clip-path="url(#${cid})">
        <rect x="${SX}" y="${MY}" width="${SL}" height="${MH}" fill="#07030F"/>
        <path d="${plan.terre}" fill="#261650" stroke="${APP.fuchsia}" stroke-opacity="0.55" stroke-width="1" stroke-linejoin="round"/>
        ${voisines.map(([n, lon, lat]) => { const [x, y] = plan.proj(lon, lat); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#FFFFFF" fill-opacity="0.85"/>${texte(Math.round(x + 5), Math.round(y + 3.5), n, { taille: 9, couleur: '#FFFFFF', poids: 700 })}`; }).join('')}
        <circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="9" fill="none" stroke="${ACCENT}" stroke-width="1.6"><animate attributeName="r" dur="1.6s" repeatCount="indefinite" values="6;16"/><animate attributeName="opacity" dur="1.6s" repeatCount="indefinite" values="0.9;0"/></circle>
      </g>
      ${icone('croix', SX + 16, SY + 26, APP.texte, 0.9)}
      ${texte(CX, SY + 38, t('Point précis', 'Exact spot'), { taille: 15, couleur: APP.texte, poids: 800, ancre: 'middle' })}
      ${texte(CX, SY + SH - 82, t('Touche la carte pour poser le point.', 'Touch the map to set the spot.'), { taille: 10.5, couleur: APP.second, ancre: 'middle' })}
      <g opacity="0.38">${O.bouton(SX + 20, SY + SH - 62, SL - 40, 42, t('Poser ici', 'Set here'), { taille: 13.5 })}</g>`, 0.002);
  }

  // 1. Nathan, de Londres à Locmariaquer.
  {
    const avant = { photo: 18, prenom: 'Nathan', ville: 'Londres' };
    const apres = { photo: 18, prenom: 'Nathan', ville: 'Locmariaquer' };
    const [cx, cy] = cellule(0);
    ecran += entre(C, b(0, 0), b(0, 0.24), repertoire([avant], { rangee: rangee(['Londres']) }) + toucher(cx + CL / 2, cy + 70, C, b(0, 0.18)), 0.003);
    // La fiche : la photo en grand, le crayon « Modifier la fiche ».
    const fiche = (photo) => `${photo}
      <rect x="${SX}" y="${SY}" width="${SL}" height="260" fill="url(#voile)"/>
      <circle cx="${SX + 26}" cy="${SY + 30}" r="15" fill="${APP.fond}" fill-opacity="0.6"/>${texte(SX + 26, SY + 36, '‹', { taille: 18, couleur: '#FFFFFF', ancre: 'middle' })}
      <circle cx="${SX + SL - 26}" cy="${SY + 30}" r="15" fill="${APP.fond}" fill-opacity="0.6"/>
      <path d="M${SX + SL - 32} ${SY + 36} l2 -6 l8 -8 l4 4 l-8 8 z" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/>`;
    const ficheNathan = fiche(visage(18, SX, SY, SL, 260, 0)) +
      texte(SX + 18, SY + 240, 'Nathan', { taille: 28, couleur: '#FFFFFF', poids: 800 }) +
      texte(SX + 18, SY + 300, t('INFOS', 'INFO'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' }) +
      `<rect x="${SX + 12}" y="${SY + 312}" width="${SL - 24}" height="42" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>` +
      texte(SX + 28, SY + 338, t('Ville', 'City'), { taille: 11, couleur: APP.second }) +
      texte(SX + SL - 28, SY + 338, 'Londres', { taille: 11, couleur: APP.texte, poids: 700, ancre: 'end' });
    ecran += entre(C, b(0, 0.24), b(0, 0.42), ficheNathan + toucher(SX + SL - 26, SY + 30, C, b(0, 0.37)), 0.003);
    // Le formulaire : VILLE se vide et se retape.
    const champ = (y, libelle, contenu) => `${texte(SX + 18, y, libelle, { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      <rect x="${SX + 12}" y="${y + 8}" width="${SL - 24}" height="38" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>${contenu}`;
    const form = `${texte(SX + 18, SY + 46, t('Modifier la fiche', 'Edit the card'), { taille: 17, couleur: APP.texte, poids: 800 })}
      ${champ(SY + 88, t('PRÉNOM', 'FIRST NAME'), texte(SX + 26, SY + 121, 'Nathan', { taille: 12.5, couleur: APP.texte }))}
      ${champ(SY + 162, t('VILLE', 'CITY'), `
        ${entre(C, b(0, 0.42), b(0, 0.52), texte(SX + 26, SY + 195, 'Londres', { taille: 12.5, couleur: APP.texte }), 0.002)}
        ${frappe(SX + 26, SY + 195, 'Locmariaquer', C, b(0, 0.53), b(0, 0.7), { taille: 12.5, couleur: APP.texte })}
        <rect x="${SX + 12}" y="${SY + 170}" width="${SL - 24}" height="38" rx="14" fill="none" stroke="${APP.violet}" stroke-width="1.5"/>`)}
      ${champ(SY + 236, t('ÂGE', 'AGE'), '')}
      <rect x="${SX + 12}" y="${SY + SH - 70}" width="${SL - 24}" height="46" rx="18" fill="url(#marque)"/>
      ${texte(CX, SY + SH - 42, t('Enregistrer', 'Save'), { taille: 13, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}`;
    ecran += entre(C, b(0, 0.42), b(0, 0.8), form + toucher(CX, SY + SH - 47, C, b(0, 0.76)), 0.003);
    ecran += entre(C, b(0, 0.8), b(1, 0), repertoire([apres], { rangee: rangee(['Locmariaquer']) }) +
      `<rect x="${cx}" y="${cy}" width="${CL}" height="${CH}" rx="14" fill="none" stroke="${VERT}" stroke-width="2"/>`, 0.003);
  }

  // 2. L'étiquette Musclé : Kelyan reste, Lou part.
  {
    const kelyan = { photo: 15, prenom: 'Kelyan' }, lou = { photo: 1, prenom: 'Lou' };
    const r = rangee(['Musclé', t('Drôle', 'Funny')], { plein: ['Musclé', b(1, 0.52), b(2, 0)] });
    // Les pastilles défilent de côté jusqu'à Musclé.
    const recul = Math.round(r.pos['Musclé'] - (SX + 12) - 90);
    // Une fonction : chaque écran a ses propres identifiants de clipPath.
    const r2 = () => rangee(['Musclé', t('Drôle', 'Funny')], {
      plein: ['Musclé', b(1, 0.52), b(2, 0)],
      decale: `<animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${b(1, 0.2)};${b(1, 0.4)};1" values="0 0;0 0;-${recul} 0;-${recul} 0"/>`,
    });
    const xMuscle = r.pos['Musclé'] - recul + largeurPastille('Musclé', 10) / 2;
    ecran += entre(C, b(1, 0), b(1, 0.56), repertoire([kelyan, lou], { rangee: r2() }), 0.003);
    ecran += entre(C, b(1, 0.56), b(2, 0), repertoire([kelyan], { rangee: r2() }), 0.003);
    ecran += toucher(xMuscle, SY + 81, C, b(1, 0.5));
    ecran += `<g opacity="0">${visible(C, b(1, 0.18), b(1, 0.42), 0.003)}
      <circle r="13" cy="${SY + 81}" fill="#FFFFFF" fill-opacity="0.28" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.5">
        ${fondu('cx', C, [[0, SX + 220], [b(1, 0.2), SX + 220], [b(1, 0.4), SX + 60], [1, SX + 60]])}</circle></g>`;
  }

  // 3. La recherche « barb » : Adam, qui porte Barbu, reste.
  {
    const adam = { photo: 14, prenom: 'Adam' }, matteo = { photo: 3, prenom: 'Matteo' };
    const tape = () => `${frappe(SX + 156, SY + 44.5, 'barb', C, b(2, 0.2), b(2, 0.45), { taille: 10.5, couleur: APP.texte, poids: 600 })}
      <rect x="${SX + 128}" y="${SY + 26}" width="${SL - 146}" height="28" rx="14" fill="none" stroke="${APP.violet}" stroke-width="1.5"/>`;
    ecran += entre(C, b(2, 0), b(2, 0.18), repertoire([adam, matteo]) + toucher(SX + 190, SY + 40, C, b(2, 0.1)), 0.003);
    ecran += entre(C, b(2, 0.18), b(2, 0.55), repertoire([adam, matteo], { recherche: tape() }), 0.003);
    ecran += entre(C, b(2, 0.55), b(3, 0), repertoire([adam], { recherche: tape() }), 0.003);
  }

  // 4. La photo d'Ibrahim, un carré violet dessiné par le test, en grand.
  {
    const ibrahim = { violet: true, prenom: 'Ibrahim' };
    const [cx, cy] = cellule(0);
    ecran += entre(C, b(3, 0), b(3, 0.22), repertoire([ibrahim]) + toucher(cx + CL / 2, cy + 70, C, b(3, 0.16)), 0.003);
    ecran += entre(C, b(3, 0.22), b(3, 0.46), `<rect x="${SX}" y="${SY}" width="${SL}" height="260" fill="#A855F7"/>
      <rect x="${SX}" y="${SY}" width="${SL}" height="260" fill="url(#voile)"/>
      <circle cx="${SX + SL - 26}" cy="${SY + 30}" r="15" fill="${APP.fond}" fill-opacity="0.6"/>
      <path d="M${SX + SL - 32} ${SY + 36} l2 -6 l8 -8 l4 4 l-8 8 z" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/>
      ${texte(SX + 18, SY + 240, 'Ibrahim', { taille: 28, couleur: '#FFFFFF', poids: 800 })}
      ${texte(SX + 18, SY + 300, t('GALERIE · 1', 'GALLERY · 1'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      <rect x="${SX + 18}" y="${SY + 312}" width="56" height="56" rx="12" fill="#A855F7"/>
      ${toucher(SX + 150, SY + 130, C, b(3, 0.4))}`, 0.003);
    ecran += entre(C, b(3, 0.46), b(4, 0), `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
      ${icone('croix', SX + 16, SY + 24, '#FFFFFF', 1)}
      ${texte(CX, SY + 38, '1 / 1', { taille: 13, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
      ${icone('telecharger', SX + SL - 56, SY + 24, '#FFFFFF', 1.1)}
      <rect x="${SX + 20}" y="${SY + 146}" width="${SL - 40}" height="${SL - 40}" fill="#A855F7"/>
      ${texte(CX, SY + 146 + (SL - 40) / 2 - 4, t('la photo du test :', 'the test photo:'), { taille: 12, couleur: '#FFFFFF', poids: 700, ancre: 'middle', extra: 'fill-opacity="0.9"' })}
      ${texte(CX, SY + 146 + (SL - 40) / 2 + 14, t('un carré violet qu’il dessine lui-même', 'a violet square it draws itself'), { taille: 11, couleur: '#FFFFFF', ancre: 'middle', extra: 'fill-opacity="0.8"' })}
      <g opacity="0">${visible(C, b(3, 0.62), b(4, 0), 0.003)}
        <circle cx="${SX + SL - 47}" cy="${SY + 33}" r="16" fill="none" stroke="${VERT}" stroke-width="2"/>
        <rect x="${SX + SL - 206}" y="${SY + 58}" width="190" height="26" rx="8" fill="#2E2E3A"/>
        ${texte(SX + SL - 111, SY + 75, t('Enregistrer dans la galerie', 'Save to the gallery'), { taille: 10.5, couleur: '#FFFFFF', ancre: 'middle' })}
      </g>`, 0.003);
  }

  // 5. La carte range Arradon, l'agenda montre le mois.
  {
    const lou = { photo: 1, prenom: 'Lou', ville: 'Vannes' };
    const pas = (SL - 20) / 5;
    const xCarte = SX + 10 + pas * 3.5, xAgenda = SX + 10 + pas * 4.5, yNav = SY + SH - 35;
    ecran += entre(C, b(4, 0), b(4, 0.16), repertoire([lou], { rangee: rangee(['Vannes']) }) + toucher(xCarte, yNav, C, b(4, 0.12)), 0.003);
    // La vraie carte, comme dans carte.svg : la côte lue dans france.bin,
    // cadrée sur la seule ville du test, avec ses ondes. Une seule
    // rencontre à Arradon : une bulle, la plus claire, puisqu'elle est
    // aussi la plus vue.
    const MX = SX + 12, MY = SY + 62, MW = SL - 24, MH = 220;
    const mid = O.id('carteTest');
    const plan = O.france(0, 0, MW, MH, [-3.55, 47.3, -2.1, 47.98]);
    const [ax, ay] = plan.proj(-2.824, 47.633);
    const R = 22;
    const ouvre = b(4, 0.17);
    const carte = `${texte(SX + 18, SY + 44, t('TES LIEUX', 'YOUR PLACES'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
      <rect x="${SX + SL - 88}" y="${SY + 27}" width="72" height="26" rx="13" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
      ${texte(SX + SL - 80, SY + 44.5, '1', { taille: 13, couleur: APP.texte, poids: 800 })}
      ${texte(SX + SL - 68, SY + 44.5, t('Ville', 'City'), { taille: 10.5, couleur: APP.second, poids: 700 })}
      <defs>
        <radialGradient id="${mid}mer" cx="30%" cy="25%" r="140%"><stop offset="0" stop-color="#1B1044"/><stop offset="0.5" stop-color="#120B2A"/><stop offset="1" stop-color="#090413"/></radialGradient>
        <linearGradient id="${mid}terre" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B2470"/><stop offset="0.55" stop-color="#2C1857"/><stop offset="1" stop-color="#1E1040"/></linearGradient>
        <linearGradient id="${mid}trait" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.09"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
        <linearGradient id="${mid}bulle" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7D5FD"/><stop offset="0.46" stop-color="#F0ABFC"/><stop offset="1" stop-color="#8F5EB0"/></linearGradient>
        <clipPath id="${mid}"><rect x="0" y="0" width="${MW}" height="${MH}" rx="18"/></clipPath>
      </defs>
      <g transform="translate(${MX} ${MY})" clip-path="url(#${mid})">
        <rect width="${MW}" height="${MH}" rx="18" fill="url(#${mid}mer)"/>
        <g opacity="0">${fondu('opacity', C, [[0, 0], [ouvre, 0], [ouvre + 0.004, 1], [1, 1]])}
          <path d="${plan.terre}" fill="none" stroke="${VIOLET}" stroke-opacity="0.12" stroke-width="7" stroke-linejoin="round"/>
          <path d="${plan.terre}" fill="url(#${mid}terre)"/>
          <path d="${plan.departements}" fill="none" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="0.6"/>
          <path d="${plan.terre}" fill="none" stroke="${APP.rose}" stroke-opacity="0.55" stroke-width="1" stroke-linejoin="round"/>
        </g>
        <rect x="-120" y="0" width="120" height="${MH}" fill="url(#${mid}trait)" opacity="0">
          ${fondu('x', C, [[0, -120], [ouvre, -120], [ouvre + 0.012, MW], [1, MW]])}
          ${visible(C, ouvre, ouvre + 0.012, 0.002)}</rect>
        <g opacity="0">${fondu('opacity', C, [[0, 0], [ouvre + 0.005, 0], [ouvre + 0.009, 1], [1, 1]])}
          <g transform="translate(${Math.round(ax)} ${Math.round(ay)})">
            ${[0, 1].map((k) => `<circle r="${R}" fill="none" stroke="${ACCENT}" stroke-width="1.6" opacity="0">
              <animate attributeName="r" dur="3.2s" begin="${k * 1.6}s" repeatCount="indefinite" keyTimes="0;0.55;1" values="${R};${R * 3.4};${R * 3.4}"/>
              <animate attributeName="opacity" dur="3.2s" begin="${k * 1.6}s" repeatCount="indefinite" keyTimes="0;0.55;1" values="0.45;0;0"/></circle>`).join('')}
            <circle r="${R - 2}" cy="4" fill="#000000" opacity="0.35"/>
            <circle r="${R + 3}" fill="${APP.rose}" opacity="0.25"/>
            <circle r="${R}" fill="url(#${mid}bulle)" stroke="#FFFFFF" stroke-opacity="0.42" stroke-width="1.4"/>
            ${texte(0, 5.2, '1', { taille: 14.5, couleur: '#FFFFFF', poids: 800, ancre: 'middle' })}
            <rect x="-30" y="${R + 4}" width="60" height="15" rx="7.5" fill="#090413" fill-opacity="0.7" stroke="#FFFFFF" stroke-opacity="0.11"/>
            ${texte(0, R + 14.8, 'ARRADON', { taille: 8.5, couleur: '#FFFFFF', poids: 800, ancre: 'middle', extra: 'letter-spacing="0.55" fill-opacity="0.92"' })}
          </g>
        </g>
      </g>
      <rect x="${SX + 12}" y="${SY + 296}" width="${SL - 24}" height="80" rx="18" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${texte(SX + 28, SY + 320, t('CLASSEMENT', 'RANKING'), { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      ${texte(SX + 28, SY + 346, 'Arradon', { taille: 12, couleur: APP.texte, poids: 700 })}
      ${texte(SX + SL - 28, SY + 346, '1', { taille: 12, couleur: APP.texte, poids: 800, ancre: 'end' })}
      <rect x="${SX + 28}" y="${SY + 356}" width="${SL - 56}" height="5" rx="2.5" fill="#FFFFFF" fill-opacity="0.06"/>
      <rect x="${SX + 28}" y="${SY + 356}" height="5" rx="2.5" width="0" fill="${APP.fuchsia}">${fondu('width', C, [[0, 0], [ouvre + 0.006, 0], [ouvre + 0.016, SL - 56], [1, SL - 56]])}</rect>
      ${barreNav(T, 'Carte')}`;
    ecran += entre(C, b(4, 0.16), b(4, 0.58), carte + toucher(xAgenda, yNav, C, b(4, 0.52)), 0.003);
    // Le mois comme dans calendrier.svg : la carte du mois, ses boutons,
    // les jours discrets, et le seul jour plein du test, aujourd'hui, en
    // disque de la marque avec son signe : une première fois avec Lou.
    const EMOJI = 'Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif';
    const KX = SX + 10, KY = SY + 96, KW = SL - 20, KH = 262;
    const colX = (c) => KX + 12 + ((KW - 24) / 7) * (c + 0.5);
    const ligneY = (r) => KY + 96 + r * 30;
    const rond = (x, y, d) => `<circle cx="${x}" cy="${y}" r="13" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/><path d="${d}" fill="none" stroke="${APP.second}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    let mois = `${texte(SX + 18, SY + 44, t('CALENDRIER', 'CALENDAR'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
      <rect x="${SX + SL - 104}" y="${SY + 27}" width="88" height="26" rx="13" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
      ${texte(SX + SL - 94, SY + 44.5, '1', { taille: 13, couleur: APP.texte, poids: 800 })}
      ${texte(SX + SL - 82, SY + 44.5, t('Rencontre', 'Encounter'), { taille: 10, couleur: APP.second, poids: 700 })}
      <rect x="${SX + 16}" y="${SY + 62}" width="54" height="24" rx="12" fill="url(#marque)"/>
      ${texte(SX + 43, SY + 78, '2026', { taille: 11, couleur: '#FFFFFF', poids: 800, ancre: 'middle' })}
      <rect x="${KX}" y="${KY}" width="${KW}" height="${KH}" rx="18" fill="#FFFFFF" fill-opacity="0.045" stroke="${APP.bord}"/>
      ${rond(KX + 22, KY + 26, `M${KX + 24.5} ${KY + 21} L${KX + 19.5} ${KY + 26} L${KX + 24.5} ${KY + 31}`)}
      ${rond(KX + KW - 50, KY + 26, `M${KX + KW - 52.5} ${KY + 21} L${KX + KW - 47.5} ${KY + 26} L${KX + KW - 52.5} ${KY + 31}`)}
      <circle cx="${KX + KW - 20}" cy="${KY + 26}" r="13" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
      ${texte(KX + KW - 20, KY + 30.5, '?', { taille: 13, couleur: APP.second, poids: 800, ancre: 'middle' })}
      ${texte(KX + KW / 2 - 14, KY + 24, t('SEPTEMBRE 2026', 'SEPTEMBER 2026'), { taille: 11.5, couleur: '#E9D5FF', poids: 800, ancre: 'middle', extra: 'letter-spacing="1"' })}
      ${texte(KX + KW / 2 - 14, KY + 39, t('1 rencontre', '1 encounter'), { taille: 9.5, couleur: APP.discret, ancre: 'middle' })}`;
    [...t('LMMJVSD', 'MTWTFSS')].forEach((j, c) => { mois += texte(colX(c), KY + 66, j, { taille: 9.5, couleur: APP.discret, poids: 700, ancre: 'middle' }); });
    // Septembre 2026 commence un mardi : le 1er en deuxième colonne.
    const pop = b(4, 0.62);
    for (let d = 1; d <= 30; d++) {
      const k = d, x = colX(k % 7), y = ligneY(Math.floor(k / 7));
      if (d !== 26) { mois += texte(x, y + 4, String(d), { taille: 10.5, couleur: APP.discret, poids: 600, ancre: 'middle' }); continue; }
      mois += `<g transform="translate(${x} ${y})"><g>
          <animateTransform attributeName="transform" type="scale" dur="${C}s" repeatCount="indefinite" keyTimes="0;${pop.toFixed(4)};${(pop + 0.004).toFixed(4)};${(pop + 0.007).toFixed(4)};1" values="0;0;1.25;1;1"/>
          <circle r="11.5" fill="url(#marque)"/>${texte(0, 4, '26', { taille: 10.5, couleur: '#12071F', poids: 800, ancre: 'middle' })}</g></g>
        ${entre(C, pop + 0.006, 1, `<text x="${x}" y="${y + 21}" font-family="${EMOJI}" font-size="7.2" text-anchor="middle">✨</text>`, 0.003)}`;
    }
    // La liste du dessous : le mois, puis la rencontre du test.
    const LY = KY + KH + 26;
    mois += `${texte(SX + 16, LY, t('SEPTEMBRE', 'SEPTEMBER'), { taille: 11.5, couleur: '#C9B8E8', poids: 800, extra: 'letter-spacing="0.6"' })}
      ${texte(SX + 100, LY, t('1 rencontre', '1 encounter'), { taille: 10, couleur: APP.discret, poids: 600 })}
      <rect x="${SX + 10}" y="${LY + 12}" width="${SL - 20}" height="60" rx="16" fill="#FFFFFF" fill-opacity="0.045" stroke="${APP.bord}"/>
      ${visage(1, SX + 18, LY + 20, 44, 44, 11)}
      ${texte(SX + 72, LY + 36, 'Lou', { taille: 13.5, couleur: APP.texte, poids: 800 })}
      ${etoiles(SX + 72, LY + 50, 8, { taille: 8 })}
      ${texte(SX + 72, LY + 64, t('26 sept.  ·  Arradon', '26 Sept.  ·  Arradon'), { taille: 9.5, couleur: APP.second })}
      <rect x="${SX + SL - 58}" y="${LY + 20}" width="38" height="18" rx="9" fill="${APP.fond}" fill-opacity="0.8" stroke="${APP.bord}"/>
      <text x="${SX + SL - 39}" y="${LY + 33}" font-family="${EMOJI}" font-size="9.5" text-anchor="middle">✨</text>`;
    mois += barreNav(T, 'Agenda');
    ecran += entre(C, b(4, 0.58), b(5, 0), mois, 0.003);
  }

  // 6. Le rappel de sauvegarde, puis « Plus tard ».
  {
    const noa = { photo: 10, prenom: 'Noa' };
    const rappel = `<rect x="${SX + 12}" y="${SY + 108}" width="${SL - 24}" height="134" rx="18" fill="${APP.violet}" fill-opacity="0.16" stroke="${APP.violet}" stroke-opacity="0.5"/>
      <rect x="${SX + 26}" y="${SY + 122}" width="30" height="30" rx="9" fill="${APP.violet}" fill-opacity="0.3"/>
      ${icone('telecharger', SX + 33, SY + 129, '#FFFFFF', 1)}
      ${texte(SX + 66, SY + 135, t('Aucune sauvegarde', 'No backup'), { taille: 12, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 66, SY + 151, t('de tes fiches', 'of your cards'), { taille: 12, couleur: APP.texte, poids: 800 })}
      ${icone('croix', SX + SL - 44, SY + 122, APP.second, 0.9)}
      ${texte(SX + 26, SY + 176, t('Perdre le téléphone, c’est perdre', 'Losing the phone means losing'), { taille: 10.5, couleur: APP.second })}
      ${texte(SX + 26, SY + 191, t('ce qui n’a pas été exporté.', 'whatever was not exported.'), { taille: 10.5, couleur: APP.second })}
      <rect x="${SX + SL - 118}" y="${SY + 202}" width="92" height="28" rx="14" fill="url(#marque)"/>
      ${texte(SX + SL - 72, SY + 220, t('Sauvegarder', 'Back up'), { taille: 10.5, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}`;
    const grille = (dy) => `${haut()}${rangee([]).svg}${carteTest(noa, cellule(0)[0], cellule(0)[1] + dy)}${barreNav(T, 'Fiches')}`;
    ecran += entre(C, b(5, 0), b(5, 0.5), grille(146) + rappel + toucher(SX + SL - 37, SY + 129, C, b(5, 0.42)), 0.003);
    ecran += entre(C, b(5, 0.5), 0.915, grille(0) +
      `<rect x="${cellule(0)[0]}" y="${cellule(0)[1]}" width="${CL}" height="${CH}" rx="14" fill="none" stroke="${VERT}" stroke-width="2" opacity="0">${visible(C, b(5, 0.55), b(5, 0.95), 0.003)}</rect>`, 0.003);
  }

  // Sur la machine : plus d'émulateur, l'écran s'éteint.
  ecran += entre(C, 0.915, FIN, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#050308"/>
    ${texte(CX, SY + 250, t('test/coordonnees_test.dart', 'test/coordonnees_test.dart'), { taille: 11, couleur: APP.second, police: MONO, poids: 700, ancre: 'middle' })}
    ${texte(CX, SY + 272, t('tourne sur la machine, sans émulateur :', 'runs on the machine, no emulator:'), { taille: 11.5, couleur: APP.discret, ancre: 'middle' })}
    ${texte(CX, SY + 289, t('la recherche des communes est du Dart pur.', 'the commune search is pure Dart.'), { taille: 11.5, couleur: APP.discret, ancre: 'middle' })}`, 0.004);
  corps += T.ecran(ecran);

  // Sous le téléphone, le fichier en cours.
  corps += entre(C, 0.012, B0, texte(200, 662, 'integration_test/bodycount_test.dart', { taille: 10.5, couleur: DISCRET, police: MONO, ancre: 'middle' }) +
    texte(200, 681, t('sans écran : ce que le test garantit dans l’appli', 'no screen: what the test guarantees in the app'), { taille: 11, couleur: TEXTE, ancre: 'middle' }), 0.004);
  corps += entre(C, B0, 0.915, texte(200, 666, 'integration_test/ecrans_test.dart', { taille: 10.5, couleur: DISCRET, police: MONO, ancre: 'middle' }), 0.004);
  corps += entre(C, 0.915, FIN, texte(200, 666, 'test/coordonnees_test.dart', { taille: 10.5, couleur: DISCRET, police: MONO, ancre: 'middle' }), 0.004);

  // ------------------------------------------------------------ trois cartes
  const bas = [
    [VIOLET, t('Les vraies bibliothèques', 'The real libraries'),
      t('SQLCipher, le Keystore et l’AES natif', 'SQLCipher, the Keystore and native AES'), t('n’existent que sur Android.', 'only exist on Android.')],
    [ROUGE, t('Jamais sur ton téléphone', 'Never on your phone'),
      t('Ils détruisent la base et la clé', 'They wipe the database and the key'), t('de l’appli qu’ils visent.', 'of the app they target.')],
    [OR, t('Au doigt, image par image', 'By finger, frame by frame'),
      t('L’anneau et les ondes tournent sans fin :', 'The ring and ripples never settle:'), t('chaque élément est attendu.', 'every element is waited for.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = 380 + i * 283, y = 604;
    corps += `<rect x="${x}" y="${y}" width="272" height="90" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(x + 20, y + 30, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 52, l1, { taille: 12 })}
      ${texte(x + 20, y + 70, l2, { taille: 12 })}`;
  });

  svg('tests.svg', 1280, 720, corps, t(
    'Les tests de BodyCount, qui tournent. flutter test integration_test sur l’émulateur : Base, quatre tests, dont les ouvertures simultanées qui partagent une seule connexion et la base sans numéro de version réparée, pas détruite ; Flux chiffré, huit tests, des allers-retours de 0 octet à trois mégaoctets, le natif et le Dart qui se relisent, un fichier tronqué, deux morceaux intervertis et un octet modifié refusés ; Coffre des vidéos, une vidéo qui se relit à l’identique ; Sauvegarde, quatre tests, tout revient, et une mauvaise phrase, une sauvegarde abîmée ou un fichier étranger ne touchent à rien ; Communes, un village, une faute, un homonyme. Pendant ce temps, rien à l’écran : tout se passe sous le capot, avec le vrai SQLCipher et le vrai Keystore. Puis six parcours pilotent l’application au doigt : la ville de Nathan passe de Londres à Locmariaquer, l’étiquette Musclé ne laisse que Kelyan, la recherche « barb » ne laisse qu’Adam, la photo d’Ibrahim s’ouvre en grand avec son bouton pour la galerie, la carte range Arradon et l’agenda montre le mois, le rappel de sauvegarde se montre puis se tait. 24 tests passés. Enfin, sur la machine, sans émulateur, les sept tests de la recherche des communes.',
    'The BodyCount tests, running. flutter test integration_test on the emulator: Database, four tests, including simultaneous openings sharing a single connection and a database without a version number repaired, not destroyed; Encrypted stream, eight tests, round trips from 0 bytes to three megabytes, native and Dart reading each other, a truncated file, two swapped chunks and one changed byte refused; Video vault, a video that reads back identical; Backup, four tests, everything comes back, and a wrong passphrase, a damaged backup or a foreign file touch nothing; Communes, a village, a typo, a homonym. Meanwhile, nothing on screen: it all happens under the hood, with the real SQLCipher and the real Keystore. Then six journeys drive the app by finger: Nathan’s city goes from London to Locmariaquer, the Musclé tag leaves only Kelyan, searching “barb” leaves only Adam, Ibrahim’s photo opens full screen with its gallery button, the map ranks Arradon and the agenda shows the month, the backup reminder shows up then goes quiet. 24 tests passed. Finally, on the machine, no emulator, the seven commune search tests.'));
};

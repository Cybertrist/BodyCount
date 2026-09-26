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
    VERT, OR, ROUGE, BLEU } = O;
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

  // Phase sans écran : ce qui s'éprouve, famille par famille.
  const CX = SX + SL / 2;
  let sansEcran = `${texte(CX, SY + 46, 'integration_test', { taille: 11, couleur: APP.discret, police: MONO, ancre: 'middle' })}
    ${texte(CX, SY + 64, 'bodycount_test.dart', { taille: 11, couleur: APP.second, police: MONO, poids: 700, ancre: 'middle' })}`;
  bornesFamille.forEach(([de, a, f], i) => {
    const l = SL - 80;
    sansEcran += entre(C, de, i === bornesFamille.length - 1 ? B0 : a, `
      <circle cx="${CX}" cy="${SY + 190}" r="58" fill="${APP.violet}" fill-opacity="0.12"/>
      <circle cx="${CX}" cy="${SY + 190}" r="44" fill="${APP.carte}" stroke="${APP.violet}" stroke-width="1.5"/>
      ${icone(f.icone, CX - 20, SY + 170, APP.rose, 2.5)}
      ${texte(CX, SY + 286, f.nom, { taille: 20, couleur: APP.texte, poids: 800, ancre: 'middle' })}
      ${texte(CX, SY + 308, f.tests.length === 1 ? t('1 test', '1 test') : t(`${f.tests.length} tests`, `${f.tests.length} tests`), { taille: 12, couleur: APP.second, ancre: 'middle' })}
      <rect x="${SX + 40}" y="${SY + 326}" width="${l}" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.08"/>
      <rect x="${SX + 40}" y="${SY + 326}" height="6" rx="3" width="0" fill="url(#marque)">${fondu('width', C, [[0, 0], [de, 0], [a, l], [1, l]])}</rect>`, 0.003);
  });
  sansEcran += `${texte(CX, SY + 400, t('Rien à regarder pour ceux-là :', 'Nothing to watch for these:'), { taille: 12, couleur: APP.texte, poids: 700, ancre: 'middle' })}
    ${texte(CX, SY + 420, t('la base, le chiffrement et la sauvegarde', 'the database, the encryption and the backup'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    ${texte(CX, SY + 437, t('s’éprouvent sous le capot, avec le vrai', 'are put to the test under the hood, with the'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    ${texte(CX, SY + 454, t('SQLCipher et le vrai Keystore d’Android.', 'real SQLCipher and Android’s real Keystore.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}`;
  ecran += entre(C, 0.012, B0, sansEcran, 0.006);

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
    const carte = `${texte(SX + 18, SY + 44, t('TES LIEUX', 'YOUR PLACES'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
      <rect x="${SX + 12}" y="${SY + 62}" width="${SL - 24}" height="220" rx="18" fill="#1B0C36" stroke="${APP.bord}"/>
      <path d="M${SX + 40} ${SY + 150} C${SX + 80} ${SY + 120} ${SX + 120} ${SY + 170} ${SX + 160} ${SY + 150} S${SX + 220} ${SY + 190} ${SX + 240} ${SY + 170}" fill="none" stroke="#3B2566" stroke-width="2"/>
      <path d="M${SX + 30} ${SY + 240} C${SX + 90} ${SY + 210} ${SX + 150} ${SY + 250} ${SX + 244} ${SY + 226}" fill="none" stroke="#3B2566" stroke-width="2"/>
      <circle cx="${SX + 136}" cy="${SY + 176}" r="16" fill="${APP.violet}"/>
      ${texte(SX + 136, SY + 181, '1', { taille: 12, couleur: '#FFFFFF', poids: 800, ancre: 'middle' })}
      ${texte(SX + 136, SY + 208, 'ARRADON', { taille: 8.5, couleur: APP.texte, poids: 800, ancre: 'middle', extra: 'letter-spacing="1"' })}
      <rect x="${SX + 12}" y="${SY + 296}" width="${SL - 24}" height="80" rx="18" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${texte(SX + 28, SY + 320, t('CLASSEMENT', 'RANKING'), { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      ${texte(SX + 28, SY + 346, 'Arradon', { taille: 12, couleur: APP.texte, poids: 700 })}
      ${texte(SX + SL - 28, SY + 346, '1', { taille: 12, couleur: APP.texte, poids: 800, ancre: 'end' })}
      <rect x="${SX + 28}" y="${SY + 356}" width="${SL - 56}" height="5" rx="2.5" fill="${APP.fuchsia}"/>
      ${barreNav(T, 'Carte')}`;
    ecran += entre(C, b(4, 0.16), b(4, 0.58), carte + toucher(xAgenda, yNav, C, b(4, 0.52)), 0.003);
    let mois = `${texte(SX + 18, SY + 44, t('CALENDRIER', 'CALENDAR'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
      <rect x="${SX + 12}" y="${SY + 62}" width="${SL - 24}" height="300" rx="18" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${texte(CX, SY + 92, t('SEPTEMBRE 2026', 'SEPTEMBER 2026'), { taille: 11.5, couleur: APP.texte, poids: 800, ancre: 'middle', extra: 'letter-spacing="1.2"' })}`;
    const jours = t('LMMJVSD', 'MTWTFSS');
    const cw = (SL - 44) / 7;
    [...jours].forEach((j, i) => { mois += texte(SX + 22 + cw * i + cw / 2, SY + 118, j, { taille: 9.5, couleur: APP.discret, poids: 700, ancre: 'middle' }); });
    // Septembre 2026 commence un mardi.
    for (let d = 1; d <= 30; d++) {
      const pos = d; // lundi 31 août en case 0
      const col = pos % 7, rang = Math.floor(pos / 7);
      const x = SX + 22 + cw * col + cw / 2, yy = SY + 146 + rang * 36;
      if (d === 26) mois += `<circle cx="${x}" cy="${yy - 4}" r="13" fill="${APP.violet}"/>`;
      mois += texte(x, yy, String(d), { taille: 11, couleur: d === 26 ? '#FFFFFF' : APP.second, poids: d === 26 ? 800 : 500, ancre: 'middle' });
    }
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
  corps += entre(C, 0.012, B0, texte(200, 666, 'integration_test/bodycount_test.dart', { taille: 10.5, couleur: DISCRET, police: MONO, ancre: 'middle' }), 0.004);
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
      <rect x="${x}" y="${y + 14}" width="3" height="62" rx="1.5" fill="${c}"/>
      ${texte(x + 20, y + 30, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 52, l1, { taille: 12 })}
      ${texte(x + 20, y + 70, l2, { taille: 12 })}`;
  });

  svg('tests.svg', 1280, 720, corps, t(
    'Les tests de BodyCount, qui tournent. flutter test integration_test sur l’émulateur : Base, quatre tests, dont les ouvertures simultanées qui partagent une seule connexion et la base sans numéro de version réparée, pas détruite ; Flux chiffré, huit tests, des allers-retours de 0 octet à trois mégaoctets, le natif et le Dart qui se relisent, un fichier tronqué, deux morceaux intervertis et un octet modifié refusés ; Coffre des vidéos, une vidéo qui se relit à l’identique ; Sauvegarde, quatre tests, tout revient, et une mauvaise phrase, une sauvegarde abîmée ou un fichier étranger ne touchent à rien ; Communes, un village, une faute, un homonyme. Pendant ce temps, rien à l’écran : tout se passe sous le capot, avec le vrai SQLCipher et le vrai Keystore. Puis six parcours pilotent l’application au doigt : la ville de Nathan passe de Londres à Locmariaquer, l’étiquette Musclé ne laisse que Kelyan, la recherche « barb » ne laisse qu’Adam, la photo d’Ibrahim s’ouvre en grand avec son bouton pour la galerie, la carte range Arradon et l’agenda montre le mois, le rappel de sauvegarde se montre puis se tait. 24 tests passés. Enfin, sur la machine, sans émulateur, les sept tests de la recherche des communes.',
    'The BodyCount tests, running. flutter test integration_test on the emulator: Database, four tests, including simultaneous openings sharing a single connection and a database without a version number repaired, not destroyed; Encrypted stream, eight tests, round trips from 0 bytes to three megabytes, native and Dart reading each other, a truncated file, two swapped chunks and one changed byte refused; Video vault, a video that reads back identical; Backup, four tests, everything comes back, and a wrong passphrase, a damaged backup or a foreign file touch nothing; Communes, a village, a typo, a homonym. Meanwhile, nothing on screen: it all happens under the hood, with the real SQLCipher and the real Keystore. Then six journeys drive the app by finger: Nathan’s city goes from London to Locmariaquer, the Musclé tag leaves only Kelyan, searching “barb” leaves only Adam, Ibrahim’s photo opens full screen with its gallery button, the map ranks Arradon and the agenda shows the month, the backup reminder shows up then goes quiet. 24 tests passed. Finally, on the machine, no emulator, the seven commune search tests.'));
};

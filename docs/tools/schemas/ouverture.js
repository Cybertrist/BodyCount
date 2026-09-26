// L'ouverture unique de la base (lib/donnees/base.dart), en deux actes.
//
// Avant la correction : au déverrouillage, le répertoire, les villes et
// les statistiques demandent la base au même instant, et chacun lance sa
// propre ouverture. L'une ferme la connexion de l'autre en vérifiant la
// clé, l'autre croit la base en clair et la recopie en effaçant le
// fichier : deux connexions, deux fichiers, et la ville d'Enzo qui refuse
// de changer dans le répertoire. Après : le futur de l'ouverture est
// gardé, tout le monde l'attend, un seul fichier.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, empreinte, logo, icone, visage,
    cartePersonne, barreNav, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE } = O;
  const C = 34;
  const FIN = 0.985;
  // Les deux actes : [début, fin] et leurs instants.
  const ACTES = [
    { de: 0, a: 0.48, touche: 0.04, ouvert: 0.075, demande: 0.09, fiche: 0.3, sauve: 0.35, retour: 0.39 },
    { de: 0.5, a: FIN, touche: 0.54, ouvert: 0.575, demande: 0.59, fiche: 0.78, sauve: 0.83, retour: 0.87 },
  ];
  const [AV, AP] = ACTES;
  let corps = entete(t('UNE SEULE OUVERTURE', 'ONE OPENING'),
    t('Trois écrans demandent la base au même instant. Ils attendent la même ouverture.',
      'Three screens ask for the database at the same instant. They wait for the same opening.'));

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  const verrou = (a) => `
    ${logo(SX + SL / 2, SY + 128, 76)}
    ${texte(SX + SL / 2, SY + 212, 'BodyCount', { taille: 30, couleur: APP.texte, poids: 800, ancre: 'middle' })}
    ${texte(SX + SL / 2, SY + 240, t('Tout reste sur cet appareil.', 'Everything stays on this device.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
    <circle cx="${SX + SL / 2}" cy="${SY + 380}" r="46" fill="url(#marque)"/>
    ${empreinte(SX + SL / 2, SY + 380, 44, '#FFFFFF')}
    ${texte(SX + SL / 2, SY + 470, t('Touche le capteur pour ouvrir', 'Touch the sensor to open'), { taille: 12.5, couleur: APP.second, poids: 600, ancre: 'middle' })}
    ${toucher(SX + SL / 2, SY + 380, C, a.touche)}`;

  // Le répertoire : Enzo en premier, sa ville selon ce que lit l'écran.
  const CL = (SL - 36) / 2, CH = 150;
  const gens = [GENS.enzo, GENS.noa, GENS.lou, GENS.gabriel];
  const repertoire = (villeEnzo, attente) => {
    let s = `${texte(SX + 18, SY + 44, t('RÉPERTOIRE', 'PEOPLE'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
      <rect x="${SX + 128}" y="${SY + 26}" width="${SL - 146}" height="28" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${icone('loupe', SX + 138, SY + 33, APP.second, 0.8)}
      ${texte(SX + 156, SY + 44.5, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 10, couleur: APP.discret })}`;
    // Les pastilles de ville, que remplit villesProvider.
    let px = SX + 12;
    for (const [v, plein] of [[t('Récents', 'Recent'), true], ['Vannes', false], ['Rennes', false], ['Lorient', false]]) {
      const l = Math.round(v.length * 6 + 20);
      s += `<rect x="${px}" y="${SY + 66}" width="${l}" height="22" rx="11" fill="${plein ? 'url(#marque)' : APP.carte}" stroke="${plein ? 'none' : APP.bord}"/>
        ${texte(px + l / 2, SY + 81, v, { taille: 10, couleur: APP.texte, poids: 600, ancre: 'middle' })}`;
      px += l + 6;
    }
    gens.forEach((p, i) => {
      const x = SX + 12 + (i % 2) * (CL + 12), y = SY + 100 + Math.floor(i / 2) * (CH + 12);
      s += cartePersonne(i === 0 ? { ...p, ville: villeEnzo } : p, x, y, CL, CH, { premier: i === 1 });
    });
    s += barreNav(T, 'Fiches');
    return s + (attente || '');
  };
  // Le squelette pendant que la base s'ouvre.
  const squelette = () => {
    let s = texte(SX + 18, SY + 44, t('RÉPERTOIRE', 'PEOPLE'), { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' });
    for (let i = 0; i < 4; i++) {
      s += `<rect x="${SX + 12 + (i % 2) * (CL + 12)}" y="${SY + 100 + Math.floor(i / 2) * (CH + 12)}" width="${CL}" height="${CH}" rx="14" fill="${APP.carte}">
        <animate attributeName="opacity" dur="1.1s" repeatCount="indefinite" values="0.5;1;0.5"/></rect>`;
    }
    return s + barreNav(T, 'Fiches');
  };
  // La fiche d'Enzo en modification : la ville passe de Vannes à Auray.
  const modifier = (a) => `
    <path d="M${SX + 26} ${SY + 40} h-10 m5 -5 l-5 5 l5 5" fill="none" stroke="${APP.texte}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(SX + 44, SY + 45, t('Modifier la fiche', 'Edit person'), { taille: 16, couleur: APP.texte, poids: 800 })}
    ${visage(GENS.enzo.photo, SX + SL / 2 - 48, SY + 72, 96, 96, 48)}
    ${[[t('Prénom', 'First name'), 'Enzo P.', 190], [t('Âge', 'Age'), '23', 250]].map(([l, v, y]) => `
      ${texte(SX + 18, SY + y, l, { taille: 9.5, couleur: APP.second, poids: 700 })}
      <rect x="${SX + 12}" y="${SY + y + 8}" width="${SL - 24}" height="36" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${texte(SX + 26, SY + y + 31, v, { taille: 13, couleur: APP.texte, poids: 600 })}`).join('')}
    ${texte(SX + 18, SY + 310, t('Ville', 'City'), { taille: 9.5, couleur: APP.second, poids: 700 })}
    <rect x="${SX + 12}" y="${SY + 318}" width="${SL - 24}" height="36" rx="12" fill="${APP.carte}" stroke="${APP.violet}"/>
    ${icone('epingle', SX + 22, SY + 328, APP.second, 1)}
    ${entre(C, a.fiche, a.fiche + 0.02, texte(SX + 44, SY + 341, 'Vannes', { taille: 13, couleur: APP.texte, poids: 600 }), 0.003)}
    ${entre(C, a.fiche + 0.02, a.retour, texte(SX + 44, SY + 341, 'Auray', { taille: 13, couleur: APP.texte, poids: 600 }), 0.003)}
    <rect x="${SX + 20}" y="${SY + SH - 120}" width="${SL - 40}" height="44" rx="18" fill="url(#marque)"/>
    ${texte(SX + SL / 2, SY + SH - 93, t('Enregistrer', 'Save'), { taille: 13.5, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
    ${toucher(SX + SL / 2, SY + SH - 98, C, a.sauve)}
    ${entre(C, a.sauve + 0.005, a.retour, `<rect x="${SX + 12}" y="${SY + SH - 64}" width="${SL - 24}" height="40" rx="10" fill="#2A2438"/>
      ${texte(SX + 26, SY + SH - 39, t('Fiche enregistrée.', 'Person saved.'), { taille: 12, couleur: APP.texte })}`, 0.003)}`;

  for (const [n, a] of ACTES.entries()) {
    ecran += entre(C, a.de, a.ouvert, verrou(a), 0.005);
    ecran += entre(C, a.ouvert, a.demande + (n ? 0.03 : 0.07), squelette(), 0.004);
    ecran += entre(C, a.demande + (n ? 0.03 : 0.07), a.fiche - 0.01, repertoire('Vannes') + toucher(SX + 12 + CL / 2, SY + 175, C, a.fiche - 0.02), 0.004);
    ecran += entre(C, a.fiche - 0.01, a.retour, modifier(a), 0.004);
    // Au retour : la ville lue par le répertoire. Avant, l'ancienne.
    const bon = n === 1;
    ecran += entre(C, a.retour, a.a, repertoire(bon ? 'Auray' : 'Vannes',
      `<rect x="${SX + 10}" y="${SY + 98}" width="${CL + 4}" height="${CH + 4}" rx="16" fill="none" stroke="${bon ? VERT : ROUGE}" stroke-width="2.5"/>
       <rect x="${SX + 30}" y="${SY + 424}" width="${SL - 60}" height="40" rx="12" fill="${bon ? VERT : ROUGE}" fill-opacity="0.16" stroke="${bon ? VERT : ROUGE}" stroke-opacity="0.7"/>
       ${texte(SX + SL / 2, SY + 449, bon ? t('Auray, aussitôt.', 'Auray, right away.') : t('Toujours Vannes ?', 'Still Vannes?'), { taille: 13, couleur: bon ? VERT : ROUGE, poids: 800, ancre: 'middle' })}`), 0.004);
  }
  // Entre les deux actes, un écran noir qui annonce la suite.
  ecran += entre(C, 0.48, 0.5, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
    ${texte(SX + SL / 2, SY + SH / 2, t('Après la correction', 'After the fix'), { taille: 16, couleur: VERT, poids: 800, ancre: 'middle' })}`, 0.003);
  corps += T.ecran(ecran);

  // ------------------------------------------------------------ l'en-tête des actes
  const DX = 400;
  corps += entre(C, AV.de, AV.a, `
    <rect x="${DX}" y="94" width="176" height="28" rx="14" fill="${ROUGE}" fill-opacity="0.14" stroke="${ROUGE}" stroke-opacity="0.6"/>
    ${texte(DX + 88, 112.5, t('AVANT LA CORRECTION', 'BEFORE THE FIX'), { taille: 11, couleur: ROUGE, police: MONO, poids: 700, ancre: 'middle' })}
    ${texte(DX + 196, 113, '_base ??= await _ouvrir();', { taille: 13, couleur: TITRE, police: MONO })}
    ${texte(DX + 430, 113, t('// la base, gardée une fois ouverte', '// the database, kept once open'), { taille: 12, couleur: DISCRET, police: MONO })}`, 0.004);
  corps += entre(C, AP.de, AP.a, `
    <rect x="${DX}" y="94" width="176" height="28" rx="14" fill="${VERT}" fill-opacity="0.14" stroke="${VERT}" stroke-opacity="0.6"/>
    ${texte(DX + 88, 112.5, t('APRÈS', 'AFTER'), { taille: 11, couleur: VERT, police: MONO, poids: 700, ancre: 'middle' })}
    ${texte(DX + 196, 113, 'if (_ouverture != null) return _ouverture;', { taille: 13, couleur: TITRE, police: MONO })}
    ${texte(DX + 560, 113, t('// le futur, gardé dès le départ', '// the future, kept from the start'), { taille: 12, couleur: DISCRET, police: MONO })}`, 0.004);

  // ------------------------------------------------------------ le schéma
  const AX = 400, AL = 210, BX = 690, BL = 230, CX = 1000, CLG = 220;
  const RANG = [178, 246, 314];
  const H = 52;
  corps += rubrique(AX, 158, t('QUI DEMANDE', 'WHO ASKS'));
  corps += rubrique(BX, 158, t('L’OUVERTURE', 'THE OPENING'));
  corps += rubrique(CX, 158, t('SUR LE DISQUE', 'ON DISK'));
  const demandeurs = [
    ['repertoireProvider', t('la grille des fiches', 'the grid of people')],
    ['villesProvider', t('les pastilles de ville', 'the city chips')],
    ['statistiquesProvider', t('l’onglet Stats', 'the Stats tab')],
  ];
  demandeurs.forEach(([nom, sous], i) => {
    const y = RANG[i];
    corps += `<rect x="${AX}" y="${y}" width="${AL}" height="${H}" rx="12" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${AX}" y="${y + 12}" width="3" height="${H - 24}" rx="1.5" fill="${VIOLET}"/>
      ${texte(AX + 16, y + 22, nom, { taille: 12, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(AX + 16, y + 40, sous, { taille: 11.5 })}
      ${ACTES.map((a) => `<rect x="${AX}" y="${y}" width="${AL}" height="${H}" rx="12" fill="none" stroke="${VIOLET}" stroke-width="1.5" opacity="0">${visible(C, a.demande, a.demande + 0.05)}</rect>`).join('')}`;
  });
  // La fiche qui écrit, sous les trois : elle n'arrive qu'à l'enregistrement.
  const FY = 382;
  const ecrit = `<rect x="${AX}" y="${FY}" width="${AL}" height="${H}" rx="12" fill="${CARTE}" stroke="${ACCENT}" stroke-opacity="0.7"/>
    ${texte(AX + 16, FY + 22, t('la fiche d’Enzo', 'Enzo’s card'), { taille: 12, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(AX + 16, FY + 40, t('écrit : ville = Auray', 'writes: city = Auray'), { taille: 11.5, couleur: ACCENT })}`;
  corps += entre(C, AV.sauve, AV.a, ecrit, 0.004) + entre(C, AP.sauve, AP.a, ecrit, 0.004);

  /// Un lien courbe qui se trace de [de] à [de + 0.02], visible jusqu'à [a].
  const lien = (x1, y1, x2, y2, de, a, couleur = FIL, extra = '') => {
    const mx = (x1 + x2) / 2;
    const L = Math.round(Math.hypot(x2 - x1, y2 - y1) * 1.2 + 10);
    // Un lien en pointillé porte déjà son stroke-dasharray : il apparaît
    // en fondu au lieu de se tracer. Deux fois le même attribut sur un
    // élément, et GitHub refuse tout le fichier.
    const pointille = extra.includes('stroke-dasharray');
    return `<path d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round" ${extra}
      ${pointille ? '' : `stroke-dasharray="${L}" stroke-dashoffset="${L}"`} opacity="0">
      ${pointille ? '' : fondu('stroke-dashoffset', C, [[0, L], [de, L], [Math.min(de + 0.02, 1), 0], [1, 0]])}
      ${visible(C, de, a, 0.004)}</path>`;
  };
  /// Une bille qui court sur le même tracé, une fois.
  const bille = (x1, y1, x2, y2, de, couleur = '#FFFFFF') => {
    const mx = (x1 + x2) / 2, a = Math.min(de + 0.025, 0.999);
    const mouvement = `<animateMotion dur="${C}s" repeatCount="indefinite" path="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" keyPoints="0;0;1;1" keyTimes="0;${de.toFixed(4)};${a.toFixed(4)};1" calcMode="linear"/>`;
    return `<circle r="8" fill="${couleur}" opacity="0" filter="url(#halo)">${mouvement}${visible(C, de, a, 0.003)}</circle>`;
  };

  // --- Avant : trois ouvertures, puis deux fichiers.
  const V = AV;
  const E1 = V.demande + 0.035, E2 = V.demande + 0.085, E3 = V.demande + 0.14, E4 = V.demande + 0.19;
  const n = (i) => t(`n°${i + 1}`, `#${i + 1}`);
  RANG.forEach((y, i) => {
    corps += lien(AX + AL, y + H / 2, BX, y + H / 2, V.demande, V.a, VIOLET);
    corps += bille(AX + AL, y + H / 2, BX, y + H / 2, V.demande);
    corps += entre(C, V.demande + 0.015, V.a, `<rect x="${BX}" y="${y}" width="${BL}" height="${H}" rx="12" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(BX + 16, y + 22, `_ouvrir() ${n(i)}`, { taille: 12.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${entre(C, V.demande + 0.015, E1, texte(BX + 16, y + 40, t('se lance', 'starts'), { taille: 11.5 }), 0.003)}`, 0.004);
  });
  // Le fichier d'origine.
  const F1 = 196, F2 = 318, FH = 64;
  corps += entre(C, 0, V.a, `<rect x="${CX}" y="${F1}" width="${CLG}" height="${FH}" rx="12" fill="${CARTE}" stroke="${BORD}"/>
    ${icone('base', CX + 16, F1 + 24, TEXTE)}
    ${texte(CX + 42, F1 + 28, 'bodycount.db', { taille: 13, couleur: TITRE, police: MONO, poids: 700 })}
    ${entre(C, 0, E3, texte(CX + 42, F1 + 46, t('chiffré, le seul', 'encrypted, the only one'), { taille: 11.5 }), 0.003)}
    ${entre(C, E3, V.a, texte(CX + 42, F1 + 46, t('effacé, encore ouvert', 'deleted, still open'), { taille: 11.5, couleur: OR }), 0.003)}
    <rect x="${CX}" y="${F1}" width="${CLG}" height="${FH}" rx="12" fill="none" stroke="${OR}" stroke-width="1.5" stroke-dasharray="6 5" opacity="0">${visible(C, E3, V.a, 0.004)}</rect>`, 0.004);
  // n°2 et n°3 arrivent sur le fichier ; n°1 aussi, d'abord.
  RANG.forEach((y, i) => corps += lien(BX + BL, y + H / 2, CX, F1 + FH / 2, E1 - 0.01, i === 0 ? E2 : V.a, i === 0 ? FIL : TEXTE));
  // n°2 vérifie la clé et ferme la connexion de n°1.
  corps += entre(C, E1, V.a, `<path d="M${BX + BL - 30} ${RANG[1]} q 18 -12 0 -16" fill="none" stroke="${ROUGE}" stroke-width="2" stroke-linecap="round"/>
    ${entre(C, E1, E2 + 0.03, texte(BX + 16, RANG[1] + 40, t('vérifie la clé, ferme n°1', 'checks the key, closes #1'), { taille: 11.5, couleur: ROUGE }), 0.003)}
    ${entre(C, E2 + 0.03, V.a, texte(BX + 16, RANG[1] + 40, t('ouverte sur l’ancien', 'open on the old one'), { taille: 11.5 }), 0.003)}
    ${texte(BX + 16, RANG[2] + 40, t('ouverte sur l’ancien', 'open on the old one'), { taille: 11.5 })}`, 0.004);
  corps += entre(C, E2, V.a, `${icone('croix', BX + BL - 26, RANG[0] + 18, ROUGE, 1)}
    ${entre(C, E2, E3, texte(BX + 16, RANG[0] + 40, t('échoue : « base en clair ? »', 'fails: "plain database?"'), { taille: 11.5, couleur: ROUGE }), 0.003)}
    ${entre(C, E3, V.a, texte(BX + 16, RANG[0] + 40, t('la recopie, efface l’ancien', 'copies it, deletes the old'), { taille: 11.5, couleur: OR }), 0.003)}`, 0.004);
  // La copie, un second fichier.
  corps += entre(C, E3, V.a, `<rect x="${CX}" y="${F2}" width="${CLG}" height="${FH}" rx="12" fill="${CARTE}" stroke="${OR}" stroke-opacity="0.8"/>
    ${icone('base', CX + 16, F2 + 24, OR)}
    ${texte(CX + 42, F2 + 28, 'bodycount.db', { taille: 13, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(CX + 42, F2 + 46, t('la copie, un autre fichier', 'the copy, another file'), { taille: 11.5, couleur: OR })}`, 0.004);
  corps += lien(CX + CLG / 2, F1 + FH, CX + CLG / 2, F2, E3 - 0.01, V.a, OR, 'stroke-dasharray="4 5"');
  corps += lien(BX + BL, RANG[0] + H / 2, CX, F2 + FH / 2, E3, V.a, OR);
  // La fiche écrit par n°1 dans la copie ; le répertoire lit l'ancien.
  corps += lien(AX + AL, FY + H / 2, BX, RANG[0] + H / 2 + 8, V.sauve, V.a, ACCENT);
  corps += bille(AX + AL, FY + H / 2, BX, RANG[0] + H / 2 + 8, V.sauve + 0.005, ACCENT);
  corps += bille(BX + BL, RANG[0] + H / 2, CX, F2 + FH / 2, V.sauve + 0.03, ACCENT);
  corps += bille(CX, F1 + FH / 2, BX + BL, RANG[1] + H / 2, V.retour, ROUGE);

  // --- Après : une ouverture, un fichier.
  const P = AP;
  const P1 = P.demande + 0.03, P2 = P.demande + 0.07;
  const BY = RANG[0], BH = RANG[2] + H - RANG[0];
  corps += entre(C, P.demande, P.a, `<rect x="${BX}" y="${BY}" width="${BL}" height="${BH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>
    <rect x="${BX}" y="${BY}" width="${BL}" height="${BH}" rx="14" fill="none" stroke="${VERT}" stroke-width="1.5" opacity="0">${visible(C, P2, P.a, 0.004)}</rect>
    ${texte(BX + 18, BY + 30, 'Future<Database>?', { taille: 12, couleur: DISCRET, police: MONO })}
    ${texte(BX + 18, BY + 52, '_ouverture', { taille: 17, couleur: TITRE, police: MONO, poids: 700 })}
    ${entre(C, P.demande, P1, `<circle cx="${BX + 26}" cy="${BY + 84}" r="6" fill="none" stroke="${VIOLET}" stroke-width="2" stroke-dasharray="24 12">
        <animateTransform attributeName="transform" type="rotate" from="0 ${BX + 26} ${BY + 84}" to="360 ${BX + 26} ${BY + 84}" dur="0.9s" repeatCount="indefinite"/></circle>
      ${texte(BX + 40, BY + 88, t('ouverture en cours', 'opening in progress'), { taille: 12, couleur: VIOLET })}`, 0.003)}
    ${entre(C, P1, P2, texte(BX + 18, BY + 88, t('déjà là : on la rend', 'already there: hand it over'), { taille: 12, couleur: VIOLET }), 0.003)}
    ${entre(C, P2, P.a, texte(BX + 18, BY + 88, t('ouverte, une connexion', 'open, one connection'), { taille: 12, couleur: VERT, poids: 700 }), 0.003)}
    <line x1="${BX + 18}" y1="${BY + 106}" x2="${BX + BL - 18}" y2="${BY + 106}" stroke="${BORD}"/>
    ${texte(BX + 18, BY + 128, t('1re demande : la lance', '1st request: starts it'), { taille: 11.5 })}
    ${entre(C, P1, P.a, texte(BX + 18, BY + 148, t('2e et 3e : la même, attendue', '2nd and 3rd: the same, awaited'), { taille: 11.5 }), 0.003)}
    ${entre(C, P2, P.a, texte(BX + 18, BY + 168, t('ratée, elle s’oublie', 'if it fails, it is dropped'), { taille: 11.5, couleur: DISCRET }), 0.003)}`, 0.004);
  RANG.forEach((y, i) => {
    const de = i === 0 ? P.demande : P1;
    corps += lien(AX + AL, y + H / 2, BX, BY + 40 + i * 40, de, P.a, i === 0 ? VIOLET : TEXTE);
    corps += bille(AX + AL, y + H / 2, BX, BY + 40 + i * 40, de);
  });
  const FA = F1 + 50;
  corps += entre(C, P.de, P.a, `<rect x="${CX}" y="${FA}" width="${CLG}" height="${FH}" rx="12" fill="${CARTE}" stroke="${BORD}"/>
    <rect x="${CX}" y="${FA}" width="${CLG}" height="${FH}" rx="12" fill="none" stroke="${VERT}" stroke-opacity="0.7" opacity="0">${visible(C, P2, P.a, 0.004)}</rect>
    ${icone('base', CX + 16, FA + 24, VERT)}
    ${texte(CX + 42, FA + 28, 'bodycount.db', { taille: 13, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(CX + 42, FA + 46, t('chiffré, le seul', 'encrypted, the only one'), { taille: 11.5 })}`, 0.004);
  corps += lien(BX + BL, BY + BH / 2, CX, FA + FH / 2, P1 + 0.01, P.a, VERT);
  corps += lien(AX + AL, FY + H / 2, BX, BY + BH - 20, P.sauve, P.a, ACCENT);
  corps += bille(AX + AL, FY + H / 2, BX, BY + BH - 20, P.sauve + 0.005, ACCENT);
  corps += bille(BX + BL, BY + BH / 2, CX, FA + FH / 2, P.sauve + 0.03, ACCENT);
  corps += bille(CX, FA + FH / 2, BX + BL, BY + BH / 2 - 10, P.retour, VERT);

  // --- La phrase du moment, sous le schéma.
  const phrases = [
    [V.de, V.demande, t('Au déverrouillage, trois écrans vont demander la base.', 'On unlock, three screens are about to ask for the database.'), TEXTE],
    [V.demande, E1, t('Trois demandes au même instant : chacune lance sa propre ouverture.', 'Three requests at the same instant: each starts its own opening.'), VIOLET],
    [E1, E2, t('La n°2 vérifie la clé et ferme au passage la connexion de la n°1.', 'Number 2 checks the key and closes number 1’s connection on the way.'), ROUGE],
    [E2, E3, t('La n°1 échoue, et en conclut que la base est en clair.', 'Number 1 fails, and concludes the database is in the clear.'), ROUGE],
    [E3, V.sauve, t('Elle la « convertit » : copie, puis efface le fichier. Il y en a deux.', 'It "converts" it: copies, then deletes the file. Now there are two.'), OR],
    [V.sauve, V.retour, t('La fiche enregistre Auray, dans la copie.', 'The card saves Auray, into the copy.'), ACCENT],
    [V.retour, V.a, t('Le répertoire lit l’ancien fichier : Enzo est toujours à Vannes.', 'The people list reads the old file: Enzo is still in Vannes.'), ROUGE],
    [P.de, P.demande, t('Même déverrouillage, avec le futur gardé.', 'Same unlock, with the future kept.'), TEXTE],
    [P.demande, P1, t('La première demande lance l’ouverture, et le futur est gardé aussitôt.', 'The first request starts the opening, and the future is kept at once.'), VIOLET],
    [P1, P2, t('Les deux autres reçoivent le même futur et l’attendent.', 'The other two get the same future and wait for it.'), VIOLET],
    [P2, P.sauve, t('Une connexion, un fichier : tout le monde lit et écrit au même endroit.', 'One connection, one file: everyone reads and writes in the same place.'), VERT],
    [P.sauve, P.retour, t('La fiche enregistre Auray.', 'The card saves Auray.'), ACCENT],
    [P.retour, P.a, t('Le répertoire relit le même fichier : Auray, aussitôt.', 'The people list rereads the same file: Auray, right away.'), VERT],
  ];
  corps += `<rect x="${AX}" y="450" width="820" height="46" rx="12" fill="${CARTE}" stroke="${BORD}"/>`;
  phrases.forEach(([de, a, s, c]) => {
    corps += entre(C, de, a, `<circle cx="${AX + 22}" cy="473" r="4.5" fill="${c}"/>${texte(AX + 38, 478, s, { taille: 14, couleur: TITRE, poids: 600 })}`, 0.004);
  });

  // ------------------------------------------------ trois cartes du bas
  const bas = [
    [OR, t('Jugée sur son en-tête', 'Judged by its header'),
      t('Une base n’est prise pour du clair que si', 'A database only counts as plain if it'), t('elle commence par « SQLite format 3 ».', 'starts with "SQLite format 3".')],
    [VERT, t('Réparée au lancement', 'Repaired at launch'),
      t('Celle qui a perdu son numéro de version', 'One that lost its version number'), t('repasse par les migrations qui manquent.', 'goes back through the missing migrations.')],
    [VIOLET, t('Une ratée s’oublie', 'A failed one is dropped'),
      t('La suivante retente au lieu de rendre', 'The next one tries again instead of'), t('toujours la même erreur.', 'returning the same error forever.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = 400 + i * 280, y = 516;
    corps += `<rect x="${x}" y="${y}" width="260" height="92" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y + 14}" width="3" height="64" rx="1.5" fill="${c}"/>
      ${texte(x + 20, y + 30, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 53, l1, { taille: 12 })}
      ${texte(x + 20, y + 71, l2, { taille: 12 })}`;
  });
  // Les migrations, de v1 à v7 : chacune ne fait que ce qui manque.
  const mig = [
    ['v2', t('étiquettes, demi-points', 'tags, half points')],
    ['v3', t('genre et rôle', 'gender and role')],
    ['v4', t('montant', 'amount')],
    ['v5', t('adresse', 'address')],
    ['v6', t('vidéos', 'videos')],
    ['v7', t('vignettes', 'thumbnails')],
  ];
  corps += `<rect x="400" y="624" width="820" height="52" rx="13" fill="${CARTE}" stroke="${BORD}"/>`;
  corps += texte(418, 655, t('SCHÉMA v7', 'SCHEMA v7'), { taille: 11.5, couleur: ACCENT, police: MONO, poids: 700, extra: 'letter-spacing="1.5"' });
  let mx = 520;
  mig.forEach(([v, s]) => {
    const l = Math.round(s.length * 6.3 + 44);
    corps += `<rect x="${mx}" y="637" width="${l}" height="26" rx="13" fill="${VIOLET}" fill-opacity="0.1" stroke="${VIOLET}" stroke-opacity="0.35"/>
      ${texte(mx + 12, 654, v, { taille: 11, couleur: ACCENT, police: MONO, poids: 700 })}
      ${texte(mx + 34, 654, s, { taille: 11, couleur: TEXTE })}`;
    mx += l + 8;
  });

  svg('ouverture.svg', 1280, 720, corps, t(
    'Une seule ouverture de la base. Au déverrouillage, le répertoire, les villes et les statistiques demandent la base au même instant. Avant la correction, chacun lançait sa propre ouverture : la deuxième vérifiait la clé et fermait au passage la connexion de la première, qui échouait, croyait la base en clair et la recopiait en effaçant le fichier. L’application tournait alors sur deux fichiers : la fiche d’Enzo enregistrait Auray dans la copie, et le répertoire, qui lisait l’ancien, le montrait toujours à Vannes. Après la correction, la base garde le futur de son ouverture : la première demande la lance, les deux autres attendent la même, et tout le monde lit et écrit dans un seul fichier chiffré ; Auray s’affiche aussitôt. Une base n’est jugée en clair que sur son en-tête, celle qui a perdu son numéro de version repasse par les migrations jusqu’au schéma v7, et une ouverture ratée s’oublie pour que la suivante retente.',
    'A single database opening. On unlock, the people list, the cities and the statistics ask for the database at the same instant. Before the fix, each started its own opening: the second checked the key and closed the first one’s connection on the way; the first failed, took the database for plain and copied it, deleting the file. The app then ran on two files: Enzo’s card saved Auray into the copy, and the people list, reading the old one, still showed him in Vannes. After the fix, the database keeps the future of its opening: the first request starts it, the other two wait for the same one, and everyone reads and writes one encrypted file; Auray shows up right away. A database is only judged plain by its header, one that lost its version number goes back through the migrations up to schema v7, and a failed opening is dropped so the next one tries again.'));
};

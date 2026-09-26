// Chercher et trier le répertoire : la recherche qui filtre à chaque
// lettre, la pastille d'une ville, puis les quatre tris.
//
// À gauche, le téléphone : on tape « emb », les fiches fondent jusqu'aux
// quatre qui portent « Embrasse bien » ; on efface, on touche Vannes, puis
// Mieux notés, Plus vues et A à Z, et les cartes glissent à leur nouvelle
// place. À droite, la requête de lib/donnees/depots.dart se réécrit en
// même temps, et ce qui décide de l'ordre s'affiche. Dessous, la rangée
// de pastilles expliquée, et trois cartes.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, paliers, fondu, visible, entre, telephone, toucher, frappe, icone, visage,
    cartePersonne, barreNav, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE } = O;
  const C = 34;
  const D = 0.018; // la durée d'un glissement de carte

  // ---------------------------------------------------------- la chronologie
  const CHAMP = 0.055;                       // le doigt sur le champ
  const LETTRES = [0.085, 0.11, 0.135];      // e, m, b
  const CROIX = 0.3;                         // on efface
  const VILLE = 0.35, MIEUX = 0.47, VUES = 0.6, AZ = 0.75;
  const FIN = 0.985;

  // Le jeu d'essai, dans l'ordre que rend chaque état du filtre.
  const tous = ['adam', 'nathan', 'kelyan', 'lou', 'matteo', 'jade'];
  const phases = [
    [0, tous],
    [LETTRES[1], ['lou', 'emma', 'enzo', 'gabriel', 'noa']],
    [LETTRES[2], ['lou', 'enzo', 'gabriel', 'noa']],
    [CROIX, tous],
    [VILLE, ['lou', 'enzo', 'gabriel', 'noa', 'tom', 'ibrahim', 'chloe']],
    [MIEUX, ['noa', 'gabriel', 'ibrahim', 'lou', 'enzo', 'tom', 'chloe']],
    [VUES, ['noa', 'ibrahim', 'lou', 'gabriel', 'enzo', 'tom', 'chloe']],
    [AZ, ['chloe', 'enzo', 'gabriel', 'ibrahim', 'lou', 'noa', 'tom']],
  ];

  let corps = entete(t('LE RÉPERTOIRE', 'THE PEOPLE LIST'),
    t('Chaque lettre refait la requête. Les pastilles se cumulent, les tris réordonnent.',
      'Every letter reruns the query. Chips add up, sorts reorder.'));

  // ------------------------------------------------------------ le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';

  // L'en-tête : le titre, le bouton des réglages, le champ.
  ecran += `${texte(SX + 18, SY + 44, t('RÉPERTOIRE', 'PEOPLE'), { taille: 15, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
    <rect x="${SX + SL - 52}" y="${SY + 24}" width="36" height="36" rx="12" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
    <path d="M${SX + SL - 43} ${SY + 37} h18 M${SX + SL - 43} ${SY + 47} h18" stroke="${APP.second}" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="${SX + SL - 30}" cy="${SY + 37}" r="2.6" fill="${APP.fond}" stroke="${APP.second}" stroke-width="1.6"/>
    <circle cx="${SX + SL - 38}" cy="${SY + 47}" r="2.6" fill="${APP.fond}" stroke="${APP.second}" stroke-width="1.6"/>`;
  const FY = SY + 70;
  ecran += `<rect x="${SX + 12}" y="${FY}" width="${SL - 24}" height="38" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    <rect x="${SX + 12}" y="${FY}" width="${SL - 24}" height="38" rx="14" fill="none" stroke="${APP.violet}" stroke-width="1.4" opacity="0">${visible(C, CHAMP, CROIX + 0.004, 0.004)}</rect>
    ${icone('loupe', SX + 26, FY + 11, APP.second, 1)}`;
  ecran += `<g>${paliers('opacity', C, [[0, 1], [LETTRES[0], 0], [CROIX, 1]])}
    ${texte(SX + 50, FY + 24, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 12, couleur: APP.discret })}</g>`;
  ecran += entre(C, LETTRES[0], CROIX, frappe(SX + 50, FY + 24, 'emb', C, LETTRES[0] - 0.012, LETTRES[2], { taille: 13, couleur: APP.texte, poids: 600 }) +
    `<rect x="${SX + 51}" y="${FY + 12}" width="1.6" height="16" fill="${APP.violet}">
      ${fondu('x', C, [[0, SX + 51], [LETTRES[0] - 0.012, SX + 51], [LETTRES[2], SX + 79], [1, SX + 79]])}
      <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="1;1;0;0" keyTimes="0;0.5;0.5;1"/></rect>
    ${icone('croix', SX + SL - 40, FY + 11, APP.second, 1)}`, 0.004);
  ecran += toucher(SX + 120, FY + 19, C, CHAMP) + toucher(SX + SL - 32, FY + 19, C, CROIX);

  // La rangée de pastilles, qui défile pour montrer Vannes puis A à Z.
  const PY = FY + 50, PH = 27;
  const tris = [t('Récents', 'Recent'), t('Mieux notés', 'Top rated'), t('Plus vues', 'Most seen'), t('A à Z', 'A to Z')];
  const villes = ['Vannes', 'Rennes', 'Nantes', 'Lorient'];
  const etiqs = [t('Sportif', 'Athletic'), t('Endurant', 'Stamina'), t('Embrasse bien', 'Good kisser')];
  // Quand chaque pastille est allumée : [de, a] en fraction du cycle.
  const actif = {
    [tris[0]]: [[0, MIEUX]], [tris[1]]: [[MIEUX, VUES]], [tris[2]]: [[VUES, AZ]], [tris[3]]: [[AZ, 1]],
    Vannes: [[VILLE, 1]],
  };
  /// Une rangée de pastilles, comme _Chip dans repertoire.dart.
  function rangee(x0, y, h, taille, { max = 99, suite = false } = {}) {
    const items = [...tris.map((s) => [s, false]), ...villes.map((s) => [s, false]), ...etiqs.slice(0, max).map((s) => [s, true])];
    let s = '', x = x0;
    const pos = {};
    for (const [lib, etiq] of items) {
      const l = Math.round(lib.length * taille * 0.6 + taille * 2.2 + (etiq ? taille * 1.3 : 0));
      pos[lib] = [x, l];
      const fen = actif[lib] || [];
      const tx = x + taille * 1.1 + (etiq ? taille * 1.3 : 0);
      s += `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${h / 2}" fill="none" stroke="#FFFFFF" stroke-opacity="0.11"/>
        ${etiq ? `<path d="M${x + taille * 1.1} ${y + h / 2 - taille * 0.4} h${taille * 0.45} l${taille * 0.45} ${taille * 0.4} l-${taille * 0.45} ${taille * 0.4} h-${taille * 0.45} z" fill="none" stroke="${APP.discret}" stroke-width="1.2"/>` : ''}
        ${texte(tx, y + h / 2 + taille * 0.36, lib, { taille, couleur: APP.second, poids: 600 })}`;
      if (fen.length) {
        const etapes = [[0, 0]];
        for (const [de, a] of fen) { etapes.push([de, 1]); if (a < 1) etapes.push([a, 0]); }
        s += `<g opacity="0">${paliers('opacity', C, etapes)}
          <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${h / 2}" fill="url(#marque)"/>
          ${texte(tx, y + h / 2 + taille * 0.36, lib, { taille, couleur: '#12071F', poids: 800 })}</g>`;
      }
      x += l + taille * 0.7;
    }
    if (suite) s += texte(x + 2, y + h / 2 + taille * 0.36, '…', { taille, couleur: APP.second, poids: 700 });
    return { s, pos };
  }
  const R = rangee(SX + 12, PY, PH, 10.5);
  // Le défilement : de quoi amener Vannes, puis A à Z, sous le doigt.
  const decV = -(R.pos.Vannes[0] - (SX + 60));
  const decAZ = -(R.pos[tris[3]][0] - (SX + 110));
  const defile = [[0, '0 0'], [CROIX + 0.015, '0 0'], [CROIX + 0.035, `${decV} 0`], [0.43, `${decV} 0`], [0.45, '0 0'],
    [0.715, '0 0'], [0.735, `${decAZ} 0`], [FIN, `${decAZ} 0`], [0.998, '0 0'], [1, '0 0']];
  const cx = (lib, dec) => R.pos[lib][0] + R.pos[lib][1] / 2 + dec;
  ecran += `<g><animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${defile.map((e) => e[0]).join(';')}" values="${defile.map((e) => e[1]).join(';')}"/>${R.s}</g>`;
  ecran += toucher(cx('Vannes', decV), PY + PH / 2, C, VILLE) + toucher(cx(tris[1], 0), PY + PH / 2, C, MIEUX) +
    toucher(cx(tris[2], 0), PY + PH / 2, C, VUES) + toucher(cx(tris[3], decAZ), PY + PH / 2, C, AZ);

  // La grille : chaque personne a sa carte, qui glisse de place en place.
  const GX = SX + 12, GY = PY + 44, CL = (SL - 36) / 2, CH = 140;
  const place = (i) => [GX + (i % 2) * (CL + 12), GY + Math.floor(i / 2) * (CH + 12)];
  const presents = new Set(phases.flatMap(([, l]) => l));
  let grille = '';
  for (const cle of presents) {
    const pos = phases.map(([, l]) => (l.includes(cle) ? place(l.indexOf(cle)) : null));
    let dernier = pos.find(Boolean);
    const tr = [[0, (pos[0] || dernier).join(' ')]], op = [[0, pos[0] ? 1 : 0]];
    for (let k = 1; k < phases.length; k++) {
      const s = phases[k][0], avant = pos[k - 1], apres = pos[k];
      if (avant && apres) { tr.push([s, avant.join(' ')], [s + D, apres.join(' ')]); op.push([s, 1], [s + D, 1]); }
      else if (apres) { tr.push([s, apres.join(' ')], [s + D, apres.join(' ')]); op.push([s, 0], [s + D, 1]); }
      else if (avant) { tr.push([s, avant.join(' ')], [s + D, avant.join(' ')]); op.push([s, 1], [s + D, 0]); }
      if (apres) dernier = apres;
    }
    tr.push([1, dernier.join(' ')]);
    op.push([1, op[op.length - 1][1]]);
    grille += `<g opacity="${op[0][1]}">
      <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${tr.map((e) => e[0]).join(';')}" values="${tr.map((e) => e[1]).join(';')}"/>
      ${fondu('opacity', C, op)}
      ${cartePersonne(GENS[cle], 0, 0, CL, CH, { premier: cle === 'noa' })}</g>`;
  }
  const grilleClip = O.id('grille');
  ecran += `<clipPath id="${grilleClip}"><rect x="${SX}" y="${GY - 3}" width="${SL}" height="${SH}"/></clipPath>
    <g clip-path="url(#${grilleClip})">${grille}</g>`;
  ecran += barreNav(T, 'Fiches');
  corps += T.ecran(`<g>${fondu('opacity', C, [[0, 0], [0.008, 1], [FIN, 1], [0.997, 0], [1, 0]])}${ecran}</g>`);

  // ------------------------------------------------ la requête, réécrite
  const QX = 400, QL = 430, QY = 96;
  corps += rubrique(QX, QY + 12, t('LA REQUÊTE, À CHAQUE CHANGEMENT', 'THE QUERY, ON EVERY CHANGE'));
  corps += `<rect x="${QX}" y="${QY + 26}" width="${QL}" height="250" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  // Le compteur de fiches.
  const comptes = [[0, 18], [LETTRES[1], 5], [LETTRES[2], 4], [CROIX, 18], [VILLE, 7]];
  comptes.forEach(([de, n], i) => {
    const a = i + 1 < comptes.length ? comptes[i + 1][0] : 1;
    corps += entre(C, de, a, `${texte(QX + QL - 20, QY + 60, String(n), { taille: 26, couleur: TITRE, poids: 800, ancre: 'end' })}`, 0.003);
  });
  corps += texte(QX + QL - 20, QY + 78, t('fiches', 'people'), { taille: 11, couleur: DISCRET, ancre: 'end' });
  const lx = QX + 20, ly = (i) => QY + 56 + i * 23;
  const code = (i, s, c = TEXTE, x = lx) => texte(x, ly(i), s, { taille: 12, couleur: c, police: MONO });
  const MOT = '#C792EA', CHAINE = VERT;
  corps += `${texte(lx, ly(0), 'SELECT', { taille: 12, couleur: MOT, police: MONO, poids: 700 })}${code(0, 'p.*, COUNT(r.id) AS nb,', TEXTE, lx + 52)}
    ${code(1, 'AVG(r.note) AS moyenne', TEXTE, lx + 52)}
    ${texte(lx, ly(2), 'FROM', { taille: 12, couleur: MOT, police: MONO, poids: 700 })}${code(2, 'personnes p LEFT JOIN rencontres r', TEXTE, lx + 52)}`;
  // Le WHERE : rien, puis la recherche lettre à lettre, puis la ville.
  const w = (i, avant, chaine, apres = '', x = lx) => `<text x="${x}" y="${ly(i)}" font-family="${MONO}" font-size="12" fill="${TEXTE}" xml:space="preserve">${O.esc(avant)}<tspan fill="${CHAINE}" font-weight="700">${O.esc(chaine)}</tspan>${O.esc(apres)}</text>`;
  const where = (i) => texte(lx, ly(i), 'WHERE', { taille: 12, couleur: MOT, police: MONO, poids: 700 });
  const sansFiltre = code(3, t('-- aucun filtre', '-- no filter'), DISCRET);
  corps += entre(C, 0, LETTRES[0], sansFiltre, 0.003) + entre(C, CROIX, VILLE, sansFiltre, 0.003);
  const motifs = ['e', 'em', 'emb'];
  motifs.forEach((m, i) => {
    const de = LETTRES[i], a = i < 2 ? LETTRES[i + 1] : CROIX;
    const q = `'%${m}%'`;
    corps += entre(C, de, a, `${where(3)}${w(3, '(p.prenom LIKE ', q, '', lx + 52)}
      ${w(4, 'OR p.ville LIKE ', q, '', lx + 66)}
      ${w(5, 'OR ' + t('étiquette', 'tag') + ' LIKE ', q, ')', lx + 66)}`, 0.003);
  });
  corps += entre(C, VILLE, 1, `${where(3)}${w(3, 'p.ville = ', "'Vannes'", '', lx + 52)}
    ${code(4, t('-- égalité exacte, pas un LIKE', '-- exact match, not a LIKE'), DISCRET, lx + 52)}`, 0.003);
  corps += `${texte(lx, ly(6), 'GROUP BY', { taille: 12, couleur: MOT, police: MONO, poids: 700 })}${code(6, 'p.id', TEXTE, lx + 74)}
    ${texte(lx, ly(7), 'ORDER BY', { taille: 12, couleur: MOT, police: MONO, poids: 700 })}`;
  const ordres = [[0, MIEUX, 'derniere DESC'], [MIEUX, VUES, 'moyenne DESC'], [VUES, AZ, 'nb DESC'], [AZ, 1, 'p.prenom COLLATE NOCASE']];
  ordres.forEach(([de, a, s]) => {
    corps += entre(C, de, a, `${texte(lx + 74, ly(7), s, { taille: 12, couleur: OR, police: MONO, poids: 700 })}`, 0.003);
  });
  corps += code(8, t(', p.prenom  -- à égalité', ', p.prenom  -- on a tie'), DISCRET, lx + 74);
  // Un éclair sur la ligne qui vient de changer.
  const eclair = (i, n, a) => `<rect x="${QX + 8}" y="${ly(i) - 16}" width="${QL - 16}" height="${n * 23 + 2}" rx="6" fill="${ACCENT}" opacity="0">
    ${fondu('opacity', C, [[0, 0], [a, 0], [a + 0.004, 0.16], [a + 0.04, 0], [1, 0]])}</rect>`;
  corps += LETTRES.map((a) => eclair(3, 3, a)).join('') + eclair(3, 2, VILLE) + eclair(3, 1, CROIX) +
    [MIEUX, VUES, AZ].map((a) => eclair(7, 1, a)).join('');

  // ------------------------------------------------ ce qui décide
  const DX = 850, DL = 370;
  const panneau = (de, a, titre, contenu) => entre(C, de, a, `${rubrique(DX, QY + 12, titre)}${contenu}`, 0.006);
  corps += `<rect x="${DX}" y="${QY + 26}" width="${DL}" height="250" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const ligne = (i, cle, valeur, c = TITRE, detail = '') => {
    const p = GENS[cle], y = QY + 44 + i * 62;
    return `${visage(p.photo, DX + 18, y, 42, 42, 12)}
      ${texte(DX + 72, y + 19, p.prenom, { taille: 14, couleur: TITRE, poids: 700 })}
      ${texte(DX + 72, y + 36, detail || p.ville, { taille: 11.5 })}
      ${texte(DX + DL - 20, y + 29, valeur, { taille: 20, couleur: c, poids: 800, ancre: 'end' })}`;
  };
  const pied = (s, c = DISCRET) => texte(DX + 20, QY + 256, s, { taille: 12, couleur: c });
  // Récents, par défaut.
  corps += panneau(0, LETTRES[0], t('RÉCENTS, LE TRI PAR DÉFAUT', 'RECENT, THE DEFAULT SORT'),
    ligne(0, 'adam', '1', OR, t('vu en dernier', 'seen last')) + ligne(1, 'nathan', '2', TEXTE) + ligne(2, 'kelyan', '3', TEXTE) +
    pied(t('La dernière rencontre remonte la fiche en haut.', 'The latest encounter brings a card to the top.')));
  // Où la recherche regarde, lettre à lettre.
  const endroits = (etats, sous) => {
    const noms = [t('Prénom', 'First name'), t('Ville', 'City'), t('Étiquettes de la fiche', 'Tags on the card')];
    return noms.map((n, i) => {
      const y = QY + 46 + i * 62, [ok, detail] = etats[i];
      const c = ok ? VERT : DISCRET;
      return `<rect x="${DX + 16}" y="${y}" width="${DL - 32}" height="52" rx="11" fill="${ok ? VERT : FIL}" fill-opacity="${ok ? 0.08 : 0.25}" stroke="${ok ? VERT : BORD}" stroke-opacity="${ok ? 0.45 : 1}"/>
        <circle cx="${DX + 40}" cy="${y + 26}" r="11" fill="${c}" fill-opacity="0.16"/>${icone(ok ? 'coche' : 'croix', DX + 32, y + 18, c)}
        ${texte(DX + 62, y + 22, n, { taille: 13.5, couleur: TITRE, poids: 700 })}
        ${texte(DX + 62, y + 40, detail, { taille: 11.5, couleur: ok ? TEXTE : DISCRET })}`;
    }).join('') + pied(sous);
  };
  corps += panneau(LETTRES[0], LETTRES[1], t('OÙ « e » EST CHERCHÉ', 'WHERE « e » IS LOOKED FOR'), endroits([
    [true, t('Kelyan, Matteo, Gabriel…', 'Kelyan, Matteo, Gabriel…')], [true, t('Vannes, Rennes, Nantes…', 'Vannes, Rennes, Nantes…')],
    [true, t('Douce, Bronzé, Endurant…', 'Soft, Tanned, Stamina…')]], t('Tout le monde a un « e » quelque part : 18 fiches.', 'Everyone has an « e » somewhere: 18 people.')));
  corps += panneau(LETTRES[1], LETTRES[2], t('OÙ « em » EST CHERCHÉ', 'WHERE « em » IS LOOKED FOR'), endroits([
    [true, 'Emma R.'], [false, t('aucune', 'none')], [true, t('Embrasse bien, sur quatre fiches', 'Good kisser, on four cards')]],
    t('Majuscules ou non, « em » trouve Emma.', 'Upper or lower case, « em » finds Emma.')));
  corps += panneau(LETTRES[2], CROIX + 0.02, t('OÙ « emb » EST CHERCHÉ', 'WHERE « emb » IS LOOKED FOR'), endroits([
    [false, t('plus personne', 'nobody left')], [false, t('aucune', 'none')], [true, t('Embrasse bien, sur quatre fiches', 'Good kisser, on four cards')]],
    t('Un champ, trois endroits : il suffit d’un seul.', 'One field, three places: one is enough.')));
  // La pastille de ville.
  corps += panneau(CROIX + 0.02, MIEUX, t('LA PASTILLE « VANNES »', 'THE « VANNES » CHIP'), `
    ${texte(DX + 20, QY + 70, t('Les pastilles de ville sont les quatre', 'The city chips are the four cities'), { taille: 13.5, couleur: TITRE, poids: 700 })}
    ${texte(DX + 20, QY + 90, t('qui comptent le plus de fiches.', 'with the most people.'), { taille: 13.5, couleur: TITRE, poids: 700 })}
    ${['Vannes', 'Rennes', 'Nantes', 'Lorient'].map((v, i) => {
      const n = [7, 2, 2, 2][i], y = QY + 116 + i * 30, lmax = DL - 150;
      return `${texte(DX + 20, y + 11, v, { taille: 12, couleur: i ? TEXTE : TITRE, poids: i ? 400 : 700 })}
        <rect x="${DX + 90}" y="${y}" width="${lmax}" height="14" rx="7" fill="${FIL}" fill-opacity="0.45"/>
        <rect x="${DX + 90}" y="${y}" width="${(lmax * n) / 7}" height="14" rx="7" fill="${i ? VIOLET : 'url(#marque)'}" fill-opacity="${i ? 0.55 : 1}"/>
        ${texte(DX + DL - 20, y + 11.5, String(n), { taille: 12, couleur: i ? TEXTE : TITRE, police: MONO, poids: 700, ancre: 'end' })}`;
    }).join('')}
    ${pied(t('La retoucher la retire du filtre.', 'Touching it again removes the filter.'))}`);
  // Les trois tris.
  corps += panneau(MIEUX, VUES, t('MIEUX NOTÉS : LA MOYENNE', 'TOP RATED: THE AVERAGE'),
    ligne(0, 'noa', '4,9', OR) + ligne(1, 'gabriel', '4,8') + ligne(2, 'ibrahim', '4,8') +
    pied(t('À égalité, le prénom départage : Gabriel avant Ibrahim.', 'On a tie, the first name decides: Gabriel before Ibrahim.')));
  corps += panneau(VUES, AZ, t('PLUS VUES : LES RENCONTRES', 'MOST SEEN: THE ENCOUNTERS'),
    ligne(0, 'noa', t('14 fois', '14 times'), OR) + ligne(1, 'ibrahim', t('10 fois', '10 times')) + ligne(2, 'lou', t('9 fois', '9 times')) +
    pied(t('Compté dans la même requête, sans relire chaque fiche.', 'Counted in the same query, without rereading each card.')));
  corps += panneau(AZ, 1, t('A À Z : LE PRÉNOM', 'A TO Z: THE FIRST NAME'),
    ligne(0, 'chloe', 'C', OR) + ligne(1, 'enzo', 'E') + ligne(2, 'gabriel', 'G') +
    pied(t('Sans tenir compte des majuscules.', 'Ignoring upper and lower case.')));

  // ------------------------------------------------ la rangée, expliquée
  const RY = 408;
  corps += rubrique(400, RY - 8, t('LA RANGÉE DE PASTILLES, DE GAUCHE À DROITE', 'THE ROW OF CHIPS, LEFT TO RIGHT'));
  const G = rangee(400, RY + 8, 30, 11, { max: 2, suite: true });
  corps += G.s;
  const accolade = (de, a, s, c) => {
    const x1 = G.pos[de][0], x2 = G.pos[a][0] + G.pos[a][1], y = RY + 50;
    return `<path d="M${x1} ${y} v6 h${x2 - x1} v-6" fill="none" stroke="${c}" stroke-opacity="0.7" stroke-width="1.4"/>
      ${texte((x1 + x2) / 2, y + 24, s, { taille: 12, couleur: c, poids: 700, ancre: 'middle' })}`;
  };
  corps += accolade(tris[0], tris[3], t('4 tris, un seul actif', '4 sorts, one at a time'), ACCENT) +
    accolade('Vannes', 'Lorient', t('les 4 villes les plus présentes', 'the 4 busiest cities'), VIOLET) +
    accolade(etiqs[0], etiqs[1], t('les 8 étiquettes les plus portées', 'the 8 most used tags'), OR);

  // ------------------------------------------------ trois cartes du bas
  const bas = [
    [ACCENT, t('Tout se cumule', 'Everything adds up'),
      t('Recherche, ville et étiquette s’ajoutent', 'Search, city and tag stack with AND:'), t('par AND : chaque filtre resserre.', 'each filter narrows the list.')],
    [OR, t('Une étiquette, une clé', 'One tag, one key'),
      t('La pastille compare la clé : « Bronzé »', 'The chip compares the key: « Bronzé »'), t('et « bronze » ne font qu’une.', 'and « bronze » are the same.')],
    [VERT, t('Rouvrir remet à zéro', 'Reopening resets it'),
      t('Au déverrouillage, recherche', 'On unlock, the search and'), t('et pastilles repartent à vide.', 'the chips start out empty.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = 400 + i * 280, y = 520;
    corps += `<rect x="${x}" y="${y}" width="260" height="96" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y + 14}" width="3" height="68" rx="1.5" fill="${c}"/>
      ${texte(x + 20, y + 32, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 55, l1, { taille: 12 })}
      ${texte(x + 20, y + 73, l2, { taille: 12 })}`;
  });
  corps += texte(810, 656, t('Une seule requête sur la base chiffrée rend les fiches, leur nombre de rencontres et leur moyenne.',
    'A single query on the encrypted database returns the cards, their encounter count and their average.'), { taille: 12.5, couleur: DISCRET, ancre: 'middle' });

  svg('repertoire.svg', 1280, 720, corps, t(
    'Chercher et trier le répertoire. On tape « emb » dans le champ Nom, ville, étiquette : à chaque lettre la requête est refaite, et le mot est cherché dans le prénom, la ville et les étiquettes de la fiche. À « e », les 18 fiches restent ; à « em », Emma et les quatre fiches qui portent Embrasse bien ; à « emb », ces quatre seules. On efface, on touche la pastille Vannes : la ville doit être exactement Vannes, 7 fiches. Puis les tris : Mieux notés range par note moyenne, Plus vues par nombre de rencontres, A à Z par prénom sans tenir compte des majuscules, et à égalité le prénom départage. La rangée de pastilles porte les quatre tris, les quatre villes qui comptent le plus de fiches et les huit étiquettes les plus portées. Les filtres se cumulent, une étiquette se compare par sa clé sans accents ni majuscules, et tout repart à vide au déverrouillage.',
    'Searching and sorting the people list. Typing « emb » in the Name, city, tag field reruns the query on every letter, looking in the first name, the city and the tags of each card. At « e », all 18 people remain; at « em », Emma and the four people tagged Good kisser; at « emb », those four only. Clearing it and touching the Vannes chip keeps people whose city is exactly Vannes, 7 of them. Then the sorts: Top rated orders by average rating, Most seen by number of encounters, A to Z by first name ignoring case, and on a tie the first name decides. The row of chips holds the four sorts, the four cities with the most people and the eight most used tags. Filters add up, a tag is compared by its key without accents or case, and everything starts out empty on unlock.'));
};

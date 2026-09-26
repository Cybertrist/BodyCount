// Le modèle de données, vivant : les sept tables du schéma v7 et leurs
// clés étrangères, puis la fiche d'Enzo qui se range ligne par ligne, et
// une rencontre supprimée dont chaque lien fait ce que dit son ON DELETE.
//
// Tout vient de lib/donnees/base.dart (_creerSchema) et depots.dart. Une
// fiche entière ne se supprime pas depuis l'interface : c'est donc une
// rencontre qui part, par le bouton de « Reprendre la rencontre ».
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, icone, visage, etoiles, pastille,
    largeurPastille, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU } = O;
  const C = 34;
  let corps = entete(t('LE MODÈLE', 'THE MODEL'),
    t('Sept tables, schéma v7, dans la base chiffrée. Chaque lien sait quoi faire quand une ligne part.',
      'Seven tables, schema v7, in the encrypted database. Every link knows what to do when a row goes.'));

  // Les instants.
  const TABLES = 0.02, LIENS = 0.13, RANGE = 0.24, PAS = 0.052;
  const OUVRE = 0.575, CORBEILLE = 0.605, DIALOGUE = 0.62, SUPPRIME = 0.655, APRES = 0.665;
  const CASCADE = 0.68, CHAINE = 0.715, NUL = 0.75, BILAN = 0.79, FIN = 0.975;

  // ------------------------------------------------------------ les tables
  const T = {
    pe: { x: 400, y: 100, h: 80, nom: 'personne_etiquettes', cols: ['personne_id · etiquette_id · rang'], c: ACCENT },
    etiquettes: { x: 400, y: 240, h: 100, nom: 'etiquettes', cols: ['libelle · cle · portee', 'UNIQUE (cle, portee)'], c: OR },
    re: { x: 400, y: 400, h: 80, nom: 'rencontre_etiquettes', cols: ['rencontre_id · etiquette_id'], c: ACCENT },
    personnes: { x: 690, y: 100, h: 132, nom: 'personnes', cols: ['id · prenom · age · ville', 'genre · role · telephone', 'adresse · rencontre_sur', 'photo_principale'], c: VIOLET },
    rencontres: { x: 690, y: 292, h: 132, nom: 'rencontres', cols: ['personne_id → personnes', 'quand · lieu', 'latitude · longitude', 'note · montant_centimes'], c: VIOLET },
    notes: { x: 980, y: 100, h: 100, nom: 'notes', cols: ['personne_id · rencontre_id', 'texte · ecrite_le'], c: BLEU },
    photos: { x: 980, y: 250, h: 116, nom: 'photos', cols: ['personne_id · rencontre_id', 'chemin · principale', 'type · duree_ms · vignette'], c: BLEU },
  };
  const W = 240;
  const ordre = ['personnes', 'rencontres', 'pe', 'etiquettes', 're', 'notes', 'photos'];
  // Le pied de chaque table, où tombent les lignes d'Enzo.
  const pied = (k) => ({ x: T[k].x + 8, y: T[k].y + T[k].h - 30, l: W - 16 });

  corps += rubrique(400, 80, t('SEPT TABLES, SCHÉMA V7', 'SEVEN TABLES, SCHEMA V7'));
  corps += `<line x1="1030" y1="76" x2="1054" y2="76" stroke="${TEXTE}" stroke-width="2"/>`;
  corps += texte(1060, 80, 'CASCADE', { taille: 10.5, couleur: TEXTE, police: MONO });
  corps += `<line x1="1128" y1="76" x2="1152" y2="76" stroke="${TEXTE}" stroke-width="2" stroke-dasharray="4 3"/>`;
  corps += texte(1158, 80, 'SET NULL', { taille: 10.5, couleur: TEXTE, police: MONO });

  // Les liens d'abord, sous les tables. [chemin, pointillé, instant du
  // tracé, longueur].
  const LIENS_ = {
    pe: ['M690 140 H640', false],
    etiq1: ['M520 180 V240', false],
    etiq2: ['M520 400 V340', false],
    re: ['M690 412 H640', false],
    renc: ['M810 232 V292', false],
    notes: ['M930 150 H980', false],
    photos: ['M930 215 H948 V290 H980', false],
    notesNul: ['M930 330 H966 V185 H980', true],
    photosNul: ['M930 350 H980', true],
  };
  const longueur = (d) => {
    let l = 0, x = 0, y = 0;
    for (const [, cmd, v] of d.matchAll(/([MHV])(\d+)(?: (\d+))?/g)) {
      const n = Number(v);
      if (cmd === 'M') { x = n; y = Number(d.match(/M\d+ (\d+)/)[1]); }
      else if (cmd === 'H') { l += Math.abs(n - x); x = n; }
      else { l += Math.abs(n - y); y = n; }
    }
    return l;
  };
  Object.entries(LIENS_).forEach(([, [d, pointille]], i) => {
    const de = LIENS + i * 0.01, L = longueur(d);
    if (pointille) {
      corps += `<path d="${d}" fill="none" stroke="${FIL}" stroke-width="2" stroke-dasharray="4 3" opacity="0">${visible(C, de, FIN)}</path>`;
    } else {
      corps += `<path d="${d}" fill="none" stroke="${FIL}" stroke-width="2" stroke-dasharray="${L}" stroke-dashoffset="${L}" opacity="0">
        ${fondu('stroke-dashoffset', C, [[0, L], [de, L], [de + 0.02, 0], [1, 0]])}${visible(C, de, FIN)}</path>`;
    }
  });
  // Les étiquettes des liens, dans les passages.
  corps += entre(C, LIENS + 0.1, FIN, [
    [665, 132, 'CASCADE'], [818, 266, 'CASCADE'], [528, 214, 'CASCADE'], [528, 374, 'CASCADE'], [665, 404, 'CASCADE'],
  ].map(([x, y, s]) => texte(x, y, s, { taille: 8.5, couleur: DISCRET, police: MONO, ancre: x === 528 || x === 818 ? 'start' : 'middle' })).join(''), 0.006);

  // Une impulsion rouge qui court sur un lien, au moment d'un DELETE.
  const impulsion = (d, de, couleur = ROUGE) => {
    const L = longueur(d);
    return `<path d="${d}" fill="none" stroke="${couleur}" stroke-width="3" stroke-linecap="round" stroke-dasharray="14 ${L + 20}" stroke-dashoffset="14" opacity="0" filter="url(#halo)">
      ${fondu('stroke-dashoffset', C, [[0, 14], [de, 14], [de + 0.025, -L], [1, -L]])}${visible(C, de, de + 0.025, 0.003)}</path>`;
  };

  // Les cartes des tables.
  ordre.forEach((k, i) => {
    const { x, y, h, nom, cols, c } = T[k];
    const de = TABLES + i * 0.014;
    corps += entre(C, de, FIN, `
      <rect x="${x}" y="${y}" width="${W}" height="${h}" rx="12" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y}" width="${W}" height="32" rx="12" fill="${c}" fill-opacity="0.1"/>
      <rect x="${x}" y="${y + 20}" width="${W}" height="12" fill="${CARTE}" opacity="0"/>
      <line x1="${x}" y1="${y + 32}" x2="${x + W}" y2="${y + 32}" stroke="${BORD}"/>
      ${icone('base', x + 12, y + 8, c, 1)}
      ${texte(x + 36, y + 21, nom, { taille: 12.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${cols.map((s, j) => texte(x + 14, y + 50 + j * 16, s, { taille: 10.5, couleur: TEXTE, police: MONO })).join('')}
      <rect x="${x + 8}" y="${y + h - 30}" width="${W - 16}" height="22" rx="7" fill="${FIL}" fill-opacity="0.25"/>`, 0.008);
  });

  // Le contenu d'un pied : [de, a, texte, couleur].
  const ligne = (k, de, a, s, couleur, { barre = false, marque = '' } = {}) => {
    const p = pied(k);
    const fond = couleur === TEXTE ? FIL : couleur;
    return entre(C, de, a, `<rect x="${p.x}" y="${p.y}" width="${p.l}" height="22" rx="7" fill="${fond}" fill-opacity="0.14" stroke="${fond}" stroke-opacity="0.45"/>
      ${marque ? texte(p.x + 9, p.y + 15.5, marque, { taille: 10, couleur, police: MONO, poids: 700 }) : ''}
      ${texte(p.x + (marque ? 9 + marque.length * 6.4 + 6 : 9), p.y + 15.5, s, { taille: 10.5, couleur: couleur === TEXTE ? TITRE : couleur, poids: 600, extra: barre ? 'text-decoration="line-through"' : '' })}`, 0.005);
  };

  // ------------------------------------------------------------ le téléphone
  const P = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = P;
  corps += P.cadre;

  // La fiche d'Enzo, avec son nombre de rencontres et sa première ligne.
  const fiche = (fois, premiere, seconde) => `
    ${visage(12, SX, SY, SL, 214, 0)}
    <rect x="${SX}" y="${SY}" width="${SL}" height="214" fill="url(#voile)"/>
    ${pastille(SX + 14, SY + 160, 'N°12', { taille: 9.5, h: 19, couleur: APP.vert })}
    ${pastille(SX + 66, SY + 160, t('23 ans', '23'), { taille: 9.5, h: 19 })}
    ${pastille(SX + 66 + largeurPastille(t('23 ans', '23'), 9.5) + 5, SY + 160, 'Vannes', { taille: 9.5, h: 19 })}
    ${texte(SX + 16, SY + 204, 'Enzo P.', { taille: 26, couleur: '#FFFFFF', poids: 800 })}
    ${texte(SX + 18, SY + 244, '3,8', { taille: 18, couleur: APP.texte, poids: 800 })}
    ${etoiles(SX + 18, SY + 258, 8, { taille: 7.5 })}
    ${texte(SX + 110, SY + 244, String(fois), { taille: 18, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 110, SY + 258, t('FOIS', 'TIMES'), { taille: 8, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}
    ${texte(SX + 190, SY + 244, '347 j', { taille: 18, couleur: APP.texte, poids: 800 })}
    ${texte(SX + 190, SY + 258, t('DEPUIS', 'SINCE'), { taille: 8, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.2"' })}
    ${texte(SX + 16, SY + 288, t('ÉTIQUETTES', 'TAGS'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    ${(() => {
      let x = SX + 16, s = '';
      for (const [e, plein] of [[t('Bronzé', 'Tanned'), true], [t('Moustache', 'Moustache'), true], [t('Bavard', 'Chatty'), false]]) {
        s += pastille(x, SY + 296, e, { taille: 9.5, h: 20, plein });
        x += largeurPastille(e, 9.5) + 5;
      }
      return s;
    })()}
    ${texte(SX + 16, SY + 340, t(`RENCONTRES · ${fois}`, `ENCOUNTERS · ${fois}`), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    ${[premiere, seconde].map(([d, h, n], i) => `<rect x="${SX + 12}" y="${SY + 350 + i * 50}" width="${SL - 24}" height="42" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${texte(SX + 24, SY + 367 + i * 50, d, { taille: 11.5, couleur: APP.texte, poids: 700 })}
      ${texte(SX + 24, SY + 382 + i * 50, h, { taille: 9, couleur: APP.discret })}
      ${etoiles(SX + SL - 88, SY + 377 + i * 50, n, { taille: 8 })}`).join('')}
    ${texte(SX + 16, SY + 466, t('CARNET · 3', 'NOTEBOOK · 3'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    <rect x="${SX + 12}" y="${SY + 474}" width="${SL - 24}" height="30" rx="10" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${texte(SX + 22, SY + 493, t('Toujours partant pour un deuxième…', 'Always up for a second round…'), { taille: 9.5, couleur: APP.texte })}
    ${texte(SX + 16, SY + 522, t('GALERIE · 2', 'GALLERY · 2'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}`;
  const R14 = [t('14 sept.', '14 Sept.'), '22h22 · Auray', 7];
  const R02 = [t('2 sept.', '2 Sept.'), '23h05 · Vannes', 8];
  const R21 = [t('21 août', '21 Aug.'), '22h40 · Vannes', 7];
  let ecran = entre(C, 0, OUVRE + 0.004, fiche(7, R14, R02), 0.004);
  ecran += entre(C, APRES, FIN, fiche(6, R02, R21), 0.004);

  // Ce qui s'allume sur la fiche quand sa part part vers une table :
  // [clé, rectangle sur l'écran, texte du paquet, cibles].
  const PARTS = [
    ['personnes', [SX + 8, SY + 150, SL - 16, 116], t('Enzo P., 23 ans', 'Enzo P., 23'), ['personnes']],
    ['rencontres', [SX + 8, SY + 330, SL - 16, 116], t('7 rencontres', '7 encounters'), ['rencontres']],
    ['etiquettes', [SX + 8, SY + 276, SL - 16, 48], t('4 étiquettes', '4 tags'), ['pe', 'etiquettes']],
    ['re', [SX + 8, SY + 346, SL - 16, 48], t('Chez moi, Dehors', 'My place, Outside'), ['re']],
    ['notes', [SX + 8, SY + 454, SL - 16, 54], t('3 notes', '3 notes'), ['notes']],
    ['photos', [SX + 8, SY + 512, SL - 16, 34], t('1 photo, 1 vidéo', '1 photo, 1 video'), ['photos']],
  ];
  PARTS.forEach(([, [x, y, l, h]], i) => {
    const de = RANGE + i * PAS;
    ecran += `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="12" fill="${ACCENT}" fill-opacity="0.08" stroke="${ACCENT}" stroke-width="1.5" opacity="0">${visible(C, de, de + PAS * 0.9, 0.004)}</rect>`;
  });
  // La galerie, sous le carnet : deux vignettes.
  const galerie = () => visage(12, SX + 16, SY + 530, 34, 34, 8) + visage(12, SX + 56, SY + 530, 34, 34, 8) +
    icone('lecture', SX + 67, SY + 541, '#FFFFFF', 0.8);
  ecran += entre(C, 0, OUVRE + 0.004, galerie(), 0.004) + entre(C, APRES, FIN, galerie(), 0.004);

  // « Reprendre la rencontre », puis la corbeille, puis la question.
  ecran += toucher(SX + 140, SY + 371, C, OUVRE - 0.012);
  const formulaire = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${APP.fond}"/>
    ${icone('croix', SX + 16, SY + 30, APP.texte, 1)}
    ${texte(SX + SL / 2, SY + 44, t('Reprendre la rencontre', 'Edit the encounter'), { taille: 15, couleur: APP.texte, poids: 700, ancre: 'middle' })}
    <g transform="translate(${SX + SL - 34} ${SY + 29})"><path d="M2 4 H14 M5 4 V2 H11 V4 M3.5 4 L4.5 15 H11.5 L12.5 4" fill="none" stroke="${APP.rouge}" stroke-width="1.6" stroke-linejoin="round"/></g>
    ${texte(SX + 18, SY + 90, t('OÙ', 'WHERE'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    <rect x="${SX + 12}" y="${SY + 98}" width="${SL - 24}" height="40" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${texte(SX + 26, SY + 123, 'Auray', { taille: 12, couleur: APP.texte })}
    ${texte(SX + 18, SY + 170, t('TA NOTE', 'YOUR RATING'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    ${texte(SX + 18, SY + 202, '3,5', { taille: 22, couleur: APP.texte, poids: 800 })}
    ${etoiles(SX + 18, SY + 230, 7, { taille: 18, pas: 24 })}
    ${texte(SX + 18, SY + 268, t('CETTE FOIS LÀ', 'THAT TIME'), { taille: 9, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
    ${pastille(SX + 18, SY + 278, t('Chez moi', 'My place'), { taille: 10, plein: true })}
    ${pastille(SX + 18 + largeurPastille(t('Chez moi', 'My place'), 10) + 6, SY + 278, t('Dehors', 'Outside'), { taille: 10, plein: true })}`;
  ecran += entre(C, OUVRE, APRES, formulaire, 0.004);
  ecran += toucher(SX + SL - 26, SY + 37, C, CORBEILLE);
  ecran += entre(C, DIALOGUE, APRES, `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.6"/>
    <rect x="${SX + 16}" y="${SY + 180}" width="${SL - 32}" height="176" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
    ${texte(SX + 34, SY + 216, t('Supprimer cette rencontre ?', 'Delete this encounter?'), { taille: 14, couleur: APP.texte, poids: 700 })}
    ${texte(SX + 34, SY + 244, t('Elle disparaît des statistiques,', 'It leaves the statistics,'), { taille: 11, couleur: APP.second })}
    ${texte(SX + 34, SY + 260, t('de la carte et du calendrier. Les', 'the map and the calendar. The notes'), { taille: 11, couleur: APP.second })}
    ${texte(SX + 34, SY + 276, t('notes écrites ce soir-là restent', 'written that night stay on'), { taille: 11, couleur: APP.second })}
    ${texte(SX + 34, SY + 292, t('sur la fiche.', 'the card.'), { taille: 11, couleur: APP.second })}
    ${texte(SX + SL - 124, SY + 334, t('Annuler', 'Cancel'), { taille: 12, couleur: APP.second, poids: 700, ancre: 'end' })}
    ${texte(SX + SL - 36, SY + 334, t('Supprimer', 'Delete'), { taille: 12, couleur: APP.rouge, poids: 700, ancre: 'end' })}`, 0.004);
  ecran += toucher(SX + SL - 66, SY + 330, C, SUPPRIME);
  // Après : la ligne du 14 n'est plus là, le carnet n'a pas bougé.
  ecran += `<rect x="${SX + 8}" y="${SY + 454}" width="${SL - 16}" height="54" rx="12" fill="none" stroke="${VERT}" stroke-width="1.5" opacity="0">${visible(C, NUL, BILAN + 0.06, 0.004)}</rect>`;
  corps += P.ecran(ecran);

  // Les paquets qui volent du téléphone vers leur table.
  PARTS.forEach(([, [x, y, l, h], s, cibles], i) => {
    const de = RANGE + i * PAS + 0.006, a = de + 0.03;
    const lp = Math.round(s.length * 6.4 + 22);
    cibles.forEach((k) => {
      const p = pied(k);
      const x0 = x + l - lp - 6, y0 = y + h / 2 - 11, x1 = p.x + p.l - lp, y1 = p.y;
      corps += `<g opacity="0">${visible(C, de, a, 0.004)}
        <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${de.toFixed(4)};${a.toFixed(4)};1" values="${x0} ${y0};${x0} ${y0};${x1} ${y1};${x1} ${y1}" calcMode="spline" keySplines="0 0 1 1;0.4 0 0.2 1;0 0 1 1"/>
        <rect width="${lp}" height="22" rx="11" fill="${ACCENT}" filter="url(#halo)"/>
        ${texte(lp / 2, 15, s, { taille: 10.5, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
      </g>`;
    });
  });

  // Les lignes d'Enzo, rangées, puis ce que la suppression en fait.
  const arrivee = (i) => RANGE + i * PAS + 0.036;
  corps += ligne('personnes', arrivee(0), FIN, t('Enzo P. · 23 · Vannes · versatile', 'Enzo P. · 23 · Vannes · versatile'), TEXTE, { marque: 'id 12' });
  corps += ligne('rencontres', arrivee(1), CASCADE, t('7 lignes · Vannes, Auray', '7 rows · Vannes, Auray'), TEXTE, { marque: '+7' });
  corps += ligne('rencontres', CASCADE, BILAN, t('14 sept. · Auray : DELETE', '14 Sept. · Auray: DELETE'), ROUGE, { marque: '−1' });
  corps += ligne('rencontres', BILAN, FIN, t('6 lignes · la fiche dit 6 fois', '6 rows · the card says 6 times'), TEXTE, { marque: '=6' });
  corps += ligne('pe', arrivee(2), FIN, t('4 liens, rangés de 0 à 3', '4 links, ranked 0 to 3'), TEXTE, { marque: '+4' });
  corps += ligne('etiquettes', arrivee(2), BILAN, t('Bronzé, Moustache, Bavard…', 'Tanned, Moustache, Chatty…'), TEXTE, { marque: '+6' });
  corps += ligne('etiquettes', BILAN, FIN, t('intactes : partagées, par clé', 'untouched: shared, by key'), OR, { marque: '=6' });
  corps += ligne('re', arrivee(3), CHAINE, t('14 sept. : Chez moi, Dehors', '14 Sept.: My place, Outside'), TEXTE, { marque: '+2' });
  corps += ligne('re', CHAINE, FIN, t('Chez moi, Dehors : partis', 'My place, Outside: gone'), ROUGE, { marque: '−2', barre: false });
  corps += ligne('notes', arrivee(4), NUL, t('3 lignes, liées à leur soirée', '3 rows, tied to their night'), TEXTE, { marque: '+3' });
  corps += ligne('notes', NUL, FIN, t('1 note : rencontre_id = NULL', '1 note: rencontre_id = NULL'), VERT, { marque: '=3' });
  corps += ligne('photos', arrivee(5), FIN, t('photo, vidéo et sa vignette', 'photo, video and its thumbnail'), TEXTE, { marque: '+2' });

  // Les impulsions de la suppression.
  corps += impulsion(LIENS_.re[0].replace('M690 412 H640', 'M690 412 H640'), CHAINE - 0.028);
  corps += impulsion('M930 330 H966 V185 H980', NUL - 0.03, VERT);
  corps += impulsion('M930 350 H980', NUL - 0.03, VERT);
  // La table rencontres s'éclaire au DELETE.
  corps += `<rect x="${T.rencontres.x}" y="${T.rencontres.y}" width="${W}" height="${T.rencontres.h}" rx="12" fill="none" stroke="${ROUGE}" stroke-width="1.5" opacity="0">${visible(C, CASCADE, CASCADE + 0.05)}</rect>`;
  corps += `<rect x="${T.re.x}" y="${T.re.y}" width="${W}" height="${T.re.h}" rx="12" fill="none" stroke="${ROUGE}" stroke-width="1.5" opacity="0">${visible(C, CHAINE, CHAINE + 0.05)}</rect>`;
  corps += `<rect x="${T.notes.x}" y="${T.notes.y}" width="${W}" height="${T.notes.h}" rx="12" fill="none" stroke="${VERT}" stroke-width="1.5" opacity="0">${visible(C, NUL, NUL + 0.05)}</rect>`;

  // ------------------------------------------------ le coffre, à part
  const V = { x: 980, y: 400, l: 240, h: 80 };
  corps += entre(C, TABLES + 0.1, FIN, `<rect x="${V.x}" y="${V.y}" width="${V.l}" height="${V.h}" rx="12" fill="${CARTE}" stroke="${BORD}" stroke-dasharray="5 4"/>
    ${icone('cadenas', V.x + 12, V.y + 10, DISCRET, 1)}
    ${texte(V.x + 36, V.y + 22, 'vault/', { taille: 12.5, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(V.x + V.l - 12, V.y + 22, t('hors de la base', 'outside the database'), { taille: 10, couleur: DISCRET, ancre: 'end' })}`, 0.008);
  corps += entre(C, arrivee(5), FIN, `${texte(V.x + 14, V.y + 46, '3f9c…a1.bcx', { taille: 10.5, couleur: TEXTE, police: MONO })}
    ${texte(V.x + 14, V.y + 64, '7c02…5e.bcx · e9b4…d0.bcx', { taille: 10.5, couleur: TEXTE, police: MONO })}`, 0.005);
  corps += entre(C, arrivee(5), FIN, `<path d="M1100 366 V400" stroke="${FIL}" stroke-width="2" stroke-dasharray="2 4"/>`, 0.005);
  corps += texte(1106, 388, t('chemin', 'path'), { taille: 8.5, couleur: DISCRET, police: MONO });

  // ------------------------------------------------ ce qui se passe
  const recits = [
    [TABLES, RANGE - 0.01, VIOLET, t('Sept tables, créées d’un bloc par _creerSchema() ; les liens portent leur ON DELETE.', 'Seven tables, created in one go by _creerSchema(); every link carries its ON DELETE.')],
    [RANGE - 0.01, OUVRE, ACCENT, t('La fiche d’Enzo, rangée : une ligne, puis ses rencontres, ses étiquettes, son carnet, ses médias.', 'Enzo’s card, stored: one row, then his encounters, tags, notebook and media.')],
    [OUVRE, CASCADE, TEXTE, t('Reprendre la rencontre du 14 sept., puis la corbeille : Supprimer.', 'Edit the 14 Sept. encounter, then the bin: Delete.')],
    [CASCADE, NUL, ROUGE, t('DELETE FROM rencontres : ses étiquettes du soir partent avec elle, par CASCADE.', 'DELETE FROM rencontres: its tags for that night go with it, by CASCADE.')],
    [NUL, BILAN, VERT, t('La note écrite ce soir-là reste : SET NULL ne fait que défaire le lien.', 'The note written that night stays: SET NULL only undoes the link.')],
    [BILAN, FIN, OR, t('Rien d’autre ne bouge : la fiche, ses étiquettes, ses photos, le coffre.', 'Nothing else moves: the card, its tags, its photos, the vault.')],
  ];
  corps += `<rect x="400" y="500" width="820" height="36" rx="12" fill="${CARTE}" stroke="${BORD}"/>`;
  recits.forEach(([de, a, c, s]) => {
    corps += entre(C, de, a, `<circle cx="418" cy="518" r="4" fill="${c}"/>${texte(432, 522.5, s, { taille: 13, couleur: TITRE, poids: 600 })}`, 0.005);
  });

  // ------------------------------------------------ trois cartes du bas
  const bas = [
    [VIOLET, 'PRAGMA foreign_keys = ON', t('Posé à chaque ouverture : sans lui,', 'Set on every open: without it,'), t('SQLite ignore les CASCADE.', 'SQLite ignores every CASCADE.')],
    [OR, t('Une étiquette, une clé', 'One tag, one key'), t('« Bronzé » et « bronze » : même clé,', '“Bronzé” and “bronze”: same key,'), t('une seule ligne, portée à part.', 'one row, scope kept apart.')],
    [BLEU, t('Que des entiers', 'Integers only'), t('Note en demi-points, montant en', 'Rating in half points, amount in'), t('centimes : jamais d’arrondi.', 'cents: never a rounding error.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = 400 + i * 280, y = 552;
    corps += `<rect x="${x}" y="${y}" width="260" height="92" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y + 14}" width="3" height="64" rx="1.5" fill="${c}"/>
      ${texte(x + 20, y + 31, titre, { taille: 13, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 54, l1, { taille: 12 })}
      ${texte(x + 20, y + 72, l2, { taille: 12 })}`;
  });
  corps += texte(810, 672, t('Une fiche supprimée par le dépôt emporterait tout par CASCADE ; ses fichiers du coffre, eux, s’effacent à la main.',
    'A card deleted by the repository would take everything by CASCADE; its vault files are deleted by hand.'), { taille: 12, couleur: DISCRET, ancre: 'middle' });

  svg('modele.svg', 1280, 700, corps, t(
    'Le modèle de données de BodyCount, schéma v7, dans la base chiffrée. Sept tables : personnes, rencontres, notes, photos, etiquettes, et deux tables de liaison, personne_etiquettes et rencontre_etiquettes. Rencontres, notes, photos et liaisons pointent vers personnes en ON DELETE CASCADE ; notes et photos pointent vers rencontres en ON DELETE SET NULL. La fiche d’Enzo P. se range : une ligne dans personnes, sept rencontres, quatre liens vers des étiquettes partagées, les étiquettes du soir, trois notes, une photo et une vidéo dont les fichiers chiffrés vivent dans le coffre, hors de la base. Puis on reprend la rencontre du 14 septembre et on la supprime : ses étiquettes du soir partent par CASCADE, la note écrite ce soir-là reste, son lien simplement défait par SET NULL, et rien d’autre ne bouge. Les clés étrangères ne jouent que parce que PRAGMA foreign_keys = ON est posé à chaque ouverture ; une étiquette est unique par sa clé et sa portée ; note et montant sont des entiers.',
    'The BodyCount data model, schema v7, in the encrypted database. Seven tables: personnes, rencontres, notes, photos, etiquettes, and two link tables, personne_etiquettes and rencontre_etiquettes. Encounters, notes, photos and links point to personnes with ON DELETE CASCADE; notes and photos point to rencontres with ON DELETE SET NULL. Enzo P.’s card is stored: one row in personnes, seven encounters, four links to shared tags, the tags for each night, three notes, one photo and one video whose encrypted files live in the vault, outside the database. Then the 14 September encounter is opened and deleted: its tags for that night go by CASCADE, the note written that night stays, its link simply undone by SET NULL, and nothing else moves. Foreign keys only work because PRAGMA foreign_keys = ON is set on every open; a tag is unique by its key and scope; rating and amount are integers.'));
};

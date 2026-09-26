// Le modèle de données, vivant : les sept tables du schéma v7 et leurs
// clés étrangères, puis la fiche d'Enzo qui se range ligne par ligne, et
// une rencontre supprimée dont chaque lien fait ce que dit son ON DELETE.
//
// Tout vient de lib/donnees/base.dart (_creerSchema) et depots.dart. Une
// fiche entière ne se supprime pas depuis l'interface : c'est donc une
// rencontre qui part, par le bouton de « Reprendre la rencontre ».
//
// La mise en page est calculée, pas posée à l'œil : trois colonnes de
// même largeur séparées par deux couloirs où passent les liens, la
// hauteur de chaque table tirée de son nombre de champs, et des écarts
// égaux dans chaque colonne. Les liens sont routés en angles droits, sans
// jamais passer sous une table.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, icone, visage, etoiles, pastille,
    largeurPastille, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, FOND, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU } = O;
  const C = 34;
  let corps = entete(t('LE MODÈLE', 'THE MODEL'),
    t('Sept tables, schéma v7, dans la base chiffrée. Chaque lien sait quoi faire quand une ligne part.',
      'Seven tables, schema v7, in the encrypted database. Every link knows what to do when a row goes.'));

  // Les instants.
  const TABLES = 0.02, LIENS = 0.13, RANGE = 0.24, PAS = 0.052;
  const OUVRE = 0.575, CORBEILLE = 0.605, DIALOGUE = 0.62, SUPPRIME = 0.655, APRES = 0.665;
  const CASCADE = 0.68, CHAINE = 0.715, NUL = 0.75, BILAN = 0.79, FIN = 0.975;

  // ------------------------------------------------------------ la grille
  const GX = 392, GD = 1240, HAUT = 100, BAS = 520;
  const W = 222, COULOIR_A = 70;
  const COL = [GX, GX + W + COULOIR_A, GD - W]; // 392, 684, 1018
  const LIGNE = 18, ENTETE = 32, PIED = 32;
  // Une table : son en-tête, un blanc, ses champs, un blanc, son pied.
  const hauteur = (n) => ENTETE + 8 + n * LIGNE + 6 + PIED;

  // [champ, rôle] : le rôle s'aligne à droite, en colonne.
  const T = {
    pe: { col: 0, nom: 'personne_etiquettes', c: ACCENT, champs: [['personne_id', '→ personnes'], ['etiquette_id', '→ etiquettes'], ['rang', t('ordre', 'order')]] },
    etiquettes: { col: 0, nom: 'etiquettes', c: OR, champs: [['id · libelle', 'PK'], ['cle · portee', 'UNIQUE']] },
    re: { col: 0, nom: 'rencontre_etiquettes', c: ACCENT, champs: [['rencontre_id', '→ rencontres'], ['etiquette_id', '→ etiquettes']] },
    personnes: { col: 1, nom: 'personnes', c: VIOLET, champs: [['id', 'PK'], ['prenom · age · ville', ''], ['genre · role', ''], ['telephone · adresse', ''], ['photo_principale', '']] },
    rencontres: { col: 1, nom: 'rencontres', c: VIOLET, champs: [['id', 'PK'], ['personne_id', '→ personnes'], ['quand · lieu', ''], ['latitude · longitude', ''], ['note', t('demi-points', 'half points')], ['montant_centimes', t('entier', 'integer')]] },
    notes: { col: 2, nom: 'notes', c: BLEU, champs: [['personne_id', '→ personnes'], ['rencontre_id', '→ rencontres'], ['texte · ecrite_le', '']] },
    photos: { col: 2, nom: 'photos', c: BLEU, champs: [['personne_id', '→ personnes'], ['rencontre_id', '→ rencontres'], ['chemin · type', '→ vault/'], ['duree_ms · vignette', '']] },
  };
  const VAULT_H = 96;
  // Chaque colonne, justifiée du haut au bas de la grille.
  const colonnes = [['pe', 'etiquettes', 're'], ['personnes', 'rencontres'], ['notes', 'photos', 'vault']];
  colonnes.forEach((cles, ci) => {
    const hs = cles.map((k) => (k === 'vault' ? VAULT_H : hauteur(T[k].champs.length)));
    const ecart = (BAS - HAUT - hs.reduce((a, b) => a + b, 0)) / (cles.length - 1);
    let y = HAUT;
    cles.forEach((k, i) => {
      const bloc = k === 'vault' ? (T.vault = { col: 2 }) : T[k];
      Object.assign(bloc, { x: COL[ci], y: Math.round(y), h: hs[i] });
      y += hs[i] + ecart;
    });
  });
  /// Le centre vertical du champ i d'une table.
  const rang = (k, i) => T[k].y + ENTETE + 8 + i * LIGNE + LIGNE / 2;
  const ordre = ['personnes', 'rencontres', 'pe', 'etiquettes', 're', 'notes', 'photos'];
  // Le pied de chaque table, où tombent les lignes d'Enzo.
  const pied = (k) => ({ x: T[k].x + 10, y: T[k].y + T[k].h - 26, l: W - 20 });

  corps += rubrique(GX, 80, t('SEPT TABLES, SCHÉMA V7', 'SEVEN TABLES, SCHEMA V7'));
  // La légende des deux règles.
  corps += `<line x1="1010" y1="76" x2="1036" y2="76" stroke="${TEXTE}" stroke-width="2"/>`;
  corps += texte(1042, 80, 'CASCADE', { taille: 11, couleur: TEXTE, police: MONO });
  corps += `<line x1="1126" y1="76" x2="1152" y2="76" stroke="${TEXTE}" stroke-width="2" stroke-dasharray="5 4"/>`;
  corps += texte(1158, 80, 'SET NULL', { taille: 11, couleur: TEXTE, police: MONO });

  // ------------------------------------------------------------ les liens
  // Les neuf clés étrangères de _creerSchema(), de l'enfant vers le
  // parent : [points, règle, où poser la pastille, pont éventuel].
  const xA = COL[0] + W + COULOIR_A / 2;         // le couloir de gauche
  const xB1 = COL[1] + W + 34, xB2 = COL[2] - 34; // les deux troncs de droite
  const cx = (k) => T[k].x + W / 2;
  const yR = T.rencontres.y + 66;                 // l'entrée de rencontres, à droite
  const yP = T.personnes.y + T.personnes.h - 28;  // l'entrée de personnes, par photos
  const LIENS_ = {
    pePers: { pts: [[COL[0] + W, rang('pe', 0)], [COL[1], rang('pe', 0)]], regle: 'CASCADE', pastille: [xA, rang('pe', 0)] },
    peEtiq: { pts: [[cx('pe'), T.pe.y + T.pe.h], [cx('pe'), T.etiquettes.y]], regle: 'CASCADE', pastille: [cx('pe'), (T.pe.y + T.pe.h + T.etiquettes.y) / 2] },
    reEtiq: { pts: [[cx('re'), T.re.y], [cx('re'), T.etiquettes.y + T.etiquettes.h]], regle: 'CASCADE', pastille: [cx('re'), (T.re.y + T.etiquettes.y + T.etiquettes.h) / 2] },
    reRenc: { pts: [[COL[0] + W, rang('re', 0)], [COL[1], rang('re', 0)]], regle: 'CASCADE', pastille: [xA, rang('re', 0)] },
    rencPers: { pts: [[cx('rencontres'), T.rencontres.y], [cx('rencontres'), T.personnes.y + T.personnes.h]], regle: 'CASCADE', pastille: [cx('rencontres'), (T.rencontres.y + T.personnes.y + T.personnes.h) / 2] },
    notesPers: { pts: [[COL[2], rang('notes', 0)], [COL[1] + W, rang('notes', 0)]], regle: 'CASCADE', pastille: [(COL[1] + W + COL[2]) / 2, rang('notes', 0)] },
    notesNul: { pts: [[COL[2], rang('notes', 1)], [xB2, rang('notes', 1)], [xB2, yR], [COL[1] + W, yR]], regle: 'SET NULL', pastille: [(COL[1] + W + xB2) / 2, yR] },
    photosNul: { pts: [[COL[2], rang('photos', 1)], [xB2, rang('photos', 1)]], regle: 'SET NULL', pastille: null },
    photosPers: { pts: [[COL[2], rang('photos', 0)], [xB1, rang('photos', 0)], [xB1, yP], [COL[1] + W, yP]], regle: 'CASCADE', pastille: [xB1, (rang('photos', 0) + yP) / 2], pont: [xB2, rang('photos', 0)] },
  };
  const LIEN_TRAIT = '#4A5668';
  const d = (pts) => 'M' + pts.map((p) => p.map((v) => Math.round(v * 10) / 10).join(' ')).join(' L');
  const longueur = (pts) => pts.slice(1).reduce((l, p, i) => l + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  /// La pointe de flèche au bout d'un lien, dans le sens du dernier segment.
  const fleche = (pts, couleur) => {
    const [a, b] = pts.slice(-2), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const pt = (r, da) => [b[0] - r * Math.cos(ang + da), b[1] - r * Math.sin(ang + da)].map((v) => v.toFixed(1)).join(' ');
    return `<path d="M${b[0]} ${b[1]} L${pt(9, 0.42)} L${pt(9, -0.42)} Z" fill="${couleur}"/>`;
  };
  const pastilleRegle = ([x, y], regle) => {
    const l = regle.length * 6.7 + 14;
    return `<rect x="${(x - l / 2).toFixed(1)}" y="${y - 10}" width="${l.toFixed(1)}" height="20" rx="10" fill="${CARTE}" stroke="${LIEN_TRAIT}"/>
      ${texte(x, y + 4, regle, { taille: 11, couleur: TEXTE, police: MONO, ancre: 'middle' })}`;
  };
  Object.values(LIENS_).forEach(({ pts, regle, pastille: pp, pont }, i) => {
    const de = LIENS + i * 0.009, L = longueur(pts), nul = regle === 'SET NULL';
    // Un pont : un liseré de la couleur du fond sous le lien, qui coupe
    // proprement le tronc qu'il enjambe.
    const dessous = pont ? `<path d="M${pont[0] - 7} ${pont[1]} H${pont[0] + 7}" stroke="${FOND}" stroke-width="7"/>` : '';
    const trait = nul
      ? `<path d="${d(pts)}" fill="none" stroke="${LIEN_TRAIT}" stroke-width="2" stroke-dasharray="5 4"/>`
      : `<path d="${d(pts)}" fill="none" stroke="${LIEN_TRAIT}" stroke-width="2" stroke-dasharray="${L.toFixed(1)}" stroke-dashoffset="${L.toFixed(1)}">
          ${fondu('stroke-dashoffset', C, [[0, L], [de, L], [de + 0.02, 0], [1, 0]])}</path>`;
    corps += entre(C, de, FIN, dessous + trait +
      (i === 7 ? '' : entre(C, de + 0.02, FIN, fleche(pts, LIEN_TRAIT), 0.004)) +
      (pp ? entre(C, de + 0.025, FIN, pastilleRegle(pp, regle), 0.004) : ''), 0.004);
  });

  /// Une impulsion qui remonte un lien du parent vers l'enfant, au DELETE.
  const impulsion = (pts, de, couleur = ROUGE) => {
    const inv = [...pts].reverse(), L = longueur(inv);
    return `<path d="${d(inv)}" fill="none" stroke="${couleur}" stroke-width="3" stroke-linecap="round" stroke-dasharray="16 ${(L + 30).toFixed(0)}" stroke-dashoffset="16" opacity="0" filter="url(#halo)">
      ${fondu('stroke-dashoffset', C, [[0, 16], [de, 16], [de + 0.028, -L], [1, -L]])}${visible(C, de, de + 0.028, 0.003)}</path>`;
  };

  // ------------------------------------------------------------ les tables
  ordre.forEach((k, i) => {
    const { x, y, h, nom, champs, c } = T[k];
    const de = TABLES + i * 0.014;
    corps += entre(C, de, FIN, `
      <rect x="${x}" y="${y}" width="${W}" height="${h}" rx="12" fill="${CARTE}" stroke="${BORD}"/>
      <path d="M${x} ${y + ENTETE} V${y + 12} a12 12 0 0 1 12 -12 H${x + W - 12} a12 12 0 0 1 12 12 V${y + ENTETE} Z" fill="${c}" fill-opacity="0.12"/>
      <line x1="${x}" y1="${y + ENTETE}" x2="${x + W}" y2="${y + ENTETE}" stroke="${BORD}"/>
      ${icone('base', x + 14, y + 8, c, 1)}
      ${texte(x + 40, y + 21, nom, { taille: 12.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${champs.map(([nomChamp, role], j) => {
        const yc = y + ENTETE + 8 + j * LIGNE + LIGNE / 2 + 4;
        return texte(x + 16, yc, nomChamp, { taille: 11, couleur: TEXTE, police: MONO }) +
          (role ? texte(x + W - 16, yc, role, { taille: 11, couleur: role.startsWith('→') ? c : DISCRET, police: MONO, ancre: 'end' }) : '');
      }).join('')}
      <line x1="${x + 10}" y1="${y + h - PIED}" x2="${x + W - 10}" y2="${y + h - PIED}" stroke="${BORD}" stroke-dasharray="2 3"/>
      <rect x="${x + 10}" y="${y + h - 26}" width="${W - 20}" height="20" rx="6" fill="${FIL}" fill-opacity="0.22"/>`, 0.008);
  });

  // Le contenu d'un pied, dans sa zone réservée.
  const ligne = (k, de, a, s, couleur, { marque = '' } = {}) => {
    const p = pied(k);
    const fond = couleur === TEXTE ? FIL : couleur;
    const xm = p.x + 8, xs = marque ? xm + marque.length * 6.7 + 8 : xm;
    // Contrôle de place : un pied qui déborde arrête le rendu.
    const largeur = (xs - p.x) + s.length * 6.1 + 8;
    if (largeur > p.l) throw new Error(`modele.js : « ${s} » déborde du pied de ${k} (${Math.round(largeur)} > ${p.l})`);
    return entre(C, de, a, `<rect x="${p.x}" y="${p.y}" width="${p.l}" height="20" rx="6" fill="${fond}" fill-opacity="0.16" stroke="${fond}" stroke-opacity="0.5"/>
      ${marque ? texte(xm, p.y + 14, marque, { taille: 11, couleur, police: MONO, poids: 700 }) : ''}
      ${texte(xs, p.y + 14, s, { taille: 11, couleur: couleur === TEXTE ? TITRE : couleur, poids: 600 })}`, 0.005);
  };

  // ------------------------------------------------------------ le téléphone
  const P = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = P;
  corps += P.cadre;

  // La fiche d'Enzo, avec son nombre de rencontres et ses deux premières.
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
    ${[premiere, seconde].map(([dt, h, n], i) => `<rect x="${SX + 12}" y="${SY + 350 + i * 50}" width="${SL - 24}" height="42" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${texte(SX + 24, SY + 367 + i * 50, dt, { taille: 11.5, couleur: APP.texte, poids: 700 })}
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

  // Les paquets qui volent du téléphone vers le pied de leur table.
  PARTS.forEach(([, [x, y, l, h], s, cibles], i) => {
    const de = RANGE + i * PAS + 0.006, a = de + 0.03;
    const lp = Math.round(s.length * 6.4 + 22);
    cibles.forEach((k) => {
      const p = pied(k);
      const x0 = x + l - lp - 6, y0 = y + h / 2 - 10, x1 = p.x + p.l - lp, y1 = p.y;
      corps += `<g opacity="0">${visible(C, de, a, 0.004)}
        <animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${de.toFixed(4)};${a.toFixed(4)};1" values="${x0} ${y0};${x0} ${y0};${x1} ${y1};${x1} ${y1}" calcMode="spline" keySplines="0 0 1 1;0.4 0 0.2 1;0 0 1 1"/>
        <rect width="${lp}" height="20" rx="10" fill="${ACCENT}" filter="url(#halo)"/>
        ${texte(lp / 2, 14, s, { taille: 11, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
      </g>`;
    });
  });

  // Les lignes d'Enzo, rangées, puis ce que la suppression en fait.
  const arrivee = (i) => RANGE + i * PAS + 0.036;
  corps += ligne('personnes', arrivee(0), FIN, t('Enzo P. · 23 · Vannes', 'Enzo P. · 23 · Vannes'), TEXTE, { marque: 'id 12' });
  corps += ligne('rencontres', arrivee(1), CASCADE, t('7 lignes, Vannes, Auray', '7 rows, Vannes, Auray'), TEXTE, { marque: '+7' });
  corps += ligne('rencontres', CASCADE, BILAN, t('14 sept., Auray : DELETE', '14 Sept., Auray: DELETE'), ROUGE, { marque: '−1' });
  corps += ligne('rencontres', BILAN, FIN, t('6 lignes, la fiche dit 6', '6 rows, the card says 6'), TEXTE, { marque: '=6' });
  corps += ligne('pe', arrivee(2), FIN, t('4 liens, rangés de 0 à 3', '4 links, ranked 0 to 3'), TEXTE, { marque: '+4' });
  corps += ligne('etiquettes', arrivee(2), BILAN, t('Bronzé, Moustache…', 'Tanned, Moustache…'), TEXTE, { marque: '+6' });
  corps += ligne('etiquettes', BILAN, FIN, t('intactes, partagées', 'untouched, shared'), OR, { marque: '=6' });
  corps += ligne('re', arrivee(3), CHAINE, t('Chez moi, Dehors, le 14', 'My place, Outside, 14th'), TEXTE, { marque: '+2' });
  corps += ligne('re', CHAINE, FIN, t('partis avec le 14 sept.', 'gone with 14 Sept.'), ROUGE, { marque: '−2' });
  corps += ligne('notes', arrivee(4), NUL, t('3 notes, liées au soir', '3 notes, tied to the night'), TEXTE, { marque: '+3' });
  corps += ligne('notes', NUL, FIN, t('1 note : rencontre_id NULL', '1 note: rencontre_id NULL'), VERT, { marque: '=3' });
  corps += ligne('photos', arrivee(5), FIN, t('photo, vidéo, vignette', 'photo, video, thumbnail'), TEXTE, { marque: '+2' });

  // Les impulsions de la suppression : la CASCADE vers les étiquettes du
  // soir, le SET NULL vers les notes et les photos.
  corps += impulsion(LIENS_.reRenc.pts, CHAINE - 0.03);
  corps += impulsion(LIENS_.notesNul.pts, NUL - 0.03, VERT);
  corps += impulsion([...LIENS_.photosNul.pts, [xB2, yR], [COL[1] + W, yR]], NUL - 0.03, VERT);
  // Les tables s'éclairent au moment où la règle joue.
  const eclat = (k, de, couleur) => `<rect x="${T[k].x}" y="${T[k].y}" width="${W}" height="${T[k].h}" rx="12" fill="none" stroke="${couleur}" stroke-width="1.5" opacity="0">${visible(C, de, de + 0.05)}</rect>`;
  corps += eclat('rencontres', CASCADE, ROUGE) + eclat('re', CHAINE, ROUGE) + eclat('notes', NUL, VERT);

  // ------------------------------------------------ le coffre, à part
  const V = { x: T.vault.x, y: T.vault.y, l: W, h: VAULT_H };
  corps += entre(C, TABLES + 0.1, FIN, `<rect x="${V.x}" y="${V.y}" width="${V.l}" height="${V.h}" rx="12" fill="${CARTE}" stroke="${BORD}" stroke-dasharray="5 4"/>
    ${icone('cadenas', V.x + 14, V.y + 10, DISCRET, 1)}
    ${texte(V.x + 40, V.y + 23, 'vault/', { taille: 12.5, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(V.x + V.l - 16, V.y + 23, t('hors de la base', 'outside the db'), { taille: 11, couleur: DISCRET, ancre: 'end' })}
    <line x1="${V.x}" y1="${V.y + ENTETE}" x2="${V.x + V.l}" y2="${V.y + ENTETE}" stroke="${BORD}" stroke-dasharray="5 4"/>`, 0.008);
  corps += entre(C, arrivee(5), FIN, `${texte(V.x + 16, V.y + 56, '3f9c…a1.bcx', { taille: 11, couleur: TEXTE, police: MONO })}
    ${texte(V.x + 16, V.y + 76, '7c02…5e.bcx · e9b4…d0.bcx', { taille: 11, couleur: TEXTE, police: MONO })}`, 0.005);
  // Le chemin d'une photo mène au coffre : un fil discret, pas une clé.
  const xV = V.x + 48;
  corps += entre(C, arrivee(5), FIN, `<path d="M${xV} ${T.photos.y + T.photos.h} V${V.y}" stroke="${LIEN_TRAIT}" stroke-width="2" stroke-dasharray="2 4"/>
    ${fleche([[xV, T.photos.y + T.photos.h], [xV, V.y]], LIEN_TRAIT)}`, 0.005);

  // ------------------------------------------------ ce qui se passe
  const recits = [
    [TABLES, RANGE - 0.01, VIOLET, t('Sept tables, créées d’un bloc par _creerSchema() ; chaque lien porte son ON DELETE.', 'Seven tables, created in one go by _creerSchema(); every link carries its ON DELETE.')],
    [RANGE - 0.01, OUVRE, ACCENT, t('La fiche d’Enzo, rangée : une ligne, puis ses rencontres, ses étiquettes, son carnet, ses médias.', 'Enzo’s card, stored: one row, then his encounters, tags, notebook and media.')],
    [OUVRE, CASCADE, TEXTE, t('Reprendre la rencontre du 14 sept., puis la corbeille : Supprimer.', 'Edit the 14 Sept. encounter, then the bin: Delete.')],
    [CASCADE, NUL, ROUGE, t('DELETE FROM rencontres : ses étiquettes du soir partent avec elle, par CASCADE.', 'DELETE FROM rencontres: its tags for that night go with it, by CASCADE.')],
    [NUL, BILAN, VERT, t('La note écrite ce soir-là reste : SET NULL ne fait que défaire le lien.', 'The note written that night stays: SET NULL only undoes the link.')],
    [BILAN, FIN, OR, t('Rien d’autre ne bouge : la fiche, ses étiquettes, ses photos, le coffre.', 'Nothing else moves: the card, its tags, its photos, the vault.')],
  ];
  const RY = 536;
  corps += `<rect x="${GX}" y="${RY}" width="${GD - GX}" height="38" rx="12" fill="${CARTE}" stroke="${BORD}"/>`;
  recits.forEach(([de, a, c, s]) => {
    corps += entre(C, de, a, `<circle cx="${GX + 20}" cy="${RY + 19}" r="4" fill="${c}"/>${texte(GX + 36, RY + 24, s, { taille: 13, couleur: TITRE, poids: 600 })}`, 0.005);
  });

  // ------------------------------------------------ trois cartes du bas
  const bas = [
    [VIOLET, 'PRAGMA foreign_keys = ON', t('Posé à chaque ouverture : sans lui,', 'Set on every open: without it,'), t('SQLite ignore les CASCADE.', 'SQLite ignores every CASCADE.')],
    [OR, t('Une étiquette, une clé', 'One tag, one key'), t('« Bronzé » et « bronze » : même clé,', '“Bronzé” and “bronze”: same key,'), t('une seule ligne, portée à part.', 'one row, scope kept apart.')],
    [BLEU, t('Que des entiers', 'Integers only'), t('Note en demi-points, montant en', 'Rating in half points, amount in'), t('centimes : jamais d’arrondi.', 'cents: never a rounding error.')],
  ];
  const LB = (GD - GX - 2 * 16) / 3;
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = GX + i * (LB + 16), y = 588;
    // Pas de liseré : la carte se teinte à peine, et son titre prend la couleur.
    corps += `<rect x="${x}" y="${y}" width="${LB}" height="88" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y}" width="${LB}" height="88" rx="13" fill="${c}" fill-opacity="0.05"/>
      ${texte(x + 20, y + 30, titre, { taille: 13, couleur: c, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 53, l1, { taille: 12 })}
      ${texte(x + 20, y + 71, l2, { taille: 12 })}`;
  });
  corps += texte((GX + GD) / 2, 704, t('Une fiche supprimée par le dépôt emporterait tout par CASCADE ; ses fichiers du coffre, eux, s’effacent à la main.',
    'A card deleted by the repository would take everything by CASCADE; its vault files are deleted by hand.'), { taille: 12, couleur: DISCRET, ancre: 'middle' });

  svg('modele.svg', 1280, 720, corps, t(
    'Le modèle de données de BodyCount, schéma v7, dans la base chiffrée. Sept tables : personnes, rencontres, notes, photos, etiquettes, et deux tables de liaison, personne_etiquettes et rencontre_etiquettes. Rencontres, notes, photos et liaisons pointent vers personnes en ON DELETE CASCADE ; notes et photos pointent vers rencontres en ON DELETE SET NULL. La fiche d’Enzo P. se range : une ligne dans personnes, sept rencontres, quatre liens vers des étiquettes partagées, les étiquettes du soir, trois notes, une photo et une vidéo dont les fichiers chiffrés vivent dans le coffre, hors de la base. Puis on reprend la rencontre du 14 septembre et on la supprime : ses étiquettes du soir partent par CASCADE, la note écrite ce soir-là reste, son lien simplement défait par SET NULL, et rien d’autre ne bouge. Les clés étrangères ne jouent que parce que PRAGMA foreign_keys = ON est posé à chaque ouverture ; une étiquette est unique par sa clé et sa portée ; note et montant sont des entiers.',
    'The BodyCount data model, schema v7, in the encrypted database. Seven tables: personnes, rencontres, notes, photos, etiquettes, and two link tables, personne_etiquettes and rencontre_etiquettes. Encounters, notes, photos and links point to personnes with ON DELETE CASCADE; notes and photos point to rencontres with ON DELETE SET NULL. Enzo P.’s card is stored: one row in personnes, seven encounters, four links to shared tags, the tags for each night, three notes, one photo and one video whose encrypted files live in the vault, outside the database. Then the 14 September encounter is opened and deleted: its tags for that night go by CASCADE, the note written that night stays, its link simply undone by SET NULL, and nothing else moves. Foreign keys only work because PRAGMA foreign_keys = ON is set on every open; a tag is unique by its key and scope; rating and amount are integers.'));
};

// Les quatre planches de la section « Les écrans ».
//
// Chaque capture est posée dans un vrai cadre d'appareil, à sa proportion
// exacte : l'écran de couverture du Fold pour le format passeport, un
// téléphone 16/9, le Fold déplié en 4/3, puis le même couché. Rien n'est
// rogné ni étiré : la capture remplit l'écran, dont seuls les coins sont
// arrondis.
//
// Ces planches sont fixes, sans la moindre animation : ce sont des vitrines
// qu'on regarde, pas des mécanismes qu'on explique. Les appareils portent
// une ombre douce qui suit leur forme, et chaque légende est posée dessous,
// toutes lisibles en même temps.
//
// Les images viennent de captures.json, réduites par vignettes-captures.js.
module.exports = (O) => {
  const { t, svg, texte, entete, MONO, TITRE, TEXTE, ACCENT } = O;
  const CAPTURES = require('./captures.json');

  // ------------------------------------------------------------ les outils

  const idCapture = (c) => 'capture-' + c.replace(/[^a-z0-9]/gi, '-');

  /// Les images d'une planche, une fois chacune, en <symbol>, et l'ombre
  /// des appareils : une ombre portée noire, large et douce, décalée vers
  /// le bas, qui suit les coins arrondis au lieu d'une tache posée dessous.
  const defs = (cles) => `<defs>
  <filter id="ombreAppareil" x="-25%" y="-15%" width="150%" height="140%" color-interpolation-filters="sRGB">
    <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.55"/>
    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.5"/>
  </filter>
  ${cles.map((c) => {
    const { l, h, url } = CAPTURES[c];
    return `<symbol id="${idCapture(c)}" viewBox="0 0 ${l} ${h}"><image width="${l}" height="${h}" href="${url}"/></symbol>`;
  }).join('\n  ')}
</defs>`;

  /// La hauteur d'un écran de largeur [l], d'après la vraie capture.
  const hauteur = (cle, l) => Math.round((l * CAPTURES[cle].h) / CAPTURES[cle].l);

  /// Une capture dans l'écran [x, y, l, h], coins arrondis à [rx].
  function ecran(cle, x, y, l, h, rx) {
    const c = O.id('ecranCapture');
    return `<clipPath id="${c}"><rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${rx}"/></clipPath>
    <g clip-path="url(#${c})"><rect x="${x}" y="${y}" width="${l}" height="${h}" fill="#0B0616"/>
      <use href="#${idCapture(cle)}" x="${x}" y="${y}" width="${l}" height="${h}"/></g>`;
  }

  /// Un appareil complet autour de l'écran [x, y, l, h] : le corps et son
  /// ombre, un liseré de lumière sur l'arête, la caméra dans le cadre, les
  /// boutons sur la tranche, la capture, puis un reflet très léger.
  function appareil(cle, x, y, l, h, { bord = 10, haut = 16, rx = 22, camera = 'centre', boutons = 'droite' } = {}) {
    const bx = x - bord, by = y - haut, bl = l + 2 * bord, bh = h + haut + bord;
    const brx = rx + bord;
    const arete = O.id('arete'), reflet = O.id('reflet');
    let s = `<linearGradient id="${arete}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5A4C78"/><stop offset="0.5" stop-color="#2E2640"/><stop offset="1" stop-color="#241E33"/></linearGradient>
    <linearGradient id="${reflet}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.07"/><stop offset="0.4" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>`;
    // Les boutons de la tranche, sous le corps pour n'en montrer que le bord.
    if (boutons === 'droite') {
      s += `<rect x="${bx + bl - 2}" y="${by + bh * 0.2}" width="4.5" height="${Math.min(46, bh * 0.1)}" rx="2" fill="#2E2640"/>
      <rect x="${bx + bl - 2}" y="${by + bh * 0.2 + Math.min(58, bh * 0.13)}" width="4.5" height="${Math.min(30, bh * 0.07)}" rx="2" fill="#2E2640"/>`;
    } else {
      s += `<rect x="${bx + bl * 0.2}" y="${by - 2.5}" width="${Math.min(46, bl * 0.1)}" height="4.5" rx="2" fill="#2E2640"/>`;
    }
    s += `<rect x="${bx}" y="${by}" width="${bl}" height="${bh}" rx="${brx}" fill="#08060D" filter="url(#ombreAppareil)"/>
    <rect x="${bx + 0.75}" y="${by + 0.75}" width="${bl - 1.5}" height="${bh - 1.5}" rx="${brx - 0.75}" fill="none" stroke="url(#${arete})" stroke-width="1.5"/>`;
    const cx = camera === 'droite' ? x + l * 0.75 : x + l / 2;
    s += `<circle cx="${cx}" cy="${by + haut / 2 + 0.5}" r="${Math.min(3.4, haut / 4)}" fill="#141019" stroke="#2A2438"/>`;
    s += ecran(cle, x, y, l, h, rx);
    s += `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${rx}" fill="url(#${reflet})"/>
    <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${rx}" fill="none" stroke="#000000" stroke-opacity="0.55"/>`;
    return { svg: s, bas: by + bh };
  }

  /// Coupe un texte en lignes d'au plus [max] points, au jugé.
  function lignes(s, taille, max) {
    const out = [];
    let cour = '';
    for (const m of s.split(' ')) {
      const essai = cour ? cour + ' ' + m : m;
      if (essai.length * taille * 0.53 > max && cour) { out.push(cour); cour = m; } else cour = essai;
    }
    if (cour) out.push(cour);
    return out;
  }

  /// La légende sous un appareil : le titre, un court trait fuchsia, puis
  /// la description, centrés. Rend le SVG et le bas de la légende.
  function legende(cx, y, largeur, titre, desc, { taille = 12.5, titreTaille = 13 } = {}) {
    let s = texte(cx, y, titre.toUpperCase(), { taille: titreTaille, couleur: TITRE, police: MONO, poids: 700, ancre: 'middle', extra: 'letter-spacing="1.5"' });
    s += `<rect x="${cx - 12}" y="${y + 9}" width="24" height="2" rx="1" fill="${ACCENT}"/>`;
    const ls = lignes(desc, taille, largeur);
    ls.forEach((l, i) => { s += texte(cx, y + 30 + i * (taille + 5), l, { taille, couleur: TEXTE, ancre: 'middle' }); });
    return { svg: s, bas: y + 30 + (ls.length - 1) * (taille + 5) };
  }

  // ------------------------------------------ une rangée d'appareils égaux
  function planche(nom, { titre, phrase, format, ecrans, sl, rx, colonnes, gapX, gapY, bord = 10, haut = 16, camera, boutons, legendeL, label }) {
    const cles = ecrans.map((e) => `${format}/${e[0]}`);
    const sh = hauteur(cles[0], sl);
    const n = ecrans.length, cols = colonnes || n, rangs = Math.ceil(n / cols);
    const devL = sl + 2 * bord, devH = sh + haut + bord;
    const totalL = cols * devL + (cols - 1) * gapX;
    const x0 = (1280 - totalL) / 2 + bord;
    const HAUT = 116;
    // La hauteur des légendes : la plus haute de la rangée fixe le pas.
    const largeurLeg = legendeL || devL + gapX - 20;
    const hLeg = Math.max(...ecrans.map((e) => lignes(e[2], 12.5, largeurLeg).length)) * 17.5 + 44;
    const blocH = devH + hLeg;
    let corps = defs(cles) + entete(titre, phrase);
    let bas = 0;
    ecrans.forEach(([cle, t1, desc], i) => {
      const col = i % cols, rg = Math.floor(i / cols);
      const x = x0 + col * (devL + gapX);
      const y = HAUT + haut + rg * (blocH + gapY);
      const ap = appareil(`${format}/${cle}`, x, y, sl, sh, { bord, haut, rx, camera, boutons });
      const lg = legende(x + sl / 2, ap.bas + 38, largeurLeg, t1, desc);
      corps += ap.svg + lg.svg;
      bas = Math.max(bas, lg.bas);
    });
    svg(nom, 1280, Math.round(bas + 40), corps, label);
  }

  // ----------------------------------------------------- téléphone, 16/9
  planche('captures-telephone.svg', {
    titre: t('TÉLÉPHONE, 16/9', 'PHONE, 16:9'),
    phrase: t('390 points de large : deux colonnes, les en-têtes sur deux lignes.', '390 points wide: two columns, headers on two lines.'),
    format: '169', sl: 244, rx: 22, gapX: 44, gapY: 0,
    ecrans: [
      ['verrou', t('Verrou', 'Lock'), t('Plus de hauteur, plus d’air.', 'More height, more air.')],
      ['repertoire', t('Répertoire', 'Directory'), t('Deux colonnes, la recherche sous le titre.', 'Two columns, search below the title.')],
      ['fiche', t('Fiche', 'Person'), t('Les pastilles passent à la ligne.', 'The chips wrap.')],
      ['carte', t('Carte', 'Map'), t('La même carte, plus étroite.', 'The same map, narrower.')],
    ],
    label: t('Quatre écrans sur un téléphone 16/9 : le verrou, le répertoire en deux colonnes, la fiche d’Enzo avec ses pastilles sur deux lignes, et la carte.',
      'Four screens on a 16:9 phone: the lock, the directory in two columns, Enzo’s page with its chips on two lines, and the map.'),
  });

  // ---------------------------------------------- grand écran déplié, 4/3
  planche('captures-tablette.svg', {
    titre: t('GRAND ÉCRAN, 4/3', 'LARGE SCREEN, 4:3'),
    phrase: t('l’écran déplié, 900 × 1200 points : le rail à gauche.', 'the unfolded screen, 900 × 1200 points: the rail on the left.'),
    format: '43', sl: 330, rx: 16, gapX: 48, gapY: 0, bord: 13, haut: 18, camera: 'droite',
    ecrans: [
      ['repertoire', t('Répertoire', 'Directory'), t('Quatre colonnes, tous les filtres sur une ligne.', 'Four columns, every filter on one line.')],
      ['carte', t('Carte', 'Map'), t('La carte, le classement et les visages vus à Vannes.', 'The map, the ranking and the faces seen in Vannes.')],
      ['fiche', t('Fiche', 'Person'), t('La photo prend la largeur.', 'The photo takes the width.')],
    ],
    label: t('Trois écrans sur grand écran 4/3 : le répertoire en quatre colonnes avec tous les filtres sur une ligne, la carte avec le classement et les visages vus à Vannes, et la fiche d’Enzo avec la photo sur toute la largeur.',
      'Three screens on a large 4:3 screen: the directory in four columns with every filter on one line, the map with the ranking and the faces seen in Vannes, and Enzo’s page with the photo across the full width.'),
  });

  // ------------------------------------------------- grand écran couché
  planche('captures-paysage.svg', {
    titre: t('GRAND ÉCRAN COUCHÉ, 4/3', 'LARGE SCREEN ON ITS SIDE, 4:3'),
    phrase: t('l’écran déplié tenu à l’horizontale, 1200 × 900 points.', 'the unfolded screen held sideways, 1200 × 900 points.'),
    format: '34', sl: 500, rx: 16, colonnes: 2, gapX: 64, gapY: 36, bord: 14, haut: 14, boutons: 'haut',
    ecrans: [
      ['repertoire', t('Répertoire', 'Directory'), t('Le rail à gauche, quatre colonnes de cartes plus grandes.', 'The rail on the left, four columns of larger cards.')],
      ['fiche', t('Fiche', 'Person'), t('Deux volets : la photo sur toute la hauteur, la fiche qui défile à côté.', 'Two panes: the photo full height, the page scrolling beside it.')],
      ['stats', t('Statistiques', 'Statistics'), t('Le podium garde sa taille de podium au milieu de la largeur.', 'The podium keeps a podium size in the middle of the width.')],
      ['carte', t('Carte', 'Map'), t('La Bretagne entière d’un coup d’œil, le classement dessous.', 'All of Brittany at a glance, the ranking below.')],
    ],
    label: t('Quatre écrans sur grand écran tenu à l’horizontale : le répertoire en quatre colonnes à côté du rail, la fiche d’Enzo en deux volets avec la photo à gauche et les rencontres à droite, les statistiques avec le podium centré, et la carte de la Bretagne au dessus du classement des villes.',
      'Four screens on a large screen held sideways: the directory in four columns next to the rail, Enzo’s page in two panes with the photo on the left and the encounters on the right, the statistics with the podium centred, and the map of Brittany above the city ranking.'),
  });

  // --------------------------------------------------- format passeport
  // Les douze écrans en grille fixe, six par rangée, chacun dans son
  // appareil avec sa légende.
  planche('captures-passeport.svg', {
    titre: t('FORMAT PASSEPORT', 'PASSPORT FORMAT'),
    phrase: t('l’écran de couverture du Fold, 460 × 727 points.', 'the Fold cover screen, 460 × 727 points.'),
    format: 'passeport', sl: 152, rx: 14, colonnes: 6, gapX: 34, gapY: 26, bord: 8, haut: 13, legendeL: 196,
    ecrans: [
      ['lancement-1', t('Lancement', 'Launch'), t('L’icône d’Android, sur le fond de l’application.', 'Android’s icon, on the app’s background.')],
      ['lancement-2', t('Chargement', 'Loading'), t('L’anneau se trace, le nom monte, les communes se lisent.', 'The ring draws, the name rises, the communes load.')],
      ['verrou', t('Verrou', 'Lock'), t('Le logo a glissé à sa place. L’empreinte charge la clé.', 'The logo slid into place. The fingerprint loads the key.')],
      ['repertoire', t('Répertoire', 'Directory'), t('Trois colonnes, les tris, les villes et les étiquettes.', 'Three columns, sortings, cities and tags.')],
      ['fiche', t('Fiche', 'Person'), t('La photo se touche pour s’ouvrir en grand.', 'Tap the photo to open it full size.')],
      ['fiche-galerie', t('Carnet et galerie', 'Notebook, gallery'), t('Les notes datées, les photos et les vidéos.', 'Dated notes, photos and videos.')],
      ['visionneuse', t('Visionneuse', 'Viewer'), t('La vidéo déchiffrée le temps de la lecture.', 'The video decrypted while it plays.')],
      ['point', t('Point précis', 'Exact point'), t('Les communes voisines comme repères, sans tuile.', 'Nearby communes as landmarks, no tiles.')],
      ['stats', t('Statistiques', 'Statistics'), t('Le total, l’écart avec l’an passé, le podium.', 'The total, the gap with last year, the podium.')],
      ['carte', t('Carte', 'Map'), t('La France embarquée, les villes à leur place.', 'France embedded, cities in their place.')],
      ['agenda', t('Calendrier', 'Calendar'), t('Un mois sur sept colonnes, trois signes par jour.', 'A month in seven columns, three signs a day.')],
      ['reglages', t('Réglages', 'Settings'), t('Le verrou, la sauvegarde et sa date, la restauration.', 'The lock, the backup and its date, restore.')],
    ],
    label: t('Douze écrans au format passeport, l’écran de couverture du Fold. Lancement : l’icône sur le fond de l’application. Chargement : un anneau se trace autour du logo pendant que le nom monte. Verrou : le logo a glissé à sa place, le bouton d’empreinte attend. Répertoire : trois colonnes de fiches avec photo, tris, villes et étiquettes. Fiche : la photo d’Enzo en grand, ses étiquettes, ses rencontres. Carnet et galerie : les notes datées, une photo et une vidéo. Visionneuse : la vidéo en lecture, avec le bouton de téléchargement. Point précis : la carte autour d’Auray avec les communes voisines et l’épingle. Statistiques : le total de l’année et le podium. Carte : la Bretagne et les villes regroupées. Calendrier : septembre sur sept colonnes. Réglages : le verrou, la sauvegarde, la restauration.',
      'Twelve screens in passport format, the Fold cover screen. Launch: the icon on the app’s background. Loading: a ring draws around the logo while the name rises. Lock: the logo has slid into place, the fingerprint button waits. Directory: three columns of people with photos, sortings, cities and tags. Person: Enzo’s photo full size, his tags, his encounters. Notebook and gallery: dated notes, a photo and a video. Viewer: the video playing, with the download button. Exact point: the map around Auray with nearby communes and the pin. Statistics: the year total and the podium. Map: Brittany and the clustered cities. Calendar: September in seven columns. Settings: the lock, the backup, restore.'),
  });
};

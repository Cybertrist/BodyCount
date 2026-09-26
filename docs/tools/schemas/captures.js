// Les quatre planches de la section « Les écrans », en SVG animés.
//
// Chaque capture est posée dans un vrai cadre d'appareil, à sa proportion
// exacte : l'écran de couverture du Fold pour le format passeport, un
// téléphone 16/9, le Fold déplié en 4/3, puis le même couché. Rien n'est
// rogné ni étiré : la capture remplit l'écran, dont seuls les coins sont
// arrondis.
//
// L'animation reste discrète. Les appareils entrent une seule fois, l'un
// après l'autre (animations sans repeatCount, figées à la fin), puis une
// surbrillance passe d'écran en écran et allume sa légende. Au format
// passeport, douze écrans ne tiendraient pas lisibles côte à côte : un
// grand appareil les montre tour à tour, et la grille de droite dit où
// on en est.
//
// Les images viennent de captures.json, réduites par vignettes-captures.js.
module.exports = (O) => {
  const { t, svg, texte, entete, fondu, visible, esc, MONO, SANS, CARTE, BORD, TITRE, TEXTE, DISCRET, ACCENT, VIOLET } = O;
  const CAPTURES = require('./captures.json');

  // ------------------------------------------------------------ les outils

  /// Les images d'une planche, une fois chacune, en <symbol>.
  const symboles = (cles) => `<defs>${cles.map((c) => {
    const { l, h, url } = CAPTURES[c];
    return `<symbol id="${idCapture(c)}" viewBox="0 0 ${l} ${h}"><image width="${l}" height="${h}" href="${url}"/></symbol>`;
  }).join('')}</defs>`;
  const idCapture = (c) => 'capture-' + c.replace(/[^a-z0-9]/gi, '-');

  /// Une capture dans l'écran [x, y, l, h], coins arrondis à [rx].
  function ecran(cle, x, y, l, h, rx) {
    const c = O.id('ecranCapture');
    return `<clipPath id="${c}"><rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${rx}"/></clipPath>
    <g clip-path="url(#${c})"><rect x="${x}" y="${y}" width="${l}" height="${h}" fill="#0B0616"/>
      <use href="#${idCapture(cle)}" x="${x}" y="${y}" width="${l}" height="${h}"/></g>`;
  }

  /// Le corps de l'appareil autour d'un écran [x, y, l, h] : bordure,
  /// caméra dans le cadre, boutons sur la tranche, pli du Fold s'il y a
  /// lieu (vertical déplié, horizontal couché), reflet léger.
  function appareil(x, y, l, h, { bord = 10, haut = 16, rx = 22, pli = null, boutons = 'droite' } = {}) {
    const bx = x - bord, by = y - haut, bl = l + 2 * bord, bh = h + haut + bord;
    const brx = rx + bord;
    const g = O.id('reflet');
    let s = `<ellipse cx="${x + l / 2}" cy="${by + bh + 14}" rx="${bl * 0.42}" ry="10" fill="${VIOLET}" opacity="0.12" filter="url(#halo)"/>
    <rect x="${bx}" y="${by}" width="${bl}" height="${bh}" rx="${brx}" fill="#07050C" stroke="#342C48" stroke-width="1.5"/>
    <rect x="${bx + 2.5}" y="${by + 2.5}" width="${bl - 5}" height="${bh - 5}" rx="${brx - 2.5}" fill="none" stroke="#FFFFFF" stroke-opacity="0.05"/>`;
    // Les boutons de la tranche.
    if (boutons === 'droite') {
      s += `<rect x="${bx + bl - 0.5}" y="${by + bh * 0.2}" width="3" height="${Math.min(46, bh * 0.1)}" rx="1.5" fill="#2A2438"/>
      <rect x="${bx + bl - 0.5}" y="${by + bh * 0.2 + Math.min(58, bh * 0.13)}" width="3" height="${Math.min(30, bh * 0.07)}" rx="1.5" fill="#2A2438"/>`;
    } else {
      s += `<rect x="${bx + bl * 0.2}" y="${by - 2.5}" width="${Math.min(46, bl * 0.1)}" height="3" rx="1.5" fill="#2A2438"/>`;
    }
    // La caméra, dans le cadre au-dessus de l'écran.
    s += `<circle cx="${pli === 'vertical' ? x + l * 0.75 : x + l / 2}" cy="${by + haut / 2 + 1}" r="3.2" fill="#15111E" stroke="#2A2438"/>`;
    const dessus = `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.06"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
    <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${rx}" fill="url(#${g})"/>
    ${pli === 'vertical' ? `<rect x="${x + l / 2 - 1}" y="${y}" width="2" height="${h}" fill="#000000" opacity="0.14"/>` : ''}
    ${pli === 'horizontal' ? `<rect x="${x}" y="${y + h / 2 - 1}" width="${l}" height="2" fill="#000000" opacity="0.14"/>` : ''}
    <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${rx}" fill="none" stroke="#000000" stroke-opacity="0.6"/>`;
    return { dessous: s, dessus, cadre: { x: bx, y: by, l: bl, h: bh, rx: brx } };
  }

  /// Entre une seule fois, à [debut] secondes : fondu et petite montée.
  const entree = (debut, contenu, dy = 18) => `<g opacity="0">
    <animate attributeName="opacity" from="0" to="1" begin="${debut}s" dur="0.7s" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 ${dy}" to="0 0" begin="${debut}s" dur="0.7s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.2 0.8 0.3 1"/>
    ${contenu}</g>`;

  /// Coupe un texte en lignes d'au plus [max] points, au jugé.
  function lignes(s, taille, max) {
    const mots = s.split(' ');
    const out = [];
    let cour = '';
    for (const m of mots) {
      const essai = cour ? cour + ' ' + m : m;
      if (essai.length * taille * 0.52 > max && cour) {
        out.push(cour);
        cour = m;
      } else cour = essai;
    }
    if (cour) out.push(cour);
    return out;
  }

  /// La légende sous un écran : titre, trait qui se remplit pendant son
  /// tour, description sur deux lignes au plus.
  function legende(cx, y, largeur, titre, desc, C, de, a) {
    const t1 = texte(cx, y, titre.toUpperCase(), { taille: 13, couleur: TITRE, police: MONO, poids: 700, ancre: 'middle', extra: 'letter-spacing="1.5"' });
    const allume = texte(cx, y, titre.toUpperCase(), { taille: 13, couleur: ACCENT, police: MONO, poids: 700, ancre: 'middle', extra: 'letter-spacing="1.5"' });
    const tl = Math.min(largeur - 20, 120);
    let s = `${t1}<g opacity="0">${visible(C, de, a, 0.006)}${allume}</g>
    <rect x="${cx - tl / 2}" y="${y + 9}" width="${tl}" height="2" rx="1" fill="${BORD}"/>
    <rect x="${cx - tl / 2}" y="${y + 9}" width="0" height="2" rx="1" fill="${ACCENT}">${fondu('width', C, [[0, 0], [de, 0], [a, tl], [Math.min(a + 0.006, 1), 0], [1, 0]])}</rect>`;
    lignes(desc, 12.5, largeur).slice(0, 3).forEach((l, i) => {
      s += texte(cx, y + 30 + i * 17, l, { taille: 12.5, couleur: TEXTE, ancre: 'middle' });
    });
    return s;
  }

  /// La surbrillance d'un appareil pendant son tour.
  const lueur = (c, C, de, a) =>
    `<rect x="${c.x - 5}" y="${c.y - 5}" width="${c.l + 10}" height="${c.h + 10}" rx="${c.rx + 5}" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0" filter="url(#halo)">${visible(C, de, a, 0.008)}</rect>`;

  // ------------------------------------------ une rangée d'appareils égaux
  function rangee(nom, { titre, phrase, format, ecrans, sl, sh, rx, pli, colonnes, gapX, gapY, bord = 10, haut = 16, boutons, parTour = 3.2, label }) {
    const n = ecrans.length;
    const C = n * parTour;
    const cols = colonnes || n;
    const rangs = Math.ceil(n / cols);
    const devL = sl + 2 * bord;
    const devH = sh + haut + bord;
    const totalL = cols * devL + (cols - 1) * gapX;
    const x0 = (1280 - totalL) / 2 + bord;
    const HAUT = 112;
    const blocH = devH + 100;
    const H = HAUT + rangs * blocH + (rangs - 1) * gapY + 16;
    let corps = symboles(ecrans.map((e) => `${format}/${e[0]}`)) + entete(titre, phrase);
    ecrans.forEach(([cle, t1, desc], i) => {
      const col = i % cols, rg = Math.floor(i / cols);
      const x = x0 + col * (devL + gapX);
      const y = HAUT + haut + rg * (blocH + gapY);
      const de = i / n, a = (i + 1) / n;
      const ap = appareil(x, y, sl, sh, { bord, haut, rx, pli, boutons });
      corps += entree(0.25 + i * 0.22, `${ap.dessous}${ecran(`${format}/${cle}`, x, y, sl, sh, rx)}${ap.dessus}
        ${lueur(ap.cadre, C, de, a)}
        ${legende(x + sl / 2, y + sh + bord + 36, devL + gapX - 16, t1, desc, C, de, a)}`);
    });
    svg(nom, 1280, Math.round(H), corps, label);
  }

  // ----------------------------------------------------- téléphone, 16/9
  rangee('captures-telephone.svg', {
    titre: t('TÉLÉPHONE, 16/9', 'PHONE, 16:9'),
    phrase: t('390 points de large : deux colonnes, les en-têtes sur deux lignes.', '390 points wide: two columns, headers on two lines.'),
    format: '169', sl: 262, sh: Math.round(262 * 840 / 520), rx: 22, gapX: 30, gapY: 0,
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
  rangee('captures-tablette.svg', {
    titre: t('GRAND ÉCRAN, 4/3', 'LARGE SCREEN, 4:3'),
    phrase: t('l’écran déplié, 900 × 1200 points : le rail à gauche.', 'the unfolded screen, 900 × 1200 points: the rail on the left.'),
    format: '43', sl: 352, sh: Math.round(352 * 733 / 600), rx: 16, pli: 'vertical', gapX: 38, gapY: 0, bord: 12, haut: 18,
    ecrans: [
      ['repertoire', t('Répertoire', 'Directory'), t('Quatre colonnes, tous les filtres sur une ligne.', 'Four columns, every filter on one line.')],
      ['carte', t('Carte', 'Map'), t('La carte, le classement et les visages vus à Vannes.', 'The map, the ranking and the faces seen in Vannes.')],
      ['fiche', t('Fiche', 'Person'), t('La photo prend la largeur.', 'The photo takes the width.')],
    ],
    label: t('Trois écrans sur grand écran 4/3 : le répertoire en quatre colonnes avec tous les filtres sur une ligne, la carte avec le classement et les visages vus à Vannes, et la fiche d’Enzo avec la photo sur toute la largeur.',
      'Three screens on a large 4:3 screen: the directory in four columns with every filter on one line, the map with the ranking and the faces seen in Vannes, and Enzo’s page with the photo across the full width.'),
  });

  // ------------------------------------------------- grand écran couché
  rangee('captures-paysage.svg', {
    titre: t('GRAND ÉCRAN COUCHÉ, 4/3', 'LARGE SCREEN ON ITS SIDE, 4:3'),
    phrase: t('l’écran déplié tenu à l’horizontale, 1200 × 900 points.', 'the unfolded screen held sideways, 1200 × 900 points.'),
    format: '34', sl: 520, sh: Math.round(520 * 630 / 900), rx: 16, pli: 'horizontal', colonnes: 2, gapX: 60, gapY: 18, bord: 14, haut: 14, boutons: 'haut',
    parTour: 3.6,
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
  // Un grand appareil qui montre les douze écrans tour à tour, et la
  // grille des douze à droite, qui allume celui qu'on regarde.
  {
    const ecrans = [
      ['lancement-1', t('Lancement', 'Launch'), t('L’icône d’Android, sur le fond de l’application.', 'Android’s icon, on the app’s background.')],
      ['lancement-2', t('Chargement', 'Loading'), t('L’anneau se trace, le nom monte, les communes se lisent.', 'The ring draws, the name rises, the communes load.')],
      ['verrou', t('Verrou', 'Lock'), t('Le logo a glissé à sa place. L’empreinte charge la clé.', 'The logo slid into place. The fingerprint loads the key.')],
      ['repertoire', t('Répertoire', 'Directory'), t('Trois colonnes, les tris, les villes et les étiquettes.', 'Three columns, sortings, cities and tags.')],
      ['fiche', t('Fiche', 'Person'), t('La photo se touche pour s’ouvrir en grand.', 'Tap the photo to open it full size.')],
      ['fiche-galerie', t('Carnet et galerie', 'Notebook and gallery'), t('Les notes datées, les photos et les vidéos.', 'Dated notes, photos and videos.')],
      ['visionneuse', t('Visionneuse', 'Viewer'), t('La vidéo déchiffrée le temps de la lecture, et le téléchargement.', 'The video decrypted while it plays, and the download.')],
      ['point', t('Point précis', 'Exact point'), t('Les communes voisines comme repères, sans aucune tuile.', 'Nearby communes as landmarks, without a single tile.')],
      ['stats', t('Statistiques', 'Statistics'), t('Le total, l’écart avec l’an passé, le podium.', 'The total, the gap with last year, the podium.')],
      ['carte', t('Carte', 'Map'), t('La France embarquée, les villes à leur place.', 'France embedded, cities in their place.')],
      ['agenda', t('Calendrier', 'Calendar'), t('Un mois sur sept colonnes, trois signes par jour.', 'A month in seven columns, three signs a day.')],
      ['reglages', t('Réglages', 'Settings'), t('Le verrou, la sauvegarde et sa date, la restauration.', 'The lock, the backup and its date, restore.')],
    ];
    const n = ecrans.length;
    const C = n * 3;
    const cle = (e) => `passeport/${e[0]}`;
    let corps = symboles(ecrans.map(cle)) + entete(t('FORMAT PASSEPORT', 'PASSPORT FORMAT'),
      t('l’écran de couverture du Fold, 460 × 727 points.', 'the Fold cover screen, 460 × 727 points.'));

    // Le grand appareil, à gauche.
    const SL = 368, SH = Math.round(368 * 661 / 460), SX = 92, SY = 118;
    const ap = appareil(SX, SY, SL, SH, { bord: 11, haut: 18, rx: 24 });
    let grand = ap.dessous;
    ecrans.forEach((e, i) => {
      grand += `<g opacity="0">${visible(C, i / n, (i + 1) / n, 0.012)}${ecran(cle(e), SX, SY, SL, SH, 24)}</g>`;
    });
    grand += ap.dessus;
    // La légende de l'écran montré, sous l'appareil.
    const LY = SY + SH + 11 + 40;
    ecrans.forEach(([, t1, desc], i) => {
      grand += `<g opacity="0">${visible(C, i / n, (i + 1) / n, 0.01)}
        ${texte(SX + SL / 2, LY, t1.toUpperCase(), { taille: 15, couleur: ACCENT, police: MONO, poids: 700, ancre: 'middle', extra: 'letter-spacing="2"' })}
        ${lignes(desc, 13.5, SL + 40).map((l, k) => texte(SX + SL / 2, LY + 24 + k * 19, l, { taille: 13.5, couleur: TEXTE, ancre: 'middle' })).join('')}
      </g>`;
    });
    // Où l'on en est : douze points sous la légende.
    const PY = LY + 70;
    ecrans.forEach((e, i) => {
      const px = SX + SL / 2 + (i - (n - 1) / 2) * 16;
      grand += `<circle cx="${px}" cy="${PY}" r="3" fill="${BORD}"/>
        <circle cx="${px}" cy="${PY}" r="3.5" fill="${ACCENT}" opacity="0">${visible(C, i / n, (i + 1) / n, 0.006)}</circle>`;
    });
    corps += entree(0.2, grand);

    // La grille des douze, à droite : 4 colonnes, 3 rangées.
    const GX = 560, GY = 110, TL = 128, TH = Math.round(128 * 661 / 460), PAS_X = 170, PAS_Y = TH + 62;
    ecrans.forEach((e, i) => {
      const col = i % 4, rg = Math.floor(i / 4);
      const x = GX + col * PAS_X, y = GY + rg * PAS_Y;
      const de = i / n, a = (i + 1) / n;
      const cadre = { x: x - 5, y: y - 5, l: TL + 10, h: TH + 10, rx: 16 };
      corps += entree(0.5 + i * 0.08, `
        <rect x="${cadre.x}" y="${cadre.y}" width="${cadre.l}" height="${cadre.h}" rx="${cadre.rx}" fill="#07050C" stroke="#342C48"/>
        ${ecran(cle(e), x, y, TL, TH, 11)}
        <rect x="${x}" y="${y}" width="${TL}" height="${TH}" rx="11" fill="${'#0D1117'}" opacity="0.45">
          ${fondu('opacity', C, [[0, 0.45], [de, 0.45], [Math.min(de + 0.004, 1), 0], [a, 0], [Math.min(a + 0.004, 1), 0.45], [1, 0.45]])}</rect>
        <rect x="${cadre.x - 3}" y="${cadre.y - 3}" width="${cadre.l + 6}" height="${cadre.h + 6}" rx="${cadre.rx + 3}" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0">${visible(C, de, a, 0.006)}</rect>
        ${texte(x + TL / 2, y + TH + 24, e[1], { taille: 12, couleur: TEXTE, poids: 600, ancre: 'middle' })}
        <g opacity="0">${visible(C, de, a, 0.006)}${texte(x + TL / 2, y + TH + 24, e[1], { taille: 12, couleur: ACCENT, poids: 700, ancre: 'middle' })}</g>`, 10);
    });
    const H = Math.max(PY + 30, GY + 3 * PAS_Y + 6);
    svg('captures-passeport.svg', 1280, Math.round(H), corps, t(
      'Douze écrans au format passeport, montrés tour à tour dans l’écran de couverture du Fold, la grille des douze à côté. Lancement : l’icône sur le fond de l’application. Chargement : un anneau se trace autour du logo pendant que le nom monte. Verrou : le logo a glissé à sa place, le bouton d’empreinte attend. Répertoire : trois colonnes de fiches avec photo, tris, villes et étiquettes. Fiche : la photo d’Enzo en grand, ses étiquettes, ses rencontres. Carnet et galerie : les notes datées, une photo et une vidéo. Visionneuse : la vidéo en lecture, avec le bouton de téléchargement. Point précis : la carte autour d’Auray avec les communes voisines et l’épingle. Statistiques : le total de l’année et le podium. Carte : la Bretagne et les villes regroupées. Calendrier : septembre sur sept colonnes. Réglages : le verrou, la sauvegarde, la restauration.',
      'Twelve screens in passport format, shown one after another on the Fold cover screen, with the grid of all twelve beside it. Launch: the icon on the app’s background. Loading: a ring draws around the logo while the name rises. Lock: the logo has slid into place, the fingerprint button waits. Directory: three columns of people with photos, sortings, cities and tags. Person: Enzo’s photo full size, his tags, his encounters. Notebook and gallery: dated notes, a photo and a video. Viewer: the video playing, with the download button. Exact point: the map around Auray with nearby communes and the pin. Statistics: the year total and the podium. Map: Brittany and the clustered cities. Calendar: September in seven columns. Settings: the lock, the backup, restore.'));
  }
};

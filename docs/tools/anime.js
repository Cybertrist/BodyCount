// La chaîne de chiffrement, animée.
//
// Un SVG plutôt qu'un GIF : le fichier fait quelques kilo-octets, reste
// net à n'importe quelle taille, et son texte est sélectionnable. Les
// animations sont en SMIL, que les navigateurs jouent même lorsque le
// SVG est chargé par une balise <img>, ce qui est le cas sur GitHub.
//
// Aucune police externe n'est chargée : un SVG affiché en <img> n'a pas
// le droit d'aller chercher quoi que ce soit sur le réseau, et une
// @import silencieusement ignorée donnerait une figure cassée chez les
// autres et correcte chez soi. On s'en tient donc aux familles système.
//
//   node docs/tools/anime.js          rend le français
//   LANGUE=en node docs/tools/anime.js  rend l'anglais

const fs = require('fs');
const path = require('path');

const LG = process.env.LANGUE === 'en' ? 'en' : 'fr';
const t = (fr, en) => (LG === 'en' ? en : fr);

const MONO = 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,monospace';
const SANS = 'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif';

const FOND = '#0D1117';
const CARTE = '#131A24';
const BORD = '#1F2833';
const TITRE = '#F0F4F8';
const TEXTE = '#8B99A8';
const DISCRET = '#5C6A7A';
const ACCENT = '#E879F9';
const FIL = '#2F3A47';

/// Une carte du schéma, avec son liseré d'accent à gauche.
function carte(x, y, l, h, titre, sous, opacite = 1) {
  return `
  <g>
    <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="11"
          fill="${CARTE}" stroke="${BORD}" stroke-width="1"/>
    <rect x="${x}" y="${y + 12}" width="3" height="${h - 24}" rx="1.5"
          fill="${ACCENT}" opacity="${opacite}"/>
    <text x="${x + 20}" y="${y + h / 2 - 5}" font-family="${MONO}"
          font-size="13.5" font-weight="600" fill="${TITRE}">${titre}</text>
    <text x="${x + 20}" y="${y + h / 2 + 15}" font-family="${SANS}"
          font-size="12" fill="${TEXTE}">${sous}</text>
  </g>`;
}

/// Une bille qui parcourt un chemin, indéfiniment.
///
/// Le décalage évite que les deux branches partent ensemble : deux
/// billes synchrones se lisent comme une seule qui se dédouble.
function bille(chemin, duree, decalage) {
  return `
  <g>
    <circle r="7" fill="${ACCENT}" opacity="0.18">
      <animateMotion dur="${duree}s" begin="${decalage}s" repeatCount="indefinite"
                     path="${chemin}" calcMode="spline"
                     keyTimes="0;1" keySplines="0.4 0 0.6 1"/>
    </circle>
    <circle r="3" fill="#FFFFFF">
      <animateMotion dur="${duree}s" begin="${decalage}s" repeatCount="indefinite"
                     path="${chemin}" calcMode="spline"
                     keyTimes="0;1" keySplines="0.4 0 0.6 1"/>
      <animate attributeName="opacity" dur="${duree}s" begin="${decalage}s"
               repeatCount="indefinite"
               values="0;1;1;1;0" keyTimes="0;0.08;0.5;0.9;1"/>
    </circle>
  </g>`;
}

const filDb = 'M 130 170 H 664 V 88 H 1224';
const filPhotos = 'M 130 170 H 664 V 252 H 1224';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="340"
     viewBox="0 0 1280 340" role="img"
     aria-label="${t(
       "L'empreinte charge la clé maîtresse depuis le Keystore Android. HKDF-SHA256 en dérive deux clés : le mot de passe SQLCipher qui ouvre le journal chiffré, et la clé AES-GCM qui ouvre le coffre des photos et des vidéos.",
       'The fingerprint loads the master key from the Android Keystore. HKDF-SHA256 derives two keys from it: the SQLCipher password that opens the encrypted journal, and the AES-GCM key that opens the photo and video vault.',
     )}">
  <rect width="1280" height="340" fill="${FOND}"/>

  <!-- Les fils, posés sous les cartes : une bille qui passe derrière une
       carte disparaît, ce qui donne l'impression qu'elle la traverse. -->
  <path d="${filDb}" stroke="${FIL}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="${filPhotos}" stroke="${FIL}" stroke-width="1.8" fill="none" stroke-linecap="round"/>

  ${bille(filDb, 4.2, 0)}
  ${bille(filPhotos, 4.2, 1.4)}

  <!-- L'empreinte, qui respire. Rien ne circule avant elle. -->
  <g transform="translate(91 170)">
    <circle r="30" fill="${ACCENT}" opacity="0.10">
      <animate attributeName="r" dur="2.8s" repeatCount="indefinite"
               values="26;33;26" calcMode="spline"
               keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
      <animate attributeName="opacity" dur="2.8s" repeatCount="indefinite"
               values="0.16;0.04;0.16"/>
    </circle>
    <circle r="23" fill="${CARTE}" stroke="${BORD}" stroke-width="1"/>
    <g stroke="${ACCENT}" stroke-width="1.7" fill="none" stroke-linecap="round">
      <path d="M -9 4 a 9 11 0 0 1 18 0"/>
      <path d="M -5.5 6 a 5.5 7 0 0 1 11 0"/>
      <path d="M -12.5 2 a 12.5 15 0 0 1 25 0"/>
      <path d="M 0 5 v 7"/>
    </g>
  </g>
  <text x="91" y="228" text-anchor="middle" font-family="${SANS}"
        font-size="11.5" fill="${DISCRET}">${t('empreinte', 'fingerprint')}</text>

  ${carte(190, 134, 214, 72, t('Keystore Android', 'Android Keystore'), t('clé maîtresse, 256 bits', 'master key, 256 bits'))}
  ${carte(464, 134, 200, 72, 'HKDF-SHA256', t('deux clés dérivées', 'two derived keys'), 0.8)}

  ${carte(730, 52, 258, 72, 'bodycount/db/v1', t('mot de passe SQLCipher', 'SQLCipher password'), 0.6)}
  ${carte(730, 216, 258, 72, 'bodycount/photos/v1', t('clé AES-GCM', 'AES-GCM key'), 0.6)}

  ${carte(1044, 52, 180, 72, 'journal.db', t('chiffré au repos', 'encrypted at rest'), 0.4)}
  ${carte(1044, 216, 180, 72, 'vault/', t('photos et vidéos', 'photos and videos'), 0.4)}

  <text x="640" y="322" text-anchor="middle" font-family="${SANS}"
        font-size="12.5" fill="${DISCRET}">${t(
          'Rien de cette chaîne n’existe en mémoire avant l’empreinte.',
          'None of this chain exists in memory before the fingerprint.',
        )}</text>
</svg>
`;


// ------------------------------------------------------------------------
// Les autres schémas animés. Même grammaire que la chaîne de chiffrement :
// cartes à liseré, fils posés dessous, billes qui les parcourent.

const ROUGE = '#E2725F';
const VERT = '#4ADE80';

/// Une valeur qui ne vit que pendant une fenêtre d'une boucle.
///
/// SMIL ne sait pas répéter une animation avec un temps mort : on anime
/// donc sur toute la boucle, et la fenêtre se règle par keyTimes.
function fenetre(debut, fin, total, attr = 'opacity', plein = 1, vide = 0) {
  const a = (debut / total).toFixed(4);
  const b = (Math.min(debut + 0.25, fin) / total).toFixed(4);
  const c = (Math.max(fin - 0.25, debut) / total).toFixed(4);
  const d = (fin / total).toFixed(4);
  return `<animate attributeName="${attr}" dur="${total}s" repeatCount="indefinite"
             values="${vide};${vide};${plein};${plein};${vide};${vide}"
             keyTimes="0;${a};${b};${c};${d};1"/>`;
}

/// Une bille qui ne part qu'une fois par boucle, entre deux instants.
function billeFenetre(chemin, debut, fin, total) {
  const a = (debut / total).toFixed(4);
  const b = (fin / total).toFixed(4);
  const mouvement = `<animateMotion dur="${total}s" repeatCount="indefinite"
        path="${chemin}" keyPoints="0;0;1;1" keyTimes="0;${a};${b};1"
        calcMode="linear"/>`;
  return `
  <g>
    <circle r="7" fill="${ACCENT}" opacity="0">${mouvement}
      ${fenetre(debut, fin, total, 'opacity', 0.18)}</circle>
    <circle r="3" fill="#FFFFFF" opacity="0">${mouvement}
      ${fenetre(debut, fin, total)}</circle>
  </g>`;
}

function legende(y, texte) {
  return `<text x="640" y="${y}" text-anchor="middle" font-family="${SANS}"
        font-size="12.5" fill="${DISCRET}">${texte}</text>`;
}

// ------------------------------------------------ une seule ouverture
function ouverture() {
  const H = 392;
  const ecrans = [
    [t('Répertoire', 'Directory'), t('la grille des fiches', 'the grid of people'), 18],
    [t('Villes', 'Cities'), t('les filtres du haut', 'the filters on top'), 134],
    [t('Statistiques', 'Statistics'), t('les lieux, la carte', 'places, the map'), 250],
  ];
  const fils = ecrans.map(([, , y]) => `M 280 ${y + 36} C 380 ${y + 36} 420 170 520 170`);
  const filFichier = 'M 780 170 H 1000';
  const total = 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="${H}"
     viewBox="0 0 1280 ${H}" role="img"
     aria-label="${t(
       "Trois écrans demandent la base au même instant, au déverrouillage. Ils attendent tous la même ouverture, qui ouvre un seul fichier chiffré. Avant la correction, chacun lançait la sienne, et l'application finissait avec deux connexions sur deux fichiers différents.",
       'Three screens ask for the database at the same instant, on unlock. They all wait for the same opening, which opens a single encrypted file. Before the fix, each started its own, and the app ended up with two connections to two different files.',
     )}">
  <rect width="1280" height="${H}" fill="${FOND}"/>
  ${fils.map((f) => `<path d="${f}" stroke="${FIL}" stroke-width="1.8" fill="none"/>`).join('\n  ')}
  <path d="${filFichier}" stroke="${FIL}" stroke-width="1.8" fill="none"/>

  ${fils.map((f, i) => billeFenetre(f, 0.2 + i * 0.15, 1.6 + i * 0.15, total)).join('')}
  ${billeFenetre(filFichier, 2.3, 3.4, total)}

  ${ecrans.map(([ti, so, y]) => carte(56, y, 224, 72, ti, so, 0.5)).join('')}

  <!-- L'ouverture partagée, qui s'allume quand les trois demandes
       arrivent, puis rend la même connexion à chacune. -->
  ${carte(520, 134, 260, 72, 'Base.instance.db', t('une ouverture, attendue par tous', 'one opening, awaited by all'), 1)}
  <rect x="520" y="134" width="260" height="72" rx="11" fill="none"
        stroke="${ACCENT}" stroke-width="1.5" opacity="0">
    ${fenetre(1.7, 3.2, total, 'opacity', 0.9)}
  </rect>

  ${carte(1000, 134, 224, 72, 'bodycount.db', t('un seul fichier, chiffré', 'a single file, encrypted'), 0.4)}
  <g opacity="0">
    ${fenetre(3.3, 5.6, total)}
    <circle cx="1206" cy="152" r="9" fill="${VERT}" opacity="0.18"/>
    <path d="M 1201.5 152 l 3 3 l 6 -6" stroke="${VERT}" stroke-width="2"
          fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  ${legende(354, t(
    'Au déverrouillage, trois écrans demandent la base au même instant. Ils attendent la même ouverture au lieu d’en lancer trois.',
    'On unlock, three screens ask for the database at the same instant. They wait for the same opening instead of starting three.',
  ))}
  ${legende(376, t(
    'Avant, l’une fermait la connexion de l’autre, qui croyait la base en clair et la recopiait : la fiche écrivait dans un fichier, le répertoire lisait l’autre.',
    'Before, one closed the other’s connection, which took the database for plain and copied it: the person wrote to one file, the directory read the other.',
  ))}
</svg>
`;
}

// --------------------------------------------- le flux chiffré par morceaux
function flux() {
  const H = 380;
  const total = 9;
  const n = 6;
  const l = 168;
  const pas = 188;
  const x0 = 82;
  const y = 150;
  const morceaux = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * pas;
    const apparait = 0.4 + i * 0.35;
    const dernier = i === n - 1;
    // Les morceaux 2 et 3 sont intervertis au milieu de la boucle.
    const decale = i === 2 ? pas : i === 3 ? -pas : 0;
    const echange = decale === 0 ? '' : `
      <animateTransform attributeName="transform" type="translate"
        dur="${total}s" repeatCount="indefinite"
        values="0 0;0 0;${decale} 0;${decale} 0;0 0;0 0"
        keyTimes="0;${(3.6 / total).toFixed(4)};${(4.4 / total).toFixed(4)};${(8.2 / total).toFixed(4)};${(8.7 / total).toFixed(4)};1"/>`;
    morceaux.push(`
  <g opacity="0">
    ${fenetre(apparait, 8.6, total)}
    <g>${echange}
      <rect x="${x}" y="${y}" width="${l}" height="84" rx="11" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y + 12}" width="3" height="60" rx="1.5" fill="${ACCENT}" opacity="${1 - i * 0.12}"/>
      <text x="${x + 18}" y="${y + 30}" font-family="${MONO}" font-size="13" font-weight="600"
            fill="${TITRE}">${t('rang', 'rank')} ${i}</text>
      <text x="${x + 18}" y="${y + 50}" font-family="${SANS}" font-size="11.5"
            fill="${TEXTE}">${dernier ? t('le dernier', 'the last one') : t('1 Mo chiffré', '1 MB encrypted')}</text>
      <text x="${x + 18}" y="${y + 68}" font-family="${MONO}" font-size="10.5"
            fill="${DISCRET}">nonce + MAC</text>
      <g transform="translate(${x + l - 30} ${y + 16})" stroke="${ACCENT}" stroke-width="1.6" fill="none">
        <rect x="0" y="7" width="14" height="11" rx="2.5"/>
        <path d="M 3 7 V 4.5 a 4 4 0 0 1 8 0 V 7"/>
      </g>
    </g>
  </g>`);
  }

  // Les deux cases fautives, en rouge, une fois l'échange fait.
  const refus = [2, 3].map((i) => {
    const x = x0 + i * pas;
    return `<rect x="${x - 3}" y="${y - 3}" width="${l + 6}" height="90" rx="13"
          fill="none" stroke="${ROUGE}" stroke-width="1.8" opacity="0">
      ${fenetre(4.6, 8.2, total)}</rect>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="${H}"
     viewBox="0 0 1280 ${H}" role="img"
     aria-label="${t(
       "Une vidéo est découpée en morceaux d'un mégaoctet. Chacun est chiffré à part, avec son nonce et son étiquette, et authentifie son rang et le fait d'être le dernier. Deux morceaux intervertis ne se relisent pas : la lecture est refusée.",
       'A video is cut into one megabyte chunks. Each is encrypted on its own, with its nonce and tag, and authenticates its rank and whether it is the last. Two swapped chunks do not read back: reading is refused.',
     )}">
  <rect width="1280" height="${H}" fill="${FOND}"/>

  <!-- La vidéo en clair, qu'une tête de lecture parcourt. -->
  <rect x="82" y="44" width="1116" height="40" rx="9" fill="#1A2230" stroke="${BORD}"/>
  <text x="102" y="69" font-family="${MONO}" font-size="12.5" fill="${TEXTE}">${t('vidéo en clair, 5,4 Mo', 'plain video, 5.4 MB')}</text>
  <rect x="82" y="44" width="4" height="40" rx="2" fill="${ACCENT}" opacity="0">
    <animate attributeName="x" dur="${total}s" repeatCount="indefinite"
             values="82;82;1194;1194" keyTimes="0;${(0.4 / total).toFixed(4)};${(2.6 / total).toFixed(4)};1"/>
    ${fenetre(0.3, 2.7, total)}
  </rect>
  <path d="M 640 92 V 138" stroke="${FIL}" stroke-width="1.8" fill="none"/>
  <path d="M 633 130 L 640 138 L 647 130" stroke="${FIL}" stroke-width="1.8" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>

  ${morceaux.join('')}
  ${refus}

  <g opacity="0">
    ${fenetre(4.6, 8.2, total)}
    <text x="640" y="270" text-anchor="middle" font-family="${MONO}" font-size="13"
          font-weight="600" fill="${ROUGE}">${t('rang 3 lu à la place du rang 2 : refusé', 'rank 3 read in place of rank 2: refused')}</text>
  </g>
  <g opacity="0">
    ${fenetre(2.7, 3.7, total)}
    <text x="640" y="270" text-anchor="middle" font-family="${MONO}" font-size="13"
          font-weight="600" fill="${VERT}">${t('six morceaux scellés, chacun à sa place', 'six chunks sealed, each in its place')}</text>
  </g>

  ${legende(330, t(
    'Chaque morceau est chiffré à part, avec son propre nonce, et authentifie son rang et le fait d’être le dernier.',
    'Each chunk is encrypted on its own, with its own nonce, and authenticates its rank and whether it is the last.',
  ))}
  ${legende(352, t(
    'Un morceau déplacé, retiré ou coupé ne se relit pas. La vidéo ne passe jamais en mémoire d’un bloc.',
    'A chunk moved, removed or cut does not read back. The video never sits in memory whole.',
  ))}
</svg>
`;
}

// --------------------------------------------------- la recherche des villes
function villes() {
  const H = 290;
  const tour = 3.2;
  const exemples = [
    ['Locmariaquer', 0, 'Locmariaquer, 56'],
    ['Plougastel', 1, 'Plougastel-Daoulas, 29'],
    ['Locmariaqer', 2, 'Locmariaquer, 56'],
    ['Vannes centre', 3, 'Vannes, 56'],
    ['Londres', -1, t('hors de France', 'outside France')],
  ];
  const total = tour * exemples.length;
  const etapes = [
    [t('Nom exact', 'Exact name'), t('accents, tirets, « St »', 'accents, hyphens, « St »')],
    [t('Début de nom', 'Start of name'), t('la plus peuplée', 'the most populous')],
    [t('Faute de frappe', 'Typo'), t('une ou deux lettres', 'one or two letters')],
    [t('Ville et quartier', 'City and area'), t('le plus long nom', 'the longest name')],
  ];
  const y = 58;
  const xe = (i) => 316 + i * 190;
  const fil = 'M 262 94 H 1128';

  const cartes = etapes.map(([ti, so], i) => carte(xe(i), y, 170, 72, ti, so, 0.9 - i * 0.15)).join('');

  const scenes = exemples.map(([saisie, etape, resultat], k) => {
    const debut = k * tour;
    const fin = debut + tour;
    const place = etape >= 0;
    const arret = place ? xe(etape) + 85 : 1080;
    // La bille s'arrête sur l'étape qui répond ; sans réponse, elle va
    // jusqu'au bout et ne trouve rien.
    const chemin = `M 262 94 H ${place ? arret : 1128}`;
    const surligne = place
      ? `<rect x="${xe(etape)}" y="${y}" width="170" height="72" rx="11" fill="none"
          stroke="${ACCENT}" stroke-width="1.6" opacity="0">${fenetre(debut + 0.9, fin - 0.2, total, 'opacity', 0.9)}</rect>`
      : '';
    return `
  <g opacity="0">${fenetre(debut, fin, total)}
    <text x="76" y="90" font-family="${MONO}" font-size="14" font-weight="600" fill="${TITRE}">${saisie}</text>
  </g>
  ${surligne}
  ${billeFenetre(chemin, debut + 0.3, debut + 1.6, total)}
  <g opacity="0">${fenetre(debut + 1.5, fin, total)}
    <text x="1150" y="136" text-anchor="middle" font-family="${MONO}" font-size="12.5"
          font-weight="600" fill="${place ? VERT : ROUGE}">${resultat}</text>
    <text x="1150" y="155" text-anchor="middle" font-family="${SANS}" font-size="11.5"
          fill="${TEXTE}">${place ? t('posée sur la carte', 'placed on the map') : t('dans le classement', 'in the ranking')}</text>
  </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="${H}"
     viewBox="0 0 1280 ${H}" role="img"
     aria-label="${t(
       "Une ville saisie passe par quatre étapes : le nom exact, un début de nom, une faute de frappe d'une ou deux lettres, un nom de ville suivi d'un quartier. La première qui répond l'emporte, et la commune la plus peuplée à chaque étape. Locmariaquer, Plougastel, Locmariaqer et Vannes centre tombent en France ; Londres reste hors de la carte, dans le classement des lieux.",
       'A typed city goes through four steps: the exact name, a start of name, a typo of one or two letters, a city name followed by an area. The first that answers wins, and the most populous commune at each step. Locmariaquer, Plougastel, Locmariaqer and Vannes centre land in France; London stays off the map, in the ranking of places.',
     )}">
  <rect width="1280" height="${H}" fill="${FOND}"/>
  <path d="${fil}" stroke="${FIL}" stroke-width="1.8" fill="none"/>

  <rect x="56" y="${y}" width="206" height="72" rx="11" fill="${CARTE}" stroke="${BORD}"/>
  <rect x="56" y="${y + 12}" width="3" height="48" rx="1.5" fill="${ACCENT}"/>
  <text x="76" y="${y + 56}" font-family="${SANS}" font-size="11.5" fill="${DISCRET}">${t('ce qui a été tapé', 'what was typed')}</text>

  ${cartes}

  <!-- Le point d'arrivée : une épingle, et ce qu'elle a trouvé. -->
  <g transform="translate(1150 94)">
    <path d="M 0 -18 a 10 10 0 0 1 10 10 c 0 8 -10 18 -10 18 c 0 0 -10 -10 -10 -18 a 10 10 0 0 1 10 -10 z"
          fill="${CARTE}" stroke="${ACCENT}" stroke-width="1.6"/>
    <circle cy="-8" r="3.4" fill="${ACCENT}"/>
  </g>

  ${scenes}

  ${legende(226, t(
    '34 836 communes de métropole et de Corse, embarquées. La première étape qui répond l’emporte, et à chaque étape la commune la plus peuplée.',
    '34,836 communes of mainland France and Corsica, embedded. The first step that answers wins, and at each step the most populous commune.',
  ))}
  ${legende(248, t(
    'Un département entre parenthèses départage les homonymes : « Saint-Denis (11) ».',
    'A department in brackets settles namesakes: « Saint-Denis (11) ».',
  ))}
</svg>
`;
}

// ---------------------------------------------------------------- écriture
const racine = path.join(__dirname, '..');
const dest = path.join(racine, LG === 'en' ? 'en' : '.', 'schemas');
fs.mkdirSync(dest, { recursive: true });
for (const [nom, contenu] of [
  ['chiffrement.svg', svg],
  ['ouverture.svg', ouverture()],
  ['flux.svg', flux()],
  ['villes.svg', villes()],
]) {
  fs.writeFileSync(path.join(dest, nom), contenu);
  console.log(
    '  ' + nom.padEnd(16) + (contenu.length / 1024).toFixed(1) + ' Ko  (' + LG + ')',
  );
}

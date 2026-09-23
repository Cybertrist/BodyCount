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

// L'icône « fingerprint » de Material Design, en 24 x 24 (Apache 2.0).
const EMPREINTE = 'M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z';

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
    <!-- Le tracé de l'icône « fingerprint » de Material Design (licence
         Apache 2.0), et une ligne de lecture qui la balaie de haut en bas,
         comme un capteur qui lit. -->
    <clipPath id="doigt">
      <path transform="translate(-15.6 -15.6) scale(1.3)" d="${EMPREINTE}"/>
    </clipPath>
    <path transform="translate(-15.6 -15.6) scale(1.3)" fill="${ACCENT}" opacity="0.55" d="${EMPREINTE}"/>
    <g clip-path="url(#doigt)">
      <rect x="-16" y="-16" width="32" height="7" fill="#FFFFFF" opacity="0.9">
        <animate attributeName="y" dur="2.8s" repeatCount="indefinite"
                 values="-22;16;16" keyTimes="0;0.6;1"/>
      </rect>
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

// ------------------------------------------------ la restauration, animée
// Deux passages sur le même fichier. Le premier déchiffre et jette : les
// morceaux s'allument en vert l'un après l'autre. Le second range : les
// médias descendent dans le coffre. Les fiches ne changent qu'à la fin.
function restauration() {
  const H = 330;
  const total = 10;
  const n = 8;
  const x0 = 250;
  const pas = 96;
  const y = 70;
  const morceaux = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * pas;
    const verif = 0.6 + i * 0.32;
    const range = 4.4 + i * 0.32;
    morceaux.push(`
  <rect x="${x}" y="${y}" width="84" height="44" rx="8" fill="${CARTE}" stroke="${BORD}"/>
  <rect x="${x}" y="${y}" width="84" height="44" rx="8" fill="none" stroke="${VERT}" stroke-width="1.6" opacity="0">
    ${fenetre(verif, 4.2, total, 'opacity', 0.9)}
  </rect>
  <g opacity="0">${fenetre(verif, 4.2, total)}
    <path d="M ${x + 34} ${y + 22} l 5 5 l 10 -10" stroke="${VERT}" stroke-width="2"
          fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <rect x="${x + 30}" y="${y + 12}" width="24" height="20" rx="4" fill="${ACCENT}" opacity="0">
    <animate attributeName="y" dur="${total}s" repeatCount="indefinite"
             values="${y + 12};${y + 12};${y + 146};${y + 146}"
             keyTimes="0;${(range / total).toFixed(4)};${((range + 0.7) / total).toFixed(4)};1"/>
    ${fenetre(range, range + 0.8, total, 'opacity', 0.9)}
  </rect>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="${H}"
     viewBox="0 0 1280 ${H}" role="img"
     aria-label="${t(
       "La restauration lit la sauvegarde deux fois. Au premier passage, chaque morceau est déchiffré et vérifié, puis jeté. Au second, les médias entrent dans le coffre. Les fiches ne sont remplacées qu'à la fin : jusque-là, rien n'a été touché.",
       'Restoring reads the backup twice. On the first pass, each chunk is decrypted and checked, then dropped. On the second, the media enter the vault. The people are only replaced at the very end: until then, nothing was touched.',
     )}">
  <rect width="1280" height="${H}" fill="${FOND}"/>
  ${carte(56, y - 14, 170, 72, 'sauvegarde.bcx', t('phrase de passe', 'passphrase'), 1)}

  <g opacity="0">${fenetre(0.2, 4.2, total)}
    <text x="${x0}" y="${y - 16}" font-family="${MONO}" font-size="12"
          fill="${VERT}">${t('1er passage : tout vérifier, puis jeter', '1st pass: check it all, then drop it')}</text>
  </g>
  <g opacity="0">${fenetre(4.3, 7.6, total)}
    <text x="${x0}" y="${y - 16}" font-family="${MONO}" font-size="12"
          fill="${ACCENT}">${t('2e passage : ranger les médias', '2nd pass: store the media')}</text>
  </g>
  ${morceaux.join('')}

  ${carte(x0, 200, 180, 64, 'vault/', t('nouveaux noms', 'new names'), 0.6)}
  <path d="M ${x0 + 180} 232 H ${x0 + 7 * pas + 84}" stroke="${FIL}" stroke-width="1.8" fill="none"/>

  ${carte(1044, y - 14, 180, 72, t('les fiches', 'the people'), t('intactes', 'intact'), 0.4)}
  <g opacity="0">${fenetre(7.8, 9.8, total)}
    <rect x="1044" y="${y - 14}" width="180" height="72" rx="11" fill="${CARTE}" stroke="${VERT}" stroke-width="1.6"/>
    <text x="1064" y="${y + 17}" font-family="${MONO}" font-size="13.5" font-weight="600"
          fill="${TITRE}">${t('les fiches', 'the people')}</text>
    <text x="1064" y="${y + 37}" font-family="${SANS}" font-size="12"
          fill="${VERT}">${t('remplacées, enfin', 'replaced, at last')}</text>
  </g>

  ${legende(300, t(
    'Une phrase fausse s’arrête au premier morceau, un octet abîmé au sien : dans les deux cas, les fiches du téléphone n’ont pas bougé.',
    'A wrong passphrase stops at the first chunk, a damaged byte at its own: either way, the people on the phone have not moved.',
  ))}
</svg>
`;
}

// ------------------------------------------------ une vidéo allégée
// La vidéo filmée en 1080p entre, Media3 la réencode sur l'encodeur du
// téléphone, elle ressort bien plus légère et part au coffre.
function allegement() {
  const H = 300;
  const total = 7;
  const y = 104;
  const fil = 'M 250 140 H 1040';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="${H}"
     viewBox="0 0 1280 ${H}" role="img"
     aria-label="${t(
       "Une vidéo de 20 Mo filmée en 1080p est réencodée par Media3 sur l'encodeur du téléphone : H.264, 720 points sur le petit côté, 2,5 Mb/s. Elle ressort à 3 Mo et entre au coffre, chiffrée par morceaux. La version allégée n'est gardée que si elle gagne au moins un dixième.",
       'A 20 MB video shot in 1080p is re-encoded by Media3 on the phone encoder: H.264, 720 points on the short side, 2.5 Mb/s. It comes out at 3 MB and enters the vault, encrypted in chunks. The lighter version is only kept if it saves at least a tenth.',
     )}">
  <rect width="1280" height="${H}" fill="${FOND}"/>
  <path d="${fil}" stroke="${FIL}" stroke-width="1.8" fill="none"/>
  ${billeFenetre(fil, 0.3, 5.2, total)}

  ${carte(56, y, 194, 72, t('vidéo filmée', 'recorded video'), '1080p · 16 Mb/s', 1)}
  <rect x="80" y="${y + 90}" width="146" height="12" rx="6" fill="${ACCENT}" opacity="0.8"/>
  <text x="153" y="${y + 124}" text-anchor="middle" font-family="${MONO}" font-size="13"
        font-weight="600" fill="${TITRE}">20 Mo</text>

  ${carte(470, y, 230, 72, 'Media3 Transformer', t('encodeur du téléphone', 'phone encoder'), 0.8)}
  <rect x="495" y="${y + 90}" width="180" height="6" rx="3" fill="${BORD}"/>
  <rect x="495" y="${y + 90}" width="0" height="6" rx="3" fill="${ACCENT}">
    <animate attributeName="width" dur="${total}s" repeatCount="indefinite"
             values="0;0;180;180;0" keyTimes="0;${(1.4 / total).toFixed(4)};${(3.6 / total).toFixed(4)};${(6.6 / total).toFixed(4)};1"/>
  </rect>
  <text x="585" y="${y + 124}" text-anchor="middle" font-family="${MONO}" font-size="12"
        fill="${TEXTE}">H.264 · 720p · 2,5 Mb/s</text>

  ${carte(1040, y, 184, 72, t('au coffre', 'into the vault'), t('chiffrée par morceaux', 'chunk-encrypted'), 0.5)}
  <g opacity="0">${fenetre(3.8, 6.8, total)}
    <rect x="1064" y="${y + 90}" width="146" height="12" rx="6" fill="${BORD}"/>
    <rect x="1064" y="${y + 90}" width="22" height="12" rx="6" fill="${VERT}"/>
    <text x="1137" y="${y + 124}" text-anchor="middle" font-family="${MONO}" font-size="13"
          font-weight="600" fill="${VERT}">3 Mo</text>
  </g>

  ${legende(272, t(
    'Réencoder dégrade toujours un peu : la version allégée n’est gardée que si elle gagne au moins un dixième, sinon l’original entre tel quel.',
    'Re-encoding always costs a little: the lighter version is only kept if it saves at least a tenth, otherwise the original goes in as it is.',
  ))}
</svg>
`;
}

// ---------------------------------------------------- sans Internet
// En haut, des paquets partent vers Internet et s'écrasent sur un mur qui
// n'est pas dans l'application : Android, faute de permission INTERNET.
// En bas, les quatre seules sorties s'ouvrent l'une après l'autre, chacune
// sur un toucher, et chacune vers une autre application.
function reseau() {
  const H = 452;
  const total = 8;
  const yRoute = 150;
  const xMur = 700;
  const route = `M 250 ${yRoute} H ${xMur - 6}`;

  // Trois paquets par boucle, décalés : chacun roule, frappe, éclate.
  const paquets = [0.2, 2.9, 5.6].map((d) => {
    const a = (d / total).toFixed(4);
    const b = ((d + 1.5) / total).toFixed(4);
    const mouvement = `<animateMotion dur="${total}s" repeatCount="indefinite"
        path="${route}" keyPoints="0;0;1;1" keyTimes="0;${a};${b};1" calcMode="linear"/>`;
    const choc = d + 1.5;
    const c0 = (choc / total).toFixed(4);
    const c1 = ((choc + 0.7) / total).toFixed(4);
    return `
  <g>
    <circle r="7" fill="${ACCENT}" opacity="0">${mouvement}
      ${fenetre(d, choc, total, 'opacity', 0.18)}</circle>
    <circle r="3" fill="#FFFFFF" opacity="0">${mouvement}
      ${fenetre(d, choc, total)}</circle>
    <circle cx="${xMur - 6}" cy="${yRoute}" r="4" fill="none" stroke="${ROUGE}" stroke-width="2" opacity="0">
      <animate attributeName="r" dur="${total}s" repeatCount="indefinite"
               values="4;4;26;26" keyTimes="0;${c0};${c1};1"/>
      <animate attributeName="opacity" dur="${total}s" repeatCount="indefinite"
               values="0;0;0.9;0;0" keyTimes="0;${c0};${((choc + 0.05) / total).toFixed(4)};${c1};1"/>
    </circle>
  </g>`;
  }).join('');

  // Les quatre portes, et le fil qui y mène depuis le téléphone.
  const portes = [
    [t('Y aller', 'Directions'), t('l’adresse, vers l’appli de cartes', 'the address, to the maps app')],
    [t('Appeler', 'Call'), t('le numéro, vers le téléphone', 'the number, to the dialer')],
    [t('Exporter', 'Export'), t('la sauvegarde chiffrée, où tu la poses', 'the encrypted backup, where you put it')],
    [t('Télécharger', 'Download'), t('une copie en clair, vers la galerie', 'a plain copy, into the gallery')],
  ];
  const yPorte = 308;
  const largeur = 272;
  const pas = (1224 - 56 - largeur) / 3;
  const centres = portes.map((_, i) => 56 + i * pas + largeur / 2);
  const bus = `M 153 186 V 272 H ${centres[3]}`;
  const descentes = centres.map((c) => `M ${c} 272 V ${yPorte}`).join(' ');
  const ouvertures = portes.map(([titre, sous], i) => {
    const x = 56 + i * pas;
    const d = 0.3 + i * 1.9;
    const chemin = `M 153 186 V 272 H ${centres[i]} V ${yPorte}`;
    return `
  ${carte(x, yPorte, largeur, 72, titre, sous, 0.35)}
  <rect x="${x}" y="${yPorte}" width="${largeur}" height="72" rx="11" fill="none"
        stroke="${ACCENT}" stroke-width="1.6" opacity="0">${fenetre(d + 0.9, d + 1.9, total, 'opacity', 0.9)}</rect>
  <g transform="translate(${x + largeur - 30} ${yPorte + 36})">
    <circle r="5" fill="${ACCENT}" opacity="0">${fenetre(d, d + 0.9, total, 'opacity', 0.9)}</circle>
    <circle r="6" fill="none" stroke="${ACCENT}" stroke-width="1.5" opacity="0">
      <animate attributeName="r" dur="${total}s" repeatCount="indefinite"
               values="6;6;18;18" keyTimes="0;${(d / total).toFixed(4)};${((d + 0.8) / total).toFixed(4)};1"/>
      ${fenetre(d, d + 0.8, total, 'opacity', 0.8)}
    </circle>
  </g>
  ${billeFenetre(chemin, d + 0.3, d + 1.3, total)}`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="${H}"
     viewBox="0 0 1280 ${H}" role="img"
     aria-label="${t(
       "BodyCount ne demande pas la permission INTERNET : chaque tentative de connexion s'écrase sur un mur tenu par Android, et Internet n'est jamais atteint. Il ne reste que quatre sorties, qui s'ouvrent chacune sur un toucher et passent la main à une autre application : l'adresse vers l'appli de cartes, le numéro vers le téléphone, la sauvegarde chiffrée là où tu la poses, et une copie en clair vers la galerie.",
       'BodyCount does not ask for the INTERNET permission: every connection attempt crashes into a wall held by Android, and the Internet is never reached. Only four exits remain, each opened by a tap and handing over to another app: the address to the maps app, the number to the dialer, the encrypted backup wherever you put it, and a plain copy into the gallery.',
     )}">
  <rect width="1280" height="${H}" fill="${FOND}"/>

  <text x="56" y="50" font-family="${MONO}" font-size="12" fill="${DISCRET}">${t('tout seul', 'on its own')}</text>
  <path d="${route}" stroke="${FIL}" stroke-width="1.8" fill="none"/>
  <path d="M ${xMur + 10} ${yRoute} H 1044" stroke="${FIL}" stroke-width="1.8" fill="none"
        stroke-dasharray="3 7" opacity="0.6"/>
  ${paquets}

  ${carte(56, 114, 194, 72, 'BodyCount', t('aucune permission réseau', 'no network permission'), 1)}

  <rect x="${xMur - 6}" y="78" width="10" height="144" rx="3" fill="${ROUGE}" opacity="0.85"/>
  <text x="${xMur}" y="64" text-anchor="middle" font-family="${MONO}" font-size="12"
        fill="${ROUGE}">${t('Android : pas de permission INTERNET', 'Android: no INTERNET permission')}</text>
  <text x="${xMur}" y="244" text-anchor="middle" font-family="${MONO}" font-size="11.5"
        fill="${DISCRET}">${t('connexion refusée', 'connection refused')}</text>

  ${carte(1044, 114, 180, 72, 'Internet', t('jamais atteint', 'never reached'), 0.15)}

  <text x="170" y="228" font-family="${MONO}" font-size="12" fill="${DISCRET}">${t('sur un toucher, par une autre application', 'on a tap, through another app')}</text>
  <path d="${bus} ${descentes}" stroke="${FIL}" stroke-width="1.8" fill="none" opacity="0.7"/>
  ${ouvertures}

  ${legende(424, t(
    'Le mur n’est pas dans le code : une bibliothèque bavarde ou une dépendance piégée s’y heurteraient pareil.',
    'The wall is not in the code: a chatty library or a poisoned dependency would hit it just the same.',
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
  ['restauration.svg', restauration()],
  ['allegement.svg', allegement()],
  ['reseau.svg', reseau()],
]) {
  fs.writeFileSync(path.join(dest, nom), contenu);
  console.log(
    '  ' + nom.padEnd(16) + (contenu.length / 1024).toFixed(1) + ' Ko  (' + LG + ')',
  );
}

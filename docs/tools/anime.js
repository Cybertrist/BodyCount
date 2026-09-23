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
       "L'empreinte charge la clé maîtresse depuis le Keystore Android. HKDF-SHA256 en dérive deux clés : le mot de passe SQLCipher qui ouvre le journal chiffré, et la clé AES-GCM qui ouvre le coffre à photos.",
       'The fingerprint loads the master key from the Android Keystore. HKDF-SHA256 derives two keys from it: the SQLCipher password that opens the encrypted journal, and the AES-GCM key that opens the photo vault.',
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
  ${carte(1044, 216, 180, 72, 'vault/*.bcx', t('une photo, un fichier', 'one photo, one file'), 0.4)}

  <text x="640" y="322" text-anchor="middle" font-family="${SANS}"
        font-size="12.5" fill="${DISCRET}">${t(
          'Rien de cette chaîne n’existe en mémoire avant l’empreinte.',
          'None of this chain exists in memory before the fingerprint.',
        )}</text>
</svg>
`;

const racine = path.join(__dirname, '..');
const dest = path.join(racine, LG === 'en' ? 'en' : '.', 'schemas');
fs.mkdirSync(dest, { recursive: true });
const fichier = path.join(dest, 'chiffrement.svg');
fs.writeFileSync(fichier, svg);
console.log(
  '  chiffrement.svg  ' + (svg.length / 1024).toFixed(1) + ' Ko  (' + LG + ')',
);

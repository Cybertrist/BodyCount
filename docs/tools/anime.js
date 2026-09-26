// Les schémas animés du README.
//
// Des SVG plutôt que des GIF : quelques dizaines de kilo-octets, nets à
// n'importe quelle taille, et le texte reste du texte. Les animations sont
// en SMIL, que les navigateurs jouent même lorsque le SVG est chargé par
// une balise <img>, ce qui est le cas sur GitHub.
//
// Aucune police externe n'est chargée : un SVG affiché en <img> n'a pas
// le droit d'aller chercher quoi que ce soit sur le réseau, et une
// @import silencieusement ignorée donnerait une figure cassée chez les
// autres et correcte chez soi. On s'en tient donc aux familles système.
//
//   node docs/tools/anime.js          rend le français
//   LANGUE=en node docs/tools/anime.js  rend l'anglais
//
// Chaque schéma rejoue l'application dans un téléphone et vit dans son
// propre fichier de schemas/. Ils partagent outils.js et appellent svg()
// eux-mêmes ; visages.json porte les photos du jeu d'essai et le logo,
// réduits par visages.js.
const fs = require('fs');
const path = require('path');

const LG = process.env.LANGUE === 'en' ? 'en' : 'fr';
const DOSSIER = path.join(__dirname, 'schemas');
const OUTILS = require(path.join(DOSSIER, 'outils.js'))(LG);
for (const f of fs.readdirSync(DOSSIER).filter((f) => f.endsWith('.js') && f !== 'outils.js').sort()) {
  // Un schéma en erreur est signalé sans empêcher les autres de sortir,
  // mais le rendu finit en échec pour qu'on ne le rate pas.
  try {
    require(path.join(DOSSIER, f))(OUTILS);
  } catch (e) {
    console.error(`  ${f} : ${e.stack}`);
    process.exitCode = 1;
  }
}

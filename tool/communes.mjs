// Construit assets/carte/communes.txt à partir du référentiel officiel
// des communes (geo.api.gouv.fr, données ouvertes).
//
//   node tool/communes.mjs
//
// Le script est lancé à la main, une fois de temps en temps : c'est lui
// qui parle au réseau, jamais l'application. Une ligne par commune de
// métropole et de Corse, « Nom;département;latitude;longitude », les
// coordonnées au millième de degré (une centaine de mètres), triées de la
// plus peuplée à la moins peuplée. Ce tri fait deux choses à la fois : la
// première commune rencontrée pour un nom est la bonne quand il y a des
// homonymes, et les suggestions de saisie sortent dans le bon ordre.
import { writeFileSync } from 'node:fs';

const url =
  'https://geo.api.gouv.fr/communes?fields=nom,centre,population,codeDepartement&format=json&geometry=centre';
const communes = await (await fetch(url)).json();

const lignes = communes
  // Les départements d'outre-mer ne sont pas sur le dessin de la France.
  .filter((c) => c.centre && !c.codeDepartement.startsWith('97'))
  .sort((a, b) => (b.population ?? 0) - (a.population ?? 0) || a.nom.localeCompare(b.nom, 'fr'))
  .map((c) => {
    const [lon, lat] = c.centre.coordinates;
    return `${c.nom};${c.codeDepartement};${Math.round(lat * 1000)};${Math.round(lon * 1000)}`;
  });

writeFileSync(new URL('../assets/carte/communes.txt', import.meta.url), lignes.join('\n') + '\n');
console.log(`${lignes.length} communes écrites.`);

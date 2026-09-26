// Vérifie que chaque SVG de docs/schemas et docs/en/schemas est du XML
// valide, comme GitHub l'exige : un SVG que Chrome affiche malgré une
// faute peut sortir en « Invalid image source » sur la page du dépôt.
//
//   node docs/tools/verifier.js
//
// L'analyse se fait par le DOMParser de Chrome sans affichage, en mode
// image/svg+xml, le plus strict. Signale aussi les identifiants en double,
// qui font pointer un clipPath ou un dégradé au mauvais endroit.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const racine = path.join(__dirname, '..');
const fichiers = ['schemas', path.join('en', 'schemas')].flatMap((d) =>
  fs.readdirSync(path.join(racine, d)).filter((f) => f.endsWith('.svg')).map((f) => path.join(d, f)));

let echecs = 0;
for (const f of fichiers) {
  const s = fs.readFileSync(path.join(racine, f), 'utf8');
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  const doubles = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
  if (doubles.length) {
    console.log(`  ${f} : identifiants en double, ${doubles.slice(0, 5).join(', ')}`);
    echecs++;
  }
}

const page = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'verifier-')), 'page.html');
const donnees = fichiers.map((f) => [f, fs.readFileSync(path.join(racine, f), 'utf8')]);
fs.writeFileSync(page, `<!doctype html><body><pre id="o"></pre><script>
const F = ${JSON.stringify(donnees).replace(/<\/script/gi, '<\\/script')};
const r = [];
for (const [f, s] of F) {
  const e = new DOMParser().parseFromString(s, 'image/svg+xml').querySelector('parsererror');
  if (e) r.push(f + ' : ' + e.textContent.replace(/\\s+/g, ' ').slice(0, 240));
}
document.getElementById('o').textContent = r.length ? r.join('\\n') : 'TOUT_VALIDE';
</script></body>`);
const dom = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--dump-dom', 'file:///' + page.split(path.sep).join('/')],
  { maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
const sortie = dom.match(/<pre id="o">([\s\S]*?)<\/pre>/)[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
if (sortie !== 'TOUT_VALIDE') {
  console.log(sortie.split('\n').map((l) => '  ' + l).join('\n'));
  echecs++;
}
console.log(echecs ? `  ${fichiers.length} SVG, des erreurs.` : `  ${fichiers.length} SVG, tous valides.`);
process.exitCode = echecs ? 1 : 0;

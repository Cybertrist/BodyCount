// Les visages du jeu d'essai, réduits pour les schémas animés.
//
//   node docs/tools/visages.js
//
// Les photos de assets/demo pèsent chacune plusieurs centaines de
// kilo-octets ; un schéma qui en montre six ne peut pas les embarquer
// telles quelles. Chacune est donc recadrée au carré sur le haut de
// l'image, là où est le visage, réduite à 160 points et écrite en JPEG
// dans schemas/visages.json, sous forme d'adresse data: que le SVG porte
// en lui : un SVG affiché en <img> n'a pas le droit d'aller chercher un
// fichier à côté. Le travail se fait dans un canvas de Chrome, comme pour
// rogner.js, pour ne dépendre d'aucune bibliothèque d'image.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const COTE = 160;
const source = path.join(__dirname, '..', '..', 'assets', 'demo');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'visages-'));
const sortie = {};

// Le logo de l'application passe par le même chemin, entier et sans
// recadrage : les schémas le montrent sur l'écran de verrou.
const fichiers = fs.readdirSync(source).filter((f) => f.endsWith('.jpg')).sort().map((f) => [Number(f.match(/\d+/)[0]), path.join(source, f)]);
fichiers.push(['logo', path.join(__dirname, '..', '..', 'assets', 'logo.png')]);

for (const [cle, fichier] of fichiers) {
  const nom = path.basename(fichier);
  const jpg = fs.readFileSync(fichier).toString('base64');
  const type = nom.endsWith('.png') ? 'png' : 'jpeg';
  const page = path.join(temp, 'page.html');
  fs.writeFileSync(page, `<!doctype html><body><script>
const img = new Image();
img.onload = () => {
  const cote = Math.min(img.width, img.height);
  // Le visage est dans le haut du portrait : on cadre à un huitième du
  // haut plutôt qu'au centre, qui couperait le front.
  const y = ${cle === 'logo'} ? 0 : Math.max(0, Math.min(img.height - cote, Math.round(img.height * 0.08)));
  const c = document.createElement('canvas');
  c.width = c.height = ${COTE};
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, (img.width - cote) / 2, y, cote, cote, 0, 0, ${COTE}, ${COTE});
  document.body.textContent = c.toDataURL('image/jpeg', 0.78);
};
img.src = 'data:image/${type};base64,${jpg}';
</script></body>`);
  const dom = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--virtual-time-budget=4000', '--dump-dom',
    'file:///' + page.split(path.sep).join('/')], { maxBuffer: 1 << 26 }).toString();
  const url = dom.match(/data:image\/jpeg;base64,[A-Za-z0-9+/=]+/)[0];
  sortie[cle] = url;
  console.log(`  ${nom}  ${(url.length / 1024).toFixed(1)} Ko`);
}
fs.writeFileSync(path.join(__dirname, 'schemas', 'visages.json'), JSON.stringify(sortie, null, 1) + '\n');

// Les captures du jeu d'essai, réduites pour les planches animées.
//
//   node docs/tools/vignettes-captures.js
//
// Les planches de la section « Les écrans » sont des SVG qui portent
// leurs images en eux, en adresses data: : un SVG affiché en <img> n'a
// pas le droit d'aller chercher un fichier à côté. Une capture de
// src-captures/ pèse jusqu'à 200 Ko ; douze à cette taille feraient un
// SVG que GitHub affiche mal. Chacune est donc réduite à la largeur où la
// planche la montre, deux fois pour les écrans denses, et réécrite en
// JPEG dans schemas/captures.json. Le travail se fait dans un canvas de
// Chrome, comme pour rogner.js et visages.js.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SOURCE = path.join(__dirname, 'src-captures');
// La largeur de sortie de chaque format, en pixels, et la qualité JPEG.
const FORMATS = { passeport: [460, 0.74], 169: [520, 0.76], 43: [600, 0.76], 34: [900, 0.74] };
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'captures-'));
const sortie = {};

for (const [format, [largeur, qualite]] of Object.entries(FORMATS)) {
  for (const nom of fs.readdirSync(path.join(SOURCE, format)).filter((f) => f.endsWith('.jpg')).sort()) {
    const jpg = fs.readFileSync(path.join(SOURCE, format, nom)).toString('base64');
    const page = path.join(temp, 'page.html');
    fs.writeFileSync(page, `<!doctype html><body><script>
const img = new Image();
img.onload = () => {
  const c = document.createElement('canvas');
  c.width = ${largeur};
  c.height = Math.round(img.height * ${largeur} / img.width);
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, 0, 0, c.width, c.height);
  document.body.textContent = c.width + 'x' + c.height + ' ' + c.toDataURL('image/jpeg', ${qualite});
};
img.src = 'data:image/jpeg;base64,${jpg}';
</script></body>`);
    const dom = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--virtual-time-budget=4000', '--dump-dom',
      'file:///' + page.split(path.sep).join('/')], { maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    const [, l, h, url] = dom.match(/(\d+)x(\d+) (data:image\/jpeg;base64,[A-Za-z0-9+/=]+)/);
    const cle = `${format}/${nom.replace(/\.jpg$/, '')}`;
    sortie[cle] = { l: Number(l), h: Number(h), url };
    console.log(`  ${cle.padEnd(24)} ${l}x${h}  ${(url.length / 1024).toFixed(1)} Ko`);
  }
}
fs.writeFileSync(path.join(__dirname, 'schemas', 'captures.json'), JSON.stringify(sortie, null, 1) + '\n');

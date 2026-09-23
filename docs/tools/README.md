# Les outils qui dessinent ce README

Aucune image de ce dépôt n'est un export d'un logiciel de dessin. Chacune
est une page HTML que Chrome capture en mode headless, à deux ou trois fois
la taille d'affichage pour rester nette sur un écran dense. Un texte de
figure se corrige donc en modifiant une ligne de script.

## Refaire toutes les images

    bash docs/tools/tout.sh

Cela rend les deux langues. Les scripts écrivent dans `docs/tools/png/`,
`sec/`, `grid/`, `tree/` et `langues/`, suffixés `-en` pour l'anglais, qui
ne sont pas versionnés. `installer.sh` recopie ensuite les fichiers retenus
dans `docs/` et `docs/en/`.

## Les deux langues

`README.md` porte le français, `README.en.md` l'anglais, et chaque page
ouvre sur deux pastilles qui mènent à l'autre. GitHub retirant JavaScript
et CSS des README, rien ne peut basculer la page sur place : ce sont deux
fichiers et un lien.

`langue.sh` porte la bascule. Dans `figures.sh`, `t <français> <anglais>`
choisit la chaîne : les deux versions d'un texte vivent sur la même ligne,
ce qui rend impossible d'en corriger une en oubliant l'autre.

## Ce que fait chaque script

- `figures.sh` : tout le contenu de ce dépôt, la bannière, les dix
  bandeaux de section, les quatre grilles, l'arborescence, les couches, le
  modèle de données, la chaîne de chiffrement, les formats de fichier, la
  fabrication de la carte, le modèle de confidentialité et la palette.
  C'est le seul fichier à ouvrir pour changer un texte.
- `captures.sh` : la planche de quatre captures d'écran. Les images
  sources sont dans `src-captures/`, en 1080 x 2340, telles que
  l'appareil les a rendues ; le rognage est fait en CSS, donc changer la
  fenêtre retenue ne demande pas de retoucher un fichier. Les quatre
  écrans choisis sont ceux qui n'affichent aucun visage, les portraits du
  jeu d'essai restant hors du dépôt.
- `cartes.sh` : le gabarit des bannières 1280x320.
- `bandeaux.sh` : le gabarit des bandeaux de section numérotés.
- `grille.sh` : le gabarit des grilles à deux ou trois colonnes.
- `arbre.sh` : le gabarit des arborescences, dont les traits de liaison
  sont calculés et non écrits à la main.
- `pastilles.sh` : les deux pastilles du sélecteur de langue.
- `sequence.sh` : le gabarit des enchaînements, des étapes reliées par
  une flèche.
- `anime.js` : la chaîne de chiffrement, en SVG animé. Pas de police
  externe : un SVG affiché en `<img>` n'a pas le droit d'aller la
  chercher, et une `@import` ignorée donnerait une figure cassée chez les
  autres et correcte chez soi.
- `apercu.sh` : pose un aperçu local des deux pages, à la largeur et sur
  le fond de GitHub, pour juger les figures les unes sous les autres.
  `bash docs/tools/apercu.sh fr png` en capture une image au lieu de
  l'ouvrir, ce qui sert à vérifier l'ordre des sections sans y être.
- `langue.sh` : la bascule `LANGUE` et la fonction `t`.
- `installer.sh` : repose les images rendues dans `docs/` ou `docs/en/`.
- `tout.sh` : enchaîne tout ce qui précède, dans les deux langues.

## Ce dont ils dépendent

Chrome est cherché dans `C:\Program Files\Google\Chrome\Application`. La
variable d'environnement `CHROME` prend le dessus s'il est ailleurs.

Les polices, Syne, Space Grotesk et JetBrains Mono, sont chargées depuis
Google Fonts au moment du rendu : il faut une connexion.
`src-icone.png` est l'icône de l'application, en 1254 px, celle que porte la bannière.

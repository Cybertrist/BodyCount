// L'arborescence de lib/, qui se déplie dossier par dossier.
//
// L'arbre n'est pas écrit à la main : il est lu dans lib/ au moment du
// rendu, avec le nombre de fichiers et de lignes de chaque dossier. Un
// fichier ajouté ou retiré apparaît donc au prochain rendu. Seuls les
// rôles des fichiers clés sont écrits ici ; un fichier clé qui aurait
// disparu arrête le rendu plutôt que de décrire un fantôme.
//
// À gauche, l'arbre ; au milieu, les fichiers clés du dossier ouvert qui
// s'allument un à un ; à droite, ce que ce dossier fait dans l'appli.
const fs = require('fs');
const path = require('path');

module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, telephone, visage, etoiles, pastille, largeurPastille,
    bouton, icone, empreinte, logo, cartePersonne, GENS, APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT,
    VIOLET, FUCHSIA, VERT, OR, ROUGE, BLEU } = O;
  const C = 48;
  const LIB = path.join(__dirname, '..', '..', '..', 'lib');

  // ---------------------------------------------------------- l'arbre réel
  const lignes = (f) => fs.readFileSync(f, 'utf8').split('\n').length;
  const lire = (d) => fs.readdirSync(d, { withFileTypes: true })
    .sort((a, b) => (a.isDirectory() === b.isDirectory() ? a.name.localeCompare(b.name) : a.isDirectory() ? 1 : -1));
  // Les enfants d'un dossier, sous-dossiers compris, à plat : [nom, profondeur, estDossier].
  function aplatir(d, prof = 0) {
    const r = [];
    for (const e of lire(d)) {
      // Un dossier sans aucun fichier Dart n'est pas dans git : on le tait.
      if (e.isDirectory() && compter(path.join(d, e.name))[0] === 0) continue;
      if (e.isDirectory()) {
        r.push([e.name + '/', prof, true]);
        r.push(...aplatir(path.join(d, e.name), prof + 1));
      } else if (e.name.endsWith('.dart')) r.push([e.name, prof, false]);
    }
    return r;
  }
  const compter = (d) => lire(d).reduce((acc, e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { const s = compter(p); return [acc[0] + s[0], acc[1] + s[1]]; }
    return e.name.endsWith('.dart') ? [acc[0] + 1, acc[1] + lignes(p)] : acc;
  }, [0, 0]);
  const racines = lire(LIB).filter((e) => !e.isDirectory() && e.name.endsWith('.dart')).map((e) => e.name);
  const dossiers = lire(LIB).filter((e) => e.isDirectory() && compter(path.join(LIB, e.name))[0] > 0).map((e) => {
    const d = path.join(LIB, e.name);
    const [n, l] = compter(d);
    return { nom: e.name, enfants: aplatir(d), fichiers: n, lignes: l };
  });
  const [totalFichiers, totalLignes] = compter(LIB);
  const nombre = (n) => (O.EN ? n.toLocaleString('en-US') : n.toLocaleString('fr-FR').replace(/ | /g, ' '));

  // Les fichiers clés de chaque étape, et ce qu'ils font. Le premier mot
  // de l'étape est le dossier ('' pour la racine).
  const ROLES = {
    '': [t('Le cœur', 'The core'), t('Deux fichiers à la racine, tout le reste en dépend.', 'Two files at the root, everything else hangs off them.'), [
      ['main.dart', t('le point d’entrée : lit les communes pendant l’empreinte', 'the entry point: reads the towns during the fingerprint')],
      ['app.dart', t('l’application, son thème, le reverrouillage après le délai', 'the app, its theme, relocking after the delay')],
    ]],
    config: [t('Les réglages de fond', 'The groundwork'), t('Ce qui ne change pas d’un écran à l’autre.', 'What stays the same from one screen to the next.'), [
      ['theme.dart', t('la palette, du violet au fuchsia', 'the palette, from violet to fuchsia')],
      ['layout.dart', t('les trois silhouettes d’écran du Fold', 'the Fold’s three screen shapes')],
      ['routes.dart', t('go_router, une seule porte : le verrou', 'go_router, a single door: the lock')],
      ['essais.dart', t('le jeu d’essai, seulement avec ESSAIS=true', 'the sample data, only with ESSAIS=true')],
    ]],
    domaine: [t('Les modèles', 'The models'), t('Des objets simples, sans base ni écran.', 'Plain objects, with no database or screen.'), [
      ['personne.dart', t('une fiche : prénom, âge, ville, genre, rôle', 'a card: name, age, city, gender, role')],
      ['rencontre.dart', t('date, lieu, note en demi-points, montant', 'date, place, rating in half points, amount')],
      ['etiquette.dart', t('une étiquette, et sa clé sans accents', 'a tag, and its accent-free key')],
      ['note.dart', t('une ligne du carnet, datée', 'a dated notebook line')],
    ]],
    donnees: [t('La base chiffrée', 'The encrypted database'), t('Le seul dossier qui parle à SQLCipher.', 'The only folder that talks to SQLCipher.'), [
      ['base.dart', t('une seule ouverture, migrations jusqu’au schéma v7', 'one single opening, migrations up to schema v7')],
      ['depots.dart', t('le seul SQL de l’appli, en requêtes groupées', 'the app’s only SQL, in grouped queries')],
      ['statistiques.dart', t('les chiffres de l’écran Stats, calculés en SQL', 'the Stats screen figures, computed in SQL')],
      ['coordonnees.dart', t('les 34 836 communes, embarquées', 'the 34,836 towns, shipped inside')],
      ['geometrie_france.dart', t('la côte et les départements, lus dans france.bin', 'the coast and departments, read from france.bin')],
    ]],
    ecrans: [t('Les écrans', 'The screens'), t('Ils lisent des providers et écrivent par un dépôt.', 'They read providers and write through a repository.'), [
      ['repertoire.dart', t('la grille, la recherche, les tris', 'the grid, the search, the sorts')],
      ['fiche.dart', t('la photo, les chiffres, le carnet, la galerie', 'the photo, the figures, the notebook, the gallery')],
      ['formulaire_rencontre.dart', t('noter une rencontre, en six champs', 'logging an encounter, in six fields')],
      ['statistiques.dart', t('l’année, le podium, les mois', 'the year, the podium, the months')],
      ['carte.dart', t('les villes en pastilles, le classement', 'cities as bubbles, the ranking')],
      ['calendrier.dart', t('le mois sur sept colonnes', 'the month on seven columns')],
    ]],
    providers: [t('L’état', 'The state'), t('Riverpod : une écriture invalide ce qui en dépend.', 'Riverpod: a write invalidates what depends on it.'), [
      ['donnees.dart', t('les fiches, les stats, et rafraichir()', 'the cards, the stats, and rafraichir()')],
      ['auth_provider.dart', t('l’empreinte, et lock() qui oublie tout', 'the fingerprint, and lock() that forgets it all')],
      ['settings_provider.dart', t('délai du verrou, rappel de sauvegarde', 'lock delay, backup reminder')],
    ]],
    security: [t('La sécurité', 'Security'), t('Rien ne lit un fichier sans passer par ici.', 'Nothing reads a file without going through here.'), [
      ['key_vault.dart', t('la clé maîtresse, et HKDF qui en tire deux', 'the master key, and HKDF deriving two')],
      ['photo_vault.dart', t('les photos, chiffrées d’un bloc', 'photos, encrypted in one block')],
      ['video_vault.dart', t('les vidéos, chiffrées par morceaux', 'videos, encrypted in chunks')],
      ['flux_chiffre.dart', t('le flux par morceaux d’un mégaoctet', 'the one-megabyte chunked stream')],
      ['screen_guard.dart', t('aperçu masqué, captures bloquées', 'preview hidden, screenshots blocked')],
    ]],
    utils: [t('Les outils', 'The tools'), t('Ce qui touche aux fichiers, hors de la base.', 'What deals with files, outside the database.'), [
      ['export_helper.dart', t('la sauvegarde BCEX2 et la restauration', 'the BCEX2 backup and the restore')],
      ['medias.dart', t('import, allègement, copie en clair sur demande', 'import, shrinking, clear copy on request')],
      ['fichiers.dart', t('le sélecteur de fichiers du système', 'the system file picker')],
      ['date_formatter.dart', t('les dates, en français', 'dates, in French')],
    ]],
    widgets: [t('Les composants', 'The components'), t('Les pièces que plusieurs écrans partagent.', 'The pieces several screens share.'), [
      ['plan_france.dart', t('la carte de France, sans une tuile', 'the map of France, without a single tile')],
      ['carte_personne.dart', t('une carte du répertoire', 'one card of the people list')],
      ['etoiles.dart', t('cinq étoiles, par demi-point', 'five stars, by half points')],
      ['app_scaffold.dart', t('la barre du bas, ou le rail sur grand écran', 'the bottom bar, or the rail on a big screen')],
    ]],
  };
  // Un fichier clé qui n'existe plus arrête tout.
  for (const [d, [, , cles]] of Object.entries(ROLES)) {
    for (const [f] of cles) {
      const ou = d === '' ? racines : dossiers.find((x) => x.nom === d).enfants.map((e) => e[0]);
      if (!ou.includes(f)) throw new Error(`arborescence : ${d}/${f} n’existe plus dans lib/`);
    }
  }

  // Les étapes : la racine, puis chaque dossier dans l'ordre de lib/.
  const ETAPES = ['', ...dossiers.map((d) => d.nom)];
  const D0 = 0.02, PAS = (0.985 - D0) / ETAPES.length;
  const debut = (k) => D0 + k * PAS, fin = (k) => D0 + (k + 1) * PAS;

  let corps = entete(t('L’ARBORESCENCE', 'THE TREE'),
    t(`lib/ : ${nombre(totalFichiers)} fichiers Dart, ${nombre(totalLignes)} lignes, lus au moment du rendu.`,
      `lib/: ${nombre(totalFichiers)} Dart files, ${nombre(totalLignes)} lines, read at render time.`));

  // ----------------------------------------------------------- l'arbre
  const TX = 60, TY = 92, TL = 420, TH = 604, LH = 19.5;
  corps += `<rect x="${TX}" y="${TY}" width="${TL}" height="${TH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const X0 = TX + 22, Y0 = TY + 34, IND = 18;
  corps += texte(X0, Y0, 'lib/', { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 });
  // Le rang de chaque ligne repliée : la racine, ses deux fichiers, puis
  // un dossier par ligne.
  const rangRacine = (i) => 1 + i;
  const rangDossier = (k) => 1 + racines.length + k;
  // Le décalage d'une ligne repliée à chaque étape : les enfants du dossier
  // ouvert au-dessus d'elle la poussent vers le bas.
  function decalage(rang) {
    const e = [[0, 0]];
    ETAPES.forEach((nom, k) => {
      if (!nom) return;
      const d = dossiers.find((x) => x.nom === nom);
      const pousse = rangDossier(dossiers.indexOf(d)) < rang ? d.enfants.length * LH : 0;
      e.push([debut(k), e[e.length - 1][1]], [debut(k) + 0.012, pousse]);
    });
    e.push([0.985, e[e.length - 1][1]], [0.997, 0], [1, 0]);
    return `<animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${e.map((x) => x[0].toFixed(4)).join(';')}" values="${e.map((x) => `0 ${x[1]}`).join(';')}"/>`;
  }
  // Le trait de liaison d'une ligne : un coude vers son parent.
  const coude = (x, y, couleur = FIL) => `<path d="M${x - 11} ${y - 13} V${y - 4} H${x - 3}" fill="none" stroke="${couleur}" stroke-width="1.2"/>`;
  // Une ligne de fichier, qui s'éclaire quand elle est clé et citée.
  const lueur = (x, y, l, de, a, c) => `<rect x="${x - 5}" y="${y - 14}" width="${l}" height="19" rx="5" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-opacity="0.6" opacity="0">${visible(C, de, a, 0.004)}</rect>`;
  const couleurs = [VIOLET, OR, BLEU, VERT, ACCENT, FUCHSIA, BLEU, OR, VERT];
  // L'instant où la i-ème clé d'une étape s'allume au milieu.
  const cleA = (k, i, n) => debut(k) + 0.02 + i * ((PAS - 0.03) / Math.max(n, 1));

  // Les fichiers de la racine.
  racines.forEach((f, i) => {
    const y = Y0 + rangRacine(i) * LH, x = X0 + IND;
    const cles = ROLES[''][2].map((c) => c[0]);
    const j = cles.indexOf(f);
    corps += `<g>${decalage(rangRacine(i))}
      ${j >= 0 ? lueur(x, y, f.length * 7.4 + 12, cleA(0, j, cles.length), fin(0), couleurs[0]) : ''}
      ${coude(x, y)}${texte(x, y, f, { taille: 12, couleur: TEXTE, police: MONO })}</g>`;
  });
  // Les dossiers, et leurs enfants qui se déplient.
  dossiers.forEach((d, k) => {
    const etape = k + 1, rang = rangDossier(k), y = Y0 + rang * LH, x = X0 + IND;
    const c = couleurs[etape % couleurs.length];
    const cles = ROLES[d.nom] ? ROLES[d.nom][2].map((e) => e[0]) : [];
    let g = `${coude(x, y)}
      <g opacity="0">${visible(C, debut(etape), fin(etape), 0.006)}<rect x="${x - 6}" y="${y - 14}" width="${TL - (x - TX) - 10}" height="19" rx="5" fill="${c}" fill-opacity="0.1"/></g>
      <path d="M${x} ${y - 9} l4 4 l-4 4" fill="none" stroke="${TEXTE}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <animateTransform attributeName="transform" type="rotate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${debut(etape).toFixed(4)};${(debut(etape) + 0.01).toFixed(4)};${fin(etape).toFixed(4)};${(fin(etape) + 0.01).toFixed(4)};1" values="0 ${x + 2} ${y - 5};0 ${x + 2} ${y - 5};90 ${x + 2} ${y - 5};90 ${x + 2} ${y - 5};0 ${x + 2} ${y - 5};0 ${x + 2} ${y - 5}"/></path>
      ${texte(x + 12, y, d.nom + '/', { taille: 12.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(TX + TL - 18, y, t(`${d.fichiers} fichier${d.fichiers > 1 ? 's' : ''}`, `${d.fichiers} file${d.fichiers > 1 ? 's' : ''}`), { taille: 10.5, couleur: DISCRET, police: MONO, ancre: 'end' })}`;
    // Les enfants, sous le dossier, visibles le temps de l'étape.
    let enf = '';
    d.enfants.forEach(([nom, prof, dossier], i) => {
      const ye = y + (i + 1) * LH, xe = x + IND * (prof + 1);
      const j = cles.indexOf(nom);
      enf += `${j >= 0 ? lueur(xe, ye, nom.length * 7.1 + 12, cleA(etape, j, cles.length), fin(etape), c) : ''}
        ${coude(xe, ye)}${texte(xe, ye, nom, { taille: 11.5, couleur: dossier ? TITRE : TEXTE, police: MONO, poids: dossier ? 700 : 400 })}`;
    });
    g += `<g opacity="0">${fondu('opacity', C, [[0, 0], [debut(etape) + 0.006, 0], [debut(etape) + 0.016, 1], [fin(etape) - 0.004, 1], [fin(etape), 0], [1, 0]])}${enf}</g>`;
    corps += `<g>${decalage(rang)}${g}</g>`;
  });
  // Le trait vertical de lib/, qui suit la hauteur de l'arbre déplié.
  const hauteurs = [[0, (1 + racines.length + dossiers.length - 1) * LH]];
  ETAPES.forEach((nom, k) => {
    if (!nom) return;
    const d = dossiers.find((x) => x.nom === nom);
    const h = (1 + racines.length + dossiers.length - 1) * LH + (dossiers.indexOf(d) === dossiers.length - 1 ? d.enfants.length * LH : 0);
    hauteurs.push([debut(k), hauteurs[hauteurs.length - 1][1]], [debut(k) + 0.012, h]);
  });
  hauteurs.push([1, hauteurs[hauteurs.length - 1][1]]);
  corps += texte(TX + TL - 18, Y0, t(`${nombre(totalFichiers)} fichiers`, `${nombre(totalFichiers)} files`), { taille: 10.5, couleur: DISCRET, police: MONO, ancre: 'end' });

  // -------------------------------------------- au milieu, les fichiers clés
  const MX = 506, ML = 440, MY = 92;
  corps += `<rect x="${MX}" y="${MY}" width="${ML}" height="${TH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  ETAPES.forEach((nom, k) => {
    const [titre, phrase, cles] = ROLES[nom] || [nom, '', []];
    const c = couleurs[k % couleurs.length];
    const d = dossiers.find((x) => x.nom === nom);
    const chemin = nom ? `lib/${nom}/` : 'lib/';
    const bilan = d
      ? t(`${d.fichiers} fichiers, ${nombre(d.lignes)} lignes`, `${d.fichiers} files, ${nombre(d.lignes)} lines`)
      : t(`${racines.length} fichiers à la racine`, `${racines.length} files at the root`);
    let s = `${texte(MX + 24, MY + 38, chemin, { taille: 12, couleur: c, police: MONO, poids: 700 })}
      ${texte(MX + ML - 24, MY + 38, bilan, { taille: 11, couleur: DISCRET, police: MONO, ancre: 'end' })}
      ${texte(MX + 24, MY + 70, titre, { taille: 22, couleur: TITRE, poids: 800 })}
      ${texte(MX + 24, MY + 94, phrase, { taille: 13 })}
      <line x1="${MX + 24}" y1="${MY + 114}" x2="${MX + ML - 24}" y2="${MY + 114}" stroke="${BORD}"/>`;
    cles.forEach(([f, role], i) => {
      const y = MY + 136 + i * 70, a = cleA(k, i, cles.length);
      s += `<rect x="${MX + 16}" y="${y}" width="${ML - 32}" height="60" rx="11" fill="${FIL}" fill-opacity="0.18"/>
        <rect x="${MX + 16}" y="${y}" width="${ML - 32}" height="60" rx="11" fill="${c}" fill-opacity="0.08" stroke="${c}" stroke-opacity="0.6" opacity="0">${visible(C, a, fin(k), 0.004)}</rect>
        <g opacity="0.45">${fondu('opacity', C, [[0, 0.45], [Math.max(a - 0.004, 0), 0.45], [a, 1], [1, 1]])}
          ${texte(MX + 32, y + 25, f, { taille: 13, couleur: TITRE, police: MONO, poids: 700 })}
          ${texte(MX + 32, y + 45, role, { taille: 12 })}</g>`;
    });
    corps += entre(C, debut(k), fin(k), s, 0.006);
  });

  // ---------------------------------------- à droite, dans l'application
  const RX = 972, RL = 248;
  corps += rubrique(RX, 108, t('DANS L’APPLI', 'IN THE APP'));
  const T = telephone(RX, 120, RL, 500);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  const scenes = {
    '': () => `${logo(SX + SL / 2, SY + 170, 72)}
      <circle cx="${SX + SL / 2}" cy="${SY + 170}" r="52" fill="none" stroke="${APP.violet}" stroke-width="2.5" stroke-dasharray="327" stroke-dashoffset="327">
        ${fondu('stroke-dashoffset', C, [[0, 327], [debut(0) + 0.01, 327], [debut(0) + 0.05, 0], [1, 0]])}</circle>
      ${texte(SX + SL / 2, SY + 262, 'BodyCount', { taille: 24, couleur: APP.texte, poids: 800, ancre: 'middle' })}
      ${texte(SX + SL / 2, SY + 286, t('Journal chiffré, hors ligne', 'Encrypted journal, offline'), { taille: 11, couleur: APP.discret, ancre: 'middle' })}
      ${texte(SX + SL / 2, SY + 380, t('34 836 communes lues', '34,836 towns read'), { taille: 10.5, couleur: APP.second, ancre: 'middle' })}
      ${texte(SX + SL / 2, SY + 396, t('pendant l’empreinte', 'during the fingerprint'), { taille: 10.5, couleur: APP.second, ancre: 'middle' })}`,
    config: () => {
      let s = texte(SX + 18, SY + 44, t('TROIS FORMATS', 'THREE SHAPES'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' });
      [[t('passeport', 'cover'), 46, 72], [t('téléphone', 'phone'), 40, 84], [t('déplié', 'unfolded'), 76, 66]].forEach(([n, l, h], i) => {
        const x = SX + 18 + i * 72, y = SY + 150 - h;
        s += `<rect x="${x + (60 - l) / 2}" y="${y}" width="${l}" height="${h}" rx="7" fill="none" stroke="${APP.violet}" stroke-width="1.6"/>
          ${texte(x + 30, SY + 170, n, { taille: 9.5, couleur: APP.texte, ancre: 'middle' })}`;
      });
      s += texte(SX + 18, SY + 214, t('LA PALETTE', 'THE PALETTE'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' });
      [APP.violet, APP.fuchsia, APP.fond, APP.surface, APP.carte, APP.texte].forEach((c, i) => {
        s += `<rect x="${SX + 18 + (i % 3) * 72}" y="${SY + 228 + Math.floor(i / 3) * 62}" width="60" height="50" rx="10" fill="${c}" stroke="${APP.bord}"/>`;
      });
      s += texte(SX + 18, SY + 380, t('LA SEULE PORTE', 'THE ONLY DOOR'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' });
      s += `<rect x="${SX + 18}" y="${SY + 392}" width="${SL - 36}" height="36" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>
        ${icone('cadenas', SX + 30, SY + 402, APP.vert, 1)}
        ${texte(SX + 54, SY + 415, t('fermé : tout mène à /verrou', 'locked: all roads lead to /verrou'), { taille: 10, couleur: APP.texte })}`;
      return s;
    },
    domaine: () => `${texte(SX + 18, SY + 44, t('UNE RENCONTRE', 'AN ENCOUNTER'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      <rect x="${SX + 14}" y="${SY + 58}" width="${SL - 28}" height="220" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
      ${[['personneId', '12'], ['quand', '2026-09-26 22:48'], ['lieu', 'Auray'], ['note', '9'], ['gagne', 'null'], ['etiquettes', '2']].map(([k, v], i) =>
        `${texte(SX + 28, SY + 88 + i * 32, k, { taille: 11, couleur: APP.second, police: MONO })}${texte(SX + SL - 28, SY + 88 + i * 32, v, { taille: 11, couleur: v === 'null' ? APP.discret : APP.texte, police: MONO, poids: 700, ancre: 'end' })}`).join('')}
      ${texte(SX + 18, SY + 310, t('note : 9 demi-points,', 'rating: 9 half points,'), { taille: 11, couleur: APP.rose })}
      ${texte(SX + 18, SY + 326, t('soit 4,5 étoiles', 'so 4.5 stars'), { taille: 11, couleur: APP.rose })}
      ${etoiles(SX + 18, SY + 356, 9, { taille: 16, pas: 21 })}
      ${texte(SX + 18, SY + 396, t('gagne : null, pas zéro', 'amount: null, not zero'), { taille: 11, couleur: APP.second })}`,
    donnees: () => `${texte(SX + 18, SY + 44, t('SCHÉMA v7', 'SCHEMA v7'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      ${['personnes', 'rencontres', 'notes', 'photos', 'etiquettes', t('+ 2 tables de liaison', '+ 2 link tables')].map((n, i) =>
        `<rect x="${SX + 14}" y="${SY + 58 + i * 42}" width="${SL - 28}" height="34" rx="10" fill="${APP.carte}" stroke="${APP.bord}"/>
        ${icone('base', SX + 26, SY + 67 + i * 42, i < 5 ? APP.violet : APP.discret, 1)}${texte(SX + 52, SY + 80 + i * 42, n, { taille: 11.5, couleur: i < 5 ? APP.texte : APP.second, police: MONO })}`).join('')}
      ${icone('cadenas', SX + 18, SY + 330, APP.vert, 0.9)}
      ${texte(SX + 38, SY + 342, t('bodycount.db, chiffrée', 'bodycount.db, encrypted'), { taille: 11, couleur: APP.texte, poids: 700 })}
      ${texte(SX + 18, SY + 366, t('une seule connexion,', 'one single connection,'), { taille: 10.5, couleur: APP.second })}
      ${texte(SX + 18, SY + 382, t('ouverte au déverrouillage', 'opened at unlock'), { taille: 10.5, couleur: APP.second })}`,
    ecrans: () => {
      let s = texte(SX + 14, SY + 40, t('RÉPERTOIRE', 'PEOPLE'), { taille: 12, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.4"' });
      const L = (SL - 38) / 2;
      [GENS.noa, GENS.lou, GENS.enzo, GENS.jade].forEach((p, i) => {
        s += cartePersonne(p, SX + 14 + (i % 2) * (L + 10), SY + 56 + Math.floor(i / 2) * 170, L, 160, { premier: i === 0 });
      });
      return s;
    },
    providers: () => `${texte(SX + 18, SY + 44, t('APRÈS UNE ÉCRITURE', 'AFTER A WRITE'), { taille: 10, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      ${texte(SX + 18, SY + 74, 'rafraichir(ref)', { taille: 12, couleur: APP.rose, police: MONO, poids: 700 })}
      ${['repertoire', 'villes', 'journal', 'statistiques', 'annees', 'vocabulaire'].map((n, i) => {
        const a = debut(ETAPES.indexOf('providers')) + 0.03 + i * 0.006;
        return `<rect x="${SX + 14}" y="${SY + 90 + i * 40}" width="${SL - 28}" height="32" rx="10" fill="${APP.carte}" stroke="${APP.bord}"/>
          ${texte(SX + 28, SY + 110 + i * 40, n + 'Provider', { taille: 10.5, couleur: APP.texte, police: MONO })}
          <circle cx="${SX + SL - 30}" cy="${SY + 106 + i * 40}" r="5" fill="${APP.discret}">
            ${fondu('fill', C, [[0, APP.discret], [a, APP.discret], [a + 0.004, APP.fuchsia], [a + 0.03, APP.vert], [1, APP.vert]])}</circle>`;
      }).join('')}
      ${texte(SX + 18, SY + 364, t('invalidés, puis relus', 'invalidated, then reread'), { taille: 11, couleur: APP.second })}`,
    security: () => `${logo(SX + SL / 2, SY + 110, 60)}
      ${texte(SX + SL / 2, SY + 170, 'BodyCount', { taille: 22, couleur: APP.texte, poids: 800, ancre: 'middle' })}
      <circle cx="${SX + SL / 2}" cy="${SY + 262}" r="40" fill="url(#marque)"/>
      ${empreinte(SX + SL / 2, SY + 262, 38, '#FFFFFF')}
      ${texte(SX + SL / 2, SY + 330, t('Touche le capteur pour ouvrir', 'Touch the sensor to open'), { taille: 11, couleur: APP.second, poids: 600, ancre: 'middle' })}
      ${icone('cadenas', SX + 20, SY + 392, APP.vert, 0.7)}
      ${texte(SX + 36, SY + 402, t('Base chiffrée, clé dans le Keystore', 'Encrypted db, key in the Keystore'), { taille: 9.5, couleur: APP.second })}`,
    utils: () => `${texte(SX + 18, SY + 44, t('Réglages', 'Settings'), { taille: 20, couleur: APP.texte, poids: 800 })}
      <rect x="${SX + 14}" y="${SY + 150}" width="${SL - 28}" height="96" rx="18" fill="${APP.surface}" stroke="${APP.bord}"/>
      <circle cx="${SX + 40}" cy="${SY + 186}" r="10" fill="none" stroke="${APP.violet}" stroke-width="3" stroke-dasharray="40 24">
        <animateTransform attributeName="transform" type="rotate" from="0 ${SX + 40} ${SY + 186}" to="360 ${SX + 40} ${SY + 186}" dur="1s" repeatCount="indefinite"/></circle>
      ${texte(SX + 60, SY + 184, t('Chiffrement des médias,', 'Encrypting media,'), { taille: 11, couleur: APP.texte, poids: 700 })}
      ${texte(SX + 60, SY + 200, t('12 sur 40…', '12 of 40…'), { taille: 11, couleur: APP.texte, poids: 700 })}
      <rect x="${SX + 30}" y="${SY + 222}" width="${SL - 60}" height="5" rx="2.5" fill="${APP.bord}"/>
      <rect x="${SX + 30}" y="${SY + 222}" height="5" rx="2.5" fill="${APP.violet}" width="0">
        ${fondu('width', C, [[0, 0], [debut(ETAPES.indexOf('utils')), 0], [fin(ETAPES.indexOf('utils')), SL - 60], [1, SL - 60]])}</rect>
      ${texte(SX + 18, SY + 290, t('un fichier BCEX2,', 'one BCEX2 file,'), { taille: 11, couleur: APP.second })}
      ${texte(SX + 18, SY + 306, t('écrit en flux, chiffré', 'streamed, encrypted'), { taille: 11, couleur: APP.second })}`,
    widgets: () => `${cartePersonne(GENS.noa, SX + 24, SY + 30, SL - 48, 250, { premier: true })}
      ${texte(SX + 18, SY + 318, 'carte_personne · etoiles', { taille: 10, couleur: APP.second, police: MONO })}
      ${pastille(SX + 18, SY + 336, t('Embrasse bien', 'Good kisser'), { plein: true, taille: 10 })}
      ${pastille(SX + 18 + largeurPastille(t('Embrasse bien', 'Good kisser'), 10) + 6, SY + 336, 'Vannes', { taille: 10 })}
      ${texte(SX + 18, SY + 390, 'pastilles', { taille: 10, couleur: APP.second, police: MONO })}`,
  };
  let ecran = '';
  ETAPES.forEach((nom, k) => {
    const scene = scenes[nom];
    if (scene) ecran += entre(C, debut(k), fin(k), scene(), 0.006);
  });
  corps += T.ecran(ecran);
  corps += texte(RX + RL / 2, 648, t('les couches, de haut en bas :', 'the layers, top to bottom:'), { taille: 11, couleur: DISCRET, ancre: 'middle' });
  corps += texte(RX + RL / 2, 666, t('écrans, providers, dépôts, sécurité', 'screens, providers, repositories, security'), { taille: 11, couleur: DISCRET, ancre: 'middle' });

  svg('arborescence.svg', 1280, 720, corps, t(
    `L’arborescence de lib, ${nombre(totalFichiers)} fichiers Dart et ${nombre(totalLignes)} lignes, qui se déplie dossier par dossier. À la racine, main.dart, le point d’entrée qui lit les communes pendant l’empreinte, et app.dart, l’application, son thème et le reverrouillage. config : la palette, les trois formats d’écran du Fold, le routage dont la seule porte est le verrou, le jeu d’essai. domaine : les modèles, une fiche, une rencontre avec sa note en demi-points et son montant, une étiquette et sa clé, une note du carnet. donnees : base.dart pour l’ouverture unique et les migrations jusqu’au schéma v7, depots.dart le seul SQL de l’appli, les statistiques en SQL, les 34 836 communes et la géométrie de la France. ecrans : le répertoire, la fiche, le formulaire d’une rencontre, les statistiques, la carte, le calendrier et les autres. providers : l’état en Riverpod et rafraichir(), l’empreinte et lock(), les réglages. security : la clé maîtresse et HKDF, les coffres des photos et des vidéos, le flux par morceaux, la protection de l’écran. utils : la sauvegarde et la restauration, les médias, le sélecteur de fichiers, les dates. widgets : la carte de France, la carte du répertoire, les étoiles, la barre du bas. À droite, ce que chaque dossier fait dans l’application.`,
    `The lib tree, ${nombre(totalFichiers)} Dart files and ${nombre(totalLignes)} lines, unfolding folder by folder. At the root, main.dart, the entry point that reads the towns during the fingerprint, and app.dart, the app, its theme and relocking. config: the palette, the Fold’s three screen shapes, routing whose only door is the lock, the sample data. domaine: the models, a card, an encounter with its half-point rating and its amount, a tag and its key, a notebook line. donnees: base.dart for the single opening and migrations up to schema v7, depots.dart the app’s only SQL, statistics in SQL, the 34,836 towns and the geometry of France. ecrans: the people list, the card, the encounter form, the statistics, the map, the calendar and the rest. providers: Riverpod state and rafraichir(), the fingerprint and lock(), the settings. security: the master key and HKDF, the photo and video vaults, the chunked stream, screen protection. utils: backup and restore, media, the file picker, dates. widgets: the map of France, the people card, the stars, the bottom bar. On the right, what each folder does in the app.`));
};

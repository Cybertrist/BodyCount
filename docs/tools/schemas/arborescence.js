// L'arborescence de lib/, qui se déplie dossier par dossier.
//
// L'arbre n'est pas écrit à la main : il est lu dans lib/ au moment du
// rendu, avec le nombre de fichiers et de lignes de chaque dossier et de
// chaque fichier. Un fichier ajouté ou retiré apparaît donc au prochain
// rendu. Seuls les rôles des fichiers clés sont écrits ici ; un fichier
// clé qui aurait disparu arrête le rendu plutôt que de décrire un fantôme.
//
// À gauche, l'arbre, et sous lui le poids de chaque dossier ; au milieu,
// les fichiers clés du dossier ouvert, qui s'allument un à un ; à droite,
// un écran de l'application que ce dossier fait tourner.
const fs = require('fs');
const path = require('path');

module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre, paliers, telephone, toucher, frappe, visage, etoiles,
    pastille, largeurPastille, bouton, icone, empreinte, logo, cartePersonne, barreNav, france, GENS, APP, MONO, CARTE,
    BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, FUCHSIA, VERT, OR, BLEU } = O;
  const C = 60;
  const LIB = path.join(__dirname, '..', '..', '..', 'lib');
  const r1 = (v) => Math.round(v * 10) / 10;

  // ---------------------------------------------------------- l'arbre réel
  const lignes = (f) => fs.readFileSync(f, 'utf8').split('\n').length;
  const lire = (d) => fs.readdirSync(d, { withFileTypes: true })
    .sort((a, b) => (a.isDirectory() === b.isDirectory() ? a.name.localeCompare(b.name) : a.isDirectory() ? 1 : -1));
  const compter = (d) => lire(d).reduce((acc, e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { const s = compter(p); return [acc[0] + s[0], acc[1] + s[1]]; }
    return e.name.endsWith('.dart') ? [acc[0] + 1, acc[1] + lignes(p)] : acc;
  }, [0, 0]);
  // Les enfants d'un dossier, sous-dossiers compris, à plat :
  // [nom, profondeur, estDossier, lignes].
  function aplatir(d, prof = 0) {
    const r = [];
    for (const e of lire(d)) {
      const p = path.join(d, e.name);
      // Un dossier sans aucun fichier Dart n'est pas dans git : on le tait.
      if (e.isDirectory() && compter(p)[0] === 0) continue;
      if (e.isDirectory()) {
        r.push([e.name + '/', prof, true, 0]);
        r.push(...aplatir(p, prof + 1));
      } else if (e.name.endsWith('.dart')) r.push([e.name, prof, false, lignes(p)]);
    }
    return r;
  }
  const racines = lire(LIB).filter((e) => !e.isDirectory() && e.name.endsWith('.dart'))
    .map((e) => [e.name, lignes(path.join(LIB, e.name))]);
  const dossiers = lire(LIB).filter((e) => e.isDirectory() && compter(path.join(LIB, e.name))[0] > 0).map((e) => {
    const d = path.join(LIB, e.name);
    const [n, l] = compter(d);
    return { nom: e.name, enfants: aplatir(d), fichiers: n, lignes: l };
  });
  const [totalFichiers, totalLignes] = compter(LIB);
  const nombre = (n) => (O.EN ? n.toLocaleString('en-US') : n.toLocaleString('fr-FR').replace(/ | /g, ' '));
  const plusLong = Math.max(...racines.map((r) => r[1]), ...dossiers.flatMap((d) => d.enfants.map((e) => e[3])));

  // Les fichiers clés de chaque étape, et ce qu'ils font.
  const ROLES = {
    '': [t('Le cœur', 'The core'), t('Deux fichiers à la racine, tout le reste en dépend.', 'Two files at the root, everything else hangs off them.'), [
      ['main.dart', t('le point d’entrée, qui lance la lecture des communes', 'the entry point, which starts reading the towns')],
      ['app.dart', t('l’application, son thème, le reverrouillage', 'the app, its theme, relocking after the delay')],
    ]],
    config: [t('Les réglages de fond', 'The groundwork'), t('Ce qui ne change pas d’un écran à l’autre.', 'What stays the same from one screen to the next.'), [
      ['theme.dart', t('la palette, du violet au fuchsia', 'the palette, from violet to fuchsia')],
      ['layout.dart', t('les trois silhouettes d’écran du Fold', 'the Fold’s three screen shapes')],
      ['routes.dart', t('go_router, une seule porte : le verrou', 'go_router, a single door: the lock')],
      ['essais.dart', t('le jeu d’essai et la démo', 'the sample data and the demo')],
    ]],
    domaine: [t('Les modèles', 'The models'), t('Des objets simples, sans base ni écran.', 'Plain objects, with no database or screen.'), [
      ['personne.dart', t('une fiche : prénom, âge, ville, genre, rôle', 'a card: name, age, city, gender, role')],
      ['rencontre.dart', t('date, lieu, note en demi-points, montant', 'date, place, rating in half points, amount')],
      ['etiquette.dart', t('une étiquette, et sa clé sans accents', 'a tag, and its accent-free key')],
      ['note.dart', t('une ligne du carnet, datée', 'a dated notebook line')],
    ]],
    donnees: [t('La base chiffrée', 'The encrypted database'), t('Le seul dossier qui parle à SQLCipher.', 'The only folder that talks to SQLCipher.'), [
      ['base.dart', t('une seule ouverture, schéma v7', 'one single opening, schema v7')],
      ['depots.dart', t('le seul SQL de l’appli, en requêtes groupées', 'the app’s only SQL, in grouped queries')],
      ['statistiques.dart', t('les chiffres de l’écran Stats, en SQL', 'the Stats screen figures, in SQL')],
      ['coordonnees.dart', t('les 34 836 communes, embarquées', 'the 34,836 towns, shipped inside')],
      ['geometrie_france.dart', t('la côte et les départements, lus dans france.bin', 'coast and departments, read from france.bin')],
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
  // Le nombre de lignes d'un fichier clé ; un fichier disparu arrête tout.
  const lignesDe = (d, f) => {
    const trouve = d === '' ? racines.find((r) => r[0] === f)
      : (dossiers.find((x) => x.nom === d) || { enfants: [] }).enfants.find((e) => e[0] === f);
    if (!trouve) throw new Error(`arborescence : ${d}/${f} n’existe plus dans lib/`);
    return d === '' ? trouve[1] : trouve[3];
  };
  for (const [d, [, , cles]] of Object.entries(ROLES)) for (const [f] of cles) lignesDe(d, f);
  for (const f of ['config/routes.dart', 'ecrans/verrouillage.dart']) {
    if (!fs.existsSync(path.join(LIB, f))) throw new Error(`arborescence : ${f} n’existe plus dans lib/`);
  }

  // Les étapes : la racine, puis chaque dossier dans l'ordre de lib/.
  const ETAPES = ['', ...dossiers.map((d) => d.nom)];
  const D0 = 0.01, PAS = (0.99 - D0) / ETAPES.length;
  const debut = (k) => D0 + k * PAS, fin = (k) => D0 + (k + 1) * PAS;
  const COULEURS = [VIOLET, OR, BLEU, VERT, ACCENT, FUCHSIA, BLEU, OR, VERT, ACCENT];
  const couleur = (k) => COULEURS[k % COULEURS.length];
  // L'instant où la i-ème clé d'une étape s'allume.
  const cleA = (k, i, n) => debut(k) + PAS * (0.14 + (i * 0.6) / Math.max(n, 1));

  let corps = entete(t('L’ARBORESCENCE', 'THE TREE'),
    t(`lib/ : ${nombre(totalFichiers)} fichiers Dart, ${nombre(totalLignes)} lignes, lus au moment du rendu.`,
      `lib/: ${nombre(totalFichiers)} Dart files, ${nombre(totalLignes)} lines, read at render time.`));

  // --------------------------------------------------------------- l'arbre
  const TX = 60, TY = 92, TL = 392, TH = 584;
  const TF = 12.5, CW = TF * 0.61, LH = 19, IND = 18;
  corps += `<rect x="${TX}" y="${TY}" width="${TL}" height="${TH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const X0 = TX + 22, Y0 = TY + 34;
  corps += texte(X0, Y0, 'lib/', { taille: 14, couleur: TITRE, police: MONO, poids: 700 });
  corps += texte(TX + TL - 18, Y0, t(`${totalFichiers} fichiers`, `${totalFichiers} files`), { taille: 11.5, couleur: TEXTE, police: MONO, ancre: 'end' });
  const rangRacine = (i) => 1 + i;
  const rangDossier = (k) => 1 + racines.length + k;
  const pousse = (rang, nom) => {
    if (!nom) return 0;
    const d = dossiers.find((x) => x.nom === nom);
    return rangDossier(dossiers.indexOf(d)) < rang ? d.enfants.length * LH : 0;
  };
  // Une valeur par étape, qui glisse au début de chacune.
  const parEtape = (attr, f) => {
    const e = [];
    ETAPES.forEach((nom, k) => {
      const v = f(nom, k);
      if (!e.length) e.push([0, v]);
      else e.push([debut(k), e[e.length - 1][1]], [debut(k) + 0.008, v]);
    });
    e.push([1, e[e.length - 1][1]]);
    return `<animate attributeName="${attr}" dur="${C}s" repeatCount="indefinite" keyTimes="${e.map((x) => x[0].toFixed(4)).join(';')}" values="${e.map((x) => x[1]).join(';')}"/>`;
  };
  const decalage = (rang) => {
    const e = [];
    ETAPES.forEach((nom, k) => {
      const v = pousse(rang, nom);
      if (!e.length) e.push([0, v]);
      else e.push([debut(k), e[e.length - 1][1]], [debut(k) + 0.008, v]);
    });
    e.push([1, e[e.length - 1][1]]);
    return `<animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="${e.map((x) => x[0].toFixed(4)).join(';')}" values="${e.map((x) => `0 ${x[1]}`).join(';')}"/>`;
  };
  // Le petit trait horizontal qui relie une ligne au tronc de son parent.
  const branche = (x, y) => `<path d="M${x - 12} ${y - 4} H${x - 5}" stroke="${FIL}" stroke-width="1.3"/>`;
  // La surbrillance d'un nom : calée sur sa largeur réelle, 7 points de
  // marge de chaque côté, centrée sur la ligne.
  const lueur = (x, y, nom, de, a, c) => `<rect x="${r1(x - 7)}" y="${r1(y - 13.5)}" width="${r1(nom.length * CW + 14)}" height="19" rx="5" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-opacity="0.65" opacity="0">${visible(C, de, a, 0.004)}</rect>`;

  // Le tronc de lib/ : jusqu'au dernier dossier, qui descend quand un
  // dossier au-dessus de lui s'ouvre.
  const dernier = rangDossier(dossiers.length - 1);
  corps += `<line x1="${X0 + 6}" y1="${Y0 + 6}" x2="${X0 + 6}" y2="${Y0 + dernier * LH - 4}" stroke="${FIL}" stroke-width="1.3">
    ${parEtape('y2', (nom) => Y0 + dernier * LH - 4 + pousse(dernier, nom))}</line>`;
  // Les fichiers de la racine.
  racines.forEach(([f], i) => {
    const y = Y0 + rangRacine(i) * LH, x = X0 + IND;
    const cles = ROLES[''][2].map((c) => c[0]);
    const j = cles.indexOf(f);
    corps += `${j >= 0 ? lueur(x, y, f, cleA(0, j, cles.length), fin(0), couleur(0)) : ''}
      ${branche(x, y)}${texte(x, y, f, { taille: TF, couleur: TEXTE, police: MONO })}`;
  });
  // Les dossiers, et leurs enfants qui se déplient.
  dossiers.forEach((d, k) => {
    const etape = k + 1, rang = rangDossier(k), y = Y0 + rang * LH, x = X0 + IND;
    const c = couleur(etape);
    const cles = ROLES[d.nom] ? ROLES[d.nom][2].map((e) => e[0]) : [];
    let g = `${branche(x, y)}
      <g opacity="0">${visible(C, debut(etape), fin(etape), 0.006)}<rect x="${x - 7}" y="${y - 13.5}" width="${TX + TL - 10 - (x - 7)}" height="19" rx="5" fill="${c}" fill-opacity="0.1"/></g>
      <path d="M${x} ${y - 9} l4 4 l-4 4" fill="none" stroke="${TEXTE}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <animateTransform attributeName="transform" type="rotate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${debut(etape).toFixed(4)};${(debut(etape) + 0.008).toFixed(4)};${fin(etape).toFixed(4)};${Math.min(fin(etape) + 0.008, 1).toFixed(4)};1" values="0 ${x + 2} ${y - 5};0 ${x + 2} ${y - 5};90 ${x + 2} ${y - 5};90 ${x + 2} ${y - 5};0 ${x + 2} ${y - 5};0 ${x + 2} ${y - 5}"/></path>
      ${texte(x + 14, y, d.nom + '/', { taille: TF + 0.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(TX + TL - 18, y, t(`${d.fichiers} fichier${d.fichiers > 1 ? 's' : ''}`, `${d.fichiers} file${d.fichiers > 1 ? 's' : ''}`), { taille: 11.5, couleur: TEXTE, police: MONO, ancre: 'end' })}`;
    // Les enfants, sous le dossier, le temps de l'étape, avec leurs troncs.
    let enf = '';
    const xs = (prof) => x + 18 + IND * prof;
    d.enfants.forEach(([nom, prof, dossier], i) => {
      const ye = y + (i + 1) * LH;
      const j = cles.indexOf(nom);
      enf += `${j >= 0 ? lueur(xs(prof), ye, nom, cleA(etape, j, cles.length), fin(etape), c) : ''}
        ${branche(xs(prof), ye)}${texte(xs(prof), ye, nom, { taille: TF, couleur: dossier ? TITRE : TEXTE, police: MONO, poids: dossier ? 700 : 400 })}`;
    });
    // Un tronc par profondeur, du parent jusqu'au dernier enfant.
    const vus = {};
    d.enfants.forEach(([, prof], i) => {
      const ye = y + (i + 1) * LH;
      if (!vus[prof]) vus[prof] = { de: ye - LH + 6, a: ye - 4 };
      vus[prof].a = ye - 4;
    });
    for (const [prof, v] of Object.entries(vus)) {
      enf += `<line x1="${xs(+prof) - 12}" y1="${v.de}" x2="${xs(+prof) - 12}" y2="${v.a}" stroke="${FIL}" stroke-width="1.3"/>`;
    }
    g += `<g opacity="0">${fondu('opacity', C, [[0, 0], [debut(etape) + 0.004, 0], [debut(etape) + 0.012, 1], [fin(etape) - 0.004, 1], [fin(etape), 0], [1, 0]])}${enf}</g>`;
    corps += `<g>${decalage(rang)}${g}</g>`;
  });

  // Sous l'arbre, le poids de chaque dossier : visible quand l'arbre
  // ouvert lui laisse la place, caché sous les grands dossiers.
  const FB = TY + TH - 16, NF = dossiers.length, RH = 15.5;
  const FT = FB - NF * RH - 30;
  const nLignes = (nom) => 1 + racines.length + dossiers.length + (nom ? dossiers.find((x) => x.nom === nom).enfants.length : 0);
  const tient = (nom) => Y0 + (nLignes(nom) - 1) * LH + 10 < FT - 10;
  const etatsPied = ETAPES.map((nom, k) => [k, tient(nom) ? 1 : 0]);
  const pied = [[0, etatsPied[0][1]]];
  etatsPied.slice(1).forEach(([k, v]) => pied.push([debut(k), pied[pied.length - 1][1]], [debut(k) + 0.008, v]));
  pied.push([1, pied[pied.length - 1][1]]);
  const maxDossier = Math.max(...dossiers.map((d) => d.lignes));
  let p = `<line x1="${TX + 18}" y1="${FT - 8}" x2="${TX + TL - 18}" y2="${FT - 8}" stroke="${BORD}"/>
    ${rubrique(X0, FT + 10, t('LIGNES PAR DOSSIER', 'LINES PER FOLDER'))}`;
  const BX0 = X0 + 104, BX1 = TX + TL - 74;
  dossiers.forEach((d, i) => {
    const y = FT + 32 + i * RH, etape = i + 1, c = couleur(etape);
    const l = r1((BX1 - BX0) * (d.lignes / maxDossier));
    const allume = (s) => `<g opacity="0">${visible(C, debut(etape), fin(etape), 0.006)}${s}</g>`;
    p += `${texte(X0, y, d.nom, { taille: 11, couleur: TEXTE, police: MONO })}
      <rect x="${BX0}" y="${y - 7}" width="${BX1 - BX0}" height="6" rx="3" fill="${FIL}" fill-opacity="0.45"/>
      <rect x="${BX0}" y="${y - 7}" width="${l}" height="6" rx="3" fill="${TEXTE}" fill-opacity="0.45"/>
      ${texte(TX + TL - 18, y, nombre(d.lignes), { taille: 11, couleur: TEXTE, police: MONO, ancre: 'end' })}
      ${allume(`${texte(X0, y, d.nom, { taille: 11, couleur: c, police: MONO, poids: 700 })}
        <rect x="${BX0}" y="${y - 7}" width="${l}" height="6" rx="3" fill="${c}"/>
        ${texte(TX + TL - 18, y, nombre(d.lignes), { taille: 11, couleur: c, police: MONO, poids: 700, ancre: 'end' })}`)}`;
  });
  corps += `<g>${fondu('opacity', C, pied)}${p}</g>`;

  // ------------------------------------------- au milieu, les fichiers clés
  const MX = 472, ML = 440, MY = 92;
  corps += `<rect x="${MX}" y="${MY}" width="${ML}" height="${TH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const A0 = MY + 128, A1 = MY + TH - 18;
  ETAPES.forEach((nom, k) => {
    const [titre, phrase, cles] = ROLES[nom];
    const c = couleur(k);
    const d = dossiers.find((x) => x.nom === nom);
    const chemin = nom ? `lib/${nom}/` : 'lib/';
    const bilan = d
      ? t(`${d.fichiers} fichiers, ${nombre(d.lignes)} lignes`, `${d.fichiers} files, ${nombre(d.lignes)} lines`)
      : t(`${racines.length} fichiers à la racine`, `${racines.length} files at the root`);
    let s = `${texte(MX + 24, MY + 36, chemin, { taille: 12.5, couleur: c, police: MONO, poids: 700 })}
      ${texte(MX + ML - 24, MY + 36, bilan, { taille: 11.5, couleur: TEXTE, police: MONO, ancre: 'end' })}
      ${texte(MX + 24, MY + 70, titre, { taille: 22, couleur: TITRE, poids: 800 })}
      ${texte(MX + 24, MY + 95, phrase, { taille: 13 })}
      <line x1="${MX + 24}" y1="${MY + 112}" x2="${MX + ML - 24}" y2="${MY + 112}" stroke="${BORD}"/>`;
    // Une place réservée sous les cartes pour la racine et les providers.
    const reserve = nom === '' ? 230 : nom === 'providers' ? 150 : 0;
    const n = cles.length, G = 10;
    const H = Math.min(90, (A1 - A0 - reserve - (n - 1) * G) / n);
    cles.forEach(([f, role], i) => {
      const y = A0 + i * (H + G), a = cleA(k, i, n);
      const l = lignesDe(nom, f);
      const CL = ML - 32;
      s += `<rect x="${MX + 16}" y="${r1(y)}" width="${CL}" height="${r1(H)}" rx="11" fill="${FIL}" fill-opacity="0.2" stroke="${BORD}"/>
        <rect x="${MX + 16}" y="${r1(y)}" width="${CL}" height="${r1(H)}" rx="11" fill="${c}" fill-opacity="0.08" stroke="${c}" stroke-opacity="0.65" opacity="0">${visible(C, a, fin(k), 0.004)}</rect>
        <g opacity="0.45">${fondu('opacity', C, [[0, 0.45], [Math.max(a - 0.004, 0), 0.45], [a, 1], [1, 1]])}
          ${texte(MX + 32, r1(y + 24), f, { taille: 13, couleur: TITRE, police: MONO, poids: 700 })}
          ${texte(MX + 32, r1(y + 43), role, { taille: 12 })}
          ${H >= 70 ? `${texte(MX + 32, r1(y + H - 13), t(`${nombre(l)} lignes`, `${nombre(l)} lines`), { taille: 11, couleur: DISCRET, police: MONO })}
          <rect x="${MX + 124}" y="${r1(y + H - 19)}" width="${CL - 124}" height="5" rx="2.5" fill="${FIL}" fill-opacity="0.6"/>
          <rect x="${MX + 124}" y="${r1(y + H - 19)}" height="5" rx="2.5" fill="${c}" width="0">
            ${fondu('width', C, [[0, 0], [a, 0], [Math.min(a + 0.01, 1), r1((CL - 124) * (l / plusLong))], [1, r1((CL - 124) * (l / plusLong))]])}</rect>` : ''}
        </g>`;
    });
    // La racine : l'ordre au lancement, jusqu'à l'empreinte.
    if (nom === '') {
      const y0 = A0 + n * (H + G) + 16;
      s += rubrique(MX + 24, y0, t('AU LANCEMENT', 'AT LAUNCH'));
      [
        ['main.dart', t('chargerCommunes(), sans attendre', 'chargerCommunes(), without waiting')],
        ['app.dart', t('le thème, et l’écoute du verrou', 'the theme, and listening to the lock')],
        ['config/routes.dart', t('tout mène à /verrou tant que c’est fermé', 'every route leads to /verrou while locked')],
        ['ecrans/verrouillage.dart', t('attend l’empreinte', 'waits for the fingerprint')],
      ].forEach(([f, quoi], i) => {
        const y = y0 + 20 + i * 44, a = debut(k) + PAS * (0.2 + i * 0.16);
        s += `<rect x="${MX + 16}" y="${y}" width="${ML - 32}" height="36" rx="10" fill="${FIL}" fill-opacity="0.2" stroke="${BORD}"/>
          <rect x="${MX + 16}" y="${y}" width="${ML - 32}" height="36" rx="10" fill="none" stroke="${c}" stroke-opacity="0.65" opacity="0">${visible(C, a, fin(k), 0.004)}</rect>
          <circle cx="${MX + 36}" cy="${y + 18}" r="10" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-opacity="0.6"/>
          ${texte(MX + 36, y + 22, String(i + 1), { taille: 11, couleur: c, poids: 800, ancre: 'middle' })}
          ${texte(MX + 56, y + 23, f, { taille: 12, couleur: TITRE, police: MONO, poids: 700 })}
          ${texte(MX + ML - 30, y + 23, quoi, { taille: 11.5, couleur: TEXTE, ancre: 'end' })}`;
      });
    }
    // Les providers : ce que rafraichir() invalide, un à un.
    if (nom === 'providers') {
      const y0 = A0 + n * (H + G) + 16;
      s += rubrique(MX + 24, y0, t('RAFRAICHIR() INVALIDE', 'RAFRAICHIR() INVALIDATES'));
      const noms = ['repertoire', 'villes', 'journal', 'statistiques', 'annees', 'vocabulaire',
        'fichePersonne(id)', 'rang(id)', 'rencontres(id)', 'notes(id)', 'photos(id)', 'etiquettesPersonne(id)'];
      let x = MX + 24, y = y0 + 16;
      noms.forEach((nm, i) => {
        const l = r1(nm.length * 10.5 * 0.62 + 18);
        if (x + l > MX + ML - 24) { x = MX + 24; y += 30; }
        const a = debut(k) + PAS * (0.3 + i * 0.035);
        s += `<rect x="${r1(x)}" y="${y}" width="${l}" height="22" rx="11" fill="${FIL}" fill-opacity="0.3" stroke="${BORD}">
            ${fondu('stroke', C, [[0, BORD], [a, BORD], [a + 0.003, FUCHSIA], [a + 0.02, VERT], [1, VERT]])}</rect>
          ${texte(r1(x + l / 2), y + 15, nm, { taille: 10.5, couleur: TITRE, police: MONO, ancre: 'middle' })}`;
        x += l + 8;
      });
    }
    corps += entre(C, debut(k), fin(k), s, 0.005);
  });

  // ------------------------------------------- à droite, dans l'application
  const RX = 946, RL = 260;
  const T = telephone(RX, 92, RL, 524);
  const S = T, { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  const titreEcran = (s, y = SY + 42) => texte(SX + 16, y, s, { taille: 12.5, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' });
  const intitule = (s, x, y) => texte(x, y, s, { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.3"' });
  const bloc = (x, y, l, h) => `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>`;
  const recherche = (y) => `<rect x="${SX + 14}" y="${y}" width="${SL - 28}" height="30" rx="15" fill="${APP.carte}" stroke="${APP.bord}"/>
    ${icone('loupe', SX + 26, y + 7, APP.second, 0.85)}
    ${texte(SX + 46, y + 19.5, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 10.5, couleur: APP.discret })}`;
  const tris = (y, actif = 0) => {
    let x = SX + 14, s = '';
    [t('Récents', 'Recent'), t('Mieux notés', 'Top rated'), t('Plus vues', 'Most seen')].forEach((n, i) => {
      s += pastille(x, y, n, { plein: i === actif, taille: 9.5, h: 20 });
      x += largeurPastille(n, 9.5) + 6;
    });
    return s;
  };

  const scenes = {
    // Au lancement : l'anneau pendant que les communes se lisent, puis le
    // verrou.
    '': (u) => `${entre(C, u(0), u(0.45), `${logo(SX + SL / 2, SY + 200, 76)}
        <circle cx="${SX + SL / 2}" cy="${SY + 200}" r="56" fill="none" stroke="${APP.violet}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="352" stroke-dashoffset="352" transform="rotate(-90 ${SX + SL / 2} ${SY + 200})">
          ${fondu('stroke-dashoffset', C, [[0, 352], [u(0.05), 352], [u(0.4), 0], [1, 0]])}</circle>
        ${texte(SX + SL / 2, SY + 300, 'BodyCount', { taille: 24, couleur: APP.texte, poids: 800, ancre: 'middle' })}
        ${texte(SX + SL / 2, SY + 324, t('Journal chiffré, hors ligne', 'Encrypted journal, offline'), { taille: 11, couleur: APP.discret, ancre: 'middle' })}`, 0.004)}
      ${entre(C, u(0.45), u(1), `${logo(SX + SL / 2, SY + 110, 64)}
        ${texte(SX + SL / 2, SY + 180, 'BodyCount', { taille: 24, couleur: APP.texte, poids: 800, ancre: 'middle' })}
        ${texte(SX + SL / 2, SY + 206, t('Tout reste sur cet appareil. Aucun compte,', 'Everything stays on this device. No account,'), { taille: 10, couleur: APP.second, ancre: 'middle' })}
        ${texte(SX + SL / 2, SY + 221, t('aucun serveur, aucune requête réseau.', 'no server, no network request.'), { taille: 10, couleur: APP.second, ancre: 'middle' })}
        <circle cx="${SX + SL / 2}" cy="${SY + 318}" r="52" fill="${APP.violet}" opacity="0.13"><animate attributeName="r" dur="2.6s" repeatCount="indefinite" values="44;56;44"/></circle>
        <circle cx="${SX + SL / 2}" cy="${SY + 318}" r="40" fill="url(#marque)"/>
        ${empreinte(SX + SL / 2, SY + 318, 38, '#FFFFFF')}
        ${texte(SX + SL / 2, SY + 392, t('Touche le capteur pour ouvrir', 'Touch the sensor to open'), { taille: 11, couleur: APP.second, poids: 600, ancre: 'middle' })}
        ${icone('cadenas', SX + 26, SY + SH - 36, APP.vert, 0.7)}
        ${texte(SX + 40, SY + SH - 26, t('Base chiffrée, clé rangée dans le Keystore', 'Encrypted database, key in the Keystore'), { taille: 9, couleur: APP.second, poids: 600 })}`, 0.004)}`,

    // layout.dart : le même répertoire, deux colonnes puis trois.
    config: (u) => {
      const grille = (cols, gens, h) => {
        const L = (SL - 14 * 2 - (cols - 1) * 8) / cols;
        return gens.map((p, i) => cartePersonne(p, r1(SX + 14 + (i % cols) * (L + 8)), SY + 118 + Math.floor(i / cols) * (h + 8), r1(L), h, { premier: i === 0 && cols < 3 })).join('');
      };
      const gens = [GENS.noa, GENS.lou, GENS.enzo, GENS.jade, GENS.matteo, GENS.gabriel, GENS.kelyan, GENS.ibrahim, GENS.chloe];
      return `${titreEcran(t('RÉPERTOIRE', 'PEOPLE'))}${recherche(SY + 58)}${tris(SY + 96)}
        ${entre(C, u(0), u(0.5), grille(2, gens.slice(0, 6), 150), 0.006)}
        ${entre(C, u(0.5), u(1), grille(3, gens.slice(0, 6), 130), 0.006)}
        <g opacity="0">${visible(C, u(0.08), u(1), 0.004)}
          <rect x="${SX + SL / 2 - 64}" y="${SY + SH - 94}" width="128" height="24" rx="12" fill="${APP.fond}" fill-opacity="0.9" stroke="${APP.violet}" stroke-opacity="0.6"/>
          ${entre(C, u(0.08), u(0.5), texte(SX + SL / 2, SY + SH - 78, t('téléphone : 2 colonnes', 'phone: 2 columns'), { taille: 10, couleur: APP.texte, poids: 700, ancre: 'middle' }), 0.004)}
          ${entre(C, u(0.5), u(1), texte(SX + SL / 2, SY + SH - 78, t('couverture : 3 colonnes', 'cover: 3 columns'), { taille: 10, couleur: APP.texte, poids: 700, ancre: 'middle' }), 0.004)}
        </g>
        ${barreNav(S, 'Fiches')}`;
    },

    // Les modèles : une rencontre qui se remplit dans son formulaire.
    domaine: (u) => `${icone('croix', SX + 14, SY + 30, APP.texte, 0.9)}
      ${texte(SX + 38, SY + 43, t('Nouvelle rencontre', 'New encounter'), { taille: 15, couleur: APP.texte, poids: 800 })}
      ${bloc(SX + 12, SY + 62, SL - 24, 48)}${visage(GENS.enzo.photo, SX + 22, SY + 70, 32, 32, 10)}
      ${texte(SX + 64, SY + 84, 'Enzo P.', { taille: 12.5, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 64, SY + 99, t('7 fois, la dernière le 14 sept.', '7 times, last on 14 Sept.'), { taille: 9.5, couleur: APP.second })}
      ${bloc(SX + 12, SY + 120, (SL - 32) / 2, 48)}${bloc(SX + 20 + (SL - 32) / 2, SY + 120, (SL - 32) / 2, 48)}
      ${intitule(t('DATE', 'DATE'), SX + 26, SY + 139)}${texte(SX + 26, SY + 157, t('26 sept.', '26 Sept.'), { taille: 12.5, couleur: APP.texte, poids: 700 })}
      ${intitule(t('HEURE', 'TIME'), SX + 34 + (SL - 32) / 2, SY + 139)}${texte(SX + 34 + (SL - 32) / 2, SY + 157, t('22h48', '22:48'), { taille: 12.5, couleur: APP.texte, poids: 700 })}
      ${intitule(t('OÙ', 'WHERE'), SX + 16, SY + 190)}
      ${bloc(SX + 12, SY + 198, SL - 24, 38)}${icone('epingle', SX + 22, SY + 209, APP.second, 0.9)}
      ${frappe(SX + 44, SY + 222, 'Auray', C, u(0.12), u(0.28), { taille: 12.5, couleur: APP.texte, poids: 700 })}
      ${intitule(t('CE QUE ÇA A RAPPORTÉ', 'WHAT IT BROUGHT IN'), SX + 16, SY + 258)}
      ${bloc(SX + 12, SY + 266, SL - 24, 36)}
      ${texte(SX + 26, SY + 289, t('Rien, ou 100', 'Nothing, or 100'), { taille: 11, couleur: APP.discret })}
      ${texte(SX + SL - 26, SY + 289, '€', { taille: 12, couleur: APP.or, poids: 700, ancre: 'end' })}
      ${intitule(t('TA NOTE', 'YOUR RATING'), SX + 16, SY + 324)}
      ${bloc(SX + 12, SY + 332, SL - 24, 72)}
      ${entre(C, u(0), u(0.55), `${texte(SX + 26, SY + 362, '3,5', { taille: 22, couleur: APP.texte, poids: 800 })}${etoiles(SX + 26, SY + 392, 7, { taille: 18, pas: 24 })}`, 0.004)}
      ${entre(C, u(0.55), u(1), `${texte(SX + 26, SY + 362, t('4,5', '4.5'), { taille: 22, couleur: APP.texte, poids: 800 })}${etoiles(SX + 26, SY + 392, 9, { taille: 18, pas: 24 })}`, 0.004)}
      ${texte(SX + 70, SY + 362, t('sur 5', 'out of 5'), { taille: 10, couleur: APP.second })}
      ${toucher(SX + 26 + 4 * 24 + 5, SY + 384, C, u(0.54))}
      ${bouton(SX + 14, SY + SH - 58, SL - 28, 42, t('Enregistrer', 'Save'))}`,

    // statistiques.dart : les chiffres sortent de la base.
    donnees: (u) => {
      const MOIS = [5, 7, 8, 7, 12, 7, 10, 4, 18, 0, 0, 0];
      let barres = '';
      const bw = (SL - 60) / 12;
      MOIS.forEach((v, i) => {
        const h = r1(4 + v * 3.2), x = r1(SX + 26 + i * bw), a = u(0.2 + i * 0.03);
        barres += `<rect x="${x}" width="${r1(bw - 4)}" rx="2" fill="${i === 8 ? APP.fuchsia : APP.violet}" fill-opacity="${i === 8 ? 1 : 0.5}" y="${SY + 250}" height="0">
          ${fondu('height', C, [[0, 0], [a, 0], [a + 0.012, h], [1, h]])}${fondu('y', C, [[0, SY + 250], [a, SY + 250], [a + 0.012, SY + 250 - h], [1, SY + 250 - h]])}</rect>`;
      });
      const podium = [[GENS.gabriel, 2, 56, '4,8'], [GENS.noa, 1, 68, '4,9'], [GENS.ibrahim, 3, 50, '4,8']];
      let pod = '';
      podium.forEach(([p, n, c, note], i) => {
        const x = SX + 26 + i * 64, y = SY + 382 - c, a = u(0.55 + i * 0.08);
        pod += `<g opacity="0">${visible(C, a, u(1), 0.004)}${visage(p.photo, x, y, 52, c, 10)}
          <circle cx="${x + 8}" cy="${y + 8}" r="7" fill="${n === 1 ? APP.or : APP.surface}" stroke="${APP.bord}"/>
          ${texte(x + 8, y + 11.5, String(n), { taille: 9, couleur: n === 1 ? '#3A2606' : APP.texte, poids: 800, ancre: 'middle' })}
          ${texte(x + 26, SY + 398, t(note, note.replace(',', '.')), { taille: 11, couleur: APP.texte, poids: 800, ancre: 'middle' })}</g>`;
      });
      return `${texte(SX + 16, SY + 36, t('STATISTIQUES', 'STATISTICS'), { taille: 11, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.4"' })}
        ${texte(SX + 16, SY + 60, '2026', { taille: 20, couleur: APP.texte, poids: 800 })}
        ${bloc(SX + 12, SY + 74, SL - 24, 78)}
        ${intitule(t('AU TOTAL', 'IN TOTAL'), SX + 26, SY + 94)}
        ${texte(SX + 26, SY + 132, '78', { taille: 34, couleur: APP.rose, poids: 800 })}
        ${texte(SX + 80, SY + 131, t('rencontres · 18 personnes', 'encounters · 18 people'), { taille: 9.5, couleur: APP.second })}
        <rect x="${SX + SL - 78}" y="${SY + 84}" width="54" height="18" rx="9" fill="${APP.vert}" fill-opacity="0.14" stroke="${APP.vert}" stroke-opacity="0.5"/>
        ${texte(SX + SL - 51, SY + 97, '+136 %', { taille: 9.5, couleur: APP.vert, poids: 800, ancre: 'middle' })}
        ${bloc(SX + 12, SY + 162, SL - 24, 110)}
        ${intitule(t('PAR MOIS', 'BY MONTH'), SX + 26, SY + 182)}
        ${texte(SX + SL - 26, SY + 182, t('sept. · 18 fois', 'Sept. · 18 times'), { taille: 9.5, couleur: APP.texte, poids: 700, ancre: 'end' })}
        ${barres}
        ${bloc(SX + 12, SY + 282, SL - 24, 132)}
        ${intitule(t('LES MIEUX NOTÉS', 'TOP RATED'), SX + 26, SY + 302)}
        ${pod}
        ${barreNav(S, 'Stats')}`;
    },

    // calendrier.dart : le mois sur sept colonnes, un disque par soir.
    ecrans: (u) => {
      const jours = t('LMMJVSD', 'MTWTFSS').split('');
      const cw = (SL - 40) / 7, gx = SX + 20, gy = SY + 150;
      let g = jours.map((j, i) => texte(r1(gx + i * cw + cw / 2), gy - 14, j, { taille: 9.5, couleur: APP.second, poids: 700, ancre: 'middle' })).join('');
      // Septembre 2026 commence un mardi.
      const pleins = { 3: 0, 6: 0, 9: 0, 12: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1, 26: 0 };
      const signes = [APP.or, APP.rose, APP.vert, '#60A5FA'];
      let ordre = 0;
      for (let d = 1; d <= 30; d++) {
        const i = d, col = (i) % 7, lig = Math.floor(i / 7);
        const cx = r1(gx + col * cw + cw / 2), cy = gy + 10 + lig * 44;
        if (d in pleins) {
          const a = u(0.12 + (ordre++) * 0.045);
          const dore = pleins[d] === 1;
          g += `<g opacity="0">${visible(C, a, u(1), 0.004)}
            <circle cx="${cx}" cy="${cy}" r="12" fill="${dore ? APP.or : APP.violet}"/>
            ${texte(cx, cy + 4, String(d), { taille: 10, couleur: dore ? '#3A2606' : '#FFFFFF', poids: 800, ancre: 'middle' })}
            ${[0, 1, 2].slice(0, 1 + (d % 3)).map((k) => `<circle cx="${r1(cx - 6 + k * 6)}" cy="${cy + 19}" r="2" fill="${signes[(d + k) % 4]}"/>`).join('')}</g>
            <g>${fondu('opacity', C, [[0, 1], [a, 1], [a + 0.002, 0], [u(1), 0], [Math.min(u(1) + 0.002, 1), 1], [1, 1]])}${texte(cx, cy + 4, String(d), { taille: 10, couleur: APP.second, ancre: 'middle' })}</g>`;
        } else g += texte(cx, cy + 4, String(d), { taille: 10, couleur: APP.second, ancre: 'middle' });
      }
      return `${titreEcran(t('CALENDRIER', 'CALENDAR'))}
        <rect x="${SX + SL - 96}" y="${SY + 26}" width="82" height="22" rx="11" fill="${APP.carte}" stroke="${APP.bord}"/>
        ${texte(SX + SL - 55, SY + 41, t('111 rencontres', '111 encounters'), { taille: 9, couleur: APP.texte, poids: 700, ancre: 'middle' })}
        ${pastille(SX + 14, SY + 58, '2026', { plein: true, taille: 9.5, h: 20 })}${pastille(SX + 66, SY + 58, '2025', { taille: 9.5, h: 20 })}
        ${bloc(SX + 12, SY + 90, SL - 24, 290)}
        ${texte(SX + SL / 2, SY + 112, t('SEPTEMBRE 2026', 'SEPTEMBER 2026'), { taille: 11, couleur: APP.texte, poids: 800, ancre: 'middle', extra: 'letter-spacing="1.2"' })}
        ${g}
        ${bloc(SX + 12, SY + 392, SL - 24, 46)}${visage(GENS.enzo.photo, SX + 20, SY + 399, 32, 32, 9)}
        ${texte(SX + 60, SY + 412, 'Enzo P.', { taille: 11.5, couleur: APP.texte, poids: 800 })}
        ${texte(SX + 60, SY + 427, t('14 sept. · Auray · 22h22', '14 Sept. · Auray · 22:22'), { taille: 9, couleur: APP.second })}
        ${barreNav(S, 'Agenda')}`;
    },

    // rafraichir() : la fiche se relit, 8 fois au lieu de 7.
    providers: (u) => {
      const M = u(0.35);
      const chiffre = (x, avant, apres, lib) => `${entre(C, u(0), M, texte(x, SY + 258, avant, { taille: 20, couleur: APP.texte, poids: 800 }), 0.003)}
        ${entre(C, M, u(1), texte(x, SY + 258, apres, { taille: 20, couleur: APP.rose, poids: 800 }), 0.003)}
        ${texte(x, SY + 274, lib, { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1"' })}`;
      const ligne = (y, date, lieu, note, neuf) => `${bloc(SX + 12, y, SL - 24, 40)}
        ${neuf ? `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="40" rx="14" fill="none" stroke="${APP.fuchsia}" stroke-opacity="0.8"/>` : ''}
        ${texte(SX + 24, y + 18, date, { taille: 11.5, couleur: APP.texte, poids: 800 })}
        ${texte(SX + 24, y + 32, lieu, { taille: 9, couleur: APP.second })}
        ${etoiles(SX + SL - 88, y + 25, note, { taille: 9 })}`;
      return `${visage(GENS.enzo.photo, SX, SY, SL, 206, 0)}
        <rect x="${SX}" y="${SY}" width="${SL}" height="206" fill="url(#voile)"/>
        ${pastille(SX + 14, SY + 152, 'N°12', { couleur: APP.vert, taille: 9, h: 18 })}${pastille(SX + 62, SY + 152, t('23 ans', '23 y/o'), { taille: 9, h: 18 })}${pastille(SX + 116, SY + 152, 'Vannes', { taille: 9, h: 18 })}
        ${texte(SX + 14, SY + 192, 'Enzo P.', { taille: 24, couleur: '#FFFFFF', poids: 800 })}
        ${chiffre(SX + 18, '3,8', t('3,9', '3.9'), t('NOTE', 'RATING'))}
        ${chiffre(SX + 96, '7', '8', t('FOIS', 'TIMES'))}
        ${texte(SX + 168, SY + 258, t('347 j', '347 d'), { taille: 20, couleur: APP.texte, poids: 800 })}
        ${texte(SX + 168, SY + 274, t('DEPUIS', 'SINCE'), { taille: 8.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1"' })}
        ${entre(C, u(0), M, `${intitule(t('RENCONTRES · 7', 'ENCOUNTERS · 7'), SX + 16, SY + 306)}
          ${ligne(SY + 316, t('14 sept.', '14 Sept.'), t('22h22 · Auray', '22:22 · Auray'), 7)}
          ${ligne(SY + 362, t('29 août', '29 Aug.'), t('23h05 · Vannes', '23:05 · Vannes'), 8)}`, 0.003)}
        ${entre(C, M, u(1), `${intitule(t('RENCONTRES · 8', 'ENCOUNTERS · 8'), SX + 16, SY + 306)}
          ${ligne(SY + 316, t('26 sept.', '26 Sept.'), t('22h48 · Auray', '22:48 · Auray'), 9, true)}
          ${ligne(SY + 362, t('14 sept.', '14 Sept.'), t('22h22 · Auray', '22:22 · Auray'), 7)}
          ${ligne(SY + 408, t('29 août', '29 Aug.'), t('23h05 · Vannes', '23:05 · Vannes'), 8)}`, 0.003)}
        <rect x="${SX}" y="${SY + SH - 64}" width="${SL}" height="64" fill="${APP.fond}"/>
        ${bouton(SX + 14, SY + SH - 56, SL - 28, 40, t('+ Nouvelle rencontre', '+ New encounter'), { taille: 12 })}`;
    },

    // key_vault.dart : l'empreinte charge la clé, puis tout s'ouvre.
    security: (u) => `${entre(C, u(0), u(0.55), `${logo(SX + SL / 2, SY + 100, 60)}
        ${texte(SX + SL / 2, SY + 164, 'BodyCount', { taille: 22, couleur: APP.texte, poids: 800, ancre: 'middle' })}
        <circle cx="${SX + SL / 2}" cy="${SY + 280}" r="40" fill="url(#marque)"/>
        ${empreinte(SX + SL / 2, SY + 280, 38, '#FFFFFF')}
        <clipPath id="balayage-arbo"><circle cx="${SX + SL / 2}" cy="${SY + 280}" r="40"/></clipPath>
        <rect x="${SX + SL / 2 - 40}" width="80" height="6" fill="#FFFFFF" opacity="0" clip-path="url(#balayage-arbo)" y="${SY + 240}">
          ${fondu('y', C, [[0, SY + 240], [u(0.2), SY + 240], [u(0.42), SY + 316], [1, SY + 316]])}${visible(C, u(0.2), u(0.42), 0.003)}</rect>
        ${toucher(SX + SL / 2, SY + 280, C, u(0.2))}
        ${entre(C, u(0), u(0.2), texte(SX + SL / 2, SY + 356, t('Touche le capteur pour ouvrir', 'Touch the sensor to open'), { taille: 11, couleur: APP.second, poids: 600, ancre: 'middle' }), 0.003)}
        ${entre(C, u(0.2), u(0.42), texte(SX + SL / 2, SY + 356, t('Vérification…', 'Checking…'), { taille: 11, couleur: APP.rose, poids: 600, ancre: 'middle' }), 0.003)}
        ${entre(C, u(0.42), u(0.55), `<rect x="${SX + SL / 2 - 70}" y="${SY + 340}" width="140" height="26" rx="13" fill="${APP.vert}" fill-opacity="0.14" stroke="${APP.vert}" stroke-opacity="0.6"/>
          ${icone('cle', SX + SL / 2 - 58, SY + 345, APP.vert, 1)}
          ${texte(SX + SL / 2 + 8, SY + 357, t('clé chargée', 'key loaded'), { taille: 10.5, couleur: APP.vert, poids: 700, ancre: 'middle' })}`, 0.003)}
        ${icone('cadenas', SX + 26, SY + SH - 36, APP.vert, 0.7)}
        ${texte(SX + 40, SY + SH - 26, t('Base chiffrée, clé rangée dans le Keystore', 'Encrypted database, key in the Keystore'), { taille: 9, couleur: APP.second, poids: 600 })}`, 0.004)}
      ${entre(C, u(0.55), u(1), `${titreEcran(t('RÉPERTOIRE', 'PEOPLE'))}${recherche(SY + 58)}${tris(SY + 96)}
        ${[GENS.lou, GENS.noa, GENS.jade, GENS.enzo].map((p, i) => {
          const L = (SL - 36) / 2;
          return `<g opacity="0">${visible(C, u(0.58 + i * 0.04), u(1), 0.004)}${cartePersonne(p, r1(SX + 14 + (i % 2) * (L + 8)), SY + 126 + Math.floor(i / 2) * 158, r1(L), 150, { premier: i === 1 })}</g>`;
        }).join('')}
        ${barreNav(S, 'Fiches')}`, 0.004)}`,

    // export_helper.dart : la sauvegarde s'écrit en flux, chiffrée.
    utils: (u) => {
      const ligneReglage = (y, ic, titre, sous, c = APP.violet) => `${bloc(SX + 12, y, SL - 24, 48)}
        <rect x="${SX + 22}" y="${y + 12}" width="24" height="24" rx="7" fill="${c}" fill-opacity="0.14"/>
        ${icone(ic, SX + 26, y + 16, c, 1)}
        ${texte(SX + 56, y + 22, titre, { taille: 11.5, couleur: APP.texte, poids: 700 })}
        ${texte(SX + 56, y + 37, sous, { taille: 9, couleur: APP.second })}`;
      const etapes = [[0.25, 5], [0.36, 12], [0.47, 24], [0.58, 33], [0.66, 40]];
      return `${texte(SX + 16, SY + 44, '‹', { taille: 22, couleur: APP.texte })}
        ${texte(SX + 36, SY + 44, t('Réglages', 'Settings'), { taille: 19, couleur: APP.texte, poids: 800 })}
        <rect x="${SX + 12}" y="${SY + 62}" width="${SL - 24}" height="58" rx="16" fill="${APP.violet}" fill-opacity="0.12" stroke="${APP.bord}"/>
        ${logo(SX + 40, SY + 91, 34)}
        ${texte(SX + 66, SY + 88, t('18 Personnes', '18 People'), { taille: 13, couleur: APP.texte, poids: 800 })}
        ${texte(SX + 66, SY + 104, t('111 Rencontres', '111 Encounters'), { taille: 9.5, couleur: APP.second })}
        ${intitule(t('DONNÉES', 'DATA'), SX + 16, SY + 146)}
        ${ligneReglage(SY + 156, 'cadenas', t('Tout reste sur ce téléphone', 'Everything stays on this phone'), t('base chiffrée, aucun serveur', 'encrypted, no server'), APP.vert)}
        ${ligneReglage(SY + 212, 'telecharger', t('Exporter, chiffré', 'Export, encrypted'), t('phrase de passe', 'passphrase'))}
        ${ligneReglage(SY + 268, 'fichier', t('Restaurer une sauvegarde', 'Restore a backup'), t('remplace ce qui est ici', 'replaces what is here'))}
        ${toucher(SX + SL / 2, SY + 236, C, u(0.18))}
        ${entre(C, u(0.22), u(0.72), `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
          <rect x="${SX + 16}" y="${SY + 200}" width="${SL - 32}" height="92" rx="20" fill="${APP.surface}" stroke="${APP.bord}"/>
          <circle cx="${SX + 44}" cy="${SY + 234}" r="10" fill="none" stroke="${APP.violet}" stroke-width="3" stroke-dasharray="40 24">
            <animateTransform attributeName="transform" type="rotate" from="0 ${SX + 44} ${SY + 234}" to="360 ${SX + 44} ${SY + 234}" dur="1s" repeatCount="indefinite"/></circle>
          ${texte(SX + 64, SY + 231, t('Chiffrement des médias,', 'Encrypting media,'), { taille: 11, couleur: APP.texte, poids: 700 })}
          ${etapes.map(([f, n], i) => entre(C, u(f), u(i + 1 < etapes.length ? etapes[i + 1][0] : 0.72), texte(SX + 64, SY + 247, t(`${n} sur 40…`, `${n} of 40…`), { taille: 11, couleur: APP.texte, poids: 700 }), 0.002)).join('')}
          <rect x="${SX + 32}" y="${SY + 266}" width="${SL - 64}" height="5" rx="2.5" fill="${APP.bord}"/>
          <rect x="${SX + 32}" y="${SY + 266}" height="5" rx="2.5" fill="${APP.violet}" width="0">
            ${fondu('width', C, [[0, 0], [u(0.25), 0], [u(0.7), SL - 64], [1, SL - 64]])}</rect>`, 0.004)}
        ${entre(C, u(0.72), u(1), `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
          <rect x="${SX + 16}" y="${SY + 180}" width="${SL - 32}" height="150" rx="20" fill="${APP.surface}" stroke="${APP.bord}"/>
          ${texte(SX + 32, SY + 210, t('Sauvegarde prête', 'Backup ready'), { taille: 14, couleur: APP.texte, poids: 800 })}
          ${texte(SX + 32, SY + 230, t('Un fichier .bcx, chiffré par', 'A .bcx file, encrypted with'), { taille: 10, couleur: APP.second })}
          ${texte(SX + 32, SY + 245, t('ta phrase de passe.', 'your passphrase.'), { taille: 10, couleur: APP.second })}
          ${bouton(SX + 32, SY + 266, SL - 64, 34, t('Enregistrer', 'Save'), { taille: 12 })}
          ${texte(SX + SL / 2, SY + 318, t('Partager', 'Share'), { taille: 11, couleur: APP.violet, poids: 700, ancre: 'middle' })}`, 0.004)}`;
    },

    // plan_france.dart : la vraie côte, sans tuile, les villes en pastilles.
    widgets: (u) => {
      const W = SL - 24, H = 216, MXc = SX + 12, MYc = SY + 62;
      const F = france(0, 0, W, H, [-4.95, 46.75, -1.2, 48.9]);
      const cid = O.id('arbocarte');
      const villes = [['Vannes', -2.76, 47.66, 65], ['Rennes', -1.68, 48.11, 15], ['Lorient', -3.37, 47.75, 10], ['Nantes', -1.55, 47.22, 6], ['Quimper', -4.1, 48.0, 2]];
      const teinte = (part) => {
        const a = [0x7c, 0x3a, 0xed], b = [0xf0, 0xab, 0xfc];
        return '#' + a.map((x, i) => Math.round(x + (b[i] - x) * part).toString(16).padStart(2, '0')).join('');
      };
      let bulles = '';
      villes.forEach(([nom, lon, lat, n], i) => {
        const [x, y] = F.proj(lon, lat).map(r1);
        const r = r1(9 + Math.sqrt(n / 65) * 7), a = u(0.18 + i * 0.07), tn = teinte(Math.min(1, n / 61));
        bulles += `<g opacity="0">${visible(C, a, u(1), 0.003)}
          <g><animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite" keyTimes="0;${a.toFixed(4)};${(a + 0.012).toFixed(4)};${(a + 0.016).toFixed(4)};1" values="${x} ${y - 16};${x} ${y - 16};${x} ${y + 2};${x} ${y};${x} ${y}"/>
            ${nom === 'Vannes' ? [0, 1].map((k) => `<circle r="${r}" fill="none" stroke="${ACCENT}" stroke-width="1.5" opacity="0">
              <animate attributeName="r" dur="3.2s" begin="${k * 1.6}s" repeatCount="indefinite" values="${r};${r1(r * 3)}"/>
              <animate attributeName="opacity" dur="3.2s" begin="${k * 1.6}s" repeatCount="indefinite" values="0.45;0"/></circle>`).join('') : ''}
            <circle r="${r + 3}" fill="${tn}" opacity="0.25"/>
            <circle r="${r}" fill="${tn}" stroke="#FFFFFF" stroke-opacity="0.42" stroke-width="1.2"/>
            ${texte(0, r1(r * 0.36 + 1), String(n), { taille: r1(9 + (n / 65) * 3), couleur: '#FFFFFF', poids: 800, ancre: 'middle' })}
            <rect x="${r1(-nom.length * 3 - 6)}" y="${r + 3}" width="${r1(nom.length * 6 + 12)}" height="13" rx="6.5" fill="#090413" fill-opacity="0.75"/>
            ${texte(0, r1(r + 12.5), nom.toUpperCase(), { taille: 7.5, couleur: '#FFFFFF', poids: 800, ancre: 'middle', extra: 'letter-spacing="0.4"' })}
          </g></g>`;
      });
      const classement = [['Vannes', 61], ['Rennes', 15], ['Lorient', 10]];
      let cl = '';
      classement.forEach(([nom, n], i) => {
        const y = SY + 326 + i * 26, a = u(0.55 + i * 0.06), l = r1((SL - 56) * (n / 61));
        cl += `${texte(SX + 26, y, nom, { taille: 11, couleur: APP.texte, poids: 700 })}
          ${texte(SX + SL - 26, y, String(n), { taille: 11, couleur: APP.texte, poids: 800, ancre: 'end' })}
          <rect x="${SX + 26}" y="${y + 6}" width="${SL - 56}" height="5" rx="2.5" fill="#FFFFFF" fill-opacity="0.06"/>
          <rect x="${SX + 26}" y="${y + 6}" height="5" rx="2.5" fill="${i === 0 ? APP.fuchsia : APP.violet}" width="0">${fondu('width', C, [[0, 0], [a, 0], [a + 0.015, l], [1, l]])}</rect>`;
      });
      return `${titreEcran(t('TES LIEUX', 'YOUR PLACES'))}
        <rect x="${SX + SL - 78}" y="${SY + 26}" width="64" height="22" rx="11" fill="#FFFFFF" fill-opacity="0.05" stroke="${APP.bord}"/>
        ${texte(SX + SL - 46, SY + 41, t('11 villes', '11 cities'), { taille: 9.5, couleur: APP.texte, poids: 700, ancre: 'middle' })}
        <clipPath id="${cid}"><rect x="0" y="0" width="${W}" height="${H}" rx="16"/></clipPath>
        <g transform="translate(${MXc} ${MYc})"><g clip-path="url(#${cid})">
          <rect width="${W}" height="${H}" fill="#120B2A"/>
          <g opacity="0">${fondu('opacity', C, [[0, 0], [u(0.04), 0], [u(0.14), 1], [1, 1]])}
            <path d="${F.terre}" fill="#2C1857"/>
            <path d="${F.departements}" fill="none" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="0.6"/>
            <path d="${F.terre}" fill="none" stroke="${APP.rose}" stroke-opacity="0.55" stroke-width="0.9"/></g>
          ${bulles}
        </g>
        <rect width="${W}" height="${H}" rx="16" fill="none" stroke="${APP.bord}"/></g>
        ${bloc(SX + 12, SY + 290, SL - 24, 108)}
        ${intitule(t('CLASSEMENT', 'RANKING'), SX + 26, SY + 308)}
        ${cl}
        ${barreNav(S, 'Carte')}`;
    },
  };
  // La légende sous le téléphone : ce que montre l'écran, pour le dossier
  // en cours, en deux lignes.
  const LEGENDES = {
    '': [t('Au lancement : l’anneau pendant que', 'At launch: the ring while the towns'), t('les communes se lisent, puis le verrou.', 'are being read, then the lock.')],
    config: [t('layout.dart : deux colonnes sur un', 'layout.dart: two columns on a phone,'), t('téléphone, trois sur la couverture.', 'three on the Fold’s cover screen.')],
    domaine: [t('rencontre.dart : une date, un lieu,', 'rencontre.dart: a date, a place,'), t('une note en demi-points, un montant.', 'a half-point rating, an amount.')],
    donnees: [t('statistiques.dart : ces chiffres', 'statistiques.dart: these figures'), t('sortent de requêtes SQL.', 'come out of SQL queries.')],
    ecrans: [t('calendrier.dart : le mois sur sept', 'calendrier.dart: the month on seven'), t('colonnes, un disque par soir.', 'columns, one disc per night.')],
    providers: [t('rafraichir() : la fiche se relit,', 'rafraichir(): the card rereads itself,'), t('8 fois au lieu de 7, la soirée en tête.', '8 times instead of 7, the night on top.')],
    security: [t('key_vault.dart : l’empreinte charge', 'key_vault.dart: the fingerprint loads'), t('la clé, puis la base s’ouvre.', 'the key, then the database opens.')],
    utils: [t('export_helper.dart : la sauvegarde', 'export_helper.dart: the backup'), t('s’écrit en flux, chiffrée.', 'is written as a stream, encrypted.')],
    widgets: [t('plan_france.dart : la vraie côte, sans', 'plan_france.dart: the real coast, no'), t('tuile, les villes en pastilles.', 'tiles, the cities as bubbles.')],
  };
  let ecran = '', legendes = '';
  ETAPES.forEach((nom, k) => {
    const u = (f) => debut(k) + f * PAS;
    ecran += entre(C, debut(k), fin(k), scenes[nom](u), 0.005);
    const [l1, l2] = LEGENDES[nom];
    legendes += entre(C, debut(k), fin(k), `${texte(RX + RL / 2, 642, l1, { taille: 12, couleur: TEXTE, ancre: 'middle' })}
      ${texte(RX + RL / 2, 660, l2, { taille: 12, couleur: TEXTE, ancre: 'middle' })}`, 0.005);
  });
  corps += T.ecran(ecran) + legendes;

  svg('arborescence.svg', 1280, 720, corps, t(
    `L’arborescence de lib, ${nombre(totalFichiers)} fichiers Dart et ${nombre(totalLignes)} lignes, qui se déplie dossier par dossier, avec sous l’arbre le poids de chaque dossier. À la racine, main.dart, le point d’entrée qui lance la lecture des communes, et app.dart, l’application, son thème et le reverrouillage ; au lancement, tout mène au verrou. config : la palette, les trois formats d’écran du Fold, le routage dont la seule porte est le verrou, le jeu d’essai et la démo. domaine : les modèles, une fiche, une rencontre avec sa note en demi-points et son montant, une étiquette et sa clé, une note du carnet. donnees : base.dart pour l’ouverture unique et le schéma v7, depots.dart le seul SQL de l’appli, les statistiques en SQL, les 34 836 communes et la géométrie de la France. ecrans : le répertoire, la fiche, le formulaire d’une rencontre, les statistiques, la carte, le calendrier et les autres. providers : l’état en Riverpod, rafraichir() et les douze providers qu’il invalide, l’empreinte et lock(), les réglages. security : la clé maîtresse et HKDF, les coffres des photos et des vidéos, le flux par morceaux, la protection de l’écran. utils : la sauvegarde et la restauration, les médias, le sélecteur de fichiers, les dates. widgets : la carte de France, la carte du répertoire, les étoiles, la barre du bas. À droite, un écran de l’application pour chaque dossier : le verrou, le répertoire en deux puis trois colonnes, le formulaire d’une rencontre, les statistiques, le calendrier, la fiche d’Enzo qui passe à 8 fois, l’empreinte qui ouvre la base, l’export chiffré, et la vraie carte de Bretagne.`,
    `The lib tree, ${nombre(totalFichiers)} Dart files and ${nombre(totalLignes)} lines, unfolding folder by folder, with each folder’s weight under the tree. At the root, main.dart, the entry point that starts reading the towns, and app.dart, the app, its theme and relocking; at launch, everything leads to the lock. config: the palette, the Fold’s three screen shapes, routing whose only door is the lock, the sample data and the demo. domaine: the models, a card, an encounter with its half-point rating and its amount, a tag and its key, a notebook line. donnees: base.dart for the single opening and schema v7, depots.dart the app’s only SQL, statistics in SQL, the 34,836 towns and the geometry of France. ecrans: the people list, the card, the encounter form, the statistics, the map, the calendar and the rest. providers: Riverpod state, rafraichir() and the twelve providers it invalidates, the fingerprint and lock(), the settings. security: the master key and HKDF, the photo and video vaults, the chunked stream, screen protection. utils: backup and restore, media, the file picker, dates. widgets: the map of France, the people card, the stars, the bottom bar. On the right, one app screen per folder: the lock, the people list in two then three columns, the encounter form, the statistics, the calendar, Enzo’s card going to 8 times, the fingerprint opening the database, the encrypted export, and the real map of Brittany.`));
};

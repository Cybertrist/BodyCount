// Ce que partagent les schémas animés de ce dossier.
//
// Chaque autre fichier .js d'ici dessine un schéma : il reçoit ces outils
// et appelle svg() lui-même. Le texte vit dans le fichier du schéma, les
// deux langues sur la même ligne, t('français', 'english'), comme dans
// figures.sh : impossible d'en corriger une en oubliant l'autre.
//
// Les animations sont en SMIL, que GitHub joue dans une balise <img>.
// SMIL ne sait pas marquer de temps mort entre deux tours : chaque
// élément s'anime donc sur tout le cycle, et ses étapes se placent par
// keyTimes, en fraction du cycle (0 le début, 1 la fin).
const fs = require('fs');
const path = require('path');

module.exports = (LG) => {
  const EN = LG === 'en';
  const t = (fr, en) => (EN ? en : fr);
  const SORTIE = path.join(__dirname, '..', '..', ...(EN ? ['en'] : []), 'schemas');
  const VISAGES = require('./visages.json');

  // Les couleurs du schéma, celles des sept premiers : le fond de GitHub,
  // des cartes à peine plus claires, le fuchsia pour ce qui compte.
  const MONO = 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,monospace';
  const SANS = 'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif';
  const FOND = '#0D1117';
  const CARTE = '#131A24';
  const BORD = '#1F2833';
  const TITRE = '#F0F4F8';
  const TEXTE = '#8B99A8';
  const DISCRET = '#5C6A7A';
  const FIL = '#2F3A47';
  const ACCENT = '#E879F9';
  const VIOLET = '#A855F7';
  const FUCHSIA = '#D946EF';
  const VERT = '#1ED760';
  const OR = '#FDE68A';
  const ROUGE = '#F87171';
  const BLEU = '#60A5FA';

  // Les couleurs de l'application, reprises de lib/config/theme.dart, pour
  // ce qui se passe dans le téléphone.
  const APP = {
    fond: '#0B0616', surface: '#150C28', carte: '#1A1030', bord: '#261A45',
    texte: '#F6F2FF', second: '#9B8CB8', discret: '#7D6E99',
    violet: '#A855F7', fuchsia: '#D946EF', rose: '#F0ABFC', etoile: '#C084FC',
    or: '#FDE68A', vert: '#1ED760', rouge: '#F87171',
  };

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let _ids = 0;
  /// Un identifiant unique dans le fichier, pour les clipPath et dégradés.
  const id = (prefixe = 'i') => `${prefixe}${_ids++}`;

  // Les visages demandés par le schéma en cours : chacun n'est embarqué
  // qu'une fois, en <symbol>, puis repris par <use> autant qu'il faut.
  let _visages = new Set();

  /// Écrit le schéma : fond, grille estompée, halo, puis le corps.
  function svg(nom, largeur, hauteur, corps, titre) {
    const defsVisages = [..._visages].map((n) =>
      `<symbol id="visage${n}" viewBox="0 0 160 160"><image width="160" height="160" href="${VISAGES[n]}"/></symbol>`).join('\n  ');
    _visages = new Set();
    const contenu = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${largeur} ${hauteur}" width="${largeur}" height="${hauteur}" role="img" aria-label="${esc(titre)}">
<title>${esc(titre)}</title>
<defs>
  <filter id="halo" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="6" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <pattern id="grille" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M40 0H0V40" fill="none" stroke="${ACCENT}" stroke-opacity="0.045"/>
  </pattern>
  <radialGradient id="lueur" cx="50%" cy="0%" r="80%">
    <stop offset="0" stop-color="${VIOLET}" stop-opacity="0.11"/><stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="marque" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${APP.violet}"/><stop offset="1" stop-color="${APP.fuchsia}"/>
  </linearGradient>
  <linearGradient id="voile" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.38" stop-color="${APP.fond}" stop-opacity="0"/><stop offset="1" stop-color="${APP.fond}" stop-opacity="0.88"/>
  </linearGradient>
  ${defsVisages}
</defs>
<rect width="${largeur}" height="${hauteur}" rx="16" fill="${FOND}"/>
<rect width="${largeur}" height="${hauteur}" rx="16" fill="url(#grille)"/>
<rect width="${largeur}" height="${hauteur}" rx="16" fill="url(#lueur)"/>
${corps}
</svg>
`;
    fs.mkdirSync(SORTIE, { recursive: true });
    fs.writeFileSync(path.join(SORTIE, nom), contenu);
    console.log('  ' + nom.padEnd(18) + (contenu.length / 1024).toFixed(1) + ' Ko  (' + LG + ')');
  }

  /// Un texte, déjà dans la langue du rendu.
  const texte = (x, y, s, { taille = 14, couleur = TEXTE, police = SANS, poids = 400, ancre = 'start', extra = '' } = {}) =>
    `<text x="${x}" y="${y}" font-family="${police}" font-size="${taille}" font-weight="${poids}" fill="${couleur}" text-anchor="${ancre}" ${extra}>${esc(s)}</text>`;

  /// Le titre d'un schéma, en capitales espacées, suivi de sa phrase.
  const entete = (titre, phrase, { x = 60, y = 52 } = {}) =>
    texte(x, y, titre, { taille: 13, couleur: ACCENT, police: MONO, poids: 700, extra: 'letter-spacing="3"' }) +
    texte(Math.round(x + titre.length * 10.9 + 24), y, phrase, { taille: 14 });

  /// Une petite étiquette de colonne, en chasse fixe.
  const rubrique = (x, y, s, couleur = DISCRET) =>
    texte(x, y, s, { taille: 11.5, couleur, police: MONO, poids: 700, extra: 'letter-spacing="2"' });

  /// Une valeur qui change par paliers au fil du cycle : [instant, valeur].
  function paliers(attribut, cycle, etapes) {
    return `<animate attributeName="${attribut}" dur="${cycle}s" repeatCount="indefinite" keyTimes="${etapes.map((e) => e[0]).join(';')}" values="${etapes.map((e) => e[1]).join(';')}" calcMode="discrete"/>`;
  }

  /// Une valeur qui glisse d'un palier au suivant.
  function fondu(attribut, cycle, etapes) {
    return `<animate attributeName="${attribut}" dur="${cycle}s" repeatCount="indefinite" keyTimes="${etapes.map((e) => e[0]).join(';')}" values="${etapes.map((e) => e[1]).join(';')}"/>`;
  }

  /// Apparaît à [de], disparaît à [a].
  //
  // Le fondu entrant se fait après [de], le sortant avant [a] : deux
  // éléments qui se passent le relais à un même instant ne sont donc jamais
  // visibles ensemble. Quand les fondus débordaient de part et d'autre, deux
  // écrans du téléphone se superposaient pendant la transition, leurs
  // titres l'un sur l'autre.
  function visible(cycle, de, a, douceur = 0.012) {
    const e = [];
    if (de <= 0) e.push([0, 1]);
    else e.push([0, 0], [de, 0], [Math.min(de + douceur, a, 1), 1]);
    if (a >= 1) e.push([1, 1]);
    else {
      const debut = Math.max(a - douceur, e[e.length - 1][0]);
      e.push([debut, 1], [a, 0], [1, 0]);
    }
    return fondu('opacity', cycle, e);
  }

  /// Un groupe qui n'existe qu'entre [de] et [a].
  const entre = (cycle, de, a, contenu, douceur) => `<g opacity="0">${visible(cycle, de, a, douceur)}${contenu}</g>`;

  /// Un déplacement par paliers glissés : [instant, "x y"].
  function glisse(cycle, etapes) {
    return `<animateTransform attributeName="transform" type="translate" dur="${cycle}s" repeatCount="indefinite" keyTimes="${etapes.map((e) => e[0]).join(';')}" values="${etapes.map((e) => e[1]).join(';')}"/>`;
  }

  /// Une carte du schéma : liseré coloré, titre en chasse fixe, sous-titre.
  /// [allume] : [de, a], la fenêtre où son bord s'éclaire.
  function carte(x, y, l, h, titre, sous, accent = ACCENT, { allume = null, cycle = 10, sous2 = '' } = {}) {
    const bord = allume
      ? `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="13" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0">${visible(cycle, allume[0], allume[1])}</rect>`
      : '';
    const dy = sous2 ? -9 : 0;
    return `<g>
  <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
  ${bord}
  ${texte(x + 20, y + h / 2 - 3 + dy, titre, { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
  ${texte(x + 20, y + h / 2 + 16 + dy, sous, { taille: 12.5 })}
  ${sous2 ? texte(x + 20, y + h / 2 + 34 + dy, sous2, { taille: 12.5 }) : ''}
</g>`;
  }

  /// Le téléphone : un cadre, un écran au fond de l'application, et
  /// ecran(contenu) qui pose le contenu coupé aux bords de l'écran.
  function telephone(x, y, l, h) {
    const c = id('ecran');
    const S = { x: x + 10, y: y + 14, l: l - 20, h: h - 28 };
    return {
      ...S,
      cadre: `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="36" fill="#07050C" stroke="#2F2A3F" stroke-width="2"/>
  <clipPath id="${c}"><rect x="${S.x}" y="${S.y}" width="${S.l}" height="${S.h}" rx="26"/></clipPath>
  <rect x="${S.x}" y="${S.y}" width="${S.l}" height="${S.h}" rx="26" fill="${APP.fond}"/>
  <rect x="${x + l / 2 - 30}" y="${y + 5}" width="60" height="5" rx="2.5" fill="#1B1726"/>`,
      ecran: (contenu) => `<g clip-path="url(#${c})">${contenu}</g>`,
    };
  }

  /// Un toucher : le doigt se pose à [a], une onde s'ouvre.
  function toucher(cx, cy, cycle, a) {
    return `<g opacity="0">${visible(cycle, a - 0.018, a + 0.012, 0.004)}
    <circle cx="${cx}" cy="${cy}" r="13" fill="#FFFFFF" fill-opacity="0.28" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.5"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0">
    ${fondu('opacity', cycle, [[0, 0], [a, 0], [a + 0.002, 0.8], [a + 0.035, 0], [1, 0]])}
    ${fondu('r', cycle, [[0, 10], [a, 10], [a + 0.035, 30], [1, 30]])}
  </circle>`;
  }

  /// Un texte qui se tape lettre à lettre, de [de] à [a].
  function frappe(x, y, s, cycle, de, a, opts = {}) {
    const c = id('frappe');
    const l = s.length * (opts.taille || 14) * 0.62 + 6;
    return `<clipPath id="${c}"><rect x="${x - 2}" y="${y - 20}" height="28" width="0">
      ${fondu('width', cycle, [[0, 0], [de, 0], [a, l], [1, l]])}</rect></clipPath>
    <g clip-path="url(#${c})">${texte(x, y, s, opts)}</g>`;
  }

  /// Un visage du jeu d'essai (1 à 18), carré aux coins arrondis.
  function visage(n, x, y, l, h = l, rx = 12) {
    _visages.add(n);
    const c = id('photo');
    // Le symbole est carré : pour un cadre en portrait on l'agrandit à la
    // hauteur et on centre, le débord est coupé.
    const cote = Math.max(l, h);
    return `<clipPath id="${c}"><rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${rx}"/></clipPath>
  <g clip-path="url(#${c})"><rect x="${x}" y="${y}" width="${l}" height="${h}" fill="${APP.carte}"/><use href="#visage${n}" xlink:href="#visage${n}" x="${x + (l - cote) / 2}" y="${y}" width="${cote}" height="${cote}"/></g>`;
  }

  /// Cinq étoiles pour une note en demi-points sur dix.
  function etoiles(x, y, note, { taille = 10, couleur = APP.etoile, vide = '#3A2D55', pas = null } = {}) {
    const p = pas || taille * 1.15;
    const branche = (cx, cy, r) => {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.45 : r;
        pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
      }
      return pts.join(' ');
    };
    let s = '';
    for (let i = 0; i < 5; i++) {
      const cx = x + i * p + taille / 2, cy = y - taille / 2;
      const plein = note - i * 2;
      s += `<polygon points="${branche(cx, cy, taille / 2)}" fill="${vide}"/>`;
      if (plein >= 2) s += `<polygon points="${branche(cx, cy, taille / 2)}" fill="${couleur}"/>`;
      else if (plein === 1) {
        const c = id('demi');
        s += `<clipPath id="${c}"><rect x="${cx - taille / 2}" y="${cy - taille / 2}" width="${taille / 2}" height="${taille}"/></clipPath><polygon clip-path="url(#${c})" points="${branche(cx, cy, taille / 2)}" fill="${couleur}"/>`;
      }
    }
    return s;
  }

  /// Une pastille de l'application : pleine en dégradé, ou discrète.
  function pastille(x, y, s, { plein = false, taille = 10.5, h = 22, couleur = null, l = null } = {}) {
    const larg = l || Math.round(s.length * taille * 0.6 + 22);
    const fond = plein ? 'url(#marque)' : (couleur ? couleur : APP.carte);
    return `<rect x="${x}" y="${y}" width="${larg}" height="${h}" rx="${h / 2}" fill="${fond}" ${couleur && !plein ? 'fill-opacity="0.16"' : ''} stroke="${plein ? 'none' : (couleur || APP.bord)}" ${couleur && !plein ? 'stroke-opacity="0.55"' : ''}/>
  ${texte(x + larg / 2, y + h / 2 + taille * 0.36, s, { taille, couleur: plein ? '#FFFFFF' : (couleur || APP.texte), poids: 600, ancre: 'middle' })}`;
  }
  /// La largeur qu'occupera une pastille.
  const largeurPastille = (s, taille = 10.5) => Math.round(s.length * taille * 0.6 + 22);

  /// Un bouton de l'application, en dégradé de la marque.
  const bouton = (x, y, l, h, s, { taille = 13 } = {}) =>
    `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${Math.min(18, h / 2)}" fill="url(#marque)"/>
  ${texte(x + l / 2, y + h / 2 + taille * 0.36, s, { taille, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}`;

  /// La barre du bas : Fiches, Stats, le +, Carte, Agenda.
  // Les icônes de la barre du bas, redessinées d'après les Material Icons
  // arrondies de lib/widgets/common/app_scaffold.dart (grid_view_rounded,
  // bar_chart_rounded, map_rounded, calendar_month_rounded), dans un carré
  // de 24 dont le coin haut gauche est à l'origine.
  const ICONE_NAV = {
    Fiches: (c) => `<rect x="3" y="3" width="8" height="8" rx="2.2" fill="${c}"/><rect x="13" y="3" width="8" height="8" rx="2.2" fill="${c}"/><rect x="3" y="13" width="8" height="8" rx="2.2" fill="${c}"/><rect x="13" y="13" width="8" height="8" rx="2.2" fill="${c}"/>`,
    Stats: (c) => `<rect x="4" y="11" width="4" height="9" rx="2" fill="${c}"/><rect x="10" y="4" width="4" height="16" rx="2" fill="${c}"/><rect x="16" y="14" width="4" height="6" rx="2" fill="${c}"/>`,
    Carte: (c) => `<path d="M9.2 4.2 L3.6 6.1 C3.2 6.2 3 6.6 3 7 V19.5 C3 20.2 3.7 20.7 4.3 20.4 L9 18.6 V4.3 Z M10.6 4.3 V18.5 L13.4 19.7 V5.5 Z M14.8 5.4 V19.7 L20.4 17.9 C20.8 17.8 21 17.4 21 17 V4.5 C21 3.8 20.3 3.3 19.7 3.6 Z" fill="${c}"/>`,
    Agenda: (c) => `<path d="M5.5 4.5 H18.5 C19.9 4.5 21 5.6 21 7 V18.5 C21 19.9 19.9 21 18.5 21 H5.5 C4.1 21 3 19.9 3 18.5 V7 C3 5.6 4.1 4.5 5.5 4.5 Z M5 9.5 V18.3 C5 18.7 5.3 19 5.7 19 H18.3 C18.7 19 19 18.7 19 18.3 V9.5 Z" fill="${c}" fill-rule="evenodd"/><rect x="7" y="2.5" width="2" height="4" rx="1" fill="${c}"/><rect x="15" y="2.5" width="2" height="4" rx="1" fill="${c}"/><circle cx="8.5" cy="12.5" r="1.2" fill="${c}"/><circle cx="12" cy="12.5" r="1.2" fill="${c}"/><circle cx="15.5" cy="12.5" r="1.2" fill="${c}"/><circle cx="8.5" cy="16" r="1.2" fill="${c}"/><circle cx="12" cy="16" r="1.2" fill="${c}"/><circle cx="15.5" cy="16" r="1.2" fill="${c}"/>`,
  };

  /// La barre du bas, comme lib/widgets/common/app_scaffold.dart : quatre
  /// onglets à icône autour du bouton d'ajout en dégradé. L'onglet actif
  /// porte une pastille en dégradé violet. Les libellés ne s'affichent que
  /// s'ils tiennent, comme dans l'appli (_libellesTiennent) : sur un
  /// téléphone 16/9, les icônes seules, un peu plus grandes.
  function barreNav(S, actif = 'Fiches', { libelles = null } = {}) {
    const y = S.y + S.h - 58, l = S.l - 20, x = S.x + 10, h = 46;
    const onglets = [['Fiches', t('Fiches', 'People')], ['Stats', t('Stats', 'Stats')], ['Carte', t('Carte', 'Map')], ['Agenda', t('Agenda', 'Agenda')]];
    const ajout = 40, marge = 6;
    const place = (l - ajout - 2 * marge) / onglets.length;
    const avecMots = libelles ?? place >= 19 + 7 + 38 + 6;
    const gid = id('nav');
    let s = `<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A855F7" stop-opacity="0.26"/><stop offset="1" stop-color="#D946EF" stop-opacity="0.2"/></linearGradient>
  <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${h / 2}" fill="${APP.surface}" stroke="${APP.bord}"/>`;
    const cxDe = (i) => {
      // Deux onglets, le bouton, deux onglets.
      const avant = i < 2 ? i : i + 0;
      const base = x + marge + place * avant + place / 2;
      return i < 2 ? base : base + ajout;
    };
    onglets.forEach(([cle, mot], i) => {
      const cx = cxDe(i), choisi = cle === actif;
      const couleur = choisi ? '#E9D5FF' : '#8B7BA8';
      if (choisi) s += `<rect x="${cx - place / 2 + 2}" y="${y + 5}" width="${place - 4}" height="${h - 10}" rx="14" fill="url(#${gid})"/>`;
      if (avecMots) {
        const lm = mot.length * 6.4, k = 15 / 24, tot = 15 + 5 + lm;
        s += `<g transform="translate(${cx - tot / 2} ${y + h / 2 - 7.5}) scale(${k})">${ICONE_NAV[cle](couleur)}</g>`;
        s += texte(cx - tot / 2 + 20, y + h / 2 + 4, mot, { taille: 10.5, couleur, poids: choisi ? 800 : 700 });
      } else {
        const k = 18 / 24;
        s += `<g transform="translate(${cx - 9} ${y + h / 2 - 9}) scale(${k})">${ICONE_NAV[cle](couleur)}</g>`;
      }
    });
    const bx = x + marge + place * 2 + ajout / 2;
    s += `<rect x="${bx - 18}" y="${y + h / 2 - 18}" width="36" height="36" rx="12" fill="url(#marque)"/>
  <path d="M${bx - 7} ${y + h / 2} h14 M${bx} ${y + h / 2 - 7} v14" stroke="#12071F" stroke-width="2.6" stroke-linecap="round"/>`;
    return s;
  }

  // Quelques pictogrammes au trait, dans un carré de 16 dont le coin haut
  // gauche est à l'origine : on les pose avec translate(x y) scale(k).
  const ICONE = {
    cadenas: (c) => `<rect x="3" y="7" width="10" height="8" rx="2" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M5 7 V5 a3 3 0 0 1 6 0 V7" fill="none" stroke="${c}" stroke-width="1.6"/>`,
    ouvert: (c) => `<rect x="3" y="7" width="10" height="8" rx="2" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M5 7 V5 a3 3 0 0 1 6 -0.5" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`,
    cle: (c) => `<circle cx="5" cy="8" r="3.2" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M8 8 H15 M12.5 8 V11 M14.5 8 V10.5" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`,
    base: (c) => `<ellipse cx="8" cy="4" rx="6" ry="2.3" fill="none" stroke="${c}" stroke-width="1.5"/><path d="M2 4 V12 c0 1.3 2.7 2.3 6 2.3 s6 -1 6 -2.3 V4 M2 8 c0 1.3 2.7 2.3 6 2.3 s6 -1 6 -2.3" fill="none" stroke="${c}" stroke-width="1.5"/>`,
    photo: (c) => `<rect x="1.5" y="3" width="13" height="10" rx="2" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="6" cy="7" r="1.4" fill="${c}"/><path d="M2.5 12 L7 8.5 L10 11 L12 9.5 L14 11.5" fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round"/>`,
    fichier: (c) => `<path d="M4 1.5 H10 L13 4.5 V14.5 H4 Z M10 1.5 V4.5 H13" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>`,
    horloge: (c) => `<circle cx="8" cy="8" r="6.2" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M8 4.5 V8 L10.5 9.5" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`,
    oeil: (c) => `<path d="M1 8 C3.5 3.5 12.5 3.5 15 8 C12.5 12.5 3.5 12.5 1 8 Z" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="8" cy="8" r="2.2" fill="${c}"/>`,
    oeilBarre: (c) => `<path d="M1 8 C3.5 3.5 12.5 3.5 15 8 C12.5 12.5 3.5 12.5 1 8 Z" fill="none" stroke="${c}" stroke-width="1.5"/><path d="M2.5 2.5 L13.5 13.5" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`,
    loupe: (c) => `<circle cx="7" cy="7" r="4.6" fill="none" stroke="${c}" stroke-width="1.7"/><path d="M10.5 10.5 L14.5 14.5" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
    epingle: (c) => `<path d="M8 15 C8 15 3 9.5 3 6.2 a5 5 0 0 1 10 0 C13 9.5 8 15 8 15 Z" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="8" cy="6.2" r="1.8" fill="${c}"/>`,
    coche: (c) => `<path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    croix: (c) => `<path d="M4 4 L12 12 M12 4 L4 12" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
    telephoneIcone: (c) => `<rect x="4" y="1" width="8" height="14" rx="2" fill="none" stroke="${c}" stroke-width="1.5"/><path d="M7 12.5 h2" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>`,
    calendrier: (c) => `<rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="${c}" stroke-width="1.5"/><path d="M2 6.5 H14 M5 1.5 V4 M11 1.5 V4" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>`,
    etoile: (c) => `<path d="M8 1.5 L9.9 5.8 L14.5 6.2 L11 9.3 L12 13.8 L8 11.4 L4 13.8 L5 9.3 L1.5 6.2 L6.1 5.8 Z" fill="${c}"/>`,
    euro: (c) => `<path d="M12 4 a5 5 0 1 0 0 8 M3 7 H9 M3 9.5 H9" fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>`,
    telecharger: (c) => `<path d="M8 2 V10 M4.5 7 L8 10.5 L11.5 7 M3 13.5 H13" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    lecture: (c) => `<path d="M5 3 L13 8 L5 13 Z" fill="${c}"/>`,
  };
  // Les pictogrammes qui ont leur pendant dans l'appli prennent l'icône
  // Material de l'appli (ICONES_APP, en 24), ramenée au carré de 16 :
  // une loupe ou une croix dessinée à part jurait avec celles des écrans.
  const EQUIVALENTS = {
    croix: 'close', coche: 'check', telecharger: 'download', loupe: 'search', epingle: 'place',
    etoile: 'star', horloge: 'schedule', calendrier: 'calendar_today', oeilBarre: 'visibility_off',
  };
  const icone = (nom, x, y, couleur, echelle = 1) => (EQUIVALENTS[nom] || (!ICONE[nom] && ICONES_APP[nom]))
    ? `<g transform="translate(${x} ${y}) scale(${(echelle * 16) / 24})">${ICONES_APP[EQUIVALENTS[nom] || nom](couleur)}</g>`
    : `<g transform="translate(${x} ${y}) scale(${echelle})">${ICONE[nom](couleur)}</g>`;

  // L'icône « fingerprint » de Material Design, en 24 x 24 (Apache 2.0).
  const EMPREINTE = 'M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z';
  /// L'empreinte, centrée sur (cx, cy), de [taille] points.
  const empreinte = (cx, cy, taille, couleur) =>
    `<path transform="translate(${cx - taille / 2} ${cy - taille / 2}) scale(${taille / 24})" fill="${couleur}" d="${EMPREINTE}"/>`;

  // Les icônes de l'application, redessinées d'après les Material Icons
  // arrondies que lib/ utilise (grep Icons.), dans un carré de 24 dont le
  // coin haut gauche est à l'origine. Une icône « outlined » est au trait,
  // une « rounded » pleine, comme dans Flutter.
  const T_ = (c, d, l = 2) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${l}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const P_ = (c, d) => `<path d="${d}" fill="${c}"/>`;
  const ICONES_APP = {
    fingerprint: (c) => `<path fill="${c}" d="${EMPREINTE}"/>`,
    visibility_off: (c) => T_(c, 'M2.5 12 C5 7.5 8.5 5.5 12 5.5 C15.5 5.5 19 7.5 21.5 12 C19 16.5 15.5 18.5 12 18.5 C8.5 18.5 5 16.5 2.5 12 Z') + `<circle cx="12" cy="12" r="3" fill="${c}"/>` + T_(c, 'M4 3.5 L20.5 20', 2.2),
    timer: (c) => T_(c, 'M12 21 a8 8 0 1 0 0 -16 a8 8 0 1 0 0 16 Z M12 9 V13.2 M9.5 2.5 H14.5 M18.4 6.1 L19.8 4.7'),
    shield: (c) => T_(c, 'M12 2.8 L19.5 5.8 V11.2 C19.5 15.9 16.3 19.8 12 21.2 C7.7 19.8 4.5 15.9 4.5 11.2 V5.8 Z'),
    ios_share: (c) => T_(c, 'M12 3 V14 M8 6.8 L12 3 L16 6.8 M8 10 H6.5 C5.7 10 5 10.7 5 11.5 V19.5 C5 20.3 5.7 21 6.5 21 H17.5 C18.3 21 19 20.3 19 19.5 V11.5 C19 10.7 18.3 10 17.5 10 H16'),
    settings_backup_restore: (c) => T_(c, 'M4.2 12 A7.8 7.8 0 1 0 6.6 6.4 M3.8 3.8 V7.8 H7.8') + `<circle cx="12" cy="12" r="2" fill="${c}"/>`,
    auto_awesome: (c) => P_(c, 'M10 4 L11.6 8.4 L16 10 L11.6 11.6 L10 16 L8.4 11.6 L4 10 L8.4 8.4 Z M18 2.5 L18.8 4.7 L21 5.5 L18.8 6.3 L18 8.5 L17.2 6.3 L15 5.5 L17.2 4.7 Z M18 14.5 L18.8 16.7 L21 17.5 L18.8 18.3 L18 20.5 L17.2 18.3 L15 17.5 L17.2 16.7 Z'),
    save_alt: (c) => T_(c, 'M12 3.5 V14.5 M7.5 10.2 L12 14.7 L16.5 10.2 M4.5 14 V18.5 C4.5 19.6 5.4 20.5 6.5 20.5 H17.5 C18.6 20.5 19.5 19.6 19.5 18.5 V14'),
    chevron_right: (c) => T_(c, 'M9.5 6.5 L15 12 L9.5 17.5', 2.4),
    chevron_left: (c) => T_(c, 'M14.5 6.5 L9 12 L14.5 17.5', 2.4),
    arrow_back: (c) => T_(c, 'M15.5 4.5 L8 12 L15.5 19.5', 2.5),
    delete: (c) => T_(c, 'M4.5 6.5 H19.5 M9.5 6.5 V4.5 H14.5 V6.5 M6.5 6.5 L7.4 19.2 C7.5 20.2 8.3 21 9.3 21 H14.7 C15.7 21 16.5 20.2 16.6 19.2 L17.5 6.5 M10 10.5 V17 M14 10.5 V17'),
    check: (c) => T_(c, 'M5 12.5 L9.8 17.2 L19 7.5', 2.5),
    edit: (c) => T_(c, 'M4 20 H8 L18.6 9.4 C19.4 8.6 19.4 7.4 18.6 6.6 L17.4 5.4 C16.6 4.6 15.4 4.6 14.6 5.4 L4 16 Z M13.2 6.8 L17.2 10.8'),
    place: (c) => T_(c, 'M12 21.5 C12 21.5 5 14.8 5 9.5 A7 7 0 0 1 19 9.5 C19 14.8 12 21.5 12 21.5 Z') + `<circle cx="12" cy="9.5" r="2.6" fill="${c}"/>`,
    location_on: (c) => `<path d="M12 22 C12 22 4.8 15 4.8 9.5 A7.2 7.2 0 0 1 19.2 9.5 C19.2 15 12 22 12 22 Z M12 12.3 A2.8 2.8 0 1 0 12 6.7 A2.8 2.8 0 1 0 12 12.3 Z" fill="${c}" fill-rule="evenodd"/>`,
    add_location: (c) => T_(c, 'M12 21.5 C12 21.5 5 14.8 5 9.5 A7 7 0 0 1 19 9.5 C19 14.8 12 21.5 12 21.5 Z M12 6.5 V12.5 M9 9.5 H15'),
    call: (c) => T_(c, 'M6.6 3.5 H9.3 L10.8 7.6 L8.7 9.3 C9.7 11.5 12.5 14.3 14.7 15.3 L16.4 13.2 L20.5 14.7 V17.4 C20.5 18.9 19.2 20.2 17.7 20.1 C10.2 19.6 4.4 13.8 3.9 6.3 C3.8 4.8 5.1 3.5 6.6 3.5 Z'),
    home: (c) => T_(c, 'M3.5 11 L12 4 L20.5 11 M6 9 V19.5 C6 20.1 6.4 20.5 7 20.5 H10 V15 H14 V20.5 H17 C17.6 20.5 18 20.1 18 19.5 V9'),
    chat_bubble: (c) => T_(c, 'M5.5 3.5 H18.5 C19.6 3.5 20.5 4.4 20.5 5.5 V15.5 C20.5 16.6 19.6 17.5 18.5 17.5 H7.5 L3.5 21 V5.5 C3.5 4.4 4.4 3.5 5.5 3.5 Z'),
    nightlight: (c) => T_(c, 'M14.5 3 C9.6 3.3 6 7.3 6 12 C6 16.7 9.6 20.7 14.5 21 C11.7 19 10 15.7 10 12 C10 8.3 11.7 5 14.5 3 Z'),
    schedule: (c) => T_(c, 'M12 21 A9 9 0 1 0 12 3 A9 9 0 1 0 12 21 Z M12 7.5 V12.2 L15.3 14.2'),
    directions: (c) => T_(c, 'M12 2.8 L21.2 12 L12 21.2 L2.8 12 Z M9 14.5 V11.8 C9 11.2 9.4 10.8 10 10.8 H15 M13 8.8 L15 10.8 L13 12.8'),
    add: (c) => T_(c, 'M12 5 V19 M5 12 H19', 2.5),
    close: (c) => T_(c, 'M6 6 L18 18 M18 6 L6 18', 2.4),
    calendar_today: (c) => T_(c, 'M5.5 4.5 H18.5 C19.6 4.5 20.5 5.4 20.5 6.5 V18.5 C20.5 19.6 19.6 20.5 18.5 20.5 H5.5 C4.4 20.5 3.5 19.6 3.5 18.5 V6.5 C3.5 5.4 4.4 4.5 5.5 4.5 Z M3.5 9.5 H20.5 M8 2.5 V6 M16 2.5 V6'),
    event_note: (c) => T_(c, 'M5.5 4.5 H18.5 C19.6 4.5 20.5 5.4 20.5 6.5 V18.5 C20.5 19.6 19.6 20.5 18.5 20.5 H5.5 C4.4 20.5 3.5 19.6 3.5 18.5 V6.5 C3.5 5.4 4.4 4.5 5.5 4.5 Z M3.5 9.5 H20.5 M8 2.5 V6 M16 2.5 V6 M7.5 13 H16.5 M7.5 16.5 H13'),
    savings: (c) => T_(c, 'M4.5 11.5 C4.5 8.2 7.8 6 11.5 6 H14 C14.8 5 16 4.5 17.5 4.5 L17 7.3 C18.2 8.1 19 9.1 19.4 10.3 H20.5 V14 H19.2 C18.7 15 18 15.8 17 16.4 V19.5 H14.5 V17.5 H10.5 V19.5 H8 V16.6 C5.8 15.5 4.5 13.7 4.5 11.5 Z') + `<circle cx="15.5" cy="10" r="1.1" fill="${c}"/>`,
    star: (c) => P_(c, 'M12 3 L14.6 8.5 L20.5 9.2 L16.1 13.2 L17.3 19.1 L12 16.2 L6.7 19.1 L7.9 13.2 L3.5 9.2 L9.4 8.5 Z'),
    star_outline: (c) => T_(c, 'M12 3.5 L14.4 8.7 L20 9.3 L15.8 13.1 L17 18.7 L12 16 L7 18.7 L8.2 13.1 L4 9.3 L9.6 8.7 Z', 1.8),
    tune: (c) => T_(c, 'M4 7 H11 M15 7 H20 M13 4.5 V9.5 M4 17 H9 M13 17 H20 M11 14.5 V19.5'),
    search: (c) => T_(c, 'M10.5 17 A6.5 6.5 0 1 0 10.5 4 A6.5 6.5 0 1 0 10.5 17 Z M15.2 15.2 L20 20', 2.3),
    sell: (c) => T_(c, 'M3.5 12.2 V5.5 C3.5 4.4 4.4 3.5 5.5 3.5 H12.2 L20.5 11.8 C21.3 12.6 21.3 13.8 20.5 14.6 L14.6 20.5 C13.8 21.3 12.6 21.3 11.8 20.5 Z') + `<circle cx="8" cy="8" r="1.6" fill="${c}"/>`,
    help: (c) => T_(c, 'M12 21 A9 9 0 1 0 12 3 A9 9 0 1 0 12 21 Z M9.6 9.4 C9.6 8 10.7 7 12 7 C13.3 7 14.4 8 14.4 9.3 C14.4 11.2 12 11.3 12 13.6') + `<circle cx="12" cy="16.8" r="1.2" fill="${c}"/>`,
    download: (c) => T_(c, 'M12 4 V15 M7.5 10.8 L12 15.3 L16.5 10.8 M5 20 H19', 2.3),
    more_vert: (c) => `<circle cx="12" cy="5.5" r="2" fill="${c}"/><circle cx="12" cy="12" r="2" fill="${c}"/><circle cx="12" cy="18.5" r="2" fill="${c}"/>`,
    play_circle: (c) => `<path d="M12 22 A10 10 0 1 0 12 2 A10 10 0 1 0 12 22 Z M9.8 7.6 V16.4 C9.8 17 10.4 17.3 10.9 17 L16.9 12.6 C17.3 12.3 17.3 11.7 16.9 11.4 L10.9 7 C10.4 6.7 9.8 7 9.8 7.6 Z" fill="${c}" fill-rule="evenodd"/>`,
    trending_up: (c) => T_(c, 'M3 17 L9 11 L13 15 L21 7 M15.5 7 H21 V12.5', 2.3),
    trending_down: (c) => T_(c, 'M3 7 L9 13 L13 9 L21 17 M15.5 17 H21 V11.5', 2.3),
    zoom_out_map: (c) => T_(c, 'M4 9 V4 H9 M4 4 L9.5 9.5 M20 9 V4 H15 M20 4 L14.5 9.5 M4 15 V20 H9 M4 20 L9.5 14.5 M20 15 V20 H15 M20 20 L14.5 14.5'),
    lock: (c) => `<path d="M7 10.5 V8 A5 5 0 0 1 17 8 V10.5 H17.5 C18.6 10.5 19.5 11.4 19.5 12.5 V19.5 C19.5 20.6 18.6 21.5 17.5 21.5 H6.5 C5.4 21.5 4.5 20.6 4.5 19.5 V12.5 C4.5 11.4 5.4 10.5 6.5 10.5 Z M9.3 10.5 H14.7 V8 A2.7 2.7 0 0 0 9.3 8 Z" fill="${c}" fill-rule="evenodd"/>`,
    photo_camera: (c) => T_(c, 'M4.5 7.5 H7.5 L9 5 H15 L16.5 7.5 H19.5 C20.3 7.5 21 8.2 21 9 V18 C21 18.8 20.3 19.5 19.5 19.5 H4.5 C3.7 19.5 3 18.8 3 18 V9 C3 8.2 3.7 7.5 4.5 7.5 Z M12 16.5 A3.3 3.3 0 1 0 12 9.9 A3.3 3.3 0 1 0 12 16.5 Z'),
    add_photo: (c) => T_(c, 'M13 4.5 H5.5 C4.4 4.5 3.5 5.4 3.5 6.5 V18.5 C3.5 19.6 4.4 20.5 5.5 20.5 H17.5 C18.6 20.5 19.5 19.6 19.5 18.5 V11 M6.5 17.5 L10 13.5 L12.5 16 L14.5 14 L17 17.5 M18.5 2.5 V8.5 M15.5 5.5 H21.5'),
    drag_indicator: (c) => [[9, 6], [15, 6], [9, 12], [15, 12], [9, 18], [15, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${c}"/>`).join(''),
    person_off: (c) => T_(c, 'M12 11 A3.5 3.5 0 1 0 12 4 A3.5 3.5 0 1 0 12 11 Z M5 20 C5 16.5 8 14.5 12 14.5 C16 14.5 19 16.5 19 20 M4 3.5 L20.5 20'),
    circle: (c) => `<circle cx="12" cy="12" r="8" fill="${c}"/>`,
  };
  /// Une icône de l'appli, de [taille] points, coin haut gauche en (x, y).
  const iconeApp = (nom, x, y, taille, couleur) => {
    if (!ICONES_APP[nom]) throw new Error(`iconeApp : « ${nom} » inconnue`);
    return `<g transform="translate(${x} ${y}) scale(${taille / 24})">${ICONES_APP[nom](couleur)}</g>`;
  };

  // Le jeu d'essai, pour que les schémas montrent les mêmes personnes que
  // les captures : photo, prénom, âge, ville, rencontres, note moyenne en
  // demi-points. Repris de lib/donnees/demonstration.dart.
  const GENS = {
    lou: { photo: 1, prenom: 'Lou M.', age: 24, ville: 'Vannes', fois: 9, note: 9 },
    emma: { photo: 2, prenom: 'Emma R.', age: 26, ville: 'Nantes', fois: 3, note: 8 },
    matteo: { photo: 3, prenom: 'Matteo B.', age: 29, ville: 'Rennes', fois: 11, note: 9 },
    chloe: { photo: 4, prenom: 'Chloé D.', age: 25, ville: 'Vannes', fois: 4, note: 7 },
    jade: { photo: 5, prenom: 'Jade L.', age: 27, ville: 'Lorient', fois: 6, note: 8 },
    ines: { photo: 6, prenom: 'Inès V.', age: 28, ville: 'Paris', fois: 2, note: 6 },
    gabriel: { photo: 7, prenom: 'Gabriel T.', age: 27, ville: 'Vannes', fois: 8, note: 10 },
    raphael: { photo: 8, prenom: 'Raphaël C.', age: 22, ville: 'Rennes', fois: 3, note: 6 },
    sami: { photo: 9, prenom: 'Sami K.', age: 30, ville: 'Nantes', fois: 5, note: 8 },
    noa: { photo: 10, prenom: 'Noa J.', age: 25, ville: 'Vannes', fois: 14, note: 10 },
    ibrahim: { photo: 11, prenom: 'Ibrahim D.', age: 24, ville: 'Vannes', fois: 10, note: 10 },
    enzo: { photo: 12, prenom: 'Enzo P.', age: 23, ville: 'Vannes', fois: 7, note: 8 },
    erwan: { photo: 13, prenom: 'Erwan G.', age: 22, ville: 'Auray', fois: 4, note: 7 },
    adam: { photo: 14, prenom: 'Adam Z.', age: 23, ville: 'Rochefort', fois: 6, note: 7 },
    kelyan: { photo: 15, prenom: 'Kelyan M.', age: 24, ville: 'Lorient', fois: 9, note: 9 },
    tom: { photo: 16, prenom: 'Tom L.', age: 22, ville: 'Vannes', fois: 5, note: 7 },
    malo: { photo: 17, prenom: 'Malo R.', age: 21, ville: 'Marseille', fois: 3, note: 7 },
    nathan: { photo: 18, prenom: 'Nathan B.', age: 23, ville: 'Lyon', fois: 2, note: 6 },
  };

  /// Une carte du répertoire, comme lib/widgets/carte_personne.dart : la
  /// photo pleine, « N fois » en haut, le prénom, les étoiles et la ville
  /// en bas sur un voile sombre.
  function cartePersonne(p, x, y, l, h, { premier = false } = {}) {
    const fois = p.fois === 1 ? t('1 fois', 'once') : t(`${p.fois} fois`, `${p.fois} times`);
    const k = Math.min(1, l / 110);
    return `${visage(p.photo, x, y, l, h, 14)}
  <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="14" fill="url(#voile)"/>
  <rect x="${x}" y="${y}" width="${l}" height="${h}" rx="14" fill="none" stroke="#FFFFFF" stroke-opacity="0.07"/>
  <rect x="${x + 8}" y="${y + 8}" width="${fois.length * 5.6 + 14}" height="17" rx="8.5" fill="${APP.fond}" fill-opacity="0.56"/>
  ${texte(x + 15, y + 20, fois, { taille: 9, couleur: '#E9DEFF', poids: 700 })}
  ${premier ? `<circle cx="${x + l - 17}" cy="${y + 16.5}" r="8.5" fill="${APP.or}"/>${icone('etoile', x + l - 22.5, y + 11, '#3A2606', 0.7)}` : ''}
  ${texte(x + 9, y + h - 34, p.prenom, { taille: 14 * k, couleur: '#FFFFFF', poids: 800 })}
  ${etoiles(x + 9, y + h - 20, p.note, { taille: 8.5 * k })}
  ${icone('epingle', x + 8, y + h - 14, '#C9BBE0', 0.55)}
  ${texte(x + 19, y + h - 7, p.ville, { taille: 8.5 * k, couleur: '#C9BBE0', poids: 600 })}`;
  }

  // ------------------------------------------------------------ la France
  // La vraie géométrie, lue dans assets/carte/france.bin comme le fait
  // l'application : le format FRA1, des couches d'anneaux (la côte, puis
  // les départements), chaque point sur deux entiers de seize bits au
  // 1/2000e de degré depuis (-6°, 41°). Tout schéma qui montre une carte
  // passe par ici : une côte dessinée à la main jurerait avec les autres.
  const FRANCE = (() => {
    const bin = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'assets', 'carte', 'france.bin'));
    const couches = [];
    let p = 8;
    const nc = bin.readUInt32LE(4);
    for (let c = 0; c < nc; c++) {
      const na = bin.readUInt32LE(p); p += 4;
      const anneaux = [];
      for (let a = 0; a < na; a++) {
        const n = bin.readUInt32LE(p); p += 4;
        const pts = [];
        for (let i = 0; i < n; i++, p += 4) pts.push([bin.readUInt16LE(p) / 2000 - 6, bin.readUInt16LE(p + 2) / 2000 + 41]);
        anneaux.push(pts);
      }
      couches.push(anneaux);
    }
    return { cote: couches[0], departements: couches[1] || [] };
  })();
  /// Coupe un anneau à un rectangle en degrés [ouest, sud, est, nord].
  function couperAnneau(pts, [o, s, e, n]) {
    const bords = [
      [(q) => q[0] >= o, (a, b) => { const k = (o - a[0]) / (b[0] - a[0]); return [o, a[1] + k * (b[1] - a[1])]; }],
      [(q) => q[0] <= e, (a, b) => { const k = (e - a[0]) / (b[0] - a[0]); return [e, a[1] + k * (b[1] - a[1])]; }],
      [(q) => q[1] >= s, (a, b) => { const k = (s - a[1]) / (b[1] - a[1]); return [a[0] + k * (b[0] - a[0]), s]; }],
      [(q) => q[1] <= n, (a, b) => { const k = (n - a[1]) / (b[1] - a[1]); return [a[0] + k * (b[0] - a[0]), n]; }],
    ];
    let sortie = pts;
    for (const [dedans, croise] of bords) {
      const entree = sortie;
      sortie = [];
      for (let i = 0; i < entree.length; i++) {
        const a = entree[(i + entree.length - 1) % entree.length], b = entree[i];
        if (dedans(b)) { if (!dedans(a)) sortie.push(croise(a, b)); sortie.push(b); }
        else if (dedans(a)) sortie.push(croise(a, b));
      }
      if (!sortie.length) break;
    }
    return sortie;
  }
  /// Allège un tracé, Douglas-Peucker, tolérance en degrés.
  function allegerAnneau(pts, tol) {
    if (pts.length < 4) return pts;
    const garde = new Uint8Array(pts.length);
    garde[0] = garde[pts.length - 1] = 1;
    const pile = [[0, pts.length - 1]];
    while (pile.length) {
      const [i, j] = pile.pop();
      const [ax, ay] = pts[i], [bx, by] = pts[j];
      const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy);
      let max = 0, k = -1;
      for (let m = i + 1; m < j; m++) {
        const d = l < 1e-9 ? Math.hypot(pts[m][0] - ax, pts[m][1] - ay)
          : Math.abs(dy * pts[m][0] - dx * pts[m][1] + bx * ay - by * ax) / l;
        if (d > max) { max = d; k = m; }
      }
      if (max > tol && k > 0) { garde[k] = 1; pile.push([i, k], [k, j]); }
    }
    return pts.filter((_, i) => garde[i]);
  }
  /// Une carte de la vraie France dans le cadre (x, y, l, h), cadrée sur
  /// la fenêtre [ouest, sud, est, nord] en degrés, sans déformation (la
  /// longitude est resserrée par le cosinus de la latitude moyenne, comme
  /// dans lib/widgets/plan_france.dart).
  ///
  /// Rend { terre, departements, proj } : deux chemins SVG prêts à poser,
  /// et proj(lon, lat) → [x, y] pour placer les villes au bon endroit.
  /// Le cadre n'est pas coupé ici : poser le résultat dans un clipPath.
  function france(x, y, l, h, fenetre = [-5.2, 46.2, -0.9, 48.95], { tolerance = null } = {}) {
    const [o, s, e, n] = fenetre;
    const cos = Math.cos((((s + n) / 2) * Math.PI) / 180);
    const lx = (e - o) * cos, ly = n - s;
    const k = Math.min(l / lx, h / ly);
    const dx = x + (l - lx * k) / 2, dy = y + (h - ly * k) / 2;
    const proj = (lon, lat) => [dx + (lon - o) * cos * k, dy + (n - lat) * k];
    const tol = tolerance ?? 0.9 / k; // moins d'un point d'écran
    const marge = [o - 0.3, s - 0.3, e + 0.3, n + 0.3];
    const chemin = (anneaux, ferme) => anneaux
      .map((a) => allegerAnneau(couperAnneau(a, marge), tol)).filter((a) => a.length > 2)
      .map((a) => 'M' + a.map((q) => proj(q[0], q[1]).map((v) => Math.round(v * 10) / 10).join(' ')).join('L') + (ferme ? 'Z' : '')).join('');
    return { terre: chemin(FRANCE.cote, true), departements: chemin(FRANCE.departements, false), proj };
  }

  /// Le logo de l'application, le vrai, arrondi comme une icône Android.
  const logo = (cx, cy, taille) => visage('logo', cx - taille / 2, cy - taille / 2, taille, taille, taille * 0.24);

  return {
    EN, LG, t, esc, id, svg, texte, entete, rubrique, paliers, fondu, visible, entre, glisse, carte, telephone, toucher,
    frappe, visage, etoiles, pastille, largeurPastille, bouton, barreNav, icone, ICONE, empreinte, logo, GENS, cartePersonne,
    france, FRANCE, iconeApp, ICONES_APP,
    MONO, SANS, FOND, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, FUCHSIA, VERT, OR, ROUGE, BLEU, APP,
  };
};

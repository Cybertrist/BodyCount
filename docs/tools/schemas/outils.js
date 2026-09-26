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
  function visible(cycle, de, a, douceur = 0.012) {
    const e = [[0, 0]];
    if (de > douceur) e.push([de - douceur, 0]);
    e.push([de, 1], [Math.min(a, 1), 1]);
    if (a + douceur < 1) e.push([a + douceur, 0], [1, 0]);
    else if (a < 1) e.push([1, 1]);
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
  <rect x="${x}" y="${y + 14}" width="3" height="${h - 28}" rx="1.5" fill="${accent}"/>
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
  function barreNav(S, actif = 'Fiches') {
    const y = S.y + S.h - 58, l = S.l - 20, x = S.x + 10;
    const items = [[t('Fiches', 'People'), 'Fiches'], [t('Stats', 'Stats'), 'Stats'], ['+', '+'], [t('Carte', 'Map'), 'Carte'], [t('Agenda', 'Agenda'), 'Agenda']];
    const pas = l / items.length;
    let s = `<rect x="${x}" y="${y}" width="${l}" height="46" rx="23" fill="${APP.surface}" stroke="${APP.bord}"/>`;
    items.forEach(([lib, cle], i) => {
      const cx = x + pas * i + pas / 2;
      if (cle === '+') {
        s += `<rect x="${cx - 17}" y="${y + 6}" width="34" height="34" rx="12" fill="url(#marque)"/>
        <path d="M${cx - 7} ${y + 23} h14 M${cx} ${y + 16} v14" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>`;
      } else {
        if (cle === actif) s += `<rect x="${cx - pas / 2 + 3}" y="${y + 7}" width="${pas - 6}" height="32" rx="16" fill="${APP.violet}" fill-opacity="0.22"/>`;
        s += texte(cx, y + 27.5, lib, { taille: 10, couleur: cle === actif ? APP.texte : APP.second, poids: cle === actif ? 700 : 500, ancre: 'middle' });
      }
    });
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
  const icone = (nom, x, y, couleur, echelle = 1) =>
    `<g transform="translate(${x} ${y}) scale(${echelle})">${ICONE[nom](couleur)}</g>`;

  // L'icône « fingerprint » de Material Design, en 24 x 24 (Apache 2.0).
  const EMPREINTE = 'M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z';
  /// L'empreinte, centrée sur (cx, cy), de [taille] points.
  const empreinte = (cx, cy, taille, couleur) =>
    `<path transform="translate(${cx - taille / 2} ${cy - taille / 2}) scale(${taille / 24})" fill="${couleur}" d="${EMPREINTE}"/>`;

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

  /// Le logo de l'application, le vrai, arrondi comme une icône Android.
  const logo = (cx, cy, taille) => visage('logo', cx - taille / 2, cy - taille / 2, taille, taille, taille * 0.24);

  return {
    EN, LG, t, esc, id, svg, texte, entete, rubrique, paliers, fondu, visible, entre, glisse, carte, telephone, toucher,
    frappe, visage, etoiles, pastille, largeurPastille, bouton, barreNav, icone, ICONE, empreinte, logo, GENS, cartePersonne,
    MONO, SANS, FOND, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, FUCHSIA, VERT, OR, ROUGE, BLEU, APP,
  };
};

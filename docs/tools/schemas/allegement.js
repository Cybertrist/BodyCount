// L'allègement d'une vidéo à l'import : Media3 la réencode sur l'encodeur
// du téléphone, et la version allégée n'entre au coffre que si elle gagne
// au moins un dixième.
//
// À gauche, l'écran « Photos et vidéos » d'Enzo pendant l'import de trois
// vidéos, tel que lib/ecrans/editeurs.dart le dessine : le message sous le
// titre, la barre qui court, la grille en trois colonnes, le bouton
// Ajouter. Au milieu, la vidéo en cours, avant et après, le Transformer qui
// avance, puis le poids face au seuil des 90 %. À droite, la règle de
// alleger() dans MainActivity.kt, dont le chemin s'éclaire pour chaque
// vidéo : une allégée gardée, une réencodée pour rien, une déjà légère.
module.exports = (O) => {
  const { t, id, svg, texte, entete, rubrique, fondu, visible, entre, telephone, toucher, visage, icone,
    APP, MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU } = O;
  const C = 36;
  const FIN = 0.975;
  // Les trois vidéos et leurs fenêtres dans le cycle.
  const A = { de: 0.02, lit: 0.035, enc: 0.06, cent: 0.33, juge: 0.345, entre: 0.375, a: 0.43 };
  const B = { de: 0.43, lit: 0.445, enc: 0.47, cent: 0.64, juge: 0.655, entre: 0.685, a: 0.72 };
  const L_ = { de: 0.72, lit: 0.735, juge: 0.75, entre: 0.78, a: 0.84 };
  const BILAN = 0.84;
  const FEN = [A, B, L_];

  let corps = entete(t('L’ALLÈGEMENT', 'THE SHRINKING'),
    t('Une vidéo filmée pour un grand écran, ramenée à ce qu’on regarde sur un téléphone. Seulement si ça vaut la peine.',
      'A video shot for a big screen, brought down to what you watch on a phone. Only when it is worth it.'));

  // Le visage d'Enzo, embarqué une fois, puis recadré à la demande.
  corps += `<g display="none">${visage(12, 0, 0, 1)}</g>`;
  /// Une image de la vidéo, qui couvre toujours tout son cadre : l'image
  /// est bornée pour ne jamais laisser voir le fond, en haut comme en bas.
  function cadre(x, y, l, h, { zoom = 1, fx = 0.5, fy = 0.4, rx = 10 } = {}) {
    const c = id('cadre');
    const cote = Math.max(l, h) * zoom;
    const ox = Math.min(x, Math.max(x + l - cote, x + l / 2 - cote * fx));
    const oy = Math.min(y, Math.max(y + h - cote, y + h / 2 - cote * fy));
    return `<clipPath id="${c}"><rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${rx}"/></clipPath>
    <g clip-path="url(#${c})"><use href="#visage12" xlink:href="#visage12" x="${ox.toFixed(1)}" y="${oy.toFixed(1)}" width="${cote.toFixed(1)}" height="${cote.toFixed(1)}"/></g>`;
  }
  const lecture = (cx, cy, r = 11) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#000000" fill-opacity="0.45" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="1.4"/>
    <path d="M${cx - r * 0.3} ${cy - r * 0.45} L${cx + r * 0.5} ${cy} L${cx - r * 0.3} ${cy + r * 0.45} Z" fill="#FFFFFF"/>`;
  // Trois cadrages, un par vidéo, pour qu'on les distingue.
  const PLANS = [{ zoom: 1.25, fx: 0.55, fy: 0.42 }, { zoom: 1.7, fx: 0.47, fy: 0.4 }, { zoom: 1.05, fx: 0.5, fy: 0.38 }];
  const DUREES = ['0:10', '0:24', '0:13'];

  // Les trois cas, avec leurs chiffres. Poids en Mo, débit en Mb/s.
  const CAS = [
    { c: VERT, source: [1080, 1920], debit: 16, poids: 20, sortie: 3, fr: 'filmée au téléphone', en: 'shot on the phone' },
    { c: OR, source: [1080, 1920], debit: 2.7, poids: 8, sortie: 7.6, fr: 'déjà compressée', en: 'already compressed' },
    { c: BLEU, source: [720, 1280], debit: 3, poids: 5, sortie: null, fr: 'reçue d’une messagerie', en: 'from a messaging app' },
  ];
  const EN_ = O.EN, FOND_ = O.FOND;
  const nombre = (x) => (EN_ ? String(x) : String(x).replace('.', ','));
  const mo = (x) => t(`${nombre(x)} Mo`, `${x} MB`);
  const pourcents = [0, 8, 17, 29, 41, 54, 66, 78, 89, 100];

  // --------------------------------------------------------- le téléphone
  // L'écran « Photos et vidéos » : titre centré, message d'import et barre
  // sous le titre, grille de trois colonnes au rapport 0,78, bouton Ajouter.
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';
  ecran += `<path d="M${SX + 26} ${SY + 38} l-6 6 l6 6" fill="none" stroke="${APP.texte}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(SX + SL / 2, SY + 49, t('Photos et vidéos', 'Photos and videos'), { taille: 17, couleur: APP.texte, poids: 700, ancre: 'middle' })}`;
  // Les messages de l'import, tels que l'écran les écrit.
  const msg = (de, a, s) => entre(C, de, a, texte(SX + SL / 2, SY + 78, s, { taille: 12, couleur: APP.second, ancre: 'middle' }), 0.003);
  FEN.forEach((f, i) => {
    ecran += msg(f.de, f.enc || f.a - 0.005, t(`Chiffrement de la vidéo, ${i + 1} sur 3…`, `Encrypting the video, ${i + 1} of 3…`));
    if (f.enc) {
      const pas = (f.cent - f.enc) / (pourcents.length - 1);
      pourcents.forEach((p, k) => {
        const de = f.enc + k * pas, a = k === pourcents.length - 1 ? f.a - 0.005 : de + pas;
        ecran += msg(de, a, t(`Allègement de la vidéo, ${p} %…`, `Shrinking the video, ${p}%…`));
      });
    }
  });
  // La barre qui court sous le message, le temps de l'import.
  ecran += entre(C, A.de, L_.a - 0.005, `<rect x="${SX}" y="${SY + 88}" width="${SL}" height="2" fill="${APP.bord}"/>
    <rect x="${SX}" y="${SY + 88}" height="2" width="80" fill="${APP.violet}">
      <animate attributeName="x" dur="1.4s" repeatCount="indefinite" values="${SX - 80};${SX + SL};${SX - 80}"/></rect>`, 0.003);
  // La grille : neuf médias déjà là, les trois vidéos arrivent au bout.
  const GX = SX + 18, GL = SL - 36, GAP = 8;
  const TL = (GL - 2 * GAP) / 3, TH = TL / 0.78;
  const tuile = (i) => [GX + (i % 3) * (TL + GAP), SY + 100 + Math.floor(i / 3) * (TH + GAP)];
  const ANCIENS = [
    { zoom: 1.1, fx: 0.5, fy: 0.4, etoile: true }, { zoom: 1.6, fx: 0.4, fy: 0.45 }, { zoom: 1.35, fx: 0.62, fy: 0.36, duree: '0:42' },
    { zoom: 2.1, fx: 0.5, fy: 0.5 }, { zoom: 1.2, fx: 0.35, fy: 0.3 }, { zoom: 1.8, fx: 0.6, fy: 0.55 },
    { zoom: 1.45, fx: 0.45, fy: 0.62, duree: '0:08' }, { zoom: 1.15, fx: 0.62, fy: 0.42 }, { zoom: 2.4, fx: 0.52, fy: 0.42 },
  ];
  const tuileMedia = (x, y, p, duree, etoile) => `${cadre(x, y, TL, TH, { ...p, rx: 14 })}
    ${duree ? lecture(x + TL / 2, y + TH / 2, 12) + texte(x + TL - 7, y + TH - 8, duree, { taille: 10, couleur: '#FFFFFF', poids: 700, ancre: 'end' }) : ''}
    ${etoile ? `<circle cx="${x + 15}" cy="${y + 15}" r="10" fill="${APP.vert}"/>${icone('etoile', x + 9.4, y + 9.4, '#12071F', 0.7)}` : ''}`;
  ANCIENS.forEach((p, i) => { ecran += tuileMedia(...tuile(i), p, p.duree, p.etoile); });
  FEN.forEach((f, i) => {
    const [x, y] = tuile(9 + i);
    // La place de la vidéo en cours, en attente, puis la vignette chiffrée.
    ecran += entre(C, f.de, f.entre, `<rect x="${x}" y="${y}" width="${TL}" height="${TH}" rx="14" fill="${APP.carte}" stroke="${APP.bord}" stroke-dasharray="4 4"/>
      <circle cx="${x + TL / 2}" cy="${y + TH / 2}" r="9" fill="none" stroke="${APP.violet}" stroke-width="2" stroke-dasharray="36 20">
        <animateTransform attributeName="transform" type="rotate" from="0 ${x + TL / 2} ${y + TH / 2}" to="360 ${x + TL / 2} ${y + TH / 2}" dur="0.9s" repeatCount="indefinite"/></circle>`, 0.003);
    ecran += entre(C, f.entre, 1, tuileMedia(x, y, PLANS[i], DUREES[i], false) +
      `<rect x="${x}" y="${y}" width="${TL}" height="${TH}" rx="14" fill="none" stroke="${CAS[i].c}" stroke-width="2" opacity="0">${visible(C, f.entre, f.entre + 0.05, 0.004)}</rect>`, 0.004);
  });
  // Le bouton Ajouter, touché au départ.
  const BX = SX + SL - 128, BY = SY + SH - 48;
  ecran += `<rect x="${BX}" y="${BY}" width="112" height="38" rx="14" fill="${APP.violet}"/>
    ${icone('photo', BX + 18, BY + 11, '#FFFFFF')}
    ${texte(BX + 44, BY + 24, t('Ajouter', 'Add'), { taille: 14, couleur: '#FFFFFF', poids: 700 })}
    ${toucher(BX + 56, BY + 19, C, 0.012)}`;
  corps += T.ecran(ecran);

  // ------------------------------------------------------ la vidéo en cours
  const MX = 390, ML = 490, MY = 122, MH = 314;
  corps += rubrique(MX, 108, t('LA VIDÉO EN COURS', 'THE VIDEO IN PROGRESS'));
  corps += `<rect x="${MX}" y="${MY}" width="${ML}" height="${MH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  // Tout est à la même échelle : 1920 points de haut font 200 points ici.
  const K = 200 / 1920;
  const SRCX = MX + 22, HAUT = MY + 54, HVID = 200;
  const OW = 720 * K, OH = 1280 * K, OX = MX + ML - 22 - OW, OY = HAUT + (HVID - OH) / 2;
  const BOITE = { x: MX + 190, y: HAUT + 50, l: 150, h: 100 };
  const MILIEU = BOITE.y + 50;
  const etiquettes = (x, ancre, l1, l2) =>
    texte(x, MY + MH - 36, l1, { taille: 13, couleur: TITRE, police: MONO, poids: 700, ancre }) +
    texte(x, MY + MH - 16, l2, { taille: 12, couleur: TEXTE, police: MONO, ancre });
  const fleche = (x1, x2, c = FIL) => `<path d="M${x1} ${MILIEU} H${x2} M${x2 - 6} ${MILIEU - 6} l6 6 l-6 6" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  CAS.forEach((cas, i) => {
    const f = FEN[i];
    const [w, h] = cas.source;
    const lw = w * K, lh = h * K, sy = HAUT + (HVID - lh) / 2;
    // L'étiquette du cas, en pastille.
    const lib = t(cas.fr, cas.en);
    const pl = Math.round(lib.length * 6.6 + 26);
    let s = `<rect x="${SRCX}" y="${MY + 16}" width="${pl}" height="24" rx="12" fill="${cas.c}" fill-opacity="0.12" stroke="${cas.c}" stroke-opacity="0.5"/>
      ${texte(SRCX + pl / 2, MY + 32.5, lib, { taille: 12, couleur: cas.c, poids: 700, ancre: 'middle' })}`;
    // L'original.
    s += cadre(SRCX, sy, lw, lh, { ...PLANS[i], rx: 10 });
    s += `<rect x="${SRCX}" y="${sy}" width="${lw}" height="${lh}" rx="10" fill="none" stroke="${cas.c}" stroke-opacity="0.75" stroke-width="1.5"/>`;
    s += etiquettes(SRCX, 'start', `${w} x ${h}`, `${nombre(cas.debit)} Mb/s · ${mo(cas.poids)}`);
    // Le Transformer.
    s += `<rect x="${BOITE.x}" y="${BOITE.y}" width="${BOITE.l}" height="${BOITE.h}" rx="12" fill="#0F151E" stroke="${f.enc ? cas.c : FIL}" stroke-opacity="${f.enc ? 0.7 : 1}"/>`;
    s += texte(BOITE.x + BOITE.l / 2, BOITE.y + 30, 'Media3', { taille: 14, couleur: f.enc ? TITRE : DISCRET, police: MONO, poids: 700, ancre: 'middle' });
    s += texte(BOITE.x + BOITE.l / 2, BOITE.y + 48, 'Transformer', { taille: 12, couleur: f.enc ? TEXTE : DISCRET, police: MONO, ancre: 'middle' });
    s += fleche(SRCX + lw + 10, BOITE.x - 8);
    if (f.enc) {
      const bl = BOITE.l - 32;
      s += `<rect x="${BOITE.x + 16}" y="${BOITE.y + 62}" width="${bl}" height="6" rx="3" fill="${FIL}"/>
        <rect x="${BOITE.x + 16}" y="${BOITE.y + 62}" height="6" rx="3" width="0" fill="${cas.c}">${fondu('width', C, [[0, 0], [f.enc, 0], [f.cent, bl], [1, bl]])}</rect>`;
      const pas = (f.cent - f.enc) / (pourcents.length - 1);
      pourcents.forEach((p, k) => {
        const de = f.enc + k * pas, a = k === pourcents.length - 1 ? f.a : de + pas;
        s += entre(C, de, a, texte(BOITE.x + BOITE.l / 2, BOITE.y + 88, `${p} %`, { taille: 12, couleur: cas.c, police: MONO, poids: 700, ancre: 'middle' }), 0.002);
      });
      s += fleche(BOITE.x + BOITE.l + 8, OX - 10);
      // La sortie : le cadre en pointillé, puis l'image entière qui se
      // précise au rythme de l'avancement, balayée de haut en bas.
      s += `<rect x="${OX}" y="${OY}" width="${OW}" height="${OH}" rx="10" fill="#0F151E" stroke="${FIL}" stroke-dasharray="4 4"/>
        <g opacity="0">${fondu('opacity', C, [[0, 0], [f.enc, 0], [f.enc + 0.01, 0.25], [f.cent, 1], [1, 1]])}${cadre(OX, OY, OW, OH, { ...PLANS[i], rx: 10 })}</g>
        <rect x="${OX}" y="${OY}" width="${OW}" height="2" fill="${cas.c}" opacity="0">
          ${fondu('y', C, [[0, OY], [f.enc, OY], [f.cent, OY + OH - 2], [1, OY + OH - 2]])}
          ${visible(C, f.enc, f.cent, 0.004)}</rect>
        <rect x="${OX}" y="${OY}" width="${OW}" height="${OH}" rx="10" fill="none" stroke="${cas.c}" stroke-width="1.5" opacity="0">${visible(C, f.cent, 1, 0.004)}</rect>`;
      s += etiquettes(OX + OW, 'end', '720 x 1280', `H.264 · 2${EN_ ? '.' : ','}5 Mb/s`);
      // Refusée : la sortie est voilée, barrée, puis dite effacée.
      if (cas.sortie > cas.poids * 0.9) {
        s += entre(C, f.juge, f.a, `<rect x="${OX}" y="${OY}" width="${OW}" height="${OH}" rx="10" fill="${FOND_}" fill-opacity="0.74"/>
          ${icone('croix', OX + OW / 2 - 14, OY + OH / 2 - 26, ROUGE, 1.75)}
          ${texte(OX + OW / 2, OY + OH / 2 + 22, t('effacée', 'deleted'), { taille: 12, couleur: ROUGE, police: MONO, poids: 700, ancre: 'middle' })}`, 0.004);
      }
    } else {
      // Déjà légère : rien ne passe par l'encodeur, l'original fait le tour.
      s += texte(BOITE.x + BOITE.l / 2, BOITE.y + 78, t('pas lancé', 'not started'), { taille: 12, couleur: DISCRET, police: MONO, ancre: 'middle' });
      const x1 = SRCX + lw / 2, x2 = OX + OW / 2, yb = HAUT + HVID - 8;
      s += entre(C, f.lit, f.a, `<path d="M${x1} ${sy + lh + 6} C ${x1 + 40} ${yb + 24}, ${x2 - 40} ${yb + 24}, ${x2} ${OY + OH + 6}" fill="none" stroke="${cas.c}" stroke-width="1.8" stroke-dasharray="5 5"/>
        ${texte((x1 + x2) / 2, yb + 42, t('entre telle quelle', 'goes in as it is'), { taille: 13, couleur: cas.c, poids: 700, ancre: 'middle' })}`, 0.004);
      s += entre(C, f.entre, f.a, cadre(OX, OY, OW, OH, { ...PLANS[i], rx: 10 }) +
        `<rect x="${OX}" y="${OY}" width="${OW}" height="${OH}" rx="10" fill="none" stroke="${cas.c}" stroke-width="1.5"/>` +
        etiquettes(OX + OW, 'end', '720 x 1280', `3 Mb/s · ${mo(5)}`), 0.004);
    }
    corps += entre(C, f.de, i === 2 ? BILAN : f.a, s, 0.006);
  });

  // ----------------------------------------------------- le poids, au seuil
  const WY = 466, WH = 124;
  const PX = MX + 22, PL = 260, px = PL / 20;
  corps += rubrique(MX, 454, t('LE POIDS, FACE AU SEUIL', 'THE SIZE, AGAINST THE LINE'));
  corps += `<rect x="${MX}" y="${WY}" width="${ML}" height="${WH}" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const R1 = WY + 34, R2 = WY + 78; // le haut des deux barres
  CAS.forEach((cas, i) => {
    const f = FEN[i];
    let s = `${texte(PX, R1 - 8, t('l’original', 'the original'), { taille: 12, couleur: TEXTE })}
      <rect x="${PX}" y="${R1}" width="${PL}" height="10" rx="5" fill="${FIL}" fill-opacity="0.5"/>
      <rect x="${PX}" y="${R1}" width="${cas.poids * px}" height="10" rx="5" fill="${VIOLET}" fill-opacity="0.8"/>
      ${texte(PX + cas.poids * px + 8, R1 + 9.5, mo(cas.poids), { taille: 12, couleur: TITRE, police: MONO, poids: 700 })}`;
    if (cas.sortie) {
      const seuil = cas.poids * 0.9;
      const xs = PX + seuil * px, final = cas.sortie * px;
      const garde = cas.sortie < seuil;
      s += `${texte(PX, R2 - 8, t('l’allégée', 'the shrunk one'), { taille: 12, couleur: TEXTE })}
        <rect x="${PX}" y="${R2}" width="${PL}" height="10" rx="5" fill="${FIL}" fill-opacity="0.5"/>
        <rect x="${PX}" y="${R2}" height="10" rx="5" width="0" fill="${cas.c}">${fondu('width', C, [[0, 0], [f.enc, 0], [f.cent, final], [1, final]])}</rect>
        <line x1="${xs}" y1="${R1 - 4}" x2="${xs}" y2="${R2 + 16}" stroke="${ROUGE}" stroke-width="1.6" stroke-dasharray="3 3"/>
        ${texte(xs, WY + WH - 12, t(`seuil 90 % : ${nombre(+seuil.toFixed(1))} Mo`, `90% line: ${+seuil.toFixed(1)} MB`), { taille: 12, couleur: ROUGE, police: MONO, ancre: 'middle' })}`;
      s += entre(C, f.juge, f.a, texte(PX + final + 8, R2 + 9.5, mo(cas.sortie), { taille: 12, couleur: cas.c, police: MONO, poids: 700 }), 0.004);
      s += entre(C, f.juge, f.a,
        texte(MX + ML - 22, R1 + 12, garde ? t('gagne 85 %', 'saves 85%') : t('gagne 5 %', 'saves 5%'), { taille: 16, couleur: garde ? VERT : OR, poids: 800, ancre: 'end' }) +
        texte(MX + ML - 22, R1 + 34, garde ? t('l’allégée est gardée', 'the shrunk one is kept') : t('pas assez : l’original reste', 'not enough: the original stays'), { taille: 12, couleur: garde ? VERT : OR, poids: 700, ancre: 'end' }), 0.004);
    } else {
      s += texte(PX, R2 - 4, t('720 sur le petit côté, 3 Mb/s : sous les deux limites.', '720 on the short side, 3 Mb/s: under both limits.'), { taille: 12, couleur: BLEU, poids: 700 });
      s += texte(PX, R2 + 16, t('Réencoder ne ferait que l’abîmer.', 'Re-encoding would only damage it.'), { taille: 12, couleur: TEXTE });
    }
    corps += entre(C, f.de, i === 2 ? BILAN : f.a, s, 0.006);
  });

  // Le bilan des trois, à la place de la vidéo en cours et des poids.
  {
    let s = `<rect x="${MX + 1}" y="${MY + 1}" width="${ML - 2}" height="${MH - 2}" rx="14" fill="${CARTE}"/>
      ${texte(MX + 22, MY + 34, t('Ce qui est entré au coffre', 'What went into the vault'), { taille: 15, couleur: TITRE, poids: 700 })}`;
    const lignes = [
      [0, t('20 Mo filmés', '20 MB shot'), t('l’allégée, 3 Mo', 'the shrunk one, 3 MB'), t('l’original effacé', 'original deleted'), VERT],
      [1, t('8 Mo compressés', '8 MB compressed'), t('l’original, 8 Mo', 'the original, 8 MB'), t('l’allégée effacée', 'shrunk one deleted'), OR],
      [2, t('5 Mo reçus', '5 MB received'), t('l’original, 5 Mo', 'the original, 5 MB'), t('rien de réencodé', 'nothing re-encoded'), BLEU],
    ];
    lignes.forEach(([i, avant, apres, note, c], k) => {
      const y = MY + 54 + k * 82;
      s += `<rect x="${MX + 20}" y="${y}" width="${ML - 40}" height="72" rx="12" fill="${c}" fill-opacity="0.06" stroke="${c}" stroke-opacity="0.45"/>
        ${cadre(MX + 34, y + 10, 52, 52, { ...PLANS[i], rx: 10 })}
        ${lecture(MX + 60, y + 36, 10)}
        ${texte(MX + 102, y + 32, avant, { taille: 14, couleur: TITRE, poids: 700 })}
        ${texte(MX + 102, y + 52, note, { taille: 12, couleur: TEXTE })}
        <path d="M${MX + 262} ${y + 36} H${MX + 290} M${MX + 284} ${y + 30} l6 6 l-6 6" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        ${icone('cadenas', MX + 304, y + 27, c, 1.1)}
        ${texte(MX + 330, y + 41, apres, { taille: 13, couleur: c, poids: 700 })}`;
    });
    s += `<rect x="${MX + 1}" y="${WY + 1}" width="${ML - 2}" height="${WH - 2}" rx="14" fill="${CARTE}"/>
      ${texte(MX + 22, WY + 48, t('33 Mo choisis, 16 Mo au coffre.', '33 MB picked, 16 MB in the vault.'), { taille: 18, couleur: TITRE, poids: 800 })}
      ${texte(MX + 22, WY + 76, t('Chaque vidéo y entre chiffrée par morceaux, allégée ou non.', 'Every video goes in chunk-encrypted, shrunk or not.'), { taille: 12.5 })}`;
    corps += entre(C, BILAN, FIN, s, 0.006);
  }

  // ----------------------------------------------------------- la règle
  // Cinq cartes de même hauteur, qui remplissent la colonne de 122 à 590.
  const RX = 904, RL = 316, RH = 88, RG = 7;
  const ry = (k) => 122 + k * (RH + RG);
  corps += rubrique(RX, 108, t('LA RÈGLE, VIDÉO PAR VIDÉO', 'THE RULE, VIDEO BY VIDEO'));
  const fond = (y) => `<rect x="${RX}" y="${y}" width="${RL}" height="${RH}" rx="13" fill="${CARTE}" stroke="${BORD}"/>`;
  const lignes = (y, l1, l2, c1 = TEXTE, g1 = 400) =>
    texte(RX + 18, y + 55, l1, { taille: 12, couleur: c1, poids: g1 }) + texte(RX + 18, y + 72, l2, { taille: 12 });
  const etapes = [
    { titre: t('Déjà légère ?', 'Already light?'),
      l1: t('720 au plus sur le petit côté', '720 or less on the short side'), l2: t('et 4 Mb/s au plus : on n’y touche pas.', 'and 4 Mb/s at most: left alone.'),
      cas: [[A, VERT, t('non', 'no')], [B, OR, t('non', 'no')], [L_, BLEU, t('oui', 'yes')]] },
    { titre: t('Media3 réencode', 'Media3 re-encodes'),
      l1: t('H.264, 720 sur le petit côté, 2,5 Mb/s,', 'H.264, 720 on the short side, 2.5 Mb/s,'), l2: t('le son intact, sur l’encodeur du téléphone.', 'sound intact, on the phone’s encoder.'),
      cas: [[A, VERT, ''], [B, OR, '']] },
    { titre: t('Gagne au moins 10 % ?', 'Saves at least 10%?'),
      l1: t('Moins de 90 % du poids d’origine,', 'Under 90% of the original size,'), l2: t('sinon réencoder n’a rien gagné.', 'or re-encoding gained nothing.'),
      cas: [[A, VERT, t('oui', 'yes')], [B, OR, t('non', 'no')]] },
  ];
  etapes.forEach((e, k) => {
    const y = ry(k);
    corps += `${fond(y)}
      <circle cx="${RX + 28}" cy="${y + 26}" r="12" fill="${FIL}"/>
      ${texte(RX + 28, y + 30.5, String(k + 1), { taille: 12.5, couleur: TITRE, police: MONO, poids: 700, ancre: 'middle' })}
      ${texte(RX + 50, y + 31, e.titre, { taille: 14, couleur: TITRE, poids: 700 })}
      ${lignes(y, e.l1, e.l2)}`;
    e.cas.forEach(([f, c, rep]) => {
      const de = k === 0 ? f.lit : k === 1 ? f.enc : f.juge;
      corps += `<rect x="${RX}" y="${y}" width="${RL}" height="${RH}" rx="13" fill="${c}" fill-opacity="0.05" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, de, f.a, 0.004)}</rect>`;
      if (rep) corps += entre(C, de, f.a, `<rect x="${RX + RL - 58}" y="${y + 13}" width="42" height="24" rx="12" fill="${c}" fill-opacity="0.15" stroke="${c}" stroke-opacity="0.6"/>
        ${texte(RX + RL - 37, y + 29.5, rep, { taille: 12, couleur: c, poids: 700, ancre: 'middle' })}`, 0.004);
    });
  });
  // L'issue : ce qui entre au coffre.
  {
    const y = ry(3);
    corps += `${fond(y)}
      ${icone('cadenas', RX + 19, y + 17, ACCENT, 1.1)}
      ${texte(RX + 50, y + 31, t('Ce qui entre au coffre', 'What enters the vault'), { taille: 14, couleur: TITRE, poids: 700 })}`;
    const issues = [
      [A, VERT, t('L’allégée, 3 Mo.', 'The shrunk one, 3 MB.'), t('L’original est effacé du cache.', 'The original is deleted from the cache.')],
      [B, OR, t('L’original, 8 Mo.', 'The original, 8 MB.'), t('L’allégée, 7,6 Mo, est effacée.', 'The shrunk one, 7.6 MB, is deleted.')],
      [L_, BLEU, t('L’original, 5 Mo.', 'The original, 5 MB.'), t('Rien n’est passé par l’encodeur.', 'Nothing went through the encoder.')],
    ];
    issues.forEach(([f, c, l1, l2]) => {
      corps += `<rect x="${RX}" y="${y}" width="${RL}" height="${RH}" rx="13" fill="${c}" fill-opacity="0.05" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, f.entre - 0.02, f.a, 0.004)}</rect>`;
      corps += entre(C, f.entre - 0.02, f.a, lignes(y, l1, l2, c, 700), 0.004);
    });
    corps += entre(C, 0, A.entre - 0.02, lignes(y, t('Toujours chiffrée par morceaux,', 'Always chunk-encrypted,'), t('comme le montre le schéma du flux.', 'as the stream diagram shows.'), DISCRET), 0.004);
    corps += entre(C, BILAN, 1, lignes(y, t('Une par une, la plus légère des deux,', 'One by one, the lighter of the two,'), t('pourvu qu’elle le soit assez.', 'provided it is light enough.')), 0.004);
  }
  // Si l'encodeur échoue.
  {
    const y = ry(4);
    corps += `${fond(y)}
      ${icone('croix', RX + 20, y + 18, ROUGE, 0.95)}
      ${texte(RX + 50, y + 31, t('Si l’encodeur échoue', 'If the encoder fails'), { taille: 14, couleur: TITRE, poids: 700 })}
      ${lignes(y, t('Sa sortie est effacée, l’original entre', 'Its output is deleted, the original'), t('au coffre et l’import continue.', 'goes in and the import carries on.'))}`;
  }

  // ------------------------------------------------------ cartes du bas
  // Pas de liseré : une icône et un titre suffisent à les distinguer.
  const bas = [
    ['fichier', VIOLET, t('Pourquoi alléger', 'Why shrink'),
      t('Un téléphone filme en 4K à 50 Mb/s :', 'A phone films in 4K at 50 Mb/s:'), t('le coffre et les sauvegardes enflent.', 'kept as is, vault and backups swell.')],
    ['oeil', ACCENT, t('Lue avant d’être touchée', 'Read before it is touched'),
      t('La durée et la vignette sont lues', 'Length and thumbnail are read'), t('sur l’original, encore en clair.', 'from the original, in the clear.')],
    ['cadenas', OR, t('Le verrou attend', 'The lock waits'),
      t('Pendant l’import, personne ne touche', 'Nobody touches the screen during'), t('l’écran : le délai ne coupe rien.', 'the import: the delay cuts nothing.')],
  ];
  bas.forEach(([ic, c, titre, l1, l2], i) => {
    const x = 390 + i * 282, y = 608;
    corps += `<rect x="${x}" y="${y}" width="266" height="92" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${icone(ic, x + 18, y + 17, c, 1)}
      ${texte(x + 44, y + 30, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 18, y + 56, l1, { taille: 12 })}
      ${texte(x + 18, y + 74, l2, { taille: 12 })}`;
  });

  svg('allegement.svg', 1280, 720, corps, t(
    'L’allègement d’une vidéo à l’import. Dans la galerie d’Enzo, trois vidéos sont ajoutées, et l’écran dit « Chiffrement de la vidéo, 1 sur 3 », puis « Allègement de la vidéo » avec son pourcentage. La première, filmée au téléphone en 1080 x 1920 à 16 Mb/s, pèse 20 Mo : Media3 la réencode sur l’encodeur du téléphone, en H.264, 720 points sur le petit côté, 2,5 Mb/s, le son tel quel. Elle ressort à 3 Mo, sous le seuil de 90 % : l’allégée entre au coffre et l’original est effacé. La deuxième, déjà compressée à 2,7 Mb/s, pèse 8 Mo ; réencodée, elle en fait encore 7,6, au-dessus du seuil de 7,2 : l’allégée est effacée et l’original entre. La troisième, 720 x 1280 à 3 Mb/s, est déjà sous les deux limites, 720 points et 4 Mb/s : elle entre sans passer par l’encodeur. Si l’encodeur échoue, sa sortie est effacée et l’original entre. Au total, 33 Mo choisis, 16 Mo au coffre, chaque vidéo chiffrée par morceaux.',
    'Shrinking a video on import. In Enzo’s gallery, three videos are added, and the screen says “Encrypting the video, 1 of 3”, then “Shrinking the video” with its percentage. The first, shot on the phone at 1080 x 1920 and 16 Mb/s, weighs 20 MB: Media3 re-encodes it on the phone encoder, in H.264, 720 points on the short side, 2.5 Mb/s, sound as is. It comes out at 3 MB, under the 90% line: the shrunk one enters the vault and the original is deleted. The second, already compressed at 2.7 Mb/s, weighs 8 MB; re-encoded, it still takes 7.6, above the 7.2 line: the shrunk one is deleted and the original goes in. The third, 720 x 1280 at 3 Mb/s, is already under both limits, 720 points and 4 Mb/s: it goes in without touching the encoder. If the encoder fails, its output is deleted and the original goes in. In all, 33 MB picked, 16 MB in the vault, every video encrypted in chunks.'));
};

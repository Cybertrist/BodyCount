// L'allègement d'une vidéo à l'import : Media3 la réencode sur l'encodeur
// du téléphone, et la version allégée n'entre au coffre que si elle gagne
// au moins un dixième.
//
// À gauche, la galerie d'Enzo pendant l'import de trois vidéos, avec les
// vrais messages de lib/ecrans/editeurs.dart. Au milieu, la vidéo en
// cours : son cadre avant et après, le Transformer qui avance, le poids
// face au seuil des 90 %. À droite, la règle de alleger() dans
// MainActivity.kt, dont le chemin s'éclaire pour chaque vidéo : une
// allégée gardée, une réencodée pour rien, une déjà légère.
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

  let corps = entete(t('L’ALLÈGEMENT', 'THE SHRINKING'),
    t('Une vidéo filmée pour un grand écran, ramenée à ce qu’on regarde sur un téléphone. Seulement si ça vaut la peine.',
      'A video shot for a big screen, brought down to what you watch on a phone. Only when it is worth it.'));

  // Le visage d'Enzo, embarqué une fois, puis recadré à la demande.
  corps += `<g display="none">${visage(12, 0, 0, 1)}</g>`;
  function cadre(x, y, l, h, { zoom = 1, fx = 0.5, fy = 0.3, rx = 12 } = {}) {
    const c = id('cadre');
    const cote = Math.max(l, h) * zoom;
    return `<clipPath id="${c}"><rect x="${x}" y="${y}" width="${l}" height="${h}" rx="${rx}"/></clipPath>
    <g clip-path="url(#${c})"><rect x="${x}" y="${y}" width="${l}" height="${h}" fill="${APP.carte}"/>
      <use href="#visage12" xlink:href="#visage12" x="${x + l / 2 - cote * fx}" y="${y + h * 0.4 - cote * fy}" width="${cote}" height="${cote}"/></g>`;
  }
  const lecture = (cx, cy, r = 11) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#000000" fill-opacity="0.45" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="1.4"/>
    <path d="M${cx - r * 0.3} ${cy - r * 0.45} L${cx + r * 0.5} ${cy} L${cx - r * 0.3} ${cy + r * 0.45} Z" fill="#FFFFFF"/>`;
  // Trois cadrages, un par vidéo, pour qu'on les distingue.
  const PLANS = [{ zoom: 1.3, fx: 0.58, fy: 0.24 }, { zoom: 1.9, fx: 0.46, fy: 0.34 }, { zoom: 1.1, fx: 0.5, fy: 0.2 }];
  const DUREES = ['0:10', '0:24', '0:13'];
  const vignette = (x, y, s, i) => cadre(x, y, s, s, { ...PLANS[i], rx: 10 }) + lecture(x + s / 2, y + s / 2 - 4, s * 0.17) +
    texte(x + s - 6, y + s - 6, DUREES[i], { taille: 9, couleur: '#FFFFFF', poids: 700, ancre: 'end' });

  // Les trois cas, avec leurs chiffres. Poids en Mo, débit en Mb/s.
  const CAS = [
    { c: VERT, source: [1080, 1920], debit: 16, poids: 20, sortie: 3, fr: 'filmée au téléphone', en: 'shot on the phone' },
    { c: OR, source: [1080, 1920], debit: 2.7, poids: 8, sortie: 7.6, fr: 'déjà compressée', en: 'already compressed' },
    { c: BLEU, source: [720, 1280], debit: 3, poids: 5, sortie: null, fr: 'reçue d’une messagerie', en: 'received from a messaging app' },
  ];
  const FEN = [A, B, L_];
  const EN_ = O.EN, FOND_ = O.FOND;
  const nombre = (x) => (EN_ ? String(x) : String(x).replace('.', ','));
  const mo = (x) => t(`${nombre(x)} Mo`, `${x} MB`);

  // --------------------------------------------------------- le téléphone
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  let ecran = '';
  const TG = (SL - 40) / 3;
  const tuile = (i) => [SX + 12 + (i % 3) * (TG + 8), SY + 112 + Math.floor(i / 3) * (TG + 8)];
  ecran += `<path d="M${SX + 26} ${SY + 38} l-6 6 l6 6" fill="none" stroke="${APP.texte}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${texte(SX + 44, SY + 50, t('Photos et vidéos', 'Photos and videos'), { taille: 17, couleur: APP.texte, poids: 700 })}
    ${cadre(...tuile(0), TG, TG, { rx: 12 })}`;
  // Les messages de l'import, tels que l'écran les écrit.
  const msg = (de, a, fr, en) => entre(C, de, a, texte(SX + 16, SY + 82, t(fr, en), { taille: 11.5, couleur: APP.second }), 0.003);
  const pourcents = [0, 8, 17, 29, 41, 54, 66, 78, 89, 100];
  FEN.forEach((f, i) => {
    const quoi = t(`Chiffrement de la vidéo, ${i + 1} sur 3…`, `Encrypting the video, ${i + 1} of 3…`);
    ecran += msg(f.de, f.enc || f.a - 0.005, quoi, quoi);
    if (f.enc) {
      const pas = (f.cent - f.enc) / (pourcents.length - 1);
      pourcents.forEach((p, k) => {
        const de = f.enc + k * pas, a = k === pourcents.length - 1 ? f.a - 0.005 : de + pas;
        ecran += msg(de, a, `Allègement de la vidéo, ${p} %…`, `Shrinking the video, ${p}%…`);
      });
    }
    ecran += entre(C, f.entre, 1, vignette(...tuile(i + 1), TG, i), 0.004);
  });
  ecran += entre(C, A.de, L_.a - 0.005, `<rect x="${SX + 16}" y="${SY + 92}" width="${SL - 32}" height="3" rx="1.5" fill="${APP.bord}"/>
    <rect x="${SX + 16}" y="${SY + 92}" height="3" rx="1.5" width="60" fill="${APP.violet}">
      <animate attributeName="x" dur="1.4s" repeatCount="indefinite" values="${SX + 16};${SX + SL - 76};${SX + 16}"/></rect>`, 0.003);
  // Le bouton Ajouter, grisé pendant l'import.
  ecran += `<rect x="${SX + SL - 118}" y="${SY + SH - 70}" width="102" height="46" rx="16" fill="${APP.violet}">
      ${fondu('fill-opacity', C, [[0, 1], [A.de, 1], [A.de + 0.004, 0.35], [L_.a - 0.005, 0.35], [L_.a, 1], [1, 1]])}</rect>
    ${icone('photo', SX + SL - 104, SY + SH - 55, '#FFFFFF')}
    ${texte(SX + SL - 82, SY + SH - 42, t('Ajouter', 'Add'), { taille: 13, couleur: '#FFFFFF', poids: 700 })}
    ${toucher(SX + SL - 67, SY + SH - 47, C, 0.012)}`;
  // Le bilan, en bas de la galerie.
  ecran += entre(C, BILAN, FIN, `<rect x="${SX + 10}" y="${SY + SH - 130}" width="${SL - 20}" height="44" rx="10" fill="#2E2A3A"/>
    ${texte(SX + 24, SY + SH - 104, t('3 vidéos : 33 Mo choisis, 16 Mo au coffre.', '3 videos: 33 MB picked, 16 MB in the vault.'), { taille: 11.5, couleur: APP.texte })}`, 0.004);
  corps += T.ecran(ecran);

  // ------------------------------------------------------ la vidéo en cours
  const MX = 400, ML = 470;
  corps += rubrique(MX, 108, t('LA VIDÉO EN COURS', 'THE VIDEO IN PROGRESS'));
  corps += `<rect x="${MX}" y="122" width="${ML}" height="282" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  // Les cadres à l'échelle : 1080 x 1920 ramené à 0,11.
  const K = 0.11;
  const SRCX = MX + 22, SRCY = 142;
  const OUTX = MX + ML - 22 - 720 * K, BOITE = { x: MX + 168, y: 196, l: 132, h: 96 };
  CAS.forEach((cas, i) => {
    const f = FEN[i];
    const [w, h] = cas.source;
    const lw = w * K, lh = h * K;
    let s = cadre(SRCX, SRCY, lw, lh, { ...PLANS[i], rx: 8 });
    s += `<rect x="${SRCX}" y="${SRCY}" width="${lw}" height="${lh}" rx="8" fill="none" stroke="${cas.c}" stroke-opacity="0.7"/>`;
    s += texte(SRCX, SRCY + 234, `${w} x ${h}`, { taille: 12.5, couleur: TITRE, police: MONO, poids: 700 });
    s += texte(SRCX, SRCY + 252, `${nombre(cas.debit)} Mb/s · ${mo(cas.poids)}`, { taille: 11.5, couleur: TEXTE, police: MONO });
    s += texte(SRCX + lw + 16, SRCY + 12, t(cas.fr, cas.en), { taille: 11.5, couleur: cas.c, poids: 700 });
    // Le Transformer.
    s += `<rect x="${BOITE.x}" y="${BOITE.y}" width="${BOITE.l}" height="${BOITE.h}" rx="12" fill="#0F151E" stroke="${f.enc ? cas.c : FIL}" stroke-opacity="${f.enc ? 0.7 : 1}"/>`;
    s += texte(BOITE.x + BOITE.l / 2, BOITE.y + 26, 'Media3', { taille: 13, couleur: f.enc ? TITRE : DISCRET, police: MONO, poids: 700, ancre: 'middle' });
    s += texte(BOITE.x + BOITE.l / 2, BOITE.y + 43, 'Transformer', { taille: 11, couleur: f.enc ? TEXTE : DISCRET, police: MONO, ancre: 'middle' });
    // Les flèches.
    s += `<path d="M${SRCX + lw + 8} ${BOITE.y + 48} H${BOITE.x - 6} M${BOITE.x - 12} ${BOITE.y + 42} l6 6 l-6 6" fill="none" stroke="${FIL}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (f.enc) {
      const pl = BOITE.l - 28;
      s += `<rect x="${BOITE.x + 14}" y="${BOITE.y + 60}" width="${pl}" height="6" rx="3" fill="${FIL}"/>
        <rect x="${BOITE.x + 14}" y="${BOITE.y + 60}" height="6" rx="3" width="0" fill="${cas.c}">${fondu('width', C, [[0, 0], [f.enc, 0], [f.cent, pl], [1, pl]])}</rect>`;
      const pas = (f.cent - f.enc) / (pourcents.length - 1);
      pourcents.forEach((p, k) => {
        const de = f.enc + k * pas, a = k === pourcents.length - 1 ? f.a : de + pas;
        s += entre(C, de, a, texte(BOITE.x + BOITE.l / 2, BOITE.y + 84, `${p} %`, { taille: 11, couleur: cas.c, police: MONO, poids: 700, ancre: 'middle' }), 0.002);
      });
      s += `<path d="M${BOITE.x + BOITE.l + 6} ${BOITE.y + 48} H${OUTX - 8} M${OUTX - 14} ${BOITE.y + 42} l6 6 l-6 6" fill="none" stroke="${FIL}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
      // La sortie s'écrit de haut en bas, au rythme de l'avancement.
      const ow = 720 * K, oh = 1280 * K, oy = SRCY + (lh - oh) / 2;
      const c = id('ecrit');
      s += `<rect x="${OUTX}" y="${oy}" width="${ow}" height="${oh}" rx="8" fill="#0F151E" stroke="${FIL}" stroke-dasharray="4 4"/>
        <clipPath id="${c}"><rect x="${OUTX - 1}" y="${oy - 1}" width="${ow + 2}" height="0">${fondu('height', C, [[0, 0], [f.enc, 0], [f.cent, oh + 2], [1, oh + 2]])}</rect></clipPath>
        <g clip-path="url(#${c})">${cadre(OUTX, oy, ow, oh, { ...PLANS[i], rx: 8 })}</g>`;
      s += `<rect x="${OUTX}" y="${oy}" width="${ow}" height="${oh}" rx="8" fill="none" stroke="${cas.c}" stroke-opacity="0">${fondu('stroke-opacity', C, [[0, 0], [f.cent, 0], [f.cent + 0.004, 0.8], [1, 0.8]])}</rect>`;
      s += texte(OUTX + ow, SRCY + 234, '720 x 1280', { taille: 12.5, couleur: TITRE, police: MONO, poids: 700, ancre: 'end' });
      s += texte(OUTX + ow, SRCY + 252, `H.264 · 2${EN_ ? '.' : ','}5 Mb/s`, { taille: 11.5, couleur: TEXTE, police: MONO, ancre: 'end' });
      // Refusée : la sortie est barrée puis effacée.
      if (cas.sortie > cas.poids * 0.9) {
        s += entre(C, f.juge, f.a, `<rect x="${OUTX}" y="${oy}" width="${ow}" height="${oh}" rx="8" fill="${FOND_}" fill-opacity="0.72"/>
          ${icone('croix', OUTX + ow / 2 - 16, oy + oh / 2 - 16, ROUGE, 2)}
          ${texte(OUTX + ow / 2, oy + oh / 2 + 34, t('effacée', 'deleted'), { taille: 11.5, couleur: ROUGE, police: MONO, poids: 700, ancre: 'middle' })}`, 0.004);
      }
    } else {
      // Déjà légère : rien ne passe par l'encodeur.
      s += texte(BOITE.x + BOITE.l / 2, BOITE.y + 76, t('pas lancé', 'not started'), { taille: 11, couleur: DISCRET, police: MONO, ancre: 'middle' });
      s += entre(C, f.lit, f.a, `<path d="M${SRCX + lw + 8} ${SRCY + lh + 22} C ${BOITE.x + 20} ${SRCY + lh + 60}, ${OUTX} ${SRCY + lh + 60}, ${OUTX + 60} ${SRCY + lh + 8}" fill="none" stroke="${cas.c}" stroke-width="1.8" stroke-dasharray="5 5"/>
        ${texte(OUTX + 45, SRCY + 90, t('entre', 'goes in'), { taille: 13, couleur: cas.c, poids: 700, ancre: 'middle' })}
        ${texte(OUTX + 45, SRCY + 108, t('telle quelle', 'as it is'), { taille: 13, couleur: cas.c, poids: 700, ancre: 'middle' })}`, 0.004);
    }
    corps += entre(C, f.de, i === 2 ? BILAN : f.a, s, 0.006);
  });

  // ----------------------------------------------------- le poids, au seuil
  const PX = MX + 20, PL = ML - 180, PY = 442;
  corps += rubrique(MX, 428, t('LE POIDS, FACE AU SEUIL', 'THE SIZE, AGAINST THE LINE'));
  corps += `<rect x="${MX}" y="${PY - 2}" width="${ML}" height="92" rx="14" fill="${CARTE}" stroke="${BORD}"/>`;
  const px = PL / 20;
  const BLARGE = ML - 40;
  CAS.forEach((cas, i) => {
    const f = FEN[i];
    let s = `<rect x="${PX}" y="${PY + 18}" width="${PL}" height="10" rx="5" fill="${FIL}" fill-opacity="0.5"/>
      <rect x="${PX}" y="${PY + 18}" width="${cas.poids * px}" height="10" rx="5" fill="${VIOLET}" fill-opacity="0.75"/>
      ${texte(PX, PY + 14, t('l’original', 'the original'), { taille: 10.5, couleur: TEXTE })}
      ${texte(PX + cas.poids * px + 6, PY + 27, mo(cas.poids), { taille: 10.5, couleur: TITRE, police: MONO, poids: 700 })}`;
    if (cas.sortie) {
      const seuil = cas.poids * 0.9;
      const final = cas.sortie * px;
      const garde = cas.sortie < seuil;
      s += `<rect x="${PX}" y="${PY + 44}" width="${PL}" height="10" rx="5" fill="${FIL}" fill-opacity="0.5"/>
        <rect x="${PX}" y="${PY + 44}" height="10" rx="5" width="0" fill="${cas.c}">${fondu('width', C, [[0, 0], [f.enc, 0], [f.cent, final], [1, final]])}</rect>
        <line x1="${PX + seuil * px}" y1="${PY + 12}" x2="${PX + seuil * px}" y2="${PY + 60}" stroke="${ROUGE}" stroke-width="1.6" stroke-dasharray="3 3"/>
        ${texte(PX + seuil * px + (i === 0 ? -6 : 6), PY + 74, t(`90 % : ${nombre(+seuil.toFixed(1))} Mo`, `90%: ${+seuil.toFixed(1)} MB`), { taille: 10.5, couleur: ROUGE, police: MONO, ancre: i === 0 ? 'end' : 'start' })}
        ${texte(PX, PY + 74, t('l’allégée', 'the shrunk one'), { taille: 10.5, couleur: TEXTE })}`;
      s += entre(C, f.juge, f.a, texte(PX + final + 6, PY + 53, mo(cas.sortie), { taille: 10.5, couleur: cas.c, police: MONO, poids: 700 }), 0.004);
      s += entre(C, f.juge, f.a, texte(MX + ML - 20, PY + 34, garde ? t('gagne 85 %', 'saves 85%') : t('gagne 5 %', 'saves 5%'), { taille: 15, couleur: garde ? VERT : OR, poids: 800, ancre: 'end' }) +
        texte(MX + ML - 20, PY + 54, garde ? t('l’allégée est gardée', 'the shrunk one is kept') : t('pas assez : l’original reste', 'not enough: original stays'), { taille: 11.5, couleur: garde ? VERT : OR, poids: 700, ancre: 'end' }), 0.004);
    } else {
      s += texte(PX, PY + 53, t('720 sur le petit côté, 3 Mb/s : sous les deux limites.', '720 on the short side, 3 Mb/s: under both limits.'), { taille: 11.5, couleur: BLEU });
      s += texte(PX, PY + 72, t('Réencoder ne ferait que l’abîmer.', 'Re-encoding would only damage it.'), { taille: 11.5, couleur: TEXTE });
    }
    corps += entre(C, f.de, i === 2 ? BILAN : f.a, s, 0.006);
  });

  // Le bilan des trois, à la place de la vidéo en cours.
  {
    let s = `<rect x="${MX + 1}" y="123" width="${ML - 2}" height="280" rx="14" fill="${CARTE}"/>
      ${texte(MX + 22, 156, t('Ce qui est entré au coffre', 'What went into the vault'), { taille: 15, couleur: TITRE, poids: 700 })}`;
    const lignes = [
      [0, t('20 Mo filmés', '20 MB shot'), t('l’allégée, 3 Mo', 'the shrunk one, 3 MB'), t('l’original effacé', 'original deleted'), VERT],
      [1, t('8 Mo compressés', '8 MB compressed'), t('l’original, 8 Mo', 'the original, 8 MB'), t('l’allégée effacée', 'shrunk one deleted'), OR],
      [2, t('5 Mo reçus', '5 MB received'), t('l’original, 5 Mo', 'the original, 5 MB'), t('rien de réencodé', 'nothing re-encoded'), BLEU],
    ];
    lignes.forEach(([i, avant, apres, note, c], k) => {
      const y = 174 + k * 72;
      s += `<rect x="${MX + 20}" y="${y}" width="${ML - 40}" height="64" rx="12" fill="#0F151E" stroke="${c}" stroke-opacity="0.45"/>
        ${vignette(MX + 30, y + 8, 48, i)}
        ${texte(MX + 94, y + 28, avant, { taille: 13, couleur: TITRE, poids: 700 })}
        ${texte(MX + 94, y + 47, note, { taille: 11.5, couleur: TEXTE })}
        <path d="M${MX + 262} ${y + 32} H${MX + 290} M${MX + 284} ${y + 26} l6 6 l-6 6" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        ${icone('cadenas', MX + 304, y + 23, c, 1.1)}
        ${texte(MX + 330, y + 37, apres, { taille: 12.5, couleur: c, poids: 700 })}`;
    });
    s += `<rect x="${MX + 1}" y="${PY - 1}" width="${ML - 2}" height="90" rx="14" fill="${CARTE}"/>
      ${texte(MX + 22, PY + 32, t('33 Mo choisis, 16 Mo au coffre.', '33 MB picked, 16 MB in the vault.'), { taille: 17, couleur: TITRE, poids: 800 })}
      ${texte(MX + 22, PY + 56, t('Chaque vidéo y entre chiffrée par morceaux, allégée ou non.', 'Every video goes in chunk-encrypted, shrunk or not.'), { taille: 12.5 })}`;
    corps += entre(C, BILAN, FIN, s, 0.006);
  }

  // ----------------------------------------------------------- la règle
  const RX = 900, RL = 320;
  corps += rubrique(RX, 108, t('LA RÈGLE, VIDÉO PAR VIDÉO', 'THE RULE, VIDEO BY VIDEO'));
  // Les étapes de alleger(), et pour chacune les cas qui y passent.
  const etapes = [
    { y: 122, h: 70, titre: t('Déjà légère ?', 'Already light?'),
      l1: t('720 au plus sur le petit côté', '720 or less on the short side'), l2: t('et 4 Mb/s au plus : on n’y touche pas.', 'and 4 Mb/s at most: left alone.'),
      cas: [[A, VERT, t('non', 'no')], [B, OR, t('non', 'no')], [L_, BLEU, t('oui', 'yes')]] },
    { y: 202, h: 70, titre: t('Media3 réencode', 'Media3 re-encodes'),
      l1: t('H.264, 720 sur le petit côté, 2,5 Mb/s,', 'H.264, 720 on the short side, 2.5 Mb/s,'), l2: t('le son tel quel, sur l’encodeur du téléphone.', 'sound as is, on the phone encoder.'),
      cas: [[A, VERT, ''], [B, OR, '']] },
    { y: 282, h: 70, titre: t('Gagne au moins un dixième ?', 'Saves at least a tenth?'),
      l1: t('Moins de 90 % du poids d’origine,', 'Under 90% of the original size,'), l2: t('sinon réencoder n’a rien gagné.', 'otherwise re-encoding gained nothing.'),
      cas: [[A, VERT, t('oui', 'yes')], [B, OR, t('non', 'no')]] },
  ];
  etapes.forEach((e, k) => {
    corps += `<rect x="${RX}" y="${e.y}" width="${RL}" height="${e.h}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <circle cx="${RX + 24}" cy="${e.y + 26}" r="11" fill="${FIL}"/>
      ${texte(RX + 24, e.y + 30.5, String(k + 1), { taille: 12, couleur: TITRE, police: MONO, poids: 700, ancre: 'middle' })}
      ${texte(RX + 44, e.y + 31, e.titre, { taille: 14, couleur: TITRE, poids: 700 })}
      ${texte(RX + 20, e.y + 48, e.l1, { taille: 11.5 })}
      ${texte(RX + 20, e.y + 62, e.l2, { taille: 11.5 })}`;
    e.cas.forEach(([f, c, rep]) => {
      const de = k === 0 ? f.lit : k === 1 ? f.enc : f.juge;
      const a = f.a;
      corps += `<rect x="${RX}" y="${e.y}" width="${RL}" height="${e.h}" rx="13" fill="none" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, de, a, 0.004)}</rect>`;
      if (rep) corps += entre(C, de, a, `<rect x="${RX + RL - 58}" y="${e.y + 14}" width="44" height="22" rx="11" fill="${c}" fill-opacity="0.15" stroke="${c}" stroke-opacity="0.6"/>
        ${texte(RX + RL - 36, e.y + 29.5, rep, { taille: 11.5, couleur: c, poids: 700, ancre: 'middle' })}`, 0.004);
    });
  });
  // L'issue : ce qui entre au coffre.
  const IY = 364;
  corps += `<rect x="${RX}" y="${IY}" width="${RL}" height="84" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    ${icone('cadenas', RX + 18, IY + 18, ACCENT, 1.1)}
    ${texte(RX + 44, IY + 31, t('Ce qui entre au coffre', 'What enters the vault'), { taille: 14, couleur: TITRE, poids: 700 })}`;
  const issues = [
    [A, VERT, t('L’allégée, 3 Mo.', 'The shrunk one, 3 MB.'), t('L’original est effacé du cache.', 'The original is deleted from the cache.')],
    [B, OR, t('L’original, 8 Mo.', 'The original, 8 MB.'), t('L’allégée, 7,6 Mo, est effacée.', 'The shrunk one, 7.6 MB, is deleted.')],
    [L_, BLEU, t('L’original, 5 Mo.', 'The original, 5 MB.'), t('Rien n’est passé par l’encodeur.', 'Nothing went through the encoder.')],
  ];
  issues.forEach(([f, c, l1, l2]) => {
    corps += `<rect x="${RX}" y="${IY}" width="${RL}" height="84" rx="13" fill="none" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, f.entre - 0.02, f.a, 0.004)}</rect>`;
    corps += entre(C, f.entre - 0.02, f.a, texte(RX + 20, IY + 54, l1, { taille: 13, couleur: c, poids: 700 }) + texte(RX + 20, IY + 72, l2, { taille: 11.5 }), 0.004);
  });
  corps += entre(C, 0, A.entre - 0.02, texte(RX + 20, IY + 56, t('Toujours chiffrée par morceaux,', 'Always chunk-encrypted,'), { taille: 11.5, couleur: DISCRET }) +
    texte(RX + 20, IY + 72, t('comme le montre le schéma du flux.', 'as the stream diagram shows.'), { taille: 11.5, couleur: DISCRET }), 0.004);
  corps += entre(C, BILAN, 1, texte(RX + 20, IY + 56, t('Une par une, la plus légère des deux,', 'One by one, the lighter of the two,'), { taille: 11.5, couleur: TEXTE }) +
    texte(RX + 20, IY + 72, t('pourvu qu’elle le soit assez.', 'provided it is light enough.'), { taille: 11.5, couleur: TEXTE }), 0.004);

  // Le dixième, en une phrase, sous la règle.
  corps += `<rect x="${RX}" y="462" width="${RL}" height="74" rx="13" fill="${CARTE}" stroke="${BORD}"/>
    ${icone('croix', RX + 20, 474, ROUGE, 0.9)}
    ${texte(RX + 42, 486, t('Si l’encodeur échoue', 'If the encoder fails'), { taille: 14, couleur: TITRE, poids: 700 })}
    ${texte(RX + 20, 506, t('Sa sortie est effacée, l’original entre', 'Its output is deleted, the original goes'), { taille: 11.5 })}
    ${texte(RX + 20, 522, t('au coffre et l’import continue.', 'into the vault and the import carries on.'), { taille: 11.5 })}`;

  // ------------------------------------------------------ cartes du bas
  const bas = [
    [VIOLET, t('Pourquoi alléger', 'Why shrink'),
      t('Un téléphone filme en 4K à 50 Mb/s. Tel', 'A phone films in 4K at 50 Mb/s. Kept as is,'), t('quel, le coffre et les sauvegardes enflent.', 'the vault and the backups swell.')],
    [ACCENT, t('Lue avant d’être touchée', 'Read before it is touched'),
      t('La durée et l’image de la vignette sont', 'The length and the thumbnail frame are'), t('lues sur l’original, encore en clair.', 'read from the original, still in the clear.')],
    [OR, t('Le verrou attend', 'The lock waits'),
      t('Pendant l’import, personne ne touche', 'During the import nobody touches the'), t('l’écran : le délai ne coupe rien.', 'screen: the delay cuts nothing short.')],
  ];
  bas.forEach(([c, titre, l1, l2], i) => {
    const x = 400 + i * 280, y = 574;
    corps += `<rect x="${x}" y="${y}" width="260" height="92" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${x}" y="${y + 14}" width="3" height="64" rx="1.5" fill="${c}"/>
      ${texte(x + 20, y + 30, titre, { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(x + 20, y + 53, l1, { taille: 11.5 })}
      ${texte(x + 20, y + 71, l2, { taille: 11.5 })}`;
  });

  svg('allegement.svg', 1280, 720, corps, t(
    'L’allègement d’une vidéo à l’import. Dans la galerie d’Enzo, trois vidéos sont ajoutées, et l’écran dit « Chiffrement de la vidéo, 1 sur 3 », puis « Allègement de la vidéo » avec son pourcentage. La première, filmée au téléphone en 1080 x 1920 à 16 Mb/s, pèse 20 Mo : Media3 la réencode sur l’encodeur du téléphone, en H.264, 720 points sur le petit côté, 2,5 Mb/s, le son tel quel. Elle ressort à 3 Mo, sous le seuil de 90 % : l’allégée entre au coffre et l’original est effacé. La deuxième, déjà compressée à 2,7 Mb/s, pèse 8 Mo ; réencodée, elle en fait encore 7,6, au-dessus du seuil de 7,2 : l’allégée est effacée et l’original entre. La troisième, 720 x 1280 à 3 Mb/s, est déjà sous les deux limites, 720 points et 4 Mb/s : elle entre sans passer par l’encodeur. Si l’encodeur échoue, sa sortie est effacée et l’original entre. Au total, 33 Mo choisis, 16 Mo au coffre, chaque vidéo chiffrée par morceaux.',
    'Shrinking a video on import. In Enzo’s gallery, three videos are added, and the screen says “Encrypting the video, 1 of 3”, then “Shrinking the video” with its percentage. The first, shot on the phone at 1080 x 1920 and 16 Mb/s, weighs 20 MB: Media3 re-encodes it on the phone encoder, in H.264, 720 points on the short side, 2.5 Mb/s, sound as is. It comes out at 3 MB, under the 90% line: the shrunk one enters the vault and the original is deleted. The second, already compressed at 2.7 Mb/s, weighs 8 MB; re-encoded, it still takes 7.6, above the 7.2 line: the shrunk one is deleted and the original goes in. The third, 720 x 1280 at 3 Mb/s, is already under both limits, 720 points and 4 Mb/s: it goes in without touching the encoder. If the encoder fails, its output is deleted and the original goes in. In all, 33 MB picked, 16 MB in the vault, every video encrypted in chunks.'));
};

// Les fonctionnalités, en mouvement.
//
// Onze fonctionnalités, onze tranches égales du cycle. Pour chacune, le
// téléphone rejoue l'écran tel que son schéma dédié le montre (la vraie
// côte pour la carte, les barres qui montent pour les statistiques, la
// photo qui passe au coffre pour la galerie…), et à droite le mécanisme
// de ce schéma se construit : billes, fils, compteurs. En bas, les douze
// tuiles servent de sommaire et gardent une coche une fois vues.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, paliers, fondu, visible, entre, glisse, telephone, toucher, frappe, empreinte, logo,
    icone, visage, etoiles, pastille, largeurPastille, bouton, barreNav, cartePersonne, carte, france, GENS, APP, MONO, SANS,
    CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, FUCHSIA, VERT, OR, ROUGE, BLEU } = O;
  const N = 11, C = 66;
  const A = (k) => k / N + 0.002, B = (k) => (k + 1) / N - 0.002;
  /// Un instant dans la tranche k, en fraction de la tranche.
  const dans = (k, f) => A(k) + (B(k) - A(k)) * f;
  const r1 = (v) => Math.round(v * 10) / 10;
  const virgule = (s) => (O.EN ? s.replace(',', '.') : s);
  const EMOJI = 'Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif';
  const emoji = (x, y, s, taille) => `<text x="${x}" y="${y}" font-family="${EMOJI}" font-size="${taille}" text-anchor="middle">${s}</text>`;

  let corps = entete(t('LES FONCTIONNALITÉS', 'THE FEATURES'),
    t('Onze écrans, chacun avec son mécanisme. Tout se passe sur le téléphone, et nulle part ailleurs.',
      'Eleven screens, each with its mechanism. Everything happens on the phone, and nowhere else.'));

  // --------------------------------------------------------------- les aides
  /// Une bille qui court sur un chemin entre deux instants, une fois.
  const bille = (chemin, de, a, couleur = ACCENT) => {
    const m = `<animateMotion dur="${C}s" repeatCount="indefinite" path="${chemin}" keyPoints="0;0;1;1" keyTimes="0;${de};${a};1" calcMode="linear"/>`;
    return `<g opacity="0">${visible(C, de, a, 0.003)}
      <circle r="9" fill="${couleur}" opacity="0.25" filter="url(#halo)">${m}</circle>
      <circle r="3.5" fill="#FFFFFF">${m}</circle></g>`;
  };
  /// Un fil gris qui se colore une fois la bille passée, jusqu'à [fin].
  const fil = (chemin, de, fin, couleur = ACCENT) => `<path d="${chemin}" fill="none" stroke="${FIL}" stroke-width="1.8"/>
    <path d="${chemin}" fill="none" stroke="${couleur}" stroke-width="1.8" stroke-opacity="0.75" opacity="0">${visible(C, de, fin, 0.003)}</path>`;
  /// Une suite de valeurs qui se relaient à des instants donnés.
  const compteur = (x, y, valeurs, instants, fin, opts) => valeurs.map((v, i) =>
    entre(C, i === 0 ? 0 : instants[i], i === valeurs.length - 1 ? fin : instants[i + 1], texte(x, y, v, opts), 0.0015)).join('');
  /// Un nombre qui monte de 0 à [cible] entre deux instants, en [pas] étapes.
  const monte = (x, y, cible, de, a, fin, opts, pas = 10, format = (v) => String(v)) => {
    const vals = [], inst = [];
    for (let i = 0; i <= pas; i++) { vals.push(format(Math.round((cible * i) / pas))); inst.push(de + ((a - de) * i) / pas); }
    return compteur(x, y, vals, inst, fin, opts);
  };

  // ------------------------------------------------------------- le cadre
  const T = telephone(60, 96, 290, 580);
  const { x: SX, y: SY, l: SL, h: SH } = T;
  corps += T.cadre;
  const RX = 400, RY = 92, RL = 820, RH = 424;
  corps += `<rect x="${RX}" y="${RY}" width="${RL}" height="${RH}" rx="16" fill="${CARTE}" fill-opacity="0.55" stroke="${BORD}"/>`;

  const TUILES = [
    ['empreinte', VIOLET, t('Verrouillage biométrique', 'Biometric lock'), t('L’empreinte fait entrer la clé en mémoire. Sans elle, rien ne se lit.', 'The fingerprint brings the key into memory. Without it, nothing reads.')],
    ['grille', FUCHSIA, t('Répertoire', 'People'), t('Chaque lettre refait la requête, les tris réordonnent.', 'Every letter reruns the query, the sorts reorder.')],
    ['barres', ACCENT, t('Statistiques', 'Statistics'), t('Chaque rencontre tombe dans son mois, le podium se range.', 'Each encounter falls into its month, the podium sorts itself.')],
    ['carte', BLEU, t('Carte de France', 'Map of France'), t('La vraie côte, embarquée. S’approcher sépare les villes.', 'The real coastline, built in. Moving closer splits the cities.')],
    ['calendrier', VIOLET, t('Calendrier', 'Calendar'), t('Sept colonnes, et sous chaque jour ses signes les plus rares.', 'Seven columns, and under each day its rarest signs.')],
    ['photo', FUCHSIA, t('Galerie privée', 'Private gallery'), t('Une photo entre au coffre chiffrée, jamais dans la galerie.', 'A photo enters the vault encrypted, never the gallery.')],
    ['fichier', VERT, t('Sauvegarde complète', 'Full backup'), t('Tout dans un fichier, fermé par ta phrase de passe.', 'Everything in one file, locked by your passphrase.')],
    ['euro', OR, t('Ce que ça rapporte', 'What it brings in'), t('Un montant par soirée, la moyenne sur les seules payées.', 'An amount per night, the average over paid ones only.')],
    ['reprendre', ACCENT, t('Tout se reprend', 'Nothing is final'), t('Reprendre, corriger, supprimer, ou changer d’avis.', 'Edit, correct, delete, or change your mind.')],
    ['itineraire', BLEU, t('Adresse et itinéraire', 'Address and route'), t('La seule sortie du téléphone, et sur un toucher.', 'The only way out of the phone, and on a tap.')],
    ['ecrans', VIOLET, t('Trois formats d’écran', 'Three screen sizes'), t('Le même répertoire, en 2, 3 puis 4 colonnes.', 'The same list, in 2, 3 then 4 columns.')],
  ];

  // Quelques pictogrammes de plus, dans le même carré de 16.
  const PICTO = {
    grille: (c) => `<g transform="scale(0.6667)"><rect x="3" y="3" width="8" height="8" rx="2.2" fill="${c}"/><rect x="13" y="3" width="8" height="8" rx="2.2" fill="${c}"/><rect x="3" y="13" width="8" height="8" rx="2.2" fill="${c}"/><rect x="13" y="13" width="8" height="8" rx="2.2" fill="${c}"/></g>`,
    barres: (c) => `<path d="M3 14 V9 M8 14 V3 M13 14 V6" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`,
    carte: (c) => `<path d="M1.5 4 L5.5 2.5 L10.5 4 L14.5 2.5 V12 L10.5 13.5 L5.5 12 L1.5 13.5 Z M5.5 2.5 V12 M10.5 4 V13.5" fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round"/>`,
    reprendre: (c) => `<g transform="scale(0.6667)">${O.ICONES_APP.settings_backup_restore(c)}</g>`,
    itineraire: (c) => `<g transform="scale(0.6667)">${O.ICONES_APP.directions(c)}</g>`,
    ecrans: (c) => `<rect x="1" y="4" width="5" height="9" rx="1.2" fill="none" stroke="${c}" stroke-width="1.4"/><rect x="7.5" y="2" width="7.5" height="11" rx="1.2" fill="none" stroke="${c}" stroke-width="1.4"/>`,
    mur: (c) => `<g transform="scale(0.6667)">${O.ICONES_APP.shield(c)}</g>`,
  };
  const picto = (nom, x, y, c, k = 1) => (nom === 'empreinte' ? empreinte(x + 8 * k, y + 8 * k, 16 * k, c)
    : PICTO[nom] ? `<g transform="translate(${x} ${y}) scale(${k})">${PICTO[nom](c)}</g>` : icone(nom, x, y, c, k));

  // L'en-tête du panneau de droite, propre à chaque tranche.
  TUILES.forEach(([ic, c, titre, phrase], k) => {
    corps += entre(C, A(k), B(k), `<rect x="${RX + 22}" y="${RY + 20}" width="36" height="36" rx="10" fill="${c}" fill-opacity="0.14" stroke="${c}" stroke-opacity="0.5"/>
      ${picto(ic, RX + 30, RY + 28, c, 1.25)}
      ${texte(RX + 72, RY + 36, titre, { taille: 16, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(RX + 72, RY + 54, phrase, { taille: 12.5 })}
      ${texte(RX + RL - 22, RY + 36, `${String(k + 1).padStart(2, '0')} / 11`, { taille: 11.5, couleur: DISCRET, police: MONO, poids: 700, ancre: 'end' })}
      <rect x="${RX + RL - 122}" y="${RY + 46}" width="100" height="3" rx="1.5" fill="${FIL}"/>
      <rect x="${RX + RL - 122}" y="${RY + 46}" height="3" rx="1.5" width="0" fill="${c}">${fondu('width', C, [[0, 0], [A(k), 0], [B(k), 100], [B(k) + 0.001, 0], [1, 0]])}</rect>
      <line x1="${RX + 22}" y1="${RY + 72}" x2="${RX + RL - 22}" y2="${RY + 72}" stroke="${BORD}"/>`, 0.003);
  });
  const ZX = RX + 22, ZY = RY + 88, ZL = RL - 44; // la zone du mécanisme

  // Petites aides d'écran.
  const titreEcran = (s, droite = '') => `${texte(SX + 18, SY + 44, s, { taille: 13, couleur: APP.texte, poids: 800, extra: 'letter-spacing="1.5"' })}
    ${droite ? `<rect x="${SX + SL - 18 - droite.length * 6.2 - 18}" y="${SY + 28}" width="${droite.length * 6.2 + 18}" height="24" rx="12" fill="${APP.carte}" stroke="${APP.bord}"/>${texte(SX + SL - 27, SY + 44, droite, { taille: 10.5, couleur: APP.texte, poids: 700, ancre: 'end' })}` : ''}`;
  const panneau = (x, y, l, h) => `<rect x="${x}" y="${y}" width="${l}" height="${h}" rx="18" fill="${APP.carte}" stroke="${APP.bord}"/>`;
  const petit = (x, y, s, c = APP.second) => texte(x, y, s, { taille: 9.5, couleur: c, poids: 700, extra: 'letter-spacing="1.4"' });
  /// Une ligne d'état sous un mécanisme, qui change avec les instants.
  const etat = (x, y, lignes) => lignes.map(([de, a, s, c]) => entre(C, de, a, `<circle cx="${x + 5}" cy="${y - 4.5}" r="4" fill="${c}"/>${texte(x + 18, y, s, { taille: 13, couleur: TITRE, poids: 600 })}`, 0.003)).join('');

  const scenes = [], meca = [];

  // =============================================== 1. le verrou biométrique
  {
    const k = 0, touche = dans(k, 0.14), lu = dans(k, 0.42), cle = dans(k, 0.5), deriv = dans(k, 0.62), ouvert = dans(k, 0.76);
    const cx = SX + SL / 2, cy = SY + 380;
    const scan = O.id('scan');
    let s = `${logo(cx, SY + 128, 76)}
      ${texte(cx, SY + 212, 'BodyCount', { taille: 30, couleur: APP.texte, poids: 800, ancre: 'middle' })}
      ${texte(cx, SY + 240, t('Tout reste sur cet appareil. Aucun compte,', 'Everything stays on this device. No account,'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
      ${texte(cx, SY + 257, t('aucun serveur, aucune requête réseau.', 'no server, no network request.'), { taille: 11.5, couleur: APP.second, ancre: 'middle' })}
      <circle cx="${cx}" cy="${cy}" r="56" fill="${VIOLET}" opacity="0.12"><animate attributeName="r" dur="2.6s" repeatCount="indefinite" values="50;62;50"/></circle>
      <circle cx="${cx}" cy="${cy}" r="46" fill="url(#marque)"/>
      ${empreinte(cx, cy, 44, '#FFFFFF')}
      <clipPath id="${scan}"><circle cx="${cx}" cy="${cy}" r="30"/></clipPath>
      <g clip-path="url(#${scan})" opacity="0">${visible(C, touche, lu, 0.002)}
        <rect x="${cx - 30}" width="60" height="6" fill="#FFFFFF" opacity="0.85" y="${cy - 36}">${fondu('y', C, [[0, cy - 36], [touche, cy - 36], [dans(k, 0.28), cy + 30], [dans(k, 0.29), cy - 36], [lu, cy + 30], [1, cy + 30]])}</rect>
      </g>
      <g opacity="0">${visible(C, lu, B(k), 0.003)}<circle cx="${cx}" cy="${cy}" r="46" fill="${APP.vert}"/>${empreinte(cx, cy, 44, '#FFFFFF')}</g>
      ${entre(C, A(k), touche, texte(cx, SY + 470, t('Touche le capteur pour ouvrir', 'Touch the sensor to open'), { taille: 12.5, couleur: APP.second, poids: 600, ancre: 'middle' }), 0.002)}
      ${entre(C, touche, lu, texte(cx, SY + 470, t('Vérification…', 'Checking…'), { taille: 12.5, couleur: APP.rose, poids: 600, ancre: 'middle' }), 0.002)}
      ${entre(C, lu, B(k), texte(cx, SY + 470, t('Clé chargée', 'Key loaded'), { taille: 12.5, couleur: APP.vert, poids: 700, ancre: 'middle' }), 0.002)}
      ${toucher(cx, cy, C, touche)}
      ${icone('lock', SX + 38, SY + SH - 40, APP.vert, 0.75)}
      ${texte(SX + 54, SY + SH - 29, t('Base chiffrée, clé rangée dans le Keystore', 'Encrypted database, key kept in the Keystore'), { taille: 10, couleur: APP.second, poids: 600 })}`;
    // Le répertoire monte par-dessus : des cases vides, puis les prénoms
    // quand la base s'ouvre, puis les visages quand le coffre s'ouvre.
    const CL = (SL - 36) / 2, CH = 150;
    let rep = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${APP.fond}"/>${titreEcran(t('RÉPERTOIRE', 'PEOPLE'))}`;
    [GENS.noa, GENS.lou, GENS.enzo, GENS.jade].forEach((p, i) => {
      const x = SX + 12 + (i % 2) * (CL + 12), y = SY + 70 + Math.floor(i / 2) * (CH + 12);
      rep += `<rect x="${x}" y="${y}" width="${CL}" height="${CH}" rx="14" fill="${APP.carte}" stroke="${APP.bord}"/>
        ${icone('cadenas', x + CL / 2 - 12, y + CH / 2 - 14, APP.discret, 1.5)}
        ${entre(C, ouvert + 0.012 + i * 0.002, B(k), cartePersonne(p, x, y, CL, CH, { premier: i === 0 }), 0.003)}`;
    });
    rep += barreNav(T, 'Fiches');
    s += `<g opacity="0">${visible(C, ouvert, B(k), 0.003)}<g>${glisse(C, [[0, `0 ${SH}`], [ouvert, `0 ${SH}`], [ouvert + 0.006, '0 0'], [1, '0 0']])}${rep}</g></g>`;
    scenes.push(s);

    // La chaîne des clés, comme chiffrement.svg.
    const y0 = ZY + 110, l = 150, h = 62, xs = [ZX, ZX + 190, ZX + 380, ZX + 590];
    let m = '';
    const f1 = `M${xs[0] + l} ${y0 + h / 2} H${xs[1]}`, f2 = `M${xs[1] + l} ${y0 + h / 2} H${xs[2]}`;
    const f3 = `M${xs[2] + l} ${y0 + h / 2} H${xs[2] + l + 25} V${y0 - 38} H${xs[3]}`, f4 = `M${xs[2] + l} ${y0 + h / 2} H${xs[2] + l + 25} V${y0 + h + 38} H${xs[3]}`;
    m += fil(f1, lu, B(k), VIOLET) + fil(f2, cle, B(k), OR) + fil(f3, deriv, B(k), VERT) + fil(f4, deriv, B(k), BLEU);
    m += bille(f1, lu, cle, VIOLET) + bille(f2, cle, deriv, OR) + bille(f3, deriv, ouvert, VERT) + bille(f4, deriv + 0.004, ouvert + 0.004, BLEU);
    m += carte(xs[0], y0, l, h, t('Empreinte', 'Fingerprint'), t('vérifiée par Android', 'checked by Android'), VIOLET, { allume: [touche, B(k)], cycle: C });
    m += carte(xs[1], y0, l, h, 'Keystore', t('clé de 32 octets', '32-byte key'), OR, { allume: [cle, B(k)], cycle: C });
    m += carte(xs[2], y0, l, h, 'HKDF-SHA256', t('une étiquette par clé', 'one label per key'), ACCENT, { allume: [deriv, B(k)], cycle: C });
    m += carte(xs[3], y0 - 70, 186, h, 'bodycount/db/v1', t('mot de passe SQLCipher', 'SQLCipher password'), VERT, { allume: [ouvert, B(k)], cycle: C });
    m += carte(xs[3], y0 + 70, 186, h, 'bodycount/photos/v1', t('clé AES-GCM du coffre', 'vault AES-GCM key'), BLEU, { allume: [ouvert + 0.01, B(k)], cycle: C });
    // Sous la chaîne : la mémoire, vide puis pleine.
    const my = ZY + 290;
    m += `<rect x="${ZX}" y="${my}" width="${ZL}" height="40" rx="10" fill="${FIL}" fill-opacity="0.25"/>`;
    m += texte(ZX + 16, my + 25, t('EN MÉMOIRE', 'IN MEMORY'), { taille: 11, couleur: DISCRET, police: MONO, poids: 700, extra: 'letter-spacing="2"' });
    [[t('clé maîtresse', 'master key'), cle, OR], [t('mot de passe de la base', 'database password'), ouvert, VERT], [t('clé du coffre', 'vault key'), ouvert + 0.01, BLEU]].forEach(([s2, de, c], i) => {
      const x = ZX + 140 + i * 210;
      m += `<rect x="${x}" y="${my + 9}" width="196" height="22" rx="11" fill="none" stroke="${FIL}" stroke-dasharray="4 4"/>
        ${texte(x + 98, my + 24, s2, { taille: 11, couleur: DISCRET, ancre: 'middle' })}
        <g opacity="0">${visible(C, de, B(k), 0.003)}<rect x="${x}" y="${my + 9}" width="196" height="22" rx="11" fill="${c}" fill-opacity="0.16" stroke="${c}"/>
        ${texte(x + 98, my + 24, s2, { taille: 11, couleur: c, poids: 700, ancre: 'middle' })}</g>`;
    });
    m += etat(ZX, ZY + 12, [
      [A(k), lu, t('authenticate() : Android vérifie le doigt, l’appli ne le voit jamais.', 'authenticate(): Android checks the finger, the app never sees it.'), VIOLET],
      [lu, deriv, t('unlock() : la clé sort des préférences chiffrées par le Keystore.', 'unlock(): the key leaves the Keystore-encrypted preferences.'), OR],
      [deriv, ouvert, t('HKDF en tire deux clés : l’une ne livre pas l’autre.', 'HKDF derives two keys: one never gives away the other.'), ACCENT],
      [ouvert, B(k), t('La base s’ouvre, puis le coffre : les visages arrivent.', 'The database opens, then the vault: the faces arrive.'), VERT],
    ]);
    meca.push(m);
  }

  // ======================================================== 2. le répertoire
  {
    const k = 1, tape = [dans(k, 0.1), dans(k, 0.34)], filtre = dans(k, 0.36), tri = dans(k, 0.66);
    const CL = (SL - 36) / 2, CH = 118;
    const pos = (i) => [SX + 12 + (i % 2) * (CL + 12), SY + 128 + Math.floor(i / 2) * (CH + 10)];
    // L'ordre de départ, les récents ; « vann » garde les quatre de Vannes ;
    // « Mieux notés » les range par note, le prénom départageant.
    const depart = [GENS.noa, GENS.jade, GENS.lou, GENS.matteo, GENS.enzo, GENS.gabriel];
    const apres = [GENS.noa, GENS.lou, GENS.enzo, GENS.gabriel];
    const trie = [GENS.gabriel, GENS.noa, GENS.lou, GENS.enzo];
    let s = `${titreEcran(t('RÉPERTOIRE', 'PEOPLE'))}
      <rect x="${SX + 12}" y="${SY + 60}" width="${SL - 24}" height="30" rx="15" fill="${APP.carte}" stroke="${APP.bord}"/>
      <rect x="${SX + 12}" y="${SY + 60}" width="${SL - 24}" height="30" rx="15" fill="none" stroke="${APP.violet}" stroke-width="1.5" opacity="0">${visible(C, tape[0], B(k), 0.003)}</rect>
      ${icone('loupe', SX + 24, SY + 67, APP.second, 0.9)}
      ${entre(C, A(k), tape[0], texte(SX + 46, SY + 79.5, t('Nom, ville, étiquette', 'Name, city, tag'), { taille: 11, couleur: APP.discret }), 0.002)}
      ${frappe(SX + 46, SY + 79.5, 'vann', C, tape[0], tape[1], { taille: 12, couleur: APP.texte, poids: 600 })}`;
    const nb = (x, y) => compteur(x, y, [t('18 fiches', '18 people'), t('12 fiches', '12 people'), t('7 fiches', '7 people')], [0, dans(k, 0.2), dans(k, 0.3)], B(k),
      { taille: 10, couleur: APP.second, poids: 700, ancre: 'end' });
    s += nb(SX + SL - 26, SY + 79.5);
    // Les tris, dont « Mieux notés » qu'on touche.
    let px = SX + 12;
    const tris = [[t('Récents', 'Recent'), 0], [t('Mieux notés', 'Top rated'), 1], [t('Plus vues', 'Most seen'), 2]];
    tris.forEach(([lib, i]) => {
      const l = largeurPastille(lib, 9.5);
      s += i === 0 ? entre(C, A(k), tri, pastille(px, SY + 96, lib, { plein: true, taille: 9.5 }), 0.002) + entre(C, tri, B(k), pastille(px, SY + 96, lib, { taille: 9.5 }), 0.002)
        : i === 1 ? entre(C, A(k), tri, pastille(px, SY + 96, lib, { taille: 9.5 }), 0.002) + entre(C, tri, B(k), pastille(px, SY + 96, lib, { plein: true, taille: 9.5 }), 0.002) + toucher(px + l / 2, SY + 107, C, tri - 0.004)
          : pastille(px, SY + 96, lib, { taille: 9.5 });
      px += l + 6;
    });
    // Décalé : la rangée de pastilles occupe SY+72..94, les cartes partent de SY+104.
    depart.forEach((p, i) => {
      const [x0, y0] = pos(i);
      const j = apres.indexOf(p), jt = trie.indexOf(p);
      const reste = j >= 0;
      const etapes = reste
        ? [[0, `${x0} ${y0}`], [filtre, `${x0} ${y0}`], [filtre + 0.01, pos(j).join(' ')], [tri, pos(j).join(' ')], [tri + 0.01, pos(jt).join(' ')], [1, pos(jt).join(' ')]]
        : [[0, `${x0} ${y0}`], [1, `${x0} ${y0}`]];
      s += `<g opacity="1">${reste ? '' : fondu('opacity', C, [[0, 1], [filtre - 0.006, 1], [filtre, 0], [1, 0]])}
        <g transform="translate(${x0} ${y0})">${glisse(C, etapes)}${cartePersonne(p, 0, 0, CL, CH, { premier: p === GENS.noa })}</g></g>`;
    });
    s += barreNav(T, 'Fiches');
    scenes.push(s);

    // La requête, qui se réécrit.
    let m = `<rect x="${ZX}" y="${ZY + 30}" width="470" height="236" rx="12" fill="#0A0E14" stroke="${BORD}"/>`;
    const L = (i, s2, c = TEXTE, extra = {}) => texte(ZX + 20, ZY + 60 + i * 24, s2, { taille: 13, couleur: c, police: MONO, ...extra });
    m += L(0, 'SELECT p.*, COUNT(r.id) AS nb,', '#C9D1D9') + L(1, '       AVG(r.note) AS moyenne', '#C9D1D9') + L(2, 'FROM personnes p LEFT JOIN rencontres r', '#C9D1D9');
    m += L(3, 'WHERE p.prenom LIKE', ACCENT) + L(4, '   OR p.ville LIKE', ACCENT) + L(5, '   OR étiquette LIKE', ACCENT);
    for (let i = 3; i < 6; i++) m += frappe(ZX + 20 + (i === 3 ? 20 : i === 4 ? 19 : 21) * 7.9, ZY + 60 + i * 24, "'%vann%'", C, tape[0], tape[1], { taille: 13, couleur: VERT, police: MONO });
    m += L(6, 'GROUP BY p.id', '#C9D1D9');
    m += entre(C, A(k), tri, L(7, 'ORDER BY derniere DESC', OR), 0.002) + entre(C, tri, B(k), L(7, 'ORDER BY moyenne DESC, prenom', OR), 0.002);
    // Le compteur, qui tombe à chaque lettre.
    const cx = ZX + 490, cl = ZL - 490;
    m += `<rect x="${cx}" y="${ZY + 30}" width="${cl}" height="110" rx="12" fill="${CARTE}" stroke="${BORD}"/>`;
    m += texte(cx + 20, ZY + 58, t('FICHES RENDUES', 'PEOPLE RETURNED'), { taille: 11, couleur: DISCRET, police: MONO, poids: 700, extra: 'letter-spacing="2"' });
    m += compteur(cx + 20, ZY + 118, ['18', '18', '12', '7', '7'], [0, dans(k, 0.12), dans(k, 0.2), dans(k, 0.3), filtre], B(k), { taille: 46, couleur: TITRE, poids: 800 });
    m += compteur(cx + cl - 20, ZY + 118, ['', 'v', 'va', 'van', 'vann'], [0, dans(k, 0.13), dans(k, 0.2), dans(k, 0.27), dans(k, 0.33)], B(k), { taille: 16, couleur: VERT, police: MONO, poids: 700, ancre: 'end' });
    // Où le mot est trouvé.
    [[t('Prénom', 'First name'), false], [t('Ville', 'City'), true], [t('Étiquettes', 'Tags'), false]].forEach(([s2, oui], i) => {
      const y = ZY + 156 + i * 38;
      m += `<rect x="${cx}" y="${y}" width="${cl}" height="30" rx="9" fill="${CARTE}" stroke="${BORD}"/>
        ${texte(cx + 16, y + 20, s2, { taille: 12.5, couleur: TITRE, poids: 600 })}
        ${entre(C, tape[1], B(k), texte(cx + cl - 16, y + 20, oui ? t('7 fiches', '7 people') : t('aucune', 'none'), { taille: 11.5, couleur: oui ? VERT : DISCRET, police: MONO, poids: 700, ancre: 'end' }), 0.003)}
        ${oui ? `<rect x="${cx}" y="${y}" width="${cl}" height="30" rx="9" fill="none" stroke="${VERT}" opacity="0">${visible(C, tape[1], B(k), 0.003)}</rect>` : ''}`;
    });
    m += etat(ZX, ZY + 12, [
      [A(k), filtre, t('Chaque lettre refait une seule requête sur la base chiffrée.', 'Every letter reruns a single query on the encrypted database.'), ACCENT],
      [filtre, tri, t('Les fiches qui restent glissent à leur place.', 'The remaining people slide into place.'), VERT],
      [tri, B(k), t('Un tri ne change que l’ordre de la même requête.', 'A sort only changes the order of the same query.'), OR],
    ]);
    m += texte(ZX, ZY + 300, t('Recherche, ville et étiquettes se cumulent : chaque filtre resserre, rien ne se relit à part.', 'Search, city and tags add up: each filter narrows, nothing is read on its own.'), { taille: 12, couleur: TEXTE });
    meca.push(m);
  }

  // ====================================================== 3. les statistiques
  {
    const k = 2, X = SX + 12, L = SL - 24;
    const mois = [5, 7, 8, 7, 12, 7, 10, 4, 18, 0, 0, 0];
    const chute = (i) => dans(k, 0.06 + i * 0.0075); // l'instant où la rencontre i tombe
    let s = `${petit(SX + 18, SY + 36, t('STATISTIQUES', 'STATISTICS'), APP.texte)}
      ${texte(SX + 18, SY + 66, '2026', { taille: 26, couleur: APP.texte, poids: 800 })}
      ${pastille(SX + 18, SY + 78, '2026', { plein: true, taille: 10 })}${pastille(SX + 78, SY + 78, '2025', { taille: 10 })}
      ${panneau(X, SY + 112, L, 100)}
      ${petit(X + 16, SY + 136, t('AU TOTAL', 'IN TOTAL'))}
      <g opacity="0">${visible(C, dans(k, 0.7), B(k), 0.003)}
        <rect x="${X + L - 74}" y="${SY + 124}" width="60" height="20" rx="10" fill="${APP.vert}" fill-opacity="0.14" stroke="${APP.vert}" stroke-opacity="0.5"/>
        ${texte(X + L - 44, SY + 138, '+136 %', { taille: 10, couleur: APP.vert, poids: 800, ancre: 'middle' })}
        ${texte(X + L - 14, SY + 160, 'vs 2025', { taille: 9.5, couleur: APP.second, ancre: 'end' })}
      </g>
      ${monte(X + 16, SY + 182, 78, chute(0), chute(77), B(k), { taille: 38, couleur: APP.rose, poids: 800 }, 13)}
      ${texte(X + 16, SY + 200, t('Rencontres · 18 personnes', 'Encounters · 18 people'), { taille: 10, couleur: APP.second })}
      ${panneau(X, SY + 222, L, 110)}
      ${petit(X + 16, SY + 246, t('PAR MOIS', 'BY MONTH'))}
      ${entre(C, chute(77), B(k), texte(X + L - 14, SY + 246, t('Septembre · 18 fois', 'September · 18 times'), { taille: 9.5, couleur: APP.texte, poids: 700, ancre: 'end' }), 0.003)}`;
    // Chaque barre monte d'un cran quand une rencontre de son mois tombe.
    const bl = (L - 32 - 11 * 5) / 12;
    let n = 0;
    const ordre = []; // le mois de chaque rencontre, dans l'ordre de chute
    mois.forEach((v, i) => { for (let j = 0; j < v; j++) ordre.push(i); });
    // Mélangées de façon fixe : elles tombent dans le désordre de l'année.
    for (let i = ordre.length - 1; i > 0; i--) { const j = (i * 37 + 11) % (i + 1); [ordre[i], ordre[j]] = [ordre[j], ordre[i]]; }
    mois.forEach((v, i) => {
      const x = X + 16 + i * (bl + 5), yb = SY + 318;
      const et = [[0, 0]];
      let h = 0;
      ordre.forEach((mm, r) => { if (mm === i) { h += 3.6; et.push([chute(r), r1(h)]); } });
      et.push([1, r1(h)]);
      const ht = et.map(([a, v2]) => [a, v2]), yt = et.map(([a, v2]) => [a, r1(yb - v2)]);
      s += `<rect x="${r1(x)}" y="${yb - 3}" width="${r1(bl)}" height="3" rx="1.5" fill="${APP.violet}" fill-opacity="0.25"/>
        <rect x="${r1(x)}" width="${r1(bl)}" rx="2.5" fill="${i === 8 ? APP.fuchsia : APP.violet}" fill-opacity="${i === 8 ? 1 : 0.6}" y="${yb}" height="0">
        ${paliers('height', C, ht)}${paliers('y', C, yt)}</rect>`;
      n += v;
    });
    // Le podium, qui monte en place.
    const pod = dans(k, 0.74);
    s += `${panneau(X, SY + 342, L, 140)}${petit(X + 16, SY + 366, t('LES MIEUX NOTÉS', 'TOP RATED'))}`;
    [[GENS.gabriel, 2, 46, '4,8', 1], [GENS.noa, 1, 60, '4,9', 0], [GENS.ibrahim, 3, 36, '4,8', 2]].forEach(([p, rang, h, note, ord], i) => {
      const x = X + 18 + i * 74, y = SY + 452 - h, de = pod + ord * 0.006;
      s += `<g opacity="0">${fondu('opacity', C, [[0, 0], [de, 0], [de + 0.004, 1], [1, 1]])}<g>${glisse(C, [[0, '0 40'], [de, '0 40'], [de + 0.006, '0 0'], [1, '0 0']])}
        ${visage(p.photo, x, y - 14, 62, 50, 12)}
        <circle cx="${x + 8}" cy="${y - 10}" r="8" fill="${rang === 1 ? APP.or : APP.surface}" stroke="${APP.bord}"/>
        ${texte(x + 8, y - 6.5, String(rang), { taille: 9, couleur: rang === 1 ? '#3A2606' : APP.texte, poids: 800, ancre: 'middle' })}
        ${texte(x + 31, y + 50, virgule(note), { taille: 10, couleur: APP.rose, poids: 800, ancre: 'middle' })}
      </g></g>`;
    });
    s += barreNav(T, 'Stats');
    scenes.push(s);

    // Les 78 rencontres tombent dans leur mois.
    let m = '';
    const gx = ZX + 30, gy = ZY + 56, col = 13, pasx = 21, pasy = 18;
    const bx = ZX + 400, bw = 26, bgap = 6, base = ZY + 290;
    m += texte(ZX, ZY + 44, t('78 RENCONTRES DE 2026', '78 ENCOUNTERS IN 2026'), { taille: 11, couleur: DISCRET, police: MONO, poids: 700, extra: 'letter-spacing="2"' });
    m += texte(bx, ZY + 44, t('12 ENTIERS RENVOYÉS', '12 INTEGERS RETURNED'), { taille: 11, couleur: DISCRET, police: MONO, poids: 700, extra: 'letter-spacing="2"' });
    const hauteur = [];
    ordre.forEach((mm, r) => {
      const x0 = gx + (r % col) * pasx, y0 = gy + Math.floor(r / col) * pasy;
      hauteur[mm] = (hauteur[mm] || 0) + 1;
      const x1 = bx + mm * (bw + bgap) + bw / 2, y1 = base - hauteur[mm] * 11 + 5.5;
      const de = chute(r);
      m += `<circle r="4.5" fill="${mm === 8 ? FUCHSIA : VIOLET}" cx="0" cy="0" transform="translate(${x0} ${y0})">
        ${glisse(C, [[0, `${x0} ${y0}`], [de, `${x0} ${y0}`], [de + 0.008, `${r1(x1)} ${r1(y1)}`], [B(k), `${r1(x1)} ${r1(y1)}`], [B(k) + 0.002, `${x0} ${y0}`], [1, `${x0} ${y0}`]])}</circle>`;
    });
    const initiales = O.EN ? ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] : ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    mois.forEach((v, i) => {
      const x = bx + i * (bw + bgap);
      m += `<line x1="${x}" y1="${base + 2}" x2="${x + bw}" y2="${base + 2}" stroke="${FIL}" stroke-width="2"/>
        ${texte(x + bw / 2, base + 18, initiales[i], { taille: 11, couleur: DISCRET, poids: 700, ancre: 'middle' })}
        ${entre(C, dans(k, 0.66), B(k), texte(x + bw / 2, base - v * 11 - 6, String(v), { taille: 10.5, couleur: i === 8 ? ACCENT : TEXTE, police: MONO, poids: 700, ancre: 'middle' }), 0.003)}`;
    });
    m += entre(C, dans(k, 0.62), B(k), `<rect x="${ZX}" y="${ZY + 318}" width="${ZL}" height="30" rx="8" fill="#0A0E14" stroke="${BORD}"/>
      ${texte(ZX + 14, ZY + 338, "SELECT strftime('%m', quand) AS mois, COUNT(*) FROM rencontres GROUP BY mois", { taille: 12, couleur: '#C9D1D9', police: MONO })}`, 0.003);
    m += etat(ZX, ZY + 12, [
      [A(k), dans(k, 0.66), t('Chaque rencontre tombe dans son mois : la base compte, l’appli dessine.', 'Each encounter falls into its month: the database counts, the app draws.'), VIOLET],
      [dans(k, 0.66), dans(k, 0.74), t('+136 % : (78 − 33) / 33, face aux 33 de 2025.', '+136%: (78 − 33) / 33, against 2025’s 33.'), VERT],
      [dans(k, 0.74), B(k), t('Le podium : la moyenne des notes, puis le nombre de fois.', 'The podium: the average rating, then the number of times.'), OR],
    ]);
    meca.push(m);
  }

  // ============================================================== 4. la carte
  {
    const k = 3;
    const MX = SX + 12, MY = SY + 62, ML = SL - 24, MH = 250;
    const vue = france(MX, MY, ML, MH, [-4.9, 46.75, -1.2, 48.9]);
    const clip = O.id('fcCarte');
    const villes = [
      ['Vannes', -2.760, 47.658, 61], ['Rennes', -1.678, 48.117, 15], ['Lorient', -3.370, 47.748, 10],
      ['Nantes', -1.554, 47.218, 6], ['Auray', -2.981, 47.668, 4], ['Quimper', -4.097, 47.996, 2],
    ];
    const rayon = (n) => 13 + Math.sqrt(Math.min(1, n / 61)) * 8;
    const pts = Object.fromEntries(villes.map(([v, lo, la]) => [v, vue.proj(lo, la)]));
    const F = [(pts.Vannes[0] + pts.Auray[0]) / 2, (pts.Vannes[1] + pts.Auray[1]) / 2];
    const Z = 3.4, zin = [dans(k, 0.5), dans(k, 0.58)], zout = [dans(k, 0.84), dans(k, 0.92)];
    const zoome = (p) => [F[0] + (p[0] - F[0]) * Z, F[1] + (p[1] - F[1]) * Z];
    // Le zoom : translate(F) scale(z) translate(-F), le trait gardant son épaisseur.
    const echelle = `<animateTransform attributeName="transform" type="scale" additive="sum" dur="${C}s" repeatCount="indefinite"
      keyTimes="0;${zin[0]};${zin[1]};${zout[0]};${zout[1]};1" values="1;1;${Z};${Z};1;1"/>`;
    let s = `${titreEcran(t('TES LIEUX', 'YOUR PLACES'), t('11 Villes', '11 Cities'))}
      <clipPath id="${clip}"><rect x="${MX}" y="${MY}" width="${ML}" height="${MH}" rx="18"/></clipPath>
      <rect x="${MX}" y="${MY}" width="${ML}" height="${MH}" rx="18" fill="#1B0C36" stroke="${APP.bord}"/>
      <g clip-path="url(#${clip})">
        <g transform="translate(${r1(F[0])} ${r1(F[1])})">${echelle}<g transform="translate(${r1(-F[0])} ${r1(-F[1])})">
          <path d="${vue.terre}" fill="#2C1857" stroke="${APP.violet}" stroke-opacity="0.6" stroke-width="1" vector-effect="non-scaling-stroke" opacity="0">${fondu('opacity', C, [[0, 0], [A(k), 0], [dans(k, 0.06), 1], [1, 1]])}</path>
          <path d="${vue.departements}" fill="none" stroke="${APP.violet}" stroke-opacity="0.2" stroke-width="0.8" vector-effect="non-scaling-stroke"/>
        </g></g>`;
    // Les navettes, de la ville principale vers chaque autre.
    villes.slice(1).forEach(([v], i) => {
      if (v === 'Auray') return;
      const [x1, y1] = pts.Vannes, [x2, y2] = pts[v];
      const ch = `M${r1(x1)} ${r1(y1)} Q${r1((x1 + x2) / 2)} ${r1(Math.min(y1, y2) - 26)} ${r1(x2)} ${r1(y2)}`;
      s += `<path d="${ch}" fill="none" stroke="${APP.rose}" stroke-opacity="0.35" stroke-dasharray="3 4" opacity="0">${visible(C, dans(k, 0.3), zin[0], 0.003)}${visible(C, zout[1], B(k), 0.003)}</path>`;
      s += bille(ch, dans(k, 0.3 + i * 0.02), dans(k, 0.42 + i * 0.02), APP.rose);
    });
    // Les pastilles tombent, les plus grosses d'abord.
    const pastilleVille = (nom, n, p0, p1, de, a, principale = false, chute = true) => {
      const r = rayon(n), h = chute ? 30 : 0;
      const et = [[0, `${r1(p0[0])} ${r1(p0[1] - h)}`], [de, `${r1(p0[0])} ${r1(p0[1] - h)}`], [de + 0.006, `${r1(p0[0])} ${r1(p0[1])}`]];
      if (p1) et.push([zin[0], `${r1(p0[0])} ${r1(p0[1])}`], [zin[1], `${r1(p1[0])} ${r1(p1[1])}`], [zout[0], `${r1(p1[0])} ${r1(p1[1])}`], [zout[1], `${r1(p0[0])} ${r1(p0[1])}`]);
      et.push([1, `${r1(p0[0])} ${r1(p0[1])}`]);
      return `<g opacity="0">${fondu('opacity', C, [[0, 0], [de, 0], [de + 0.004, 1], [a, 1], [a + 0.003, 0], [1, 0]])}<g>${glisse(C, et)}
        ${principale ? [0, 1].map((j) => `<circle r="${r}" fill="none" stroke="${APP.rose}" stroke-width="2"><animate attributeName="r" dur="2.2s" begin="${j * 1.1}s" repeatCount="indefinite" values="${r};${r + 18}"/><animate attributeName="opacity" dur="2.2s" begin="${j * 1.1}s" repeatCount="indefinite" values="0.7;0"/></circle>`).join('') : ''}
        <circle r="${r}" fill="${principale ? APP.rose : APP.violet}" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="1.4"/>
        ${texte(0, 4, String(n), { taille: 11, couleur: principale ? '#3B0764' : '#FFFFFF', poids: 800, ancre: 'middle' })}
        ${texte(0, r + 11, nom.toUpperCase(), { taille: 7.5, couleur: '#FFFFFF', poids: 800, ancre: 'middle', extra: 'letter-spacing="0.8"' })}
      </g></g>`;
    };
    villes.forEach(([v, , , n], i) => {
      if (v === 'Vannes' || v === 'Auray') return;
      s += pastilleVille(v, n, pts[v], zoome(pts[v]), dans(k, 0.08 + i * 0.03), B(k));
    });
    // Vannes et Auray : une bulle de 65, qui se sépare à l'approche.
    s += pastilleVille('Vannes', 65, pts.Vannes, zoome(pts.Vannes), dans(k, 0.08), zin[1] - 0.004, true);
    s += pastilleVille('Vannes', 65, pts.Vannes, null, zout[1] - 0.002, B(k), true, false);
    s += pastilleVille('Vannes', 61, zoome(pts.Vannes), null, zin[1] - 0.004, zout[0], true, false) + pastilleVille('Auray', 4, zoome(pts.Auray), null, zin[1] - 0.004, zout[0], false, false);
    s += `</g>`;
    // Le doigt qui pince, puis le bouton qui ramène.
    const fx = F[0], fy = F[1];
    const doigt = (d0, d1) => `<circle r="12" fill="#FFFFFF" fill-opacity="0.28" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.5" opacity="0">
      ${visible(C, zin[0] - 0.004, zin[1], 0.002)}
      ${fondu('cx', C, [[0, fx + d0[0]], [zin[0], fx + d0[0]], [zin[1], fx + d1[0]], [1, fx + d1[0]]])}
      ${fondu('cy', C, [[0, fy + d0[1]], [zin[0], fy + d0[1]], [zin[1], fy + d1[1]], [1, fy + d1[1]]])}</circle>`;
    s += doigt([-8, 6], [-50, 40]) + doigt([8, -6], [50, -40]);
    s += `<rect x="${MX + ML - 52}" y="${MY + 10}" width="42" height="22" rx="11" fill="${APP.fond}" fill-opacity="0.75" stroke="${APP.bord}"/>`;
    s += compteur(MX + ML - 31, MY + 25, [t('4,3×', '4.3×'), t('14,6×', '14.6×'), t('4,3×', '4.3×')], [0, zin[1], zout[1]], B(k), { taille: 9.5, couleur: APP.texte, poids: 700, ancre: 'middle' });
    s += toucher(MX + ML - 31, MY + 21, C, zout[0] - 0.004);
    // Le classement dessous.
    s += `${panneau(MX, MY + MH + 12, ML, 142)}${petit(MX + 16, MY + MH + 36, t('CLASSEMENT', 'RANKING'))}`;
    [['Vannes', 61, '55 %'], ['Rennes', 15, '14 %'], ['Lorient', 10, '9 %']].forEach(([nom, n, pc], i) => {
      const y = MY + MH + 60 + i * 30, lb = ML - 32, de = dans(k, 0.2 + i * 0.04);
      s += `${texte(MX + 16, y, nom, { taille: 11, couleur: APP.texte, poids: 700 })}
        ${texte(MX + ML - 48, y, String(n), { taille: 11, couleur: APP.texte, poids: 800, ancre: 'end' })}
        ${texte(MX + ML - 16, y, virgule(pc), { taille: 8.5, couleur: APP.second, ancre: 'end' })}
        <rect x="${MX + 16}" y="${y + 7}" width="${lb}" height="5" rx="2.5" fill="#FFFFFF" fill-opacity="0.06"/>
        <rect x="${MX + 16}" y="${y + 7}" height="5" rx="2.5" width="0" fill="${i === 0 ? APP.fuchsia : APP.violet}">${fondu('width', C, [[0, 0], [de, 0], [de + 0.012, r1(lb * n / 61)], [1, r1(lb * n / 61)]])}</rect>`;
    });
    s += barreNav(T, 'Carte');
    scenes.push(s);

    // À droite : la France entière et le cadre de la vue, puis la règle.
    let m = '';
    const fr = france(ZX, ZY + 40, 250, 250, [-5.3, 42.2, 8.3, 51.2], { tolerance: 0.03 });
    const [ax, ay] = fr.proj(-4.9, 48.9), [bx2, by2] = fr.proj(-1.2, 46.75);
    m += `<rect x="${ZX}" y="${ZY + 40}" width="250" height="250" rx="12" fill="#0A0E14" stroke="${BORD}"/>
      <path d="${fr.terre}" fill="#1D1533" stroke="${VIOLET}" stroke-opacity="0.5" stroke-width="0.8"/>
      <rect x="${r1(ax)}" y="${r1(ay)}" width="${r1(bx2 - ax)}" height="${r1(by2 - ay)}" fill="${ACCENT}" fill-opacity="0.12" stroke="${ACCENT}" stroke-width="1.5" opacity="0">${visible(C, dans(k, 0.04), B(k), 0.003)}</rect>
      ${texte(ZX + 125, ZY + 308, t('la vue d’ouverture, sur la France entière', 'the opening view, over all of France'), { taille: 11, couleur: DISCRET, ancre: 'middle' })}`;
    const [vx, vy] = fr.proj(-2.76, 47.66);
    m += `<circle cx="${r1(vx)}" cy="${r1(vy)}" r="3" fill="${APP.rose}"/>`;
    // Le cadrage.
    const cx = ZX + 280, cl = ZL - 280;
    m += carte(cx, ZY + 40, cl, 118, t('Serrée sur tes villes', 'Tight on your cities'), t('De la principale, de proche en proche,', 'From the main one, nearest first,'), ACCENT,
      { allume: [dans(k, 0.04), dans(k, 0.46)], cycle: C, sous2: t('jusqu’aux deux tiers des rencontres.', 'up to two thirds of the encounters.') });
    m += entre(C, dans(k, 0.14), B(k), texte(cx + cl - 20, ZY + 76, t('61 + 4 + 10 = 75 sur 111', '61 + 4 + 10 = 75 of 111'), { taille: 12, couleur: VERT, police: MONO, poids: 700, ancre: 'end' }), 0.003);
    // La règle du regroupement, en deux temps.
    const ry = ZY + 176;
    m += `<rect x="${cx}" y="${ry}" width="${cl}" height="136" rx="13" fill="${CARTE}" stroke="${BORD}"/>`;
    m += texte(cx + 20, ry + 28, t('Deux disques qui se touchent font une bulle', 'Two disks that touch make one bubble'), { taille: 14, couleur: TITRE, poids: 700 });
    const d0 = Math.hypot(pts.Vannes[0] - pts.Auray[0], pts.Vannes[1] - pts.Auray[1]);
    const seuil = Math.round(rayon(61) + rayon(4) + 5);
    m += entre(C, A(k), zin[1], texte(cx + 20, ry + 60, t(`écart ${Math.round(d0)} pt < ${seuil} pt : une seule bulle, 65`, `gap ${Math.round(d0)} pt < ${seuil} pt: a single bubble, 65`), { taille: 13, couleur: ACCENT, police: MONO, poids: 700 }), 0.003);
    m += entre(C, zin[1], zout[1], texte(cx + 20, ry + 60, t(`écart ${Math.round(d0 * Z)} pt ≥ ${seuil} pt : Vannes 61, Auray 4`, `gap ${Math.round(d0 * Z)} pt ≥ ${seuil} pt: Vannes 61, Auray 4`), { taille: 13, couleur: VERT, police: MONO, poids: 700 }), 0.003);
    m += entre(C, zout[1], B(k), texte(cx + 20, ry + 60, t('retour à 4,3× : la bulle se referme', 'back to 4.3×: the bubble closes again'), { taille: 13, couleur: ACCENT, police: MONO, poids: 700 }), 0.003);
    m += texte(cx + 20, ry + 88, t('Les disques ne bougent jamais d’un point :', 'The disks never move by a single point:'), { taille: 12.5 });
    m += texte(cx + 20, ry + 108, t('c’est en s’approchant qu’ils se séparent.', 'moving closer is what splits them.'), { taille: 12.5, couleur: VERT });
    m += etat(ZX, ZY + 12, [
      [A(k), dans(k, 0.3), t('La vraie côte, lue dans france.bin : pas une tuile, pas une requête.', 'The real coastline, read from france.bin: not one tile, not one request.'), BLEU],
      [dans(k, 0.3), zin[0], t('Deux ondes sur la ville principale, une navette vers chaque autre.', 'Two ripples on the main city, a shuttle to every other.'), APP.rose],
      [zin[0], zout[0], t('Un pincement sur le golfe : la bulle de 65 se sépare.', 'A pinch on the gulf: the 65 bubble splits.'), VERT],
      [zout[0], B(k), t('Le bouton du zoom ramène la vue d’ouverture.', 'The zoom button brings back the opening view.'), ACCENT],
    ]);
    meca.push(m);
  }

  // ========================================================= 5. le calendrier
  {
    const k = 4, X = SX + 12, L = SL - 24, touche = dans(k, 0.56), tri = dans(k, 0.64);
    const RANG = ['🤑', '💰', '💵', '👑', '⭐', '🔥', '🎂', '✨', '❤️', '🏁', '📅', '🌙', '🌅', '🌃', '🕐', '⚡', '✈️', '🏖️', '🚗', '🌲', '🏠', '🛏️', '🍆', '🍑', '♾️'];
    const rang = (e) => RANG.indexOf(e) + 1;
    const pleins = {
      2: ['🔥', '🏠'], 5: ['🌙'], 9: ['💵', '🏠'], 12: ['⭐'], 14: ['🌙', '🏠'], 15: ['🌅'], 16: ['🍆'], 17: ['🌃'],
      18: ['🏠'], 19: ['👑', '🌙'], 20: ['🌙', '🍑'], 21: ['🔥', '🏠'], 22: ['🌃'], 23: ['💵', '👑', '✨'], 25: ['✈️'], 26: ['🛏️'],
    };
    let s = `${titreEcran(t('CALENDRIER', 'CALENDAR'), t('111 Rencontres', '111 Encounters'))}
      ${pastille(SX + 14, SY + 66, '2026', { plein: true, taille: 10 })}${pastille(SX + 74, SY + 66, '2025', { taille: 10 })}
      ${panneau(X, SY + 100, L, 290)}
      ${texte(SX + SL / 2, SY + 126, t('SEPTEMBRE 2026', 'SEPTEMBER 2026'), { taille: 11, couleur: '#E9D5FF', poids: 800, ancre: 'middle', extra: 'letter-spacing="1.2"' })}
      ${texte(SX + SL / 2, SY + 141, t('18 rencontres · 50 €', '18 encounters · €50'), { taille: 9, couleur: APP.second, ancre: 'middle' })}`;
    const col = (L - 20) / 7;
    (O.EN ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['L', 'M', 'M', 'J', 'V', 'S', 'D']).forEach((j, i) => {
      s += texte(X + 10 + col * i + col / 2, SY + 164, j, { taille: 9, couleur: APP.discret, poids: 700, ancre: 'middle' });
    });
    const jours = Object.keys(pleins).map(Number);
    for (let d = 1; d <= 30; d++) {
      const pos = d + 1, i = pos % 7, ligne = Math.floor(pos / 7);
      const cx = r1(X + 10 + col * i + col / 2), cy = SY + 188 + ligne * 40;
      s += texte(cx, cy + 3.5, String(d), { taille: 9.5, couleur: APP.discret, ancre: 'middle' });
      if (!pleins[d]) continue;
      const de = dans(k, 0.04 + jours.indexOf(d) * 0.028);
      const or = pleins[d].some((e) => ['🤑', '💰', '💵'].includes(e));
      const tries = [...pleins[d]].sort((a, b) => rang(a) - rang(b)).slice(0, 3);
      s += `<circle cx="${cx}" cy="${cy}" r="0" fill="${or ? APP.or : APP.violet}">${fondu('r', C, [[0, 0], [de, 0], [de + 0.004, 14], [de + 0.007, 12], [1, 12]])}</circle>
        <g opacity="0">${fondu('opacity', C, [[0, 0], [de + 0.003, 0], [de + 0.006, 1], [1, 1]])}
          ${texte(cx, cy + 3.5, String(d), { taille: 9.5, couleur: or ? '#3A2606' : '#FFFFFF', poids: 800, ancre: 'middle' })}
          ${emoji(cx, cy + 22, tries.join(''), 6.5)}
        </g>`;
      if (d === 23) s += `<circle cx="${cx}" cy="${cy}" r="14.5" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0">${visible(C, touche, B(k), 0.003)}</circle>${toucher(cx, cy, C, touche)}`;
    }
    s += entre(C, A(k), touche, `${petit(SX + 18, SY + 412, t('SEPTEMBRE · 18 RENCONTRES', 'SEPTEMBER · 18 ENCOUNTERS'), APP.texte)}
      ${panneau(X, SY + 422, L, 54)}${visage(GENS.malo.photo, X + 10, SY + 429, 40, 40, 11)}
      ${texte(X + 60, SY + 445, GENS.malo.prenom, { taille: 12, couleur: APP.texte, poids: 800 })}${etoiles(X + 60, SY + 460, 7, { taille: 8 })}`, 0.003);
    s += entre(C, touche, B(k), `${petit(SX + 18, SY + 412, t('MERCREDI 23', 'WEDNESDAY 23'), APP.texte)}
      ${panneau(X, SY + 422, L, 54)}${visage(GENS.enzo.photo, X + 10, SY + 429, 40, 40, 11)}
      ${texte(X + 60, SY + 445, 'Enzo P.', { taille: 12, couleur: APP.texte, poids: 800 })}${etoiles(X + 60, SY + 460, 9, { taille: 8 })}
      ${emoji(X + L - 30, SY + 454, '💵👑', 11)}`, 0.003);
    s += barreNav(T, 'Agenda');
    scenes.push(s);

    // Le tri des signes du 23, comme calendrier.svg.
    let m = '';
    const calcules = ['🍑', '🌙', '✨', '💵', '🛏️', '👑'];
    const tries = [...calcules].sort((a, b) => rang(a) - rang(b));
    const pas = 104, x0 = ZX + 70, y0 = ZY + 110;
    m += `<rect x="${ZX}" y="${ZY + 36}" width="${ZL}" height="170" rx="13" fill="${CARTE}" stroke="${BORD}"/>`;
    m += entre(C, A(k), touche, texte(ZX + ZL / 2, ZY + 128, t('Les jours se remplissent. Touche un jour : ses signes passent au tri.', 'The days fill in. Touch a day: its signs get sorted.'), { taille: 14, couleur: DISCRET, ancre: 'middle' }), 0.003);
    let tri2 = texte(ZX + 20, ZY + 64, t('Mercredi 23 : six signes s’appliquent, trois tiennent sous le disque.', 'Wednesday 23: six signs apply, three fit under the disc.'), { taille: 13.5, couleur: TITRE, poids: 700 });
    calcules.forEach((e, i) => {
      const j = tries.indexOf(e), dx = (i - j) * pas, xj = x0 + j * pas, garde = j < 3;
      tri2 += `<g>${garde ? '' : fondu('opacity', C, [[0, 1], [tri + 0.03, 1], [tri + 0.04, 0.28], [1, 0.28]])}
        <g>${glisse(C, [[0, `${dx} 0`], [tri, `${dx} 0`], [tri + 0.02, '0 0'], [1, '0 0']])}${emoji(xj, y0 + 24, e, 30)}</g>
        ${entre(C, tri + 0.022, B(k), texte(xj, y0 + 58, `n° ${rang(e)}`, { taille: 12, couleur: garde ? ACCENT : DISCRET, police: MONO, poids: 700, ancre: 'middle' }), 0.003)}</g>`;
    });
    tri2 += `<g opacity="0">${visible(C, tri + 0.04, B(k), 0.003)}
      <path d="M${x0 - 30} ${y0 + 72} v8 H${x0 + 2 * pas + 30} v-8" fill="none" stroke="${ACCENT}" stroke-width="1.6"/>
      ${texte(x0 + pas, y0 + 96, t('sous le jour', 'under the day'), { taille: 12, couleur: ACCENT, poids: 700, ancre: 'middle' })}</g>`;
    m += entre(C, touche, B(k), tri2, 0.003);
    // Ce que dit une case.
    const cases = [
      [t('chiffre effacé', 'faded number'), t('rien ce jour-là', 'nothing that day'), null],
      [t('disque violet', 'violet disc'), t('au moins une rencontre', 'at least one encounter'), APP.violet],
      [t('disque doré', 'gold disc'), t('ça a rapporté', 'it brought something in'), APP.or],
      [t('cerclé de blanc', 'ringed in white'), t('le jour touché', 'the day touched'), '#FFFFFF'],
    ];
    cases.forEach(([a, b, c], i) => {
      const x = ZX + i * (ZL / 4), y = ZY + 222;
      m += `<rect x="${x + 4}" y="${y}" width="${ZL / 4 - 8}" height="84" rx="12" fill="${CARTE}" stroke="${BORD}"/>
        ${c === null ? texte(x + 36, y + 47, '4', { taille: 13, couleur: DISCRET, ancre: 'middle' })
          : c === '#FFFFFF' ? `<circle cx="${x + 36}" cy="${y + 42}" r="12" fill="${APP.violet}"/><circle cx="${x + 36}" cy="${y + 42}" r="15" fill="none" stroke="#FFFFFF" stroke-width="2"/>`
            : `<circle cx="${x + 36}" cy="${y + 42}" r="13" fill="${c}"/>`}
        ${texte(x + 64, y + 38, a, { taille: 12.5, couleur: TITRE, poids: 700 })}
        ${texte(x + 64, y + 56, b, { taille: 11.5 })}`;
    });
    m += etat(ZX, ZY + 12, [
      [A(k), touche, t('Chaque jour plein prend son disque, et ses signes les plus rares dessous.', 'Every busy day gets its disc, and its rarest signs below.'), VIOLET],
      [touche, B(k), t('Tous tirés de ce qui est déjà saisi : rien à remplir en plus.', 'All drawn from what is already entered: nothing extra to fill in.'), ACCENT],
    ]);
    meca.push(m);
  }

  // ======================================================= 6. la galerie privée
  {
    const k = 5, ajoute = dans(k, 0.08), choisi = dans(k, 0.22), chiffre = [dans(k, 0.26), dans(k, 0.5)], arrive = dans(k, 0.52), ouvre = dans(k, 0.74);
    const L3 = (SL - 48) / 3;
    const vign = (x, y, n, video = false) => `${visage(n, x, y, L3, L3, 12)}
      ${video ? `<circle cx="${x + L3 / 2}" cy="${y + L3 / 2}" r="13" fill="#000000" fill-opacity="0.55"/>${icone('lecture', x + L3 / 2 - 6, y + L3 / 2 - 8, '#FFFFFF', 1)}` : ''}
      <rect x="${x + 6}" y="${y + 6}" width="18" height="18" rx="6" fill="${APP.fond}" fill-opacity="0.7"/>${icone('cadenas', x + 7.5, y + 7.5, APP.rose, 0.95)}`;
    const nouvelle = `<g opacity="0">${fondu('opacity', C, [[0, 0], [arrive, 0], [arrive + 0.004, 1], [1, 1]])}<g>${glisse(C, [[0, '0 18'], [arrive, '0 18'], [arrive + 0.006, '0 0'], [1, '0 0']])}${vign(SX + 36 + 2 * L3, SY + 98, GENS.enzo.photo)}</g></g>`;
    const galerie = `${texte(SX + 20, SY + 48, '‹', { taille: 24, couleur: APP.texte })}
      ${texte(SX + 44, SY + 48, t('Photos et vidéos', 'Photos and videos'), { taille: 18, couleur: APP.texte, poids: 800 })}
      ${compteur(SX + 18, SY + 86, [t('GALERIE · 2', 'GALLERY · 2'), t('GALERIE · 3', 'GALLERY · 3')], [0, arrive], B(k), { taille: 9.5, couleur: APP.second, poids: 700, extra: 'letter-spacing="1.4"' })}
      ${vign(SX + 12, SY + 98, 12)}${vign(SX + 24 + L3, SY + 98, 12, true)}
      <rect x="${SX + 36 + 2 * L3}" y="${SY + 98}" width="${L3}" height="${L3}" rx="12" fill="none" stroke="${APP.bord}" stroke-dasharray="4 4"/>
      ${nouvelle}
      <rect x="${SX + 12}" y="${SY + 390}" width="${SL - 24}" height="70" rx="16" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${icone('cadenas', SX + 28, SY + 410, APP.rose, 1.1)}
      ${texte(SX + 56, SY + 419, t('Chiffrées dans le coffre de l’appli.', 'Encrypted in the app’s vault.'), { taille: 10.5, couleur: APP.texte, poids: 700 })}
      ${texte(SX + 56, SY + 437, t('Rien dans la galerie du téléphone.', 'Nothing in the phone’s gallery.'), { taille: 10, couleur: APP.second })}
      ${bouton(SX + SL - 118, SY + SH - 62, 106, 38, t('Ajouter', 'Add'), { taille: 12 })}
      ${toucher(SX + SL - 65, SY + SH - 43, C, ajoute)}
      ${toucher(SX + 36 + 2.5 * L3, SY + 98 + L3 / 2, C, ouvre - 0.006)}`;
    // Le sélecteur d'Android : une feuille claire, des vignettes en clair.
    const sel = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.5"/>
      <rect x="${SX}" y="${SY + 170}" width="${SL}" height="${SH - 170}" rx="22" fill="#F2F0F7"/>
      ${texte(SX + 20, SY + 204, t('Sélectionner des éléments', 'Select items'), { taille: 13, couleur: '#1D1B22', poids: 700 })}
      ${[12, 1, 10, 5, 3, 7].map((n, i) => visage(n, SX + 14 + (i % 3) * 83, SY + 222 + Math.floor(i / 3) * 83, 78, 78, 4)).join('')}
      <circle cx="${SX + 84}" cy="${SY + 232}" r="9" fill="#FFFFFF" stroke="#6750A4" stroke-width="2"/>
      <g opacity="0">${visible(C, choisi, chiffre[0], 0.002)}<circle cx="${SX + 84}" cy="${SY + 232}" r="9" fill="#6750A4"/>${icone('coche', SX + 78, SY + 226, '#FFFFFF', 0.75)}</g>
      ${toucher(SX + 53, SY + 261, C, choisi)}`;
    const attente = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.5"/>
      <rect x="${SX + 16}" y="${SY + 250}" width="${SL - 32}" height="70" rx="20" fill="${APP.surface}" stroke="${APP.bord}"/>
      <circle cx="${SX + 48}" cy="${SY + 285}" r="11" fill="none" stroke="${APP.violet}" stroke-width="3" stroke-dasharray="44 26">
        <animateTransform attributeName="transform" type="rotate" from="0 ${SX + 48} ${SY + 285}" to="360 ${SX + 48} ${SY + 285}" dur="0.9s" repeatCount="indefinite"/></circle>
      ${texte(SX + 72, SY + 290, t('Chiffrement, 1 sur 1…', 'Encrypting, 1 of 1…'), { taille: 12, couleur: APP.texte, poids: 700 })}`;
    const visionneuse = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000"/>
      ${icone('croix', SX + 18, SY + 30, '#FFFFFF', 0.9)}
      ${texte(SX + SL / 2, SY + 43, '3 / 3', { taille: 12, couleur: '#FFFFFF', poids: 700, ancre: 'middle' })}
      ${icone('telecharger', SX + SL - 34, SY + 30, '#FFFFFF', 1)}
      <g>${glisse(C, [[0, '0 30'], [ouvre, '0 30'], [ouvre + 0.008, '0 0'], [1, '0 0']])}${visage(GENS.enzo.photo, SX, SY + 140, SL, SL, 0)}</g>`;
    scenes.push(entre(C, A(k), B(k), galerie, 0.002) + entre(C, ajoute + 0.004, chiffre[0], sel, 0.003) + entre(C, chiffre[0], arrive, attente, 0.003) + entre(C, ouvre, B(k), visionneuse, 0.003));

    // La photo passe au coffre et se brouille, comme coffre.svg.
    let m = '';
    const flou = O.id('flou');
    m += `<filter id="${flou}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="0">
      <animate attributeName="stdDeviation" dur="${C}s" repeatCount="indefinite" keyTimes="0;${chiffre[0]};${chiffre[1]};1" values="0;0;9;9"/></feGaussianBlur></filter>`;
    const bx = [ZX, ZX + 290, ZX + 580], by = ZY + 40, bw = 196, bh = 176;
    m += `<rect x="${bx[0]}" y="${by}" width="${bw}" height="${bh}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(bx[0] + 16, by + 26, t('Le sélecteur', 'The picker'), { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(bx[0] + 16, by + 44, t('une copie, en clair', 'a copy, in the clear'), { taille: 11.5 })}
      <rect x="${bx[1]}" y="${by}" width="${bw}" height="${bh}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${bx[1]}" y="${by}" width="${bw}" height="${bh}" rx="13" fill="none" stroke="${FUCHSIA}" stroke-width="1.5" opacity="0">${visible(C, chiffre[0], B(k), 0.003)}</rect>
      ${icone('cadenas', bx[1] + 16, by + 14, FUCHSIA, 1)}
      ${texte(bx[1] + 38, by + 26, 'vault/', { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(bx[1] + 16, by + 44, t('AES-256-GCM, un seul bloc', 'AES-256-GCM, one block'), { taille: 11.5 })}
      <rect x="${bx[2]}" y="${by}" width="${bw}" height="${bh}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${bx[2]}" y="${by}" width="${bw}" height="${bh}" rx="13" fill="none" stroke="${VERT}" stroke-width="1.5" opacity="0">${visible(C, ouvre, B(k), 0.003)}</rect>
      ${texte(bx[2] + 16, by + 26, t('Mémoire vive', 'Memory'), { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(bx[2] + 16, by + 44, t('déchiffrée pour l’écran', 'decrypted for the screen'), { taille: 11.5 })}`;
    // La photo voyage : claire, brouillée dans le coffre, claire en mémoire.
    const px = (i) => bx[i] + bw / 2 - 45, py = by + 64;
    m += `<g opacity="0">${fondu('opacity', C, [[0, 0], [choisi, 0], [choisi + 0.004, 1], [B(k), 1], [B(k) + 0.002, 0], [1, 0]])}
      <g>${glisse(C, [[0, `${px(0)} ${py}`], [chiffre[0], `${px(0)} ${py}`], [chiffre[1], `${px(1)} ${py}`], [1, `${px(1)} ${py}`]])}
        <g filter="url(#${flou})">${visage(GENS.enzo.photo, 0, 0, 90, 90, 12)}</g>
        <rect width="90" height="90" rx="12" fill="${FUCHSIA}" fill-opacity="0">${fondu('fill-opacity', C, [[0, 0], [chiffre[0], 0], [chiffre[1], 0.35], [1, 0.35]])}</rect>
      </g></g>`;
    m += `<g opacity="0">${visible(C, ouvre + 0.01, B(k), 0.003)}${visage(GENS.enzo.photo, px(2), py, 90, 90, 12)}</g>`;
    m += bille(`M${bx[1] + bw} ${by + bh / 2} H${bx[2]}`, ouvre, ouvre + 0.012, VERT);
    m += fil(`M${bx[0] + bw} ${by + bh / 2} H${bx[1]}`, chiffre[0], B(k), FUCHSIA) + fil(`M${bx[1] + bw} ${by + bh / 2} H${bx[2]}`, ouvre, B(k), VERT);
    // La copie du sélecteur, effacée.
    m += `<g opacity="0">${visible(C, chiffre[1], B(k), 0.003)}
      <rect x="${bx[0] + 53}" y="${py}" width="90" height="90" rx="12" fill="none" stroke="${ROUGE}" stroke-dasharray="4 4"/>
      ${texte(bx[0] + 98, py + 50, t('effacée', 'deleted'), { taille: 12, couleur: ROUGE, poids: 700, ancre: 'middle' })}</g>`;
    m += entre(C, arrive, B(k), texte(bx[1] + 16, by + bh - 14, '3f9c…a1.bcx · BCX1', { taille: 11, couleur: FUCHSIA, police: MONO, poids: 700 }), 0.003);
    // La galerie du téléphone, où rien n'arrive.
    const gy = ZY + 236;
    m += `<rect x="${ZX}" y="${gy}" width="${ZL}" height="90" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(ZX + 16, gy + 24, t('LA GALERIE DU TÉLÉPHONE', 'THE PHONE’S GALLERY'), { taille: 11, couleur: DISCRET, police: MONO, poids: 700, extra: 'letter-spacing="2"' })}`;
    ['#C2527F', '#6D5BD0', '#D08A3E', '#3E8FB0', '#4E9A6A', '#B85450', '#7A5FA8', '#C9A227', '#3A7CA5', '#8E6C4A'].forEach((c, i) => {
      m += `<rect x="${ZX + 16 + i * 44}" y="${gy + 36}" width="38" height="38" rx="6" fill="${c}" fill-opacity="0.75"/>`;
    });
    m += `${icone('coche', ZX + 470, gy + 48, VERT, 1)}
      ${texte(ZX + 494, gy + 56, t('Aucune photo de BodyCount ici.', 'No BodyCount photo here.'), { taille: 13, couleur: VERT, poids: 700 })}
      ${texte(ZX + 494, gy + 74, t('Ni les photos, ni leurs vignettes.', 'Neither photos nor thumbnails.'), { taille: 11.5 })}`;
    m += etat(ZX, ZY + 12, [
      [A(k), chiffre[0], t('Android rend une copie en clair : elle ne fait que passer.', 'Android hands over a copy in the clear: it only passes through.'), TEXTE],
      [chiffre[0], ouvre, t('Chiffrée dès l’arrivée, sous un nom qui ne dit rien, puis la copie effacée.', 'Encrypted on arrival, under a meaningless name, then the copy deleted.'), FUCHSIA],
      [ouvre, B(k), t('Pour l’afficher, déchiffrée en mémoire, jamais sur le disque.', 'To show it, decrypted in memory, never on disk.'), VERT],
    ]);
    meca.push(m);
  }

  // ====================================================== 7. la sauvegarde
  {
    const k = 6, touche = dans(k, 0.1), tape = [dans(k, 0.14), dans(k, 0.26)], exporte = dans(k, 0.3), fin = dans(k, 0.84);
    const ligne = (y, ic, titre, sous, valeur = '', c = APP.second) => `<rect x="${SX + 12}" y="${y}" width="${SL - 24}" height="56" rx="16" fill="${APP.carte}" stroke="${APP.bord}"/>
      <rect x="${SX + 24}" y="${y + 13}" width="30" height="30" rx="9" fill="${c}" fill-opacity="0.14"/>${picto(ic, SX + 31, y + 20, c)}
      ${texte(SX + 64, y + 25, titre, { taille: 11.5, couleur: APP.texte, poids: 700 })}
      ${sous ? texte(SX + 64, y + 41, sous, { taille: 9, couleur: APP.discret }) : ''}
      ${valeur ? texte(SX + SL - 24, y + 33, valeur, { taille: 9, couleur: APP.second, poids: 700, ancre: 'end' }) : ''}`;
    const fond = `${texte(SX + 20, SY + 48, '‹', { taille: 24, couleur: APP.texte })}
      ${texte(SX + 44, SY + 48, t('Réglages', 'Settings'), { taille: 21, couleur: APP.texte, poids: 800 })}
      <rect x="${SX + 12}" y="${SY + 70}" width="${SL - 24}" height="64" rx="18" fill="${APP.violet}" fill-opacity="0.12" stroke="${APP.bord}"/>
      ${logo(SX + 44, SY + 102, 38)}
      ${texte(SX + 74, SY + 98, t('18 Personnes', '18 People'), { taille: 14, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 74, SY + 115, t('111 Rencontres', '111 Encounters'), { taille: 9.5, couleur: APP.second })}
      ${petit(SX + 18, SY + 164, t('DONNÉES', 'DATA'))}
      ${ligne(SY + 176, 'shield', t('Tout reste sur ce téléphone', 'Everything stays on this phone'), t('Base chiffrée, aucun compte', 'Encrypted database, no account'), '', APP.vert)}
      ${ligne(SY + 240, 'ios_share', t('Exporter, chiffré', 'Export, encrypted'), '', t('Phrase de passe ›', 'Passphrase ›'), APP.violet)}
      ${entre(C, A(k), fin, texte(SX + 64, SY + 281, t('Dernière il y a 38 jours', 'Last one 38 days ago'), { taille: 9, couleur: APP.or }), 0.003)}
      ${entre(C, fin, B(k), texte(SX + 64, SY + 281, t('Dernière aujourd’hui', 'Last one today'), { taille: 9, couleur: APP.vert, poids: 700 }), 0.003)}
      ${ligne(SY + 304, 'settings_backup_restore', t('Restaurer une sauvegarde', 'Restore a backup'), t('Remplace ce qui est ici', 'Replaces what is here'), '.bcx')}
      ${toucher(SX + SL / 2, SY + 268, C, touche)}`;
    const dialogue = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
      <rect x="${SX + 16}" y="${SY + 170}" width="${SL - 32}" height="186" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${texte(SX + 36, SY + 206, t('Phrase de passe', 'Passphrase'), { taille: 16, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 36, SY + 228, t('Elle seule permettra de la relire.', 'Only it will read it back.'), { taille: 10, couleur: APP.second })}
      ${frappe(SX + 36, SY + 272, '••••••••••••', C, tape[0], tape[1], { taille: 14, couleur: APP.texte })}
      <rect x="${SX + 36}" y="${SY + 282}" width="${SL - 72}" height="2" fill="${APP.violet}"/>
      ${texte(SX + SL - 120, SY + 330, t('Annuler', 'Cancel'), { taille: 11.5, couleur: APP.second, poids: 700, ancre: 'end' })}
      ${texte(SX + SL - 36, SY + 330, t('Exporter', 'Export'), { taille: 11.5, couleur: APP.rose, poids: 800, ancre: 'end' })}
      ${toucher(SX + SL - 60, SY + 326, C, exporte - 0.004)}`;
    const attente = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.5"/>
      <rect x="${SX + 16}" y="${SY + 250}" width="${SL - 32}" height="70" rx="20" fill="${APP.surface}" stroke="${APP.bord}"/>
      <circle cx="${SX + 48}" cy="${SY + 285}" r="11" fill="none" stroke="${APP.violet}" stroke-width="3" stroke-dasharray="44 26">
        <animateTransform attributeName="transform" type="rotate" from="0 ${SX + 48} ${SY + 285}" to="360 ${SX + 48} ${SY + 285}" dur="0.9s" repeatCount="indefinite"/></circle>
      ${monte(SX + 72, SY + 290, 40, dans(k, 0.4), dans(k, 0.8), fin, { taille: 11.5, couleur: APP.texte, poids: 700 }, 8, (v) => t(`Chiffrement des médias, ${v} sur 40…`, `Encrypting media, ${v} of 40…`))}`;
    const fait = `<rect x="${SX + 12}" y="${SY + SH - 70}" width="${SL - 24}" height="44" rx="12" fill="#2E2640"/>
      ${texte(SX + 26, SY + SH - 43, t('Sauvegarde enregistrée.', 'Backup saved.'), { taille: 11.5, couleur: APP.texte })}`;
    scenes.push(fond + entre(C, touche + 0.004, exporte, dialogue, 0.003) + entre(C, exporte, fin, attente, 0.003) + entre(C, fin + 0.003, B(k), fait, 0.003));

    // La clé tirée de la phrase, puis le fichier qui s'écrit en flux.
    let m = '';
    const y0 = ZY + 40;
    m += carte(ZX, y0, 210, 70, t('ta phrase', 'your passphrase'), t('au moins 8 caractères', 'at least 8 characters'), ACCENT, { allume: [tape[0], B(k)], cycle: C });
    m += `<rect x="${ZX + 270}" y="${y0}" width="260" height="70" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${ZX + 270}" y="${y0}" width="260" height="70" rx="13" fill="none" stroke="${OR}" stroke-width="1.5" opacity="0">${visible(C, tape[1], B(k), 0.003)}</rect>
      ${texte(ZX + 290, y0 + 30, 'PBKDF2-HMAC-SHA256', { taille: 13.5, couleur: TITRE, police: MONO, poids: 700 })}
      ${monte(ZX + 290, y0 + 52, 210000, tape[1], exporte, B(k), { taille: 12, couleur: OR, police: MONO, poids: 700 }, 12, (v) => t(`${v.toLocaleString('fr-FR').replace(/ /g, ' ')} tours`, `${v.toLocaleString('en-US')} rounds`))}
      <circle cx="${ZX + 505}" cy="${y0 + 35}" r="11" fill="none" stroke="${OR}" stroke-width="2.5" stroke-dasharray="40 30" opacity="0">${visible(C, tape[1], exporte, 0.003)}
        <animateTransform attributeName="transform" type="rotate" from="0 ${ZX + 505} ${y0 + 35}" to="360 ${ZX + 505} ${y0 + 35}" dur="0.7s" repeatCount="indefinite"/></circle>`;
    m += carte(ZX + 590, y0, ZL - 590, 70, t('clé AES-256', 'AES-256 key'), t('elle chiffre tout le flux', 'it encrypts the whole stream'), VERT, { allume: [exporte, B(k)], cycle: C });
    m += fil(`M${ZX + 210} ${y0 + 35} H${ZX + 270}`, tape[1], B(k), ACCENT) + fil(`M${ZX + 530} ${y0 + 35} H${ZX + 590}`, exporte, B(k), OR);
    m += bille(`M${ZX + 210} ${y0 + 35} H${ZX + 270}`, tape[1] - 0.012, tape[1], ACCENT) + bille(`M${ZX + 530} ${y0 + 35} H${ZX + 590}`, exporte - 0.012, exporte, OR);
    // Le fichier : BCEX2, sel, donnees.json, puis les médias, puis 00.
    const fy = ZY + 150;
    m += texte(ZX, fy - 8, 'bodycount-2026-09-26.bcx', { taille: 12, couleur: DISCRET, police: MONO });
    const cells = [['BCEX2', 64, TEXTE], [t('sel', 'salt'), 50, OR], ['donnees.json', 118, BLEU]];
    for (let i = 0; i < 10; i++) cells.push(['', 40, FUCHSIA]);
    cells.push(['00', 34, TEXTE]);
    let cx = ZX;
    const ecrit = (i) => dans(k, 0.3 + (i / (cells.length - 1)) * 0.52);
    cells.forEach(([lib, w, c], i) => {
      const de = ecrit(i);
      m += `<rect x="${cx}" y="${fy}" width="${w - 4}" height="44" rx="8" fill="none" stroke="${FIL}" stroke-dasharray="4 4"/>
        <g opacity="0">${fondu('opacity', C, [[0, 0], [de, 0], [de + 0.004, 1], [B(k), 1], [B(k) + 0.002, 0], [1, 0]])}
          <rect x="${cx}" y="${fy}" width="${w - 4}" height="44" rx="8" fill="${c}" fill-opacity="0.18" stroke="${c}"/>
          ${lib ? texte(cx + (w - 4) / 2, fy + 27, lib, { taille: 11, couleur: c === TEXTE ? TITRE : c, police: MONO, poids: 700, ancre: 'middle' }) : icone('cadenas', cx + 10, fy + 14, c, 1)}
        </g>`;
      cx += w;
    });
    m += `<rect x="${ZX}" y="${fy + 52}" height="3" rx="1.5" width="0" fill="${VERT}">${fondu('width', C, [[0, 0], [ecrit(0), 0], [ecrit(cells.length - 1), cx - ZX - 4], [B(k), cx - ZX - 4], [B(k) + 0.002, 0], [1, 0]])}</rect>`;
    m += texte(ZX, fy + 80, t('en clair : la marque et le sel', 'in the clear: the mark and the salt'), { taille: 11.5, couleur: DISCRET });
    m += texte(ZX + 260, fy + 80, t('chiffrés par morceaux d’un mégaoctet : les fiches, puis chaque photo et vidéo', 'encrypted in one-megabyte chunks: the cards, then every photo and video'), { taille: 11.5, couleur: FUCHSIA });
    // La mémoire, qui ne tient jamais qu'un morceau.
    const my = ZY + 262;
    m += `<rect x="${ZX}" y="${my}" width="${ZL}" height="52" rx="12" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(ZX + 16, my + 32, t('EN MÉMOIRE', 'IN MEMORY'), { taille: 11, couleur: DISCRET, police: MONO, poids: 700, extra: 'letter-spacing="2"' })}
      <rect x="${ZX + 150}" y="${my + 20}" width="300" height="12" rx="6" fill="${FIL}" fill-opacity="0.5"/>
      <rect x="${ZX + 150}" y="${my + 20}" height="12" rx="6" width="0" fill="${VERT}">${fondu('width', C, [[0, 0], [exporte, 0], [exporte + 0.004, 60], [fin, 60], [fin + 0.003, 0], [1, 0]])}</rect>
      ${texte(ZX + 470, my + 31, t('un mégaoctet au plus, même pour une vidéo de 200 Mo', 'one megabyte at most, even for a 200 MB video'), { taille: 12, couleur: TEXTE })}`;
    m += etat(ZX, ZY + 12, [
      [A(k), tape[1], t('Une phrase de passe, pas la clé du téléphone : le fichier voyage.', 'A passphrase, not the phone’s key: the file travels.'), ACCENT],
      [tape[1], exporte, t('PBKDF2, 210 000 tours, un sel neuf de 16 octets.', 'PBKDF2, 210,000 rounds, a fresh 16-byte salt.'), OR],
      [exporte, fin, t('Le fichier s’écrit en flux, chaque média sorti du coffre et rechiffré.', 'The file is written as a stream, each media out of the vault and re-encrypted.'), FUCHSIA],
      [fin, B(k), t('Posé où tu veux ; la date notée fait taire le rappel un mois.', 'Saved where you want; the date noted quiets the reminder for a month.'), VERT],
    ]);
    meca.push(m);
  }

  // =================================================== 8. ce que ça rapporte
  {
    const k = 7, X = SX + 12, L = SL - 24;
    const gains = [50, 150, 100, 200, 50, 100, 100]; // 750 € sur 7 soirées
    const payees = [3, 11, 19, 30, 44, 58, 71]; // leur rang parmi les 78
    const arrivee = (i) => dans(k, 0.12 + i * 0.07);
    const cumul = gains.reduce((a, g) => [...a, a[a.length - 1] + g], [0]);
    const euros = (v) => t(`${v} €`, `€${v}`);
    let s = `${petit(SX + 18, SY + 36, t('STATISTIQUES', 'STATISTICS'), APP.texte)}
      ${texte(SX + 18, SY + 66, '2026', { taille: 26, couleur: APP.texte, poids: 800 })}
      ${panneau(X, SY + 86, L, 168)}
      <rect x="${X}" y="${SY + 86}" width="${L}" height="168" rx="18" fill="${APP.or}" fill-opacity="0.05"/>
      ${icone('euro', X + 16, SY + 100, APP.or, 0.8)}${petit(X + 34, SY + 112, t('CE QUE ÇA A RAPPORTÉ', 'WHAT IT BROUGHT IN'), APP.or)}
      ${compteur(X + 16, SY + 160, cumul.map(euros), [0, ...gains.map((_, i) => arrivee(i) + 0.02)], B(k), { taille: 36, couleur: APP.or, poids: 800 })}
      ${compteur(X + 16, SY + 214, cumul.map((_, i) => t(`sur ${i} soirée${i > 1 ? 's' : ''}, des 78 de l’année`, `over ${i} night${i > 1 ? 's' : ''}, of the year’s 78`)), [0, ...gains.map((_, i) => arrivee(i) + 0.02)], B(k), { taille: 9.5, couleur: APP.second })}
      <g opacity="0">${visible(C, dans(k, 0.66), B(k), 0.003)}
        ${texte(X + L - 16, SY + 148, t('107,14 €', '€107.14'), { taille: 14, couleur: APP.texte, poids: 800, ancre: 'end' })}
        ${texte(X + L - 16, SY + 164, t('en moyenne', 'on average'), { taille: 9, couleur: APP.second, ancre: 'end' })}</g>
      <rect x="${X + 16}" y="${SY + 188}" width="${L - 32}" height="6" rx="3" fill="#FFFFFF" fill-opacity="0.06"/>
      <rect x="${X + 16}" y="${SY + 188}" height="6" rx="3" width="0" fill="${APP.or}">${fondu('width', C, [[0, 0], ...gains.map((_, i) => [arrivee(i) + 0.02, r1(((L - 32) * cumul[i + 1]) / 750)]), [1, L - 32]])}</rect>
      ${texte(X + 16, SY + 236, t('La moyenne ne compte que les payées.', 'The average only counts paid ones.'), { taille: 9.5, couleur: APP.discret })}
      ${petit(SX + 18, SY + 286, t('LA DERNIÈRE', 'THE LATEST'))}
      ${panneau(X, SY + 298, L, 120)}
      ${visage(GENS.enzo.photo, X + 14, SY + 312, 40, 40, 11)}
      ${texte(X + 64, SY + 328, t('Enzo P. · 26 sept.', 'Enzo P. · 26 Sept.'), { taille: 12, couleur: APP.texte, poids: 800 })}
      ${texte(X + 64, SY + 344, 'Auray · 22h48', { taille: 9.5, couleur: APP.discret })}
      ${petit(X + 14, SY + 378, t('CE QUE ÇA A RAPPORTÉ', 'WHAT IT BROUGHT IN'))}
      <rect x="${X + 14}" y="${SY + 386}" width="${L - 28}" height="24" rx="10" fill="${APP.fond}" stroke="${APP.bord}"/>
      ${frappe(X + 26, SY + 402, '100', C, arrivee(6) - 0.03, arrivee(6) - 0.005, { taille: 11.5, couleur: APP.texte, poids: 700 })}
      ${texte(X + L - 26, SY + 402, '€', { taille: 11.5, couleur: APP.or, poids: 800, ancre: 'end' })}
      ${texte(X + 14, SY + 438, t('Vide, c’est rien : pas une fois à 0 €.', 'Empty means nothing: not a €0 night.'), { taille: 9.5, couleur: APP.discret })}
      ${barreNav(T, 'Stats')}`;
    scenes.push(s);

    // 78 points : 7 s'allument en or, leur montant file vers le total.
    let m = '';
    const gx = ZX + 16, gy = ZY + 60, col = 13, pas = 26;
    m += texte(ZX, ZY + 44, t('LES 78 RENCONTRES DE L’ANNÉE', 'THE YEAR’S 78 ENCOUNTERS'), { taille: 11, couleur: DISCRET, police: MONO, poids: 700, extra: 'letter-spacing="2"' });
    const tx = ZX + 400, ty = ZY + 60;
    for (let r = 0; r < 78; r++) {
      const x = gx + (r % col) * pas, y = gy + Math.floor(r / col) * pas, j = payees.indexOf(r);
      m += `<circle cx="${x}" cy="${y}" r="8" fill="${VIOLET}" fill-opacity="0.35"/>`;
      if (j < 0) continue;
      m += `<circle cx="${x}" cy="${y}" r="8" fill="${OR}" opacity="0">${fondu('opacity', C, [[0, 0], [arrivee(j), 0], [arrivee(j) + 0.003, 1], [B(k), 1], [B(k) + 0.002, 0], [1, 0]])}</circle>`;
      const ch = `M${x} ${y} Q${(x + tx + 60) / 2} ${y - 60} ${tx + 60} ${ty + 50}`;
      m += bille(ch, arrivee(j), arrivee(j) + 0.02, OR);
      m += `<g opacity="0">${visible(C, arrivee(j), arrivee(j) + 0.03, 0.003)}${texte(x, y - 13, `+${gains[j]}`, { taille: 11, couleur: OR, police: MONO, poids: 700, ancre: 'middle' })}</g>`;
    }
    m += `<rect x="${tx}" y="${ty}" width="${ZL - 400}" height="96" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${tx}" y="${ty}" width="${ZL - 400}" height="96" rx="13" fill="none" stroke="${OR}" stroke-width="1.5" opacity="0">${visible(C, arrivee(0), B(k), 0.003)}</rect>
      ${texte(tx + 20, ty + 28, t('Le total de l’année', 'The year’s total'), { taille: 13, couleur: TITRE, poids: 700 })}
      ${compteur(tx + 20, ty + 72, cumul.map(euros), [0, ...gains.map((_, i) => arrivee(i) + 0.02)], B(k), { taille: 34, couleur: OR, poids: 800 })}`;
    const fy = ty + 118;
    m += `<g opacity="0">${visible(C, dans(k, 0.66), B(k), 0.003)}
      <rect x="${tx}" y="${fy}" width="${ZL - 400}" height="112" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      ${texte(tx + 20, fy + 30, t('750 € ÷ 7 soirées payées', '€750 ÷ 7 paid nights'), { taille: 13, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(tx + 20, fy + 58, t('= 107,14 € en moyenne', '= €107.14 on average'), { taille: 16, couleur: VERT, police: MONO, poids: 700 })}
      ${texte(tx + 20, fy + 88, t('750 € ÷ 78 = 9,62 €', '€750 ÷ 78 = €9.62'), { taille: 12.5, couleur: DISCRET, police: MONO })}
      <line x1="${tx + 18}" y1="${fy + 84}" x2="${tx + 188}" y2="${fy + 84}" stroke="${ROUGE}" stroke-width="1.6"/>
      ${texte(tx + 200, fy + 88, t('ce serait faux', 'that would be wrong'), { taille: 11.5, couleur: ROUGE })}</g>`;
    m += etat(ZX, ZY + 12, [
      [A(k), dans(k, 0.66), t('Un montant par rencontre, en centimes : la plupart n’en ont pas.', 'An amount per encounter, in cents: most have none.'), OR],
      [dans(k, 0.66), B(k), t('La moyenne ne compte que les soirées payées.', 'The average only counts paid nights.'), VERT],
    ]);
    m += texte(ZX, ZY + 312, t('Un champ laissé vide veut dire rien, pas une soirée à zéro euro.', 'A field left empty means nothing, not a night worth zero.'), { taille: 12.5, couleur: TEXTE });
    meca.push(m);
  }

  // ======================================================= 9. tout se reprend
  {
    const k = 8, ouvre = dans(k, 0.1), note = dans(k, 0.3), garde = dans(k, 0.42), corbeille = dans(k, 0.58), dlg = dans(k, 0.62), annule = dans(k, 0.84);
    const X = SX + 12, L = SL - 24;
    const lignes = (n26) => [[t('26 sept.', '26 Sept.'), 'Auray · 22h48', n26], [t('14 sept.', '14 Sept.'), 'Auray · 22h22', 7], [t('2 sept.', '2 Sept.'), 'Vannes · 21h10', 8]];
    const fiche = (n26, flash) => {
      let s2 = `${visage(GENS.enzo.photo, SX, SY, SL, 190, 0)}
        <rect x="${SX}" y="${SY}" width="${SL}" height="190" fill="url(#voile)"/>
        ${texte(SX + 18, SY + 176, 'Enzo P.', { taille: 26, couleur: '#FFFFFF', poids: 800 })}
        ${petit(SX + 18, SY + 220, t('RENCONTRES · 8', 'ENCOUNTERS · 8'))}${texte(SX + SL - 18, SY + 220, t('Ajouter', 'Add'), { taille: 9.5, couleur: APP.violet, poids: 700, ancre: 'end' })}`;
      lignes(n26).forEach(([d, l, n], i) => {
        const y = SY + 232 + i * 56;
        s2 += `${panneau(X, y, L, 48)}
          ${i === 0 && flash ? `<rect x="${X}" y="${y}" width="${L}" height="48" rx="18" fill="none" stroke="${APP.vert}" stroke-width="1.6" opacity="0">${visible(C, flash[0], flash[1], 0.003)}</rect>` : ''}
          ${texte(X + 14, y + 21, d, { taille: 12, couleur: APP.texte, poids: 800 })}
          ${texte(X + 14, y + 37, l, { taille: 9, couleur: APP.discret })}
          ${etoiles(X + L - 86, y + 29, n, { taille: 9 })}${texte(X + L - 14, y + 29, '›', { taille: 14, couleur: APP.second, ancre: 'end' })}`;
      });
      return s2;
    };
    // Reprendre la rencontre : la note passe de 4 à 4,5.
    const formulaire = (edition) => `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="${APP.fond}"/>
      ${texte(SX + 18, SY + 48, '×', { taille: 22, couleur: APP.texte })}
      ${texte(SX + 44, SY + 48, t('Reprendre la rencontre', 'Edit the encounter'), { taille: 16, couleur: APP.texte, poids: 800 })}
      <rect x="${SX + SL - 44}" y="${SY + 26}" width="30" height="30" rx="10" fill="${APP.rouge}" fill-opacity="0.12"/>
      <path d="M${SX + SL - 36} ${SY + 35} h14 M${SX + SL - 34} ${SY + 35} v12 h10 v-12 M${SX + SL - 31} ${SY + 32} h4" fill="none" stroke="${APP.rouge}" stroke-width="1.6" stroke-linecap="round"/>
      ${panneau(X, SY + 80, L, 70)}${petit(X + 16, SY + 104, t('DATE ET HEURE', 'DATE AND TIME'))}${texte(X + 16, SY + 132, t('26 sept. · 22h48', '26 Sept. · 10:48 pm'), { taille: 14, couleur: APP.texte, poids: 700 })}
      ${panneau(X, SY + 160, L, 70)}${petit(X + 16, SY + 184, t('OÙ', 'WHERE'))}${texte(X + 16, SY + 212, 'Auray', { taille: 14, couleur: APP.texte, poids: 700 })}
      ${panneau(X, SY + 240, L, 100)}${petit(X + 16, SY + 264, t('TA NOTE', 'YOUR RATING'))}
      ${compteur(X + 16, SY + 296, [virgule('4,0'), virgule('4,5')], [0, note], B(k), { taille: 26, couleur: APP.texte, poids: 800 })}
      ${entre(C, A(k), note, etoiles(X + 16, SY + 330, 8, { taille: 20 }), 0.002)}${entre(C, note, B(k), etoiles(X + 16, SY + 330, 9, { taille: 20 }), 0.002)}
      ${edition ? toucher(X + 16 + 4 * 23 + 5, SY + 320, C, note) : ''}
      ${bouton(X, SY + SH - 70, L, 44, t('Enregistrer', 'Save'), { taille: 13 })}
      ${edition ? toucher(X + L / 2, SY + SH - 48, C, garde - 0.004) : ''}`;
    const dialogue = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.6"/>
      <rect x="${SX + 16}" y="${SY + 180}" width="${SL - 32}" height="176" rx="24" fill="${APP.surface}" stroke="${APP.bord}"/>
      ${texte(SX + 34, SY + 214, t('Supprimer cette rencontre ?', 'Delete this encounter?'), { taille: 14.5, couleur: APP.texte, poids: 800 })}
      ${texte(SX + 34, SY + 240, t('Elle disparaît des statistiques, de la', 'It leaves the statistics, the map and'), { taille: 10, couleur: APP.second })}
      ${texte(SX + 34, SY + 256, t('carte et du calendrier. Les notes écrites', 'the calendar. The notes written that'), { taille: 10, couleur: APP.second })}
      ${texte(SX + 34, SY + 272, t('ce soir-là restent sur la fiche.', 'night stay on the card.'), { taille: 10, couleur: APP.second })}
      ${texte(SX + SL - 118, SY + 328, t('Annuler', 'Cancel'), { taille: 11.5, couleur: APP.rose, poids: 700, ancre: 'end' })}
      ${texte(SX + SL - 36, SY + 328, t('Supprimer', 'Delete'), { taille: 11.5, couleur: APP.rouge, poids: 800, ancre: 'end' })}
      ${toucher(SX + SL - 140, SY + 324, C, annule - 0.006)}`;
    scenes.push(entre(C, A(k), ouvre, fiche(8, null) + toucher(X + L / 2, SY + 256, C, ouvre - 0.004), 0.002)
      + entre(C, ouvre, garde, formulaire(true), 0.003)
      + entre(C, garde, dans(k, 0.52), fiche(9, [garde, dans(k, 0.5)]), 0.003)
      + entre(C, dans(k, 0.52), B(k), formulaire(false) + toucher(SX + SL - 29, SY + 41, C, corbeille), 0.003)
      + entre(C, dlg, annule, dialogue, 0.003));

    // La vie d'une rencontre, en quatre étapes reliées.
    let m = '';
    const etapes = [
      [t('Enregistrée', 'Saved'), t('26 sept., Auray, 4 sur 5', '26 Sept., Auray, 4 of 5'), ACCENT, A(k)],
      [t('Reprise', 'Edited'), t('la note passe à 4,5', 'the rating goes to 4.5'), OR, note],
      [t('Supprimer ?', 'Delete?'), t('le dialogue dit ce qui part', 'the dialog says what goes'), ROUGE, dlg],
      [t('Annulé', 'Cancelled'), t('rien n’a bougé', 'nothing moved'), VERT, annule],
    ];
    const ew = (ZL - 3 * 40) / 4;
    etapes.forEach(([ti, so, c, de], i) => {
      const x = ZX + i * (ew + 40), y = ZY + 50;
      m += carte(x, y, ew, 76, ti, so, c, { allume: [de, B(k)], cycle: C });
      if (i) {
        const ch = `M${x - 40} ${y + 38} H${x}`;
        m += fil(ch, de, B(k), c) + bille(ch, de - 0.015, de, c);
      }
    });
    // Ce qui se reprend, et ce qui part avec une suppression.
    const objets = [
      [t('Une fiche', 'A card'), t('prénom, photo, ville, étiquettes', 'name, photo, city, tags')],
      [t('Une rencontre', 'An encounter'), t('date, lieu, note, montant', 'date, place, rating, amount')],
      [t('Une note du carnet', 'A notebook note'), t('le texte, sa date', 'the text, its date')],
      [t('Une photo ou une vidéo', 'A photo or a video'), t('retirée du coffre', 'removed from the vault')],
    ];
    objets.forEach(([ti, so], i) => {
      const x = ZX + (i % 2) * (ZL / 2 + 6), y = ZY + 150 + Math.floor(i / 2) * 76;
      const lit = dans(k, 0.08 + i * 0.2);
      m += `<rect x="${x}" y="${y}" width="${ZL / 2 - 6}" height="64" rx="12" fill="${CARTE}" stroke="${BORD}"/>
        <rect x="${x}" y="${y}" width="${ZL / 2 - 6}" height="64" rx="12" fill="none" stroke="${ACCENT}" stroke-opacity="0.6" opacity="0">${visible(C, lit, lit + 0.2, 0.003)}</rect>
        ${texte(x + 18, y + 28, ti, { taille: 13.5, couleur: TITRE, poids: 700 })}
        ${texte(x + 18, y + 47, so, { taille: 11.5 })}
        ${texte(x + ZL / 2 - 26, y + 38, t('modifier · supprimer', 'edit · delete'), { taille: 11.5, couleur: ACCENT, police: MONO, poids: 700, ancre: 'end' })}`;
    });
    m += etat(ZX, ZY + 12, [
      [A(k), garde, t('Toucher une rencontre la rouvre telle quelle : on corrige, on enregistre.', 'Touching an encounter reopens it as it was: correct, save.'), OR],
      [garde, dlg, t('Enregistrer relit la fiche, les statistiques, la carte et le calendrier.', 'Saving rereads the card, the statistics, the map and the calendar.'), VERT],
      [dlg, B(k), t('Supprimer demande toujours, et dit ce qui partira.', 'Deleting always asks, and says what will go.'), ROUGE],
    ]);
    meca.push(m);
  }

  // =================================================== 10. adresse et itinéraire
  {
    const k = 9, touche = dans(k, 0.14), choix = dans(k, 0.18), cartes = dans(k, 0.4), route = [dans(k, 0.44), dans(k, 0.66)];
    const X = SX + 12, L = SL - 24;
    const fiche = `${visage(GENS.enzo.photo, SX, SY, SL, 230, 0)}
      <rect x="${SX}" y="${SY}" width="${SL}" height="230" fill="url(#voile)"/>
      ${pastille(SX + 16, SY + 170, 'N°12', { couleur: APP.vert, taille: 9 })}${pastille(SX + 66, SY + 170, t('23 ans', '23 y/o'), { taille: 9 })}${pastille(SX + 124, SY + 170, 'Vannes', { taille: 9 })}
      ${texte(SX + 18, SY + 218, 'Enzo P.', { taille: 26, couleur: '#FFFFFF', poids: 800 })}
      ${petit(SX + 18, SY + 262, 'INFOS')}
      ${panneau(X, SY + 274, L, 44)}${icone('call', X + 14, SY + 288, APP.second, 0.9)}
      ${texte(X + 38, SY + 300, t('Téléphone', 'Phone'), { taille: 10, couleur: APP.second })}${texte(X + L - 14, SY + 300, '07 15 93 62 08', { taille: 10.5, couleur: APP.texte, poids: 700, ancre: 'end' })}
      ${panneau(X, SY + 326, L, 44)}${icone('home', X + 14, SY + 340, APP.second, 0.9)}
      ${texte(X + 38, SY + 352, t('Adresse', 'Address'), { taille: 10, couleur: APP.second })}${texte(X + L - 14, SY + 352, 'Place des Lices, Vannes', { taille: 10.5, couleur: APP.texte, poids: 700, ancre: 'end' })}
      <circle cx="${X + 22}" cy="${SY + SH - 38}" r="20" fill="${APP.carte}" stroke="${APP.bord}"/>${icone('call', X + 15, SY + SH - 45, APP.texte, 0.9)}
      <circle cx="${X + 68}" cy="${SY + SH - 38}" r="20" fill="${APP.carte}" stroke="${APP.bord}"/>${picto('itineraire', X + 60, SY + SH - 46, APP.texte)}
      ${bouton(X + 98, SY + SH - 58, L - 98, 40, t('+ Nouvelle rencontre', '+ New encounter'), { taille: 11 })}
      ${toucher(X + 68, SY + SH - 38, C, touche)}`;
    const selecteur = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#000000" fill-opacity="0.55"/>
      <g>${glisse(C, [[0, '0 200'], [choix, '0 200'], [choix + 0.006, '0 0'], [1, '0 0']])}
      <rect x="${SX}" y="${SY + SH - 200}" width="${SL}" height="200" rx="22" fill="#F2F0F7"/>
      ${texte(SX + 22, SY + SH - 168, t('Ouvrir avec', 'Open with'), { taille: 14, couleur: '#1D1B22', poids: 700 })}
      ${[['Maps', '#34A853'], ['Organic Maps', '#2E7D32'], ['Waze', '#33CCFF']].map(([n, c], i) => `<rect x="${SX + 22 + i * 82}" y="${SY + SH - 140}" width="48" height="48" rx="14" fill="${c}"/>${texte(SX + 46 + i * 82, SY + SH - 76, n, { taille: 9.5, couleur: '#1D1B22', ancre: 'middle' })}`).join('')}
      ${toucher(SX + 46, SY + SH - 116, C, cartes - 0.006)}</g>`;
    // L'appli de cartes : le vrai golfe du Morbihan, tiré de france.bin.
    const golfe = france(SX, SY, SL, SH, [-2.93, 47.55, -2.63, 47.73], { tolerance: 0.0014 });
    const [vx, vy] = golfe.proj(-2.760, 47.658), [dx, dy] = golfe.proj(-2.829, 47.600);
    const ch = `M${r1(dx)} ${r1(dy)} C${r1(dx + 10)} ${r1(dy - 60)} ${r1(vx - 50)} ${r1(vy + 70)} ${r1(vx)} ${r1(vy)}`;
    const clipG = O.id('golfe');
    const appli = `<rect x="${SX}" y="${SY}" width="${SL}" height="${SH}" fill="#A8D5F2"/>
      <clipPath id="${clipG}"><rect x="${SX}" y="${SY}" width="${SL}" height="${SH}"/></clipPath>
      <g clip-path="url(#${clipG})"><path d="${golfe.terre}" fill="#EEF0E7" stroke="#C9D6C2" stroke-width="1"/></g>
      <path d="${ch}" fill="none" stroke="#4285F4" stroke-width="6" stroke-linecap="round" stroke-dasharray="400" stroke-dashoffset="400">
        ${fondu('stroke-dashoffset', C, [[0, 400], [route[0], 400], [route[1], 0], [1, 0]])}</path>
      <circle cx="${r1(dx)}" cy="${r1(dy)}" r="7" fill="#4285F4" stroke="#FFFFFF" stroke-width="2.5"/>
      <path d="M${r1(vx)} ${r1(vy)} c-9 -14 -9 -26 0 -26 s9 12 0 26 Z" fill="#EA4335"/>
      <rect x="${SX + 14}" y="${SY + 22}" width="${SL - 28}" height="34" rx="17" fill="#FFFFFF"/>
      ${texte(SX + 30, SY + 44, 'Place des Lices, Vannes', { taille: 11.5, couleur: '#1D1B22', poids: 600 })}
      ${texte(r1(vx + 12), r1(vy - 10), 'Vannes', { taille: 11, couleur: '#3C4043', poids: 700 })}
      <rect x="${SX}" y="${SY + SH - 70}" width="${SL}" height="70" fill="#FFFFFF"/>
      ${entre(C, route[1], B(k), texte(SX + 20, SY + SH - 40, '8 min', { taille: 17, couleur: '#188038', poids: 800 }), 0.003)}
      ${texte(SX + 20, SY + SH - 20, t('Une autre appli : elle sait où tu vas.', 'Another app: it knows where you go.'), { taille: 9.5, couleur: '#5F6368' })}`;
    scenes.push(fiche + entre(C, choix, cartes, selecteur, 0.003) + entre(C, cartes, B(k), appli, 0.003));

    // Ce qui sort, et par où.
    let m = '';
    const y0 = ZY + 60, bw = 220;
    m += `<rect x="${ZX}" y="${y0}" width="${bw}" height="200" rx="14" fill="${CARTE}" stroke="${BORD}"/>
      ${logo(ZX + 34, y0 + 34, 34)}
      ${texte(ZX + 60, y0 + 30, 'BodyCount', { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(ZX + 60, y0 + 48, t('pas de permission INTERNET', 'no INTERNET permission'), { taille: 11, couleur: ROUGE })}
      ${['Enzo P.', t('7 rencontres, notes', '7 encounters, notes'), t('photos, carnet', 'photos, notebook')].map((s2, i) => texte(ZX + 20, y0 + 90 + i * 22, s2, { taille: 12, couleur: DISCRET })).join('')}
      <g opacity="0">${visible(C, touche, B(k), 0.003)}<rect x="${ZX + 12}" y="${y0 + 160}" width="${bw - 24}" height="28" rx="8" fill="${BLEU}" fill-opacity="0.16" stroke="${BLEU}"/>
      ${texte(ZX + 24, y0 + 179, 'Place des Lices, Vannes', { taille: 12, couleur: BLEU, poids: 700 })}</g>`;
    // Le mur, et la seule porte.
    const mx = ZX + 290;
    for (let i = 0; i < 9; i++) m += `<rect x="${mx + (i % 2) * 8}" y="${y0 + i * 23}" width="18" height="20" rx="2" fill="${ROUGE}" fill-opacity="0.5"/>`;
    m += `<rect x="${mx}" y="${y0 + 158}" width="26" height="36" rx="3" fill="${CARTE}" stroke="${BLEU}" stroke-width="1.5" opacity="0">${visible(C, touche, B(k), 0.003)}</rect>`;
    const sortie = `M${ZX + bw} ${y0 + 174} H${ZX + 520}`;
    m += fil(sortie, touche, B(k), BLEU) + bille(sortie, touche + 0.004, choix + 0.02, BLEU);
    m += `<rect x="${ZX + 520}" y="${y0 + 140}" width="${ZL - 520}" height="68" rx="13" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${ZX + 520}" y="${y0 + 140}" width="${ZL - 520}" height="68" rx="13" fill="none" stroke="${BLEU}" stroke-width="1.5" opacity="0">${visible(C, cartes, B(k), 0.003)}</rect>
      ${texte(ZX + 540, y0 + 168, t('L’appli de cartes', 'The map app'), { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(ZX + 540, y0 + 188, t('celle que tu choisis, et elle seule', 'the one you pick, and only it'), { taille: 12 })}`;
    m += `<g opacity="0">${visible(C, touche, B(k), 0.003)}<rect x="${ZX + 330}" y="${y0 + 20}" width="${ZL - 330}" height="92" rx="12" fill="#0A0E14" stroke="${BORD}"/>
      ${texte(ZX + 348, y0 + 48, 'Intent.ACTION_VIEW', { taille: 13, couleur: '#C9D1D9', police: MONO })}</g>`;
    m += frappe(ZX + 348, y0 + 76, 'geo:0,0?q=Place des Lices, Vannes', C, touche + 0.004, choix + 0.03, { taille: 13, couleur: BLEU, police: MONO });
    m += entre(C, cartes, B(k), texte(ZX + 348, y0 + 100, t('le reste de la fiche ne sort pas', 'the rest of the card stays in'), { taille: 12, couleur: VERT }), 0.003);
    m += etat(ZX, ZY + 12, [
      [A(k), touche, t('Tout ce qui est saisi reste dans la base chiffrée.', 'Everything entered stays in the encrypted database.'), VIOLET],
      [touche, cartes, t('Un toucher sur « Y aller » : l’adresse seule passe la porte.', 'A tap on “Go there”: only the address goes through the door.'), BLEU],
      [cartes, B(k), t('L’appli de cartes calcule l’itinéraire, BodyCount n’en sait rien.', 'The map app works out the route, BodyCount knows nothing of it.'), VERT],
    ]);
    m += texte(ZX, ZY + 316, t('Le numéro vers le téléphone, la sauvegarde là où tu la poses : les autres portes marchent pareil.', 'The number to the dialer, the backup where you save it: the other doors work the same way.'), { taille: 12, couleur: TEXTE });
    meca.push(m);
  }

  // =================================================== 11. trois formats d'écran
  {
    const k = 10;
    const cols = [2, 3, 4], seuils = [A(k), dans(k, 0.33), dans(k, 0.66)];
    // Huit fiches, dont les visages sont déjà dans le fichier : chaque
    // visage de plus pèse près de 9 Ko.
    const gens = [GENS.noa, GENS.lou, GENS.enzo, GENS.jade, GENS.matteo, GENS.gabriel, GENS.ibrahim, GENS.malo];
    const W0 = (SL - 24 - 8) / 2, H0 = W0 * 1.25;
    const place = (i, n) => {
      const w = (SL - 24 - (n - 1) * 8) / n, h = w * 1.25;
      return [r1(SX + 12 + (i % n) * (w + 8)), r1(SY + 100 + Math.floor(i / n) * (h + 8)), (w / W0).toFixed(4)];
    };
    let s = `${titreEcran(t('RÉPERTOIRE', 'PEOPLE'))}`;
    const libs = [t('Téléphone 16/9 · 2 colonnes', 'Phone 16:9 · 2 columns'), t('Couverture du Fold · 3 colonnes', 'Fold cover · 3 columns'), t('Écran déplié · 4 colonnes', 'Unfolded · 4 columns')];
    libs.forEach((lib, f) => {
      s += entre(C, f === 0 ? 0 : seuils[f], f === 2 ? 1 : seuils[f + 1], `<rect x="${SX + 12}" y="${SY + 62}" width="${SL - 24}" height="26" rx="13" fill="${APP.violet}" fill-opacity="0.16" stroke="${APP.violet}" stroke-opacity="0.5"/>
        ${texte(SX + SL / 2, SY + 79, lib, { taille: 10.5, couleur: APP.texte, poids: 700, ancre: 'middle' })}`, 0.003);
    });
    gens.forEach((p, i) => {
      const pos = cols.map((n) => place(i, n));
      const tr = [[0, `${pos[0][0]} ${pos[0][1]}`]], sc = [[0, pos[0][2]]];
      [1, 2].forEach((f) => {
        tr.push([seuils[f], `${pos[f - 1][0]} ${pos[f - 1][1]}`], [seuils[f] + 0.006, `${pos[f][0]} ${pos[f][1]}`]);
        sc.push([seuils[f], pos[f - 1][2]], [seuils[f] + 0.006, pos[f][2]]);
      });
      tr.push([1, `${pos[2][0]} ${pos[2][1]}`]); sc.push([1, pos[2][2]]);
      // En deux colonnes, les dernières passent sous le bas de l'écran :
      // elles remontent quand la grille se resserre.
      s += `<g>
        <g transform="translate(${pos[0][0]} ${pos[0][1]})">${glisse(C, tr)}
        <g><animateTransform attributeName="transform" type="scale" dur="${C}s" repeatCount="indefinite" keyTimes="${sc.map((e) => e[0]).join(';')}" values="${sc.map((e) => e[1]).join(';')}"/>
          ${visage(p.photo, 0, 0, W0, H0, 14)}<rect width="${W0}" height="${H0}" rx="14" fill="url(#voile)"/>
          ${texte(10, H0 - 26, p.prenom, { taille: 15, couleur: '#FFFFFF', poids: 800 })}
          ${etoiles(10, H0 - 10, p.note, { taille: 10 })}
        </g></g></g>`;
    });
    s += barreNav(T, 'Fiches');
    scenes.push(s);

    // Trois appareils, à l'échelle, et la grille dans chacun.
    let m = '';
    const appareils = [
      [t('Téléphone 16/9', 'Phone 16:9'), 390, 844, 2, VIOLET],
      [t('Couverture du Fold', 'Fold cover'), 460, 727, 3, FUCHSIA],
      [t('Écran déplié', 'Unfolded'), 900, 1200, 4, ACCENT],
    ];
    // Assez bas pour laisser la ligne d'état au-dessus, assez haut pour que
    // les deux lignes de légende tiennent dans le panneau.
    const ech = 0.18, base = ZY + 258;
    let ax = ZX + 20;
    appareils.forEach(([nom, l, h, n, c], f) => {
      const w = l * ech, hh = h * ech, x = ax, y = base - hh;
      const de = seuils[f], a = f === 2 ? B(k) : seuils[f + 1];
      m += `<rect x="${x}" y="${y}" width="${r1(w)}" height="${r1(hh)}" rx="12" fill="#07050C" stroke="${FIL}" stroke-width="2"/>
        <rect x="${x}" y="${y}" width="${r1(w)}" height="${r1(hh)}" rx="12" fill="none" stroke="${c}" stroke-width="2" opacity="0">${visible(C, de, a, 0.003)}</rect>`;
      const cw = (w - 12 - (n - 1) * 4) / n, chh = cw * 1.25;
      for (let i = 0; i < n * Math.floor((hh - 16) / (chh + 4)); i++) {
        m += `<rect x="${r1(x + 6 + (i % n) * (cw + 4))}" y="${r1(y + 8 + Math.floor(i / n) * (chh + 4))}" width="${r1(cw)}" height="${r1(chh)}" rx="3" fill="${c}" fill-opacity="0.25"/>`;
      }
      m += `<g opacity="0.5">${fondu('opacity', C, [[0, 0.5], [de, 0.5], [de + 0.004, 1], [a, 1], [a + 0.003, 0.5], [1, 0.5]])}
        ${texte(r1(x + w / 2), base + 22, nom, { taille: 13, couleur: TITRE, police: MONO, poids: 700, ancre: 'middle' })}
        ${texte(r1(x + w / 2), base + 40, t(`${l} points · ${n} colonnes`, `${l} points · ${n} columns`), { taille: 11.5, couleur: c, ancre: 'middle' })}</g>`;
      ax += w + 70;
    });
    m += etat(ZX, ZY + 12, [
      [A(k), seuils[1], t('En 16/9, deux colonnes, la recherche sous le titre.', 'On 16:9, two columns, the search under the title.'), VIOLET],
      [seuils[1], seuils[2], t('Sur la couverture du Fold, large et courte : trois colonnes.', 'On the Fold’s cover, wide and short: three columns.'), FUCHSIA],
      [seuils[2], B(k), t('Déplié, un rail à gauche et quatre colonnes : la mise en page suit.', 'Unfolded, a rail on the left and four columns: the layout follows.'), ACCENT],
    ]);
    meca.push(m);
  }

  // Les écrans et les mécanismes, chacun dans sa tranche.
  let ecran = '';
  scenes.forEach((s, k) => { ecran += entre(C, Math.max(0, k / N - 0.002), Math.min(1, (k + 1) / N + 0.002), s, 0.002); });
  corps += T.ecran(ecran);
  meca.forEach((m, k) => { corps += entre(C, A(k), B(k), m, 0.003); });

  // ---------------------------------------------------- le sommaire, en bas
  const TW = 128, TH = 54, GAP = 10, SYR = 532;
  // Les libellés du sommaire, coupés à la main sur deux lignes : une coupe
  // automatique laissait « Ce que » ou « Adresse et » seuls.
  const COURTS = [
    [t('Verrouillage', 'Biometric'), t('biométrique', 'lock')], [t('Répertoire', 'People')], [t('Statistiques', 'Statistics')],
    [t('Carte de', 'Map of'), t('France', 'France')], [t('Calendrier', 'Calendar')], [t('Galerie', 'Private'), t('privée', 'gallery')],
    [t('Sauvegarde', 'Full'), t('complète', 'backup')], [t('Ce que ça', 'What it'), t('rapporte', 'brings in')], [t('Tout se', 'Nothing'), t('reprend', 'is final')],
    [t('Adresse et', 'Address'), t('itinéraire', 'and route')], [t('Trois formats', 'Three screen'), t('d’écran', 'sizes')], [t('Rien ne', 'Nothing'), t('sort', 'leaves')],
  ];
  [...TUILES, ['mur', VERT, t('Rien ne sort', 'Nothing leaves'), '']].forEach(([ic, c, titre], k) => {
    const x = RX + (k % 6) * (TW + GAP) - 1, y = SYR + Math.floor(k / 6) * (TH + 10);
    const derniere = k === 11;
    corps += `<rect x="${x}" y="${y}" width="${TW}" height="${TH}" rx="11" fill="${CARTE}" stroke="${derniere ? VERT : BORD}" ${derniere ? 'stroke-dasharray="4 4" stroke-opacity="0.5"' : ''}/>`;
    if (!derniere) corps += `<rect x="${x}" y="${y}" width="${TW}" height="${TH}" rx="11" fill="${c}" fill-opacity="0.1" stroke="${c}" stroke-width="1.5" opacity="0">${visible(C, A(k), B(k), 0.003)}</rect>`;
    corps += `<rect x="${x + 10}" y="${y + 13}" width="28" height="28" rx="8" fill="${c}" fill-opacity="0.13"/>${picto(ic, x + 16, y + 19, c)}`;
    if (!derniere) corps += `<g opacity="0">${fondu('opacity', C, [[0, 0], [B(k), 0], [B(k) + 0.003, 1], [0.996, 1], [1, 0]])}
      <circle cx="${x + 36}" cy="${y + 39}" r="6.5" fill="${c}" stroke="${CARTE}" stroke-width="2"/>${icone('coche', x + 31.5, y + 34.5, '#FFFFFF', 0.56)}</g>`;
    const [l1, l2 = ''] = COURTS[k];
    corps += texte(x + 46, y + (l2 ? 25 : 32), l1, { taille: 11, couleur: derniere ? VERT : TITRE, poids: 700 });
    if (l2) corps += texte(x + 46, y + 40, l2, { taille: 11, couleur: derniere ? VERT : TITRE, poids: 700 });
  });
  corps += texte(RX + RL / 2, 690, t('Chacune a son schéma plus bas, qui la montre en détail.', 'Each one has its own diagram further down, showing it in detail.'), { taille: 12.5, couleur: DISCRET, ancre: 'middle' });

  // Le schéma porte plus de six cents textes et sept cents animations :
  // chaque texte répétait la liste des polices, chaque instant ses dix
  // décimales. Une classe CSS pour la police, quatre décimales pour les
  // instants (gardés croissants), et le fichier perd un tiers de son poids.
  corps = corps.split(`font-family="${SANS}"`).join('class="fs"').split(`font-family="${MONO}"`).join('class="fm"');
  corps = corps.replace(/keyTimes="([^"]*)"/g, (_, v) => {
    let avant = 0;
    return `keyTimes="${v.split(';').map((x) => { avant = Math.max(avant, Math.round(Number(x) * 10000) / 10000); return avant; }).join(';')}"`;
  });
  corps = corps.replace(/(values|keyPoints)="([^"]*)"/g, (_, att, v) => `${att}="${v.replace(/-?\d+\.\d{3,}/g, (n) => String(Math.round(Number(n) * 100) / 100))}"`);
  corps = `<style>.fs{font-family:${SANS}}.fm{font-family:${MONO}}</style>` + corps;

  svg('fonctionnalites.svg', 1280, 720, corps, t(
    'Les fonctionnalités de BodyCount, en onze écrans animés, chacun avec son mécanisme. Verrouillage biométrique : l’empreinte scannée, la clé sort du Keystore, HKDF en tire la clé de la base et celle du coffre, et le répertoire se remplit. Répertoire : « vann » tapé dans la recherche, la requête se réécrit à chaque lettre et passe de 18 à 7 fiches, les cartes glissent, puis Mieux notés les réordonne. Statistiques : les 78 rencontres de l’année tombent chacune dans son mois, les barres montent, +136 % face à 2025, le podium se range. Carte de France : la vraie côte lue dans france.bin, les villes tombent en pastilles avec leurs ondes et leurs navettes, et un pincement sépare la bulle de 65 en Vannes 61 et Auray 4. Calendrier : les jours pleins prennent leur disque et leurs signes, on touche le 23 et ses six signes passent au tri, trois restent. Galerie privée : une photo choisie dans le sélecteur passe au coffre, se brouille, chiffrée en AES-GCM, la copie est effacée, rien dans la galerie du téléphone, puis déchiffrée en mémoire pour la visionneuse. Sauvegarde : la phrase de passe, PBKDF2 en 210 000 tours, puis le fichier BCEX2 qui s’écrit morceau par morceau. Ce que ça rapporte : sept soirées payées sur 78 s’allument, 750 € au total, 107,14 € de moyenne sur les seules payées. Tout se reprend : une rencontre rouverte, sa note corrigée, une suppression demandée puis annulée. Adresse et itinéraire : seule l’adresse passe la porte, vers l’appli de cartes choisie, qui trace l’itinéraire dans le vrai golfe du Morbihan. Trois formats d’écran : le même répertoire en 2, 3 puis 4 colonnes. Et rien ne sort : pas de serveur, pas de compte, pas de télémétrie.',
    'BodyCount’s features, in eleven animated screens, each with its mechanism. Biometric lock: the fingerprint scanned, the key leaves the Keystore, HKDF derives the database key and the vault key, and the people list fills in. People: “vann” typed in the search, the query is rewritten on every letter and goes from 18 to 7 people, the cards slide, then Top rated reorders them. Statistics: the year’s 78 encounters each fall into their month, the bars rise, +136% against 2025, the podium sorts itself. Map of France: the real coastline read from france.bin, the cities drop in as bubbles with their ripples and shuttles, and a pinch splits the 65 bubble into Vannes 61 and Auray 4. Calendar: busy days take their disc and their signs, the 23rd is touched and its six signs get sorted, three remain. Private gallery: a photo picked in the system picker goes into the vault, blurs, encrypted with AES-GCM, the copy is deleted, nothing in the phone’s gallery, then it is decrypted in memory for the viewer. Backup: the passphrase, PBKDF2 over 210,000 rounds, then the BCEX2 file written chunk by chunk. What it brings in: seven paid nights out of 78 light up, €750 in total, €107.14 on average over paid ones only. Nothing is final: an encounter reopened, its rating corrected, a deletion asked then cancelled. Address and route: only the address goes through the door, to the map app you pick, which draws the route in the real Gulf of Morbihan. Three screen sizes: the same people list in 2, 3 then 4 columns. And nothing leaves: no server, no account, no telemetry.'));
};

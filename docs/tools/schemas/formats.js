// Les formats de fichier, comme dans un éditeur hexadécimal.
//
// Quatre onglets se succèdent : une photo du coffre (BCX1), une vidéo
// (BCV1), une sauvegarde (BCEX2), puis un morceau du flux vu de près. Les
// lignes d'octets s'écrivent, puis chaque champ se colore à son tour, et
// la liste de droite dit ce qu'il porte et sur combien d'octets. Pour le
// morceau, le rang et le fait d'être le dernier apparaissent en fantôme :
// authentifiés par le MAC, jamais écrits.
//
// Tout vient de lib/security/photo_vault.dart, video_vault.dart,
// flux_chiffre.dart et lib/utils/export_helper.dart.
module.exports = (O) => {
  const { t, svg, texte, entete, rubrique, fondu, visible, entre,
    MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, VERT, OR, ROUGE, BLEU } = O;
  const C = 40;
  const GRIS = '#E4DCF5';
  let corps = entete(t('LES FORMATS', 'THE FORMATS'),
    t('Quatre fichiers, octet par octet. Rien dedans ne dit ce qu’ils contiennent, ni pour qui.',
      'Four files, byte by byte. Nothing in them says what they hold, or who it is about.'));

  // Les couleurs des champs, les mêmes dans les quatre onglets.
  const COUL = { marque: ACCENT, nonce: BLEU, sel: VERT, longueur: OR, chiffre: VIOLET, mac: ROUGE, rang: '#94A3B8', dernier: '#94A3B8' };

  // Un octet qui a l'air tiré au hasard, mais toujours le même d'un rendu
  // à l'autre : le SVG ne change pas si rien n'a changé.
  const hasard = (n) => {
    let x = (n * 2654435761 + 97) >>> 0;
    x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13;
    return x & 0xff;
  };
  const hex = (v) => v.toString(16).toUpperCase().padStart(2, '0');
  const be = (v, n) => [...Array(n)].map((_, i) => Math.floor(v / 256 ** (n - 1 - i)) % 256);
  const milliers = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, t(' ', ','));

  /// Un fichier : ses champs, dans l'ordre, et les plages montrées.
  /// Un champ : [genre, début, fin, valeurs fixes éventuelles].
  function fichier(champs, plages, graine) {
    const octet = (off) => {
      const c = champs.find(([, d, f]) => off >= d && off < f);
      if (!c) return null;
      const [genre, d, , fixe] = c;
      return { genre, v: fixe ? fixe[off - d] : hasard(off * 7 + graine) };
    };
    const lignes = [];
    plages.forEach((p, i) => {
      if (p.trou) { lignes.push({ trou: p.trou }); return; }
      if (p.fantome) { lignes.push({ fantome: p.fantome }); return; }
      for (let o = p[0]; o < p[1]; o += 16) {
        lignes.push({ off: o, octets: [...Array(16)].map((_, k) => octet(o + k)) });
      }
    });
    return lignes;
  }

  // ------------------------------------------------------------ les quatre
  const PHOTO = 184320; // 4 + 12 + 184 288 + 16
  const MO = 1048576;
  const SAUV = 0x0B162E80; // un peu moins de 186 Mo, aligné sur 16
  const onglets = [
    {
      nom: '3f9c…a1.bcx', titre: t('Une photo', 'A photo'),
      lignes: fichier([
        ['marque', 0, 4, [0x42, 0x43, 0x58, 0x31]],
        ['nonce', 4, 16],
        ['chiffre', 16, PHOTO - 16],
        ['mac', PHOTO - 16, PHOTO],
      ], [[0, 64], { trou: t(`${milliers(PHOTO - 96)} octets chiffrés de plus`, `${milliers(PHOTO - 96)} more encrypted bytes`) }, [PHOTO - 32, PHOTO]], 11),
      champs: [
        ['marque', 'BCX1', t('4 octets', '4 bytes'), t('photo du coffre, version 1', 'vault photo, version 1')],
        ['nonce', 'nonce', t('12 octets', '12 bytes'), t('tiré au hasard à chaque écriture', 'drawn at random on every write')],
        ['chiffre', t('chiffré', 'ciphertext'), t(`${milliers(PHOTO - 32)} octets`, `${milliers(PHOTO - 32)} bytes`), t('la photo entière, AES-256-GCM, d’un bloc', 'the whole photo, AES-256-GCM, one block')],
        ['mac', 'MAC', t('16 octets', '16 bytes'), t('un octet changé : rien ne s’affiche', 'one byte changed: nothing shows')],
      ],
      somme: t(`${milliers(PHOTO)} octets : 4 + 12 + ${milliers(PHOTO - 32)} + 16`, `${milliers(PHOTO)} bytes: 4 + 12 + ${milliers(PHOTO - 32)} + 16`),
      bas: [t('Une photo tient en mémoire : elle se chiffre et se relit d’un seul bloc.', 'A photo fits in memory: it is encrypted and read back in a single block.'),
        t('Le nom du fichier est un UUID tiré au hasard : il ne dit rien de la personne.', 'The file name is a random UUID: it says nothing about the person.')],
    },
    {
      nom: 'e9b4…d0.bcx', titre: t('Une vidéo', 'A video'),
      lignes: fichier([
        ['marque', 0, 4, [0x42, 0x43, 0x56, 0x31]],
        ['longueur', 4, 8, be(MO, 4)],
        ['nonce', 8, 20],
        ['chiffre', 20, 20 + MO],
        ['mac', 20 + MO, 36 + MO],
        ['longueur', 36 + MO, 40 + MO, be(MO, 4)],
        ['nonce', 40 + MO, 52 + MO],
        ['chiffre', 52 + MO, 52 + 2 * MO],
      ], [[0, 48], { trou: t('un mégaoctet de vidéo chiffrée', 'one megabyte of encrypted video') }, [MO, MO + 64]], 23),
      champs: [
        ['marque', 'BCV1', t('4 octets', '4 bytes'), t('vidéo du coffre, version 1', 'vault video, version 1')],
        ['longueur', t('longueur', 'length'), t('4 octets', '4 bytes'), t('00 10 00 00 : un mégaoctet', '00 10 00 00: one megabyte')],
        ['nonce', 'nonce', t('12 octets', '12 bytes'), t('neuf pour chaque morceau', 'fresh for every chunk')],
        ['chiffre', t('chiffré', 'ciphertext'), t(`${milliers(MO)} octets`, `${milliers(MO)} bytes`), t('un mégaoctet de vidéo, au plus', 'one megabyte of video, at most')],
        ['mac', 'MAC', t('16 octets', '16 bytes'), t('puis le morceau suivant, même forme', 'then the next chunk, same shape')],
      ],
      somme: t('BCV1, puis des morceaux jusqu’à la fin du fichier', 'BCV1, then chunks all the way to the end of the file'),
      bas: [t('Une vidéo ne tient pas en mémoire : elle passe un mégaoctet à la fois, à l’écriture comme à la lecture.', 'A video does not fit in memory: it goes through a megabyte at a time, both ways.'),
        t('Même clé que les photos, même extension .bcx : de l’extérieur, rien ne les distingue.', 'Same key as the photos, same .bcx extension: from outside, nothing tells them apart.')],
    },
    {
      nom: 'bodycount-2026-09-26.bcx', titre: t('Une sauvegarde', 'A backup'),
      lignes: fichier([
        ['marque', 0, 5, [0x42, 0x43, 0x45, 0x58, 0x32]],
        ['sel', 5, 21],
        ['longueur', 21, 25, be(MO, 4)],
        ['nonce', 25, 37],
        ['chiffre', 37, SAUV - 16],
        ['mac', SAUV - 16, SAUV],
      ], [[0, 64], { trou: t('186 Mo de morceaux chiffrés', '186 MB of encrypted chunks') }, [SAUV - 32, SAUV]], 37),
      champs: [
        ['marque', 'BCEX2', t('5 octets', '5 bytes'), t('sauvegarde, version 2', 'backup, version 2')],
        ['sel', t('sel', 'salt'), t('16 octets', '16 bytes'), t('en clair : PBKDF2 en refait la clé', 'in the clear: PBKDF2 rebuilds the key')],
        ['longueur', t('longueur', 'length'), t('4 octets', '4 bytes'), t('le flux commence ici', 'the stream starts here')],
        ['nonce', 'nonce', t('12 octets', '12 bytes'), t('un par morceau', 'one per chunk')],
        ['chiffre', t('chiffré', 'ciphertext'), t('1 Mo au plus', '1 MB at most'), t('clé tirée de ta phrase de passe', 'key drawn from your passphrase')],
        ['mac', 'MAC', t('16 octets', '16 bytes'), t('le dernier morceau finit le fichier', 'the last chunk ends the file')],
      ],
      somme: t('BCEX2, le sel, puis le même flux que les vidéos', 'BCEX2, the salt, then the same stream as videos'),
      bas: null, // la sauvegarde montre à la place ce que porte son flux
    },
    {
      nom: t('un morceau', 'one chunk'), titre: t('Un morceau', 'One chunk'),
      lignes: fichier([
        ['longueur', 0, 4, be(MO, 4)],
        ['nonce', 4, 16],
        ['chiffre', 16, 16 + MO],
        ['mac', 16 + MO, 32 + MO],
      ], [[0, 32], { trou: t('le reste du mégaoctet', 'the rest of the megabyte') }, [MO, MO + 32],
        { fantome: [...be(2, 8), 0] }], 53),
      champs: [
        ['longueur', t('longueur', 'length'), t('4 octets', '4 bytes'), t('lue en premier, jamais plus d’un Mo', 'read first, never over a MB')],
        ['nonce', 'nonce', t('12 octets', '12 bytes'), t('ne resert jamais', 'never used twice')],
        ['chiffre', t('chiffré', 'ciphertext'), t('≤ 1 Mo', '≤ 1 MB'), t('même longueur que le clair', 'same length as the plaintext')],
        ['mac', 'MAC', t('16 octets', '16 bytes'), t('couvre le chiffré et les données associées', 'covers the ciphertext and associated data')],
        ['rang', t('rang', 'rank'), t('8 octets', '8 bytes'), t('jamais écrit : l’ordre de lecture', 'never written: the reading order')],
        ['dernier', t('dernier', 'last'), t('1 octet', '1 byte'), t('jamais écrit : le fichier finit-il là ?', 'never written: does the file end here?')],
      ],
      somme: t(`${milliers(MO + 32)} octets sur le disque, et 9 de plus authentifiés sans être écrits`, `${milliers(MO + 32)} bytes on disk, and 9 more authenticated without being written`),
      bas: [t('Déplace ce morceau : son rang change, le MAC ne correspond plus. Coupe la fin : « dernier » change, pareil.', 'Move this chunk: its rank changes, the MAC no longer matches. Cut the end: “last” changes, same thing.'),
        t('Dans les deux cas, la lecture s’arrête au morceau touché au lieu de rendre un fichier amputé.', 'Either way, reading stops at the chunk touched instead of returning a truncated file.')],
    },
  ];

  // ------------------------------------------------------------ le cadre
  const PH = 1 / onglets.length;
  const fen = (i, u) => i * PH + u * PH; // un instant de l'onglet i
  const EX = 60, EY = 84, EL = 760, EH = 470;
  corps += `<rect x="${EX}" y="${EY}" width="${EL}" height="${EH}" rx="14" fill="#0A0E14" stroke="${BORD}"/>`;
  // La barre de titre et les onglets.
  corps += `<rect x="${EX}" y="${EY}" width="${EL}" height="40" rx="14" fill="${CARTE}"/><rect x="${EX}" y="${EY + 26}" width="${EL}" height="14" fill="${CARTE}"/>
    <line x1="${EX}" y1="${EY + 40}" x2="${EX + EL}" y2="${EY + 40}" stroke="${BORD}"/>
    ${[ROUGE, OR, VERT].map((c, i) => `<circle cx="${EX + 20 + i * 16}" cy="${EY + 20}" r="4.5" fill="${c}" fill-opacity="0.55"/>`).join('')}`;
  let ox = EX + 76;
  onglets.forEach((o, i) => {
    const l = Math.round(o.nom.length * 7.3 + 26);
    corps += `<rect x="${ox}" y="${EY + 8}" width="${l}" height="26" rx="8" fill="${FIL}" fill-opacity="0.35"/>
      <rect x="${ox}" y="${EY + 8}" width="${l}" height="26" rx="8" fill="${VIOLET}" fill-opacity="0.22" stroke="${VIOLET}" stroke-opacity="0.7" opacity="0">${visible(C, fen(i, 0), fen(i, 0.985), 0.004)}</rect>
      ${texte(ox + l / 2, EY + 25.5, o.nom, { taille: 11.5, couleur: TEXTE, police: MONO, ancre: 'middle' })}
      ${entre(C, fen(i, 0), fen(i, 0.985), texte(ox + l / 2, EY + 25.5, o.nom, { taille: 11.5, couleur: TITRE, police: MONO, poids: 700, ancre: 'middle' }), 0.004)}`;
    ox += l + 8;
  });

  // Les colonnes de l'éditeur.
  const XO = EX + 22, XB = EX + 124, PAS = 25.5, XA = EX + 574, PASA = 9.4;
  const xb = (k) => XB + k * PAS + (k >= 8 ? 10 : 0);
  const YT = EY + 66, LH = 36;
  corps += texte(XO, YT, t('décalage', 'offset'), { taille: 11, couleur: DISCRET, police: MONO });
  corps += `<text x="${[...Array(16)].flatMap((_, k) => [xb(k), xb(k) + 7.6]).join(' ')}" y="${YT}" font-family="${MONO}" font-size="11" fill="${DISCRET}">${[...Array(16)].map((_, k) => hex(k)).join('')}</text>`;
  corps += texte(XA, YT, 'ASCII', { taille: 11, couleur: DISCRET, police: MONO });
  corps += `<line x1="${EX + 16}" y1="${YT + 10}" x2="${EX + EL - 16}" y2="${YT + 10}" stroke="${BORD}"/>`;

  /// Les caractères d'une suite d'octets, chacun à sa place.
  const ligneHex = (octets, y, couleur, extra = '') => {
    const xs = [], cs = [];
    octets.forEach(([k, v]) => { xs.push(xb(k), xb(k) + 7.6); cs.push(hex(v)); });
    return xs.length ? `<text x="${xs.map((x) => x.toFixed(1)).join(' ')}" y="${y}" font-family="${MONO}" font-size="13.5" fill="${couleur}" ${extra}>${cs.join('')}</text>` : '';
  };
  const ascii = (v) => (v >= 0x20 && v < 0x7f ? String.fromCharCode(v) : '.');
  const ligneAscii = (octets, y, couleur) => {
    const xs = octets.map(([k]) => (XA + k * PASA).toFixed(1));
    const s = octets.map(([, v]) => ascii(v)).join('');
    return xs.length ? `<text x="${xs.join(' ')}" y="${y}" font-family="${MONO}" font-size="13.5" fill="${couleur}" xml:space="preserve">${O.esc(s)}</text>` : '';
  };

  onglets.forEach((o, i) => {
    let page = '';
    // Les champs, dans l'ordre où ils se colorent.
    const ordre = o.champs.map(([g]) => g);
    const quand = (g) => 0.3 + ordre.indexOf(g) * (0.52 / ordre.length);
    o.lignes.forEach((l, r) => {
      const y = YT + 34 + r * LH;
      const apparait = 0.03 + r * 0.022;
      if (l.trou) {
        page += entre(C, fen(i, apparait), fen(i, 0.985), `
          <line x1="${XB}" y1="${y - 4}" x2="${xb(15) + 16}" y2="${y - 4}" stroke="${FIL}" stroke-dasharray="3 5"/>
          <rect x="${(XB + xb(15) + 16) / 2 - l.trou.length * 3.4 - 14}" y="${y - 15}" width="${l.trou.length * 6.8 + 28}" height="22" rx="11" fill="#0A0E14" stroke="${FIL}"/>
          ${texte((XB + xb(15) + 16) / 2, y, l.trou, { taille: 11.5, couleur: TEXTE, ancre: 'middle' })}
          ${texte(XO, y, '⋮', { taille: 13, couleur: DISCRET, police: MONO })}`, 0.004);
        return;
      }
      if (l.fantome) {
        // Les données associées : jamais écrites, calculées de chaque côté.
        const oct = l.fantome.map((v, k) => [k, v]);
        const de = quand('rang');
        page += entre(C, fen(i, de), fen(i, 0.985), `
          <rect x="${xb(0) - 6}" y="${y - 17}" width="${xb(8) + 22 - xb(0)}" height="24" rx="6" fill="none" stroke="${COUL.rang}" stroke-dasharray="4 4"/>          ${ligneHex(oct, y, COUL.rang, 'fill-opacity="0.75"')}
          ${texte(XO, y, t('non écrit', 'not written'), { taille: 11, couleur: COUL.rang, police: MONO })}
          ${texte(XA, y, t('rang 2, pas le dernier', 'rank 2, not the last'), { taille: 11.5, couleur: COUL.rang })}`, 0.004);
        return;
      }
      const oct = l.octets.map((b, k) => [k, b]).filter(([, b]) => b);
      // La ligne en gris, qui s'écrit.
      page += entre(C, fen(i, apparait), fen(i, 0.985), `
        ${texte(XO, y, l.off.toString(16).toUpperCase().padStart(8, '0'), { taille: 13.5, couleur: DISCRET, police: MONO })}
        ${ligneHex(oct.map(([k, b]) => [k, b.v]), y, GRIS, 'fill-opacity="0.5"')}
        ${ligneAscii(oct.map(([k, b]) => [k, b.v]), y, DISCRET)}`, 0.004);
      // Puis chaque champ se colore sur cette ligne.
      for (const g of new Set(oct.map(([, b]) => b.genre))) {
        const part = oct.filter(([, b]) => b.genre === g);
        const k0 = part[0][0], k1 = part[part.length - 1][0];
        const de = Math.max(quand(g), apparait + 0.02);
        const c = COUL[g];
        page += entre(C, fen(i, de), fen(i, 0.985), `
          <rect x="${xb(k0) - 5}" y="${y - 17}" width="${xb(k1) + 22 - xb(k0)}" height="24" rx="5" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-opacity="0.55"/>
          ${ligneHex(part.map(([k, b]) => [k, b.v]), y, c)}
          ${ligneAscii(part.map(([k, b]) => [k, b.v]), y, g === 'marque' ? c : DISCRET)}`, 0.004);
        // Un éclair au moment où le champ se colore.
        page += `<rect x="${xb(k0) - 5}" y="${y - 17}" width="${xb(k1) + 22 - xb(k0)}" height="24" rx="5" fill="none" stroke="${c}" stroke-width="2" opacity="0" filter="url(#halo)">
          ${fondu('opacity', C, [[0, 0], [fen(i, de), 0], [fen(i, de) + 0.003, 1], [fen(i, de) + 0.02, 0], [1, 0]])}</rect>`;
      }
    });
    // La somme, sous les lignes.
    page += entre(C, fen(i, 0.86), fen(i, 0.985), `
      <line x1="${EX + 16}" y1="${EY + EH - 46}" x2="${EX + EL - 16}" y2="${EY + EH - 46}" stroke="${BORD}"/>
      ${texte(EX + 22, EY + EH - 20, o.somme, { taille: 13, couleur: TITRE, police: MONO, poids: 700 })}`, 0.004);
    corps += `<g opacity="0">${visible(C, fen(i, 0), fen(i, 0.985), 0.004)}${page}</g>`;

    // ------------------------------------------------------ les champs, à droite
    const RX = 848, RL = 372;
    let droite = rubrique(RX, 100, t(`${o.titre.toUpperCase()}, CHAMP PAR CHAMP`, `${o.titre.toUpperCase()}, FIELD BY FIELD`));
    const hC = o.champs.length > 5 ? 66 : 76;
    o.champs.forEach(([g, nom, taille, sens], k) => {
      const y = 116 + k * (hC + 8), c = COUL[g], de = quand(g);
      const fantome = g === 'rang' || g === 'dernier';
      droite += `<rect x="${RX}" y="${y}" width="${RL}" height="${hC}" rx="12" fill="${CARTE}" stroke="${BORD}" ${fantome ? 'stroke-dasharray="4 4"' : ''}/>
        <rect x="${RX}" y="${y}" width="${RL}" height="${hC}" rx="12" fill="none" stroke="${c}" stroke-opacity="0.7" opacity="0">${visible(C, fen(i, de), fen(i, 0.985), 0.004)}</rect>
        <rect x="${RX + 16}" y="${y + hC / 2 - 7}" width="14" height="14" rx="4" fill="${c}" fill-opacity="0.25" stroke="${c}"/>
        <rect x="${RX + 16}" y="${y + hC / 2 - 7}" width="14" height="14" rx="4" fill="${c}" opacity="0">${visible(C, fen(i, de), fen(i, 0.985), 0.004)}</rect>
        ${texte(RX + 44, y + hC / 2 - 4, nom, { taille: 14, couleur: TITRE, police: MONO, poids: 700 })}
        ${texte(RX + RL - 16, y + hC / 2 - 4, taille, { taille: 12, couleur: c, police: MONO, poids: 700, ancre: 'end' })}
        ${texte(RX + 44, y + hC / 2 + 16, sens, { taille: 12 })}`;
    });
    corps += `<g opacity="0">${visible(C, fen(i, 0), fen(i, 0.985), 0.004)}${droite}</g>`;

    // ------------------------------------------------------ la bande du bas
    const BY = 574, BH = 104;
    let bas = `<rect x="60" y="${BY}" width="1160" height="${BH}" rx="13" fill="${CARTE}" stroke="${BORD}"/>
`;
    if (o.bas) {
      bas += texte(84, BY + 44, o.bas[0], { taille: 14, couleur: TITRE, poids: 700 });
      bas += texte(84, BY + 72, o.bas[1], { taille: 13 });
    } else {
      // Ce que porte le flux d'une sauvegarde, une fois déchiffré.
      bas += rubrique(84, BY + 30, t('UNE FOIS DÉCHIFFRÉ, LE FLUX PORTE DES ENTRÉES', 'ONCE DECRYPTED, THE STREAM CARRIES ENTRIES'), TEXTE);
      const nom = [...'donnees.json'].map((ch) => ch.charCodeAt(0));
      const blocs = [
        [[1], t('genre', 'kind'), OR],
        [[0, 12], t('12 lettres', '12 letters'), OR],
        [nom, t('le nom, donnees.json', 'the name, donnees.json'), VERT],
        [[0, 0, 0, 0, 0, 3, 0x2a, 0x11], t('sa taille, 8 octets', 'its size, 8 bytes'), OR],
        [[0x7b, 0x22, 0x70, 0x65], t('les fiches…', 'the cards…'), VIOLET],
      ];
      let x = 84;
      blocs.forEach(([octs, titre, c], k) => {
        const l = octs.length * 21 + 14;
        const de = 0.34 + k * 0.08;
        bas += entre(C, fen(i, de), fen(i, 0.985), `
          <rect x="${x}" y="${BY + 42}" width="${l}" height="26" rx="6" fill="${c}" fill-opacity="0.14" stroke="${c}" stroke-opacity="0.6"/>
          <text x="${octs.flatMap((_, j) => [x + 8 + j * 21, x + 8 + j * 21 + 7.4]).map((v) => v.toFixed(1)).join(' ')}" y="${BY + 60}" font-family="${MONO}" font-size="12" fill="${c}">${octs.map(hex).join('')}</text>
          ${texte(x + l / 2, BY + 88, titre, { taille: 11.5, couleur: TEXTE, ancre: 'middle' })}`, 0.004);
        x += l + 10;
      });
      bas += entre(C, fen(i, 0.74), fen(i, 0.985), `
        ${texte(x + 6, BY + 60, t('puis chaque photo (02), chaque vidéo (03),', 'then every photo (02), every video (03),'), { taille: 12.5, couleur: TEXTE })}
        ${texte(x + 6, BY + 80, t('et un seul octet 00 pour finir.', 'and a single 00 byte to finish.'), { taille: 12.5, couleur: TEXTE })}`, 0.004);
    }
    corps += `<g opacity="0">${visible(C, fen(i, 0), fen(i, 0.985), 0.004)}${bas}</g>`;
  });

  svg('formats.svg', 1280, 700, corps, t(
    'Les formats de fichier de BodyCount, comme dans un éditeur hexadécimal. Une photo du coffre : la marque BCX1 sur 4 octets, un nonce de 12 octets tiré au hasard, la photo entière chiffrée d’un bloc en AES-256-GCM, puis un MAC de 16 octets, soit 4 + 12 + 184 288 + 16 octets ; son nom est un UUID qui ne dit rien de la personne. Une vidéo : la marque BCV1, puis des morceaux, chacun fait d’une longueur sur 4 octets, 00 10 00 00 pour un mégaoctet, d’un nonce neuf de 12 octets, d’un mégaoctet chiffré au plus et d’un MAC de 16 octets ; même clé et même extension que les photos. Une sauvegarde : la marque BCEX2 sur 5 octets, un sel de 16 octets en clair pour que PBKDF2 refasse la clé depuis la phrase de passe, puis le même flux par morceaux ; une fois déchiffré, il porte des entrées faites d’un genre sur 1 octet, de la longueur du nom sur 2, du nom, donnees.json en premier, de la taille sur 8 et du contenu, puis les photos et les vidéos, et un octet nul pour finir. Un morceau vu de près : 4 + 12 + 1 048 576 + 16 octets sur le disque, et 9 de plus authentifiés sans être écrits, son rang sur 8 octets et le fait d’être le dernier sur 1 ; déplacer ou couper un morceau change ces valeurs, et la lecture s’arrête au morceau touché.',
    'BodyCount’s file formats, as in a hex editor. A vault photo: the BCX1 mark on 4 bytes, a random 12-byte nonce, the whole photo encrypted in one block with AES-256-GCM, then a 16-byte MAC, that is 4 + 12 + 184,288 + 16 bytes; its name is a UUID that says nothing about the person. A video: the BCV1 mark, then chunks, each made of a 4-byte length, 00 10 00 00 for one megabyte, a fresh 12-byte nonce, at most one encrypted megabyte and a 16-byte MAC; same key and same extension as photos. A backup: the BCEX2 mark on 5 bytes, a 16-byte salt in the clear so that PBKDF2 can rebuild the key from the passphrase, then the same chunked stream; once decrypted, it carries entries made of a 1-byte kind, a 2-byte name length, the name, donnees.json first, an 8-byte size and the content, then the photos and videos, and a single zero byte to finish. One chunk up close: 4 + 12 + 1,048,576 + 16 bytes on disk, and 9 more authenticated without being written, its rank on 8 bytes and whether it is the last on 1; moving or cutting a chunk changes those values, and reading stops at the chunk touched.'));
};

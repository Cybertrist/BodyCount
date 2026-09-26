// Les versions, empilées l'une sur l'autre, comme dans SmartBudget.
//
// Chaque version tombe sur la précédente, comme elle s'installe sur le
// téléphone : par-dessus, sans rien effacer. En bas, le socle ne bouge
// jamais : tes données, et la clé de signature, la même de 1.0.0 à 1.1.0
// (le certificat que donne chaque Release). Un fil monte de la clé et
// scelle chaque version qui arrive. La 1.1.0 amène la démo, une seconde
// application qui se pose à côté de la pile, pas dessus. À gauche, la
// frise : le temps monte, du mercredi 23 au samedi 26 septembre.
module.exports = (O) => {
  const { t, svg, texte, entete, fondu, visible, entre, iconeApp, icone, logo,
    MONO, CARTE, BORD, TITRE, TEXTE, DISCRET, FIL, ACCENT, VIOLET, FUCHSIA, VERT, OR, APP } = O;
  const C = 22, FIN = 0.96;
  const L = 1280, H = 452;
  let corps = entete(t('LES VERSIONS', 'VERSIONS'),
    t('Deux versions. Chacune s’installe par-dessus la précédente, signée par la même clé : rien ne se perd.',
      'Two versions. Each installs over the previous one, signed with the same key: nothing is lost.'));

  // La pile : de 200 à 960, le socle en bas, les versions au-dessus.
  const PX = 180, PL = 780, SOCLE_Y = 334, SOCLE_H = 70;
  const versions = [
    {
      num: '1.0.0', sous: t('la première version', 'the first version'), ic: 'lock', c: VIOLET,
      y: 246, h: 72, arrive: 0.1, date: t('23 sept.', '23 Sept.'), jour: t('mercredi', 'Wednesday'),
      points: [
        t('Répertoire, statistiques, carte et calendrier', 'People list, statistics, map and calendar'),
        t('Galerie chiffrée, sauvegarde, restauration', 'Encrypted gallery, backup, restore'),
        t('Sans jeu d’essai : pas un octet', 'No sample set: not a single byte'),
      ],
    },
    {
      num: '1.1.0', sous: t('la démo, à côté', 'the demo, alongside'), ic: 'auto_awesome', c: FUCHSIA,
      y: 144, h: 86, arrive: 0.38, date: t('26 sept.', '26 Sept.'), jour: t('samedi', 'Saturday'),
      points: [
        t('Une seconde application, BodyCount démo', 'A second app, BodyCount demo'),
        t('Dix-huit fiches d’essai, avec leurs photos', 'Eighteen sample people, with their photos'),
        t('La vraie n’en garde pas un octet', 'The real one keeps not a single byte of it'),
      ],
    },
  ];
  const TOMBE = 0.05, SCELLE = 0.05;

  // --------------------------------------------------------------- la frise
  const FX = 88;
  corps += `<line x1="${FX}" y1="${SOCLE_Y + 20}" x2="${FX}" y2="108" stroke="${FIL}" stroke-width="2" stroke-dasharray="3 5"/>
    <path d="M${FX - 6} 116 L${FX} 106 L${FX + 6} 116" fill="none" stroke="${FIL}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  // Le trait plein monte avec les versions.
  const haut = (v) => v.y + v.h / 2;
  corps += `<line x1="${FX}" x2="${FX}" y1="${SOCLE_Y + 20}" y2="${SOCLE_Y + 20}" stroke="${VERT}" stroke-width="2.5" stroke-linecap="round">
    ${fondu('y2', C, [[0, SOCLE_Y + 20], [versions[0].arrive, SOCLE_Y + 20], [versions[0].arrive + TOMBE, haut(versions[0])],
      [versions[1].arrive, haut(versions[0])], [versions[1].arrive + TOMBE, haut(versions[1])], [FIN, haut(versions[1])], [FIN + 0.02, SOCLE_Y + 20], [1, SOCLE_Y + 20]])}</line>`;

  // ---------------------------------------------------------------- le socle
  corps += `<rect x="${PX}" y="${SOCLE_Y}" width="${PL}" height="${SOCLE_H}" rx="14" fill="${CARTE}" stroke="${BORD}"/>
    <rect x="${PX + 18}" y="${SOCLE_Y + 16}" width="38" height="38" rx="11" fill="${ACCENT}" fill-opacity="0.12" stroke="${ACCENT}" stroke-opacity="0.35"/>
    ${icone('base', PX + 26, SOCLE_Y + 24, ACCENT, 1.4)}
    ${texte(PX + 72, SOCLE_Y + 32, t('TES DONNÉES', 'YOUR DATA'), { taille: 13, couleur: TITRE, police: MONO, poids: 700, extra: 'letter-spacing="1"' })}
    ${texte(PX + 72, SOCLE_Y + 52, t('fiches, rencontres, carnets, photos et vidéos du coffre', 'people, encounters, notebooks, vault photos and videos'), { taille: 12.5 })}
    ${texte(PX + 440, SOCLE_Y + 30, t('INSTALLÉE', 'INSTALLED'), { taille: 10.5, couleur: DISCRET, police: MONO, poids: 700, extra: 'letter-spacing="2"' })}`;
  const etatSocle = [
    [0, versions[0].arrive + TOMBE, t('rien encore', 'nothing yet'), DISCRET],
    [versions[0].arrive + TOMBE, versions[1].arrive + TOMBE, t('1.0.0 installée : la première', '1.0.0 installed: the first'), VERT],
    [versions[1].arrive + TOMBE, 1, t('1.1.0 par-dessus 1.0.0 : rien de perdu', '1.1.0 over 1.0.0: nothing lost'), VERT],
  ];
  etatSocle.forEach(([de, a, s, c]) => {
    corps += entre(C, de, a, texte(PX + 440, SOCLE_Y + 52, s, { taille: 12.5, couleur: c, poids: 700 }), 0.004);
  });

  // La clé, à droite du socle, et le fil qui monte sceller chaque version.
  const KX = 1010;
  corps += `<rect x="${KX - 20}" y="${SOCLE_Y}" width="250" height="${SOCLE_H}" rx="14" fill="${CARTE}" stroke="${BORD}"/>
    ${icone('cle', KX - 4, SOCLE_Y + 24, OR, 1.4)}
    ${texte(KX + 28, SOCLE_Y + 32, t('MÊME CLÉ DE SIGNATURE', 'SAME SIGNING KEY'), { taille: 12, couleur: TITRE, police: MONO, poids: 700 })}
    ${texte(KX + 28, SOCLE_Y + 52, 'SHA-256 ac09674e…fef86d1', { taille: 11.5, couleur: TEXTE, police: MONO })}`;
  const FILX = PX + PL - 30;
  corps += `<line x1="${KX + 7}" y1="${SOCLE_Y}" x2="${KX + 7}" y2="${SOCLE_Y - 12}" stroke="${OR}" stroke-opacity="0.6" stroke-width="1.5" stroke-dasharray="3 4"/>
    <line x1="${FILX}" y1="${SOCLE_Y - 12}" x2="${KX + 7}" y2="${SOCLE_Y - 12}" stroke="${OR}" stroke-opacity="0.6" stroke-width="1.5" stroke-dasharray="3 4"/>
    <line x1="${FILX}" y1="${SOCLE_Y - 12}" x2="${FILX}" y2="${SOCLE_Y - 12}" stroke="${OR}" stroke-opacity="0.6" stroke-width="1.5" stroke-dasharray="3 4">
      ${fondu('y2', C, [[0, SOCLE_Y - 12], [versions[0].arrive + TOMBE, SOCLE_Y - 12], [versions[0].arrive + TOMBE + SCELLE, haut(versions[0])],
        [versions[1].arrive + TOMBE, haut(versions[0])], [versions[1].arrive + TOMBE + SCELLE, haut(versions[1])], [FIN, haut(versions[1])], [FIN + 0.02, SOCLE_Y - 12], [1, SOCLE_Y - 12]])}</line>`;

  // -------------------------------------------------------------- les versions
  versions.forEach((v, i) => {
    const derniere = i === versions.length - 1;
    const a = v.arrive, posee = a + TOMBE, scellee = posee + SCELLE;
    // La carte tombe d'au-dessus du cadre et se pose.
    let carte = `<rect x="${PX}" y="${v.y}" width="${PL}" height="${v.h}" rx="14" fill="${CARTE}" stroke="${BORD}"/>
      <rect x="${PX}" y="${v.y}" width="${PL}" height="${v.h}" rx="14" fill="none" stroke="${v.c}" stroke-width="1.5" opacity="0">${visible(C, posee, derniere ? FIN : versions[i + 1].arrive + TOMBE, 0.006)}</rect>
      <rect x="${PX + 18}" y="${v.y + v.h / 2 - 19}" width="38" height="38" rx="11" fill="${v.c}" fill-opacity="0.12" stroke="${v.c}" stroke-opacity="0.4"/>
      ${iconeApp(v.ic, PX + 26, v.y + v.h / 2 - 11, 22, v.c)}
      ${texte(PX + 72, v.y + v.h / 2 - 2, v.num, { taille: derniere ? 20 : 17, couleur: TITRE, police: MONO, poids: 700 })}
      ${texte(PX + 72, v.y + v.h / 2 + 17, v.sous, { taille: 12, couleur: v.c, poids: 600 })}`;
    // Les trois points, en colonnes régulières.
    v.points.forEach((p, j) => {
      const x = PX + 236 + j * 176;
      const mots = p.split(' ');
      let l1 = '', l2 = '';
      for (const m of mots) { if (!l2 && (l1 + ' ' + m).trim().length <= 24) l1 = (l1 + ' ' + m).trim(); else l2 = (l2 + ' ' + m).trim(); }
      carte += `<circle cx="${x}" cy="${v.y + v.h / 2 - (l2 ? 10 : 4)}" r="2.5" fill="${v.c}"/>
        ${texte(x + 10, v.y + v.h / 2 - (l2 ? 6 : 0), l1, { taille: 12, couleur: TEXTE })}
        ${l2 ? texte(x + 10, v.y + v.h / 2 + 11, l2, { taille: 12, couleur: TEXTE }) : ''}`;
    });
    // Le sceau de la clé, à droite, quand le fil l'atteint.
    carte += `<circle cx="${FILX}" cy="${haut(v)}" r="12" fill="${CARTE}" stroke="${FIL}" stroke-width="1.5"/>
      <g opacity="0">${visible(C, scellee, FIN, 0.006)}
        <circle cx="${FILX}" cy="${haut(v)}" r="12" fill="${VERT}" fill-opacity="0.16" stroke="${VERT}" stroke-width="1.5"/>
        ${icone('coche', FILX - 8, haut(v) - 8, VERT, 1)}
      </g>`;
    corps += `<g opacity="0">${visible(C, a, FIN, 0.006)}
      <g>${fondu('transform', C, [])}<animateTransform attributeName="transform" type="translate" dur="${C}s" repeatCount="indefinite"
        keyTimes="0;${a};${posee};1" values="0 -260;0 -260;0 0;0 0" keySplines="0 0 1 1;0.3 0 0.2 1;0 0 1 1" calcMode="spline"/>${carte}</g>
    </g>`.replace(`${fondu('transform', C, [])}`, '');
    // Sa date sur la frise.
    corps += entre(C, posee, FIN, `<circle cx="${FX}" cy="${haut(v)}" r="6" fill="${v.c}" stroke="${CARTE}" stroke-width="2"/>
      ${texte(FX + 16, haut(v) - 2, v.date, { taille: 12.5, couleur: v.c, police: MONO, poids: 700 })}
      ${texte(FX + 16, haut(v) + 15, v.jour, { taille: 11, couleur: DISCRET })}`, 0.006);
  });

  // ------------------------------------------ la démo, posée à côté de la pile
  const v11 = versions[1], DEMO = v11.arrive + TOMBE + 0.12;
  const DX = 990, DY = v11.y - 4, DW = 250, DH = v11.h + 8;
  corps += entre(C, DEMO, FIN, `
    <path d="M${PX + PL} ${haut(v11)} H${DX}" stroke="${FUCHSIA}" stroke-width="1.5" stroke-dasharray="4 4" fill="none"/>
    <rect x="${DX}" y="${DY}" width="${DW}" height="${DH}" rx="14" fill="${FUCHSIA}" fill-opacity="0.07" stroke="${FUCHSIA}" stroke-opacity="0.55"/>
    ${logo(DX + 36, DY + DH / 2, 40)}
    ${texte(DX + 66, DY + DH / 2 - 8, t('BodyCount démo', 'BodyCount demo'), { taille: 14, couleur: TITRE, poids: 700 })}
    ${texte(DX + 66, DY + DH / 2 + 10, t('identifiant .demo', 'identifier .demo'), { taille: 11.5, couleur: FUCHSIA, police: MONO })}
    ${texte(DX + 66, DY + DH / 2 + 27, t('à côté, sans toucher la vraie', 'alongside, never touching it'), { taille: 11.5, couleur: TEXTE })}`, 0.006);

  // La dernière reste allumée : en cours, et ses tests au vert.
  const EN = DEMO + 0.1;
  corps += entre(C, EN, FIN, `
    <rect x="${PX + 150}" y="${v11.y - 26}" width="84" height="20" rx="10" fill="${VERT}"/>
    ${texte(PX + 192, v11.y - 12, t('EN COURS', 'CURRENT'), { taille: 10.5, couleur: '#04130A', police: MONO, poids: 700, ancre: 'middle' })}
    ${texte(PX + 246, v11.y - 12, t('24 tests sur l’émulateur, tous au vert', '24 tests on the emulator, all green'), { taille: 12, couleur: VERT, poids: 600 })}`, 0.006);
  const BARRE_X = PX + 520, BARRE_L = 250;
  corps += entre(C, EN, FIN, `<rect x="${BARRE_X}" y="${v11.y - 20}" width="${BARRE_L}" height="8" rx="4" fill="${FIL}"/>
    <rect x="${BARRE_X}" y="${v11.y - 20}" height="8" rx="4" width="0" fill="${VERT}">${fondu('width', C, [[0, 0], [EN, 0], [EN + 0.18, BARRE_L], [1, BARRE_L]])}</rect>`, 0.006);

  corps += texte(L / 2, H - 22, t('Chaque Release donne l’empreinte SHA-256 de l’APK et celle du certificat, pour vérifier avant d’installer.',
    'Each Release gives the APK’s SHA-256 fingerprint and the certificate’s, to check before installing.'), { taille: 12, couleur: DISCRET, ancre: 'middle' });

  svg('versions.svg', L, H, corps, t(
    'Les versions de BodyCount, empilées l’une sur l’autre : chacune tombe sur la précédente, comme elle s’installe. En bas, le socle ne bouge pas : tes données, fiches, rencontres, carnets, photos et vidéos du coffre, et la clé de signature, la même pour toutes, dont le fil monte sceller chaque version. 1.0.0, mercredi 23 septembre 2026 : la première version, répertoire, statistiques, carte et calendrier, galerie chiffrée, sauvegarde et restauration, sans jeu d’essai. 1.1.0, samedi 26 septembre : la démo, une seconde application, BodyCount démo, d’identifiant .demo, qui se pose à côté de la pile avec ses dix-huit fiches d’essai, sans toucher la vraie. 1.1.0 par-dessus 1.0.0 : rien de perdu. Elle reste allumée, avec ses 24 tests au vert.',
    'The BodyCount versions, stacked one on top of the other: each drops onto the previous one, the way it installs. At the bottom, the base never moves: your data, people, encounters, notebooks, vault photos and videos, and the signing key, the same for all, whose thread rises to seal each version. 1.0.0, Wednesday 23 September 2026: the first version, people list, statistics, map and calendar, encrypted gallery, backup and restore, without the sample set. 1.1.0, Saturday 26 September: the demo, a second app, BodyCount demo, identifier .demo, which sits next to the stack with its eighteen sample people, never touching the real one. 1.1.0 over 1.0.0: nothing lost. It stays lit, with its 24 tests green.'));
};

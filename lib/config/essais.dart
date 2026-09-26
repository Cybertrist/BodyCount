/// Le jeu d'essai n'existe que dans une version de travail, ou dans la démo.
///
/// `flutter build apk --dart-define=ESSAIS=true` le fait apparaître dans
/// les réglages. Sans ce drapeau ni la démo, la constante vaut faux à la
/// compilation : le compilateur retire alors la ligne des réglages, et
/// avec elle tout le générateur, ses dix-huit profils et leurs carnets.
/// L'APK publié n'en garde pas un octet.
const bool avecEssais = bool.fromEnvironment('ESSAIS') || modeDemo;

/// La démo publiée : `--flavor demo --dart-define=DEMO=true`.
///
/// Une application à part, « BodyCount démo », d'identifiant `.demo`, qui
/// s'installe à côté de la vraie sans la toucher. Elle embarque les
/// visages du jeu d'essai (la variante `demo` seule les reçoit, voir
/// pubspec.yaml), se remplit toute seule au premier déverrouillage, et
/// laisse passer les captures d'écran : elle est faite pour être montrée.
const bool modeDemo = bool.fromEnvironment('DEMO');

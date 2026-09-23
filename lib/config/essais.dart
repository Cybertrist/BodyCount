/// Le jeu d'essai n'existe que dans une version de travail.
///
/// `flutter build apk --dart-define=ESSAIS=true` le fait apparaître dans
/// les réglages. Sans ce drapeau, la constante vaut faux à la compilation :
/// le compilateur retire alors la ligne des réglages, et avec elle tout le
/// générateur, ses dix-huit profils et leurs carnets. L'APK publié n'en
/// garde pas un octet.
const bool avecEssais = bool.fromEnvironment('ESSAIS');

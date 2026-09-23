import 'package:bodycount/donnees/coordonnees.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(chargerCommunes);

  void proche(Coordonnee? c, double lat, double lon) {
    expect(c, isNotNull);
    expect(c!.latitude, closeTo(lat, 0.05));
    expect(c.longitude, closeTo(lon, 0.05));
  }

  test('un petit village du Morbihan est sur la carte', () {
    proche(coordonneesEnFrance('Locmariaquer'), 47.58, -2.96);
    proche(coordonneesEnFrance('ploemel'), 47.66, -3.08);
  });

  test('un début de nom suffit', () {
    proche(coordonneesEnFrance('Plougastel'), 48.36, -4.39);
  });

  test('une faute de frappe tombe quand même', () {
    proche(coordonneesEnFrance('Lorien'), 47.75, -3.37);
    proche(coordonneesEnFrance('Locmariaqer'), 47.58, -2.96);
  });

  test('un nom de ville suivi d\'une précision', () {
    proche(coordonneesEnFrance('Vannes centre'), 47.66, -2.76);
  });

  test('le département départage les homonymes', () {
    proche(coordonneesEnFrance('Saint-Denis'), 48.94, 2.37);
    proche(coordonneesEnFrance('Saint-Denis (11)'), 43.36, 2.22);
  });

  test('l\'étranger a des coordonnées, pas de place sur la carte', () {
    expect(coordonneesEnFrance('Londres'), isNull);
    expect(coordonneesDe('Londres'), isNotNull);
  });

  test('un lieu qui n\'est pas une ville n\'en devient pas une', () {
    expect(coordonneesDe('Chez lui'), isNull);
    expect(coordonneesDe('Le Fébrile'), isNull);
  });
}

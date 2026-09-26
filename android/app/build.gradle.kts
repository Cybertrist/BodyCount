import java.util.Properties

plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// La clé de publication vit hors du dépôt. android/key.properties, ignoré
// par git, dit où la trouver et avec quel mot de passe. Sans lui, la
// version de publication est signée avec la clé de débogage, ce qui suffit
// pour essayer mais pas pour distribuer : une application ne se met à jour
// que par dessus une version signée de la même clé.
val proprietesCle = Properties().apply {
    val fichier = rootProject.file("key.properties")
    if (fichier.exists()) fichier.inputStream().use { load(it) }
}
val clePresente = proprietesCle.containsKey("storeFile")

android {
    namespace = "com.bodycount.bodycount"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    // Pour le nom de l'application, qui change avec la démo.
    buildFeatures {
        resValues = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.bodycount.bodycount"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    // Deux applications du même code. « complete », la vraie ; « demo »,
    // une application à part, qui s'installe à côté sans la toucher et
    // embarque les visages du jeu d'essai (pubspec.yaml ne les donne qu'à
    // elle). Chaque construction nomme donc sa variante :
    //
    //   flutter build apk --flavor complete
    //   flutter build apk --flavor demo --dart-define=DEMO=true
    flavorDimensions += "variante"
    productFlavors {
        create("complete") {
            dimension = "variante"
            resValue("string", "app_name", "BodyCount")
        }
        create("demo") {
            dimension = "variante"
            applicationIdSuffix = ".demo"
            resValue("string", "app_name", "BodyCount démo")
        }
    }

    signingConfigs {
        if (clePresente) {
            create("publication") {
                storeFile = file(proprietesCle.getProperty("storeFile"))
                storePassword = proprietesCle.getProperty("storePassword")
                keyAlias = proprietesCle.getProperty("keyAlias")
                keyPassword = proprietesCle.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName(if (clePresente) "publication" else "debug")
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}

dependencies {
    // Le réencodage des vidéos à l'import, par la bibliothèque officielle
    // d'Android : elle passe par l'encodeur matériel du téléphone.
    implementation("androidx.media3:media3-transformer:1.11.1")
    implementation("androidx.media3:media3-effect:1.11.1")
    implementation("androidx.media3:media3-common:1.11.1")
}

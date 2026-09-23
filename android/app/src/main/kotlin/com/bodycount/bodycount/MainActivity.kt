package com.bodycount.bodycount

import android.os.Bundle
import android.view.WindowManager
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

/**
 * FLAG_SECURE bloque deux choses d'un coup : les captures d'écran et
 * l'enregistrement, et l'aperçu dans la liste des applications récentes,
 * qui montre alors un rectangle vide à la place des fiches.
 *
 * Il n'est plus posé au démarrage : pendant la phase d'essai, pouvoir
 * faire des captures compte plus. Le réglage le rallume, et il vaut alors
 * pour toute la session. Le jour où il redeviendra actif par défaut, il
 * faudra le reposer ici plutôt que depuis le Dart, sinon la fenêtre reste
 * enregistrable le temps que le moteur Flutter s'initialise.
 */
class MainActivity : FlutterFragmentActivity() {

    private val channelName = "bodycount/ecran"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channelName)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "protegerEcran" -> {
                        val actif = call.argument<Boolean>("actif") ?: true
                        if (actif) {
                            window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
                        } else {
                            window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
                        }
                        result.success(actif)
                    }
                    else -> result.notImplemented()
                }
            }
    }
}

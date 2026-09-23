package com.bodycount.bodycount

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Matrix
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Bundle
import android.view.WindowManager
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.FileProvider
import io.flutter.plugin.common.MethodChannel
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.concurrent.Executors
import javax.crypto.AEADBadTagException
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import kotlin.math.max

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

    private val canalEcran = "bodycount/ecran"
    private val canalMedias = "bodycount/medias"
    private val canalFichiers = "bodycount/fichiers"
    private val canalAes = "bodycount/aes"

    /**
     * Un seul fil pour l'AES : les morceaux d'un flux arrivent dans l'ordre
     * et doivent repartir dans l'ordre, et l'interface ne doit jamais
     * attendre un chiffrement.
     */
    private val filAes = Executors.newSingleThreadExecutor()

    /**
     * Les fichiers passent par le sélecteur du système : il laisse choisir
     * un emplacement, Téléchargements, une carte SD, un dossier synchronisé,
     * sans que l'application demande le droit de lire tout le stockage.
     * Une seule demande à la fois, dont on garde la réponse en attente.
     */
    private var attenteOuverture: MethodChannel.Result? = null
    private var attenteEnregistrement: MethodChannel.Result? = null
    private var aEnregistrer: File? = null

    private val choisirFichier =
        registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
            val reponse = attenteOuverture ?: return@registerForActivityResult
            attenteOuverture = null
            if (uri == null) {
                reponse.success(null)
                return@registerForActivityResult
            }
            // Recopié dans le cache privé : le Dart lit un chemin, et
            // l'accès à l'URI ne survit pas forcément à l'activité.
            Thread {
                val copie = File(cacheDir, "restauration.bcx")
                val ok = copier(uri, copie, versUri = false)
                runOnUiThread { reponse.success(if (ok) copie.path else null) }
            }.start()
        }

    private val creerFichier =
        registerForActivityResult(
            ActivityResultContracts.CreateDocument("application/octet-stream"),
        ) { uri ->
            val reponse = attenteEnregistrement ?: return@registerForActivityResult
            val source = aEnregistrer
            attenteEnregistrement = null
            aEnregistrer = null
            if (uri == null || source == null) {
                reponse.success(false)
                return@registerForActivityResult
            }
            Thread {
                val ok = copier(uri, source, versUri = true)
                runOnUiThread { reponse.success(ok) }
            }.start()
        }

    private fun copier(uri: Uri, fichier: File, versUri: Boolean): Boolean {
        return try {
            if (versUri) {
                contentResolver.openOutputStream(uri, "w")?.use { sortie ->
                    fichier.inputStream().use { it.copyTo(sortie, 1 shl 20) }
                } ?: return false
            } else {
                contentResolver.openInputStream(uri)?.use { entree ->
                    fichier.outputStream().use { entree.copyTo(it, 1 shl 20) }
                } ?: return false
            }
            true
        } catch (e: Exception) {
            false
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, canalEcran)
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

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, canalFichiers)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "ouvrir" -> {
                        if (attenteOuverture != null) {
                            result.error("occupe", "Une sélection est déjà ouverte", null)
                        } else {
                            attenteOuverture = result
                            choisirFichier.launch(arrayOf("*/*"))
                        }
                    }
                    "partager" -> {
                        val chemin = call.argument<String>("chemin")
                        if (chemin == null) {
                            result.error("chemin", "Chemin absent", null)
                        } else {
                            partager(File(chemin))
                            result.success(true)
                        }
                    }
                    "enregistrer" -> {
                        val chemin = call.argument<String>("chemin")
                        val nom = call.argument<String>("nom") ?: "bodycount.bcx"
                        if (chemin == null || attenteEnregistrement != null) {
                            result.error("occupe", "Enregistrement impossible", null)
                        } else {
                            attenteEnregistrement = result
                            aEnregistrer = File(chemin)
                            creerFichier.launch(nom)
                        }
                    }
                    else -> result.notImplemented()
                }
            }

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, canalAes)
            .setMethodCallHandler { call, result ->
                val cle = call.argument<ByteArray>("cle")
                val nonce = call.argument<ByteArray>("nonce")
                val aad = call.argument<ByteArray>("aad") ?: ByteArray(0)
                val donnees = call.argument<ByteArray>("donnees")
                if (cle == null || nonce == null || donnees == null) {
                    result.error("arguments", "Arguments manquants", null)
                    return@setMethodCallHandler
                }
                val mode = when (call.method) {
                    "chiffrer" -> Cipher.ENCRYPT_MODE
                    "dechiffrer" -> Cipher.DECRYPT_MODE
                    else -> {
                        result.notImplemented()
                        return@setMethodCallHandler
                    }
                }
                filAes.execute {
                    try {
                        val sortie = aesGcm(mode, cle, nonce, aad, donnees)
                        runOnUiThread { result.success(sortie) }
                    } catch (e: AEADBadTagException) {
                        runOnUiThread { result.error("refuse", "Authentification refusée", null) }
                    } catch (e: Exception) {
                        runOnUiThread { result.error("aes", e.message, null) }
                    }
                }
            }

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, canalMedias)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "apercu" -> {
                        val chemin = call.argument<String>("chemin")
                        if (chemin == null) {
                            result.error("chemin", "Chemin absent", null)
                        } else {
                            // Décoder une image de vidéo prend un moment :
                            // hors du fil de l'interface, qui gèlerait.
                            Thread {
                                val apercu = apercuVideo(chemin)
                                runOnUiThread { result.success(apercu) }
                            }.start()
                        }
                    }
                    else -> result.notImplemented()
                }
            }
    }

    /**
     * AES-GCM par le fournisseur du système, qui passe par les instructions
     * AES du processeur. Le chiffré rendu est suivi de son étiquette de
     * seize octets, comme l'attend le côté Dart ; au déchiffrement, une
     * étiquette fausse lève AEADBadTagException.
     */
    private fun aesGcm(
        mode: Int,
        cle: ByteArray,
        nonce: ByteArray,
        aad: ByteArray,
        donnees: ByteArray,
    ): ByteArray {
        val aes = Cipher.getInstance("AES/GCM/NoPadding")
        aes.init(mode, SecretKeySpec(cle, "AES"), GCMParameterSpec(128, nonce))
        if (aad.isNotEmpty()) aes.updateAAD(aad)
        return aes.doFinal(donnees)
    }

    /**
     * Propose la sauvegarde aux autres applications, par une URI que seule
     * l'application choisie pourra lire, le temps de la lire.
     */
    private fun partager(fichier: File) {
        val uri = FileProvider.getUriForFile(this, "$packageName.partage", fichier)
        val envoi = Intent(Intent.ACTION_SEND).apply {
            type = "application/octet-stream"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        startActivity(Intent.createChooser(envoi, fichier.name))
    }

    /**
     * La durée d'une vidéo et une image tirée d'une seconde après le
     * début, réduite à 480 points et compressée en JPEG. La toute première
     * image est souvent noire : un fondu, une caméra qui s'ouvre.
     *
     * Rend null si le fichier n'est pas lisible : la vidéo sera gardée
     * quand même, sans vignette.
     */
    private fun apercuVideo(chemin: String): Map<String, Any?>? {
        val lecteur = MediaMetadataRetriever()
        return try {
            lecteur.setDataSource(chemin)
            val duree = lecteur
                .extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
                ?.toLongOrNull()
            val brute = lecteur.getFrameAtTime(
                1_000_000,
                MediaMetadataRetriever.OPTION_CLOSEST_SYNC,
            ) ?: lecteur.frameAtTime
            val image = brute?.let { redresser(it, lecteur) }?.let { reduire(it) }
            val jpeg = image?.let {
                val sortie = ByteArrayOutputStream()
                it.compress(Bitmap.CompressFormat.JPEG, 82, sortie)
                sortie.toByteArray()
            }
            mapOf("duree" to duree, "image" to jpeg)
        } catch (e: Exception) {
            null
        } finally {
            lecteur.release()
        }
    }

    /**
     * Une vidéo filmée en portrait est souvent stockée couchée, avec un
     * angle à appliquer. Selon les versions d'Android, l'image rendue a
     * déjà été tournée ou non : on compare son orientation à celle du
     * fichier pour savoir s'il reste à le faire.
     */
    private fun redresser(image: Bitmap, lecteur: MediaMetadataRetriever): Bitmap {
        val angle = lecteur
            .extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)
            ?.toIntOrNull() ?: 0
        if (angle != 90 && angle != 270) return image
        val largeur = lecteur
            .extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)
            ?.toIntOrNull() ?: return image
        val hauteur = lecteur
            .extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)
            ?.toIntOrNull() ?: return image
        val encoreCouchee = (image.width > image.height) == (largeur > hauteur)
        if (!encoreCouchee) return image
        val rotation = Matrix().apply { postRotate(angle.toFloat()) }
        return Bitmap.createBitmap(image, 0, 0, image.width, image.height, rotation, true)
    }

    private fun reduire(image: Bitmap): Bitmap {
        val cote = max(image.width, image.height)
        if (cote <= 480) return image
        val echelle = 480f / cote
        return Bitmap.createScaledBitmap(
            image,
            (image.width * echelle).toInt(),
            (image.height * echelle).toInt(),
            true,
        )
    }
}

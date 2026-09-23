package com.bodycount.bodycount

import android.content.ContentValues
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Matrix
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.view.WindowManager
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.FileProvider
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.effect.Presentation
import androidx.media3.transformer.Composition
import androidx.media3.transformer.DefaultEncoderFactory
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.Effects
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.ProgressHolder
import androidx.media3.transformer.Transformer
import androidx.media3.transformer.VideoEncoderSettings
import io.flutter.plugin.common.MethodChannel
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.concurrent.Executors
import javax.crypto.AEADBadTagException
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import kotlin.math.max
import kotlin.math.min

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

    /** Le canal des médias, gardé pour lui renvoyer l'avancement. */
    private var canalMediasOuvert: MethodChannel? = null

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

        val medias = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, canalMedias)
        canalMediasOuvert = medias
        medias
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "alleger" -> {
                        val chemin = call.argument<String>("chemin")
                        if (chemin == null) {
                            result.error("chemin", "Chemin absent", null)
                        } else {
                            alleger(File(chemin)) { sortie -> result.success(sortie?.path) }
                        }
                    }
                    "versGalerie" -> {
                        val nom = call.argument<String>("nom") ?: "bodycount"
                        val mime = call.argument<String>("mime") ?: "image/jpeg"
                        val video = call.argument<Boolean>("video") ?: false
                        val chemin = call.argument<String>("chemin")
                        val octets = call.argument<ByteArray>("octets")
                        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                            // Avant Android 10, écrire dans la galerie
                            // demande un droit sur tout le stockage : le
                            // Dart passe alors par « enregistrer sous ».
                            result.success("nonGere")
                        } else {
                            Thread {
                                val ok = versGalerie(nom, mime, video, chemin, octets)
                                runOnUiThread { result.success(if (ok) "ok" else "echec") }
                            }.start()
                        }
                    }
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
     * Réencode une vidéo trop lourde : H.264, 720 points sur le petit côté,
     * 2,5 Mb/s, le son tel quel. Le téléphone filme en 4K à 50 Mb/s pour une
     * vidéo qu'on regardera sur son écran ; la garder telle quelle
     * remplirait le coffre et rendrait les sauvegardes intransportables.
     *
     * Rien n'est fait si la vidéo est déjà légère, et le résultat n'est
     * gardé que s'il gagne au moins un dixième : réencoder dégrade toujours
     * un peu, ça doit valoir la peine. Rend null quand l'original reste.
     */
    private fun alleger(source: File, fin: (File?) -> Unit) {
        val lecteur = MediaMetadataRetriever()
        val (largeur, hauteur, debit) = try {
            lecteur.setDataSource(source.path)
            Triple(
                lecteur.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toIntOrNull() ?: 0,
                lecteur.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toIntOrNull() ?: 0,
                lecteur.extractMetadata(MediaMetadataRetriever.METADATA_KEY_BITRATE)?.toIntOrNull() ?: 0,
            )
        } catch (e: Exception) {
            Triple(0, 0, 0)
        } finally {
            lecteur.release()
        }
        val petitCote = min(largeur, hauteur)
        if (petitCote == 0 || (petitCote <= 720 && debit in 1..4_000_000)) {
            fin(null)
            return
        }

        val sortie = File(cacheDir, "allegee-" + System.nanoTime() + ".mp4")
        val element = EditedMediaItem.Builder(MediaItem.fromUri(Uri.fromFile(source)))
            .setEffects(Effects(listOf(), listOf(Presentation.createForShortSide(min(petitCote, 720)))))
            .build()
        val encodeur = DefaultEncoderFactory.Builder(this)
            .setRequestedVideoEncoderSettings(
                VideoEncoderSettings.Builder().setBitrate(2_500_000).build(),
            )
            .build()
        val principal = Handler(Looper.getMainLooper())
        var termine = false

        val transformer = Transformer.Builder(this)
            .setVideoMimeType(MimeTypes.VIDEO_H264)
            .setEncoderFactory(encodeur)
            .addListener(object : Transformer.Listener {
                override fun onCompleted(composition: Composition, resultat: ExportResult) {
                    termine = true
                    val gagne = sortie.exists() && sortie.length() < source.length() * 9 / 10
                    if (!gagne) sortie.delete()
                    fin(if (gagne) sortie else null)
                }

                override fun onError(
                    composition: Composition,
                    resultat: ExportResult,
                    erreur: ExportException,
                ) {
                    termine = true
                    sortie.delete()
                    fin(null)
                }
            })
            .build()

        // L'avancement, remonté au Dart quatre fois par seconde.
        val progression = ProgressHolder()
        val suivi = object : Runnable {
            override fun run() {
                if (termine) return
                if (transformer.getProgress(progression) == Transformer.PROGRESS_STATE_AVAILABLE) {
                    canalMediasOuvert?.invokeMethod("avancement", progression.progress)
                }
                principal.postDelayed(this, 250)
            }
        }
        transformer.start(element, sortie.path)
        principal.post(suivi)
    }

    /**
     * Range une photo ou une vidéo dans la galerie, sous Images/BodyCount
     * ou Films/BodyCount. Le fichier y est en clair : c'est tout l'objet
     * du geste, sortir un média du coffre pour le garder ailleurs.
     *
     * L'entrée est marquée « en cours » le temps de l'écriture, pour que
     * la galerie ne montre pas une image à moitié écrite ; en cas d'échec,
     * elle est retirée.
     */
    private fun versGalerie(
        nom: String,
        mime: String,
        video: Boolean,
        chemin: String?,
        octets: ByteArray?,
    ): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return false
        val dossier = if (video) Environment.DIRECTORY_MOVIES else Environment.DIRECTORY_PICTURES
        val collection = if (video) {
            MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        } else {
            MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        }
        val valeurs = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, nom)
            put(MediaStore.MediaColumns.MIME_TYPE, mime)
            put(MediaStore.MediaColumns.RELATIVE_PATH, "$dossier/BodyCount")
            put(MediaStore.MediaColumns.IS_PENDING, 1)
        }
        val uri = contentResolver.insert(collection, valeurs) ?: return false
        return try {
            contentResolver.openOutputStream(uri)?.use { sortie ->
                if (octets != null) {
                    sortie.write(octets)
                } else {
                    File(chemin ?: return false).inputStream().use { it.copyTo(sortie, 1 shl 20) }
                }
            } ?: throw IllegalStateException("Flux indisponible")
            val fini = ContentValues().apply { put(MediaStore.MediaColumns.IS_PENDING, 0) }
            contentResolver.update(uri, fini, null, null)
            true
        } catch (e: Exception) {
            contentResolver.delete(uri, null, null)
            false
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

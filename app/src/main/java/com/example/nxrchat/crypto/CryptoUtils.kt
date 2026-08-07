package com.example.nxrchat.crypto

import android.util.Base64
import org.json.JSONObject
import java.security.KeyFactory
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.MessageDigest
import java.security.PrivateKey
import java.security.PublicKey
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

data class KeyPairBase64(
    val publicKeyBase64: String,
    val privateKeyBase64: String,
    val fingerprint: String
)

object CryptoUtils {

    private const val RSA_ALGORITHM = "RSA"
    private const val RSA_TRANSFORMATION = "RSA/ECB/PKCS1Padding"
    private const val AES_ALGORITHM = "AES"
    private const val AES_TRANSFORMATION = "AES/GCM/NoPadding"
    private const val GCM_TAG_LENGTH = 128
    private const val GCM_IV_LENGTH = 12

    /**
     * Generates a 2048-bit RSA keypair locally on device.
     */
    fun generateKeyPair(): KeyPairBase64 {
        val keyPairGenerator = KeyPairGenerator.getInstance(RSA_ALGORITHM)
        keyPairGenerator.initialize(2048)
        val keyPair: KeyPair = keyPairGenerator.generateKeyPair()

        val pubBase64 = Base64.encodeToString(keyPair.public.encoded, Base64.NO_WRAP)
        val privBase64 = Base64.encodeToString(keyPair.private.encoded, Base64.NO_WRAP)
        val fingerprint = computeFingerprint(pubBase64)

        return KeyPairBase64(
            publicKeyBase64 = pubBase64,
            privateKeyBase64 = privBase64,
            fingerprint = fingerprint
        )
    }

    /**
     * Computes a readable SHA-256 fingerprint from public key base64.
     */
    fun computeFingerprint(publicKeyBase64: String): String {
        return try {
            val digest = MessageDigest.getInstance("SHA-256")
            val hash = digest.digest(publicKeyBase64.toByteArray())
            val hex = hash.joinToString("") { "%02X".format(it) }
            "NXR-${hex.take(12)}"
        } catch (e: Exception) {
            "NXR-UNKNOWN"
        }
    }

    private fun getPublicKeyFromBase64(base64: String): PublicKey {
        val keyBytes = Base64.decode(base64, Base64.NO_WRAP)
        val spec = X509EncodedKeySpec(keyBytes)
        val keyFactory = KeyFactory.getInstance(RSA_ALGORITHM)
        return keyFactory.generatePublic(spec)
    }

    private fun getPrivateKeyFromBase64(base64: String): PrivateKey {
        val keyBytes = Base64.decode(base64, Base64.NO_WRAP)
        val spec = PKCS8EncodedKeySpec(keyBytes)
        val keyFactory = KeyFactory.getInstance(RSA_ALGORITHM)
        return keyFactory.generatePrivate(spec)
    }

    /**
     * Hybrid Encryption:
     * 1. Generate random AES-256 key and IV.
     * 2. Encrypt plaintext using AES-GCM.
     * 3. Encrypt AES key using recipient's RSA public key.
     * 4. Return JSON packet containing wrapped key, IV, and ciphertext.
     */
    fun encrypt(plainText: String, recipientPublicKeyBase64: String): String {
        val recipientPublicKey = getPublicKeyFromBase64(recipientPublicKeyBase64)

        // Generate AES Key
        val keyGen = KeyGenerator.getInstance(AES_ALGORITHM)
        keyGen.init(256)
        val aesKey: SecretKey = keyGen.generateKey()

        // Encrypt plainText with AES-GCM
        val cipherAes = Cipher.getInstance(AES_TRANSFORMATION)
        cipherAes.init(Cipher.ENCRYPT_MODE, aesKey)
        val iv = cipherAes.iv
        val cipherTextBytes = cipherAes.doFinal(plainText.toByteArray(Charsets.UTF_8))

        // Wrap AES key with recipient's RSA Public Key
        val cipherRsa = Cipher.getInstance(RSA_TRANSFORMATION)
        cipherRsa.init(Cipher.ENCRYPT_MODE, recipientPublicKey)
        val wrappedAesKeyBytes = cipherRsa.doFinal(aesKey.encoded)

        val wrappedKeyBase64 = Base64.encodeToString(wrappedAesKeyBytes, Base64.NO_WRAP)
        val ivBase64 = Base64.encodeToString(iv, Base64.NO_WRAP)
        val cipherTextBase64 = Base64.encodeToString(cipherTextBytes, Base64.NO_WRAP)

        val json = JSONObject()
        json.put("key", wrappedKeyBase64)
        json.put("iv", ivBase64)
        json.put("body", cipherTextBase64)

        return json.toString()
    }

    /**
     * Hybrid Decryption:
     * 1. Parse JSON packet.
     * 2. Decrypt AES key using recipient's (my) RSA private key.
     * 3. Decrypt ciphertext using AES-GCM.
     */
    fun decrypt(encryptedJsonStr: String, myPrivateKeyBase64: String): String {
        return try {
            val myPrivateKey = getPrivateKeyFromBase64(myPrivateKeyBase64)
            val json = JSONObject(encryptedJsonStr)

            val wrappedKeyBase64 = json.getString("key")
            val ivBase64 = json.getString("iv")
            val cipherTextBase64 = json.getString("body")

            val wrappedKeyBytes = Base64.decode(wrappedKeyBase64, Base64.NO_WRAP)
            val ivBytes = Base64.decode(ivBase64, Base64.NO_WRAP)
            val cipherTextBytes = Base64.decode(cipherTextBase64, Base64.NO_WRAP)

            // Unwrap AES Key with RSA Private Key
            val cipherRsa = Cipher.getInstance(RSA_TRANSFORMATION)
            cipherRsa.init(Cipher.DECRYPT_MODE, myPrivateKey)
            val aesKeyBytes = cipherRsa.doFinal(wrappedKeyBytes)
            val aesKey: SecretKey = SecretKeySpec(aesKeyBytes, AES_ALGORITHM)

            // Decrypt payload with AES-GCM
            val cipherAes = Cipher.getInstance(AES_TRANSFORMATION)
            val spec = GCMParameterSpec(GCM_TAG_LENGTH, ivBytes)
            cipherAes.init(Cipher.DECRYPT_MODE, aesKey, spec)
            val plainBytes = cipherAes.doFinal(cipherTextBytes)

            String(plainBytes, Charsets.UTF_8)
        } catch (e: Exception) {
            e.printStackTrace()
            "[Decryption Error: Invalid key or tampered payload]"
        }
    }
}

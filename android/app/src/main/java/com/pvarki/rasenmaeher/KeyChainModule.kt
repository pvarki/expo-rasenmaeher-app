package com.pvarki.rasenmaeher

import android.content.Intent
import android.security.KeyChain
import android.security.KeyChainAliasCallback
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.security.KeyStore
import java.security.PrivateKey
import java.security.cert.Certificate
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import java.util.ArrayList

class KeyChainModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "KeyChainModule"
    }

    @ReactMethod
    fun installCertificate(p12: String, name: String, promise: Promise) {
        try {
            val p12Bytes = Base64.decode(p12, Base64.DEFAULT)
            val keyStore = KeyStore.getInstance("PKCS12")
            keyStore.load(p12Bytes.inputStream(), "".toCharArray())

            val alias = keyStore.aliases().nextElement()
            val entry = keyStore.getEntry(alias, null) as KeyStore.PrivateKeyEntry

            val privateKey = entry.privateKey
            val certChain = entry.certificateChain
            val certificates = ArrayList<X509Certificate>()
            for (certificate in certChain) {
                certificates.add(certificate as X509Certificate)
            }

            KeyChain.choosePrivateKeyAlias(
                currentActivity,
                KeyChainAliasCallback { chosenAlias ->
                    if (chosenAlias != null) {
                        try {
                            KeyChain.setKeyPair(
                                currentActivity,
                                chosenAlias,
                                privateKey,
                                certificates.toTypedArray()
                            )
                            promise.resolve("Certificate installed successfully")
                        } catch (e: Exception) {
                            Log.e("KeyChainModule", "Failed to set key pair", e)
                            promise.reject("Failed to set key pair", e)
                        }
                    } else {
                        promise.reject("User canceled", "User canceled the certificate installation")
                    }
                },
                null,
                null,
                null,
                -1,
                null
            )

        } catch (e: Exception) {
            Log.e("KeyChainModule", "Failed to install certificate", e)
            promise.reject("Failed to install certificate", e)
        }
    }
}

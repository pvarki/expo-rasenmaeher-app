package com.yourapp;

import android.content.Context;
import android.security.KeyChain;
import android.security.KeyChainAliasCallback;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;

public class KeyChainModule extends ReactContextBaseJavaModule {

    private static final String TAG = "KeyChainModule";
    private static ReactApplicationContext reactContext;

    KeyChainModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "KeyChainModule";
    }

    @ReactMethod
    public void installCertificate(String p12, String name, Promise promise) {
        try {
            byte[] p12Bytes = Base64.decode(p12, Base64.DEFAULT);
            KeyStore keyStore = KeyStore.getInstance("PKCS12");
            keyStore.load(new java.io.ByteArrayInputStream(p12Bytes), "".toCharArray());

            String alias = keyStore.aliases().nextElement();
            KeyStore.PrivateKeyEntry entry = (KeyStore.PrivateKeyEntry) keyStore.getEntry(alias, null);

            PrivateKey privateKey = entry.getPrivateKey();
            Certificate[] certChain = entry.getCertificateChain();
            List<X509Certificate> certificates = new ArrayList<>();
            for (Certificate certificate : certChain) {
                certificates.add((X509Certificate) certificate);
            }

            KeyChain.choosePrivateKeyAlias(
                getCurrentActivity(),
                new KeyChainAliasCallback() {
                    @Override
                    public void alias(String chosenAlias) {
                        if (chosenAlias != null) {
                            try {
                                KeyChain.setKeyPair(getCurrentActivity(), chosenAlias, privateKey, certificates.toArray(new X509Certificate[certificates.size()]));
                                promise.resolve("Certificate installed successfully");
                            } catch (Exception e) {
                                Log.e(TAG, "Failed to set key pair", e);
                                promise.reject("Failed to set key pair", e);
                            }
                        } else {
                            promise.reject("User canceled", "User canceled the certificate installation");
                        }
                    }
                },
                null,
                null,
                null,
                -1,
                null
            );

        } catch (Exception e) {
            Log.e(TAG, "Failed to install certificate", e);
            promise.reject("Failed to install certificate", e);
        }
    }
}

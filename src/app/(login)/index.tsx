import React, { useState } from "react";
import { View, TextInput, StyleSheet, Platform, Image, TouchableOpacity, Text, Alert } from "react-native";
import { useAuth } from "../../hooks/auth/useAuth";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { Link, useRouter } from "expo-router";
import ParallaxScrollView from "../../components/ParallaxScrollView";
import { generateCA, generateCSR, signCSR, installCertificate } from "../../hooks/mtls/uglyPoc"; // Update the import path if needed
import { NativeModules } from 'react-native';
import forge from 'node-forge';

const { KeyChainModule } = NativeModules;

export default function LoginView() {
  const { addBackend } = useAuth();
  const router = useRouter();
  const [fqdn, setFqdn] = useState("");

  const handleLogin = () => {
    const token = "token"; // Replace with actual token retrieval logic

    addBackend(fqdn, "jwt", token)
      .then(() => {
        router.replace("/");
      })
      .catch((error) => {
        console.error("Failed to add backend", error);
        // Handle error state here
      });
  };

  const handleInstallCert = async () => {
    try {
      const ca = generateCA();
      const { privateKey, csrPem } = generateCSR('MyClient');
      const signedCertPem = signCSR(csrPem, ca.caCert, ca.caPrivateKey);
      await installCertificate(signedCertPem, forge.pki.privateKeyToPem(privateKey));
      Alert.alert("Success", "Certificate installed successfully!");
    } catch (error) {
      console.error("Failed to install certificate", error);
      Alert.alert("Error", "Failed to install certificate");
    }
  };

  const handleTestCertAccess = async () => {
    try {
      const alias = 'MyClientCert';

      KeyChainModule.getCertificateChain(alias)
        .then(certChain => {
          if (certChain) {
            console.log('Certificate Chain:', certChain);
            Alert.alert("Success", "Certificate access successful!");
          } else {
            Alert.alert("Error", "Failed to access certificate chain");
          }
        })
        .catch(error => {
          console.error("Failed to access certificate chain", error);
          Alert.alert("Error", "Failed to access certificate chain");
        });

      KeyChainModule.getPrivateKey(alias)
        .then(privateKey => {
          if (privateKey) {
            console.log('Private Key:', privateKey);
            Alert.alert("Success", "Private key access successful!");
          } else {
            Alert.alert("Error", "Failed to access private key");
          }
        })
        .catch(error => {
          console.error("Failed to access private key", error);
          Alert.alert("Error", "Failed to access private key");
        });
    } catch (error) {
      console.error("Failed to access certificate", error);
      Alert.alert("Error", "Failed to access certificate");
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#2b2e31" }}
      headerImage={
        <Image
          source={require("../../assets/mainlogo_nob.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Login</ThemedText>
        </ThemedView>
        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter FQDN"
            placeholderTextColor="#CCC"
            value={fqdn}
            onChangeText={setFqdn}
          />
          <ThemedText onPress={handleLogin} style={styles.loginButton}>
            Login
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleInstallCert} style={styles.actionButton}>
            <Text style={styles.buttonText}>Install Certificate</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleTestCertAccess} style={styles.actionButton}>
            <Text style={styles.buttonText}>Test Certificate Access</Text>
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={styles.instructionsContainer}>
          <ThemedText type="subtitle">Instructions</ThemedText>
          <ThemedText>Try harder!</ThemedText>
        </ThemedView>
        <ThemedView style={styles.instructionsContainer}>
          <Link href="/modal">Present modal</Link>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    bottom: 0,
    height: 190,
    left: 0,
    position: "absolute",
    width: 250,
  },
  container: {
    padding: 16,
  },
  titleContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  inputContainer: {
    gap: 8,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    width: "100%",
    color: "#FFF",
  },
  loginButton: {
    textAlign: "center",
    padding: 10,
    backgroundColor: "#007BFF",
    color: "#FFF",
    borderRadius: 4,
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonText: {
    color: "#FFF",
  },
  instructionsContainer: {
    gap: 8,
    marginBottom: 8,
  },
});

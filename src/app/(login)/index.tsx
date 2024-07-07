import React from "react";
import { View } from "react-native";
import { useAuth } from "../../hooks/auth/useAuth";
import { ThemedText } from "../../components/ThemedText";
import { useRouter } from "expo-router";

export default function LoginView() {
  const { addBackend } = useAuth();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ThemedText
        onPress={() => {
          addBackend("defaultBackend", "jwt", "token")
            .then(() => {
              router.replace("/");
            })
            .catch((error) => {
              console.error("Failed to add backend", error);
              // Handle error state here
            });
        }}
      >
        Kirjaudu sisään
      </ThemedText>
    </View>
  );
}

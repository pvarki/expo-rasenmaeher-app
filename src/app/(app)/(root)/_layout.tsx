import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ThemedText } from "../../../components/ThemedText";
import { useSession } from '../../../hooks/auth/authContext';
import "react-native-reanimated";

import { useColorScheme } from "../../../hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, isLoading } = useSession();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (isLoading) {
    return <ThemedText>Loading...</ThemedText>;
  }

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen
        name="modal"
        options={{
          // Set the presentation mode to modal for our modal route.
          presentation: 'modal',
        }}
      />
      </Stack>
    </ThemeProvider>
  );
}

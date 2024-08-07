import { Slot } from "expo-router";
import { AuthProvider } from "../hooks/auth/authContext";

export default function Root() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}

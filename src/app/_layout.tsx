import { Slot } from "expo-router";
import { SessionProvider } from "../hooks/auth/authContext";

export default function Root() {
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}

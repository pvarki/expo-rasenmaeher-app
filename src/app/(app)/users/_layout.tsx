import { Slot } from "expo-router";
import { ProtectedRoute } from "../../../hooks/auth/protectedRoute";

export default function UsersLayout() {
  return (
    <ProtectedRoute backendName="defaultBackend" requireAuthType="mtls" requireValidUser={true} allowedUserTypes={["user"]}>
      <Slot />
    </ProtectedRoute>
  );
}

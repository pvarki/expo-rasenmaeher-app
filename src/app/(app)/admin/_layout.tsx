import { Slot } from "expo-router";
import { ProtectedRoute } from "../../../hooks/auth/protectedRoute";

export default function AdminLayout() {
  return (
    <ProtectedRoute backendName="defaultBackend" requireAuthType="mtls" requireValidUser={true} allowedUserTypes={["admin"]}>
      <Slot />
    </ProtectedRoute>
  );
}

import React from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../auth/useAuth";
import { ActivityIndicator } from "react-native";

interface Props {
  children: React.ReactNode;
  backendName: string;
  allowedUserTypes?: Array<"admin" | "user" | null>;
  requireAuthType?: "jwt" | "mtls" | null;
  requireValidUser?: boolean;
  requireOtpVerified?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({
  children,
  backendName,
  allowedUserTypes = ["admin", "user", null],
  requireAuthType,
  requireValidUser = false,
  requireOtpVerified = false,
}) => {
  const { backends } = useAuth();
  const backend = backends[backendName];
  const router = useRouter();

  if (!backend) {
    return <ActivityIndicator />;
  }

  const { userType, isLoading, authType, isValidUser, callsign, otpVerified } =
    backend;

  if (isLoading) {
    return <ActivityIndicator />;
  }

  const determineTargetPath = () => {
    if (requireAuthType && authType !== requireAuthType) {
      return "/login";
    }
    if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
      return "/login";
    }
    if (requireOtpVerified && !otpVerified) {
      return "/login";
    }
    if (requireValidUser && !isValidUser) {
      return callsign ? "/login/callsign" : "/login/enrollment";
    }
    return null;
  };

  const targetPath = determineTargetPath();

  if (targetPath) {
    router.replace(targetPath);
    return null;
  }

  return <>{children}</>;
};

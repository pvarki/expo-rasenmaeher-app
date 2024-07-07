import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import * as SecureStore from "expo-secure-store";

interface AuthResponse {
  type: "mtls" | "jwt";
  userid: string;
  payload: {
    CN: string;
  };
}

interface ValidUserResponse {
  isValidUser: boolean;
  userid: string;
}

interface AdminResponse {
  isAdmin: boolean;
}

interface BackendState {
  userType: "admin" | "user" | null;
  isLoading: boolean;
  error: string | null;
  authType: "mtls" | "jwt" | null;
  otpVerified: boolean;
  callsign: string | null;
  isValidUser: boolean;
}

interface AuthContextProps {
  backends: Record<string, BackendState>;
  addBackend: (
    fqdn: string,
    authType: "mtls" | "jwt",
    token: string,
  ) => Promise<void>;
  removeBackend: (fqdn: string) => void;
  updateBackendState: (fqdn: string, state: Partial<BackendState>) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  backends: {},
  addBackend: async () => {},
  removeBackend: () => {},
  updateBackendState: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [backends, setBackends] = useState<Record<string, BackendState>>({});

  const addBackend = async (
    fqdn: string,
    authType: "mtls" | "jwt",
    token: string,
  ) => {
    const initialBackendState: BackendState = {
      userType: null,
      isLoading: true,
      error: null,
      authType,
      otpVerified: false,
      callsign: null,
      isValidUser: false,
    };

    setBackends((prevBackends) => ({
      ...prevBackends,
      [fqdn]: initialBackendState,
    }));

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const authResponse = await fetch(
        `https://${fqdn}/api/v1/check-auth/${authType}`,
        { headers },
      );

      if (authResponse.status === 403) {
        setBackends((prevBackends) => ({
          ...prevBackends,
          [fqdn]: {
            ...initialBackendState,
            isLoading: false,
            error: "Forbidden",
          },
        }));
      } else if (authResponse.ok) {
        const authData = (await authResponse.json()) as AuthResponse;
        setBackends((prevBackends) => ({
          ...prevBackends,
          [fqdn]: {
            ...prevBackends[fqdn],
            authType: authData.type,
            isLoading: false,
          },
        }));

        if (authData.type) {
          const validUserResponse = await fetch(
            `https://${fqdn}/api/v1/check-auth/validuser`,
            { headers },
          );

          if (validUserResponse.ok) {
            const validUserData =
              (await validUserResponse.json()) as ValidUserResponse;
            setBackends((prevBackends) => ({
              ...prevBackends,
              [fqdn]: {
                ...prevBackends[fqdn],
                isValidUser: true,
                callsign: validUserData.userid,
                userType: "user",
                isLoading: false,
              },
            }));

            const adminResponse = await fetch(
              `https://${fqdn}/api/v1/check-auth/validuser/admin`,
              { headers },
            );

            if (adminResponse.ok) {
              const adminData = (await adminResponse.json()) as AdminResponse;
              setBackends((prevBackends) => ({
                ...prevBackends,
                [fqdn]: { ...prevBackends[fqdn], userType: "admin" },
              }));
            } else if (adminResponse.status === 403) {
              setBackends((prevBackends) => ({
                ...prevBackends,
                [fqdn]: { ...prevBackends[fqdn], userType: "user" },
              }));
            }
          }
        }
      } else {
        throw new Error(
          `API response was not ok. Status code: ${authResponse.status}`,
        );
      }
    } catch (err: unknown) {
      setBackends((prevBackends) => ({
        ...prevBackends,
        [fqdn]: {
          ...prevBackends[fqdn],
          error: err instanceof Error ? err.message : String(err),
          isLoading: false,
        },
      }));
    }
  };

  const removeBackend = (fqdn: string) => {
    setBackends((prevBackends) => {
      const { [fqdn]: _, ...rest } = prevBackends;
      return rest;
    });
  };

  const updateBackendState = (fqdn: string, state: Partial<BackendState>) => {
    setBackends((prevBackends) => ({
      ...prevBackends,
      [fqdn]: { ...prevBackends[fqdn], ...state },
    }));
  };

  const value = useMemo(
    () => ({ backends, addBackend, removeBackend, updateBackendState }),
    [backends],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

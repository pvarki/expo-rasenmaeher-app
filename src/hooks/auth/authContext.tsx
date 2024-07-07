import React, { useEffect } from 'react';
import { useStorageState } from './useStorageState';
import * as SecureStore from 'expo-secure-store';
import { authenticateWithMTLS } from '../mtls/authenticateWithMtls';

const AuthContext = React.createContext<{
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');

  const signIn = async () => {
    try {
      const sessionData = await authenticateWithMTLS();
      setSession(sessionData);
    } catch (error) {
      console.error('Failed to sign in', error);
    }
  };

  const signOut = () => {
    setSession(null);
    SecureStore.deleteItemAsync('session');
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}

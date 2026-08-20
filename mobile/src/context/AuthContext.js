import React, { createContext, useContext, useEffect, useState } from 'react';
import { Api, setToken, getToken } from '../api/client';
import { getBiometricCredentials, authenticateBiometric, getBiometricSupport } from '../utils/permissions';

const AuthCtx = createContext(null);
export const AuthContext = AuthCtx;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await getToken();
        if (t) {
          const { user } = await Api.me();
          setUser(user);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const { token, user } = await Api.login(email, password);
    await setToken(token);
    setUser(user);
    return user;
  };

  const loginWithBiometrics = async () => {
    const support = await getBiometricSupport();
    if (!support || support === 'Enroll needed') throw new Error(support === 'Enroll needed' ? 'Biometric not enrolled. Please set up fingerprint/face in device settings.' : 'Biometric not available on this device.');
    const ok = await authenticateBiometric('Login to Pulse HR');
    if (!ok) throw new Error('Biometric authentication failed or cancelled.');
    const creds = await getBiometricCredentials();
    if (!creds) throw new Error('No saved biometric credentials. Please login with password once and enable biometrics.');
    return login(creds.email, creds.password);
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, loginWithBiometrics, logout, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

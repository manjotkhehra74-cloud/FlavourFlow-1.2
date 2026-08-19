import React, { createContext, useContext, useEffect, useState } from 'react';
import { Api, setToken, getToken } from '../api/client';

const AuthCtx = createContext(null);

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

  const logout = async () => {
    await setToken(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);

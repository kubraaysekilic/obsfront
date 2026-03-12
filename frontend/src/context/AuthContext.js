import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('obs_token'));
  const [loading, setLoading] = useState(true);

  // Token değişince axios header'ını güncelle
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const saved = localStorage.getItem('obs_user');
      if (saved) setUser(JSON.parse(saved));
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, [token]);

  const login = (tokenStr, userData) => {
    localStorage.setItem('obs_token', tokenStr);
    localStorage.setItem('obs_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenStr}`;
    setToken(tokenStr);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('obs_token');
    localStorage.removeItem('obs_user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string, surname: string, email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem('authUser');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Błąd odczytu sesji", e);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    try {
      const res = await axios.post('/api/auth/login', data);
      const token = res.data.token;
      if (!token) throw new Error("Brak tokena!");

      localStorage.setItem('token', token);
      const userData = {
        email: res.data.email,
        token: token,
        id: res.data.id
      };

      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: { name: string, surname: string, email: string; password: string }) => {

    try {
      await axios.post('/api/auth/register', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error("Błąd rejestracji:", error);
      throw error;
    } finally {
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('token');
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
      <AuthContext.Provider value={{ user, setUser, login, register, logout, isLoading }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
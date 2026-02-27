'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Usuario {
  id: string;
  usuario: string;
  nombre: string;
  rol: string;
  activo: boolean;
  permVentas: boolean;
  permInventario: boolean;
  permClientes: boolean;
  permProveedores: boolean;
  permCompras: boolean;
  permReportes: boolean;
  permGastos: boolean;
  permConfig: boolean;
  permUsuarios: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (usuario: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  registrar: (datos: { nombre: string; usuario: string; password: string; rol: string; codigo: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('pos_usuario');
    if (savedUser) {
      try {
        setUsuario(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('pos_usuario');
      }
    }
    setLoading(false);
  }, []);

  const login = async (user: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/pos/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: user, password })
      });

      const data = await res.json();

      if (data.success && data.usuario) {
        setUsuario(data.usuario);
        localStorage.setItem('pos_usuario', JSON.stringify(data.usuario));
        return { success: true };
      }

      return { success: false, error: data.error || 'Credenciales inválidas' };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const registrar = async (datos: { nombre: string; usuario: string; password: string; rol: string; codigo: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/pos/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      const data = await res.json();

      if (data.success) {
        return { success: true };
      }

      return { success: false, error: data.error || 'Error al registrar' };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('pos_usuario');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, registrar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

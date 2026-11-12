import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

// Guarda quem está logado e qual o papel (Admin ou Paciente)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app, pergunta ao servidor se a sessão ainda é válida
  useEffect(() => {
    api('/auth/me')
      .then((dados) => setUser(dados.usuario))
      .catch(() => setUser(null))
      .finally(() => setCarregando(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const dados = await api('/auth/login', { method: 'POST', body: { email, password } });
    setUser(dados.usuario);
    return dados.usuario;
  }, []);

  const register = useCallback(async (dadosCadastro) => {
    await api('/auth/register', { method: 'POST', body: dadosCadastro });
  }, []);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, carregando, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

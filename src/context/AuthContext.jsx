import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const role = localStorage.getItem('role');
      const name = localStorage.getItem('userName');
      setUser({ role, name: name || 'User', token });
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('userName', userData.name || 'User');
    setUser({ ...userData, token });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAuth, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

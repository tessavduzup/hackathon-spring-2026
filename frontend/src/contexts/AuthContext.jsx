import { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, logoutUser } from '../api/post_request';
import { fetchUser } from '../api/get_request';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) {
      fetch(token)
    } else {
      setIsAuthenticated(false)
    }
  }, [])

  const fetch = async () => {
    try {
      const response = fetchUser()
      console.log(response)
      setUser(response.data.user);
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      setIsAuthenticated(false)
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password)
      localStorage.setItem('access', response.data.access)
      localStorage.setItem('refresh', response.data.refresh)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setUser(response.data.user)
      setIsAuthenticated(true)
      return {success: true}
    }
    catch (error) {
      setIsAuthenticated(false)
      return {success: false, error: error.message}
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('refresh')
    try {
      const response = await logoutUser(token)
      if (response.success) {
        toast.success('Сеанс успешно завершён!');
      } else {
        throw new Error('Ошибка при выходе')
      }
    } catch (error) {
        toast.error('Непредвиденная ошибка при выходе!');
    } finally {
      localStorage.clear()
      setIsAuthenticated(false)
      setUser(null);
    }
    
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};
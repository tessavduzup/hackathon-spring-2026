import { createContext, useState, useContext, useEffect } from 'react';
import { loginUser } from '../api/post_request';
import { logoutUser } from '../api/refresh_request'; 
import { fetchUser } from '../api/get_request';
import toast from 'react-hot-toast';
import { deleteKey } from '../api/delete_request';

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
      if (response.data?.success) {
        setUser(response.data.user);
        setIsAuthenticated(true)
      } else {
        throw new Error('Пользователь не найден')
      }
    } catch (error) {
      console.log('Ошибка авторизации:', error.message);
      setIsAuthenticated(false)
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password)
      if (response.data.success) {
        setUser(response.data.user)
        setIsAuthenticated(true)
        return {success: true}
      } else {
        throw new Error('Непредвиденная ошибка')
      }
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
      if (response.data.success) {
        if (localStorage.getItem('activeKey')) {
          try {
            const response = deleteKey(user.id)
            if (response.data.success) {
              console.log('Ключ успешно удалён');
            } else {
              throw new Error('Ошибка при удалении ключа')
            }
          } catch {
            console.error('Ошибка при удалении ключа');
            throw new Error('Ошибка при удалении ключа')
          }
        }
        toast.success('Сеанс успешно завершён');
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
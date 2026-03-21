import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/Validators';
import { ERROR_MESSAGE_TIME } from '../utils/DefaultValues';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSend, setIsSend] = useState(false)
  const navigate = useNavigate();
  const {login, isAuthenticated} = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateLoginForm() || isSend) {
      return
    }

    setErrors({});

    try {
      setIsSend(true)
      const response = await login(email, password)
      console.log(response)
      if (response.success) {
        toast.success('Добро пожаловать!');
        navigate('/dashboard');
      } else {
        throw new Error('Ошибка авторизации')
      }
    }
    catch {
      setErrors({error: 'Неверная почта или пароль'});
      toast.error('Ошибка авторизации', {duration: ERROR_MESSAGE_TIME});
    } finally {
      setTimeout(() => {
        setIsSend(false)  
      }, ERROR_MESSAGE_TIME)
    }
  };

  useEffect(() => {
    const timer = setTimeout(() =>{
      setErrors({error: null})
    }, ERROR_MESSAGE_TIME)
    return () => clearTimeout(timer)
  }, [errors.error])

  const validateLoginForm = () => {
    return validateEmail(email).success && validatePassword(password).success
  }

  return (
    <div className="auth-container">
      <h2>🔐 Вход в систему</h2>
      {errors.error && <div className="error-message">{errors.error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          {email && errors.error_email && <div className="error-message">{errors.error_email}</div>}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => {
              const check = validateEmail(email);
              if (!check.success) {
                setErrors(prev => ({ ...prev, error_email: check.error }));
              }
            }}
            onFocus={() => {
              setErrors(prev => ({ ...prev, error_email: null}));
            }}
            required
            placeholder="ivan@company.com"
          />
        </div>
        <div className="form-group">
          <label>Пароль</label>
          {password && errors.error_password && <div className="error-message">{errors.error_password}</div>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => {
              const check = validatePassword(password);
              if (!check.success) {
                setErrors(prev => ({ ...prev, error_password: check.error }));
              }
            }}
            onFocus={() => {
              setErrors(prev => ({ ...prev, error_password: null }));
            }}
            required
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="auth-button" disabled={isSend}>
          Войти
        </button>
      </form>
    </div>
  );
}

export default Login;
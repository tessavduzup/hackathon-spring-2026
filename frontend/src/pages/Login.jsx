import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/Validators';
import './../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSend, setIsSend] = useState(false)
  const navigate = useNavigate();
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateLoginForm()) {
      return
    }

    setErrors({});

    try {
      setIsSend(true)
      const response = await login(email, password)
      if (response.success) {
        toast.success('Добро пожаловать!');
        navigate('/dashboard');
      } else {
        throw new Error('Ошибка авторизации')
      }
    }
    catch {
      setErrors({ error: 'Неверная почта или пароль' });
      toast.error('Ошибка авторизации', { duration: 2000 });
    } finally {
      setIsSend(false)
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors({ error: null })
    }, 2000)
    return () => clearTimeout(timer)
  }, [errors.error])

  const validateLoginForm = () => {
    return validateEmail(email) && validatePassword(password)
  }

  return (
    <div className="auth-page">
      {/* Декоративные элементы */}
      <div className="auth-ellipse-1"></div>
      <div className="auth-ellipse-2"></div>
      <div className="auth-top-bar"></div>
      <div className="auth-bottom-bar"></div>

      {/* Логотип и доп. текст */}
      <div className="auth-logo">
        <img src="src/assets/logo.png" alt="RGB_RT_logo" />
      </div>
      <div className="auth-gen">By Gen lambda</div>

      {/* Основной заголовок */}
      <div className="auth-title">
        <img src="src/assets/point.png" />
      </div>

      {/* Форма авторизации */}
      <div className="auth-container">
        <h2>Вход в систему</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
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
                setErrors(prev => ({ ...prev, error_email: null }));
              }}
              required
              placeholder="Email"
              className={errors.error_email ? 'error' : ''}
            />
            {errors.error_email && <div className="error-message">{errors.error_email}</div>}
          </div>
          <div className="form-group">
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
              placeholder="Пароль"
              className={errors.error_email ? 'error' : ''}
            />
            {errors.error_password && <div className="error-message">{errors.error_password}</div>}
          </div>
          <button type="submit" className="auth-button" disabled={isSend}>
            Войти
          </button>
        </form>
        {errors.error && <div className="error-message">{errors.error}</div>}
      </div>
      {/* Футер */}
      <div className="auth-copyright">© 2026 “Точка входа”</div>
      <div className="auth-support">Служба поддержки<br />8 800 555 35 35</div>
    </div>
  );
}

export default Login;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/Validators';
import './../styles/Login.css';
import AuthLayout from './AuthLayout';

/**
 * Login - компонент страницы авторизации пользователя
 * Предоставляет форму входа с валидацией email и пароля
 * При успешной авторизации перенаправляет на дашборд
 */
function Login() {
  // Состояния полей формы
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Состояние ошибок валидации и серверных ошибок
  const [errors, setErrors] = useState({});
  // Флаг блокировки кнопки отправки во время запроса
  const [isSend, setIsSend] = useState(false)
  
  const navigate = useNavigate();
  const { login } = useAuth() // Функция авторизации из контекста аутентификации

  /**
   * Обрабатывает отправку формы авторизации
   * Выполняет валидацию, отправляет запрос на сервер и обрабатывает ответ
   * @param {Event} e - событие отправки формы
   */
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

  /**
   * Эффект для автоматического скрытия сообщения об ошибке через 2 секунды
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors({ error: null })
    }, 2000)
    return () => clearTimeout(timer)
  }, [errors.error])

  /**
   * Проверяет корректность полей email и пароля
   * @returns {boolean} true если оба поля валидны, иначе false
   */
  const validateLoginForm = () => {
    return validateEmail(email).success && validatePassword(password).success
  }

  return (
    <AuthLayout>
      <div className="auth-page">

        {/* Основной заголовок с логотипом */}
        <div className="auth-title">
          <img src="src/assets/point.png" alt="ТОЧКА ВХОДА" />
        </div>
        <div className="access-tagline">
          — Доступ в одно касание
        </div>
        {/* Форма авторизации */}
        <div className="auth-container">
          <h2 className="heading-h1">Вход в систему</h2>
          <form onSubmit={handleSubmit} noValidate>
            {/* Поле ввода email */}
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  const check = validateEmail(email);
                  if (!check.success) {
                    setErrors(prev => ({ ...prev, error_email: check.error }));
                  } else {
                    setErrors(prev => ({ ...prev, error_email: null }));
                  }
                }}
                onFocus={() => {
                  setErrors(prev => ({ ...prev, error_email: null }));
                }}
                placeholder="Email"
                className={`body-m ${errors.error_email ? 'error' : ''}`}
              />
              {errors.error_email && <div className="error-message description-s">{errors.error_email}</div>}
            </div>
            {/* Поле ввода пароля */}
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => {
                  const check = validatePassword(password);
                  if (!check.success) {
                    setErrors(prev => ({ ...prev, error_password: check.error }));
                  } else {
                    setErrors(prev => ({ ...prev, error_password: null }));
                  }
                }}
                onFocus={() => {
                  setErrors(prev => ({ ...prev, error_password: null }));
                }}
                placeholder="Пароль"
                className={`body-m ${errors.error_password ? 'error' : ''}`}
              />
              {errors.error_password && <div className="error-message description-s">{errors.error_password}</div>}
            </div>
            <button type="submit" className="orange-button body-m-strong" disabled={isSend}>
              {isSend ? 'Вход...' : 'Войти'}
            </button>
          </form>
          {/* Отображение общей ошибки авторизации */}
          {errors.error && <div className="error-message description-s">{errors.error}</div>}
        </div>
      </div>
    </AuthLayout>
  );
}

export default Login;
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { validateEmail, validateFIO, validatePassword } from '../utils/Validators';
import { ERROR_MESSAGE_TIME } from '../utils/DefaultValues';
import { registerUser } from '../api/post_request';
import '../styles/Registration.css'
import AuthLayout from './AuthLayout';

/**
 * Register - компонент страницы регистрации нового пользователя
 * Позволяет создать учетную запись с указанием ФИО, email, пароля и роли (пользователь/администратор)
 */
function Register() {
  // Состояния полей формы
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('')
  const [middle_name, setMiddle_name] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false)

  // Состояния для ошибок валидации и блокировки отправки
  const [errors, setErrors] = useState({});
  const [isSend, setIsSend] = useState(false)

  /**
   * Проверяет корректность всех полей формы
   * @returns {boolean} true если форма валидна, иначе false
   */
  const validateRegisterForm = () => {
    return validateEmail(email).success && validatePassword(password).success && validateFIO(name).success && validateFIO(surname).success && validateFIO(middle_name).success && validatePassword(confirmPassword).success && password === confirmPassword
  }

  /**
   * Сбрасывает все поля формы к начальному состоянию
   */
  const resetInput = () => {
    setName('')
    setSurname('')
    setMiddle_name('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Обрабатывает отправку формы регистрации
   * Выполняет валидацию, отправляет данные на сервер и обрабатывает ответ
   * @param {Event} e - событие отправки формы
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateRegisterForm() || isSend) {
      return
    }

    setErrors({});
    const newUser = {
      name: name,
      surname: surname,
      middle_name: middle_name,
      email: email,
      password: password,
      role_id: isAdmin ? 1 : 2
    };

    try {
      setIsSend(true)
      const response = await registerUser(newUser)
      if (response.data.success) {
        resetInput()
        toast.success('Пользователь успешно добавлен!');
      } else {
        throw new Error('Ошибка регистрации')
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, error: `Ошибка: ${error.message}` }))
      toast.error('Ошибка регистрации пользователя', { duration: ERROR_MESSAGE_TIME })
    } finally {
      setTimeout(() => {
        setIsSend(false)
      }, ERROR_MESSAGE_TIME)
    }
  };

  /**
   * Эффект для автоматического скрытия сообщения об ошибке через заданное время
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors(prev => ({ ...prev, error: null }))
    }, ERROR_MESSAGE_TIME);
    return () => clearTimeout(timer)
  }, [errors.error])

  return (
    <AuthLayout>
      <div className="register-page">
        {/* Хедер с кнопкой выхода */}
        <div className="register-header">
          <Link to='/dashboard'>
            <button className='exit-btn body-m'>Выход</button>
          </Link>
        </div>
        
        {/* Основной контент */}
        <div className="register-content">
          <div className="register-container">
            <h2 className="heading-h1">Регистрация пользователя</h2>
            {errors.error && <div className="error-message description-s">{errors.error}</div>}
            <form onSubmit={handleSubmit}>
              {/* Поле ввода фамилии */}
              <div className="register-form-group">
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  onBlur={() => {
                    const check = validateFIO(surname);
                    if (!check.success) {
                      setErrors(prev => ({ ...prev, error_surname: check.error }));
                    }
                  }}
                  onFocus={() => {
                    setErrors(prev => ({ ...prev, error_surname: null }));
                  }}
                  required
                  placeholder="*Фамилия"
                  className="body-m"
                />
                {surname && errors.error_surname && <div className="error-message description-s">{errors.error_surname}</div>}
              </div>
              {/* Поле ввода имени */}
              <div className="register-form-group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => {
                    const check = validateFIO(name);
                    if (!check.success) {
                      setErrors(prev => ({ ...prev, error_name: check.error }));
                    }
                  }}
                  onFocus={() => {
                    setErrors(prev => ({ ...prev, error_name: null }));
                  }}
                  required
                  placeholder="*Имя"
                  className="body-m"
                />
                {name && errors.error_name && <div className="error-message description-s">{errors.error_name}</div>}
              </div>
              {/* Поле ввода отчества */}
              <div className="register-form-group">
                <input
                  type="text"
                  value={middle_name}
                  onChange={(e) => setMiddle_name(e.target.value)}
                  onBlur={() => {
                    const check = validateFIO(middle_name);
                    if (!check.success) {
                      setErrors(prev => ({ ...prev, error_middle_name: check.error }));
                    }
                  }}
                  onFocus={() => {
                    setErrors(prev => ({ ...prev, error_middle_name: null }));
                  }}
                  required
                  placeholder="Отчество"
                  className="body-m"
                />
                {middle_name && errors.error_middle_name && <div className="error-message description-s">{errors.error_middle_name}</div>}
              </div>
              {/* Поле ввода email */}
              <div className="register-form-group">
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
                  placeholder="*Email"
                  className="body-m"
                />
                {email && errors.error_email && <div className="error-message description-s">{errors.error_email}</div>}
              </div>
              {/* Поле ввода пароля */}
              <div className="register-form-group">
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
                  placeholder="*Пароль"
                  className="body-m"
                />
                {password && errors.error_password && <div className="error-message description-s">{errors.error_password}</div>}
              </div>
              {/* Поле подтверждения пароля */}
              <div className="register-form-group">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => {
                    const check = validatePassword(confirmPassword);
                    if (!check.success) {
                      setErrors(prev => ({ ...prev, error_confirm_password: check.error }));
                    } else if (password !== confirmPassword) {
                      setErrors(prev => ({ ...prev, error_confirm_password: "Пароли не совпадают!" }));
                    }
                  }}
                  onFocus={() => {
                    setErrors(prev => ({ ...prev, error_confirm_password: null }));
                  }}
                  required
                  placeholder="*Подтвердите пароль"
                  className="body-m"
                />
                {confirmPassword && errors.error_confirm_password && <div className="error-message description-s">{errors.error_confirm_password}</div>}
              </div>
              {/* Чекбокс выбора роли администратора */}
              <div className="register-form-group">
                <label className="body-m">
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  /> Администратор
                </label>
              </div>
              <button type="submit" className="orange-button body-m-strong" disabled={isSend}>
                Зарегистрировать
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Register;
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { validateEmail, validateFIO, validatePassword } from '../utils/Validators';
import { ERROR_MESSAGE_TIME } from '../utils/DefaultValues';
import { registerUser } from '../api/post_request';
import '../styles/Registration.css'

function Register() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('')
  const [middle_name, setMiddle_name] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false)

  const [errors, setErrors] = useState({});
  const [isSend, setIsSend] = useState(false)
  
  const validateRegisterForm = () => {
    return validateEmail(email).success && validatePassword(password).success && validateFIO(name).success && validateFIO(surname).success && validateFIO(middle_name).success && validatePassword(confirmPassword).success && password === confirmPassword
  }

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
      role_id: role_id
    };

    try {
      setIsSend(true)
      const response = await registerUser(newUser)
      if (response.success) {
        toast.success('Пользователь успешно добавлен!');
      } else {
        throw new Error('Ошибка регистрации')
      }
    } catch (error) {
      setErrors(prev => ({...prev, error: `Ошибка: ${error.message}`}))
      toast.error('Ошибка регистрации пользователя', {duration: ERROR_MESSAGE_TIME})
    } finally {
      setTimeout(() => {
        setIsSend(false)
      }, ERROR_MESSAGE_TIME)
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors(prev => ({...prev, error: null}))
    }, ERROR_MESSAGE_TIME);
    return () => clearTimeout(timer)
  }, [errors.error])

  return (
    <div className="auth-container">
      <div className='back-btn-div'>
        <Link to='/dashboard'><button className='exit-btn'>Выход</button></Link>
      </div>
      <h2>📝 Регистрация</h2>
      {errors.error && <div className="error-message">{errors.error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Фамилия</label>
          {surname && errors.error_surname && <div className="error-message">{errors.error_surname}</div>}
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
              setErrors(prev => ({ ...prev, error_surname: null}));
            }}
            required
            placeholder="Иванов"
          />
        </div>
        <div className="form-group">
          <label>Имя</label>
          {name && errors.error_name && <div className="error-message">{errors.error_name}</div>}
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
              setErrors(prev => ({ ...prev, error_name: null}));
            }}
            required
            placeholder="Иван"
          />
        </div>
        <div className="form-group">
          <label>Отчество</label>
          {middle_name && errors.error_middle_name && <div className="error-message">{errors.error_middle_name}</div>}
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
              setErrors(prev => ({ ...prev, error_middle_name: null}));
            }}
            required
            placeholder="Иванович"
          />
        </div>
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
        <div className="form-group">
          <label>Подтвердите пароль</label>
          {confirmPassword && errors.error_confirm_password && <div className="error-message">{errors.error_confirm_password}</div>}
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
            placeholder="••••••••"
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            /> Администратор
          </label>
        </div>
        <button type="submit" className="auth-button" disabled={isSend}>
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}

export default Register;
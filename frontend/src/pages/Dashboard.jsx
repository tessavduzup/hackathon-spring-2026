import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';
import { useAuth } from '../contexts/AuthContext';
import { getKey } from '../api/post_request';
import { ERROR_MESSAGE_TIME } from '../utils/DefaultValues';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { deleteKey } from '../api/delete_request';
import ProtectedContent from '../pages/ProtectedContent';

function Dashboard() {
  const [key, setKey] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isGenerate, setIsGenerate] = useState(false);
  const [timerColor, setTimerColor] = useState('#FFFFFF');
  const [expiryTime, setExpiryTime] = useState(null);
  const [error, setError] = useState(null); // Добавлен state для error

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const generateQRCode = async () => {
    if (isActive) {
      try {
        await deleteKey();
      } catch {
        console.error('Ошибка при удалении ключа');
      } finally {
        localStorage.removeItem('key_code');
        localStorage.removeItem('key_id');
        localStorage.removeItem('keyExpiry');
        setIsActive(false);
        setKey(null);
        setTimeLeft(null);
        setExpiryTime(null);
      }
    }

    try {
      setIsGenerate(true);
      const response = await getKey();
      console.log(response);
      if (response.data.success) {
        const key = response.data.key;
        setKey(key.key_code);
        const expiryTime = Date.now() + 5 * 60 * 1000;
        setIsActive(true);
        setExpiryTime(expiryTime);

        localStorage.setItem('key_code', key.key_code);
        localStorage.setItem('key_id', key.id);
        localStorage.setItem('keyExpiry', expiryTime);

        toast.success('QR-код сгенерирован! Активен 5 минут');
      } else {
        throw new Error('Ошибка при генерации ключа');
      }
    } catch (error) {
      toast.error('Ошибка при генерации ключа', { duration: ERROR_MESSAGE_TIME });
    } finally {
      setTimeout(() => {
        setIsGenerate(false);
      }, ERROR_MESSAGE_TIME);
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('key_code');
    const savedIdKey = localStorage.getItem('key_id');
    const savedExpiry = localStorage.getItem('keyExpiry');

    if (savedKey && savedExpiry && savedIdKey) {
      const now = Date.now();
      const expiry = parseInt(savedExpiry);
      if (now < expiry) {
        setKey(savedKey);
        setExpiryTime(expiry);
        setIsActive(true);
      } else {
        localStorage.removeItem('key_code');
        localStorage.removeItem('key_id');
        localStorage.removeItem('keyExpiry');
      }
    }
  }, []);

  // Отдельный useEffect для обновления таймера
  useEffect(() => {
    if (!isActive || !key) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        // Время истекло
        setIsActive(false);
        setKey(null);
        setTimeLeft(null);
        toast.error('Время действия ключа истекло');
        const deleteKeyAsync = async () => {
          try {
            await deleteKey();
          } catch {
            console.error('Ошибка при удалении ключа');
          } finally {
            localStorage.removeItem('key_code');
            localStorage.removeItem('key_id');
            localStorage.removeItem('keyExpiry');
          }
        };
        deleteKeyAsync();
      } else {
        // Обновляем таймер
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);

        // Меняем цвет таймера при остатке меньше 1 минуты
        if (remaining <= 60000) {
          setTimerColor('#FF4F12');
        } else {
          setTimerColor('#9C27B0');
        }
      }
    };

    // Обновляем таймер сразу
    updateTimer();

    // Устанавливаем интервал
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isActive, expiryTime, key]);

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
    toast.success('Приступайте к регистрации!');
  };

  const headerButtons = (
    <>
      <button onClick={handleLogoutClick} className="link-button body-m">
        Выйти
      </button>
    </>
  );

  return (
    <ProtectedContent>
      <AuthLayout
        user={user?.full_name}
        email={user?.email}
        headerButtons={headerButtons}
      >
        <div className="dashboard-page">
          <div className="dashboard-header">
            <div className="dashboard-user-info">
              <h2 className="heading-h2">Добро пожаловать{user ? `, ${user.full_name}` : ''}!</h2>
              {user && <p className="dashboard-user-email description-l">{user.email}</p>}
              <p className={user?.role === 1 ? "dashboard-user-role-admin description-l-strong" : "dashboard-user-role-staff description-l-strong"}>
                {user?.role === 1 ? (
                  <>
                    Администратор
                  </>
                ) : (
                  <>
                    Сотрудник
                  </>
                )}
              </p>
              <div className="dashboard-header-buttons">
                {user?.role === 1 && (
                  <button onClick={handleRegisterClick} className="dashboard-btn body-m-strong">
                    Регистрация нового пользователя
                  </button>
                )}
              </div>
            </div>
          </div>
          {error && <div className="dashboard-error-message description-m">{error}</div>}
          <div className="dashboard-qr-container">
            <div className={`dashboard-qr-wrapper ${isActive ? 'active' : ''}`}>
              {!isActive ? (
                <div className="dashboard-qr-placeholder">
                  <h1 className="heading-h1">Генерация пропуска</h1>
                  <p className="dashboard-info-text body-m">
                    ⓘ После нажатия на кнопку вам будет предоставлен уникальный одноразовый пропуск в виде QR-кода. Приложите его на входе к сканеру чтобы пройти.
                  </p>
                  <p className="dashboard-info-text body-m" style={{ color: '#FF4F12' }}>
                    ⚠︎ Пропуск действует 5 минут. По истечении срока действия пропуска необходимо выпустить новый
                  </p>
                  <button
                    onClick={generateQRCode}
                    className="orange-button body-m-strong"
                    disabled={isGenerate}
                  >
                    {isGenerate ? 'Генерация...' : 'Сгенерировать QR-код'}
                  </button>
                </div>
              ) : (
                <div className="dashboard-qr-active">
                  <div className="dashboard-qr-code">
                    <QRCodeSVG
                      value={key}
                      size={280}
                      bgColor="#ffffff"
                      fgColor="#9C27B0"
                      level="H"
                      includeMargin={true}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxWidth: '280px',
                        borderRadius: '16px',
                      }}
                    />
                  </div>
                  <div className="dashboard-qr-info">
                    {timeLeft && (
                      <div
                        className="dashboard-timer"
                        style={{
                          backgroundColor: timerColor === '#FF4F12' ? 'rgba(255, 79, 18, 0.15)' : 'rgba(156, 39, 176, 0.1)',
                          border: `2px solid ${timerColor}`,
                          padding: '12px 24px',
                          borderRadius: '12px',
                          textAlign: 'center',
                          marginBottom: '20px',
                          minWidth: '200px'
                        }}
                      >
                        <span className="body-m" style={{ marginRight: '8px' }}>Осталось времени:</span>
                        <strong style={{ color: timerColor, fontSize: '1.3rem', fontWeight: 'bold' }}>
                          {timeLeft}
                        </strong>
                      </div>
                    )}
                    <button
                      onClick={generateQRCode}
                      className="orange-button body-m-strong"
                      disabled={isGenerate}
                      style={{
                        minWidth: '220px',
                        padding: '12px 28px',
                        fontSize: '1rem'
                      }}
                    >
                      {isGenerate ? 'Генерация...' : 'Сгенерировать новый QR-код'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AuthLayout>
    </ProtectedContent>
  );
}

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';
import { useAuth } from '../contexts/AuthContext';
import { getKey } from '../api/get_request';
import { ERROR_MESSAGE_TIME } from '../utils/DefaultValues';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [key, setKey] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isGenerate, setIsGenerate] = useState(false)
  const [error, setError] = useState('')

  const {user, logout} = useAuth()
  const navigate = useNavigate()

  const generateQRCode = async () => {
    if (isActive) {
      localStorage.removeItem('activeKey');
      localStorage.removeItem('keyExpiry');
      setIsActive(false)
    }

    try {
      setIsGenerate(true)
      const response = await getKey()
      if (response.success) {
        setKey(response.data.key)
        const expiryTime = Date.now() + 5 * 60 * 1000;
        setIsActive(true);
        
        localStorage.setItem('activeKey', key);
        localStorage.setItem('keyExpiry', expiryTime);
        
        toast.success('QR-код сгенерирован! Активен 5 минут');
      } 
      else {
        throw new Error('Ошибка при генерации ключа')
      }
    } catch (error) {
      toast.error('Ошибка при генерации ключа', {duration: ERROR_MESSAGE_TIME})
    } finally {
      setTimeout(() => {
        setIsGenerate(false)
      }, ERROR_MESSAGE_TIME)
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('activeKey');
    const savedExpiry = localStorage.getItem('keyExpiry');
    
    if (savedKey && savedExpiry) {
      const now = Date.now();
      if (now < parseInt(savedExpiry)) {
        setKey(savedKey);
        setIsActive(true);
      } else {
        localStorage.removeItem('activeKey');
        localStorage.removeItem('keyExpiry');
      }
    }
  }, []);

  useEffect(() => {
    if (!isActive || !key) return;

    const interval = setInterval(() => {
      const expiry = localStorage.getItem('keyExpiry');
      if (!expiry) {
        setIsActive(false);
        setKey(null);
        setTimeLeft(null);
        clearInterval(interval);
        return;
      }

      const now = Date.now();
      const remaining = parseInt(expiry) - now;
      
      if (remaining <= 0) {
        setIsActive(false);
        setKey(null);
        setTimeLeft(null);
        localStorage.removeItem('activeKey');
        localStorage.removeItem('keyExpiry');
        toast.error('Время действия ключа истекло');
        clearInterval(interval);
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, key]);

  const handleLogoutClick = () => {
    logout();    
    navigate('/login')
  };
  const handleRegisterClick = () => {
    navigate('/register')
    toast.success('Приступайте к регистрации!');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h2>👋 Добро пожаловать{user ? `, ${user.full_name}` : ''}!</h2>
          {user && <p className="user-email">{user.email}</p>}
          {user && <p className={user.role === 1 ? "user-role-admin" : '"user-role-staff"'}>{user.role === 1 ? "Администратор" : "Сотрудник"}</p>}

        </div>
        <button onClick={handleLogoutClick} className="logout-btn">
          Выйти
        </button>
        <button onClick={handleRegisterClick} className="logout-btn">
          Регистрация
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      <div className="qr-container">
        {!isActive ? (
          <div className="qr-placeholder">
            <button onClick={generateQRCode} className="generate-btn" disabled={isGenerate}>
              🔘 Сгенерировать QR-код
            </button>
            <p className="info-text">
              После генерации QR-код будет активен 5 минут
            </p>
          </div>
        ) : (
          <div className="qr-active">
            <div className="qr-code">
              <QRCodeSVG 
                value={key} 
                size={250}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="qr-info">
              <div className="timer">
                ⏱️ Осталось времени: <strong>{timeLeft}</strong>
              </div>
              <button 
                onClick={generateQRCode} 
                className="get-new-btn"
                disabled={isGenerate}
              >
                🔄 Сгенерировать новый
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="info-panel">
        <h3>📌 Информация</h3>
        <ul>
          <li>✅ QR-код активен 5 минут</li>
          <li>✅ При сканировании передается уникальный ключ</li>
          <li>✅ После сканирования ключ удаляется и нужно сгенерировать новый</li>
          <li>✅ Также после истечения времени нужно сгенерировать новый код</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
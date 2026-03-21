import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [qrKey, setQrKey] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);

  // Генерация случайного ключа
  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  // Генерация QR-кода
  const generateQRCode = () => {
    const newKey = generateKey();
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 минут
    
    setQrKey(newKey);
    setIsActive(true);
    
    // Сохраняем в localStorage
    localStorage.setItem('activeKey', newKey);
    localStorage.setItem('keyExpiry', expiryTime);
    
    toast.success('QR-код сгенерирован! Активен 5 минут');
  };

  // Проверка активности ключа
  useEffect(() => {
    const savedKey = localStorage.getItem('activeKey');
    const savedExpiry = localStorage.getItem('keyExpiry');
    
    if (savedKey && savedExpiry) {
      const now = Date.now();
      if (now < parseInt(savedExpiry)) {
        setQrKey(savedKey);
        setIsActive(true);
      } else {
        // Ключ истек
        localStorage.removeItem('activeKey');
        localStorage.removeItem('keyExpiry');
      }
    }
  }, []);

  // Таймер обратного отсчета
  useEffect(() => {
    if (!isActive || !qrKey) return;

    const interval = setInterval(() => {
      const expiry = localStorage.getItem('keyExpiry');
      if (!expiry) {
        setIsActive(false);
        setQrKey(null);
        setTimeLeft(null);
        clearInterval(interval);
        return;
      }

      const now = Date.now();
      const remaining = parseInt(expiry) - now;
      
      if (remaining <= 0) {
        // Время истекло
        setIsActive(false);
        setQrKey(null);
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
  }, [isActive, qrKey]);

  const handleLogoutClick = () => {
    onLogout();
    toast.success('Выход выполнен');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h2>👋 Добро пожаловать, {user.name}!</h2>
          <p className="user-email">{user.email}</p>
        </div>
        <button onClick={handleLogoutClick} className="logout-btn">
          Выйти
        </button>
      </div>

      <div className="qr-container">
        {!isActive ? (
          <div className="qr-placeholder">
            <button onClick={generateQRCode} className="generate-btn">
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
                value={qrKey} 
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
              <div className="key-value">
                <span className="key-label">Ключ:</span>
                <code>{qrKey}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(qrKey);
                    toast.success('Ключ скопирован!');
                  }}
                  className="copy-btn"
                >
                  📋
                </button>
              </div>
              <button 
                onClick={generateQRCode} 
                className="generate-new-btn"
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
          <li>✅ Ключ можно скопировать вручную</li>
          <li>✅ После истечения времени нужно сгенерировать новый код</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
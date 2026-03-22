import React from 'react';
import './../styles/AuthLayout.css';

/**
 * AuthLayout - компонент обертка для страниц аутентификации
 * @param {Object} props - свойства компонента
 * @param {React.ReactNode} props.children - дочерние элементы (основной контент страницы)
 * @param {string} props.user - имя пользователя (зарезервировано, пока не используется)
 * @param {string} props.email - email пользователя (зарезервировано, пока не используется)
 * @param {React.ReactNode} props.headerButtons - кнопки для отображения в правой части хедера
 */
const AuthLayout = ({ children, headerButtons }) => {
    return (
        <div className="auth-page">
            {/* Декоративные элементы */}
            <div className="auth-ellipse-1"></div>
            <div className="auth-ellipse-2"></div>
            <div className="auth-top-bar"></div>
            <div className="auth-bottom-bar"></div>

            {/* Логотип */}
            <div className="auth-logo">
                <img src="src/assets/logo.png" alt="RGB_RT_logo" />
            </div>

            {/* Хэдер с дополнительными кнопками */}
            <div className="auth-header">
                {headerButtons && (
                    <div className="dashboard-btn body-m-strong">
                        {headerButtons}
                    </div>
                )}
            </div>

            {/* Основной контент */}
            <div className="auth-content">
                {children}
            </div>

            {/* Футер */}
            <div className="auth-copyright">© 2026 “Точка входа”</div>
            <div className="auth-gen">By Gen lambda</div>
            <div className="auth-support">
                Служба поддержки<br />8 800 555 35 35
            </div>
        </div>
    );
};

export default AuthLayout;
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * ProtectedContent - компонент-обертка для защиты контента от скриншотов и копирования
 * Предотвращает создание скриншотов через PrintScreen, Win+Shift+S и другие методы
 * Очищает буфер обмена и блокирует контекстное меню
 * 
 * @param {Object} props - свойства компонента
 * @param {React.ReactNode} props.children - дочерние элементы, которые нужно защитить
 */
const ProtectedContent = ({ children }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /**
     * Очищает буфер обмена (текст и изображения)
     * @async
     */
    const clearClipboard = async () => {
      try {
        // Очищаем текстовый буфер
        await navigator.clipboard.writeText('');
        
        // Пытаемся очистить буфер изображений
        // Создаем пустой объект для буфера
        const permission = await navigator.permissions.query({ name: 'clipboard-write' });
        if (permission.state === 'granted') {
          await navigator.clipboard.write([]);
        }
      } catch (err) {
        // Ошибка доступа к буферу - игнорируем
      }
    };

    /**
     * Блокирует клавишу PrintScreen
     * @param {KeyboardEvent} e - событие клавиатуры
     */
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        toast.error('Скриншоты запрещены');
        clearClipboard();
        return false;
      }
    };

    // Флаг для отслеживания попытки создания скриншота
    let screenAttempt = false;
    
    /**
     * Обработчик потери фокуса окна (срабатывает при использовании инструментов скриншота)
     */
    const handleBlur = () => {
      screenAttempt = true;
      // Даем время на создание скриншота, потом очищаем
      setTimeout(async () => {
        if (screenAttempt) {
          await clearClipboard();
          toast.error('Скриншоты запрещены');
          screenAttempt = false;
        }
      }, 200);
    };
    
    /**
     * Обработчик возврата фокуса окну
     */
    const handleFocus = () => {
      if (screenAttempt) {
        setTimeout(async () => {
          await clearClipboard();
          screenAttempt = false;
        }, 100);
      }
    };

    /**
     * Обработчик изменения видимости страницы (вкладка переключена)
     */
    const handleVisibilityChange = () => {
      if (document.hidden) {
        screenAttempt = true;
        setTimeout(async () => {
          if (screenAttempt) {
            await clearClipboard();
            screenAttempt = false;
          }
        }, 200);
      } else {
        if (screenAttempt) {
          setTimeout(async () => {
            await clearClipboard();
            screenAttempt = false;
          }, 100);
        }
      }
    };

    /**
     * Блокирует комбинацию Win + Shift + S (инструмент "Ножницы" в Windows)
     * @param {KeyboardEvent} e - событие клавиатуры
     */
    const checkWinShiftS = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Скриншоты запрещены');
        clearClipboard();
        return false;
      }
    };

    /**
     * Постоянная очистка буфера обмена (каждые 500 мс)
     * Проверяет, не появилось ли что-то в буфере, и очищает при обнаружении
     */
    const interval = setInterval(async () => {
      try {
        const items = await navigator.clipboard.read();
        if (items.length > 0) {
          // Если в буфере что-то есть, очищаем
          await clearClipboard();
        }
      } catch (err) {
        // Нет доступа к буферу - игнорируем
      }
    }, 500);

    // CSS защита: запрет выделения текста
    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';
    
    /**
     * Блокирует контекстное меню (правую кнопку мыши)
     * @param {MouseEvent} e - событие мыши
     */
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Добавляем обработчики событий
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', checkWinShiftS);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    container.addEventListener('contextmenu', handleContextMenu);

    // Очистка обработчиков при размонтировании компонента
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', checkWinShiftS);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      container.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(interval);
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
};

export default ProtectedContent;
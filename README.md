# Система контроля доступа "Точка Входа" (Frontend)

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![React Router](https://img.shields.io/badge/React_Router-6.14.0-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)

**Клиентская часть** корпоративной системы генерации и валидации одноразовых пропусков.
Обеспечивает аутентификацию сотрудников, генерацию QR-кодов с временными метками и строгую защиту контента от несанкционированного копирования.

---

## Оглавление
- [Ключевые возможности](#-ключевые-возможности)
- [Стек технологий](#-стек-технологий)
- [Начало работы](#-начало-работы)
---

## Ключевые возможности

- **Аутентификация** с разделением ролей (`Администратор` / `Сотрудник`)
- **Генерация QR-кодов** с временем жизни (TTL = 5 минут)
- **Динамический таймер** с цветовой индикацией (менее 60 сек — красный)
- **Анти-скриншот защита**:
  - Блокировка клавиш `PrintScreen`/очистка буфера обмена на десктопе
  - Запрет копирования, контекстного меню и выделения текста
  - Отключение сохранения страницы (`Ctrl+S`, `Ctrl+P`)
- **Административная панель**: регистрация новых пользователей с выбором роли
- **Адаптивный дизайн** для всех типов устройств

---

## Стек технологий
### Frontend

| Технология       | Назначение                              |
|------------------|------------------------------------------|
| React 18         | Библиотека для построения UI             |
| React Router v6  | Маршрутизация и навигация               |
| Context API      | Глобальное состояние (auth)             |
| qrcode.react     | Генерация QR-кодов                       |
| react-hot-toast  | Уведомления и тосты                      |
| CSS Modules      | Стилизация компонентов                   |
| Axios (через API) | HTTP-запросы к бэкенду                  |


### Backend
| Технология            | Назначение                                                |
|-----------------------|-----------------------------------------------------------|
| Django 6              | Структура приложения, ORM для работы с БД, аутентификация |
| Django REST Framework | Создание RESTful API                                      |
| PostgreSQL            | База данных                                               |
| qrcode                | Генерация QR-кодов                                        |
---

## 🚀 Начало работы
### Требования
- Node.js 18+
- npm 9+
- Python 3.12+
- Django 6
- Django REST framework

### Установка Frontend

1. Клонируйте репозиторий и перейдите в папку с ним

c GitHub
```bash
  git clone https://github.com/tessavduzup/hackathon-spring-2026
```

```bash
  cd hackathon-spring-2026
```

или c SourceCraft

```bash
  git clone https://sourcecraft.dev/yulichump/hackathon2026
```

```bash
  cd hackathon2026
```

2. Установите зависимости

```bash
  npm install
```

3. Запустите проект в режиме разработки

```bash
  npm run dev
```

4. Сборка для production
```bash
  npm run build
```

### Установка Backend

1. Клонируйте репозиторий

```bash
  git clone https://github.com/tessavduzup/hackathon-spring-2026.git
```
```bash
  cd hackathon-spring-2026
```

2. Создайте виртуальное окружение

Для Linux/macOS
```bash
  python3 -m venv venv
```
```bash
  source venv/bin/activate
```
Для Windows
```bash
  python -m venv venv
```
```bash
  venv\Scripts\activate
```
3. Установка зависимостей
```bash
  pip install -r requirements.txt
```
4. Создайте и примените миграции
```bash
  python manage.py makemigrations
```
```bash
  python manage.py migrate
```
5. Запустите
```bash
  python manage.py runserver
```

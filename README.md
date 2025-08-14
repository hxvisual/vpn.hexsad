# VPN Keys Manager

Система управления VPN ключами с веб-интерфейсом.

## Функциональность

- 🔐 Аутентификация и авторизация пользователей
- 👥 Управление пользователями (создание, редактирование, удаление)
- 🔑 Управление VPN ключами (VLESS, Shadowsocks)
- 📊 Мониторинг статуса VPN серверов
- 📱 QR-коды для быстрого подключения
- 💾 Экспорт базы данных

## Технологии

**Frontend:**
- React 19 с TypeScript
- Redux Toolkit для управления состоянием
- Tailwind CSS для стилизации
- React Router для навигации

**Backend:**
- Node.js с Express (локально)
- Vercel Functions (продакшен)
- Vercel KV для хранения данных (опционально)

## Установка и запуск локально

1. Клонируйте репозиторий:
```bash
git clone <your-repo-url>
cd vpn-keys-manager
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите локально:
```bash
# Запуск сервера и клиента одновременно
npm run dev

# Или отдельно:
npm run server  # Запуск сервера на порту 3001
npm start       # Запуск клиента на порту 3000
```

4. Откройте http://localhost:3000

**Данные для входа:**
- Логин: `admin`
- Пароль: `admin123`

## Деплой на Vercel

### Автоматический деплой через GitHub

1. Форкните или загрузите проект на GitHub

2. Зайдите на [Vercel](https://vercel.com) и войдите в аккаунт

3. Нажмите "New Project" и импортируйте репозиторий из GitHub

4. Vercel автоматически определит настройки из `vercel.json`

5. (Опционально) Настройте переменные окружения для Vercel KV:
   - `KV_REST_API_URL` - URL вашего KV хранилища
   - `KV_REST_API_TOKEN` - токен доступа к KV

6. Нажмите "Deploy"

### Деплой через Vercel CLI

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Войдите в аккаунт:
```bash
vercel login
```

3. Запустите деплой:
```bash
vercel
```

4. Следуйте инструкциям в терминале

### Настройка Vercel KV (опционально)

Для постоянного хранения данных:

1. В панели Vercel перейдите в Storage → Create Database
2. Выберите KV Storage
3. Создайте базу данных
4. Скопируйте переменные окружения в настройки проекта

Без Vercel KV приложение будет использовать in-memory хранилище (данные сбрасываются при перезапуске).

## Структура проекта

```
├── api/               # Vercel Functions
│   └── index.js      # Основной API обработчик
├── src/              # Исходный код React приложения
│   ├── components/   # React компоненты
│   ├── pages/       # Страницы приложения
│   ├── services/    # API сервисы
│   ├── store/       # Redux store
│   └── types/       # TypeScript типы
├── public/          # Статические файлы
├── server.js        # Локальный сервер для разработки
├── db.json         # Локальная база данных
├── vercel.json     # Конфигурация Vercel
└── package.json    # Зависимости и скрипты
```

## API Endpoints

- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Получить текущего пользователя
- `POST /api/auth/logout` - Выход из системы
- `GET /api/users` - Список пользователей
- `POST /api/users` - Создать пользователя
- `PUT /api/users/:id` - Обновить пользователя
- `DELETE /api/users/:id` - Удалить пользователя
- `GET /api/vpn-server/status` - Статус VPN сервера
- `PUT /api/vpn-server/config` - Обновить конфигурацию сервера
- `GET /api/database/export` - Экспорт базы данных

## Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```env
# Для Vercel KV (опционально)
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token

# URL API (автоматически настраивается на Vercel)
REACT_APP_API_URL=http://localhost:3001/api
```

## Примечания по продакшену

- Измените дефолтные пароли перед деплоем
- Настройте HTTPS (автоматически на Vercel)
- Рассмотрите использование более надежной системы аутентификации
- Для реального мониторинга VPN серверов потребуется внешний сервис

## Лицензия

MIT

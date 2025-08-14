# 🚀 Руководство по деплою VPN Keys Manager

## 📋 Содержание
1. [Подготовка к деплою](#подготовка-к-деплою)
2. [Деплой на Vercel (Рекомендуется)](#деплой-на-vercel)
3. [Деплой на Netlify](#деплой-на-netlify)
4. [Деплой на Railway](#деплой-на-railway)
5. [Привязка своего домена](#привязка-своего-домена)
6. [Настройка переменных окружения](#настройка-переменных-окружения)

---

## 🔧 Подготовка к деплою

### 1. Подготовка файлов
Сначала создадим конфигурационные файлы для деплоя:

```bash
# В корне проекта создайте файл vercel.json
```

**Файл `vercel.json`:**
```json
{
  "version": 2,
  "functions": {
    "server.js": {
      "runtime": "nodejs18.x"
    }
  },
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/build/$1"
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server.js"
    }
  ]
}
```

### 2. Обновление package.json
Добавьте скрипт для продакшн билда:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "vercel-build": "npm run build"
  }
}
```

---

## 🌟 Деплой на Vercel (Рекомендуется)

### Почему Vercel?
- ✅ Бесплатный план с щедрыми лимитами
- ✅ Автоматический деплой из Git
- ✅ Поддержка Node.js и React из коробки
- ✅ Легкая привязка доменов
- ✅ SSL сертификаты автоматически

### Шаги деплоя:

#### 1. Создание Git репозитория
```bash
# Инициализация Git (если еще не сделано)
git init

# Добавление всех файлов
git add .

# Коммит изменений
git commit -m "Initial commit for deployment"

# Создание репозитория на GitHub и пуш кода
git remote add origin https://github.com/ВАШ_USERNAME/vpn-keys-manager.git
git branch -M main
git push -u origin main
```

#### 2. Деплой на Vercel
1. Перейдите на [vercel.com](https://vercel.com)
2. Зарегистрируйтесь/войдите через GitHub
3. Нажмите **"New Project"**
4. Выберите ваш репозиторий `vpn-keys-manager`
5. Настройки проекта:
   - **Framework Preset**: `Create React App`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

#### 3. Переменные окружения в Vercel
В настройках проекта добавьте:
- `REACT_APP_API_URL` = `https://ваш-домен.vercel.app`

#### 4. Деплой
Нажмите **"Deploy"** - приложение будет автоматически собрано и развернуто!

---

## 🎯 Деплой на Netlify

### Альтернативный вариант для фронтенда

#### 1. Подготовка для Netlify
Создайте файл `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/api/*"
  to = "https://ваш-backend-url.vercel.app/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Деплой
1. Перейдите на [netlify.com](https://netlify.com)
2. Зарегистрируйтесь через GitHub
3. Нажмите **"New site from Git"**
4. Выберите ваш репозиторий
5. Настройки:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

---

## 🚂 Деплой на Railway

### Для полного fullstack деплоя

#### 1. Подготовка
Создайте файл `Procfile`:
```
web: node server.js
```

Обновите `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "react-scripts build",
    "railway": "npm run build && npm start"
  }
}
```

#### 2. Деплой на Railway
1. Перейдите на [railway.app](https://railway.app)
2. Зарегистрируйтесь через GitHub
3. Нажмите **"New Project"**
4. Выберите **"Deploy from GitHub repo"**
5. Выберите ваш репозиторий

---

## 🌐 Привязка своего домена

### На Vercel:

#### 1. В панели Vercel
1. Откройте ваш проект
2. Перейдите в **Settings** → **Domains**
3. Добавьте ваш домен (например: `vpn.yourdomain.com`)

#### 2. Настройка DNS
В вашем DNS провайдере добавьте записи:

**Для поддомена (рекомендуется):**
```
CNAME vpn cname.vercel-dns.com
```

**Для основного домена:**
```
A @ 76.76.19.61
AAAA @ 2606:4700:3030::ac43:bb3d
```

#### 3. Проверка
Подождите 5-10 минут для распространения DNS, затем ваш сайт будет доступен по вашему домену с автоматическим SSL!

### На Netlify:

#### 1. В панели Netlify
1. Откройте ваш сайт
2. Перейдите в **Domain settings**
3. Нажмите **"Add custom domain"**
4. Введите ваш домен

#### 2. Настройка DNS
```
CNAME www ваш-сайт.netlify.app
```

---

## ⚙️ Настройка переменных окружения

### Важные переменные:

```bash
# Для продакшна
REACT_APP_API_URL=https://ваш-домен.com
NODE_ENV=production

# Для разработки (локально)
REACT_APP_API_URL=http://localhost:3001
```

### В Vercel:
1. **Settings** → **Environment Variables**
2. Добавьте переменные для всех сред (Production, Preview, Development)

### В Netlify:
1. **Site settings** → **Environment variables**
2. Добавьте необходимые переменные

---

## 🔐 Безопасность для продакшна

### 1. Обновите CORS в server.js
```javascript
// Замените на ваш домен
const cors = require('cors');
app.use(cors({
  origin: ['https://ваш-домен.com', 'https://www.ваш-домен.com'],
  credentials: true
}));
```

### 2. Защита API ключей
Никогда не коммитьте секретные ключи в Git! Используйте переменные окружения.

---

## 📊 Мониторинг и аналитика

### Добавьте в приложение:
- Google Analytics (опционально)
- Error tracking (Sentry)
- Uptime monitoring

---

## 🚀 Автоматизация

### GitHub Actions для автодеплоя
Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🎯 Рекомендуемая схема деплоя

### Для вашего VPN Keys Manager:

1. **Frontend + Backend на Vercel** (рекомендуется)
   - Домен: `vpn.yourdomain.com`
   - Все в одном проекте
   - Автоматический SSL
   - Быстрый CDN

2. **Альтернативно: Frontend на Netlify + Backend на Railway**
   - Frontend: `vpn.yourdomain.com` 
   - Backend API: `api.yourdomain.com`

---

## 🔧 Тестирование после деплоя

### Проверьте:
- ✅ Авторизация работает
- ✅ API эндпоинты отвечают
- ✅ Пинг серверов функционирует
- ✅ QR коды генерируются
- ✅ База данных сохраняется
- ✅ SSL сертификат активен

---

## 🆘 Troubleshooting

### Частые проблемы:

**1. "Module not found"**
```bash
npm install
npm run build
```

**2. "API не отвечает"**
- Проверьте переменную `REACT_APP_API_URL`
- Убедитесь что сервер запущен

**3. "CORS errors"**
- Обновите настройки CORS в server.js
- Добавьте ваш домен в разрешенные origins

**4. "Database не сохраняется"**
- На Vercel используйте внешнюю БД (MongoDB Atlas, PlanetScale)
- JSON файлы не персистентны на serverless платформах

---

## 💡 Дополнительные улучшения

### После деплоя рекомендуется:
1. Настроить внешнюю базу данных (MongoDB Atlas - бесплатно)
2. Добавить Redis для кеширования пингов
3. Настроить email уведомления
4. Добавить rate limiting для API
5. Настроить логирование (Winston + external service)

---

## 📞 Поддержка

Если возникнут вопросы при деплое:
- Проверьте логи в консоли хостинга
- Используйте браузерную консоль для отладки фронтенда
- Проверьте Network tab для API запросов

**Удачи с деплоем! 🚀**

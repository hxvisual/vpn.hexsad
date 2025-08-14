# 🚀 Быстрый деплой VPN Keys Manager

## ⚡ Самый простой способ (5 минут)

### 1. Подготовка Git репозитория
```bash
git init
git add .
git commit -m "Deploy VPN Keys Manager"
git branch -M main
git remote add origin https://github.com/ВАШ_USERNAME/vpn-keys-manager.git
git push -u origin main
```

### 2. Деплой на Vercel (рекомендуется)
1. Идите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите репозиторий `vpn-keys-manager`
5. Нажмите "Deploy"

**Готово!** ✅ Ваше приложение будет доступно по ссылке типа `https://vpn-keys-manager-xyz.vercel.app`

---

## 🌐 Привязка домена

### Если у вас есть свой домен:

1. **В Vercel:**
   - Settings → Domains
   - Добавьте ваш домен: `vpn.yourdomain.com`

2. **В вашем DNS провайдере:**
   ```
   CNAME vpn cname.vercel-dns.com
   ```

3. **Подождите 5-10 минут** - SSL будет настроен автоматически!

---

## ⚙️ Переменные окружения

В настройках Vercel добавьте:
- `REACT_APP_API_URL` = `https://ваш-домен.vercel.app`

---

## 🔧 Важное для продакшна

### 1. Обновите CORS в server.js:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://your-domain.com', 'https://www.your-domain.com'],
  credentials: true
}));
```

### 2. Переместите данные в внешнюю БД
На Vercel файлы не сохраняются между деплоями. Рекомендуется использовать:
- MongoDB Atlas (бесплатно)
- PlanetScale (MySQL, бесплатно)

---

## 🎯 Готовые альтернативы

### Railway (полный фуллстек):
1. [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Выберите репозиторий

### Netlify (только фронтенд):
1. [netlify.com](https://netlify.com)  
2. "New site from Git"
3. Выберите репозиторий

---

## ✅ Checklist после деплоя

- [ ] Сайт открывается
- [ ] Авторизация работает
- [ ] API отвечает
- [ ] Пинг серверов работает
- [ ] QR коды генерируются
- [ ] SSL активен (зеленый замок)

---

## 🆘 Проблемы?

**API не работает:** Проверьте `REACT_APP_API_URL` в переменных окружения

**CORS ошибки:** Добавьте ваш домен в CORS настройки server.js

**База не сохраняется:** Используйте внешнюю БД (MongoDB Atlas)

---

**Время деплоя: ~5 минут** ⏰
**Стоимость: Бесплатно** 💰

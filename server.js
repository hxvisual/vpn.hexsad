const jsonServer = require('json-server');
const ping = require('ping');
const geoip = require('geoip-lite');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Get location from IP address
function getLocationFromIP(ip) {
  try {
    // Проверяем, если это доменное имя
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (domainRegex.test(ip)) {
      // Для доменных имен возвращаем базовую информацию
      const knownDomains = {
        'google.com': 'США',
        'cloudflare.com': 'США',
        'github.com': 'США',
        '8.8.8.8': 'США',
        '1.1.1.1': 'США',
        '208.67.222.222': 'США'
      };
      
      const domain = ip.toLowerCase();
      if (knownDomains[domain]) {
        return knownDomains[domain];
      }
      
      return `Домен: ${ip}`;
    }
    
    // Ручная база для известных VPN серверов - только страна
    const knownVPNIPs = {
      '167.17.176.34': 'Германия',
      '167.17.176.33': 'Германия',
      '8.8.8.8': 'США',
      '8.8.4.4': 'США',
      '1.1.1.1': 'США',
      '1.0.0.1': 'США',
      '208.67.222.222': 'США',
      '208.67.220.220': 'США',
      '77.88.8.8': 'Россия',
      '77.88.8.1': 'Россия'
    };
    
    // Проверяем сначала ручную базу
    if (knownVPNIPs[ip]) {
      return knownVPNIPs[ip];
    }
    
    // Для IP адресов используем geoip-lite
    const geo = geoip.lookup(ip);
    if (geo) {
      const countryNames = {
        'US': 'США',
        'RU': 'Россия', 
        'NL': 'Нидерланды',
        'DE': 'Германия',
        'FR': 'Франция',
        'GB': 'Великобритания',
        'CN': 'Китай',
        'JP': 'Япония',
        'KR': 'Южная Корея',
        'SG': 'Сингапур',
        'CA': 'Канада',
        'AU': 'Австралия',
        'IT': 'Италия',
        'ES': 'Испания',
        'PL': 'Польша',
        'CH': 'Швейцария',
        'NO': 'Норвегия',
        'SE': 'Швеция',
        'FI': 'Финляндия',
        'BR': 'Бразилия',
        'IN': 'Индия',
        'UA': 'Украина',
        'TR': 'Турция',
        'AE': 'ОАЭ',
        'HK': 'Гонконг'
      };
      
      const country = countryNames[geo.country] || geo.country;
      
      // Возвращаем только страну, без города
      return country;
    }
    
    return 'Неизвестная локация';
  } catch (error) {
    console.error('Error getting location for IP:', ip, error);
    return 'Ошибка определения локации';
  }
}

// Helper functions for status display
function getStatusColor(status) {
  const colors = {
    'excellent': '#10B981', // зеленый
    'online': '#059669',    // темно-зеленый
    'slow': '#F59E0B',      // желтый
    'poor': '#EF4444',      // красный
    'offline': '#6B7280'    // серый
  };
  return colors[status] || colors.offline;
}

function getStatusIcon(status) {
  const icons = {
    'excellent': '🟢', // зеленый круг
    'online': '🟢',    // зеленый круг
    'slow': '🟡',      // желтый круг
    'poor': '🔴',      // красный круг
    'offline': '⚫'    // черный круг
  };
  return icons[status] || icons.offline;
}

function getPingColor(pingTime) {
  if (!pingTime) return '#6B7280'; // серый для недоступных
  if (pingTime < 50) return '#10B981';   // зеленый
  if (pingTime < 100) return '#059669';  // темно-зеленый
  if (pingTime < 200) return '#F59E0B';  // желтый
  return '#EF4444'; // красный
}

// Function to extract server IP from VPN keys
function extractServerIP(vpnKey) {
  try {
    if (!vpnKey || vpnKey.trim() === '') return null;
    
    // Extract IP from VLESS URL: vless://uuid@IP:port?params
    if (vpnKey.startsWith('vless://')) {
      const match = vpnKey.match(/vless:\/\/[^@]+@([^:]+):/);
      if (match && match[1]) {
        const ip = match[1];
        // Check if it's a valid IP or domain
        if (ip !== 'server' && ip !== 'localhost' && ip !== '127.0.0.1') {
          return ip;
        }
      }
    }
    
    // Extract IP from Shadowsocks URL: ss://base64@IP:port
    if (vpnKey.startsWith('ss://')) {
      const match = vpnKey.match(/ss:\/\/[^@]+@([^:]+):/);
      if (match && match[1]) {
        const ip = match[1];
        if (ip !== 'server' && ip !== 'localhost' && ip !== '127.0.0.1') {
          return ip;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting IP from VPN key:', error);
    return null;
  }
}

// Function to get all unique server IPs from user keys
function getAllServerIPs() {
  try {
    const users = router.db.get('users').value();
    const serverIPs = new Set();
    
    users.forEach(user => {
      if (user.status === 'active' && user.keys) {
        // Extract IP from VLESS key
        if (user.keys.vless) {
          const vlessIP = extractServerIP(user.keys.vless);
          if (vlessIP) serverIPs.add(vlessIP);
        }
        
        // Extract IP from Shadowsocks key
        if (user.keys.shadowsocks) {
          const ssIP = extractServerIP(user.keys.shadowsocks);
          if (ssIP) serverIPs.add(ssIP);
        }
      }
    });
    
    return Array.from(serverIPs);
  } catch (error) {
    console.error('Error getting server IPs:', error);
    return [];
  }
}

// Real ping function
async function pingServer(host) {
  try {
    const result = await ping.promise.probe(host, {
      timeout: 10,
      min_reply: 1
    });
    
    return {
      alive: result.alive,
      time: result.alive ? Math.round(result.time) : null,
      error: result.alive ? null : 'Host unreachable'
    };
  } catch (error) {
    return {
      alive: false,
      time: null,
      error: error.message
    };
  }
}

// Function to ping all servers and get the best one
async function pingAllServers() {
  const serverIPs = getAllServerIPs();
  if (serverIPs.length === 0) {
    return {
      bestServer: null,
      allResults: []
    };
  }
  
  console.log('Pinging servers:', serverIPs);
  
  // Ping all servers in parallel
  const pingPromises = serverIPs.map(async (ip) => {
    const result = await pingServer(ip);
    return {
      ip: ip,
      location: getLocationFromIP(ip),
      ...result
    };
  });
  
  const results = await Promise.all(pingPromises);
  
  // Find the best server (lowest ping among alive servers)
  const aliveServers = results.filter(r => r.alive);
  let bestServer = null;
  
  if (aliveServers.length > 0) {
    bestServer = aliveServers.reduce((best, current) => {
      return (!best || current.time < best.time) ? current : best;
    });
  } else {
    // If no servers are alive, return the first one with error status
    bestServer = results[0];
  }
  
  return {
    bestServer: bestServer,
    allResults: results
  };
}

// VPN Server Status and Management endpoints
server.get('/api/vpn-server/status', async (req, res) => {
  try {
    // Пингуем все активные серверы из VPN ключей пользователей
    const { bestServer, allResults } = await pingAllServers();
    
    if (!bestServer) {
      return res.status(500).json({ error: 'Нет активных VPN серверов для проверки' });
    }
    
    console.log('All ping results:', allResults);
    console.log('Best server:', bestServer);
    
    // Определяем детальный статус на основе лучшего сервера
    let status = 'offline';
    let statusText = 'Сервер недоступен';
    let connectionQuality = 'poor';
    
    if (bestServer.alive) {
      if (bestServer.time < 50) {
        status = 'excellent';
        statusText = 'Отличное соединение';
        connectionQuality = 'excellent';
      } else if (bestServer.time < 100) {
        status = 'online';
        statusText = 'Хорошее соединение';
        connectionQuality = 'good';
      } else if (bestServer.time < 200) {
        status = 'slow';
        statusText = 'Медленное соединение';
        connectionQuality = 'fair';
      } else {
        status = 'poor';
        statusText = 'Плохое соединение';
        connectionQuality = 'poor';
      }
    }
    
    // Форматируем время последней проверки
    const now = new Date();
    const lastCheckFormatted = now.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Обновляем конфигурацию с данными лучшего сервера
    router.db.get('serverConfig')
      .assign({
        ip: bestServer.ip,
        location: bestServer.location,
        lastPing: bestServer.time || 0,
        lastCheck: now.toISOString(),
        status: status
      })
      .write();
    
    // Создаем детальный ответ со статусом лучшего сервера
    const serverInfo = {
      server: {
        ip: bestServer.ip,
        location: bestServer.location
      },
      connection: {
        status: status,
        statusText: statusText,
        quality: connectionQuality,
        ping: bestServer.alive ? `${bestServer.time} мс` : 'Нет ответа',
        pingRaw: bestServer.time || 0,
        isOnline: bestServer.alive,
        responseTime: bestServer.alive ? `${bestServer.time} мс` : null
      },
      diagnostics: {
        lastCheck: lastCheckFormatted,
        lastCheckISO: now.toISOString(),
        error: bestServer.error,
        allServers: allResults // Включаем информацию обо всех серверах для отладки
      },
      display: {
        statusColor: getStatusColor(status),
        statusIcon: getStatusIcon(status),
        pingColor: getPingColor(bestServer.time)
      }
    };
    
    res.json(serverInfo);
  } catch (error) {
    console.error('Error getting server status:', error);
    res.status(500).json({ error: 'Ошибка при получении статуса сервера' });
  }
});

// New endpoint to get status for a specific VPN key
server.get('/api/vpn-key/status/:keyType/:userId', async (req, res) => {
  try {
    const { keyType, userId } = req.params;
    
    // Validate key type
    if (!['vless', 'shadowsocks'].includes(keyType)) {
      return res.status(400).json({ error: 'Неверный тип ключа' });
    }
    
    // Find user
    const users = router.db.get('users').value();
    const user = users.find(u => u.id === userId);
    
    if (!user || user.status !== 'active') {
      return res.json({
        status: 'inactive',
        statusText: 'Пользователь неактивен',
        ping: null,
        isOnline: false,
        server: null
      });
    }
    
    // Get the VPN key
    const vpnKey = user.keys?.[keyType];
    if (!vpnKey || vpnKey.trim() === '') {
      return res.json({
        status: 'no-key',
        statusText: 'Ключ не настроен',
        ping: null,
        isOnline: false,
        server: null
      });
    }
    
    // Extract server IP from the key
    const serverIP = extractServerIP(vpnKey);
    if (!serverIP) {
      return res.json({
        status: 'invalid-key',
        statusText: 'Некорректный ключ',
        ping: null,
        isOnline: false,
        server: null
      });
    }
    
    // Ping the server
    const pingResult = await pingServer(serverIP);
    const location = getLocationFromIP(serverIP);
    
    let status = 'offline';
    let statusText = 'Сервер не активен';
    
    if (pingResult.alive) {
      if (pingResult.time < 50) {
        status = 'excellent';
        statusText = 'Отличное соединение';
      } else if (pingResult.time < 100) {
        status = 'good';
        statusText = 'Хорошее соединение';
      } else if (pingResult.time < 200) {
        status = 'fair';
        statusText = 'Медленное соединение';
      } else {
        status = 'poor';
        statusText = 'Плохое соединение';
      }
    }
    
    res.json({
      status: status,
      statusText: statusText,
      ping: pingResult.alive ? `${pingResult.time} мс` : null,
      pingRaw: pingResult.time || 0,
      isOnline: pingResult.alive,
      server: {
        ip: serverIP,
        location: location
      },
      error: pingResult.error
    });
    
  } catch (error) {
    console.error('Error getting key status:', error);
    res.status(500).json({ error: 'Ошибка при получении статуса ключа' });
  }
});

server.put('/api/vpn-server/config', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  
  const token = authHeader.split(' ')[1];
  const userId = token.replace('mock-jwt-token-', '');
  
  const users = router.db.get('users').value();
  const requestingUser = users.find(u => u.id === userId);
  
  if (!requestingUser || requestingUser.role !== 'admin') {
    return res.status(403).json({ error: 'Недостаточно прав доступа' });
  }
  
  const { ip, location } = req.body;
  
  if (!ip) {
    return res.status(400).json({ error: 'IP адрес обязателен' });
  }
  
  try {
    const trimmedIP = ip.trim();
    let finalLocation = location.trim();
    
    // Автоматически определяем локацию по IP, если не указана или пустая
    if (!finalLocation || finalLocation === '') {
      finalLocation = getLocationFromIP(trimmedIP);
    }
    
    // Обновляем конфигурацию в базе данных
    router.db.get('serverConfig')
      .assign({
        ip: trimmedIP,
        location: finalLocation,
        status: 'unknown', // Сбрасываем статус при смене IP
        lastPing: 0
      })
      .write();
    
    // Проверяем новый сервер
    const pingResult = await pingServer(trimmedIP);
    
    res.json({ 
      message: 'Конфигурация VPN сервера обновлена',
      server: { ip: trimmedIP, location: finalLocation },
      autoDetectedLocation: finalLocation !== location.trim(), // Указываем, была ли локация определена автоматически
      pingTest: {
        success: pingResult.alive,
        ping: pingResult.time,
        error: pingResult.error
      }
    });
  } catch (error) {
    console.error('Error updating server config:', error);
    res.status(500).json({ error: 'Ошибка при обновлении конфигурации' });
  }
});

// Database export endpoint - should be defined before the main router
server.get('/api/database/export', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  
  const token = authHeader.split(' ')[1];
  const userId = token.replace('mock-jwt-token-', '');
  
  const users = router.db.get('users').value();
  const requestingUser = users.find(u => u.id === userId);
  
  // Проверяем, что пользователь существует и является администратором
  if (!requestingUser || requestingUser.role !== 'admin') {
    return res.status(403).json({ error: 'Недостаточно прав доступа' });
  }
  
  try {
    // Получаем всю базу данных
    const dbData = router.db.getState();
    
    // Включаем все данные включая пароли в экспорт
    const exportData = {
      ...dbData
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="vpn-database-${new Date().toISOString().split('T')[0]}.json"`);
    
    res.send(jsonString);
  } catch (error) {
    console.error('Error exporting database:', error);
    res.status(500).json({ error: 'Ошибка при экспорте базы данных' });
  }
});

// Mock authentication endpoint
server.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const users = router.db.get('users').value();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + user.id
    });
  } else {
    res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
  }
});

// Mock current user endpoint
server.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  
  const token = authHeader.split(' ')[1];
  const userId = token.replace('mock-jwt-token-', '');
  
  const users = router.db.get('users').value();
  const user = users.find(u => u.id === userId);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ error: 'Не авторизован' });
  }
});

// Mock logout endpoint
server.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Users endpoints
server.get('/api/users', (req, res) => {
  let users = router.db.get('users').value();
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const search = req.query.search;
  
  // Apply search filter
  if (search) {
    users = users.filter(user => 
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  const paginatedUsers = users.slice(start, end).map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  
  res.json({
    users: paginatedUsers,
    pagination: {
      page,
      pageSize,
      total: users.length,
      totalPages: Math.ceil(users.length / pageSize)
    }
  });
});

// Create user endpoint
server.post('/api/users', (req, res) => {
  const users = router.db.get('users');
  const { username, password, role, status = 'active', vlessKey, shadowsocksKey } = req.body;
  
  // Check if user already exists
  if (users.find({ username }).value()) {
    return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
  }
  
  const newUser = {
    id: Date.now().toString(),
    username,
    password,
    role,
    status,
    createdAt: new Date().toISOString(),
    keys: {
      vless: vlessKey || '',
      shadowsocks: shadowsocksKey || ''
    }
  };
  
  users.push(newUser).write();
  
  const { password: _, ...userWithoutPassword } = newUser;
  res.json(userWithoutPassword);
});

// Update user endpoint
server.put('/api/users/:id', (req, res) => {
  const users = router.db.get('users');
  const { id } = req.params;
  const { username, password, role, status, vlessKey, shadowsocksKey } = req.body;
  
  const user = users.find({ id }).value();
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  const updates = {
    ...(username && { username }),
    ...(password && { password }),
    ...(role && { role }),
    ...(status && { status }),
    updatedAt: new Date().toISOString()
  };
  
  if (vlessKey !== undefined || shadowsocksKey !== undefined) {
    updates.keys = {
      vless: vlessKey !== undefined ? vlessKey : user.keys?.vless || '',
      shadowsocks: shadowsocksKey !== undefined ? shadowsocksKey : user.keys?.shadowsocks || ''
    };
  }
  
  users.find({ id }).assign(updates).write();
  
  const updatedUser = users.find({ id }).value();
  const { password: _, ...userWithoutPassword } = updatedUser;
  res.json(userWithoutPassword);
});

// Delete user endpoint
server.delete('/api/users/:id', (req, res) => {
  const users = router.db.get('users');
  const { id } = req.params;
  
  const user = users.find({ id }).value();
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  
  users.remove({ id }).write();
  res.json({ message: 'User deleted successfully' });
});

// Use default router for other endpoints
server.use('/api', router);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
});

const { createClient } = require('@vercel/kv');

// Initialize KV store - this will be configured through environment variables
let kv;
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

// Mock database for local development
const mockDb = {
  users: [
    {
      id: "1",
      username: "admin",
      password: "admin123",
      role: "admin",
      status: "active",
      createdAt: "2024-01-01T00:00:00.000Z",
      keys: {
        vless: "",
        shadowsocks: ""
      }
    }
  ],
  serverConfig: {
    ip: "8.8.8.8",
    location: "USA",
    status: "unknown",
    lastPing: 0,
    lastCheck: null
  }
};

// Helper function to get data from KV or mock
async function getData(key) {
  if (kv) {
    try {
      const data = await kv.get(key);
      return data || mockDb[key];
    } catch (error) {
      console.error(`Error getting ${key} from KV:`, error);
      return mockDb[key];
    }
  }
  return mockDb[key];
}

// Helper function to set data in KV or mock
async function setData(key, value) {
  if (kv) {
    try {
      await kv.set(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in KV:`, error);
      return false;
    }
  }
  mockDb[key] = value;
  return true;
}

// Simple location mapping for known IPs
function getLocationFromIP(ip) {
  const knownLocations = {
    '8.8.8.8': 'США',
    '8.8.4.4': 'США',
    '1.1.1.1': 'США',
    '1.0.0.1': 'США',
    '208.67.222.222': 'США',
    '208.67.220.220': 'США',
    '77.88.8.8': 'Россия',
    '77.88.8.1': 'Россия',
    '167.17.176.34': 'Германия',
    '167.17.176.33': 'Германия',
  };
  
  return knownLocations[ip] || 'Неизвестная локация';
}

// Extract server IP from VPN key
function extractServerIP(vpnKey) {
  if (!vpnKey || vpnKey.trim() === '') return null;
  
  // Extract IP from VLESS URL
  if (vpnKey.startsWith('vless://')) {
    const match = vpnKey.match(/vless:\/\/[^@]+@([^:]+):/);
    if (match && match[1]) {
      const ip = match[1];
      if (ip !== 'server' && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  }
  
  // Extract IP from Shadowsocks URL
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
}

// Main API handler
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const url = req.url;
  const method = req.method;
  
  // Auth endpoints
  if (url === '/api/auth/login' && method === 'POST') {
    const { username, password } = req.body;
    const users = await getData('users');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json({
        user: userWithoutPassword,
        token: 'mock-jwt-token-' + user.id
      });
    } else {
      res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }
    return;
  }
  
  if (url === '/api/auth/me' && method === 'GET') {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Не авторизован' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const userId = token.replace('mock-jwt-token-', '');
    
    const users = await getData('users');
    const user = users.find(u => u.id === userId);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } else {
      res.status(401).json({ error: 'Не авторизован' });
    }
    return;
  }
  
  if (url === '/api/auth/logout' && method === 'POST') {
    res.status(200).json({ message: 'Logged out successfully' });
    return;
  }
  
  // Users endpoints
  if (url.startsWith('/api/users')) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Не авторизован' });
      return;
    }
    
    if (method === 'GET' && url === '/api/users') {
      const users = await getData('users');
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.status(200).json({
        users: usersWithoutPasswords,
        pagination: {
          page: 1,
          pageSize: 10,
          total: users.length,
          totalPages: 1
        }
      });
      return;
    }
    
    if (method === 'POST' && url === '/api/users') {
      const users = await getData('users');
      const { username, password, role, status = 'active', vlessKey, shadowsocksKey } = req.body;
      
      if (users.find(u => u.username === username)) {
        res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
        return;
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
      
      users.push(newUser);
      await setData('users', users);
      
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(200).json(userWithoutPassword);
      return;
    }
    
    // Handle PUT and DELETE for specific user
    const userIdMatch = url.match(/\/api\/users\/(.+)/);
    if (userIdMatch) {
      const userId = userIdMatch[1];
      const users = await getData('users');
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }
      
      if (method === 'PUT') {
        const { username, password, role, status, vlessKey, shadowsocksKey } = req.body;
        const user = users[userIndex];
        
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
        
        users[userIndex] = { ...user, ...updates };
        await setData('users', users);
        
        const { password: _, ...userWithoutPassword } = users[userIndex];
        res.status(200).json(userWithoutPassword);
        return;
      }
      
      if (method === 'DELETE') {
        users.splice(userIndex, 1);
        await setData('users', users);
        res.status(200).json({ message: 'User deleted successfully' });
        return;
      }
    }
  }
  
  // VPN Server Status endpoint (simplified for Vercel)
  if (url === '/api/vpn-server/status' && method === 'GET') {
    const serverConfig = await getData('serverConfig');
    const users = await getData('users');
    
    // Find active server IPs from user keys
    const serverIPs = new Set();
    users.forEach(user => {
      if (user.status === 'active' && user.keys) {
        if (user.keys.vless) {
          const ip = extractServerIP(user.keys.vless);
          if (ip) serverIPs.add(ip);
        }
        if (user.keys.shadowsocks) {
          const ip = extractServerIP(user.keys.shadowsocks);
          if (ip) serverIPs.add(ip);
        }
      }
    });
    
    // Use first found IP or fallback to config
    const serverIP = Array.from(serverIPs)[0] || serverConfig.ip;
    const location = getLocationFromIP(serverIP);
    
    // Simulate server status (in production, you'd use external monitoring)
    const simulatedPing = Math.floor(Math.random() * 100) + 20;
    const isOnline = Math.random() > 0.1; // 90% chance of being online
    
    let status = 'offline';
    let statusText = 'Сервер недоступен';
    
    if (isOnline) {
      if (simulatedPing < 50) {
        status = 'excellent';
        statusText = 'Отличное соединение';
      } else if (simulatedPing < 100) {
        status = 'online';
        statusText = 'Хорошее соединение';
      } else {
        status = 'slow';
        statusText = 'Медленное соединение';
      }
    }
    
    res.status(200).json({
      server: {
        ip: serverIP,
        location: location
      },
      connection: {
        status: status,
        statusText: statusText,
        ping: isOnline ? `${simulatedPing} мс` : 'Нет ответа',
        pingRaw: isOnline ? simulatedPing : 0,
        isOnline: isOnline
      },
      diagnostics: {
        lastCheck: new Date().toISOString()
      }
    });
    return;
  }
  
  // VPN Server Config endpoint
  if (url === '/api/vpn-server/config' && method === 'PUT') {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Не авторизован' });
      return;
    }
    
    const { ip, location } = req.body;
    
    if (!ip) {
      res.status(400).json({ error: 'IP адрес обязателен' });
      return;
    }
    
    const serverConfig = await getData('serverConfig');
    const updatedConfig = {
      ...serverConfig,
      ip: ip.trim(),
      location: location?.trim() || getLocationFromIP(ip.trim()),
      status: 'unknown',
      lastPing: 0
    };
    
    await setData('serverConfig', updatedConfig);
    
    res.status(200).json({
      message: 'Конфигурация VPN сервера обновлена',
      server: { ip: updatedConfig.ip, location: updatedConfig.location }
    });
    return;
  }
  
  // Database export endpoint
  if (url === '/api/database/export' && method === 'GET') {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Не авторизован' });
      return;
    }
    
    const users = await getData('users');
    const serverConfig = await getData('serverConfig');
    
    const exportData = {
      users,
      serverConfig
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="vpn-database-${new Date().toISOString().split('T')[0]}.json"`);
    res.status(200).json(exportData);
    return;
  }
  
  // Default 404
  res.status(404).json({ error: 'Endpoint not found' });
};

// VPN Keys Manager API for Vercel
const ping = require('ping');
const geoip = require('geoip-lite');

// Mock database for Vercel (use external DB in production)
const mockDB = {
  users: [
    {
      id: "1",
      username: "hexsad",
      password: "grapedrake17",
      role: "admin",
      status: "active",
      createdAt: "2024-01-01T00:00:00Z",
      keys: {
        vless: "vless://53862604-a79c-4ed8-9c24-e24e15ab7c91@167.17.176.34:443?security=reality&type=tcp&headerType=&flow=xtls-rprx-vision&path=&host=&sni=github.com&fp=chrome&pbk=YzCbf0BCShZj5JLrB6DaS2fFDqif5c0m365khL4CRAM&sid=046e0559ace8ee47#%F0%9F%94%B1%20vpn.hexsad%20hexsad%20VLESS%20-%20tcp",
        shadowsocks: ""
      }
    },
    {
      id: "1755133352163",
      username: "test",
      password: "321321",
      role: "user",
      status: "blocked",
      createdAt: "2025-08-14T01:02:32.163Z",
      keys: {
        vless: "vless://ef5e5fed-1055-4698-b87c-a0380edfcf71@server:port?encryption=none#test",
        shadowsocks: "ss://aes-256-gcm:ZmQ3Y3U4ZzI3eHM=@server:port#test"
      }
    }
  ],
  serverConfig: {
    ip: "167.17.176.34",
    location: "Германия",
    lastPing: 50,
    lastCheck: "2025-08-14T13:52:51.216Z",
    status: "online"
  }
};

// Helper functions
function getLocationFromIP(ip) {
  const knownVPNIPs = {
    '167.17.176.34': 'Германия',
    '167.17.176.33': 'Германия',
    '8.8.8.8': 'США',
    '8.8.4.4': 'США',
    '1.1.1.1': 'США'
  };
  
  if (knownVPNIPs[ip]) {
    return knownVPNIPs[ip];
  }
  
  const geo = geoip.lookup(ip);
  if (geo) {
    const countryNames = {
      'US': 'США',
      'RU': 'Россия',
      'DE': 'Германия',
      'GB': 'Великобритания'
    };
    return countryNames[geo.country] || geo.country;
  }
  
  return 'Неизвестная локация';
}

function extractServerIP(vpnKey) {
  if (!vpnKey || vpnKey.trim() === '') return null;
  
  if (vpnKey.startsWith('vless://')) {
    const match = vpnKey.match(/vless:\/\/[^@]+@([^:]+):/);
    if (match && match[1]) {
      const ip = match[1];
      if (ip !== 'server' && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  }
  
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

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  const path = url.replace('/api', '');

  try {
    // Auth endpoints
    if (path === '/auth/login' && method === 'POST') {
      const { username, password } = req.body;
      const user = mockDB.users.find(u => u.username === username && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return res.json({
          user: userWithoutPassword,
          token: 'mock-jwt-token-' + user.id
        });
      } else {
        return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
      }
    }

    if (path === '/auth/me' && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Не авторизован' });
      }
      
      const token = authHeader.split(' ')[1];
      const userId = token.replace('mock-jwt-token-', '');
      const user = mockDB.users.find(u => u.id === userId);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      } else {
        return res.status(401).json({ error: 'Не авторизован' });
      }
    }

    // VPN key status endpoint
    const keyStatusMatch = path.match(/^\/vpn-key\/status\/([^\/]+)\/([^\/]+)$/);
    if (keyStatusMatch && method === 'GET') {
      const [, keyType, userId] = keyStatusMatch;
      
      if (!['vless', 'shadowsocks'].includes(keyType)) {
        return res.status(400).json({ error: 'Неверный тип ключа' });
      }
      
      const user = mockDB.users.find(u => u.id === userId);
      
      if (!user || user.status !== 'active') {
        return res.json({
          status: 'inactive',
          statusText: 'Пользователь неактивен',
          ping: null,
          isOnline: false,
          server: null
        });
      }
      
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
      
      return res.json({
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
    }

    // Default response for other endpoints
    return res.status(404).json({ error: 'API endpoint not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

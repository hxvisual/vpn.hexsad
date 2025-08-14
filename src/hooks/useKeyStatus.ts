import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface KeyStatus {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'offline' | 'inactive' | 'no-key' | 'invalid-key';
  statusText: string;
  ping: string | null;
  pingRaw: number;
  isOnline: boolean;
  server: {
    ip: string;
    location: string;
  } | null;
  error?: string;
}

export const useKeyStatus = (keyType: 'vless' | 'shadowsocks', userId?: string, keyValue?: string) => {
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !keyValue || keyValue.trim() === '') {
      setKeyStatus({
        status: 'no-key',
        statusText: 'Ключ не настроен',
        ping: null,
        pingRaw: 0,
        isOnline: false,
        server: null
      });
      setLoading(false);
      setError(null);
      return;
    }

    const fetchKeyStatus = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = `${API_BASE_URL}/api/vpn-key/status/${keyType}/${userId}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setKeyStatus(data);
      } catch (err) {
        console.error('Error fetching key status:', err);
        setError('Ошибка загрузки статуса');
        setKeyStatus({
          status: 'offline',
          statusText: 'Ошибка загрузки',
          ping: null,
          pingRaw: 0,
          isOnline: false,
          server: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchKeyStatus();
    
    // Обновляем статус каждые 30 секунд
    const interval = setInterval(fetchKeyStatus, 30000);
    
    return () => clearInterval(interval);
  }, [keyType, userId, keyValue]);

  return { keyStatus, loading, error };
};

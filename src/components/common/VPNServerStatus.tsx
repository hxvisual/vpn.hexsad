import React, { useState, useEffect } from 'react';
import { Server, Wifi, MapPin, Activity, RefreshCw, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './UI/Card';
import { Button } from './UI/Button';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { showToast } from '../../store/slices/uiSlice';

interface ServerStatus {
  server: {
    ip: string;
    location: string;
  };
  connection: {
    status: 'excellent' | 'online' | 'slow' | 'poor' | 'offline';
    statusText: string;
    quality: string;
    ping: string;
    pingRaw: number;
    isOnline: boolean;
    responseTime: string | null;
  };
  diagnostics: {
    lastCheck: string;
    lastCheckISO: string;
    error: string | null;
  };
  display: {
    statusColor: string;
    statusIcon: string;
    pingColor: string;
  };
}

export const VPNServerStatus: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ip: '', location: '' });
  const [updating, setUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ ip: '', location: '' });

  const fetchServerStatus = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setRefreshing(true);
      
      const response = await fetch(`http://localhost:3001/api/vpn-server/status`);
      if (response.ok) {
        const data = await response.json();
        setServerStatus(data);
        setEditForm({ ip: data.server.ip, location: data.server.location });
      }
    } catch (error) {
      console.error('Error fetching server status:', error);
      dispatch(showToast({ type: 'error', message: 'Ошибка при получении статуса сервера' }));
    } finally {
      setLoading(false);
      if (showRefreshIndicator) setRefreshing(false);
    }
  };

  const validateForm = () => {
    const errors = { ip: '', location: '' };
    
    // Простая валидация IP адреса
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!editForm.ip.trim()) {
      errors.ip = 'IP адрес обязателен';
    } else if (!ipRegex.test(editForm.ip.trim())) {
      errors.ip = 'Введите корректный IP адрес или домен';
    }
    
    // Локация теперь необязательна, будет определена автоматически
    if (editForm.location.trim() && editForm.location.trim().length < 3) {
      errors.location = 'Если указана локация, она должна содержать минимум 3 символа';
    }
    
    setValidationErrors(errors);
    return !errors.ip && !errors.location;
  };

  const handleUpdateServerConfig = async () => {
    if (!token || user?.role !== 'admin') return;
    
    if (!validateForm()) {
      dispatch(showToast({ type: 'error', message: 'Пожалуйста, исправьте ошибки в форме' }));
      return;
    }
    
    try {
      setUpdating(true);
      
      // Отправляем только IP, локация определится автоматически
      const response = await fetch(`http://localhost:3001/api/vpn-server/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ip: editForm.ip, location: '' }) // Передаем пустую локацию
      });

      if (response.ok) {
        const result = await response.json();
        
        // Создаем сообщение о результате
        let message = `Конфигурация обновлена. Локация определена автоматически: ${result.server.location}`;
        
        if (result.pingTest?.success) {
          message += `. Пинг: ${result.pingTest.ping}мс`;
          dispatch(showToast({ 
            type: 'success', 
            message: message
          }));
        } else {
          message += `, но сервер недоступен`;
          dispatch(showToast({ 
            type: 'warning', 
            message: message
          }));
        }
        
        setEditing(false);
        await fetchServerStatus();
      } else {
        const error = await response.json();
        dispatch(showToast({ type: 'error', message: error.error || 'Ошибка при обновлении конфигурации' }));
      }
    } catch (error) {
      console.error('Error updating server config:', error);
      dispatch(showToast({ type: 'error', message: 'Ошибка при обновлении конфигурации сервера' }));
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setValidationErrors({ ip: '', location: '' });
    if (serverStatus) {
      setEditForm({ ip: serverStatus.server.ip, location: serverStatus.server.location });
    }
  };

  useEffect(() => {
    fetchServerStatus();
    // Обновляем статус каждые 30 секунд
    const interval = setInterval(() => fetchServerStatus(), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="text-blue-400" size={20} />
            Статус VPN сервера
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="animate-spin text-blue-400" size={24} />
            <span className="ml-2 text-gray-400">Загрузка...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serverStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="text-red-400" size={20} />
            Статус VPN сервера
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <p className="text-red-400 font-medium">Не удалось получить статус сервера</p>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => fetchServerStatus(true)}
              className="mt-4"
            >
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-500/20';
      case 'online': return 'text-green-400 bg-green-500/20';
      case 'slow': return 'text-yellow-400 bg-yellow-500/20';
      case 'poor': return 'text-orange-400 bg-orange-500/20';
      case 'offline': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="text-blue-400" size={20} />
            Статус VPN сервера
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchServerStatus(true)}
              disabled={refreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
              <span className="hidden sm:inline">Обновить</span>
            </Button>
            {user?.role === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1"
              >
                {editing ? <X size={16} /> : <Edit2 size={16} />}
                <span className="hidden sm:inline">{editing ? 'Отмена' : 'Настроить'}</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Основная информация о состоянии */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-6 border border-gray-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Статус соединения */}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${getStatusColor(serverStatus.connection.status)} shadow-lg`}>
                <Wifi size={24} className="drop-shadow-md" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Статус соединения</p>
                <p className={`font-semibold text-lg ${getStatusColor(serverStatus.connection.status).split(' ')[0]}`}>
                  {serverStatus.connection.statusText}
                </p>
              </div>
            </div>

            {/* Скорость отклика (Пинг) */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 shadow-lg">
                <Activity className="text-blue-400 drop-shadow-md" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Пинг</p>
                <p className="font-semibold text-lg" style={{ color: serverStatus.display.pingColor }}>
                  {serverStatus.connection.isOnline 
                    ? `${serverStatus.connection.pingRaw} мс` 
                    : 'Сервер не активен'
                  }
                </p>
              </div>
            </div>

            {/* Последняя проверка */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 shadow-lg">
                <RefreshCw className="text-purple-400 drop-shadow-md" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Последняя проверка</p>
                <p className="font-semibold text-lg text-white">
                  {new Date(serverStatus.diagnostics.lastCheckISO).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(serverStatus.diagnostics.lastCheckISO).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Информация о сервере - IP адрес */}
        <div className="mt-6">
          <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/50">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-cyan-500/20 rounded-lg">
                <Server className="text-cyan-400" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">IP адрес сервера</p>
                {editing ? (
                  <div className="w-full">
                    <input
                      type="text"
                      value={editForm.ip}
                      onChange={(e) => {
                        setEditForm({ ...editForm, ip: e.target.value });
                        if (validationErrors.ip) {
                          setValidationErrors({ ...validationErrors, ip: '' });
                        }
                      }}
                      className={`w-full bg-gray-900 border rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none transition-colors ${
                        validationErrors.ip 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-600 focus:border-blue-500'
                      }`}
                      placeholder="Введите IP адрес или домен"
                    />
                    {validationErrors.ip && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.ip}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-white font-mono text-lg bg-gray-900/50 px-4 py-2 rounded-lg inline-block">
                    {serverStatus.server.ip}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Информация о сервере - Локация */}
        <div className="mt-4">
          <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/50">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-orange-500/20 rounded-lg">
                <MapPin className="text-orange-400" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Локация сервера</p>
                {editing ? (
                  <div className="w-full">
                    <div className="bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2">
                      <p className="text-gray-400 text-sm italic">
                        Определится автоматически при сохранении IP
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-white font-medium text-lg bg-gray-900/50 px-4 py-2 rounded-lg inline-block">
                    {serverStatus.server.location}
                  </p>
                )}
              </div>
            </div>

            {editing && (
              <div className="flex items-center gap-2 mt-5">
                <Button
                  size="sm"
                  onClick={handleUpdateServerConfig}
                  disabled={updating}
                  className="flex items-center gap-2"
                >
                  {updating ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                  {updating ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={updating}
                >
                  Отмена
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Диагностическая информация */}
        {serverStatus.diagnostics.error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              {serverStatus.diagnostics.error}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

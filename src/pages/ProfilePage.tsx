import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, QrCode, Eye, EyeOff, User, Calendar, Shield, LogOut, Wifi, WifiOff, Loader } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import { showToast, openModal, setQRKey } from '../store/slices/uiSlice';
import { Button } from '../components/common/UI/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/UI/Card';
import { AdminPanel } from '../components/admin/AdminPanel';
import { QRCodeModal } from '../components/common/QRCodeModal';
import { VPNInstructions } from '../components/common/VPNInstructions';
import { useKeyStatus } from '../hooks/useKeyStatus';

interface KeyCardProps {
  title: string;
  keyValue: string | undefined;
  keyType: 'vless' | 'shadowsocks';
  userId?: string;
}

const KeyCard: React.FC<KeyCardProps> = ({ title, keyValue, keyType, userId }) => {
  const dispatch = useAppDispatch();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Проверяем, что ключ действительно есть и не является пустой строкой
  const hasValidKey = keyValue && keyValue.trim() !== '';
  
  // Получаем статус ключа
  const { keyStatus, loading } = useKeyStatus(keyType, userId, keyValue);

  const handleCopy = async () => {
    if (hasValidKey) {
      await navigator.clipboard.writeText(keyValue);
      setCopied(true);
      dispatch(showToast({ type: 'success', message: `${title} скопирован в буфер обмена` }));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShowQR = () => {
    if (hasValidKey) {
      dispatch(setQRKey(keyValue));
      dispatch(openModal('qrCode'));
    }
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500/20 text-green-400';
      case 'good': return 'bg-green-500/20 text-green-400';
      case 'fair': return 'bg-yellow-500/20 text-yellow-400';
      case 'poor': return 'bg-orange-500/20 text-orange-400';
      case 'offline': return 'bg-red-500/20 text-red-400';
      case 'no-key': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Функция для получения иконки статуса
  const getStatusIcon = (status: string, isLoading: boolean) => {
    if (isLoading) return <Loader size={14} className="animate-spin" />;
    
    switch (status) {
      case 'excellent':
      case 'good':
        return <Wifi size={14} />;
      case 'fair':
      case 'poor':
        return <Wifi size={14} />;
      case 'offline':
      case 'no-key':
      case 'invalid-key':
      case 'inactive':
        return <WifiOff size={14} />;
      default:
        return <WifiOff size={14} />;
    }
  };

  if (!hasValidKey) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
              <WifiOff size={14} />
              Неактивен
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Ключ не настроен. Обратитесь к администратору.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{title}</CardTitle>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
              Активен
            </span>
          </div>
          
          {/* Server Status Information */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(keyStatus?.status || 'offline')}`}>
                {getStatusIcon(keyStatus?.status || 'offline', loading)}
                {loading ? 'Проверка...' : keyStatus?.statusText || 'Проверка соединения...'}
              </span>
              {keyStatus?.ping && (
                <span className="text-xs text-gray-400 bg-dark-300 px-2 py-1 rounded">
                  {keyStatus.ping}
                </span>
              )}
            </div>
            
            {keyStatus?.server && (
              <div className="text-xs text-gray-400 flex items-center justify-between">
                <span>Сервер: {keyStatus.server.ip}</span>
                <span>{keyStatus.server.location}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-dark-300 rounded-lg font-mono text-sm break-all">
            {showKey ? keyValue : '••••••••••••••••••••••••'}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowKey(!showKey)}
              className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial justify-center"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="hidden sm:inline">{showKey ? 'Скрыть' : 'Показать'}</span>
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial justify-center"
            >
              <Copy size={16} />
              <span className="hidden sm:inline">{copied ? 'Скопировано!' : 'Копировать'}</span>
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={handleShowQR}
              className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial justify-center"
            >
              <QrCode size={16} />
              <span className="hidden sm:inline">QR Код</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [vpnKeys, setVpnKeys] = useState({ vless: '', shadowsocks: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Get VPN keys from user object - не создаем mock ключи
    if (user?.keys) {
      setVpnKeys({
        vless: user.keys.vless || '',
        shadowsocks: user.keys.shadowsocks || ''
      });
    } else {
      // Ключей нет - ставим пустые строки
      setVpnKeys({
        vless: '',
        shadowsocks: ''
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 via-dark-200 to-dark-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-500/3 to-blue-500/3 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
      
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl relative z-10 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Профиль</h1>
          <Button variant="danger" onClick={handleLogout} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <LogOut size={20} />
            Выйти
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Информация о пользователе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <User className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Имя пользователя</p>
                  <p className="text-white font-medium">{user.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Shield className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Роль</p>
                  <p className="text-white font-medium capitalize">{user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Calendar className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Дата регистрации</p>
                  <p className="text-white font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full ${
                  user.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* VPN Keys Section */}
        {user.status === 'active' ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Ваши VPN ключи</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <KeyCard 
                  title="VLESS Ключ"
                  keyValue={vpnKeys.vless} 
                  keyType="vless"
                  userId={user.id}
                />
                <KeyCard 
                  title="Shadowsocks Ключ"
                  keyValue={vpnKeys.shadowsocks} 
                  keyType="shadowsocks"
                  userId={user.id}
                />
              </div>
            </div>
            
            {/* VPN Connection Instructions */}
            <div className="mb-8">
              <VPNInstructions 
                vlessKey={vpnKeys.vless}
                shadowsocksKey={vpnKeys.shadowsocks}
              />
            </div>
          </>
        ) : (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Ваши VPN ключи</h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
              <div className="text-red-400 text-6xl mb-6">🔒</div>
              <h3 className="text-xl font-semibold text-red-400 mb-4">Доступ заблокирован</h3>
              <p className="text-red-300 mb-6">Ваш аккаунт заблокирован. Обратитесь к администратору для восстановления доступа.</p>
              <a 
                href="https://t.me/hexsad01" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.268 1.415-.896 4.728-1.268 6.281-.158.659-.468.883-.77.903-.654.06-1.15-.432-1.784-.848-1.001-.658-1.565-1.065-2.538-1.708-1.124-.743-.396-1.15.246-1.817.168-.174 3.094-2.836 3.154-3.074.007-.03.014-.142-.054-.2-.068-.06-.168-.04-.24-.024-.1.023-1.705 1.083-4.81 3.179-.456.315-.87.469-1.244.46-.408-.01-1.192-.23-1.78-.42-.717-.233-1.287-.356-1.238-.753.025-.206.308-.417.85-.632 3.337-1.458 5.563-2.42 6.676-2.887 3.181-1.309 3.833-1.538 4.26-1.546.095-.002.307.022.445.134.117.095.149.22.165.309-.002.069.01.224-.002.345z"/>
                </svg>
                Написать в Telegram
              </a>
            </div>
          </div>
        )}

        {/* Admin Panel - Only visible for admins */}
        {user.role === 'admin' && <AdminPanel />}
      </div>
      
      {/* QR Code Modal */}
      <QRCodeModal />
    </div>
  );
};

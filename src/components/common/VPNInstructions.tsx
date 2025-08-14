import React from 'react';
import { Download, Smartphone, Monitor, Copy, ExternalLink } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { showToast } from '../../store/slices/uiSlice';

interface VPNInstructionsProps {
  vlessKey?: string;
  shadowsocksKey?: string;
}

export const VPNInstructions: React.FC<VPNInstructionsProps> = ({ 
  vlessKey, 
  shadowsocksKey 
}) => {
  const dispatch = useAppDispatch();
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    dispatch(showToast({ 
      type: 'success', 
      message: `${type} ключ скопирован в буфер обмена` 
    }));
  };

  return (
    <div className="bg-dark-200/50 backdrop-blur-xl border border-dark-300/50 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Инструкция по подключению VPN
        </h2>
        <p className="text-sm sm:text-base text-gray-400">
          Следуйте пошаговым инструкциям для настройки Amnezia VPN
        </p>
      </div>

      {/* Step 1: Download */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold">
            1
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Скачайте Amnezia VPN</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-4 sm:ml-11">
          <a 
            href="https://amnezia.org/downloads"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 sm:p-4 bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors"
          >
            <Monitor size={24} className="text-blue-400" />
            <div>
              <div className="font-medium text-white">Windows/Mac/Linux</div>
              <div className="text-sm text-gray-400">Настольные версии</div>
            </div>
            <ExternalLink size={16} className="text-gray-400 ml-auto" />
          </a>
          
          <a 
            href="https://play.google.com/store/apps/details?id=org.amnezia.vpn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors"
          >
            <Smartphone size={24} className="text-green-400" />
            <div>
              <div className="font-medium text-white">Android</div>
              <div className="text-sm text-gray-400">Google Play Store</div>
            </div>
            <ExternalLink size={16} className="text-gray-400 ml-auto" />
          </a>
          
          <a 
            href="https://apps.apple.com/app/amnezia-vpn/id1600480750"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors"
          >
            <Download size={24} className="text-purple-400" />
            <div>
              <div className="font-medium text-white">iOS</div>
              <div className="text-sm text-gray-400">App Store</div>
            </div>
            <ExternalLink size={16} className="text-gray-400 ml-auto" />
          </a>
        </div>
      </div>

      {/* Step 2: Import Config */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold">
            2
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Импортируйте конфигурацию</h3>
        </div>
        
        <div className="ml-4 sm:ml-11 space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="font-medium text-blue-300 mb-2">Способы импорта:</h4>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• Скопируйте ключ подключения и вставьте в приложение</li>
              <li>• Создайте QR-код из ключа и отсканируйте камерой</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Step 3: Keys */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold">
            3
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Ваши ключи подключения</h3>
        </div>
        
        <div className="ml-4 sm:ml-11 space-y-4">
          {/* VLESS Key */}
          {vlessKey && (
            <div className="space-y-2">
              <h4 className="font-medium text-purple-300">VLESS ключ (рекомендуется)</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-dark-300 rounded-lg font-mono text-sm text-gray-300 break-all">
                  {vlessKey}
                </div>
                <button
                  onClick={() => copyToClipboard(vlessKey, 'VLESS')}
                  className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  title="Скопировать VLESS ключ"
                >
                  <Copy size={16} className="text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Более современный и быстрый протокол
              </p>
            </div>
          )}
          
          {/* Shadowsocks Key */}
          {shadowsocksKey && (
            <div className="space-y-2">
              <h4 className="font-medium text-cyan-300">Shadowsocks ключ</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-dark-300 rounded-lg font-mono text-sm text-gray-300 break-all">
                  {shadowsocksKey}
                </div>
                <button
                  onClick={() => copyToClipboard(shadowsocksKey, 'Shadowsocks')}
                  className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                  title="Скопировать Shadowsocks ключ"
                >
                  <Copy size={16} className="text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Альтернативный протокол для особых случаев
              </p>
            </div>
          )}
          
          {!vlessKey && !shadowsocksKey && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300">
                ⚠️ Ключи подключения пока не настроены. Обратитесь к администратору.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Setup */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold">
            4
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Настройка в Amnezia VPN</h3>
        </div>
        
        <div className="ml-4 sm:ml-11 space-y-3">
          <div className="space-y-2">
            <h5 className="font-medium text-white">Пошаговая настройка:</h5>
            <ol className="text-gray-300 space-y-2 text-sm list-decimal list-inside">
              <li>Откройте приложение Amnezia VPN</li>
              <li>Нажмите кнопку "Добавить сервер" или "+"</li>
              <li>Выберите "Импортировать конфигурацию"</li>
              <li>Вставьте скопированный ключ подключения</li>
              <li>Дождитесь импорта конфигурации</li>
              <li>Нажмите "Подключиться"</li>
            </ol>
          </div>
          
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h5 className="font-medium text-green-300 mb-2">💡 Полезные советы:</h5>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• Рекомендуем использовать VLESS ключ для лучшей производительности</li>
              <li>• Если один протокол не работает, попробуйте другой</li>
              <li>• Сохраните ключи в надежном месте для резервного копирования</li>
              <li>• При проблемах с подключением обратитесь в поддержку</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-dark-400 pt-4 sm:pt-6">
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h4 className="font-medium text-white mb-1 text-sm sm:text-base">Нужна помощь?</h4>
            <p className="text-gray-400 text-xs sm:text-sm mb-3">
              Свяжитесь с технической поддержкой:
            </p>
            <a 
              href="https://t.me/hexsad01" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg transition-colors text-sm w-full sm:w-auto border border-blue-500/30"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.14-.32-1.09-.68.03-.19.39-.38.11-.17z"/>
              </svg>
              <span className="font-medium">@hexsad01</span>
            </a>
          </div>
          <div className="text-center pt-4 border-t border-dark-400">
            <div className="text-sm font-medium text-gray-300 mb-1">© 2025 vpn.hexsad</div>
            <div className="text-xs text-gray-500">Безопасность превыше всего</div>
          </div>
        </div>
      </div>
    </div>
  );
};

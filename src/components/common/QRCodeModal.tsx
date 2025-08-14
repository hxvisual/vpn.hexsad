import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { closeModal, setQRKey, showToast } from '../../store/slices/uiSlice';
import { Modal } from './UI/Modal';
import { Button } from './UI/Button';

export const QRCodeModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { modals, currentQRKey } = useAppSelector((state) => state.ui);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentQRKey) {
      QRCode.toDataURL(currentQRKey, {
        width: 400,
        margin: 2,
        color: {
          dark: '#FFFFFF',
          light: '#1e1e1e',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Ошибка генерации QR кода:', err));
    }
  }, [currentQRKey]);

  const handleClose = () => {
    dispatch(closeModal('qrCode'));
    dispatch(setQRKey(null));
    setQrCodeUrl('');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (currentQRKey) {
      await navigator.clipboard.writeText(currentQRKey);
      setCopied(true);
      dispatch(showToast({ type: 'success', message: 'Ключ скопирован в буфер обмена' }));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = 'vpn-key-qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      dispatch(showToast({ type: 'success', message: 'QR код загружен' }));
    }
  };

  return (
    <Modal 
      isOpen={modals.qrCode} 
      onClose={handleClose} 
      title="QR Код для VPN ключа"
      size="md"
    >
      <div className="space-y-4">
        {qrCodeUrl && (
          <div className="flex justify-center p-4 bg-dark-300 rounded-xl">
            <img src={qrCodeUrl} alt="QR Code" className="max-w-full" />
          </div>
        )}
        
        {currentQRKey && (
          <div className="p-3 bg-dark-300 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Ключ:</p>
            <p className="font-mono text-xs break-all text-gray-300">
              {currentQRKey.length > 100 
                ? `${currentQRKey.substring(0, 100)}...` 
                : currentQRKey}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleCopy}
            variant="secondary"
            className="flex-1 flex items-center justify-center gap-2"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Скопировано!' : 'Копировать ключ'}
          </Button>
          <Button
            onClick={handleDownload}
            variant="secondary"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Скачать QR
          </Button>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            💡 Отсканируйте этот QR код в вашем VPN-клиенте для быстрого подключения
          </p>
        </div>
      </div>
    </Modal>
  );
};

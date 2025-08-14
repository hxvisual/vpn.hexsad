import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur covering entire screen */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-lg animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        {/* Modal Content */}
        <div
          className={cn(
            'relative w-full bg-dark-200 rounded-2xl shadow-2xl animate-slide-up pointer-events-auto',
            'border border-dark-300',
            sizes[size],
            className
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-dark-300">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className={cn('p-6', !title && 'pt-10')}>
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-dark-300 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

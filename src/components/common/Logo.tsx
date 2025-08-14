import React from 'react';
import { Shield, Wifi } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Background gradient circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-full animate-pulse opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-full blur-md opacity-30" />
        
        {/* Main icons */}
        <div className="relative z-10 flex items-center justify-center">
          <Shield className="text-blue-400 absolute" size={size === 'sm' ? 20 : size === 'md' ? 28 : 36} />
          <Wifi className="text-cyan-400 absolute scale-75 opacity-60" size={size === 'sm' ? 16 : size === 'md' ? 22 : 28} />
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent ${textSizes[size]}`}>
            vpn.hexsad
          </div>
          {size !== 'sm' && (
            <div className="text-xs text-gray-500 -mt-1 tracking-wider">
              SECURE • PRIVATE • FAST
            </div>
          )}
        </div>
      )}
    </div>
  );
};

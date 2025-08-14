import React, { forwardRef } from 'react';
import { cn } from '../../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 bg-dark-300/50 backdrop-blur-sm border border-dark-400/50',
              'rounded-xl text-white placeholder-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

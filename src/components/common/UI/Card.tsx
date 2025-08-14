import React from 'react';
import { cn } from '../../../utils/cn';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, children, hover = false }) => {
  return (
    <div
      className={cn(
        'bg-dark-200/50 backdrop-blur-xl border border-dark-300/50 rounded-2xl shadow-2xl p-6',
        hover && 'transition-transform duration-200 hover:scale-[1.02] hover:shadow-xl',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  return (
    <div className={cn('mb-4 pb-4 border-b border-dark-300', className)}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  return <h3 className={cn('text-xl font-semibold text-white', className)}>{children}</h3>;
};

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  return <div className={cn('text-gray-300', className)}>{children}</div>;
};

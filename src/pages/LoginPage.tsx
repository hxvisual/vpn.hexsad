import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { login } from '../store/slices/authSlice';
import { Button } from '../components/common/UI/Button';
import { Input } from '../components/common/Form/Input';
import { Logo } from '../components/common/Logo';
import { LoginCredentials } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await dispatch(login(data)).unwrap();
      navigate('/profile');
    } catch (err) {
      console.error('Ошибка авторизации:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 via-dark-200 to-dark-100 flex items-center justify-center px-4 py-4 sm:py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo and title */}
        <div className="text-center mb-6 sm:mb-8">
          <Logo size="lg" className="justify-center mb-4 sm:mb-6" />
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Добро пожаловать</h1>
          <p className="text-sm sm:text-base text-gray-400">Войдите в систему управления VPN</p>
        </div>

        {/* Login form */}
        <div className="bg-dark-200/50 backdrop-blur-xl border border-dark-300/50 rounded-2xl shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <Input
                label="Имя пользователя"
                type="text"
                placeholder="Введите имя пользователя"
                icon={<User size={20} />}
                error={errors.username?.message}
                {...register('username', {
                  required: 'Имя пользователя обязательно',
                  minLength: {
                    value: 3,
                    message: 'Имя пользователя должно быть не менее 3 символов',
                  },
                })}
              />

              <div className="relative">
                <Input
                  label="Пароль"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  icon={<Lock size={20} />}
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Пароль обязателен',
                    minLength: {
                      value: 6,
                      message: 'Пароль должен быть не менее 6 символов',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>


            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  {error}
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg" 
              isLoading={isLoading}
            >
              {!isLoading && <ArrowRight size={20} />}
              Войти в систему
            </Button>
          </form>

        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex justify-center">
            <a 
              href="https://t.me/hexsad01" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 text-blue-300 hover:text-blue-200 rounded-xl transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.268 1.415-.896 4.728-1.268 6.281-.158.659-.468.883-.77.903-.654.06-1.15-.432-1.784-.848-1.001-.658-1.565-1.065-2.538-1.708-1.124-.743-.396-1.15.246-1.817.168-.174 3.094-2.836 3.154-3.074.007-.03.014-.142-.054-.2-.068-.06-.168-.04-.24-.024-.1.023-1.705 1.083-4.81 3.179-.456.315-.87.469-1.244.46-.408-.01-1.192-.23-1.78-.42-.717-.233-1.287-.356-1.238-.753.025-.206.308-.417.85-.632 3.337-1.458 5.563-2.42 6.676-2.887 3.181-1.309 3.833-1.538 4.26-1.546.095-.002.307.022.445.134.117.095.149.22.165.309-.002.069.01.224-.002.345z"/>
              </svg>
              Поддержка в Telegram
            </a>
          </div>
          <p className="text-xs text-gray-500">
            © 2025 vpn.hexsad. Безопасность превыше всего.
          </p>
        </div>
      </div>
    </div>
  );
};

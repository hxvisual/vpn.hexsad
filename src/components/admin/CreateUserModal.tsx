import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Key } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createUser } from '../../store/slices/usersSlice';
import { closeModal, showToast } from '../../store/slices/uiSlice';
import { Modal } from '../common/UI/Modal';
import { Button } from '../common/UI/Button';
import { Input } from '../common/Form/Input';
import { CreateUserDto } from '../../types';

export const CreateUserModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.createUser);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateUserDto & { confirmPassword: string }>();

  const password = watch('password');

  const handleClose = () => {
    dispatch(closeModal('createUser'));
    reset();
  };


  const onSubmit = async (data: CreateUserDto) => {
    setIsLoading(true);
    try {
      await dispatch(createUser(data)).unwrap();
      dispatch(showToast({ type: 'success', message: 'Пользователь успешно создан' }));
      handleClose();
    } catch (error) {
      dispatch(showToast({ type: 'error', message: 'Ошибка при создании пользователя' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Создать нового пользователя" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Имя пользователя"
            type="text"
            placeholder="Введите имя пользователя"
            icon={<User size={20} />}
            error={errors.username?.message}
            {...register('username', {
              required: 'Имя пользователя обязательно',
              minLength: { value: 3, message: 'Минимум 3 символа' },
            })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Роль</label>
            <select
              className="w-full px-4 py-2.5 bg-dark-300 border border-dark-400 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('role', { required: 'Роль обязательна' })}
            >
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Пароль"
              type="password"
              placeholder="Введите пароль"
              icon={<Lock size={20} />}
              error={errors.password?.message}
              {...register('password', {
                required: 'Пароль обязателен',
                minLength: { value: 6, message: 'Минимум 6 символов' },
              })}
            />
          </div>

          <Input
            label="Подтвердите пароль"
            type="password"
            placeholder="Подтвердите пароль"
            icon={<Lock size={20} />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Подтвердите пароль',
              validate: (value) => value === password || 'Пароли не совпадают',
            })}
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-dark-300">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Статус</label>
            <select
              className="w-full px-4 py-2.5 bg-dark-300 border border-dark-400 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('status')}
              defaultValue="active"
            >
              <option value="active">Активен</option>
              <option value="blocked">Заблокирован</option>
            </select>
          </div>

          <h3 className="text-lg font-medium text-white">VPN Ключи (опционально)</h3>
          
          <div>
            <Input
              label="VLESS Ключ"
              type="text"
              placeholder="vless://..."
              icon={<Key size={20} />}
              {...register('vlessKey')}
            />
          </div>

          <div>
            <Input
              label="Shadowsocks Ключ"
              type="text"
              placeholder="ss://..."
              icon={<Key size={20} />}
              {...register('shadowsocksKey')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Создать пользователя
          </Button>
        </div>
      </form>
    </Modal>
  );
};

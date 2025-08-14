import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Key, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateUser, fetchUsers } from '../../store/slices/usersSlice';
import { closeModal, showToast } from '../../store/slices/uiSlice';
import { Modal } from '../common/UI/Modal';
import { Button } from '../common/UI/Button';
import { Input } from '../common/Form/Input';
import { UpdateUserDto } from '../../types';

export const EditUserModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.editUser);
  const { selectedUser, pagination, filters } = useAppSelector((state) => state.users);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UpdateUserDto>();

  useEffect(() => {
    if (selectedUser) {
      setValue('username', selectedUser.username);
      setValue('role', selectedUser.role);
      setValue('status', selectedUser.status);
      setValue('vlessKey', selectedUser.keys?.vless || '');
      setValue('shadowsocksKey', selectedUser.keys?.shadowsocks || '');
    }
  }, [selectedUser, setValue]);

  const handleClose = () => {
    dispatch(closeModal('editUser'));
    reset();
    setChangePassword(false);
  };


  const onSubmit = async (data: UpdateUserDto) => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateUserDto = {
        ...data,
        password: changePassword ? data.password : undefined,
      };
      
      await dispatch(updateUser({ id: selectedUser.id, userData: updateData })).unwrap();
      dispatch(showToast({ type: 'success', message: 'Пользователь успешно обновлен' }));
      dispatch(fetchUsers({ filters, pagination }));
      handleClose();
    } catch (error) {
      dispatch(showToast({ type: 'error', message: 'Ошибка при обновлении пользователя' }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Редактировать пользователя" size="lg">
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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Статус</label>
          <select
            className="w-full px-4 py-2.5 bg-dark-300 border border-dark-400 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('status')}
          >
            <option value="active">Активен</option>
            <option value="blocked">Заблокирован</option>
          </select>
        </div>

        <div className="border-t border-dark-300 pt-4">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="changePassword"
              checked={changePassword}
              onChange={(e) => setChangePassword(e.target.checked)}
              className="w-4 h-4 bg-dark-300 border-dark-400 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="changePassword" className="ml-2 text-sm text-gray-300">
              Изменить пароль
            </label>
          </div>

          {changePassword && (
            <div className="relative">
              <Input
                label="Новый пароль"
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите новый пароль"
                icon={<Lock size={20} />}
                error={errors.password?.message}
                {...register('password', {
                  required: changePassword ? 'Пароль обязателен' : false,
                  minLength: { value: 6, message: 'Минимум 6 символов' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-dark-300">
          <h3 className="text-lg font-medium text-white">VPN Ключи</h3>
          
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
            Сохранить изменения
          </Button>
        </div>
      </form>
    </Modal>
  );
};

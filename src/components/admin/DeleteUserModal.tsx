import React, { useState } from 'react';
import { AlertTriangle, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { deleteUser, fetchUsers } from '../../store/slices/usersSlice';
import { closeModal, showToast } from '../../store/slices/uiSlice';
import { Modal } from '../common/UI/Modal';
import { Button } from '../common/UI/Button';

export const DeleteUserModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.modals.deleteUser);
  const { selectedUser, pagination, filters } = useAppSelector((state) => state.users);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    dispatch(closeModal('deleteUser'));
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      await dispatch(deleteUser(selectedUser.id)).unwrap();
      dispatch(showToast({ type: 'success', message: 'Пользователь успешно удален' }));
      dispatch(fetchUsers({ filters, pagination }));
      handleClose();
    } catch (error) {
      dispatch(showToast({ type: 'error', message: 'Ошибка при удалении пользователя' }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Удалить пользователя" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertTriangle className="text-red-400" size={24} />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium mb-2">
              Вы уверены, что хотите удалить пользователя?
            </p>
            <p className="text-gray-400 text-sm">
              Это действие нельзя отменить. Все данные и VPN ключи будут удалены.
            </p>
          </div>
        </div>

        <div className="p-3 bg-dark-300 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Пользователь:</span>
          </div>
          <p className="text-white font-medium">{selectedUser.username}</p>
          <p className="text-sm text-gray-400 mt-1">
            Роль: {selectedUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Удалить
          </Button>
        </div>
      </div>
    </Modal>
  );
};

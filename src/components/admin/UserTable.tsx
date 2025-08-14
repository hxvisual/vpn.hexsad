import React from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { User, PaginationState } from '../../types';
import { useAppDispatch } from '../../hooks/redux';
import { openModal } from '../../store/slices/uiSlice';
import { setSelectedUser } from '../../store/slices/usersSlice';
import { Button } from '../common/UI/Button';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  pagination,
  onPageChange,
}) => {
  const dispatch = useAppDispatch();

  const handleEdit = (user: User) => {
    dispatch(setSelectedUser(user));
    dispatch(openModal('editUser'));
  };

  const handleDelete = (user: User) => {
    dispatch(setSelectedUser(user));
    dispatch(openModal('deleteUser'));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
      <p className="text-gray-400">Пользователи не найдены</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-300">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Имя пользователя</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Роль</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Статус</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Создан</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-dark-300 hover:bg-dark-300/50 transition-colors">
              <td className="py-4 px-4">
                <span className="text-white font-medium">{user.username}</span>
              </td>
              <td className="py-4 px-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.status === 'active' ? 'Активен' : 'Заблокирован'}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-400">
                {new Date(user.createdAt).toLocaleDateString('ru-RU')}
              </td>
              <td className="py-4 px-4">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(user)}
                    className="p-2"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(user)}
                    className="p-2 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-gray-400 text-sm">
            Показано {(pagination.page - 1) * pagination.pageSize + 1} - {' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} из{' '}
            {pagination.total} пользователей
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - pagination.page) <= 1
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                  <Button
                    size="sm"
                    variant={page === pagination.page ? 'primary' : 'secondary'}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </Button>
                </React.Fragment>
              ))}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

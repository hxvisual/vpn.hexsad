import React, { useEffect, useState } from 'react';
import { Plus, Search, Users, Download } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchUsers, setFilters, setPagination } from '../../store/slices/usersSlice';
import { openModal, showToast } from '../../store/slices/uiSlice';
import { Button } from '../common/UI/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../common/UI/Card';
import { Input } from '../common/Form/Input';
import { UserTable } from './UserTable';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';
import { DeleteUserModal } from './DeleteUserModal';

export const AdminPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list: users, pagination, isLoading, filters } = useAppSelector((state) => state.users);
  const { token } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUsers({ filters, pagination }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // Remove filters and pagination from dependencies to avoid infinite loop

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
    dispatch(fetchUsers({ 
      filters: { search: searchTerm }, 
      pagination 
    }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPagination({ page }));
    dispatch(fetchUsers({ filters, pagination: { ...pagination, page } }));
  };

  const handleDownloadDatabase = async () => {
    if (!token) {
      dispatch(showToast({ 
        type: 'error', 
        message: 'Ошибка авторизации. Войдите в систему заново.' 
      }));
      return;
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/database/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при скачивании базы данных');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `vpn-database-${currentDate}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      dispatch(showToast({ 
        type: 'success', 
        message: 'База данных успешно скачана' 
      }));
    } catch (error) {
      dispatch(showToast({ 
        type: 'error', 
        message: 'Ошибка при скачивании базы данных' 
      }));
      console.error('Error downloading database:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="text-blue-400" size={24} />
              </div>
              <div>
                <CardTitle>Управление пользователями</CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                  Управляйте пользователями и их VPN ключами
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleDownloadDatabase}
                variant="secondary"
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Download size={20} />
                <span className="hidden sm:inline">Скачать БД</span>
                <span className="sm:hidden">БД</span>
              </Button>
              <Button
                onClick={() => dispatch(openModal('createUser'))}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Добавить пользователя</span>
                <span className="sm:hidden">Добавить</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Поиск пользователей..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search size={20} />}
                />
              </div>
              <Button type="submit" variant="secondary" className="px-3">
                <Search size={20} />
              </Button>
            </div>
          </form>

          {/* Users Table */}
          <UserTable
            users={users}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateUserModal />
      <EditUserModal />
      <DeleteUserModal />
    </div>
  );
};

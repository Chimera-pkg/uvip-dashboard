import { useState, useCallback } from 'react';
import { message } from 'antd';
import {
  usersService,
  type User,
  type PaginatedUsers,
  type CreateUserRequest,
} from '../api/users.service';
import { getApiErrorMessage } from '../utils/error';

const MAX_PAGE_SIZE = 100;

export function useUsers() {
  const [paginatedData, setPaginatedData] = useState<PaginatedUsers | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (page = 1, size = 10, search?: string) => {
      try {
        setLoading(true);
        const result = await usersService.getUsers({ page, size, search });
        setPaginatedData(result);
        setUsers(result.data || []);
        setError(null);
        return result;
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Gagal memuat data pengguna'));
        console.error('Users fetch error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch every user page (size=100) so global sorting and file-count matching work across all users.
   */
  const fetchAllUsers = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const firstPage = await usersService.getUsers({
        page: 1,
        size: MAX_PAGE_SIZE,
        search,
      });
      let allUsers = [...(firstPage.data || [])];

      if (firstPage.total_pages > 1) {
        const pageNumbers = Array.from(
          { length: firstPage.total_pages - 1 },
          (_, index) => index + 2,
        );
        const restPages = await Promise.all(
          pageNumbers.map((page) =>
            usersService.getUsers({ page, size: MAX_PAGE_SIZE, search }),
          ),
        );
        for (const pageResult of restPages) {
          allUsers = allUsers.concat(pageResult.data || []);
        }
      }

      setUsers(allUsers);
      setPaginatedData({
        total_data: firstPage.total_data ?? allUsers.length,
        total_pages: 1,
        current_page: 1,
        data: allUsers,
      });
      setError(null);
      return allUsers;
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Gagal memuat daftar pengguna'));
      console.error('Fetch all users error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserRequest) => {
    try {
      const newUser = await usersService.createUser(data);
      setUsers((prev) => [newUser, ...prev]);
      message.success('Pengguna baru berhasil ditambahkan');
      return newUser;
    } catch (err: unknown) {
      message.error(getApiErrorMessage(err, 'Gagal menambahkan pengguna'));
      throw err;
    }
  }, []);

  const deactivateUser = useCallback(async (id: string) => {
    try {
      const updated = await usersService.deactivateUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      message.success('Pengguna berhasil dinonaktifkan');
      return updated;
    } catch (err: unknown) {
      message.error(getApiErrorMessage(err, 'Gagal menonaktifkan pengguna'));
      throw err;
    }
  }, []);

  const activateUser = useCallback(async (id: string) => {
    try {
      const updated = await usersService.activateUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      message.success('Pengguna berhasil diaktifkan');
      return updated;
    } catch (err: unknown) {
      message.error(getApiErrorMessage(err, 'Gagal mengaktifkan pengguna'));
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await usersService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      message.success('Pengguna berhasil dihapus');
    } catch (err: unknown) {
      message.error(getApiErrorMessage(err, 'Gagal menghapus pengguna'));
      throw err;
    }
  }, []);

  return {
    users,
    paginatedData,
    loading,
    error,
    fetchUsers,
    fetchAllUsers,
    createUser,
    deactivateUser,
    activateUser,
    deleteUser,
  };
}

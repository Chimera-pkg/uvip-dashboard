import { useState, useEffect } from 'react';
import { usersService, type User } from '../api/users.service';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (data: { email: string; password: string; full_name: string; role: string }) => {
    try {
      const newUser = await usersService.createUser(data);
      setUsers([...users, newUser]);
      return newUser;
    } catch (err: any) {
      console.error('Create user error:', err);
      throw err;
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      const updated = await usersService.updateUser(id, data);
      setUsers(users.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err: any) {
      console.error('Update user error:', err);
      throw err;
    }
  };

  const deactivateUser = async (id: string) => {
    try {
      const updated = await usersService.deactivateUser(id);
      setUsers(users.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err: any) {
      console.error('Deactivate user error:', err);
      throw err;
    }
  };

  const activateUser = async (id: string) => {
    try {
      const updated = await usersService.activateUser(id);
      setUsers(users.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err: any) {
      console.error('Activate user error:', err);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await usersService.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      console.error('Delete user error:', err);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    deleteUser,
    refresh: fetchUsers,
  };
}

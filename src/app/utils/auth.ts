import { apiClient } from './api';
import { useAuthStore } from '../store/editorStore';

export const authUtils = {
  async register(email: string, password: string, name?: string) {
    try {
      const user = await apiClient.register({ email, password, name });
      localStorage.setItem('user', JSON.stringify(user));
      useAuthStore.getState().login(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error };
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await apiClient.login({ email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      apiClient.setToken(response.token);
      useAuthStore.getState().login(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error };
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiClient.setToken('');
    useAuthStore.getState().logout();
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      useAuthStore.getState().setUser(user);
      return user;
    }
    return null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  async checkAuth() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    if (token && user) {
      apiClient.setToken(token);
      useAuthStore.getState().login(user);
      return true;
    }
    return false;
  }
};

export async function register(email: string, password: string, name?: string) {
  const result = await authUtils.register(email, password, name);
  if (!result.success) {
    throw result.error instanceof Error ? result.error : new Error('Error al registrar usuario');
  }
  return result.user;
}

export async function login(email: string, password: string) {
  const result = await authUtils.login(email, password);
  if (!result.success) {
    throw result.error instanceof Error ? result.error : new Error('Error al iniciar sesion');
  }
  return result.user;
}

export function logout() {
  return authUtils.logout();
}

export function getCurrentUser() {
  return authUtils.getCurrentUser();
}

export function getToken() {
  return authUtils.getToken();
}

export function isAuthenticated() {
  return authUtils.isAuthenticated();
}

export async function checkAuth() {
  return authUtils.checkAuth();
}

export default authUtils;

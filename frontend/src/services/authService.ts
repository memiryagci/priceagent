import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export const authService = {
  // Kullanıcı kayıt
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  // Kullanıcı giriş
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Token ve user bilgilerini localStorage'a kaydet
  saveAuth(token: string, user: User) {
    // Önce tüm localStorage'ı temizle
    localStorage.clear();
    // Sonra yeni bilgileri kaydet
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Çıkış yap
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Tüm localStorage'ı temizle
    localStorage.clear();
    // Sayfayı yenile
    window.location.reload();
  },

  // Mevcut kullanıcı bilgilerini al
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.warn('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  },

  // Token var mı kontrol et
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

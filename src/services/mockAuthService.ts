import { User, AuthState } from '../types';
import { apiClient } from './apiClient';

let _usersCache: (User & { password: string })[] | null = null;
const getUsers = (): (User & { password: string })[] => {
  if (_usersCache) return _usersCache;
  const stored = localStorage.getItem('trimora_users_db');
  
  const defaultUsers = [
    { id: 'user-super-1', email: 'super@trimora', password: 'super@2026#', firstName: 'Super', lastName: 'Admin', phone: '+44 7700 111111', role: 'super_admin' as const, createdAt: '2021-01-15T00:00:00Z', updatedAt: '2021-01-15T00:00:00Z' },
    { id: 'user-owner-1', email: 'admin@trimora', password: 'saloon@2026#', firstName: 'Admin', lastName: 'Trimora', phone: '+44 7700 111111', role: 'owner' as const, businessId: 'trimora-salon', createdAt: '2021-01-15T00:00:00Z', updatedAt: '2021-01-15T00:00:00Z' },
    { id: 'u-staff-1', email: 'isabelle@trimora.co.uk', password: 'password123', firstName: 'Isabelle', lastName: 'Laurent', role: 'stylist' as const, businessId: 'trimora-salon', createdAt: '2021-03-01T00:00:00Z', updatedAt: '2021-03-01T00:00:00Z' },
  ];

  if (stored) {
    _usersCache = JSON.parse(stored);
    // Ensure super admin exists if we are migrating from old storage
    if (!_usersCache!.find(u => u.role === 'super_admin')) {
      _usersCache = [defaultUsers[0], ..._usersCache!];
      localStorage.setItem('trimora_users_db', JSON.stringify(_usersCache));
    }
  } else {
    _usersCache = defaultUsers;
    localStorage.setItem('trimora_users_db', JSON.stringify(_usersCache));
  }
  return _usersCache!;
};
const saveUsers = (users: (User & { password: string })[]) => {
  _usersCache = users;
  localStorage.setItem('trimora_users_db', JSON.stringify(users));
};

const STORAGE_KEY = 'trimora_auth';

let failedLoginAttempts = 0;
let lockoutUntil: Date | null = null;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Attempt Neon Backend Login first
    const remote = await apiClient.post<{ user: User; token: string }>('/auth/login', { email, password });
    if (remote && remote.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: remote.user, token: remote.token }));
      return remote;
    }

    await delay(800);
    
    // OWASP A07: Brute Force Protection
    if (lockoutUntil && new Date() < lockoutUntil) {
      const remainingMinutes = Math.ceil((lockoutUntil.getTime() - new Date().getTime()) / 60000);
      throw new Error(`Account locked due to too many failed attempts. Try again in ${remainingMinutes} minute(s).`);
    }

    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!found) {
      failedLoginAttempts += 1;
      if (failedLoginAttempts >= 5) {
        lockoutUntil = new Date(new Date().getTime() + 15 * 60000); // 15 mins lockout
        throw new Error('Too many failed attempts. Account locked for 15 minutes for security reasons.');
      }
      throw new Error('Invalid username or password');
    }
    
    failedLoginAttempts = 0; // reset on success
    lockoutUntil = null;

    const { password: _, ...user } = found;
    const token = `mock-token-${user.id}`;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    return { user, token };
  },

  async signup(data: { firstName: string; lastName: string; email: string; password: string; phone?: string; role?: 'customer' | 'owner' }): Promise<{ user: User; token: string }> {
    await delay(1000);
    const users = getUsers();
    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) throw new Error('An account with this email already exists');
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role || 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(data.role === 'owner' ? { businessId: 'trimora-salon' } : {})
    };
    const token = `mock-token-${newUser.id}`;
    saveUsers([...users, { ...newUser, password: data.password }]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: newUser, token }));
    return { user: newUser, token };
  },

  async createSalonOwner(email: string, password: string, businessId: string, firstName: string = 'Salon', lastName: string = 'Owner'): Promise<void> {
    await delay(300);
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered for another user');
    }
    const newUser: User = {
      id: `user-owner-${Date.now()}`,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: 'owner',
      businessId: businessId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveUsers([...users, { ...newUser, password }]);
  },

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem(STORAGE_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(200);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      const { user, token } = JSON.parse(stored);
      
      // Auto-sync with demo users to ensure name updates apply immediately
      const users = getUsers();
      const freshUser = users.find(u => u.id === user.id);
      if (freshUser) {
        const { password: _, ...userData } = freshUser;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token }));
        return userData;
      }
      
      return user;
    } catch {
      return null;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await delay(800);
    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('No account found with this email');
    // In production: send reset email
  },

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    await delay(800);
    // In production: verify token and update password
  },

  // Admin User Management
  async getAllUsers(): Promise<(User & { password?: string })[]> {
    await delay(300);
    const users = getUsers();
    
    // Filter by logged-in user's businessId and role
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { user } = JSON.parse(stored);
        if (user && user.businessId) {
          if (user.role === 'owner') {
            // Owner sees everyone in their salon (except super_admin)
            return users.filter(u => u.businessId === user.businessId && u.role !== 'super_admin');
          } else {
            // Staff/Managers only see themselves
            return users.filter(u => u.id === user.id);
          }
        }
      }
    } catch {}
    
    return users.filter(u => u.role !== 'super_admin');
  },

  async adminCreateUser(data: any): Promise<void> {
    await delay(300);
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }
    
    let businessId = 'trimora-salon';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { user } = JSON.parse(stored);
        if (user && user.businessId) businessId = user.businessId;
      }
    } catch {}

    const newUser: User & { password: string } = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName || '',
      role: data.role,
      businessId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
  },

  async adminUpdateUser(id: string, data: any): Promise<void> {
    await delay(300);
    const users = getUsers();
    saveUsers(users.map(u => {
      if (u.id === id) {
        return {
          ...u,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName || u.lastName,
          role: data.role,
          updatedAt: new Date().toISOString(),
          ...(data.password ? { password: data.password } : {})
        };
      }
      return u;
    }));
  },

  async adminDeleteUser(id: string): Promise<void> {
    await delay(300);
    const users = getUsers();
    saveUsers(users.filter(u => u.id !== id));
  }
};

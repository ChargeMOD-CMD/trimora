import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthState } from '../../types';
import { mockAuthService } from '../../services/mockAuthService';

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' };

const initialState: AuthState = { user: null, isAuthenticated: false, isLoading: true };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    case 'LOGIN': return { user: action.payload, isAuthenticated: true, isLoading: false };
    case 'LOGOUT': return { user: null, isAuthenticated: false, isLoading: false };
    default: return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  signup: (data: { firstName: string; lastName: string; email: string; password: string; phone?: string; role?: 'customer' | 'owner' }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const logout = useCallback(async () => {
    await mockAuthService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  useEffect(() => {
    mockAuthService.getCurrentUser().then((user: User | null) => {
      if (user) dispatch({ type: 'LOGIN', payload: user });
      else dispatch({ type: 'SET_LOADING', payload: false });
    });

    // OWASP A07: Automatically purge session state upon server 401 Unauthorized
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (email: string, password: string) => {
    const { user } = await mockAuthService.login(email, password);
    dispatch({ type: 'LOGIN', payload: user });
    return user;
  };

  const signup = async (data: Parameters<typeof mockAuthService.signup>[0]) => {
    const { user } = await mockAuthService.signup(data);
    dispatch({ type: 'LOGIN', payload: user });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function usePermission(requiredRoles: string[]) {
  const { user } = useAuth();
  if (!user) return false;
  return requiredRoles.includes(user.role);
}

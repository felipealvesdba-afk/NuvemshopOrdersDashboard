import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  updateProfile: (profileData: { name?: string; email?: string; avatar?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          // Verify token with backend
          const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const user = JSON.parse(userData);
            setUser(user);
            console.log('User authenticated:', user.email);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            console.log('Token verification failed, clearing storage');
          }
        } else {
          console.log('No token or user data found');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear storage on error
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', email);
      
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful:', data);
      
      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      setUser(data.user);
      console.log('User logged in successfully:', data.user.email);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'user'): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Attempting registration for:', email);
      
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      
      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      setUser(data.user);
      console.log('User registered successfully:', data.user.email);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: { name?: string; email?: string; avatar?: string }): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Updating profile:', profileData);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      console.log('Profile update response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile update failed:', errorData);
        throw new Error(errorData.message || 'Profile update failed');
      }

      const data = await response.json();
      console.log('Profile update successful:', data);
      
      // Update user in context and localStorage
      setUser(data.user);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Changing password...');
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      console.log('Password change response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Password change failed:', errorData);
        throw new Error(errorData.message || 'Password change failed');
      }

      const data = await response.json();
      console.log('Password change successful:', data);
      
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Deleting account...');
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      console.log('Account deletion response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Account deletion failed:', errorData);
        throw new Error(errorData.message || 'Account deletion failed');
      }

      const data = await response.json();
      console.log('Account deletion successful:', data);
      
      // Clear local storage and logout
      logout();
      
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Clear user state
    setUser(null);
    
    // Optional: Call logout endpoint to invalidate token on server
    fetch(import.meta.env.VITE_API_URL + '/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      }
    }).catch(error => {
      console.error('Logout error:', error);
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    updateProfile,
    changePassword,
    deleteAccount,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

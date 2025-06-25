import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType: 'personal' | 'company' | 'employee';
  companyId?: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (email: string, password: string) => {
    // TODO: Implement actual authentication
    // For now, mock successful login
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser({
          id: '1',
          email,
          firstName: 'John',
          lastName: 'Doe',
          accountType: 'personal',
        });
        resolve();
      }, 1000);
    });
  };

  const signUp = async (userData: any) => {
    // TODO: Implement actual signup
    // For now, mock successful signup
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser({
          id: '1',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          accountType: userData.accountType || 'personal',
        });
        resolve();
      }, 1000);
    });
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
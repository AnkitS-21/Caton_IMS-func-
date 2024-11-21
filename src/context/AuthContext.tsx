import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  userId: string | null; // Add userId to the context type
  login: (id: string) => void; // Update login to accept userId
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Login updates isLoggedIn and stores the userId
  const login = (id: string) => {
    setIsLoggedIn(true);
    setUserId(id);
  };

  // Logout clears isLoggedIn and userId
  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    localStorage.removeItem('user_id'); // Clear userId from localStorage
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

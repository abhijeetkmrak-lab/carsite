"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserProfile {
  email: string;
  mobile?: string;
  city?: string;
  carModel?: string;
  yearOfManufacture?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthModalOpen: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (profile: UserProfile & { password: string }) => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Persistence check
  useEffect(() => {
    const savedUser = localStorage.getItem("zenith_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock validation & delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (email && password.length >= 6) {
      const userData = { email };
      setUser(userData);
      localStorage.setItem("zenith_user", JSON.stringify(userData));
      setIsAuthModalOpen(false);
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const signup = async (profile: UserProfile & { password: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { password, ...userData } = profile;
    if (userData.email && password.length >= 6) {
      setUser(userData);
      localStorage.setItem("zenith_user", JSON.stringify(userData));
      setIsAuthModalOpen(false);
    } else {
      throw new Error("Signup failed");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("zenith_user");
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        login,
        signup,
        logout,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

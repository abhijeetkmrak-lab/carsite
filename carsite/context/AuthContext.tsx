"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  uid?: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  city?: string;
  carName?: string;
  carYear?: string;
  visitCount?: number;
  renderCount?: number;
  hasSavedPhoto?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (profile: Omit<UserProfile, "visitCount" | "renderCount"> & { password: string }) => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  updateUserStats: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUser({ ...data, uid: firebaseUser.uid });
            
            // Increment visit count safely
            updateDoc(docRef, { visitCount: increment(1) }).catch(e => console.error("Visit tracking failed", e));
          } else {
            setUser({ email: firebaseUser.email || "", uid: firebaseUser.uid });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth Sync Error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login Error:", error.message);
      throw error;
    }
  };

  const signup = async (profile: Omit<UserProfile, "visitCount" | "renderCount"> & { password: string }) => {
    const { password, ...userData } = profile;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
      const fullProfile = {
        ...userData,
        visitCount: 1,
        renderCount: 0,
        hasSavedPhoto: false
      };
      await setDoc(doc(db, "users", userCredential.user.uid), fullProfile);
    } catch (error: any) {
      console.error("Signup Error:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout Error:", error.message);
    }
  };

  const updateUserStats = async (data: Partial<UserProfile>) => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, data);
      // Update local state if needed (optional since onAuthStateChanged might not trigger on simple doc update)
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Update Stats Error:", error);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        login,
        signup,
        logout,
        openAuthModal,
        closeAuthModal,
        updateUserStats,
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

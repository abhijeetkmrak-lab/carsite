"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  mobile?: string;
  city?: string;
  carModel?: string;
  yearOfManufacture?: string;
  visitCount: number;
  renderCount: number;
  hasSavedPhoto: boolean;
  createdAt: any;
  lastVisit: any;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  incrementRenderCount: () => Promise<void>;
  trackPhotoSave: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // Update visit count on new session
            await updateDoc(userRef, {
              visitCount: increment(1),
              lastVisit: serverTimestamp()
            });
            
            const updatedData = (await getDoc(userRef)).data() as UserProfile;
            setUser({ ...updatedData, uid: firebaseUser.uid });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    setIsAuthModalOpen(false);
  };

  const signup = async (data: any) => {
    const { email, password, mobile, city, carModel, yearOfManufacture } = data;
    const res = await createUserWithEmailAndPassword(auth, email, password);
    
    const profileData = {
      email,
      mobile,
      city,
      carModel,
      yearOfManufacture,
      visitCount: 1,
      renderCount: 0,
      hasSavedPhoto: false,
      createdAt: serverTimestamp(),
      lastVisit: serverTimestamp(),
    };

    await setDoc(doc(db, "users", res.user.uid), profileData);
    setUser({ ...profileData, uid: res.user.uid } as UserProfile);
    setIsAuthModalOpen(false);
  };

  const incrementRenderCount = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      renderCount: increment(1)
    });
    setUser(prev => prev ? { ...prev, renderCount: prev.renderCount + 1 } : null);
  };

  const trackPhotoSave = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      hasSavedPhoto: true
    });
    setUser(prev => prev ? { ...prev, hasSavedPhoto: true } : null);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
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
        incrementRenderCount,
        trackPhotoSave
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

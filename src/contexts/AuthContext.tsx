'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isEmailAuthorized, getUserDisplayName, getUserRole } from '@/config/authorized-users';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthorized: boolean;
  displayName: string;
  userRole: 'Aymeric' | 'Sarah' | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthorized = isEmailAuthorized(user?.email);
  const displayName = getUserDisplayName(user?.email);
  const userRole = getUserRole(user?.email);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Vérifier si l'email est autorisé
      if (!isEmailAuthorized(result.user.email)) {
        await firebaseSignOut(auth);
        throw new Error('Votre adresse email n\'est pas autorisée à accéder à cette application.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);

      // Vérifier si l'email est autorisé avant même de tenter la connexion
      if (!isEmailAuthorized(email)) {
        throw new Error('Votre adresse email n\'est pas autorisée à accéder à cette application.');
      }

      const result = await signInWithEmailAndPassword(auth, email, password);

      // Double vérification
      if (!isEmailAuthorized(result.user.email)) {
        await firebaseSignOut(auth);
        throw new Error('Votre adresse email n\'est pas autorisée à accéder à cette application.');
      }
    } catch (err: any) {
      // Gestion des erreurs Firebase
      let errorMessage = 'Erreur lors de la connexion';

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'Ce compte a été désactivé';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la déconnexion');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    isAuthorized,
    displayName,
    userRole,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

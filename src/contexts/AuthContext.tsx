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
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  displayName: string;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utiliser le displayName du profil ou de Firebase
  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Utilisateur';

  // Créer ou charger le profil utilisateur
  const loadOrCreateProfile = async (firebaseUser: User) => {
    try {
      const profileRef = doc(db, 'profiles', firebaseUser.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        // Profil existe, le charger
        const data = profileSnap.data();
        const userProfile: UserProfile = {
          uid: profileSnap.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          prenom: data.prenom,
          nom: data.nom,
          telephone: data.telephone,
          salaireMensuel: data.salaireMensuel,
          categoriesBudget: data.categoriesBudget,
          subscription: data.subscription ? {
            plan: data.subscription.plan,
            status: data.subscription.status,
            startDate: data.subscription.startDate?.toDate(),
            endDate: data.subscription.endDate?.toDate(),
            trialEndDate: data.subscription.trialEndDate?.toDate(),
          } : {
            plan: 'free',
            status: 'active',
            startDate: new Date(),
          },
          preferences: data.preferences || {
            theme: 'light',
            notifications: true,
            language: 'fr',
          },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: new Date(),
        };

        // Mettre à jour la dernière connexion
        await updateDoc(profileRef, {
          lastLoginAt: serverTimestamp(),
        });

        setProfile(userProfile);
        console.log('✅ Profil chargé pour:', firebaseUser.email);
      } else {
        // Profil n'existe pas, le créer
        const newProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
          photoURL: firebaseUser.photoURL || undefined,
          subscription: {
            plan: 'free',
            status: 'active',
          },
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'fr',
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        };

        await setDoc(profileRef, newProfile);

        setProfile({
          ...newProfile,
          subscription: {
            plan: 'free',
            status: 'active',
            startDate: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
        } as UserProfile);

        console.log('✅ Nouveau profil créé pour:', firebaseUser.email);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement/création du profil:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await loadOrCreateProfile(firebaseUser);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
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
      setProfile(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la déconnexion');
      throw err;
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const profileRef = doc(db, 'profiles', user.uid);

      // Préparer les données pour Firebase (sans les dates)
      const dataToUpdate: any = { ...updates };
      delete dataToUpdate.uid;
      delete dataToUpdate.email;
      delete dataToUpdate.createdAt;
      delete dataToUpdate.lastLoginAt;

      await updateDoc(profileRef, {
        ...dataToUpdate,
        updatedAt: serverTimestamp(),
      });

      // Mettre à jour l'état local
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...updates,
          updatedAt: new Date(),
        };
      });

      console.log('✅ Profil mis à jour');
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour du profil:', err);
      throw err;
    }
  };

  const value = {
    user,
    profile,
    loading,
    displayName,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    error,
    updateProfile: updateProfileData,
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

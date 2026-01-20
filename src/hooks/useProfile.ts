import { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';
import { User } from 'firebase/auth';

export const useProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const loadOrCreateProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const profileRef = doc(db, 'profiles', user.uid);
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
            } : undefined,
            preferences: data.preferences,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
          };

          // Mettre à jour la dernière connexion
          await updateDoc(profileRef, {
            lastLoginAt: serverTimestamp(),
          });

          setProfile(userProfile);
        } else {
          // Profil n'existe pas, le créer
          const newProfile: Partial<UserProfile> = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
            photoURL: user.photoURL || undefined,
            subscription: {
              plan: 'free',
              status: 'active',
              startDate: new Date(),
            },
            preferences: {
              theme: 'light',
              notifications: true,
              language: 'fr',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date(),
          };

          await setDoc(profileRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });

          setProfile(newProfile as UserProfile);
          console.log('✅ Nouveau profil créé pour:', user.email);
        }
      } catch (err) {
        console.error('Erreur lors du chargement/création du profil:', err);
        setError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    loadOrCreateProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
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
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      throw err;
    }
  };

  const updateDisplayName = async (newDisplayName: string): Promise<void> => {
    await updateProfile({ displayName: newDisplayName });
  };

  const updateBudget = async (
    salaireMensuel: number,
    categoriesBudget: any[]
  ): Promise<void> => {
    await updateProfile({ salaireMensuel, categoriesBudget });
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateDisplayName,
    updateBudget,
  };
};

import { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, BudgetCategory } from '@/types';

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: '1', nom: 'Loyer', pourcentage: 33, couleur: '#3B82F6' },
  { id: '2', nom: 'Épargne', pourcentage: 20, couleur: '#10B981' },
  { id: '3', nom: 'Loisirs', pourcentage: 15, couleur: '#F59E0B' },
  { id: '4', nom: 'Courses', pourcentage: 15, couleur: '#EF4444' },
  { id: '5', nom: 'Autre', pourcentage: 17, couleur: '#6B7280' },
];

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, displayName } = useAuth();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const profileRef = doc(db, 'profiles', user.uid);

    const unsubscribe = onSnapshot(
      profileRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            ...data,
            uid: docSnap.id,
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as UserProfile);
        } else {
          // Initialiser un profil par défaut si inexistant
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: displayName || '',
            salaireMensuel: 0,
            categoriesBudget: DEFAULT_CATEGORIES,
            updatedAt: new Date(),
          };
          setProfile(newProfile);
          // On ne le sauvegarde pas tout de suite pour éviter des écritures inutiles
        }
        setLoading(false);
      },
      (err) => {
        console.error('Erreur lors de la récupération du profil:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, displayName]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, {
        ...profile,
        ...data,
        uid: user.uid,
        updatedAt: Timestamp.now(),
      }, { merge: true });
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      throw err;
    }
  };

  return { profile, loading, error, updateProfile };
}

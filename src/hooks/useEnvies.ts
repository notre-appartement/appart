// Hook exemple pour gérer les envies avec l'authentification
// Ce fichier montre comment utiliser Firebase avec l'utilisateur connecté

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Envie } from '@/types';

export function useEnvies() {
  const [envies, setEnvies] = useState<Envie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, displayName, userRole } = useAuth();

  // Écouter les changements en temps réel
  useEffect(() => {
    const q = query(collection(db, 'envies'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const enviesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Envie[];

        setEnvies(enviesData);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur lors de la récupération des envies:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Ajouter une envie (avec l'auteur automatique)
  const addEnvie = async (data: {
    nom: string;
    definition: string;
    important: boolean;
    auteur: 'Aymeric' | 'Sarah' | 'les_deux';
  }) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour ajouter une envie');
    }

    try {
      await addDoc(collection(db, 'envies'), {
        ...data,
        auteurNom: displayName,     // Nom de l'utilisateur connecté
        auteurEmail: user.email,    // Email de l'utilisateur
        createdBy: user.uid,        // UID Firebase
        createdAt: Timestamp.now(), // Timestamp Firebase
      });
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout de l\'envie:', err);
      throw err;
    }
  };

  // Modifier une envie
  const updateEnvie = async (id: string, data: Partial<Envie>) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour modifier une envie');
    }

    try {
      const envieRef = doc(db, 'envies', id);
      await updateDoc(envieRef, data);
    } catch (err: any) {
      console.error('Erreur lors de la modification de l\'envie:', err);
      throw err;
    }
  };

  // Supprimer une envie
  const deleteEnvie = async (id: string) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour supprimer une envie');
    }

    try {
      await deleteDoc(doc(db, 'envies', id));
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l\'envie:', err);
      throw err;
    }
  };

  return {
    envies,
    loading,
    error,
    addEnvie,
    updateEnvie,
    deleteEnvie,
  };
}

// Hook pour gérer les emplacements avec Firebase
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
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { Emplacement } from '@/types';

export function useEmplacements() {
  const [emplacements, setEmplacements] = useState<Emplacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, displayName } = useAuth();
  const { currentProject } = useProject();

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!currentProject) {
      setEmplacements([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'emplacements'),
      where('projectId', '==', currentProject.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const emplacementsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Emplacement[];

        setEmplacements(emplacementsData);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur lors de la récupération des emplacements:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentProject]);

  // Ajouter un emplacement
  const addEmplacement = async (data: Omit<Emplacement, 'id' | 'createdAt' | 'createdBy' | 'createdByName' | 'projectId'>) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour ajouter un emplacement');
    }

    if (!currentProject) {
      throw new Error('Aucun projet actif');
    }

    try {
      await addDoc(collection(db, 'emplacements'), {
        ...data,
        projectId: currentProject.id,
        createdBy: user.uid,
        createdByName: displayName,
        createdAt: Timestamp.now(),
      });
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout de l\'emplacement:', err);
      throw err;
    }
  };

  // Modifier un emplacement
  const updateEmplacement = async (id: string, data: Partial<Emplacement>) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour modifier un emplacement');
    }

    try {
      const emplacementRef = doc(db, 'emplacements', id);
      await updateDoc(emplacementRef, data);
    } catch (err: any) {
      console.error('Erreur lors de la modification de l\'emplacement:', err);
      throw err;
    }
  };

  // Supprimer un emplacement
  const deleteEmplacement = async (id: string) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour supprimer un emplacement');
    }

    try {
      await deleteDoc(doc(db, 'emplacements', id));
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l\'emplacement:', err);
      throw err;
    }
  };

  return {
    emplacements,
    loading,
    error,
    addEmplacement,
    updateEmplacement,
    deleteEmplacement,
  };
}

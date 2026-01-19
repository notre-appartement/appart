// Hook pour gérer les appartements avec Firebase
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
import { Appartement } from '@/types';

export function useAppartements() {
  const [appartements, setAppartements] = useState<Appartement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, displayName } = useAuth();
  const { currentProject } = useProject();

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!currentProject) {
      setAppartements([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'appartements'),
      where('projectId', '==', currentProject.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appartementsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            dateVisite: data.dateVisite ? data.dateVisite.toDate() : undefined,
          };
        }) as Appartement[];

        setAppartements(appartementsData);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur lors de la récupération des appartements:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentProject]);

  // Ajouter un appartement
  const addAppartement = async (data: Omit<Appartement, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName' | 'projectId'>) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour ajouter un appartement');
    }

    if (!currentProject) {
      throw new Error('Aucun projet actif');
    }

    try {
      await addDoc(collection(db, 'appartements'), {
        ...data,
        projectId: currentProject.id,
        createdBy: user.uid,
        createdByName: displayName,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout de l\'appartement:', err);
      throw err;
    }
  };

  // Modifier un appartement
  const updateAppartement = async (id: string, data: Partial<Appartement>) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour modifier un appartement');
    }

    try {
      const appartementRef = doc(db, 'appartements', id);
      await updateDoc(appartementRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (err: any) {
      console.error('Erreur lors de la modification de l\'appartement:', err);
      throw err;
    }
  };

  // Supprimer un appartement
  const deleteAppartement = async (id: string) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour supprimer un appartement');
    }

    try {
      await deleteDoc(doc(db, 'appartements', id));
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l\'appartement:', err);
      throw err;
    }
  };

  return {
    appartements,
    loading,
    error,
    addAppartement,
    updateAppartement,
    deleteAppartement,
  };
}

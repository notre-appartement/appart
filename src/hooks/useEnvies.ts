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
import { Envie } from '@/types';

export function useEnvies() {
  const [envies, setEnvies] = useState<Envie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, displayName } = useAuth();
  const { currentProject } = useProject();

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!currentProject) {
      setEnvies([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'envies'),
      where('projectId', '==', currentProject.id),
      orderBy('createdAt', 'desc')
    );

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
  }, [currentProject]);

  // Ajouter une envie (avec l'auteur automatique)
  const addEnvie = async (data: {
    nom: string;
    definition: string;
    important: boolean;
    auteur: string;
  }) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour ajouter une envie');
    }

    if (!currentProject) {
      throw new Error('Aucun projet actif');
    }

    try {
      await addDoc(collection(db, 'envies'), {
        ...data,
        projectId: currentProject.id,
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

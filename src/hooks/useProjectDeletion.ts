import { useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export type DeletionMode = 'permanent' | 'archive' | 'anonymize';

export const useProjectDeletion = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  /**
   * Archive un projet (suppression douce - 30 jours de grâce)
   */
  const archiveProject = async (projectId: string): Promise<void> => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const projectRef = doc(db, 'projets', projectId);
      const deleteAfter = new Date();
      deleteAfter.setDate(deleteAfter.getDate() + 30); // 30 jours

      await updateDoc(projectRef, {
        archived: true,
        archivedAt: serverTimestamp(),
        archivedBy: user.uid,
        deleteAfter: Timestamp.fromDate(deleteAfter),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Projet archivé avec succès (30 jours de grâce)');
    } catch (error) {
      console.error('❌ Erreur lors de l\'archivage du projet:', error);
      throw error;
    }
  };

  /**
   * Anonymise les appartements d'un projet pour les statistiques
   */
  const anonymizeAppartements = async (projectId: string): Promise<number> => {
    try {
      const appartementsRef = collection(db, 'appartements');
      const q = query(appartementsRef, where('projectId', '==', projectId));
      const snapshot = await getDocs(q);

      const batch = writeBatch(db);
      let count = 0;

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();

        // Données à conserver (utiles pour stats)
        const anonymizedData = {
          // Localisation et prix (pour stats de marché)
          adresse: data.adresse,
          ville: data.ville,
          codePostal: data.codePostal,
          prix: data.prix,
          charges: data.charges || null,
          surface: data.surface,
          pieces: data.pieces,
          chambres: data.chambres,
          latitude: data.latitude || null,
          longitude: data.longitude || null,

          // Données générales (anonymisées)
          etage: data.etage || null,
          ascenseur: data.ascenseur || null,
          meuble: data.meuble || null,

          // SUPPRESSION des données personnelles
          titre: 'Appartement anonymisé',
          description: null,
          photos: [],
          documents: [],
          avantages: [],
          inconvenients: [],
          checklistId: null,
          lienAnnonce: null,
          agence: null,
          contactAgence: null,
          notes: null,
          noteGlobale: null,
          visite: false,
          dateVisite: null,
          choix: null,

          // Marquage anonymisation
          projectId: 'anonymous',
          createdBy: 'anonymous',
          createdByName: 'Anonyme',
          anonymized: true,
          anonymizedAt: serverTimestamp(),
          availableForStats: true,
          updatedAt: serverTimestamp(),
        };

        batch.update(doc(db, 'appartements', docSnap.id), anonymizedData);
        count++;
      });

      await batch.commit();
      console.log(`✅ ${count} appartements anonymisés pour statistiques`);
      return count;
    } catch (error) {
      console.error('❌ Erreur lors de l\'anonymisation:', error);
      throw error;
    }
  };

  /**
   * Supprime définitivement toutes les données d'un projet
   */
  const deleteProjectData = async (
    projectId: string,
    deleteAppartements: boolean = true
  ): Promise<void> => {
    try {
      const batch = writeBatch(db);
      let totalDeleted = 0;

      // 1. Supprimer les envies (toujours - trop personnelles)
      const enviesRef = collection(db, 'envies');
      const enviesQuery = query(enviesRef, where('projectId', '==', projectId));
      const enviesSnapshot = await getDocs(enviesQuery);
      enviesSnapshot.docs.forEach((docSnap) => {
        batch.delete(doc(db, 'envies', docSnap.id));
        totalDeleted++;
      });

      // 2. Supprimer les emplacements
      const emplacementsRef = collection(db, 'emplacements');
      const emplacementsQuery = query(emplacementsRef, where('projectId', '==', projectId));
      const emplacementsSnapshot = await getDocs(emplacementsQuery);
      emplacementsSnapshot.docs.forEach((docSnap) => {
        batch.delete(doc(db, 'emplacements', docSnap.id));
        totalDeleted++;
      });

      // 3. Supprimer les appartements (si demandé)
      if (deleteAppartements) {
        const appartementsRef = collection(db, 'appartements');
        const appartementsQuery = query(appartementsRef, where('projectId', '==', projectId));
        const appartementsSnapshot = await getDocs(appartementsQuery);

        // Supprimer les checklists associées
        for (const docSnap of appartementsSnapshot.docs) {
          const appartData = docSnap.data();
          if (appartData.checklistId) {
            batch.delete(doc(db, 'checklists', appartData.checklistId));
          }
          batch.delete(doc(db, 'appartements', docSnap.id));
          totalDeleted++;
        }
      }

      // 4. Supprimer le projet lui-même
      batch.delete(doc(db, 'projets', projectId));

      await batch.commit();
      console.log(`✅ ${totalDeleted} documents supprimés + projet`);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      throw error;
    }
  };

  /**
   * Fonction principale : supprimer un projet selon le mode choisi
   */
  const deleteProject = async (
    projectId: string,
    mode: DeletionMode
  ): Promise<{ success: boolean; message: string; anonymizedCount?: number }> => {
    setLoading(true);

    try {
      switch (mode) {
        case 'archive':
          // Suppression douce - archivage 30 jours
          await archiveProject(projectId);
          return {
            success: true,
            message: 'Projet archivé. Vous avez 30 jours pour le restaurer.'
          };

        case 'anonymize':
          // Anonymiser les appartements puis supprimer le reste
          const anonymizedCount = await anonymizeAppartements(projectId);
          await deleteProjectData(projectId, false); // Ne pas supprimer les appartements
          return {
            success: true,
            message: `${anonymizedCount} appartements anonymisés et conservés pour statistiques. Le reste a été supprimé.`,
            anonymizedCount
          };

        case 'permanent':
          // Suppression définitive complète
          await deleteProjectData(projectId, true);
          return {
            success: true,
            message: 'Projet et toutes ses données supprimés définitivement.'
          };

        default:
          throw new Error('Mode de suppression invalide');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      return {
        success: false,
        message: 'Erreur lors de la suppression du projet.'
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Restaurer un projet archivé
   */
  const restoreProject = async (projectId: string): Promise<void> => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const projectRef = doc(db, 'projets', projectId);
      await updateDoc(projectRef, {
        archived: false,
        archivedAt: null,
        archivedBy: null,
        deleteAfter: null,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Projet restauré avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error);
      throw error;
    }
  };

  return {
    deleteProject,
    restoreProject,
    loading,
  };
};

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Projet, ProjetMembre } from '@/types';

// Générer un code d'invitation unique
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function useProjects() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, displayName } = useAuth();

  // Écouter tous les projets et filtrer côté client
  // (nécessaire car array-contains ne fonctionne pas avec des objets complexes)
  useEffect(() => {
    if (!user) {
      setProjets([]);
      setLoading(false);
      return;
    }

    // Utiliser array-contains sur membresUids pour filtrer côté serveur
    const q = query(
      collection(db, 'projets'),
      where('membresUids', 'array-contains', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allProjetsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            membres: data.membres?.map((m: any) => ({
              ...m,
              joinedAt: m.joinedAt?.toDate() || new Date(),
            })) || [],
          } as Projet;
        });

        // Le filtrage est maintenant fait côté serveur via membresUids
        setProjets(allProjetsData);
        setLoading(false);
      },
      (err) => {
        // Ignorer les erreurs "permission-denied" transitoires (causées par React StrictMode en dev)
        if (err.code !== 'permission-denied') {
          console.error('Erreur lors de la récupération des projets:', err);
          setError(err.message);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Créer un nouveau projet
  const createProjet = async (nom: string, description?: string): Promise<string> => {
    if (!user) throw new Error('Vous devez être connecté');

    try {
      const inviteCode = generateInviteCode();
      const membre: ProjetMembre = {
        uid: user.uid,
        name: displayName || user.email || 'Utilisateur',
        email: user.email || '',
        isAdmin: true, // Le créateur est toujours admin
        joinedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'projets'), {
        nom,
        description: description || '',
        createurId: user.uid,
        createurName: displayName || user.email,
        membres: [membre],
        // Champs pour les règles Firestore (tableaux simples de UIDs)
        membresUids: [user.uid],
        adminsUids: [user.uid],
        inviteCode,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (err: any) {
      console.error('Erreur lors de la création du projet:', err);
      throw err;
    }
  };

  // Rejoindre un projet avec un code d'invitation
  const joinProjet = async (inviteCode: string): Promise<string> => {
    if (!user) throw new Error('Vous devez être connecté');

    try {
      // Chercher le projet avec ce code d'invitation
      const q = query(
        collection(db, 'projets'),
        where('inviteCode', '==', inviteCode.toUpperCase())
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Code d\'invitation invalide');
      }

      const projetDoc = snapshot.docs[0];
      const projetData = projetDoc.data() as Projet;

      // Vérifier si l'utilisateur est déjà membre
      const dejaMembre = projetData.membres.some(m => m.uid === user.uid);
      if (dejaMembre) {
        return projetDoc.id; // Déjà membre, on retourne juste l'ID
      }

      // Ajouter l'utilisateur comme membre
      const nouveauMembre: ProjetMembre = {
        uid: user.uid,
        name: displayName || user.email || 'Utilisateur',
        email: user.email || '',
        isAdmin: false, // Les nouveaux membres ne sont pas admin par défaut
        joinedAt: new Date(),
      };

      // Mettre à jour membres et membresUids
      const newMembresUids = [...(projetData.membresUids || []), user.uid];

      await updateDoc(doc(db, 'projets', projetDoc.id), {
        membres: [...projetData.membres, nouveauMembre],
        membresUids: newMembresUids,
        updatedAt: Timestamp.now(),
      });

      return projetDoc.id;
    } catch (err: any) {
      console.error('Erreur lors de la jonction au projet:', err);
      throw err;
    }
  };

  // Récupérer un projet par ID
  const getProjet = async (projetId: string): Promise<Projet | null> => {
    try {
      const docRef = doc(db, 'projets', projetId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        membres: data.membres?.map((m: any) => ({
          ...m,
          joinedAt: m.joinedAt?.toDate() || new Date(),
        })) || [],
      } as Projet;
    } catch (err) {
      console.error('Erreur lors de la récupération du projet:', err);
      return null;
    }
  };

  // Mettre à jour un projet
  const updateProjet = async (projetId: string, data: Partial<Projet>) => {
    if (!user) throw new Error('Vous devez être connecté');

    try {
      await updateDoc(doc(db, 'projets', projetId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du projet:', err);
      throw err;
    }
  };

  // Supprimer un projet
  const deleteProjet = async (projetId: string) => {
    if (!user) throw new Error('Vous devez être connecté');

    try {
      await deleteDoc(doc(db, 'projets', projetId));
    } catch (err: any) {
      console.error('Erreur lors de la suppression du projet:', err);
      throw err;
    }
  };

  // Quitter un projet
  const leaveProjet = async (projetId: string) => {
    if (!user) throw new Error('Vous devez être connecté');

    try {
      const projet = await getProjet(projetId);
      if (!projet) throw new Error('Projet introuvable');

      const newMembres = projet.membres.filter(m => m.uid !== user.uid);

      // Si c'est le dernier membre, supprimer le projet
      if (newMembres.length === 0) {
        await deleteProjet(projetId);
      } else {
        // Mettre à jour membresUids et adminsUids
        const newMembresUids = newMembres.map(m => m.uid);
        const newAdminsUids = newMembres.filter(m => m.isAdmin).map(m => m.uid);

        await updateDoc(doc(db, 'projets', projetId), {
          membres: newMembres,
          membresUids: newMembresUids,
          adminsUids: newAdminsUids,
          updatedAt: Timestamp.now(),
        });
      }
    } catch (err: any) {
      console.error('Erreur lors de la sortie du projet:', err);
      throw err;
    }
  };

  // Supprimer un membre (admin uniquement)
  const removeMembre = async (projetId: string, membreUid: string) => {
    if (!user) throw new Error('Vous devez être connecté');

    try {
      const projet = await getProjet(projetId);
      if (!projet) throw new Error('Projet introuvable');

      // Vérifier que l'utilisateur est admin
      const currentMembre = projet.membres.find(m => m.uid === user.uid);
      if (!currentMembre?.isAdmin) {
        throw new Error('Seuls les administrateurs peuvent supprimer des membres');
      }

      const newMembres = projet.membres.filter(m => m.uid !== membreUid);
      const newMembresUids = newMembres.map(m => m.uid);
      const newAdminsUids = newMembres.filter(m => m.isAdmin).map(m => m.uid);

      await updateDoc(doc(db, 'projets', projetId), {
        membres: newMembres,
        membresUids: newMembresUids,
        adminsUids: newAdminsUids,
        updatedAt: Timestamp.now(),
      });
    } catch (err: any) {
      console.error('Erreur lors de la suppression du membre:', err);
      throw err;
    }
  };

  // Changer le statut admin d'un membre (admin uniquement)
  const toggleAdminStatus = async (projetId: string, membreUid: string) => {
    if (!user) throw new Error('Vous devez être connecté');

    try {
      const projet = await getProjet(projetId);
      if (!projet) throw new Error('Projet introuvable');

      // Vérifier que l'utilisateur est admin
      const currentMembre = projet.membres.find(m => m.uid === user.uid);
      if (!currentMembre?.isAdmin) {
        throw new Error('Seuls les administrateurs peuvent modifier les rôles');
      }

      const newMembres = projet.membres.map(m =>
        m.uid === membreUid ? { ...m, isAdmin: !m.isAdmin } : m
      );
      const newAdminsUids = newMembres.filter(m => m.isAdmin).map(m => m.uid);

      await updateDoc(doc(db, 'projets', projetId), {
        membres: newMembres,
        adminsUids: newAdminsUids,
        updatedAt: Timestamp.now(),
      });
    } catch (err: any) {
      console.error('Erreur lors du changement de rôle:', err);
      throw err;
    }
  };

  return {
    projets,
    loading,
    error,
    createProjet,
    joinProjet,
    getProjet,
    updateProjet,
    deleteProjet,
    leaveProjet,
    removeMembre,
    toggleAdminStatus,
  };
}

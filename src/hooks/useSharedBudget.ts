import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';
import { useProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';

export function useSharedBudget() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSalaire, setTotalSalaire] = useState(0);
  const [loyerMaxPourcentage, setLoyerMaxPourcentage] = useState(33);
  const { currentProject } = useProject();
  const { profile: currentUserProfile } = useAuth();

  useEffect(() => {
    if (!currentProject) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    // Récupérer les profils des membres du projet
    const fetchMemberProfiles = async () => {
      try {
        const memberUids = currentProject.membres.map(m => m.uid);
        const profilesData: UserProfile[] = [];

        // Récupérer chaque profil individuellement (respecte les règles Firestore)
        for (const uid of memberUids) {
          try {
            const profileRef = doc(db, 'profiles', uid);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              profilesData.push({
                ...profileSnap.data(),
                uid: profileSnap.id,
              } as UserProfile);
            }
          } catch (err) {
            // Ignorer les erreurs de permission pour les profils des autres membres
            // On utilisera les infos du projet à la place
            const membre = currentProject.membres.find(m => m.uid === uid);
            if (membre) {
              profilesData.push({
                uid: membre.uid,
                displayName: membre.name,
                email: membre.email,
                salaireMensuel: 0,
              } as UserProfile);
            }
          }
        }

        setProfiles(profilesData);

        const total = profilesData.reduce((sum, p) => sum + (p.salaireMensuel || 0), 0);
        setTotalSalaire(total);

        // On cherche une catégorie "Loyer" dans le profil de l'utilisateur courant
        let pct = 33;
        if (currentUserProfile?.categoriesBudget) {
          const loyerCat = currentUserProfile.categoriesBudget.find(c =>
            c.nom.toLowerCase().includes('loyer')
          );
          if (loyerCat) {
            pct = loyerCat.pourcentage;
          }
        }
        setLoyerMaxPourcentage(pct);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des profils:', err);
        setLoading(false);
      }
    };

    fetchMemberProfiles();
  }, [currentProject, currentUserProfile]);

  const budgetLoyerMax = totalSalaire * (loyerMaxPourcentage / 100);

  return {
    totalSalaire,
    loyerMaxPourcentage,
    budgetLoyerMax,
    profiles,
    loading
  };
}

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types';

export function useSharedBudget() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSalaire, setTotalSalaire] = useState(0);
  const [loyerMaxPourcentage, setLoyerMaxPourcentage] = useState(33);

  useEffect(() => {
    const q = collection(db, 'profiles');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const profilesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id,
      })) as UserProfile[];
      
      setProfiles(profilesData);
      
      const total = profilesData.reduce((sum, p) => sum + (p.salaireMensuel || 0), 0);
      setTotalSalaire(total);

      // On cherche une catégorie "Loyer" dans l'un des profils
      let pct = 33;
      for (const profile of profilesData) {
        const loyerCat = profile.categoriesBudget?.find(c => 
          c.nom.toLowerCase().includes('loyer')
        );
        if (loyerCat) {
          pct = loyerCat.pourcentage;
          break; // On prend le premier trouvé
        }
      }
      setLoyerMaxPourcentage(pct);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const budgetLoyerMax = totalSalaire * (loyerMaxPourcentage / 100);

  return { 
    totalSalaire, 
    loyerMaxPourcentage, 
    budgetLoyerMax, 
    profiles,
    loading 
  };
}

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Projet, UserProfile } from '@/types';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/config/subscription-plans';

/**
 * Hook pour obtenir les limites d'un projet basées sur le meilleur plan des membres
 *
 * Logique : Si au moins un membre a Premium/Pro, tout le projet bénéficie de ces limites
 */
export const useProjectLimits = (projet: Projet | null) => {
  const [projectPlan, setProjectPlan] = useState<SubscriptionPlan>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projet) {
      setProjectPlan('free');
      setLoading(false);
      return;
    }

    // Récupérer les UIDs de tous les membres du projet
    const memberUids = projet.membres.map(m => m.uid);

    if (memberUids.length === 0) {
      setProjectPlan('free');
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fonction pour calculer le meilleur plan à partir des profils
    const calculateBestPlan = (profiles: UserProfile[]): SubscriptionPlan => {
      let bestPlan: SubscriptionPlan = 'free';
      let hasPro = false;

      for (const profile of profiles) {
        const memberPlan = profile.subscription?.plan || 'free';
        const memberStatus = profile.subscription?.status || 'inactive';

        // Vérifier que l'abonnement est actif
        if (memberStatus === 'inactive' || memberStatus === 'cancelled') {
          continue;
        }

        // Si période d'essai expirée, considérer comme free
        if (memberStatus === 'trial' && profile.subscription?.trialEndDate) {
          if (new Date() > profile.subscription.trialEndDate) {
            continue;
          }
        }

        // Ordre de priorité : pro > premium > free
        if (memberPlan === 'pro') {
          bestPlan = 'pro';
          hasPro = true;
          break; // Pro est le meilleur, on peut arrêter
        } else if (memberPlan === 'premium' && !hasPro) {
          bestPlan = 'premium';
        }
      }

      return bestPlan;
    };

    // Écouter les changements en temps réel dans les profils des membres
    // Firestore limite les requêtes "in" à 10 éléments, donc on fait par batch
    const unsubscribes: (() => void)[] = [];
    // Utiliser un Map pour stocker les profils par UID (plus fiable que un tableau)
    const profilesMap = new Map<string, UserProfile>();

    // Fonction pour recalculer le meilleur plan à partir de tous les profils
    const recalculateBestPlan = () => {
      const allProfiles = Array.from(profilesMap.values());
      const bestPlan = calculateBestPlan(allProfiles);
      setProjectPlan(bestPlan);
      setLoading(false);
    };

    // Fonction pour traiter un batch de profils
    const processBatch = (batch: string[]) => {
      const q = query(
        collection(db, 'profiles'),
        where('uid', 'in', batch)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Mettre à jour les profils de ce batch dans le Map
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const profile: UserProfile = {
              uid: data.uid,
              email: data.email,
              displayName: data.displayName,
              subscription: data.subscription || { plan: 'free', status: 'active' },
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
            };
            profilesMap.set(data.uid, profile);
          });

          // Supprimer les profils qui ne sont plus dans ce batch (si un membre a quitté)
          batch.forEach(uid => {
            if (!snapshot.docs.some(doc => doc.data().uid === uid)) {
              profilesMap.delete(uid);
            }
          });

          // Recalculer le meilleur plan avec tous les profils
          recalculateBestPlan();
        },
        (error) => {
          console.error('Erreur lors de l\'écoute des profils des membres:', error);
          setProjectPlan('free'); // Par défaut en cas d'erreur
          setLoading(false);
        }
      );

      unsubscribes.push(unsubscribe);
    };

    // Créer un listener pour chaque batch
    for (let i = 0; i < memberUids.length; i += 10) {
      const batch = memberUids.slice(i, i + 10);
      processBatch(batch);
    }

    // Nettoyer les listeners lors du démontage
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [projet]);

  const planConfig = SUBSCRIPTION_PLANS[projectPlan];

  /**
   * Vérifications identiques à useSubscription mais basées sur le plan du projet
   */
  const canCreateProject = (currentProjectCount: number): boolean => {
    const maxProjects = planConfig.features.maxProjects;
    if (maxProjects === -1) return true;
    return currentProjectCount < maxProjects;
  };

  const canAddMember = (currentMemberCount: number): boolean => {
    const maxMembers = planConfig.features.maxMembersPerProject;
    if (maxMembers === -1) return true;
    return currentMemberCount < maxMembers;
  };

  const canAddAppartement = (currentAppartementCount: number): boolean => {
    const maxAppartements = planConfig.features.maxAppartements;
    if (maxAppartements === -1) return true;
    return currentAppartementCount < maxAppartements;
  };

  const canAddEmplacement = (currentEmplacementCount: number): boolean => {
    const maxEmplacements = planConfig.features.maxEmplacements;
    if (maxEmplacements === -1) return true;
    return currentEmplacementCount < maxEmplacements;
  };

  const canAddEnvie = (currentEnvieCount: number): boolean => {
    const maxEnvies = planConfig.features.maxEnvies;
    if (maxEnvies === -1) return true;
    return currentEnvieCount < maxEnvies;
  };

  const hasFeature = (feature: keyof typeof planConfig.features): boolean => {
    return planConfig.features[feature] as boolean;
  };

  const getLimitMessage = (limitType: 'projects' | 'members' | 'appartements' | 'emplacements' | 'envies'): string => {
    const upgradeMessage = projectPlan === 'free'
      ? 'Un membre du projet doit passer à Premium ou Pro pour augmenter les limites !'
      : projectPlan === 'premium'
      ? 'Un membre du projet doit passer à Pro pour des limites illimitées !'
      : 'Limite atteinte.';

    switch (limitType) {
      case 'members':
        return `Limite de ${planConfig.features.maxMembersPerProject} membres atteinte. ${upgradeMessage}`;
      case 'appartements':
        return `Limite de ${planConfig.features.maxAppartements} appartements atteinte. ${upgradeMessage}`;
      case 'emplacements':
        return `Limite de ${planConfig.features.maxEmplacements} emplacements atteinte. ${upgradeMessage}`;
      default:
        return `Limite atteinte. ${upgradeMessage}`;
    }
  };

  return {
    projectPlan,
    planConfig,
    loading,
    canCreateProject,
    canAddMember,
    canAddAppartement,
    canAddEmplacement,
    canAddEnvie,
    hasFeature,
    getLimitMessage,
  };
};

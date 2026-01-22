import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS, PlanFeature, SubscriptionPlan } from '@/config/subscription-plans';

/**
 * Hook pour gérer les abonnements et vérifier les permissions
 */
export const useSubscription = () => {
  const { profile } = useAuth();

  // Plan actuel de l'utilisateur
  const currentPlan: SubscriptionPlan = profile?.subscription?.plan || 'free';
  const planConfig = SUBSCRIPTION_PLANS[currentPlan];

  /**
   * Vérifie si l'utilisateur a accès à une feature spécifique
   */
  const hasFeature = (feature: PlanFeature): boolean => {
    let featureValue: number | boolean;

    if (!profile) {
      featureValue = SUBSCRIPTION_PLANS.free.features[feature];
    } else {
      const subscription = profile.subscription;
      if (!subscription) {
        featureValue = SUBSCRIPTION_PLANS.free.features[feature];
      } else {
        // Vérifier le statut de l'abonnement
        if (subscription.status === 'inactive' || subscription.status === 'cancelled') {
          featureValue = SUBSCRIPTION_PLANS.free.features[feature];
        } else {
          // Si en période d'essai, vérifier si elle est encore valide
          if (subscription.status === 'trial' && subscription.trialEndDate) {
            if (new Date() > subscription.trialEndDate) {
              // Période d'essai expirée
              featureValue = SUBSCRIPTION_PLANS.free.features[feature];
            } else {
              featureValue = planConfig.features[feature];
            }
          } else {
            featureValue = planConfig.features[feature];
          }
        }
      }
    }

    // Convertir en booléen : pour les nombres, -1 (illimité) = true, > 0 = true, sinon false
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    // Pour les features numériques, considérer comme disponible si > 0 ou illimité (-1)
    return featureValue === -1 || featureValue > 0;
  };

  /**
   * Vérifie si l'utilisateur peut créer un nouveau projet
   */
  const canCreateProject = (currentProjectCount: number): boolean => {
    const maxProjects = planConfig.features.maxProjects;
    if (maxProjects === -1) return true; // Illimité
    return currentProjectCount < maxProjects;
  };

  /**
   * Vérifie si l'utilisateur peut ajouter un membre au projet
   */
  const canAddMember = (currentMemberCount: number): boolean => {
    const maxMembers = planConfig.features.maxMembersPerProject;
    if (maxMembers === -1) return true; // Illimité
    return currentMemberCount < maxMembers;
  };

  /**
   * Vérifie si l'utilisateur peut ajouter un appartement
   */
  const canAddAppartement = (currentAppartementCount: number): boolean => {
    const maxAppartements = planConfig.features.maxAppartements;
    if (maxAppartements === -1) return true; // Illimité
    return currentAppartementCount < maxAppartements;
  };

  /**
   * Vérifie si l'utilisateur peut ajouter un emplacement
   */
  const canAddEmplacement = (currentEmplacementCount: number): boolean => {
    const maxEmplacements = planConfig.features.maxEmplacements;
    if (maxEmplacements === -1) return true; // Illimité
    return currentEmplacementCount < maxEmplacements;
  };

  /**
   * Vérifie si l'utilisateur peut ajouter une envie
   */
  const canAddEnvie = (currentEnvieCount: number): boolean => {
    const maxEnvies = planConfig.features.maxEnvies;
    if (maxEnvies === -1) return true; // Illimité
    return currentEnvieCount < maxEnvies;
  };

  /**
   * Obtenir le label du plan actuel
   */
  const getPlanLabel = (): string => {
    return planConfig.name;
  };

  /**
   * Obtenir la couleur associée au plan
   */
  const getPlanColor = (): string => {
    switch (currentPlan) {
      case 'premium':
        return 'yellow';
      case 'pro':
        return 'purple';
      default:
        return 'gray';
    }
  };

  /**
   * Vérifier si l'utilisateur est en période d'essai
   */
  const isOnTrial = (): boolean => {
    if (!profile?.subscription) return false;
    return (
      profile.subscription.status === 'trial' &&
      !!profile.subscription.trialEndDate &&
      new Date() < profile.subscription.trialEndDate
    );
  };

  /**
   * Jours restants de la période d'essai
   */
  const trialDaysRemaining = (): number | null => {
    if (!isOnTrial() || !profile?.subscription?.trialEndDate) return null;
    const diff = profile.subscription.trialEndDate.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  /**
   * Vérifier si l'abonnement est actif
   */
  const isSubscriptionActive = (): boolean => {
    if (!profile?.subscription) return false;
    return (
      profile.subscription.status === 'active' ||
      (profile.subscription.status === 'trial' && isOnTrial())
    );
  };

  /**
   * Obtenir le message de limitation
   */
  const getLimitMessage = (limitType: 'projects' | 'members' | 'appartements' | 'emplacements' | 'envies'): string => {
    switch (limitType) {
      case 'projects':
        return `Limite de ${planConfig.features.maxProjects} projet${planConfig.features.maxProjects > 1 ? 's' : ''} atteinte. Passez à Premium pour 3 projets ou Pro pour un nombre illimité !`;
      case 'members':
        return `Limite de ${planConfig.features.maxMembersPerProject} membres atteinte. Passez à Premium pour 20 membres ou Pro pour un nombre illimité !`;
      case 'appartements':
        return `Limite de ${planConfig.features.maxAppartements} appartements atteinte. Passez à Premium ou Pro pour un nombre illimité !`;
      case 'emplacements':
        return `Limite de ${planConfig.features.maxEmplacements} emplacements atteinte. Passez à Premium ou Pro pour un nombre illimité !`;
      case 'envies':
        return `Limite de ${planConfig.features.maxEnvies} envies atteinte. Passez à Premium ou Pro pour un nombre illimité !`;
      default:
        return 'Limite atteinte. Passez à un plan supérieur !';
    }
  };

  /**
   * Vérifier si l'utilisateur peut upgrader
   */
  const canUpgrade = (): boolean => {
    return currentPlan === 'free' || currentPlan === 'premium';
  };

  /**
   * Obtenir le prochain plan recommandé
   */
  const getRecommendedUpgrade = (): SubscriptionPlan => {
    if (currentPlan === 'free') return 'premium';
    if (currentPlan === 'premium') return 'pro';
    return 'pro';
  };

  return {
    // État
    currentPlan,
    planConfig,
    profile,

    // Vérifications de features
    hasFeature,
    canCreateProject,
    canAddMember,
    canAddAppartement,
    canAddEmplacement,
    canAddEnvie,

    // Informations du plan
    getPlanLabel,
    getPlanColor,
    isOnTrial,
    trialDaysRemaining,
    isSubscriptionActive,

    // Helpers
    getLimitMessage,
    canUpgrade,
    getRecommendedUpgrade,
  };
};

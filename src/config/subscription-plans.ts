/**
 * Configuration des plans d'abonnement
 *
 * Définit les fonctionnalités disponibles pour chaque plan
 */

export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    interval: null,
    description: 'Pour démarrer votre recherche d\'appartement',
    features: {
      maxProjects: 1,
      maxMembersPerProject: 2,
      maxAppartements: 20,
      maxEmplacements: 10,
      maxEnvies: -1, // Illimité
      analytics: false,
      marketStats: false,
      recommendations: false,
      exportPDF: false,
      advancedFilters: false,
      api: false,
      prioritySupport: false,
    },
    featuresList: [
      '1 projet actif',
      '2 membres par projet',
      'Maximum 20 appartements',
      'Maximum 10 emplacements',
      'Envies illimitées',
      'Checklist de visite',
      'Carte interactive',
      'Comparaison d\'appartements',
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    description: 'Pour une recherche optimisée avec analytics',
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRODUCT_ID || '',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || '',
    features: {
      maxProjects: 3,
      maxMembersPerProject: 20,
      maxAppartements: -1, // Illimité
      maxEmplacements: -1, // Illimité
      maxEnvies: -1, // Illimité
      analytics: true,
      marketStats: true,
      recommendations: true,
      exportPDF: true,
      advancedFilters: true,
      api: false,
      prioritySupport: false,
    },
    featuresList: [
      '🎯 Tout du plan Gratuit',
      '✨ 3 projets simultanés',
      '👥 Jusqu\'à 20 membres par projet',
      '🏠 Appartements illimités',
      '📊 Analytics avancés',
      '💡 Statistiques de marché',
      '🎨 Recommandations personnalisées',
      '📄 Export PDF des rapports',
      '🔍 Filtres avancés',
      '🎁 Essai gratuit 14 jours',
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    interval: 'month',
    description: 'Pour les professionnels et power users',
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID || '',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    features: {
      maxProjects: -1, // Illimité
      maxMembersPerProject: -1, // Illimité
      maxAppartements: -1, // Illimité
      maxEmplacements: -1, // Illimité
      maxEnvies: -1, // Illimité
      analytics: true,
      marketStats: true,
      recommendations: true,
      exportPDF: true,
      advancedFilters: true,
      api: true,
      prioritySupport: true,
    },
    featuresList: [
      '🚀 Tout du plan Premium',
      '♾️ Projets illimités',
      '👥 Membres illimités',
      '🔌 Accès API REST',
      '🤖 Import automatique d\'annonces',
      '📍 Intégration Street View',
      '🧠 Machine Learning avancé',
      '⚡ Support prioritaire',
      '🎁 Essai gratuit 14 jours',
    ]
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
export type PlanFeature = keyof typeof SUBSCRIPTION_PLANS.free.features;

/**
 * Obtenir la configuration d'un plan
 */
export function getPlanConfig(plan: SubscriptionPlan) {
  return SUBSCRIPTION_PLANS[plan];
}

/**
 * Obtenir tous les plans disponibles
 */
export function getAllPlans() {
  return Object.values(SUBSCRIPTION_PLANS);
}

/**
 * Obtenir les plans payants uniquement
 */
export function getPaidPlans() {
  return Object.values(SUBSCRIPTION_PLANS).filter(plan => plan.price > 0);
}

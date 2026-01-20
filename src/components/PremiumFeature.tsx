'use client';

import React from 'react';
import Link from 'next/link';
import { FaCrown, FaLock, FaRocket } from 'react-icons/fa';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanFeature } from '@/config/subscription-plans';

interface PremiumFeatureProps {
  feature: PlanFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPlan?: 'premium' | 'pro';
  showBlur?: boolean;
}

/**
 * Composant pour protéger une feature premium
 * Affiche un paywall si l'utilisateur n'a pas accès
 */
export default function PremiumFeature({
  feature,
  children,
  fallback,
  requiredPlan = 'premium',
  showBlur = true
}: PremiumFeatureProps) {
  const { hasFeature, currentPlan } = useSubscription();

  // L'utilisateur a accès à la feature
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // Afficher le fallback personnalisé si fourni
  if (fallback) {
    return <>{fallback}</>;
  }

  // Icône selon le plan requis
  const Icon = requiredPlan === 'pro' ? FaRocket : FaCrown;
  const planName = requiredPlan === 'pro' ? 'Pro' : 'Premium';
  const gradientColors = requiredPlan === 'pro'
    ? 'from-purple-400 to-pink-500'
    : 'from-yellow-400 to-orange-500';

  // Afficher le paywall par défaut
  return (
    <div className="relative rounded-lg overflow-hidden">
      {/* Contenu flouté (optionnel) */}
      {showBlur && (
        <div className="filter blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>
      )}

      {/* Overlay paywall */}
      <div className={`${showBlur ? 'absolute inset-0' : ''} flex items-center justify-center bg-gradient-to-br from-yellow-50/95 to-orange-50/95 backdrop-blur-sm rounded-lg py-12 px-6`}>
        <div className="text-center max-w-md">
          {/* Icône */}
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${gradientColors} rounded-full mb-6 shadow-xl`}>
            <Icon className="text-4xl text-white" />
          </div>

          {/* Titre */}
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Feature {planName}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Cette fonctionnalité est disponible avec le plan{' '}
            <span className={`font-bold ${requiredPlan === 'pro' ? 'text-purple-600' : 'text-orange-600'}`}>
              {planName}
            </span>
            {currentPlan === 'free' && ' ou supérieur'}.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/abonnement"
              className={`bg-gradient-to-r ${gradientColors} text-white px-8 py-4 rounded-lg font-bold hover:shadow-xl transition-all transform hover:scale-105 shadow-lg`}
            >
              {currentPlan === 'free' ? `Découvrir ${planName}` : `Passer à ${planName}`}
            </Link>

            <p className="text-xs text-gray-500">
              ✨ Essai gratuit de 14 jours • Sans engagement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

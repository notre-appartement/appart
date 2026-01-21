'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCrown, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import { useSubscription } from '@/hooks/useSubscription';
import { PlanFeature } from '@/config/subscription-plans';

interface PremiumGuardProps {
  feature: PlanFeature;
  children: React.ReactNode;
  redirectTo?: string;
  showMessage?: boolean;
}

/**
 * HOC pour protéger une page entière
 * Redirige vers la page d'abonnement si l'utilisateur n'a pas accès
 */
export default function PremiumGuard({
  feature,
  children,
  redirectTo = '/abonnement',
  showMessage = true
}: PremiumGuardProps) {
  const router = useRouter();
  const { hasFeature, getPlanLabel } = useSubscription();

  const hasAccess = hasFeature(feature);

  useEffect(() => {
    // Rediriger si pas d'accès et showMessage est false
    if (!hasAccess && !showMessage) {
      router.push(redirectTo);
    }
  }, [hasAccess, showMessage, redirectTo, router]);

  // Afficher un loader pendant la vérification
  if (!hasAccess && !showMessage) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="inline-block animate-spin text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Vérification de l'abonnement...</p>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur si pas d'accès
  if (!hasAccess && showMessage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-12 text-center shadow-xl">
            {/* Icône */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-xl">
              <FaCrown className="text-5xl text-white" />
            </div>

            {/* Titre */}
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Accès Premium Requis
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Cette page est réservée aux utilisateurs Premium et Pro.
              <br />
              Votre plan actuel : <strong>{getPlanLabel()}</strong>
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/abonnement"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-lg font-bold hover:shadow-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Voir les plans Premium
              </Link>
              <button
                onClick={() => router.back()}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Retour
              </button>
            </div>

            {/* Avantages */}
            <div className="mt-12 pt-8 border-t border-orange-200">
              <p className="text-sm text-gray-500 mb-4">
                Avec Premium, vous débloquez :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <p className="font-semibold text-gray-800 dark:text-white mb-1">📊 Analytics</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Statistiques avancées sur vos recherches</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <p className="font-semibold text-gray-800 dark:text-white mb-1">💡 Stats Marché</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Prix moyens par quartier en temps réel</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <p className="font-semibold text-gray-800 dark:text-white mb-1">📄 Export PDF</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Rapports professionnels à partager</p>
                </div>
              </div>
            </div>

            {/* Essai gratuit */}
            <p className="text-xs text-gray-500 mt-6">
              ✨ Essai gratuit de 14 jours • Sans engagement • Annulation en 1 clic
            </p>
          </div>
        </div>
      </div>
    );
  }

  // L'utilisateur a accès, afficher le contenu
  return <>{children}</>;
}

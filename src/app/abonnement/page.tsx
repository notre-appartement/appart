'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaCheck, FaCrown, FaRocket, FaArrowLeft, FaSpinner, FaTimes } from 'react-icons/fa';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/config/subscription-plans';

export default function AbonnementPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { currentPlan, isOnTrial, trialDaysRemaining } = useSubscription();
  const [loading, setLoading] = useState<SubscriptionPlan | null>(null);
  const [showCanceledAlert, setShowCanceledAlert] = useState(false);

  useEffect(() => {
    // Afficher un message si l'utilisateur a annulé le paiement
    if (searchParams.get('canceled') === 'true') {
      setShowCanceledAlert(true);
    }
  }, [searchParams]);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan === 'free') {
      toast.error('Vous êtes déjà sur le plan gratuit !');
      return;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour souscrire à un abonnement');
      return;
    }

    setLoading(plan);

    try {
      // Déterminer le Price ID en fonction du plan
      const priceId = plan === 'premium'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;

      if (!priceId) {
        throw new Error('Price ID Stripe manquant dans la configuration');
      }

      // Créer une session Checkout Stripe
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session');
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error('URL de checkout manquante');
      }

      // Rediriger vers Stripe Checkout (nouvelle méthode)
      window.location.href = url;
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(`Erreur lors de la création de la session de paiement: ${error.message}`);
      setLoading(null);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
              <FaArrowLeft className="mr-2" />
              Retour au tableau de bord
            </Link>

            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Choisissez votre plan
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Trouvez l'appartement parfait avec les bons outils
            </p>

            {/* Badge plan actuel */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg">
              <span className="text-sm text-gray-600">Plan actuel :</span>
              <span className="font-bold text-gray-800">{SUBSCRIPTION_PLANS[currentPlan].name}</span>
              {isOnTrial() && (
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Essai : {trialDaysRemaining()}j restants
                </span>
              )}
            </div>
          </div>

          {/* Alerte d'annulation */}
          {showCanceledAlert && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <FaTimes className="text-yellow-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-yellow-800 mb-1">Paiement annulé</h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    Vous avez annulé le processus de paiement. Aucun montant n'a été débité.
                  </p>
                  <button
                    onClick={() => setShowCanceledAlert(false)}
                    className="text-sm text-yellow-800 underline hover:no-underline"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Grille des plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Plan Free */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Gratuit</h2>
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  0€
                </div>
                <p className="text-gray-500 text-sm">Pour toujours</p>
              </div>

              <p className="text-gray-600 text-center mb-6">
                {SUBSCRIPTION_PLANS.free.description}
              </p>

              <ul className="space-y-3 mb-8">
                {SUBSCRIPTION_PLANS.free.featuresList.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={currentPlan === 'free'}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  currentPlan === 'free'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-800'
                }`}
              >
                {currentPlan === 'free' ? 'Plan actuel' : 'Rétrograder'}
              </button>
            </div>

            {/* Plan Premium */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-8 border-2 border-orange-300 hover:shadow-2xl transition-shadow relative transform md:scale-105">
              {/* Badge populaire */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Recommandé
                </span>
              </div>

              <div className="text-center mb-6 mt-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                  <FaCrown className="text-3xl text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Premium</h2>
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  9,99€
                </div>
                <p className="text-gray-600 text-sm">par mois</p>
              </div>

              <p className="text-gray-700 text-center mb-6 font-medium">
                {SUBSCRIPTION_PLANS.premium.description}
              </p>

              <ul className="space-y-3 mb-8">
                {SUBSCRIPTION_PLANS.premium.featuresList.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FaCheck className="text-orange-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan('premium')}
                disabled={currentPlan === 'premium' || currentPlan === 'pro' || loading !== null}
                className={`w-full py-4 rounded-lg font-bold transition-all shadow-lg ${
                  currentPlan === 'premium'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : currentPlan === 'pro'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {loading === 'premium' ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Chargement...
                  </span>
                ) : currentPlan === 'premium' ? (
                  'Plan actuel'
                ) : currentPlan === 'pro' ? (
                  'Vous avez mieux !'
                ) : (
                  'Commencer l\'essai gratuit'
                )}
              </button>
            </div>

            {/* Plan Pro */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8 border-2 border-purple-300 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
                  <FaRocket className="text-3xl text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pro</h2>
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  19,99€
                </div>
                <p className="text-gray-600 text-sm">par mois</p>
              </div>

              <p className="text-gray-700 text-center mb-6 font-medium">
                {SUBSCRIPTION_PLANS.pro.description}
              </p>

              <ul className="space-y-3 mb-8">
                {SUBSCRIPTION_PLANS.pro.featuresList.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FaCheck className="text-purple-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan('pro')}
                disabled={currentPlan === 'pro' || loading !== null}
                className={`w-full py-4 rounded-lg font-bold transition-all shadow-lg ${
                  currentPlan === 'pro'
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {loading === 'pro' ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Chargement...
                  </span>
                ) : currentPlan === 'pro' ? (
                  'Plan actuel'
                ) : (
                  'Commencer l\'essai gratuit'
                )}
              </button>
            </div>
          </div>

          {/* FAQ / Informations */}
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Questions fréquentes
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">🎁 Comment fonctionne l'essai gratuit ?</h4>
                <p className="text-gray-600 text-sm">
                  Profitez de 14 jours d'essai gratuit sur les plans Premium et Pro. Aucune carte bancaire requise pour commencer. Vous pouvez annuler à tout moment.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">🔄 Puis-je changer de plan ?</h4>
                <p className="text-gray-600 text-sm">
                  Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">💳 Quels moyens de paiement acceptez-vous ?</h4>
                <p className="text-gray-600 text-sm">
                  Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) via notre plateforme de paiement sécurisée Stripe.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">🔒 Mes données sont-elles sécurisées ?</h4>
                <p className="text-gray-600 text-sm">
                  Absolument ! Nous utilisons le chiffrement SSL et stockons vos données sur Firebase avec les meilleures pratiques de sécurité. Vos informations de paiement sont gérées par Stripe et ne sont jamais stockées sur nos serveurs.
                </p>
              </div>
            </div>
          </div>

          {/* Note essai gratuit */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
              🎁 <strong>14 jours d'essai gratuit</strong> sur les plans Premium et Pro !
              <br />
              Aucune carte bancaire requise pendant la période d'essai.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaCheckCircle, FaSpinner, FaArrowRight } from 'react-icons/fa';
import AuthGuard from '@/components/AuthGuard';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un délai pour que le webhook ait le temps de traiter
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          {loading ? (
            // État de chargement
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <FaSpinner className="text-6xl text-blue-500 mx-auto mb-6 animate-spin" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Confirmation en cours...
              </h1>
              <p className="text-gray-600 mb-2">
                Nous traitons votre paiement.
              </p>
              <p className="text-sm text-gray-500">
                Veuillez patienter quelques instants.
              </p>
            </div>
          ) : (
            // État de succès
            <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 animate-bounce">
                <FaCheckCircle className="text-5xl text-white" />
              </div>

              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                🎉 Bienvenue dans l'aventure !
              </h1>
              <p className="text-xl text-gray-700 mb-2">
                Votre abonnement est maintenant actif
              </p>
              <p className="text-gray-600 mb-8">
                Vous bénéficiez de <strong>14 jours d'essai gratuit</strong>. Profitez de toutes les fonctionnalités premium !
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  ✨ Ce qui vous attend :
                </h2>
                <ul className="text-left space-y-2 text-gray-700">
                  <li>✅ Projets et appartements illimités</li>
                  <li>✅ Collaboration en équipe</li>
                  <li>✅ Statistiques avancées</li>
                  <li>✅ Import automatique d'annonces</li>
                  <li>✅ Support prioritaire</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-bold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Accéder au tableau de bord
                  <FaArrowRight />
                </Link>
                <Link
                  href="/profil"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-lg font-bold border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  Voir mon profil
                </Link>
              </div>

              {sessionId && (
                <p className="mt-8 text-xs text-gray-400">
                  Référence : {sessionId.substring(0, 20)}...
                </p>
              )}

              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  📧 Un email de confirmation a été envoyé à votre adresse.
                  <br />
                  <span className="text-xs text-gray-500">
                    (Pensez à vérifier vos spams si vous ne le recevez pas)
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

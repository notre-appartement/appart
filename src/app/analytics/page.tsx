'use client';

import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import PremiumGuard from '@/components/PremiumGuard';
import { FaChartBar, FaChartLine, FaChartPie, FaTrophy } from 'react-icons/fa';

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <PremiumGuard feature="analytics">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
                <FaChartBar className="text-blue-600" />
                Analytics Premium
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Analysez vos recherches d'appartement en profondeur
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Appartements vus</h3>
                  <FaChartLine className="text-3xl text-blue-600" />
                </div>
                <p className="text-4xl font-bold text-blue-600 mb-2">12</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">+3 ce mois-ci</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Prix moyen observé</h3>
                  <FaChartPie className="text-3xl text-green-600" />
                </div>
                <p className="text-4xl font-bold text-green-600 mb-2">1 245€</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pour 52m² en moyenne</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Meilleur rapport</h3>
                  <FaTrophy className="text-3xl text-purple-600" />
                </div>
                <p className="text-4xl font-bold text-purple-600 mb-2">23€/m²</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Appartement rue de la Paix</p>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique 1 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  📊 Évolution de vos recherches
                </h3>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                  <div className="text-center">
                    <FaChartLine className="text-6xl text-blue-400 mb-4 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-300">Graphique d'évolution temporelle</p>
                    <p className="text-sm text-gray-500 mt-2">
                      (Intégration Chart.js à venir)
                    </p>
                  </div>
                </div>
              </div>

              {/* Graphique 2 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  🏘️ Répartition par quartier
                </h3>
                <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center border border-green-200">
                  <div className="text-center">
                    <FaChartPie className="text-6xl text-green-400 mb-4 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-300">Graphique en camembert</p>
                    <p className="text-sm text-gray-500 mt-2">
                      (Intégration Chart.js à venir)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-orange-200">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                💡 Insights personnalisés
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">Votre budget est cohérent</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      80% des appartements que vous visitez sont dans votre budget
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">Quartier préféré détecté</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Vous visitez principalement dans le 11ème arrondissement
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">Rythme de recherche optimal</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Vous visitez en moyenne 3 appartements par semaine
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Note de développement */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 rounded-lg p-4 inline-block">
                🚧 <strong>Page de démonstration</strong> : Les graphiques et analytics réels seront ajoutés progressivement.
                <br />
                Cette page est accessible uniquement aux utilisateurs Premium et Pro.
              </p>
            </div>
          </div>
        </div>
      </PremiumGuard>
    </AuthGuard>
  );
}

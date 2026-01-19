'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAppartements } from '@/hooks/useAppartements';
import { useEmplacements } from '@/hooks/useEmplacements';
import { useProject } from '@/contexts/ProjectContext';
import { FaMapMarkerAlt, FaHome, FaBriefcase, FaUsers, FaShoppingCart } from 'react-icons/fa';

// Import dynamique pour éviter les problèmes SSR avec Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

export default function CartePage() {
  const { appartements, loading: loadingApparts } = useAppartements();
  const { emplacements, loading: loadingEmplacements } = useEmplacements();
  const { currentProject, loading: projectLoading } = useProject();
  const [showAppartements, setShowAppartements] = useState(true);
  const [showEmplacements, setShowEmplacements] = useState(true);
  const [filterEvaluation, setFilterEvaluation] = useState<'tous' | 'bon' | 'moyen' | 'pas_bon'>('tous');

  // Filtrer les appartements selon l'évaluation
  const filteredAppartements = appartements.filter(appart => {
    if (filterEvaluation === 'tous') return true;
    return appart.choix === filterEvaluation;
  });

  if (projectLoading || loadingApparts || loadingEmplacements) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Aucun projet actif</h2>
          <p className="text-gray-600 mb-4">
            Vous devez sélectionner un projet avant de voir la carte.
          </p>
          <Link
            href="/projets"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sélectionner un projet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🗺️ Carte Interactive
          </h1>

          {/* Filtres */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Toggle Appartements */}
            <label className="flex items-center space-x-2 cursor-pointer bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                checked={showAppartements}
                onChange={(e) => setShowAppartements(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <FaHome className="text-blue-600" />
              <span className="font-medium text-gray-700">
                Appartements ({filteredAppartements.length})
              </span>
            </label>

            {/* Filtre évaluation */}
            {showAppartements && (
              <select
                value={filterEvaluation}
                onChange={(e) => setFilterEvaluation(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="tous">Toutes les évaluations</option>
                <option value="bon">✅ Bon uniquement</option>
                <option value="moyen">⚠️ Moyen uniquement</option>
                <option value="pas_bon">❌ Pas bon uniquement</option>
              </select>
            )}

            {/* Toggle Emplacements */}
            <label className="flex items-center space-x-2 cursor-pointer bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <input
                type="checkbox"
                checked={showEmplacements}
                onChange={(e) => setShowEmplacements(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded"
              />
              <FaMapMarkerAlt className="text-green-600" />
              <span className="font-medium text-gray-700">
                Emplacements ({emplacements.length})
              </span>
            </label>
          </div>

          {/* Légende */}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Appartements</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>✅ Bon</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>⚠️ Moyen</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>❌ Pas bon</span>
            </div>
            <div className="border-l border-gray-300 pl-3 flex items-center space-x-2">
              <FaBriefcase className="text-blue-600" />
              <span>Travail</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaUsers className="text-pink-600" />
              <span>Famille</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaShoppingCart className="text-green-600" />
              <span>Commerces</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carte */}
      <div className="flex-1">
        {loadingApparts || loadingEmplacements ? (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <MapComponent
            appartements={showAppartements ? filteredAppartements : []}
            emplacements={showEmplacements ? emplacements : []}
          />
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTimes, FaCrown, FaLock } from 'react-icons/fa';
import { useEmplacements } from '@/hooks/useEmplacements';
import { useProject } from '@/contexts/ProjectContext';
import { useProjectLimits } from '@/hooks/useProjectLimits';
import { geocodeAddressWithRetry } from '@/lib/geocoding';

export default function NouvelEmplacementPage() {
  const router = useRouter();
  const { addEmplacement, emplacements } = useEmplacements();
  const { currentProject, loading: projectLoading } = useProject();
  const { canAddEmplacement, getLimitMessage, planConfig, projectPlan, loading: limitsLoading } = useProjectLimits(currentProject);
  const [loading, setLoading] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  // Vérifier la limite au chargement
  useEffect(() => {
    if (!limitsLoading && emplacements && !canAddEmplacement(emplacements.length)) {
      setShowLimitWarning(true);
    }
  }, [emplacements, canAddEmplacement, limitsLoading]);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    type: 'travail' as 'travail' | 'famille' | 'loisirs' | 'commerces' | 'autre',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Géolocaliser l'adresse
      const coordinates = await geocodeAddressWithRetry(formData.adresse);

      await addEmplacement({
        ...formData,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
      });
      router.push('/emplacements');
    } catch (err) {
      alert('Erreur lors de l\'ajout de l\'emplacement');
      setLoading(false);
    }
  };

  if (projectLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Aucun projet actif</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Vous devez sélectionner un projet avant d'ajouter un emplacement.
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

  // Vérifier la limite d'emplacements
  if (showLimitWarning) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-300 rounded-2xl p-12 text-center shadow-xl">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-xl relative">
              <FaCrown className="text-5xl text-white" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                <FaLock />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Limite atteinte
            </h1>

            <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
              {getLimitMessage('emplacements')}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">
              Vous avez <strong>{emplacements?.length}/{planConfig.features.maxEmplacements}</strong> emplacements dans ce projet
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/abonnement"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-lg font-bold hover:shadow-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <FaCrown />
                Passer à Premium
              </Link>
              <Link
                href="/emplacements"
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Voir mes emplacements
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              💡 Plan actuel du projet : <strong>{planConfig.name}</strong>
              <br />
              Si vous ou un autre membre passez à Premium, tout le projet débloque les limites !
            </p>

            <p className="text-xs text-gray-500 mt-4">
              ✨ Essai gratuit de 14 jours • Sans engagement
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/emplacements"
            className="inline-flex items-center text-green-600 hover:text-green-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux emplacements
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            📍 Nouvel Emplacement
          </h1>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Nom de l'emplacement *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Bureau de Marie, Salle de sport, Supermarché"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Adresse complète *
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="45 Avenue des Champs-Élysées, 75008 Paris"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Conseil : Copiez l'adresse depuis Google Maps pour plus de précision
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Type d'emplacement *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="travail">💼 Travail</option>
                <option value="famille">👨‍👩‍👧 Famille</option>
                <option value="loisirs">🎾 Loisirs</option>
                <option value="commerces">🛒 Commerces</option>
                <option value="autre">📌 Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Ex: Lieu de travail - important d'être à moins de 30min en transport"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>💡 À venir :</strong> Géolocalisation automatique et carte interactive pour visualiser l'emplacement
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FaSave />
              <span>{loading ? 'Enregistrement...' : 'Enregistrer l\'emplacement'}</span>
            </button>
            <Link
              href="/emplacements"
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <FaTimes />
              <span>Annuler</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

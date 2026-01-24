'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { auth } from '@/lib/firebase';
import { FaArrowLeft, FaLink, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { AnimatedPage } from '@/components/AnimatedCard';

export default function ImporterAppartementPage() {
  const router = useRouter();
  const { user, displayName } = useAuth();
  const { currentProject } = useProject();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-300">Aucun projet actif</p>
          <Link href="/projets" className="text-blue-600 hover:underline mt-4 inline-block">
            Sélectionner un projet
          </Link>
        </div>
      </div>
    );
  }

  const handleImport = async () => {
    if (!url.trim()) {
      toast.error('Veuillez entrer une URL');
      return;
    }

    // Vérifier que c'est une URL valide
    try {
      new URL(url);
    } catch {
      toast.error('URL invalide');
      return;
    }

    // Vérifier que c'est un site supporté
    const supportedSites = ['leboncoin.fr', 'seloger.com', 'pap.fr'];
    const isSupported = supportedSites.some(site => url.includes(site));

    if (!isSupported) {
      toast.error('Site non supporté. Sites supportés : LeBonCoin, SeLoger, PAP');
      return;
    }

    setLoading(true);
    setPreview(null);

    try {
      // Récupérer le token d'authentification
      const token = await user?.getIdToken();
      if (!token) {
        toast.error('Vous devez être connecté pour importer un appartement');
        return;
      }

      const response = await fetch('/api/import-appartement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: url.trim(),
          projectId: currentProject.id,
          userId: user?.uid,
          userName: displayName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si LeBonCoin bloque avec un captcha, proposer la saisie manuelle
        if (data.requiresManualInput) {
          toast.error('LeBonCoin a détecté le scraping. Veuillez utiliser le formulaire manuel ci-dessous.', {
            duration: 5000,
          });
          setShowManualForm(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Erreur lors de l\'import');
      }

      toast.success('✅ Appartement importé avec succès !');

      // Rediriger vers la page de détails de l'appartement
      setTimeout(() => {
        router.push(`/appartements/${data.appartementId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de l\'import de l\'appartement');
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/appartements"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux appartements
          </Link>

          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
            <FaLink className="text-blue-600 dark:text-blue-400" />
            Importer un appartement depuis une URL
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Collez l'URL d'une annonce LeBonCoin, SeLoger ou PAP pour importer automatiquement les informations
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL de l'annonce
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.leboncoin.fr/..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Sites supportés : LeBonCoin, SeLoger, PAP
              </p>
            </div>

            <button
              onClick={handleImport}
              disabled={loading || !url.trim()}
              className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Import en cours...
                </>
              ) : (
                <>
                  <FaLink />
                  Importer l'appartement
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                Comment ça marche ?
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Copiez l'URL complète de l'annonce depuis votre navigateur</li>
                <li>• Collez-la dans le champ ci-dessus</li>
                <li>• Cliquez sur "Importer" - l'extraction peut prendre 10-15 secondes</li>
                <li>• Les informations (prix, surface, photos, etc.) seront automatiquement extraites</li>
                <li>• Vous pourrez ensuite compléter ou modifier les détails si nécessaire</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Limitations */}
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Limitations
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Certaines informations peuvent ne pas être détectées automatiquement</li>
                <li>• Les photos peuvent prendre quelques secondes à télécharger</li>
                <li>• Vérifiez toujours les informations importées avant de valider</li>
                <li>• Si LeBonCoin bloque le scraping, utilisez le bouton "Ajouter" pour saisir manuellement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

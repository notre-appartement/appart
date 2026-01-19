'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useProjects } from '@/hooks/useProjects';
import AuthGuard from '@/components/AuthGuard';
import { FaDatabase, FaArrowRight, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function MigrationPage() {
  const { projets } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [migrating, setMigrating] = useState(false);
  const [stats, setStats] = useState({
    appartements: 0,
    envies: 0,
    emplacements: 0,
  });
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Compter les documents sans projectId
        const appartQuery = query(
          collection(db, 'appartements'),
          where('projectId', '==', null)
        );
        const enviesQuery = query(
          collection(db, 'envies'),
          where('projectId', '==', null)
        );
        const emplacementsQuery = query(
          collection(db, 'emplacements'),
          where('projectId', '==', null)
        );

        const [appartSnap, enviesSnap, emplacementsSnap] = await Promise.all([
          getDocs(appartQuery),
          getDocs(enviesQuery),
          getDocs(emplacementsQuery),
        ]);

        setStats({
          appartements: appartSnap.size,
          envies: enviesSnap.size,
          emplacements: emplacementsSnap.size,
        });
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
      }
    };

    loadStats();
  }, [completed]);

  const handleMigration = async () => {
    if (!selectedProjectId) {
      alert('Veuillez sélectionner un projet');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir migrer toutes les données vers ce projet ?')) {
      return;
    }

    setMigrating(true);

    try {
      // Migrer les appartements
      const appartQuery = query(
        collection(db, 'appartements'),
        where('projectId', '==', null)
      );
      const appartSnap = await getDocs(appartQuery);
      const appartPromises = appartSnap.docs.map(docSnap =>
        updateDoc(doc(db, 'appartements', docSnap.id), { projectId: selectedProjectId })
      );

      // Migrer les envies
      const enviesQuery = query(
        collection(db, 'envies'),
        where('projectId', '==', null)
      );
      const enviesSnap = await getDocs(enviesQuery);
      const enviesPromises = enviesSnap.docs.map(docSnap =>
        updateDoc(doc(db, 'envies', docSnap.id), { projectId: selectedProjectId })
      );

      // Migrer les emplacements
      const emplacementsQuery = query(
        collection(db, 'emplacements'),
        where('projectId', '==', null)
      );
      const emplacementsSnap = await getDocs(emplacementsQuery);
      const emplacementsPromises = emplacementsSnap.docs.map(docSnap =>
        updateDoc(doc(db, 'emplacements', docSnap.id), { projectId: selectedProjectId })
      );

      await Promise.all([...appartPromises, ...enviesPromises, ...emplacementsPromises]);

      setCompleted(true);
      alert(`Migration réussie ! ${appartSnap.size + enviesSnap.size + emplacementsSnap.size} documents migrés.`);
    } catch (err) {
      console.error('Erreur lors de la migration:', err);
      alert('Erreur lors de la migration');
    } finally {
      setMigrating(false);
    }
  };

  const totalToMigrate = stats.appartements + stats.envies + stats.emplacements;

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <FaDatabase className="text-2xl text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Migration des Données
              </h1>
              <p className="text-gray-600">
                Migrez vos données existantes vers un projet
              </p>
            </div>
          </div>

          {totalToMigrate === 0 ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-3xl text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-800">
                    Toutes les données sont déjà migrées !
                  </h3>
                  <p className="text-green-700 text-sm mt-1">
                    Aucune donnée sans projet n'a été trouvée.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-2xl text-yellow-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-yellow-800 mb-2">
                      {totalToMigrate} document{totalToMigrate > 1 ? 's' : ''} à migrer
                    </h3>
                    <ul className="space-y-1 text-yellow-700 text-sm">
                      {stats.appartements > 0 && (
                        <li>• {stats.appartements} appartement{stats.appartements > 1 ? 's' : ''}</li>
                      )}
                      {stats.envies > 0 && (
                        <li>• {stats.envies} envie{stats.envies > 1 ? 's' : ''}</li>
                      )}
                      {stats.emplacements > 0 && (
                        <li>• {stats.emplacements} emplacement{stats.emplacements > 1 ? 's' : ''}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez le projet de destination
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900"
                  >
                    <option value="">-- Choisir un projet --</option>
                    {projets.map((projet) => (
                      <option key={projet.id} value={projet.id}>
                        {projet.nom} ({projet.membres.length} membre{projet.membres.length > 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleMigration}
                  disabled={!selectedProjectId || migrating}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {migrating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Migration en cours...
                    </>
                  ) : (
                    <>
                      <FaArrowRight />
                      Migrer les données
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Note :</strong> Cette opération est irréversible. Toutes les données sans projet seront associées au projet sélectionné.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

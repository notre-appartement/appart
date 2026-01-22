'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import { FaDatabase, FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaLock, FaUsers } from 'react-icons/fa';

// 🔐 LISTE BLANCHE DES ADMINS
// Remplacez par vos propres emails d'administrateurs
const ADMIN_EMAILS = [
  'ssabatieraymeric@gmail.com', // Remplacez par votre email
  // Ajoutez d'autres emails si nécessaire
];

export default function MigrationPage() {
  const { user } = useAuth();
  const [projets, setProjets] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [migrating, setMigrating] = useState(false);
  const [migratingProjets, setMigratingProjets] = useState(false);
  const [stats, setStats] = useState({
    appartements: 0,
    envies: 0,
    emplacements: 0,
  });
  const [projetsToMigrate, setProjetsToMigrate] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Charger tous les projets (sans filtre, car les règles bloquent sinon)
        const projetsSnap = await getDocs(collection(db, 'projets'));
        const allProjets: any[] = projetsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjets(allProjets);

        // Compter les projets sans membresUids
        const projetsWithoutUids = allProjets.filter(p => !p.membresUids || !p.adminsUids);
        setProjetsToMigrate(projetsWithoutUids.length);

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

  // Migration des projets pour ajouter membresUids et adminsUids
  const handleMigrateProjets = async () => {
    if (!confirm('Voulez-vous migrer tous les projets pour ajouter les champs membresUids et adminsUids ?')) {
      return;
    }

    setMigratingProjets(true);

    try {
      const projetsSnap = await getDocs(collection(db, 'projets'));
      let migratedCount = 0;

      for (const docSnap of projetsSnap.docs) {
        const data = docSnap.data();

        // Si membresUids ou adminsUids n'existe pas, les créer
        if (!data.membresUids || !data.adminsUids) {
          const membres = data.membres || [];
          const membresUids = membres.map((m: any) => m.uid);
          const adminsUids = membres.filter((m: any) => m.isAdmin).map((m: any) => m.uid);

          await updateDoc(doc(db, 'projets', docSnap.id), {
            membresUids,
            adminsUids,
          });
          migratedCount++;
        }
      }

      alert(`Migration réussie ! ${migratedCount} projet(s) migré(s).`);
      setCompleted(!completed); // Recharger les stats
    } catch (err) {
      console.error('Erreur lors de la migration des projets:', err);
      alert('Erreur lors de la migration des projets');
    } finally {
      setMigratingProjets(false);
    }
  };

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

  // 🔐 Vérification des permissions admin
  const isAdmin = ADMIN_EMAILS.includes(user?.email || '');

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!isAdmin ? (
          // 🔒 ACCÈS REFUSÉ
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <FaLock className="text-4xl text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Accès Refusé
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                Cette page est réservée aux administrateurs de l'application.
              </p>
              <p className="text-sm text-gray-500">
                Votre email : <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user?.email}</span>
              </p>
            </div>
          </div>
        ) : (
          // ✅ ACCÈS AUTORISÉ
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FaDatabase className="text-2xl text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Migration des Données
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Migrez vos données existantes vers un projet
                </p>
              </div>
            </div>

          {/* Section Migration Projets (membresUids/adminsUids) */}
          {projetsToMigrate > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <FaUsers className="text-2xl text-red-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-800 mb-2">
                    ⚠️ Migration urgente : {projetsToMigrate} projet(s) à mettre à jour
                  </h3>
                  <p className="text-red-700 text-sm mb-4">
                    Ces projets n'ont pas les champs <code className="bg-red-100 px-1 rounded">membresUids</code> et <code className="bg-red-100 px-1 rounded">adminsUids</code> nécessaires aux nouvelles règles de sécurité Firestore.
                  </p>
                  <button
                    onClick={handleMigrateProjets}
                    disabled={migratingProjets}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {migratingProjets ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Migration en cours...
                      </>
                    ) : (
                      <>
                        <FaArrowRight />
                        Migrer les projets maintenant
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {projetsToMigrate === 0 && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-xl text-green-600" />
                <p className="text-green-800 font-medium">
                  Tous les projets ont les champs membresUids et adminsUids ✓
                </p>
              </div>
            </div>
          )}

          {/* Section Migration Données */}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Note :</strong> Cette opération est irréversible. Toutes les données sans projet seront associées au projet sélectionné.
                </p>
              </div>
            </>
          )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

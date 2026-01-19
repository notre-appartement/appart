'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaHome, FaHeart, FaMapMarkerAlt, FaBuilding, FaUsers, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';
import { useProject } from '@/contexts/ProjectContext';

export default function Home() {
  const router = useRouter();
  const { currentProject, loading } = useProject();

  useEffect(() => {
    // Si pas de projet actif après le chargement, rediriger vers la sélection
    if (!loading && !currentProject) {
      router.push('/projets');
    }
  }, [currentProject, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return null; // La redirection se fait via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🏠 {currentProject.nom}
              </h1>
              {currentProject.description && (
                <p className="text-gray-600">{currentProject.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                href="/parametres-projet"
                className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Paramètres du projet"
              >
                ⚙️ Paramètres
              </Link>
              <Link
                href="/projets"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FaUsers />
                Changer de projet
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 pb-6 border-b">
            {currentProject.membres.map((membre, idx) => (
              <div
                key={idx}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                {membre.name}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/appartements"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 block"
            >
              <FaBuilding className="text-4xl mb-3 mx-auto" />
              <h2 className="text-xl font-bold mb-2">Appartements</h2>
              <p className="text-sm opacity-90">
                Gérer les appartements à visiter et visités
              </p>
            </Link>

            <Link
              href="/envies"
              className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 block"
            >
              <FaHeart className="text-4xl mb-3 mx-auto" />
              <h2 className="text-xl font-bold mb-2">Nos Envies</h2>
              <p className="text-sm opacity-90">
                Définir ce qui est important pour nous
              </p>
            </Link>

            <Link
              href="/emplacements"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 block"
            >
              <FaMapMarkerAlt className="text-4xl mb-3 mx-auto" />
              <h2 className="text-xl font-bold mb-2">Emplacements</h2>
              <p className="text-sm opacity-90">
                Nos lieux préférés et importants
              </p>
            </Link>

            <Link
              href="/carte"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 block"
            >
              <FaHome className="text-4xl mb-3 mx-auto" />
              <h2 className="text-xl font-bold mb-2">Carte Interactive</h2>
              <p className="text-sm opacity-90">
                Visualiser tous les emplacements
              </p>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine className="text-green-600" />
              Projet Collaboratif
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">👥 Membres actifs</span>
                <span className="font-bold text-blue-600">{currentProject.membres.length}</span>
              </div>
              <div className="text-sm text-gray-600 mt-4">
                <p className="font-medium mb-2">Membres du projet :</p>
                <div className="flex flex-wrap gap-2">
                  {currentProject.membres.map((membre, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {membre.name}
                      {membre.isAdmin && ' 👑'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📋 Actions Rapides
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                <Link href="/appartements/nouveau" className="text-blue-600 hover:underline">
                  Ajouter un nouvel appartement
                </Link>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                <Link href="/envies" className="text-blue-600 hover:underline">
                  Définir vos envies et critères
                </Link>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                <Link href="/emplacements/nouveau" className="text-blue-600 hover:underline">
                  Ajouter un emplacement important
                </Link>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                <Link href="/parametres-projet" className="text-blue-600 hover:underline">
                  Gérer le projet et les membres
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

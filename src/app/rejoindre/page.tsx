'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { useProject } from '@/contexts/ProjectContext';
import AuthGuard from '@/components/AuthGuard';
import { FaArrowLeft, FaUserPlus, FaCheckCircle } from 'react-icons/fa';

export default function RejoindreProjetPage() {
  const router = useRouter();
  const { joinProjet, projets } = useProjects();
  const { setCurrentProject } = useProject();
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoining(true);
    setError(null);

    try {
      const projetId = await joinProjet(inviteCode.trim());

      // Attendre un peu que le projet soit ajouté à la liste
      setTimeout(() => {
        const projet = projets.find(p => p.id === projetId);
        if (projet) {
          setCurrentProject(projet);
        }
        router.push('/');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Code d\'invitation invalide');
      setJoining(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Link
            href="/projets"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6 font-medium"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux projets
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUserPlus className="text-4xl text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Rejoindre un Projet
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Entrez le code d'invitation à 8 caractères
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleJoinProject} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Code d'invitation
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 text-center text-2xl font-mono tracking-widest uppercase"
                  placeholder="XXXX-XXXX"
                  maxLength={8}
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Le code est composé de 8 lettres et chiffres
                </p>
              </div>

              <button
                type="submit"
                disabled={joining || inviteCode.length !== 8}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {joining ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Rejoindre le projet
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>💡 Astuce :</strong> Demandez le code d'invitation à la personne qui a créé le projet. Vous le trouverez dans les paramètres du projet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

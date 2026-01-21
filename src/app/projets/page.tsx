'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useProjects } from '@/hooks/useProjects';
import { useProject } from '@/contexts/ProjectContext';
import { useSubscription } from '@/hooks/useSubscription';
import AuthGuard from '@/components/AuthGuard';
import { FaPlus, FaUsers, FaArrowRight, FaCalendar, FaUserPlus, FaCrown, FaLock } from 'react-icons/fa';

export default function ProjetsPage() {
  const router = useRouter();
  const { projets, loading, createProjet } = useProjects();
  const { setCurrentProject } = useProject();
  const { canCreateProject, getLimitMessage, planConfig, currentPlan } = useSubscription();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Vérifier si l'utilisateur peut créer un nouveau projet
  const canCreate = canCreateProject(projets.length);

  const handleSelectProject = (projet: any) => {
    setCurrentProject(projet);
    router.push('/');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const projetId = await createProjet(newProjectName, newProjectDescription);
      const newProjet = projets.find(p => p.id === projetId);
      if (newProjet) {
        setCurrentProject(newProjet);
      }
      toast.success('🎉 Projet créé avec succès !');
      router.push('/');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création du projet');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              🏠 Mes Projets de Recherche
            </h1>
            <p className="text-gray-600">
              Sélectionnez un projet existant ou créez-en un nouveau pour collaborer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Carte Créer un nouveau projet */}
            {!showCreateForm ? (
              canCreate ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-white border-2 border-dashed border-blue-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                      <FaPlus className="text-3xl text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Nouveau Projet
                    </h3>
                    <p className="text-sm text-gray-600">
                      Créez un projet et invitez vos collaborateurs
                    </p>
                  </div>
                </button>
              ) : (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-300 rounded-xl p-8 relative overflow-hidden">
                  {/* Badge limite */}
                  <div className="absolute top-3 right-3">
                    <FaLock className="text-orange-400 text-xl" />
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCrown className="text-3xl text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Limite atteinte
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      {getLimitMessage('projects')}
                    </p>
                    <p className="text-xs text-gray-600 mb-4">
                      Vous avez <strong>{projets.length}/{planConfig.features.maxProjects}</strong> projet{projets.length > 1 ? 's' : ''}
                    </p>
                    <Link
                      href="/abonnement"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                    >
                      <FaCrown />
                      Passer à {currentPlan === 'free' ? 'Premium' : 'Pro'}
                    </Link>
                    <p className="text-xs text-gray-500 mt-3">
                      ✨ Essai gratuit de 14 jours
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-500">
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du projet *
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                      placeholder="Ex: Appart Lyon 2026"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                      rows={3}
                      placeholder="Recherche d'appartement à Lyon..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {creating ? 'Création...' : 'Créer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewProjectName('');
                        setNewProjectDescription('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Liste des projets existants */}
            {projets.map((projet) => (
              <div
                key={projet.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 cursor-pointer group"
                onClick={() => handleSelectProject(projet)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {projet.nom}
                    </h3>
                    {projet.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {projet.description}
                      </p>
                    )}
                  </div>
                  <FaArrowRight className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <FaUsers />
                    <span>{projet.membres.length} membre{projet.membres.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendar />
                    <span>{projet.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {projet.membres.map((membre, idx) => (
                      <div
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {membre.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rejoindre un projet avec un code */}
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaUserPlus className="text-2xl text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Rejoindre un projet existant
                </h3>
                <p className="text-sm text-gray-600">
                  Entrez le code d'invitation que vous avez reçu
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/rejoindre')}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Entrer un code d'invitation
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

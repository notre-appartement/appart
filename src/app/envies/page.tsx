'use client';

import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaHeart, FaUser, FaTrash, FaEdit } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEnvies } from '@/hooks/useEnvies';
import { useProject } from '@/contexts/ProjectContext';

export default function EnviesPage() {
  const { displayName } = useAuth();
  const { envies, loading, addEnvie, updateEnvie, deleteEnvie } = useEnvies();
  const { currentProject, loading: projectLoading } = useProject();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    definition: '',
    important: false,
    auteur: '', // Sera initialisé par useEffect
  });

  // Récupérer la liste des membres du projet avec une option "Partagé"
  const membresOptions = useMemo(() => {
    if (!currentProject) return ['Partagé'];

    const membres = currentProject.membres.map(m => m.name);
    return ['Partagé', ...membres];
  }, [currentProject]);

  // Initialiser l'auteur par défaut quand les membres sont chargés
  useEffect(() => {
    if (membresOptions.length > 0 && !formData.auteur) {
      const defaultAuteur = membresOptions.includes(displayName) ? displayName : membresOptions[0];
      setFormData(prev => ({ ...prev, auteur: defaultAuteur }));
    }
  }, [membresOptions, displayName, formData.auteur]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Mode édition
        await updateEnvie(editingId, formData);
        toast.success('✏️ Envie modifiée avec succès !');
        setEditingId(null);
      } else {
        // Mode ajout
        await addEnvie(formData);
        toast.success('💭 Envie ajoutée avec succès !');
      }
      // Réinitialiser avec le premier membre ou "Partagé"
      const defaultAuteur = membresOptions.includes(displayName) ? displayName : membresOptions[0];
      setFormData({ nom: '', definition: '', important: false, auteur: defaultAuteur });
      setShowForm(false);
    } catch (err) {
      toast.error(editingId ? 'Erreur lors de la modification de l\'envie' : 'Erreur lors de l\'ajout de l\'envie');
    }
  };

  const handleEdit = (envie: any) => {
    setFormData({
      nom: envie.nom,
      definition: envie.definition || '',
      important: envie.important,
      auteur: envie.auteur,
    });
    setEditingId(envie.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    const defaultAuteur = membresOptions.includes(displayName) ? displayName : membresOptions[0];
    setFormData({ nom: '', definition: '', important: false, auteur: defaultAuteur });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string, nom: string) => {
    if (confirm(`Voulez-vous vraiment supprimer "${nom}" ?`)) {
      try {
        await deleteEnvie(id);
        toast.success('🗑️ Envie supprimée');
      } catch (err) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  if (projectLoading) {
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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Aucun projet actif</h2>
          <p className="text-gray-600 mb-4">
            Vous devez sélectionner un projet avant de gérer vos envies.
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              💕 Nos Envies et Critères
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <FaPlus />
              <span>Ajouter une envie</span>
            </button>
          </div>

          {/* Formulaire d'ajout/édition */}
          {showForm && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editingId ? '✏️ Modifier l\'envie' : '➕ Nouvelle envie'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'envie *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Ex: Balcon ou terrasse"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.definition}
                    onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Pourquoi c'est important..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.important}
                      onChange={(e) => setFormData({ ...formData, important: e.target.checked })}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Critère important</span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Qui ?</label>
                    <select
                      value={formData.auteur}
                      onChange={(e) => setFormData({ ...formData, auteur: e.target.value })}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-gray-900"
                    >
                      {membresOptions.map((membre) => (
                        <option key={membre} value={membre}>
                          {membre === 'Partagé' ? '👫 Partagé' : `👤 ${membre}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    {editingId ? 'Enregistrer' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>

                {!editingId && (
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <FaUser className="text-pink-600" />
                    <span>Ajouté par : <strong>{displayName}</strong></span>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Liste des envies */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-600"></div>
              <p className="text-gray-600 mt-2">Chargement...</p>
            </div>
          ) : envies.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <FaHeart className="text-6xl mx-auto mb-4 text-gray-300" />
              <p className="text-xl">Aucune envie définie pour le moment</p>
              <p className="text-sm mt-2">Cliquez sur "Ajouter une envie" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {envies.map((envie) => (
                <div
                  key={envie.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{envie.nom}</h3>
                        {envie.important && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                            Important
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {envie.auteur === 'Partagé' ? '👫 Partagé' : `👤 ${envie.auteur}`}
                        </span>
                      </div>
                      {envie.definition && (
                        <p className="text-gray-600 text-sm mb-2">{envie.definition}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        Ajouté par {envie.auteurNom} le {envie.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(envie)}
                        className="text-blue-500 hover:text-blue-700 p-2"
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(envie.id, envie.nom)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            💡 Suggestions d'envies
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Balcon ou terrasse',
              'Proche des transports',
              'Quartier calme',
              'Commerce à proximité',
              'Lumineux',
              'Parking',
              'Cave ou rangement',
              'Cuisine équipée'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setFormData({ ...formData, nom: suggestion });
                  setShowForm(true);
                }}
                className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-700 hover:bg-pink-50 hover:border-pink-300 transition-colors text-left"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

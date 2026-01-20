'use client';

import React, { useState } from 'react';
import { FaTrash, FaArchive, FaChartBar, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useProjectDeletion, DeletionMode } from '@/hooks/useProjectDeletion';
import { Projet } from '@/types';

interface DeleteProjectModalProps {
  projet: Projet;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteProjectModal({
  projet,
  isOpen,
  onClose,
  onSuccess
}: DeleteProjectModalProps) {
  const { deleteProject, loading } = useProjectDeletion();
  const [selectedMode, setSelectedMode] = useState<DeletionMode>('archive');
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== projet.nom) {
      alert('Le nom du projet ne correspond pas.');
      return;
    }

    const result = await deleteProject(projet.id, selectedMode);

    if (result.success) {
      alert(result.message);
      onSuccess();
      onClose();
    } else {
      alert(result.message);
    }
  };

  const modes = [
    {
      id: 'archive' as DeletionMode,
      title: '📦 Archiver (Recommandé)',
      description: 'Le projet sera masqué pendant 30 jours, puis supprimé définitivement.',
      color: 'blue',
      details: [
        '✅ Restauration possible pendant 30 jours',
        '✅ Toutes les données sont conservées',
        '⏰ Suppression automatique après 30 jours',
      ]
    },
    {
      id: 'anonymize' as DeletionMode,
      title: '📊 Anonymiser les appartements',
      description: 'Les appartements sont anonymisés et conservés pour les statistiques de marché.',
      color: 'green',
      details: [
        '📈 Contribue aux statistiques de marché',
        '🔒 Données personnelles supprimées',
        '💰 Aide les futurs utilisateurs (features premium)',
        '❌ Envies et emplacements supprimés',
      ]
    },
    {
      id: 'permanent' as DeletionMode,
      title: '🗑️ Supprimer définitivement',
      description: 'Suppression immédiate et irréversible de toutes les données.',
      color: 'red',
      details: [
        '⚠️ Action irréversible',
        '❌ Aucune récupération possible',
        '🗑️ Toutes les données effacées',
      ]
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-200 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaExclamationTriangle className="text-red-600 text-2xl" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Supprimer le projet
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {projet.nom}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Options de suppression */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 mb-4">
            Choisissez comment vous souhaitez supprimer ce projet :
          </p>

          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedMode === mode.id
                  ? `border-${mode.color}-500 bg-${mode.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  checked={selectedMode === mode.id}
                  onChange={() => setSelectedMode(mode.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {mode.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {mode.description}
                  </p>
                  <ul className="space-y-1">
                    {mode.details.map((detail, idx) => (
                      <li key={idx} className="text-xs text-gray-500">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          ))}

          {/* Confirmation */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pour confirmer, tapez le nom du projet : <strong>{projet.nom}</strong>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Nom du projet"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || confirmText !== projet.nom}
            className={`px-6 py-2 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
              selectedMode === 'archive'
                ? 'bg-blue-600 hover:bg-blue-700'
                : selectedMode === 'anonymize'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Traitement...</span>
              </>
            ) : (
              <>
                {selectedMode === 'archive' && <FaArchive />}
                {selectedMode === 'anonymize' && <FaChartBar />}
                {selectedMode === 'permanent' && <FaTrash />}
                <span>Confirmer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

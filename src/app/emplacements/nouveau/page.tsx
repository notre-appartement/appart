'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { useEmplacements } from '@/hooks/useEmplacements';

export default function NouvelEmplacementPage() {
  const router = useRouter();
  const { addEmplacement } = useEmplacements();
  const [loading, setLoading] = useState(false);
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
      await addEmplacement(formData);
      router.push('/emplacements');
    } catch (err) {
      alert('Erreur lors de l\'ajout de l\'emplacement');
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-800">
            📍 Nouvel Emplacement
          </h1>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'emplacement *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Bureau de Marie, Salle de sport, Supermarché"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse complète *
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="45 Avenue des Champs-Élysées, 75008 Paris"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Conseil : Copiez l'adresse depuis Google Maps pour plus de précision
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'emplacement *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Ex: Lieu de travail - important d'être à moins de 30min en transport"
              />
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
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
              className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
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

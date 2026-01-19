'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Emplacement } from '@/types';
import { useEmplacements } from '@/hooks/useEmplacements';

export default function ModifierEmplacementPage() {
  const params = useParams();
  const router = useRouter();
  const { updateEmplacement } = useEmplacements();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emplacement, setEmplacement] = useState<Emplacement | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    type: 'travail' as 'travail' | 'famille' | 'loisirs' | 'commerces' | 'autre',
    description: '',
  });

  // Charger l'emplacement
  useEffect(() => {
    const fetchEmplacement = async () => {
      try {
        const docRef = doc(db, 'emplacements', params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = {
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          } as Emplacement;

          setEmplacement(data);

          // Remplir le formulaire
          setFormData({
            nom: data.nom || '',
            adresse: data.adresse || '',
            type: data.type || 'travail',
            description: data.description || '',
          });
        } else {
          alert('Emplacement non trouvé');
          router.push('/emplacements');
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        alert('Erreur lors du chargement de l\'emplacement');
      } finally {
        setLoading(false);
      }
    };

    fetchEmplacement();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateEmplacement(params.id as string, formData);
      router.push('/emplacements');
    } catch (err) {
      alert('Erreur lors de la modification de l\'emplacement');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!emplacement) {
    return null;
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
          <h1 className="text-3xl font-bold text-gray-800">
            ✏️ Modifier l'emplacement
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
              disabled={saving}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FaSave />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
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

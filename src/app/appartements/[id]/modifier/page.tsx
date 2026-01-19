'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Appartement } from '@/types';
import { useAppartements } from '@/hooks/useAppartements';

export default function ModifierAppartementPage() {
  const params = useParams();
  const router = useRouter();
  const { updateAppartement } = useAppartements();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appartement, setAppartement] = useState<Appartement | null>(null);

  const [formData, setFormData] = useState({
    titre: '',
    adresse: '',
    ville: '',
    codePostal: '',
    prix: 0,
    charges: 0,
    surface: 0,
    pieces: 0,
    chambres: 0,
    etage: 0,
    ascenseur: false,
    meuble: false,
    visite: false,
    dateVisite: '',
    choix: '' as '' | 'bon' | 'moyen' | 'pas_bon',
    description: '',
    lienAnnonce: '',
    agence: '',
    contactAgence: '',
  });
  const [avantages, setAvantages] = useState<string[]>([]);
  const [newAvantage, setNewAvantage] = useState('');
  const [inconvenients, setInconvenients] = useState<string[]>([]);
  const [newInconvenient, setNewInconvenient] = useState('');

  // Charger l'appartement
  useEffect(() => {
    const fetchAppartement = async () => {
      try {
        const docRef = doc(db, 'appartements', params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const rawData = docSnap.data();
          const data = {
            id: docSnap.id,
            ...rawData,
            createdAt: rawData.createdAt?.toDate() || new Date(),
            updatedAt: rawData.updatedAt?.toDate() || new Date(),
            dateVisite: rawData.dateVisite ? rawData.dateVisite.toDate() : undefined,
          } as Appartement;

          setAppartement(data);

          // Remplir le formulaire
          setFormData({
            titre: data.titre || '',
            adresse: data.adresse || '',
            ville: data.ville || '',
            codePostal: data.codePostal || '',
            prix: data.prix || 0,
            charges: data.charges || 0,
            surface: data.surface || 0,
            pieces: data.pieces || 0,
            chambres: data.chambres || 0,
            etage: data.etage || 0,
            ascenseur: data.ascenseur || false,
            meuble: data.meuble || false,
            visite: data.visite || false,
            dateVisite: data.dateVisite ? data.dateVisite.toISOString().split('T')[0] : '',
            choix: data.choix as any || '',
            description: data.description || '',
            lienAnnonce: data.lienAnnonce || '',
            agence: data.agence || '',
            contactAgence: data.contactAgence || '',
          });

          setAvantages(data.avantages || []);
          setInconvenients(data.inconvenients || []);
        } else {
          alert('Appartement non trouvé');
          router.push('/appartements');
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        alert('Erreur lors du chargement de l\'appartement');
      } finally {
        setLoading(false);
      }
    };

    fetchAppartement();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToUpdate: any = {
        ...formData,
        choix: formData.choix || null,
        avantages,
        inconvenients,
      };

      // N'ajouter dateVisite que si elle existe
      if (formData.dateVisite) {
        dataToUpdate.dateVisite = new Date(formData.dateVisite);
      }

      await updateAppartement(params.id as string, dataToUpdate);
      router.push(`/appartements/${params.id}`);
    } catch (err) {
      alert('Erreur lors de la modification de l\'appartement');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!appartement) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/appartements/${params.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux détails
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            ✏️ Modifier l'appartement
          </h1>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8">
          {/* Informations générales */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
              📍 Informations générales
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de l'annonce *
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Bel appartement T3 avec balcon"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12 rue de la République"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Paris"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={formData.codePostal}
                    onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="75001"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Prix et charges */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
              💰 Prix et charges
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loyer mensuel (€) *
                </label>
                <input
                  type="number"
                  value={formData.prix || ''}
                  onChange={(e) => setFormData({ ...formData, prix: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charges mensuelles (€)
                </label>
                <input
                  type="number"
                  value={formData.charges || ''}
                  onChange={(e) => setFormData({ ...formData, charges: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="150"
                />
              </div>
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
              📐 Caractéristiques
            </h2>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface (m²) *
                </label>
                <input
                  type="number"
                  value={formData.surface || ''}
                  onChange={(e) => setFormData({ ...formData, surface: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="65"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de pièces *
                </label>
                <input
                  type="number"
                  value={formData.pieces || ''}
                  onChange={(e) => setFormData({ ...formData, pieces: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chambres
                </label>
                <input
                  type="number"
                  value={formData.chambres || ''}
                  onChange={(e) => setFormData({ ...formData, chambres: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Étage
                </label>
                <input
                  type="number"
                  value={formData.etage || ''}
                  onChange={(e) => setFormData({ ...formData, etage: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="3"
                />
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ascenseur}
                    onChange={(e) => setFormData({ ...formData, ascenseur: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Ascenseur</span>
                </label>
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.meuble}
                    onChange={(e) => setFormData({ ...formData, meuble: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Meublé</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
              📝 Description
            </h2>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Description de l'appartement, points forts, etc."
            />
          </div>

          {/* Statut de visite */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
              📅 Statut de visite
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="visite"
                  checked={formData.visite}
                  onChange={(e) => setFormData({ ...formData, visite: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="visite" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Appartement déjà visité
                </label>
              </div>

              {formData.visite && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de visite
                    </label>
                    <input
                      type="date"
                      value={formData.dateVisite}
                      onChange={(e) => setFormData({ ...formData, dateVisite: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Évaluation
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="choix"
                          value="bon"
                          checked={formData.choix === 'bon'}
                          onChange={(e) => setFormData({ ...formData, choix: 'bon' })}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm font-medium text-gray-700">✅ Bon</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="choix"
                          value="moyen"
                          checked={formData.choix === 'moyen'}
                          onChange={(e) => setFormData({ ...formData, choix: 'moyen' })}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-gray-700">⚠️ Moyen</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="choix"
                          value="pas_bon"
                          checked={formData.choix === 'pas_bon'}
                          onChange={(e) => setFormData({ ...formData, choix: 'pas_bon' })}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm font-medium text-gray-700">❌ Pas bon</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Avantages et inconvénients */}
          {formData.visite && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                ⚖️ Avantages et Inconvénients
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Avantages */}
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    ✅ Points positifs
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newAvantage}
                      onChange={(e) => setNewAvantage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newAvantage.trim()) {
                            setAvantages([...avantages, newAvantage.trim()]);
                            setNewAvantage('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: Proche des commerces"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newAvantage.trim()) {
                          setAvantages([...avantages, newAvantage.trim()]);
                          setNewAvantage('');
                        }
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {avantages.map((avantage, index) => (
                      <li key={index} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                        <span className="text-sm text-green-800">✓ {avantage}</span>
                        <button
                          type="button"
                          onClick={() => setAvantages(avantages.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Inconvénients */}
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    ❌ Points négatifs
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newInconvenient}
                      onChange={(e) => setNewInconvenient(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newInconvenient.trim()) {
                            setInconvenients([...inconvenients, newInconvenient.trim()]);
                            setNewInconvenient('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Ex: Pas d'ascenseur"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newInconvenient.trim()) {
                          setInconvenients([...inconvenients, newInconvenient.trim()]);
                          setNewInconvenient('');
                        }
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {inconvenients.map((inconvenient, index) => (
                      <li key={index} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded">
                        <span className="text-sm text-red-800">✗ {inconvenient}</span>
                        <button
                          type="button"
                          onClick={() => setInconvenients(inconvenients.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Contact et annonce */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
              📞 Contact et annonce
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien de l'annonce
                </label>
                <input
                  type="url"
                  value={formData.lienAnnonce}
                  onChange={(e) => setFormData({ ...formData, lienAnnonce: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'agence
                  </label>
                  <input
                    type="text"
                    value={formData.agence}
                    onChange={(e) => setFormData({ ...formData, agence: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Agence Immobilière ABC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact agence
                  </label>
                  <input
                    type="text"
                    value={formData.contactAgence}
                    onChange={(e) => setFormData({ ...formData, contactAgence: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="01 23 45 67 89"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FaSave />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
            <Link
              href={`/appartements/${params.id}`}
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

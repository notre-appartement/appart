'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { useAppartements } from '@/hooks/useAppartements';
import { StarRating } from '@/components/StarRating';
import { geocodeAddressWithRetry } from '@/lib/geocoding';
import { uploadMultipleImages } from '@/lib/storage';

// Calculer la note globale à partir des notes détaillées
function calculateGlobalNote(notes: { luminosite: number; bruit: number; etat: number; quartier: number; proximite: number }): number {
  const values = Object.values(notes).filter(n => n > 0);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 10) / 10; // Arrondi à 1 décimale
}

export default function NouvelAppartementPage() {
  const router = useRouter();
  const { addAppartement } = useAppartements();
  const [loading, setLoading] = useState(false);
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
    fraisAgence: 0,
    depotGarantie: 0,
    assuranceHabitation: 0,
  });
  const [avantages, setAvantages] = useState<string[]>([]);
  const [newAvantage, setNewAvantage] = useState('');
  const [inconvenients, setInconvenients] = useState<string[]>([]);
  const [newInconvenient, setNewInconvenient] = useState('');
  const [notes, setNotes] = useState({
    luminosite: 0,
    bruit: 0,
    etat: 0,
    quartier: 0,
    proximite: 0,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Créer d'abord l'appartement pour avoir un ID
      const tempId = `temp_${Date.now()}`;

      // 2. Upload des images (si il y en a)
      let uploadedImageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedImageUrls = await uploadMultipleImages(selectedFiles, `appartements/${tempId}`);
      }

      // 3. Géolocaliser l'adresse
      const fullAddress = `${formData.adresse}, ${formData.codePostal} ${formData.ville}`;
      const coordinates = await geocodeAddressWithRetry(fullAddress);

      const dataToSubmit: any = {
        ...formData,
        choix: formData.choix || null,
        photos: uploadedImageUrls,
        documents: [],
        avantages,
        inconvenients,
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
      };

      // N'ajouter dateVisite que si elle existe
      if (formData.dateVisite) {
        dataToSubmit.dateVisite = new Date(formData.dateVisite);
      }

      // N'ajouter les notes que si l'appartement a été visité
      if (formData.visite && Object.values(notes).some(n => n > 0)) {
        dataToSubmit.notes = notes;
        dataToSubmit.noteGlobale = calculateGlobalNote(notes);
      }

      await addAppartement(dataToSubmit);
      router.push('/appartements');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'ajout de l\'appartement');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/appartements"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux appartements
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            🏢 Nouvel Appartement
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="150"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frais d'agence (€)
                </label>
                <input
                  type="number"
                  value={formData.fraisAgence || ''}
                  onChange={(e) => setFormData({ ...formData, fraisAgence: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Ex: 800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dépôt de garantie (€)
                </label>
                <input
                  type="number"
                  value={formData.depotGarantie || ''}
                  onChange={(e) => setFormData({ ...formData, depotGarantie: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Ex: 1200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assurance habitation (€/an)
                </label>
                <input
                  type="number"
                  value={formData.assuranceHabitation || ''}
                  onChange={(e) => setFormData({ ...formData, assuranceHabitation: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Ex: 200"
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

          {/* Photos */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
              📸 Photos
            </h2>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setSelectedFiles(files);
                  // Créer des previews
                  const previews = files.map(file => URL.createObjectURL(file));
                  setImageUrls(previews);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500">
                Ajoutez des photos de l'appartement (max 10 photos, 5MB chacune)
              </p>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Photo principale
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = selectedFiles.filter((_, i) => i !== index);
                          const newUrls = imageUrls.filter((_, i) => i !== index);
                          setSelectedFiles(newFiles);
                          setImageUrls(newUrls);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

          {/* Notes par critères */}
          {formData.visite && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                ⭐ Notes par critères
              </h2>
              <div className="space-y-4 bg-yellow-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  Notez chaque critère de 1 à 5 étoiles pour vous aider à comparer les appartements
                </p>
                <StarRating
                  rating={notes.luminosite}
                  onChange={(val) => setNotes({ ...notes, luminosite: val })}
                  label="☀️ Luminosité"
                />
                <StarRating
                  rating={notes.bruit}
                  onChange={(val) => setNotes({ ...notes, bruit: val })}
                  label="🔇 Calme/Bruit"
                />
                <StarRating
                  rating={notes.etat}
                  onChange={(val) => setNotes({ ...notes, etat: val })}
                  label="🏠 État général"
                />
                <StarRating
                  rating={notes.quartier}
                  onChange={(val) => setNotes({ ...notes, quartier: val })}
                  label="🏘️ Quartier"
                />
                <StarRating
                  rating={notes.proximite}
                  onChange={(val) => setNotes({ ...notes, proximite: val })}
                  label="📍 Proximité"
                />

                {/* Note globale calculée */}
                {Object.values(notes).some(n => n > 0) && (
                  <div className="mt-6 pt-4 border-t border-yellow-200">
                    <div className="flex items-center justify-between bg-yellow-100 p-4 rounded-lg">
                      <span className="font-bold text-lg text-gray-800">Note globale :</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold text-yellow-600">
                          {calculateGlobalNote(notes).toFixed(1)}
                        </span>
                        <span className="text-gray-600">/5</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FaSave />
              <span>{loading ? 'Enregistrement...' : 'Enregistrer l\'appartement'}</span>
            </button>
            <Link
              href="/appartements"
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

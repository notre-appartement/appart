'use client';

import { FaPlus, FaMapMarkerAlt, FaEuroSign, FaRuler, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { useAppartements } from '@/hooks/useAppartements';

export default function AppartementsPage() {
  const { appartements, loading, deleteAppartement } = useAppartements();

  const handleDelete = async (id: string, titre: string) => {
    if (confirm(`Voulez-vous vraiment supprimer "${titre}" ?`)) {
      try {
        await deleteAppartement(id);
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              🏢 Nos Appartements
            </h2>
            <Link
              href="/appartements/nouveau"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <FaPlus />
              <span>Ajouter un appartement</span>
            </Link>
          </div>

          {/* Liste des appartements */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Chargement...</p>
            </div>
          ) : appartements.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <FaPlus className="text-6xl mx-auto mb-4 text-gray-300" />
              <p className="text-xl">Aucun appartement pour le moment</p>
              <p className="text-sm mt-2">Cliquez sur "Ajouter un appartement" pour commencer</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appartements.map((appart) => (
                <div
                  key={appart.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    {appart.photos && appart.photos.length > 0 ? (
                      <img
                        src={appart.photos[0]}
                        alt={appart.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaMapMarkerAlt className="text-6xl text-blue-300" />
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800 flex-1">
                        {appart.titre}
                      </h3>
                      {appart.visite && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          appart.choix === 'bon' ? 'bg-green-100 text-green-700' :
                          appart.choix === 'moyen' ? 'bg-yellow-100 text-yellow-700' :
                          appart.choix === 'pas_bon' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {appart.choix === 'bon' ? '✓ Bon' :
                           appart.choix === 'moyen' ? '~ Moyen' :
                           appart.choix === 'pas_bon' ? '✗ Pas bon' :
                           'Visité'}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 flex items-center">
                      <FaMapMarkerAlt className="mr-1" />
                      {appart.ville}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
                      <span className="flex items-center font-semibold text-lg text-blue-600">
                        <FaEuroSign className="mr-1" />
                        {appart.prix} €
                      </span>
                      <span className="flex items-center">
                        <FaRuler className="mr-1" />
                        {appart.surface} m²
                      </span>
                      <span>
                        {appart.pieces} pièces
                      </span>
                    </div>

                    {appart.noteGlobale && (
                      <div className="mb-3">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={star <= appart.noteGlobale! ? 'text-yellow-400' : 'text-gray-300'}
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {appart.noteGlobale.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mb-3">
                      Ajouté par {appart.createdByName}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-3 border-t">
                      <Link
                        href={`/appartements/${appart.id}`}
                        className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded hover:bg-blue-100 transition-colors text-center text-sm"
                      >
                        Voir détails
                      </Link>
                      <button
                        onClick={() => handleDelete(appart.id, appart.titre)}
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
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaEuroSign,
  FaRuler,
  FaBed,
  FaBuilding,
  FaPhone,
  FaLink,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Appartement } from '@/types';
import { useAppartements } from '@/hooks/useAppartements';

export default function AppartementDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { deleteAppartement } = useAppartements();
  const [appartement, setAppartement] = useState<Appartement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppartement = async () => {
      try {
        const docRef = doc(db, 'appartements', params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setAppartement({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            dateVisite: data.dateVisite ? data.dateVisite.toDate() : undefined,
          } as Appartement);
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

  const handleDelete = async () => {
    if (!appartement) return;

    if (confirm(`Voulez-vous vraiment supprimer "${appartement.titre}" ?`)) {
      try {
        await deleteAppartement(appartement.id);
        router.push('/appartements');
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
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
            href="/appartements"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux appartements
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {appartement.titre}
              </h1>
              <p className="text-gray-600 flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                {appartement.adresse}, {appartement.codePostal} {appartement.ville}
              </p>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/appartements/${appartement.id}/modifier`}
                className="text-blue-500 hover:text-blue-700 p-2 border border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                title="Modifier"
              >
                <FaEdit />
              </Link>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 p-2 border border-red-500 rounded-lg hover:bg-red-50 transition-colors"
                title="Supprimer"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>

        {/* Image principale */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-6">
          <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            {appartement.photos && appartement.photos.length > 0 ? (
              <img
                src={appartement.photos[0]}
                alt={appartement.titre}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaMapMarkerAlt className="text-9xl text-blue-300" />
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <FaEuroSign className="text-4xl text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Loyer</p>
            <p className="text-3xl font-bold text-gray-800">{appartement.prix} €</p>
            {appartement.charges > 0 && (
              <p className="text-xs text-gray-500 mt-1">+ {appartement.charges} € de charges</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <FaRuler className="text-4xl text-green-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Surface</p>
            <p className="text-3xl font-bold text-gray-800">{appartement.surface} m²</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <FaBed className="text-4xl text-purple-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">Pièces</p>
            <p className="text-3xl font-bold text-gray-800">{appartement.pieces}</p>
            {appartement.chambres > 0 && (
              <p className="text-xs text-gray-500 mt-1">dont {appartement.chambres} chambres</p>
            )}
          </div>
        </div>

        {/* Statut de visite */}
        {appartement.visite && (
          <div className={`rounded-lg p-6 mb-6 ${
            appartement.choix === 'bon' ? 'bg-green-50 border-l-4 border-green-500' :
            appartement.choix === 'moyen' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
            appartement.choix === 'pas_bon' ? 'bg-red-50 border-l-4 border-red-500' :
            'bg-gray-50 border-l-4 border-gray-500'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg mb-1">
                  {appartement.choix === 'bon' && '✅ Coup de cœur !'}
                  {appartement.choix === 'moyen' && '🤔 Mitigé'}
                  {appartement.choix === 'pas_bon' && '❌ Pas convaincu'}
                  {!appartement.choix && 'ℹ️ Appartement visité'}
                </p>
                {appartement.dateVisite && (
                  <p className="text-sm text-gray-600">
                    Visité le {appartement.dateVisite.toLocaleDateString()}
                  </p>
                )}
              </div>
              {appartement.noteGlobale && (
                <div className="text-right">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-2xl ${star <= appartement.noteGlobale! ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {appartement.noteGlobale.toFixed(1)}/5
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Caractéristiques */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">
            📋 Caractéristiques
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {appartement.etage !== undefined && (
              <div className="flex items-center">
                <FaBuilding className="text-gray-400 mr-3" />
                <span className="text-gray-700">
                  Étage {appartement.etage}
                  {appartement.ascenseur && ' • Avec ascenseur'}
                </span>
              </div>
            )}
            <div className="flex items-center">
              <span className="text-gray-700">
                {appartement.meuble ? '✅ Meublé' : '❌ Non meublé'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {appartement.description && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">
              📝 Description
            </h2>
            <p className="text-gray-700 whitespace-pre-line">{appartement.description}</p>
          </div>
        )}

        {/* Avantages & Inconvénients */}
        {((appartement.avantages && appartement.avantages.length > 0) ||
          (appartement.inconvenients && appartement.inconvenients.length > 0)) && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {appartement.avantages && appartement.avantages.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                  <FaCheckCircle className="mr-2" />
                  Points positifs
                </h3>
                <ul className="space-y-2">
                  {appartement.avantages.map((avantage, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{avantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {appartement.inconvenients && appartement.inconvenients.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center">
                  <FaTimesCircle className="mr-2" />
                  Points négatifs
                </h3>
                <ul className="space-y-2">
                  {appartement.inconvenients.map((inconvenient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">✗</span>
                      <span className="text-gray-700">{inconvenient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Contact et liens */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">
            📞 Contact
          </h2>
          <div className="space-y-3">
            {appartement.lienAnnonce && (
              <div className="flex items-center">
                <FaLink className="text-gray-400 mr-3" />
                <a
                  href={appartement.lienAnnonce}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Voir l'annonce originale
                </a>
              </div>
            )}
            {appartement.agence && (
              <div className="flex items-center">
                <FaBuilding className="text-gray-400 mr-3" />
                <span className="text-gray-700">{appartement.agence}</span>
              </div>
            )}
            {appartement.contactAgence && (
              <div className="flex items-center">
                <FaPhone className="text-gray-400 mr-3" />
                <span className="text-gray-700">{appartement.contactAgence}</span>
              </div>
            )}
          </div>
        </div>

        {/* Métadonnées */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p>Ajouté par {appartement.createdByName} le {appartement.createdAt.toLocaleDateString()}</p>
          {appartement.updatedAt && appartement.updatedAt.getTime() !== appartement.createdAt.getTime() && (
            <p>Dernière modification : {appartement.updatedAt.toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

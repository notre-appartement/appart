'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaStar, FaEuroSign, FaRuler, FaBed, FaBuilding, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Appartement } from '@/types';

function ComparaisonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [appartements, setAppartements] = useState<Appartement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppartements = async () => {
      const ids = searchParams.get('ids')?.split(',') || [];

      if (ids.length < 2) {
        alert('Sélectionnez au moins 2 appartements à comparer');
        router.push('/appartements');
        return;
      }

      try {
        const promises = ids.map(async (id) => {
          const docRef = doc(db, 'appartements', id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              dateVisite: data.dateVisite ? data.dateVisite.toDate() : undefined,
            } as Appartement;
          }
          return null;
        });

        const results = await Promise.all(promises);
        const validApparts = results.filter(a => a !== null) as Appartement[];
        setAppartements(validApparts);
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des appartements');
      } finally {
        setLoading(false);
      }
    };

    fetchAppartements();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-4">Chargement de la comparaison...</p>
        </div>
      </div>
    );
  }

  const getBestValue = (key: keyof Appartement, higherIsBetter: boolean = true) => {
    const values = appartements
      .map(a => a[key] as number)
      .filter(v => v !== undefined && v !== null);

    if (values.length === 0) return null;
    return higherIsBetter ? Math.max(...values) : Math.min(...values);
  };

  const getBestNote = (noteKey: string) => {
    const values = appartements
      .map(a => a.notes?.[noteKey as keyof typeof a.notes])
      .filter(v => v !== undefined && v !== null) as number[];

    if (values.length === 0) return null;
    return Math.max(...values);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/appartements"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Retour à la liste
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            ⚖️ Comparaison d'appartements
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Comparez {appartements.length} appartements côte à côte
          </p>
        </div>

        {/* Tableau comparatif */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                  Critère
                </th>
                {appartements.map((appart) => (
                  <th key={appart.id} className="px-6 py-4 text-center min-w-[250px]">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">{appart.titre}</h3>
                      <p className="text-xs text-gray-500">{appart.ville}</p>
                      <Link
                        href={`/appartements/${appart.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Voir détails →
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {/* Photo */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-white z-10">
                  📸 Photo
                </td>
                {appartements.map((appart) => (
                  <td key={appart.id} className="px-6 py-4">
                    <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                      {appart.photos && appart.photos.length > 0 ? (
                        <img
                          src={appart.photos[0]}
                          alt={appart.titre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Pas de photo
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Prix */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-50 z-10">
                  💰 Prix (loyer + charges)
                </td>
                {appartements.map((appart) => {
                  const total = appart.prix + (appart.charges || 0);
                  const isBest = total === getBestValue('prix' as any, false);
                  return (
                    <td key={appart.id} className={`px-6 py-4 text-center ${isBest ? 'bg-green-100 font-bold' : ''}`}>
                      <div className="text-xl font-bold text-blue-600">
                        {appart.prix} €
                      </div>
                      {(appart.charges ?? 0) > 0 && (
                        <div className="text-sm text-gray-500">
                          + {appart.charges} € charges
                        </div>
                      )}
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1">
                        Total: {total} €
                      </div>
                      {isBest && <div className="text-xs text-green-600 mt-1">✓ Moins cher</div>}
                    </td>
                  );
                })}
              </tr>

              {/* Surface */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-white z-10">
                  📐 Surface
                </td>
                {appartements.map((appart) => {
                  const isBest = appart.surface === getBestValue('surface');
                  return (
                    <td key={appart.id} className={`px-6 py-4 text-center ${isBest ? 'bg-green-100 font-bold' : ''}`}>
                      {appart.surface} m²
                      {isBest && <div className="text-xs text-green-600 mt-1">✓ Plus grand</div>}
                    </td>
                  );
                })}
              </tr>

              {/* Pièces */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-50 z-10">
                  🚪 Pièces
                </td>
                {appartements.map((appart) => (
                  <td key={appart.id} className="px-6 py-4 text-center">
                    {appart.pieces} pièces
                    {appart.chambres > 0 && (
                      <div className="text-sm text-gray-500">dont {appart.chambres} chambres</div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Étage */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-white z-10">
                  🏢 Étage
                </td>
                {appartements.map((appart) => (
                  <td key={appart.id} className="px-6 py-4 text-center">
                    {appart.etage !== undefined ? `Étage ${appart.etage}` : '-'}
                    {appart.ascenseur && (
                      <div className="text-sm text-green-600">✓ Ascenseur</div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Meublé */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-50 z-10">
                  🪑 Meublé
                </td>
                {appartements.map((appart) => (
                  <td key={appart.id} className="px-6 py-4 text-center">
                    {appart.meuble ? (
                      <span className="text-green-600">✓ Oui</span>
                    ) : (
                      <span className="text-gray-400">✗ Non</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Note globale */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-white z-10">
                  ⭐ Note globale
                </td>
                {appartements.map((appart) => {
                  const isBest = appart.noteGlobale === getBestValue('noteGlobale');
                  return (
                    <td key={appart.id} className={`px-6 py-4 text-center ${isBest ? 'bg-green-100' : ''}`}>
                      {appart.noteGlobale ? (
                        <div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {appart.noteGlobale.toFixed(1)}/5
                          </div>
                          <div className="flex justify-center mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={star <= appart.noteGlobale! ? 'text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          {isBest && <div className="text-xs text-green-600 mt-1">✓ Meilleure note</div>}
                        </div>
                      ) : (
                        <span className="text-gray-400">Non noté</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Notes détaillées */}
              {['luminosite', 'bruit', 'etat', 'quartier', 'proximite'].map((noteKey) => {
                const labels: Record<string, string> = {
                  luminosite: '☀️ Luminosité',
                  bruit: '🔇 Calme',
                  etat: '🏠 État',
                  quartier: '🏘️ Quartier',
                  proximite: '📍 Proximité',
                };

                return (
                  <tr key={noteKey} className="bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-50 z-10">
                      {labels[noteKey]}
                    </td>
                    {appartements.map((appart) => {
                      const note = appart.notes?.[noteKey as keyof typeof appart.notes];
                      const isBest = note === getBestNote(noteKey);
                      return (
                        <td key={appart.id} className={`px-6 py-4 text-center ${isBest && note ? 'bg-green-100' : ''}`}>
                          {note ? (
                            <div>
                              <div className="font-semibold">{note}/5</div>
                              {isBest && <div className="text-xs text-green-600 mt-1">✓ Meilleur</div>}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Évaluation */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-white z-10">
                  ✅ Évaluation
                </td>
                {appartements.map((appart) => (
                  <td key={appart.id} className="px-6 py-4 text-center">
                    {appart.visite ? (
                      <div>
                        {appart.choix === 'bon' && (
                          <span className="text-green-600 font-semibold">✅ Bon</span>
                        )}
                        {appart.choix === 'moyen' && (
                          <span className="text-yellow-600 font-semibold">⚠️ Moyen</span>
                        )}
                        {appart.choix === 'pas_bon' && (
                          <span className="text-red-600 font-semibold">❌ Pas bon</span>
                        )}
                        {!appart.choix && (
                          <span className="text-gray-500">Visité</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Non visité</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Avantages */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-50 z-10">
                  ✅ Points positifs
                </td>
                {appartements.map((appart) => (
                  <td key={appart.id} className="px-6 py-4">
                    {appart.avantages && appart.avantages.length > 0 ? (
                      <ul className="text-left space-y-1 text-sm">
                        {appart.avantages.map((av, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-green-500 mr-1">✓</span>
                            <span>{av}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 text-sm">Aucun</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Inconvénients */}
              <tr>
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200 sticky left-0 bg-white z-10">
                  ❌ Points négatifs
                </td>
                {appartements.map((appart) => (
                  <td key={appart.id} className="px-6 py-4">
                    {appart.inconvenients && appart.inconvenients.length > 0 ? (
                      <ul className="text-left space-y-1 text-sm">
                        {appart.inconvenients.map((inc, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-red-500 mr-1">✗</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 text-sm">Aucun</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Récapitulatif */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">💡 Récapitulatif</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-green-600">✓ Meilleur rapport qualité/prix :</strong>
              <p className="text-gray-700 dark:text-gray-200 ml-4">
                {appartements.sort((a, b) => {
                  const scoreA = (a.noteGlobale || 0) / ((a.prix + (a.charges || 0)) / 100);
                  const scoreB = (b.noteGlobale || 0) / ((b.prix + (b.charges || 0)) / 100);
                  return scoreB - scoreA;
                })[0]?.titre || 'N/A'}
              </p>
            </div>
            <div>
              <strong className="text-green-600">✓ Mieux noté :</strong>
              <p className="text-gray-700 dark:text-gray-200 ml-4">
                {appartements.sort((a, b) => (b.noteGlobale || 0) - (a.noteGlobale || 0))[0]?.titre || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparaisonPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-4">Chargement...</p>
        </div>
      </div>
    }>
      <ComparaisonContent />
    </Suspense>
  );
}

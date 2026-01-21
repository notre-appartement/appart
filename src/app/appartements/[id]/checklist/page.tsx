'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaHome } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Appartement, VisiteChecklist } from '@/types';
import { useAppartements } from '@/hooks/useAppartements';
import { useChecklists } from '@/hooks/useChecklists';
import { useProject } from '@/contexts/ProjectContext';
import { VisiteChecklistComponent } from '@/components/VisiteChecklist';
import { createEmptyChecklist } from '@/data/checklistTemplate';

export default function ChecklistPage() {
  const params = useParams();
  const router = useRouter();
  const { updateAppartement } = useAppartements();
  const { getChecklist, createChecklist, updateChecklist } = useChecklists();
  const { currentProject, loading: projectLoading } = useProject();
  const [appartement, setAppartement] = useState<Appartement | null>(null);
  const [checklist, setChecklist] = useState<VisiteChecklist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger l'appartement
        const docRef = doc(db, 'appartements', params.id as string);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert('Appartement non trouvé');
          router.push('/appartements');
          return;
        }

        const data = docSnap.data();
        const appart = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dateVisite: data.dateVisite ? data.dateVisite.toDate() : undefined,
        } as Appartement;

        setAppartement(appart);

        // Charger ou créer la checklist
        if (appart.checklistId) {
          // Checklist existante
          const existingChecklist = await getChecklist(appart.checklistId);
          if (existingChecklist) {
            setChecklist(existingChecklist);
          } else {
            // L'ID existe mais pas la checklist (cas d'erreur)
            const newChecklist: VisiteChecklist = {
              items: createEmptyChecklist(),
              notesGenerales: '',
            };
            setChecklist(newChecklist);
          }
        } else {
          // Pas de checklist, en créer une nouvelle (non sauvegardée)
          const newChecklist: VisiteChecklist = {
            items: createEmptyChecklist(),
            notesGenerales: '',
          };
          setChecklist(newChecklist);
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        alert('Erreur lors du chargement de l\'appartement');
        router.push('/appartements');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router, getChecklist]);

  const handleSaveChecklist = async (updatedChecklist: VisiteChecklist) => {
    if (!appartement) return;

    try {
      if (appartement.checklistId) {
        // Mettre à jour la checklist existante
        await updateChecklist(appartement.checklistId, {
          items: updatedChecklist.items,
          notesGenerales: updatedChecklist.notesGenerales,
        });
      } else {
        // Créer une nouvelle checklist
        const newChecklistId = await createChecklist(
          appartement.id,
          updatedChecklist.items,
          updatedChecklist.notesGenerales
        );

        // Mettre à jour l'appartement avec l'ID de la checklist
        await updateAppartement(appartement.id, { checklistId: newChecklistId });
      }

      alert('✅ Checklist sauvegardée avec succès !');
      // Rediriger vers la page de détails de l'appartement
      router.push(`/appartements/${appartement.id}`);
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de la sauvegarde de la checklist');
    }
  };

  if (loading || projectLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Chargement de la checklist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Aucun projet actif</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Vous devez sélectionner un projet avant d'accéder à une checklist.
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

  if (!appartement || !checklist) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/appartements/${appartement.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux détails
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  📋 Checklist de visite
                </h1>
                <p className="text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                  <FaHome className="text-blue-600" />
                  <span>{appartement.titre}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {appartement.adresse}, {appartement.ville}
                </p>
              </div>

              {appartement.dateVisite && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Date de visite</p>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {appartement.dateVisite.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Comment utiliser cette checklist ?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Cliquez sur les catégories pour voir tous les points à vérifier</li>
            <li>• Cochez les items au fur et à mesure de votre visite</li>
            <li>• Ajoutez des notes sur chaque point si nécessaire</li>
            <li>• N'oubliez pas de sauvegarder à la fin !</li>
          </ul>
        </div>

        {/* Checklist */}
        <VisiteChecklistComponent
          checklist={checklist}
          onSave={handleSaveChecklist}
        />

        {/* Boutons d'action en bas de page */}
        <div className="sticky bottom-4 mt-6 flex space-x-4">
          <button
            onClick={() => handleSaveChecklist(checklist)}
            className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 shadow-xl"
          >
            <FaSave className="text-xl" />
            <span className="font-bold">Sauvegarder et terminer</span>
          </button>
          <Link
            href={`/appartements/${appartement.id}`}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-4 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 shadow-lg"
          >
            <FaArrowLeft />
            <span>Retour</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

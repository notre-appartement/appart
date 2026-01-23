'use client';

import { FaPlus, FaMapMarkerAlt, FaBriefcase, FaHome, FaShoppingCart, FaUsers, FaTrash, FaEdit } from 'react-icons/fa';
import Link from 'next/link';
import { useEmplacements } from '@/hooks/useEmplacements';
import { useProject } from '@/contexts/ProjectContext';
import { SkeletonList } from '@/components/SkeletonLoader';
import { AnimatedList, AnimatedListItem, AnimatedPage } from '@/components/AnimatedCard';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import toast from 'react-hot-toast';

const typeConfig = {
  travail: { icon: FaBriefcase, color: 'blue', label: 'Travail' },
  famille: { icon: FaUsers, color: 'pink', label: 'Famille' },
  loisirs: { icon: FaHome, color: 'purple', label: 'Loisirs' },
  commerces: { icon: FaShoppingCart, color: 'green', label: 'Commerces' },
  autre: { icon: FaMapMarkerAlt, color: 'gray', label: 'Autre' },
};

export default function EmplacementsPage() {
  const { emplacements, loading, deleteEmplacement } = useEmplacements();
  const { currentProject, loading: projectLoading } = useProject();
  const { confirm, Dialog } = useConfirmDialog();

  const handleDelete = async (id: string, nom: string) => {
    const confirmed = await confirm({
      title: 'Supprimer l\'emplacement',
      message: `Voulez-vous vraiment supprimer "${nom}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger',
    });

    if (confirmed) {
      try {
        await deleteEmplacement(id);
        toast.success('🗑️ Emplacement supprimé');
      } catch (err) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  if (projectLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>
        <SkeletonList type="emplacement" count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Aucun projet actif</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Vous devez sélectionner un projet avant de gérer vos emplacements.
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
    <AnimatedPage className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
              📍 Nos Emplacements Préférés
            </h2>
            <Link
              href="/emplacements/nouveau"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <FaPlus />
              <span>Ajouter un emplacement</span>
            </Link>
          </div>

          {/* Liste des emplacements */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Chargement...</p>
            </div>
          ) : emplacements.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <FaMapMarkerAlt className="text-6xl mx-auto mb-4 text-gray-300" />
              <p className="text-xl">Aucun emplacement défini pour le moment</p>
              <p className="text-sm mt-2">Ajoutez vos lieux importants (travail, famille, commerces...)</p>
            </div>
          ) : (
            <AnimatedList className="space-y-4">
              {emplacements.map((emplacement) => {
                const config = typeConfig[emplacement.type];
                const Icon = config.icon;

                return (
                  <AnimatedListItem
                    key={emplacement.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-3 bg-${config.color}-100 rounded-lg`}>
                          <Icon className={`text-2xl text-${config.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                              {emplacement.nom}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full bg-${config.color}-100 text-${config.color}-700`}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 flex items-center">
                            <FaMapMarkerAlt className="mr-2" />
                            {emplacement.adresse}
                          </p>
                          {emplacement.description && (
                            <p className="text-sm text-gray-500 italic">
                              {emplacement.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Ajouté par {emplacement.createdByName}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Link
                          href={`/emplacements/${emplacement.id}/modifier`}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-300 p-2"
                          title="Modifier"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(emplacement.id, emplacement.nom)}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </AnimatedListItem>
                );
              })}
            </AnimatedList>
          )}
        </div>

        {/* Types d'emplacements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-colors duration-300">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            📌 Types d'emplacements disponibles
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(typeConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg border transition-colors duration-300 ${
                    key === 'travail'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : key === 'famille'
                      ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800'
                      : key === 'loisirs'
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                      : key === 'commerces'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <Icon className={`text-2xl mb-2 ${
                    key === 'travail'
                      ? 'text-blue-600 dark:text-blue-400'
                      : key === 'famille'
                      ? 'text-pink-600 dark:text-pink-400'
                      : key === 'loisirs'
                      ? 'text-purple-600 dark:text-purple-400'
                      : key === 'commerces'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <h4 className="font-bold text-gray-800 dark:text-white">{config.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {key === 'travail' && 'Vos lieux de travail'}
                    {key === 'famille' && 'Proches de la famille'}
                    {key === 'loisirs' && 'Activités et hobbies'}
                    {key === 'commerces' && 'Magasins essentiels'}
                    {key === 'autre' && 'Autres lieux importants'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {Dialog}
    </AnimatedPage>
  );
}

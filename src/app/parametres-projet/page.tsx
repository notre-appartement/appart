'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProject } from '@/contexts/ProjectContext';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { useProjectLimits } from '@/hooks/useProjectLimits';
import { useSubscription } from '@/hooks/useSubscription';
import AuthGuard from '@/components/AuthGuard';
import DeleteProjectModal from '@/components/DeleteProjectModal';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import toast from 'react-hot-toast';
import {
  FaArrowLeft,
  FaCopy,
  FaCheckCircle,
  FaUsers,
  FaUserShield,
  FaUser,
  FaTrash,
  FaSignOutAlt,
  FaCrown,
  FaRocket,
  FaStar,
  FaInfinity
} from 'react-icons/fa';

export default function ParametresProjetPage() {
  const router = useRouter();
  const { currentProject, setCurrentProject } = useProject();
  const { removeMembre, toggleAdminStatus, leaveProjet, deleteProjet } = useProjects();
  const { user, profile } = useAuth();
  const { currentPlan } = useSubscription();
  const { projectPlan, planConfig, loading: limitsLoading } = useProjectLimits(currentProject);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { confirm, Dialog } = useConfirmDialog();


  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-300">Aucun projet actif</p>
          <Link href="/projets" className="text-blue-600 hover:underline mt-4 inline-block">
            Sélectionner un projet
          </Link>
        </div>
      </div>
    );
  }

  const currentMembre = currentProject.membres.find(m => m.uid === user?.uid);
  const isAdmin = currentMembre?.isAdmin || false;
  const adminCount = currentProject.membres.filter(m => m.isAdmin).length;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentProject.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveMembre = async (membreUid: string, membreName: string) => {
    const confirmed = await confirm({
      title: 'Retirer un membre',
      message: `Voulez-vous vraiment retirer ${membreName} du projet ?`,
      confirmText: 'Retirer',
      cancelText: 'Annuler',
      type: 'danger',
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await removeMembre(currentProject.id, membreUid);
      toast.success(`${membreName} a été retiré du projet`);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (membreUid: string, membreName: string, currentStatus: boolean) => {
    const confirmed = await confirm({
      title: 'Modifier les droits administrateur',
      message: `Voulez-vous ${currentStatus ? 'retirer' : 'donner'} les droits administrateur à ${membreName} ?`,
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      type: 'warning',
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await toggleAdminStatus(currentProject.id, membreUid);
      toast.success(`Les droits administrateur ont été ${currentStatus ? 'retirés' : 'donnés'} à ${membreName}`);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du changement de rôle');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveProject = async () => {
    const confirmed = await confirm({
      title: 'Quitter le projet',
      message: 'Voulez-vous vraiment quitter ce projet ?',
      confirmText: 'Quitter',
      cancelText: 'Annuler',
      type: 'warning',
    });

    if (!confirmed) return;

    if (isAdmin && adminCount === 1 && currentProject.membres.length > 1) {
      const confirmedAgain = await confirm({
        title: 'Attention',
        message: 'Vous êtes le seul administrateur. Si vous quittez, le projet pourrait devenir impossible à gérer. Continuer ?',
        confirmText: 'Continuer',
        cancelText: 'Annuler',
        type: 'danger',
      });

      if (!confirmedAgain) return;
    }

    setLoading(true);
    try {
      await leaveProjet(currentProject.id);
      toast.success('Vous avez quitté le projet');
      setCurrentProject(null);
      router.push('/projets');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la sortie du projet');
      setLoading(false);
    }
  };

  const handleDeleteSuccess = () => {
    setCurrentProject(null);
    router.push('/projets');
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6 font-medium transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour au projet
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transition-colors duration-300">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Paramètres du Projet
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{currentProject.nom}</p>

          {/* Membres du projet */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FaUserShield className="text-purple-600 dark:text-purple-400" />
              Membres ({currentProject.membres.length})
            </h2>
            <div className="space-y-3">
              {currentProject.membres.map((membre) => {
                const isCurrentUser = membre.uid === user?.uid;
                const canManage = isAdmin && !isCurrentUser;

                return (
                  <div
                    key={membre.uid}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                      isCurrentUser
                        ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        membre.isAdmin
                          ? 'bg-purple-100 dark:bg-purple-900/50'
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}>
                        {membre.isAdmin ? (
                          <FaCrown className="text-purple-600 dark:text-purple-400" />
                        ) : (
                          <FaUser className="text-gray-600 dark:text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">
                          {membre.name}
                          {isCurrentUser && <span className="text-blue-600 dark:text-blue-400 ml-2 text-sm">(Vous)</span>}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{membre.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {membre.isAdmin && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                              Administrateur
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Membre depuis le {membre.joinedAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAdmin(membre.uid, membre.name, membre.isAdmin)}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            membre.isAdmin
                              ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/70'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                          } disabled:opacity-50`}
                        >
                          {membre.isAdmin ? 'Retirer admin' : 'Promouvoir admin'}
                        </button>
                        <button
                          onClick={() => handleRemoveMembre(membre.uid, membre.name)}
                          disabled={loading}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                          title="Retirer du projet"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

		  {/* Plan d'abonnement du projet */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-500 dark:text-yellow-400" />
              Plan d'Abonnement
            </h2>

            {limitsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 dark:border-blue-400 mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Calcul du plan...</p>
              </div>
            ) : (
              <div className={`rounded-xl p-6 border-2 transition-colors ${
                projectPlan === 'pro'
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300 dark:border-purple-700'
                  : projectPlan === 'premium'
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-orange-300 dark:border-orange-700'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gray-800 dark:from-gray-800 dark:to-gray-800 border-gray-300 dark:border-gray-600'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {projectPlan === 'pro' && (
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <FaRocket className="text-3xl text-white" />
                      </div>
                    )}
                    {projectPlan === 'premium' && (
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <FaCrown className="text-3xl text-white" />
                      </div>
                    )}
                    {projectPlan === 'free' && (
                      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <FaUser className="text-3xl text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Plan {planConfig.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {planConfig.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">
                      {planConfig.price > 0 ? `${planConfig.price}€` : 'Gratuit'}
                    </p>
                    {planConfig.price > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">par mois</p>
                    )}
                  </div>
                </div>

                {/* Explication */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Comment ça marche ?</strong> Le plan du projet est déterminé par le <strong>meilleur abonnement</strong> parmi tous les membres. Si au moins un membre a Premium/Pro, tout le projet en bénéficie !
                  </p>
                </div>

                {/* Limites actuelles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {planConfig.features.maxMembersPerProject === -1 ? <FaInfinity className="inline" /> : planConfig.features.maxMembersPerProject}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Membres max</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {planConfig.features.maxAppartements === -1 ? <FaInfinity className="inline" /> : planConfig.features.maxAppartements}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Appartements</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {planConfig.features.maxEmplacements === -1 ? <FaInfinity className="inline" /> : planConfig.features.maxEmplacements}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Emplacements</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      <FaInfinity className="inline" />
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Envies</p>
                  </div>
                </div>

                {/* Votre contribution */}
                <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                  <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                    <strong>Votre abonnement personnel :</strong> {currentPlan === 'free' ? 'Gratuit' : currentPlan === 'premium' ? 'Premium' : 'Pro'}
                    {currentPlan !== projectPlan && projectPlan !== 'free' && (
                      <span className="ml-2 text-green-600 dark:text-green-400">
                        (Un autre membre contribue au plan {projectPlan === 'premium' ? 'Premium' : 'Pro'} 🎉)
                      </span>
                    )}
                    {currentPlan === projectPlan && currentPlan !== 'free' && (
                      <span className="ml-2 text-blue-600 dark:text-blue-400">
                        (Vous contribuez au plan {projectPlan === 'premium' ? 'Premium' : 'Pro'} du projet 👑)
                      </span>
                    )}
                  </p>

                  {projectPlan === 'free' && (
                    <div className="mt-3">
                      <Link
                        href="/abonnement"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
                      >
                        <FaCrown />
                        Passer à Premium pour débloquer le projet
                      </Link>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                        ✨ Essai gratuit 14 jours • Débloque immédiatement tout le projet
                      </p>
                    </div>
                  )}

                  {projectPlan === 'premium' && currentPlan === 'premium' && (
                    <div className="mt-3">
                      <Link
                        href="/abonnement"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                      >
                        <FaRocket />
                        Passer à Pro pour tout débloquer
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

{/* Code d'invitation */}
<div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FaUsers className="text-blue-600 dark:text-blue-400" />
              Code d'Invitation
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Partagez ce code avec les personnes que vous souhaitez inviter au projet
            </p>
            <div className="flex gap-3 items-center">
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <p className="text-3xl font-mono font-bold text-gray-800 dark:text-white tracking-widest">
                  {currentProject.inviteCode}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
              >
                {copied ? (
                  <>
                    <FaCheckCircle />
                    Copié !
                  </>
                ) : (
                  <>
                    <FaCopy />
                    Copier
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions dangereuses */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              ⚠️ Zone Dangereuse
            </h2>
            <div className="space-y-3">
              <div className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/50 rounded-lg p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white mb-1">Quitter le projet</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Vous ne pourrez plus accéder aux données de ce projet
                      {isAdmin && adminCount === 1 && currentProject.membres.length > 1 && (
                        <span className="text-orange-700 dark:text-orange-300 font-medium"> (Vous êtes le seul admin)</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleLeaveProject}
                    disabled={loading}
                    className="bg-orange-600 dark:bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                  >
                    <FaSignOutAlt />
                    Quitter
                  </button>
                </div>
              </div>

              {isAdmin && (
                <div className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/50 rounded-lg p-4 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white mb-1">Supprimer le projet</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Plusieurs options disponibles : archivage, anonymisation ou suppression définitive.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      disabled={loading}
                      className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                    >
                      <FaTrash />
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de suppression */}
      <DeleteProjectModal
        projet={currentProject}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleDeleteSuccess}
      />
      {Dialog}
    </AuthGuard>
  );
}

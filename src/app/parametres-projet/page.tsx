'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProject } from '@/contexts/ProjectContext';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import DeleteProjectModal from '@/components/DeleteProjectModal';
import {
  FaArrowLeft,
  FaCopy,
  FaCheckCircle,
  FaUsers,
  FaUserShield,
  FaUser,
  FaTrash,
  FaSignOutAlt,
  FaCrown
} from 'react-icons/fa';

export default function ParametresProjetPage() {
  const router = useRouter();
  const { currentProject, setCurrentProject } = useProject();
  const { removeMembre, toggleAdminStatus, leaveProjet, deleteProjet } = useProjects();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600">Aucun projet actif</p>
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
    if (!confirm(`Voulez-vous vraiment retirer ${membreName} du projet ?`)) return;

    setLoading(true);
    try {
      await removeMembre(currentProject.id, membreUid);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (membreUid: string, membreName: string, currentStatus: boolean) => {
    if (!confirm(`Voulez-vous ${currentStatus ? 'retirer' : 'donner'} les droits administrateur à ${membreName} ?`)) return;

    setLoading(true);
    try {
      await toggleAdminStatus(currentProject.id, membreUid);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du changement de rôle');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!confirm('Voulez-vous vraiment quitter ce projet ?')) return;

    if (isAdmin && adminCount === 1 && currentProject.membres.length > 1) {
      if (!confirm('Vous êtes le seul administrateur. Si vous quittez, le projet pourrait devenir impossible à gérer. Continuer ?')) {
        return;
      }
    }

    setLoading(true);
    try {
      await leaveProjet(currentProject.id);
      setCurrentProject(null);
      router.push('/projets');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la sortie du projet');
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
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <FaArrowLeft className="mr-2" />
          Retour au projet
        </Link>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Paramètres du Projet
          </h1>
          <p className="text-gray-600 mb-8">{currentProject.nom}</p>

          {/* Code d'invitation */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUsers className="text-blue-600" />
              Code d'Invitation
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Partagez ce code avec les personnes que vous souhaitez inviter au projet
            </p>
            <div className="flex gap-3 items-center">
              <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center">
                <p className="text-3xl font-mono font-bold text-gray-800 tracking-widest">
                  {currentProject.inviteCode}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
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

          {/* Membres du projet */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserShield className="text-purple-600" />
              Membres ({currentProject.membres.length})
            </h2>
            <div className="space-y-3">
              {currentProject.membres.map((membre) => {
                const isCurrentUser = membre.uid === user?.uid;
                const canManage = isAdmin && !isCurrentUser;

                return (
                  <div
                    key={membre.uid}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      isCurrentUser ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        membre.isAdmin ? 'bg-purple-100' : 'bg-gray-200'
                      }`}>
                        {membre.isAdmin ? (
                          <FaCrown className="text-purple-600" />
                        ) : (
                          <FaUser className="text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {membre.name}
                          {isCurrentUser && <span className="text-blue-600 ml-2 text-sm">(Vous)</span>}
                        </p>
                        <p className="text-sm text-gray-600">{membre.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {membre.isAdmin && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                              Administrateur
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
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
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } disabled:opacity-50`}
                        >
                          {membre.isAdmin ? 'Retirer admin' : 'Promouvoir admin'}
                        </button>
                        <button
                          onClick={() => handleRemoveMembre(membre.uid, membre.name)}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
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

          {/* Actions dangereuses */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ⚠️ Zone Dangereuse
            </h2>
            <div className="space-y-3">
              <div className="border-2 border-orange-200 bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800 mb-1">Quitter le projet</p>
                    <p className="text-sm text-gray-600">
                      Vous ne pourrez plus accéder aux données de ce projet
                      {isAdmin && adminCount === 1 && currentProject.membres.length > 1 && (
                        <span className="text-orange-700 font-medium"> (Vous êtes le seul admin)</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleLeaveProject}
                    disabled={loading}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                  >
                    <FaSignOutAlt />
                    Quitter
                  </button>
                </div>
              </div>

              {isAdmin && (
                <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 mb-1">Supprimer le projet</p>
                      <p className="text-sm text-gray-600">
                        Plusieurs options disponibles : archivage, anonymisation ou suppression définitive.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      disabled={loading}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
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
    </AuthGuard>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FaHome,
  FaBuilding,
  FaHeart,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaUser,
  FaMap,
  FaFolderOpen,
  FaChevronDown,
  FaCog,
  FaWallet
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useProject, getAllProjects } from '@/contexts/ProjectContext';
import { FaPlus, FaCheck } from 'react-icons/fa';

export default function Navigation() {
  const { displayName, signOut, user } = useAuth();
  const { currentProject, setCurrentProject } = useProject();
  const projects = getAllProjects(user);
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  // Navigation du projet (visible uniquement si un projet est actif)
  const projectNavItems = [
    { href: '/', label: 'Tableau de bord', icon: FaHome },
    { href: '/appartements', label: 'Appartements', icon: FaBuilding },
    { href: '/envies', label: 'Nos Envies', icon: FaHeart },
    { href: '/emplacements', label: 'Emplacements', icon: FaMapMarkerAlt },
    { href: '/carte', label: 'Carte', icon: FaMap },
  ];

  // Fermer les menus quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
        setProjectMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      setUserMenuOpen(false);
      await signOut();
    }
  };

  const handleSelectProject = (project: typeof currentProject) => {
    if (project) {
      setCurrentProject(project);
      setProjectMenuOpen(false);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Projet actif */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity group">
              <div className="bg-white p-2 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                <FaHome className="text-xl text-blue-600" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-white">Notre Appart</span>
              </div>
            </Link>

            {/* Sélecteur de projet avec dropdown */}
            {currentProject && (
              <div className="relative hidden md:block" ref={projectMenuRef}>
                <button
                  onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors group"
                  title="Changer de projet"
                >
                  <FaFolderOpen className="text-white text-sm" />
                  <span className="text-sm text-white font-medium max-w-[150px] truncate">
                    {currentProject.nom}
                  </span>
                  <FaChevronDown className={`text-white text-xs transition-transform ${projectMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown des projets */}
                {projectMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    {/* En-tête */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mes Projets</p>
                    </div>

                    {/* Liste des projets */}
                    <div className="max-h-60 overflow-y-auto">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleSelectProject(project)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                            currentProject.id === project.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <FaFolderOpen className={`text-lg ${currentProject.id === project.id ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium truncate flex-1 ${currentProject.id === project.id ? 'text-blue-600' : 'text-gray-700'}`}>
                            {project.nom}
                          </span>
                          {currentProject.id === project.id && (
                            <FaCheck className="text-blue-600 text-sm" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Lien vers tous les projets */}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Link
                        href="/projets"
                        onClick={() => setProjectMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-600 hover:text-blue-600"
                      >
                        <FaCog className="text-lg" />
                        <span className="text-sm font-medium">Gérer mes projets</span>
                      </Link>
                      <Link
                        href="/projets/creer"
                        onClick={() => setProjectMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-green-600 hover:text-green-700"
                      >
                        <FaPlus className="text-lg" />
                        <span className="text-sm font-medium">Créer un projet</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* Navigation Items - uniquement si projet actif */}
            {currentProject ? (
              <>
                {projectNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-white text-blue-600 shadow-md'
                          : 'text-white hover:bg-white/20 hover:shadow-sm'
                      }`}
                      title={item.label}
                    >
                      <Icon className="text-lg" />
                      <span className="hidden lg:inline text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </>
            ) : (
              // Si pas de projet actif, afficher lien vers Mes Projets
              <Link
                href="/projets"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  pathname === '/projets'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white hover:bg-white/20 hover:shadow-sm'
                }`}
              >
                <FaFolderOpen className="text-lg" />
                <span className="hidden lg:inline text-sm font-medium">Mes Projets</span>
              </Link>
            )}

            {/* Menu Utilisateur (Dropdown) */}
            <div className="relative ml-3 pl-3 border-l border-white/30" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Menu utilisateur"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <FaUser className="text-sm text-blue-600" />
                </div>
                <span className="hidden md:inline text-sm font-medium text-white max-w-[120px] truncate">
                  {displayName}
                </span>
                <FaChevronDown
                  className={`text-white text-xs transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                  {/* En-tête du menu */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Compte utilisateur</p>
                  </div>

                  {/* Options du menu */}
                  <Link
                    href="/profil"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600"
                  >
                    <FaWallet className="text-lg" />
                    <div>
                      <p className="text-sm font-medium">Profil & Budget</p>
                      <p className="text-xs text-gray-500">Gérer mon profil</p>
                    </div>
                  </Link>

                  {currentProject && (
                    <Link
                      href="/projets"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600 md:hidden"
                    >
                      <FaFolderOpen className="text-lg" />
                      <div>
                        <p className="text-sm font-medium">Changer de projet</p>
                        <p className="text-xs text-gray-500">Sélectionner un autre projet</p>
                      </div>
                    </Link>
                  )}

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <FaSignOutAlt className="text-lg" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Déconnexion</p>
                        <p className="text-xs text-red-400">Se déconnecter du compte</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

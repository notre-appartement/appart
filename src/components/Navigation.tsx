'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaBuilding, FaHeart, FaMapMarkerAlt, FaSignOutAlt, FaUser, FaMap, FaFolderOpen } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';

export default function Navigation() {
  const { displayName, signOut } = useAuth();
  const { currentProject } = useProject();
  const pathname = usePathname();

  // Navigation de base (toujours visible)
  const baseNavItems = [
    { href: '/projets', label: 'Mes Projets', icon: FaFolderOpen },
    { href: '/profil', label: 'Profil & Budget', icon: FaUser },
  ];

  // Navigation du projet (visible uniquement si un projet est actif)
  const projectNavItems = [
    { href: '/', label: 'Tableau de bord', icon: FaHome },
    { href: '/appartements', label: 'Appartements', icon: FaBuilding },
    { href: '/envies', label: 'Nos Envies', icon: FaHeart },
    { href: '/emplacements', label: 'Emplacements', icon: FaMapMarkerAlt },
    { href: '/carte', label: 'Carte', icon: FaMap },
  ];

  // Combiner les items selon si un projet est actif
  const navItems = currentProject 
    ? [...projectNavItems, ...baseNavItems]
    : baseNavItems;

  const handleSignOut = async () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      await signOut();
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity group">
            <div className="bg-white p-2 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
              <FaHome className="text-xl text-blue-600" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-white">Notre Appart</span>
              {currentProject && (
                <p className="text-xs text-blue-100">{currentProject.nom}</p>
              )}
            </div>
          </Link>

          <div className="flex items-center space-x-1">
            {/* Navigation Items */}
            {navItems.map((item) => {
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

            {/* User Menu */}
            <div className="flex items-center space-x-2 ml-2 pl-3 border-l border-white/30">
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <FaUser className="text-sm text-blue-600" />
                </div>
                <span className="text-sm font-medium text-white">{displayName}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="hidden sm:inline text-sm">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

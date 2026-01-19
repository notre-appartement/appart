'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaBuilding, FaHeart, FaMapMarkerAlt, FaSignOutAlt, FaUser, FaMap } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const { displayName, signOut } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Accueil', icon: FaHome },
    { href: '/appartements', label: 'Appartements', icon: FaBuilding },
    { href: '/envies', label: 'Nos Envies', icon: FaHeart },
    { href: '/emplacements', label: 'Emplacements', icon: FaMapMarkerAlt },
    { href: '/carte', label: 'Carte', icon: FaMap },
  ];

  const handleSignOut = async () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      await signOut();
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <FaHome className="text-2xl text-blue-600" />
            <span className="text-xl font-bold text-gray-800">Notre Appart</span>
          </Link>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* User Menu */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-2 text-gray-700">
                <FaUser className="text-sm" />
                <span className="text-sm font-medium hidden md:inline">{displayName}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-red-600 p-2 rounded-md hover:bg-gray-100 transition-colors"
                title="Déconnexion"
              >
                <FaSignOutAlt className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

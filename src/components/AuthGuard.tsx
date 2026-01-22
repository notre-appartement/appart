'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas connecté
  if (!user) {
    // Sur la page d'accueil et la page de connexion, laisser passer
    if (pathname === '/' || pathname === '/connexion') {
      return <>{children}</>;
    }
    // Sur les autres pages, afficher la page de connexion
    return <LoginPage />;
  }

  // Si connecté, afficher le contenu
  return <>{children}</>;
}

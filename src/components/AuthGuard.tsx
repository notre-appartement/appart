'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthorized } = useAuth();

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas connecté ou non autorisé, afficher la page de connexion
  if (!user || !isAuthorized) {
    return <LoginPage />;
  }

  // Si connecté et autorisé, afficher le contenu
  return <>{children}</>;
}

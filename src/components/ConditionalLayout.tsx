'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from './Navigation';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isLandingPage = pathname === '/' && !user;

  // Sur la landing page, pas de navigation ni de background spécial
  if (isLandingPage) {
    return <main>{children}</main>;
  }

  // Sur les autres pages, afficher avec navigation et background
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  );
}


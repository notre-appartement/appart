'use client';

import LoginPage from '@/components/LoginPage';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function ConnexionPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6 font-medium transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour à l'accueil
        </Link>
      </div>
      <LoginPage />
    </div>
  );
}


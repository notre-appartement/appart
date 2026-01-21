import React from 'react';

// Skeleton de base pour les cartes d'appartements
export function AppartementCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Titre et badges */}
        <div className="flex justify-between items-start">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>

        {/* Adresse */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>

        {/* Prix et surface */}
        <div className="flex items-center space-x-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
        </div>

        {/* Bouton */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
      </div>
    </div>
  );
}

// Skeleton pour les cartes d'emplacements
export function EmplacementCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 animate-pulse">
      <div className="space-y-4">
        {/* Titre et type */}
        <div className="flex justify-between items-start">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Adresse */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton pour les cartes d'envies
export function EnvieCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          {/* Titre et badges */}
          <div className="flex items-center space-x-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>

          {/* Description */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>

          {/* Info */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton pour les cartes de projets
export function ProjetCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="space-y-4">
        {/* Titre */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>

        {/* Info membres et date */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>

        {/* Badges membres */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton pour liste simple (générique)
export function ListItemSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 animate-pulse">
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}

// Container pour afficher plusieurs skeletons
interface SkeletonListProps {
  count?: number;
  type?: 'appartement' | 'emplacement' | 'envie' | 'projet' | 'list';
  className?: string;
}

export function SkeletonList({ count = 6, type = 'list', className = '' }: SkeletonListProps) {
  const SkeletonComponent = {
    appartement: AppartementCardSkeleton,
    emplacement: EmplacementCardSkeleton,
    envie: EnvieCardSkeleton,
    projet: ProjetCardSkeleton,
    list: ListItemSkeleton,
  }[type];

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
}

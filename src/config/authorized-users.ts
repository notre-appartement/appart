// 🔐 Liste des utilisateurs autorisés
// Ajoutez ici les emails des personnes autorisées à accéder à l'application

export const AUTHORIZED_EMAILS = [
  // Ajoutez vos emails ici
  'ssabatieraymeric@gmail.com',
  'sarahjalao38@gmail.com',
];

// Configuration des utilisateurs avec leurs noms d'affichage
export const USER_CONFIG: Record<string, { displayName: string; role: 'Aymeric' | 'Sarah' }> = {
  'ssabatieraymeric@gmail.com': {
    displayName: 'Aymeric',
    role: 'Aymeric',
  },
  'sarahjalao38@gmail.com': {
    displayName: 'Sarah',
    role: 'Sarah',
  },
};

export function isEmailAuthorized(email: string | null | undefined): boolean {
  if (!email) return false;
  return AUTHORIZED_EMAILS.includes(email.toLowerCase());
}

export function getUserDisplayName(email: string | null | undefined): string {
  if (!email) return 'Utilisateur';
  const user = USER_CONFIG[email.toLowerCase()];
  return user?.displayName || email;
}

export function getUserRole(email: string | null | undefined): 'Aymeric' | 'Sarah' | null {
  if (!email) return null;
  const user = USER_CONFIG[email.toLowerCase()];
  return user?.role || null;
}

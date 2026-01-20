export interface Envie {
  id: string;
  projectId: string;
  nom: string;
  definition: string;
  important: boolean;
  auteur: string;           // Nom de l'auteur ou "partagé" pour une envie commune
  auteurNom: string;        // Nom d'affichage de l'utilisateur qui a créé l'envie
  auteurEmail: string;      // Email de l'utilisateur qui a créé l'envie
  createdBy: string;        // UID Firebase de l'utilisateur qui a créé l'envie
  createdAt: Date;
}

export interface Emplacement {
  id: string;
  projectId: string;
  nom: string;
  adresse: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  type: 'travail' | 'famille' | 'loisirs' | 'commerces' | 'autre';
  createdBy: string;        // UID Firebase de l'auteur
  createdByName: string;    // Nom de l'auteur
  createdAt: Date;
}

export interface Appartement {
  id: string;
  projectId: string;
  titre: string;
  adresse: string;
  ville: string;
  codePostal: string;
  prix: number;
  charges?: number;
  surface: number;
  pieces: number;
  chambres: number;
  etage?: number;
  ascenseur?: boolean;
  meuble?: boolean;

  // Statut de visite
  visite: boolean;
  dateVisite?: Date;
  choix?: 'bon' | 'moyen' | 'pas_bon' | null;

  // Notes et évaluations
  noteGlobale?: number; // sur 5
  notes?: {
    luminosite?: number;
    bruit?: number;
    etat?: number;
    quartier?: number;
    proximite?: number;
  };

  // Informations complémentaires
  description?: string;
  avantages?: string[];
  inconvenients?: string[];
  photos?: string[]; // URLs Firebase Storage
  documents?: string[]; // URLs des documents
  checklistId?: string; // Référence à la collection checklists

  // Liens
  lienAnnonce?: string;
  agence?: string;
  contactAgence?: string;

  // Coûts additionnels
  fraisAgence?: number;
  depotGarantie?: number;
  assuranceHabitation?: number;

  // Localisation
  latitude?: number;
  longitude?: number;

  // Auteur
  createdBy: string;        // UID Firebase de l'auteur
  createdByName: string;    // Nom de l'auteur

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  categorie: string;
  label: string;
  checked: boolean;
  note?: string;
}

export interface VisiteChecklist {
  id?: string;
  appartementId?: string;
  items: ChecklistItem[];
  notesGenerales: string;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export interface Projet {
  id: string;
  nom: string;
  description?: string;
  createurId: string;
  createurName: string;
  membres: {
    uid: string;
    name: string;
    email: string;
    isAdmin: boolean;
    joinedAt: Date;
  }[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjetMembre {
  uid: string;
  name: string;
  email: string;
  isAdmin: boolean;
  joinedAt: Date;
}

export interface BudgetCategory {
  id: string;
  nom: string;
  pourcentage: number;
  description?: string;
  couleur?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;

  // Informations personnelles
  prenom?: string;
  nom?: string;
  telephone?: string;

  // Budget
  salaireMensuel?: number;
  categoriesBudget?: BudgetCategory[];

  // Abonnement (pour le futur)
  subscription?: {
    plan: 'free' | 'premium' | 'pro';
    status: 'active' | 'inactive' | 'trial' | 'cancelled';
    startDate?: Date;
    endDate?: Date;
    trialEndDate?: Date;
  };

  // Préférences
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    notifications?: boolean;
    language?: 'fr' | 'en';
  };

  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}
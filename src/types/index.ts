export interface Envie {
  id: string;
  nom: string;
  definition: string;
  important: boolean;
  auteur: 'Aymeric' | 'Sarah' | 'les_deux';
  auteurNom: string;        // Nom d'affichage de l'auteur
  auteurEmail: string;      // Email de l'auteur
  createdBy: string;        // UID Firebase de l'auteur
  createdAt: Date;
}

export interface Emplacement {
  id: string;
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

export type UserRole = 'Aymeric' | 'Sarah';

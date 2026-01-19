import { ChecklistItem } from '@/types';

// Template de checklist prédéfinie pour les visites d'appartements
export const CHECKLIST_TEMPLATE: ChecklistItem[] = [
  // État général
  {
    id: 'murs',
    categorie: 'État général',
    label: 'Murs (fissures, humidité, peinture)',
    checked: false,
  },
  {
    id: 'sols',
    categorie: 'État général',
    label: 'Sols (parquet, carrelage, moquette)',
    checked: false,
  },
  {
    id: 'plafonds',
    categorie: 'État général',
    label: 'Plafonds (traces, moisissures)',
    checked: false,
  },
  {
    id: 'fenetres',
    categorie: 'État général',
    label: 'Fenêtres (état, double vitrage)',
    checked: false,
  },
  {
    id: 'portes',
    categorie: 'État général',
    label: 'Portes (serrures, gonds)',
    checked: false,
  },

  // Plomberie
  {
    id: 'robinets',
    categorie: 'Plomberie',
    label: 'Robinets (pression, fuites)',
    checked: false,
  },
  {
    id: 'chasse_eau',
    categorie: 'Plomberie',
    label: 'Chasse d\'eau (fonctionnement)',
    checked: false,
  },
  {
    id: 'douche_baignoire',
    categorie: 'Plomberie',
    label: 'Douche/Baignoire (état, évacuation)',
    checked: false,
  },
  {
    id: 'chauffe_eau',
    categorie: 'Plomberie',
    label: 'Chauffe-eau (type, fonctionnement)',
    checked: false,
  },

  // Électricité
  {
    id: 'prises',
    categorie: 'Électricité',
    label: 'Prises électriques (nombre, emplacement)',
    checked: false,
  },
  {
    id: 'eclairage',
    categorie: 'Électricité',
    label: 'Éclairage (fonctionnel, ampoules)',
    checked: false,
  },
  {
    id: 'disjoncteur',
    categorie: 'Électricité',
    label: 'Disjoncteur/Tableau électrique (état)',
    checked: false,
  },
  {
    id: 'interrupteurs',
    categorie: 'Électricité',
    label: 'Interrupteurs (fonctionnent)',
    checked: false,
  },

  // Chauffage & Isolation
  {
    id: 'chauffage',
    categorie: 'Chauffage & Isolation',
    label: 'Système de chauffage (type, fonctionnement)',
    checked: false,
  },
  {
    id: 'radiateurs',
    categorie: 'Chauffage & Isolation',
    label: 'Radiateurs (nombre, état)',
    checked: false,
  },
  {
    id: 'isolation_thermique',
    categorie: 'Chauffage & Isolation',
    label: 'Isolation thermique (sensation de froid)',
    checked: false,
  },
  {
    id: 'isolation_phonique',
    categorie: 'Chauffage & Isolation',
    label: 'Isolation phonique (bruit extérieur/voisins)',
    checked: false,
  },

  // Cuisine
  {
    id: 'plaques_cuisson',
    categorie: 'Cuisine',
    label: 'Plaques de cuisson (présence, type)',
    checked: false,
  },
  {
    id: 'four',
    categorie: 'Cuisine',
    label: 'Four (présence, fonctionnement)',
    checked: false,
  },
  {
    id: 'hotte',
    categorie: 'Cuisine',
    label: 'Hotte aspirante (présence, fonctionnement)',
    checked: false,
  },
  {
    id: 'evier',
    categorie: 'Cuisine',
    label: 'Évier (état, évacuation)',
    checked: false,
  },
  {
    id: 'rangements_cuisine',
    categorie: 'Cuisine',
    label: 'Rangements (placards, tiroirs)',
    checked: false,
  },

  // Rangements & Espaces
  {
    id: 'placards',
    categorie: 'Rangements',
    label: 'Placards (nombre, taille)',
    checked: false,
  },
  {
    id: 'cave_cellier',
    categorie: 'Rangements',
    label: 'Cave/Cellier (accès, état)',
    checked: false,
  },
  {
    id: 'balcon_terrasse',
    categorie: 'Espaces extérieurs',
    label: 'Balcon/Terrasse (taille, état, exposition)',
    checked: false,
  },
  {
    id: 'parking',
    categorie: 'Espaces extérieurs',
    label: 'Parking/Garage (présence, type)',
    checked: false,
  },

  // Luminosité & Vue
  {
    id: 'luminosite_pieces',
    categorie: 'Luminosité & Vue',
    label: 'Luminosité des pièces (exposition)',
    checked: false,
  },
  {
    id: 'vue',
    categorie: 'Luminosité & Vue',
    label: 'Vue depuis les fenêtres',
    checked: false,
  },
  {
    id: 'vis_a_vis',
    categorie: 'Luminosité & Vue',
    label: 'Vis-à-vis (proximité voisins)',
    checked: false,
  },

  // Parties communes & Environnement
  {
    id: 'entree_immeuble',
    categorie: 'Parties communes',
    label: 'Entrée d\'immeuble (propreté, sécurité)',
    checked: false,
  },
  {
    id: 'escaliers',
    categorie: 'Parties communes',
    label: 'Escaliers (état, éclairage)',
    checked: false,
  },
  {
    id: 'ascenseur_etat',
    categorie: 'Parties communes',
    label: 'Ascenseur (fonctionnement)',
    checked: false,
  },
  {
    id: 'boites_lettres',
    categorie: 'Parties communes',
    label: 'Boîtes aux lettres (état, sécurisées)',
    checked: false,
  },
  {
    id: 'digicode',
    categorie: 'Parties communes',
    label: 'Digicode/Interphone (fonctionnement)',
    checked: false,
  },

  // Voisinage & Quartier
  {
    id: 'voisinage',
    categorie: 'Voisinage',
    label: 'Voisinage (rencontré, impression)',
    checked: false,
  },
  {
    id: 'quartier',
    categorie: 'Voisinage',
    label: 'Quartier (calme, animation)',
    checked: false,
  },
  {
    id: 'commerces_proximite',
    categorie: 'Voisinage',
    label: 'Commerces à proximité',
    checked: false,
  },
  {
    id: 'transports',
    categorie: 'Voisinage',
    label: 'Transports en commun (distance, fréquence)',
    checked: false,
  },
];

// Fonction pour créer une nouvelle checklist vierge
export function createEmptyChecklist(): ChecklistItem[] {
  return CHECKLIST_TEMPLATE.map(item => ({ ...item }));
}

// Grouper les items par catégorie
export function groupByCategory(items: ChecklistItem[]): Record<string, ChecklistItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.categorie]) {
      acc[item.categorie] = [];
    }
    acc[item.categorie].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);
}

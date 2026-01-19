# 📋 Liste des Fonctionnalités Prévues

## 🎯 Architecture Multi-Projets (Nouveau !)
- [x] Système de projets collaboratifs
- [x] Création de projets avec nom et description
- [x] Invitation par code unique (8 caractères)
- [x] Page de sélection/changement de projet
- [x] Gestion des membres du projet
- [x] Filtrage automatique par projet (appartements, envies, emplacements)
- [x] Context global pour le projet actif
- [x] Stockage du projet actif en localStorage
- [x] Outil de migration des données existantes
- [x] **Authentification Ouverte**
  - [x] Suppression de la liste de mails autorisés
  - [x] N'importe qui peut créer un compte et se connecter
  - [x] Accès aux données contrôlé par l'appartenance aux projets
  - [x] Utilisation du displayName Firebase
- [x] **Navigation Contextuelle**
  - [x] Navigation de base (toujours visible) : Mes Projets, Profil & Budget
  - [x] Navigation projet (visible si projet actif) : Tableau de bord, Appartements, Envies, Emplacements, Carte
  - [x] Redirection automatique vers sélection de projet si aucun projet actif
- [x] **Données Privées par Projet**
  - [x] Chaque appartement, envie, emplacement est lié à un projet spécifique
  - [x] Stockage avec projectId dans Firestore
  - [x] Isolation complète des données entre projets
  - [x] Accès uniquement pour les membres du projet
- [x] **Page Paramètres du Projet**
  - [x] Affichage et copie du code d'invitation
  - [x] Liste des membres avec rôles (Admin/Membre)
  - [x] Gestion des permissions (admin uniquement)
  - [x] Promotion/Rétrogradation admin
  - [x] Suppression de membres (admin uniquement)
  - [x] Possibilité de quitter un projet
  - [x] Suppression du projet (admin uniquement)

## ✅ Phase 1 : Base (Terminé)
- [x] Structure du projet Next.js avec App Router
- [x] Configuration Tailwind CSS
- [x] Configuration Firebase (Firestore, Auth, Storage)
- [x] Navigation principale avec routing Next.js
- [x] Design responsive
- [x] Page d'accueil avec dashboard
- [x] Authentification sécurisée avec liste blanche d'emails
- [x] Protection des routes avec AuthGuard
- [x] Gestion des utilisateurs (Aymeric et Sarah)

## 🚧 Phase 2 : Fonctionnalités de base (En cours)

### Gestion des Envies
- [x] Formulaire d'ajout d'envie (in-page, formulaire toggle)
  - Nom de l'envie
  - Description détaillée
  - Niveau d'importance (critique, important, souhaitable)
  - Qui a cette envie (Aymeric, Sarah, les deux)
- [x] Liste des envies avec affichage temps réel
- [x] Suppression d'une envie
- [x] Modification d'une envie (in-page)
- [x] Suggestions d'envies pré-remplies
- [ ] Liste des envies avec filtres
- [ ] Recherche dans les envies

### Gestion des Emplacements
- [x] Formulaire d'ajout d'emplacement (page dédiée /emplacements/nouveau)
  - Nom
  - Adresse complète
  - Type (travail, famille, loisirs, commerces, autre)
  - Description
- [x] Liste des emplacements par type avec icônes colorées
- [x] Suppression d'emplacement
- [x] Modification d'emplacement (page dédiée /emplacements/[id]/modifier)
- [x] Affichage avec icônes personnalisées par type
- [ ] Géolocalisation automatique
- [ ] Page de détails d'un emplacement

### Gestion des Appartements
- [x] Formulaire complet d'ajout
  - Informations de base (titre, adresse, prix, surface, pièces)
  - Détails (étage, ascenseur, meublé, charges)
  - Lien vers l'annonce
  - Contact agence
- [x] Page de détails d'un appartement (route dynamique /appartements/[id])
- [x] Suppression d'appartement
- [x] Liste en cards responsive
- [x] Statut de visite (à visiter / visité)
- [x] Évaluation (bon / moyen / pas bon)
- [x] Filtres sur la liste (statut, évaluation, prix, surface)
- [x] Liste des avantages/inconvénients
- [x] Page de modification d'appartement
- [x] Notes par critères (luminosité, bruit, état, quartier, proximité)
- [x] Note globale automatique calculée
- [x] Upload de photos (jusqu'à 10 photos, 5MB max)
- [ ] Upload de documents (plans, diagnostics)

## 📊 Phase 3 : Fonctionnalités avancées

### Système de Notation
- [x] Note globale sur 5 étoiles
- [x] Notes détaillées par critère :
  - Luminosité
  - Niveau sonore
  - État général
  - Quartier
  - Proximité (transports, commerces)
- [x] Calcul automatique de la note globale
- [ ] Pondération des critères selon importance

### Comparaison d'Appartements
- [x] Sélection de 2-4 appartements à comparer
- [x] Vue côte à côte
- [x] Tableau comparatif complet avec tous les critères
- [x] Mise en évidence des meilleures options (surlignage vert)
- [x] Récapitulatif avec meilleur rapport qualité/prix
- [x] Photos, notes, avantages/inconvénients
- [ ] Graphiques de comparaison (radar chart)

### Gestion du Budget
- [x] Définir un salaire mensuel (Profil)
- [x] Définir des catégories de budget par pourcentage
- [x] Calcul automatique de la capacité de loyer partagée
- [x] Indicateur visuel "Dans le budget" sur la liste des appartements
- [x] Calculateur de coûts totaux
  - [x] Loyer
  - [x] Charges
  - [x] Frais d'agence
  - [x] Dépôt de garantie
  - [x] Assurance estimée
- [ ] Indicateur dépassement de budget détaillé
- [ ] Statistiques budgétaires

### Photos et Documents
- [x] Upload multiple d'images
- [x] Galerie photo par appartement
- [x] Preview des photos avant upload
- [x] Photo principale automatique (première photo)
- [ ] Modal plein écran pour voir les photos
- [ ] Zoom sur les photos
- [ ] Réorganiser l'ordre des photos
- [ ] Annotations sur les photos
- [ ] Organisation par pièce
- [ ] Upload de PDFs (plans, diagnostics)
- [ ] Prévisualisation des documents

### Carte Interactive
- [x] Affichage de tous les appartements sur une carte
- [x] Affichage des emplacements importants
- [x] Filtres sur la carte (évaluation, types)
- [x] Marqueurs colorés selon évaluation/type
- [x] Popups avec informations détaillées
- [x] Géolocalisation automatique des adresses (Nominatim)
- [ ] Calcul des distances
- [ ] Temps de trajet (voiture, transport, vélo, marche)
- [ ] Rayon de recherche
- [ ] Clustering des marqueurs

### Checklist de Visite
- [x] Checklist prédéfinie complète (40+ points) :
  - État général (murs, sols, plafonds, portes, fenêtres)
  - Plomberie (robinets, chasse d'eau, douche, chauffe-eau)
  - Électricité (prises, éclairage, disjoncteur)
  - Chauffage & Isolation (système, radiateurs, isolation phonique/thermique)
  - Cuisine (plaques, four, hotte, évier, rangements)
  - Rangements & Espaces (placards, cave, balcon, parking)
  - Luminosité & Vue (exposition, vue, vis-à-vis)
  - Parties communes (entrée, escaliers, ascenseur, digicode)
  - Voisinage (quartier, commerces, transports)
- [x] Système de cases à cocher par item
- [x] Prise de notes par item
- [x] Notes générales pour la visite
- [x] Groupement par catégories (pliable/dépliable)
- [x] Barre de progression globale et par catégorie
- [x] Sauvegarde automatique dans Firebase
- [x] Page dédiée pour la checklist (/appartements/[id]/checklist)
- [x] Bouton de redirection depuis les détails de l'appartement
- [x] Collection Firebase séparée pour les checklists (optimisation de la structure)
- [ ] Photos associées aux points de contrôle
- [ ] Export de la checklist en PDF

**📝 Note Architecture** : Les checklists sont stockées dans une collection `checklists` séparée pour optimiser les performances et la taille des documents. L'appartement stocke uniquement `checklistId` comme référence.

### Planning et Organisation
- [ ] Calendrier des visites
- [ ] Ajout de rendez-vous
- [ ] Rappels de visites
- [ ] Synchronisation avec calendrier externe
- [ ] Timeline des démarches

### Statistiques et Rapports
- [ ] Nombre d'appartements vus
- [ ] Prix moyen observé
- [ ] Répartition par quartier
- [ ] Évolution des prix
- [ ] Graphiques de synthèse
- [ ] Export des données en PDF/Excel

## 🔐 Phase 4 : Collaboration et Sécurité

### Authentification
- [x] Connexion Google
- [x] Connexion Email/Mot de passe
- [x] Profils utilisateurs (Aymeric + Sarah)
- [x] Liste blanche d'emails autorisés
- [x] Affichage du nom utilisateur dans la navigation
- [ ] Photos de profil
- [ ] Modification du profil

### Collaboration
- [x] Voir qui a ajouté quoi (auteur affiché sur chaque item)
- [x] Synchronisation temps réel Firebase (modifications visibles instantanément)
- [ ] Commentaires sur les appartements
- [ ] Système de "j'aime" / "j'aime pas"
- [ ] Notifications temps réel
- [ ] Historique des modifications

### Sécurité
- [ ] Règles Firebase sécurisées
- [ ] Gestion des permissions
- [ ] Sauvegarde automatique
- [ ] Mode hors ligne

## 🎨 Phase 5 : Expérience Utilisateur

### Design
- [ ] Mode sombre
- [ ] Thèmes personnalisables
- [ ] Animations fluides
- [ ] Skeleton loaders
- [ ] Toasts de notifications

### Accessibilité
- [ ] Navigation au clavier
- [ ] Compatibilité lecteurs d'écran
- [ ] Contraste suffisant
- [ ] Tailles de texte ajustables

### Performance
- [ ] Lazy loading des images
- [ ] Pagination des listes
- [ ] Cache des données
- [ ] Optimisation du bundle

### Mobile
- [ ] PWA (Progressive Web App)
- [ ] Installation sur écran d'accueil
- [ ] Mode hors ligne
- [ ] Notifications push

## 🚀 Phase 6 : Déploiement

- [ ] Configuration GitHub Pages
- [ ] CI/CD automatique
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Documentation complète
- [ ] Guide utilisateur

---

## 💡 Idées futures (Nice to have)

- [ ] Export des données complètes
- [ ] Import depuis sites d'annonces
- [ ] Partage d'appartements par lien
- [ ] Intégration Street View
- [ ] Calcul d'itinéraires
- [ ] Score de quartier (commerces, transport, sécurité)
- [ ] Alertes pour nouvelles annonces
- [ ] Machine learning pour recommandations
- [ ] Historique des prix du marché
- [ ] Comparaison avec le marché local

---

**Note** : Cette liste est évolutive et peut être ajustée selon vos besoins !

# 🏠 Notre Appart - Application Collaborative de Recherche d'Appartement

Une application moderne et collaborative conçue pour organiser une recherche d'appartement à deux. Suivez vos visites, comparez vos coups de cœur et gérez vos critères importants en temps réel.

## 🎯 Fonctionnalités Clés

### 🔐 Sécurité & Collaboration
*   **Authentification sécurisée** : Connexion via Google ou Email/Mot de passe via Firebase Auth.
*   **Liste blanche** : Seuls les utilisateurs autorisés (Aymeric & Sarah) peuvent accéder aux données.
*   **Synchronisation temps réel** : Les modifications apportées par l'un sont instantanément visibles par l'autre grâce à Firestore.

### 🏢 Gestion des Appartements
*   **Fiches détaillées** : Prix (loyer + charges), surface, nombre de pièces/chambres, étage, ascenseur, meublé, contact agence et lien de l'annonce.
*   **Statut & Évaluation** : Suivi du statut (À visiter / Visité) et évaluation rapide (Bon / Moyen / Pas bon).
*   **Notation intelligente** : Calcul automatique d'une note globale basée sur 5 critères (Luminosité, Bruit, État, Quartier, Proximité).
*   **Galerie Photo** : Upload multiple d'images avec prévisualisation et stockage sur Firebase Storage.

### ✅ Checklist de Visite ultra-complète
*   **Plus de 40 points de contrôle** répartis en catégories :
    *   💧 Plomberie (robinets, chauffe-eau, etc.)
    *   ⚡ Électricité (prises, disjoncteur)
    *   🔥 Chauffage & Isolation
    *   🍳 Cuisine & Équipements
    *   🏢 Parties communes & Voisinage
*   **Suivi de progression** : Barres de progression par catégorie et globale.
*   **Notes par point** : Prise de notes détaillée pour chaque élément vérifié.

### 📊 Comparaison Intelligente
*   **Vue côte à côte** : Comparez jusqu'à 4 appartements sur un seul écran.
*   **Analyse automatique** : Mise en évidence (surlignage vert) du meilleur prix, de la plus grande surface et de la meilleure note.
*   **Calcul de rentabilité** : Identification automatique du meilleur rapport qualité/prix.

### 📍 Cartographie & Localisation
*   **Carte Interactive** : Visualisation de tous les appartements et de vos points d'intérêt (Leaflet).
*   **Géocodage automatique** : Les adresses sont transformées en coordonnées GPS via l'API Nominatim.
*   **Points d'Intérêt (Emplacements)** : Enregistrez vos lieux importants (travail, famille, loisirs) avec des icônes colorées.

### 💕 Gestion des Envies
*   **Critères Partagés** : Listez vos critères indispensables ou souhaités.
*   **Priorisation** : Définissez l'importance (critique, important, souhaitable) et l'auteur de chaque envie.

## 🛠️ Stack Technique

*   **Framework** : [Next.js 14](https://nextjs.org/) (App Router)
*   **Langage** : [TypeScript](https://www.typescriptlang.org/)
*   **Styles** : [Tailwind CSS](https://tailwindcss.com/)
*   **Base de données & Auth** : [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
*   **Cartographie** : [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
*   **Icônes** : [React Icons](https://react-icons.github.io/react-icons/)
*   **Dates** : [date-fns](https://date-fns.org/)

## 🚀 Installation & Configuration

### Prérequis
*   Node.js 18.x ou supérieur
*   Un projet Firebase configuré

### Installation
1.  **Cloner le dépôt**
2.  **Installer les dépendances** :
    ```bash
    npm install
    ```
3.  **Variables d'environnement** : Créez un fichier `.env.local` à la racine :
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    ```

### Développement & Déploiement
*   `npm run dev` : Lancer le serveur local sur `localhost:3000`.
*   `npm run build` : Compiler pour la production.
*   `npm run deploy` : Déployer sur GitHub Pages (via `gh-pages`).

## 🗂️ Structure du Projet

```text
src/
├── app/                  # Routes et pages Next.js
│   ├── appartements/    # Gestion, détails et checklist
│   ├── carte/           # Page de la carte interactive
│   ├── emplacements/    # Points d'intérêt
│   └── envies/          # Critères et souhaits
├── components/          # Composants React réutilisables
├── config/              # Configuration (accès, etc.)
├── contexts/            # Contextes (Authentification)
├── hooks/               # Hooks personnalisés (Firebase)
├── lib/                 # Utilitaires (Firebase, Geocoding)
├── types/               # Interfaces TypeScript
└── data/                # Données statiques (Template checklist)
```
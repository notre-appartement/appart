# 🏠 Notre Appart - Application de recherche d'appartement

Application pour organiser votre recherche d'appartement à deux, avec gestion des envies, emplacements préférés, et suivi des visites.

## 🎯 Fonctionnalités

### ✅ Implémentées
- ✨ Structure de base Next.js avec TypeScript
- 🎨 Interface moderne avec Tailwind CSS
- 📱 Design responsive
- 🔥 Configuration Firebase prête à l'emploi
- 🔐 Authentification sécurisée avec liste blanche d'emails
- 👥 Gestion des utilisateurs (vous + votre copine)
- 🚪 Protection des routes (connexion obligatoire)

### 🚧 À venir
- ➕ Gestion des appartements (ajout, modification, suppression)
- 💕 Gestion des envies et critères importants
- 📍 Gestion des emplacements préférés
- ⭐ Système de notation et comparaison
- 📸 Upload de photos
- 🗺️ Carte interactive
- 📊 Statistiques et graphiques
- 📅 Planning des visites
- ✅ Checklist de visite

## 🚀 Installation

### Prérequis
- Node.js 18+ installé
- Un compte Firebase (gratuit)

### Étapes

1. **Installer les dépendances** :
```bash
npm install
```

2. **Configurer les utilisateurs autorisés** :

Modifiez le fichier `src/config/authorized-users.ts` avec vos emails :

```typescript
export const AUTHORIZED_EMAILS = [
  'votre.email@example.com',
  'email.copine@example.com',
];
```

Voir le guide complet : `docs/AUTHENTIFICATION.md`

3. **Configurer Firebase** :

   a. Allez sur [Firebase Console](https://console.firebase.google.com/)

   b. Créez un nouveau projet

   c. Activez les services suivants :
      - **Firestore Database** (mode test pour commencer)
      - **Authentication** (activez Google et/ou Email/Password) ⚠️ OBLIGATOIRE
      - **Storage** (mode test pour commencer)

   d. Dans les paramètres du projet, copiez la configuration

   e. Créez un fichier `.env.local` à la racine du projet :
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

3. **Créer les comptes utilisateurs** :

Dans Firebase Console > Authentication > Users :
- Cliquez sur "Add user"
- Créez un compte pour chaque email autorisé
- Ou utilisez la connexion Google (plus simple)

4. **Lancer en développement** :
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

Vous verrez la page de connexion. Connectez-vous avec un email autorisé !

## 📦 Déploiement sur GitHub Pages

### Configuration initiale

1. **Modifier `next.config.js`** :
```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/nom-de-votre-repo',
  assetPrefix: '/nom-de-votre-repo/',
}
```

2. **Créer un dépôt GitHub** :
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/votre-username/votre-repo.git
git push -u origin main
```

3. **Déployer** :
```bash
npm run deploy
```

4. **Activer GitHub Pages** :
   - Allez dans Settings > Pages
   - Source : `gh-pages` branch
   - Attendez quelques minutes

Votre site sera accessible à : `https://votre-username.github.io/votre-repo/`

### Variables d'environnement pour la production

⚠️ **Important** : Les variables d'environnement `NEXT_PUBLIC_*` sont incluses dans le build.
Pour la sécurité :
1. Configurez les règles Firebase pour restreindre l'accès
2. Utilisez l'authentification Firebase
3. Ne mettez JAMAIS de clés secrètes avec le préfixe `NEXT_PUBLIC_`

## 🗂️ Structure du projet

```
appart/
├── src/
│   ├── app/                 # Pages Next.js
│   │   ├── layout.tsx       # Layout principal
│   │   ├── page.tsx         # Page d'accueil
│   │   └── globals.css      # Styles globaux
│   ├── components/          # Composants React
│   │   ├── Navigation.tsx
│   │   ├── AppartementsView.tsx
│   │   ├── EnviesView.tsx
│   │   └── EmplacementsView.tsx
│   ├── lib/                 # Utilitaires
│   │   └── firebase.ts      # Configuration Firebase
│   └── types/               # Types TypeScript
│       └── index.ts         # Définitions des types
├── docs/                    # Documentation
├── public/                  # Fichiers statiques
├── .env.example             # Exemple de variables d'environnement
└── README.md               # Ce fichier
```

## 🛠️ Scripts disponibles

- `npm run dev` - Lancer en mode développement
- `npm run build` - Créer le build de production
- `npm run start` - Lancer le serveur de production
- `npm run export` - Exporter en site statique
- `npm run deploy` - Déployer sur GitHub Pages

## 📚 Technologies utilisées

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles utilitaires
- **Firebase** - Backend (Database, Auth, Storage)
- **React Icons** - Icônes
- **date-fns** - Gestion des dates

## 🔒 Sécurité Firebase

Avant de passer en production, configurez les règles Firestore :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Appartements
    match /appartements/{appartement} {
      allow read, write: if request.auth != null;
    }

    // Envies
    match /envies/{envie} {
      allow read, write: if request.auth != null;
    }

    // Emplacements
    match /emplacements/{emplacement} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Et pour Storage :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /appartements/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📝 Prochaines étapes de développement

1. ✅ Structure de base (terminé)
2. ✅ Implémenter l'authentification Firebase
3. 🔄 CRUD pour les appartements
4. ✅ CRUD pour les envies
5. 🔄 CRUD pour les emplacements
6. 🔄 Upload et gestion des photos
7. 🔄 Système de notation
8. 🔄 Intégration carte interactive
9. 🔄 Comparaison d'appartements
10. 🔄 Statistiques et graphiques

## 💡 Besoin d'aide ?

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)

---

Fait avec ❤️ pour faciliter votre recherche d'appartement ensemble !

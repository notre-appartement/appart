import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App | undefined;

// Initialiser Firebase Admin SDK
if (!getApps().length) {
  try {
    // Vérifier que les variables d'environnement sont présentes
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.error('❌ FIREBASE_PROJECT_ID manquant dans .env.local');
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      console.error('❌ FIREBASE_CLIENT_EMAIL manquant dans .env.local');
    }
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.error('❌ FIREBASE_PRIVATE_KEY manquant dans .env.local');
    }

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Variables Firebase Admin manquantes dans .env.local');
    }

    // Traitement de la clé privée : gérer différents formats
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY est vide ou non défini');
    }

    // Log pour débogage (masqué pour sécurité)
    console.log(`🔍 Clé privée - Longueur: ${privateKey.length}, Début: ${privateKey.substring(0, 30)}...`);
    
    // Enlever les guillemets au début et à la fin si présents
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
      console.log('🔍 Guillemets doubles retirés');
    } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.slice(1, -1);
      console.log('🔍 Guillemets simples retirés');
    }
    
    // Remplacer les \n échappés par de vrais retours à la ligne
    // Gérer à la fois \\n (double backslash) et \n (simple backslash)
    const beforeReplace = privateKey;
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    if (beforeReplace !== privateKey) {
      console.log(`🔍 ${(beforeReplace.match(/\\n/g) || []).length} occurrences de \\n remplacées`);
    }
    
    // Vérifier que la clé commence et se termine correctement
    if (!privateKey.includes('BEGIN PRIVATE KEY')) {
      throw new Error('Clé privée invalide : ne contient pas BEGIN PRIVATE KEY');
    }
    if (!privateKey.includes('END PRIVATE KEY')) {
      throw new Error('Clé privée invalide : ne contient pas END PRIVATE KEY');
    }

    console.log(`🔍 Clé privée traitée - Longueur finale: ${privateKey.length}`);

    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log('✅ Firebase Admin initialisé avec succès');
  } catch (error: any) {
    console.error('❌ Erreur initialisation Firebase Admin:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
} else {
  app = getApps()[0];
}

if (!app) {
  throw new Error('Firebase Admin app n\'a pas pu être initialisé');
}

export const adminDb = getFirestore(app);

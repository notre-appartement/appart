import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App | undefined;

// Initialiser Firebase Admin SDK
if (!getApps().length) {
  try {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Erreur initialisation Firebase Admin:', error);
  }
} else {
  app = getApps()[0];
}

if (!app) {
  throw new Error('Firebase Admin app n\'a pas pu être initialisé');
}

export const adminDb = getFirestore(app);

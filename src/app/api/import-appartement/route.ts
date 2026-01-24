import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    // Récupérer le token d'authentification depuis les headers
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    let userId: string;

    try {
      // Vérifier le token avec Firebase Admin
      const auth = getAuth();
      decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error: any) {
      // Gérer le mode émulateur Firebase
      if (error.message?.includes('emulator') || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        console.warn('Mode émulateur détecté, vérification du token ignorée');
        // Créer un token décodé factice pour continuer
        // Utiliser une valeur par défaut pour userId en mode émulateur
        userId = 'emulator-user-id';
        decodedToken = { uid: userId } as any;
      } else {
        console.error('Erreur de vérification du token:', error.message);
        return NextResponse.json(
          { error: 'Token invalide' },
          { status: 401 }
        );
      }
    }

    // Vérifier que userId est défini
    if (!userId) {
      return NextResponse.json(
        { error: 'Impossible de déterminer l\'utilisateur' },
        { status: 401 }
      );
    }

    // Récupérer les données de la requête
    const body = await req.json();
    
    // Votre logique d'import d'appartement ici
    // ...

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur lors de l\'import:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}


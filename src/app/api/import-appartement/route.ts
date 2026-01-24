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

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Appartement } from '@/types';

interface ImportData {
  titre: string;
  prix: number;
  charges?: number;
  surface: number;
  pieces: number;
  chambres?: number;
  adresse: string;
  ville: string;
  codePostal: string;
  description: string;
  photos: string[] | Array<{url: string; base64: string; mimeType: string}>;
  etage?: number;
  ascenseur?: boolean;
  meuble?: boolean;
  lienAnnonce: string;
}

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    // Vérifier le token avec Firebase Admin
    let decodedToken;
    try {
      const adminAuth = getAuth();
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error: any) {
      // En développement avec émulateur, on peut être plus permissif
      if (process.env.NODE_ENV === 'development' && process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        console.warn('Mode émulateur détecté, vérification du token ignorée');
        // Créer un token décodé factice pour continuer
        decodedToken = { uid: userId } as any;
      } else {
        console.error('Erreur de vérification du token:', error.message);
        return NextResponse.json(
          { error: `Token invalide: ${error.message}` },
          { status: 401 }
        );
      }
    }

    const { url, projectId, userId, userName } = await req.json();

    if (!url || !projectId || !userId) {
      return NextResponse.json(
        { error: 'URL, projectId et userId requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'userId correspond au token
    if (userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: 'Utilisateur non autorisé' },
        { status: 403 }
      );
    }

    // Appeler la Cloud Function pour scraper via HTTP direct
    // Utiliser l'URL de la Cloud Function directement
    const projectIdEnv = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const functionUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:5001/notre-appart/us-central1/importAppartement'
      : `https://us-central1-${projectIdEnv}.cloudfunctions.net/importAppartement`;

    const functionResponse = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!functionResponse.ok) {
      const errorData = await functionResponse.json().catch(() => ({ error: 'Erreur lors de l\'appel de la Cloud Function' }));
      throw new Error(errorData.error || `Erreur HTTP ${functionResponse.status}`);
    }

    const functionResult = await functionResponse.json();
    console.log('Réponse de la Cloud Function:', JSON.stringify(functionResult, null, 2));

    const response = functionResult as { success: boolean; data?: ImportData; error?: string };

    if (!response.success || !response.data) {
      console.error('Erreur dans la réponse:', response);
      return NextResponse.json(
        { error: response.error || 'Erreur lors de l\'import' },
        { status: 500 }
      );
    }

    const importData = response.data;
    console.log('Données importées:', JSON.stringify(importData, null, 2));

    // Télécharger les photos vers Firebase Storage
    const photoUrls: string[] = [];
    const photos = Array.isArray(importData.photos) ? importData.photos : [];

    for (let i = 0; i < photos.length && i < 10; i++) {
      const photo = photos[i];
      try {
        let blob: Blob;
        let mimeType: string;

        // Si on a des données base64 (depuis Puppeteer)
        if (typeof photo === "object" && "base64" in photo && photo.base64) {
          // Convertir base64 en Blob
          const base64Data = photo.base64;
          mimeType = photo.mimeType || "image/jpeg";

          // Décoder le base64
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j++) {
            byteNumbers[j] = byteCharacters.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: mimeType });
        } else {
          // Sinon, télécharger depuis l'URL (fallback)
          const photoUrl = typeof photo === "string" ? photo : (photo as any).url;
          if (!photoUrl) continue;

          const imageResponse = await fetch(photoUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Referer': 'https://www.leboncoin.fr/',
              'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            },
          });

          if (!imageResponse.ok) {
            console.warn(`Photo non accessible (${imageResponse.status}): ${photoUrl}`);
            continue;
          }

          blob = await imageResponse.blob();
          mimeType = blob.type || "image/jpeg";
        }

        // Vérifier la taille (max 5MB)
        if (blob.size > 5 * 1024 * 1024) {
          console.warn(`Photo trop grande (${blob.size} bytes), ignorée`);
          continue;
        }

        // Vérifier que c'est bien une image
        if (!mimeType.startsWith('image/')) {
          console.warn(`Le fichier n'est pas une image (${mimeType}), ignoré`);
          continue;
        }

        // Générer un nom unique avec timestamp pour éviter les collisions
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const extension = mimeType.split('/')[1] || 'jpg';
        const fileName = `appartements/${projectId}/${timestamp}-${random}.${extension}`;
        const storageRef = ref(storage, fileName);

        // Upload vers Firebase Storage
        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);
        photoUrls.push(downloadUrl);
        console.log(`Photo uploadée avec succès: ${downloadUrl}`);
      } catch (error: any) {
        console.error(`Erreur lors du téléchargement de la photo:`, error.message);
        // Continuer avec les autres photos
      }
    }

    console.log(`${photoUrls.length} photos téléchargées sur ${importData.photos.length} tentatives`);

    // Créer l'appartement dans Firestore
    // Ne pas inclure les champs undefined (Firestore ne les accepte pas)
    const appartementData: any = {
      projectId,
      titre: importData.titre,
      adresse: importData.adresse,
      ville: importData.ville,
      codePostal: importData.codePostal,
      prix: importData.prix,
      surface: importData.surface,
      pieces: importData.pieces,
      chambres: importData.chambres || importData.pieces - 1, // Estimation si non fourni
      visite: false,
      photos: photoUrls,
      avantages: [],
      inconvenients: [],
      lienAnnonce: importData.lienAnnonce,
      createdBy: userId,
      createdByName: userName || 'Utilisateur',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Ajouter les champs optionnels seulement s'ils sont définis
    if (importData.charges !== undefined && importData.charges !== null) {
      appartementData.charges = importData.charges;
    }
    if (importData.etage !== undefined && importData.etage !== null) {
      appartementData.etage = importData.etage;
    }
    if (importData.ascenseur !== undefined && importData.ascenseur !== null) {
      appartementData.ascenseur = importData.ascenseur;
    }
    if (importData.meuble !== undefined && importData.meuble !== null) {
      appartementData.meuble = importData.meuble;
    }
    if (importData.description) {
      appartementData.description = importData.description;
    }

    // Utiliser Admin SDK pour créer le document (contourne les règles Firestore)
    const docRef = adminDb.collection('appartements').doc();
    await docRef.set(appartementData);

    return NextResponse.json({
      success: true,
      appartementId: docRef.id,
      data: {
        ...appartementData,
        id: docRef.id,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'import:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'import de l\'appartement' },
      { status: 500 }
    );
  }
}

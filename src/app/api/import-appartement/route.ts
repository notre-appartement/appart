import { NextRequest, NextResponse } from 'next/server';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
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
  photos: string[];
  etage?: number;
  ascenseur?: boolean;
  meuble?: boolean;
  lienAnnonce: string;
}

export async function POST(req: NextRequest) {
  try {
    const { url, projectId, userId, userName } = await req.json();

    if (!url || !projectId || !userId) {
      return NextResponse.json(
        { error: 'URL, projectId et userId requis' },
        { status: 400 }
      );
    }

    // Appeler la Cloud Function pour scraper
    const functions = getFunctions();

    // En développement, utiliser l'émulateur si disponible
    if (process.env.NODE_ENV === 'development') {
      try {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      } catch (e) {
        // Déjà connecté ou erreur, continuer
      }
    }

    const importFunction = httpsCallable(functions, 'importAppartement');
    const result = await importFunction({ url });

    const response = result.data as { success: boolean; data?: ImportData; error?: string };

    if (!response.success || !response.data) {
      return NextResponse.json(
        { error: response.error || 'Erreur lors de l\'import' },
        { status: 500 }
      );
    }

    const importData = response.data;

    // Télécharger les photos vers Firebase Storage
    const photoUrls: string[] = [];
    for (const photoUrl of importData.photos.slice(0, 10)) {
      try {
        // Télécharger l'image depuis l'URL
        const imageResponse = await fetch(photoUrl);
        if (!imageResponse.ok) continue;

        const blob = await imageResponse.blob();

        // Vérifier la taille (max 5MB)
        if (blob.size > 5 * 1024 * 1024) {
          console.warn(`Photo trop grande, ignorée: ${photoUrl}`);
          continue;
        }

        // Générer un nom unique
        const fileName = `appartements/${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(storage, fileName);

        // Upload vers Firebase Storage
        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);
        photoUrls.push(downloadUrl);
      } catch (error) {
        console.error(`Erreur lors du téléchargement de la photo ${photoUrl}:`, error);
        // Continuer avec les autres photos
      }
    }

    // Créer l'appartement dans Firestore
    const appartementData: Omit<Appartement, 'id'> = {
      projectId,
      titre: importData.titre,
      adresse: importData.adresse,
      ville: importData.ville,
      codePostal: importData.codePostal,
      prix: importData.prix,
      charges: importData.charges,
      surface: importData.surface,
      pieces: importData.pieces,
      chambres: importData.chambres || importData.pieces - 1, // Estimation si non fourni
      etage: importData.etage,
      ascenseur: importData.ascenseur,
      meuble: importData.meuble,
      visite: false,
      photos: photoUrls,
      avantages: [],
      inconvenients: [],
      lienAnnonce: importData.lienAnnonce,
      createdBy: userId,
      createdByName: userName || 'Utilisateur',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Ajouter la description si elle existe
    if (importData.description) {
      appartementData.description = importData.description;
    }

    const docRef = await addDoc(collection(db, 'appartements'), appartementData);

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

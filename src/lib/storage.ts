// Utilitaires pour Firebase Storage
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload une image vers Firebase Storage
 * @param file - Fichier image à uploader
 * @param path - Chemin dans Storage (ex: 'appartements/ID/image.jpg')
 * @returns URL de téléchargement de l'image
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    throw new Error('Impossible d\'uploader l\'image');
  }
}

/**
 * Upload plusieurs images
 * @param files - Liste de fichiers
 * @param basePath - Chemin de base (ex: 'appartements/ID')
 * @returns Liste des URLs des images uploadées
 */
export async function uploadMultipleImages(
  files: File[],
  basePath: string
): Promise<string[]> {
  const uploadPromises = files.map((file, index) => {
    const timestamp = Date.now();
    const filename = `${timestamp}_${index}_${file.name}`;
    const path = `${basePath}/${filename}`;
    return uploadImage(file, path);
  });

  return Promise.all(uploadPromises);
}

/**
 * Supprimer une image de Firebase Storage
 * @param imageUrl - URL complète de l'image
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extraire le chemin depuis l'URL Firebase Storage
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    if (!imageUrl.startsWith(baseUrl)) {
      throw new Error('URL invalide');
    }

    // Parser l'URL pour obtenir le chemin
    const urlParts = imageUrl.split('/o/')[1].split('?')[0];
    const path = decodeURIComponent(urlParts);

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    throw new Error('Impossible de supprimer l\'image');
  }
}

/**
 * Valider un fichier image
 * @param file - Fichier à valider
 * @returns true si valide, sinon message d'erreur
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Vérifier le type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format non supporté. Utilisez JPG, PNG ou WebP.',
    };
  }

  // Vérifier la taille (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image trop grande. Maximum 5MB.',
    };
  }

  return { valid: true };
}

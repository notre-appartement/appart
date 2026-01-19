'use client';

import { useState, useRef } from 'react';
import { FaCamera, FaTrash, FaTimes, FaSpinner } from 'react-icons/fa';
import { validateImageFile } from '@/lib/storage';
import Image from 'next/image';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onImagesChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(images);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Valider chaque fichier
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert('Certains fichiers n\'ont pas pu être ajoutés:\n' + errors.join('\n'));
    }

    // Vérifier le nombre max d'images
    const totalImages = previewImages.length + validFiles.length;
    if (totalImages > maxImages) {
      alert(`Vous ne pouvez ajouter que ${maxImages} images maximum.`);
      return;
    }

    // Créer des previews
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setPreviewImages([...previewImages, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const removeImage = (index: number) => {
    const newPreviews = previewImages.filter((_, i) => i !== index);
    const newFiles = selectedFiles.filter((_, i) => i !== index - images.length);

    setPreviewImages(newPreviews);
    setSelectedFiles(newFiles);

    // Si c'est une image déjà uploadée, la retirer de la liste
    if (index < images.length) {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  const getSelectedFiles = () => selectedFiles;

  return (
    <div className="space-y-4">
      {/* Bouton d'upload */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={previewImages.length >= maxImages}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaCamera />
          <span>Ajouter des photos</span>
        </button>
        <p className="text-xs text-gray-500 mt-2">
          {previewImages.length}/{maxImages} photos • Max 5MB par photo • JPG, PNG, WebP
        </p>
      </div>

      {/* Grille de preview */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewImages.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Badge "Photo principale" pour la première */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Photo principale
                </div>
              )}

              {/* Bouton supprimer */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Supprimer"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucune photo */}
      {previewImages.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FaCamera className="text-4xl text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Aucune photo ajoutée</p>
          <p className="text-sm text-gray-400 mt-1">Les photos vous aideront à vous souvenir de chaque appartement</p>
        </div>
      )}
    </div>
  );
}

// Export des fichiers sélectionnés (à utiliser dans le composant parent)
export function useImageUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  return {
    selectedFiles,
    setSelectedFiles,
  };
}

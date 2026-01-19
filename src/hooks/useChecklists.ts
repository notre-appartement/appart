import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VisiteChecklist, ChecklistItem } from '@/types';

export const useChecklists = () => {
  const [loading, setLoading] = useState(false);

  // Récupérer une checklist par son ID
  const getChecklist = async (checklistId: string): Promise<VisiteChecklist | null> => {
    try {
      const docRef = doc(db, 'checklists', checklistId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          items: data.items || [],
          notesGenerales: data.notesGenerales || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as VisiteChecklist;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la checklist:', error);
      throw error;
    }
  };

  // Créer une nouvelle checklist
  const createChecklist = async (
    appartementId: string,
    items: ChecklistItem[],
    notesGenerales: string = ''
  ): Promise<string> => {
    setLoading(true);
    try {
      const checklistData = {
        appartementId,
        items,
        notesGenerales,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'checklists'), checklistData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de la checklist:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une checklist existante
  const updateChecklist = async (
    checklistId: string,
    updates: Partial<{ items: ChecklistItem[]; notesGenerales: string }>
  ): Promise<void> => {
    setLoading(true);
    try {
      const docRef = doc(db, 'checklists', checklistId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la checklist:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getChecklist,
    createChecklist,
    updateChecklist,
  };
};

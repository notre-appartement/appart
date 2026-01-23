'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Projet } from '@/types';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'firebase/auth';

interface ProjectContextType {
  currentProject: Projet | null;
  setCurrentProject: (project: Projet | null) => void;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProjectState] = useState<Projet | null>(null);
  const { projets, loading: loadingProjects } = useProjects();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Si l'utilisateur change, réinitialiser le projet
    const currentUserId = user?.uid || null;
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== currentUserId) {
      // L'utilisateur a changé, réinitialiser le projet
      setCurrentProjectState(null);
      localStorage.removeItem('currentProjectId');
    }
    previousUserIdRef.current = currentUserId;
  }, [user?.uid]);

  useEffect(() => {
    if (loadingProjects) return;

    // Si pas d'utilisateur, réinitialiser le projet
    if (!user) {
      setCurrentProjectState(null);
      localStorage.removeItem('currentProjectId');
      setLoading(false);
      return;
    }

    // Récupérer le projet stocké localement
    const storedProjectId = localStorage.getItem('currentProjectId');

    if (storedProjectId && projets.length > 0) {
      const projet = projets.find(p => p.id === storedProjectId);
      if (projet) {
        // Le projet stocké existe et est valide pour cet utilisateur
        setCurrentProjectState(projet);
      } else {
        // Le projet stocké n'existe plus dans la liste de cet utilisateur
        // Prendre le premier projet disponible ou null
        if (projets.length > 0) {
          setCurrentProjectState(projets[0]);
          localStorage.setItem('currentProjectId', projets[0].id);
        } else {
          setCurrentProjectState(null);
          localStorage.removeItem('currentProjectId');
        }
      }
    } else if (projets.length > 0) {
      // Pas de projet stocké, prendre le premier
      setCurrentProjectState(projets[0]);
      localStorage.setItem('currentProjectId', projets[0].id);
    } else {
      // Pas de projets disponibles pour cet utilisateur
      setCurrentProjectState(null);
      localStorage.removeItem('currentProjectId');
    }

    setLoading(false);
  }, [projets, loadingProjects, user]);

  const setCurrentProject = (project: Projet | null) => {
    setCurrentProjectState(project);
    if (project) {
      localStorage.setItem('currentProjectId', project.id);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  };

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject, loading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject doit être utilisé dans un ProjectProvider');
  }
  return context;
}

export function getAllProjects(user: User | null) {
  const { projets } = useProjects();
  if (!user) return [];
  return projets.filter(p => p.membres.some(m => m.uid === user.uid));
}

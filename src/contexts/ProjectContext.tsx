'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Projet } from '@/types';
import { useProjects } from '@/hooks/useProjects';

interface ProjectContextType {
  currentProject: Projet | null;
  setCurrentProject: (project: Projet | null) => void;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProjectState] = useState<Projet | null>(null);
  const { projets, loading: loadingProjects } = useProjects();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingProjects) return;

    // Récupérer le projet stocké localement
    const storedProjectId = localStorage.getItem('currentProjectId');
    
    if (storedProjectId && projets.length > 0) {
      const projet = projets.find(p => p.id === storedProjectId);
      if (projet) {
        setCurrentProjectState(projet);
      } else if (projets.length > 0) {
        // Si le projet stocké n'existe plus, prendre le premier
        setCurrentProjectState(projets[0]);
        localStorage.setItem('currentProjectId', projets[0].id);
      }
    } else if (projets.length > 0) {
      // Pas de projet stocké, prendre le premier
      setCurrentProjectState(projets[0]);
      localStorage.setItem('currentProjectId', projets[0].id);
    }

    setLoading(false);
  }, [projets, loadingProjects]);

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

'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/client';
import type { Project, ProjectStatus, ResultSection } from '@/lib/types';

export interface ProjectView {
  project: Project;
  results: ResultSection[];
  can: { edit: boolean; statuses: ProjectStatus[] };
}

export function useProject(id: string) {
  const [view, setView] = useState<ProjectView | null>(null);
  const [error, setError] = useState('');
  const reload = useCallback(() => {
    api<ProjectView>(`/api/projects/${id}`).then(setView).catch((e) => setError(e.message));
  }, [id]);
  useEffect(reload, [reload]);
  return { view, error, reload };
}

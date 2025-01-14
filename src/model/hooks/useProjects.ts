import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import { generateUUID } from '@helpers/uuid';
import {
  loadProject as dbLoadProject,
  saveProject as dbSaveProject
} from '@model/db/api';
import { createProject } from '@model/project';
import { useCurrentProject } from '@model/store/selectors';
import { useStore } from '@model/store/useStore';
import { Project } from '@model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const log = createLog('model/useProjects');

export const useProjects = () => {
  const { store } = useStore();
  const queryClient = useQueryClient();
  const { projectId, projectName } = useCurrentProject();

  const createNewProject = useCallback(async () => {
    store.send({ type: 'newProject' });

    const snapshot = store.getSnapshot().context;
    const projectId = snapshot.projectId ?? generateUUID();
    const project = createProject(projectId, snapshot);

    await dbSaveProject(project);
    return project;
  }, [store]);

  // Add mutation for saving project
  const saveProjectMutation = useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      const snapshot = store.getSnapshot().context;
      const id = snapshot.projectId ?? generateUUID();
      const name = projectName ?? snapshot.projectName;

      const project = await dbLoadProject(id);

      const saveProject: Project = {
        ...(project ?? createProject(id, snapshot)),
        name,
        updatedAt: new Date().toISOString(),
        store: snapshot
      };

      await dbSaveProject(saveProject);
      return saveProject;
    },
    onSuccess: () => {
      // Optionally invalidate queries that depend on project data
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const saveProject = useCallback(
    async (projectName: string = 'Untitled') => {
      await saveProjectMutation.mutateAsync({ projectName });
      const { error } = saveProjectMutation;
      if (error) {
        log.error('Failed to save project:', error);
        // throw error;
      }
    },
    [saveProjectMutation]
  );

  return {
    projectId,
    projectName,
    createNewProject,
    saveProject
  };
};

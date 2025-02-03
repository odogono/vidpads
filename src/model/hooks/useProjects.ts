import { useCallback } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { invalidateAllQueries, invalidateQueryKeys } from '@helpers/query';
import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import {
  deleteDB as dbDeleteDB,
  getAllProjectDetails as dbGetAllProjectDetails,
  loadProject as dbLoadProject,
  saveProject as dbSaveProject
} from '@model/db/api';
import { useCurrentProject } from '@model/hooks/useCurrentProject';
import {
  exportToJSON,
  exportToJSONString,
  exportToURLString,
  urlStringToProject
} from '@model/serialise/store';
import { ProjectExport } from '@model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePadOperations } from './usePadOperations';

const log = createLog('model/useProjects');

export const useProjects = () => {
  const { project } = useProject();
  const events = useEvents();
  const queryClient = useQueryClient();
  const { projectId, projectName } = useCurrentProject();
  const { deleteAllPadThumbnails } = usePadOperations();
  const { addUrlToPad } = usePadOperations();

  const loadProjectFromJSON = useCallback(
    async (data: ProjectExport) => {
      invalidateAllQueries(queryClient);

      await deleteAllPadThumbnails();

      project.send({ type: 'importProject', data });

      await Promise.all(
        data.pads.map((pad) =>
          addUrlToPad({ url: pad.source, padId: pad.id, project })
        )
      );

      events.emit('project:loaded', {
        projectId: data.id,
        projectName: data.name
      });

      return true;
    },
    [queryClient, deleteAllPadThumbnails, project, addUrlToPad, events]
  );

  const importFromURLString = useCallback(
    async (urlString: string) => {
      const data = urlStringToProject(urlString);

      invalidateAllQueries(queryClient);

      await deleteAllPadThumbnails();

      project.send({ type: 'importProject', data });

      await Promise.all(
        data.pads.map((pad) =>
          addUrlToPad({ url: pad.source, padId: pad.id, project })
        )
      );

      events.emit('project:loaded', {
        projectId: data.id,
        projectName: data.name
      });

      return true;
    },
    [queryClient, deleteAllPadThumbnails, project, addUrlToPad, events]
  );

  const exportProjectToJSON = useCallback(() => {
    return exportToJSON(project);
  }, [project]);

  const exportProjectToJSONString = useCallback(() => {
    return exportToJSONString(project);
  }, [project]);

  const exportProjectToURLString = useCallback(() => {
    return exportToURLString(project);
  }, [project]);

  const importFromJSONString = useCallback(
    async (json: string) => {
      const jsonObject = JSON.parse(json) as ProjectExport;
      log.debug('Importing project:', jsonObject);

      await loadProjectFromJSON(jsonObject);
    },
    [loadProjectFromJSON]
  );

  const loadProject = useCallback(
    async (projectId: string) => {
      log.debug('Loading project:', projectId);

      const project = await dbLoadProject(projectId);

      if (!project) {
        log.warn('Project not found:', projectId);
        return false;
      }

      await loadProjectFromJSON(project);

      events.emit('project:loaded', { projectId, projectName: project.name });

      return true;
    },
    [events, loadProjectFromJSON]
  );

  const createNewProject = useCallback(async () => {
    project.send({ type: 'newProject' });

    invalidateAllQueries(queryClient);

    await deleteAllPadThumbnails();

    const projectId = project.getSnapshot().context.projectId;

    events.emit('project:created', {
      projectId: projectId!,
      projectName: 'Untitled'
    });

    return true;
  }, [project, queryClient, deleteAllPadThumbnails, events]);

  const deleteEverything = useCallback(async () => {
    await dbDeleteDB();
    queryClient.resetQueries();
    await createNewProject();
  }, [createNewProject, queryClient]);

  // Add mutation for saving project
  const saveProjectMutation = useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      const data = exportToJSON(project);

      const saveData = {
        ...data,
        name: projectName,
        updatedAt: new Date().toISOString()
      };

      log.debug('Saving project:', data);

      await dbSaveProject(saveData);

      // update the project id and name
      project.send({ type: 'updateProject', project: saveData });

      return saveData;
    },
    onSuccess: () => {
      // Optionally invalidate queries that depend on project data
      invalidateQueryKeys(queryClient, [[...VOKeys.projects()]]);
    }
  });

  const saveProject = useCallback(
    async (projectName: string = 'Untitled') => {
      log.debug('Saving project:', projectName);
      await saveProjectMutation.mutateAsync({ projectName });
      const { error } = saveProjectMutation;
      if (error) {
        log.error('Failed to save project:', error);
        // throw error;
      }
    },
    [saveProjectMutation]
  );

  const getAllProjectDetails = useCallback(async () => {
    try {
      return await queryClient.fetchQuery({
        queryKey: [...VOKeys.projectDetails()],
        queryFn: async () => {
          try {
            const projectDetails = await dbGetAllProjectDetails();
            return projectDetails;
          } catch {
            // log.warn('[usePadThumbnail] Error getting thumbnail:', error);
            return null;
          }
        }
      });
    } catch (err) {
      log.error('Failed to get all project details:', err);
      return [];
    }
  }, [queryClient]);

  return {
    projectId,
    projectName,
    createNewProject,
    loadProject,
    saveProject,
    exportToJSON: exportProjectToJSON,
    exportToJSONString: exportProjectToJSONString,
    exportToURLString: exportProjectToURLString,
    importFromJSONString,
    importFromURLString,
    getAllProjectDetails,
    deleteEverything
  };
};

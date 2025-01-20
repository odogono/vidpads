import { useCallback } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { invalidateQueryKeys } from '@helpers/query';
import {
  QUERY_KEY_PROJECT,
  QUERY_KEY_PROJECTS,
  QUERY_KEY_STATE
} from '@model/constants';
import {
  getAllProjectDetails as dbGetAllProjectDetails,
  loadProject as dbLoadProject,
  saveProject as dbSaveProject
} from '@model/db/api';
import {
  exportToJSON,
  exportToJSONString,
  exportToURLString,
  urlStringToProject
} from '@model/export';
import { useCurrentProject } from '@model/hooks/useCurrentProject';
import { useStore } from '@model/store/useStore';
import { ProjectExport } from '@model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMetadata } from './useMetadata';
import { usePadOperations } from './usePadOperations';

const log = createLog('model/useProjects');

export const useProjects = () => {
  const { store } = useStore();
  const events = useEvents();
  const queryClient = useQueryClient();
  const { projectId, projectName } = useCurrentProject();
  const { urlToExternalUrl } = useMetadata();
  const { deleteAllPadThumbnails } = usePadOperations();
  const { addUrlToPad } = usePadOperations();

  const loadProjectFromJSON = useCallback(
    async (data: ProjectExport) => {
      invalidateQueryKeys(queryClient, [[QUERY_KEY_STATE]]);

      await deleteAllPadThumbnails();

      store.send({ type: 'importProject', data });

      await Promise.all(
        data.pads.map((pad) =>
          addUrlToPad({ url: pad.source, padId: pad.id, store })
        )
      );

      events.emit('project:loaded', {
        projectId: data.id,
        projectName: data.name
      });

      return true;
    },
    [queryClient, deleteAllPadThumbnails, store, addUrlToPad, events]
  );

  const importFromURLString = useCallback(
    async (urlString: string) => {
      const data = urlStringToProject(urlString);

      invalidateQueryKeys(queryClient, [[QUERY_KEY_STATE]]);

      await deleteAllPadThumbnails();

      store.send({ type: 'importProject', data });

      await Promise.all(
        data.pads.map((pad) =>
          addUrlToPad({ url: pad.source, padId: pad.id, store })
        )
      );

      events.emit('project:loaded', {
        projectId: data.id,
        projectName: data.name
      });

      return true;
    },
    [queryClient, deleteAllPadThumbnails, store, addUrlToPad, events]
  );

  const exportProjectToJSON = useCallback(() => {
    return exportToJSON(store, urlToExternalUrl);
  }, [store, urlToExternalUrl]);

  const exportProjectToJSONString = useCallback(() => {
    return exportToJSONString(store, urlToExternalUrl);
  }, [store, urlToExternalUrl]);

  const exportProjectToURLString = useCallback(() => {
    return exportToURLString(store, urlToExternalUrl);
  }, [store, urlToExternalUrl]);

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
    store.send({ type: 'newProject' });

    invalidateQueryKeys(queryClient, [[QUERY_KEY_PROJECT], [QUERY_KEY_STATE]]);

    await deleteAllPadThumbnails();

    const projectId = store.getSnapshot().context.projectId;

    events.emit('project:created', {
      projectId: projectId!,
      projectName: 'Untitled'
    });

    return true;
  }, [store, queryClient, deleteAllPadThumbnails, events]);

  // Add mutation for saving project
  const saveProjectMutation = useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      const data = exportToJSON(store, urlToExternalUrl);

      const saveData = {
        ...data,
        name: projectName,
        updatedAt: new Date().toISOString()
      };

      log.debug('Saving project:', data);

      await dbSaveProject(saveData);

      // update the project id and name
      store.send({ type: 'updateProject', project: saveData });

      return saveData;
    },
    onSuccess: () => {
      // Optionally invalidate queries that depend on project data
      invalidateQueryKeys(queryClient, [
        [QUERY_KEY_PROJECT],
        [QUERY_KEY_PROJECTS]
      ]);
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
        queryKey: [QUERY_KEY_PROJECTS],
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
    getAllProjectDetails
  };
};

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
  saveProject as dbSaveProject,
  saveProjectState as dbSaveProjectState
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
import { createStore } from '../store/store';
import { StoreContextType } from '../store/types';
import { usePadOperations } from './usePadOperations';

const log = createLog('model/useProjects');

export const useProjects = () => {
  const { project, setProjectId } = useProject();
  const events = useEvents();
  const queryClient = useQueryClient();
  const { projectId, projectName } = useCurrentProject();
  const { deleteAllPadThumbnails } = usePadOperations();
  const { addUrlToPad } = usePadOperations();

  const loadProjectFromJSON = useCallback(
    async (data: ProjectExport) => {
      // await deleteAllPadThumbnails();
      const newStore = createStore();
      newStore.send({ type: 'importProject', data });
      const snapshot = newStore.getSnapshot();

      await dbSaveProjectState(snapshot.context);

      log.debug(
        '[loadProjectFromJSON] save project',
        snapshot.context.projectId
      );

      setProjectId(data.id);

      invalidateAllQueries(queryClient);
      return true;
    },
    [setProjectId, queryClient]
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
    [queryClient, deleteAllPadThumbnails, project, events, addUrlToPad]
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

      // const project = await dbLoadProject(projectId);

      // if (!project) {
      //   log.warn('Project not found:', projectId);
      //   return false;
      // }

      // await loadProjectFromJSON(project);

      setProjectId(projectId);
      // events.emit('project:loaded', { projectId, projectName: project.name });

      return true;
    },
    [setProjectId]
  );

  const createNewProject = useCallback(async () => {
    const newStore = createStore();
    const snapshot = newStore.getSnapshot();
    const newProjectId = snapshot.context.projectId;
    await dbSaveProjectState(snapshot.context);

    log.debug('createNewProject', newProjectId);

    setProjectId(newProjectId);

    return true;
  }, [setProjectId]);

  const deleteEverything = useCallback(async () => {
    await dbDeleteDB();
    await createNewProject();
  }, [createNewProject]);

  // Add mutation for saving project
  const saveProjectMutation = useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      // const data = exportToJSON(project);

      const data = project.getSnapshot().context;
      const saveData: StoreContextType = {
        ...data,
        projectName,
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

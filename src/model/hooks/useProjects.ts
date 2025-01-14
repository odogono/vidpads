import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import { generateUUID } from '@helpers/uuid';
import {
  getAllProjectDetails as dbGetAllProjectDetails,
  loadProject as dbLoadProject,
  saveProject as dbSaveProject
} from '@model/db/api';
import { createProject } from '@model/project';
import { useCurrentProject } from '@model/store/selectors';
import { useStore } from '@model/store/useStore';
import { Project, ProjectExport } from '@model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  QUERY_KEY_PROJECT,
  QUERY_KEY_PROJECTS,
  QUERY_KEY_STATE
} from '../constants';
import { exportPadToJSON, exportPadToURLString } from '../pad';
import { usePadMetadata } from './useMetadataFromPad';
import { usePadOperations } from './usePadOperations';

const log = createLog('model/useProjects');

export const useProjects = () => {
  const { store } = useStore();
  const queryClient = useQueryClient();
  const { projectId, projectName } = useCurrentProject();
  const { urlToExternalUrlMap } = usePadMetadata();
  const { deleteAllPadThumbnails } = usePadOperations();
  const { addUrlToPad } = usePadOperations();

  const loadProjectFromJSON = useCallback(
    async (data: ProjectExport) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_STATE]
      });

      await deleteAllPadThumbnails();

      store.send({ type: 'importProject', data });

      await Promise.all(
        data.pads.map((pad) =>
          addUrlToPad({ url: pad.source, padId: pad.id, store })
        )
      );

      return true;
    },
    [queryClient, deleteAllPadThumbnails, store, addUrlToPad]
  );

  const loadProject = useCallback(
    async (projectId: string) => {
      log.debug('Loading project:', projectId);

      const project = await dbLoadProject(projectId);

      if (!project) {
        log.error('Project not found:', projectId);
        return false;
      }

      await loadProjectFromJSON(project);

      return true;
    },
    [loadProjectFromJSON]
  );

  const createNewProject = useCallback(async () => {
    store.send({ type: 'newProject' });

    queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_PROJECT]
    });

    queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_STATE]
    });

    await deleteAllPadThumbnails();

    return true;
  }, [store, queryClient, deleteAllPadThumbnails]);

  // Add mutation for saving project
  const saveProjectMutation = useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      const data = exportToJSON();

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
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PROJECT]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PROJECTS]
      });
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

  const exportToJSON = useCallback(() => {
    const { context } = store.getSnapshot();

    const { projectId, projectName, createdAt, updatedAt, pads } = context;

    const padsJSON = pads
      .map((pad) => exportPadToJSON(pad, urlToExternalUrlMap))
      .filter(Boolean);

    return {
      id: projectId ?? generateUUID(),
      name: projectName ?? 'Untitled',
      createdAt: createdAt ?? new Date().toISOString(),
      updatedAt: updatedAt ?? new Date().toISOString(),
      pads: padsJSON
    } as ProjectExport;
  }, [store, urlToExternalUrlMap]);

  const exportToJSONString = useCallback(() => {
    const json = exportToJSON();
    return JSON.stringify(json);
  }, [exportToJSON]);

  const exportToURLString = useCallback(() => {
    const { context } = store.getSnapshot();

    const { projectId, projectName, createdAt, updatedAt, pads } = context;

    const padsURL = pads
      .map((pad) => exportPadToURLString(pad, urlToExternalUrlMap))
      .filter(Boolean);

    return `${projectId}|${projectName}|${createdAt}|${updatedAt}|${padsURL.join('|')}`;
  }, [store, urlToExternalUrlMap]);

  const importFromJSONString = useCallback(
    async (json: string) => {
      const jsonObject = JSON.parse(json) as ProjectExport;
      log.debug('Importing project:', jsonObject);

      await loadProjectFromJSON(jsonObject);
    },
    [loadProjectFromJSON]
  );

  return {
    projectId,
    projectName,
    createNewProject,
    loadProject,
    saveProject,
    exportToJSON,
    exportToJSONString,
    exportToURLString,
    importFromJSONString,
    getAllProjectDetails
  };
};

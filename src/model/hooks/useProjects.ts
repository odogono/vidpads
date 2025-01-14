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
import { Project, ProjectExport } from '@model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY_PROJECT } from '../constants';
import { exportPadToJSON, exportPadToURLString } from '../pad';
import { usePadMetadata } from './useMetadataFromPad';
import { usePadOperations } from './usePadOperations';

const log = createLog('model/useProjects');

export const useProjects = () => {
  const { store } = useStore();
  const queryClient = useQueryClient();
  const { projectId, projectName } = useCurrentProject();
  const { urlToExternalUrlMap } = usePadMetadata();
  const { addUrlToPad } = usePadOperations();

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

      log.debug('Saving project:', saveProject);

      await dbSaveProject(saveProject);

      // update the project id and name
      store.send({ type: 'updateProject', project: saveProject });

      return saveProject;
    },
    onSuccess: () => {
      // Optionally invalidate queries that depend on project data
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PROJECT]
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

  const exportToJSON = useCallback(() => {
    const { context } = store.getSnapshot();

    const { projectId, projectName, createdAt, updatedAt, pads } = context;

    const padsJSON = pads
      .map((pad) => exportPadToJSON(pad, urlToExternalUrlMap))
      .filter(Boolean);

    return {
      id: projectId,
      name: projectName,
      createdAt,
      updatedAt,
      pads: padsJSON
    };
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

      store.send({ type: 'importProject', data: jsonObject });

      await Promise.all(
        jsonObject.pads.map((pad) =>
          addUrlToPad({ url: pad.source, padId: pad.id, store })
        )
      );

      log.debug('Imported project:', jsonObject);
    },
    [store, addUrlToPad]
  );

  return {
    projectId,
    projectName,
    createNewProject,
    saveProject,
    exportToJSON,
    exportToJSONString,
    exportToURLString,
    importFromJSONString
  };
};

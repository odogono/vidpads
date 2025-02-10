import { useCallback } from 'react';

import {
  exportToJSON,
  exportToJSONString,
  exportToURLString,
  urlStringToProject
} from '@/model/serialise/project';
import { compress } from '@helpers/compress';
import { dateToISOString, formatShortDate } from '@helpers/datetime';
import { createLog } from '@helpers/log';
import { resetAllQueries } from '@helpers/query';
import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import {
  deleteDB as dbDeleteDB,
  getAllProjectDetails as dbGetAllProjectDetails,
  saveProject as dbSaveProject,
  saveProjectState as dbSaveProjectState
} from '@model/db/api';
import { useCurrentProject } from '@model/hooks/useCurrentProject';
import { createStore } from '@model/store/store';
import { StoreContextType } from '@model/store/types';
import { ProjectExport } from '@model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const log = createLog('model/useProjects');

export const useProjects = () => {
  const { project, setProjectId } = useProject();
  const queryClient = useQueryClient();
  const { projectId, projectName } = useCurrentProject();

  const loadProjectFromJSON = useCallback(
    async (data: ProjectExport) => {
      // await deleteAllPadThumbnails();
      const newStore = createStore();
      newStore.send({ type: 'importProject', data });
      const snapshot = newStore.getSnapshot();

      await dbSaveProjectState(snapshot.context);

      log.debug('[loadProjectFromJSON] project', snapshot.context.projectId);

      setProjectId(snapshot.context.projectId);

      // invalidateAllQueries(queryClient);
      return true;
    },
    [setProjectId]
  );

  const importFromURLString = useCallback(
    async (urlString: string) => {
      const data = urlStringToProject(urlString);

      const newStore = createStore();
      newStore.send({ type: 'importProject', data });
      const snapshot = newStore.getSnapshot();

      await dbSaveProjectState(snapshot.context);

      log.debug('[loadProjectFromJSON] project', snapshot.context.projectId);

      setProjectId(snapshot.context.projectId);

      // await Promise.all(
      //   data.pads.map((pad) =>
      //     addUrlToPad({ url: getPadSourceUrl(pad), padId: pad.id, projectId })
      //   )
      // );

      return true;
    },
    [setProjectId]
  );

  const exportProjectToJSON = useCallback(() => {
    return exportToJSON(project);
  }, [project]);

  const exportProjectToJSONString = useCallback(() => {
    return exportToJSONString(project);
  }, [project]);

  const exportProjectToURLString = useCallback(async () => {
    const urlString = await exportToURLString(project);
    return urlString;
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
      queryClient.invalidateQueries({ queryKey: VOKeys.project(projectId) });
      setProjectId(projectId);
      return true;
    },
    [queryClient, setProjectId]
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

  // Add mutation for saving project
  const saveProjectMutation = useMutation({
    mutationFn: async ({ projectName }: { projectName: string }) => {
      // const data = exportToJSON(project);

      const data = project.getSnapshot().context;
      const saveData: StoreContextType = {
        ...data,
        projectName,
        updatedAt: dateToISOString()
      };

      log.debug('Saving project:', data);

      await dbSaveProject(saveData);

      // update the project id and name
      project.send({ type: 'updateProject', project: saveData });

      return saveData;
    },
    onSuccess: () => {
      // invalidate queries that depend on project data
      // holy hell this reloads everything - don't do it
      // invalidateQueryKeys(queryClient, [[...VOKeys.projects()]]);
    }
  });

  const saveProject = useCallback(
    async (projectName: string = '') => {
      if (!projectName) {
        projectName = `Untitled ${formatShortDate()}`;
      }
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

  const deleteEverything = useCallback(async () => {
    await dbDeleteDB();
    await resetAllQueries(queryClient);
    await createNewProject();
  }, [createNewProject, queryClient]);

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

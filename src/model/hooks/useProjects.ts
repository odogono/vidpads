import { useCallback, useMemo } from 'react';

import { createLog } from '@helpers/log';
import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import {
  createBrowserProjectMediaWorkflowDeps,
  createProjectMediaSession,
  createProjectMediaWorkflow
} from '@model/projectMediaWorkflow';
import { useCurrentProject } from '@model/hooks/useCurrentProject';
import { ProjectExport } from '@model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const log = createLog('model/useProjects', ['debug']);

export const useProjects = () => {
  const { project, setProjectId } = useProject();
  const queryClient = useQueryClient();
  const { projectId, projectName } = useCurrentProject();
  const deps = useMemo(
    () =>
      createBrowserProjectMediaWorkflowDeps({
        queryClient,
        routing: { setProjectId }
      }),
    [queryClient, setProjectId]
  );
  const workflow = useMemo(() => createProjectMediaWorkflow(deps), [deps]);
  const session = useMemo(
    () =>
      createProjectMediaSession({
        deps,
        projectId,
        store: project,
        autosave: false
      }),
    [deps, project, projectId]
  );

  const loadProjectFromJSON = useCallback(
    async (data: ProjectExport) => {
      const imported = await workflow.importProjectFromJSONString(
        JSON.stringify(data)
      );
      project.send({
        type: 'updateProject',
        project: imported.store.getSnapshot().context
      });
      return true;
    },
    [project, workflow]
  );

  const importFromURLString = useCallback(
    async (urlString: string) => {
      const imported = await workflow.importProjectFromURLString(urlString);
      project.send({
        type: 'updateProject',
        project: imported.store.getSnapshot().context
      });
      return true;
    },
    [project, workflow]
  );

  const exportProjectToURLString = useCallback(async () => {
    return workflow.exportProjectToURLString(session);
  }, [session, workflow]);

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
      const loaded = await workflow.loadProject(projectId);
      project.send({
        type: 'updateProject',
        project: loaded.store.getSnapshot().context
      });
      return true;
    },
    [project, workflow]
  );

  const createNewProject = useCallback(async () => {
    const created = await workflow.createProject();
    project.send({
      type: 'updateProject',
      project: created.store.getSnapshot().context
    });
    return true;
  }, [project, workflow]);

  const { mutateAsync: saveProject } = useMutation({
    mutationFn: async (projectName: string = '') => {
      log.debug('Saving project:', projectName);
      return workflow.renameProject({ session, projectName });
    }
  });

  const getAllProjectDetails = useCallback(async () => {
    try {
      return await queryClient.fetchQuery({
        queryKey: [...VOKeys.projectDetails()],
        queryFn: async () => {
          try {
            return await workflow.listProjectDetails();
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
  }, [queryClient, workflow]);

  const deleteEverything = useCallback(async () => {
    const created = await workflow.deleteEverything();
    project.send({
      type: 'updateProject',
      project: created.store.getSnapshot().context
    });
  }, [project, workflow]);

  return {
    projectId,
    projectName,
    createNewProject,
    loadProject,
    saveProject,
    exportToURLString: exportProjectToURLString,
    importFromJSONString,
    importFromURLString,
    getAllProjectDetails,
    deleteEverything
  };
};

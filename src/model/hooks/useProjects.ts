import { useCallback, useMemo } from 'react';

import { createLog } from '@helpers/log';
import { useProject } from '@hooks/useProject';
import { VOKeys } from '@model/constants';
import {
  createBrowserProjectMediaWorkflowDeps,
  createProjectMediaSession,
  createProjectMediaWorkflow,
  ProjectMediaSession
} from '@model/projectMediaWorkflow';
import { useCurrentProject } from '@model/hooks/useCurrentProject';
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

  const afterImport = useCallback(
    (imported: ProjectMediaSession) => {
      const importedProject = imported.store.getSnapshot().context;
      queryClient.setQueryData(VOKeys.project(importedProject.projectId), imported);
      project.send({ type: 'updateProject', project: importedProject });
      return true;
    },
    [project, queryClient]
  );

  const importFromURLString = useCallback(
    (urlString: string) =>
      workflow.importProjectFromURLString(urlString).then(afterImport),
    [afterImport, workflow]
  );

  const exportProjectToURLString = useCallback(async () => {
    return workflow.exportProjectToURLString(session);
  }, [session, workflow]);

  const importFromJSONString = useCallback(
    (json: string) =>
      workflow.importProjectFromJSONString(json).then(afterImport),
    [afterImport, workflow]
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

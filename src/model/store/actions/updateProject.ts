import { ProjectStoreContext, UpdateProjectAction } from '../types';
import { update } from './helpers';

export const updateProject = (
  context: ProjectStoreContext,
  action: UpdateProjectAction
): ProjectStoreContext => {
  const { project } = action;

  const { projectId, projectName, createdAt, updatedAt } = project;

  return update(context, {
    projectId,
    projectName,
    createdAt,
    updatedAt
  });
};

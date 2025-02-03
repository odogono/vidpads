import { StoreContext, UpdateProjectAction } from '../types';
import { update } from './helpers';

export const updateProject = (
  context: StoreContext,
  action: UpdateProjectAction
): StoreContext => {
  const { project } = action;

  const { projectId, projectName, createdAt, updatedAt } = project;

  return update(context, {
    projectId,
    projectName,
    createdAt,
    updatedAt
  });
};

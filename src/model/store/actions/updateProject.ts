import { StoreContext, UpdateProjectAction } from '../types';
import { update } from './helpers';

export const updateProject = (
  context: StoreContext,
  action: UpdateProjectAction
): StoreContext => {
  const { project } = action;

  const { id, name, createdAt, updatedAt } = project;

  return update(context, {
    projectId: id,
    projectName: name,
    createdAt,
    updatedAt
  });
};

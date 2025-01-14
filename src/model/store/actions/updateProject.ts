import { StoreContext, UpdateProjectAction } from '../types';

export const updateProject = (
  context: StoreContext,
  action: UpdateProjectAction
): StoreContext => {
  const { project } = action;

  const { id, name, createdAt, updatedAt } = project;

  return {
    ...context,
    projectId: id,
    projectName: name,
    createdAt,
    updatedAt
  };
};

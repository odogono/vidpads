import { ProjectStoreContext, UpdateProjectAction } from '../types';

export const updateProject = (
  context: ProjectStoreContext,
  action: UpdateProjectAction
): ProjectStoreContext => {
  const { project } = action;
  return {
    ...context,
    ...project
  };
};

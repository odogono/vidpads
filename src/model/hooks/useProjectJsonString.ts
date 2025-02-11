import { exportToJSONString } from '../serialise/project';
import { useCurrentProject } from './useCurrentProject';

export const useProjectJsonString = () => {
  const { project } = useCurrentProject();
  const json = exportToJSONString(project);
  return json;
};

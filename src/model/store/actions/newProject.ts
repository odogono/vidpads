

import { generateUUID } from "@helpers/uuid";
import { initialContext } from "../store";
import { StoreContext } from "../types";

export const newProject = (): StoreContext => {
  return {
    ...initialContext,
    projectId: generateUUID(),
    name: 'Untitled'
  };
}

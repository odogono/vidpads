import { StoreContextType } from "./store/types";
import { Project } from "./types";


export const createProject = (id: string, store: StoreContextType): Project => {
  return {
    id,
    name: 'Untitled',
    store,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};


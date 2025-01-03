import { Pad } from './types';

export const createPad = (id: string): Pad => {
  return {
    id,
    recipe: {
      source: undefined,
      operations: []
    }
  };
};

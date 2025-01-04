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

export const getPadSourceUrl = (pad: Pad): string | undefined => {
  return pad.recipe.source?.url;
};

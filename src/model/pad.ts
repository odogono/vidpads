import { Pad } from './types';

export const createPad = (id: string): Pad => {
  return {
    id,
    pipeline: {
      source: undefined,
      operations: []
    }
  };
};

export const getPadSourceUrl = (pad: Pad): string | undefined => {
  return pad.pipeline.source?.url;
};

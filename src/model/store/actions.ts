import { OperationType, type Pad } from '../types';
import type { Emit, Events, StoreContextType } from './types';

export const actions = {
  updatePadSource: (
    context: NoInfer<StoreContextType>,
    event: Events,
    { emit }: Emit
  ) => {
    const pad = context.pads.find((pad) => pad.id === event.padId);
    if (!pad) {
      return context;
    }

    const newPad: Pad = {
      ...pad,
      recipe: {
        ...pad.recipe,
        source: {
          type: OperationType.Source,
          url: event.url
        }
      }
    };

    emit({ type: 'padUpdated', pad: newPad });

    return {
      ...context,
      pads: [...context.pads.filter((p) => p.id !== pad.id), newPad]
    };
  }
};

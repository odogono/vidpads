import { OperationType, type Pad } from '../types';
import type {
  Emit,
  StoreContextType,
  UpdatePadSourceEvent,
  UpdateStartTimeEvent
} from './types';

export const updatePadSource = (
  context: NoInfer<StoreContextType>,
  event: UpdatePadSourceEvent,
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
};

export const updateStartTime = (
  context: NoInfer<StoreContextType>,
  event: UpdateStartTimeEvent,
  { emit }: Emit
) => {
  const startTime = new Date().toISOString();
  emit({ type: 'startTimeUpdated', startTime });

  return {
    ...context,
    startTime
  };
};

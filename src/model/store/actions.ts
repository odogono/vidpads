import { createLog } from '@helpers/log';
import { OperationType, type Pad } from '../types';
import type {
  Emit,
  InitialiseStoreAction,
  StoreContextType,
  UpdatePadSourceAction,
  UpdateStartTimeAction
} from './types';

type Context = NoInfer<StoreContextType>;

const log = createLog('store/actions');

export const initialiseStore = (
  context: Context,
  event: InitialiseStoreAction,
  { emit }: Emit
): Context => {
  log.debug('setStoreInitialised', event);

  emit({ type: 'storeInitialised' });

  return {
    ...context,
    isInitial: false
  };
};

export const updatePadSource = (
  context: Context,
  event: UpdatePadSourceAction,
  { emit }: Emit
): Context => {
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
  context: Context,
  event: UpdateStartTimeAction,
  { emit }: Emit
): Context => {
  const startTime = new Date().toISOString();
  emit({ type: 'startTimeUpdated', startTime });

  return {
    ...context,
    startTime
  };
};

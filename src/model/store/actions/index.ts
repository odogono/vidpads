import { createLog } from '@helpers/log';
import { OperationType, Pad } from '@model/types';
import type {
  ApplyPadDropAction,
  Emit,
  InitialiseStoreAction,
  SetPadMediaAction,
  StoreContext,
  UpdatePadSourceAction,
  UpdateStartTimeAction
} from '../types';

const log = createLog('store/actions');

export { applyFileToPad } from './applyFileToPad';
export { clearPad } from './clearPad';

export const initialiseStore = (
  context: StoreContext,
  event: InitialiseStoreAction,
  { emit }: Emit
): StoreContext => {
  log.debug('setStoreInitialised', event);

  emit({ type: 'storeInitialised' });

  return {
    ...context,
    isInitial: false
  };
};

export const updatePadSource = (
  context: StoreContext,
  event: UpdatePadSourceAction,
  { emit }: Emit
): StoreContext => {
  const pad = context.pads.find((pad) => pad.id === event.padId);
  if (!pad) {
    return context;
  }

  const newPad: Pad = {
    ...pad,
    pipeline: {
      ...pad.pipeline,
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
  context: StoreContext,
  _event: UpdateStartTimeAction,
  { emit }: Emit
): StoreContext => {
  const startTime = new Date().toISOString();
  emit({ type: 'startTimeUpdated', startTime });

  return {
    ...context,
    startTime
  };
};

export const setPadMedia = (
  context: StoreContext,
  event: SetPadMediaAction
): StoreContext => {
  const { padId, media } = event;
  const pad = context.pads.find((pad) => pad.id === padId);
  if (!pad) {
    return context;
  }

  const { url } = media;

  const newPad: Pad = {
    ...pad,
    pipeline: {
      ...pad.pipeline,
      source: {
        type: OperationType.Source,
        url
      }
    }
  };

  return {
    ...context,
    pads: [...context.pads.filter((p) => p.id !== pad.id), newPad]
  };
};

export const applyPadDrop = (
  context: StoreContext,
  _event: ApplyPadDropAction
): StoreContext => {
  return context;
};

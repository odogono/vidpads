import { createLog } from '@helpers/log';
import { OperationType, Pad } from '@model/types';
import type {
  Emit,
  InitialiseStoreAction,
  SetEditActiveAction,
  SetPadIsLoopedAction,
  SetPadIsOneShotAction,
  SetPadMediaAction,
  SetSelectedPadIdAction,
  StoreContext,
  UpdatePadSourceAction,
  UpdateStartTimeAction
} from '../types';
import { addOrReplacePad, findPadById } from './helpers';

const log = createLog('store/actions');

export { applyFileToPad } from './applyFileToPad';
export { clearPad } from './clearPad';
export { copyPad } from './copyPad';
export { playPad } from './playPad';
export { applyTrimToPad } from './applyTrimToPad';

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

export const setEditActive = (
  context: StoreContext,
  event: SetEditActiveAction,
  { emit }: Emit
): StoreContext => {
  const { isEditActive } = event;
  emit({ type: 'isEditActive', isEditActive });

  return {
    ...context,
    isEditActive
  };
};

export const setSelectedPadId = (
  context: StoreContext,
  event: SetSelectedPadIdAction
): StoreContext => {
  const { padId } = event;
  const isEditActive = !padId ? false : context.isEditActive;

  return {
    ...context,
    isEditActive,
    selectedPadId: padId
  };
};

export const setPadIsOneShot = (
  context: StoreContext,
  event: SetPadIsOneShotAction
): StoreContext => {
  const { padId, isOneShot } = event;
  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const newPad = { ...pad, isOneShot };

  return addOrReplacePad(context, newPad);
};

export const setPadIsLooped = (
  context: StoreContext,
  event: SetPadIsLoopedAction
): StoreContext => {
  const { padId, isLooped } = event;
  const pad = findPadById(context, padId);
  if (!pad) {
    return context;
  }

  const newPad = { ...pad, isLooped };

  return addOrReplacePad(context, newPad);
};

export const updatePadSource = (
  context: StoreContext,
  event: UpdatePadSourceAction,
  { emit }: Emit
): StoreContext => {
  const pad = findPadById(context, event.padId);
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

  return addOrReplacePad(context, newPad);
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
  const pad = findPadById(context, padId);
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

  return addOrReplacePad(context, newPad);
};

export const applyPadDrop = (context: StoreContext): StoreContext => {
  return context;
};

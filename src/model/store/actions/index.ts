import { OperationType, Pad } from '@model/types';
import type {
  Emit,
  SetEditActiveAction,
  SetPadIsLoopedAction,
  SetPadIsOneShotAction,
  StoreContext,
  UpdatePadSourceAction,
  UpdateStartTimeAction
} from '../types';
import { addOrReplacePad, findPadById, update } from './helpers';

export { applyPad } from './applyPad';
export { applyPlaybackRateToPad } from './applyPlaybackRateToPad';
export { applyTrimToPad } from './applyTrimToPad';
export { applyVolumeToPad } from './applyVolumeToPad';
export { applyVolumeEnvelopeToPad } from './applyVolumeEnvelopeToPad';
export { clearPad } from './clearPad';
export {
  setSelectedSeqEventId,
  toggleSequencerEvent,
  addSequencerEvent,
  clearSequencerEvents,
  removeSequencerEvent,
  moveSequencerEvents,
  selectSequencerEvents,
  setSequencerStartTime,
  setSequencerEndTime
} from './sequencerEvents';
export { copyPad } from './copyPad';
export { importProject } from './importProject';
export { initialiseStore } from './initialiseStore';
export { newProject } from './newProject';
export { setLastMediaUrl } from './setLastMediaUrl';
export { setLastImportUrl } from './setLastImportUrl';
export { setPadMedia } from './setPadMedia';
export { setPadPlayEnabled } from './setPadPlayEnabled';
export { setPadSelectSourceEnabled } from './setPadSelectSourceEnabled';
export { setSelectedControlPane } from './setControlPane';
export { setSelectedPadId } from './setSelectedPadId';
export { setSequencerBpm } from './setSequencerBpm';
export { setShowMode } from './setShowMode';
export { updateProject } from './updateProject';

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

  return update(context, { startTime });
};

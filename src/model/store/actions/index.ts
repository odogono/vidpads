import { OperationType, Pad } from '@model/types';
import type {
  Emit,
  SetPadIsOneShotAction,
  StoreContext,
  UpdatePadSourceAction
} from '../types';
import { addOrReplacePad, findPadById } from './helpers';

export { applyPad } from './applyPad';
export { applyPlaybackRateToPad } from './applyPlaybackRateToPad';
export { applyTrimToPad } from './applyTrimToPad';
export { applyLoopToPad } from './applyLoopToPad';
export { applyVolumeToPad } from './applyVolumeToPad';
export { applyVolumeEnvelopeToPad } from './applyVolumeEnvelopeToPad';
export { clearPad } from './clearPad';
export {
  toggleSequencerEvent,
  addSequencerEvent,
  clearSequencerEvents,
  removeSequencerEvent,
  moveSequencerEvents,
  selectSequencerEvents,
  setSequencerStartTime,
  setSequencerEndTime,
  setSelectedEventsTime,
  setSelectedEventsDuration
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
export { setPadLabel } from './setPadLabel';
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

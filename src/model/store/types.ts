import type { Media, Pad } from '@model/types';
import type { Store } from '@xstate/store';

export interface StoreContextType {
  isInitial: boolean;
  startTime: string;
  pads: Pad[];
}

export type UpdatePadSourceAction = {
  type: 'updatePadSource';
  padId: string;
  url: string;
};

export type UpdateStartTimeAction = {
  type: 'updateStartTime';
};

export type InitialiseStoreAction = {
  type: 'initialiseStore';
};

export type SetPadMediaAction = {
  type: 'setPadMedia';
  padId: string;
  media: Media;
};

export type ApplyFileToPadAction = {
  type: 'applyFileToPad';
  padId: string;
  file: File;
};

export type ApplyPadDropAction = {
  type: 'applyPadDrop';
  sourcePadId: string;
  targetPadId: string;
};

export type ClearPadAction = {
  type: 'clearPad';
  padId: string;
};

export type CopyPadAction = {
  type: 'copyPad';
  sourcePadId: string;
  targetPadId: string;
};

export type Actions =
  | InitialiseStoreAction
  | UpdateStartTimeAction
  | UpdatePadSourceAction
  | SetPadMediaAction
  | ApplyFileToPadAction
  | ApplyPadDropAction
  | ClearPadAction
  | CopyPadAction;

export type PadUpdatedEvent = {
  type: 'padUpdated';
  pad: Pad;
};

export type StartTimeUpdatedEvent = {
  type: 'startTimeUpdated';
  startTime: string;
};

export type StoreInitialisedEvent = {
  type: 'storeInitialised';
};

export type EmittedEvents =
  | PadUpdatedEvent
  | StartTimeUpdatedEvent
  | StoreInitialisedEvent;

export type Emit = { emit: (event: EmittedEvents) => void };

export type StoreType = Store<StoreContextType, Actions, EmittedEvents>;

export type StoreSnapshot = ReturnType<StoreType['subscribe']>;

export type StoreContext = NoInfer<StoreContextType>;

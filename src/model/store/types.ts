import type { Store } from '@xstate/store';
import type { Pad } from '../types';

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

export type Actions =
  | InitialiseStoreAction
  | UpdateStartTimeAction
  | UpdatePadSourceAction;

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

// export const myAction: Actions = { type: 'someOtherAction' };

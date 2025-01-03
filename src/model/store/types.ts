import type { Store } from '@xstate/store';
import type { Pad } from '../types';

export type StoreContextType = {
  startTime: string;
  pads: Pad[];
};

export type UpdatePadSourceEvent = {
  type: 'updatePadSource';
  padId: string;
  url: string;
};

export type UpdateStartTimeEvent = {
  type: 'updateStartTime';
};

type PadUpdatedEvent = {
  type: 'padUpdated';
  pad: Pad;
};

type StartTimeUpdatedEvent = {
  type: 'startTimeUpdated';
  startTime: string;
};

export type Events = UpdatePadSourceEvent | UpdateStartTimeEvent;
export type EmittedEvents = PadUpdatedEvent | StartTimeUpdatedEvent;
export type Emit = { emit: (event: EmittedEvents) => void };

export type StoreType = Store<StoreContextType, Events, EmittedEvents>;

export type StoreSnapshot = ReturnType<StoreType['subscribe']>;

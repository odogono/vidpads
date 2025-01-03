import type { Store } from '@xstate/store';
import type { Pad } from '../types';

export type StoreContextType = {
  pads: Pad[];
};

export type UpdatePadSourceEvent = {
  type: 'updatePadSource';
  padId: string;
  url: string;
};

type PadUpdatedEvent = {
  type: 'padUpdated';
  pad: Pad;
};

export type Events = UpdatePadSourceEvent;
export type EmittedEvents = PadUpdatedEvent;
export type Emit = { emit: (event: EmittedEvents) => void };

export type StoreType = Store<
  StoreContextType,
  UpdatePadSourceEvent,
  PadUpdatedEvent
>;

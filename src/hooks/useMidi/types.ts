export interface MidiInput {
  id: string;
  name: string;
  state: 'connected' | 'disconnected';
}

export interface MidiStoreContext {
  isEnabled: boolean;
  isMappingModeEnabled: boolean;
  inputs: MidiInput[];
  midiToPadMap: Record<string, string>;
  padToMidiMap: Record<string, string>;
}

export type SetIsEnabledAction = { type: 'setIsEnabled'; isEnabled: boolean };

export type InputConnectedAction = {
  type: 'inputConnected';
  id: string;
  name?: string | null;
};

export type InputDisconnectedAction = { type: 'inputDisconnected'; id: string };

export type InputMessageAction = {
  type: 'inputMessage';
  id: string;
  status: number;
  note: number;
  velocity: number;
  selectedPadId?: string | null;
};

export type EnableMappingModeAction = {
  type: 'enableMappingMode';
  isEnabled: boolean;
};

export type RemoveMidiMappingForPadAction = {
  type: 'removeMidiMappingForPad';
  padId: string;
};

export type Actions =
  | SetIsEnabledAction
  | InputConnectedAction
  | InputDisconnectedAction
  | InputMessageAction
  | EnableMappingModeAction
  | RemoveMidiMappingForPadAction;

export type ReadyEvent = { type: 'ready' };

export type MidiMappingUpdatedEvent = {
  type: 'midiMappingUpdated';
  padId: string;
  midiKey: string;
};

export type EmittedEvents = ReadyEvent | MidiMappingUpdatedEvent;
export type Emit = { emit: (event: EmittedEvents) => void };

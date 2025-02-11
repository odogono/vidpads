export interface MidiInput {
  id: string;
  name: string;
  state: 'connected' | 'disconnected';
}

export interface MidiStoreContext {
  isEnabled: boolean;
  isMappingModeEnabled: boolean;
  inputs: MidiInput[];
  midiToPadMap: Record<string, string[]>;
  padToMidiMap: Record<string, string>;
  midiNoteOnMap: Record<string, boolean>;
  updatedAt: string;
}

export type SetIsEnabledAction = { type: 'setIsEnabled'; isEnabled: boolean };

export type InputConnectedAction = {
  type: 'inputConnected';
  id: string;
  name?: string | null;
  state?: MIDIPortConnectionState;
};

export type InputDisconnectedAction = {
  type: 'inputDisconnected';
  id: string;
  state?: MIDIPortConnectionState;
};

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

export type ImportStoreFromJsonAction = {
  type: 'importStoreFromJson';
  data: Partial<MidiStoreContext>;
};

export type SetAllOffAction = {
  type: 'setAllOff';
};

export type ClearInputsAction = {
  type: 'clearInputs';
};

export type Actions =
  | SetIsEnabledAction
  | InputConnectedAction
  | InputDisconnectedAction
  | InputMessageAction
  | EnableMappingModeAction
  | RemoveMidiMappingForPadAction
  | ImportStoreFromJsonAction
  | SetAllOffAction
  | ClearInputsAction;

export type ReadyEvent = { type: 'ready' };

export type MidiMappingUpdatedEvent = {
  type: 'midiMappingUpdated';
  padId: string;
  midiKey: string | undefined;
};

export type NoteOnEvent = {
  type: 'noteOn';
  padId: string;
  note: string;
  velocity: number;
  channel: number;
};

export type NoteOffEvent = {
  type: 'noteOff';
  padId: string;
  note: string;
  velocity: number;
  channel: number;
};

export type EmittedEvents =
  | ReadyEvent
  | MidiMappingUpdatedEvent
  | NoteOnEvent
  | NoteOffEvent;
export type Emit = { emit: (event: EmittedEvents) => void };

export interface MidiStoreExport {
  id: string;
  midiToPadMap: Record<string, string[]>;
  padToMidiMap: Record<string, string>;
  updatedAt: string;
}

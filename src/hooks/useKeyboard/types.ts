import { EventEmitterEvents } from '@hooks/events/types';
import type {
  SettingStoreImportedEvent,
  SettingsStoreData
} from '@hooks/useSettings/types';

type Modifier = 'ctrl' | 'meta' | 'shift' | 'alt';

export type EventMap = {
  [key: string]: {
    padId?: string;
    event?: keyof EventEmitterEvents;
    modifiers?: Modifier[];
    // args?: unknown;
    fn?: () => void;
    label?: string;
    description?: string;
  };
};

export interface KeyboardStoreContext extends SettingsStoreData {
  keyMap: EventMap;
}

export type SetKeyboardMappingAction = {
  type: 'setKeyboardMapping';
  code: string;
  value: string;
};

export type ImportStoreFromJsonAction = {
  type: 'importStoreFromJson';
  data: SettingsStoreData;
};

export type TestAction = {
  type: 'test';
  message: string;
};

export type ResetKeyMapAction = {
  type: 'resetKeyMap';
};

export type KeyboardStoreActions =
  | ImportStoreFromJsonAction
  | TestAction
  | ResetKeyMapAction;

export type KeyboardStoreEvents = SettingStoreImportedEvent;

export type Emit = { emit: (event: KeyboardStoreEvents) => void };

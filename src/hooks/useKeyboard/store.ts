import { dateToISOString } from '@helpers/datetime';
import { createLog } from '@helpers/log';
import type { SettingsStoreData } from '@hooks/useSettings/types';
import { StoreSnapshot, createStore as createXStateStore } from '@xstate/store';
import type {
  ImportStoreFromJsonAction,
  KeyboardStoreActions,
  KeyboardStoreContext,
  KeyboardStoreEvents,
  TestAction
} from './types';

const log = createLog('useKeyboard/store', ['debug']);

const initialContext: KeyboardStoreContext = {
  id: 'keyboard',
  updatedAt: dateToISOString(),
  keyMap: {
    Digit1: { padId: 'a1', label: 'Play A01' },
    Digit2: { padId: 'a2', label: 'Play A02' },
    Digit3: { padId: 'a3', label: 'Play A03' },
    Digit4: { padId: 'a4', label: 'Play A04' },
    KeyQ: { padId: 'a5', label: 'Play A05' },
    KeyW: { padId: 'a6', label: 'Play A06' },
    KeyE: { padId: 'a7', label: 'Play A07' },
    KeyR: { padId: 'a8', label: 'Play A08' },
    KeyA: { padId: 'a9', label: 'Play A09' },
    KeyS: { padId: 'a10', label: 'Play A10' },
    KeyD: { padId: 'a11', label: 'Play A11' },
    KeyF: { padId: 'a12', label: 'Play A12' },
    KeyZ: { padId: 'a13', label: 'Play A13' },
    KeyX: { padId: 'a14', label: 'Play A14' },
    KeyC: { padId: 'a15', label: 'Play A15' },
    KeyV: { padId: 'a16', label: 'Play A16' },
    KeyY: {
      event: 'control:one-shot',
      label: 'One Shot',
      description: 'Play the pad once'
    },
    KeyU: {
      event: 'control:loop',
      label: 'Loop',
      description: 'Loop the pad'
    },
    KeyI: {
      event: 'control:resume',
      label: 'Resume',
      description: 'Resume the pad'
    },
    KeyH: {
      event: 'control:interval-set-start',
      label: 'Set Start',
      description: 'Set the start of the interval'
    },
    KeyJ: {
      event: 'control:interval-set-end',
      label: 'Set End',
      description: 'Set the end of the interval'
    },
    Escape: {
      event: 'cmd:cancel',
      // eslint-disable-next-line no-console
      fn: () => console.clear(),
      label: 'Cancel',
      description: 'Cancel all players'
    },
    Space: {
      event: 'seq:play-toggle',
      label: 'Sequencer Play',
      description: 'Start/Stop the Sequencer'
    },
    Enter: {
      event: 'seq:rewind',
      label: 'Sequencer Rewind',
      description: 'Rewind the sequencer'
    }
  }
};

export const exportStoreToJson = (
  snapshot: StoreSnapshot<KeyboardStoreContext>
): SettingsStoreData => ({ ...snapshot.context, id: 'keyboard' });

export const importStoreFromJson = (
  store: KeyboardStoreType,
  data: SettingsStoreData
) => {
  store.send({ type: 'importStoreFromJson', data });
};

const KeyboardStoreActions = {
  importStoreFromJson: (
    context: KeyboardStoreContext,
    event: ImportStoreFromJsonAction
  ) => {
    const { data } = event;

    return update(context, data);
  },

  resetKeyMap: (context: KeyboardStoreContext) => {
    return update(context, initialContext);
  },

  test: (context: KeyboardStoreContext, event: TestAction) => {
    const { message } = event;

    log.debug('test', message);

    return context;
  },

  setKeyMap: (
    context: KeyboardStoreContext
    // event: SetKeyboardMappingAction
  ) => {
    // const { code, value } = event;

    return context;
    // return update(context, { keyMap: { ...context.keyMap, [code]: value } });
  }
};

export const createStore = () => {
  const content = {
    types: {
      context: {} as KeyboardStoreContext,
      events: {} as KeyboardStoreActions,
      emitted: {} as KeyboardStoreEvents
    },
    context: initialContext,
    on: KeyboardStoreActions
  };

  const store = createXStateStore(content);

  return store;
};
export type KeyboardStoreType = ReturnType<typeof createStore>;

const update = (
  context: KeyboardStoreContext,
  data: Partial<KeyboardStoreContext>
) => {
  return {
    ...context,
    ...data,
    updatedAt: dateToISOString()
  };
};

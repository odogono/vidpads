import { dateToISOString } from '@helpers/datetime';
import { createLog } from '@helpers/log';
import { StoreSnapshot, createStore as createXStateStore } from '@xstate/store';
import { SettingsStoreData } from '../useSettings/types';
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
    Digit1: { padId: 'a1' },
    Digit2: { padId: 'a2' },
    Digit3: { padId: 'a3' },
    Digit4: { padId: 'a4' },
    KeyQ: { padId: 'a5' },
    KeyW: { padId: 'a6' },
    KeyE: { padId: 'a7' },
    KeyR: { padId: 'a8' },
    KeyA: { padId: 'a9' },
    KeyS: { padId: 'a10' },
    KeyD: { padId: 'a11' },
    KeyF: { padId: 'a12' },
    KeyZ: { padId: 'a13' },
    KeyX: { padId: 'a14' },
    KeyC: { padId: 'a15' },
    KeyV: { padId: 'a16' },
    KeyY: {
      event: 'control:one-shot'
    },
    KeyU: {
      event: 'control:loop'
    },
    KeyI: {
      event: 'control:resume'
    },
    Escape: {
      event: 'cmd:cancel',
      // eslint-disable-next-line no-console
      fn: () => console.clear()
    },
    Space: {
      event: 'seq:play-toggle'
    },
    Enter: {
      event: 'seq:rewind'
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

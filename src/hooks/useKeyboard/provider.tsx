'use client';

import { ReactNode, useRef } from 'react';

// import { createLog } from '@helpers/log';
import { useSettingsPersistence } from '@hooks/useSettings/hooks/useSettingsPersistence';
import { KeyboardContext } from './context';
import { useKeyMap } from './hooks/useKeyMap';
import {
  createStore,
  exportStoreToJson,
  importStoreFromJson,
  type KeyboardStoreType
} from './store';
import type {
  KeyboardStoreActions,
  KeyboardStoreContext,
  KeyboardStoreEvents
} from './types';

// const KEY_PAD_MAP = {
//   Digit1: 'a1',
//   Digit2: 'a2',
//   Digit3: 'a3',
//   Digit4: 'a4',
//   KeyQ: 'a5',
//   KeyW: 'a6',
//   KeyE: 'a7',
//   KeyR: 'a8',
//   KeyA: 'a9',
//   KeyS: 'a10',
//   KeyD: 'a11',
//   KeyF: 'a12',
//   KeyZ: 'a13',
//   KeyX: 'a14',
//   KeyC: 'a15',
//   KeyV: 'a16'
// };

// const EVENT_MAP: EventMap = {
//   Escape: {
//     event: 'cmd:cancel',
//     // eslint-disable-next-line no-console
//     fn: () => console.clear()
//   },
//   Space: {
//     event: 'seq:play-toggle'
//   },
//   Enter: {
//     event: 'seq:rewind'
//   }
// };

// const log = createLog('keyboard', ['debug']);

export const KeyboardProvider = ({ children }: { children: ReactNode }) => {
  const store = useRef<KeyboardStoreType | undefined>(undefined);

  if (!store.current) {
    store.current = createStore();
  }

  useSettingsPersistence<
    KeyboardStoreContext,
    KeyboardStoreActions,
    KeyboardStoreEvents
  >({
    id: 'keyboard',
    store: store.current,
    onImport: (data) => importStoreFromJson(store.current!, data),
    onExport: (snapshot) => exportStoreToJson(snapshot)
  });

  const keyProps = useKeyMap(store.current);

  return (
    <KeyboardContext.Provider
      value={{
        ...keyProps
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
};

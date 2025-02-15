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

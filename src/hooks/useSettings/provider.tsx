'use client';

import { ReactNode, useRef } from 'react';

// import { createLog } from '@helpers/log';
import { SettingsContext } from './context';
import { useSettingsPersistence } from './hooks/useSettingsPersistence';
import {
  SettingsStoreType,
  createStore,
  exportStoreToJson,
  importStoreFromJson
} from './store';
import type {
  SettingsStoreActions,
  SettingsStoreContext,
  SettingsStoreEvents
} from './types';

// const log = createLog('useSettings/provider', ['debug']);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const store = useRef<SettingsStoreType | undefined>(undefined);

  if (!store.current) {
    store.current = createStore();
  }

  useSettingsPersistence<
    SettingsStoreContext,
    SettingsStoreActions,
    SettingsStoreEvents
  >({
    id: 'preferences',
    store: store.current,
    onImport: (data) => importStoreFromJson(store.current!, data),
    onExport: (snapshot) => exportStoreToJson(snapshot)
  });

  // useEffect(() => {
  //   if (preferences) {
  //     log.debug('importing settings store from json', preferences);
  //     importStoreFromJson(store.current!, preferences);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [updatedAt]);

  // useEffect(() => {
  //   const sub = store.current?.subscribe((state) => {
  //     log.debug('settingsUpdated', state);
  //     savePreferences(exportStoreToJson(store.current!));
  //   });

  //   return () => {
  //     sub?.unsubscribe();
  //   };
  // }, [savePreferences]);

  return (
    <SettingsContext.Provider value={{ store: store.current }}>
      {children}
    </SettingsContext.Provider>
  );
};

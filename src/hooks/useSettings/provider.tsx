'use client';

import { ReactNode, useEffect, useRef } from 'react';

import { createLog } from '@helpers/log';
import { SettingsContext } from './context';
import { useSettingsStorePersistence } from './hooks/useSettingsStorePersistence';
import {
  SettingsStoreType,
  createStore,
  exportStoreToJson,
  importStoreFromJson
} from './store';

const log = createLog('useSettings/provider', ['debug']);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { settingsStoreExport, saveSettingsStoreExport, updatedAt } =
    useSettingsStorePersistence();

  const store = useRef<SettingsStoreType | undefined>(undefined);

  if (!store.current) {
    store.current = createStore();
  }

  useEffect(() => {
    if (settingsStoreExport) {
      log.debug('importing settings store from json', settingsStoreExport);
      importStoreFromJson(store.current!, settingsStoreExport);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedAt]);

  useEffect(() => {
    const sub = store.current?.subscribe((state) => {
      log.debug('settingsUpdated', state);
      saveSettingsStoreExport(exportStoreToJson('default', store.current!));
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [saveSettingsStoreExport]);

  return (
    <SettingsContext.Provider value={{ store: store.current }}>
      {children}
    </SettingsContext.Provider>
  );
};

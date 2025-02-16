'use client';

import { useEffect } from 'react';

import { createLog } from '@helpers/log';
import { VOKeys } from '@model/constants';
import { loadSettingsStore, saveSettingsStore } from '@model/db/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EventObject, Store, StoreSnapshot } from '@xstate/store';
import { SettingsStoreData } from '../types';

const log = createLog('useSettingsPersistence', ['debug']);

interface UseSettingsPersistenceProps<
  TContext,
  TEvent extends EventObject,
  TEmitted extends EventObject
> {
  id: string;
  store: Store<TContext, TEvent, TEmitted>;
  storeEvent?: string;
  onImport?: (settings: SettingsStoreData) => void;
  onExport?: (snapshot: StoreSnapshot<TContext>) => SettingsStoreData;
}

export const useSettingsPersistence = <
  TContext,
  TEvent extends EventObject,
  TEmitted extends EventObject
>({
  store,
  id,
  onImport,
  onExport
}: UseSettingsPersistenceProps<TContext, TEvent, TEmitted>) => {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: VOKeys.settings(id),
    queryFn: () => loadSettingsStore(id)
  });

  const { mutate: saveSettings } = useMutation({
    mutationFn: (data: SettingsStoreData) => saveSettingsStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VOKeys.settings(id) });
    }
  });

  const updatedAt = settings?.updatedAt ?? null;

  // when updatedAt changes, import the settings from the db
  useEffect(() => {
    if (settings) {
      log.debug('importing settings store from json', settings);
      onImport?.(settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedAt]);

  // when the store changes, export the settings to the db
  useEffect(() => {
    const sub = store.subscribe((snapshot) => {
      log.debug('settingsUpdated', snapshot);
      if (onExport) {
        const data = onExport(snapshot);
        saveSettings(data);
      }
    });

    return () => {
      sub?.unsubscribe();
    };
  }, [onExport, saveSettings, store]);

  return {
    settings,
    saveSettings,
    updatedAt
  };
};

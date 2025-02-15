'use client';

import { ReactNode, useRef, useState } from 'react';

// import { createLog } from '@helpers/log';
import { useSettingsPersistence } from '@hooks/useSettings/hooks/useSettingsPersistence';
import { MidiContext } from './context';
import { useMidiEvents } from './hooks/useMidiEvents';
import { useMidiListener } from './hooks/useMidiListener';
import {
  MidiStoreType,
  createStore,
  exportStoreToJson,
  importStoreFromJson
} from './store';
import type {
  MidiStoreActions,
  MidiStoreContext,
  MidiStoreEvents
} from './types';

// const log = createLog('useMidi/provider', ['debug']);

export const MidiProvider = ({ children }: { children: ReactNode }) => {
  const [isEnabled, setIsEnabled] = useState(true);

  const store = useRef<MidiStoreType | undefined>(undefined);

  if (!store.current) {
    store.current = createStore();
  }

  useSettingsPersistence<MidiStoreContext, MidiStoreActions, MidiStoreEvents>({
    id: 'keyboard',
    store: store.current,
    storeEvent: 'midiMappingUpdated',
    onImport: (data) => importStoreFromJson(store.current!, data),
    onExport: (snapshot) => exportStoreToJson(snapshot)
  });

  useMidiEvents(store.current);

  useMidiListener({ isEnabled, store: store.current });

  return (
    <MidiContext.Provider
      value={{ isEnabled, setIsEnabled, store: store.current }}
    >
      {children}
    </MidiContext.Provider>
  );
};

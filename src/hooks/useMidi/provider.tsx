'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { MidiContext } from './context';
import { useMidiListener } from './hooks/useMidiListener';
import { MidiStoreType, createStore } from './store';

// const log = createLog('useMidi/provider');

export const MidiProvider = ({ children }: { children: ReactNode }) => {
  const events = useEvents();
  const [isEnabled, setIsEnabled] = useState(true);

  const store = useRef<MidiStoreType | undefined>(undefined);

  if (!store.current) {
    store.current = createStore();
  }

  useMidiListener({ isEnabled, store: store.current });

  return (
    <MidiContext.Provider
      value={{ isEnabled, setIsEnabled, store: store.current }}
    >
      {children}
    </MidiContext.Provider>
  );
};

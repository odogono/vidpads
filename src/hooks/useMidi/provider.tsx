'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { MidiContext } from './context';
import { useMidiListener } from './hooks/useMidiListener';
import { useMidiStorePersistence } from './hooks/useMidiStorePersistence';
import {
  MidiStoreType,
  createStore,
  exportStoreToJson,
  importStoreFromJson
} from './store';
import { NoteOffEvent, NoteOnEvent } from './types';

const log = createLog('useMidi/provider', ['debug']);

export const MidiProvider = ({ children }: { children: ReactNode }) => {
  const events = useEvents();
  const [isEnabled, setIsEnabled] = useState(true);
  const { midiStoreExport, saveMidiStoreExport, updatedAt } =
    useMidiStorePersistence();

  const store = useRef<MidiStoreType | undefined>(undefined);

  if (!store.current) {
    store.current = createStore();
  }

  const handleNoteOn = useCallback(
    (event: NoteOnEvent) => {
      log.debug('noteOn', event);

      events.emit('pad:touchdown', {
        padId: event.padId,
        source: 'midi'
      });
    },
    [events]
  );

  const handleNoteOff = useCallback(
    (event: NoteOffEvent) => {
      log.debug('noteOff', event);

      events.emit('pad:touchup', {
        padId: event.padId,
        source: 'midi'
      });
    },
    [events]
  );

  const handleCancel = useCallback(() => {
    store.current?.send({ type: 'setAllOff' });
  }, []);

  useEffect(() => {
    if (midiStoreExport) {
      log.debug('importing midi store from json', midiStoreExport);
      importStoreFromJson(store.current!, midiStoreExport);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedAt]);

  useEffect(() => {
    events.on('cmd:cancel', handleCancel);
    const sub = store.current?.on('midiMappingUpdated', (state) => {
      log.debug('midiMappingUpdated', state);
      saveMidiStoreExport(exportStoreToJson(store.current!));
    });

    const subNoteOn = store.current?.on('noteOn', handleNoteOn);
    const subNoteOff = store.current?.on('noteOff', handleNoteOff);

    return () => {
      sub?.unsubscribe();
      subNoteOn?.unsubscribe();
      subNoteOff?.unsubscribe();
      events.off('cmd:cancel', handleCancel);
    };
  }, [handleNoteOn, handleNoteOff, handleCancel, saveMidiStoreExport, events]);

  useMidiListener({ isEnabled, store: store.current });

  return (
    <MidiContext.Provider
      value={{ isEnabled, setIsEnabled, store: store.current }}
    >
      {children}
    </MidiContext.Provider>
  );
};

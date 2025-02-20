import { useCallback, useEffect } from 'react';

import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { MidiStoreType } from '../store';
import { NoteOffEvent, NoteOnEvent } from '../types';

const log = createLog('useMidiEvents');

export const useMidiEvents = (store: MidiStoreType) => {
  const events = useEvents();

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
    store.send({ type: 'setAllOff' });
  }, [store]);

  useEffect(() => {
    events.on('cmd:cancel', handleCancel);

    //@ts-expect-error - wierd xstate type issue
    const subNoteOn = store.on('noteOn', handleNoteOn);
    //@ts-expect-error - wierd xstate type issue
    const subNoteOff = store.on('noteOff', handleNoteOff);

    return () => {
      subNoteOn?.unsubscribe();
      subNoteOff?.unsubscribe();
      events.off('cmd:cancel', handleCancel);
    };
  }, [handleNoteOn, handleNoteOff, handleCancel, events, store]);
};

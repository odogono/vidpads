'use client';

import { useState } from 'react';

import mitt, { Emitter } from 'mitt';

import { EventsContext } from './context';
import { EventEmitterEvents } from './types';

export type EventEmitter = Emitter<EventEmitterEvents>;

type EventsProviderProps = React.PropsWithChildren<object>;

export const EventsProvider = ({ children }: EventsProviderProps) => {
  const [emitter, setEmitter] = useState<EventEmitter | null>(null);

  if (emitter === null) {
    const mittEvents = mitt<EventEmitterEvents>();
    setEmitter(mittEvents);
  }

  // useEffect(() => {
  //   emitter?.on('*', (e, ...args) => log.debug('[events] event:', e, ...args));
  //   return () => {
  //     emitter?.all.clear();
  //   };
  // }, [emitter]);

  return (
    <EventsContext.Provider value={emitter}>{children}</EventsContext.Provider>
  );
};

import { createContext, useContext, useEffect, useState } from 'react';

import mitt, { Emitter } from 'mitt';

import { PlayerPlay, PlayerStop } from '@components/Player/types';

export type EventEmitterEvents = {
  'pad:touchdown': {
    padId: string;
  };
  'pad:touchup': {
    padId: string;
  };
  'video:start': PlayerPlay;
  'video:stop': PlayerStop;
};

export type EventEmitter = Emitter<EventEmitterEvents>;

const EventsContext = createContext<EventEmitter | null>(null);

type EventsProviderProps = React.PropsWithChildren<object>;

export const EventsProvider = ({ children }: EventsProviderProps) => {
  const [emitter, setEmitter] = useState<EventEmitter | null>(null);

  if (emitter === null) {
    const mittEvents = mitt<EventEmitterEvents>();
    setEmitter(mittEvents);
  }

  useEffect(() => {
    return () => {
      if (emitter) {
        emitter.off('pad:touchdown');
        emitter.off('pad:touchup');
      }
    };
  }, [emitter]);

  return (
    <EventsContext.Provider value={emitter}>{children}</EventsContext.Provider>
  );
};

export const useEvents = () => {
  const events = useContext(EventsContext);
  if (!events) throw new Error('EventsProvider not found');
  return events;
};

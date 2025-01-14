'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import mitt, { Emitter } from 'mitt';

import {
  PlayerExtractThumbnail,
  PlayerPlay,
  PlayerReady,
  PlayerSeek,
  PlayerStop,
  PlayerThumbnailExtracted
} from '@components/Player/types';

export type EventEmitterEvents = {
  'pad:touchdown': {
    padId: string;
  };
  'pad:touchup': {
    padId: string;
  };
  'video:start': PlayerPlay;
  'video:stop': PlayerStop;
  'video:seek': PlayerSeek;
  'video:extract-thumbnail': PlayerExtractThumbnail;
  'video:thumbnail-extracted': PlayerThumbnailExtracted;
  'video:ready': PlayerReady;
  'keyboard:enabled': boolean;
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
        emitter.off('video:start');
        emitter.off('video:stop');
        emitter.off('video:seek');
        emitter.off('video:extract-thumbnail');
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

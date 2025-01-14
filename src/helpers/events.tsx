'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import mitt, { Emitter } from 'mitt';

import {
  PlayerExtractThumbnail,
  PlayerPlay,
  PlayerReady,
  PlayerSeek,
  PlayerStop,
  PlayerStopped,
  PlayerThumbnailExtracted
} from '@components/Player/types';

export type EventEmitterEvents = {
  'pad:touchdown': {
    padId: string;
  };
  'pad:touchup': {
    padId: string;
  };
  // request the video to start
  'video:start': PlayerPlay;
  // request the video to stop
  'video:stop': PlayerStop;
  // the video has stopped
  'video:stopped': PlayerStopped;
  // request the video to seek to a specific time
  'video:seek': PlayerSeek;
  // request the video to extract a thumbnail
  'video:extract-thumbnail': PlayerExtractThumbnail;
  // a thumbnail has been extracted
  'video:thumbnail-extracted': PlayerThumbnailExtracted;
  // the video is ready
  'video:ready': PlayerReady;
  // the keyboard is enabled
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

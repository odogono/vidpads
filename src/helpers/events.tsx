'use client';

import { createContext, useContext, useState } from 'react';

import mitt, { Emitter } from 'mitt';

import {
  PlayerExtractThumbnail,
  PlayerNotReady,
  PlayerPlay,
  PlayerPlaying,
  PlayerReady,
  PlayerSeek,
  PlayerStop,
  PlayerStopped,
  PlayerThumbnailExtracted,
  PlayerTimeUpdate
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
  // request the video to seek to a specific time
  'video:seek': PlayerSeek;
  // request the video to extract a thumbnail
  'video:extract-thumbnail': PlayerExtractThumbnail;
  // a thumbnail has been extracted
  'video:thumbnail-extracted': PlayerThumbnailExtracted;
  // the video is ready
  // 'video:ready': PlayerReady;
  // the keyboard is enabled
  'keyboard:enabled': boolean;
  // the player is ready for interaction
  'player:ready': PlayerReady;
  // the player is not ready for interaction
  'player:not-ready': PlayerNotReady;

  'player:playing': PlayerPlaying;
  'player:stopped': PlayerStopped;
  'player:time-update': PlayerTimeUpdate;

  'player:stop-all': PlayerStop;

  'media:duration-update': {
    mediaUrl: string;
    duration: number;
  };

  'project:created': {
    projectId: string;
    projectName: string;
  };
  'project:loaded': {
    projectId: string;
    projectName: string;
  };
  'project:saved': {
    projectId: string;
    projectName: string;
  };
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

  return (
    <EventsContext.Provider value={emitter}>{children}</EventsContext.Provider>
  );
};

export const useEvents = () => {
  const events = useContext(EventsContext);
  if (!events) throw new Error('EventsProvider not found');
  return events;
};

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import mitt, { Emitter } from 'mitt';

import {
  PlayerExtractThumbnail,
  PlayerNotReady,
  PlayerPlay,
  PlayerPlaying,
  PlayerReady,
  PlayerSeek,
  PlayerSetPlaybackRate,
  PlayerSetVolume,
  PlayerStop,
  PlayerStopped,
  PlayerThumbnailExtracted,
  PlayerTimeUpdate
} from '@components/Player/types';
import { createLog } from '@helpers/log';
import { Media, MediaYouTube } from '../model/types';

const log = createLog('events');

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
  ß;
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

  'player:set-volume': PlayerSetVolume;
  'player:set-playback-rate': PlayerSetPlaybackRate;

  'cmd:copy': undefined;
  'cmd:cut': undefined;
  'cmd:paste': undefined;
  'cmd:arrow': 'left' | 'right' | 'up' | 'down';

  'media:property-update': {
    mediaUrl: string;
    property: keyof Media | keyof MediaYouTube;
    value: unknown;
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

  'seq:play': undefined;
  'seq:play-toggle': undefined;
  'seq:play-started': {
    time: number;
  };
  'seq:record': undefined;
  'seq:record-started': {
    time: number;
  };
  'seq:stop': {
    time: number;
  };
  'seq:stopped': {
    time: number;
  };
  'seq:rewind': undefined;
  'seq:time-update': {
    time: number;
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

export const useEvents = () => {
  const events = useContext(EventsContext);
  if (!events) throw new Error('EventsProvider not found');
  return events;
};

'use client';

import { useCallback } from 'react';

import { usePlayerEvents } from '@components/PadComponent/usePlayerEvents';
import { useEvents } from '@helpers/events';
import { Pad } from '@model/types';

export const SequencerPad = ({ pad }: { pad: Pad }) => {
  const events = useEvents();
  const { isPlayerReady, isPlayerPlaying } = usePlayerEvents(pad);
  const padId = pad.id;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!isPlayerReady) return;
      events.emit('pad:touchdown', { padId });
    },
    [events, isPlayerReady, padId]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!isPlayerReady) return;
      events.emit('pad:touchup', { padId });
    },
    [events, isPlayerReady, padId]
  );

  return (
    <div
      className='relative vo-seq-pad w-full h-full flex justify-center items-center text-sm'
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
    >
      <span
        className={`
          absolute inset-0 rounded-lg bg-white transition-opacity duration-200
          ${isPlayerPlaying ? 'animate-opacity-pulse' : 'opacity-0'}
        `}
      ></span>
      {padId}
    </div>
  );
};

'use client';

import { useCallback, useEffect, useState } from 'react';

import { PlayerPlaying, PlayerStopped } from '@components/Player/types';
import { useEvents } from '@hooks/events';
import { useStepSequencer } from '@hooks/useStepSequencer';

export const useStepSequencerEvents = () => {
  const events = useEvents();
  const [padsPlaying, setPadsPlaying] = useState<string[]>([]);

  const {
    activeStep,
    pattern,
    cutPatternToClipboard,
    copyPatternToClipboard,
    pastePatternFromClipboard
  } = useStepSequencer();

  const handlePlayerPlaying = useCallback(
    (e: PlayerPlaying) => {
      if (padsPlaying.includes(e.padId)) return;
      setPadsPlaying([...padsPlaying, e.padId]);
    },
    [padsPlaying]
  );

  const handlePlayerStopped = useCallback(
    (e: PlayerStopped) => {
      setPadsPlaying(padsPlaying.filter((padId) => padId !== e.padId));
    },
    [padsPlaying]
  );

  useEffect(() => {
    events.on('cmd:copy', copyPatternToClipboard);
    events.on('cmd:cut', cutPatternToClipboard);
    events.on('cmd:paste', pastePatternFromClipboard);
    events.on('player:playing', handlePlayerPlaying);
    events.on('player:stopped', handlePlayerStopped);

    return () => {
      events.off('cmd:copy', copyPatternToClipboard);
      events.off('cmd:cut', cutPatternToClipboard);
      events.off('cmd:paste', pastePatternFromClipboard);
      events.off('player:playing', handlePlayerPlaying);
      events.off('player:stopped', handlePlayerStopped);
    };
  }, [
    copyPatternToClipboard,
    cutPatternToClipboard,
    events,
    pastePatternFromClipboard,
    handlePlayerPlaying,
    handlePlayerStopped
  ]);

  return {
    activeStep,
    pattern,
    padsPlaying
  };
};

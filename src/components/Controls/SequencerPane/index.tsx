'use client';

import { useCallback, useEffect, useState } from 'react';

import { Circle, Play, Rewind, Square } from 'lucide-react';

import { OpButton } from '@components/buttons/OpButton';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { useSequencer } from '@model/hooks/useSequencer';
import { useShowMode } from '@model/hooks/useShowMode';
import { Input } from '@nextui-org/react';
import { OpInput } from '../../buttons/OpInput';

const log = createLog('SequencerPane');

export const SequencerPane = () => {
  const events = useEvents();
  const { setShowMode } = useShowMode();
  const [showRewind, setShowRewind] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { bpm, setBpm } = useSequencer();

  const handlePlay = useCallback(() => {
    events.emit('seq:play');
  }, [events]);

  const handleRecord = useCallback(() => {
    events.emit('seq:record');
  }, [events]);

  const handleStop = useCallback(() => {
    if (showRewind) {
      events.emit('seq:rewind');
    } else {
      events.emit('seq:stop', {
        time: performance.now()
      });
    }
  }, [events, showRewind]);

  const handlePlayStarted = useCallback(() => {
    setIsPlaying(true);
    setShowRewind(false);
  }, [setIsPlaying, setShowRewind]);

  const handleStopped = useCallback(
    (event: { time: number }) => {
      setIsPlaying(false);
      setShowRewind(event.time > 0);
    },
    [setIsPlaying, setShowRewind]
  );

  const handleTimeUpdate = useCallback(
    (event: { time: number }) => {
      if (!isPlaying) {
        setShowRewind(event.time > 0);
      }
    },
    [isPlaying, setShowRewind]
  );

  useEffect(() => {
    setShowMode('sequencer');
    events.on('seq:play-started', handlePlayStarted);
    events.on('seq:stopped', handleStopped);
    events.on('seq:time-update', handleTimeUpdate);

    return () => {
      setShowMode('pads');
      events.off('seq:play-started', handlePlayStarted);
      events.off('seq:stopped', handleStopped);
      events.off('seq:time-update', handleTimeUpdate);
    };
  }, [events, handlePlayStarted, handleStopped, handleTimeUpdate, setShowMode]);

  return (
    <>
      <div className='pane-interval w-full h-full bg-slate-500 rounded-lg flex flex-row gap-2'>
        <OpButton label='Stop' onPress={handleStop}>
          {showRewind ? <Rewind /> : <Square />}
        </OpButton>
        <OpButton label='Play' onPress={handlePlay}>
          <Play className={isPlaying ? 'animate-pulse' : ''} />
        </OpButton>
        <OpButton label='Record' onPress={handleRecord}>
          <Circle color='#b51a00' />
        </OpButton>
        <OpInput
          label='BPM'
          value={`${bpm}`}
          onChange={(value: string) => setBpm(Number(value))}
        />
      </div>
    </>
  );
};

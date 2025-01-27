'use client';

import { useCallback, useRef } from 'react';

import { createLog } from '@helpers/log';
import { usePlayerState } from '@model/hooks/usePlayersState';
import { getPadInterval, getPadSourceUrl } from '@model/pad';
import { Pad } from '@model/types';
import { useControlsEvents } from '../hooks/useControlsEvents';
import { IntervalCanvas, IntervalCanvasRef } from './IntervalCanvas';

const log = createLog('IntervalSlider', ['debug']);

export interface IntervalSliderProps {
  pad: Pad | undefined;
}

export const IntervalSlider = ({ pad }: IntervalSliderProps) => {
  const timeRef = useRef<number | null>(null);
  const canvasRef = useRef<IntervalCanvasRef>(null);
  const padSourceUrl = getPadSourceUrl(pad);
  // const { duration } = useMetadataByUrl(padSourceUrl);
  const {
    player: { duration }
  } = usePlayerState(pad?.id, padSourceUrl);
  const { start: padStart, end: padEnd } = getPadInterval(pad, {
    start: 0,
    end: duration
  })!;

  log.debug({ padStart, padEnd, duration });

  const handleTimeUpdate = useCallback((time: number) => {
    canvasRef.current?.setTime(time);
  }, []);

  const { handleSeek, handleIntervalChange } = useControlsEvents({
    pad,
    onTimeUpdate: handleTimeUpdate
  });

  return (
    <div className='vo-interval-slider w-full h-[60%] min-h-[44px] bg-white'>
      <IntervalCanvas
        ref={canvasRef}
        time={timeRef.current ?? padStart}
        intervalStart={padStart}
        intervalEnd={padEnd}
        duration={duration}
        onSeek={handleSeek}
        onIntervalChange={handleIntervalChange}
      />
    </div>
  );
};

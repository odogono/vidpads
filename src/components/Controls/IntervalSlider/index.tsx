'use client';

import { useCallback, useRef } from 'react';

// import { createLog } from '@helpers/log';
import { useMetadataByUrl } from '@model/hooks/useMetadata';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { Pad } from '@model/types';
import { useControlsEvents } from '../useControlsEvents';
import { IntervalCanvas, IntervalCanvasRef } from './IntervalCanvas';

// const log = createLog('IntervalSlider');

export interface IntervalSliderProps {
  pad: Pad | undefined;
}

export const IntervalSlider = ({ pad }: IntervalSliderProps) => {
  const timeRef = useRef<number | null>(null);
  const canvasRef = useRef<IntervalCanvasRef>(null);
  const padSourceUrl = getPadSourceUrl(pad);
  const { duration } = useMetadataByUrl(padSourceUrl);
  const { start: padStart, end: padEnd } = getPadStartAndEndTime(pad, {
    start: 0,
    end: duration
  })!;

  const handleTimeUpdate = useCallback((time: number) => {
    canvasRef.current?.setTime(time);
  }, []);

  const { handleSeek, handleIntervalChange } = useControlsEvents({
    pad,
    onTimeUpdate: handleTimeUpdate
  });

  return (
    <div id='interval-slider' className='w-[50vh] h-[5vh]  bg-white'>
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

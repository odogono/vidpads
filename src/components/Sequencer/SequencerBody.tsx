'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { useSequencer } from '@model/hooks/useSequencer';
import { PlayHead } from './PlayHead';

const log = createLog('SequencerBody');

export interface SequencerBodyProps {
  padCount: number;
}

export const SequencerBody = ({ padCount }: SequencerBodyProps) => {
  const events = useEvents();
  const { bpm } = useSequencer();
  const barCount = 24;
  const stepWidth = 40;
  const [playHeadPosition, setPlayHeadPosition] = useState(0);
  const cells = useMemo(() => {
    return Array.from({ length: padCount }, (_, index) => {
      return row(index, barCount, stepWidth);
    });
  }, [barCount, padCount, stepWidth]);

  const handleTimeUpdate = useCallback(
    (event: { time: number }) => {
      const beatLength = 60000 / bpm;
      const stepPosition = event.time / beatLength;
      setPlayHeadPosition(stepPosition * stepWidth);
    },
    [bpm]
  );

  useEffect(() => {
    events.on('seq:time-update', handleTimeUpdate);
    return () => {
      events.off('seq:time-update', handleTimeUpdate);
    };
  }, [events, handleTimeUpdate]);

  return (
    <div className='relative vo-seq-body w-[3000px] h-full'>
      <PlayHead position={playHeadPosition} />
      <div
        className='grid grid-cols-2 w-full h-full '
        style={{
          gridTemplateColumns: `10px repeat(${barCount}, ${stepWidth}px)`,
          gridTemplateRows: `1fr repeat(${padCount}, 1fr) 0.2fr`
        }}
      >
        <div className='vo-seq-header col-span-1'></div>
        <div className='vo-seq-gutter col-span-1'></div>
        {cells}
      </div>
    </div>
  );
};

const row = (rowIndex: number, length: number, stepWidth: number) => {
  return Array.from({ length }, (_, index) => {
    return (
      <div
        key={`ch-${index}-${rowIndex}`}
        className='text-gray-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)] text-xs flex justify-center items-center'
        style={{
          width: `${stepWidth}px`,
          gridRow: `${rowIndex + 2}/${rowIndex + 2}`,
          gridColumn: `${index + 2}/${index + 2}`
        }}
      >
        {rowIndex + 1},{index + 1}
      </div>
    );
  });
};

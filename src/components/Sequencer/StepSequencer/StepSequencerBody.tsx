'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { useSequencer } from '@model/hooks/useSequencer';
import { PlayHead } from '../TimeSequencer/components/PlayHead';

const log = createLog('StepSequencerBody');

interface TriggerEvent {
  event: 'pad:touchdown' | 'pad:touchup';
  time: number;
  padId: string;
}
export interface SequencerBodyProps {
  padCount: number;
}

export const StepSequencerBody = ({ padCount }: SequencerBodyProps) => {
  const events = useEvents();
  const {
    bpm,
    events: sequencerEvents,
    toggleEvent,
    timeToStep
  } = useSequencer();
  const barCount = 24;
  const stepWidth = 40;
  const [playHeadPosition, setPlayHeadPosition] = useState(0);

  const { triggers, triggerKey } = useMemo(() => {
    const result = sequencerEvents.reduce((acc, e) => {
      const { time, duration, padId } = e;

      acc.push({ event: 'pad:touchdown', time, padId });
      acc.push({ event: 'pad:touchup', time: time + duration, padId });
      return acc;
    }, [] as TriggerEvent[]);

    result.sort((a, b) => a.time - b.time);
    const triggerKey = result.map((e) => e.time).join(',');
    return { triggers: result, triggerKey };
  }, [sequencerEvents]);

  const triggerIndex = useRef(0);

  const handleCellTap = useCallback(
    (padId: string, columnIndex: number) => {
      const beatLength = 60000 / bpm;
      const stepLength = beatLength / 4;
      const timeStart = columnIndex * stepLength;
      const timeEnd = timeStart + stepLength;
      // log.debug('cell tapped', padId, columnIndex, timeStart, timeEnd);
      toggleEvent(padId, timeStart, timeEnd);
    },
    [bpm, toggleEvent]
  );

  const cells = useMemo(() => {
    return Array.from({ length: padCount }, (_, index) => {
      const events = sequencerEvents.filter((e) => e.padId === `a${index + 1}`);
      const activeIndexes = events.map((e) => {
        const sp = timeToStep(e.time);
        // log.debug('sp', { time: e.time, sp });
        return Math.round(sp);
      });
      // if (events.length) log.debug('events', activeIndexes);
      return Row({
        padId: `a${index + 1}`,
        rowIndex: index,
        length: barCount,
        stepWidth,
        onTap: handleCellTap,
        activeIndexes
      });
    });
  }, [padCount, sequencerEvents, handleCellTap, timeToStep]);

  const handleTimeUpdate = useCallback(
    (event: { time: number }) => {
      const { time } = event;
      const stepPosition = timeToStep(time);
      setPlayHeadPosition(stepPosition * stepWidth);

      const nextTrigger = triggers[triggerIndex.current];
      if (nextTrigger) {
        const nextTriggerTime = nextTrigger.time;
        if (time >= nextTriggerTime) {
          const { event, padId } = nextTrigger;
          events.emit(event, { padId });
          triggerIndex.current++;
          // log.debug('handleTimeUpdate', {
          //   time,
          //   event,
          //   padId
          // });
        }
      }
    },
    [events, timeToStep, triggers]
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

interface RowProps {
  padId: string;
  rowIndex: number;
  length: number;
  stepWidth: number;
  onTap: (padId: string, columnIndex: number) => void;
  activeIndexes: number[];
}

const Row = ({
  padId,
  rowIndex,
  length,
  stepWidth,
  onTap,
  activeIndexes
}: RowProps) => {
  return Array.from({ length }, (_, index) => {
    const isActive = activeIndexes.includes(index);
    return (
      <div
        key={`ch-${rowIndex}-${index}`}
        className={`text-gray-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)] text-xs flex justify-center items-center ${isActive ? 'bg-red-500' : ''}`}
        style={{
          width: `${stepWidth}px`,
          gridRow: `${rowIndex + 2}/${rowIndex + 2}`,
          gridColumn: `${index + 2}/${index + 2}`
        }}
        onClick={() => onTap(padId, index)}
      >
        {rowIndex + 1},{index + 1}
      </div>
    );
  });
};

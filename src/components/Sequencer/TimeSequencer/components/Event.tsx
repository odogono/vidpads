'use client';

import { useCallback, useEffect, useState } from 'react';

// import { createLog } from '@helpers/log';
import { cn } from '@heroui/react';
import { useEvents } from '@hooks/events';
import type { SequencerRowEvent } from './Row';

// const log = createLog('sequencer/event');

export const Event = (props: SequencerRowEvent) => {
  const events = useEvents();
  const { x, isSelected, inProgress } = props;
  const [width, setWidth] = useState(props.width);

  const handlePlayheadUpdate = useCallback(
    (event: {
      time: number;
      playHeadX: number;
      isPlaying: boolean;
      isRecording: boolean;
    }) => {
      const { playHeadX } = event;

      const newWidth = playHeadX - x;
      setWidth(newWidth);
    },
    [x, setWidth]
  );

  useEffect(() => {
    if (inProgress) {
      events.on('seq:playhead-update', handlePlayheadUpdate);
    } else {
      events.off('seq:playhead-update', handlePlayheadUpdate);
    }

    return () => {
      events.off('seq:playhead-update', handlePlayheadUpdate);
    };
  }, [inProgress, handlePlayheadUpdate, events]);

  useEffect(() => {
    setWidth(props.width);
  }, [props.width]);

  return (
    <div
      className={cn('vo-seq-evt absolute top-0 h-full bg-seqevt box-border', {
        'border-2 border-white': isSelected,
        'border-1 border-white/50': !isSelected
      })}
      style={{
        left: `${x}px`,
        width: `${width}px`
      }}
    />
  );
};

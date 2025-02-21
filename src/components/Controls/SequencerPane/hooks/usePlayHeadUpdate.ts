import { useCallback, useEffect, useRef } from 'react';

import { OpTimeInputRef } from '@components/common/OpTimeInput';
import { useEvents } from '@hooks/events';
import { SequencerPlayHeadUpdateEvent } from '@hooks/events/types';
import { isModeEqual } from '@model/helpers';

export const usePlayHeadUpdate = ({
  hasSelectedEvents
}: {
  hasSelectedEvents: boolean;
}) => {
  const timeRef = useRef<OpTimeInputRef | null>(null);

  const events = useEvents();

  const handlePlayHeadUpdate = useCallback(
    (event: SequencerPlayHeadUpdateEvent) => {
      const { time, mode } = event;
      if (!isModeEqual(mode, 'time')) return;
      if (!hasSelectedEvents) {
        timeRef.current?.setValue(time);
      }
    },
    [hasSelectedEvents]
  );

  useEffect(() => {
    events.on('seq:playhead-update', handlePlayHeadUpdate);
    return () => {
      events.off('seq:playhead-update', handlePlayHeadUpdate);
    };
  }, [events, handlePlayHeadUpdate]);

  return {
    timeRef
  };
};

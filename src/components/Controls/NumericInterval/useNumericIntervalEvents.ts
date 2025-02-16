import { useEffect } from 'react';

import { useEvents } from '@hooks/events';

interface UseNumericIntervalEventsProps {
  onIntervalSetStart: () => void;
  onIntervalSetEnd: () => void;
}

export const useNumericIntervalEvents = ({
  onIntervalSetStart,
  onIntervalSetEnd
}: UseNumericIntervalEventsProps) => {
  const events = useEvents();

  useEffect(() => {
    events.on('control:interval-set-start', onIntervalSetStart);
    events.on('control:interval-set-end', onIntervalSetEnd);

    return () => {
      events.off('control:interval-set-start', onIntervalSetStart);
      events.off('control:interval-set-end', onIntervalSetEnd);
    };
  }, [events, onIntervalSetStart, onIntervalSetEnd]);

  return {
    events
  };
};

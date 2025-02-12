'use client';

import { useEffect } from 'react';

import { useEvents } from '@hooks/events';
import { TimeSequencerContext } from './context';
import { useActions } from './hooks/useActions';
import { useSelectors } from './hooks/useSelectors';
import { useStoreEvents } from './hooks/useStoreEvents';

export const TimeSequencerProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const events = useEvents();
  const props = useSelectors();

  const { isPlaying, isRecording } = useStoreEvents(props);

  const actions = useActions({ isPlaying, isRecording });

  useEffect(() => {
    events.on('cmd:cancel', actions.stop);
    return () => {
      events.off('cmd:cancel', actions.stop);
    };
  }, [actions.stop, events]);

  return (
    <TimeSequencerContext.Provider
      value={{
        ...props,
        ...actions
      }}
    >
      {children}
    </TimeSequencerContext.Provider>
  );
};

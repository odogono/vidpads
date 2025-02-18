'use client';

import { useEffect } from 'react';

import { useEvents } from '@hooks/events';
import { StepSequencerContext } from './context';
import { useActions } from './hooks/useActions';
import { useSelectors } from './hooks/useSelectors';
import { useStoreEvents } from './hooks/useStoreEvents';

export const StepSequencerProvider = ({
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
    <StepSequencerContext.Provider
      value={{
        ...props,
        ...actions
      }}
    >
      {children}
    </StepSequencerContext.Provider>
  );
};

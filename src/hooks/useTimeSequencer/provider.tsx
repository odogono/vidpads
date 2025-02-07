'use client';

import { TimeSequencerContext } from './context';
import { useActions } from './hooks/useActions';
import { useSelectors } from './hooks/useSelectors';
import { useStoreEvents } from './hooks/useStoreEvents';

export const TimeSequencerProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const props = useSelectors();

  const { isPlaying, isRecording } = useStoreEvents(props);

  const actions = useActions({ isPlaying, isRecording });

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

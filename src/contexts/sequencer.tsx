import { StepSequencerProvider } from '@hooks/useStepSequencer/provider';
import { TimeSequencerProvider } from '@hooks/useTimeSequencer/provider';

export const SequencerProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <TimeSequencerProvider>
      <StepSequencerProvider>{children}</StepSequencerProvider>
    </TimeSequencerProvider>
  );
};

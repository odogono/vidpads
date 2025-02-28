'use client';

import { useCallback } from 'react';

import { Pause, Play } from 'lucide-react';

import { Button } from '@heroui/react';
import { useProject } from '@hooks/useProject';
import { useStepSequencer } from '@hooks/useStepSequencer';
import { useTimeSequencer } from '@hooks/useTimeSequencer';

export const PlayButton = () => {
  // const [isPlaying, setIsPlaying] = useState(false);
  const { project } = useProject();
  const {
    isPlaying: isTimePlaying,
    isRecording: isTimeRecording,
    hasEvents: hasTimeEvents
  } = useTimeSequencer();
  const {
    isPlaying: isStepPlaying,
    isRecording: isStepRecording,
    hasEvents: hasStepEvents
  } = useStepSequencer();
  const isPlaying =
    isTimePlaying || isStepPlaying || isTimeRecording || isStepRecording;

  const isEnabled = hasTimeEvents || hasStepEvents;

  const handleOnPress = useCallback(async () => {
    if (isPlaying) {
      project.send({ type: 'stopSequencer', mode: 'all' });
    } else {
      project.send({
        type: 'startSequencer',
        isPlaying: true,
        isRecording: false,
        mode: 'all'
      });
    }
  }, [isPlaying, project]);

  return (
    <>
      <Button
        color='primary'
        onPress={handleOnPress}
        isIconOnly
        isDisabled={!isEnabled}
      >
        {isPlaying ? <Pause className='animate-pulse' /> : <Play />}
      </Button>
    </>
  );
};

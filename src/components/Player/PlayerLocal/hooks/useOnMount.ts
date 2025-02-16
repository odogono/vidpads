import { useEffect } from 'react';

import { usePadDetails } from '@model/hooks/usePads';

interface UseOnMountProps {
  video: HTMLVideoElement | null;
  // getPadInterval: () => { start: number; end: number };
  // id: string;
  playerPadId: string;
}

export const useOnMount = ({ video, playerPadId }: UseOnMountProps) => {
  const { getPadInterval } = usePadDetails(playerPadId);

  useEffect(() => {
    if (!video) return;

    // set the initial interval
    const interval = getPadInterval() ?? {
      start: 0,
      end: video.duration
    };

    // log.debug('❤️ player:mounted', mediaUrl, playerPadId, interval.start);

    video.currentTime = interval.start;
  }, [getPadInterval, video]);
};

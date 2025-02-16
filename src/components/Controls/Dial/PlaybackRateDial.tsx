'use client';

import { useCallback, useRef } from 'react';

import { useTooltip } from '@components/Tooltip/useTooltip';
import { useEvents } from '@hooks/events';
// import { createLog } from '@helpers/log';
import { getPadPlaybackRate, getPadSourceUrl } from '@model/pad';
import { Pad } from '@model/types';
import { Dial } from '.';

interface PlaybackRateDialProps {
  pad: Pad | undefined;
  setPadPlaybackRate: (padId: string, rate: number) => void;
  isEnabled?: boolean;
}

// const log = createLog('dial');

export const PlaybackRateDial = ({
  pad,
  setPadPlaybackRate,
  isEnabled
}: PlaybackRateDialProps) => {
  const events = useEvents();
  const { setToolTip, hideToolTip } = useTooltip();
  const playbackRate = getPadPlaybackRate(pad, 1);
  const padSourceUrl = getPadSourceUrl(pad);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleDoubleTouch = useCallback(() => {
    if (!padSourceUrl || !pad?.id) return;
    const playbackRate = 1;

    events.emit('player:update', {
      url: padSourceUrl,
      padId: pad?.id,
      playbackRate
    });

    setPadPlaybackRate(pad?.id, playbackRate);
  }, [events, pad?.id, padSourceUrl, setPadPlaybackRate]);

  const handleValueChange = useCallback(
    (value: number) => {
      if (!padSourceUrl || !pad?.id) return;

      const playbackRate = value; //roundNumberToDecimalPlaces(value, 1);

      events.emit('player:update', {
        url: padSourceUrl,
        padId: pad?.id,
        playbackRate
      });

      setPadPlaybackRate(pad?.id, playbackRate);

      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      setToolTip(playbackRate, [rect.x + 10, rect.y - 40]);
    },
    [events, padSourceUrl, pad?.id, setPadPlaybackRate, setToolTip]
  );

  const handleValueChangeEnd = useCallback(() => {
    hideToolTip();
  }, [hideToolTip]);

  return (
    <Dial
      label='Rate'
      isEnabled={isEnabled}
      ref={ref as React.RefObject<HTMLDivElement>}
      size='w-12'
      minValue={0.1}
      maxValue={2}
      value={Math.min(5, Math.max(0.1, playbackRate))}
      onChange={handleValueChange}
      onChangeEnd={handleValueChangeEnd}
      onDoubleTouch={handleDoubleTouch}
    />
  );
};

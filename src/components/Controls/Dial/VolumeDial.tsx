'use client';

import { useCallback, useRef } from 'react';

import { useTooltip } from '@components/Tooltip/useTooltip';
import { useEvents } from '@helpers/events';
// import { createLog } from '@helpers/log';
import { getPadSourceUrl, getPadVolume } from '@model/pad';
import { Pad } from '@model/types';
import { Dial } from '.';

interface VolumeDialProps {
  pad: Pad | undefined;
  setPadVolume: (padId: string, volume: number) => void;
}

// const log = createLog('dial');

export const VolumeDial = ({ pad, setPadVolume }: VolumeDialProps) => {
  const events = useEvents();
  const { setToolTip, hideToolTip } = useTooltip();
  const padVolume = getPadVolume(pad, 1);
  const padSourceUrl = getPadSourceUrl(pad);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleValueChange = useCallback(
    (value: number) => {
      if (!padSourceUrl || !pad?.id) return;

      events.emit('player:set-volume', {
        url: padSourceUrl,
        padId: pad?.id,
        volume: value
      });

      setPadVolume(pad?.id, value);

      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      setToolTip(value, [rect.x + 10, rect.y - 40]);
    },
    [events, padSourceUrl, pad?.id, setPadVolume, setToolTip]
  );

  const handleValueChangeEnd = useCallback(() => {
    hideToolTip();
  }, [hideToolTip]);

  // log.debug('[VolumeDial]', { pad: pad?.id, volume: padVolume });

  return (
    <Dial
      ref={ref as React.RefObject<HTMLDivElement>}
      size='w-12'
      value={padVolume}
      onChange={handleValueChange}
      onChangeEnd={handleValueChangeEnd}
    />
  );
};

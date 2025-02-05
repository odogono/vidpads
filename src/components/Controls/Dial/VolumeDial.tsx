'use client';

import { useCallback, useRef } from 'react';

import { useTooltip } from '@components/Tooltip/useTooltip';
import { useEvents } from '@hooks/events';
// import { createLog } from '@helpers/log';
import { getPadSourceUrl, getPadVolume } from '@model/pad';
import { Pad } from '@model/types';
import { Dial } from '.';

interface VolumeDialProps {
  pad: Pad | undefined;
  setPadVolume: (padId: string, volume: number) => void;
  isEnabled?: boolean;
}

// const log = createLog('dial');

export const VolumeDial = ({
  pad,
  setPadVolume,
  isEnabled
}: VolumeDialProps) => {
  const events = useEvents();
  const { setToolTip, hideToolTip } = useTooltip();
  const padVolume = getPadVolume(pad, 1);
  const padSourceUrl = getPadSourceUrl(pad);
  const ref = useRef<HTMLDivElement | null>(null);

  const handleDoubleTouch = useCallback(() => {
    if (!padSourceUrl || !pad?.id) return;
    const volume = 1;

    events.emit('player:set-volume', {
      url: padSourceUrl,
      padId: pad?.id,
      volume
    });

    setPadVolume(pad?.id, volume);
  }, [events, pad?.id, padSourceUrl, setPadVolume]);

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

  return (
    <Dial
      label='Volume'
      ref={ref as React.RefObject<HTMLDivElement>}
      size='w-12'
      defaultValue={1}
      minValue={0}
      maxValue={1}
      step={0.001}
      value={padVolume}
      onChange={handleValueChange}
      onChangeEnd={handleValueChangeEnd}
      onDoubleTouch={handleDoubleTouch}
      isEnabled={isEnabled}
    />
  );
};

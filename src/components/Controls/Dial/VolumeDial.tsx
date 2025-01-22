'use client';

import { useCallback, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { getPadSourceUrl, getPadVolume } from '@model/pad';
import { Pad } from '@model/types';
import { Dial } from '.';

interface VolumeDialProps {
  pad: Pad | undefined;
  setPadVolume: (padId: string, volume: number) => void;
}

const log = createLog('dial');

export const VolumeDial = ({ pad, setPadVolume }: VolumeDialProps) => {
  const events = useEvents();
  const padVolume = getPadVolume(pad, 1);
  const padSourceUrl = getPadSourceUrl(pad);

  const handleValueChange = useCallback(
    (value: number) => {
      if (!padSourceUrl || !pad?.id) return;

      events.emit('player:set-volume', {
        url: padSourceUrl,
        padId: pad?.id,
        volume: value
      });

      setPadVolume(pad?.id, value);
    },
    [events, padSourceUrl, pad?.id, setPadVolume]
  );

  // log.debug('[VolumeDial]', { pad: pad?.id, volume: padVolume });

  return <Dial size='w-12' value={padVolume} onChange={handleValueChange} />;
};

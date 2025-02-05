'use client';

import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import { usePad } from '@model/hooks/usePad';
import { isPadLooped } from '@model/pad';
import { PlaybackRateDial } from './Dial/PlaybackRateDial';
import { VolumeDial } from './Dial/VolumeDial';
import { PadStateButton } from './PadStateButton';
import { PaneProps } from './types';

export type StatePaneProps = PaneProps;

const log = createLog('Controls/StatePane', ['debug']);
export const StatePane = () => {
  const {
    isPadOneShot,
    pad,
    setPadIsLooped,
    setPadIsOneShot,
    selectedPadId,
    setPadVolume,
    setPadPlaybackRate
  } = usePad();

  const isLooped = isPadLooped(pad);

  const handleOneShot = useCallback(() => {
    if (!pad) return;
    setPadIsOneShot(pad.id, !isPadOneShot);
  }, [pad, isPadOneShot, setPadIsOneShot]);

  const handleLooped = useCallback(() => {
    if (!pad) return;
    log.debug('handleLooped', pad.id, !isLooped);
    setPadIsLooped(pad.id, !isLooped);
  }, [pad, isLooped, setPadIsLooped]);

  log.debug('StatePane', {
    isLooped,
    isPadOneShot,
    pad: pad?.id
  });

  return (
    <div className='w-full h-full bg-slate-500 rounded-lg flex gap-6 items-center '>
      <VolumeDial
        pad={pad}
        setPadVolume={setPadVolume}
        isEnabled={!!selectedPadId}
      />
      <PlaybackRateDial
        pad={pad}
        setPadPlaybackRate={setPadPlaybackRate}
        isEnabled={!!selectedPadId}
      />
      <PadStateButton
        label='One Shot'
        onPress={handleOneShot}
        isActive={isPadOneShot}
        isEnabled={!!selectedPadId}
      />
      <PadStateButton
        label='Loop'
        onPress={handleLooped}
        isActive={isLooped ?? false}
        isEnabled={!!selectedPadId}
      />
    </div>
  );
};

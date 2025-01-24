'use client';

import { useCallback } from 'react';

import { usePad } from '@model/hooks/usePad';
import { PlaybackRateDial } from './Dial/PlaybackRateDial';
import { VolumeDial } from './Dial/VolumeDial';
import { PadStateButton } from './PadStateButton';
import { PaneProps } from './types';

export type StatePaneProps = PaneProps;

export const StatePane = () => {
  const {
    isLooped,
    isPadOneShot,
    pad,
    setPadIsLooped,
    setPadIsOneShot,
    selectedPadId,
    setPadVolume,
    setPadPlaybackRate
  } = usePad();

  const handleOneShot = useCallback(() => {
    if (!pad) return;
    setPadIsOneShot(pad.id, !isPadOneShot);
  }, [pad, isPadOneShot, setPadIsOneShot]);

  const handleLooped = useCallback(() => {
    if (!pad) return;
    setPadIsLooped(pad.id, !isLooped);
  }, [pad, isLooped, setPadIsLooped]);

  if (!selectedPadId) {
    return (
      <div className='w-full h-full bg-slate-500 rounded-lg flex gap-6 items-center justify-center'>
        <h3 className='font-semibold text-foreground/90'>No Pad Selected</h3>
      </div>
    );
  }

  return (
    <div className='w-full h-full bg-slate-500 rounded-lg flex gap-6 items-center '>
      <VolumeDial pad={pad} setPadVolume={setPadVolume} />
      <PlaybackRateDial pad={pad} setPadPlaybackRate={setPadPlaybackRate} />
      <PadStateButton
        label='One Shot'
        onPress={handleOneShot}
        isActive={pad?.isOneShot ?? false}
      />
      <PadStateButton
        label='Loop'
        onPress={handleLooped}
        isActive={pad?.isLooped ?? false}
      />
    </div>
  );
};

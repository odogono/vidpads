'use client';

import { useCallback } from 'react';

import { OpSwitch } from '@components/buttons/OpSwitch';
import { createLog } from '@helpers/log';
import { usePad } from '@model/hooks/usePad';
import { isPadLooped } from '@model/pad';
import { OpNumberSelect } from '../buttons/OpNumberSelect';
import { PlaybackRateDial } from './Dial/PlaybackRateDial';
import { VolumeDial } from './Dial/VolumeDial';
import { PaneProps } from './types';

export type StatePaneProps = PaneProps;

const log = createLog('Controls/StatePane', ['debug']);
export const StatePane = () => {
  const {
    chokeGroup,
    playPriority,
    isPadOneShot,
    pad,
    setPadIsLooped,
    setPadIsOneShot,
    selectedPadId,
    setPadVolume,
    setPadPlaybackRate,
    setPadChokeGroup,
    setPadPlayPriority,
    setPadPlaybackResume,
    isResume
  } = usePad();

  const isLooped = isPadLooped(pad);
  const isEnabled = !!selectedPadId;

  const handleOneShot = useCallback(() => {
    if (!pad) return;
    setPadIsOneShot(pad.id, !isPadOneShot);
  }, [pad, isPadOneShot, setPadIsOneShot]);

  const handleLooped = useCallback(() => {
    if (!pad) return;
    log.debug('handleLooped', pad.id, !isLooped);
    setPadIsLooped(pad.id, !isLooped);
  }, [pad, isLooped, setPadIsLooped]);

  const handleChokeGroup = useCallback(
    (value: number) => {
      if (!pad) return;
      log.debug('handleChokeGroup', pad.id, value);
      setPadChokeGroup(value === -1 ? undefined : value);
    },
    [pad, setPadChokeGroup]
  );

  const handlePlayPriority = useCallback(
    (value: number) => {
      if (!pad) return;
      setPadPlayPriority(value === -1 ? undefined : value);
    },
    [pad, setPadPlayPriority]
  );

  const handleResume = useCallback(
    (value: boolean) => {
      if (!pad) return;
      log.debug('handleResume', pad.id, { value, isResume });
      setPadPlaybackResume(pad.id, value);
    },
    [pad, setPadPlaybackResume, isResume]
  );

  log.debug('StatePane', {
    isLooped,
    isPadOneShot,
    pad: pad?.id,
    isResume
  });

  return (
    <div className='w-full h-full rounded-lg p-2 flex gap-6 items-center justify-center'>
      <VolumeDial pad={pad} setPadVolume={setPadVolume} isEnabled={isEnabled} />
      <PlaybackRateDial
        pad={pad}
        setPadPlaybackRate={setPadPlaybackRate}
        isEnabled={isEnabled}
      />
      <OpSwitch
        label='One Shot'
        isSelected={isPadOneShot}
        onChange={handleOneShot}
        isEnabled={isEnabled}
      />
      <OpSwitch
        label='Loop'
        isSelected={isLooped}
        onChange={handleLooped}
        isEnabled={isEnabled}
      />
      <OpSwitch
        label='Resume'
        isSelected={isResume}
        onChange={handleResume}
        isEnabled={isEnabled}
      />
      <OpNumberSelect
        label='Choke Group'
        value={chokeGroup}
        onChange={handleChokeGroup}
        isEnabled={isEnabled}
      />
      <OpNumberSelect
        label='Play Priority'
        value={playPriority}
        onChange={handlePlayPriority}
        isEnabled={isEnabled}
      />
    </div>
  );
};

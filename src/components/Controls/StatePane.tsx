'use client';

import { useCallback } from 'react';

import { Play, Repeat2, StepForward } from 'lucide-react';

import { OpToggleButton } from '@/components/common/OpToggleButton';
import { createLog } from '@helpers/log';
import { usePad } from '@model/hooks/usePad';
import { isPadLooped } from '@model/pad';
import { OpNumberSelect } from '../common/OpNumberSelect';
import { OpPadLabelButton } from '../common/OpPadLabelButton';
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
    isResume,
    padLabel,
    setPadLabel
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

  const handleResume = useCallback(() => {
    if (!pad) return;
    log.debug('handleResume', pad.id, { isResume });
    setPadPlaybackResume(pad.id, !isResume);
  }, [pad, setPadPlaybackResume, isResume]);

  const handleLabelChange = useCallback(
    (label: string) => {
      setPadLabel(label);
    },
    [setPadLabel]
  );

  log.debug('StatePane', {
    isLooped,
    isPadOneShot,
    pad: pad?.id,
    isResume
  });

  return (
    <div className='vo-pane-state w-fit h-full rounded-lg p-1 flex gap-6 items-center justify-center'>
      <VolumeDial pad={pad} setPadVolume={setPadVolume} isEnabled={isEnabled} />
      <PlaybackRateDial
        pad={pad}
        setPadPlaybackRate={setPadPlaybackRate}
        isEnabled={isEnabled}
      />
      <OpToggleButton
        label='One Shot'
        isSelected={isPadOneShot}
        onPress={handleOneShot}
        isEnabled={isEnabled}
      >
        <Play />
      </OpToggleButton>
      <OpToggleButton
        label='Loop'
        isSelected={isLooped}
        onPress={handleLooped}
        isEnabled={isEnabled}
      >
        <Repeat2 />
      </OpToggleButton>
      <OpToggleButton
        label='Resume'
        isSelected={isResume}
        onPress={handleResume}
        isEnabled={isEnabled}
      >
        <StepForward />
      </OpToggleButton>
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
      <OpPadLabelButton
        isEnabled={isEnabled}
        onChange={handleLabelChange}
        value={padLabel}
      />
    </div>
  );
};

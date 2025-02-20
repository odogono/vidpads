'use client';

import { useCallback } from 'react';

import { Play, Repeat2, StepForward } from 'lucide-react';

import { OpToggleButton } from '@/components/common/OpToggleButton';
import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { usePad } from '@model/hooks/usePad';
import { isPadLooped } from '@model/pad';
import { OpNumberDropdown } from '../common/OpNumberDropdown';
import { OpPadLabelButton } from '../common/OpPadLabelButton';
import { PlaybackRateDial } from './Dial/PlaybackRateDial';
import { VolumeDial } from './Dial/VolumeDial';
import { PaneProps } from './types';

export type StatePaneProps = PaneProps;

const log = createLog('Controls/StatePane', ['debug']);
export const StatePane = () => {
  const events = useEvents();
  const {
    chokeGroup,
    playPriority,
    isPadOneShot,
    pad,
    selectedPadId,
    setPadVolume,
    setPadPlaybackRate,
    setPadChokeGroup,
    setPadPlayPriority,
    isResume,
    padLabel,
    setPadLabel
  } = usePad();

  const isLooped = isPadLooped(pad);
  const isEnabled = !!selectedPadId;

  const handleResume = useCallback(
    () => events.emit('control:resume'),
    [events]
  );

  const handleOneShot = useCallback(
    () => events.emit('control:one-shot'),
    [events]
  );

  const handleLooped = useCallback(() => events.emit('control:loop'), [events]);

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
      <OpNumberDropdown
        label='Choke Group'
        value={chokeGroup}
        onChange={handleChokeGroup}
        isEnabled={isEnabled}
      />
      <OpNumberDropdown
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

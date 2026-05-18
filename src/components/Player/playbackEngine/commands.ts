import { EventInputSource } from '@hooks/events/types';
import {
  getPadChokeGroup,
  getPadInterval,
  getPadIsOneShot,
  getPadLoopStart,
  getPadPlayPriority,
  getPadPlaybackRate,
  getPadPlaybackResume,
  getPadSourceUrl,
  getPadVolume,
  isPadLooped
} from '@model/pad';
import { Interval, Pad } from '@model/types';
import { PlayerPlay, PlayerStop } from '../types';

export interface PlaybackEngineSettings {
  arePlayersEnabled: boolean;
  isKeyboardPlayEnabled: boolean;
  isPadPlayEnabled: boolean;
  isSelectPadFromKeyboardEnabled: boolean;
  isSelectPadFromPadEnabled: boolean;
  isMidiMappingModeEnabled: boolean;
  isMetaKeyDown: boolean;
}

export type PlaybackInputEvent =
  | {
      type: 'pad:touchdown';
      padId: string;
      source: EventInputSource;
    }
  | {
      type: 'pad:touchup';
      padId: string;
      source: EventInputSource | string;
      forceStop?: boolean;
    };

export type PlaybackCommand =
  | {
      type: 'video:start';
      payload: PlayerPlay;
    }
  | {
      type: 'video:stop';
      payload: PlayerStop;
    };

export interface PlaybackInputDecision {
  command?: PlaybackCommand;
  selectPadId?: string;
  reason?: string;
}

interface ResolvePlaybackInputProps {
  event: PlaybackInputEvent;
  pad: Pad | undefined;
  settings: PlaybackEngineSettings;
}

export const resolvePlaybackInput = ({
  event,
  pad,
  settings
}: ResolvePlaybackInputProps): PlaybackInputDecision => {
  if (event.type === 'pad:touchdown') {
    return resolveTouchdown({ event, pad, settings });
  }

  return resolveTouchup({ event, pad, settings });
};

const resolveTouchdown = ({
  event,
  pad,
  settings
}: ResolvePlaybackInputProps & {
  event: Extract<PlaybackInputEvent, { type: 'pad:touchdown' }>;
}): PlaybackInputDecision => {
  const { padId, source } = event;

  if (!pad) {
    return { reason: 'pad-not-found' };
  }

  if (settings.isMidiMappingModeEnabled && source !== 'midi') {
    return { selectPadId: padId, reason: 'midi-mapping-selection' };
  }

  const selection = getInputSelection({ padId, source, settings });
  if (!selection.allowed) {
    return { selectPadId: selection.selectPadId, reason: selection.reason };
  }

  if (!settings.arePlayersEnabled) {
    return {
      selectPadId: selection.selectPadId,
      reason: 'players-disabled'
    };
  }

  const mediaUrl = getPadSourceUrl(pad);
  if (!mediaUrl) {
    return {
      selectPadId: selection.selectPadId,
      reason: 'pad-has-no-media'
    };
  }

  const { start, end } = getPadInterval(pad, {
    start: 0,
    end: Number.MAX_SAFE_INTEGER
  }) as Interval;

  return {
    selectPadId: selection.selectPadId,
    command: {
      type: 'video:start',
      payload: {
        url: mediaUrl,
        padId: pad.id,
        isOneShot: getPadIsOneShot(pad),
        isLoop: isPadLooped(pad),
        loopStart: getPadLoopStart(pad),
        start,
        end,
        volume: getPadVolume(pad, 1),
        playbackRate: getPadPlaybackRate(pad, 1),
        isResume: getPadPlaybackResume(pad),
        chokeGroup: getPadChokeGroup(pad),
        playPriority: getPadPlayPriority(pad)
      }
    }
  };
};

const resolveTouchup = ({
  event,
  pad,
  settings
}: ResolvePlaybackInputProps & {
  event: Extract<PlaybackInputEvent, { type: 'pad:touchup' }>;
}): PlaybackInputDecision => {
  const { padId, source, forceStop } = event;

  if (!settings.arePlayersEnabled) {
    return { reason: 'players-disabled' };
  }
  if (!pad) {
    return { reason: 'pad-not-found' };
  }
  if (source === 'keyboard' && !settings.isKeyboardPlayEnabled) {
    return { reason: 'keyboard-play-disabled' };
  }

  const url = getPadSourceUrl(pad);
  if (!url) {
    return { reason: 'pad-has-no-media' };
  }

  const isOneShot = getPadIsOneShot(pad);
  if (isOneShot && !forceStop) {
    return { reason: 'one-shot-touchup-ignored' };
  }

  return {
    command: {
      type: 'video:stop',
      payload: {
        url,
        padId,
        time: 0,
        requestId: 'players-!isOneShot||forceStop'
      }
    }
  };
};

const getInputSelection = ({
  padId,
  source,
  settings
}: {
  padId: string;
  source: EventInputSource;
  settings: PlaybackEngineSettings;
}): { allowed: boolean; reason?: string; selectPadId?: string } => {
  if (source === 'keyboard') {
    if (!settings.isKeyboardPlayEnabled) {
      return { allowed: false, reason: 'keyboard-play-disabled' };
    }
    const selectPadId = settings.isSelectPadFromKeyboardEnabled
      ? padId
      : undefined;
    if (settings.isMetaKeyDown) {
      return {
        allowed: false,
        reason: 'keyboard-meta-key',
        selectPadId
      };
    }
    return {
      allowed: true,
      selectPadId
    };
  }

  if (source === 'pad') {
    if (!settings.isPadPlayEnabled) {
      return { allowed: false, reason: 'pad-play-disabled' };
    }
    return {
      allowed: true,
      selectPadId: settings.isSelectPadFromPadEnabled ? padId : undefined
    };
  }

  return { allowed: true };
};

import { EventInputSource } from '@hooks/events/types';
import { OperationType, Pad } from '@model/types';
import {
  PlaybackEngineSettings,
  resolvePlaybackInput
} from '../commands';

const baseSettings: PlaybackEngineSettings = {
  arePlayersEnabled: true,
  isKeyboardPlayEnabled: true,
  isPadPlayEnabled: true,
  isSelectPadFromKeyboardEnabled: true,
  isSelectPadFromPadEnabled: true,
  isMidiMappingModeEnabled: false,
  isMetaKeyDown: false
};

const makePad = (overrides: Partial<Pad> = {}): Pad => ({
  id: 'a1',
  pipeline: {
    source: {
      type: OperationType.Source,
      url: 'https://example.com/video.mp4'
    },
    operations: [
      {
        type: OperationType.Source,
        url: 'https://example.com/video.mp4'
      },
      {
        type: OperationType.Trim,
        start: 1.5,
        end: 8.25
      },
      {
        type: OperationType.Loop,
        start: 2
      },
      {
        type: OperationType.Volume,
        envelope: [{ time: 0, value: 0.75 }]
      },
      {
        type: OperationType.PlaybackRate,
        rate: 1.25,
        preservePitch: true
      },
      {
        type: OperationType.Playback,
        isOneShot: true,
        resume: true,
        chokeGroup: 3,
        priority: 7
      }
    ] as unknown as Pad['pipeline']['operations']
  },
  ...overrides
});

const touchdown = (
  source: EventInputSource,
  settings: Partial<PlaybackEngineSettings> = {}
) =>
  resolvePlaybackInput({
    event: { type: 'pad:touchdown', padId: 'a1', source },
    pad: makePad(),
    settings: { ...baseSettings, ...settings }
  });

describe('Playback Engine command model', () => {
  it('does not start playback when keyboard playback is disabled', () => {
    const decision = touchdown('keyboard', { isKeyboardPlayEnabled: false });

    expect(decision.command).toBeUndefined();
    expect(decision.selectPadId).toBeUndefined();
  });

  it('does not start playback when pad playback is disabled', () => {
    const decision = touchdown('pad', { isPadPlayEnabled: false });

    expect(decision.command).toBeUndefined();
    expect(decision.selectPadId).toBeUndefined();
  });

  it('selects the Pad without starting playback in MIDI mapping mode for non-MIDI sources', () => {
    const decision = touchdown('keyboard', {
      isMidiMappingModeEnabled: true
    });

    expect(decision.command).toBeUndefined();
    expect(decision.selectPadId).toBe('a1');
  });

  it('converts a valid touchdown into a start command with Pad playback settings', () => {
    const decision = touchdown('pad');

    expect(decision.selectPadId).toBe('a1');
    expect(decision.command).toEqual({
      type: 'video:start',
      payload: {
        url: 'https://example.com/video.mp4',
        padId: 'a1',
        isOneShot: true,
        isLoop: true,
        loopStart: 2,
        start: 1.5,
        end: 8.25,
        volume: 0.75,
        playbackRate: 1.25,
        isResume: true,
        chokeGroup: 3,
        playPriority: 7
      }
    });
  });

  it('does not stop one-shot playback on touchup unless forceStop is set', () => {
    const decision = resolvePlaybackInput({
      event: { type: 'pad:touchup', padId: 'a1', source: 'pad' },
      pad: makePad(),
      settings: baseSettings
    });

    expect(decision.command).toBeUndefined();
  });

  it('stops one-shot playback on forced touchup', () => {
    const decision = resolvePlaybackInput({
      event: {
        type: 'pad:touchup',
        padId: 'a1',
        source: 'pad',
        forceStop: true
      },
      pad: makePad(),
      settings: baseSettings
    });

    expect(decision.command).toEqual({
      type: 'video:stop',
      payload: {
        url: 'https://example.com/video.mp4',
        padId: 'a1',
        time: 0,
        requestId: 'players-!isOneShot||forceStop'
      }
    });
  });

  it('stops non-one-shot playback on touchup', () => {
    const pad = makePad({
      pipeline: {
        source: {
          type: OperationType.Source,
          url: 'https://example.com/video.mp4'
        },
        operations: [
          {
            type: OperationType.Source,
            url: 'https://example.com/video.mp4'
          }
        ] as unknown as Pad['pipeline']['operations']
      }
    });

    const decision = resolvePlaybackInput({
      event: { type: 'pad:touchup', padId: 'a1', source: 'pad' },
      pad,
      settings: baseSettings
    });

    expect(decision.command).toEqual({
      type: 'video:stop',
      payload: {
        url: 'https://example.com/video.mp4',
        padId: 'a1',
        time: 0,
        requestId: 'players-!isOneShot||forceStop'
      }
    });
  });
});

import { PlayerHandler } from '@model/types';
import { vi } from 'vitest';
import { applyPlayerUpdate } from '../playerStateUpdate';

const updateMetadataProperty = vi.hoisted(() => vi.fn());

vi.mock('@model/db/api', () => ({
  updateMetadataProperty
}));

const existingPlayer: PlayerHandler = {
  padId: 'a1',
  mediaUrl: 'https://example.com/video.mp4',
  isReady: false,
  isError: false,
  duration: -1,
  playbackRates: []
};

describe('player state updates', () => {
  beforeEach(() => {
    updateMetadataProperty.mockReset();
  });

  it('does not persist undefined duration during readiness-only updates', async () => {
    await applyPlayerUpdate(existingPlayer, {
      padId: 'a1',
      mediaUrl: 'https://example.com/video.mp4',
      isReady: true,
      duration: undefined
    });

    expect(updateMetadataProperty).not.toHaveBeenCalled();
  });

  it('persists real duration and playback-rate changes', async () => {
    await applyPlayerUpdate(existingPlayer, {
      padId: 'a1',
      mediaUrl: 'https://example.com/video.mp4',
      duration: 12.5,
      playbackRates: [0.5, 1, 1.5]
    });

    expect(updateMetadataProperty).toHaveBeenCalledWith(
      'https://example.com/video.mp4',
      'duration',
      12.5
    );
    expect(updateMetadataProperty).toHaveBeenCalledWith(
      'https://example.com/video.mp4',
      'playbackRates',
      [0.5, 1, 1.5]
    );
  });
});

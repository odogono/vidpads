import {
  PlaybackRuntimeState,
  forceHidePlayer,
  handlePlaybackStarted,
  handlePlaybackStopped
} from '../stack';

const baseState = (): PlaybackRuntimeState => ({
  players: [
    {
      id: 'title',
      url: '',
      isPlaying: true,
      isVisible: true,
      zIndex: 1,
      opacity: 1,
      pointerEvents: 'auto'
    },
    {
      id: 'a1',
      url: 'a.mp4',
      isPlaying: false,
      isVisible: false,
      zIndex: 0,
      opacity: 0,
      pointerEvents: 'none'
    },
    {
      id: 'b1',
      url: 'b.mp4',
      isPlaying: false,
      isVisible: false,
      zIndex: 0,
      opacity: 0,
      pointerEvents: 'none'
    }
  ]
});

describe('Playback Engine stack model', () => {
  it('keeps the higher-priority playing Pad visible', () => {
    const first = handlePlaybackStarted(baseState(), {
      url: 'a.mp4',
      padId: 'a1',
      time: 0,
      playPriority: 1
    });
    const second = handlePlaybackStarted(first.state, {
      url: 'b.mp4',
      padId: 'b1',
      time: 0,
      playPriority: 10
    });

    expect(second.decision.showPlayerIds).toEqual(['b1']);
    expect(second.decision.hidePlayerIds).toEqual(['a1']);
    expect(second.state.players.find((player) => player.id === 'b1')).toMatchObject({
      isPlaying: true,
      isVisible: true
    });
    expect(second.state.players.find((player) => player.id === 'a1')).toMatchObject({
      isPlaying: true,
      isVisible: false
    });
  });

  it('emits stop commands for other players in the same choke group', () => {
    const first = handlePlaybackStarted(baseState(), {
      url: 'a.mp4',
      padId: 'a1',
      time: 0,
      chokeGroup: 2
    });
    const second = handlePlaybackStarted(first.state, {
      url: 'b.mp4',
      padId: 'b1',
      time: 0,
      chokeGroup: 2
    });

    expect(second.decision.stopCommands).toEqual([
      {
        type: 'video:stop',
        payload: {
          url: 'a.mp4',
          padId: 'a1',
          time: 0,
          requestId: 'players-chokeGroup'
        }
      }
    ]);
  });

  it('keeps the last stopped player visible when hide-on-end is false', () => {
    const playing = handlePlaybackStarted(baseState(), {
      url: 'a.mp4',
      padId: 'a1',
      time: 0
    });
    const stopped = handlePlaybackStopped(
      playing.state,
      {
        url: 'a.mp4',
        padId: 'a1',
        time: 4
      },
      { hidePlayerOnEnd: false }
    );

    expect(stopped.decision.keepLastPlayerVisibleId).toBe('a1');
    expect(stopped.decision.showPlayerIds).toEqual(['a1']);
    expect(stopped.decision.shouldScheduleLastPlayerHide).toBe(true);
    expect(stopped.state.players.find((player) => player.id === 'a1')).toMatchObject({
      isPlaying: false,
      isVisible: true
    });
  });

  it('shows the title player when no Pad players remain visible', () => {
    const playing = handlePlaybackStarted(baseState(), {
      url: 'a.mp4',
      padId: 'a1',
      time: 0
    });
    const stopped = handlePlaybackStopped(
      playing.state,
      {
        url: 'a.mp4',
        padId: 'a1',
        time: 4
      },
      { hidePlayerOnEnd: true }
    );

    expect(stopped.decision.showPlayerIds).toEqual(['title']);
    expect(stopped.decision.hidePlayerIds).toContain('a1');
    expect(stopped.state.players.find((player) => player.id === 'title')).toMatchObject({
      isPlaying: true,
      isVisible: true
    });
  });

  it('hides the kept last player when the timeout adapter forces it hidden', () => {
    const playing = handlePlaybackStarted(baseState(), {
      url: 'a.mp4',
      padId: 'a1',
      time: 0
    });
    const stopped = handlePlaybackStopped(
      playing.state,
      {
        url: 'a.mp4',
        padId: 'a1',
        time: 4
      },
      { hidePlayerOnEnd: false }
    );
    const hidden = forceHidePlayer(stopped.state, 'a1');

    expect(hidden.decision.showPlayerIds).toEqual(['title']);
    expect(hidden.decision.hidePlayerIds).toContain('a1');
    expect(hidden.state.players.find((player) => player.id === 'a1')).toMatchObject({
      isVisible: false
    });
  });
});

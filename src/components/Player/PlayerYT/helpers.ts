export const PlayerStateToString = (state: number) => {
  switch (state) {
    case window.YT.PlayerState.UNSTARTED:
      return 'UNSTARTED';
    case window.YT.PlayerState.ENDED:
      return 'ENDED';
    case window.YT.PlayerState.PLAYING:
      return 'PLAYING';
    case window.YT.PlayerState.PAUSED:
      return 'PAUSED';
    case window.YT.PlayerState.BUFFERING:
      return 'BUFFERING';
    case window.YT.PlayerState.CUED:
      return 'CUED';
    default:
      return `UNKNOWN:${state}`;
  }
};

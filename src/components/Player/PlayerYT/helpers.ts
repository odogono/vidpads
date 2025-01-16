import { PlayerState, PlayerYTState } from './types';

export const PlayerStateToString = (state: PlayerState) => {
  switch (state) {
    case PlayerState.CREATED:
      return 'CREATED';
    case PlayerState.DESTROYED:
      return 'DESTROYED';
    case PlayerState.UNSTARTED:
      return 'UNSTARTED';
    case PlayerState.ENDED:
      return 'ENDED';
    case PlayerState.PLAYING:
      return 'PLAYING';
    case PlayerState.PAUSED:
      return 'PAUSED';
    case PlayerState.BUFFERING:
      return 'BUFFERING';
    case PlayerState.CUED:
      return 'CUED';
    default:
      return `UNKNOWN:${state}`;
  }
};

export const PlayerYTStateToString = (state: PlayerYTState) => {
  switch (state) {
    case PlayerYTState.UNINITIALIZED:
      return 'UNINITIALIZED';
    case PlayerYTState.READY_FOR_CUE:
      return 'READY_FOR_CUE';
    case PlayerYTState.CUEING:
      return 'CUEING';
    case PlayerYTState.LOADED:
      return 'LOADED';
    case PlayerYTState.READY:
      return 'READY';
    case PlayerYTState.PLAYING:
      return 'PLAYING';
    case PlayerYTState.PAUSED:
      return 'PAUSED';
    case PlayerYTState.ENDED:
      return 'ENDED';
    default:
      return `UNKNOWN:${state}`;
  }
};

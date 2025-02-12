import { OnYTErrorEvent, PlayerState, PlayerYTState, YTError } from './types';

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

export const YTErrorToString = (error: OnYTErrorEvent) => {
  switch (error.data) {
    case YTError.INVALID_PARAMETER:
      return 'The video id is invalid.';
    case YTError.HTML5_ERROR:
      return 'The video cannot be played in the browser.';
    case YTError.NOT_FOUND:
      return 'The video cannot be found.';
    case YTError.EMBEDDING_API_ERROR:
    case YTError.EMBEDDING_API_ERROR_ALT:
      return 'The owner of the requested video does not allow it to be played in embedded players.';

    default:
      return `Unknown error (${error.data})`;
  }
};

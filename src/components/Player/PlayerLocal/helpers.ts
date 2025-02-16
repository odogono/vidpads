export const isPlaying = (player: HTMLVideoElement) => {
  return (
    player.currentTime > 0 &&
    !player.paused &&
    !player.ended &&
    player.readyState > 2
  );
};

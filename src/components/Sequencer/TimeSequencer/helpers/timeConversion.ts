export const pixelsToMs = (
  pixels: number,
  pixelsPerBeat: number,
  bpm: number
) => {
  const beats = pixels / pixelsPerBeat;
  return (beats * 60000) / bpm;
};

export const pixelsToSeconds = (
  pixels: number,
  pixelsPerBeat: number,
  bpm: number
) => {
  return pixelsToMs(pixels, pixelsPerBeat, bpm) / 1000;
};

export const msToPixels = (ms: number, pixelsPerBeat: number, bpm: number) => {
  const beats = (bpm / 60000) * ms;
  return beats * pixelsPerBeat;
};

export const secondsToPixels = (
  seconds: number,
  pixelsPerBeat: number,
  bpm: number
) => {
  return msToPixels(seconds * 1000, pixelsPerBeat, bpm);
};

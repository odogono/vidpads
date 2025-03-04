import { darkenColor, getComputedColor } from '@helpers/colour';
import { Rect } from '@types';

export const renderTrackAndInterval = (
  ctx: CanvasRenderingContext2D,
  trackArea: Rect,
  intervalStartX: number,
  intervalEndX: number,
  timeWidth: number
) => {
  const {
    x: trackX,
    y: trackY,
    width: trackWidth,
    height: trackHeight
  } = trackArea;
  const maxX = trackX + trackWidth;

  if (trackWidth <= 0 || timeWidth <= 0) return;

  const trackColorOn = getComputedColor('var(--c2)');
  const intervalColorOn = getComputedColor('var(--c4)');

  const trackColorOff = darkenColor(trackColorOn, 0.1);
  const intervalColorOff = darkenColor(intervalColorOn, 0.1);

  const isIntervalValid = intervalEndX - intervalStartX > 0;

  let x = trackX;
  let isOn = true;
  let isInInterval = isIntervalValid && intervalStartX <= x;

  let loopCount = 0;
  const maxLoop = 100;

  while (x < maxX && loopCount < maxLoop) {
    // isInInterval = isIntervalValid && x >= intervalStartX && x < intervalEndX;

    if (isInInterval) {
      // log.debug('render0', loopCount, isOn);
      ctx.fillStyle = isOn ? intervalColorOn : intervalColorOff;
    } else {
      // log.debug('render1', loopCount, isOn);
      ctx.fillStyle = isOn ? trackColorOn : trackColorOff;
    }

    const endX = Math.min(x + timeWidth, maxX);

    if (!isInInterval && endX > intervalStartX && endX < intervalEndX) {
      // not in an interval, but the interval starts before the segment ends

      // draw track to start of interval
      ctx.fillRect(x, trackY, intervalStartX - x + 0.5, trackHeight);
      // draw interval from intervalStart
      ctx.fillStyle = isOn ? intervalColorOn : intervalColorOff;

      ctx.fillRect(
        intervalStartX,
        trackY,
        endX - intervalStartX + 0.5,
        trackHeight
      );

      isInInterval = true;
    } else if (
      !isInInterval &&
      x < intervalStartX &&
      endX > intervalStartX &&
      endX > intervalEndX
    ) {
      // not in an interval, but the interval starts and ends within the segment

      // draw track to start of interval
      ctx.fillRect(x, trackY, intervalStartX - x + 0.5, trackHeight);

      // draw interval
      ctx.fillStyle = isOn ? intervalColorOn : intervalColorOff;
      ctx.fillRect(
        intervalStartX,
        trackY,
        intervalEndX - intervalStartX + 0.5,
        trackHeight
      );

      // draw rest of track
      ctx.fillStyle = isOn ? trackColorOn : trackColorOff;
      ctx.fillRect(
        intervalEndX,
        trackY,
        endX - intervalEndX + 0.5,
        trackHeight
      );
    } else if (isInInterval && endX > intervalEndX) {
      // in an interval, but the interval ends before the segment ends

      // draw interval
      ctx.fillRect(x, trackY, intervalEndX - x + 0.5, trackHeight);
      ctx.fillStyle = isOn ? trackColorOn : trackColorOff;
      // draw track

      ctx.fillRect(
        intervalEndX,
        trackY,
        endX - intervalEndX + 0.5,
        trackHeight
      );
      isInInterval = false;
    } else {
      // regular segment

      ctx.fillRect(x, trackY, endX - x + 0.5, trackHeight);
    }

    x = endX;
    isOn = !isOn;
    loopCount++;
  }

  // ctx.fillStyle = getComputedColor('var(--c2)');
  // ctx.fillRect(trackX, trackY, trackWidth, trackHeight);

  // ctx.fillStyle = getComputedColor('var(--c4)');
  // ctx.fillRect(
  //   intervalStartX,
  //   trackY,
  //   intervalEndX - intervalStartX,
  //   trackHeight
  // );
};

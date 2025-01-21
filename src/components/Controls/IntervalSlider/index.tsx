'use client';

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';

import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces as roundDP } from '@helpers/number';
import { useMetadataByUrl } from '@model/hooks/useMetadata';
import { getPadSourceUrl, getPadStartAndEndTime } from '@model/pad';
import { Pad } from '@model/types';
import { useControlsEvents } from '../useControlsEvents';
import { Handle } from './handles';
import { useTouch } from './useTouch';

const log = createLog('IntervalSlider');

export interface IntervalSliderProps {
  pad: Pad | undefined;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const IntervalSlider = ({ pad }: IntervalSliderProps) => {
  const timeRef = useRef<number | null>(null);
  const canvasRef = useRef<IntervalCanvasRef>(null);
  const padSourceUrl = getPadSourceUrl(pad);
  const { duration } = useMetadataByUrl(padSourceUrl);
  const { start: padStart, end: padEnd } = getPadStartAndEndTime(pad, {
    start: 0,
    end: duration
  })!;

  // const setPlayerTime = useCallback((time: number) => {
  //   canvasRef.current?.setTime(time);
  // }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    canvasRef.current?.setTime(time);
  }, []);

  const { handleSeek, handleIntervalChange } = useControlsEvents({
    pad,
    onTimeUpdate: handleTimeUpdate
  });

  return (
    <div id='interval-slider' className='w-[50vh] h-[5vh] self-center bg-white'>
      <IntervalCanvas
        ref={canvasRef}
        time={timeRef.current}
        intervalStart={padStart}
        intervalEnd={padEnd}
        duration={duration}
        onSeek={handleSeek}
        onIntervalChange={handleIntervalChange}
      />
    </div>
  );
};

interface IntervalCanvasRef {
  render: () => void;
  setTime: (time: number) => void;
}

interface IntervalCanvasProps {
  intervalStart: number;
  intervalEnd: number;
  duration: number;
  time: number | null;
  ref: React.Ref<IntervalCanvasRef>;
  onSeek: (time: number, inProgress: boolean) => void;
  onIntervalChange: (start: number, end: number) => void;
}

const handleWidth = 20;
const intervalBorderWidth = 3;

const IntervalCanvas = ({
  intervalStart,
  intervalEnd,
  duration,
  time,
  ref,
  onSeek,
  onIntervalChange
}: IntervalCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const timeRef = useRef<number | null>(time);
  const imageDataRef = useRef<ImageData | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<DOMRect>(new DOMRect());
  const [trackArea, setTrackArea] = useState<Rect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  const intervalToX = useCallback(
    (time: number) => time * (trackArea.width / duration) + trackArea.x,
    [duration, trackArea.width, trackArea.x]
  );
  const xToInterval = useCallback(
    (x: number) => roundDP((x - trackArea.x) * (duration / trackArea.width)),
    [duration, trackArea.width, trackArea.x]
  );

  const [intervalStartX, setIntervalStartX] = useState(() =>
    intervalToX(intervalStart)
  );
  const [intervalEndX, setIntervalEndX] = useState(() =>
    intervalToX(intervalEnd)
  );

  useEffect(() => {
    // convert time to local coordinate
    // log.debug('useEffect', { intervalStart, x: intervalToX(intervalStart) });
    setIntervalStartX(intervalToX(intervalStart));
    setIntervalEndX(intervalToX(intervalEnd));
  }, [intervalStart, intervalEnd, intervalToX]);

  const handleTouch = useCallback(
    (x: number, isTouching: boolean) => {
      const time = xToInterval(x);

      onSeek(time, false);

      // log.debug('handleTouch', { x, time, duration });
    },
    [onSeek, xToInterval]
  );

  const touchHandlers = useTouch({ dimensions, onTouch: handleTouch });

  useEffect(() => {
    const updateCanvasSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      ctxRef.current = canvas.getContext('2d');

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      setDimensions(rect);
      setTrackArea({
        x: handleWidth,
        y: intervalBorderWidth,
        width: rect.width - handleWidth * 2,
        height: rect.height - intervalBorderWidth * 2
      });
      imageDataRef.current = ctxRef.current?.createImageData(
        rect.width,
        rect.height
      );
    };

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updateCanvasSize();

    return () => resizeObserver.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    render: render,
    setTime: (time: number) => {
      timeRef.current = time;
      requestAnimationFrame(render);
    }
  }));

  const render = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { width, height } = dimensions;
    ctx.clearRect(0, 0, width, height);
    const {
      x: trackX,
      y: trackY,
      width: trackWidth,
      height: trackHeight
    } = trackArea;

    const lineX = intervalToX(timeRef.current ?? 0);

    // log.debug('render', {
    //   lineX,
    //   time: timeRef.current,
    //   intervalStartX,
    //   intervalEndX
    // });

    ctx.imageSmoothingEnabled = false;
    ctx.lineWidth = 1;

    // draw the track
    ctx.fillStyle = 'gray';
    ctx.fillRect(trackX, trackY, trackWidth, trackHeight);

    // draw the interval
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(
      intervalStartX,
      trackY,
      intervalEndX - intervalStartX,
      trackHeight
    );

    // drawHandles(ctx, {
    //   x: startX,
    //   y: trackY,
    //   width: endX - startX,
    //   height
    // });

    // Draw the current time line
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(lineX + 0.5, trackY);
    ctx.lineTo(lineX + 0.5, trackY + trackHeight);
    ctx.stroke();
  }, [dimensions, trackArea, intervalToX, intervalStartX, intervalEndX]);

  // render on mount
  useEffect(() => {
    requestAnimationFrame(render);
  }, [render]);

  const handleLeftSeek = useCallback(
    (newX: number) => {
      log.debug('[handleLeftSeek]', { newX });
      const time = xToInterval(newX);
      setIntervalStartX(newX);
      onSeek(time, false);
    },
    [xToInterval, onSeek]
  );

  const handleLeftDragEnd = useCallback(
    (newX: number) => {
      // log.debug('[handleLeftDrag]', {
      //   intervalStartX,
      //   oldX: intervalToX(intervalStart),
      //   newX
      // });

      const newStart = xToInterval(newX);

      log.debug('[handleLeftDragEnd]', { newStart });
      setIntervalStartX(newX);
      // onSeek(newStart, false);
      onIntervalChange(newStart, intervalEnd);
    },
    [xToInterval, onIntervalChange, intervalEnd]
  );

  const handleRightSeek = useCallback(
    (newX: number) => {
      const time = xToInterval(newX);
      setIntervalEndX(newX);
      onSeek(time, false);
    },
    [xToInterval, onSeek]
  );

  const handleRightDragEnd = useCallback(
    (newX: number) => {
      const newEnd = xToInterval(newX);

      setIntervalEndX(newX);
      onSeek(intervalStart, false);
      onIntervalChange(intervalStart, newEnd);
    },
    [xToInterval, onSeek, onIntervalChange, intervalStart]
  );

  // log.debug('[IntervalCanvas]', { intervalStartX, intervalStart });

  return (
    <div
      ref={containerRef}
      className='pointer-events-none relative w-full h-full bg-slate-900'
    >
      <canvas
        ref={canvasRef}
        className='absolute w-full h-full'
        style={{
          imageRendering: 'pixelated',
          touchAction: 'none',
          pointerEvents: 'auto'
        }}
        {...touchHandlers}
      />
      <Handle
        direction='left'
        x={intervalStartX}
        width={handleWidth}
        maxX={trackArea.x + trackArea.width}
        height={dimensions.height}
        onDrag={handleLeftDragEnd}
        onSeek={handleLeftSeek}
      />
      <Handle
        direction='right'
        x={intervalEndX}
        width={handleWidth}
        maxX={trackArea.x + trackArea.width}
        height={dimensions.height}
        onDrag={handleRightDragEnd}
        onSeek={handleRightSeek}
      />
    </div>
  );
};

const drawHandles = (
  ctx: CanvasRenderingContext2D,
  { x, y, width, height }: Rect
) => {
  ctx.fillStyle = 'gold';
  // top border
  ctx.fillRect(x, 0, width, intervalBorderWidth);

  // bottom border
  ctx.fillRect(x, height - intervalBorderWidth, width, intervalBorderWidth);

  // left handle
  ctx.roundRect(x - handleWidth, 0, handleWidth, height, [5, 0, 0, 5]);
  ctx.fill();

  // right handle
  ctx.roundRect(x + width, 0, handleWidth - 2.5, height, [0, 5, 5, 0]);
  ctx.fill();

  const sy = y + height / 2 - 10;
  const sx = x - handleWidth / 2;
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(sx - 2, sy);
  ctx.lineTo(sx - 2, sy + 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx + 2, sy);
  ctx.lineTo(sx + 2, sy + 20);
  ctx.stroke();
};

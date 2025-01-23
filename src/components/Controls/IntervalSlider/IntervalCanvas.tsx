'use client';

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';

import { useTooltip } from '@components/Tooltip/useTooltip';
import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces as roundDP } from '@helpers/number';
import { Pad } from '@model/types';
import { Handle } from './handles';
import { useTouch } from './useTouch';

const log = createLog('IntervalCanvas');

export interface IntervalSliderProps {
  pad: Pad | undefined;
  onTimeChange?: (time: number, x: number) => void;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IntervalCanvasRef {
  render: () => void;
  setTime: (time: number) => void;
}

export interface IntervalCanvasProps {
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

export const IntervalCanvas = ({
  intervalStart,
  intervalEnd,
  duration,
  time,
  ref,
  onSeek,
  onIntervalChange
}: IntervalCanvasProps) => {
  const { setToolTip: setToolTipInt, hideToolTip } = useTooltip();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const timeRef = useRef<number | null>(time);
  // const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<DOMRect>(new DOMRect());
  const [trackArea, setTrackArea] = useState<Rect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  const intervalToX = useCallback(
    (time: number) => {
      return time * (trackArea.width / duration) + trackArea.x;
    },
    [duration, trackArea.width, trackArea.x]
  );

  // log.debug('[IntervalCanvas]', { intervalStart, intervalEnd, duration });

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

  const setToolTip = useCallback(
    (time: number, x: number) => {
      setToolTipInt(time, [
        dimensions.left + x - handleWidth / 2,
        dimensions.top - 40
      ]);
    },
    [dimensions, setToolTipInt]
  );

  useEffect(() => {
    // convert time to local coordinate
    setIntervalStartX(intervalToX(intervalStart));
    setIntervalEndX(intervalToX(intervalEnd));
  }, [intervalStart, intervalEnd, intervalToX]);

  const handleTouch = useCallback(
    (x: number) => {
      x = Math.min(trackArea.x + trackArea.width, Math.max(trackArea.x, x));
      const time = xToInterval(x);

      onSeek(time, false);

      if (time < intervalStart) {
        setIntervalStartX(x);
        onIntervalChange(time, intervalEnd);
      } else if (time > intervalEnd) {
        setIntervalEndX(x);
        onIntervalChange(intervalStart, time);
      }

      // const rect = canvasRef.current?.getBoundingClientRect();
      // if (!rect) return;
      // onTimeChange?.(time, dimensions.left + x);
      setToolTip(time, x);
    },
    [
      trackArea.x,
      trackArea.width,
      xToInterval,
      onSeek,
      intervalStart,
      intervalEnd,
      setToolTip,
      onIntervalChange
    ]
  );

  const handleTouchEnd = useCallback(() => {
    // onTimeChange?.(0, -1);
    hideToolTip();
    // log.debug('[handleTouchEnd]', { x: -1 });
  }, [hideToolTip]);

  const touchHandlers = useTouch({
    dimensions,
    onTouch: handleTouch,
    onTouchEnd: handleTouchEnd
  });

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      // log.debug('[updateCanvasSize]', { canvas });
      if (!canvas) return;

      ctxRef.current = canvas.getContext('2d');

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      setDimensions(rect);

      const area = {
        x: handleWidth,
        y: intervalBorderWidth,
        width: rect.width - handleWidth * 2,
        height: rect.height - intervalBorderWidth * 2
      };
      setTrackArea(area);

      // log.debug('[updateCanvasSize]', { area, rect });
    };

    window.addEventListener('resize', updateCanvasSize);

    updateCanvasSize();

    return () => window.removeEventListener('resize', updateCanvasSize);
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
    //   time: timeRef.current,
    //   lineX,
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
      // log.debug('[handleLeftSeek]', { newX, intervalEndX });

      const time = xToInterval(newX);
      onSeek(time, false);

      setIntervalStartX(newX);
      setToolTip(time, newX);
    },
    [xToInterval, onSeek, setToolTip]
  );

  const handleLeftDragEnd = useCallback(
    (newX: number) => {
      const time = xToInterval(newX);

      // log.debug('[handleLeftDragEnd]', { time, newX });
      setIntervalStartX(newX);
      // onSeek(newStart, false);
      onIntervalChange(time, intervalEnd);
      hideToolTip();
    },
    [xToInterval, onIntervalChange, intervalEnd, hideToolTip]
  );

  const handleRightSeek = useCallback(
    (newX: number) => {
      const time = xToInterval(newX);
      setIntervalEndX(newX);
      onSeek(time, false);
      setToolTip(time, newX);
    },
    [xToInterval, onSeek, setToolTip]
  );

  const handleRightDragEnd = useCallback(
    (newX: number) => {
      const newEnd = xToInterval(newX);

      setIntervalEndX(newX);
      onSeek(intervalStart, false);
      onIntervalChange(intervalStart, newEnd);
      hideToolTip();
    },
    [xToInterval, onSeek, onIntervalChange, intervalStart, hideToolTip]
  );

  // log.debug('[IntervalCanvas]', { intervalStartX, intervalStart });

  return (
    <div className='pointer-events-none relative w-full h-full bg-slate-900'>
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
        minX={trackArea.x}
        maxX={intervalEndX}
        height={dimensions.height}
        onDrag={handleLeftDragEnd}
        onSeek={handleLeftSeek}
      />
      <div
        className='absolute'
        style={{
          backgroundColor: '#DAA520',
          top: 0,
          left: intervalStartX,
          width: intervalEndX - intervalStartX,
          height: intervalBorderWidth
        }}
      ></div>
      <div
        className='absolute'
        style={{
          backgroundColor: '#DAA520',
          top: trackArea.y + trackArea.height,
          left: intervalStartX,
          width: intervalEndX - intervalStartX,
          height: intervalBorderWidth
        }}
      ></div>
      <Handle
        direction='right'
        x={intervalEndX}
        width={handleWidth}
        minX={intervalStartX}
        maxX={trackArea.x + trackArea.width}
        height={dimensions.height}
        onDrag={handleRightDragEnd}
        onSeek={handleRightSeek}
      />
    </div>
  );
};

// const drawHandles = (
//   ctx: CanvasRenderingContext2D,
//   { x, y, width, height }: Rect
// ) => {
//   ctx.fillStyle = 'gold';
//   // top border
//   ctx.fillRect(x, 0, width, intervalBorderWidth);

//   // bottom border
//   ctx.fillRect(x, height - intervalBorderWidth, width, intervalBorderWidth);

//   // left handle
//   ctx.roundRect(x - handleWidth, 0, handleWidth, height, [5, 0, 0, 5]);
//   ctx.fill();

//   // right handle
//   ctx.roundRect(x + width, 0, handleWidth - 2.5, height, [0, 5, 5, 0]);
//   ctx.fill();

//   const sy = y + height / 2 - 10;
//   const sx = x - handleWidth / 2;
//   ctx.strokeStyle = 'black';
//   ctx.beginPath();
//   ctx.moveTo(sx - 2, sy);
//   ctx.lineTo(sx - 2, sy + 20);
//   ctx.stroke();
//   ctx.beginPath();
//   ctx.moveTo(sx + 2, sy);
//   ctx.lineTo(sx + 2, sy + 20);
//   ctx.stroke();
// };

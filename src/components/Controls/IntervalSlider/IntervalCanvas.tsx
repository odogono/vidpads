'use client';

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';

import { useTooltip } from '@components/Tooltip/useTooltip';
import { getComputedColor } from '@helpers/dom';
import { createLog } from '@helpers/log';
import { roundNumberToDecimalPlaces as roundDP } from '@helpers/number';
import { Pad } from '@model/types';
import { Rect } from '@types';
import type {
  HandleIntervalChangeProps,
  HandleSeekProps
} from '../hooks/useControlsEvents';
import { Handle } from './handles';
import { useTouch } from './useTouch';

const log = createLog('IntervalCanvas', ['debug']);

export interface IntervalSliderProps {
  pad: Pad | undefined;
  onTimeChange?: (time: number, x: number) => void;
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
  onSeek: (props: HandleSeekProps) => void;
  onIntervalChange: (props: HandleIntervalChangeProps) => void;
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
  const { setToolTipToTime, hideToolTip } = useTooltip();
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
      if (!duration) {
        return trackArea.x;
      }
      return time * (trackArea.width / duration) + trackArea.x;
    },
    [duration, trackArea.width, trackArea.x]
  );

  // log.debug('[IntervalCanvas]', {
  //   intervalStart,
  //   intervalEnd,
  //   duration,
  //   x: trackArea.x,
  //   width: trackArea.width
  // });

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
      setToolTipToTime(time, [dimensions.left + x, dimensions.top - 20]);
    },
    [dimensions, setToolTipToTime]
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

      onSeek({ time, fromId: 'timeline' });

      if (time < intervalStart) {
        setIntervalStartX(x);
        onIntervalChange({ start: time, end: intervalEnd, fromId: 'timeline' });
      } else if (time > intervalEnd) {
        setIntervalEndX(x);
        onIntervalChange({
          start: intervalStart,
          end: time,
          fromId: 'timeline'
        });
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
    // log.debug('render', { trackArea, dimensions });

    ctx.imageSmoothingEnabled = false;
    ctx.lineWidth = 1;

    // Update the fillStyle and strokeStyle to use computed colors
    ctx.fillStyle = getComputedColor('var(--c2)');
    ctx.fillRect(trackX, trackY, trackWidth, trackHeight);

    ctx.fillStyle = getComputedColor('var(--c4)');
    ctx.fillRect(
      intervalStartX,
      trackY,
      intervalEndX - intervalStartX,
      trackHeight
    );

    ctx.strokeStyle = getComputedColor('var(--c3)');
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
      onSeek({ time, fromId: 'start' });

      setIntervalStartX(newX);
      setToolTip(time, newX);
    },
    [xToInterval, onSeek, setToolTip]
  );

  const handleLeftDragEnd = useCallback(
    (newX: number) => {
      const time = xToInterval(newX);

      setIntervalStartX(newX);

      onIntervalChange({ start: time, end: intervalEnd, fromId: 'start' });
      hideToolTip();
    },
    [xToInterval, onIntervalChange, intervalEnd, hideToolTip]
  );

  const handleRightSeek = useCallback(
    (newX: number) => {
      const time = xToInterval(newX);
      setIntervalEndX(newX);
      onSeek({ time, fromId: 'end' });
      setToolTip(time, newX);
    },
    [xToInterval, onSeek, setToolTip]
  );

  const handleRightDragEnd = useCallback(
    (newX: number) => {
      const newEnd = xToInterval(newX);

      setIntervalEndX(newX);
      // onSeek({ time: intervalStart, fromId: 'timeline' });
      onIntervalChange({ start: intervalStart, end: newEnd, fromId: 'end' });
      hideToolTip();
    },
    [xToInterval, onIntervalChange, intervalStart, hideToolTip]
  );

  log.debug('[IntervalCanvas]', { intervalStartX, intervalStart });

  return (
    <div className='pointer-events-none relative w-full h-full bg-c1 rounded-sm'>
      <canvas
        ref={canvasRef}
        className='absolute w-full h-full rounded-sm'
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
          backgroundColor: 'var(--c7)',
          top: 0,
          left: intervalStartX,
          width: intervalEndX - intervalStartX,
          height: intervalBorderWidth
        }}
      ></div>
      <div
        className='absolute'
        style={{
          backgroundColor: 'var(--c7)',
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

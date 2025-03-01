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
import { Rect } from '@types';
import type {
  HandleIntervalChangeProps,
  HandleSeekProps
} from '../hooks/useControlsEvents';
import { Handle } from './Handle';
import { IntervalBorders } from './IntervalBorders';
import { HANDLE_WIDTH, INTERVAL_BORDER_WIDTH } from './constants';
import { useIntervalCoordinates } from './useIntervalCoordinates';
import { useTouch } from './useTouch';

const log = createLog('IntervalCanvas', ['debug']);

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
  const [dimensions, setDimensions] = useState<DOMRect>(new DOMRect());
  const [trackArea, setTrackArea] = useState<Rect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  const {
    intervalToX,
    xToInterval,
    intervalStartX,
    intervalEndX,
    setIntervalStartX,
    setIntervalEndX
  } = useIntervalCoordinates({
    duration,
    trackArea,
    intervalStart,
    intervalEnd
  });

  const setToolTip = useCallback(
    (time: number, x: number) => {
      setToolTipToTime(time, [dimensions.left + x, dimensions.top - 20]);
    },
    [dimensions, setToolTipToTime]
  );

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
    hideToolTip();
  }, [hideToolTip]);

  const touchHandlers = useTouch({
    dimensions,
    onTouch: handleTouch,
    onTouchEnd: handleTouchEnd
  });

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      ctxRef.current = canvas.getContext('2d');

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      setDimensions(rect);

      const area = {
        x: HANDLE_WIDTH,
        y: INTERVAL_BORDER_WIDTH,
        width: rect.width - HANDLE_WIDTH * 2,
        height: rect.height - INTERVAL_BORDER_WIDTH * 2
      };
      setTrackArea(area);
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

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

    ctx.imageSmoothingEnabled = false;
    ctx.lineWidth = 1;

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

  useImperativeHandle(ref, () => ({
    render,
    setTime: (time: number) => {
      timeRef.current = time;
      requestAnimationFrame(render);
    }
  }));

  useEffect(() => {
    requestAnimationFrame(render);
  }, [render]);

  const handleLeftSeek = useCallback(
    (newX: number) => {
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
      onIntervalChange({ start: intervalStart, end: newEnd, fromId: 'end' });
      hideToolTip();
    },
    [xToInterval, onIntervalChange, intervalStart, hideToolTip]
  );

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
        width={HANDLE_WIDTH}
        minX={trackArea.x}
        maxX={intervalEndX}
        height={dimensions.height}
        onDrag={handleLeftDragEnd}
        onSeek={handleLeftSeek}
      />
      <IntervalBorders
        intervalStartX={intervalStartX}
        intervalEndX={intervalEndX}
        trackArea={trackArea}
      />
      <Handle
        direction='right'
        x={intervalEndX}
        width={HANDLE_WIDTH}
        minX={intervalStartX}
        maxX={trackArea.x + trackArea.width}
        height={dimensions.height}
        onDrag={handleRightDragEnd}
        onSeek={handleRightSeek}
      />
    </div>
  );
};

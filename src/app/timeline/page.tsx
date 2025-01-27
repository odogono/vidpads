'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { useElementRect } from '@hooks/useElementRect';

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const log = createLog('Timeline');
const rectToString = (rect: Rect) => {
  return `x: ${rect.x.toFixed(1)}, y: ${rect.y.toFixed(
    1
  )}, width: ${rect.width.toFixed(1)}, height: ${rect.height.toFixed(1)}`;
};

const eventItems = [
  {
    id: 1,
    start: 100,
    end: 200
  },
  {
    id: 2,
    start: 300,
    end: 400
  }
];

const Timeline = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const zoomAmount = useRef(1);
  const [zoom, setZoom] = useState(1);
  // const [scrollX, setScrollX] = useState(0);
  const screenBounds = useElementRect(ref);
  const [viewBounds, setViewBounds] = useState<Rect>(screenBounds);
  const [worldBounds, setWorldBounds] = useState<Rect>({
    x: 0,
    y: 0,
    width: 3000, // 300% of screen width
    height: screenBounds.height
  });
  const [scaledWorldBounds, setScaledWorldBounds] = useState<Rect>({
    x: 0,
    y: 0,
    width: 3000, // 300% of screen width
    height: screenBounds.height
  });

  useEffect(() => {
    setViewBounds({
      ...worldBounds,
      x: 1500 - 300,
      width: screenBounds.width,
      height: screenBounds.height
    });
    log.debug('setViewbounds', {
      width: screenBounds.width,
      height: screenBounds.height
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenBounds.width, screenBounds.height]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const newZoomAmount = calcZoom(zoomAmount.current, e.deltaY);
    const snappedZoomAmount = Math.round(newZoomAmount * 10) / 10;

    if (scrollContainerRef.current) {
      // Get current scroll position and container width
      const container = scrollContainerRef.current;
      const currentScrollLeft = container.scrollLeft;

      // Calculate the point where we're centered on in world space
      const centerWorldX = currentScrollLeft * zoom;

      // Calculate new scaled world width
      const newScaledWidth = worldBounds.width / snappedZoomAmount;

      // Calculate new scroll position maintaining the same center point
      const newScrollLeft = centerWorldX / snappedZoomAmount;

      // Update the scaled world bounds
      setScaledWorldBounds({
        ...scaledWorldBounds,
        width: newScaledWidth
      });

      // Update view bounds
      setViewBounds({
        ...viewBounds,
        width: screenBounds.width * snappedZoomAmount,
        x: newScrollLeft * snappedZoomAmount
      });

      // Update scroll position
      container.scrollLeft = newScrollLeft;
    }

    zoomAmount.current = newZoomAmount;
    setZoom(snappedZoomAmount);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;

      setViewBounds((prev) => ({
        ...prev,
        x: scrollLeft * zoom
      }));

      log.debug('scroll', {
        scrollLeft,
        scaledScrollLeft: scrollLeft * zoom
      });
    }
  };

  return (
    <div
      className='Timeline w-full h-full bg-amber-700 relative '
      ref={ref}
      onWheel={handleWheel}
    >
      <div
        ref={scrollContainerRef}
        className='w-full h-full bg-amber-950 overflow-scroll overflow-y-hidden'
        onScroll={handleScroll}
      >
        <div
          className='View h-full grid grid-rows-16 grid-cols-1'
          style={{
            width: `${scaledWorldBounds.width}px`
          }}
        >
          <div className='m-1 relative' style={{ gridArea: '1/1' }}>
            <div
              className='bg-amber-300 border-r-2 border-r-amber-950 absolute top-0 h-full'
              style={{ left: `${100 * zoom}px`, width: `${200 * zoom}px` }}
            ></div>
            <div
              className='bg-amber-300 border-r-2 border-r-amber-950 absolute top-0 h-full'
              style={{ left: `${400 * zoom}px`, width: `${200 * zoom}px` }}
            ></div>
          </div>

          <div className='bg-amber-500 m-1' style={{ gridArea: '2/2' }}></div>
          <div className='bg-amber-500 m-1' style={{ gridArea: '3/3' }}></div>
          <div className='' style={{ gridArea: '16/16' }}></div>
        </div>
      </div>
      <RulerCanvas
        zoom={zoom}
        viewX={viewBounds.x}
        viewBounds={viewBounds}
        worldBounds={worldBounds}
      />
      <div className='absolute top-60 left-0'>
        <div>Zoom {zoom.toFixed(2)}</div>
        <div>Screen Bounds: {rectToString(screenBounds)}</div>
        <div>View Bounds: {rectToString(viewBounds)}</div>
        <div>World Bounds: {rectToString(worldBounds)}</div>
        <div>Scaled World Bounds: {rectToString(scaledWorldBounds)}</div>
      </div>
    </div>
  );
};

const RulerCanvas = ({
  zoom,
  viewX,
  viewBounds,
  worldBounds
}: {
  zoom: number;
  viewX: number;
  viewBounds: Rect;
  worldBounds: Rect;
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dimensions = useElementRect(ref);

  const render = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const canvas = ref.current;
    if (!canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = canvas.width / worldBounds.width;

    ctx.strokeStyle = 'black';
    ctx.strokeRect(
      viewBounds.x * scale,
      2,
      viewBounds.width * scale - 1,
      canvas.height - 4
    );

    // ctx.strokeRect(10, 10, 20, 20);

    // console.log('canvas', viewBounds.x * scale, viewBounds.width * scale);
    // // Draw lines adjusted for zoom and scroll
    // const interval = 10 * zoom;
    // const startX = -viewX % interval;
    // const numLines = Math.ceil(canvas.width / interval) + 1;

    // for (let i = 0; i < numLines; i++) {
    //   const x = Math.round(startX + i * interval) + 0.5;
    //   ctx.strokeStyle = 'black';
    //   ctx.beginPath();
    //   ctx.moveTo(x, 0);
    //   ctx.lineTo(x, canvas.height);
    //   ctx.stroke();
    // }
  }, [viewBounds.x, viewBounds.width, worldBounds.width]);

  useEffect(() => {
    render();
  }, [render, viewBounds.x]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext('2d');
    if (!ctxRef.current) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    render();
  }, [dimensions, render]);

  return (
    <canvas
      className='absolute top-20 left-0 w-full h-[3vh] bg-amber-100'
      ref={ref}
    />
  );
};

const calcZoom = (zoom: number, delta: number) => {
  // Using exponential scaling for smoother zoom
  const zoomSensitivity = 0.001; // Adjust this value to control zoom speed
  const zoomDelta = Math.exp(-delta * zoomSensitivity);
  const newZoom = zoom * zoomDelta;

  // const snappedZoom = Math.round(newZoom * 100) / 100;

  // Clamp zoom between 0.125 and 8
  const finalZoom = Math.min(Math.max(newZoom, 0.125), 8);

  return finalZoom;
};

export default Timeline;

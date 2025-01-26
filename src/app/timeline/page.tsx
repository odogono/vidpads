'use client';

import { useEffect, useRef, useState } from 'react';

import { useDivSize } from '@hooks/useDivSize';

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const rectToString = (rect: Rect) => {
  return `x: ${rect.x.toFixed(1)}, y: ${rect.y.toFixed(
    1
  )}, width: ${rect.width.toFixed(1)}, height: ${rect.height.toFixed(1)}`;
};

const Timeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const zoomAmount = useRef(1);
  const [zoom, setZoom] = useState(1);
  // const [scrollX, setScrollX] = useState(0);
  const screenBounds = useDivSize(ref);
  const [viewBounds, setViewBounds] = useState<Rect>({
    x: 0,
    y: 0,
    width: screenBounds.width * 3, // 300% of screen width
    height: screenBounds.height
  });

  // Update scroll position when zoom changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setViewBounds({
        ...viewBounds,
        width: screenBounds.width * 3 * zoom
      });
      container.scrollLeft = viewBounds.x;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, screenBounds.width]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const newZoomAmount = calcZoom(zoomAmount.current, e.deltaY);

    const snappedZoomAmount = Math.round(newZoomAmount * 10) / 10;

    // Calculate the point where we're zooming (relative to view)
    const mouseX = e.nativeEvent.offsetX + viewBounds.x;
    const zoomRatio = snappedZoomAmount / zoom;

    // Adjust view position to keep mouse point stable
    if (scrollContainerRef.current) {
      const newScrollX = Math.max(
        0,
        mouseX * zoomRatio - e.nativeEvent.offsetX
      );
      setViewBounds({
        ...viewBounds,
        x: newScrollX
      });
    }

    zoomAmount.current = newZoomAmount;
    setZoom(snappedZoomAmount);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      const newScrollX = scrollContainerRef.current.scrollLeft;
      setViewBounds({
        ...viewBounds,
        x: newScrollX
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
          className='View h-full grid grid-rows-16 grid-cols-16'
          style={{
            width: `${viewBounds.width}px`
          }}
        >
          <div className='bg-amber-300 m-1' style={{ gridArea: '1/2' }}></div>
          <div className='bg-amber-500 m-1' style={{ gridArea: '2/2' }}></div>
          <div className='bg-amber-500 m-1' style={{ gridArea: '3/3' }}></div>
          <div className='' style={{ gridArea: '16/16' }}></div>
        </div>
      </div>
      <RulerCanvas zoom={zoom} viewX={viewBounds.x} />
      <div className='absolute top-60 left-0'>
        Zoom {zoom.toFixed(2)} | {rectToString(viewBounds)}
      </div>
    </div>
  );
};

const RulerCanvas = ({ zoom, viewX }: { zoom: number; viewX: number }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines adjusted for zoom and scroll
    const interval = 10 * zoom;
    const startX = -viewX % interval;
    const numLines = Math.ceil(canvas.width / interval) + 1;

    for (let i = 0; i < numLines; i++) {
      const x = Math.round(startX + i * interval) + 0.5;
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }, [zoom, viewX]);

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

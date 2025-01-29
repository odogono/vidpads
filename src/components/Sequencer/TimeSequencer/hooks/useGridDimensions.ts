'use client';

import { useCallback, useRef } from 'react';

interface UseGridDimensionsProps {
  padCount: number;
}

export const useGridDimensions = ({ padCount }: UseGridDimensionsProps) => {
  const gridRef = useRef<HTMLDivElement | null>(null);

  const getGridDimensions = useCallback(() => {
    if (!gridRef.current) return { gridHeight: 0, rowHeight: 0 };
    const gridHeight = gridRef.current.clientHeight;

    const totalFr = 1 + padCount + 0.2;
    const rowHeight = gridHeight / totalFr;

    return { gridHeight, rowHeight };
  }, [padCount]);

  return { gridRef, getGridDimensions };
};

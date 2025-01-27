'use client';

import { useCallback, useMemo } from 'react';

import { PlayHead } from './PlayHead';

export interface SequencerBodyProps {
  padCount: number;
}

export const SequencerBody = ({ padCount }: SequencerBodyProps) => {
  const barCount = 24;

  const cells = useMemo(() => {
    return Array.from({ length: padCount }, (_, index) => {
      return row(index, barCount);
    });
  }, [barCount, padCount]);

  return (
    <div className='relative vo-seq-body w-[3000px] h-full'>
      <PlayHead />
      <div
        className='grid grid-cols-2 w-full h-full '
        style={{
          gridTemplateColumns: `10px repeat(${barCount}, 40px)`,
          gridTemplateRows: `1fr repeat(${padCount}, 1fr) 0.2fr`
        }}
      >
        <div className='vo-seq-header col-span-1'></div>
        <div className='vo-seq-gutter col-span-1'></div>
        {cells}
      </div>
    </div>
  );
};

const row = (rowIndex: number, length: number) => {
  return Array.from({ length }, (_, index) => {
    return (
      <div
        key={`ch-${index}-${rowIndex}`}
        className='text-gray-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.6)] w-[40px] text-xs flex justify-center items-center'
        style={{
          gridRow: `${rowIndex + 2}/${rowIndex + 2}`,
          gridColumn: `${index + 2}/${index + 2}`
        }}
      >
        {rowIndex + 1},{index + 1}
      </div>
    );
  });
};

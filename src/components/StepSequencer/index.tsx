'use client';

// import { usePads } from '@model/hooks/usePads';
// import { SequencerPad } from './SequencerPad';
// import { TimeSequencerBody } from './TimeSequencer/TimeSequencerBody';

const CELL_HEIGHT = 60;

export const StepSequencer = () => {
  // const { pads } = usePads();

  // const padCount = pads?.length ?? 1;

  return (
    <div className='w-full h-full mt-4 mb-4 rounded-lg bg-c2 border border-gray-300 flex'>
      <div
        className='w-24 grid'
        style={{
          gridTemplateRows: `3em repeat(4, ${CELL_HEIGHT}px) 1em`
        }}
      >
        <div className='border-b border-gray-300 w-full'></div>
        <RowHeader index={1} />
        <RowHeader index={2} />
        <RowHeader index={3} />
        <RowHeader index={4} />
        <div className='h-6 '></div>
      </div>

      <ScrollableArea />
    </div>
  );
};

const ScrollableArea = () => {
  return (
    <div
      className='grid overflow-x-auto overflow-y-hidden'
      style={{
        gridTemplateRows: `3em repeat(4, ${CELL_HEIGHT}px) 1px`,
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridAutoFlow: 'row'
      }}
    >
      <div
        className='header border-l border-b border-gray-300 w-full'
        style={{
          gridColumn: '1 / -1'
        }}
      ></div>
      <Cell index={1} />
      <Cell index={2} />
      <Cell index={3} />
      <Cell index={4} />
      <Cell index={5} />
      <Cell index={6} />
      <Cell index={7} />
      <Cell index={8} />
      <Cell index={9} />
      <Cell index={10} />
      <Cell index={11} />
      <Cell index={12} />
      <Cell index={13} />
      <Cell index={14} />
      <Cell index={15} />
      <Cell index={16} />
      <Cell index={17} />
      <Cell index={18} />
      <Cell index={19} />
      <Cell index={20} />
    </div>
  );
};

const RowHeader = ({ index }: { index: number }) => {
  return (
    <div className='border-b border-gray-300 flex items-center justify-center'>
      Row {index}
    </div>
  );
};

const Cell = ({ index }: { index: number }) => {
  return (
    <div className='border-l border-b border-gray-300 w-[200px] flex items-center justify-center'>
      Cell {index}
    </div>
  );
};

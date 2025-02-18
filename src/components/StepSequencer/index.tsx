'use client';

import { usePads } from '@model/hooks/usePads';
import { Pad } from '@model/types';
import { SequencerPad } from '../Sequencer/SequencerPad';

// import { SequencerPad } from './SequencerPad';
// import { TimeSequencerBody } from './TimeSequencer/TimeSequencerBody';

const CELL_WIDTH = '1fr';
const CELL_HEIGHT = '1fr';
const STEPS = 16;
const HEADER_HEIGHT = 32;
const HEADER_WIDTH = '64px';

export const StepSequencer = () => {
  const { pads } = usePads();

  const padCount = pads?.length ?? 1;

  // const stepContainerHeight = 1124; //CELL_HEIGHT * 17 + HEADER_HEIGHT + 100;

  return (
    <div className='vo-stepseq w-full h-full mt-4 mb-4 rounded-lg bg-c2 border border-gray-300 flex'>
      <div
        className={`vo-stepseq-pads w-[${HEADER_WIDTH}] grid`}
        style={{
          gridTemplateRows: `${HEADER_HEIGHT}px repeat(${padCount}, ${CELL_HEIGHT}px) 1em`
        }}
      >
        <div className='header border-b border-gray-300 w-full'></div>
        {pads.map((pad) => (
          <div
            key={`pad-${pad.id}`}
            className='border-b border-gray-300 w-full'
          >
            <SequencerPad pad={pad} />
          </div>
        ))}

        <div className='h-6 '></div>
      </div>

      <div
        className={`vo-stepseq-steps  grid overflow-x-auto `}
        style={{
          gridTemplateRows: `${HEADER_HEIGHT}px repeat(${STEPS}, ${CELL_HEIGHT}px) 1px`,
          gridTemplateColumns: `repeat(${padCount}, 1fr)`,
          gridAutoFlow: 'row'
        }}
      >
        <div
          className='header border-l border-b border-gray-300 w-full'
          style={{
            gridColumn: '1 / -1',
            position: 'sticky'
          }}
        >
          header
        </div>
        {pads.map((pad) => (
          <PadSteps key={`padsteps-${pad.id}`} pad={pad} />
        ))}
      </div>
    </div>
  );
};

const PadSteps = ({ pad }: { pad: Pad }) => {
  return Array.from({ length: STEPS }).map((_, index) => (
    <Cell key={`padstep-${pad.id}-${index}`} label={`${pad.id}-${index}`} />
  ));
};

const Cell = ({ label }: { label: string }) => {
  return (
    <div
      className={`border-l border-b border-gray-300 w-[${CELL_WIDTH}px] flex items-center justify-center`}
    >
      {label}
    </div>
  );
};

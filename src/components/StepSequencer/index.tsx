'use client';

import { useStepSequencer } from '@hooks/useStepSequencer';
import { usePads } from '@model/hooks/usePads';
import { Pad } from '@model/types';
import { PadStep } from './components/PadStep';
import { useStepSequencerEvents } from './hooks/useStepSequencerEvents';

// import { SequencerPad } from './SequencerPad';
// import { TimeSequencerBody } from './TimeSequencer/TimeSequencerBody';

const CELL_WIDTH = '1fr';
const CELL_HEIGHT = '1fr';
const STEPS = 16;
const HEADER_HEIGHT = 4;
const HEADER_WIDTH = '64px';

export const StepSequencer = () => {
  const { pads } = usePads();
  const { bpm } = useStepSequencer();
  const padCount = pads?.length ?? 1;

  const { activeStep } = useStepSequencerEvents({
    bpm
  });

  // const activeStep = 0;

  // const stepContainerHeight = 1124; //CELL_HEIGHT * 17 + HEADER_HEIGHT + 100;

  return (
    <div className='vo-stepseq w-full h-full mt-4 mb-4 rounded-lg bg-c2 border border-gray-300 flex'>
      {/* <div
        className={`vo-stepseq-pads w-[${HEADER_WIDTH}] grid`}
        style={{
          gridTemplateRows: `${HEADER_HEIGHT}px repeat(${padCount}, ${CELL_HEIGHT}) 1em`
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
      </div> */}

      <div
        className={`vo-stepseq-steps w-full grid overflow-x-auto overflow-y-auto overscroll-none`}
        style={{
          gridTemplateRows: `repeat(${STEPS}, ${CELL_HEIGHT})`,
          gridTemplateColumns: `repeat(${padCount}, 1fr)`,
          gridAutoFlow: 'row'
        }}
      >
        {/* <div
          className='header border-l border-b border-gray-300 w-full'
          style={{
            gridColumn: '1 / -1',
            position: 'sticky'
          }}
        ></div> */}
        {pads.map((pad) => (
          <PadSteps
            key={`padsteps-${pad.id}`}
            pad={pad}
            activeStep={activeStep}
          />
        ))}
      </div>
    </div>
  );
};

const PadSteps = ({ pad, activeStep }: { pad: Pad; activeStep: number }) => {
  return Array.from({ length: STEPS }).map((_, index) => (
    <PadStep
      key={`padstep-${pad.id}-${index}`}
      pad={pad}
      index={index}
      isPlaying={index === activeStep}
    />
  ));
};

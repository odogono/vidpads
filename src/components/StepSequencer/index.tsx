'use client';

import { useEffect } from 'react';

import { useStepSequencer } from '@hooks/useStepSequencer';
import { usePads } from '@model/hooks/usePads';
import { Pad } from '@model/types';
import { createLog } from '../../helpers/log';
import { PadStep } from './components/PadStep';
import { usePadStepEvents } from './hooks/usePadStepEvents';
import { useStepSequencerEvents } from './hooks/useStepSequencerEvents';

const log = createLog('StepSequencer');

const CELL_HEIGHT = '1fr';
const STEPS = 16;

export const StepSequencer = () => {
  const { pads } = usePads();
  const { bpm, seqEvents, seqEventsStr, stepToPadIds, isPlaying } =
    useStepSequencer();
  const padCount = pads?.length ?? 1;

  const { activeStep } = useStepSequencerEvents({
    bpm,
    seqEventsStr,
    stepToPadIds,
    isPlaying
  });

  const { handlePadTouchStart, handlePadTouchEnd } = usePadStepEvents();

  useEffect(() => {
    log.debug('isPlaying', isPlaying);
  }, [isPlaying]);
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
        {pads.map((pad) =>
          Array.from({ length: STEPS }).map((_, index) => {
            const isActive = seqEvents[pad.id]?.[index];
            return (
              <PadStep
                key={`padstep-${pad.id}-${index}`}
                pad={pad}
                index={index}
                isPlaying={index === activeStep}
                isActive={isActive}
                onTouchStart={handlePadTouchStart}
                onTouchEnd={handlePadTouchEnd}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

// const PadSteps = ({ pad, activeStep }: { pad: Pad; activeStep: number }) => {
//   return Array.from({ length: STEPS }).map((_, index) => (
//     <PadStep
//       key={`padstep-${pad.id}-${index}`}
//       pad={pad}
//       index={index}
//       isPlaying={index === activeStep}
//     />
//   ));
// };

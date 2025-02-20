'use client';

// import { createLog } from '@helpers/log';
import { usePads } from '@model/hooks/usePads';
import { PadStep } from './components/PadStep';
import { usePadStepEvents } from './hooks/usePadStepEvents';
import { useStepSequencerEvents } from './hooks/useStepSequencerEvents';

// const log = createLog('StepSequencer');

const CELL_HEIGHT = '1fr';
const STEPS = 16;

export const StepSequencer = () => {
  const { pads } = usePads();

  const padCount = pads?.length ?? 1;

  const {
    handlePadTouchStart,
    handlePadTouchEnd,
    handlePadEnter,
    handlePadLeave
  } = usePadStepEvents();

  const { activeStep, pattern } = useStepSequencerEvents();

  return (
    <div className='vo-stepseq w-full h-full mt-4 mb-4 rounded-lg bg-c2 border border-gray-300 flex'>
      <div
        className={`vo-stepseq-steps w-full grid overflow-x-auto overflow-y-auto overscroll-none`}
        style={{
          gridTemplateRows: `repeat(${STEPS}, ${CELL_HEIGHT})`,
          gridTemplateColumns: `repeat(${padCount}, 1fr)`,
          gridAutoFlow: 'row'
        }}
      >
        {pads.map((pad) =>
          Array.from({ length: STEPS }).map((_, index) => {
            const isActive = pattern[pad.id]?.[index];
            return (
              <PadStep
                key={`padstep-${pad.id}-${index}`}
                pad={pad}
                index={index}
                isPlaying={index === activeStep}
                isActive={isActive}
                onTouchStart={handlePadTouchStart}
                onTouchEnd={handlePadTouchEnd}
                onEnter={handlePadEnter}
                onLeave={handlePadLeave}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

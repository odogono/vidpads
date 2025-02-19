'use client';

import { usePads } from '@model/hooks/usePads';
import { TimeSequencerBody } from './TimeSequencerBody';
import { SequencerPad } from './components/SequencerPad';

export const TimeSequencer = () => {
  const { pads } = usePads();

  const padCount = pads?.length ?? 1;

  return (
    <div className='vo-seq flex mt-4 w-full flex-grow bg-c2 rounded-lg'>
      <div
        className='grid grid-cols-2 w-full'
        style={{
          gridTemplateColumns: `0.05fr 1fr`,
          gridTemplateRows: `1fr repeat(${padCount}, minmax(0, 1fr)) 0.6fr`
        }}
      >
        <div className='vo-seq-corner relative col-span-1 flex justify-center items-center'></div>
        {pads.map((pad, index) => (
          <div
            key={`pad-${pad.id}`}
            className=''
            style={{ gridArea: `${index + 2}/1/auto/span 1` }}
          >
            <SequencerPad pad={pad} />
          </div>
        ))}
        <div
          className='vo-seq-footer col-span-2'
          style={{ gridArea: `${padCount + 2}/1/auto/span 1` }}
        ></div>
        <div
          className='vo-seq-body-wrapper overflow-x-scroll overflow-y-hidden'
          style={{ gridColumn: `2/3`, gridRow: `1/${padCount + 3}` }}
        >
          <TimeSequencerBody pads={pads} />
        </div>
      </div>
    </div>
  );
};

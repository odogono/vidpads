'use client';

import { usePads } from '@model/hooks/usePads';
import { SequencerBody } from './SequencerBody';
import { SequencerPad } from './SequencerPad';

export const Sequencer = () => {
  const { pads } = usePads();

  return (
    <div className='vo-seq flex mt-4 w-full flex-grow bg-slate-500 rounded-lg'>
      <div
        className='grid grid-cols-2 w-full'
        style={{
          gridTemplateColumns: `0.05fr 1fr`,
          gridTemplateRows: `1fr repeat(${pads.length}, minmax(0, 1fr)) 0.5fr`
        }}
      >
        <div className='vo-seq-header bg-slate-800 col-span-1 flex justify-center items-center'></div>
        {pads.map((pad, index) => (
          <div
            key={pad.id}
            className=''
            style={{ gridArea: `${index + 2}/1/auto/span 1` }}
          >
            <SequencerPad pad={pad} />
          </div>
        ))}
        <div
          className='vo-seq-footer col-span-2'
          style={{ gridArea: `${pads.length + 2}/1/auto/span 1` }}
        ></div>
        <div
          className='vo-seq-body-wrapper col-span-1 row-span-12 bg-slate-400 overflow-x-scroll'
          style={{ gridRow: `span ${pads.length + 2}` }}
        >
          <SequencerBody />
        </div>
      </div>
    </div>
  );
};

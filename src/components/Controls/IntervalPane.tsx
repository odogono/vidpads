'use client';

import { useEffect, useState } from 'react';

import { usePad } from '@model/hooks/usePad';
import { IntervalSlider } from './IntervalSlider';
import { NumericInterval } from './NumericInterval';

export const IntervalPane = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { pad, selectedPadId } = usePad();
  const isEnabled = !!selectedPadId;

  // used to prevent hydration error
  // since selectedPadId is undefined on the server
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // if (!selectedPadId) {
  //   return (
  //     <div className='w-full h-full bg-slate-500 rounded-lg flex gap-6 items-center justify-center'>
  //       <h3 className='font-semibold text-foreground/90'>No Pad Selected</h3>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className='pane-interval w-full h-full bg-slate-500 p-2 rounded-lg flex flex-col gap-2'>
        <IntervalSlider pad={pad} isEnabled={isEnabled} />
        <NumericInterval pad={pad} isEnabled={isEnabled} />
      </div>
    </>
  );
};

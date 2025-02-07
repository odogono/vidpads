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

  return (
    <>
      <div className='pane-interval w-full h-full  p-2 rounded-lg flex flex-col gap-2 items-center'>
        <IntervalSlider pad={pad} isEnabled={isEnabled} />
        <NumericInterval pad={pad} isEnabled={isEnabled} />
      </div>
    </>
  );
};

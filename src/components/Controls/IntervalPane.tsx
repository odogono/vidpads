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
      <div className='vo-pane-interval w-fit portrait:md:w-full landscape:md:w-full h-full pl-2 pr-2 rounded-lg flex flex-col gap-1 items-center'>
        <IntervalSlider pad={pad} isEnabled={isEnabled} />
        <NumericInterval pad={pad} isEnabled={isEnabled} />
      </div>
    </>
  );
};

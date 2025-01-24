'use client';

import { useEffect, useState } from 'react';

import { usePad } from '@model/hooks/usePad';
import { Card, CardHeader } from '@nextui-org/react';
import { IntervalSlider } from './IntervalSlider';
import { NumericInterval } from './NumericInterval';

export const IntervalPane = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { pad, selectedPadId } = usePad();
  // used to prevent hydration error
  // since selectedPadId is undefined on the server
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!selectedPadId) {
    return (
      <Card className='mt-4 w-full h-full bg-gray-800'>
        <CardHeader className='flex justify-between items-center'>
          <h3 className='font-semibold text-foreground/90'>No Pad Selected</h3>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className='pane-interval w-full h-full bg-slate-500 rounded-lg flex flex-col gap-2'>
        <IntervalSlider pad={pad} />
        <NumericInterval pad={pad} />
      </div>
    </>
  );
};

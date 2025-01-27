'use client';

import { useEffect } from 'react';

import { useShowMode } from '@model/hooks/useShowMode';

export const SequencerPane = () => {
  const { setShowMode } = useShowMode();

  useEffect(() => {
    setShowMode('sequencer');

    return () => {
      setShowMode('pads');
    };
  }, [setShowMode]);

  return (
    <>
      <div className='pane-interval w-full h-full bg-slate-500 rounded-lg flex flex-col gap-2'>
        sequencer
      </div>
    </>
  );
};

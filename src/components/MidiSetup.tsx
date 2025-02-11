import React, { useCallback, useEffect } from 'react';

import { Button } from '@heroui/react';
import { useMidiInputs, useMidiMappingMode } from '@hooks/useMidi/selectors';
import { useEvents } from '../hooks/events';
import { OpModalContainer } from './common/OpModalContainer';

export const MidiSetup = () => {
  const events = useEvents();
  const inputs = useMidiInputs();
  const { isMidiMappingModeEnabled, enableMappingMode } = useMidiMappingMode();

  useEffect(() => {
    // enableMappingMode(true);

    return () => {
      enableMappingMode(false);
    };
  }, [enableMappingMode]);

  const handleOk = useCallback(() => {
    enableMappingMode(false);
  }, [enableMappingMode]);

  useEffect(() => {
    events.on('cmd:cancel', handleOk);

    return () => {
      events.off('cmd:cancel', handleOk);
    };
  }, [handleOk, events]);

  return (
    <OpModalContainer
      isVisible={isMidiMappingModeEnabled}
      height='20vh'
      hasPointerEvents={isMidiMappingModeEnabled}
    >
      <div className='vo-midi-setup flex flex-col gap-4 justify-start items-start w-[80%] h-[80%]'>
        <div className='w-full flex justify-between items-center'>
          <div>Map MIDI to Pads</div>
        </div>

        <div className='grid grid-cols-[1fr_0.2fr] w-full'>
          <div className='font-bold'>Name</div>
          <div className='font-bold'>State</div>

          {inputs.map((input) => (
            <React.Fragment key={input.id}>
              <div className='pr-4'>{input.name}</div>
              <div>{input.state}</div>
            </React.Fragment>
          ))}
        </div>
        <Button color='primary' onPress={handleOk}>
          Ok
        </Button>
      </div>
    </OpModalContainer>
  );
};

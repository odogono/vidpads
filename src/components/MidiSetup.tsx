import React from 'react';

import { useMidiInputs } from '@hooks/useMidi/selectors';
import { OpModalContainer } from './buttons/OpModalContainer';

export const MidiSetup = () => {
  const inputs = useMidiInputs();

  return (
    <OpModalContainer isVisible={true}>
      <div className='vo-midi-setup flex flex-col gap-4  justify-start items-start w-[80%] h-[80%]'>
        <div>MidiSetup</div>

        <div className='grid grid-cols-[1fr_0.2fr] w-full '>
          <div className='font-bold'>Name</div>
          <div className='font-bold'>State</div>

          {inputs.map((input) => (
            <React.Fragment key={input.id}>
              <div className='pr-4'>{input.name}</div>
              <div>{input.state}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </OpModalContainer>
  );
};

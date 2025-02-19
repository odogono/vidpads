'use client';

import { getOffsetPosition } from '@helpers/dom';
import { createLog } from '@helpers/log';
import { Position } from '@types';

interface HeaderProps {
  pixelsPerBeat: number;
  endTime: number;
  onTap: (pos: Position) => void;
}

const log = createLog('sequencer/header', ['debug']);

export const Header = ({ pixelsPerBeat, endTime, onTap }: HeaderProps) => {
  // Generate beat numbers based on endTime
  const beatNumbers = Array.from({ length: Math.ceil(endTime) }, (_, i) => i);

  log.debug('beatNumbers', { beatNumbers, endTime });

  return (
    <div
      className='vo-seq-header relative pointer-events-auto'
      style={{
        gridColumn: '2/2',
        backgroundSize: 'auto 30%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom',
        backgroundImage: `repeating-linear-gradient(
        to right,
      transparent 0px,
      transparent ${pixelsPerBeat - 1}px,
      #aaa ${pixelsPerBeat - 1}px,
      #aaa ${pixelsPerBeat}px
        )`
      }}
      onMouseDown={(e) => {
        const pos = getOffsetPosition(e);
        onTap(pos);
      }}
    >
      {/* Beat numbers */}
      <div className='absolute top-1 left-0 right-0 flex text-xs text-gray-400'>
        {beatNumbers.map(
          (num) =>
            num % 4 === 0 && (
              <div
                key={num}
                style={{
                  position: 'absolute',
                  left: `${num * pixelsPerBeat}px`,
                  width: `${pixelsPerBeat}px`,
                  textAlign: 'center'
                }}
              >
                {num}
              </div>
            )
        )}
      </div>

      {/* Existing grid overlay */}
      <div
        className='absolute top-0 left-0 right-0 bottom-0'
        style={{
          backgroundSize: 'auto 60%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom',
          backgroundImage: `repeating-linear-gradient(
            to right, 
            transparent 0px,
            transparent ${pixelsPerBeat * 4 - 1}px,
            #aaa ${pixelsPerBeat * 4 - 1}px,
            #aaa ${pixelsPerBeat * 4}px
          )`
        }}
      ></div>
    </div>
  );
};

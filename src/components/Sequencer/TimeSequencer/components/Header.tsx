'use client';

// import { createLog } from '@helpers/log';
import { getOffsetPosition } from '@helpers/dom';
import { Position } from '@types';

interface HeaderProps {
  pixelsPerBeat: number;
  onTap: (pos: Position) => void;
}

// const log = createLog('sequencer/header');

export const Header = ({ pixelsPerBeat, onTap }: HeaderProps) => {
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

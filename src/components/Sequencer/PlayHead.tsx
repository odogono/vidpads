'use client';

export interface PlayHeadProps {
  position: number;
}

export const PlayHead = ({ position }: PlayHeadProps) => {
  return (
    <div
      className='absolute vo-seq-playhead w-[20px] h-full z-10 pointer-events-none'
      style={{
        left: `${1 + position}px`
      }}
    >
      <div
        className='cursor-col-resize pointer-events-auto'
        style={{
          width: 0,
          height: 0,
          borderLeft: `10px solid transparent`,
          borderRight: `10px solid transparent`,
          borderTop: `10px solid #aaa`
        }}
      />
      <div className='w-[1px] h-full ml-[9px] bg-white cursor-col-resize pointer-events-auto' />
    </div>
  );
};

'use client';

import { formatTimeToString } from '@helpers/time';
import { useSelector } from '@xstate/store/react';
import { store } from './store';

export const Tooltip = () => {
  const time = useSelector(store, (state) => state.context.time);
  const x = useSelector(store, (state) => state.context.pos[0]);
  const y = useSelector(store, (state) => state.context.pos[1]);

  if (x === -1) return null;

  const timeString = formatTimeToString(time);

  const bgColor = 'bg-yellow-500';
  const borderColor = 'border-t-yellow-500';

  return (
    <div
      className={`absolute z-[900] w-[6vh] h-[2vh] ${bgColor} text-black text-center flex items-center justify-center`}
      style={{
        top: y,
        left: x,
        transform: 'translateX(-35%)',
        borderRadius: 10
      }}
    >
      {timeString}
      <div
        className={`tooltip-arrow absolute left-1/2 top-full -translate-x-1/2 -mt-0 
                          border-solid border-t-8 border-x-8 border-b-0
                          ${borderColor} border-x-transparent`}
        aria-hidden='true'
      />
    </div>
  );
};

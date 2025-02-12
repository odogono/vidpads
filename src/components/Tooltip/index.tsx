'use client';

import { useMemo } from 'react';

import { formatTimeToString } from '@helpers/time';
import { useSelector } from '@xstate/store/react';
import { store } from './store';

// TODO this should be a portal
export const Tooltip = () => {
  const time = useSelector(store, (state) => state.context.time);
  const x = useSelector(store, (state) => state.context.pos[0]);
  const y = useSelector(store, (state) => state.context.pos[1]);

  const timeString = useMemo(() => formatTimeToString(time), [time]);

  if (x === -1) return null;

  return (
    <div
      className={`
        absolute 
        z-[900] 
        w-[6.8rem] 
        bg-tooltip text-black 
        font-mono text-sm text-center 
        flex items-center justify-center`}
      style={{
        // safari fix - https://stackoverflow.com/a/62934196/2377677
        display: 'inline-block',
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
                          border-t-tooltip border-x-transparent`}
        aria-hidden='true'
      />
    </div>
  );
};

'use client';

import { createPortal } from 'react-dom';

import { useSelector } from '@xstate/store/react';
import { store } from './store';

export const Tooltip = () => {
  const text = useSelector(store, (state) => state.context.text);
  const x = useSelector(store, (state) => state.context.pos[0]);
  const y = useSelector(store, (state) => state.context.pos[1]);
  const isVisible = useSelector(store, (state) => state.context.isVisible);

  if (!isVisible) return null;

  return createPortal(
    <div
      className={`
        absolute 
        z-[900] 
        min-w-[6.8rem] 
        max-w-[10rem]
        bg-tooltip text-black 
        font-mono text-sm text-center 
        flex items-center justify-center
        pointer-events-none`}
      style={{
        // safari fix - https://stackoverflow.com/a/62934196/2377677
        display: 'inline-block',
        top: y,
        left: x,
        borderRadius: 10,
        transform: 'translateX(-50%) translateY(-50%)'
      }}
    >
      {text}
      <div
        className={`tooltip-arrow absolute left-1/2 top-full -translate-x-1/2 -mt-0 
                          border-solid border-t-8 border-x-8 border-b-0
                          border-t-tooltip border-x-transparent`}
        aria-hidden='true'
      />
    </div>,
    document.body
  );
};

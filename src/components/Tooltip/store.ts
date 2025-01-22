import { createStore } from '@xstate/store';

export const store = createStore({
  // Initial context
  context: { time: 0, pos: [-1, -1] },
  // Transitions
  on: {
    setToolTip: (context, event: { time: number; x: number; y: number }) => ({
      time: event.time,
      pos: [event.x, event.y]
    }),
    hideToolTip: () => ({
      time: 0,
      pos: [-1, -1]
    })
  }
});

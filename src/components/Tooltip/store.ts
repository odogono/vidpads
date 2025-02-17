import { createStore } from '@xstate/store';

export const store = createStore({
  // Initial context
  context: { text: '', pos: [-1, -1], isVisible: false },
  // Transitions
  on: {
    setToolTip: (context, event: { text: string; x: number; y: number }) => ({
      text: event.text,
      pos: [event.x, event.y],
      isVisible: true
    }),
    hideToolTip: () => ({
      text: '',
      pos: [-1, -1],
      isVisible: false
    })
  }
});

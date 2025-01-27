import { createStore as createXstateStore } from '@xstate/store';
import { createPad } from '../pad';
import * as actions from './actions';
import type {
  Actions,
  EmittedEvents,
  StoreContextType,
  StoreType
} from './types';

export const initialContext: StoreContextType = {
  isInitial: true,
  projectId: null,
  projectName: 'Untitled',
  isPadPlayEnabled: true,
  isPadSelectSourceEnabled: true,
  isKeyboardPlayEnabled: true,
  showMode: 'pads',
  sequencer: {
    bpm: 120,
    events: []
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  startTime: new Date().toISOString(),
  pads: [
    createPad('a1'),
    createPad('a2'),
    createPad('a3'),
    createPad('a4'),
    createPad('a5'),
    createPad('a6'),
    createPad('a7'),
    createPad('a8'),
    createPad('a9'),
    createPad('a10'),
    createPad('a11'),
    createPad('a12'),
    createPad('a13'),
    createPad('a14'),
    createPad('a15'),
    createPad('a16')
  ]
};

export const createStore = (initialState?: StoreContextType): StoreType => {
  const content = {
    types: {
      context: {} as StoreContextType,
      events: {} as Actions,
      emitted: {} as EmittedEvents
    },
    context: initialState ?? initialContext,
    on: actions
  };

  return createXstateStore(content);
};

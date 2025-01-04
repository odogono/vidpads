// import { createLog } from '@helpers/log';
import { createStore as createXstateStore } from '@xstate/store';
import { createPad } from '../pad';
import * as actions from './actions';
import type {
  Actions,
  EmittedEvents,
  StoreContextType,
  StoreType
} from './types';

// const log = createLog('state');

export const initialContext: StoreContextType = {
  isInitial: true,
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

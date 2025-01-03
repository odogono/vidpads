// import { createLog } from '@helpers/log';
import { createStore as createXstateStore } from '@xstate/store';
import { createPad } from '../pad';
import { actions } from './actions';
import type {
  EmittedEvents,
  Events,
  StoreContextType,
  StoreType
} from './types';

// const log = createLog('state');

const initialContext: StoreContextType = {
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

const types = {
  context: {} as StoreContextType,
  events: {} as Events,
  emitted: {} as EmittedEvents
};

export const createStore = (context?: StoreContextType): StoreType => {
  return createXstateStore({
    types,
    context: context ?? initialContext,
    on: actions
  });
};

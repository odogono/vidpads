import { createStore as createXstateStore } from '@xstate/store';
import { formatShortDate } from '../../helpers/datetime';
import { generateShortUUID } from '../../helpers/uuid';
import { createPad } from '../pad';
import * as actions from './actions';
import type {
  Actions,
  EmittedEvents,
  StoreContextType,
  StoreType
} from './types';

export const initialContext: StoreContextType = {
  projectId: generateShortUUID(),
  projectName: 'Untitled',
  isPadPlayEnabled: true,
  isPadSelectSourceEnabled: true,
  isKeyboardPlayEnabled: true,
  showMode: 'pads',
  sequencer: {
    bpm: 60,
    events: [],
    startTime: 0,
    endTime: 30 // secs
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
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

export const createStore = (
  initialState?: StoreContextType | null | undefined
): StoreType => {
  const date = new Date();
  const dateString = date.toISOString();
  const projectName = `Untitled ${formatShortDate(date)}`;

  const initial = {
    ...initialContext,
    projectId: generateShortUUID(),
    projectName,
    createdAt: dateString,
    updatedAt: dateString
  };

  const content = {
    types: {
      context: {} as StoreContextType,
      events: {} as Actions,
      emitted: {} as EmittedEvents
    },
    context: initialState ?? initial,
    on: actions
  };

  return createXstateStore(content);
};

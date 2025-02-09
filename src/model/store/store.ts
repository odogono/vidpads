import { createDate, dateToISOString } from '@helpers/datetime';
import { generateShortUUID } from '@helpers/uuid';
import { createPad } from '@model/pad';
import { createStore as createXstateStore } from '@xstate/store';
import * as actions from './actions';
import type {
  Actions,
  EmittedEvents,
  StoreContextType,
  StoreType
} from './types';

export const initialContext: StoreContextType = {
  projectId: generateShortUUID(),
  projectName: '',
  arePadInteractionsEnabled: true,
  settings: {
    isPadPlayEnabled: true,
    isKeyboardPlayEnabled: true,
    isMidiPlayEnabled: false,
    hidePlayerOnEnd: false,
    selectPadFromKeyboard: false,
    selectPadFromMidi: false,
    selectPadFromPad: true
  },
  showMode: 'pads',
  sequencer: {
    bpm: 60,
    events: [],
    time: 0,
    endTime: 30 // secs
  },
  createdAt: dateToISOString(),
  updatedAt: dateToISOString(),
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
  const date = createDate();
  const dateString = dateToISOString(date);
  const projectName = ``;

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

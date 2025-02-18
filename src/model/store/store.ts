import { createDate, dateToISOString } from '@helpers/datetime';
import { generateShortUUID } from '@helpers/uuid';
import { createPad } from '@model/pad';
import { createStore as createXstateStore } from '@xstate/store';
import * as actions from './actions';
import type {
  ProjectStoreActions,
  ProjectStoreContextType,
  ProjectStoreEvents,
  ProjectStoreType
} from './types';

export const initialContext: ProjectStoreContextType = {
  projectId: generateShortUUID(),
  projectName: '',
  showMode: 'pads',
  sequencer: {
    bpm: 60,
    events: [],
    isLooped: true,
    time: 0,
    endTime: 60 // secs
  },
  stepSequencer: {
    bpm: 60,
    events: [],
    isLooped: true,
    time: 0,
    endTime: 60 // secs
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
  initialState?: ProjectStoreContextType | null | undefined
): ProjectStoreType => {
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
      context: {} as ProjectStoreContextType,
      events: {} as ProjectStoreActions,
      emitted: {} as ProjectStoreEvents
    },
    context: initialState ?? initial,
    on: actions
  };

  return createXstateStore(content);
};

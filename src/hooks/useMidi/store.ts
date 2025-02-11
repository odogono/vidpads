import { createLog } from '@helpers/log';
import { createStore as createXStateStore } from '@xstate/store';

const log = createLog('useMidi/store');

interface MidiInput {
  id: string;
  name: string;
  state: 'connected' | 'disconnected';
}

interface MidiStoreContext {
  isEnabled: boolean;
  isMappingModeEnabled: boolean;
  inputs: MidiInput[];
}

const initialContext: MidiStoreContext = {
  isEnabled: false,
  isMappingModeEnabled: false,
  inputs: []
};

type SetIsEnabledAction = { type: 'setIsEnabled'; isEnabled: boolean };

type InputConnectedAction = {
  type: 'inputConnected';
  id: string;
  name?: string | null;
};

type InputDisconnectedAction = { type: 'inputDisconnected'; id: string };

type InputMessageAction = {
  type: 'inputMessage';
  id: string;
  status: number;
  note: number;
  velocity: number;
};

type EnableMappingModeAction = {
  type: 'enableMappingMode';
  isEnabled: boolean;
};

type Actions =
  | SetIsEnabledAction
  | InputConnectedAction
  | InputDisconnectedAction
  | InputMessageAction
  | EnableMappingModeAction;

type ReadyEvent = { type: 'ready' };

type EmittedEvents = ReadyEvent;
type Emit = { emit: (event: EmittedEvents) => void };

const Actions = {
  enableMappingMode: (
    context: MidiStoreContext,
    event: EnableMappingModeAction
  ) => {
    return {
      ...context,
      isMappingModeEnabled: event.isEnabled
    };
  },
  inputMessage: (context: MidiStoreContext, event: InputMessageAction) => {
    const { id, status, note, velocity } = event;

    const input = context.inputs.find((input) => input.id === id);

    if (!input) {
      log.debug('inputMessage: input not found', { id });
      log.debug('inputMessage: context', context);
      return context;
    }

    log.debug('inputMessage', { id: input.name, status, note, velocity });

    return context;
  },

  setIsEnabled: (context: MidiStoreContext, event: { isEnabled: boolean }) => {
    return {
      ...context,
      isEnabled: event.isEnabled
    };
  },
  inputConnected: (context: MidiStoreContext, event: InputConnectedAction) => {
    const { id, name } = event;

    const newInput = {
      id,
      name,
      state: 'connected'
    } as MidiInput;

    // log.debug(
    //   'inputConnected: existing',
    //   context.inputs.map((i) => i.name).join(',')
    // );
    const index = context.inputs.findIndex((input) => input.id === id);
    const inputs = [...context.inputs];

    if (index === -1) {
      // log.debug('inputConnected: add new', newInput.name);
      inputs.push(newInput);
    } else {
      const existingInput = inputs[index];
      // log.debug('inputConnected: update', existingInput.name, index);
      if (existingInput.state !== newInput.state) {
        // log.debug(
        //   'inputConnected: state changed',
        //   existingInput.name,
        //   newInput.state
        // );
        inputs[index] = newInput;
      }
    }

    return {
      ...context,
      inputs
    };
  },
  inputDisconnected: (
    context: MidiStoreContext,
    event: InputDisconnectedAction
  ) => {
    const { id } = event;

    const input = context.inputs.find((input) => input.id === id);

    if (!input) {
      return context;
    }

    log.debug('inputDisconnected', input);

    return {
      ...context,
      inputs: context.inputs.filter((input) => input.id !== id)
    };
  }
};

export const createStore = () => {
  const content = {
    types: {
      context: {} as MidiStoreContext,
      events: {} as Actions,
      emitted: {} as EmittedEvents
    },
    context: initialContext,
    on: Actions
  };

  const store = createXStateStore(content);

  return store;
};

export type MidiStoreType = ReturnType<typeof createStore>;

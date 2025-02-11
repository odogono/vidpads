import { createLog } from '@helpers/log';
import { createStore as createXStateStore } from '@xstate/store';
import { midiNoteToName } from './helpers';
import {
  Emit,
  EmittedEvents,
  EnableMappingModeAction,
  InputConnectedAction,
  InputDisconnectedAction,
  InputMessageAction,
  MidiInput,
  MidiStoreContext,
  RemoveMidiMappingForPadAction,
  type Actions
} from './types';

const log = createLog('useMidi/store');

const initialContext: MidiStoreContext = {
  isEnabled: false,
  isMappingModeEnabled: false,
  inputs: [],
  midiToPadMap: {},
  padToMidiMap: {}
};

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
  inputMessage: (
    context: MidiStoreContext,
    event: InputMessageAction,
    { emit }: Emit
  ) => {
    const { isMappingModeEnabled, inputs, midiToPadMap, padToMidiMap } =
      context;
    const { id, status, note, velocity, selectedPadId } = event;

    const input = inputs.find((input) => input.id === id);

    if (!input) {
      log.debug('inputMessage: input not found', { id });
      log.debug('inputMessage: context', context);
      return context;
    }

    const isNoteOn = (status & 0xf0) === 0x90;
    const isNoteOff = velocity === 0 || (status & 0xf0) === 0x80;
    const isAftertouch = (status & 0xf0) === 0xa0;
    const channel = status & 0x0f;

    if (isMappingModeEnabled && selectedPadId) {
      // log.debug('inputMessage: selectedPadId', {
      //   selectedPadId,
      //   isNoteOn,
      //   isNoteOff,
      //   isAftertouch,
      //   channel,
      //   note: midiNoteToName(note)
      // });

      // apply the id, note and channel to the selected pad
      const midiKey = `${input.id}-${channel}-${midiNoteToName(note)}`;
      const existingMidiKey = padToMidiMap[selectedPadId];

      if (existingMidiKey && existingMidiKey === midiKey) {
        return context;
      }

      log.debug('inputMessage: updating midiToPadMap', {
        midiKey,
        selectedPadId
      });

      const newMidiToPadMap = {
        ...midiToPadMap,
        [midiKey]: selectedPadId
      };

      const newPadToMidiMap = {
        ...padToMidiMap,
        [selectedPadId]: midiKey
      };

      emit({
        type: 'midiMappingUpdated',
        padId: selectedPadId,
        midiKey
      });

      return {
        ...context,
        midiToPadMap: newMidiToPadMap,
        padToMidiMap: newPadToMidiMap
      };
    }

    // if (isAftertouch) {
    //   log.debug('inputMessage: aftertouch', {
    //     id: input.name,
    //     status,
    //     note,
    //     velocity,
    //     channel
    //   });
    // } else if (isNoteOff) {
    //   log.debug('inputMessage: noteOff', {
    //     id: input.name,
    //     status,
    //     note,
    //     velocity,
    //     channel
    //   });
    // } else if (isNoteOn) {
    //   log.debug('inputMessage: noteOn', {
    //     id: input.name,
    //     status,
    //     note,
    //     velocity,
    //     channel
    //   });
    // } else {
    //   log.debug('inputMessage: ??', {
    //     id: input.name,
    //     status,
    //     note,
    //     velocity,
    //     channel
    //   });
    // }
    // log.debug('inputMessage', {
    //   id: input.name,
    //   status,
    //   note,
    //   velocity,
    //   isNoteOn,
    //   isNoteOff,
    //   isAftertouch,
    //   isMappingModeEnabled,
    //   selectedPadId
    // });

    return context;
  },

  removeMidiMappingForPad: (
    context: MidiStoreContext,
    event: RemoveMidiMappingForPadAction
  ) => {
    const { padId } = event;
    const { padToMidiMap } = context;

    const midiKey = padToMidiMap[padId];

    if (!midiKey) {
      return context;
    }

    const newPadToMidiMap = {
      ...padToMidiMap,
      [padId]: undefined
    };

    return { ...context, padToMidiMap: newPadToMidiMap };
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

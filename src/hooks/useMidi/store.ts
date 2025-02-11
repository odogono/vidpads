import { createLog } from '@helpers/log';
import { createStore as createXStateStore } from '@xstate/store';
import { dateToISOString } from '../../helpers/datetime';
import { midiNoteToName } from './helpers';
import {
  Emit,
  EmittedEvents,
  EnableMappingModeAction,
  ImportStoreFromJsonAction,
  InputConnectedAction,
  InputDisconnectedAction,
  InputMessageAction,
  MidiInput,
  MidiStoreContext,
  MidiStoreExport,
  RemoveMidiMappingForPadAction,
  type Actions
} from './types';

const log = createLog('useMidi/store');

const initialContext: MidiStoreContext = {
  isEnabled: false,
  isMappingModeEnabled: false,
  inputs: [],
  midiToPadMap: {},
  padToMidiMap: {},
  midiNoteOnMap: {},
  updatedAt: dateToISOString()
};

const addMidiToPadMap = (
  map: Record<string, string[]>,
  midiKey: string,
  padId: string
) => {
  const existingPadIds = map[midiKey] ?? [];

  if (!existingPadIds.includes(padId)) {
    map[midiKey] = [...existingPadIds, padId];
  }
  return map;
};

export const exportStoreToJson = (store: MidiStoreType): MidiStoreExport => {
  const { midiToPadMap, padToMidiMap, updatedAt } = store.getSnapshot().context;

  const data = {
    id: 'midiStore',
    midiToPadMap,
    padToMidiMap,
    updatedAt
  };

  return data;
};

export const importStoreFromJson = (
  store: MidiStoreType,
  data: MidiStoreExport
) => {
  store.send({ type: 'importStoreFromJson', data });
};

const update = (context: MidiStoreContext, data: Partial<MidiStoreContext>) => {
  return {
    ...context,
    ...data,
    updatedAt: dateToISOString()
  };
};

const Actions = {
  importStoreFromJson: (
    context: MidiStoreContext,
    event: ImportStoreFromJsonAction
  ) => {
    const { data } = event;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { midiToPadMap, padToMidiMap, ...rest } = data;

    // a sanity check to make sure the maps are valid
    if (Object.keys(padToMidiMap ?? {}).length === 0) {
      return update(context, {
        ...rest,
        midiToPadMap: {},
        padToMidiMap: {},
        midiNoteOnMap: {}
      });
    }
    return update(context, data);
  },

  enableMappingMode: (
    context: MidiStoreContext,
    event: EnableMappingModeAction
  ) => {
    return update(context, {
      isMappingModeEnabled: event.isEnabled,
      midiNoteOnMap: {}
    });
  },

  setAllOff: (context: MidiStoreContext) => {
    return update(context, { midiNoteOnMap: {} });
  },

  inputMessage: (
    context: MidiStoreContext,
    event: InputMessageAction,
    { emit }: Emit
  ) => {
    const {
      isMappingModeEnabled,
      inputs,
      midiToPadMap,
      padToMidiMap,
      midiNoteOnMap
    } = context;
    const { id, status, note, velocity, selectedPadId } = event;

    const input = inputs.find((input) => input.id === id);

    if (!input) {
      log.debug('inputMessage: input not found', { id });
      log.debug('inputMessage: context', context);
      return context;
    }

    const isNoteOn = velocity > 0 && (status & 0xf0) === 0x90;
    const isNoteOff = velocity === 0 || (status & 0xf0) === 0x80;
    // const isAftertouch = (status & 0xf0) === 0xa0;
    const channel = status & 0x0f;
    const noteName = midiNoteToName(note);
    const midiKey = `${input.id}-${channel}-${noteName}`;

    if (isMappingModeEnabled && selectedPadId) {
      // apply the id, note and channel to the selected pad
      const existingMidiKey = padToMidiMap[selectedPadId];

      if (existingMidiKey && existingMidiKey === midiKey) {
        return context;
      }

      log.debug('inputMessage: updating midiToPadMap', {
        midiKey,
        selectedPadId
      });

      const newMidiToPadMap = addMidiToPadMap(
        midiToPadMap,
        midiKey,
        selectedPadId
      );

      const newPadToMidiMap = {
        ...padToMidiMap,
        [selectedPadId]: midiKey
      };

      emit({
        type: 'midiMappingUpdated',
        padId: selectedPadId,
        midiKey
      });

      return update(context, {
        midiNoteOnMap: {},
        midiToPadMap: newMidiToPadMap,
        padToMidiMap: newPadToMidiMap
      });
    }

    const padIds = midiToPadMap[midiKey] ?? [];
    const isNoteAlreadyOn = midiNoteOnMap[midiKey] ?? false;

    if (!padIds.length) {
      return context;
    }

    for (const padId of padIds) {
      if (isNoteOff && isNoteAlreadyOn) {
        emit({
          type: 'noteOff',
          padId,
          note: noteName,
          velocity,
          channel
        });

        midiNoteOnMap[midiKey] = false;
      } else if (isNoteOn && !isNoteAlreadyOn) {
        emit({
          type: 'noteOn',
          padId,
          note: noteName,
          velocity,
          channel
        });

        midiNoteOnMap[midiKey] = true;
      }
    }

    return context;
  },

  removeMidiMappingForPad: (
    context: MidiStoreContext,
    event: RemoveMidiMappingForPadAction,
    { emit }: Emit
  ) => {
    const { padId } = event;
    const { padToMidiMap, midiToPadMap } = context;

    const midiKey = padToMidiMap[padId];

    if (!midiKey) {
      return context;
    }

    const newMidiToPadMap = Object.entries(midiToPadMap).reduce(
      (acc, [key, value]) => {
        if (typeof value === 'string') {
          value = [value];
        }

        if (value.includes(padId)) {
          acc[key] = value.filter((id) => id !== padId);
        } else {
          acc[key] = value;
        }

        return acc;
      },
      {} as Record<string, string[]>
    );

    const newPadToMidiMap = {
      ...padToMidiMap
    };
    delete newPadToMidiMap[padId];

    emit({
      type: 'midiMappingUpdated',
      padId: padId,
      midiKey: undefined
    });

    return update(context, {
      padToMidiMap: newPadToMidiMap,
      midiToPadMap: newMidiToPadMap,
      midiNoteOnMap: {}
    });
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

    return update(context, { inputs, midiNoteOnMap: {} });
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

    return update(context, {
      inputs: context.inputs.filter((input) => input.id !== id),
      midiNoteOnMap: {}
    });
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

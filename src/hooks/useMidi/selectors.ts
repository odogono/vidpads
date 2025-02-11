import { useCallback, useMemo } from 'react';

import { useSelector } from '@xstate/store/react';
import { useMidi } from '.';

export const useMidiMappingMode = () => {
  const { store } = useMidi();

  const isMidiMappingModeEnabled = useSelector(
    store,
    (state) => state.context.isMappingModeEnabled
  );

  const enableMappingMode = useCallback(
    (isEnabled: boolean) => {
      store.send({ type: 'enableMappingMode', isEnabled });
    },
    [store]
  );

  return {
    isMidiMappingModeEnabled,
    enableMappingMode
  };
};

export const useMidiInputs = () => {
  const { store } = useMidi();

  const inputs = useSelector(store, (state) => state.context.inputs);

  return inputs;
};

export const useMidiPadToMidiMap = () => {
  const { store } = useMidi();

  const isMidiMappingModeEnabled = useSelector(
    store,
    (state) => state.context.isMappingModeEnabled
  );

  const rawMap = useSelector(store, (state) => state.context.padToMidiMap);

  // decode the values into an object of note, channel and inputId
  const padToMidiMap = useMemo(() => {
    return Object.entries(rawMap).reduce(
      (acc, [padId, midiKey]) => {
        if (!midiKey) return acc;
        const [inputId, channel, note] = midiKey.split('-');
        acc[padId] = { inputId, channel, note };
        return acc;
      },
      {} as Record<string, { inputId: string; channel: string; note: string }>
    );
  }, [rawMap]);

  const removeMidiMappingForPad = useCallback(
    (padId: string) => {
      store.send({ type: 'removeMidiMappingForPad', padId });
    },
    [store]
  );

  return { isMidiMappingModeEnabled, padToMidiMap, removeMidiMappingForPad };
};

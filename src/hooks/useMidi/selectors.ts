import { useCallback } from 'react';

import { useSelector } from '@xstate/store/react';
import { useMidi } from '.';

export const useMidiMappingMode = () => {
  const { store } = useMidi();

  const isMappingModeEnabled = useSelector(
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
    isMappingModeEnabled,
    enableMappingMode
  };
};

export const useMidiInputs = () => {
  const { store } = useMidi();

  const inputs = useSelector(store, (state) => state.context.inputs);

  return inputs;
};

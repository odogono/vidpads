'use client';

import { useCallback } from 'react';

import { useStore } from '@model/store/useStore';
import { useSelector } from '@xstate/store/react';

export const useEditActive = () => {
  const { store } = useStore();

  const setEditActive = useCallback(
    (isEditActive: boolean) => {
      store.send({ type: 'setEditActive', isEditActive });
    },
    [store]
  );

  const isEditActive = useSelector(
    store,
    (state) => state.context.isEditActive
  );

  return { isEditActive, setEditActive };
};

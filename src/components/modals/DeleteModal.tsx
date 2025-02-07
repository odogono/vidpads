'use client';

import { useCallback } from 'react';

import { usePadOperations } from '@model/hooks/usePadOperations';
import { useSelectedPadId } from '@model/store/selectors';
import { CommonModal, CommonModalBase } from './CommonModal';

export const DeleteModal = ({ ref }: CommonModalBase) => {
  const { selectedPadId } = useSelectedPadId();
  const { clearPad } = usePadOperations();

  const handleDelete = useCallback(async () => {
    if (!selectedPadId) return false;
    await clearPad({ sourcePadId: selectedPadId });
    return true;
  }, [selectedPadId, clearPad]);

  return (
    <CommonModal ref={ref} title='Delete Pad' onOk={handleDelete}>
      <p>Are you sure you want to delete this pad?</p>
      <p className='text-sm text-gray-500'>This action cannot be undone.</p>
    </CommonModal>
  );
};

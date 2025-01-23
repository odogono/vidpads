'use client';

import { useCallback } from 'react';

import { useProjects } from '@model/hooks/useProjects';
import { CommonModal, CommonModalBase } from './CommonModal';

export type DeleteEverythingModalProps = CommonModalBase;

export const DeleteEverythingModal = ({ ref }: DeleteEverythingModalProps) => {
  const { deleteEverything } = useProjects();

  const handleDelete = useCallback(async () => {
    await deleteEverything();

    return true;
  }, [deleteEverything]);

  return (
    <CommonModal ref={ref} title='Delete Everything' onOk={handleDelete}>
      <p>This will delete all data and reset the app.</p>
    </CommonModal>
  );
};

'use client';

import { useCallback } from 'react';

import { useProjects } from '@model/hooks/useProjects';
import { CommonModal, CommonModalBase } from './CommonModal';

export const NewProjectModal = ({ ref }: CommonModalBase) => {
  const { createNewProject } = useProjects();

  const handleNewProject = useCallback(async () => {
    await createNewProject();
    return true;
  }, [createNewProject]);

  return (
    <CommonModal ref={ref} title='New Project' onOk={handleNewProject}>
      <p>Confirm that you want to create a new project.</p>
    </CommonModal>
  );
};

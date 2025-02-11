'use client';

import { useCallback, useEffect, useState } from 'react';

import { createLog } from '@helpers/log';
import { Input } from '@heroui/react';
import { useProjects } from '@model/hooks/useProjects';
import { CommonModal, CommonModalBase } from './CommonModal';

const log = createLog('SaveProjectModal', ['debug']);

export const SaveProjectModal = ({ ref }: CommonModalBase) => {
  const { saveProject, projectName } = useProjects();
  const [name, setName] = useState(projectName);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    setName(projectName);
  }, [projectName]);

  const handleSaveProject = useCallback(async () => {
    try {
      if (!name) {
        setNameError('Name is required');
        return false;
      }
      await saveProject(name);
      return true;
    } catch (error) {
      log.error('Failed to save project:', error);
      // Handle error (show toast, etc)
    }
    return false;
  }, [saveProject, name]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        ref.current?.ok();
      }
    },
    [ref]
  );

  log.debug('projectName', projectName);

  return (
    <CommonModal ref={ref} title='Save Project' onOk={handleSaveProject}>
      <Input
        isClearable
        className='w-full'
        label='Name'
        color='primary'
        variant='bordered'
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setNameError(null);
        }}
        onClear={() => setName('')}
        errorMessage={nameError}
        isInvalid={!!nameError}
        onKeyUp={handleKeyPress}
      />
    </CommonModal>
  );
};

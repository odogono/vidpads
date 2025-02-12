'use client';

import { useRef } from 'react';

import { createLog } from '@helpers/log';
import { Textarea } from '@heroui/react';
import { useProjects } from '@model/hooks/useProjects';
import { CommonModal, CommonModalBase } from './CommonModal';

const log = createLog('ImportProjectModal');

export const ImportProjectModal = ({ ref }: CommonModalBase) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { importFromJSONString } = useProjects();

  const handleImport = async () => {
    const json = textareaRef.current?.value;
    if (!json) return false;

    try {
      await importFromJSONString(json);
      return true;
    } catch (error) {
      log.error('Failed to import project:', error);
    }
    return false;
  };

  return (
    <CommonModal ref={ref} title='Import Project' onOk={handleImport}>
      <Textarea
        ref={textareaRef}
        isClearable
        color='primary'
        className='w-full'
        label='JSON'
        placeholder='Paste your JSON here'
        variant='bordered'
      />
    </CommonModal>
  );
};

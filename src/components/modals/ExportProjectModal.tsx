'use client';

import { useCallback, useState } from 'react';

import { Input } from '@heroui/react';
import { useShareUrl } from '@hooks/useShareUrl';
// import { createLog } from '@helpers/log';
import { useProjects } from '@model/hooks/useProjects';
import { CommonModal, CommonModalBase } from './CommonModal';
import { CopyButton } from './CopyButton';

export const ExportProjectModal = ({ ref }: CommonModalBase) => {
  const { exportToJSONString, exportToURLString } = useProjects();
  const { createNewUrl } = useShareUrl();

  const [url, setUrl] = useState('');

  const json = exportToJSONString();

  const handleOpen = useCallback(async () => {
    const fetchUrl = async () => {
      const d = await exportToURLString(true);
      setUrl(createNewUrl({ d }));
    };
    fetchUrl();
  }, [exportToURLString, createNewUrl]);

  return (
    <CommonModal
      ref={ref}
      title='Export Project'
      onOpen={handleOpen}
      showCancel={false}
    >
      <div className='flex flex-row gap-2 items-center'>
        <Input
          isReadOnly
          className='w-full'
          label='URL'
          variant='bordered'
          defaultValue={url}
        />
        <CopyButton text={url} />
      </div>

      <div className='flex flex-row gap-2 items-center'>
        <Input
          isReadOnly
          className='w-full'
          label='JSON'
          variant='bordered'
          defaultValue={json}
        />
        <CopyButton text={json} />
      </div>
    </CommonModal>
  );
};

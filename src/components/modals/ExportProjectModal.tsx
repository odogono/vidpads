'use client';

import { QRCodeSVG } from 'qrcode.react';

import { Input } from '@heroui/react';
import { useProjectJsonString } from '@model/hooks/useProjectJsonString';
// import { createLog } from '@helpers/log';

import { useProjectUrl } from '@model/hooks/useProjectUrl';
import { CommonModal, CommonModalBase } from './CommonModal';
import { CopyButton } from './CopyButton';

export const ExportProjectModal = ({ ref }: CommonModalBase) => {
  const json = useProjectJsonString();
  const url = useProjectUrl();

  return (
    <CommonModal ref={ref} title='Export Project' showCancel={false}>
      <div className='flex flex-row gap-2 items-center'>
        <Input
          color='primary'
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
          color='primary'
          isReadOnly
          className='w-full'
          label='JSON'
          variant='bordered'
          defaultValue={json}
        />
        <CopyButton text={json} />
      </div>
      <div className='flex w-full flex-row gap-2 justify-center'>
        <QRCodeSVG value={url} size={256} marginSize={3} />
      </div>
    </CommonModal>
  );
};

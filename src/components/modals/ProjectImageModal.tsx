/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState } from 'react';

import { createLog } from '@helpers/log';
import { Input } from '@heroui/react';
import { useCurrentProject } from '@model/hooks/useCurrentProject';
import { CommonModal, CommonModalBase } from './CommonModal';

const log = createLog('ProjectImageModal');

export const ProjectImageModal = ({ ref }: CommonModalBase) => {
  const { projectBgImage, setProjectBgImage } = useCurrentProject();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    projectBgImage ?? null
  );
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e?: React.ChangeEvent<HTMLInputElement>) => {
    const url = e?.target.value ?? null;
    setPreviewUrl(url);
    setError('');
  };

  const validateImage = (url: string = ''): Promise<boolean> => {
    // blank is ok
    if (url === '') return Promise.resolve(true);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const handleSave = async () => {
    const url = inputRef.current?.value;
    try {
      const isValid = await validateImage(url);
      if (!isValid) {
        setError('Invalid image URL');
        return false;
      }

      setProjectBgImage(url);
      return true;
    } catch (error) {
      log.error('Failed to set project image:', error);
      setError('Failed to set image');
    }
    return false;
  };

  return (
    <CommonModal ref={ref} title='Set Project Background' onOk={handleSave}>
      <div className='flex gap-4 items-center'>
        <div className='w-[200px] h-[150px] border border-default-200 rounded-lg overflow-hidden flex items-center justify-center'>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt='Preview'
              className='max-w-full max-h-full object-contain'
              onError={() => setError('Invalid image URL')}
            />
          ) : (
            <span className='text-default-400 text-sm'>Preview</span>
          )}
        </div>
        <div className='flex-1'>
          <Input
            isClearable
            ref={inputRef}
            type='url'
            label='Image URL'
            placeholder='Enter image URL'
            defaultValue={projectBgImage}
            onClear={handleUrlChange}
            onChange={handleUrlChange}
            color={error ? 'danger' : 'primary'}
            errorMessage={error}
            variant='bordered'
          />
          {inputRef.current?.value && (
            <div
              className={`text-xs mt-1 ${inputRef.current.value.length > 30 ? 'text-warning' : 'text-default-400'}`}
            >
              {inputRef.current.value.length} chars
            </div>
          )}
        </div>
      </div>
    </CommonModal>
  );
};

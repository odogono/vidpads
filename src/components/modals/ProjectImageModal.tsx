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
    log.debug('[handleUrlChange] setting preview url:', url);
    setPreviewUrl(url);
    setError('');
  };

  const isVideoUrl = (url: string = '') => {
    return url.toLowerCase().endsWith('.mp4');
  };

  const validateMedia = (url: string = ''): Promise<boolean> => {
    log.debug('[validateMedia] validating url:', url);
    // blank is ok
    if (!url) return Promise.resolve(true);

    return new Promise((resolve) => {
      if (isVideoUrl(url)) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => resolve(true);
        video.onerror = (error) => {
          log.debug('Failed to load video:', url, error);
          resolve(false);
        };
        video.src = url;
      } else {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = (error) => {
          log.debug('Failed to load image:', url, error);
          resolve(false);
        };
        img.src = url;
      }
    });
  };

  const handleSave = async () => {
    const url = inputRef.current?.value;
    try {
      const isValid = await validateMedia(url);
      if (!isValid) {
        setError('Invalid media URL');
        return false;
      }

      setProjectBgImage(url);
      return true;
    } catch (error) {
      log.error('Failed to set project media:', error);
      setError('Failed to set media');
    }
    return false;
  };

  // log.debug('[ProjectImageModal] projectBgImage:', { projectBgImage, error });

  return (
    <CommonModal
      ref={ref}
      title='Set Project Background'
      onOk={handleSave}
      onOpen={() => {
        setPreviewUrl(projectBgImage ?? null);
        setError('');
      }}
    >
      <div className='flex gap-4 items-center'>
        <div className='w-[200px] h-[150px] border border-default-200 rounded-lg overflow-hidden flex items-center justify-center'>
          {previewUrl ? (
            isVideoUrl(previewUrl) ? (
              <video
                src={previewUrl}
                className='max-w-full max-h-full object-contain'
                controls={false}
                muted
                loop
                autoPlay
                playsInline
                onError={() => setError('Invalid video URL')}
              />
            ) : (
              <img
                src={previewUrl}
                alt='Preview'
                className='max-w-full max-h-full object-contain'
                onError={() => setError('Invalid image URL')}
              />
            )
          ) : (
            <span className='text-default-400 text-sm'>Preview</span>
          )}
        </div>
        <div className='flex-1'>
          <Input
            isClearable
            ref={inputRef}
            type='url'
            label='Media URL'
            placeholder='Enter image or video URL'
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

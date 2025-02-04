'use client';

import { useCallback, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { isValidSourceUrl } from '@helpers/metadata';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { useProject } from '@hooks/useProject';
import { usePadOperations } from '@model/hooks/usePadOperations';
import { useLastMediaUrl } from '@model/store/selectors';
import { Button, Input } from '@nextui-org/react';
import { CommonModal, CommonModalBase, OnOpenProps } from './CommonModal';

const log = createLog('SelectSourceModal');

export type SelectSourceModalProps = CommonModalBase;

export const SelectSourceModal = ({ ref }: SelectSourceModalProps) => {
  const events = useEvents();
  const { projectId } = useProject();
  const [isEnteringUrl, setIsEnteringUrl] = useState(false);
  const { ACCEPTED_FILE_TYPES } = usePadDnD('SelectSourceModal');
  const { lastMediaUrl, setLastMediaUrl } = useLastMediaUrl();
  const [url, setUrl] = useState(lastMediaUrl ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const { addFileToPad, addUrlToPad } = usePadOperations();
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  const close = useCallback(() => ref.current?.close(), [ref]);

  const handleClose = useCallback(() => {
    setIsEnteringUrl(false);
    setUrl('');
    setActiveIndex(null);
  }, []);

  const handleUrlSubmit = async () => {
    if (handleValidate(url) === null && activeIndex) {
      setIsEnteringUrl(false);
      setLastMediaUrl(url);

      await addUrlToPad({ url, padId: activeIndex, projectId });
    }
    return true;
  };

  const handleOpened = useCallback(({ padId }: { padId: string }) => {
    setActiveIndex(padId);
  }, []);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0 && activeIndex !== null) {
        const file = files[0];
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          log.warn('Invalid file type. Please use PNG, JPEG, or MP4 files.');
          return;
        }
        await addFileToPad({ file, padId: activeIndex, projectId });
        close();
      }
      e.target.value = '';
    },
    [activeIndex, addFileToPad, ACCEPTED_FILE_TYPES, close, projectId]
  );

  const handleValidate = useCallback((value: string) => {
    if (isValidSourceUrl(value)) {
      return null;
    }
    return 'Please enter a valid URL';
  }, []);

  const handleEnterUrl = useCallback(() => {
    setIsEnteringUrl(true);
    setTimeout(() => {
      urlInputRef.current?.focus();
    }, 0);
  }, []);

  const handlePaste = useCallback(async () => {
    events.emit('cmd:paste');
    close();
  }, [events, close]);

  return (
    <CommonModal
      ref={ref}
      title='Select Media Source'
      onOk={handleUrlSubmit}
      onOpen={handleOpened as OnOpenProps}
      onClose={handleClose}
    >
      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept={ACCEPTED_FILE_TYPES.join(',')}
        onChange={handleFileSelected}
      />
      <Button onPress={handleFileSelect} className='w-full' color='primary'>
        Select File
      </Button>
      {!isEnteringUrl ? (
        <>
          <Button
            onPress={handleEnterUrl}
            className='w-full'
            variant='bordered'
          >
            Enter URL
          </Button>
        </>
      ) : (
        <div className='flex flex-col gap-2'>
          <Input
            ref={urlInputRef}
            className='vo-select-src-enter-url'
            validate={handleValidate}
            placeholder='Enter media URL'
            isClearable
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleUrlSubmit()}
            onClear={() => setUrl('')}
          />
        </div>
      )}
      <Button onPress={handlePaste} className='w-full' color='primary'>
        Paste from clipboard
      </Button>
    </CommonModal>
  );
};

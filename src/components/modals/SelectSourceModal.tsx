'use client';

import { useCallback, useRef, useState } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { isValidSourceUrl } from '@helpers/metadata';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { usePadOperations } from '@model/hooks/usePadOperations';
import { useLastMediaUrl } from '@model/store/selectors';
import { Button, Input } from '@nextui-org/react';
import { CommonModal, CommonModalBase, OnOpenProps } from './CommonModal';

const log = createLog('SelectSourceModal');

export type SelectSourceModalProps = CommonModalBase;

export const SelectSourceModal = ({ ref }: SelectSourceModalProps) => {
  const events = useEvents();
  const [isEnteringUrl, setIsEnteringUrl] = useState(false);
  const { ACCEPTED_FILE_TYPES } = usePadDnD();
  const { lastMediaUrl, setLastMediaUrl } = useLastMediaUrl();
  const [url, setUrl] = useState(lastMediaUrl ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFileToPad, addUrlToPad } = usePadOperations();
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  const handleUrlSubmit = async () => {
    if (handleValidate(url) === null && activeIndex) {
      setIsEnteringUrl(false);
      setLastMediaUrl(url);

      await addUrlToPad({ url, padId: activeIndex });
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
        await addFileToPad({ file, padId: activeIndex });
        ref.current?.onClose();
      }
      e.target.value = '';
    },
    [activeIndex, addFileToPad, ACCEPTED_FILE_TYPES, ref]
  );

  const handleValidate = useCallback((value: string) => {
    if (isValidSourceUrl(value)) {
      return null;
    }
    return 'Please enter a valid URL';
  }, []);

  const handlePaste = useCallback(async () => {
    events.emit('cmd:paste');
    // if (activeIndex) {
    //   await pastePadFromClipboard({ targetPadId: activeIndex });
    //   ref.current?.onClose();
    // }
  }, [events]);

  return (
    <CommonModal
      ref={ref}
      title='Select Media Source'
      onOk={handleUrlSubmit}
      onOpen={handleOpened as OnOpenProps}
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
            onPress={() => setIsEnteringUrl(true)}
            className='w-full'
            variant='bordered'
          >
            Enter URL
          </Button>
          <Button onPress={handlePaste} className='w-full' color='primary'>
            Paste from clipboard
          </Button>
        </>
      ) : (
        <div className='flex flex-col gap-2'>
          <Input
            validate={handleValidate}
            placeholder='Enter media URL'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
        </div>
      )}
    </CommonModal>
  );
};

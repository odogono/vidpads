'use client';

import { useState } from 'react';

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader
} from '@nextui-org/react';

export type SelectSourceModalRef = {
  onOpen: () => void;
};

type SelectSourceModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFileSelect: () => void;
  onUrlSelect: (url: string) => void;
};

// todo convert this to standard modal behaviour
export const SelectSourceModal = ({
  isOpen,
  onOpenChange,
  onFileSelect,
  onUrlSelect
}: SelectSourceModalProps) => {
  const [isEnteringUrl, setIsEnteringUrl] = useState(false);
  const [url, setUrl] = useState('');

  const handleUrlSubmit = () => {
    if (url.trim()) {
      onUrlSelect(url);
      setUrl('');
      setIsEnteringUrl(false);
    }
  };

  const onClose = () => {
    setUrl('');
    setIsEnteringUrl(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement='center'
      className='bg-background text-foreground'
    >
      <ModalContent>
        <ModalHeader>Select Media Source</ModalHeader>
        <ModalBody className='gap-4 pb-6'>
          <Button onPress={onFileSelect} className='w-full' color='primary'>
            Select File
          </Button>

          {!isEnteringUrl ? (
            <Button
              onPress={() => setIsEnteringUrl(true)}
              className='w-full'
              variant='bordered'
            >
              Enter URL
            </Button>
          ) : (
            <div className='flex flex-col gap-2'>
              <Input
                type='url'
                placeholder='Enter media URL'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <div className='flex gap-2'>
                <Button
                  variant='ghost'
                  onPress={onClose}
                  className='bg-stone-600 hover:bg-stone-700 text-foreground'
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleUrlSubmit}
                  className='flex-1'
                  color='primary'
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

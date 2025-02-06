'use client';

import { useImperativeHandle, useRef } from 'react';

import { createLog } from '@helpers/log';
import { useProjects } from '@model/hooks/useProjects';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea
} from "@heroui/react";
import { useModalState } from './useModalState';

const log = createLog('ImportProjectModal');

export interface ImportProjectModalRef {
  onOpen: () => void;
}

export interface ImportProjectModalProps {
  ref: React.RefObject<ImportProjectModalRef | null>;
}

// TODO convert to CommonModal

export const ImportProjectModal = ({ ref }: ImportProjectModalProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isOpen, onOpen, onClose } = useModalState();
  const { importFromJSONString } = useProjects();

  const handleImport = () => {
    const json = textareaRef.current?.value;
    if (!json) return;

    try {
      importFromJSONString(json);
      onClose();
    } catch (error) {
      log.error('Failed to import project:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    onOpen
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop='blur'
      className='bg-background text-foreground'
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              Import Project
            </ModalHeader>
            <ModalBody>
              <Textarea
                ref={textareaRef}
                isClearable
                className='w-full'
                label='JSON'
                placeholder='Paste your JSON here'
                variant='bordered'
              />
            </ModalBody>
            <ModalFooter>
              <Button
                variant='ghost'
                onPress={onClose}
                className='bg-stone-600 hover:bg-stone-700 text-foreground'
              >
                Cancel
              </Button>
              <Button
                onPress={handleImport}
                className='hover:bg-sky-600 bg-sky-500 text-foreground'
              >
                Import
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

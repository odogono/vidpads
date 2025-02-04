'use client';

import { useImperativeHandle } from 'react';

import { useShareUrl } from '@hooks/useShareUrl';
// import { createLog } from '@helpers/log';
import { useProjects } from '@model/hooks/useProjects';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@nextui-org/react';
import { CopyButton } from './CopyButton';
import { useModalState } from './useModalState';

// const log = createLog('ExportProjectModal');

export interface ExportProjectModalRef {
  onOpen: () => void;
}

export interface ExportProjectModalProps {
  ref: React.RefObject<ExportProjectModalRef | null>;
}

// TODO convert to CommonModal

export const ExportProjectModal = ({ ref }: ExportProjectModalProps) => {
  const { isOpen, onOpen, onClose } = useModalState();
  const { exportToJSONString, exportToURLString } = useProjects();
  const { createNewUrl } = useShareUrl();

  const json = exportToJSONString();
  const url = createNewUrl({ d: exportToURLString() });

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
              Export Project
            </ModalHeader>
            <ModalBody>
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
                onPress={onClose}
                className='hover:bg-sky-600 bg-sky-500 text-foreground'
              >
                Ok
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

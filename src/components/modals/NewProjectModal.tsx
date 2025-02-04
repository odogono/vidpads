'use client';

import { useCallback, useImperativeHandle } from 'react';

// import { createLog } from '@helpers/log';
import { useProjects } from '@model/hooks/useProjects';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@nextui-org/react';
import { useModalState } from './useModalState';

// const log = createLog('NewProjectModal');

export interface NewProjectModalRef {
  onOpen: () => void;
}

export interface NewProjectModalProps {
  ref: React.RefObject<NewProjectModalRef | null>;
}

// TODO convert to CommonModal

export const NewProjectModal = ({ ref }: NewProjectModalProps) => {
  const { isOpen, onOpen, onClose } = useModalState();
  const { createNewProject } = useProjects();

  const handleNewProject = useCallback(async () => {
    await createNewProject();
    onClose();
  }, [createNewProject, onClose]);

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
              New Project
            </ModalHeader>
            <ModalBody>
              <p>Confirm that you want to create a new project.</p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant='ghost'
                onPress={onClose}
                className='bg-background text-foreground'
              >
                Cancel
              </Button>
              <Button
                onPress={handleNewProject}
                className='bg-red-500 text-foreground'
              >
                Create
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

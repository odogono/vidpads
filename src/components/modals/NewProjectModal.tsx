'use client';

import { forwardRef, useCallback, useImperativeHandle } from 'react';

import { createLog } from '@helpers/log';
import { usePadOperations } from '@model';
import { useSelectedPadId } from '@model/store/selectors';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@nextui-org/react';

const log = createLog('NewProjectModal');

export interface NewProjectModalRef {
  onOpen: () => void;
}

export const NewProjectModal = forwardRef<NewProjectModalRef>((_props, ref) => {
  const { selectedPadId } = useSelectedPadId();
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const { clearPad } = usePadOperations();

  const handleNewProject = useCallback(async () => {
    // if (!selectedPadId) return;
    // await clearPad(selectedPadId);
    onClose();
  }, [onClose]);

  useImperativeHandle(ref, () => ({
    onOpen
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop='blur' className='bg-background text-foreground'>
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
              <Button variant='ghost' onPress={onClose} className='bg-background text-foreground'>
                Cancel
              </Button>
              <Button onPress={handleNewProject} className='bg-red-500 text-foreground'>
                Create
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

NewProjectModal.displayName = 'NewProjectModal';

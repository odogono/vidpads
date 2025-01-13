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

const log = createLog('Controls');

export interface DeleteModalRef {
  onOpen: () => void;
}

export const DeleteModal = forwardRef<DeleteModalRef>((_props, ref) => {
  const { selectedPadId } = useSelectedPadId();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { clearPad } = usePadOperations();

  const handleDelete = useCallback(async () => {
    if (!selectedPadId) return;
    await clearPad(selectedPadId);
    onClose();
  }, [selectedPadId, clearPad, onClose]);

  useImperativeHandle(ref, () => ({
    onOpen
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop='blur' className='bg-background text-foreground'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              Confirm Delete
            </ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete this pad?</p>
              <p className='text-sm text-gray-500'>
                This action cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant='ghost' onPress={onClose} className='bg-background text-foreground'>
                Cancel
              </Button>
              <Button onPress={handleDelete} className='bg-red-500 text-foreground'>
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

DeleteModal.displayName = 'DeleteModal';

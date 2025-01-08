import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import { clearPad } from '@model';
import { useEditActive, useSelectedPadId } from '@model/store/selectors';
import { useStore } from '@model/store/useStore';
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

export const Controls = () => {
  const { selectedPadId } = useSelectedPadId();
  const { isEditActive, setEditActive } = useEditActive();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { store } = useStore();

  const handleDelete = useCallback(async () => {
    if (!selectedPadId) return;
    await clearPad(store, selectedPadId);
    onClose();
  }, [selectedPadId, store, onClose]);

  const handleEdit = useCallback(() => {
    setEditActive(!isEditActive);
  }, [isEditActive, setEditActive]);

  return (
    <div className='mt-4 w-[800px] h-[100px] mx-auto'>
      <div className='flex justify-between items-center'>
        {selectedPadId ? (
          <>
            <div className='text-2xl font-bold'>{selectedPadId}</div>
            <div className='flex gap-2'>
              <Button
                onPress={handleEdit}
                color={isEditActive ? 'primary' : 'default'}
              >
                Edit
              </Button>
              <Button onPress={onOpen}>Delete</Button>
            </div>
          </>
        ) : (
          <div className='text-2xl font-bold'>No pad selected</div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
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
                <Button variant='ghost' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  onPress={handleDelete}
                  className='bg-red-500 text-white'
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

import { Button } from '@components/ui/button';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { clearPad } from '@model';
import { useStore } from '@model/store/useStore';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@nextui-org/react';

export const Controls = () => {
  const { selectedPadId } = usePadDnD();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { store } = useStore();

  const handleDelete = async () => {
    if (!selectedPadId) return;
    await clearPad(store, selectedPadId);
    onClose();
  };

  return (
    <div className='mt-4 w-[800px] h-[100px] mx-auto'>
      <div className='flex justify-between items-center'>
        {selectedPadId ? (
          <>
            <div className='text-2xl font-bold'>{selectedPadId}</div>
            <div className='flex gap-2'>
              <Button>Edit</Button>
              <Button onClick={onOpen}>Delete</Button>
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
                <Button variant='ghost' onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
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

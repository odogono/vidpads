import { useCallback, useRef } from 'react';

import { createLog } from '@helpers/log';
import { useEditActive, useSelectedPadId } from '@model/store/selectors';
import { Button } from '@nextui-org/react';
import { DeleteModal, DeleteModalRef } from './DeleteModal';

const log = createLog('Controls');

export const Controls = () => {
  const { selectedPadId } = useSelectedPadId();
  const { isEditActive, setEditActive } = useEditActive();
  const modalRef = useRef<DeleteModalRef>(null);

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
              <Button onPress={() => modalRef.current?.onOpen()}>Delete</Button>
            </div>
          </>
        ) : (
          <div className='text-2xl font-bold'>No pad selected</div>
        )}
      </div>
      <DeleteModal ref={modalRef} />
    </div>
  );
};

import { Button } from '@components/ui/button';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';

export const Controls = () => {
  const { selectedPadId } = usePadDnD();

  return (
    <div className='mt-4 w-[800px] h-[100px] mx-auto'>
      <div className='flex justify-between items-center'>
        {selectedPadId ? (
          <>
            <div className='text-2xl font-bold'>{selectedPadId}</div>
            <div className='flex gap-2'>
              <Button>Edit</Button>
              <Button>Delete</Button>
            </div>
          </>
        ) : (
          <div className='text-2xl font-bold'>No pad selected</div>
        )}
      </div>
    </div>
  );
};

import { ClipboardCopy, ClipboardX } from 'lucide-react';

import { TrashIcon } from '@heroicons/react/24/outline';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';

export const BinComponent = () => {
  const { isDragging, dragOverId, onDragLeave, onDragOver, onDrop } =
    usePadDnD();
  const isDraggingOver =
    dragOverId === 'cut' || dragOverId === 'copy' || dragOverId === 'delete';

  return (
    <div
      id='bin-container'
      className='absolute left-1/2 -translate-x-1/2 top-[30vh] z-50'
    >
      <div
        className={`
        w-[50vw] h-[15vh] rounded-lg cursor-pointer relative
        flex items-center justify-center
        shadow-[0_0_15px_rgba(0,0,0,0.5)]
        transition-all duration-300 ease-in-out
        ${
          isDragging
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10 pointer-events-none hidden'
        }
        ${isDraggingOver ? 'bg-gray-600 scale-105' : 'bg-gray-800 hover:bg-gray-700'}
      `}
        // onDragOver={(e) => onDragOver(e, 'bin')}
        // onDragLeave={() => onDragLeave('bin')}
        // onDrop={(e) => onDrop(e, 'bin')}
      >
        <div
          className='w-full h-full flex items-center justify-center'
          onDragOver={(e) => onDragOver(e, 'cut')}
          onDragLeave={() => onDragLeave('cut')}
          onDrop={(e) => onDrop(e, 'cut')}
        >
          <ClipboardX
            className={`
          w-[7vw] h-[7vh] transition-all duration-300
          ${dragOverId === 'cut' ? 'text-gray-100 scale-150' : 'text-gray-400'}
        `}
          />
        </div>
        <div
          className=' w-full h-full flex items-center justify-center'
          onDragOver={(e) => onDragOver(e, 'copy')}
          onDragLeave={() => onDragLeave('copy')}
          onDrop={(e) => onDrop(e, 'copy')}
        >
          <ClipboardCopy
            className={`
          w-[7vw] h-[7vh] transition-all duration-300
          ${dragOverId === 'copy' ? 'text-gray-100 scale-150' : 'text-gray-400'}
        `}
          />
        </div>

        <div
          className=' w-full h-full flex items-center justify-center'
          onDragOver={(e) => onDragOver(e, 'delete')}
          onDragLeave={() => onDragLeave('delete')}
          onDrop={(e) => onDrop(e, 'delete')}
        >
          <TrashIcon
            className={`
          w-[7vw] h-[7vh] transition-all duration-300
          ${dragOverId === 'delete' ? 'text-red-500 scale-150' : 'text-gray-400'}
        `}
          />
        </div>
      </div>
    </div>
  );
};

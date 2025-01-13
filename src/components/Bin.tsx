import { TrashIcon } from '@heroicons/react/24/outline';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';

export const BinComponent = () => {
  const { isDragging, dragOverId, onDragLeave, onDragOver, onDrop } =
    usePadDnD();
  const isDraggingOver = dragOverId === 'bin';

  return (
    <div className='absolute left-1/2 -translate-x-1/2 top-[420px] z-50'>
    <div
      className={`
        w-[400px] h-[200px] rounded-lg cursor-pointer relative
        flex items-center justify-center
        shadow-[0_0_15px_rgba(0,0,0,0.5)]
        transition-all duration-300 ease-in-out
        ${
          isDragging
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10 pointer-events-none'
        }
        ${isDraggingOver ? 'bg-gray-600 scale-105' : 'bg-gray-800 hover:bg-gray-700'}
      `}
      onDragOver={(e) => onDragOver(e, 'bin')}
      onDragLeave={() => onDragLeave('bin')}
      onDrop={(e) => onDrop(e, 'bin')}
    >
      <TrashIcon
        className={`
          w-24 h-24 transition-all duration-300
          ${isDraggingOver ? 'text-red-500 scale-110' : 'text-gray-400'}
        `}
      />
    </div>
    </div>
  );
};

import { useState } from 'react';

import { createLog } from '@helpers/log';
import { TrashIcon } from '@heroicons/react/24/outline';
import { clearPad } from '@model';
import { useStore } from '@model/store/useStore';
import { useDragContext } from './DragContext';

const log = createLog('BinComponent');

export const BinComponent = () => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const { isDragging } = useDragContext();
  const store = useStore();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggedOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggedOver(false);

    const padId = e.dataTransfer.getData('application/pad-id');
    log.debug('handleDrop', padId);

    if (padId) {
      clearPad(store, padId);
    }
  };

  return (
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
        ${isDraggedOver ? 'bg-gray-600 scale-105' : 'bg-gray-800 hover:bg-gray-700'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <TrashIcon
        className={`
          w-24 h-24 transition-all duration-300
          ${isDraggedOver ? 'text-red-500 scale-110' : 'text-gray-400'}
        `}
      />
    </div>
  );
};

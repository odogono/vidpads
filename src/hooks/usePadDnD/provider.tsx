import { ReactNode, useCallback, useState } from 'react';

import { createLog } from '@helpers/log';
import { usePadOperations } from '@model';
import { PadDnDContext } from './context';

const log = createLog('PadDnDProvider');

const ACCEPTED_FILE_TYPES = [
  // 'image/png',
  // 'image/jpeg',
  // 'image/jpg',
  'video/mp4',
  'video/mov'
];

export const PadDnDProvider = ({ children }: { children: ReactNode }) => {
  const [draggingPadId, setDraggingPadId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // const { ffmpeg } = useFFmpeg();
  // const { store } = useStore();
  const { addFileToPad, clearPad, copyPadToPad } = usePadOperations();
  const onDragStart = useCallback((id: string) => {
    setDraggingPadId(id);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggingPadId(null);
  }, []);

  const onDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      setDragOverId(id);

      const isBin = id === 'bin';

      // Check if this is a pad being dragged
      const isPadDrag = e.dataTransfer.types.includes('application/pad-id');

      if (isPadDrag) {
        // Only show drop indicator if dragging onto a different pad
        if (draggingPadId !== id) {
          setDragOverId(id);
        }
        return;
      }

      // Handle file drag (existing code)
      if (!isBin) {
        const types = Array.from(e.dataTransfer.items).map((item) => item.type);
        if (types.some((type) => ACCEPTED_FILE_TYPES.includes(type))) {
          setDragOverId(id);
        }
      }

      // log.debug('handleDragOver', id);
    },
    [draggingPadId]
  );

  const onDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const onDrop = useCallback(
    async (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      setDragOverId(null);
      setDraggingPadId(null);

      // Check if this is a pad being dropped
      const sourcePadId = e.dataTransfer.getData('application/pad-id');

      log.debug('handleDrop', sourcePadId, targetId);

      if (sourcePadId) {
        if (targetId === 'bin') {
          await clearPad(sourcePadId);
          return;
        }

        if (sourcePadId !== targetId) {
          await copyPadToPad({ sourcePadId, targetPadId: targetId });
        }
        return;
      }

      // Handle file drop (existing code)
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          log.warn('Invalid file type. Please use PNG, JPEG, or MP4 files.');
          return;
        }
        await addFileToPad({ file, padId: targetId });
        log.info(`Processed file ${file.name} for pad ${targetId}`);
      }
    },
    [addFileToPad, clearPad, copyPadToPad]
  );

  return (
    <PadDnDContext.Provider
      value={{
        ACCEPTED_FILE_TYPES,
        isDragging: draggingPadId !== null,
        draggingPadId,
        setDraggingPadId,
        dragOverId,
        setDragOverId,
        onDragStart,
        onDragLeave,
        onDragOver,
        onDragEnd,
        onDrop
      }}
    >
      {children}
    </PadDnDContext.Provider>
  );
};

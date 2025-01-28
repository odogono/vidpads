'use client';

import { ReactNode, useCallback, useState } from 'react';

import { useEvents } from '@helpers/events';
import { useKeyboard } from '@helpers/keyboard/useKeyboard';
import { createLog } from '@helpers/log';
import { usePadOperations } from '@model/hooks/usePadOperations';
import { GeneralDragEvent } from '@types';
import {
  MIME_TYPE_DROP_EFFECT,
  MIME_TYPE_ID,
  MIME_TYPE_PAD,
  MIME_TYPE_SEQ_EVENT
} from './constants';
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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const {
    store,
    addFileToPad,
    clearPad,
    copyPadToPad,
    cutPadToClipboard,
    copyPadToClipboard
  } = usePadOperations();

  const { isMetaKeyDown } = useKeyboard();

  const onDragStart = useCallback(
    (e: GeneralDragEvent, id: string, mimeType?: string) => {
      if (mimeType) {
        e.dataTransfer?.clearData();
        e.dataTransfer?.setData(mimeType, id);
        e.dataTransfer?.setData(MIME_TYPE_ID, id);
      }
      e.dataTransfer!.dropEffect = isMetaKeyDown() ? 'copy' : 'move';
      e.dataTransfer!.setData(
        MIME_TYPE_DROP_EFFECT,
        e.dataTransfer!.dropEffect
      );
      log.debug('onDragStart', id, mimeType, e.dataTransfer?.dropEffect);

      setDraggingId(id);
    },
    [isMetaKeyDown]
  );

  const onDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const onDragOver = useCallback(
    (e: GeneralDragEvent, id: string) => {
      e.preventDefault();
      setDragOverId(id);

      const isBin =
        id === 'bin' || id === 'cut' || id === 'copy' || id === 'delete';

      // Check if this is a pad being dragged
      const isPadDrag = e.dataTransfer?.types.includes(MIME_TYPE_PAD);

      if (isPadDrag) {
        // Only show drop indicator if dragging onto a different pad
        if (draggingId !== id) {
          setDragOverId(id);
        }
        return;
      }

      // Handle file drag (existing code)
      if (!isBin) {
        const types = Array.from(e.dataTransfer?.items ?? []).map(
          (item) => item.type
        );
        if (types.some((type) => ACCEPTED_FILE_TYPES.includes(type))) {
          setDragOverId(id);
        }
      }

      // log.debug('handleDragOver', id);
    },
    [draggingId]
  );

  const onDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const onDrop = useCallback(
    async (e: GeneralDragEvent, targetId: string) => {
      e.preventDefault();
      setDragOverId(null);
      setDraggingId(null);

      // Check if this is a pad being dropped
      const sourceId = e.dataTransfer?.getData(MIME_TYPE_ID);
      const sourcePadId = e.dataTransfer?.getData(MIME_TYPE_PAD);
      const sourceEventData = e.dataTransfer?.getData(MIME_TYPE_SEQ_EVENT);

      log.debug('handleDrop', sourceId, targetId, e.dataTransfer?.dropEffect);

      if (targetId === 'delete') {
        if (sourcePadId) {
          await clearPad({ sourcePadId, showToast: true });
        }
        if (sourceEventData) {
          // todo tidy this up
          log.debug('delete event', sourceEventData);
          const event = JSON.parse(sourceEventData);
          store.send({
            ...event,
            type: 'removeSequencerEvent'
          });
        }
        return;
      }
      if (sourcePadId) {
        if (targetId === 'cut') {
          await cutPadToClipboard({ sourcePadId, showToast: true });
          return;
        }

        if (targetId === 'copy') {
          await copyPadToClipboard({ sourcePadId, showToast: true });
          return;
        }

        if (sourcePadId !== targetId) {
          await copyPadToPad({ sourcePadId, targetPadId: targetId });
          return;
        }
      }

      // Handle file drop (existing code)
      const files = Array.from(e.dataTransfer?.files ?? []);
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
    [
      clearPad,
      store,
      cutPadToClipboard,
      copyPadToClipboard,
      copyPadToPad,
      addFileToPad
    ]
  );

  return (
    <PadDnDContext.Provider
      value={{
        ACCEPTED_FILE_TYPES,
        isDragging: draggingId !== null,
        draggingId,
        setDraggingId,
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

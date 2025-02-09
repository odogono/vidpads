'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import { useKeyboard } from '@helpers/keyboard/useKeyboard';
import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { DragGhost } from '@hooks/usePadDnD/DragGhost';
import { PadDnDContext, RegisterDropTargetProps } from './context';

const log = createLog('PadDnDProvider');

export const PadDnDProvider = ({ children }: { children: ReactNode }) => {
  const events = useEvents();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingMimeType, setDraggingMimeType] = useState<string | null>(null);
  const [draggingElement, setDraggingElement] = useState<HTMLElement | null>(
    null
  );
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const dropTargets = useRef<Map<string, RegisterDropTargetProps>>(new Map());

  const { isMetaKeyDown } = useKeyboard();

  const registerDropTarget = useCallback((props: RegisterDropTargetProps) => {
    dropTargets.current.set(props.id, props);
  }, []);

  const unregisterDropTarget = useCallback((id: string) => {
    dropTargets.current.delete(id);
  }, []);

  const onDragStart = useCallback(
    (e: React.PointerEvent, id: string, mimeType: string) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);

      const pos = { x: e.clientX, y: e.clientY };

      log.debug('onDragStart', id, pos);

      setIsDragging(false);
      setDraggingId(id);
      setDraggingMimeType(mimeType);
      setDraggingElement(e.currentTarget as HTMLElement);
      setStartPosition(pos);
      setDragPosition(pos);
    },
    []
  );

  const triggerDragLeave = useCallback(
    (id: string) => {
      const target = dropTargets.current.get(id);
      if (target) {
        target.onLeave?.({
          sourceId: draggingId ?? 'file',
          targetId: id,
          mimeType: draggingMimeType ?? 'unknown',
          dropEffect: 'none'
        });
      }
    },
    [draggingId, draggingMimeType]
  );

  const onDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingId) return false;

      const pos = { x: e.clientX, y: e.clientY };
      if (!isDragging) {
        const dragThreshold = 30;

        const deltaX = pos.x - startPosition.x;
        const deltaY = pos.y - startPosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (!isDragging && distance > dragThreshold) {
          setIsDragging(true);
          setDragPosition(pos);
          return true;
        }
      } else {
        setDragPosition(pos);

        // Check for drop targets
        let foundTarget: string | null = null;
        dropTargets.current.forEach(({ element }, targetId) => {
          const rect = element.getBoundingClientRect();
          if (
            pos.x >= rect.left &&
            pos.x <= rect.right &&
            pos.y >= rect.top &&
            pos.y <= rect.bottom
          ) {
            foundTarget = targetId;
          }
        });

        // Update dragOverId if we found a target
        if (foundTarget !== dragOverId) {
          // the target changed
          const dropEffect = isMetaKeyDown() ? 'move' : 'copy';

          if (dragOverId && dragOverId !== draggingId) {
            triggerDragLeave(dragOverId);
          }

          if (foundTarget && foundTarget !== draggingId) {
            const target = dropTargets.current.get(foundTarget);
            if (target) {
              target.onOver?.({
                file: undefined,
                sourceId: draggingId ?? 'file',
                targetId: foundTarget,
                mimeType: draggingMimeType ?? 'unknown',
                dropEffect
              });
            }
          }

          setDragOverId(foundTarget);
        }

        return true;
      }
      return false;
    },
    [
      draggingId,
      isDragging,
      startPosition.x,
      startPosition.y,
      dragOverId,
      isMetaKeyDown,
      triggerDragLeave,
      draggingMimeType
    ]
  );

  const onDragEnd = useCallback(
    (e: React.PointerEvent) => {
      setDraggingId(null);
      setDragOverId(null);
      if (!isDragging) return;

      if (dragOverId && draggingId && draggingId !== dragOverId) {
        const target = dropTargets.current.get(dragOverId);
        const dropEffect = isMetaKeyDown() ? 'move' : 'copy';
        if (target) {
          target.onDrop?.({
            sourceId: draggingId,
            targetId: dragOverId,
            mimeType: draggingMimeType ?? 'unknown',
            dropEffect
          });
        }
      }
      e.currentTarget.releasePointerCapture(e.pointerId);

      // log.debug('onDragEnd', { draggingId, dragOverId });
    },
    [dragOverId, draggingId, draggingMimeType, isDragging, isMetaKeyDown]
  );

  const onNativeDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();

      const target = dropTargets.current.get(id);

      if (target) {
        const item = e.dataTransfer?.items[0];
        const file = e.dataTransfer?.files[0];
        const mimeType = item?.type ?? file?.type ?? 'unknown';
        const dropEffect = e.dataTransfer?.dropEffect ?? 'copy';

        const accepted = target.onOver?.({
          sourceId: draggingId ?? 'file',
          targetId: id,
          mimeType,
          dropEffect
        });

        setDragOverId(accepted || mimeType === 'unknown' ? id : null);
      }
    },
    [draggingId]
  );

  const onNativeDragLeave = useCallback(() => {
    log.debug('[onNativeDragLeave]', { dragOverId });
    if (dragOverId) {
      triggerDragLeave(dragOverId);
    }
    setDragOverId(null);
  }, [dragOverId, triggerDragLeave]);

  const onNativeDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();

      log.debug('[onNativeDrop]', { dragOverId });

      if (dragOverId) {
        const target = dropTargets.current.get(dragOverId);
        if (target) {
          const item = e.dataTransfer?.items[0];
          const file = e.dataTransfer?.files[0];
          const mimeType = item?.type ?? file?.type ?? 'unknown';

          log.debug('onNativeDrop', mimeType, e.dataTransfer);

          target.onDrop?.({
            sourceId: 'file',
            targetId: dragOverId,
            file,
            mimeType,
            dropEffect: e.dataTransfer?.dropEffect ?? 'copy'
          });
        }
      }

      setDragOverId(null);
      setDraggingId(null);
    },
    [dragOverId]
  );

  const handleCancel = useCallback(() => {
    if (dragOverId && dragOverId !== draggingId) {
      triggerDragLeave(dragOverId);
    }

    setDraggingId(null);
    setDragOverId(null);
    setIsDragging(false);
    setDraggingMimeType(null);
  }, [dragOverId, draggingId, triggerDragLeave]);

  useEffect(() => {
    events.on('cmd:cancel', handleCancel);
    return () => {
      events.off('cmd:cancel', handleCancel);
    };
  }, [handleCancel, events]);

  return (
    <PadDnDContext.Provider
      value={{
        isDragging: isDragging && !!draggingId,
        draggingId,
        setDraggingId,
        setDragOverId,
        onDragStart,
        onNativeDrop,
        onNativeDragLeave,
        onNativeDragOver,
        onDragEnd,
        onDragMove,
        dragPosition,
        registerDropTarget,
        unregisterDropTarget
      }}
    >
      {children}
      {isDragging &&
        draggingId &&
        createPortal(
          <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
            <DragGhost
              id={draggingId}
              position={dragPosition}
              element={draggingElement}
            />
          </div>,
          document.body
        )}
    </PadDnDContext.Provider>
  );
};

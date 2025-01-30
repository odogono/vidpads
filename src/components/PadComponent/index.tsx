/* eslint-disable @next/next/no-img-element */
'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent
} from 'react';

import { VolumeOff } from 'lucide-react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { usePadThumbnail } from '@model/hooks/usePadThumbnail';
import { useSelectedPadId } from '@model/store/selectors';
import type { Pad } from '@model/types';
import { GeneralDragEvent, isMouseEvent, type GeneralTouchEvent } from '@types';
import { MIME_TYPE_PAD } from '../../hooks/usePadDnD/constants';
import { getPadSourceUrl } from '../../model/pad';
import { useGhostDrag } from './ghost';
import { useNullImage } from './useNullImage';
import { usePlayerEvents } from './usePlayerEvents';

export interface PadComponentProps {
  isPlayEnabled: boolean;
  isSelectSourceEnabled: boolean;
  pad: Pad;
  onEmptyPadTouch: (padId: string) => void;
}

const log = createLog('PadComponent');

export const PadComponent = ({
  isPlayEnabled,
  isSelectSourceEnabled,
  pad,
  onEmptyPadTouch
}: PadComponentProps) => {
  const events = useEvents();
  const elementRef = useRef<HTMLDivElement>(null);
  const { thumbnail } = usePadThumbnail(pad);
  const dragImage = useNullImage();
  const { createGhost, removeGhost, updateGhost } = useGhostDrag();
  const {
    isDragging,
    setDraggingId,
    dragOverId,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDragEnd,
    onDrop
  } = usePadDnD(`pad-${pad.id}`);
  const isDraggingOver = dragOverId === pad.id;
  const { selectedPadId, setSelectedPadId } = useSelectedPadId();

  const { isPlayerReady, isPlayerPlaying } = usePlayerEvents(pad);

  useEffect(() => {
    if (!isDragging) {
      removeGhost();
    }
  }, [isDragging, removeGhost]);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (isPlayerReady && isPlayEnabled) {
        events.emit('pad:touchdown', { padId: pad.id });
      }
      setSelectedPadId(pad.id);
    },
    [events, pad, setSelectedPadId, isPlayerReady, isPlayEnabled]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement> | PointerEvent) => {
      // e.preventDefault();
      // e.stopPropagation();

      const { clientX, clientY } = e;
      requestAnimationFrame(() => {
        updateGhost(clientX, clientY);
      });
    },
    [updateGhost]
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement> | PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isDragging) {
        if (!thumbnail && isSelectSourceEnabled) {
          onEmptyPadTouch(pad.id);
        } else {
          if (isPlayerReady && isPlayEnabled) {
            events.emit('pad:touchup', { padId: pad.id });
          }
        }
      } else {
        removeGhost();
        setDraggingId(null);
      }
    },
    [
      isDragging,
      thumbnail,
      onEmptyPadTouch,
      pad.id,
      events,
      removeGhost,
      setDraggingId,
      isPlayerReady,
      isPlayEnabled,
      isSelectSourceEnabled
    ]
  );

  const handleDragStart = useCallback(
    (e: GeneralDragEvent) => {
      onDragStart(e, pad.id, MIME_TYPE_PAD);

      // Use the empty canvas as the drag image
      if (dragImage) {
        e.dataTransfer?.setDragImage(dragImage, 0, 0);
      }
      createGhost(e, elementRef.current!);

      events.emit('video:stop', {
        url: getPadSourceUrl(pad) ?? '',
        padId: pad.id,
        time: 0
      });
    },
    [dragImage, createGhost, onDragStart, events, pad]
  );

  const handleDrop = useCallback(
    (e: GeneralDragEvent) => {
      onDrop(e, pad.id);
    },
    [pad.id, onDrop]
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      const { clientX, clientY } = e;

      requestAnimationFrame(() => {
        updateGhost(clientX, clientY);
      });
    },
    [updateGhost]
  );

  // Add onDragEnd handler to clean up
  const handleDragEnd = useCallback(() => {
    // log.debug('handleDragEnd', isDragging);
    // Ensure we clean up even if the component is about to unmount
    requestAnimationFrame(() => {
      removeGhost();
      onDragEnd(pad.id);
    });
  }, [removeGhost, onDragEnd, pad.id]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('dragover', handleDragOver, { passive: true });
    }

    return () => {
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('dragover', handleDragOver);
    };
  }, [isDragging, handlePointerUp, handlePointerMove, handleDragOver]);

  const dragProps = {
    // Native drag and drop handlers
    draggable: !!thumbnail,
    onDragStart: thumbnail ? handleDragStart : undefined,
    onDragEnd: thumbnail ? handleDragEnd : undefined,
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => onDragOver(e, pad.id),
    onDragLeave: () => onDragLeave(pad.id),
    onDrop: handleDrop
  };

  const isReady = !!thumbnail ? isPlayerReady : true;

  return (
    <div
      ref={elementRef}
      key={pad.id}
      className={`
          w-full h-full rounded-lg cursor-pointer transition-all relative select-none touch-none
          ${isDraggingOver ? 'bg-gray-600 scale-105' : 'bg-gray-800 hover:bg-gray-700'}
          ${selectedPadId === pad.id ? 'border-2 border-blue-500' : ''}
          ${isReady ? 'opacity-100' : 'opacity-20'}
        `}
      style={{ touchAction: 'none', WebkitTouchCallout: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      {...dragProps}
    >
      {thumbnail && (
        <div className='w-full h-full absolute inset-0 rounded-lg'>
          <img
            src={thumbnail}
            alt={`Thumbnail for pad ${pad.id}`}
            className='object-cover w-full h-full rounded-lg'
          />
        </div>
      )}
      <span
        className={`
          absolute inset-0 rounded-lg bg-white transition-opacity duration-200
          ${isPlayerPlaying ? 'animate-opacity-pulse' : 'opacity-0'}
        `}
      ></span>
      {pad.label && (
        <span className='absolute bottom-2 left-1/2 -translate-x-1/2 rounded-lg text-xs bg-white/40 p-2 text-gray-50 select-none whitespace-nowrap text-ellipsis overflow-hidden max-w-[90%] text-center'>
          {pad.label}
        </span>
      )}
      <span className='absolute bottom-2 left-2 text-xs text-gray-400 select-none'>
        {!isPlayEnabled && <VolumeOff size={12} />}
      </span>
      <span className='absolute bottom-2 right-2 text-xs text-gray-400 select-none'>
        {pad.id}
      </span>
    </div>
  );
};

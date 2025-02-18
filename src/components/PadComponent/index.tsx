/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { HeartCrack, Music2, VolumeOff } from 'lucide-react';

import { ACCEPTED_FILE_TYPES } from '@constants';
import { createLog } from '@helpers/log';
import { cn } from '@helpers/tailwind';
import { useEvents } from '@hooks/events';
import { MIME_TYPE_PAD } from '@hooks/usePadDnD/constants';
import { OnDropProps } from '@hooks/usePadDnD/context';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { usePadOperations } from '@model/hooks/usePadOperations';
import { usePadThumbnail } from '@model/hooks/usePadThumbnail';
import { getPadLabel, getPadSourceUrl } from '@model/pad';
import { useSelectedPadId } from '@model/store/selectors';
import type { Pad } from '@model/types';
import { useTooltip } from '../Tooltip/useTooltip';
import { usePlayerEvents } from './usePlayerEvents';

export interface PadComponentProps {
  isPlayEnabled: boolean;
  isSelectSourceEnabled: boolean;
  isMidiMappingModeEnabled: boolean;
  midiNote?: string;
  pad: Pad;
  onEmptyPadTouch: (padId: string) => void;
  onRemoveMidiMapping?: (padId: string) => void;
}

const log = createLog('PadComponent', ['debug']);

export const PadComponent = ({
  isPlayEnabled,
  isSelectSourceEnabled,
  pad,
  onEmptyPadTouch,
  isMidiMappingModeEnabled,
  midiNote,
  onRemoveMidiMapping
}: PadComponentProps) => {
  const events = useEvents();
  const elementRef = useRef<HTMLDivElement>(null);
  const { thumbnail } = usePadThumbnail(pad);
  const [isDragOver, setIsDragOver] = useState(false);
  const { selectedPadId } = useSelectedPadId();
  const {
    onDragStart,
    onDragMove,
    onNativeDragLeave,
    onNativeDragOver,
    onDragEnd,
    onNativeDrop,
    registerDropTarget,
    unregisterDropTarget
  } = usePadDnD();

  const {
    projectId,
    addFileToPad,

    copyPadToPad,
    movePadToPad
  } = usePadOperations();

  const { setToolTip, hideToolTip } = useTooltip();

  isPlayEnabled = isPlayEnabled && !isMidiMappingModeEnabled;

  const { isPlayerReady, isPlayerPlaying, isPlayerError, playerError } =
    usePlayerEvents(pad);

  const padLabel = getPadLabel(pad);

  const hasSource = !!getPadSourceUrl(pad);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      log.debug('[handlePointerDown]', {
        isPlayerReady,
        isPlayerError,
        isMidiMappingModeEnabled
      });
      if (
        isPlayerReady ||
        isPlayerError ||
        isMidiMappingModeEnabled ||
        !isSelectSourceEnabled
      ) {
        events.emit('pad:touchdown', { padId: pad.id, source: 'pad' });
      }
      // setSelectedPadId(pad.id);

      if (!isMidiMappingModeEnabled && hasSource) {
        onDragStart(e, pad.id, MIME_TYPE_PAD);
      }
    },
    [
      isPlayerReady,
      isPlayerError,
      isMidiMappingModeEnabled,
      isSelectSourceEnabled,
      hasSource,
      events,
      pad.id,
      onDragStart
    ]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const isDragging = onDragMove(e, pad.id, MIME_TYPE_PAD);

      if (isDragging && isPlayerPlaying) {
        events.emit('video:stop', {
          url: getPadSourceUrl(pad) ?? '',
          padId: pad.id,
          time: 0,
          requestId: pad.id
        });
      }
    },
    [events, isPlayerPlaying, onDragMove, pad]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      onDragEnd(e, pad.id);

      log.debug('[handlePointerUp]', {
        isSelectSourceEnabled,
        hasSource,
        isPlayerError
      });
      if (
        (!hasSource || isPlayerError) &&
        isSelectSourceEnabled &&
        !isMidiMappingModeEnabled
      ) {
        onEmptyPadTouch(pad.id);
      } else {
        if (isPlayerReady || isMidiMappingModeEnabled) {
          events.emit('pad:touchup', { padId: pad.id, source: 'pad' });
        }
      }
    },
    [
      onDragEnd,
      pad.id,
      hasSource,
      isPlayerError,
      isSelectSourceEnabled,
      isMidiMappingModeEnabled,
      onEmptyPadTouch,
      isPlayerReady,
      events
    ]
  );

  const handlePointerOver = useCallback(
    (e: React.PointerEvent) => {
      if (playerError) {
        const padEl = window.document.getElementById(`pad-${pad.id}`);
        e.preventDefault();
        e.stopPropagation();
        const rect = padEl?.getBoundingClientRect();
        if (rect) {
          setToolTip(playerError, [rect.left + rect.width / 2, rect.top]);
        }
      }
    },
    [playerError, setToolTip, pad.id]
  );

  const handlePointerOut = useCallback(() => {
    if (playerError) {
      hideToolTip();
    }
  }, [playerError, hideToolTip]);

  const handleOver = useCallback(({ targetId, mimeType }: OnDropProps) => {
    log.debug('handleOver', { targetId, mimeType });

    if (mimeType !== MIME_TYPE_PAD && !ACCEPTED_FILE_TYPES.includes(mimeType)) {
      log.debug('handleOver', targetId, mimeType, 'rejected');
      setIsDragOver(false);
      return false;
    }

    setIsDragOver(true);
    return true;
  }, []);

  const handleLeave = useCallback(
    ({ file, sourceId, targetId }: OnDropProps) => {
      log.debug('handleLeave', { file, sourceId, targetId });

      setIsDragOver(false);

      return false;
    },
    []
  );
  const handleDrop = useCallback(
    async ({ file, sourceId, targetId, mimeType, dropEffect }: OnDropProps) => {
      log.debug('handleDrop', {
        file,
        sourceId,
        targetId,
        mimeType,
        dropEffect
      });

      setIsDragOver(false);
      if (
        mimeType !== MIME_TYPE_PAD &&
        !ACCEPTED_FILE_TYPES.includes(mimeType)
      ) {
        return false;
      }

      if (mimeType === MIME_TYPE_PAD) {
        if (dropEffect === 'move') {
          await movePadToPad({ sourcePadId: sourceId, targetPadId: targetId });
        } else {
          await copyPadToPad({ sourcePadId: sourceId, targetPadId: targetId });
        }

        return true;
      }

      // file drop
      if (file) {
        await addFileToPad({ file, padId: targetId, projectId });
      }

      return false;
    },
    [addFileToPad, copyPadToPad, movePadToPad, projectId]
  );

  useEffect(() => {
    if (elementRef.current) {
      registerDropTarget({
        id: pad.id,
        mimeType: MIME_TYPE_PAD,
        element: elementRef.current,
        onOver: handleOver,
        onDrop: handleDrop,
        onLeave: handleLeave
      });
      return () => unregisterDropTarget(pad.id);
    }
  }, [
    pad.id,
    registerDropTarget,
    unregisterDropTarget,
    handleDrop,
    handleOver,
    handleLeave
  ]);

  // if (pad.id === 'a16')
  //   log.debug('render', {
  //     isPlayEnabled,
  //     isSelectSourceEnabled,
  //     isPlayerReady
  //   });

  const isReady = hasSource && !isPlayerError ? isPlayerReady : true;
  const isSelected = selectedPadId === pad.id;

  return (
    <div
      id={`pad-${pad.id}`}
      ref={elementRef}
      className={cn(
        `
          w-full min-h-[44px] h-full 
          rounded-lg 
          cursor-pointer 
          bg-pad 
          transition-all 
          relative 
          select-none touch-none`,
        {
          'opacity-100': isReady,
          'opacity-20': !isReady,
          'bg-pad-over scale-105': isDragOver,
          'hover:bg-pad-over': !isDragOver,
          'border-2 border-selected': isSelected && !isPlayerError,
          'border-2 border-selected-error': isSelected && isPlayerError
        }
      )}
      style={{
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        // Add these properties to prevent magnifying glass
        WebkitTapHighlightColor: 'transparent',
        // Prevent text selection and callouts
        userSelect: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      // Also add this attribute to prevent text selection
      suppressContentEditableWarning={true}
      onDragOver={(e) => onNativeDragOver(e, pad.id)}
      onDragLeave={() => onNativeDragLeave(pad.id)}
      onDrop={(e) => onNativeDrop(e, pad.id)}
    >
      {thumbnail && (
        <div className='w-full h-full absolute inset-0 rounded-lg'>
          <img
            src={thumbnail}
            alt={`Thumbnail for pad ${pad.id}`}
            title={playerError ? playerError : `Thumbnail for pad ${pad.id}`}
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
      {padLabel && (
        <span className='absolute bottom-2 left-1/2 -translate-x-1/2 rounded-lg text-xs font-semibold bg-black/50 p-2 text-gray-50 select-none whitespace-nowrap text-ellipsis overflow-hidden max-w-[90%] text-center'>
          {padLabel}
        </span>
      )}
      {playerError && (
        <span className='absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-[3vh] m-2 text-xs text-c6 select-none bg-red-500/80 p-2 rounded-lg pointer-events-none'>
          <HeartCrack size={'4vh'} />
        </span>
      )}
      <span className='absolute bottom-2 left-2 text-xs text-gray-300 select-none pointer-events-none'>
        {!isPlayEnabled && <VolumeOff size={12} />}
      </span>
      {isMidiMappingModeEnabled && (
        <button
          onClick={() => {
            onRemoveMidiMapping?.(pad.id);
          }}
          className='absolute top-2 right-2 text-xs text-gray-300 select-none flex flex-row hover:text-gray-50'
        >
          <Music2 size={12} />
          {midiNote}
        </button>
      )}
      <span className='absolute bottom-2 right-2 text-xs text-gray-300 select-none'>
        {pad.id}
      </span>
    </div>
  );
};

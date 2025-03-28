import { useCallback, useEffect, useRef, useState } from 'react';

import { ClipboardCopy, ClipboardX } from 'lucide-react';

import { createLog } from '@helpers/log';
import { TrashIcon } from '@heroicons/react/24/outline';
import { MIME_TYPE_BIN, MIME_TYPE_PAD } from '@hooks/usePadDnD/constants';
import { OnDropProps } from '@hooks/usePadDnD/context';
import { usePadDnD } from '@hooks/usePadDnD/usePadDnD';
import { usePadOperations } from '@model/hooks/usePadOperations';
import { OpModalContainer } from './common/OpModalContainer';

const log = createLog('Bin', ['debug']);

export const BinComponent = () => {
  const cutRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLDivElement>(null);
  const { isDragging, registerDropTarget, unregisterDropTarget } = usePadDnD();

  const { clearPad, cutPadToClipboard, copyPadToClipboard } =
    usePadOperations();

  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleOver = useCallback(({ targetId, mimeType }: OnDropProps) => {
    if (mimeType !== MIME_TYPE_PAD) {
      setDragOverId(null);
      return false;
    }

    setDragOverId(targetId);

    return true;
  }, []);

  const handleLeave = useCallback((props: OnDropProps) => {
    log.debug('handleLeave', props);

    setDragOverId(null);

    return false;
  }, []);

  const handleDrop = useCallback(
    async ({ sourceId, targetId, mimeType }: OnDropProps) => {
      setDragOverId(null);

      if (mimeType !== MIME_TYPE_PAD) {
        return false;
      }

      switch (targetId) {
        case 'delete':
          await clearPad({ sourcePadId: sourceId, showToast: true });
          break;
        case 'cut':
          await cutPadToClipboard({ sourcePadId: sourceId, showToast: true });
          break;
        case 'copy':
          await copyPadToClipboard({ sourcePadId: sourceId, showToast: true });
          break;
        default:
          break;
      }

      return true;
    },
    [clearPad, copyPadToClipboard, cutPadToClipboard]
  );

  useEffect(() => {
    if (deleteRef.current) {
      registerDropTarget({
        id: 'delete',
        element: deleteRef.current,
        mimeType: MIME_TYPE_BIN,
        onOver: handleOver,
        onDrop: handleDrop,
        onLeave: handleLeave
      });
    }
    if (cutRef.current) {
      registerDropTarget({
        id: 'cut',
        element: cutRef.current,
        mimeType: MIME_TYPE_BIN,
        onOver: handleOver,
        onDrop: handleDrop,
        onLeave: handleLeave
      });
    }
    if (copyRef.current) {
      registerDropTarget({
        id: 'copy',
        element: copyRef.current,
        mimeType: MIME_TYPE_BIN,
        onOver: handleOver,
        onDrop: handleDrop,
        onLeave: handleLeave
      });
    }
    return () => {
      unregisterDropTarget('delete');
      unregisterDropTarget('cut');
      unregisterDropTarget('copy');
    };
  }, [
    registerDropTarget,
    unregisterDropTarget,
    handleDrop,
    handleLeave,
    handleOver
  ]);

  return (
    <OpModalContainer
      isVisible={isDragging}
      isHighlighted={dragOverId !== null}
      height='20vh'
    >
      <div
        ref={cutRef}
        className='w-full h-full flex items-center justify-center'
      >
        <ClipboardX
          className={`
          w-[7vw] h-[7vh] transition-all duration-300
          ${dragOverId === 'cut' ? 'text-primary-100 scale-150' : 'text-primary-300'}
        `}
        />
      </div>
      <div
        ref={copyRef}
        className=' w-full h-full flex items-center justify-center'
      >
        <ClipboardCopy
          className={`
          w-[7vw] h-[7vh] transition-all duration-300
          ${dragOverId === 'copy' ? 'text-primary-100 scale-150' : 'text-primary-300'}
        `}
        />
      </div>

      <div
        ref={deleteRef}
        className=' w-full h-full flex items-center justify-center'
      >
        <TrashIcon
          className={`
          w-[7vw] h-[7vh] transition-all duration-300
          ${dragOverId === 'delete' ? 'text-warning-100 scale-150' : 'text-warning-300'}
        `}
        />
      </div>
    </OpModalContainer>
  );
};

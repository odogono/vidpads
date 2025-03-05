import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';

import { Check, Eye, Play } from 'lucide-react';

import {
  DataSetPlayerData,
  getAllPlayerDataState
} from '@components/Player/helpers';
// import { createLog } from '@helpers/log';
import { runAfter } from '@helpers/time';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { useEvents } from '@hooks/events';
import { CommonModalProps } from './CommonModal';
import { useModalState } from './useModalState';

// const log = createLog('PlayerDebugModal', ['debug']);

export const PlayerDebugModal = ({
  ref,
  onOpen: onOpenProp
}: CommonModalProps) => {
  const events = useEvents();
  const {
    isOpen,
    onOpen,
    onClose: onCloseModal
  } = useModalState({
    disableKeyboard: false
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const [playerDataStates, setPlayerDataStates] = useState<DataSetPlayerData[]>(
    []
  );

  useImperativeHandle(ref, () => ({
    open: (props: unknown) => {
      if (onOpenProp) {
        onOpenProp(props);
      }
      onOpen();
    },
    close: () => {
      onCloseModal();
    },
    ok: () => {
      // handleOk();
    },
    cancel: () => {}
  }));

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('.modal-header')
      ) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        });
      }
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const refreshPlayerDataState = useCallback(() => {
    // log.debug('player event');
    const states = getAllPlayerDataState();

    setPlayerDataStates(states.filter(({ id }) => id !== 'title'));

    runAfter(500, () => {
      if (animationRef.current !== null) {
        animationRef.current = requestAnimationFrame(refreshPlayerDataState);
      }
    });
  }, []);

  const startTracking = useCallback(() => {
    if (animationRef.current !== null) {
      return;
    }
    animationRef.current = requestAnimationFrame(refreshPlayerDataState);
  }, [refreshPlayerDataState]);

  const stopTracking = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // A hack to disable the modal background to allow interaction
  // with other components
  useEffect(() => {
    if (!isOpen) {
      stopTracking();
      return;
    }
    const modalEl = modalRef.current;
    if (!modalEl) return;

    modalEl.style.pointerEvents = 'auto';

    if (modalEl.parentElement) {
      modalEl.parentElement.style.pointerEvents = 'none';
    }
    startTracking();
  }, [isOpen, startTracking, stopTracking]);

  useEffect(() => {
    const unmount = () => {
      events.off('player:playing', refreshPlayerDataState);
      events.off('player:stopped', refreshPlayerDataState);
      events.off('video:seek', refreshPlayerDataState);
      events.off('player:ready', refreshPlayerDataState);
      events.off('player:not-ready', refreshPlayerDataState);
      events.off('player:update', refreshPlayerDataState);
      events.off('player:seeked', refreshPlayerDataState);
    };

    if (isOpen) {
      events.on('player:playing', refreshPlayerDataState);
      events.on('player:stopped', refreshPlayerDataState);
      events.on('video:seek', refreshPlayerDataState);
      events.on('player:ready', refreshPlayerDataState);
      events.on('player:not-ready', refreshPlayerDataState);
      events.on('player:update', refreshPlayerDataState);
      events.on('player:seeked', refreshPlayerDataState);
    } else {
      unmount();
    }

    return unmount;
  }, [isOpen, refreshPlayerDataState, events]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleToggle = useCallback(() => {
    // setIsOpen((prev) => !prev);
  }, []);

  // const { playing, stopped } = useMemo(() => {
  //   if (!isOpen) return { playing: [], stopped: [] };
  //   const states = getAllPlayerDataState();
  //   const playing = states.filter(
  //     ({ id, isPlaying }) => isPlaying && id !== 'title'
  //   );
  //   const stopped = states.filter(
  //     ({ id, isPlaying }) => !isPlaying && id !== 'title'
  //   );

  //   return { playing, stopped };
  // }, []);

  return (
    <>
      <Button
        color='secondary'
        variant='flat'
        onPress={handleToggle}
        className='fixed bottom-4 right-4 z-50'
      >
        {isOpen ? 'Hide Debug' : 'Show Debug'}
      </Button>

      <Modal
        ref={modalRef}
        isOpen={isOpen}
        onClose={onCloseModal}
        backdrop='transparent'
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        size='2xl'
        className='vo-theme bg-black/70 text-foreground'
        style={{
          position: 'fixed',
          top: position.y,
          left: position.x,
          transform: 'none'
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader
                className='modal-header cursor-move'
                onMouseDown={handleMouseDown}
              >
                <span className='pointer-events-none'>Player Stack</span>
              </ModalHeader>
              <ModalBody>
                <div className='overflow-auto'>
                  <table className='w-full text-white text-xs'>
                    <thead>
                      <tr className='border-b border-white/20'>
                        <th className='px-4 py-2 text-center'>Pad</th>
                        <th className='px-4 py-2 text-center'>Choke</th>
                        <th className='px-4 py-2 text-center'>Priority</th>
                        {/* <th className='px-4 py-2 text-left'>Started</th>
                        <th className='px-4 py-2 text-left'>Stopped</th> */}
                        <th className='px-4 py-2 text-center'>OneShot</th>
                        <th className='px-4 py-2 text-center'>Loop</th>
                        <th className='px-4 py-2 text-center'>Resume</th>
                        <th className='px-4 py-2 text-center'>Visible</th>
                        <th className='px-4 py-2 text-center'>Playing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerDataStates.map((player) => (
                        <tr
                          key={player.id}
                          className='border-b border-white/10'
                        >
                          <td className='px-4 py-2 text-center'>{player.id}</td>

                          <td className='px-4 py-2 text-center'>
                            {player.chokeGroup ?? '-'}
                          </td>
                          <td className='px-4 py-2 text-center'>
                            {player.playPriority ?? '-'}
                          </td>
                          {/* <td className='px-4 py-2'>
                            {player.startedAt
                              ? (player.startedAt / 1000).toFixed(2)
                              : '-'}
                          </td>
                          <td className='px-4 py-2'>
                            {player.stoppedAt
                              ? (player.stoppedAt / 1000).toFixed(2)
                              : '-'}
                          </td> */}
                          <td className='px-4 py-2'>
                            <div className='flex justify-center'>
                              {player.isOneShot ? <Check size={16} /> : ''}
                            </div>
                          </td>
                          <td className='px-4 py-2'>
                            <div className='flex justify-center'>
                              {player.isLoop ? <Check size={16} /> : ''}
                            </div>
                          </td>
                          <td className='px-4 py-2'>
                            <div className='flex justify-center'>
                              {player.isResume ? <Check size={16} /> : ''}
                            </div>
                          </td>
                          <td className='px-4 py-2'>
                            <div className='flex justify-center'>
                              {player.isVisible ? <Eye size={16} /> : ''}
                            </div>
                          </td>
                          <td className='px-4 py-2'>
                            <div className='flex justify-center'>
                              {player.isPlaying ? <Play size={16} /> : ''}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='default' onPress={onCloseModal}>
                  Ok
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

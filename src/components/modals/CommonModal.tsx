'use client';

import { useCallback, useImperativeHandle } from 'react';

import { createLog } from '@helpers/log';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@nextui-org/react';
import { useModalState } from './useModalState';

const log = createLog('CommonModal', ['debug']);

export interface CommonModalRef {
  onOpen: (props: unknown) => void;
  onClose: () => void;
}

export interface CommonModalBase {
  ref: React.RefObject<CommonModalRef | null>;
}

export type OnOpenProps = (props: unknown) => void;

export interface CommonModalProps extends CommonModalBase {
  title: string;
  children: React.ReactNode;
  onOpen?: OnOpenProps;
  onOk?: () => Promise<boolean>;
}

export const CommonModal = ({
  title,
  ref,
  children,
  onOpen: onOpenProp,
  onOk
}: CommonModalProps) => {
  const { isOpen, onOpen, onClose: onCloseModal } = useModalState();

  useImperativeHandle(ref, () => ({
    onOpen: (props: unknown) => {
      if (onOpenProp) {
        onOpenProp(props);
      }
      onOpen();
    },
    onClose: () => {
      onCloseModal();
    }
  }));

  const handleOk = useCallback(async () => {
    if (onOk && !(await onOk())) {
      log.debug('onOk returned false');
      return;
    }

    log.debug('onOk returned true');
    onCloseModal();
  }, [onOk, onCloseModal]);

  const handleCancel = useCallback(() => {
    onCloseModal();
  }, [onCloseModal]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCloseModal}
      backdrop='blur'
      className='bg-background text-foreground'
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className='flex flex-col gap-1'>{title}</ModalHeader>
            <ModalBody>{children}</ModalBody>
            <ModalFooter>
              <Button
                variant='ghost'
                onPress={handleCancel}
                className='bg-stone-600 hover:bg-stone-700 text-foreground'
              >
                Cancel
              </Button>
              <Button
                onPress={handleOk}
                className='hover:bg-sky-600 bg-sky-500 text-foreground'
              >
                Ok
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

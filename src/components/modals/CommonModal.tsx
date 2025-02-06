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
} from "@heroui/react";
import { useModalState } from './useModalState';

const log = createLog('CommonModal', ['debug']);

export interface CommonModalRef {
  open: (props?: unknown) => void;
  close: () => void;
}

export interface CommonModalBase {
  ref: React.RefObject<CommonModalRef | null>;
}

export type OnOpenProps = (props?: unknown) => void;

export interface CommonModalProps extends CommonModalBase {
  title: string;
  children: React.ReactNode;
  onOpen?: OnOpenProps;
  onOk?: () => Promise<boolean>;
  onClose?: () => void;
}

export const CommonModal = ({
  title,
  ref,
  children,
  onOpen: onOpenProp,
  onOk,
  onClose: onCloseProp
}: CommonModalProps) => {
  const { isOpen, onOpen, onClose: onCloseModal } = useModalState();

  const handleClose = useCallback(() => {
    onCloseProp?.();
    onCloseModal();
  }, [onCloseProp, onCloseModal]);

  useImperativeHandle(ref, () => ({
    open: (props: unknown) => {
      if (onOpenProp) {
        onOpenProp(props);
      }
      onOpen();
    },
    close: () => {
      handleClose();
    }
  }));

  const handleOk = useCallback(async () => {
    if (onOk && !(await onOk())) {
      log.debug('onOk returned false');
      return;
    }

    log.debug('onOk returned true');
    handleClose();
  }, [onOk, handleClose]);

  const handleCancel = useCallback(() => {
    handleClose();
  }, [handleClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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

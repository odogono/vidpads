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
} from '@heroui/react';
import { useModalState } from './useModalState';

const log = createLog('CommonModal', ['debug']);

export interface CommonModalRef {
  open: (props?: unknown) => void;
  close: () => void;
  ok: () => void;
  cancel: () => void;
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
  showCancel?: boolean;
  showOk?: boolean;
}

export const CommonModal = ({
  title,
  ref,
  children,
  onOpen: onOpenProp,
  onOk,
  onClose: onCloseProp,
  showCancel = true,
  showOk = true
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
    },
    ok: () => {
      handleOk();
    },
    cancel: () => {
      handleCancel();
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
      className='vo-theme bg-background text-foreground'
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className='flex flex-col gap-1'>{title}</ModalHeader>
            <ModalBody>{children}</ModalBody>
            <ModalFooter>
              {showCancel && (
                <Button color='secondary' onPress={handleCancel}>
                  Cancel
                </Button>
              )}
              {showOk && (
                <Button color='primary' onPress={handleOk}>
                  Ok
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

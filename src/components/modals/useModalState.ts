import { useCallback } from 'react';

import { useDisclosure } from '@heroui/react';
import { useKeyboard } from '@hooks/useKeyboard';

export const useModalState = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setIsEnabled } = useKeyboard();

  const handleOpen = useCallback(() => {
    setIsEnabled(false);
    onOpen();
  }, [setIsEnabled, onOpen]);

  const handleClose = useCallback(() => {
    setIsEnabled(true);
    onClose();
  }, [setIsEnabled, onClose]);

  return { isOpen, onOpen: handleOpen, onClose: handleClose };
};

import { useCallback } from 'react';

import { useDisclosure } from '@heroui/react';
import { useKeyboard } from '@hooks/useKeyboard';

interface UseModalStateProps {
  disableKeyboard?: boolean;
}

export const useModalState = ({
  disableKeyboard = true
}: UseModalStateProps = {}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setIsEnabled } = useKeyboard();

  const handleOpen = useCallback(() => {
    if (disableKeyboard) {
      setIsEnabled(false);
    }
    onOpen();
  }, [setIsEnabled, onOpen, disableKeyboard]);

  const handleClose = useCallback(() => {
    if (disableKeyboard) {
      setIsEnabled(true);
    }
    onClose();
  }, [setIsEnabled, onClose, disableKeyboard]);

  return { isOpen, onOpen: handleOpen, onClose: handleClose };
};

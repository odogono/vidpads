'use client';

import { useCallback } from 'react';

import { Share } from 'lucide-react';

import { writeToClipboard } from '@helpers/clipboard';
import { showError, showSuccess } from '@helpers/toast';
import { Button } from '@heroui/react';
import { useProjectUrl } from '@model/hooks/useProjectUrl';

export const ShareButton = () => {
  const url = useProjectUrl();

  const handleOnPress = useCallback(async () => {
    const success = await writeToClipboard(url);
    if (success) {
      showSuccess('Copied to clipboard');
    } else {
      showError('Failed to copy to clipboard');
    }
  }, [url]);

  return (
    <>
      <Button color='primary' onPress={handleOnPress} isIconOnly>
        <Share />
      </Button>
    </>
  );
};

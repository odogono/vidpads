'use client';

import { useCallback } from 'react';

import { Share } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { writeToClipboard } from '@helpers/clipboard';
import { Button } from '@heroui/react';
import { useProjectUrl } from '@model/hooks/useProjectUrl';

export const ShareButton = () => {
  const url = useProjectUrl();

  const handleOnPress = useCallback(async () => {
    const success = await writeToClipboard(url);
    if (success) {
      toast.success('Copied to clipboard');
    } else {
      toast.error('Failed to copy to clipboard');
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

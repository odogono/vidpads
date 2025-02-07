'use client';

import { useCallback } from 'react';

import { Share } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { writeToClipboard } from '@helpers/clipboard';
import { Button } from '@heroui/react';
import { useShareUrl } from '@hooks/useShareUrl';
import { useProjects } from '@model/hooks/useProjects';

export const ShareButton = () => {
  const { exportToURLString } = useProjects();
  const { createNewUrl } = useShareUrl();

  const handleOnPress = useCallback(async () => {
    const d = await exportToURLString(true);
    const url = createNewUrl({ d });
    await writeToClipboard(url);

    toast.success('Copied to clipboard');
  }, [exportToURLString, createNewUrl]);

  return (
    <>
      <Button color='primary' onPress={handleOnPress} isIconOnly>
        <Share />
      </Button>
    </>
  );
};

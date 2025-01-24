'use client';

import { useCallback } from 'react';

import { Share } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { writeToClipboard } from '@helpers/clipboard';
import { useShareUrl } from '@hooks/useWindowUrl';
import { useProjects } from '@model/hooks/useProjects';
import { Button } from '@nextui-org/react';

export const ShareButton = () => {
  const { exportToURLString } = useProjects();
  const { createNewUrl } = useShareUrl();

  const handleOnPress = useCallback(async () => {
    const url = createNewUrl({ d: exportToURLString() });
    await writeToClipboard(url);

    toast.success('Copied to clipboard');
  }, [exportToURLString, createNewUrl]);

  return (
    <>
      <Button
        onPress={handleOnPress}
        isIconOnly
        variant='flat'
        className=' bg-slate-700 hover:bg-slate-600'
      >
        <Share />
      </Button>
    </>
  );
};

import { useState } from 'react';

import { ClipboardCheck, ClipboardCopy } from 'lucide-react';

import { writeToClipboard } from '@helpers/clipboard';
import { createLog } from '@helpers/log';
import { runAfter } from '@helpers/time';
import { Button } from '@heroui/react';

export interface CopyButtonProps {
  text: string;
}

const log = createLog('CopyButton');

export const CopyButton = ({ text }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleOnPress = async () => {
    try {
      await writeToClipboard(text);
      setIsCopied(true);
      runAfter(2000, () => {
        setIsCopied(false);
      });
    } catch (error) {
      log.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <Button
      onPress={handleOnPress}
      variant='bordered'
      isIconOnly
      className=' text-foreground'
    >
      {isCopied ? <ClipboardCheck /> : <ClipboardCopy />}
    </Button>
  );
};

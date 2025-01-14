import { useState } from 'react';

import { ClipboardCheck, ClipboardCopy } from 'lucide-react';

import { copyToClipboard } from '@helpers/copyToClipboard';
import { createLog } from '@helpers/log';
import { Button } from '@nextui-org/react';

export interface CopyButtonProps {
  text: string;
}

const log = createLog('CopyButton');

export const CopyButton = ({ text }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleOnPress = async () => {
    try {
      await copyToClipboard(text);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
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

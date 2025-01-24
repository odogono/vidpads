'use client';

import { useCallback, useEffect } from 'react';

import {
  ClipboardCopy,
  ClipboardPaste,
  ClipboardX,
  Trash2
} from 'lucide-react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { usePad } from '@model/hooks/usePad';
import { Button, Input, cn } from '@nextui-org/react';
import { PaneProps } from './types';

const log = createLog('DetailsPane');

export const DetailsPane = ({ showDeleteModal }: PaneProps) => {
  const events = useEvents();
  const { selectedPadId, setPadPlayEnabled, setPadSelectSourceEnabled } =
    usePad();

  const handleCut = useCallback(() => events.emit('cmd:cut'), [events]);
  const handleCopy = useCallback(() => events.emit('cmd:copy'), [events]);
  const handlePaste = useCallback(() => events.emit('cmd:paste'), [events]);

  useEffect(() => {
    setPadPlayEnabled(false);
    setPadSelectSourceEnabled(false);
    return () => {
      setPadPlayEnabled(true);
      setPadSelectSourceEnabled(true);
    };
  }, [setPadPlayEnabled, setPadSelectSourceEnabled]);

  if (!selectedPadId) {
    return (
      <div className='w-full h-full bg-slate-500 rounded-lg flex gap-6 items-center justify-center'>
        <h3 className='font-semibold text-foreground/90'>No Pad Selected</h3>
      </div>
    );
  }

  return (
    <div className='w-full h-full bg-slate-500 rounded-lg flex gap-6 items-center justify-center'>
      <Input isClearable size='sm' label='Label' />

      <OpButton label='Cut' onPress={handleCut}>
        <ClipboardX />
      </OpButton>
      <OpButton label='Copy' onPress={handleCopy}>
        <ClipboardCopy />
      </OpButton>
      <OpButton label='Paste' onPress={handlePaste}>
        <ClipboardPaste />
      </OpButton>
      <OpButton label='Delete' onPress={showDeleteModal}>
        <Trash2 />
      </OpButton>
    </div>
  );
};

const OpButton = ({
  label,
  children,
  onPress
}: {
  label: string;
  children: React.ReactNode;
  onPress: () => void;
}) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <Button
        isIconOnly
        aria-label={label}
        onPress={onPress}
        className={cn(
          'min-w-[44px] min-h-[44px] aspect-square bg-slate-400 hover:bg-slate-300 text-black'
        )}
      >
        {children}
      </Button>
      <div
        className='text-xs text-foreground/90 mt-2'
        style={{
          fontSize: '0.6rem',
          lineHeight: '0.75rem'
        }}
      >
        {label}
      </div>
    </div>
  );
};

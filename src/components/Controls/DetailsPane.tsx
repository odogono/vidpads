'use client';

import { useCallback, useEffect } from 'react';

import {
  ClipboardCopy,
  ClipboardPaste,
  ClipboardX,
  Trash2
} from 'lucide-react';

import { OpButton } from '@components/buttons/OpButton';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { usePad } from '@model/hooks/usePad';
import { Input } from '@nextui-org/react';
import { PaneProps } from './types';

const log = createLog('DetailsPane');

export const DetailsPane = ({ showDeleteModal }: PaneProps) => {
  const events = useEvents();
  const { selectedPadId, setPadPlayEnabled, setPadSelectSourceEnabled } =
    usePad();
  const isEnabled = !!selectedPadId;

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

  return (
    <div className='w-full h-full bg-slate-500 rounded-lg flex gap-6 items-center justify-center'>
      <Input isClearable size='sm' label='Label' disabled={!isEnabled} />

      <OpButton label='Cut' onPress={handleCut} isEnabled={isEnabled}>
        <ClipboardX />
      </OpButton>
      <OpButton label='Copy' onPress={handleCopy} isEnabled={isEnabled}>
        <ClipboardCopy />
      </OpButton>
      <OpButton label='Paste' onPress={handlePaste} isEnabled={isEnabled}>
        <ClipboardPaste />
      </OpButton>
      <OpButton label='Delete' onPress={showDeleteModal} isEnabled={isEnabled}>
        <Trash2 />
      </OpButton>
    </div>
  );
};

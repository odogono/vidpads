'use client';

import { useCallback, useEffect } from 'react';

import {
  ClipboardCopy,
  ClipboardPaste,
  ClipboardX,
  Tag,
  Trash2
} from 'lucide-react';

import { OpButton } from '@components/buttons/OpButton';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { usePad } from '@model/hooks/usePad';
import { OpPadLabelButton } from '../buttons/OpPadLabelButton';
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

  const handleLabelChange = useCallback((label: string) => {
    log.debug('handleLabelChange', label);
    // if (selectedPadId) {
    //   events.emit('cmd:setPadLabel', { padId: selectedPadId, label });
    // }
  }, []);

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
      {/* <Input isClearable size='sm' label='Label' disabled={!isEnabled} /> */}

      <OpPadLabelButton isEnabled={isEnabled} onChange={handleLabelChange} />

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

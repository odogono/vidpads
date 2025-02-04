'use client';

import { useCallback, useEffect } from 'react';

import {
  ClipboardCopy,
  ClipboardPaste,
  ClipboardX,
  Trash2
} from 'lucide-react';

import { OpButton } from '@components/buttons/OpButton';
import { OpPadLabelButton } from '@components/buttons/OpPadLabelButton';
import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { usePad } from '@model/hooks/usePad';
import { PaneProps } from './types';

const log = createLog('DetailsPane', ['debug']);

export const DetailsPane = ({ showDeleteModal }: PaneProps) => {
  const events = useEvents();
  const {
    pad,
    isPadAssigned,
    selectedPadId,
    setPadPlayEnabled,
    setPadSelectSourceEnabled,
    padLabel,
    setPadLabel
  } = usePad();
  const isEnabled = !!selectedPadId && isPadAssigned;

  const handleCut = useCallback(() => events.emit('cmd:cut'), [events]);
  const handleCopy = useCallback(() => events.emit('cmd:copy'), [events]);
  const handlePaste = useCallback(() => events.emit('cmd:paste'), [events]);

  const handleLabelChange = useCallback(
    (label: string) => {
      setPadLabel(label);
    },
    [setPadLabel]
  );

  useEffect(() => {
    setPadPlayEnabled(false);
    setPadSelectSourceEnabled(false);
    return () => {
      setPadPlayEnabled(true);
      setPadSelectSourceEnabled(true);
    };
  }, [setPadPlayEnabled, setPadSelectSourceEnabled]);

  log.debug('render', {
    isEnabled,
    selectedPadId,
    isPadAssigned,
    pad: pad?.id,
    padLabel
  });
  return (
    <div className='w-full h-full bg-slate-500 rounded-lg flex gap-6 items-center justify-center'>
      <OpPadLabelButton
        isEnabled={isEnabled}
        onChange={handleLabelChange}
        value={padLabel}
      />

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

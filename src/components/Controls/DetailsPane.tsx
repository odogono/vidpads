'use client';

import { useCallback, useEffect } from 'react';

import {
  ClipboardCopy,
  ClipboardPaste,
  ClipboardX,
  Trash2
} from 'lucide-react';

import { OpButton } from '@/components/common/OpButton';
import { OpPadLabelButton } from '@/components/common/OpPadLabelButton';
import { createLog } from '@helpers/log';
import { useEvents } from '@hooks/events';
import { useSettings } from '@hooks/useSettings';
import { usePad } from '@model/hooks/usePad';
import { PaneProps } from './types';

const log = createLog('DetailsPane', ['debug']);

export const DetailsPane = ({ showDeleteModal }: PaneProps) => {
  const events = useEvents();
  const { isPadPlayEnabled, isPadSelectSourceDisabled, enablePadSelectSource } =
    useSettings();
  const { pad, isPadAssigned, selectedPadId, padLabel, setPadLabel } = usePad();
  const isEnabled = !!selectedPadId && isPadAssigned;
  const isPasteEnabled = !!selectedPadId;

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
    enablePadSelectSource(false);
    return () => {
      enablePadSelectSource(true);
    };
  }, [enablePadSelectSource]);

  log.debug('render', {
    isEnabled,
    selectedPadId,
    isPadAssigned,
    pad: pad?.id,
    padLabel,
    isPadPlayEnabled,
    isPadSelectSourceDisabled
  });
  return (
    <div className='vo-pane-details w-fit h-full rounded-lg flex gap-6 items-center justify-center'>
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
      <OpButton label='Paste' onPress={handlePaste} isEnabled={isPasteEnabled}>
        <ClipboardPaste />
      </OpButton>
      <OpButton label='Delete' onPress={showDeleteModal} isEnabled={isEnabled}>
        <Trash2 />
      </OpButton>
    </div>
  );
};

import { useCallback, useEffect } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { usePad } from '@model/hooks/usePad';
import { usePadOperations } from '@model/hooks/usePadOperations';

const log = createLog('usePadEvents');

export const usePadEvents = () => {
  const events = useEvents();
  const { selectedPadId } = usePad();
  const { cutPadToClipboard, copyPadToClipboard, pastePadFromClipboard } =
    usePadOperations();

  const handleCopyPad = useCallback(() => {
    if (!selectedPadId) return;
    copyPadToClipboard({ sourcePadId: selectedPadId });
  }, [selectedPadId, copyPadToClipboard]);

  const handleCutPad = useCallback(() => {
    if (!selectedPadId) return;
    cutPadToClipboard({ sourcePadId: selectedPadId });
  }, [selectedPadId, cutPadToClipboard]);

  const handlePastePad = useCallback(() => {
    if (!selectedPadId) return;
    pastePadFromClipboard({ targetPadId: selectedPadId });
  }, [selectedPadId, pastePadFromClipboard]);

  useEffect(() => {
    events.on('cmd:copy', handleCopyPad);
    events.on('cmd:cut', handleCutPad);
    events.on('cmd:paste', handlePastePad);

    return () => {
      events.off('cmd:copy', handleCopyPad);
      events.off('cmd:cut', handleCutPad);
      events.off('cmd:paste', handlePastePad);
    };
  }, [events, handleCopyPad, handleCutPad, handlePastePad]);
};

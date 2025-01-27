import { useCallback, useEffect } from 'react';

import { useEvents } from '@helpers/events';
import { createLog } from '@helpers/log';
import { safeParseInt } from '@helpers/number';
import { usePadOperations } from '@model/hooks/usePadOperations';
import { usePads } from '@model/hooks/usePads';

const log = createLog('usePadContainerEvents');

export const usePadContainerEvents = () => {
  const events = useEvents();
  // const { selectedPadId } = usePad();
  const {
    pads,
    isPadSelectSourceEnabled,
    isPadPlayEnabled,
    selectedPadId,
    setSelectedPadId
  } = usePads();

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

  const handleArrowCmds = useCallback(
    (cmd: string) => {
      if (!selectedPadId) return;

      let padIndex = safeParseInt(selectedPadId.substring(1), 1);

      if (cmd === 'left') {
        padIndex = padIndex - 1;
      }

      if (cmd === 'right') {
        padIndex = padIndex + 1;
      }

      if (cmd === 'up') {
        padIndex = padIndex - 4;
      }

      if (cmd === 'down') {
        padIndex = padIndex + 4;
      }

      padIndex = Math.max(1, Math.min(padIndex, pads.length));

      const padId = `a${padIndex}`;

      if (padId === selectedPadId) return;

      setSelectedPadId(padId);
    },
    [selectedPadId, pads, setSelectedPadId]
  );

  useEffect(() => {
    events.on('cmd:copy', handleCopyPad);
    events.on('cmd:cut', handleCutPad);
    events.on('cmd:paste', handlePastePad);
    events.on('cmd:arrow', handleArrowCmds);
    return () => {
      events.off('cmd:copy', handleCopyPad);
      events.off('cmd:cut', handleCutPad);
      events.off('cmd:paste', handlePastePad);
      events.off('cmd:arrow', handleArrowCmds);
    };
  }, [events, handleCopyPad, handleCutPad, handlePastePad, handleArrowCmds]);

  return {
    pads,
    isPadSelectSourceEnabled,
    isPadPlayEnabled,
    selectedPadId
  };
};

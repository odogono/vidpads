'use client';

import { useCallback, useMemo } from 'react';

import { createLog } from '@helpers/log';
import { useProject } from '@hooks/useProject';
import { getPadInterval, getPadSourceUrl } from '@model/pad';
import { useSelector } from '@xstate/store/react';
import { Interval } from '../types';
import { useMetadata } from './useMetadata';

const log = createLog('model/usePads');

export const usePads = () => {
  const { project } = useProject();
  const pads = useSelector(project, (state) => state.context.pads) ?? [];
  const isPadPlayEnabled = useSelector(
    project,
    (state) => state.context.isPadPlayEnabled ?? true
  );
  const isPadSelectSourceEnabled = useSelector(
    project,
    (state) => state.context.isPadSelectSourceEnabled ?? true
  );
  const selectedPadId = useSelector(
    project,
    (state) => state.context.selectedPadId
  );

  const setSelectedPadId = useCallback(
    (padId: string | null) => {
      project.send({ type: 'setSelectedPadId', padId });
    },
    [project]
  );

  return {
    pads,
    selectedPadId,
    isPadPlayEnabled,
    isPadSelectSourceEnabled,
    setSelectedPadId
  };
};

export const usePadsExtended = () => {
  const { pads, selectedPadId } = usePads();
  const { urlToMetadata } = useMetadata();

  const { selectedPadSourceUrl, selectedPadStartAndEndTime } = useMemo(() => {
    const selectedPad = pads.find((pad) => pad.id === selectedPadId);
    const selectedPadSourceUrl = selectedPad
      ? getPadSourceUrl(selectedPad)
      : null;
    const selectedPadStartAndEndTime = selectedPad
      ? getPadInterval(selectedPad)
      : null;
    return { selectedPad, selectedPadSourceUrl, selectedPadStartAndEndTime };
  }, [pads, selectedPadId]);

  const padsWithMedia = useMemo(
    () => pads.filter((pad) => getPadSourceUrl(pad)),
    [pads]
  );

  return {
    pads,
    // padSourceUrls,
    padsWithMedia,
    selectedPadSourceUrl,
    selectedPadStartAndEndTime,
    urlToMetadata
    // mediaIntervals
  };
};

export const usePadDetails = (padId: string) => {
  const { project } = useProject();

  // todo - use query
  const getPadIntervalInternal = useCallback((): Interval | undefined => {
    const pad = project
      .getSnapshot()
      .context.pads.find((pad) => pad.id === padId);
    if (!pad) {
      log.debug('getPadInterval', padId, 'not found');
      return undefined;
    }
    return getPadInterval(pad, { start: 0, end: -1 });
  }, [padId, project]);

  return {
    getPadInterval: getPadIntervalInternal
  };
};

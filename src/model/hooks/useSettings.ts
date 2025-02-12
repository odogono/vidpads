import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import { useProject } from '@hooks/useProject';
import { useSelector } from '@xstate/store/react';

const log = createLog('useSettings');

export const useSettings = () => {
  const { project } = useProject();

  const settings =
    useSelector(project, (state) => state.context.settings) ?? {};

  const settingsString = JSON.stringify(settings);

  const updateSetting = useCallback(
    (path: string, value: boolean | number | string) => {
      log.debug('updateSetting', path, value);
      project.send({ type: 'setSetting', path, value });
    },
    [project]
  );

  const getSetting = useCallback(
    (path: string) => {
      const settings = project.getSnapshot().context.settings ?? {};
      return settings[path as keyof typeof settings];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project, settingsString]
  );

  return {
    updateSetting,
    getSetting
  };
};

export const useIsHidePlayerOnEndEnabled = () => {
  const { project } = useProject();
  return useSelector(
    project,
    (state) => state.context.settings?.hidePlayerOnEnd
  );
};

export const useIsPlayEnabled = () => {
  const { project } = useProject();
  const isKeyboardPlayEnabled = useSelector(
    project,
    (state) => state.context.settings?.isKeyboardPlayEnabled
  );

  const hidePlayerOnEnd = useSelector(
    project,
    (state) => state.context.settings?.hidePlayerOnEnd
  );

  const isMidiPlayEnabled = useSelector(
    project,
    (state) => state.context.settings?.isMidiPlayEnabled
  );

  const isPadPlayEnabled = useSelector(
    project,
    (state) =>
      (state.context.arePadInteractionsEnabled &&
        state.context.settings?.isPadPlayEnabled) ??
      true
  );

  const isSelectPadFromKeyboardEnabled = useSelector(
    project,
    (state) => state.context.settings?.selectPadFromKeyboard
  );

  const isSelectPadFromMidiEnabled = useSelector(
    project,
    (state) => state.context.settings?.selectPadFromMidi
  );

  const isSelectPadFromPadEnabled = useSelector(
    project,
    (state) =>
      state.context.arePadInteractionsEnabled &&
      state.context.settings?.selectPadFromPad
  );

  const arePlayersEnabled = useSelector(
    project,
    (state) => state.context.arePlayersEnabled
  );

  const isPadSelectSourceDisabled = useSelector(
    project,
    (state) => state.context.isPadSelectSourceDisabled
  );

  return {
    arePlayersEnabled,
    hidePlayerOnEnd,
    isKeyboardPlayEnabled,
    isMidiPlayEnabled,
    isPadPlayEnabled,
    isSelectPadFromKeyboardEnabled,
    isSelectPadFromMidiEnabled,
    isSelectPadFromPadEnabled,
    isPadSelectSourceDisabled
  };
};

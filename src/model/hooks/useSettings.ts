import { useCallback } from 'react';

import { createLog } from '@helpers/log';
import { useProject } from '@hooks/useProject';
import { useSelector } from '@xstate/store/react';
import { StoreType } from '../store/types';

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

export const useSettingIsKeyboardPlayEnabled = (project: StoreType) =>
  useSelector(
    project,
    (state) => state.context.settings?.isKeyboardPlayEnabled
  );

export const useSettingIsMidiPlayEnabled = (project: StoreType) =>
  useSelector(project, (state) => state.context.settings?.isMidiPlayEnabled);

export const useSettingHidePlayerOnEnd = (project: StoreType) =>
  useSelector(project, (state) => state.context.settings?.hidePlayerOnEnd);

export const useSettingSelectPadFromKeyboard = (project: StoreType) =>
  useSelector(
    project,
    (state) => state.context.settings?.selectPadFromKeyboard
  );

export const useSettingSelectPadFromMidi = (project: StoreType) =>
  useSelector(project, (state) => state.context.settings?.selectPadFromMidi);

export const useSettingSelectPadFromPad = (project: StoreType) =>
  useSelector(project, (state) => state.context.settings?.selectPadFromPad);

export const useSettingIsPadPlayEnabled = (project: StoreType) =>
  useSelector(project, (state) => state.context.settings?.isPadPlayEnabled);

import { useCallback, useContext } from 'react';

import { createLog } from '@helpers/log';
import { useSelector } from '@xstate/store/react';
import { SettingsContext } from './context';

const log = createLog('useSettings');

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  const { store } = context;

  const settings = useSelector(store, (state) => state.context) ?? {};

  const settingsString = JSON.stringify(settings);

  const updateSetting = useCallback(
    (path: string, value: boolean | number | string) => {
      log.debug('updateSetting', path, value);
      store.send({ type: 'setSetting', path, value });
    },
    [store]
  );

  const getSetting = useCallback(
    (path: string) => {
      const settings = store.getSnapshot().context ?? {};
      return settings[path as keyof typeof settings];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, settingsString]
  );

  const enablePlayers = useCallback(
    (isEnabled: boolean = true) => {
      store.send({
        type: 'setSetting',
        path: 'arePlayersEnabled',
        value: isEnabled
      });
    },
    [store]
  );

  const enablePadSelectSource = useCallback(
    (isEnabled: boolean = true) => {
      store.send({
        type: 'setSetting',
        path: 'isPadSelectSourceDisabled',
        value: !isEnabled
      });
    },
    [store]
  );

  const isPadPlayEnabled = useSelector(
    store,
    (state) =>
      (state.context.arePadInteractionsEnabled &&
        state.context.isPadPlayEnabled) ??
      true
  );

  const isPadSelectSourceDisabled = useSelector(
    store,
    (state) => !!state.context.isPadSelectSourceDisabled
  );

  return {
    enablePlayers,
    enablePadSelectSource,
    isPadPlayEnabled,
    isPadSelectSourceDisabled,
    updateSetting,
    getSetting,
    store
  };
};

export const useIsHidePlayerOnEndEnabled = () => {
  const { store } = useSettings();
  return useSelector(store, (state) => state.context.hidePlayerOnEnd);
};

export const useIsPlayEnabled = () => {
  const { store } = useSettings();
  const isKeyboardPlayEnabled = useSelector(
    store,
    (state) => state.context.isKeyboardPlayEnabled
  );

  const hidePlayerOnEnd = useSelector(
    store,
    (state) => state.context.hidePlayerOnEnd
  );

  const isMidiPlayEnabled = useSelector(
    store,
    (state) => state.context.isMidiPlayEnabled
  );

  const isPadPlayEnabled = useSelector(
    store,
    (state) =>
      (state.context.arePadInteractionsEnabled &&
        state.context.isPadPlayEnabled) ??
      true
  );

  const isSelectPadFromKeyboardEnabled = useSelector(
    store,
    (state) => state.context.selectPadFromKeyboard
  );

  const isSelectPadFromMidiEnabled = useSelector(
    store,
    (state) => state.context.selectPadFromMidi
  );

  const isSelectPadFromPadEnabled = useSelector(
    store,
    (state) =>
      state.context.arePadInteractionsEnabled && state.context.selectPadFromPad
  );

  const arePlayersEnabled =
    useSelector(store, (state) => state.context.arePlayersEnabled) ?? true;

  const isPadSelectSourceDisabled = useSelector(
    store,
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

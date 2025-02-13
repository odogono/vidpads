import { dateToISOString } from '@helpers/datetime';
// import { createLog } from '@helpers/log';
import { createStore as createXStateStore } from '@xstate/store';
import {
  EmittedEvents,
  ImportStoreFromJsonAction,
  SetSettingAction,
  SettingsStoreContext,
  SettingsStoreExport,
  type Actions
} from './types';

// const log = createLog('useSettings/store', ['debug']);

const initialContext: SettingsStoreContext = {
  isMidiMappingEnabled: false,
  arePadInteractionsEnabled: true,
  isPadSelectSourceDisabled: false,
  arePlayersEnabled: true,

  isPadPlayEnabled: true,
  isKeyboardPlayEnabled: true,
  isMidiPlayEnabled: false,
  hidePlayerOnEnd: true,
  selectPadFromKeyboard: true,
  selectPadFromMidi: false,
  selectPadFromPad: true,
  updatedAt: dateToISOString()
};

export const exportStoreToJson = (
  id: string,
  store: SettingsStoreType
): SettingsStoreExport => {
  const data = store.getSnapshot().context;

  return {
    ...data,
    id
  };
};

export const importStoreFromJson = (
  store: SettingsStoreType,
  data: SettingsStoreExport
) => {
  store.send({ type: 'importStoreFromJson', data });
};

const update = (
  context: SettingsStoreContext,
  data: Partial<SettingsStoreContext>
) => {
  return {
    ...context,
    ...data,
    updatedAt: dateToISOString()
  };
};

const Actions = {
  importStoreFromJson: (
    context: SettingsStoreContext,
    event: ImportStoreFromJsonAction
  ) => {
    const { data } = event;

    return update(context, data);
  },

  setSetting: (context: SettingsStoreContext, event: SetSettingAction) => {
    const { path, value } = event;

    return update(context, { [path]: value });
  }
};

export const createStore = () => {
  const content = {
    types: {
      context: {} as SettingsStoreContext,
      events: {} as Actions,
      emitted: {} as EmittedEvents
    },
    context: initialContext,
    on: Actions
  };

  const store = createXStateStore(content);

  return store;
};

export type SettingsStoreType = ReturnType<typeof createStore>;

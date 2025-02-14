import { dateToISOString } from '@helpers/datetime';
// import { createLog } from '@helpers/log';
import { StoreSnapshot, createStore as createXStateStore } from '@xstate/store';
import type {
  ImportStoreFromJsonAction,
  SetSettingAction,
  SettingsStoreActions,
  SettingsStoreContext,
  SettingsStoreData,
  SettingsStoreEvents
} from './types';

// const log = createLog('useSettings/store', ['debug']);

const initialContext: SettingsStoreContext = {
  id: 'preferences',
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
  snapshot: StoreSnapshot<SettingsStoreContext>
): SettingsStoreData => ({ ...snapshot.context, id: 'preferences' });

export const importStoreFromJson = (
  store: SettingsStoreType,
  data: SettingsStoreData
) => {
  store.send({ type: 'importStoreFromJson', data });
};

const SettingsStoreActions = {
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
      events: {} as SettingsStoreActions,
      emitted: {} as SettingsStoreEvents
    },
    context: initialContext,
    on: SettingsStoreActions
  };

  const store = createXStateStore(content);

  return store;
};

export type SettingsStoreType = ReturnType<typeof createStore>;

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

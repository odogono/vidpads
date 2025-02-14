export interface SettingsStoreData {
  id: string;
  updatedAt: string;
}

export interface SettingsStoreContext extends SettingsStoreData {
  // whether the map midi mode is enabled
  isMidiMappingEnabled?: boolean;

  // whether pads are enabled or disabled
  arePadInteractionsEnabled?: boolean;

  // whether source selection is disabled
  isPadSelectSourceDisabled?: boolean;

  // whether players are enabled or disabled
  arePlayersEnabled?: boolean;

  isPadPlayEnabled: boolean;
  isKeyboardPlayEnabled: boolean;
  isMidiPlayEnabled: boolean;
  hidePlayerOnEnd: boolean;
  selectPadFromKeyboard: boolean;
  selectPadFromMidi: boolean;
  selectPadFromPad: boolean;
}

export type SetSettingAction = {
  type: 'setSetting';
  path: string;
  value: boolean | number | string;
};

export type ImportStoreFromJsonAction = {
  type: 'importStoreFromJson';
  data: SettingsStoreData;
};
export type SettingsStoreActions = SetSettingAction | ImportStoreFromJsonAction;

export type SettingUpdatedEvent = {
  type: 'settingUpdated';
  path: string;
  value: boolean | number | string;
};

export type SettingsStoreEvents = SettingUpdatedEvent;

export type Emit = { emit: (event: SettingsStoreEvents) => void };

// export interface SettingsStoreExport extends SettingsStoreContext {
//   id: string;
// }

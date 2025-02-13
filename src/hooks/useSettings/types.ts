export interface SettingsStoreContext {
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
  updatedAt: string;
}

export type SetSettingAction = {
  type: 'setSetting';
  path: string;
  value: boolean | number | string;
};

export type ImportStoreFromJsonAction = {
  type: 'importStoreFromJson';
  data: SettingsStoreExport;
};
export type Actions = SetSettingAction | ImportStoreFromJsonAction;

export type SettingUpdatedEvent = {
  type: 'settingUpdated';
  path: string;
  value: boolean | number | string;
};

export type EmittedEvents = SettingUpdatedEvent;

export type Emit = { emit: (event: EmittedEvents) => void };

export interface SettingsStoreExport extends SettingsStoreContext {
  id: string;
}

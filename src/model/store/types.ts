import type { Media, Pad, ProjectExport } from '@model/types';
import type { Store } from '@xstate/store';

export interface StoreContextType {
  projectId: string | null;
  projectName: string;
  isInitial: boolean;
  startTime: string;
  isEditActive?: boolean;
  selectedPadId?: string | null;
  lastMediaUrl?: string | null;
  lastImportUrl?: string | null;
  pads: Pad[];
  createdAt: string;
  updatedAt: string;
}

export type UpdatePadSourceAction = {
  type: 'updatePadSource';
  padId: string;
  url: string;
};

export type UpdateStartTimeAction = {
  type: 'updateStartTime';
};

export type InitialiseStoreAction = {
  type: 'initialiseStore';
};

export type SetPadMediaAction = {
  type: 'setPadMedia';
  padId: string;
  media: Media;
};

export type ClearPadAction = {
  type: 'clearPad';
  padId: string;
};

export type CopyPadAction = {
  type: 'copyPad';
  copySourceOnly?: boolean;
  sourcePadId: string;
  targetPadId: string;
};

export type SetEditActiveAction = {
  type: 'setEditActive';
  isEditActive: boolean;
};

export type SetSelectedPadIdAction = {
  type: 'setSelectedPadId';
  padId: string | null;
};

export type SetPadIsOneShotAction = {
  type: 'setPadIsOneShot';
  padId: string;
  isOneShot: boolean;
};

export type SetPadIsLoopedAction = {
  type: 'setPadIsLooped';
  padId: string;
  isLooped: boolean;
};

export type ApplyTrimToPadAction = {
  type: 'applyTrimToPad';
  padId: string;
  start: number;
  end: number;
};

export type NewProjectAction = {
  type: 'newProject';
};

export type ImportProjectAction = {
  type: 'importProject';
  data: ProjectExport;
};

export type UpdateProjectAction = {
  type: 'updateProject';
  project: ProjectExport;
};

export type SetLastMediaUrlAction = {
  type: 'setLastMediaUrl';
  url: string;
};

export type SetLastImportUrlAction = {
  type: 'setLastImportUrl';
  url: string;
};

export type Actions =
  | InitialiseStoreAction
  | UpdateStartTimeAction
  | UpdatePadSourceAction
  | SetPadMediaAction
  | ClearPadAction
  | CopyPadAction
  | SetEditActiveAction
  | SetSelectedPadIdAction
  | SetPadIsOneShotAction
  | ApplyTrimToPadAction
  | SetPadIsLoopedAction
  | NewProjectAction
  | ImportProjectAction
  | UpdateProjectAction
  | SetLastMediaUrlAction
  | SetLastImportUrlAction;

export type PadUpdatedEvent = {
  type: 'padUpdated';
  pad: Pad;
};

export type StartTimeUpdatedEvent = {
  type: 'startTimeUpdated';
  startTime: string;
};

export type StoreInitialisedEvent = {
  type: 'storeInitialised';
};

export type IsEditActiveEvent = {
  type: 'isEditActive';
  isEditActive: boolean;
};

export type EmittedEvents =
  | PadUpdatedEvent
  | StartTimeUpdatedEvent
  | StoreInitialisedEvent
  | IsEditActiveEvent;

export type Emit = { emit: (event: EmittedEvents) => void };

export type StoreType = Store<StoreContextType, Actions, EmittedEvents>;

export type StoreSnapshot = ReturnType<StoreType['subscribe']>;

export type StoreContext = NoInfer<StoreContextType>;

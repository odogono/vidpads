import type {
  Media,
  Pad,
  ProjectExport,
  SequencerEvent,
  ShowMode,
  VolumeKeyPoint
} from '@model/types';
import type { SequencerType } from '@types';
import type { Store } from '@xstate/store';

export interface StoreContextType {
  projectId: string | null;
  projectName: string;
  isInitial: boolean;
  startTime: string;
  isEditActive?: boolean;
  selectedControlPane?: SequencerType;
  selectedPadId?: string | null;

  // whether keyboard can trigger a player
  isKeyboardPlayEnabled?: boolean;

  // whether midi can trigger a player
  isMidiPlayEnabled?: boolean;

  // whether the map midi mode is enabled
  isMidiMappingEnabled?: boolean;

  // whether pads can trigger a player
  isPadPlayEnabled?: boolean;

  // whether pressing on an empty pad opens the selector
  isPadSelectSourceEnabled?: boolean;

  // whether the pads or sequencer are visible
  showMode: ShowMode;

  sequencer: {
    selectedEventId?: string | null;
    bpm: number;
    events: SequencerEvent[];
    startTime: number;
    endTime: number;
  };

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

export type ApplyPlaybackRateToPadAction = {
  type: 'applyPlaybackRateToPad';
  padId: string;
  rate: number;
};

export type ApplyVolumeToPadAction = {
  type: 'applyVolumeToPad';
  padId: string;
  volume: number;
};

export type ApplyVolumeEnvelopeToPadAction = {
  type: 'applyVolumeEnvelopeToPad';
  padId: string;
  envelope: VolumeKeyPoint[];
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

export type SetSelectedControlPaneAction = {
  type: 'setSelectedControlPane';
  pane: SequencerType;
};

export type SetPadPlayEnabledAction = {
  type: 'setPadPlayEnabled';
  isEnabled: boolean;
};

export type SetPadSelectSourceEnabledAction = {
  type: 'setPadSelectSourceEnabled';
  isEnabled: boolean;
};

export type ApplyPadAction = {
  type: 'applyPad';
  pad: Pad;
  targetPadId: string;
  copySourceOnly?: boolean;
};

export type SetShowModeAction = {
  type: 'setShowMode';
  mode: ShowMode;
};

export type SetSequencerBpmAction = {
  type: 'setSequencerBpm';
  bpm: number;
};

export type ToggleSequencerEventAction = {
  type: 'toggleSequencerEvent';
  padId: string;
  time: number;
  duration: number;
};

export type ClearSequencerEventsAction = {
  type: 'clearSequencerEvents';
};

export type AddSequencerEventAction = {
  type: 'addSequencerEvent';
  padId: string;
  time: number;
  duration: number;
  quantizeStep?: number;
};

export type RemoveSequencerEventAction = {
  type: 'removeSequencerEvent';
  padId: string;
  time: number;
};

export type SelectSequencerEventsAction = {
  type: 'selectSequencerEvents';
  padIds: string[];
  time: number;
  duration: number;
};

export type MoveSequencerEventsAction = {
  type: 'moveSequencerEvents';
  timeDelta: number;
};

export type SetSelectedSeqEventIdAction = {
  type: 'setSelectedSeqEventId';
  eventId: string | null;
};

export type SetSequencerStartTimeAction = {
  type: 'setSequencerStartTime';
  startTime: number;
};

export type SetSequencerEndTimeAction = {
  type: 'setSequencerEndTime';
  endTime: number;
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
  | SetLastImportUrlAction
  | ApplyVolumeToPadAction
  | ApplyVolumeEnvelopeToPadAction
  | ApplyPlaybackRateToPadAction
  | SetSelectedControlPaneAction
  | SetPadPlayEnabledAction
  | SetPadSelectSourceEnabledAction
  | ApplyPadAction
  | SetShowModeAction
  | SetSequencerBpmAction
  | ToggleSequencerEventAction
  | ClearSequencerEventsAction
  | AddSequencerEventAction
  | RemoveSequencerEventAction
  | SetSelectedSeqEventIdAction
  | SelectSequencerEventsAction
  | MoveSequencerEventsAction
  | SetSequencerStartTimeAction
  | SetSequencerEndTimeAction;

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

export type SequencerTimesUpdatedEvent = {
  type: 'sequencerTimesUpdated';
  startTime: number;
  endTime: number;
};

export type EmittedEvents =
  | PadUpdatedEvent
  | StartTimeUpdatedEvent
  | StoreInitialisedEvent
  | IsEditActiveEvent
  | SequencerTimesUpdatedEvent;

export type Emit = { emit: (event: EmittedEvents) => void };

export type StoreType = Store<StoreContextType, Actions, EmittedEvents>;

export type StoreSnapshot = ReturnType<StoreType['subscribe']>;

export type StoreContext = NoInfer<StoreContextType>;

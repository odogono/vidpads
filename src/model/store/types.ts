import type {
  Media,
  Pad,
  ProjectExport,
  SequencerEvent,
  ShowMode,
  VolumeKeyPoint
} from '@model/types';
import { ControlPanes } from '@types';
import type { Store } from '@xstate/store';

export interface ProjectStoreContextType {
  projectId: string;

  projectName: string;
  projectDescription?: string;
  projectAuthor?: string;

  projectBgImage?: string;

  selectedControlPane?: ControlPanes;
  selectedPadId?: string | null;

  // whether the pads or sequencer are visible
  showMode: ShowMode;

  sequencer: {
    bpm: number;
    events: SequencerEvent[];
    time: number;
    endTime: number;
    isLooped?: boolean;
    // used for copy/paste of events
    clipboard?: string;
  };

  stepSequencer?: {
    bpm: number;
    events: SequencerEvent[];
    endTime: number;
  };

  lastMediaUrl?: string | null;
  lastImportUrl?: string | null;
  pads: Pad[];
  createdAt: string;
  updatedAt: string;
}

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

export type SetSelectedPadIdAction = {
  type: 'setSelectedPadId';
  padId: string | null;
};

export type SetPadIsOneShotAction = {
  type: 'setPadIsOneShot';
  padId: string;
  isOneShot?: boolean;
};

export type ApplyTrimToPadAction = {
  type: 'applyTrimToPad';
  padId: string;
  start: number;
  end: number;
};

export type SetPadIsLoopedAction = {
  type: 'setPadIsLooped';
  padId: string;
  isLooped: boolean | undefined;
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
  project: ProjectStoreContextType;
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
  pane: ControlPanes;
};

export type SetPadChokeGroupAction = {
  type: 'setPadChokeGroup';
  padId: string;
  group: number | undefined;
};

export type SetPadPlayPriorityAction = {
  type: 'setPadPlayPriority';
  padId: string;
  priority: number | undefined;
};

export type SetPadPlaybackResumeAction = {
  type: 'setPadPlaybackResume';
  padId: string;
  isResume: boolean | undefined;
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
  evt: SequencerEvent;
};

export type RemoveSequencerEventAction = {
  type: 'removeSequencerEvent';
  padId: string;
  time: number;
};

export type SelectSequencerEventsAction = {
  type: 'selectSequencerEvents';
  evtIds?: number[];
  padIds: string[];
  time: number;
  duration: number;
};

export type MoveSequencerEventsAction = {
  type: 'moveSequencerEvents';
  timeDelta: number;
  rowDelta: number;
  isFinished?: boolean;
};

export type RepeatSequencerEventsAction = {
  type: 'repeatSequencerEvents';
};

export type ClipboardSequencerEventsAction = {
  type: 'clipboardSequencerEvents';
  op: 'cut' | 'copy' | 'paste';
  time?: number;
  padId?: string;
};

export type SnapSequencerEventsAction = {
  type: 'snapSequencerEvents';
  step: number;
};

export type SetSequencerTimeAction = {
  type: 'setSequencerTime';
  time: number;
};

export type SetSequencerEndTimeAction = {
  type: 'setSequencerEndTime';
  endTime: number;
};

export type SetSelectedEventsTimeAction = {
  type: 'setSelectedEventsTime';
  time: number;
};

export type SetSelectedEventsDurationAction = {
  type: 'setSelectedEventsDuration';
  duration: number;
};

export type SetPadLabelAction = {
  type: 'setPadLabel';
  padId: string;
  label: string;
};

export type StartSequencerAction = {
  type: 'startSequencer';
  isPlaying: boolean;
  isRecording: boolean;
};

export type StopSequencerAction = {
  type: 'stopSequencer';
};

export type RewindSequencerAction = {
  type: 'rewindSequencer';
};

export type SetSequencerIsLoopedAction = {
  type: 'setSequencerIsLooped';
  isLooped: boolean;
};

export type SetProjectNameAction = {
  type: 'setProjectName';
  name: string;
};

// export type SetSettingAction = {
//   type: 'setSetting';
//   path: string;
//   value: boolean | number | string;
// };

// export type SetPlayersEnabledAction = {
//   type: 'setPlayersEnabled';
//   isEnabled: boolean;
// };

export type SetProjectBgImageAction = {
  type: 'setProjectBgImage';
  url?: string | undefined;
};

// export type SetPadSelectSourceDisabledAction = {
//   type: 'setPadSelectSourceDisabled';
//   isDisabled: boolean;
// };

export type ProjectStoreActions =
  | SetPadMediaAction
  | ClearPadAction
  | CopyPadAction
  | SetSelectedPadIdAction
  | SetPadIsOneShotAction
  | SetPadIsLoopedAction
  | ApplyTrimToPadAction
  | NewProjectAction
  | ImportProjectAction
  | UpdateProjectAction
  | SetLastMediaUrlAction
  | SetLastImportUrlAction
  | ApplyVolumeToPadAction
  | ApplyVolumeEnvelopeToPadAction
  | ApplyPlaybackRateToPadAction
  | SetSelectedControlPaneAction
  | ApplyPadAction
  | SetShowModeAction
  | SetSequencerBpmAction
  | ToggleSequencerEventAction
  | ClearSequencerEventsAction
  | AddSequencerEventAction
  | RemoveSequencerEventAction
  | SelectSequencerEventsAction
  | MoveSequencerEventsAction
  | SetSequencerTimeAction
  | SetSequencerEndTimeAction
  | SetSelectedEventsTimeAction
  | SetSelectedEventsDurationAction
  | SetPadLabelAction
  | SetPadChokeGroupAction
  | SetPadPlayPriorityAction
  | SetPadPlaybackResumeAction
  | StartSequencerAction
  | StopSequencerAction
  | RewindSequencerAction
  | SetSequencerIsLoopedAction
  | SetProjectNameAction
  | RepeatSequencerEventsAction
  | ClipboardSequencerEventsAction
  | SnapSequencerEventsAction
  | SetProjectBgImageAction;

export type PadUpdatedEvent = {
  type: 'padUpdated';
  pad: Pad;
};

export type TimeUpdatedEvent = {
  type: 'timeUpdated';
  time: string;
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
  time: number;
  endTime: number;
};

export type SequencerStartedEvent = {
  type: 'sequencerStarted';
  isPlaying: boolean;
  isRecording: boolean;
  time: number;
};

export type SequencerStoppedEvent = {
  type: 'sequencerStopped';
};

export type PadIsLoopedEvent = {
  type: 'padIsLooped';
  padId: string;
  url: string;
  isLooped: boolean;
};

export type ProjectStoreEvents =
  | PadUpdatedEvent
  | TimeUpdatedEvent
  | StoreInitialisedEvent
  | IsEditActiveEvent
  | SequencerTimesUpdatedEvent
  | SequencerStartedEvent
  | SequencerStoppedEvent
  | PadIsLoopedEvent;

export type Emit = { emit: (event: ProjectStoreEvents) => void };

export type ProjectStoreType = Store<
  ProjectStoreContextType,
  ProjectStoreActions,
  ProjectStoreEvents
>;

export type ProjectStoreSnapshot = ReturnType<ProjectStoreType['subscribe']>;

export type ProjectStoreContext = NoInfer<ProjectStoreContextType>;

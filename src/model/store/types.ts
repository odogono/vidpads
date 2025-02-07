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

export interface StoreContextType {
  projectId: string;

  projectName: string;
  projectDescription?: string;
  projectAuthor?: string;

  // isInitial: boolean;
  // startTime: string;

  selectedControlPane?: ControlPanes;
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
    bpm: number;
    events: SequencerEvent[];
    time: number;
    endTime: number;
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
  isOneShot: boolean;
};

export type ApplyTrimToPadAction = {
  type: 'applyTrimToPad';
  padId: string;
  start: number;
  end: number;
};

export type ApplyLoopToPadAction = {
  type: 'applyLoopToPad';
  padId: string;
  start: number;
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
  project: StoreContextType;
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

export type SetPadPlayEnabledAction = {
  type: 'setPadPlayEnabled';
  isEnabled: boolean;
};

export type SetPadSelectSourceEnabledAction = {
  type: 'setPadSelectSourceEnabled';
  isEnabled: boolean;
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
  resume: boolean | undefined;
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
  rowDelta: number;
  isFinished?: boolean;
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

export type Actions =
  | SetPadMediaAction
  | ClearPadAction
  | CopyPadAction
  | SetSelectedPadIdAction
  | SetPadIsOneShotAction
  | ApplyTrimToPadAction
  | ApplyLoopToPadAction
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
  | SelectSequencerEventsAction
  | MoveSequencerEventsAction
  | SetSequencerTimeAction
  | SetSequencerEndTimeAction
  | SetSelectedEventsTimeAction
  | SetSelectedEventsDurationAction
  | SetPadLabelAction
  | SetPadChokeGroupAction
  | SetPadPlayPriorityAction
  | SetPadPlaybackResumeAction;

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

export type EmittedEvents =
  | PadUpdatedEvent
  | TimeUpdatedEvent
  | StoreInitialisedEvent
  | IsEditActiveEvent
  | SequencerTimesUpdatedEvent;

export type Emit = { emit: (event: EmittedEvents) => void };

export type StoreType = Store<StoreContextType, Actions, EmittedEvents>;

export type StoreSnapshot = ReturnType<StoreType['subscribe']>;

export type StoreContext = NoInfer<StoreContextType>;

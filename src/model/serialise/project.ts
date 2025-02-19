import { dateToISOString, formatShortDate } from '@helpers/datetime';
import { createLog } from '@helpers/log';
import { generateShortUUID } from '@helpers/uuid';
import { exportPadToJSON, importPadFromJSON } from '@model/serialise/pad';
import {
  exportSequencerToJSON,
  importSequencerFromJSON
} from '@model/serialise/sequencer';
import { addOrReplacePad } from '@model/store/actions/helpers';
import { initialContext } from '@model/store/store';
import { ProjectStoreContext, ProjectStoreType } from '@model/store/types';
import { PadExport, ProjectExport } from '@model/types';
import {
  exportStepSequencerToJSON,
  importStepSequencerFromJSON
} from './stepSequencer';
import { exportToURLStringV1, importFromURLStringV1 } from './versions/1';
import { exportToURLStringV2, importFromURLStringV2 } from './versions/2';
import { exportToURLStringV3, importFromURLStringV3 } from './versions/3';
import { exportToURLStringV4, importFromURLStringV4 } from './versions/4';

const log = createLog('serialise/project');

const EXPORT_JSON_VERSION = '2025-02-18';
const EXPORT_APP_VERSION = process.env.VERSION;

const EXPORT_URL_VERSION = 4;

export type ExportOptions = Record<string, unknown>;

export const exportToJSON = (store: ProjectStoreType): ProjectExport => {
  const { context } = store.getSnapshot();

  const {
    projectId,
    projectName,
    projectBgImage,
    sequencer,
    stepSequencer,
    createdAt,
    updatedAt,
    pads
  } = context;

  const sequencerJSON = sequencer
    ? exportSequencerToJSON(sequencer)
    : undefined;

  const stepSequencerJSON = stepSequencer
    ? exportStepSequencerToJSON(stepSequencer)
    : undefined;

  const padsJSON = pads
    .map((pad) => exportPadToJSON(pad))
    .filter(Boolean) as PadExport[];

  const result: Partial<ProjectExport> = {
    id: projectId || generateShortUUID(),
    name: projectName || `Untitled Project - ${formatShortDate()}`
  };

  if (projectBgImage) {
    result.bgImage = projectBgImage;
  }

  result.version = EXPORT_APP_VERSION;
  result.exportVersion = `${EXPORT_JSON_VERSION}`;
  result.pads = padsJSON;
  result.sequencer = sequencerJSON;
  result.stepSequencer = stepSequencerJSON;
  result.createdAt = createdAt || dateToISOString();
  result.updatedAt = updatedAt || dateToISOString();

  return result as ProjectExport;
};

export const exportToJSONString = (store: ProjectStoreType) => {
  const json = exportToJSON(store);
  return JSON.stringify(json);
};

export const exportToURLString = async (
  project: ProjectStoreType,
  version: number = EXPORT_URL_VERSION
) => {
  switch (version) {
    case 1:
      return exportToURLStringV1(project);
    case 2:
      return exportToURLStringV2(project);
    case 3:
      return exportToURLStringV3(project);
    default:
      return exportToURLStringV4(project);
  }
};

export const importProjectExport = (
  data: ProjectExport
): ProjectStoreContext => {
  const pads = data.pads
    .map((pad) => importPadFromJSON({ pad, importSource: true }))
    .filter(Boolean);

  const newContext: ProjectStoreContext = {
    ...initialContext,
    projectId: data.id || generateShortUUID(),
    projectName: data.name || `Untitled Project - ${formatShortDate()}`,
    selectedPadId: undefined,
    createdAt: data.createdAt || dateToISOString(),
    updatedAt: data.updatedAt || dateToISOString()
  };

  if (data.bgImage) {
    newContext.projectBgImage = data.bgImage;
  }

  const sequencer = data.sequencer
    ? importSequencerFromJSON(data.sequencer)
    : undefined;

  const contextWithSequencer = sequencer
    ? {
        ...newContext,
        sequencer
      }
    : newContext;

  const stepSequencer = data.stepSequencer
    ? importStepSequencerFromJSON(data.stepSequencer)
    : undefined;

  const contextWithStepSequencer = stepSequencer
    ? {
        ...contextWithSequencer,
        stepSequencer
      }
    : contextWithSequencer;

  return pads.reduce((acc, pad) => {
    if (pad) {
      return addOrReplacePad(acc, pad);
    }
    return acc;
  }, contextWithStepSequencer);
};

export const urlStringToProject = async (urlString: string) => {
  const firstPipe = urlString.indexOf('|');
  if (firstPipe === -1) {
    throw new Error('Invalid URL string');
  }
  const version = urlString.slice(0, firstPipe);
  const data = urlString.slice(firstPipe + 1);

  log.debug('urlStringToProject', urlString, version, data);

  if (version === '1') {
    return importFromURLStringV1(data);
  }
  if (version === '2') {
    return importFromURLStringV2(data);
  }
  if (version === '3') {
    return importFromURLStringV3(data);
  }
  if (version === '4') {
    return importFromURLStringV4(data);
  }

  throw new Error(`Unsupported export version: ${version}`);
};

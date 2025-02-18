import { compress, decompress } from '@helpers/compress';
import {
  dateToISOString,
  formatShortDate,
  getDateFromUnixTime,
  getUnixTimeFromDate
} from '@helpers/datetime';
import { createLog } from '@helpers/log';
import { generateShortUUID } from '@helpers/uuid';
import {
  exportPadToJSON,
  exportPadToURLString,
  importPadFromJSON,
  importPadFromURLString
} from '@model/serialise/pad';
import {
  exportSequencerToJSON,
  exportSequencerToURLString,
  importSequencerFromJSON,
  importSequencerFromURLString
} from '@model/serialise/sequencer';
import { addOrReplacePad } from '@model/store/actions/helpers';
import { initialContext } from '@model/store/store';
import { ProjectStoreContext, ProjectStoreType } from '@model/store/types';
import { PadExport, ProjectExport } from '@model/types';
import {
  exportStepSequencerToJSON,
  exportStepSequencerToURLString,
  importStepSequencerFromJSON,
  importStepSequencerFromURLString
} from './stepSequencer';

const log = createLog('model/export', ['debug']);

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

const exportToURLCommon = (project: ProjectStoreType) => {
  const { context } = project.getSnapshot();

  const {
    projectId,
    projectName,
    projectBgImage,
    createdAt,
    updatedAt,
    pads,
    sequencer
  } = context;

  const sequencerURL = sequencer ? exportSequencerToURLString(sequencer) : '';

  const padsURL = pads.map((pad) => exportPadToURLString(pad)).filter(Boolean);

  const createTimeSecs = getUnixTimeFromDate(createdAt);
  const updateTimeSecs = getUnixTimeFromDate(updatedAt);

  return {
    context,
    projectId,
    projectName,
    projectBgImage,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL
  };
};

export const exportToURLStringV1 = (project: ProjectStoreType) => {
  const {
    projectId,
    projectName,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL
  } = exportToURLCommon(project);

  // base64 encode the project name
  const projectNameBase64 = projectName
    ? btoa(encodeURIComponent(projectName))
    : '';

  let result = `1|${projectId}|${projectNameBase64}|${createTimeSecs}|${updateTimeSecs}`;

  result = addPadsAndSequencerToResult(result, padsURL, sequencerURL);

  return result;
};

const addPadsAndSequencerToResult = (
  result: string,
  padsURL: (string | undefined)[],
  sequencerURL?: string
) => {
  if (padsURL.length > 0) {
    result += `|${padsURL.join('(')}`;
  } else {
    result += '|';
  }

  if (sequencerURL) {
    result += `|${sequencerURL}`;
  }

  return result;
};

export const exportToURLStringV2 = async (project: ProjectStoreType) => {
  const {
    projectId,
    projectName,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL
  } = exportToURLCommon(project);

  let result = `${projectId}|${projectName}|${createTimeSecs}|${updateTimeSecs}`;

  result = addPadsAndSequencerToResult(result, padsURL, sequencerURL);

  const compressed = await compress(result);

  return `2|${compressed}`;
};

export const exportToURLStringV3 = async (project: ProjectStoreType) => {
  const {
    projectId,
    projectName,
    projectBgImage,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL
  } = exportToURLCommon(project);

  let result = `${projectId}|${projectName}|${projectBgImage}|${createTimeSecs}|${updateTimeSecs}`;

  result = addPadsAndSequencerToResult(result, padsURL, sequencerURL);

  const compressed = await compress(result);

  return `3|${compressed}`;
};

export const exportToURLStringV4 = async (project: ProjectStoreType) => {
  const {
    context,
    projectId,
    projectName,
    projectBgImage,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL
  } = exportToURLCommon(project);

  const { stepSequencer } = context;

  const stepSequencerURL = stepSequencer
    ? exportStepSequencerToURLString(stepSequencer)
    : '';

  let result = `${projectId}|${projectName}|${projectBgImage}|${createTimeSecs}|${updateTimeSecs}`;

  result = addPadsAndSequencerToResult(result, padsURL, sequencerURL);

  if (stepSequencerURL) {
    result += `|${stepSequencerURL}`;
  }

  const compressed = await compress(result);

  return `4|${compressed}`;
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

const importFromURLStringV1 = (urlString: string) => {
  log.debug('importFromURLStringV1', urlString);
  const [
    projectId,
    projectNameBase64,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL
  ] = urlString.split('|');

  const createdAt = getDateFromUnixTime(createTimeSecs);
  const updatedAt = getDateFromUnixTime(updateTimeSecs);

  const projectName = decodeURIComponent(atob(projectNameBase64));

  const pads = padsURL
    .split('(')
    .map(importPadFromURLString)
    .filter(Boolean) as PadExport[];

  const sequencer = sequencerURL
    ? importSequencerFromURLString(sequencerURL)
    : undefined;

  return {
    id: projectId,
    name: projectName,
    createdAt: dateToISOString(createdAt),
    updatedAt: dateToISOString(updatedAt),
    pads,
    sequencer
  } as ProjectExport;
};

const importFromURLStringV2 = async (data: string) => {
  const uncompressed = await decompress(data);

  log.debug('importFromURLStringV2', uncompressed);
  const [
    projectId,
    projectName,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL
  ] = uncompressed.split('|');

  const createdAt = getDateFromUnixTime(createTimeSecs);
  const updatedAt = getDateFromUnixTime(updateTimeSecs);

  const pads = padsURL
    .split('(')
    .map(importPadFromURLString)
    .filter(Boolean) as PadExport[];

  const sequencer = sequencerURL
    ? importSequencerFromURLString(sequencerURL)
    : undefined;

  return {
    id: projectId,
    name: projectName,
    createdAt: dateToISOString(createdAt),
    updatedAt: dateToISOString(updatedAt),
    pads,
    sequencer
  } as ProjectExport;
};

const importFromURLStringV3 = async (data: string) => {
  const uncompressed = await decompress(data);

  log.debug('importFromURLStringV3', uncompressed);
  const [
    projectId,
    projectName,
    projectBgImage,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL
  ] = uncompressed.split('|');

  const createdAt = getDateFromUnixTime(createTimeSecs);
  const updatedAt = getDateFromUnixTime(updateTimeSecs);

  const pads = padsURL
    .split('(')
    .map(importPadFromURLString)
    .filter(Boolean) as PadExport[];

  const sequencer = sequencerURL
    ? importSequencerFromURLString(sequencerURL)
    : undefined;

  return {
    id: projectId,
    name: projectName,
    bgImage: projectBgImage,
    createdAt: dateToISOString(createdAt),
    updatedAt: dateToISOString(updatedAt),
    pads,
    sequencer
  } as ProjectExport;
};

const importFromURLStringV4 = async (data: string) => {
  const uncompressed = await decompress(data);

  log.debug('importFromURLStringV4', uncompressed);
  const [
    projectId,
    projectName,
    projectBgImage,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL,
    stepSequencerURL
  ] = uncompressed.split('|');

  const createdAt = getDateFromUnixTime(createTimeSecs);
  const updatedAt = getDateFromUnixTime(updateTimeSecs);

  const pads = padsURL
    .split('(')
    .map(importPadFromURLString)
    .filter(Boolean) as PadExport[];

  const sequencer = sequencerURL
    ? importSequencerFromURLString(sequencerURL)
    : undefined;

  const stepSequencer = stepSequencerURL
    ? importStepSequencerFromURLString(stepSequencerURL)
    : undefined;

  return {
    id: projectId,
    name: projectName,
    bgImage: projectBgImage,
    createdAt: dateToISOString(createdAt),
    updatedAt: dateToISOString(updatedAt),
    pads,
    sequencer,
    stepSequencer
  } as ProjectExport;
};

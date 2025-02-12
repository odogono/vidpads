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
import { StoreContext, StoreType } from '@model/store/types';
import { PadExport, ProjectExport } from '@model/types';
import { version as appVersion } from '../../../package.json';

const log = createLog('model/export', ['debug']);

const EXPORT_JSON_VERSION = 1;
const EXPORT_APP_VERSION = appVersion;

const EXPORT_URL_VERSION = 3;

export type ExportOptions = Record<string, unknown>;

export const exportToJSON = (store: StoreType): ProjectExport => {
  const { context } = store.getSnapshot();

  const {
    projectId,
    projectName,
    projectBgImage,
    sequencer,
    createdAt,
    updatedAt,
    pads
  } = context;

  const sequencerJSON = sequencer
    ? exportSequencerToJSON(sequencer)
    : undefined;
  const padsJSON = pads.map((pad) => exportPadToJSON(pad)).filter(Boolean);

  const result = {
    id: projectId || generateShortUUID(),
    name: projectName || `Untitled Project - ${formatShortDate()}`,
    version: EXPORT_APP_VERSION,
    exportVersion: `${EXPORT_JSON_VERSION}`,
    pads: padsJSON,
    sequencer: sequencerJSON,
    createdAt: createdAt || dateToISOString(),
    updatedAt: updatedAt || dateToISOString()
  } as ProjectExport;

  if (projectBgImage) {
    result.bgImage = projectBgImage;
  }

  return result;
};

export const exportToJSONString = (store: StoreType) => {
  const json = exportToJSON(store);
  return JSON.stringify(json);
};

export const exportToURLString = async (
  project: StoreType,
  version: number = EXPORT_URL_VERSION
) => {
  switch (version) {
    case 1:
      return exportToURLStringV1(project);
    case 2:
      return exportToURLStringV2(project);
    default:
      return exportToURLStringV3(project);
  }
};

const exportToURLCommon = (project: StoreType) => {
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
    projectId,
    projectName,
    projectBgImage,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL
  };
};

export const exportToURLStringV1 = (project: StoreType) => {
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

export const exportToURLStringV2 = async (project: StoreType) => {
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

export const exportToURLStringV3 = async (project: StoreType) => {
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

export const importProjectExport = (data: ProjectExport): StoreContext => {
  const pads = data.pads
    .map((pad) => importPadFromJSON({ pad, importSource: true }))
    .filter(Boolean);

  const newContext: StoreContext = {
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

  return pads.reduce((acc, pad) => {
    if (pad) {
      return addOrReplacePad(acc, pad);
    }
    return acc;
  }, contextWithSequencer);
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

// import { createLog } from '@helpers/log';
import {
  dateToISOString,
  getDateFromUnixTime,
  getUnixTimeFromDate
} from '@helpers/datetime';
import { safeParseInt } from '@helpers/number';
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

// const log = createLog('model/export');

const EXPORT_JSON_VERSION = 1;
const EXPORT_APP_VERSION = appVersion;

const EXPORT_URL_VERSION = 1;

export type ExportOptions = Record<string, unknown>;

export const exportToJSON = (store: StoreType): ProjectExport => {
  const { context } = store.getSnapshot();

  const { projectId, projectName, sequencer, createdAt, updatedAt, pads } =
    context;

  const sequencerJSON = sequencer
    ? exportSequencerToJSON(sequencer)
    : undefined;
  const padsJSON = pads.map((pad) => exportPadToJSON(pad)).filter(Boolean);

  return {
    id: projectId ?? generateShortUUID(),
    name: projectName ?? 'Untitled',
    version: EXPORT_APP_VERSION,
    exportVersion: `${EXPORT_JSON_VERSION}`,
    pads: padsJSON,
    sequencer: sequencerJSON,
    createdAt: createdAt ?? dateToISOString(),
    updatedAt: updatedAt ?? dateToISOString()
  } as ProjectExport;
};

export const exportToJSONString = (store: StoreType) => {
  const json = exportToJSON(store);
  return JSON.stringify(json);
};

export const exportToURLString = (store: StoreType) => {
  const { context } = store.getSnapshot();

  const { projectId, projectName, createdAt, updatedAt, pads, sequencer } =
    context;

  const sequencerURL = sequencer ? exportSequencerToURLString(sequencer) : '';

  const padsURL = pads.map((pad) => exportPadToURLString(pad)).filter(Boolean);

  const createTimeSecs = getUnixTimeFromDate(createdAt);
  const updateTimeSecs = getUnixTimeFromDate(updatedAt);

  // base64 encode the project name
  const projectNameBase64 = projectName
    ? btoa(encodeURIComponent(projectName))
    : '';

  let result = `${EXPORT_URL_VERSION}|${projectId}|${projectNameBase64}|${createTimeSecs}|${updateTimeSecs}`;

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

export const importProjectExport = (data: ProjectExport): StoreContext => {
  const pads = data.pads
    .map((pad) => importPadFromJSON({ pad, importSource: true }))
    .filter(Boolean);

  const newContext: StoreContext = {
    ...initialContext,
    projectId: data.id ?? generateShortUUID(),
    projectName: data.name ?? 'Untitled',
    selectedPadId: undefined,
    createdAt: data.createdAt ?? dateToISOString(),
    updatedAt: data.updatedAt ?? dateToISOString()
  };

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

export const urlStringToProject = (urlString: string) => {
  const [
    version,
    projectId,
    projectNameBase64,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL
  ] = urlString.split('|');

  if (safeParseInt(version) !== EXPORT_URL_VERSION) {
    throw new Error(`Unsupported export version: ${version}`);
  }

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
    exportVersion: `${version}`,
    createdAt: dateToISOString(createdAt),
    updatedAt: dateToISOString(updatedAt),
    pads,
    sequencer
  } as ProjectExport;
};

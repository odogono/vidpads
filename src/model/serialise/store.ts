// import { createLog } from '@helpers/log';
import { generateShortUUID } from '@helpers/uuid';
import { StoreType } from '@model/store/types';
import { PadExport, ProjectExport } from '@model/types';
import { version as appVersion } from '../../../package.json';
import { safeParseInt } from '../../helpers/number';
import {
  exportPadToJSON,
  exportPadToURLString,
  importPadFromURLString
} from './pad';
import {
  exportSequencerToJSON,
  exportSequencerToURLString,
  importSequencerFromURLString
} from './sequencer';

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
    createdAt: createdAt ?? new Date().toISOString(),
    updatedAt: updatedAt ?? new Date().toISOString()
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

  const createTimeMs = createdAt ? new Date(createdAt).getTime() : 0;
  const updateTimeMs = updatedAt ? new Date(updatedAt).getTime() : 0;

  // base64 encode the project name
  const projectNameBase64 = projectName ? encodeURIComponent(projectName) : '';

  let result = `${EXPORT_URL_VERSION}|${projectId}|${projectNameBase64}|${createTimeMs}|${updateTimeMs}`;

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

export const urlStringToProject = (urlString: string) => {
  const [
    version,
    projectId,
    projectNameBase64,
    createTimeMs,
    updateTimeMs,
    padsURL,
    sequencerURL
  ] = urlString.split('|');

  if (safeParseInt(version) !== EXPORT_URL_VERSION) {
    throw new Error(`Unsupported export version: ${version}`);
  }

  const createdAt = new Date(safeParseInt(createTimeMs));
  const updatedAt = new Date(safeParseInt(updateTimeMs));

  const projectName = decodeURIComponent(projectNameBase64);

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
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    pads,
    sequencer
  } as ProjectExport;
};

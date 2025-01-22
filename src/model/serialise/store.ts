// import { createLog } from '@helpers/log';
import { generateShortUUID } from '@helpers/uuid';
import type { InternalToExternalUrlMap } from '@model/hooks/useMetadata';
import { StoreType } from '@model/store/types';
import { PadExport, ProjectExport } from '@model/types';
import { version as appVersion } from '../../../package.json';
import {
  exportPadToJSON,
  exportPadToURLString,
  importPadFromURLString
} from './pad';

// const log = createLog('model/export');

const EXPORT_JSON_VERSION = 1;
const EXPORT_APP_VERSION = appVersion;

const EXPORT_URL_VERSION = 1;

export type ExportOptions = Record<string, unknown>;

export const exportToJSON = (
  store: StoreType,
  urlToExternalUrl: InternalToExternalUrlMap
): ProjectExport => {
  const { context } = store.getSnapshot();

  const { projectId, projectName, createdAt, updatedAt, pads } = context;

  const padsJSON = pads
    .map((pad) => exportPadToJSON(pad, urlToExternalUrl))
    .filter(Boolean);

  return {
    id: projectId ?? generateShortUUID(),
    name: projectName ?? 'Untitled',
    version: EXPORT_APP_VERSION,
    exportVersion: `${EXPORT_JSON_VERSION}`,
    createdAt: createdAt ?? new Date().toISOString(),
    updatedAt: updatedAt ?? new Date().toISOString(),
    pads: padsJSON
  } as ProjectExport;
};

export const exportToJSONString = (
  store: StoreType,
  urlToExternalUrl: InternalToExternalUrlMap
) => {
  const json = exportToJSON(store, urlToExternalUrl);
  return JSON.stringify(json);
};

export const exportToURLString = (
  store: StoreType,
  urlToExternalUrl: InternalToExternalUrlMap
) => {
  const { context } = store.getSnapshot();

  const { projectId, projectName, createdAt, updatedAt, pads } = context;

  const padsURL = pads
    .map((pad) => exportPadToURLString(pad, urlToExternalUrl))
    .filter(Boolean);

  const createTimeMs = createdAt ? new Date(createdAt).getTime() : 0;
  const updateTimeMs = updatedAt ? new Date(updatedAt).getTime() : 0;

  // base64 encode the project name
  const projectNameBase64 = projectName ? encodeURIComponent(projectName) : '';

  return `${EXPORT_URL_VERSION}|${projectId}|${projectNameBase64}|${createTimeMs}|${updateTimeMs}|${padsURL.join('(')}`;
};

export const urlStringToProject = (urlString: string) => {
  const [
    version,
    projectId,
    projectNameBase64,
    createTimeMs,
    updateTimeMs,
    padsURL
  ] = urlString.split('|');

  if (parseInt(version, 10) !== EXPORT_URL_VERSION) {
    throw new Error('Unsupported export version');
  }

  const createdAt = new Date(parseInt(createTimeMs, 10));
  const updatedAt = new Date(parseInt(updateTimeMs, 10));

  const projectName = decodeURIComponent(projectNameBase64);

  const pads = padsURL
    .split('(')
    .map(importPadFromURLString)
    .filter(Boolean) as PadExport[];

  return {
    id: projectId,
    name: projectName,
    exportVersion: `${version}`,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    pads
  } as ProjectExport;
};

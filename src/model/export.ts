import { createLog } from '@helpers/log';
import { version as appVersion } from '../../package.json';
import { generateShortUUID } from '../helpers/uuid';
import { InternalToExternalUrlMap } from './hooks/useMetadata';
import { exportPadToJSON, exportPadToURLString } from './pad';
import { StoreType } from './store/types';
import { ProjectExport } from './types';

const log = createLog('model/export');

const EXPORT_JSON_VERSION = 1;
const EXPORT_APP_VERSION = appVersion;

export type ExportOptions = Record<string, unknown>;

export const exportToJSON = (
  store: StoreType,
  urlToExternalUrl: InternalToExternalUrlMap,
  options: ExportOptions = {}
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
  urlToExternalUrl: InternalToExternalUrlMap,
  options: ExportOptions = {}
) => {
  const json = exportToJSON(store, urlToExternalUrl, options);
  return JSON.stringify(json);
};

export const exportToURLString = (
  store: StoreType,
  urlToExternalUrl: InternalToExternalUrlMap,
  options: ExportOptions = {}
) => {
  const { context } = store.getSnapshot();

  const { projectId, projectName, createdAt, updatedAt, pads } = context;

  const padsURL = pads
    .map((pad) => exportPadToURLString(pad, urlToExternalUrl))
    .filter(Boolean);

  return `${projectId}|${projectName}|${createdAt}|${updatedAt}|${padsURL.join('|')}`;
};

import { createLog } from '@helpers/log';
import { generateShortUUID } from '../helpers/uuid';
import { InternalToExternalUrlMap } from './hooks/useMetadata';
import { exportPadToJSON, exportPadToURLString } from './pad';
import { StoreType } from './store/types';
import { Media, ProjectExport } from './types';

const log = createLog('model/export');

export interface ExportOptions {}

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

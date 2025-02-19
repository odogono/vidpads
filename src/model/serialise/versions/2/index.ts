import { compress, decompress } from '@helpers/compress';
import { dateToISOString, getDateFromUnixTime } from '@helpers/datetime';
import { createLog } from '@helpers/log';
import {
  addPadsAndSequencerToResult,
  exportToURLCommon
} from '@model/serialise/helpers';
import { importPadFromURLString } from '@model/serialise/pad';
import { importSequencerFromURLString } from '@model/serialise/sequencer';
import { ProjectStoreType } from '@model/store/types';
import { PadExport, ProjectExport } from '@model/types';

const log = createLog('serialise/2', ['debug']);

export const importFromURLStringV2 = async (data: string) => {
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

  log.debug('exportToURLStringV2', result);

  const compressed = await compress(result);

  return `2|${compressed}`;
};

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

const log = createLog('serialise/1', ['debug']);

export const importFromURLStringV1 = (urlString: string) => {
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

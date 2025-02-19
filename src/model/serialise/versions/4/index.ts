import { compress, decompress } from '@helpers/compress';
import { dateToISOString, getDateFromUnixTime } from '@helpers/datetime';
import { createLog } from '@helpers/log';
import { exportToURLCommon } from '@model/serialise/helpers';
import { importPadFromURLString } from '@model/serialise/pad';
import { importSequencerFromURLString } from '@model/serialise/sequencer';
import {
  exportStepSequencerToURLString,
  importStepSequencerFromURLString
} from '@model/serialise/stepSequencer';
import { ProjectStoreType } from '@model/store/types';
import { PadExport, ProjectExport } from '@model/types';

const log = createLog('serialise/4', ['debug']);

export const importFromURLStringV4 = async (data: string) => {
  const uncompressed = await decompress(data);

  log.debug('importFromURLStringV4', uncompressed);

  const parts = uncompressed.split('|');
  const [
    projectId,
    projectName,
    projectBgImage,
    createTimeSecs,
    updateTimeSecs,
    padsURL,
    sequencerURL,
    stepSequencerURL
  ] = parts;

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

  // log.debug('importFromURLStringV4', parts.length, parts, {
  //   projectId,
  //   projectName,
  //   projectBgImage,
  //   createdAt,
  //   updatedAt,
  //   pads,
  //   sequencer,
  //   stepSequencerURL
  // });

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

  const stepSequencerURL = exportStepSequencerToURLString(stepSequencer);

  const result = [
    projectId,
    projectName,
    projectBgImage,
    createTimeSecs,
    updateTimeSecs,
    padsURL || '',
    sequencerURL || '',
    stepSequencerURL || ''
  ].join('|');

  // log.debug('exportToURLStringV4', result, context);
  log.debug('exportToURLStringV4', { padsURL });

  const compressed = await compress(result);

  return `4|${compressed}`;
};

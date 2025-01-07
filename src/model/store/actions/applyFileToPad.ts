import { createLog } from '@helpers/log';
import { getMediaMetadata } from '@helpers/metadata';
import { getMediaType } from '@model/helpers';
import { MediaType } from '@model/types';
import { ApplyFileToPadAction, StoreContext } from '../types';

const log = createLog('store/actions/applyFileToPad');

// NOTE - xstate doesn't support async actions, so we need to use a promise
// to get the metadata and then return the context

export const applyFileToPad = (
  context: StoreContext,
  event: ApplyFileToPadAction
): StoreContext => {
  const { padId, file } = event;

  const pad = context.pads.find((pad) => pad.id === padId);
  if (!pad) {
    return context;
  }

  // const metadata = await getMediaMetadata(file);
  const metadata = {};

  // const isVideo = getMediaType(metadata) === MediaType.Video;
  const isVideo = true;

  if (isVideo) {
    log.debug('extracting video thumbnail');
    // const thumbnail = await extractVideoThumbnail(ffmpeg, file);
  } else {
    log.info('Image metadata:', metadata);
  }

  return context;
};

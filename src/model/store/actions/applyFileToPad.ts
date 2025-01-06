import { createLog } from '@helpers/log';
import { getMediaMetadata } from '@helpers/metadata';
import { getMediaType } from '@model/helpers';
import { MediaType } from '@model/types';
import { ApplyFileToPadAction, StoreContext } from '../types';

const log = createLog('store/actions/applyFileToPad');

export const applyFileToPad = async (
  context: StoreContext,
  event: ApplyFileToPadAction
): Promise<StoreContext> => {
  const { padId, file } = event;

  const pad = context.pads.find((pad) => pad.id === padId);
  if (!pad) {
    return context;
  }

  const metadata = await getMediaMetadata(file);

  const isVideo = getMediaType(metadata) === MediaType.Video;

  if (isVideo) {
    log.debug('extracting video thumbnail');
    // const thumbnail = await extractVideoThumbnail(ffmpeg, file);
  } else {
    log.info('Image metadata:', metadata);
  }

  return context;
};

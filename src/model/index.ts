import { createLog } from '@helpers/log';
import { deleteMediaData } from '@model/db/api';
import { getPadById, getPadsBySourceUrl } from '@model/store/selectors';
import { StoreType } from '@model/store/types';

const log = createLog('model/api');

export const clearPad = async (
  store: StoreType,
  padId: string
): Promise<boolean> => {
  // retrieve the pad data
  const pad = getPadById(store, padId);
  if (!pad) {
    log.warn('[clearPad] Pad not found:', padId);
    return false;
  }

  const sourceUrl = pad.pipeline.source?.url;

  // nothing to clear
  if (!sourceUrl) {
    log.warn('[clearPad] No source URL found:', padId);
    return false;
  }

  const pads = getPadsBySourceUrl(store, sourceUrl);

  // if there is only one pad using this source, then its
  // safe to delete the source data
  if (pads.length === 1) {
    log.debug('[clearPad] Deleting source data:', sourceUrl);
    await deleteMediaData(sourceUrl);
  } else {
    log.warn('[clearPad] More than one pad using this source:', sourceUrl);
  }

  store.send({
    type: 'clearPad',
    padId
  });

  return true;
};

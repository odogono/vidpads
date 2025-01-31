import { useCallback } from 'react';

import toast from 'react-hot-toast';

import { useKeyboard } from '@helpers/keyboard';
import { createLog } from '@helpers/log';
import { invalidateQueryKeys } from '@helpers/query';
import { getYouTubeThumbnail } from '@helpers/youtube';
import {
  AddFileToPadProps,
  AddUrlToPadProps,
  CopyPadToPadProps,
  addFileToPad,
  addUrlToPad
} from '@model';
import { VOKeys } from '@model/constants';
import {
  copyPadThumbnail as dbCopyPadThumbnail,
  deleteAllPadThumbnails as dbDeleteAllPadThumbnails,
  deleteMediaData as dbDeleteMediaData,
  deletePadThumbnail as dbDeletePadThumbnail,
  getPadThumbnail as dbGetPadThumbnail,
  getThumbnailFromUrl as dbGetThumbnailFromUrl,
  saveUrlData as dbSaveUrlData,
  setPadThumbnail as dbSetPadThumbnail
} from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import { getPadById, getPadsBySourceUrl } from '@model/store/selectors';
import { useStore } from '@model/store/useStore';
import { Media, MediaYouTube, Pad } from '@model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { readFromClipboard, writeToClipboard } from '../../helpers/clipboard';
import { getUrlMetadata, isYouTubeMetadata } from '../../helpers/metadata';
import { exportPadToClipboard, importPadFromClipboard } from '../serialise/pad';

const log = createLog('model/usePadOperations');

export interface PadOperationsOptions {
  showToast: boolean;
}

export const usePadOperations = () => {
  const { store } = useStore();
  const queryClient = useQueryClient();
  const { isShiftKeyDown } = useKeyboard();

  const { mutateAsync: deletePadMediaOp } = useMutation({
    mutationFn: async (pad: Pad) => {
      if (!pad) return null;

      const sourceUrl = getPadSourceUrl(pad);
      if (!sourceUrl) return null;

      const pads = getPadsBySourceUrl(store, sourceUrl);

      // if there is only one pad using this source, then its
      // safe to delete the source data
      if (pads.length === 1) {
        log.debug('[useDeletePadMedia] Deleting source data:', sourceUrl);
        await dbDeleteMediaData(sourceUrl);
        queryClient.invalidateQueries({ queryKey: VOKeys.metadata(sourceUrl) });
      }

      await dbDeletePadThumbnail(pad.id);

      invalidateQueryKeys(queryClient, [[...VOKeys.padThumbnail(pad.id)]]);

      return pad;
    }
  });

  const { mutateAsync: addFileToPadOp } = useMutation({
    mutationFn: async (props: AddFileToPadProps) => {
      const media = await addFileToPad({ ...props, store });
      if (!media) return null;

      invalidateQueryKeys(queryClient, [
        [...VOKeys.padThumbnail(props.padId)],

        // all metadata has to be invalidated so that the useMetadata query
        // can be refetched correctly
        [...VOKeys.allMetadata()]
      ]);

      return media;
    }
  });

  const { mutateAsync: addUrlToPadOp } = useMutation({
    mutationFn: async (props: AddUrlToPadProps) => {
      const media = await addUrlToPad({ ...props, store });
      if (!media) return null;

      invalidateQueryKeys(queryClient, [
        [...VOKeys.padThumbnail(props.padId)],
        // all metadata has to be invalidated so that the useMetadata query
        // can be refetched correctly
        [...VOKeys.allMetadata()]
      ]);

      return media;
    }
  });

  const { mutateAsync: copyPadToPadOp } = useMutation({
    mutationFn: async ({ sourcePadId, targetPadId }: CopyPadToPadProps) => {
      const targetPad = getPadById(store, targetPadId);
      if (!targetPad) {
        log.warn('[copyPad] Pad not found:', targetPadId);
        return null;
      }

      // clear the target pad
      await deletePadMediaOp(targetPad);

      await dbCopyPadThumbnail(sourcePadId, targetPadId);

      const sourcePad = getPadById(store, sourcePadId);
      const sourcePadUrl = getPadSourceUrl(sourcePad);
      if (sourcePadUrl) {
        queryClient.invalidateQueries({
          queryKey: VOKeys.metadata(sourcePadUrl)
        });
      }

      const targetPadUrl = getPadSourceUrl(targetPad);
      if (targetPadUrl) {
        queryClient.invalidateQueries({
          queryKey: VOKeys.metadata(targetPadUrl)
        });
      }

      invalidateQueryKeys(queryClient, [
        [...VOKeys.padThumbnail(targetPad.id)]
      ]);

      store.send({
        type: 'copyPad',
        sourcePadId,
        targetPadId,
        copySourceOnly: isShiftKeyDown()
      });
    }
  });

  const copyPadOp = useCallback(
    async ({
      sourcePadId,
      showToast = true
    }: Partial<PadOperationsOptions> & {
      sourcePadId: string;
    }) => {
      const pad = getPadById(store, sourcePadId);
      if (!pad) {
        log.debug('[copyPad] Pad not found:', sourcePadId);
        return false;
      }

      const urlString = exportPadToClipboard(pad);
      if (!urlString) {
        log.debug('[copyPad] could not export pad:', sourcePadId);
        return false;
      }

      await writeToClipboard(urlString);

      if (showToast) {
        toast.success(`Copied ${sourcePadId} to clipboard`);
      }

      return true;
      // copyPadToPadOp({ sourcePadId: pad.id, targetPadId: pad.id });
    },
    [store]
  );

  const pastePadOp = useCallback(
    async ({
      targetPadId,
      showToast = true
    }: Partial<PadOperationsOptions> & { targetPadId: string }) => {
      const clipboard = await readFromClipboard();

      log.debug('[pastePad] clipboard:', clipboard, { targetPadId });

      // if (clipboard) {
      //   log.debug('[pastePad] query cache:', queryClient.getQueryCache());
      //   toast.error('Paste aborted');
      //   return false;
      // }

      const sourcePad = importPadFromClipboard(clipboard);
      if (!sourcePad) {
        log.debug('[pastePad] could not import pad:', clipboard);
        return false;
      }

      const targetPad = getPadById(store, targetPadId);
      if (!targetPad) {
        log.warn('[pastePad] Pad not found:', targetPadId);
        return false;
      }

      const sourcePadUrl = getPadSourceUrl(sourcePad);

      if (!sourcePadUrl) {
        log.debug('[pastePad] No source url found for incoming pad');
        log.debug('[pastePad] pad:', sourcePad);
        return false;
      }

      const media = await getUrlMetadata(sourcePadUrl);

      if (!media) {
        log.debug('[pastePad] No metadata found for url:', sourcePadUrl);
        return false;
      }

      const thumbnail = await getThumbnailFromSourcePad(sourcePad, media);

      if (!thumbnail) {
        log.debug('[pastePad] No thumbnail found for url:', sourcePadUrl);
        return false;
      }

      // clear the target pad
      await deletePadMediaOp(targetPad);
      log.debug('[pastePad] deleted target pad media:', targetPad.id);

      await dbSaveUrlData({
        media: media as MediaYouTube,
        thumbnail
      });

      log.debug('[pastePad] saved url data:', sourcePadUrl);

      await dbSetPadThumbnail(targetPad.id, thumbnail);
      log.debug('[pastePad] set pad thumbnail:', targetPad.id);
      store.send({
        type: 'applyPad',
        pad: sourcePad,
        targetPadId,
        copySourceOnly: isShiftKeyDown()
      });

      log.debug('[pastePad] applied pad:', targetPad.id);

      // Update the store with the tile's video ID
      // store.send({
      //   type: 'setPadMedia',
      //   padId: targetPad.id,
      //   media
      // });

      invalidateQueryKeys(queryClient, [
        [...VOKeys.allMetadata()],
        [...VOKeys.pad(targetPad.id)]
      ]);

      if (showToast) {
        toast.success(`Pasted ${targetPad.id} from clipboard`);
      }

      return true;
    },
    [deletePadMediaOp, isShiftKeyDown, queryClient, store]
  );

  const { mutateAsync: cutPadOp } = useMutation({
    mutationFn: async ({
      sourcePadId,
      showToast = true
    }: Partial<PadOperationsOptions> & { sourcePadId: string }) => {
      const pad = getPadById(store, sourcePadId);
      if (!pad) {
        log.debug('[cutPad] Pad not found:', sourcePadId);
        return false;
      }

      if (
        !(await copyPadOp({
          sourcePadId,
          showToast: false
        }))
      ) {
        log.debug('[cutPad] could not copy pad:', sourcePadId);
        return false;
      }

      await deletePadMediaOp(pad);

      store.send({
        type: 'clearPad',
        padId: sourcePadId
      });

      if (showToast) {
        toast.success(`Cut ${sourcePadId} to clipboard`);
      }

      return true;
    }
  });

  const { mutateAsync: clearPadOp } = useMutation({
    mutationFn: async ({
      sourcePadId,
      showToast = true
    }: Partial<PadOperationsOptions> & { sourcePadId: string }) => {
      const pad = getPadById(store, sourcePadId);
      if (!pad) {
        log.debug('[clearPad] Pad not found:', sourcePadId);
        return false;
      }

      log.debug('[clearPad] deleting pad media:', sourcePadId);

      await deletePadMediaOp(pad);

      store.send({
        type: 'clearPad',
        padId: sourcePadId
      });

      if (showToast) {
        toast.success(`Cleared ${sourcePadId}`);
      }

      return true;
    }
  });

  const { mutateAsync: deleteAllPadThumbnails } = useMutation({
    mutationFn: async () => {
      await dbDeleteAllPadThumbnails();
    },
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [[...VOKeys.pads()]]);
    }
  });

  return {
    store,
    addFileToPad: addFileToPadOp,
    addUrlToPad: addUrlToPadOp,
    copyPadToPad: copyPadToPadOp,
    clearPad: clearPadOp,
    deleteAllPadThumbnails,
    copyPadToClipboard: copyPadOp,
    cutPadToClipboard: cutPadOp,
    pastePadFromClipboard: pastePadOp
  };
};

const getThumbnailFromSourcePad = async (sourcePad?: Pad, media?: Media) => {
  if (!sourcePad || !media) {
    return null;
  }

  // look for a local thumbnail
  const sourcePadUrl = getPadSourceUrl(sourcePad);
  const thumbnail =
    (await dbGetPadThumbnail(sourcePad.id)) ??
    (await dbGetThumbnailFromUrl(sourcePadUrl));

  if (thumbnail) {
    return thumbnail;
  }

  if (isYouTubeMetadata(media)) {
    const thumbnail = await getYouTubeThumbnail(media as MediaYouTube);

    if (thumbnail) {
      return thumbnail;
    }
  }

  return null;
};

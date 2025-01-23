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
import {
  QUERY_KEY_METADATA,
  QUERY_KEY_PAD_THUMBNAIL,
  VOKeys
} from '@model/constants';
import {
  copyPadThumbnail as dbCopyPadThumbnail,
  deleteAllPadThumbnails as dbDeleteAllPadThumbnails,
  deleteMediaData as dbDeleteMediaData,
  deletePadThumbnail as dbDeletePadThumbnail,
  saveUrlData as dbSaveUrlData,
  setPadThumbnail as dbSetPadThumbnail
} from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import { getPadById, getPadsBySourceUrl } from '@model/store/selectors';
import { useStore } from '@model/store/useStore';
import { MediaYouTube, Pad } from '@model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getUrlMetadata } from '../../helpers/metadata';
import { exportPadToClipboard, importPadFromClipboard } from '../serialise/pad';
import { useMetadata } from './useMetadata';

const log = createLog('model/usePadOperations');

export const usePadOperations = () => {
  const { store } = useStore();
  const queryClient = useQueryClient();
  const { isShiftKeyDown } = useKeyboard();
  const { urlToExternalUrl } = useMetadata();

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
        invalidateQueryKeys(queryClient, [[QUERY_KEY_METADATA, sourceUrl]]);
      }

      await dbDeletePadThumbnail(pad.id);

      invalidateQueryKeys(queryClient, [[QUERY_KEY_PAD_THUMBNAIL, pad.id]]);

      return pad;
    }
  });

  const { mutateAsync: addFileToPadOp } = useMutation({
    mutationFn: async (props: AddFileToPadProps) => {
      const media = await addFileToPad({ ...props, store });
      if (!media) return null;

      // Invalidate the pad-thumbnail query to trigger a refetch
      invalidateQueryKeys(queryClient, [
        [QUERY_KEY_PAD_THUMBNAIL, props.padId],

        // all metadata has to be invalidated so that the useMetadata query
        // can be refetched correctly
        [QUERY_KEY_METADATA]
      ]);

      return media;
    }
  });

  const { mutateAsync: addUrlToPadOp } = useMutation({
    mutationFn: async (props: AddUrlToPadProps) => {
      const media = await addUrlToPad({ ...props, store });
      if (!media) return null;

      invalidateQueryKeys(queryClient, [
        [QUERY_KEY_PAD_THUMBNAIL, props.padId],
        // all metadata has to be invalidated so that the useMetadata query
        // can be refetched correctly
        [QUERY_KEY_METADATA]
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
        invalidateQueryKeys(queryClient, [[QUERY_KEY_METADATA, sourcePadUrl]]);
      }

      const targetPadUrl = getPadSourceUrl(targetPad);
      if (targetPadUrl) {
        invalidateQueryKeys(queryClient, [[QUERY_KEY_METADATA, targetPadUrl]]);
      }

      invalidateQueryKeys(queryClient, [
        [QUERY_KEY_PAD_THUMBNAIL, targetPad.id]
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
    async (padId: string) => {
      const pad = getPadById(store, padId);
      if (!pad) {
        log.debug('[copyPad] Pad not found:', padId);
        return false;
      }

      const urlString = exportPadToClipboard(pad, urlToExternalUrl);
      if (!urlString) {
        log.debug('[copyPad] could not export pad:', padId);
        return false;
      }

      await navigator.clipboard.writeText(urlString);

      toast.success(`Copied ${padId} to clipboard`);

      return true;
      // copyPadToPadOp({ sourcePadId: pad.id, targetPadId: pad.id });
    },
    [store, urlToExternalUrl]
  );

  const pastePadOp = useCallback(
    async ({ targetPadId }: { targetPadId: string }) => {
      const clipboard = await navigator.clipboard.readText();

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

      const thumbnail = await getYouTubeThumbnail(media as MediaYouTube);

      if (!thumbnail) {
        log.debug('[pastePad] No thumbnail found for url:', sourcePadUrl);
        return false;
      }

      await dbSaveUrlData({
        media: media as MediaYouTube,
        thumbnail
      });

      // clear the target pad
      await deletePadMediaOp(targetPad);

      store.send({
        type: 'applyPad',
        pad: sourcePad,
        targetPadId,
        copySourceOnly: isShiftKeyDown()
      });

      log.debug('[addUrlToPad] thumbnail:', media.url, thumbnail);

      await dbSetPadThumbnail(targetPad.id, thumbnail);

      // Update the store with the tile's video ID
      store.send({
        type: 'setPadMedia',
        padId: targetPad.id,
        media
      });

      invalidateQueryKeys(queryClient, [
        [QUERY_KEY_METADATA, sourcePadUrl],
        [QUERY_KEY_PAD_THUMBNAIL, targetPad.id],
        VOKeys.pad(targetPad.id),
        VOKeys.metadata(sourcePadUrl)
      ] as readonly string[][]);

      toast.success(`Pasted ${targetPad.id} from clipboard`);

      return true;
    },
    [deletePadMediaOp, isShiftKeyDown, queryClient, store]
  );

  const { mutateAsync: cutPadOp } = useMutation({
    mutationFn: async (padId: string) => {
      const pad = getPadById(store, padId);
      if (!pad) {
        log.debug('[cutPad] Pad not found:', padId);
        return false;
      }

      if (!(await copyPadOp(padId))) {
        log.debug('[cutPad] could not copy pad:', padId);
        return false;
      }

      await deletePadMediaOp(pad);

      store.send({
        type: 'clearPad',
        padId
      });

      toast.success(`Cut ${padId} to clipboard`);

      return true;
    }
  });

  const { mutateAsync: clearPadOp } = useMutation({
    mutationFn: async (padId: string) => {
      const pad = getPadById(store, padId);
      if (!pad) {
        log.warn('[clearPad] Pad not found:', padId);
        return false;
      }

      await deletePadMediaOp(pad);

      store.send({
        type: 'clearPad',
        padId
      });

      toast.success(`Cleared ${padId}`);
    }
  });

  const { mutateAsync: deleteAllPadThumbnails } = useMutation({
    mutationFn: async () => {
      await dbDeleteAllPadThumbnails();
    },
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [[QUERY_KEY_PAD_THUMBNAIL]]);
    }
  });

  return {
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

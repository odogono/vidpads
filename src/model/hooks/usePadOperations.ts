import { useKeyboard } from '@helpers/keyboard';
import { createLog } from '@helpers/log';
import { invalidateQueryKeys } from '@helpers/query';
import {
  AddFileToPadProps,
  AddUrlToPadProps,
  CopyPadToPadProps,
  addFileToPad,
  addUrlToPad
} from '@model';
import { QUERY_KEY_METADATA, QUERY_KEY_PAD_THUMBNAIL } from '@model/constants';
import {
  copyPadThumbnail as dbCopyPadThumbnail,
  deleteAllPadThumbnails as dbDeleteAllPadThumbnails,
  deleteMediaData as dbDeleteMediaData,
  deletePadThumbnail as dbDeletePadThumbnail
} from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import { getPadById, getPadsBySourceUrl } from '@model/store/selectors';
import { useStore } from '@model/store/useStore';
import { Pad } from '@model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const log = createLog('model/api');

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
    deleteAllPadThumbnails
  };
};

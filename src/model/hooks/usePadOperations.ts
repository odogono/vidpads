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
import {
  QUERY_KEY_PADS_METADATA,
  QUERY_KEY_PAD_METADATA,
  QUERY_KEY_PAD_THUMBNAIL
} from '@model/constants';
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
        invalidateQueryKeys(queryClient, [[QUERY_KEY_PADS_METADATA]]);
      }

      await dbDeletePadThumbnail(pad.id);

      return pad;
    },
    onSuccess: (data, pad) => {
      log.debug('[useDeletePadMedia] Invalidate queries:', pad.id);
      invalidateQueryKeys(queryClient, [[QUERY_KEY_PAD_METADATA, pad.id]]);
    }
  });

  const { mutateAsync: addFileToPadOp } = useMutation({
    mutationFn: (props: AddFileToPadProps) => addFileToPad({ ...props, store }),
    onSuccess: (data, props) => {
      // Invalidate the pad-thumbnail query to trigger a refetch
      invalidateQueryKeys(queryClient, [
        [QUERY_KEY_PAD_THUMBNAIL, props.padId],
        [QUERY_KEY_PAD_METADATA, props.padId],
        [QUERY_KEY_PADS_METADATA]
      ]);
      return data;
    }
  });

  const { mutateAsync: addUrlToPadOp } = useMutation({
    mutationFn: (props: AddUrlToPadProps) => addUrlToPad({ ...props, store }),
    onSuccess: (data, props) => {
      // Invalidate the pad-thumbnail query to trigger a refetch
      invalidateQueryKeys(queryClient, [
        [QUERY_KEY_PAD_THUMBNAIL, props.padId],
        [QUERY_KEY_PAD_METADATA, props.padId],
        [QUERY_KEY_PADS_METADATA]
      ]);
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

      store.send({
        type: 'copyPad',
        sourcePadId,
        targetPadId,
        copySourceOnly: isShiftKeyDown()
      });
    },
    onSuccess: (data, { sourcePadId, targetPadId }) => {
      log.debug('[copyPad] Invalidate queries:', sourcePadId, targetPadId);
      invalidateQueryKeys(queryClient, [
        [QUERY_KEY_PAD_THUMBNAIL, sourcePadId],
        [QUERY_KEY_PAD_THUMBNAIL, targetPadId],
        [QUERY_KEY_PAD_METADATA, sourcePadId],
        [QUERY_KEY_PAD_METADATA, targetPadId],
        [QUERY_KEY_PADS_METADATA]
      ]);
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
    },
    onSuccess: (data, padId) => {
      log.debug('[clearPad] Invalidate queries:', padId);
      invalidateQueryKeys(queryClient, [
        [QUERY_KEY_PAD_THUMBNAIL, padId],
        [QUERY_KEY_PAD_METADATA, padId],
        [QUERY_KEY_PADS_METADATA]
      ]);
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

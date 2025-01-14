import { useCallback } from 'react';

import { useKeyboard } from '@helpers/keyboard';
import { createLog } from '@helpers/log';
import { copyPadThumbnail as dbCopyPadThumbnail } from '@model/db/api';
import { getPadById } from '@model/store/selectors';
import { useStore } from '@model/store/useStore';
import { useQueryClient } from '@tanstack/react-query';
import {
  AddFileToPadProps,
  AddUrlToPadProps,
  CopyPadToPadProps,
  addFileToPad,
  addUrlToPad,
  deletePadMedia
} from '../';

const log = createLog('model/api');

const QUERY_KEY_PAD_THUMBNAIL = 'pad-thumbnail';

export const usePadOperations = () => {
  const { store } = useStore();
  const queryClient = useQueryClient();
  const { isShiftKeyDown } = useKeyboard();

  const addFileToPadOp = useCallback(
    async (props: AddFileToPadProps) => {
      const metadata = await addFileToPad({ ...props, store });

      // Invalidate the pad-thumbnail query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, props.padId]
      });

      return metadata;
    },
    [queryClient, store]
  );

  const addUrlToPadOp = useCallback(
    async (props: AddUrlToPadProps) => {
      const metadata = await addUrlToPad({ ...props, store });

      // Invalidate the pad-thumbnail query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, props.padId]
      });

      return metadata;
    },
    [store, queryClient]
  );

  const copyPadToPadOp = useCallback(
    async ({ sourcePadId, targetPadId }: CopyPadToPadProps) => {
      const targetPad = getPadById(store, targetPadId);
      if (!targetPad) {
        log.warn('[copyPad] Pad not found:', targetPadId);
        return false;
      }

      // clear the target pad
      await deletePadMedia(store, targetPad);

      await dbCopyPadThumbnail(sourcePadId, targetPadId);

      store.send({
        type: 'copyPad',
        sourcePadId,
        targetPadId,
        copySourceOnly: isShiftKeyDown()
      });

      // Invalidate the pad-thumbnail query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, sourcePadId]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, targetPadId]
      });
      return true;
    },
    [store, queryClient, isShiftKeyDown]
  );

  const clearPadOp = useCallback(
    async (padId: string) => {
      const pad = getPadById(store, padId);
      if (!pad) {
        log.warn('[clearPad] Pad not found:', padId);
        return false;
      }

      await deletePadMedia(store, pad);

      store.send({
        type: 'clearPad',
        padId
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_PAD_THUMBNAIL, padId]
      });
      return true;
    },
    [store, queryClient]
  );

  return {
    addFileToPad: addFileToPadOp,
    addUrlToPad: addUrlToPadOp,
    copyPadToPad: copyPadToPadOp,
    clearPad: clearPadOp
  };
};

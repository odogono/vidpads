import { useCallback } from 'react';

import toast from 'react-hot-toast';

import { readFromClipboard, writeToClipboard } from '@helpers/clipboard';
import { useKeyboard } from '@helpers/keyboard';
import { createLog } from '@helpers/log';
import { getUrlMetadata, isYouTubeMetadata } from '@helpers/metadata';
import { invalidateQueryKeys } from '@helpers/query';
import { getYouTubeThumbnail } from '@helpers/youtube';
import { useProject } from '@hooks/useProject';
import {
  AddFileToPadProps,
  AddUrlToPadProps,
  CopyPadToPadProps,
  addFileToPad
} from '@model';
import { VOKeys } from '@model/constants';
import {
  copyPadThumbnail as dbCopyPadThumbnail,
  deleteAllPadThumbnails as dbDeleteAllPadThumbnails,
  deletePadThumbnail as dbDeletePadThumbnail,
  getPadThumbnail as dbGetPadThumbnail,
  getThumbnailFromUrl as dbGetThumbnailFromUrl,
  saveMediaData as dbSaveMediaData,
  saveMediaThumbnail as dbSaveMediaThumbnail,
  savePadThumbnail as dbSavePadThumbnail
} from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import { getPadById, getPadsBySourceUrl } from '@model/store/selectors';
import { Media, MediaYouTube, Pad } from '@model/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exportPadToClipboard, importPadFromClipboard } from '../serialise/pad';

const log = createLog('model/usePadOperations');

export interface PadOperationsOptions {
  showToast: boolean;
}

export const usePadOperations = () => {
  const { project, projectId } = useProject();
  const queryClient = useQueryClient();
  const { isShiftKeyDown } = useKeyboard();

  const { mutateAsync: deletePadMediaOp } = useMutation({
    mutationFn: async (pad: Pad) => {
      if (!pad) return null;

      const sourceUrl = getPadSourceUrl(pad);
      if (!sourceUrl) return null;

      const pads = getPadsBySourceUrl(project, sourceUrl);

      // if there is only one pad using this source, then its
      // safe to delete the source data
      if (pads.length === 1) {
        log.debug('[useDeletePadMedia] Deleting source data:', sourceUrl);
        // not safe to do this anymore since we have multiple projects
        // await dbDeleteMediaData(sourceUrl);
        queryClient.invalidateQueries({ queryKey: VOKeys.metadata(sourceUrl) });
      }

      await dbDeletePadThumbnail(projectId, pad.id);

      invalidateQueryKeys(queryClient, [
        [...VOKeys.padThumbnail(projectId, pad.id)]
      ]);

      return pad;
    }
  });

  const { mutateAsync: addFileToPadOp } = useMutation({
    mutationFn: async (props: AddFileToPadProps) => {
      const media = await addFileToPad({ ...props, project, projectId });
      if (!media) return null;

      invalidateQueryKeys(queryClient, [
        [...VOKeys.padThumbnail(projectId, props.padId)],

        // all metadata has to be invalidated so that the useMetadata query
        // can be refetched correctly
        [...VOKeys.allMetadata()]
      ]);

      return media;
    }
  });

  const { mutateAsync: addUrlToPadOp } = useMutation({
    mutationFn: async (props: AddUrlToPadProps) => {
      const { padId, url } = props;
      // determine the type of url
      const media = await getUrlMetadata(url);

      if (!media) {
        log.debug('[addUrlToPad] No metadata found for url:', url);
        return null;
      }

      await dbSaveMediaData(media);

      const mediaThumbnail = await getThumbnailFromMedia(media);

      if (mediaThumbnail) {
        await dbSaveMediaThumbnail(media, mediaThumbnail);
        await dbSavePadThumbnail(projectId, padId, mediaThumbnail);
      }

      project.send({
        type: 'setPadMedia',
        padId,
        media
      });

      invalidateQueryKeys(queryClient, [
        [...VOKeys.padThumbnail(padId)],
        // all metadata has to be invalidated so that the useMetadata query
        // can be refetched correctly
        [...VOKeys.allMetadata()]
      ]);

      return media;
    }
  });

  const { mutateAsync: copyPadToPadOp } = useMutation({
    mutationFn: async ({ sourcePadId, targetPadId }: CopyPadToPadProps) => {
      const targetPad = getPadById(project, targetPadId);
      if (!targetPad) {
        log.warn('[copyPad] Pad not found:', targetPadId);
        return null;
      }

      // clear the target pad
      await deletePadMediaOp(targetPad);

      await dbCopyPadThumbnail(projectId, sourcePadId, targetPadId);

      const sourcePad = getPadById(project, sourcePadId);
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
        [...VOKeys.padThumbnail(projectId, targetPad.id)]
      ]);

      project.send({
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
      const pad = getPadById(project, sourcePadId);
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
    [project]
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

      const targetPad = getPadById(project, targetPadId);
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

      const thumbnail = await getThumbnailFromSourcePad(
        projectId,
        sourcePad,
        media
      );

      if (!thumbnail) {
        log.debug('[pastePad] No thumbnail found for url:', sourcePadUrl);
        return false;
      }

      // clear the target pad
      // await deletePadMediaOp(targetPad);
      // log.debug('[pastePad] deleted target pad media:', targetPad.id);

      if (media) {
        await dbSaveMediaData(media);
      }

      if (thumbnail) {
        await dbSaveMediaThumbnail(media, thumbnail);
        await dbSavePadThumbnail(projectId, targetPad.id, thumbnail);
      }

      log.debug('[pastePad] target pad media:', targetPad.id, media);

      // log.debug('[pastePad] set pad thumbnail:', targetPad.id);
      project.send({
        type: 'applyPad',
        pad: sourcePad,
        targetPadId,
        copySourceOnly: isShiftKeyDown()
      });

      // queryClient.invalidateQueries({ queryKey: VOKeys.pad(targetPad.id) });
      invalidateQueryKeys(queryClient, [
        [...VOKeys.pad(projectId, targetPad.id)],
        [...VOKeys.padThumbnail(projectId, targetPad.id)],
        // all metadata has to be invalidated so that the useMetadata query
        // can be refetched correctly
        [...VOKeys.allMetadata()]
      ]);

      if (showToast) {
        toast.success(`Pasted ${targetPad.id} from clipboard`);
      }

      return true;
    },
    [project, projectId, isShiftKeyDown, queryClient]
  );

  const { mutateAsync: cutPadOp } = useMutation({
    mutationFn: async ({
      sourcePadId,
      showToast = true
    }: Partial<PadOperationsOptions> & { sourcePadId: string }) => {
      const pad = getPadById(project, sourcePadId);
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

      project.send({
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
      const pad = getPadById(project, sourcePadId);
      if (!pad) {
        log.debug('[clearPad] Pad not found:', sourcePadId);
        return false;
      }

      log.debug('[clearPad] deleting pad media:', sourcePadId);

      await deletePadMediaOp(pad);

      project.send({
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
      await dbDeleteAllPadThumbnails(projectId);
    },
    onSuccess: () => {
      invalidateQueryKeys(queryClient, [[...VOKeys.pads(projectId)]]);
    }
  });

  return {
    project,
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

const getThumbnailFromSourcePad = async (
  projectId: string,
  sourcePad?: Pad,
  media?: Media
) => {
  if (!sourcePad || !media) {
    return null;
  }

  const sourcePadThumbnail = await dbGetPadThumbnail(projectId, sourcePad.id);

  if (sourcePadThumbnail) {
    return sourcePadThumbnail;
  }

  return getThumbnailFromMedia(media);
};

const getThumbnailFromMedia = async (media: Media) => {
  if (!media) {
    return null;
  }
  const thumbnail = await dbGetThumbnailFromUrl(media.url);
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

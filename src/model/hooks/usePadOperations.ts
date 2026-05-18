import { useProjectMediaWorkflow } from './useProjectMediaWorkflow';

export interface PadOperationsOptions {
  showToast?: boolean;
  copyToClipboard?: boolean;
}

export interface AddFileToPadProps {
  file: File;
  padId: string;
  projectId?: string;
}

export interface AddUrlToPadProps {
  url: string;
  padId: string;
  projectId?: string;
}

export interface CopyPadToPadProps {
  sourcePadId: string;
  targetPadId: string;
}

export const usePadOperations = () => {
  const {
    project,
    projectId,
    putMediaOnPad,
    copyPad,
    movePad,
    clearPad,
    deleteAllPadThumbnails,
    clipboard
  } = useProjectMediaWorkflow();

  return {
    project,
    projectId,
    addFileToPad: ({ file, padId }: AddFileToPadProps) =>
      putMediaOnPad(padId, file),
    addUrlToPad: ({ url, padId }: AddUrlToPadProps) =>
      putMediaOnPad(padId, url),
    copyPadToPad: ({ sourcePadId, targetPadId }: CopyPadToPadProps) =>
      copyPad(sourcePadId, targetPadId),
    movePadToPad: ({ sourcePadId, targetPadId }: CopyPadToPadProps) =>
      movePad(sourcePadId, targetPadId),
    clearPad: ({
      sourcePadId
    }: Partial<PadOperationsOptions> & { sourcePadId: string }) =>
      clearPad(sourcePadId),
    deleteAllPadThumbnails,
    copyPadToClipboard: ({
      sourcePadId,
      copyToClipboard = true
    }: Partial<PadOperationsOptions> & { sourcePadId: string }) =>
      clipboard.copy(sourcePadId, { copyToClipboard }),
    cutPadToClipboard: async ({
      sourcePadId,
      copyToClipboard = true
    }: Partial<PadOperationsOptions> & { sourcePadId: string }) =>
      clipboard.cut(sourcePadId, { copyToClipboard }),
    pastePadFromClipboard: ({
      targetPadId,
      url
    }: Partial<PadOperationsOptions> & {
      targetPadId: string;
      url?: string;
    }) => clipboard.paste(targetPadId, { data: url })
  };
};

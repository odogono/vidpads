'use client';

import { useEffect, useMemo } from 'react';

import { useKeyboard } from '@hooks/useKeyboard';
import { useProject } from '@hooks/useProject';
import {
  AttachMediaInput,
  createBrowserProjectMediaWorkflowDeps,
  createProjectMediaSession
} from '@model/projectMediaWorkflow';
import { useQueryClient } from '@tanstack/react-query';

export interface PadOperationOptions {
  showToast?: boolean;
  copyToClipboard?: boolean;
}

export const useProjectMediaWorkflow = () => {
  const { project, projectId } = useProject();
  const queryClient = useQueryClient();
  const keyboard = useKeyboard();

  const session = useMemo(() => {
    const deps = createBrowserProjectMediaWorkflowDeps({ queryClient });
    return createProjectMediaSession({
      deps,
      projectId,
      store: project,
      autosave: false
    });
  }, [project, projectId, queryClient]);

  useEffect(() => {
    return () => session.dispose();
  }, [session]);

  return {
    project,
    projectId,
    putMediaOnPad: (padId: string, input: AttachMediaInput) =>
      session.attachMedia({ padId, input }),
    copyPad: (
      sourcePadId: string,
      targetPadId: string,
      options?: { sourceOnly?: boolean }
    ) =>
      session.copyPad({ sourcePadId, writeClipboard: false }).then((source) =>
        source
          ? session.pastePad({
              targetPadId,
              source,
              mode:
                (options?.sourceOnly ?? keyboard.isShiftKeyDown())
                  ? 'source-only'
                  : 'full-pad'
            })
          : false
      ),
    movePad: (
      sourcePadId: string,
      targetPadId: string,
      options?: { sourceOnly?: boolean }
    ) =>
      session.movePad({
        sourcePadId,
        targetPadId,
        mode:
          (options?.sourceOnly ?? keyboard.isShiftKeyDown())
            ? 'source-only'
            : 'full-pad'
      }),
    clearPad: (padId: string) => session.clearPad({ padId }),
    deleteAllPadThumbnails: () => session.deleteAllPadThumbnails(),
    clipboard: {
      copy: (
        sourcePadId: string,
        options?: Pick<PadOperationOptions, 'copyToClipboard'>
      ) =>
        session.copyPad({
          sourcePadId,
          writeClipboard: options?.copyToClipboard ?? true
        }),
      cut: async (
        sourcePadId: string,
        options?: Pick<PadOperationOptions, 'copyToClipboard'>
      ) => {
        const data = await session.copyPad({
          sourcePadId,
          writeClipboard: options?.copyToClipboard ?? true
        });
        if (!data) return false;
        await session.clearPad({ padId: sourcePadId });
        return data;
      },
      paste: (
        targetPadId: string,
        options?: { data?: string; sourceOnly?: boolean }
      ) =>
        session.pastePad({
          targetPadId,
          source: options?.data ?? 'clipboard',
          mode:
            (options?.sourceOnly ?? keyboard.isShiftKeyDown())
              ? 'source-only'
              : 'full-pad'
        })
    }
  };
};

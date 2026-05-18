import { extractVideoThumbnail as extractVideoThumbnailCanvas } from '@helpers/canvas';
import { readFromClipboard, writeToClipboard } from '@helpers/clipboard';
import { dateToISOString, formatShortDate } from '@helpers/datetime';
import { isObjectEqual } from '@helpers/diff';
import { idbIsSupported } from '@helpers/idb';
import { createImageThumbnail } from '@helpers/image';
import {
  getIntervalFromUrl,
  getMediaMetadata,
  getUrlMetadata,
  isVideoMetadata,
  isYouTubeMetadata
} from '@helpers/metadata';
import { invalidateQueryKeys } from '@helpers/query';
import { showError, showSuccess } from '@helpers/toast';
import { isValidMediaUrl } from '@helpers/url';
import {
  getYouTubeThumbnail,
  isYouTubeUrl,
  isYouTubeVideoId
} from '@helpers/youtube';
import { VOKeys } from '@model/constants';
import {
  deleteAllPadThumbnails,
  deleteDB,
  deletePadThumbnail,
  deleteThumbnailByUrl,
  getAllProjectDetails,
  getPadThumbnail,
  getThumbnailFromUrl,
  loadProjectState,
  saveImageData,
  saveMediaData,
  saveMediaThumbnail,
  savePadThumbnail,
  saveProjectState,
  saveVideoData
} from '@model/db/api';
import { getPadSourceUrl } from '@model/pad';
import {
  exportPadToClipboard,
  importPadFromClipboard
} from '@model/serialise/pad';
import {
  exportToJSON,
  exportToURLString,
  importProjectExport,
  urlStringToProject
} from '@model/serialise/project';
import { createStore } from '@model/store/store';
import { ProjectStoreContextType, ProjectStoreType } from '@model/store/types';
import {
  Interval,
  Media,
  MediaImage,
  MediaVideo,
  MediaYouTube,
  Pad,
  ProjectExport
} from '@model/types';
import { QueryClient } from '@tanstack/react-query';

export type ProjectMediaInvalidation =
  | 'allMetadata'
  | 'allPads'
  | 'players'
  | 'projectDetails'
  | `project:${string}`
  | `pad:${string}:${string}`
  | `padThumbnail:${string}:${string}`;

export type AttachMediaInput = File | string | Media;

export const SUPPORTED_MEDIA_SOURCE_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/mov'
] as const;

export type MediaSourceFailureCode =
  | 'empty-source'
  | 'unsupported-url'
  | 'unsupported-file-type'
  | 'unsupported-input';

export type MediaSourceAcceptance =
  | {
      ok: true;
      kind: 'url';
      input: string;
    }
  | {
      ok: true;
      kind: 'file';
      input: File;
    }
  | {
      ok: true;
      kind: 'media';
      input: Media;
    }
  | {
      ok: false;
      code: MediaSourceFailureCode;
      message: string;
    };

export interface ProjectMediaWorkflow {
  openProject(input: OpenProjectInput): Promise<ProjectMediaSession>;
  createProject(): Promise<ProjectMediaSession>;
  loadProject(projectId: string): Promise<ProjectMediaSession>;
  importProjectFromJSONString(data: string): Promise<ProjectMediaSession>;
  importProjectFromURLString(data: string): Promise<ProjectMediaSession>;
  exportProjectToURLString(
    session: ProjectMediaSession,
    version?: number
  ): Promise<string>;
  exportProjectToJSON(session: ProjectMediaSession): ProjectExport;
  renameProject(input: {
    session: ProjectMediaSession;
    projectName?: string;
  }): Promise<ProjectStoreContextType>;
  listProjectDetails(): Promise<Partial<ProjectStoreContextType>[]>;
  deleteEverything(): Promise<ProjectMediaSession>;
}

export interface OpenProjectInput {
  projectId: string;
  importData?: string | null | undefined;
  hydratePadMedia?: boolean;
}

export interface ProjectMediaSession {
  readonly projectId: string;
  readonly store: ProjectStoreType;
  acceptMediaSource(input: AttachMediaInput): Promise<MediaSourceAcceptance>;
  attachMedia(input: {
    padId: string;
    input: AttachMediaInput;
  }): Promise<Media | null>;
  copyPad(input: {
    sourcePadId: string;
    writeClipboard?: boolean;
  }): Promise<string | false>;
  pastePad(input: {
    targetPadId: string;
    source?: string | 'clipboard';
    mode?: 'full-pad' | 'source-only';
  }): Promise<boolean>;
  movePad(input: {
    sourcePadId: string;
    targetPadId: string;
    mode?: 'full-pad' | 'source-only';
  }): Promise<boolean>;
  clearPad(input: {
    padId: string;
    cleanup?: 'pad-only' | 'unused-media';
  }): Promise<boolean>;
  getPadThumbnail(input: { padId: string }): Promise<string | null>;
  deleteAllPadThumbnails(): Promise<void>;
  saveSnapshot(): Promise<void>;
  dispose(): void;
}

export interface ResolvedFileMedia {
  media: Media;
  thumbnail: string | null;
}

export interface ProjectMediaWorkflowDeps {
  projectStore: {
    create(initial?: ProjectStoreContextType | null): ProjectStoreType;
  };
  projectRepository: {
    isSupported(): boolean;
    load(projectId: string): Promise<ProjectStoreContextType | null>;
    save(project: ProjectStoreContextType): Promise<void>;
    listDetails(): Promise<Partial<ProjectStoreContextType>[]>;
    deleteAll(): Promise<void>;
  };
  mediaRepository: {
    getMetadata(url: string): Promise<Media | null>;
    saveMetadata(media: Media): Promise<void>;
    saveFile(input: {
      file: File;
      media: Media;
      thumbnail: string | null;
    }): Promise<void>;
    getThumbnail(url: string): Promise<string | null>;
    getPadThumbnail(projectId: string, padId: string): Promise<string | null>;
    saveMediaThumbnail(media: Media, thumbnail: string): Promise<void>;
    savePadThumbnail(
      projectId: string,
      padId: string,
      thumbnail: string
    ): Promise<void>;
    deletePadThumbnail(projectId: string, padId: string): Promise<void>;
    deleteThumbnailByUrl(url: string): Promise<void>;
    deleteAllPadThumbnails(projectId: string): Promise<void>;
  };
  mediaResolver: {
    resolveUrl(url: string): Promise<Media | null>;
    resolveFile(file: File): Promise<ResolvedFileMedia | null>;
    getIntervalFromUrl(url: string): Promise<Interval | undefined>;
    getThumbnail(media: Media): Promise<string | null>;
  };
  projectCodec: {
    importUrlString(data: string): Promise<ProjectExport>;
    importExport(data: ProjectExport): ProjectStoreContextType;
    exportUrlString(
      project: ProjectStoreType,
      version?: number
    ): Promise<string>;
    exportJSON(project: ProjectStoreType): ProjectExport;
  };
  padCodec: {
    exportPad(pad: Pad): string | false;
    importPad(data: string): Pad | null | undefined;
  };
  cache?: {
    invalidate(keys: ProjectMediaInvalidation[]): Promise<void>;
  };
  clipboard?: {
    read(): Promise<string>;
    write(data: string): Promise<boolean>;
  };
  notifications?: {
    success(message: string): void;
    error(message: string): void;
  };
  routing?: {
    setProjectId(projectId: string): void;
  };
}

export const createProjectMediaWorkflow = (
  deps: ProjectMediaWorkflowDeps
): ProjectMediaWorkflow => {
  const invalidate = (keys: ProjectMediaInvalidation[]) =>
    deps.cache?.invalidate(keys) ?? Promise.resolve();

  const openImportedProject = async (data: ProjectExport) => {
    const context = deps.projectCodec.importExport(data);
    const store = deps.projectStore.create(context);
    const session = createProjectMediaSession({
      deps,
      projectId: context.projectId,
      store
    });

    await session.saveSnapshot();
    deps.routing?.setProjectId(context.projectId);
    await hydrateSessionPadMedia(session);
    await invalidate(['projectDetails', 'allPads', 'allMetadata', 'players']);

    return session;
  };

  return {
    createProject: async () => {
      const store = deps.projectStore.create();
      const session = createProjectMediaSession({
        deps,
        projectId: store.getSnapshot().context.projectId,
        store
      });

      await session.saveSnapshot();
      deps.routing?.setProjectId(session.projectId);
      await invalidate(['projectDetails', 'allPads', 'allMetadata', 'players']);

      return session;
    },
    loadProject: (projectId) => {
      return createProjectMediaWorkflow(deps).openProject({ projectId });
    },
    importProjectFromJSONString: async (data) => {
      const exported = JSON.parse(data) as ProjectExport;
      return openImportedProject(exported);
    },
    importProjectFromURLString: async (data) => {
      const exported = await deps.projectCodec.importUrlString(data);
      return openImportedProject(exported);
    },
    exportProjectToURLString: (session, version) =>
      deps.projectCodec.exportUrlString(session.store, version),
    exportProjectToJSON: (session) => deps.projectCodec.exportJSON(session.store),
    renameProject: async ({ session, projectName = '' }) => {
      const name = projectName || `Untitled ${formatShortDate()}`;
      const project = session.store.getSnapshot().context;
      const nextProject: ProjectStoreContextType = {
        ...project,
        projectName: name,
        updatedAt: dateToISOString()
      };

      session.store.send({ type: 'updateProject', project: nextProject });
      await session.saveSnapshot();
      await invalidate(['projectDetails', `project:${session.projectId}`]);

      return nextProject;
    },
    listProjectDetails: () => deps.projectRepository.listDetails(),
    deleteEverything: async () => {
      await deps.projectRepository.deleteAll();
      await invalidate(['projectDetails', 'allPads', 'allMetadata', 'players']);
      return createProjectMediaWorkflow(deps).createProject();
    },
    openProject: async ({ projectId, importData, hydratePadMedia = true }) => {
      if (!deps.projectRepository.isSupported()) {
        const store = deps.projectStore.create();
        return createProjectMediaSession({
          deps,
          projectId: store.getSnapshot().context.projectId,
          store
        });
      }

      if (importData) {
        const exported = await deps.projectCodec.importUrlString(importData);
        const context = deps.projectCodec.importExport(exported);
        const store = deps.projectStore.create(context);
        const session = createProjectMediaSession({
          deps,
          projectId: context.projectId,
          store
        });

        await session.saveSnapshot();
        deps.routing?.setProjectId(context.projectId);

        if (hydratePadMedia) {
          await hydrateSessionPadMedia(session);
        }

        return session;
      }

      const projectState = await deps.projectRepository.load(projectId);
      const store = deps.projectStore.create(projectState);
      const session = createProjectMediaSession({
        deps,
        projectId: store.getSnapshot().context.projectId,
        store
      });

      if (!projectState) {
        await session.saveSnapshot();
        await invalidate(['projectDetails']);
      }

      deps.routing?.setProjectId(session.projectId);

      if (hydratePadMedia) {
        await hydrateSessionPadMedia(session);
      }

      await invalidate([`project:${session.projectId}`]);

      return session;
    }
  };
};

export const createProjectMediaSession = ({
  deps,
  projectId,
  store,
  autosave = true
}: {
  deps: ProjectMediaWorkflowDeps;
  projectId: string;
  store: ProjectStoreType;
  autosave?: boolean;
}): ProjectMediaSession => {
  let lastSavedContext = store.getSnapshot().context;
  const subscription = autosave
    ? store.subscribe(async (snapshot) => {
        if (isObjectEqual(lastSavedContext, snapshot.context)) {
          return;
        }
        lastSavedContext = snapshot.context;
        await deps.projectRepository.save(snapshot.context);
      })
    : undefined;

  const invalidate = (keys: ProjectMediaInvalidation[]) =>
    deps.cache?.invalidate(keys) ?? Promise.resolve();

  const session: ProjectMediaSession = {
    projectId,
    store,
    acceptMediaSource: async (input) => acceptMediaSource(input),
    attachMedia: async ({ padId, input }) => {
      const pad = findPad(store, padId);
      if (!pad) return null;

      const acceptance = await session.acceptMediaSource(input);
      if (!acceptance.ok) {
        deps.notifications?.error(acceptance.message);
        return null;
      }

      if (acceptance.kind === 'url') {
        return attachUrlMedia({
          deps,
          store,
          projectId,
          padId,
          url: acceptance.input
        });
      }

      if (acceptance.kind === 'file') {
        return attachFileMedia({
          deps,
          store,
          projectId,
          padId,
          file: acceptance.input
        });
      }

      await deps.mediaRepository.saveMetadata(acceptance.input);
      store.send({ type: 'setPadMedia', padId, media: acceptance.input });
      await invalidatePadMedia({ invalidate, projectId, padId });
      return acceptance.input;
    },
    copyPad: async ({ sourcePadId, writeClipboard: shouldWrite = true }) => {
      const pad = findPad(store, sourcePadId);
      if (!pad) return false;

      const data = deps.padCodec.exportPad(pad);
      if (!data) return false;

      if (shouldWrite) {
        const ok = await deps.clipboard?.write(data);
        if (!ok) {
          deps.notifications?.error(
            `Failed to copy ${sourcePadId} to clipboard`
          );
          return false;
        }
        deps.notifications?.success(`Copied ${sourcePadId} to clipboard`);
      }

      return data;
    },
    pastePad: async ({
      targetPadId,
      source = 'clipboard',
      mode = 'full-pad'
    }) => {
      const targetPad = findPad(store, targetPadId);
      if (!targetPad) return false;

      const data =
        source === 'clipboard' ? await deps.clipboard?.read() : source;
      if (!data) return false;

      const sourcePad = deps.padCodec.importPad(data);
      if (!sourcePad) return false;

      const sourceUrl = getPadSourceUrl(sourcePad);
      if (!sourceUrl) return false;

      const media = await deps.mediaResolver.resolveUrl(sourceUrl);
      if (!media) return false;

      await deps.mediaRepository.saveMetadata(media);
      const thumbnail =
        (await deps.mediaRepository.getPadThumbnail(projectId, sourcePad.id)) ??
        (await deps.mediaRepository.getThumbnail(media.url)) ??
        (await deps.mediaResolver.getThumbnail(media));

      store.send({
        type: 'applyPad',
        pad: sourcePad,
        targetPadId,
        copySourceOnly: mode === 'source-only'
      });

      if (thumbnail) {
        await deps.mediaRepository.saveMediaThumbnail(media, thumbnail);
        await deps.mediaRepository.savePadThumbnail(
          projectId,
          targetPadId,
          thumbnail
        );
      }

      await invalidatePadMedia({ invalidate, projectId, padId: targetPadId });
      deps.notifications?.success(`Pasted ${targetPadId} from clipboard`);
      return true;
    },
    movePad: async ({ sourcePadId, targetPadId, mode = 'full-pad' }) => {
      const data = await session.copyPad({
        sourcePadId,
        writeClipboard: false
      });
      if (!data) return false;

      const pasted = await session.pastePad({
        targetPadId,
        source: data,
        mode
      });
      if (!pasted) return false;

      return session.clearPad({ padId: sourcePadId, cleanup: 'pad-only' });
    },
    clearPad: async ({ padId, cleanup = 'unused-media' }) => {
      const pad = findPad(store, padId);
      if (!pad) return false;

      const sourceUrl = getPadSourceUrl(pad);
      const sourceUseCount = sourceUrl
        ? getPadsBySourceUrl(store, sourceUrl).length
        : 0;

      await deps.mediaRepository.deletePadThumbnail(projectId, padId);

      if (cleanup === 'unused-media' && sourceUrl && sourceUseCount <= 1) {
        await deps.mediaRepository.deleteThumbnailByUrl(sourceUrl);
      }

      store.send({ type: 'clearPad', padId });
      await invalidatePadMedia({ invalidate, projectId, padId });
      deps.notifications?.success(`Cleared ${padId}`);
      return true;
    },
    getPadThumbnail: async ({ padId }) => {
      const pad = findPad(store, padId);
      const sourceUrl = getPadSourceUrl(pad);

      if (!sourceUrl) {
        await deps.mediaRepository.deletePadThumbnail(projectId, padId);
        return null;
      }

      const existingPadThumbnail = await deps.mediaRepository.getPadThumbnail(
        projectId,
        padId
      );
      if (existingPadThumbnail) {
        return existingPadThumbnail;
      }

      const media =
        (await deps.mediaRepository.getMetadata(sourceUrl)) ??
        (await deps.mediaResolver.resolveUrl(sourceUrl));

      if (!media) {
        return null;
      }

      await deps.mediaRepository.saveMetadata(media);

      const thumbnail =
        (await deps.mediaRepository.getThumbnail(media.url)) ??
        (await deps.mediaResolver.getThumbnail(media));

      if (!thumbnail) {
        return null;
      }

      await deps.mediaRepository.saveMediaThumbnail(media, thumbnail);
      await deps.mediaRepository.savePadThumbnail(projectId, padId, thumbnail);

      return thumbnail;
    },
    deleteAllPadThumbnails: async () => {
      await deps.mediaRepository.deleteAllPadThumbnails(projectId);
      await invalidate(['allPads']);
    },
    saveSnapshot: async () => {
      const context = store.getSnapshot().context;
      lastSavedContext = context;
      await deps.projectRepository.save(context);
    },
    dispose: () => {
      subscription?.unsubscribe();
    }
  };

  return session;
};

export const createBrowserProjectMediaWorkflowDeps = ({
  queryClient,
  routing
}: {
  queryClient: QueryClient;
  routing?: { setProjectId(projectId: string): void };
}): ProjectMediaWorkflowDeps => {
  return {
    projectStore: {
      create: createStore
    },
    projectRepository: {
      isSupported: idbIsSupported,
      load: loadProjectState,
      save: saveProjectState,
      listDetails: getAllProjectDetails,
      deleteAll: async () => {
        await deleteDB();
      }
    },
    mediaRepository: {
      getMetadata: async (url) => getUrlMetadata(url),
      saveMetadata: saveMediaData,
      saveFile: async ({ file, media, thumbnail }) => {
        if (isVideoMetadata(media)) {
          await saveVideoData({
            file,
            media: media as MediaVideo,
            thumbnail
          });
          return;
        }

        if (thumbnail) {
          await saveImageData(file, media as MediaImage, thumbnail);
        }
      },
      getThumbnail: async (url) => (await getThumbnailFromUrl(url)) ?? null,
      getPadThumbnail,
      saveMediaThumbnail: async (media, thumbnail) => {
        await saveMediaThumbnail(media, thumbnail);
      },
      savePadThumbnail: async (projectId, padId, thumbnail) => {
        await savePadThumbnail(projectId, padId, thumbnail);
      },
      deletePadThumbnail: async (projectId, padId) => {
        await deletePadThumbnail(projectId, padId);
      },
      deleteThumbnailByUrl: async (url) => {
        await deleteThumbnailByUrl(url);
      },
      deleteAllPadThumbnails: async (projectId) => {
        await deleteAllPadThumbnails(projectId);
      }
    },
    mediaResolver: {
      resolveUrl: getUrlMetadata,
      resolveFile: async (file) => {
        const media = await getMediaMetadata(file);
        const thumbnail = isVideoMetadata(media)
          ? await extractVideoThumbnailCanvas(file, media as MediaVideo)
          : await createImageThumbnail(file);

        return { media, thumbnail };
      },
      getIntervalFromUrl,
      getThumbnail: async (media) => {
        const existing = await getThumbnailFromUrl(media.url);
        if (existing) return existing;

        if (isYouTubeMetadata(media)) {
          return getYouTubeThumbnail(media as MediaYouTube);
        }

        return null;
      }
    },
    projectCodec: {
      importUrlString: urlStringToProject,
      importExport: importProjectExport,
      exportUrlString: exportToURLString,
      exportJSON: exportToJSON
    },
    padCodec: {
      exportPad: (pad) => exportPadToClipboard(pad) || false,
      importPad: (data) => importPadFromClipboard(data) ?? null
    },
    cache: {
      invalidate: (keys) => invalidateProjectMediaKeys(queryClient, keys)
    },
    clipboard: {
      read: readFromClipboard,
      write: writeToClipboard
    },
    notifications: {
      success: showSuccess,
      error: showError
    },
    routing
  };
};

const hydrateSessionPadMedia = async (session: ProjectMediaSession) => {
  const pads = session.store.getSnapshot().context.pads;

  for (const pad of pads) {
    const url = getPadSourceUrl(pad);
    if (url) {
      await session.attachMedia({ padId: pad.id, input: url });
    }
  }
};

const attachUrlMedia = async ({
  deps,
  store,
  projectId,
  padId,
  url
}: {
  deps: ProjectMediaWorkflowDeps;
  store: ProjectStoreType;
  projectId: string;
  padId: string;
  url: string;
}) => {
  const media = await deps.mediaResolver.resolveUrl(url);
  if (!media) return null;

  await deps.mediaRepository.saveMetadata(media);

  const thumbnail =
    (await deps.mediaRepository.getThumbnail(media.url)) ??
    (await deps.mediaResolver.getThumbnail(media));

  if (thumbnail) {
    await deps.mediaRepository.saveMediaThumbnail(media, thumbnail);
    await deps.mediaRepository.savePadThumbnail(projectId, padId, thumbnail);
  }

  store.send({ type: 'setPadMedia', padId, media });

  const interval = await deps.mediaResolver.getIntervalFromUrl(url);
  if (interval) {
    store.send({
      type: 'setPadInterval',
      padId,
      start: interval.start,
      end: interval.end
    });
  }

  await deps.cache?.invalidate([
    `pad:${projectId}:${padId}`,
    `padThumbnail:${projectId}:${padId}`,
    'allMetadata',
    'players'
  ]);

  return media;
};

const attachFileMedia = async ({
  deps,
  store,
  projectId,
  padId,
  file
}: {
  deps: ProjectMediaWorkflowDeps;
  store: ProjectStoreType;
  projectId: string;
  padId: string;
  file: File;
}) => {
  const resolved = await deps.mediaResolver.resolveFile(file);
  if (!resolved) return null;

  const { media, thumbnail } = resolved;

  await deps.mediaRepository.saveFile({ file, media, thumbnail });

  if (thumbnail) {
    await deps.mediaRepository.savePadThumbnail(projectId, padId, thumbnail);
  }

  store.send({ type: 'setPadMedia', padId, media });

  await deps.cache?.invalidate([
    `pad:${projectId}:${padId}`,
    `padThumbnail:${projectId}:${padId}`,
    'allMetadata',
    'players'
  ]);

  return media;
};

const invalidatePadMedia = async ({
  invalidate,
  projectId,
  padId
}: {
  invalidate: (keys: ProjectMediaInvalidation[]) => Promise<void>;
  projectId: string;
  padId: string;
}) => {
  await invalidate([
    `pad:${projectId}:${padId}`,
    `padThumbnail:${projectId}:${padId}`,
    'allMetadata',
    'players'
  ]);
};

const invalidateProjectMediaKeys = (
  queryClient: QueryClient,
  keys: ProjectMediaInvalidation[]
) => {
  const queryKeys = keys.map((key) => {
    if (key === 'allMetadata') return [...VOKeys.allMetadata()];
    if (key === 'allPads') return [...VOKeys.allPads()];
    if (key === 'players') return [...VOKeys.players()];
    if (key === 'projectDetails') return [...VOKeys.projectDetails()];

    const [type, projectId, id] = key.split(':');
    if (type === 'project') return [...VOKeys.project(projectId)];
    if (type === 'padThumbnail') {
      return [...VOKeys.padThumbnail(projectId, id)];
    }
    return [...VOKeys.pad(projectId, id)];
  });

  return invalidateQueryKeys(queryClient, queryKeys).then(() => undefined);
};

const findPad = (store: ProjectStoreType, padId: string) => {
  return store.getSnapshot().context.pads.find((pad) => pad.id === padId);
};

const getPadsBySourceUrl = (store: ProjectStoreType, url: string) => {
  return store
    .getSnapshot()
    .context.pads.filter((pad) => getPadSourceUrl(pad) === url);
};

const acceptMediaSource = async (
  input: AttachMediaInput
): Promise<MediaSourceAcceptance> => {
  if (typeof input === 'string') {
    const value = input.trim();

    if (!value) {
      return {
        ok: false,
        code: 'empty-source',
        message: 'Choose a media source before adding it to a pad.'
      };
    }

    if (
      !isYouTubeUrl(value) &&
      !isYouTubeVideoId(value) &&
      !isValidMediaUrl(value)
    ) {
      return {
        ok: false,
        code: 'unsupported-url',
        message:
          'This media source is not supported yet. Use a YouTube URL, video ID, or browser-local media source.'
      };
    }

    return { ok: true, kind: 'url', input: value };
  }

  if (isFile(input)) {
    if (
      !SUPPORTED_MEDIA_SOURCE_FILE_TYPES.includes(
        input.type as (typeof SUPPORTED_MEDIA_SOURCE_FILE_TYPES)[number]
      )
    ) {
      return {
        ok: false,
        code: 'unsupported-file-type',
        message:
          'This file type is not supported. Use a local image or video file.'
      };
    }

    return { ok: true, kind: 'file', input };
  }

  if (isMedia(input)) {
    return { ok: true, kind: 'media', input };
  }

  return {
    ok: false,
    code: 'unsupported-input',
    message: 'This media source is not supported.'
  };
};

const isMedia = (value: unknown): value is Media => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'url' in value &&
    'mimeType' in value
  );
};

const isFile = (value: unknown): value is File => {
  return typeof File !== 'undefined' && value instanceof File;
};

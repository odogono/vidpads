import { getPadSourceUrl } from '@model/pad';
import { createStore } from '@model/store/store';
import { ProjectStoreContextType } from '@model/store/types';
import { Media, MediaImage, MediaVideo, ProjectExport } from '@model/types';
import { ProjectMediaWorkflowDeps, createProjectMediaWorkflow } from '../index';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const youtubeMedia: Media = {
  url: 'https://youtube.com/watch?v=abc123abc12&t=12',
  name: 'YouTube clip',
  sizeInBytes: 0,
  mimeType: 'video/youtube',
  width: 1280,
  height: 720,
  duration: 120
};

const imageMedia: MediaImage = {
  url: 'odgn-vo://media/image-1',
  fileId: 'image-1',
  name: 'image.png',
  sizeInBytes: 100,
  mimeType: 'image/png',
  width: 320,
  height: 200,
  duration: 0
};

const videoMedia: MediaVideo = {
  url: 'odgn-vo://media/video-1',
  fileId: 'video-1',
  name: 'video.mp4',
  sizeInBytes: 1000,
  mimeType: 'video/mp4',
  width: 640,
  height: 360,
  duration: 10
};

const makeProjectExport = (id: string, source: string): ProjectExport => ({
  id,
  name: 'Imported project',
  version: 'test',
  exportVersion: 'test',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  pads: [{ id: 'a1', source }],
  sequencer: undefined,
  stepSequencer: undefined
});

const makeDeps = (overrides: Partial<ProjectMediaWorkflowDeps> = {}) => {
  const savedProjects: ProjectStoreContextType[] = [];
  const savedMetadata: Media[] = [];
  const savedFiles: Array<{
    file: File;
    media: Media;
    thumbnail: string | null;
  }> = [];
  const savedPadThumbnails: Array<{
    projectId: string;
    padId: string;
    thumbnail: string;
  }> = [];
  const deletedPadThumbnails: Array<{ projectId: string; padId: string }> = [];
  const deletedMediaThumbnails: string[] = [];
  const invalidations: string[] = [];
  const notifications: string[] = [];
  let deletedEverything = false;

  const projectById = new Map<string, ProjectStoreContextType>();
  const padClipboard = { value: '' };

  const deps: ProjectMediaWorkflowDeps = {
    projectStore: {
      create: createStore
    },
    projectRepository: {
      isSupported: () => true,
      load: async (projectId) => projectById.get(projectId) ?? null,
      save: async (project) => {
        savedProjects.push(project);
        projectById.set(project.projectId, project);
      },
      listDetails: async () =>
        Array.from(projectById.values()).map(
          ({ projectId, projectName, createdAt, updatedAt }) => ({
            projectId,
            projectName,
            createdAt,
            updatedAt
          })
        ),
      deleteAll: async () => {
        deletedEverything = true;
        projectById.clear();
      }
    },
    mediaRepository: {
      getMetadata: async () => null,
      saveMetadata: async (media) => {
        savedMetadata.push(media);
      },
      saveFile: async (input) => {
        savedFiles.push(input);
      },
      getThumbnail: async () => null,
      getPadThumbnail: async () => null,
      saveMediaThumbnail: async () => undefined,
      savePadThumbnail: async (projectId, padId, thumbnail) => {
        savedPadThumbnails.push({ projectId, padId, thumbnail });
      },
      deletePadThumbnail: async (projectId, padId) => {
        deletedPadThumbnails.push({ projectId, padId });
      },
      deleteThumbnailByUrl: async (url) => {
        deletedMediaThumbnails.push(url);
      },
      deleteAllPadThumbnails: async () => undefined
    },
    mediaResolver: {
      resolveUrl: async () => youtubeMedia,
      resolveFile: async (file) => ({
        media: file.type.startsWith('video/') ? videoMedia : imageMedia,
        thumbnail: `${file.name}-thumb`
      }),
      getIntervalFromUrl: async () => ({ start: 12, end: -1 }),
      getThumbnail: async () => 'remote-thumb'
    },
    projectCodec: {
      importUrlString: async () =>
        makeProjectExport('imported-project', youtubeMedia.url),
      importExport: (data) => {
        const store = createStore();
        store.send({ type: 'importProject', data });
        return store.getSnapshot().context;
      },
      exportUrlString: async () => 'project-url',
      exportJSON: (project) => ({
        id: project.getSnapshot().context.projectId,
        name: project.getSnapshot().context.projectName,
        version: 'test',
        exportVersion: 'test',
        createdAt: project.getSnapshot().context.createdAt,
        updatedAt: project.getSnapshot().context.updatedAt,
        pads: []
      })
    },
    padCodec: {
      exportPad: () => 'pad-data',
      importPad: () => {
        const store = createStore();
        store.send({
          type: 'setPadMedia',
          padId: 'a1',
          media: youtubeMedia
        });
        return store.getSnapshot().context.pads[0];
      }
    },
    cache: {
      invalidate: async (keys) => {
        invalidations.push(...keys);
      }
    },
    clipboard: {
      read: async () => padClipboard.value,
      write: async (data) => {
        padClipboard.value = data;
        return true;
      }
    },
    notifications: {
      success: (message) => notifications.push(message),
      error: (message) => notifications.push(message)
    },
    ...overrides
  };

  return {
    deps,
    projectById,
    savedProjects,
    savedMetadata,
    savedFiles,
    savedPadThumbnails,
    deletedPadThumbnails,
    deletedMediaThumbnails,
    get deletedEverything() {
      return deletedEverything;
    },
    invalidations,
    notifications,
    padClipboard
  };
};

describe('ProjectMediaWorkflow', () => {
  it('accepts supported media sources and rejects unsupported sources with typed failures', async () => {
    const test = makeDeps();
    const workflow = createProjectMediaWorkflow(test.deps);
    const session = await workflow.openProject({ projectId: 'new' });
    const imageFile = new File(['image'], 'image.png', { type: 'image/png' });
    const unsupportedFile = new File(['text'], 'notes.txt', {
      type: 'text/plain'
    });

    await expect(
      session.acceptMediaSource(youtubeMedia.url)
    ).resolves.toMatchObject({ ok: true, kind: 'url' });
    await expect(session.acceptMediaSource(imageFile)).resolves.toMatchObject({
      ok: true,
      kind: 'file'
    });
    await expect(session.acceptMediaSource(imageMedia)).resolves.toMatchObject({
      ok: true,
      kind: 'media'
    });
    await expect(
      session.acceptMediaSource('https://vimeo.com/123')
    ).resolves.toMatchObject({
      ok: false,
      code: 'unsupported-url'
    });
    await expect(
      session.acceptMediaSource(unsupportedFile)
    ).resolves.toMatchObject({
      ok: false,
      code: 'unsupported-file-type'
    });
  });

  it('creates, renames, lists, loads, exports, imports, and deletes projects through the workflow', async () => {
    const test = makeDeps();
    const routedProjectIds: string[] = [];
    test.deps.routing = {
      setProjectId: (projectId) => routedProjectIds.push(projectId)
    };

    const workflow = createProjectMediaWorkflow(test.deps);

    const created = await workflow.createProject();
    await workflow.renameProject({
      session: created,
      projectName: 'Live set'
    });

    const details = await workflow.listProjectDetails();
    const exported = await workflow.exportProjectToURLString(created);
    const imported = await workflow.importProjectFromJSONString(
      JSON.stringify(makeProjectExport('json-project', youtubeMedia.url))
    );
    const loaded = await workflow.loadProject(imported.projectId);

    await workflow.deleteEverything();

    expect(created.store.getSnapshot().context.projectName).toBe('Live set');
    expect(details).toContainEqual(
      expect.objectContaining({
        projectId: created.projectId,
        projectName: 'Live set'
      })
    );
    expect(exported).toBe('project-url');
    expect(imported.projectId).toBe('json-project');
    expect(loaded.projectId).toBe('json-project');
    expect(test.deletedEverything).toBe(true);
    expect(routedProjectIds).toEqual(
      expect.arrayContaining([created.projectId, 'json-project'])
    );
    expect(test.invalidations).toEqual(
      expect.arrayContaining(['allPads', 'allMetadata', 'players'])
    );
  });

  it('opens an imported project, persists it, routes to the imported id, and hydrates pad media', async () => {
    const test = makeDeps();
    const routedProjectIds: string[] = [];
    test.deps.routing = {
      setProjectId: (projectId) => routedProjectIds.push(projectId)
    };

    const workflow = createProjectMediaWorkflow(test.deps);
    const session = await workflow.openProject({
      projectId: 'route-project',
      importData: 'encoded-project'
    });

    expect(session.projectId).toBe('imported-project');
    expect(routedProjectIds).toEqual(['imported-project']);
    expect(test.savedProjects[0].projectId).toBe('imported-project');
    expect(test.savedMetadata).toEqual([youtubeMedia]);
    expect(test.savedPadThumbnails).toContainEqual({
      projectId: 'imported-project',
      padId: 'a1',
      thumbnail: 'remote-thumb'
    });
  });

  it('attaches URL media, applies URL interval, saves thumbnails, invalidates cache, and autosaves store changes', async () => {
    const test = makeDeps();
    const workflow = createProjectMediaWorkflow(test.deps);
    const session = await workflow.openProject({ projectId: 'new' });

    await session.attachMedia({
      padId: 'a1',
      input: youtubeMedia.url
    });
    await flushPromises();

    const pad = session.store
      .getSnapshot()
      .context.pads.find((pad) => pad.id === 'a1')!;

    expect(pad.pipeline.operations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'source', url: youtubeMedia.url }),
        expect.objectContaining({ type: 'trim', start: 12, end: -1 })
      ])
    );
    expect(test.savedMetadata).toContain(youtubeMedia);
    expect(test.savedPadThumbnails).toContainEqual({
      projectId: session.projectId,
      padId: 'a1',
      thumbnail: 'remote-thumb'
    });
    expect(test.invalidations).toEqual(
      expect.arrayContaining([
        `pad:${session.projectId}:a1`,
        `padThumbnail:${session.projectId}:a1`,
        'allMetadata',
        'players'
      ])
    );
    expect(test.savedProjects.at(-1)?.pads[0].pipeline.operations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'source', url: youtubeMedia.url })
      ])
    );
  });

  it('attaches file media through the resolver and persists file data without browser APIs in the workflow', async () => {
    const test = makeDeps();
    const workflow = createProjectMediaWorkflow(test.deps);
    const session = await workflow.openProject({ projectId: 'new' });
    const file = new File(['image'], 'image.png', { type: 'image/png' });

    const media = await session.attachMedia({ padId: 'a2', input: file });

    expect(media).toEqual(imageMedia);
    expect(test.savedFiles).toEqual([
      { file, media: imageMedia, thumbnail: 'image.png-thumb' }
    ]);
    expect(test.savedPadThumbnails).toContainEqual({
      projectId: session.projectId,
      padId: 'a2',
      thumbnail: 'image.png-thumb'
    });
  });

  it('resolves and saves missing pad thumbnails through the workflow', async () => {
    const test = makeDeps();
    const workflow = createProjectMediaWorkflow(test.deps);
    const session = await workflow.openProject({ projectId: 'new' });

    await session.attachMedia({ padId: 'a1', input: youtubeMedia });

    const thumbnail = await session.getPadThumbnail({ padId: 'a1' });

    expect(thumbnail).toBe('remote-thumb');
    expect(test.savedPadThumbnails).toContainEqual({
      projectId: session.projectId,
      padId: 'a1',
      thumbnail: 'remote-thumb'
    });
  });

  it('copies, pastes source-only pad transfers, moves pads, and clears unused pad media', async () => {
    const test = makeDeps();
    const workflow = createProjectMediaWorkflow(test.deps);
    const session = await workflow.openProject({ projectId: 'new' });

    await session.attachMedia({ padId: 'a1', input: youtubeMedia.url });
    const copied = await session.copyPad({ sourcePadId: 'a1' });
    expect(copied).not.toBe(false);
    if (!copied) return;
    await session.pastePad({
      targetPadId: 'a2',
      source: copied,
      mode: 'source-only'
    });
    await session.movePad({ sourcePadId: 'a2', targetPadId: 'a3' });
    await session.clearPad({ padId: 'a1', cleanup: 'unused-media' });

    const pads = session.store.getSnapshot().context.pads;
    const a1 = pads.find((pad) => pad.id === 'a1')!;
    const a2 = pads.find((pad) => pad.id === 'a2')!;
    const a3 = pads.find((pad) => pad.id === 'a3')!;

    expect(a1.pipeline.operations).toEqual([]);
    expect(a2.pipeline.operations).toEqual([]);
    expect(getPadSourceUrl(a3)).toBe(youtubeMedia.url);
    expect(test.deletedPadThumbnails).toEqual(
      expect.arrayContaining([
        { projectId: session.projectId, padId: 'a1' },
        { projectId: session.projectId, padId: 'a2' }
      ])
    );
    expect(test.deletedMediaThumbnails).not.toContain(youtubeMedia.url);
  });
});

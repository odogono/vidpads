'use client';

import {
  idbCreateObjectStore,
  idbDeleteRange,
  idbOpen,
  idbOpenTransaction
} from '@helpers/idb';
import { createLog } from '@helpers/log';
import { StoreContextType } from '@model/store/types';
import {
  Media,
  MediaImage,
  MediaType,
  MediaVideo,
  MediaYouTube,
  Project,
  ProjectExport
} from '@model/types';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { QUERY_KEY_STATE } from '../constants';
import { getMediaType } from '../helpers';

const log = createLog('db/api');

const DB_NAME = 'vidpads';
const DB_VERSION = 2;

// At the top of the file, define store names as const arrays
const PROJECT_STORES = ['projects'] as const;
const MEDIA_STORES = ['metadata', 'thumbnails'] as const;
const VIDEO_STORES = ['videoChunks', 'metadata', 'thumbnails'] as const;
const IMAGE_STORES = ['images', 'metadata', 'thumbnails'] as const;

export const useDBStore = () => {
  return useSuspenseQuery({
    queryKey: [QUERY_KEY_STATE],
    queryFn: loadStateFromIndexedDB
  });
};

export const isIndexedDBSupported = () => {
  return (
    typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
  );
};

export const useDBStoreUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveStateToIndexedDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_STATE] });
    }
  });
};

const upgradeDB = (db: IDBDatabase, event: IDBVersionChangeEvent) => {
  const oldVersion = event.oldVersion;
  const newVersion = event.newVersion ?? 1;

  log.debug('upgrading db', oldVersion, newVersion);

  // Handle initial database creation (version 0 to 1)
  if (oldVersion < 1) {
    idbCreateObjectStore(db, 'store');
    idbCreateObjectStore(db, 'metadata', { keyPath: 'id' });
    idbCreateObjectStore(db, 'videoChunks', {
      keyPath: ['id', 'videoChunkIndex']
    });
    idbCreateObjectStore(db, 'images', { keyPath: 'id' });
    idbCreateObjectStore(db, 'thumbnails', { keyPath: 'id' });
  }

  // Handle upgrade to version 2
  if (oldVersion < 2) {
    idbCreateObjectStore(db, 'projects', { keyPath: 'id' });
  }
};

export const openDB = (): Promise<IDBDatabase> => {
  return idbOpen(DB_NAME, DB_VERSION, upgradeDB);
};

export const closeDB = (db: IDBDatabase) => {
  db.close();
};

export const getAllProjectDetails = async (): Promise<Partial<Project>[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const { projects, transaction } = idbOpenTransaction(
      db,
      ['projects'],
      'readonly'
    );

    const getAllRequest = projects.getAll();

    getAllRequest.onerror = () => {
      log.error(
        'Error loading all projects from IndexedDB:',
        getAllRequest.error
      );
      reject(getAllRequest.error);
    };

    getAllRequest.onsuccess = () => {
      const projects = getAllRequest.result as Project[];

      const projectDetails = projects.map((project) => {
        const { id, name, createdAt, updatedAt } = project;
        return { id, name, createdAt, updatedAt };
      });
      resolve(projectDetails);
    };

    transaction.oncomplete = () => {
      closeDB(db);
    };
  });
};

export const loadProject = async (
  id: string
): Promise<ProjectExport | null> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const { projects, transaction } = idbOpenTransaction(
      db,
      ['projects'],
      'readonly'
    );
    const getRequest = projects.get(id);

    getRequest.onerror = () => {
      log.error('Error loading project from IndexedDB:', getRequest.error);
      reject(getRequest.error);
    };

    getRequest.onsuccess = () => {
      const result = (getRequest.result as ProjectExport) ?? null;
      resolve(result);
    };

    transaction.oncomplete = () => {
      closeDB(db);
    };
  });
};

export const saveProject = async (project: ProjectExport): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { projects, transaction } = idbOpenTransaction(
      db,
      ['projects'],
      'readwrite'
    );

    const putRequest = projects.put(project);

    putRequest.onerror = () => {
      log.error('Error saving project to IndexedDB:', putRequest.error);
      reject(putRequest.error);
    };
    putRequest.onsuccess = () => resolve();

    transaction.oncomplete = () => {
      closeDB(db);
    };
  });
};

export const loadStateFromIndexedDB =
  async (): Promise<StoreContextType | null> => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      // log.debug('loading state from IndexedDB');
      const transaction = db.transaction('store', 'readonly');
      const store = transaction.objectStore('store');
      const getRequest = store.get('state');

      getRequest.onerror = () => {
        log.error('Error loading state from IndexedDB:', getRequest.error);
        reject(getRequest.error);
      };
      getRequest.onsuccess = () => {
        const result = (getRequest.result as StoreContextType) ?? null;
        resolve(result);
      };

      transaction.oncomplete = () => {
        log.debug('state loaded from IndexedDB');
        closeDB(db);
      };
    });
  };

export const saveStateToIndexedDB = async (
  state: StoreContextType
): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('store', 'readwrite');
    const store = transaction.objectStore('store');
    const putRequest = store.put(state, 'state');

    putRequest.onerror = () => {
      log.error('Error saving state to IndexedDB:', putRequest.error);
      reject(putRequest.error);
    };
    putRequest.onsuccess = () => resolve();

    transaction.oncomplete = () => {
      // log.debug('state saved to IndexedDB');
      closeDB(db);
    };
  });
};

export interface SaveUrlDataProps {
  metadata: MediaYouTube;
  thumbnail: string | null;
}

export const saveUrlData = async ({
  metadata,
  thumbnail
}: SaveUrlDataProps): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metadata', 'thumbnails'], 'readwrite');

    const { id } = metadata;

    // Save the metadata
    const metadataStore = transaction.objectStore('metadata');
    metadataStore.put(metadata);

    // Save the thumbnail
    const thumbnailStore = transaction.objectStore('thumbnails');
    thumbnailStore.put({ id, type: 'url', thumbnail });

    transaction.onerror = () => {
      log.error('Error saving video data:', transaction.error);
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      log.debug('Video data saved successfully');
      closeDB(db);
      resolve();
    };
  });
};

export interface SaveVideoDataProps {
  file: File;
  metadata: MediaVideo;
  thumbnail: string | null;
  chunkSize?: number;
}

export const saveVideoData = async ({
  file,
  metadata,
  thumbnail,
  chunkSize = 1024 * 1024 * 10 // 10MB
}: SaveVideoDataProps): Promise<void> => {
  if (!thumbnail) {
    throw new Error('Thumbnail is required');
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ['videoChunks', 'metadata', 'thumbnails'],
      'readwrite'
    );

    const { id, sizeInBytes } = metadata;
    const videoTotalChunks = Math.ceil(sizeInBytes / chunkSize);

    metadata.videoTotalChunks = videoTotalChunks;

    // Save the metadata
    const metadataStore = transaction.objectStore('metadata');
    metadataStore.put(metadata);

    // Save the thumbnail
    const thumbnailStore = transaction.objectStore('thumbnails');
    thumbnailStore.put({ id, type: 'video', thumbnail });

    // Save the video chunks
    const videoChunksStore = transaction.objectStore('videoChunks');

    for (let ii = 0; ii < videoTotalChunks; ii++) {
      const start = ii * chunkSize;
      const end = Math.min(start + chunkSize, sizeInBytes);
      const chunk = file.slice(start, end);

      const data = {
        id,
        videoChunkIndex: ii,
        videoTotalChunks,
        data: chunk,
        timestamp: Date.now()
      };

      videoChunksStore.put(data);
    }

    transaction.onerror = () => {
      log.error('Error saving video data:', transaction.error);
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      log.debug('Video data saved successfully');
      closeDB(db);
      resolve();
    };
  });
};

interface LoadVideoDataResult {
  blob: Blob;
  metadata: MediaVideo;
  thumbnail: string;
}

/**
 * Loads the video data from the database
 * @param id - The id of the video
 * @returns The video data
 */
export const loadVideoData = async (
  id: string
): Promise<LoadVideoDataResult> => {
  const db = await openDB();

  // retrieve the metadata and thumbnail first
  const { metadata, thumbnail } = await new Promise<{
    metadata: MediaVideo;
    thumbnail: string;
  }>((resolve, reject) => {
    const transaction = db.transaction(['metadata', 'thumbnails'], 'readonly');

    const metadataStore = transaction.objectStore('metadata');
    const thumbnailStore = transaction.objectStore('thumbnails');

    const metadataRequest = metadataStore.get(id);
    const thumbnailRequest = thumbnailStore.get(id);

    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      const metadata = metadataRequest.result;
      const thumbnailData = thumbnailRequest.result;
      resolve({ metadata, thumbnail: thumbnailData.thumbnail });
    };
  });

  return new Promise((resolve, reject) => {
    const { videoTotalChunks, mimeType } = metadata;

    const transaction = db.transaction('videoChunks', 'readonly');
    const store = transaction.objectStore('videoChunks');

    // log.debug(
    //   'loading video chunks',
    //   [id, 0],
    //   [id, videoTotalChunks! - 1],
    //   metadata
    // );

    const videoChunksRequest = store.getAll(
      IDBKeyRange.bound([id, 0], [id, videoTotalChunks! - 1])
    );

    transaction.onerror = () => {
      log.error('Error loading video chunks:', videoChunksRequest.error);
      reject(videoChunksRequest.error);
    };

    transaction.oncomplete = () => {
      const { result } = videoChunksRequest;

      if (result.length !== videoTotalChunks) {
        reject(new Error('Incomplete video data'));
        return;
      }

      // sort chunks by videoChunkIndex
      const sortedChunks = result.sort(
        (a, b) => a.videoChunkIndex - b.videoChunkIndex
      );

      // join chunks into a single file
      const blob = new Blob(
        sortedChunks.map((chunk) => chunk.data),
        { type: mimeType }
      );

      resolve({
        blob,
        metadata,
        thumbnail
      });
      // log.debug('video data loaded from IndexedDB');
      closeDB(db);
    };
  });
};

export const saveImageData = async (
  file: File,
  metadata: MediaImage,
  thumbnail: string
): Promise<void> => {
  const db = await openDB();

  // Convert File to ArrayBuffer for storage
  const arrayBuffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ['images', 'metadata', 'thumbnails'],
      'readwrite'
    );

    const { id } = metadata;

    // Save the image as ArrayBuffer
    const imageStore = transaction.objectStore('images');
    imageStore.put({
      id,
      data: arrayBuffer,
      type: file.type // Store the mime type for later reconstruction
    });

    // Save the metadata
    const metadataStore = transaction.objectStore('metadata');
    metadataStore.put(metadata);

    // Save the thumbnail
    const thumbnailStore = transaction.objectStore('thumbnails');
    thumbnailStore.put({ id, type: 'image', thumbnail });

    // Handle errors
    transaction.onerror = () => {
      log.error('Error saving image data:', transaction.error);
      reject(transaction.error);
    };

    // Handle success
    transaction.oncomplete = () => {
      log.debug('Image data saved successfully');
      closeDB(db);
      resolve();
    };
  });
};

// Add a function to load the image data
export const loadImageData = async (
  id: string
): Promise<{
  blob: Blob;
  metadata: MediaImage;
  thumbnail: string;
}> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ['images', 'metadata', 'thumbnails'],
      'readonly'
    );

    const imageStore = transaction.objectStore('images');
    const metadataStore = transaction.objectStore('metadata');
    const thumbnailStore = transaction.objectStore('thumbnails');

    const imageRequest = imageStore.get(id);
    const metadataRequest = metadataStore.get(id);
    const thumbnailRequest = thumbnailStore.get(id);

    transaction.onerror = () => {
      log.error('Error loading image data:', transaction.error);
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      const imageData = imageRequest.result;
      const metadata = metadataRequest.result;
      const thumbnailData = thumbnailRequest.result;

      if (!imageData || !metadata || !thumbnailData) {
        reject(new Error('Failed to load image data'));
        return;
      }

      // Convert ArrayBuffer back to Blob
      const blob = new Blob([imageData.data], { type: imageData.type });

      resolve({
        blob,
        metadata,
        thumbnail: thumbnailData.thumbnail
      });

      closeDB(db);
    };
  });
};

export const getAllMediaMetaData = async (): Promise<Media[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('metadata', 'readonly');
    const metadataStore = transaction.objectStore('metadata');
    const request = metadataStore.getAll();

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

export const getMediaData = async (url: string): Promise<Media | null> => {
  const mediaId = getMediaIdFromUrl(url);
  if (!mediaId) {
    log.warn('[getMediaData] Invalid media URL format:', url);
    return null;
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('metadata', 'readonly');
    const metadataStore = transaction.objectStore('metadata');
    const request = metadataStore.get(mediaId);

    request.onerror = () => {
      log.error('Error loading metadata:', request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      const result = request.result;
      closeDB(db);
      resolve(result);
    };
  });
};

export const deleteMediaData = async (url: string): Promise<void> => {
  const mediaData = await getMediaData(url);
  if (!mediaData) {
    log.error('[deleteMediaData] Media data not found:', url);
    return;
  }

  const mediaType = getMediaType(mediaData);
  const { id } = mediaData;

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ['images', 'metadata', 'thumbnails', 'videoChunks'],
      'readwrite'
    );
    const imageStore = transaction.objectStore('images');
    const metadataStore = transaction.objectStore('metadata');
    const thumbnailStore = transaction.objectStore('thumbnails');
    const videoChunksStore = transaction.objectStore('videoChunks');

    metadataStore.delete(id);
    thumbnailStore.delete(id);

    if (mediaType === MediaType.Image) {
      imageStore.delete(id);
    } else if (mediaType === MediaType.Video) {
      videoChunksStore.delete(id);

      videoChunksStore.delete(
        IDBKeyRange.bound([id, 0], [id, Number.MAX_SAFE_INTEGER])
      );
    }

    transaction.onerror = () => {
      log.error('Error deleting media data:', transaction.error);
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      log.debug('Media data deleted successfully');
      closeDB(db);
      resolve();
    };
  });
};

export const setPadThumbnail = async (
  padId: string,
  thumbnail: string
): Promise<string> => {
  const thumbnailId = `pad-${padId}-thumbnail`;
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('thumbnails', 'readwrite');
    const thumbnailStore = transaction.objectStore('thumbnails');
    const request = thumbnailStore.put({
      id: thumbnailId,
      type: 'pad',
      thumbnail
    });

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      closeDB(db);
      resolve(padId);
    };
  });
};

export const getPadThumbnail = async (
  padId: string
): Promise<string | null> => {
  const thumbnailId = `pad-${padId}-thumbnail`;
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('thumbnails', 'readonly');
    const thumbnailStore = transaction.objectStore('thumbnails');
    const request = thumbnailStore.get(thumbnailId);

    request.onerror = () => {
      log.error('Error loading pad thumbnail:', request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      const result = request.result;
      closeDB(db);
      resolve(result ? result.thumbnail : null);
    };
  });
};

export const deleteAllPadThumbnails = async (): Promise<number> => {
  const db = await openDB();

  const count = await idbDeleteRange(
    db,
    'thumbnails',
    IDBKeyRange.bound('pad-', 'pad-\uFFFF')
  );

  log.debug('[deleteAllPadThumbnails] deleted pad thumbnails:', count);

  return count;
};

export const copyPadThumbnail = async (
  sourcePadId: string,
  targetPadId: string
): Promise<string | null> => {
  const sourceThumbnail = await getPadThumbnail(sourcePadId);
  if (!sourceThumbnail) {
    log.error('Source pad thumbnail not found:', sourcePadId);
    return null;
  }
  return setPadThumbnail(targetPadId, sourceThumbnail);
};

export const deletePadThumbnail = async (padId: string): Promise<string> => {
  const thumbnailId = `pad-${padId}-thumbnail`;
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('thumbnails', 'readwrite');
    const thumbnailStore = transaction.objectStore('thumbnails');
    const request = thumbnailStore.delete(thumbnailId);

    request.onerror = () => {
      log.error('Error deleting pad thumbnail:', request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      closeDB(db);
      resolve(padId);
    };
  });
};

// Add this helper function to parse media URLs
const getMediaIdFromUrl = (url: string): string | null => {
  if (typeof url !== 'string') {
    log.warn('[getMediaIdFromUrl] Invalid media URL format:', url);
    return null;
  }
  const match = url.match(/^vidpads:\/\/media\/(.+)$/);
  return match ? match[1] : null;
};

// Add this new function to get thumbnail by URL
export const getThumbnailFromUrl = async (
  url?: string | undefined
): Promise<string | null> => {
  if (!url) {
    return null;
  }

  const mediaId = getMediaIdFromUrl(url);
  if (!mediaId) {
    log.warn('[getThumbnailFromUrl] Invalid media URL format:', url);
    return null;
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['thumbnails'], 'readonly');
    const thumbnailStore = transaction.objectStore('thumbnails');
    const request = thumbnailStore.get(mediaId);

    request.onerror = () => {
      log.error('Error loading thumbnail:', request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      const result = request.result;
      closeDB(db);
      resolve(result ? result.thumbnail : null);
    };
  });
};

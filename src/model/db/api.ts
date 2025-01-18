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
import { getMediaIdFromUrl, getMediaType } from '../helpers';

const log = createLog('db/api');

const DB_NAME = 'vidpads';
const DB_VERSION = 2;

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
    idbCreateObjectStore(db, 'metadata', { keyPath: 'url' });
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
      const { store, transaction } = idbOpenTransaction(
        db,
        ['store'],
        'readonly'
      );

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
    const { store, transaction } = idbOpenTransaction(
      db,
      ['store'],
      'readwrite'
    );

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
  media: MediaYouTube;
  thumbnail: string | null;
}

export const saveUrlData = async ({
  media,
  thumbnail
}: SaveUrlDataProps): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const { metadata, thumbnails, transaction } = idbOpenTransaction(
      db,
      ['metadata', 'thumbnails'],
      'readwrite'
    );

    // Save the metadata
    metadata.put(media);

    // Save the thumbnail
    thumbnails.put({ id: media.url, type: 'url', thumbnail });

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

export const updateMetadataDuration = async (
  mediaUrl: string,
  duration: number
): Promise<void> => {
  const db = await openDB();

  const id = getMediaIdFromUrl(mediaUrl);

  return new Promise((resolve, reject) => {
    const { metadata, transaction } = idbOpenTransaction(
      db,
      ['metadata'],
      'readwrite'
    );

    if (!id) {
      reject(new Error(`Invalid media URL ${mediaUrl}`));
    }

    const request = metadata.get(id!);

    request.onsuccess = () => {
      const result = request.result;
      if (!result) {
        return reject(
          new Error(`updateMetadataDuration not found for ${mediaUrl}`)
        );
      }
      result.duration = duration;
      metadata.put(result);
    };

    transaction.onerror = () => {
      log.error('Error updating metadata duration:', transaction.error);
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      closeDB(db);
      resolve();
    };
  });
};

export interface SaveVideoDataProps {
  file: File;
  media: MediaVideo;
  thumbnail: string | null;
  chunkSize?: number;
}

export const saveVideoData = async ({
  file,
  media,
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

    const { url, sizeInBytes } = media;
    const videoTotalChunks = Math.ceil(sizeInBytes / chunkSize);

    media.videoTotalChunks = videoTotalChunks;

    // Save the metadata
    const metadataStore = transaction.objectStore('metadata');
    metadataStore.put(media);

    // Save the thumbnail
    const thumbnailStore = transaction.objectStore('thumbnails');
    thumbnailStore.put({ id: url, type: 'video', thumbnail });

    // Save the video chunks
    const videoChunksStore = transaction.objectStore('videoChunks');

    for (let ii = 0; ii < videoTotalChunks; ii++) {
      const start = ii * chunkSize;
      const end = Math.min(start + chunkSize, sizeInBytes);
      const chunk = file.slice(start, end);

      const data = {
        id: url,
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
    const { metadata, thumbnails, transaction } = idbOpenTransaction(
      db,
      ['metadata', 'thumbnails'],
      'readonly'
    );

    const metadataRequest = metadata.get(id);
    const thumbnailRequest = thumbnails.get(id);

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
  media: MediaImage,
  thumbnail: string
): Promise<void> => {
  const db = await openDB();
  const { url: id } = media;

  // Convert File to ArrayBuffer for storage
  const arrayBuffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    const { images, metadata, thumbnails, transaction } = idbOpenTransaction(
      db,
      ['images', 'metadata', 'thumbnails'],
      'readwrite'
    );

    // Save the image as ArrayBuffer

    images.put({
      id,
      data: arrayBuffer,
      type: file.type // Store the mime type for later reconstruction
    });

    // Save the metadata
    metadata.put(media);

    // Save the thumbnail
    thumbnails.put({ id, type: 'image', thumbnail });

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
    const { images, metadata, thumbnails, transaction } = idbOpenTransaction(
      db,
      ['images', 'metadata', 'thumbnails'],
      'readonly'
    );

    const imageRequest = images.get(id);
    const metadataRequest = metadata.get(id);
    const thumbnailRequest = thumbnails.get(id);

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
    const { metadata, transaction } = idbOpenTransaction(
      db,
      ['metadata'],
      'readonly'
    );

    const request = metadata.getAll();

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    transaction.oncomplete = () => {
      closeDB(db);
    };
  });
};

export const getMediaData = async (url: string): Promise<Media | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { metadata, transaction } = idbOpenTransaction(
      db,
      ['metadata'],
      'readonly'
    );

    const request = metadata.get(url);

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

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const { images, metadata, thumbnails, videoChunks, transaction } =
      idbOpenTransaction(
        db,
        ['images', 'metadata', 'thumbnails', 'videoChunks'],
        'readwrite'
      );

    metadata.delete(url);
    thumbnails.delete(url);

    if (mediaType === MediaType.Image) {
      images.delete(url);
    } else if (mediaType === MediaType.Video) {
      videoChunks.delete(url);

      videoChunks.delete(
        IDBKeyRange.bound([url, 0], [url, Number.MAX_SAFE_INTEGER])
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
    const { thumbnails, transaction } = idbOpenTransaction(
      db,
      ['thumbnails'],
      'readwrite'
    );

    const request = thumbnails.put({
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
    const { thumbnails, transaction } = idbOpenTransaction(
      db,
      ['thumbnails'],
      'readonly'
    );

    const request = thumbnails.get(thumbnailId);

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
    const { thumbnails, transaction } = idbOpenTransaction(
      db,
      ['thumbnails'],
      'readwrite'
    );
    const request = thumbnails.delete(thumbnailId);

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
    const { thumbnails, transaction } = idbOpenTransaction(
      db,
      ['thumbnails'],
      'readonly'
    );
    const request = thumbnails.get(mediaId);

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

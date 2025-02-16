'use client';

import {
  idbCreateObjectStore,
  idbDeleteDB,
  idbOpen,
  idbOpenTransaction
} from '@helpers/idb';
import { createLog } from '@helpers/log';
import {
  fromPadThumbnailUrl,
  isValidMediaUrl,
  isYouTubeMetadata,
  toPadThumbnailUrl
} from '@helpers/metadata';
import type { SettingsStoreData } from '@hooks/useSettings/types';
import { ProjectStoreContextType } from '@model/store/types';
import {
  Media,
  MediaImage,
  MediaType,
  MediaVideo,
  MediaYouTube,
  ProjectExport
} from '@model/types';
import { getMediaType } from '../helpers';

const log = createLog('db/api', ['debug']);

const DB_NAME = 'odgn-vo';
const DB_VERSION = 4;

const upgradeDB = (db: IDBDatabase, event: IDBVersionChangeEvent) => {
  const oldVersion = event.oldVersion;
  const newVersion = event.newVersion ?? 1;

  log.debug('upgrading db', oldVersion, newVersion);

  // Handle initial database creation (version 0 to 1)
  if (oldVersion < 1) {
    // idbCreateObjectStore(db, 'store');
    idbCreateObjectStore(db, 'metadata', { keyPath: 'url' });
    idbCreateObjectStore(db, 'videoChunks', {
      keyPath: ['id', 'videoChunkIndex']
    });
    idbCreateObjectStore(db, 'images', { keyPath: 'id' });
    const thumbnailsStore = idbCreateObjectStore(db, 'thumbnails', {
      keyPath: 'id'
    });
    if (thumbnailsStore) {
      thumbnailsStore.createIndex('type', 'type', { unique: false });
      thumbnailsStore.createIndex('projectId', 'projectId', { unique: false });
    }
  }

  // Handle upgrade to version 2
  if (oldVersion < 2) {
    idbCreateObjectStore(db, 'projects', { keyPath: 'projectId' });
  }

  if (oldVersion < 3) {
    idbCreateObjectStore(db, 'midiStore', { keyPath: 'id' });
  }

  if (oldVersion < 4) {
    idbCreateObjectStore(db, 'settings', { keyPath: 'id' });
  }
};

export const openDB = (): Promise<IDBDatabase> => {
  return idbOpen(DB_NAME, DB_VERSION, upgradeDB);
};

export const closeDB = (db: IDBDatabase) => {
  db.close();
};

export const deleteDB = () => idbDeleteDB(DB_NAME);

export const getAllProjectDetails = async (): Promise<
  Partial<ProjectStoreContextType>[]
> => {
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
      const projects = getAllRequest.result as ProjectStoreContextType[];

      const projectDetails = projects.map((project) => {
        const { projectId, projectName, createdAt, updatedAt } = project;
        return { projectId, projectName, createdAt, updatedAt };
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

export const saveProject = async (
  project: ProjectStoreContextType
): Promise<void> => {
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

export const loadSettingsStore = async (
  id: string
): Promise<SettingsStoreData | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { settings, transaction } = idbOpenTransaction(
      db,
      ['settings'],
      'readonly'
    );

    const getRequest = settings.get(id);

    getRequest.onerror = () => {
      log.error(
        'Error loading settings store from IndexedDB:',
        getRequest.error
      );
      reject(getRequest.error);
    };

    getRequest.onsuccess = () => {
      const result = getRequest.result ?? null;
      resolve(result);
    };

    transaction.oncomplete = () => {
      log.debug('settings store loaded from IndexedDB');
      closeDB(db);
    };
  });
};

export const saveSettingsStore = async (
  data: SettingsStoreData
): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { settings, transaction } = idbOpenTransaction(
      db,
      ['settings'],
      'readwrite'
    );

    const putRequest = settings.put(data);

    putRequest.onerror = () => {
      log.error('Error saving settings store to IndexedDB:', putRequest.error);
      reject(putRequest.error);
    };

    putRequest.onsuccess = () => resolve();

    transaction.oncomplete = () => {
      log.debug('settings store saved to IndexedDB');
      closeDB(db);
    };
  });
};
// export const loadMidiStore = async (): Promise<MidiStoreExport | null> => {
//   const db = await openDB();
//   return new Promise((resolve, reject) => {
//     const { midiStore, transaction } = idbOpenTransaction(
//       db,
//       ['midiStore'],
//       'readonly'
//     );

//     const getRequest = midiStore.get('midiStore');

//     getRequest.onerror = () => {
//       log.error('Error loading midi store from IndexedDB:', getRequest.error);
//       reject(getRequest.error);
//     };

//     getRequest.onsuccess = () => {
//       const result = (getRequest.result as MidiStoreExport) ?? null;
//       resolve(result);
//     };

//     transaction.oncomplete = () => {
//       closeDB(db);
//     };
//   });
// };

// export const saveMidiStore = async (data: MidiStoreExport): Promise<void> => {
//   const db = await openDB();
//   return new Promise((resolve, reject) => {
//     const { midiStore, transaction } = idbOpenTransaction(
//       db,
//       ['midiStore'],
//       'readwrite'
//     );

//     const putRequest = midiStore.put(data);

//     putRequest.onerror = () => {
//       log.error('Error saving midi store to IndexedDB:', putRequest.error);
//       reject(putRequest.error);
//     };

//     putRequest.onsuccess = () => resolve();

//     transaction.oncomplete = () => {
//       closeDB(db);
//     };
//   });
// };

export const loadProjectState = async (
  projectId: string
): Promise<ProjectStoreContextType | null> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const { projects, transaction } = idbOpenTransaction(
      db,
      ['projects'],
      'readonly'
    );
    const getRequest = projects.get(projectId);

    getRequest.onerror = () => {
      log.error('Error loading project from IndexedDB:', getRequest.error);
      reject(getRequest.error);
    };

    getRequest.onsuccess = () => {
      const result = (getRequest.result as ProjectStoreContextType) ?? null;
      resolve(result);
    };

    transaction.oncomplete = () => {
      closeDB(db);
    };
  });
};

export const saveProjectState = async (
  project: ProjectStoreContextType
): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { projects, transaction } = idbOpenTransaction(
      db,
      ['projects'],
      'readwrite'
    );

    // log.info('saving project', project);
    const putRequest = projects.put(project);

    putRequest.onerror = () => {
      log.error('Error saving project to IndexedDB:', putRequest.error);
      log.info('Error saving project to IndexedDB:', putRequest.error);
      reject(putRequest.error);
    };
    putRequest.onsuccess = () => resolve();

    transaction.oncomplete = () => {
      closeDB(db);
    };
  });
};

export const updateMetadataProperty = async (
  mediaUrl: string | undefined,
  property: keyof Media | keyof MediaYouTube,
  value: unknown
): Promise<void> => {
  if (!mediaUrl) {
    return;
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const { metadata, transaction } = idbOpenTransaction(
      db,
      ['metadata'],
      'readwrite'
    );

    const request = metadata.get(mediaUrl);

    request.onsuccess = () => {
      const result = request.result;
      if (!result) {
        return reject(
          new Error(`updateMetadataProperty not found for ${mediaUrl}`)
        );
      }
      result[property] = value;
      metadata.put(result);
    };

    transaction.onerror = () => {
      log.error('Error updating metadata property:', transaction.error);
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

export const saveMediaData = async (media: Media): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { metadata, transaction } = idbOpenTransaction(
      db,
      ['metadata'],
      'readwrite'
    );

    metadata.put(media);

    transaction.onerror = () => {
      log.error('Error saving media data:', transaction.error);
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      closeDB(db);
      resolve();
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
      // log.debug('Video data saved successfully');
      closeDB(db);
      resolve();
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

export const savePadThumbnail = async (
  projectId: string,
  padId: string,
  thumbnail: string
): Promise<string> => {
  const thumbnailId = toPadThumbnailUrl(projectId, padId);
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const { thumbnails, transaction } = idbOpenTransaction(
      db,
      ['thumbnails'],
      'readwrite'
    );

    log.debug('[savePadThumbnail]', { projectId, padId });

    const request = thumbnails.put({
      id: thumbnailId,
      type: 'pad',
      thumbnail
    });

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      log.debug('[savePadThumbnail] complete', { projectId, padId });
      closeDB(db);
      resolve(padId);
    };
  });
};

export const getPadThumbnail = async (
  projectId: string,
  padId: string
): Promise<string | null> => {
  const thumbnailId = toPadThumbnailUrl(projectId, padId);
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

export const getMediaThumbnail = async (
  media: Media | null | undefined
): Promise<string | null> => {
  if (!media) {
    return null;
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { thumbnails, transaction } = idbOpenTransaction(
      db,
      ['thumbnails'],
      'readonly'
    );

    const request = thumbnails.get(media.url);

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      const result = request.result;
      closeDB(db);
      resolve(result ? result.thumbnail : null);
    };
  });
};

export const saveMediaThumbnail = async (
  media: Media,
  thumbnail: string
): Promise<string> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { thumbnails, transaction } = idbOpenTransaction(
      db,
      ['thumbnails'],
      'readwrite'
    );

    const type = isYouTubeMetadata(media) ? 'youtube' : 'url';

    thumbnails.put({ id: media.url, type, thumbnail });

    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      closeDB(db);
      resolve(media.url);
    };
  });
};

export const deleteAllPadThumbnails = async (
  projectId: string
): Promise<number> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const { thumbnails, transaction } = idbOpenTransaction(
      db,
      ['thumbnails'],
      'readwrite'
    );

    let count = 0;
    const request = thumbnails.getAll();

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      const result = request.result;
      for (const thumbnail of result) {
        if (thumbnail.type === 'pad') {
          const { projectId: thumbnailProjectId } = fromPadThumbnailUrl(
            thumbnail.id
          );
          if (thumbnailProjectId === projectId) {
            thumbnails.delete(thumbnail.id);
            count++;
          }
        }
      }
    };

    transaction.oncomplete = () => {
      closeDB(db);
      resolve(count);
    };
  });
};

export const copyPadThumbnail = async (
  projectId: string,
  sourcePadId: string,
  targetPadId: string
): Promise<string | null> => {
  const sourceThumbnail = await getPadThumbnail(projectId, sourcePadId);
  if (!sourceThumbnail) {
    log.error('Source pad thumbnail not found:', sourcePadId);
    return null;
  }
  return savePadThumbnail(projectId, targetPadId, sourceThumbnail);
};

export const deletePadThumbnail = async (
  projectId: string,
  padId: string
): Promise<string> => {
  const thumbnailId = toPadThumbnailUrl(projectId, padId);
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

export const getThumbnailFromUrl = async (
  url?: string | undefined
): Promise<string | undefined> => {
  if (!url || !isValidMediaUrl(url)) {
    log.debug('[getThumbnailFromUrl] Invalid media URL:', url);
    return undefined;
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const { thumbnails, transaction } = idbOpenTransaction(
      db,
      ['thumbnails'],
      'readonly'
    );
    const request = thumbnails.get(url);

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

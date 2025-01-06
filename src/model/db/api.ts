import { createLog } from '@helpers/log';
import { StoreContextType } from '@model/store/types';
import { Media, MediaImage, MediaType, MediaVideo } from '@model/types';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';
import { getMediaType } from '../helpers';

const log = createLog('db/api');

const dbName = 'vidpads';
const dbVersion = 1;

export const useDBStore = () => {
  return useSuspenseQuery({
    queryKey: ['store-state'],
    queryFn: loadStateFromIndexedDB
  });
};

export const useThumbnail = (url?: string | undefined) => {
  return useSuspenseQuery({
    queryKey: ['thumbnail', url],
    queryFn: () => getThumbnailFromUrl(url)
  });
};

export const useDBStoreUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveStateToIndexedDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-state'] });
    }
  });
};

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('store');

      db.createObjectStore('metadata', { keyPath: 'id' });

      db.createObjectStore('videoChunks', {
        keyPath: ['id', 'videoChunkIndex']
      });

      db.createObjectStore('images', { keyPath: 'id' });

      db.createObjectStore('thumbnails', { keyPath: 'id' });
    };
  });
};

export const loadStateFromIndexedDB =
  async (): Promise<StoreContextType | null> => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      log.debug('loading state from IndexedDB');
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
        db.close();
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
      log.debug('state saved to IndexedDB');
      db.close();
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

    // Save the metadata
    const metadataStore = transaction.objectStore('metadata');
    metadataStore.put(metadata);

    // Save the thumbnail
    const thumbnailStore = transaction.objectStore('thumbnails');
    thumbnailStore.put({ id, thumbnail });

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
      db.close();
      resolve();
    };
  });
};

interface LoadVideoDataResult {
  file: Blob;
  metadata: MediaVideo;
  thumbnail: string;
}

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
      const file = new Blob(
        sortedChunks.map((chunk) => chunk.data),
        { type: mimeType }
      );

      resolve({
        file,
        metadata,
        thumbnail
      });
      log.debug('video data loaded from IndexedDB');
      db.close();
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
    thumbnailStore.put({ id, thumbnail });

    // Handle errors
    transaction.onerror = () => {
      log.error('Error saving image data:', transaction.error);
      reject(transaction.error);
    };

    // Handle success
    transaction.oncomplete = () => {
      log.debug('Image data saved successfully');
      db.close();
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

      db.close();
    };
  });
};

export const getMediaData = async (url: string): Promise<Media | null> => {
  const mediaId = getMediaIdFromUrl(url);
  if (!mediaId) {
    log.error('Invalid media URL format:', url);
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
      db.close();
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
      db.close();
      resolve();
    };
  });
};

// Add this helper function to parse media URLs
const getMediaIdFromUrl = (url: string): string | null => {
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
    log.error('Invalid media URL format:', url);
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
      db.close();
      resolve(result ? result.thumbnail : null);
    };
  });
};

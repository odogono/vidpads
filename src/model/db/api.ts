import { createLog } from '@helpers/log';
import { StoreContextType } from '@model/store/types';
import { MediaImage } from '@model/types';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query';

const log = createLog('db/api');

const dbName = 'vidpads';
const dbVersion = 1;

export const useDBStore = () => {
  return useSuspenseQuery({
    queryKey: ['store-state'],
    queryFn: loadStateFromIndexedDB
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

export const loadStateFromIndexedDB = async (): Promise<StoreContextType> => {
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

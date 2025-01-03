import { createLog } from '@helpers/log';

const log = createLog('MediaDB');

// Create DB and stores
export const initMediaDB = async () => {
  const db = openMediaDB();

  db.onupgradeneeded = (event: IDBVersionChangeEvent) => {
    const db = (event.target as IDBOpenDBRequest).result;
    db.createObjectStore('chunks', { keyPath: ['id', 'chunkIndex'] });
    db.createObjectStore('metadata', { keyPath: 'id' });
  };

  return db;
};

const openMediaDB = () => {
  return indexedDB.open('media-db', 1);
};

export const checkStorageQuota = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();

    if (!estimate) {
      throw new Error('Storage estimate not available');
    }

    const { quota, usage } = estimate;

    const availableSpace = quota - usage;

    log.info(`Total quota: ${quota / 1024 / 1024} MB`);
    log.info(`Used: ${usage / 1024 / 1024} MB`);
    log.info(`Available: ${availableSpace / 1024 / 1024} MB`);

    return availableSpace;
  }
  throw new Error('Storage API not supported');
};

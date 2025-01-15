import { createLog } from '@helpers/log';
import { getAllMediaMetaData as dbGetAllMediaMetaData } from '@model/db/api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { QUERY_KEY_METADATA } from '../constants';
import { Media } from '../types';

const log = createLog('model/useProjects');

export const useMetadata = () => {
  const { data } = useSuspenseQuery({
    queryKey: [QUERY_KEY_METADATA],
    queryFn: async () => {
      try {
        const metadata = await dbGetAllMediaMetaData();

        const urlToMetadata = new Map<string, Media>();
        metadata.forEach((m) => urlToMetadata.set(m.url, m));
        return { metadata, urlToMetadata };
      } catch {
        // log.warn('[usePadThumbnail] Error getting thumbnail:', error);
        return null;
      }
    }
  });

  return { metadata: data?.metadata, urlToMetadata: data?.urlToMetadata };
};

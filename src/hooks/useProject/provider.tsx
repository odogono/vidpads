'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from '@/hooks/useProject/useRouter';
import { isObjectEqual } from '@helpers/diff';
import { createLog } from '@helpers/log';
import { invalidateQueryKeys } from '@helpers/query';
import { VOKeys } from '@model/constants';
import {
  deleteAllPadThumbnails as dbDeleteAllPadThumbnails,
  getAllProjectDetails as dbGetAllProjectDetails,
  loadProjectState as dbLoadProjectState,
  saveProjectState as dbSaveProjectState,
  isIndexedDBSupported
} from '@model/db/api';
import { createStore } from '@model/store/store';
import { StoreContextType } from '@model/store/types';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { ProjectContext } from './context';

const log = createLog('useProject/provider');

export const ProjectProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();
  const snapshotRef = useRef<StoreContextType | null>(null);
  const { setProjectId, projectId, importData } = useRouter();

  const { data: project } = useSuspenseQuery({
    queryKey: VOKeys.project(projectId),
    queryFn: async () => {
      if (!isIndexedDBSupported()) {
        // log.warn('IndexedDB is not supported');
        // note - this is workaround for nextjs server components
        return createStore();
      }

      try {
        log.debug('A deleting pad thumbnails');
        // await dbDeleteAllPadThumbnails();
        if (importData) {
          log.debug('TODO - import data');
        }

        // another alternative is to parse the data here
        // save it, and then set the projectId

        const projectState = await dbLoadProjectState(projectId);
        const isNewProject = !projectState;

        if (isNewProject) {
          log.debug('B creating new project', projectId);
        }

        const store = createStore(projectState);

        const snapshot = store.getSnapshot();

        if (isNewProject) {
          log.debug('C saving new project', projectId, snapshot.context);
          await dbSaveProjectState(snapshot.context);
        } else {
          log.debug('D using existing project', projectId, snapshot.context);
        }

        log.debug('E setting projectId', snapshot.context.projectId);
        setProjectId(snapshot.context.projectId);

        invalidateQueryKeys(queryClient, [
          [...VOKeys.pads()],
          [...VOKeys.allMetadata()],
          [...VOKeys.players()]
        ]);

        store.subscribe(async (snapshot) => {
          const hasChanged = !isObjectEqual(
            snapshotRef.current ?? {},
            snapshot.context
          );
          if (hasChanged) {
            // const diff = getObjectDiff(
            //   snapshotRef.current ?? {},
            //   snapshot.context
            // );
            // log.info('store updated: saving state to IndexedDB:', diff);
            // log.debug('was', snapshotRef.current);
            snapshotRef.current = snapshot.context;
            await dbSaveProjectState(snapshot.context);
          }
        });

        const projectDetails = await dbGetAllProjectDetails();

        for (const { projectId, projectName, updatedAt } of projectDetails) {
          log.info('project', projectId, projectName, updatedAt);
        }

        // await wait(10000);
        return store;
      } catch (error) {
        log.debug('error loading project', error);

        await wait(10000);

        return createStore();
      }
    }
  });

  return (
    <ProjectContext.Provider value={{ project, projectId }}>
      {children}
    </ProjectContext.Provider>
  );
};

const wait = async (time: number = 1000): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

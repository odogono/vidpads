'use client';

import { useRef } from 'react';

import { useRouter } from '@/hooks/useProject/useRouter';
import { urlStringToProject } from '@/model/serialise/project';
import { getUnixTimeFromDate } from '@helpers/datetime';
import { isObjectEqual } from '@helpers/diff';
import { createLog } from '@helpers/log';
import { invalidateQueryKeys } from '@helpers/query';
import { wait } from '@helpers/time';
import { VOKeys } from '@model/constants';
import {
  getAllProjectDetails as dbGetAllProjectDetails,
  loadProjectState as dbLoadProjectState,
  saveProjectState as dbSaveProjectState,
  isIndexedDBSupported
} from '@model/db/api';
import { isProjectNoteworthy } from '@model/helpers';
import { usePadOperations } from '@model/hooks/usePadOperations';
import { getPadSourceUrl } from '@model/pad';
import { createStore } from '@model/store/store';
import { ProjectStoreContextType } from '@model/store/types';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

const log = createLog('useProject/hooks/useProjectPersistence', ['debug']);

export const useProjectPersistence = () => {
  const { setProjectId, projectId, importData } = useRouter();
  const queryClient = useQueryClient();
  const snapshotRef = useRef<ProjectStoreContextType | null>(null);
  const { addUrlToPad } = usePadOperations();

  const { data: project } = useSuspenseQuery({
    queryKey: VOKeys.project(projectId),
    queryFn: async () => {
      if (!isIndexedDBSupported()) {
        // log.warn('IndexedDB is not supported');
        // note - this is workaround for nextjs server components
        return createStore();
      }

      log.debug('A loading project', projectId);

      try {
        // const importedProject = await importProject(importData);

        const { store, isNew } = importData
          ? await importProject(importData)
          : await loadProject(projectId);

        if (!store) {
          log.debug('project not loaded', projectId);
          return createStore();
        }

        const snapshot = store.getSnapshot();
        const loadedProjectId = snapshot.context.projectId;

        if (isNew) {
          log.debug('C new project', loadedProjectId, snapshot.context);
          await dbSaveProjectState(snapshot.context);
        } else {
          log.debug(
            'D using existing project',
            loadedProjectId,
            snapshot.context
          );
        }

        if (importData) {
          queryClient.invalidateQueries({
            queryKey: VOKeys.project(projectId)
          });
          queryClient.invalidateQueries({
            queryKey: VOKeys.project(loadedProjectId)
          });
        }

        log.debug('E setting projectId', snapshot.context.projectId);
        setProjectId(snapshot.context.projectId);

        // add all the pads to the project
        await Promise.all(
          snapshot.context.pads
            .map((pad) => {
              const url = getPadSourceUrl(pad);
              // log.debug('adding pad', pad.id, url);
              return url
                ? addUrlToPad({ url, padId: pad.id, projectId })
                : null;
            })
            .filter(Boolean)
        );

        invalidateQueryKeys(queryClient, [
          [...VOKeys.allPads()],
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

        for (const {
          projectId,
          projectName,
          createdAt,
          updatedAt
        } of projectDetails) {
          const lifetime =
            getUnixTimeFromDate(updatedAt) - getUnixTimeFromDate(createdAt);
          log.debug('project', projectId, projectName, updatedAt, {
            lifetime,
            isNoteWorthy: isProjectNoteworthy({
              createdAt,
              updatedAt
            } as ProjectStoreContextType)
          });
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

  return { project, setProjectId, projectId };
};

const loadProject = async (projectId: string) => {
  const projectState = await dbLoadProjectState(projectId);
  const isNewProject = !projectState;
  const store = createStore(projectState);

  return { store, isNew: isNewProject };
};

const importProject = async (importData: string | null) => {
  if (!importData) {
    return { store: null, isNew: false };
  }

  const data = await urlStringToProject(importData);
  const store = createStore();
  store.send({ type: 'importProject', data });

  return { store, isNew: true };
};

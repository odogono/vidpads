'use client';

import { useCallback, useImperativeHandle, useMemo, useState } from 'react';

import { formatTimeAgo } from '@helpers/datetime';
import { createLog } from '@helpers/log';
import { useProjects } from '@model/hooks/useProjects';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Selection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import { StoreContextType } from '../../model/store/types';
import { useModalState } from './useModalState';

const log = createLog('LoadProjectModal');

export interface LoadProjectModalRef {
  onOpen: () => void;
}

export interface LoadProjectModalProps {
  ref: React.RefObject<LoadProjectModalRef | null>;
}

// TODO convert to CommonModal

export const LoadProjectModal = ({ ref }: LoadProjectModalProps) => {
  const { isOpen, onOpen, onClose } = useModalState();
  const { getAllProjectDetails, loadProject } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();
  const [projectDetails, setProjectDetails] = useState<
    Partial<StoreContextType>[]
  >([]);

  const rowsPerPage = 5;
  const [page, setPage] = useState(1);
  const pages = Math.ceil(projectDetails.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return projectDetails.slice(start, end);
  }, [projectDetails, page, rowsPerPage]);

  const handleLoadProject = useCallback(async () => {
    try {
      if (!selectedProjectId) {
        log.error('No project selected');
        return;
      }

      await loadProject(selectedProjectId);
      onClose();
    } catch (error) {
      log.error('Failed to load project:', error);
      // Handle error (show toast, etc)
    } finally {
      // setIsLoading(false);
    }
  }, [selectedProjectId, loadProject, onClose]);

  const handleOnOpen = useCallback(async () => {
    const projectDetails = await getAllProjectDetails();
    if (projectDetails) {
      projectDetails.sort((a, b) => {
        return (
          new Date(b.updatedAt ?? '').getTime() -
          new Date(a.updatedAt ?? '').getTime()
        );
      });
    }
    setProjectDetails(projectDetails ?? []);
    onOpen();
  }, [getAllProjectDetails, onOpen]);

  useImperativeHandle(ref, () => ({
    onOpen: handleOnOpen
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop='blur'
      className='bg-background text-foreground min-w-[640px]'
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              Load Project
            </ModalHeader>
            <ModalBody>
              <Table
                aria-label='Project Names'
                color='default'
                classNames={{
                  wrapper: 'min-w-[600px] text-foreground bg-background',
                  base: 'min-w-[600px] text-foreground'
                }}
                selectionMode='single'
                onSelectionChange={(e: Selection) => {
                  setSelectedProjectId(
                    (e as Set<string>).values().next().value
                  );
                }}
                bottomContent={
                  <div className='flex w-full justify-center'>
                    <Pagination
                      isCompact
                      showControls
                      color='secondary'
                      page={page}
                      total={pages}
                      onChange={(page) => setPage(page)}
                    />
                  </div>
                }
              >
                <TableHeader className='bg-background text-foreground'>
                  <TableColumn className='bg-background text-foreground'>
                    Name
                  </TableColumn>
                  <TableColumn className='bg-background text-foreground'>
                    Updated At
                  </TableColumn>
                </TableHeader>
                <TableBody items={items}>
                  {(item) => (
                    <TableRow key={item.projectId}>
                      <TableCell>{item.projectName}</TableCell>
                      <TableCell>
                        {formatTimeAgo(new Date(item.updatedAt ?? ''))}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ModalBody>
            <ModalFooter>
              <Button
                variant='ghost'
                onPress={onClose}
                className='bg-stone-600 hover:bg-stone-700 text-foreground'
              >
                Cancel
              </Button>
              <Button
                onPress={handleLoadProject}
                className='hover:bg-sky-600 bg-sky-500 text-foreground'
                isDisabled={!selectedProjectId}
              >
                Load
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

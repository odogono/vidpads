'use client';

import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';

import { formatTimeAgo } from '@helpers/datetime';
import { createLog } from '@helpers/log';
import { useProjects } from '@model/hooks/useProjects';
import { Project } from '@model/types';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Selection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import { useModalState } from './useModalState';

const log = createLog('LoadProjectModal');

export interface LoadProjectModalRef {
  onOpen: () => void;
}

export const LoadProjectModal = forwardRef<LoadProjectModalRef>(
  (_props, ref) => {
    const { isOpen, onOpen, onClose } = useModalState();
    const { getAllProjectDetails, loadProject } = useProjects();
    // const [name, setName] = useState(projectName);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<
      string | undefined
    >();
    const [projectDetails, setProjectDetails] = useState<Partial<Project>[]>(
      []
    );

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
                >
                  <TableHeader className='bg-background text-foreground'>
                    <TableColumn className='bg-background text-foreground'>
                      Name
                    </TableColumn>
                    <TableColumn className='bg-background text-foreground'>
                      Updated At
                    </TableColumn>
                  </TableHeader>
                  <TableBody>
                    {projectDetails.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          {formatTimeAgo(new Date(project.updatedAt ?? ''))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant='ghost'
                  onPress={onClose}
                  className='bg-stone-600 hover:bg-stone-700 text-foreground'
                  isDisabled={isSaving}
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
  }
);

LoadProjectModal.displayName = 'LoadProjectModal';

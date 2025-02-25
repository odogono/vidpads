'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  formatShortDate,
  formatTimeAgo,
  getUnixTimeFromDate
} from '@helpers/datetime';
import { createLog } from '@helpers/log';
import {
  Pagination,
  Selection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/react';
import { isProjectNoteworthy } from '@model/helpers';
import { useProjects } from '@model/hooks/useProjects';
import { ProjectStoreContextType } from '@model/store/types';
import { CommonModal, CommonModalBase } from './CommonModal';

const log = createLog('LoadProjectModal', ['debug']);

export const LoadProjectModal = ({ ref }: CommonModalBase) => {
  const { getAllProjectDetails, loadProject } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();
  const [projectDetails, setProjectDetails] = useState<
    Partial<ProjectStoreContextType>[]
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
        return false;
      }

      await loadProject(selectedProjectId);
    } catch (error) {
      log.error('Failed to load project:', error);
      // Handle error (show toast, etc)
    }
    return true;
  }, [selectedProjectId, loadProject]);

  const handleOnOpen = useCallback(async () => {
    const projectDetails = await getAllProjectDetails();
    if (projectDetails) {
      const filteredProjectDetails = projectDetails
        .filter((p) => isProjectNoteworthy(p))
        .map((project) => {
          const { projectName, updatedAt } = project;
          return projectName
            ? project
            : {
                ...project,
                projectName: `Untitled ${formatShortDate(updatedAt)}`
              };
        })
        .toSorted((a, b) => {
          return (
            getUnixTimeFromDate(b.updatedAt) - getUnixTimeFromDate(a.updatedAt)
          );
        });
      setProjectDetails(filteredProjectDetails);
    }
  }, [getAllProjectDetails]);

  return (
    <CommonModal
      ref={ref}
      title='Load Project'
      onOpen={handleOnOpen}
      onOk={handleLoadProject}
    >
      <Table
        aria-label='Project Names'
        color='default'
        className='vo-theme'
        classNames={{
          wrapper: 'text-foreground bg-background',
          base: 'text-foreground',
          tr: 'data-[selected=true]:bg-white/30 data-[selected=true]:rounded-md data-[hover=true]:bg-c4/20',
          td: 'data-[selected=true]:text-white'
        }}
        selectionMode='single'
        onSelectionChange={(e: Selection) => {
          setSelectedProjectId((e as Set<string>).values().next().value);
        }}
        bottomContent={
          <div className='flex w-full justify-center'>
            <Pagination
              isCompact
              showControls
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
            Updated
          </TableColumn>
        </TableHeader>
        <TableBody items={items} emptyContent='No projects found'>
          {(item) => (
            <TableRow key={item.projectId}>
              <TableCell>{item.projectName}</TableCell>
              <TableCell>{formatTimeAgo(item.updatedAt)}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CommonModal>
  );
};

'use client';

import { useCallback, useRef } from 'react';

import { Menu } from 'lucide-react';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger
} from '@heroui/react';
import { CommonModalRef } from './modals/CommonModal';
import { DeleteEverythingModal } from './modals/DeleteEverythingModal';
import { ExportProjectModal } from './modals/ExportProjectModal';
import { ImportProjectModal } from './modals/ImportProjectModal';
import { LoadProjectModal } from './modals/LoadProjectModal';
import { NewProjectModal } from './modals/NewProjectModal';
import { SaveProjectModal } from './modals/SaveProjectModal';

export const MenuButton = () => {
  const newProjectModalRef = useRef<CommonModalRef | null>(null);
  const loadProjectModalRef = useRef<CommonModalRef | null>(null);
  const saveProjectModalRef = useRef<CommonModalRef | null>(null);
  const exportProjectModalRef = useRef<CommonModalRef | null>(null);
  const importProjectModalRef = useRef<CommonModalRef | null>(null);
  const deleteEverythingModalRef = useRef<CommonModalRef | null>(null);

  const handleNewProject = useCallback(() => {
    newProjectModalRef.current?.open();
  }, [newProjectModalRef]);

  const handleLoadProject = useCallback(() => {
    loadProjectModalRef.current?.open();
  }, [loadProjectModalRef]);

  const handleSaveProject = useCallback(() => {
    saveProjectModalRef.current?.open();
  }, [saveProjectModalRef]);

  const handleExportProject = useCallback(() => {
    exportProjectModalRef.current?.open();
  }, [exportProjectModalRef]);

  const handleImportProject = useCallback(() => {
    importProjectModalRef.current?.open();
  }, [importProjectModalRef]);

  const handleDeleteEverything = useCallback(() => {
    deleteEverythingModalRef.current?.open();
  }, [deleteEverythingModalRef]);

  return (
    <>
      <Dropdown
        classNames={{
          base: 'before:bg-c1', // change arrow background
          content: 'py-1 px-1 bg-c1' // simplified background
        }}
      >
        <DropdownTrigger>
          <Button color='primary' isIconOnly>
            <Menu />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label='Main options'
          className='bg-c1 text-foreground'
          onAction={(key) => {
            if (key === 'new-project') {
              handleNewProject();
            } else if (key === 'load-project') {
              handleLoadProject();
            } else if (key === 'save-project') {
              handleSaveProject();
            } else if (key === 'export-project') {
              handleExportProject();
            } else if (key === 'import-project') {
              handleImportProject();
            } else if (key === 'delete-everything') {
              handleDeleteEverything();
            }
          }}
        >
          <DropdownItem key='new-project'>New Project</DropdownItem>

          <DropdownItem key='load-project'>Load Project</DropdownItem>

          <DropdownItem key='save-project' showDivider>
            Save Project
          </DropdownItem>

          <DropdownItem key='import-project'>Import Project</DropdownItem>

          <DropdownItem key='export-project' showDivider>
            Export Project
          </DropdownItem>

          <DropdownItem key='delete-everything' showDivider>
            Delete Everything
          </DropdownItem>

          <DropdownSection aria-label='About'>
            <DropdownItem key='about'>About</DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
      <NewProjectModal ref={newProjectModalRef} />
      <LoadProjectModal ref={loadProjectModalRef} />
      <SaveProjectModal ref={saveProjectModalRef} />
      <ExportProjectModal ref={exportProjectModalRef} />
      <ImportProjectModal ref={importProjectModalRef} />
      <DeleteEverythingModal ref={deleteEverythingModalRef} />
    </>
  );
};

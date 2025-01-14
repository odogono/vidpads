'use client';

import { useCallback, useRef } from 'react';

import { ChevronDown, Menu } from 'lucide-react';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger
} from '@nextui-org/react';
import {
  ExportProjectModal,
  ExportProjectModalRef
} from './modals/ExportProjectModal';
import {
  ImportProjectModal,
  ImportProjectModalRef
} from './modals/ImportProjectModal';
import {
  LoadProjectModal,
  LoadProjectModalRef
} from './modals/LoadProjectModal';
import { NewProjectModal, NewProjectModalRef } from './modals/NewProjectModal';
import {
  SaveProjectModal,
  SaveProjectModalRef
} from './modals/SaveProjectModal';

export const MenuButton = () => {
  const newProjectModalRef = useRef<NewProjectModalRef | null>(null);
  const loadProjectModalRef = useRef<LoadProjectModalRef | null>(null);
  const saveProjectModalRef = useRef<SaveProjectModalRef | null>(null);
  const exportProjectModalRef = useRef<ExportProjectModalRef | null>(null);
  const importProjectModalRef = useRef<ImportProjectModalRef | null>(null);

  const handleNewProject = useCallback(() => {
    newProjectModalRef.current?.onOpen();
  }, [newProjectModalRef]);

  const handleLoadProject = useCallback(() => {
    loadProjectModalRef.current?.onOpen();
  }, [loadProjectModalRef]);

  const handleSaveProject = useCallback(() => {
    saveProjectModalRef.current?.onOpen();
  }, [saveProjectModalRef]);

  const handleExportProject = useCallback(() => {
    exportProjectModalRef.current?.onOpen();
  }, [exportProjectModalRef]);

  const handleImportProject = useCallback(() => {
    importProjectModalRef.current?.onOpen();
  }, [importProjectModalRef]);

  return (
    <>
      <Dropdown
        classNames={{
          base: 'before:bg-default-200', // change arrow background
          content: 'py-1 px-1 border border-default-200 bg-background' // simplified background
        }}
      >
        <DropdownTrigger>
          <Button
            variant='flat'
            className='bg-white/10 hover:bg-white/20'
            endContent={<ChevronDown className='h-4 w-4' />}
          >
            <Menu />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label='Main options'
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
            }
          }}
          classNames={{
            base: 'text-default-500 data-[hover=true]:bg-default-100 data-[hover=true]:text-default-900' // dropdown item colors
          }}
        >
          <DropdownItem key='new-project'>New Project</DropdownItem>

          <DropdownItem key='load-project'>Load Project</DropdownItem>

          <DropdownItem key='save-project'>Save Project</DropdownItem>

          <DropdownItem key='import-project'>Import Project</DropdownItem>

          <DropdownItem key='export-project'>Export Project</DropdownItem>

          <DropdownSection showDivider aria-label='About'>
            <DropdownItem key='about'>About</DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
      <NewProjectModal ref={newProjectModalRef} />
      <LoadProjectModal ref={loadProjectModalRef} />
      <SaveProjectModal ref={saveProjectModalRef} />
      <ExportProjectModal ref={exportProjectModalRef} />
      <ImportProjectModal ref={importProjectModalRef} />
    </>
  );
};

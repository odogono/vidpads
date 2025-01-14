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
import { NewProjectModal, NewProjectModalRef } from './modals/NewProjectModal';
import {
  SaveProjectModal,
  SaveProjectModalRef
} from './modals/SaveProjectModal';

export const MenuButton = () => {
  const newProjectModalRef = useRef<NewProjectModalRef>(null);
  const saveProjectModalRef = useRef<SaveProjectModalRef>(null);

  const handleNewProject = useCallback(() => {
    newProjectModalRef.current?.onOpen();
  }, [newProjectModalRef]);

  const handleSaveProject = useCallback(() => {
    saveProjectModalRef.current?.onOpen();
  }, [saveProjectModalRef]);

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
            } else if (key === 'save-project') {
              handleSaveProject();
            }
          }}
          classNames={{
            base: 'text-default-500 data-[hover=true]:bg-default-100 data-[hover=true]:text-default-900' // dropdown item colors
          }}
        >
          <DropdownItem key='new-project'>New Project</DropdownItem>

          <DropdownItem key='open-project'>Open Project</DropdownItem>

          <DropdownItem key='save-project'>Save Project</DropdownItem>

          <DropdownItem key='export-project'>Export Project</DropdownItem>

          <DropdownSection showDivider aria-label='About'>
            <DropdownItem key='about'>About</DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
      <NewProjectModal ref={newProjectModalRef} />
      <SaveProjectModal ref={saveProjectModalRef} />
    </>
  );
};

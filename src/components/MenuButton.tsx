'use client';

import { Key, useCallback, useRef } from 'react';

import { Menu } from 'lucide-react';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger
} from '@heroui/react';
import { useMidiMappingMode } from '@hooks/useMidi/selectors';
import { isMidiSupported } from '../helpers/midi';
import { AboutModal } from './modals/AboutModal';
import { CommonModalRef } from './modals/CommonModal';
import { DeleteEverythingModal } from './modals/DeleteEverythingModal';
import { ExportProjectModal } from './modals/ExportProjectModal';
import { ImportProjectModal } from './modals/ImportProjectModal';
import { LoadProjectModal } from './modals/LoadProjectModal';
import { NewProjectModal } from './modals/NewProjectModal';
import { SaveProjectModal } from './modals/SaveProjectModal';
import { SettingsModal } from './modals/SettingsModal';

export const MenuButton = () => {
  const { isMidiMappingModeEnabled, enableMappingMode } = useMidiMappingMode();
  const newProjectModalRef = useRef<CommonModalRef | null>(null);
  const loadProjectModalRef = useRef<CommonModalRef | null>(null);
  const saveProjectModalRef = useRef<CommonModalRef | null>(null);
  const exportProjectModalRef = useRef<CommonModalRef | null>(null);
  const importProjectModalRef = useRef<CommonModalRef | null>(null);
  const deleteEverythingModalRef = useRef<CommonModalRef | null>(null);
  const settingsModalRef = useRef<CommonModalRef | null>(null);
  const aboutModalRef = useRef<CommonModalRef | null>(null);
  const handleAction = useCallback(
    (key: string) => {
      if (key === 'new-project') {
        newProjectModalRef.current?.open();
      } else if (key === 'load-project') {
        loadProjectModalRef.current?.open();
      } else if (key === 'save-project') {
        saveProjectModalRef.current?.open();
      } else if (key === 'export-project') {
        exportProjectModalRef.current?.open();
      } else if (key === 'import-project') {
        importProjectModalRef.current?.open();
      } else if (key === 'delete-everything') {
        deleteEverythingModalRef.current?.open();
      } else if (key === 'settings') {
        settingsModalRef.current?.open();
      } else if (key === 'configure-midi') {
        if (!isMidiMappingModeEnabled) {
          enableMappingMode(true);
        }
      } else if (key === 'about') {
        aboutModalRef.current?.open();
      }
    },
    [isMidiMappingModeEnabled, enableMappingMode]
  );

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
          disabledKeys={isMidiSupported() ? [] : ['configure-midi']}
          onAction={(key: Key) => handleAction(String(key))}
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

          <DropdownItem key='configure-midi' showDivider>
            Configure Midi
          </DropdownItem>

          <DropdownItem key='settings'>Settings</DropdownItem>

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
      <SettingsModal ref={settingsModalRef} />
      <DeleteEverythingModal ref={deleteEverythingModalRef} />
      <AboutModal ref={aboutModalRef} />
    </>
  );
};

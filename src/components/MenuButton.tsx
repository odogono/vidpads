'use client';

import { NewProjectModal } from './modals/NewProjectModal'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@nextui-org/react'
import { ChevronDown, Menu } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { NewProjectModalRef } from './modals/NewProjectModal'

interface Option {
  id: string
  name: string
}

const options: Option[] = [
  { 
    id: 'new-project', 
    name: 'New Project'
  },
  {
    id: 'open-project',
    name: 'Open Project'
  },
  {
    id: 'save-project',
    name: 'Save Project'
  },
  { 
    id: 'export-project', 
    name: 'Export Project'
  },
]

export const MenuButton = () => {
  const newProjectModalRef = useRef<NewProjectModalRef>(null);

  const handleNewProject = useCallback(() => {
    newProjectModalRef.current?.onOpen();
  }, [newProjectModalRef]);



  return (
    <>
    <Dropdown classNames={{
        base: "before:bg-default-200", // change arrow background
        content: "py-1 px-1 border border-default-200 bg-background", // simplified background
      }}>
      <DropdownTrigger>
        <Button
          variant="flat"
          className="bg-white/10 hover:bg-white/20"
          endContent={<ChevronDown className="h-4 w-4" />}
        >
          <Menu />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Main options"
        onAction={(key) => {
          const option = options.find(opt => opt.id === key)
          if (option?.id === 'new-project') {
            handleNewProject();
          }
        }}
        classNames={{
          base: "text-default-500 data-[hover=true]:bg-default-100 data-[hover=true]:text-default-900", // dropdown item colors
        }}
      >
        
          <DropdownItem key='new-project'>
            New Project
          </DropdownItem>

          <DropdownItem key='open-project'>
            Open Project
          </DropdownItem>

          <DropdownItem key='save-project'>
            Save Project
          </DropdownItem>

          <DropdownItem key='export-project'>
            Export Project
          </DropdownItem>

        <DropdownSection showDivider aria-label="About">
          <DropdownItem key="about">
            About
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
    <NewProjectModal ref={newProjectModalRef} />
    </>
  )
} 

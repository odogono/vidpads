'use client';

import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';

import { createLog } from '@helpers/log';
import { useProjects } from '@model/hooks/useProjects';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@nextui-org/react';
import { useModalState } from './useModalState';

const log = createLog('SaveProjectModal');

export interface ExportProjectModalRef {
  onOpen: () => void;
}

export const ExportProjectModal = forwardRef<ExportProjectModalRef>(
  (_props, ref) => {
    const { isOpen, onOpen, onClose } = useModalState();
    const { saveProject, projectName } = useProjects();
    const [name, setName] = useState(projectName);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProject = useCallback(async () => {
      try {
        setIsSaving(true);
        await saveProject(name);
        onClose();
      } catch (error) {
        log.error('Failed to save project:', error);
        // Handle error (show toast, etc)
      } finally {
        setIsSaving(false);
      }
    }, [saveProject, name, onClose]);

    useImperativeHandle(ref, () => ({
      onOpen
    }));

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        backdrop='blur'
        className='bg-background text-foreground'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Export Project
              </ModalHeader>
              <ModalBody>
                <Input
                  isClearable
                  className='w-full'
                  label='Name'
                  variant='bordered'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
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
                  onPress={handleSaveProject}
                  className='hover:bg-sky-600 bg-sky-500 text-foreground'
                  isLoading={isSaving}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }
);

ExportProjectModal.displayName = 'ExportProjectModal';

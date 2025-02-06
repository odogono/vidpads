'use client';

import { useCallback, useImperativeHandle, useState } from 'react';

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
} from "@heroui/react";
import { useModalState } from './useModalState';

const log = createLog('SaveProjectModal');

export interface SaveProjectModalRef {
  onOpen: () => void;
}

export interface SaveProjectModalProps {
  ref: React.RefObject<SaveProjectModalRef | null>;
}

// TODO convert to CommonModal

export const SaveProjectModal = ({ ref }: SaveProjectModalProps) => {
  const { isOpen, onOpen, onClose: onCloseModal } = useModalState();
  const { saveProject, projectName } = useProjects();
  const [name, setName] = useState(projectName);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSaveProject = useCallback(async () => {
    try {
      if (!name) {
        setNameError('Name is required');
        return;
      }

      setIsSaving(true);
      await saveProject(name);
      onCloseModal();
    } catch (error) {
      log.error('Failed to save project:', error);
      // Handle error (show toast, etc)
    } finally {
      setIsSaving(false);
    }
  }, [saveProject, name, onCloseModal]);

  useImperativeHandle(ref, () => ({
    onOpen
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCloseModal}
      backdrop='blur'
      className='bg-background text-foreground'
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              Save Project
            </ModalHeader>
            <ModalBody>
              <Input
                isClearable
                className='w-full'
                label='Name'
                variant='bordered'
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(null);
                }}
                onClear={() => setName('')}
                errorMessage={nameError}
                isInvalid={!!nameError}
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
};

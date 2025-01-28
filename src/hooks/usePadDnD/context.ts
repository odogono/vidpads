'use client';

import { createContext } from 'react';

import { GeneralDragEvent } from '@types';

export interface PadDnDContextType {
  ACCEPTED_FILE_TYPES: string[];
  dragOverId: string | null;
  isDragging: boolean;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
  setDragOverId: (id: string | null) => void;
  onDragLeave: (id: string) => void;
  onDragOver: (e: GeneralDragEvent, id: string) => void;
  onDragStart: (
    e: GeneralDragEvent,
    id: string,
    mimeType: string | undefined
  ) => void;
  onDragEnd: (id: string) => void;
  onDrop: (e: GeneralDragEvent, targetId: string) => void;
}

export const PadDnDContext = createContext<PadDnDContextType | undefined>(
  undefined
);

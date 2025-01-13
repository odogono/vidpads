'use client';

import { createContext } from 'react';

export interface PadDnDContextType {
  ACCEPTED_FILE_TYPES: string[];
  dragOverId: string | null;
  isDragging: boolean;
  draggingPadId: string | null;
  setDraggingPadId: (padId: string | null) => void;
  setDragOverId: (id: string | null) => void;
  onDragLeave: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
}

export const PadDnDContext = createContext<PadDnDContextType | undefined>(
  undefined
);

'use client';

import { createContext } from 'react';

export interface OnDropProps {
  file?: File;
  sourceId: string;
  targetId: string;
  mimeType: string;
  dropEffect: 'copy' | 'move' | 'link' | 'none';
}

export interface RegisterDropTargetProps {
  id: string;
  element: HTMLElement;
  mimeType: string;
  onOver?: (props: OnDropProps) => boolean;
  onLeave?: (props: OnDropProps) => boolean;
  onDrop?: (props: OnDropProps) => Promise<boolean>;
}

export interface PadDnDContextType {
  isDragging: boolean;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
  setDragOverId: (id: string | null) => void;
  onNativeDragLeave: (id: string) => void;
  onNativeDragOver: (e: React.DragEvent, id: string) => void;
  onDragStart: (e: React.PointerEvent, id: string, mimeType: string) => void;
  onDragMove: (e: React.PointerEvent, id: string, mimeType: string) => boolean;

  onDragEnd: (e: React.PointerEvent, id: string) => void;
  onNativeDrop: (e: React.DragEvent, targetId: string) => void;
  dragPosition: { x: number; y: number };

  registerDropTarget: (props: RegisterDropTargetProps) => void;
  unregisterDropTarget: (id: string) => void;
}

export const PadDnDContext = createContext<PadDnDContextType | undefined>(
  undefined
);

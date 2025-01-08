import { createContext } from 'react';

export interface PadDnDContextType {
  isDragging: boolean;
  draggingPadId: string | null;
  setDraggingPadId: (padId: string | null) => void;
}

export const PadDnDContext = createContext<PadDnDContextType | undefined>(
  undefined
);

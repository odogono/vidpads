import { ReactNode, createContext, useContext, useState } from 'react';

interface DragContextType {
  isDragging: boolean;
  draggingPadId: string | null;
  setDraggingPadId: (padId: string | null) => void;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

export const DragProvider = ({ children }: { children: ReactNode }) => {
  const [draggingPadId, setDraggingPadId] = useState<string | null>(null);

  return (
    <DragContext.Provider
      value={{
        isDragging: draggingPadId !== null,
        draggingPadId,
        setDraggingPadId
      }}
    >
      {children}
    </DragContext.Provider>
  );
};

export const useDragContext = () => {
  const context = useContext(DragContext);
  if (context === undefined) {
    throw new Error('useDragContext must be used within a DragProvider');
  }
  return context;
};
